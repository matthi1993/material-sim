// All shared structs and enums live here.
// WGSL structs in /shaders must match these exactly (same order, same types).

export type Vec3 = [number, number, number]

/**
 * Immutable during a run. To change: pause -> destroy -> reinit.
 */
export interface SimParams {
  dt: number // f32 - timestep in picoseconds
  numAtoms: number // u32
  numMolecules: number // u32 - rigid/grouped units (water = 3 atoms each)
  cutoffRadius: number // f32 - nanometers
  box: Vec3 // f32x3 - orthorhombic box side lengths (nm)
  coulombConstant: number // f32 - kJ*nm/(mol*e^2)
}

/**
 * Hot-swappable settings. Never put these in SimParams.
 */
export interface RuntimeConfig {
  targetTemperature: number // K
  thermostatEnabled: boolean
  stepsPerFrame: number
}

export interface AtomType {
  name: string
  mass: number // amu
  charge: number // e
  sigma: number // nm (Lennard-Jones)
  epsilon: number // kJ/mol (Lennard-Jones)
}

export interface Bond {
  i: number
  j: number
  r0: number // nm
  k: number // kJ/mol/nm^2
}

export interface Angle {
  i: number
  j: number // central atom
  k: number
  theta0: number // rad
  kTheta: number // kJ/mol/rad^2
}

export interface Dihedral {
  i: number
  j: number
  k: number
  l: number
  // reserved for AMBER-style torsions (not used by the water MVP)
}

/**
 * Topology is always loaded from data. Never hardcode atom parameters.
 */
export interface Topology {
  atomTypes: AtomType[]
  atomTypeIds: Int32Array // per-atom index into atomTypes
  moleculeIds: Int32Array // per-atom molecule membership
  bonds: Bond[]
  angles: Angle[]
  dihedrals: Dihedral[]
}

/**
 * Initial phase-space state produced at setup time (CPU).
 * Generating lattice positions / Maxwell-Boltzmann velocities is setup,
 * not simulation, so it is allowed to live in TypeScript.
 */
export interface InitialState {
  positions: Float32Array // length numAtoms*4: (x,y,z,charge)
  velocities: Float32Array // length numAtoms*4: (vx,vy,vz,mass)
  atomParams: Float32Array // length numAtoms*4: (sigma,epsilon,molId,typeId)
}

/**
 * View parameters passed from the camera controller into the backend each
 * frame. Pure view math, no physics.
 */
export interface CameraView {
  viewProj: Float32Array // 16 floats, column-major
  right: Vec3
  up: Vec3
}

export interface SimStats {
  fps: number
  numAtoms: number
  temperature: number // K (measured, may be NaN before first sample)
}
