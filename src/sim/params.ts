// Default parameter values and the material/force-field library.
// Everything here is data. Engine and shaders never hardcode these numbers.
// Adding a new substance means adding a MaterialDef here — nothing else.
// Element definitions live in elements.ts; molecule geometry in molecules.ts.

import { ELEMENTS, type ElementDef } from './elements'
import {
  CO2_MOL,
  HYDROGEN_MOL,
  METHANE_MOL,
  NITROGEN_MOL,
  OXYGEN_MOL,
  WATER_MOL,
  type MoleculeTemplate,
} from './molecules'
import type { RuntimeConfig, Vec3, ViewOptions } from './types'

export { ELEMENTS, type ElementDef } from './elements'
export type { MoleculeTemplate } from './molecules'

/** Physical constants in the nm / ps / amu / kJ-per-mol unit system. */
export const KB = 0.00831446261815324 // Boltzmann constant, kJ/mol/K
export const COULOMB_K = 138.935458 // 1/(4*pi*eps0), kJ*nm/(mol*e^2)

const RMIN = Math.pow(2, 1 / 6) // r_min / sigma for a Lennard-Jones well

/** Coarse grouping the UI shows as labeled sections in the mixture list. */
export type MaterialCategory = 'molecules' | 'ions' | 'atoms'

/**
 * A buildable substance.
 * - `molecule`: bonded molecules built from a MoleculeTemplate. count = molecules.
 * - `ionic`:    alternating cation/anion. count = formula units (2 ions).
 * - `atomic`:   single-element lattice or fluid. count = atoms.
 */
export type MaterialKind = 'molecule' | 'ionic' | 'atomic'

export interface MaterialDef {
  key: string
  label: string
  kind: MaterialKind
  category: MaterialCategory
  /** molecule: unique elements (legend) · ionic: [cation, anion] · atomic: [element] */
  elements: ElementDef[]
  /** Present for kind === 'molecule': geometry + intramolecular force field. */
  molecule?: MoleculeTemplate
  /** Preferred nearest-neighbor spacing used for initial placement (nm). */
  nn: number
  /** Unit noun shown in the UI (e.g. "molecules", "ions", "atoms"). */
  unit: string
}

// --- Molecules -------------------------------------------------------------

export const WATER: MaterialDef = {
  key: 'water',
  label: 'Water (H2O)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.O, ELEMENTS.H],
  molecule: WATER_MOL,
  nn: 0.31,
  unit: 'molecules',
}

export const OXYGEN: MaterialDef = {
  key: 'oxygen',
  label: 'Oxygen (O2)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.O],
  molecule: OXYGEN_MOL,
  nn: 0.33,
  unit: 'molecules',
}

export const HYDROGEN: MaterialDef = {
  key: 'hydrogen',
  label: 'Hydrogen (H2)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.H],
  molecule: HYDROGEN_MOL,
  nn: 0.3,
  unit: 'molecules',
}

export const NITROGEN: MaterialDef = {
  key: 'nitrogen',
  label: 'Nitrogen (N2)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.N],
  molecule: NITROGEN_MOL,
  nn: 0.34,
  unit: 'molecules',
}

export const CARBON_DIOXIDE: MaterialDef = {
  key: 'co2',
  label: 'Carbon dioxide (CO2)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.C, ELEMENTS.O],
  molecule: CO2_MOL,
  nn: 0.45,
  unit: 'molecules',
}

export const METHANE: MaterialDef = {
  key: 'methane',
  label: 'Methane (CH4)',
  kind: 'molecule',
  category: 'molecules',
  elements: [ELEMENTS.C, ELEMENTS.H],
  molecule: METHANE_MOL,
  nn: 0.42,
  unit: 'molecules',
}

// --- Ions ------------------------------------------------------------------

export const SALT: MaterialDef = {
  key: 'salt',
  label: 'Salt (NaCl)',
  kind: 'ionic',
  category: 'ions',
  elements: [ELEMENTS.Na, ELEMENTS.Cl],
  nn: 0.3, // Na-Cl spacing pulled in by electrostatics, not the LJ minimum
  unit: 'formula units',
}

export const POTASSIUM_CHLORIDE: MaterialDef = {
  key: 'kcl',
  label: 'Potassium chloride (KCl)',
  kind: 'ionic',
  category: 'ions',
  elements: [ELEMENTS.K, ELEMENTS.Cl],
  nn: 0.31,
  unit: 'formula units',
}

export const POTASSIUM_BROMIDE: MaterialDef = {
  key: 'kbr',
  label: 'Potassium bromide (KBr)',
  kind: 'ionic',
  category: 'ions',
  elements: [ELEMENTS.K, ELEMENTS.Br],
  nn: 0.33,
  unit: 'formula units',
}

// --- Atoms & metals --------------------------------------------------------

function atomic(key: string, label: string, el: ElementDef): MaterialDef {
  return {
    key,
    label,
    kind: 'atomic',
    category: 'atoms',
    elements: [el],
    nn: el.sigma * RMIN,
    unit: 'atoms',
  }
}

