// Builds the list of attractive interactions to visualize. One thread per atom
// scans every other atom in a different molecule within the cutoff and emits a
// line segment for each attractive force above a per-kind threshold:
//   kind 0  electrostatic (Coulomb) attraction — emitted from the positive
//           charge only, so each pair appears once and is never duplicated.
//   kind 1  Lennard-Jones attraction (r past the well minimum) — emitted only
//           for i < j, so each pair appears once.
// Each segment stores the two atom indices, a per-segment opacity (0..1) so the
// render pass can fade weak forces in/out, and the kind so it can be colored.
// Append is via an atomic counter; the render pass reads it back without any
// CPU readback.

struct Viz {
  box           : vec3<f32>,
  coulombK      : f32,
  cutoff2       : f32,
  coulombThresh : f32,
  numAtoms      : u32,
  maxSeg        : u32,
  ljThresh      : f32,
  bondThresh    : f32,
  bondR0        : f32,
  bondK         : f32,
  lineOpacity   : f32, // master force/bond line opacity (0..1)
  boundaryMode  : u32, // 0 = periodic, 1 = open, 2 = open-top
};

@group(0) @binding(0) var<uniform> viz: Viz;
@group(0) @binding(1) var<storage, read> pos: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> atomParams: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> vel: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read_write> segCount: atomic<u32>;
@group(0) @binding(5) var<storage, read_write> segPairs: array<u32>;

const KIND_COULOMB : u32 = 0u;
const KIND_LJ      : u32 = 1u;

fn minImage(d: vec3<f32>, box: vec3<f32>) -> vec3<f32> {
  if (viz.boundaryMode == 1u) { return d; }
  if (viz.boundaryMode == 2u) {
    return vec3<f32>(
      d.x - box.x * round(d.x / box.x),
      d.y,
      d.z - box.z * round(d.z / box.z),
    );
  }
  return d - box * round(d / box);
}

fn emit(ia: u32, ib: u32, alpha: f32, kind: u32) {
  let idx = atomicAdd(&segCount, 1u);
  if (idx < viz.maxSeg) {
    segPairs[idx * 4u]      = ia;
    segPairs[idx * 4u + 1u] = ib;
    segPairs[idx * 4u + 2u] = bitcast<u32>(alpha);
    segPairs[idx * 4u + 3u] = kind;
  }
}

// Fade from the emission threshold up to ~2.5x threshold (fully opaque).
fn fade(fmag: f32, threshold: f32) -> f32 {
  return clamp((fmag - threshold) / (threshold * 1.5), 0.06, 1.0);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= viz.numAtoms) { return; }
  if (vel[i].w <= 0.0) { return; }

  let pi   = pos[i].xyz;
  let qi   = pos[i].w;
  let molI = atomParams[i].z;
  let sigI = atomParams[i].x;
  let epsI = atomParams[i].y;

  for (var j: u32 = 0u; j < viz.numAtoms; j = j + 1u) {
    if (vel[j].w <= 0.0) { continue; }
    if (atomParams[j].z == molI) { continue; } // skip same molecule

    let d = minImage(pi - pos[j].xyz, viz.box);
    let r2 = dot(d, d);
    if (r2 > viz.cutoff2 || r2 < 1e-8) { continue; }

    // --- Coulomb attraction (positive -> negative, emitted once) ---
    let qj = pos[j].w;
    if (qi > 0.0 && qj < 0.0) {
      let fmag = viz.coulombK * (-qi * qj) / r2; // attraction magnitude
      if (fmag >= viz.coulombThresh) {
        emit(i, j, fade(fmag, viz.coulombThresh), KIND_COULOMB);
      }
    }

    // --- Lennard-Jones attraction (emitted once, i < j) ---
    if (i < j) {
      let epsJ = atomParams[j].y;
      if (epsI > 0.0 && epsJ > 0.0) {
        let sig = 0.5 * (sigI + atomParams[j].x);
        let eps = sqrt(epsI * epsJ);
        let inv2 = (sig * sig) / r2;
        let inv6 = inv2 * inv2 * inv2;
        let inv12 = inv6 * inv6;
        // F/r = 24*eps*(2*inv12 - inv6)/r2 ; negative => net attraction.
        let fr = 24.0 * eps * (2.0 * inv12 - inv6) / r2;
        if (fr < 0.0) {
          let fmag2 = fr * fr * r2; // (|F/r| * r)^2 = attractive force mag^2
          if (fmag2 >= viz.ljThresh * viz.ljThresh) {
            emit(i, j, fade(sqrt(fmag2), viz.ljThresh), KIND_LJ);
          }
        }
      }
    }
  }
}
