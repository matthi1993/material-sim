// Runtime reactive bonding force pass.
// Applies harmonic bond force for every active reactive bond.

struct Uniforms {
  box      : vec3<f32>,
  cutoff2  : f32,
  numAtoms : u32,
  numMol   : u32,
  dt       : f32,
  coulombK : f32,
  r0       : f32,
  kb       : f32,
  theta0   : f32,
  ka       : f32,
  targetT  : f32,
  tau      : f32,
  kB       : f32,
  thermoOn : u32,
  gridDim  : vec3<u32>,
  cellCap  : u32,
  cellSize : vec3<f32>,
  useCells : u32,
  boundaryMode : u32,
  forceGuardOn : u32,
  reactiveOn : u32,
  staticBondCount : u32,
  maxReactiveBonds : u32,
  reactiveBreakScale : f32,
};

struct MolBond {
  ij  : vec2<u32>,
  par : vec2<f32>,
};

const FORCE_GUARD_MAX: f32 = 25000.0;
const MAX_BOND_DELTA: f32 = 0.06;

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read_write> force: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> staticBonds: array<MolBond>;
@group(0) @binding(6) var<storage, read_write> reactiveBonds: array<MolBond>;
@group(0) @binding(7) var<storage, read_write> reactiveCount: array<atomic<u32>>;
@group(0) @binding(8) var<storage, read_write> atomBondCounts: array<atomic<u32>>;
@group(0) @binding(9) var<storage, read_write> proposals: array<u32>;

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

fn guardForce(f: vec3<f32>) -> vec3<f32> {
  if (u.forceGuardOn == 0u) { return f; }
  let m2 = dot(f, f);
  if (m2 <= FORCE_GUARD_MAX * FORCE_GUARD_MAX || m2 < 1e-16) { return f; }
  let invm = inverseSqrt(m2);
  return f * (FORCE_GUARD_MAX * invm);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (u.reactiveOn == 0u) { return; }

  let idx = gid.x;
  let nReactive = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  if (idx >= nReactive) { return; }

  let bond = reactiveBonds[idx];
  let i = bond.ij.x;
  let j = bond.ij.y;
  if (i >= u.numAtoms || j >= u.numAtoms || vel[i].w <= 0.0 || vel[j].w <= 0.0) {
    return;
  }

  let r0 = bond.par.x;
  let kb = bond.par.y;
  if (kb <= 0.0) { return; }

  let d = minImage(pos[j].xyz - pos[i].xyz);
  let r = length(d);
  if (r < 1e-6) { return; }

  let invr = 1.0 / r;
  let delta = clamp(r - r0, -MAX_BOND_DELTA, MAX_BOND_DELTA);
  let fb = -kb * delta;
  let fv = guardForce((fb * invr) * d);

  force[j] = force[j] + vec4<f32>(fv, 0.0);
  force[i] = force[i] - vec4<f32>(fv, 0.0);
}
