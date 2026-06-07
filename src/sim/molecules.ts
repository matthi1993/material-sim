// Molecule geometry + intramolecular force-field templates. Pure data: site
// layout (local nm offsets), harmonic bonds and angles. Atom indices in bonds
// and angles are LOCAL to the molecule (0-based); topology offsets them when it
// places each copy. Per-site charge / LJ overrides let a molecule reuse an
// element's color while carrying its own force-field (e.g. neutral O in O2).

import { ELEMENTS, type ElementDef } from './elements'

const DEG = Math.PI / 180

export interface MoleculeSite {
  el: ElementDef
  pos: [number, number, number] // local offset from molecule center (nm)
  charge?: number // overrides el.charge when set
  sigma?: number // overrides el.sigma (nm) when set
  epsilon?: number // overrides el.epsilon (kJ/mol) when set
}

export interface MoleculeBondT {
  a: number
  b: number
  r0: number // nm
  k: number // kJ/mol/nm^2
}

export interface MoleculeAngleT {
  a: number
  b: number // central atom
  c: number
  theta0: number // rad
  k: number // kJ/mol/rad^2
}

export interface MoleculeTemplate {
  sites: MoleculeSite[]
  bonds: MoleculeBondT[]
  angles: MoleculeAngleT[]
}

/** site charge / LJ resolved against the element defaults. */
export function siteCharge(s: MoleculeSite): number {
  return s.charge ?? s.el.charge
}
export function siteSigma(s: MoleculeSite): number {
  return s.sigma ?? s.el.sigma
}
export function siteEpsilon(s: MoleculeSite): number {
  return s.epsilon ?? s.el.epsilon
}

// --- Water (flexible TIP3P): bent, O + 2H ---------------------------------
const WATER_OH = 0.09572
const WATER_HALF = (104.52 * DEG) / 2
export const WATER_MOL: MoleculeTemplate = {
  sites: [
    { el: ELEMENTS.O, pos: [0, 0, 0] },
    { el: ELEMENTS.H, pos: [WATER_OH * Math.sin(WATER_HALF), WATER_OH * Math.cos(WATER_HALF), 0] },
    { el: ELEMENTS.H, pos: [-WATER_OH * Math.sin(WATER_HALF), WATER_OH * Math.cos(WATER_HALF), 0] },
  ],
  bonds: [
    { a: 0, b: 1, r0: WATER_OH, k: 200000 },
    { a: 0, b: 2, r0: WATER_OH, k: 200000 },
  ],
  angles: [{ a: 1, b: 0, c: 2, theta0: 104.52 * DEG, k: 460 }],
}

// --- Diatomic gases (neutral) ---------------------------------------------
function diatomic(
  el: ElementDef,
  r0: number,
  k: number,
  sigma: number,
  epsilon: number,
): MoleculeTemplate {
  const h = r0 / 2
  return {
    sites: [
      { el, pos: [-h, 0, 0], charge: 0, sigma, epsilon },
      { el, pos: [h, 0, 0], charge: 0, sigma, epsilon },
    ],
    bonds: [{ a: 0, b: 1, r0, k }],
    angles: [],
  }
}

export const OXYGEN_MOL = diatomic(ELEMENTS.O, 0.1208, 300000, 0.3017, 0.5021)
export const HYDROGEN_MOL = diatomic(ELEMENTS.H, 0.0741, 200000, 0.2958, 0.118)
export const NITROGEN_MOL = diatomic(ELEMENTS.N, 0.1098, 350000, 0.331, 0.3)

// --- Carbon dioxide (linear, EPM2-style) ----------------------------------
const CO2_CO = 0.1149
export const CO2_MOL: MoleculeTemplate = {
  sites: [
    { el: ELEMENTS.C, pos: [0, 0, 0], charge: 0.6512, sigma: 0.2757, epsilon: 0.2339 },
    { el: ELEMENTS.O, pos: [-CO2_CO, 0, 0], charge: -0.3256, sigma: 0.3033, epsilon: 0.6694 },
    { el: ELEMENTS.O, pos: [CO2_CO, 0, 0], charge: -0.3256, sigma: 0.3033, epsilon: 0.6694 },
  ],
  bonds: [
    { a: 0, b: 1, r0: CO2_CO, k: 300000 },
    { a: 0, b: 2, r0: CO2_CO, k: 300000 },
  ],
  angles: [{ a: 1, b: 0, c: 2, theta0: Math.PI, k: 1200 }],
}

// --- Methane (tetrahedral, all-atom OPLS-style) ---------------------------
const CH = 0.109
const T = CH / Math.sqrt(3)
const TET: [number, number, number][] = [
  [T, T, T],
  [T, -T, -T],
  [-T, T, -T],
  [-T, -T, T],
]
export const METHANE_MOL: MoleculeTemplate = {
  sites: [
    { el: ELEMENTS.C, pos: [0, 0, 0], charge: -0.24, sigma: 0.35, epsilon: 0.276 },
    ...TET.map((p): MoleculeSite => ({ el: ELEMENTS.H, pos: p, charge: 0.06, sigma: 0.25, epsilon: 0.126 })),
  ],
  bonds: TET.map((_, i): MoleculeBondT => ({ a: 0, b: i + 1, r0: CH, k: 200000 })),
  angles: methaneAngles(),
}

// --- Coarse-grained polymer chain (C24) -----------------------------------
const POLYMER_BOND = 0.154
const POLYMER_K_BOND = 180000
const POLYMER_K_ANGLE = 320
const POLYMER_LENGTH = 24

function makeLinearCarbonPolymer(length: number): MoleculeTemplate {
  const sites: MoleculeSite[] = []
  const bonds: MoleculeBondT[] = []
  const angles: MoleculeAngleT[] = []

  const half = (length - 1) * 0.5
  for (let i = 0; i < length; i++) {
    const x = (i - half) * POLYMER_BOND
    sites.push({
      el: ELEMENTS.C,
      pos: [x, 0, 0],
      charge: 0,
      sigma: 0.36,
      epsilon: 0.32,
    })
    if (i > 0) {
      bonds.push({ a: i - 1, b: i, r0: POLYMER_BOND, k: POLYMER_K_BOND })
    }
    if (i > 1) {
      angles.push({ a: i - 2, b: i - 1, c: i, theta0: Math.PI, k: POLYMER_K_ANGLE })
    }
  }

  return { sites, bonds, angles }
}

export const POLYMER_C24_MOL = makeLinearCarbonPolymer(POLYMER_LENGTH)

function methaneAngles(): MoleculeAngleT[] {
  const angles: MoleculeAngleT[] = []
  const theta0 = 109.47 * DEG
  for (let i = 1; i <= 4; i++) {
    for (let j = i + 1; j <= 4; j++) {
      angles.push({ a: i, b: 0, c: j, theta0, k: 300 })
    }
  }
  return angles
}
