// Topology types and loaders.
// buildSystem turns a data-driven SimConfig (a mixture of materials) into a
// Topology plus the initial phase-space state. This is system setup (CPU), not
// physics. Water molecules are always laid out first and molecule-major
// ([O,H,H] per molecule) so the per-molecule bonded kernel works unchanged;
// every monatomic species (ions, metals, noble gases) is appended after.

import {
  COULOMB_K,
  ELEMENTS,
  KB,
  MATERIALS,
  type ElementDef,
  type MaterialDef,
  type SimConfig,
} from './params'
import type {
  Angle,
  AtomType,
  Bond,
  Dihedral,
  InitialState,
  SimParams,
  Topology,
  Vec3,
} from './types'

export interface BuiltSystem {
  params: SimParams
  topology: Topology
  initial: InitialState
}

// A grid site is occupied either by a whole water molecule or a single atom.
type Unit =
  | { kind: 'water' }
  | { kind: 'mono'; el: ElementDef }

/** Expand a mixture component into the list of grid-site units it contributes. */
function expandComponent(mat: MaterialDef, count: number): Unit[] {
  const n = Math.max(0, Math.round(count))
  const units: Unit[] = []
  if (mat.kind === 'water') {
    for (let i = 0; i < n; i++) units.push({ kind: 'water' })
  } else if (mat.kind === 'ionic') {
    const [cation, anion] = mat.elements
    for (let i = 0; i < n; i++) {
      units.push({ kind: 'mono', el: cation })
      units.push({ kind: 'mono', el: anion })
    }
  } else {
    const el = mat.elements[0]
    for (let i = 0; i < n; i++) units.push({ kind: 'mono', el })
  }
  return units
}

/**
 * Interleave several per-component unit queues into one sequence so distinct
 * materials end up spatially mixed (e.g. ions dispersed through water) rather
 * than segregated into blocks. Picks from whichever component is furthest
 * behind its target fraction at each step.
 */
function interleave(queues: Unit[][]): Unit[] {
  const totals = queues.map((q) => q.length)
  const placed = new Array(queues.length).fill(0)
  const total = totals.reduce((a, b) => a + b, 0)
  const out: Unit[] = []
  for (let s = 0; s < total; s++) {
    let best = -1
    let bestDeficit = -Infinity
    for (let c = 0; c < queues.length; c++) {
      if (placed[c] >= totals[c]) continue
      const deficit = totals[c] === 0 ? -Infinity : placed[c] / totals[c]
      // Smaller fraction placed => larger deficit; negate to compare.
      if (-deficit > bestDeficit) {
        bestDeficit = -deficit
        best = c
      }
    }
    out.push(queues[best][placed[best]])
    placed[best]++
  }
  return out
}

