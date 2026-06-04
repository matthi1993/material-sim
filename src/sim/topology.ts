// Topology types and loaders.
// buildWaterSystem turns a data-driven SimConfig into a Topology plus the
// initial phase-space state. This is system setup (CPU), not physics.

import { COULOMB_K, KB, type SimConfig } from './params'
import type {
  Angle,
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

/** Build a flexible-water system: numMolecules waters on a cubic lattice. */
export function buildWaterSystem(config: SimConfig): BuiltSystem {
  const ff = config.forceField
  const [bx, by, bz] = config.box
  const nMol = config.numMolecules
  const nAtoms = nMol * 3

  const ow = ff.atomTypes[0]
  const hw = ff.atomTypes[1]

  const positions = new Float32Array(nAtoms * 4)
  const velocities = new Float32Array(nAtoms * 4)
  const atomParams = new Float32Array(nAtoms * 4)
  const atomTypeIds = new Int32Array(nAtoms)
  const moleculeIds = new Int32Array(nAtoms)
  const bonds: Bond[] = []
  const angles: Angle[] = []
  const dihedrals: Dihedral[] = []

  const rand = mulberry32(0x9e3779b9)
  const gauss = makeGaussian(rand)

  // Lattice that fits nMol sites inside the box.
  const perSide = Math.ceil(Math.cbrt(nMol))
  const sx = bx / perSide
  const sy = by / perSide
  const sz = bz / perSide

  const halfHOH = ff.water.hohAngle / 2
  const d = ff.water.ohDistance

  let placed = 0
  for (let gz = 0; gz < perSide && placed < nMol; gz++) {
    for (let gy = 0; gy < perSide && placed < nMol; gy++) {
      for (let gx = 0; gx < perSide && placed < nMol; gx++) {
        const mol = placed
        const o = mol * 3
        const h1 = o + 1
        const h2 = o + 2

        const cx = (gx + 0.5) * sx
        const cy = (gy + 0.5) * sy
        const cz = (gz + 0.5) * sz

        // Random orientation per molecule.
        const ux = gauss()
        const uy = gauss()
        const uz = gauss()
        const [ax, ay, az] = normalize([ux, uy, uz])
        // An arbitrary perpendicular axis to build the H-O-H plane.
        const [px, py, pz] = normalize(perpendicular([ax, ay, az]))

        // H positions: rotate the bond axis by +/- halfHOH around perp axis.
        const h1dir = rotateAround([ax, ay, az], [px, py, pz], halfHOH)
        const h2dir = rotateAround([ax, ay, az], [px, py, pz], -halfHOH)

        setPos(positions, o, cx, cy, cz, ow.charge)
        setPos(
          positions,
          h1,
          cx + h1dir[0] * d,
          cy + h1dir[1] * d,
          cz + h1dir[2] * d,
          hw.charge,
        )
        setPos(
          positions,
          h2,
          cx + h2dir[0] * d,
          cy + h2dir[1] * d,
          cz + h2dir[2] * d,
          hw.charge,
        )

        // atomParams: (sigma, epsilon, molId, typeId)
        setVec4(atomParams, o, ow.sigma, ow.epsilon, mol, 0)
        setVec4(atomParams, h1, hw.sigma, hw.epsilon, mol, 1)
        setVec4(atomParams, h2, hw.sigma, hw.epsilon, mol, 1)

        // velocities carry mass in w; xyz filled below.
        velocities[o * 4 + 3] = ow.mass
        velocities[h1 * 4 + 3] = hw.mass
        velocities[h2 * 4 + 3] = hw.mass

        atomTypeIds[o] = 0
        atomTypeIds[h1] = 1
        atomTypeIds[h2] = 1
        moleculeIds[o] = mol
        moleculeIds[h1] = mol
        moleculeIds[h2] = mol

        bonds.push({ i: o, j: h1, r0: ff.water.bondR0, k: ff.water.bondK })
        bonds.push({ i: o, j: h2, r0: ff.water.bondR0, k: ff.water.bondK })
        angles.push({
          i: h1,
          j: o,
          k: h2,
          theta0: ff.water.angleTheta0,
          kTheta: ff.water.angleK,
        })

        placed++
      }
    }
  }

  initVelocities(velocities, config.temperature, gauss)

  const topology: Topology = {
    atomTypes: ff.atomTypes,
    atomTypeIds,
    moleculeIds,
    bonds,
    angles,
    dihedrals,
  }

  const params: SimParams = {
    dt: config.dt,
    numAtoms: nAtoms,
    numMolecules: nMol,
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
