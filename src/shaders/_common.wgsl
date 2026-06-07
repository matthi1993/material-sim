// Shared bindings and helpers for every compute kernel.
// Each kernel #includes the same layout (via identical declarations) so a
// single bind-group layout drives all compute passes. Buffers are declared
// read_write even where a kernel only reads, to keep one shared layout.

struct Uniforms {
  box      : vec3<f32>, // box side lengths (nm)
  cutoff2  : f32,       // squared nonbonded cutoff (nm^2)
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,       // ps
  coulombK : f32,       // kJ*nm/(mol*e^2)
  r0       : f32,       // O-H equilibrium length (nm)
  kb       : f32,       // O-H bond stiffness (kJ/mol/nm^2)
  theta0   : f32,       // H-O-H equilibrium angle (rad)
  ka       : f32,       // H-O-H angle stiffness (kJ/mol/rad^2)
  targetT  : f32,       // thermostat target temperature (K)
  tau      : f32,       // thermostat coupling time (ps)
  kB       : f32,       // Boltzmann constant (kJ/mol/K)
  thermoOn : u32,       // 1 = thermostat active
  gridDim  : vec3<u32>, // cell-list grid dimensions (cells per axis)
  cellCap  : u32,       // max atoms stored per cell
  cellSize : vec3<f32>, // cell edge lengths (nm), >= cutoff per axis
  useCells : u32,       // 1 = use the cell list, 0 = brute-force O(N^2)
  boundaryMode : u32,   // 0 = periodic, 1 = open, 2 = open-top
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> pos: array<vec4<f32>>;        // xyz, charge
@group(0) @binding(2) var<storage, read_write>  atomParams: array<vec4<f32>>; // sigma, epsilon, molId, elementId
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;      // xyz, _
@group(0) @binding(4) var<storage, read_write> vel: array<vec4<f32>>;        // xyz, mass
@group(0) @binding(5) var<storage, read_write> reduction: array<f32>;        // scratch (e.g. 2*KE)
@group(0) @binding(6) var<storage, read_write> cellHead: array<atomic<u32>>; // atom count per cell
@group(0) @binding(7) var<storage, read_write> cellAtoms: array<u32>;        // atom ids, cellCap per cell

fn minImage(d: vec3<f32>) -> vec3<f32> {
  if (u.boundaryMode == 1u) { return d; }
  if (u.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - u.box.x * round(d.x / u.box.x),
      d.y,
      d.z - u.box.z * round(d.z / u.box.z),
    );
  }
  return d - u.box * round(d / u.box);
}

fn numCells() -> u32 {
  return u.gridDim.x * u.gridDim.y * u.gridDim.z;
}

/** Integer cell coordinate for a (wrapped) position, clamped into the grid. */
fn cellCoord(p: vec3<f32>) -> vec3<i32> {
  let ci = vec3<i32>(floor(p / u.cellSize));
  let hi = vec3<i32>(u.gridDim) - vec3<i32>(1, 1, 1);
  return clamp(ci, vec3<i32>(0, 0, 0), hi);
}

/** Flat index of a cell coordinate, wrapped periodically into the grid. */
fn cellIndexWrapped(c: vec3<i32>) -> u32 {
  let gd = vec3<i32>(u.gridDim);
  let w = ((c % gd) + gd) % gd;
  return u32(w.x + gd.x * (w.y + gd.y * w.z));
}
