// Generic intramolecular (bonded) forces. One thread per MOLECULE owns every
// atom referenced by its bonds and angles. Molecules are laid out contiguously
// and never share atoms, so harmonic bonds and angles accumulate without
// atomics or races. Bond/angle atom indices are GLOBAL. This kernel ADDS to the
// force buffer after the nonbonded passes. Per-molecule ranges into the flat
// bond / angle lists come from molRanges (group 1). Shared bindings (u, pos,
// force, minImage) come from _common.wgsl (group 0).

struct MolBond {
  ij  : vec2<u32>, // atom i, atom j
  par : vec2<f32>, // r0 (nm), k (kJ/mol/nm^2)
};

struct MolAngle {
  idx : vec4<u32>, // i, j (central atom), k, _pad
  par : vec4<f32>, // theta0 (rad), kTheta (kJ/mol/rad^2), _, _
};

// (bondStart, bondCount, angleStart, angleCount) per bonded molecule.
@group(1) @binding(0) var<storage, read> molRanges: array<vec4<u32>>;
@group(1) @binding(1) var<storage, read> molBonds: array<MolBond>;
@group(1) @binding(2) var<storage, read> molAngles: array<MolAngle>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let m = gid.x;
  if (m >= u.numMol) { return; }

  let range = molRanges[m];
  let bondStart = range.x;
  let bondCount = range.y;
  let angleStart = range.z;
  let angleCount = range.w;

  // --- Harmonic bonds ---
  for (var bi: u32 = 0u; bi < bondCount; bi = bi + 1u) {
    let b = molBonds[bondStart + bi];
    let i = b.ij.x;
    let j = b.ij.y;
    if (vel[i].w <= 0.0 || vel[j].w <= 0.0) { continue; }
    let r0 = b.par.x;
    let kb = b.par.y;

    let d = minImage(pos[j].xyz - pos[i].xyz); // i -> j
    let r = length(d);
    let inv = 1.0 / r;
    let fb = -kb * (r - r0); // F = -dV/dr
    let fv = (fb * inv) * d;
    force[j] = force[j] + vec4<f32>(fv, 0.0);
    force[i] = force[i] - vec4<f32>(fv, 0.0);
  }

  // --- Harmonic angles (central atom j) ---
  for (var ai: u32 = 0u; ai < angleCount; ai = ai + 1u) {
    let an = molAngles[angleStart + ai];
    let i = an.idx.x;
    let jc = an.idx.y;
    let kk = an.idx.z;
    if (vel[i].w <= 0.0 || vel[jc].w <= 0.0 || vel[kk].w <= 0.0) { continue; }
    let theta0 = an.par.x;
    let ka = an.par.y;

    let a = minImage(pos[i].xyz - pos[jc].xyz);  // center -> i
    let b = minImage(pos[kk].xyz - pos[jc].xyz); // center -> k
    let ra = length(a);
    let rb = length(b);
    let inva = 1.0 / ra;
    let invb = 1.0 / rb;
    let c = clamp(dot(a, b) * inva * invb, -0.9999, 0.9999);
    let theta = acos(c);
    let s = sqrt(1.0 - c * c);
    let dV = ka * (theta - theta0); // dV/dtheta
    let coef = dV / s;
    let gi = coef * (b * (inva * invb) - c * a * (inva * inva));
    let gk = coef * (a * (inva * invb) - c * b * (invb * invb));
    force[i] = force[i] + vec4<f32>(gi, 0.0);
    force[kk] = force[kk] + vec4<f32>(gk, 0.0);
    force[jc] = force[jc] - vec4<f32>(gi + gk, 0.0);
  }
}
