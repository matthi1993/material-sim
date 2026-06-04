// Default parameter values and the material/force-field library.
// Everything here is data. Engine and shaders never hardcode these numbers.
// Adding a new substance means adding a MaterialDef here — nothing else.

import type { RuntimeConfig, Vec3 } from './types'

/** Physical constants in the nm / ps / amu / kJ-per-mol unit system. */
export const KB = 0.00831446261815324 // Boltzmann constant, kJ/mol/K
export const COULOMB_K = 138.935458 // 1/(4*pi*eps0), kJ*nm/(mol*e^2)

const DEG = Math.PI / 180
const RMIN = Math.pow(2, 1 / 6) // r_min / sigma for a Lennard-Jones well

/**
 * One chemical element / particle species. The `id` is a global palette index
 * the render shader maps to a color and radius (see render.wgsl). Keep these in
 * sync with the palette there.
 */
export interface ElementDef {
  id: number // global palette id (matches render.wgsl)
  symbol: string
  mass: number // amu
  charge: number // e
  sigma: number // nm (Lennard-Jones)
  epsilon: number // kJ/mol (Lennard-Jones)
}

export const ELEMENTS = {
  O: { id: 0, symbol: 'O', mass: 15.9994, charge: -0.834, sigma: 0.315061, epsilon: 0.636386 },
  H: { id: 1, symbol: 'H', mass: 1.008, charge: 0.417, sigma: 0.0, epsilon: 0.0 },
  Na: { id: 2, symbol: 'Na', mass: 22.98977, charge: 1.0, sigma: 0.2584, epsilon: 0.4184 },
  Cl: { id: 3, symbol: 'Cl', mass: 35.453, charge: -1.0, sigma: 0.4401, epsilon: 0.4184 },
  Ar: { id: 4, symbol: 'Ar', mass: 39.948, charge: 0.0, sigma: 0.3405, epsilon: 0.996 },
  Fe: { id: 5, symbol: 'Fe', mass: 55.845, charge: 0.0, sigma: 0.228, epsilon: 25.0 },
  Cu: { id: 6, symbol: 'Cu', mass: 63.546, charge: 0.0, sigma: 0.234, epsilon: 22.0 },
} as const satisfies Record<string, ElementDef>

/** Intramolecular terms for the 3-site water layout (O, H, H). */
export interface WaterTerms {
  bondR0: number // nm
  bondK: number // kJ/mol/nm^2
  angleTheta0: number // rad
  angleK: number // kJ/mol/rad^2
  ohDistance: number // nm, geometry for initial placement
  hohAngle: number // rad, geometry for initial placement
}

/**
 * A buildable substance.
 * - `water`:   3-site flexible TIP3P molecules. count = molecules.
 * - `ionic`:   alternating cation/anion lattice. count = formula units (2 ions).
 * - `atomic`:  single-element lattice or fluid. count = atoms.
 */
export type MaterialKind = 'water' | 'ionic' | 'atomic'

export interface MaterialDef {
  key: string
  label: string
  kind: MaterialKind
  /** water: [O,H] · ionic: [cation, anion] · atomic: [element] */
  elements: ElementDef[]
  /** Preferred nearest-neighbor spacing used for initial placement (nm). */
  nn: number
  /** Unit noun shown in the UI (e.g. "molecules", "ions", "atoms"). */
  unit: string
  water?: WaterTerms
}

/**
 * TIP3P water (flexible variant): rigid O-H / H-O-H constraints are replaced by
 * stiff harmonic terms so no SHAKE/SETTLE solver is needed for the MVP.
 */
export const WATER: MaterialDef = {
  key: 'water',
  label: 'Water (H2O)',
  kind: 'water',
  elements: [ELEMENTS.O, ELEMENTS.H],
  nn: 0.31,
  unit: 'molecules',
  water: {
    bondR0: 0.09572,
    bondK: 200000,
    angleTheta0: 104.52 * DEG,
    angleK: 460,
    ohDistance: 0.09572,
    hohAngle: 104.52 * DEG,
  },
}

