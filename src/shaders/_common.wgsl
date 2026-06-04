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
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> pos: array<vec4<f32>>;        // xyz, charge
@group(0) @binding(2) var<storage, read>        atomParams: array<vec4<f32>>; // sigma, epsilon, molId, typeId
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;      // xyz, _
@group(0) @binding(4) var<storage, read_write> vel: array<vec4<f32>>;        // xyz, mass
@group(0) @binding(5) var<storage, read_write> reduction: array<f32>;        // scratch (e.g. 2*KE)

fn minImage(d: vec3<f32>) -> vec3<f32> {
  return d - u.box * round(d / u.box);
}
