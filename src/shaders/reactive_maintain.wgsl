// Runtime reactive bonding maintenance pass.
// One invocation compacts active bonds and removes over-stretched bonds.

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

const INVALID: u32 = 0xffffffffu;

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

fn decrementBondCount(atom: u32) {
  let old = atomicLoad(&atomBondCounts[atom]);
  if (old > 0u) {
    atomicSub(&atomBondCounts[atom], 1u);
  }
}

@compute @workgroup_size(1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x != 0u || u.reactiveOn == 0u) {
    return;
  }

  let count = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  var writeIdx: u32 = 0u;

  for (var readIdx: u32 = 0u; readIdx < count; readIdx = readIdx + 1u) {
    let bond = reactiveBonds[readIdx];
    let i = bond.ij.x;
    let j = bond.ij.y;
    let r0 = bond.par.x;
    let kb = bond.par.y;

    var keep = true;

    if (kb <= 0.0 || i >= u.numAtoms || j >= u.numAtoms || i == j) {
      keep = false;
    } else if (vel[i].w <= 0.0 || vel[j].w <= 0.0) {
      keep = false;
    } else {
      let d = minImage(pos[j].xyz - pos[i].xyz);
      let r = length(d);
      if (r > r0 * u.reactiveBreakScale) {
        keep = false;
      }
    }

    if (keep) {
      if (writeIdx != readIdx) {
        reactiveBonds[writeIdx] = bond;
      }
      writeIdx = writeIdx + 1u;
    } else {
      if (i < u.numAtoms) { decrementBondCount(i); }
      if (j < u.numAtoms) { decrementBondCount(j); }
    }
  }

  for (var k: u32 = writeIdx; k < count; k = k + 1u) {
    reactiveBonds[k] = MolBond(vec2<u32>(INVALID, INVALID), vec2<f32>(0.0, 0.0));
  }

  atomicStore(&reactiveCount[0], writeIdx);
}
