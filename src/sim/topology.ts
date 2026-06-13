// Topology types and loaders.
// buildSystem turns a data-driven SimConfig (a mixture of materials) into a
// Topology plus the initial phase-space state. This is system setup (CPU), not
// physics. Bonded molecules are laid out first and molecule-major (contiguous
// per molecule) so the generic per-molecule bonded kernel can own each one
// without atomics; every monatomic species (ions, metals, noble gases) is
// appended after. Centers are placed on a space-filling jittered grid so the
// whole box fills randomly while neighbors keep a minimum separation.

import {
  COULOMB_K,
  ELEMENTS,
  KB,
  MATERIALS,
  type ElementDef,
  type MaterialDef,
  type SimConfig,
} from './params'
import {
  siteCharge,
  siteEpsilon,
  siteSigma,
  type MoleculeTemplate,
} from './molecules'
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

// A placement unit occupies one grid site: a whole bonded molecule or a single
// atom. `nn` is the preferred minimum center spacing (nm) used for placement.
type Unit =
  | { kind: 'molecule'; tmpl: MoleculeTemplate; nn: number }
  | { kind: 'mono'; el: ElementDef; nn: number }

interface ReactiveElementRule {
  maxBonds: number
  covalentRadius: number // nm
  bondStiffness: number // kJ/mol/nm^2
}

interface ReactiveBondCandidate {
  i: number
  j: number
  distance: number
  score: number
}

interface ReactiveBond {
  i: number
  j: number
  r0: number
  k: number
}

// Generic reactive-bond model: element-local parameters + valence-limited
// matching. To extend bonding, add more element entries below.
const REACTIVE_ELEMENTS: Readonly<Record<number, ReactiveElementRule>> = {
  [ELEMENTS.H.id]: { maxBonds: 1, covalentRadius: 0.031, bondStiffness: 120000 },
  [ELEMENTS.C.id]: { maxBonds: 4, covalentRadius: 0.076, bondStiffness: 160000 },
  [ELEMENTS.O.id]: { maxBonds: 2, covalentRadius: 0.066, bondStiffness: 170000 },
  [ELEMENTS.N.id]: { maxBonds: 3, covalentRadius: 0.071, bondStiffness: 155000 },
  [ELEMENTS.Cl.id]: { maxBonds: 1, covalentRadius: 0.102, bondStiffness: 110000 },
  [ELEMENTS.Br.id]: { maxBonds: 1, covalentRadius: 0.12, bondStiffness: 90000 },
}

const REACTIVE_MIN_SCALE = 0.65
const REACTIVE_CAPTURE_SCALE = 1.5