export const ARGON = atomic('argon', 'Argon (Ar)', ELEMENTS.Ar)
export const NEON = atomic('neon', 'Neon (Ne)', ELEMENTS.Ne)
export const IRON = atomic('iron', 'Iron (Fe)', ELEMENTS.Fe)
export const COPPER = atomic('copper', 'Copper (Cu)', ELEMENTS.Cu)
export const GOLD = atomic('gold', 'Gold (Au)', ELEMENTS.Au)
export const SILVER = atomic('silver', 'Silver (Ag)', ELEMENTS.Ag)
export const NICKEL = atomic('nickel', 'Nickel (Ni)', ELEMENTS.Ni)

/** Registry of every substance the UI can build and mix. */
export const MATERIALS: Record<string, MaterialDef> = {
  water: WATER,
  oxygen: OXYGEN,
  hydrogen: HYDROGEN,
  nitrogen: NITROGEN,
  co2: CARBON_DIOXIDE,
  methane: METHANE,
  salt: SALT,
  kcl: POTASSIUM_CHLORIDE,
  kbr: POTASSIUM_BROMIDE,
  argon: ARGON,
  neon: NEON,
  iron: IRON,
  copper: COPPER,
  gold: GOLD,
  silver: SILVER,
  nickel: NICKEL,
}

export const MATERIAL_LIST: MaterialDef[] = [
  WATER,
  OXYGEN,
  HYDROGEN,
  NITROGEN,
  CARBON_DIOXIDE,
  METHANE,
  SALT,
  POTASSIUM_CHLORIDE,
  POTASSIUM_BROMIDE,
  ARGON,
  NEON,
  IRON,
  COPPER,
  GOLD,
  SILVER,
  NICKEL,
]

/** Mixture-list section order and labels for the UI. */
export const MATERIAL_CATEGORIES: { key: MaterialCategory; label: string }[] = [
  { key: 'molecules', label: 'Molecules' },
  { key: 'ions', label: 'Ions' },
  { key: 'atoms', label: 'Atoms & metals' },
]

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
    key: 'brine',
    label: 'Brine',
    config: {
      components: [
        { materialKey: 'water', count: 200 },
        { materialKey: 'salt', count: 28 },
      ],
      box: [2.0, 2.0, 2.0],
      cutoffRadius: 0.9,
      dt: 0.0005,
      temperature: 320,
    },
  },
  {
    key: 'kcl-solution',
    label: 'KCl solution',
    config: {
      components: [
        { materialKey: 'water', count: 230 },
        { materialKey: 'kcl', count: 14 },
      ],
      box: [2.0, 2.0, 2.0],
      cutoffRadius: 0.9,
      dt: 0.0005,
      temperature: 310,
    },
  },
  {
    key: 'oxygen',
    label: 'Oxygen gas',
    config: {
      components: [{ materialKey: 'oxygen', count: 160 }],
      box: [4.0, 4.0, 4.0],
      cutoffRadius: 1.0,
      dt: 0.0005,
      temperature: 200,
    },
  },
  {
    key: 'hydrogen',
    label: 'Hydrogen gas',
    config: {
      components: [{ materialKey: 'hydrogen', count: 200 }],
      box: [4.0, 4.0, 4.0],
      cutoffRadius: 1.0,
      dt: 0.0004,
      temperature: 120,
    },
  },
  {
    key: 'air',
    label: 'Air (N2 + O2)',
    config: {
      components: [
        { materialKey: 'nitrogen', count: 150 },
        { materialKey: 'oxygen', count: 40 },
      ],
      box: [4.5, 4.5, 4.5],
      cutoffRadius: 1.0,
      dt: 0.0005,
      temperature: 220,
    },
  },
  {
    key: 'co2',
    label: 'Carbon dioxide',
    config: {
      components: [{ materialKey: 'co2', count: 130 }],
      box: [4.0, 4.0, 4.0],
      cutoffRadius: 1.1,
      dt: 0.0005,
      temperature: 250,
    },
  },
  {
    key: 'methane',
    label: 'Methane',
    config: {
      components: [{ materialKey: 'methane', count: 130 }],
      box: [4.0, 4.0, 4.0],
      cutoffRadius: 1.1,
      dt: 0.0004,
      temperature: 150,
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
    key: 'neon',
    label: 'Neon gas',
    config: {
      components: [{ materialKey: 'neon', count: 800 }],
      box: [5.0, 5.0, 5.0],
      cutoffRadius: 1.0,
      dt: 0.002,
      temperature: 50,
    },
  },
  {
    key: 'noble-mix',
    label: 'Noble gas mix',
    config: {
      components: [
        { materialKey: 'argon', count: 400 },
        { materialKey: 'neon', count: 400 },
      ],
      box: [6.0, 6.0, 6.0],
      cutoffRadius: 1.2,
      dt: 0.002,
      temperature: 90,
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
  {
    key: 'gold',
    label: 'Gold crystal',
    config: {
      components: [{ materialKey: 'gold', count: 729 }],
      box: [2.63, 2.63, 2.63],
      cutoffRadius: 0.6,
      dt: 0.0002,
      temperature: 300,
    },
  },
  {
    key: 'silver',
    label: 'Silver crystal',
    config: {
      components: [{ materialKey: 'silver', count: 729 }],
      box: [2.64, 2.64, 2.64],
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
  boundaryMode: 'periodic',
}

/** Default live display options. */
export const DEFAULT_VIEW: ViewOptions = {
  atomScale: 1,
  forceOpacity: 1,
  showForces: true,
  showBonds: true,
  showBox: true,
}
