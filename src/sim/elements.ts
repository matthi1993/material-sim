// Chemical element / particle species library. Pure data — engine and shaders
// never hardcode these numbers. The `id` is a global palette index the render
// shader maps to a color and radius (see render.wgsl); keep these in sync.

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
  K: { id: 7, symbol: 'K', mass: 39.0983, charge: 1.0, sigma: 0.3334, epsilon: 0.4184 },
  Br: { id: 8, symbol: 'Br', mass: 79.904, charge: -1.0, sigma: 0.4625, epsilon: 0.4184 },
  Ne: { id: 9, symbol: 'Ne', mass: 20.1797, charge: 0.0, sigma: 0.2782, epsilon: 0.2966 },
  Au: { id: 10, symbol: 'Au', mass: 196.9666, charge: 0.0, sigma: 0.2629, epsilon: 22.0 },
  Ag: { id: 11, symbol: 'Ag', mass: 107.8682, charge: 0.0, sigma: 0.2644, epsilon: 19.0 },
  Ni: { id: 12, symbol: 'Ni', mass: 58.6934, charge: 0.0, sigma: 0.2282, epsilon: 23.0 },
  C: { id: 13, symbol: 'C', mass: 12.011, charge: 0.0, sigma: 0.35, epsilon: 0.276 },
  N: { id: 14, symbol: 'N', mass: 14.007, charge: 0.0, sigma: 0.331, epsilon: 0.3 },
} as const satisfies Record<string, ElementDef>
