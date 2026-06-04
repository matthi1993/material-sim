// Default parameter values and force-field definitions.
// Everything here is data. Engine and shaders never hardcode these numbers.

import type { AtomType, RuntimeConfig, Vec3 } from './types'

/** Physical constants in the nm / ps / amu / kJ-per-mol unit system. */
export const KB = 0.00831446261815324 // Boltzmann constant, kJ/mol/K
export const COULOMB_K = 138.935458 // 1/(4*pi*eps0), kJ*nm/(mol*e^2)

/**
 * A force field is just a named bag of parameters. Swapping water for a
 * protein means loading a different force field, not changing the engine.
 */
export interface ForceField {
  name: string
  atomTypes: AtomType[]
  /** Intramolecular terms for the 3-site water layout (O, H, H). */
  water: {
    bondR0: number // nm
    bondK: number // kJ/mol/nm^2
    angleTheta0: number // rad
    angleK: number // kJ/mol/rad^2
    ohDistance: number // nm, geometry for initial placement
    hohAngle: number // rad, geometry for initial placement
  }
}

const DEG = Math.PI / 180

/**
 * TIP3P water. Flexible variant: the rigid O-H/H-O-H constraints are replaced
 * by stiff harmonic terms so the MVP needs no SHAKE/SETTLE solver. Bond/angle
 * stiffness is softened slightly from the rigid model for integrator stability.
 */
export const TIP3P: ForceField = {
  name: 'TIP3P (flexible)',
  atomTypes: [
    {
      name: 'OW',
      mass: 15.9994,
      charge: -0.834,
      sigma: 0.315061,
      epsilon: 0.636386,
    },
    { name: 'HW', mass: 1.008, charge: 0.417, sigma: 0.0, epsilon: 0.0 },
  ],
  water: {
    bondR0: 0.09572,
    bondK: 200000,
    angleTheta0: 104.52 * DEG,
    angleK: 460,
    ohDistance: 0.09572,
    hohAngle: 104.52 * DEG,
  },
}

/** UI-level configuration that drives a fresh run. */
export interface SimConfig {
  forceField: ForceField
  numMolecules: number
  box: Vec3 // nm
  cutoffRadius: number // nm
  dt: number // ps
  temperature: number // K
}

export const DEFAULT_CONFIG: SimConfig = {
  forceField: TIP3P,
  numMolecules: 200,
  box: [2.0, 2.0, 2.0],
  cutoffRadius: 0.9,
  dt: 0.0005,
  temperature: 300,
}

export const DEFAULT_RUNTIME: RuntimeConfig = {
  targetTemperature: 300,
  thermostatEnabled: true,
  stepsPerFrame: 8,
}