export const SALT: MaterialDef = {
  key: 'salt',
  label: 'Salt (NaCl)',
  kind: 'ionic',
  elements: [ELEMENTS.Na, ELEMENTS.Cl],
  nn: 0.3, // Na-Cl spacing pulled in by electrostatics, not the LJ minimum
  unit: 'formula units',
}

export const ARGON: MaterialDef = {
  key: 'argon',
  label: 'Argon (Ar)',
  kind: 'atomic',
  elements: [ELEMENTS.Ar],
  nn: ELEMENTS.Ar.sigma * RMIN,
  unit: 'atoms',
}

export const IRON: MaterialDef = {
  key: 'iron',
  label: 'Iron (Fe)',
  kind: 'atomic',
  elements: [ELEMENTS.Fe],
  nn: ELEMENTS.Fe.sigma * RMIN,
  unit: 'atoms',
}

export const COPPER: MaterialDef = {
  key: 'copper',
  label: 'Copper (Cu)',
  kind: 'atomic',
  elements: [ELEMENTS.Cu],
  nn: ELEMENTS.Cu.sigma * RMIN,
  unit: 'atoms',
}

/** Registry of every substance the UI can build and mix. */
export const MATERIALS: Record<string, MaterialDef> = {
  water: WATER,
  salt: SALT,
  argon: ARGON,
  iron: IRON,
  copper: COPPER,
}

export const MATERIAL_LIST: MaterialDef[] = [WATER, SALT, ARGON, IRON, COPPER]

/** One substance plus how much of it to place. */
export interface MixtureComponent {
  materialKey: string
  count: number
}

/** UI-level configuration that drives a fresh run. */
export interface SimConfig {
  components: MixtureComponent[]
  box: Vec3 // nm
  cutoffRadius: number // nm
  dt: number // ps
  temperature: number // K
}

/** A named, ready-to-run setup the UI exposes as a one-click button. */
export interface Preset {
  key: string
  label: string
  config: SimConfig
}

export const PRESETS: Preset[] = [
  {
    key: 'water',
    label: 'Water',
    config: {
      components: [{ materialKey: 'water', count: 267 }],
      box: [2.0, 2.0, 2.0],
      cutoffRadius: 0.9,
      dt: 0.0005,
      temperature: 298,
    },
  },
  {
    key: 'saline',
    label: 'Saltwater',
    config: {
      components: [
        { materialKey: 'water', count: 240 },
        { materialKey: 'salt', count: 12 },
      ],
      box: [2.0, 2.0, 2.0],
      cutoffRadius: 0.9,
      dt: 0.0005,
      temperature: 310,
    },
  },
  {
    key: 'salt',
    label: 'Salt crystal',
    config: {
      components: [{ materialKey: 'salt', count: 256 }],
      box: [2.4, 2.4, 2.4],
      cutoffRadius: 0.9,
      dt: 0.0005,
      temperature: 300,
    },
  },
  {
    key: 'argon',
    label: 'Argon gas',
    config: {
      components: [{ materialKey: 'argon', count: 800 }],
      box: [6.0, 6.0, 6.0],
      cutoffRadius: 1.2,
      dt: 0.002,
      temperature: 120,
    },
  },
  {
    key: 'iron',
    label: 'Iron crystal',
    config: {
      components: [{ materialKey: 'iron', count: 729 }],
      box: [2.3, 2.3, 2.3],
      cutoffRadius: 0.6,
      dt: 0.0002,
      temperature: 300,
    },
  },
  {
    key: 'copper',
    label: 'Copper crystal',
    config: {
      components: [{ materialKey: 'copper', count: 729 }],
      box: [2.34, 2.34, 2.34],
      cutoffRadius: 0.6,
      dt: 0.0002,
      temperature: 300,
    },
  },
]

export const DEFAULT_CONFIG: SimConfig = PRESETS[0].config

export const DEFAULT_RUNTIME: RuntimeConfig = {
  targetTemperature: 300,
  thermostatEnabled: true,
  stepsPerFrame: 8,
}