/** Expand a mixture component into the list of grid-site units it contributes. */
function expandComponent(mat: MaterialDef, count: number): Unit[] {
  const n = Math.max(0, Math.round(count))
  const units: Unit[] = []
  if (mat.kind === 'molecule' && mat.molecule) {
    for (let i = 0; i < n; i++) units.push({ kind: 'molecule', tmpl: mat.molecule, nn: mat.nn })
  } else if (mat.kind === 'ionic') {
    const [cation, anion] = mat.elements
    for (let i = 0; i < n; i++) {
      units.push({ kind: 'mono', el: cation, nn: mat.nn })
      units.push({ kind: 'mono', el: anion, nn: mat.nn })
    }
  } else {
    const el = mat.elements[0]
    for (let i = 0; i < n; i++) units.push({ kind: 'mono', el, nn: mat.nn })
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
 * Build a mixture system. Bonded molecules occupy the first atom indices
 * (molecule-major, contiguous per molecule); all monatomic species follow.
 * Unit centers are placed on a space-filling jittered grid so the whole box
 * fills randomly while neighbors keep a minimum separation.
 */
export function buildSystem(config: SimConfig, cutoffRadius: number): BuiltSystem {
  const [bx, by, bz] = config.box

  // Expand every component into placement units, then interleave for mixing.
  const queues: Unit[][] = []
  for (const comp of config.components) {
    const mat = MATERIALS[comp.materialKey]
    if (!mat) continue
    const q = expandComponent(mat, comp.count)
    if (q.length > 0) queues.push(q)
  }
  const units = interleave(queues)

  if (units.length === 0) {
    // Degenerate empty system: fall back to a single argon atom so buffers are
    // valid. The UI prevents this in practice.
    units.push({ kind: 'mono', el: ELEMENTS.Ar, nn: ELEMENTS.Ar.sigma })
  }

  // Atom budget: bonded molecules first, then monatomic atoms.
  let molAtomTotal = 0
  let nMono = 0
  let nBondedMol = 0
  for (const u of units) {
    if (u.kind === 'molecule') {
      molAtomTotal += u.tmpl.sites.length
      nBondedMol++
    } else {
      nMono++
    }
  }
  const nAtoms = molAtomTotal + nMono

  const positions = new Float32Array(nAtoms * 4)
  const velocities = new Float32Array(nAtoms * 4)
  const atomParams = new Float32Array(nAtoms * 4)
  const atomTypeIds = new Int32Array(nAtoms)
  const moleculeIds = new Int32Array(nAtoms)
  const bonds: Bond[] = []
  const angles: Angle[] = []
  const dihedrals: Dihedral[] = []
  const molRangesData: number[] = []

  const rand = mulberry32(0x9e3779b9)
  const gauss = makeGaussian(rand)

  const centers = placeCenters(units, config.box, rand)

  let molAtom = 0 // next bonded-molecule atom slot
  let monoAtom = molAtomTotal // next monatomic atom slot
  let molIndex = 0 // bonded-molecule index (for molRanges)
  let molId = 0 // unique molecule id for nonbonded exclusion
  const usedElements = new Map<number, ElementDef>()

  for (let s = 0; s < units.length; s++) {
    const unit = units[s]
    const [cx, cy, cz] = centers[s]

    if (unit.kind === 'molecule') {
      const tmpl = unit.tmpl
      const base = molAtom
      molAtom += tmpl.sites.length
      const id = molId++
      const rot = randomRotation(gauss)

      for (let k = 0; k < tmpl.sites.length; k++) {
        const site = tmpl.sites[k]
        const a = base + k
        usedElements.set(site.el.id, site.el)
        const lp = applyRot(rot, site.pos)
        setPos(positions, a, wrap(cx + lp[0], bx), wrap(cy + lp[1], by), wrap(cz + lp[2], bz), siteCharge(site))
        setVec4(atomParams, a, siteSigma(site), siteEpsilon(site), id, site.el.id)
        velocities[a * 4 + 3] = site.el.mass
        atomTypeIds[a] = site.el.id
        moleculeIds[a] = id
      }

      const bondStart = bonds.length
      for (const b of tmpl.bonds) {
        bonds.push({ i: base + b.a, j: base + b.b, r0: b.r0, k: b.k })
      }
      const angleStart = angles.length
      for (const an of tmpl.angles) {
        angles.push({ i: base + an.a, j: base + an.b, k: base + an.c, theta0: an.theta0, kTheta: an.k })
      }
      molRangesData.push(bondStart, tmpl.bonds.length, angleStart, tmpl.angles.length)
      molIndex++
    } else {
      const el = unit.el
      const id = molId++
      const a = monoAtom++
      usedElements.set(el.id, el)
      setPos(positions, a, wrap(cx, bx), wrap(cy, by), wrap(cz, bz), el.charge)
      setVec4(atomParams, a, el.sigma, el.epsilon, id, el.id)
      velocities[a * 4 + 3] = el.mass
      atomTypeIds[a] = el.id
      moleculeIds[a] = id
    }
  }

  // One-time setup relaxation: gently separate overlapping atoms from
  // different molecules before the first force evaluation.
  relaxOverlaps(positions, atomParams, moleculeIds, config.box)

  const reactiveBondedMolecules = inferReactiveBonds(
    positions,
    atomTypeIds,
    moleculeIds,
    atomParams,
    bonds,
    angles,
    molRangesData,
    molId,
    config.box,
  )

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
    molRanges: new Uint32Array(molRangesData.length > 0 ? molRangesData : [0, 0, 0, 0]),
  }

  const params: SimParams = {
    dt: config.dt,
    numAtoms: nAtoms,
    numMolecules: nBondedMol + reactiveBondedMolecules,
    cutoffRadius,
    box: [bx, by, bz],
    coulombConstant: COULOMB_K,
  }

  return { params, topology, initial: { positions, velocities, atomParams } }
}

/** Wrap a coordinate into [0, L) for the periodic box. */
function wrap(x: number, L: number): number {
  return ((x % L) + L) % L
}

/**
 * Place unit centers on a space-filling jittered grid. The grid is sized so its
 * cells are roughly cubic and number at least as many as the units; each unit
 * lands at its cell center plus random jitter bounded so axis-adjacent centers
 * never come closer than the largest material spacing. This fills the whole box
 * randomly while keeping atoms from overlapping. Cells are shuffled so partial
 * fills disperse instead of leaving an empty corner.
 */
function placeCenters(units: Unit[], box: Vec3, rand: () => number): Vec3[] {
  const [bx, by, bz] = box
  const n = units.length
  const vol = bx * by * bz
  const edge = Math.cbrt(vol / Math.max(1, n))
  let nx = Math.max(1, Math.round(bx / edge))
  let ny = Math.max(1, Math.round(by / edge))
  let nz = Math.max(1, Math.round(bz / edge))
  while (nx * ny * nz < n) {
    const cx = bx / nx
    const cy = by / ny
    const cz = bz / nz
    if (cx >= cy && cx >= cz) nx++
    else if (cy >= cz) ny++
    else nz++
  }

  const sx = bx / nx
  const sy = by / ny
  const sz = bz / nz
  const minSpacing = units.reduce((m, u) => Math.max(m, u.nn), 0)
  const jx = Math.max(0, (sx - minSpacing) / 2) * 0.95
  const jy = Math.max(0, (sy - minSpacing) / 2) * 0.95
  const jz = Math.max(0, (sz - minSpacing) / 2) * 0.95

  // Shuffle cell indices so a partial last layer spreads across the box.
  const cells = new Array(nx * ny * nz)
  for (let i = 0; i < cells.length; i++) cells[i] = i
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const t = cells[i]
    cells[i] = cells[j]
    cells[j] = t
  }

  const centers: Vec3[] = []
  for (let u = 0; u < n; u++) {
    const c = cells[u]
    const gx = c % nx
    const gy = Math.floor(c / nx) % ny
    const gz = Math.floor(c / (nx * ny))
    centers.push([
      (gx + 0.5) * sx + (rand() * 2 - 1) * jx,
      (gy + 0.5) * sy + (rand() * 2 - 1) * jy,
      (gz + 0.5) * sz + (rand() * 2 - 1) * jz,
    ])
  }
  return centers
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

/** Uniform-ish random rotation matrix (3x3, row-major) from a random axis. */
function randomRotation(gauss: () => number): number[] {
  let ax = gauss()
  let ay = gauss()
  let az = gauss()
  const len = Math.hypot(ax, ay, az) || 1
  ax /= len
  ay /= len
  az /= len
  const angle = 2 * Math.PI * (0.5 * (gauss() + 1)) // any angle works; axis is random
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const t = 1 - c
  return [
    t * ax * ax + c, t * ax * ay - s * az, t * ax * az + s * ay,
    t * ax * ay + s * az, t * ay * ay + c, t * ay * az - s * ax,
    t * ax * az - s * ay, t * ay * az + s * ax, t * az * az + c,
  ]
}

/** Apply a row-major 3x3 rotation to a local offset. */
function applyRot(m: number[], v: [number, number, number]): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ]
}

