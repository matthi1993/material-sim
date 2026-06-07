// Molecule geometry + intramolecular force-field templates.
// Bond/angle indices are local to each molecule copy (0-based).

import type { ElementDef } from './elements'

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
