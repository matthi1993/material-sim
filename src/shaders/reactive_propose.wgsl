// Runtime reactive bonding: propose one best partner per atom.
// This is a coarse, valence-limited heuristic for lightweight live bonding.

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
const REACTIVE_MIN_SCALE: f32 = 0.65;
const REACTIVE_CAPTURE_SCALE: f32 = 1.35;

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

// Returns (maxBonds, covalentRadius, bondStiffness).
fn reactiveRule(typeId: u32) -> vec3<f32> {
  if (typeId == 1u) { return vec3<f32>(1.0, 0.031, 120000.0); } // H
  if (typeId == 13u) { return vec3<f32>(4.0, 0.076, 160000.0); } // C
  if (typeId == 0u) { return vec3<f32>(2.0, 0.066, 170000.0); } // O
  if (typeId == 14u) { return vec3<f32>(3.0, 0.071, 155000.0); } // N
  if (typeId == 3u) { return vec3<f32>(1.0, 0.102, 110000.0); } // Cl
  if (typeId == 8u) { return vec3<f32>(1.0, 0.12, 90000.0); } // Br
  return vec3<f32>(0.0, 0.0, 0.0);
}

fn hasBond(i: u32, j: u32) -> bool {
  for (var b: u32 = 0u; b < u.staticBondCount; b = b + 1u) {
    let pair = staticBonds[b].ij;
    if ((pair.x == i && pair.y == j) || (pair.x == j && pair.y == i)) {
      return true;
    }
  }

  let nReactive = min(atomicLoad(&reactiveCount[0]), u.maxReactiveBonds);
  for (var b: u32 = 0u; b < nReactive; b = b + 1u) {
    let pair = reactiveBonds[b].ij;
    if ((pair.x == i && pair.y == j) || (pair.x == j && pair.y == i)) {
      return true;
    }
  }
  return false;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  proposals[i] = INVALID;

  if (u.reactiveOn == 0u || vel[i].w <= 0.0) {
    return;
  }

  let ruleI = reactiveRule(u32(atomParams[i].w + 0.5));
  if (ruleI.x < 0.5) {
    return;
  }

  let maxI = u32(ruleI.x + 0.5);
  if (atomicLoad(&atomBondCounts[i]) >= maxI) {
    return;
  }

  let pi = pos[i].xyz;
  var bestJ = INVALID;
  var bestScore = 1e30;

  for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
    if (j == i || vel[j].w <= 0.0) { continue; }

    let ruleJ = reactiveRule(u32(atomParams[j].w + 0.5));
    if (ruleJ.x < 0.5) { continue; }

    let maxJ = u32(ruleJ.x + 0.5);
    if (atomicLoad(&atomBondCounts[j]) >= maxJ) { continue; }

    if (hasBond(i, j)) { continue; }

    let d = minImage(pi - pos[j].xyz);
    let r2 = dot(d, d);
    if (r2 < 1e-10) { continue; }

    let cov = ruleI.y + ruleJ.y;
    if (cov <= 0.0) { continue; }

    let rMin = cov * REACTIVE_MIN_SCALE;
    let rMax = cov * REACTIVE_CAPTURE_SCALE;
    if (r2 < rMin * rMin || r2 > rMax * rMax) { continue; }

    let score = r2 / (cov * cov);
    if (score < bestScore) {
      bestScore = score;
      bestJ = j;
    }
  }

  proposals[i] = bestJ;
}