function relaxOverlaps(
  positions: Float32Array,
  atomParams: Float32Array,
  moleculeIds: Int32Array,
  box: Vec3,
): void {
  const n = moleculeIds.length
  if (n < 2) return

  let maxMol = 0
  for (let i = 0; i < n; i++) {
    if (moleculeIds[i] > maxMol) maxMol = moleculeIds[i]
  }
  const nMol = maxMol + 1

  const shifts = new Float32Array(nMol * 3)
  const hits = new Int32Array(nMol)
  const iters = n > 3500 ? 2 : 5

  for (let iter = 0; iter < iters; iter++) {
    shifts.fill(0)
    hits.fill(0)
    let overlapPairs = 0

    for (let i = 0; i < n; i++) {
      const mi = moleculeIds[i]
      const ix = positions[i * 4 + 0]
      const iy = positions[i * 4 + 1]
      const iz = positions[i * 4 + 2]
      const sigI = atomParams[i * 4 + 0]

      for (let j = i + 1; j < n; j++) {
        const mj = moleculeIds[j]
        if (mi === mj) continue

        const sigJ = atomParams[j * 4 + 0]
        const minSep = Math.max(0.08, 0.55 * (sigI + sigJ))

        let dx = ix - positions[j * 4 + 0]
        let dy = iy - positions[j * 4 + 1]
        let dz = iz - positions[j * 4 + 2]
        dx -= box[0] * Math.round(dx / box[0])
        dy -= box[1] * Math.round(dy / box[1])
        dz -= box[2] * Math.round(dz / box[2])

        const r2 = dx * dx + dy * dy + dz * dz
        if (r2 >= minSep * minSep) continue

        overlapPairs++
        const r = Math.sqrt(Math.max(r2, 1e-12))
        const inv = 1 / r
        const push = (minSep - r) * 0.5 * 0.7

        const sx = dx * inv * push
        const sy = dy * inv * push
        const sz = dz * inv * push

        shifts[mi * 3 + 0] += sx
        shifts[mi * 3 + 1] += sy
        shifts[mi * 3 + 2] += sz
        hits[mi]++

        shifts[mj * 3 + 0] -= sx
        shifts[mj * 3 + 1] -= sy
        shifts[mj * 3 + 2] -= sz
        hits[mj]++
      }
    }

    if (overlapPairs === 0) break

    for (let i = 0; i < n; i++) {
      const m = moleculeIds[i]
      const h = hits[m]
      if (h === 0) continue
      positions[i * 4 + 0] = wrap(positions[i * 4 + 0] + shifts[m * 3 + 0] / h, box[0])
      positions[i * 4 + 1] = wrap(positions[i * 4 + 1] + shifts[m * 3 + 1] / h, box[1])
      positions[i * 4 + 2] = wrap(positions[i * 4 + 2] + shifts[m * 3 + 2] / h, box[2])
    }
  }
}