// Deterministic small PRNG so runs are reproducible.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Box-Muller standard normal.
function makeGaussian(rand: () => number): () => number {
  return () => {
    let u = 0
    let v = 0
    while (u === 0) u = rand()
    while (v === 0) v = rand()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

/**
 * Build a mixture system. Water molecules occupy the first atom indices
 * (molecule-major [O,H,H]); all monatomic species follow. Positions are placed
 * on a shared cubic site grid with interleaved assignment so mixtures disperse.
 */
export function buildSystem(config: SimConfig): BuiltSystem {
  const [bx, by, bz] = config.box

  // Expand every component into grid-site units, then interleave for mixing.
  const queues: Unit[][] = []
  for (const comp of config.components) {
    const mat = MATERIALS[comp.materialKey]
    if (!mat) continue
    const q = expandComponent(mat, comp.count)
    if (q.length > 0) queues.push(q)
  }
  const units = interleave(queues)

  const nWaterMol = units.filter((u) => u.kind === 'water').length
  const nMono = units.length - nWaterMol
  const nAtoms = nWaterMol * 3 + nMono

  if (nAtoms === 0) {
    // Degenerate empty system: fall back to a single argon atom so buffers are
    // valid. The UI prevents this in practice.
    units.push({ kind: 'mono', el: ELEMENTS.Ar })
  }

  const positions = new Float32Array(Math.max(1, nAtoms) * 4)
  const velocities = new Float32Array(Math.max(1, nAtoms) * 4)
  const atomParams = new Float32Array(Math.max(1, nAtoms) * 4)
  const atomTypeIds = new Int32Array(Math.max(1, nAtoms))
  const moleculeIds = new Int32Array(Math.max(1, nAtoms))
  const bonds: Bond[] = []
  const angles: Angle[] = []
  const dihedrals: Dihedral[] = []

  const rand = mulberry32(0x9e3779b9)
  const gauss = makeGaussian(rand)

  // Shared cubic site grid sized to hold every unit.
  const nSites = units.length
  const perSide = Math.max(1, Math.ceil(Math.cbrt(nSites)))
  const sx = bx / perSide
  const sy = by / perSide
  const sz = bz / perSide

  const ow = ELEMENTS.O
  const hw = ELEMENTS.H
  const water = MATERIALS.water.water!
  const halfHOH = water.hohAngle / 2
  const dOH = water.ohDistance

  // Water atoms are written first; monatomic atoms are buffered then appended.
  let waterAtom = 0 // next water atom slot
  let monoAtom = nWaterMol * 3 // next monatomic atom slot
  let molCounter = 0 // unique molecule id allocator

  const usedElements = new Map<number, ElementDef>()

  for (let s = 0; s < nSites; s++) {
    const unit = units[s]
    const gx = s % perSide
    const gy = Math.floor(s / perSide) % perSide
    const gz = Math.floor(s / (perSide * perSide))
    const cx = (gx + 0.5) * sx
    const cy = (gy + 0.5) * sy
    const cz = (gz + 0.5) * sz

    if (unit.kind === 'water') {
      const mol = molCounter++
      const o = waterAtom
      const h1 = o + 1
      const h2 = o + 2
      waterAtom += 3
      usedElements.set(ow.id, ow)
      usedElements.set(hw.id, hw)

      // Random orientation per molecule.
      const [ax, ay, az] = normalize([gauss(), gauss(), gauss()])
      const [px, py, pz] = normalize(perpendicular([ax, ay, az]))
      const h1dir = rotateAround([ax, ay, az], [px, py, pz], halfHOH)
      const h2dir = rotateAround([ax, ay, az], [px, py, pz], -halfHOH)

      setPos(positions, o, cx, cy, cz, ow.charge)
      setPos(positions, h1, cx + h1dir[0] * dOH, cy + h1dir[1] * dOH, cz + h1dir[2] * dOH, hw.charge)
      setPos(positions, h2, cx + h2dir[0] * dOH, cy + h2dir[1] * dOH, cz + h2dir[2] * dOH, hw.charge)

      setVec4(atomParams, o, ow.sigma, ow.epsilon, mol, ow.id)
      setVec4(atomParams, h1, hw.sigma, hw.epsilon, mol, hw.id)
      setVec4(atomParams, h2, hw.sigma, hw.epsilon, mol, hw.id)

      velocities[o * 4 + 3] = ow.mass
      velocities[h1 * 4 + 3] = hw.mass
      velocities[h2 * 4 + 3] = hw.mass

      atomTypeIds[o] = ow.id
      atomTypeIds[h1] = hw.id
      atomTypeIds[h2] = hw.id
      moleculeIds[o] = mol
      moleculeIds[h1] = mol
      moleculeIds[h2] = mol

      bonds.push({ i: o, j: h1, r0: water.bondR0, k: water.bondK })
      bonds.push({ i: o, j: h2, r0: water.bondR0, k: water.bondK })
      angles.push({ i: h1, j: o, k: h2, theta0: water.angleTheta0, kTheta: water.angleK })
    } else {
      const el = unit.el
      const mol = molCounter++
      const a = monoAtom++
      usedElements.set(el.id, el)

      setPos(positions, a, cx, cy, cz, el.charge)
      setVec4(atomParams, a, el.sigma, el.epsilon, mol, el.id)
      velocities[a * 4 + 3] = el.mass
      atomTypeIds[a] = el.id
      moleculeIds[a] = mol
    }
  }

  initVelocities(velocities, config.temperature, gauss)

  const atomTypes: AtomType[] = [...usedElements.values()].map((el) => ({
    name: el.symbol,
    mass: el.mass,
    charge: el.charge,
    sigma: el.sigma,
    epsilon: el.epsilon,
  }))

  const topology: Topology = {
    atomTypes,
    atomTypeIds,
    moleculeIds,
    bonds,
    angles,
    dihedrals,
  }

  const params: SimParams = {
    dt: config.dt,
    numAtoms: Math.max(1, nAtoms),
    numMolecules: nWaterMol,
    cutoffRadius: config.cutoffRadius,
    box: [bx, by, bz],
    coulombConstant: COULOMB_K,
  }

  return { params, topology, initial: { positions, velocities, atomParams } }
}

function setPos(
  arr: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  w: number,
): void {
  arr[i * 4 + 0] = x
  arr[i * 4 + 1] = y
  arr[i * 4 + 2] = z
  arr[i * 4 + 3] = w
}

function setVec4(
  arr: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  w: number,
): void {
  arr[i * 4 + 0] = x
  arr[i * 4 + 1] = y
  arr[i * 4 + 2] = z
  arr[i * 4 + 3] = w
}

/** Maxwell-Boltzmann velocities at T, with center-of-mass drift removed. */
function initVelocities(
  velocities: Float32Array,
  temperature: number,
  gauss: () => number,
): void {
  const n = velocities.length / 4
  let px = 0
  let py = 0
  let pz = 0
  let totalMass = 0
  for (let i = 0; i < n; i++) {
    const mass = velocities[i * 4 + 3]
    const sigma = Math.sqrt((KB * temperature) / mass)
    const vx = sigma * gauss()
    const vy = sigma * gauss()
    const vz = sigma * gauss()
    velocities[i * 4 + 0] = vx
    velocities[i * 4 + 1] = vy
    velocities[i * 4 + 2] = vz
    px += mass * vx
    py += mass * vy
    pz += mass * vz
    totalMass += mass
  }
  // Remove net momentum.
  const cx = px / totalMass
  const cy = py / totalMass
  const cz = pz / totalMass
  for (let i = 0; i < n; i++) {
    velocities[i * 4 + 0] -= cx
    velocities[i * 4 + 1] -= cy
    velocities[i * 4 + 2] -= cz
  }
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / len, v[1] / len, v[2] / len]
}

function perpendicular(v: Vec3): Vec3 {
  // Pick an axis least aligned with v, then cross.
  const ref: Vec3 =
    Math.abs(v[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
  return cross(v, ref)
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

/** Rodrigues rotation of v around unit axis k by angle (rad). */
function rotateAround(v: Vec3, k: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const kv = cross(k, v)
  const kd = k[0] * v[0] + k[1] * v[1] + k[2] * v[2]
  return [
    v[0] * c + kv[0] * s + k[0] * kd * (1 - c),
    v[1] * c + kv[1] * s + k[1] * kd * (1 - c),
    v[2] * c + kv[2] * s + k[2] * kd * (1 - c),
  ]
}