function inferReactiveBonds(
  positions: Float32Array,
  atomTypeIds: Int32Array,
  moleculeIds: Int32Array,
  atomParams: Float32Array,
  bonds: Bond[],
  angles: Angle[],
  molRangesData: number[],
  nextMolId: number,
  box: Vec3,
): number {
  const n = atomTypeIds.length
  if (n < 2) return 0

  const initialBondCount = new Uint8Array(n)
  for (const b of bonds) {
    if (b.i >= 0 && b.i < n) initialBondCount[b.i]++
    if (b.j >= 0 && b.j < n) initialBondCount[b.j]++
  }

  const maxBonds = new Uint8Array(n)
  const radii = new Float32Array(n)
  const stiffness = new Float32Array(n)
  const reactiveAtom = new Uint8Array(n)

  for (let i = 0; i < n; i++) {
    const rule = REACTIVE_ELEMENTS[atomTypeIds[i]]
    if (!rule) continue
    maxBonds[i] = rule.maxBonds
    radii[i] = rule.covalentRadius
    stiffness[i] = rule.bondStiffness
    if (initialBondCount[i] === 0) reactiveAtom[i] = 1
  }

  const candidates: ReactiveBondCandidate[] = []
  for (let i = 0; i < n; i++) {
    if (reactiveAtom[i] === 0 || maxBonds[i] === 0) continue
    const ix = positions[i * 4 + 0]
    const iy = positions[i * 4 + 1]
    const iz = positions[i * 4 + 2]
    for (let j = i + 1; j < n; j++) {
      if (reactiveAtom[j] === 0 || maxBonds[j] === 0) continue
      if (moleculeIds[i] === moleculeIds[j]) continue

      let dx = ix - positions[j * 4 + 0]
      let dy = iy - positions[j * 4 + 1]
      let dz = iz - positions[j * 4 + 2]
      dx -= box[0] * Math.round(dx / box[0])
      dy -= box[1] * Math.round(dy / box[1])
      dz -= box[2] * Math.round(dz / box[2])

      const r2 = dx * dx + dy * dy + dz * dz
      if (r2 < 1e-10) continue

      const cov = radii[i] + radii[j]
      if (cov <= 0) continue
      const rMin = cov * REACTIVE_MIN_SCALE
      const rMax = cov * REACTIVE_CAPTURE_SCALE
      if (r2 < rMin * rMin || r2 > rMax * rMax) continue

      const distance = Math.sqrt(r2)
      candidates.push({
        i,
        j,
        distance,
        score: distance / cov,
      })
    }
  }

  if (candidates.length === 0) return 0
  candidates.sort((a, b) => a.score - b.score)

  const parent = new Int32Array(n)
  const rank = new Uint8Array(n)
  for (let i = 0; i < n; i++) parent[i] = i

  const find = (x: number): number => {
    let r = x
    while (parent[r] !== r) r = parent[r]
    while (parent[x] !== x) {
      const p = parent[x]
      parent[x] = r
      x = p
    }
    return r
  }

  const unite = (a: number, b: number): void => {
    let ra = find(a)
    let rb = find(b)
    if (ra === rb) return
    if (rank[ra] < rank[rb]) {
      const t = ra
      ra = rb
      rb = t
    }
    parent[rb] = ra
    if (rank[ra] === rank[rb]) rank[ra]++
  }

  for (const b of bonds) unite(b.i, b.j)

  const bondCount = initialBondCount.slice()
  const picked: ReactiveBond[] = []
  for (const c of candidates) {
    if (bondCount[c.i] >= maxBonds[c.i]) continue
    if (bondCount[c.j] >= maxBonds[c.j]) continue
    const cov = radii[c.i] + radii[c.j]
    const r0 = Math.max(cov * 0.95, c.distance * 0.98)
    const k = Math.sqrt(stiffness[c.i] * stiffness[c.j])
    picked.push({ i: c.i, j: c.j, r0, k })
    bondCount[c.i]++
    bondCount[c.j]++
    unite(c.i, c.j)
  }

  if (picked.length === 0) return 0

  const componentAtoms = new Map<number, number[]>()
  const seenAtom = new Uint8Array(n)
  for (const b of picked) {
    const ri = find(b.i)
    const rj = find(b.j)
    if (ri !== rj) continue
    if (!seenAtom[b.i]) {
      seenAtom[b.i] = 1
      const a = componentAtoms.get(ri)
      if (a) a.push(b.i)
      else componentAtoms.set(ri, [b.i])
    }
    if (!seenAtom[b.j]) {
      seenAtom[b.j] = 1
      const a = componentAtoms.get(ri)
      if (a) a.push(b.j)
      else componentAtoms.set(ri, [b.j])
    }
  }

  const grouped = new Map<number, ReactiveBond[]>()
  for (const b of picked) {
    const root = find(b.i)
    const list = grouped.get(root)
    if (list) list.push(b)
    else grouped.set(root, [b])
  }

  let createdMolecules = 0
  let molId = nextMolId
  for (const [root, groupBonds] of grouped) {
    const atoms = componentAtoms.get(root)
    if (!atoms || atoms.length === 0) continue

    const assignedMolId = molId++
    for (const atom of atoms) {
      moleculeIds[atom] = assignedMolId
      atomParams[atom * 4 + 2] = assignedMolId
    }

    const bondStart = bonds.length
    for (const rb of groupBonds) {
      bonds.push({ i: rb.i, j: rb.j, r0: rb.r0, k: rb.k })
    }
    molRangesData.push(bondStart, groupBonds.length, angles.length, 0)
    createdMolecules++
  }

  return createdMolecules
}
