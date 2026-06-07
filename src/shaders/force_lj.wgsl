// Lennard-Jones nonbonded force. One thread per atom; thread i writes force[i]
// only, so no atomics are needed. This kernel INITIALIZES the force buffer.
// Uses the GPU cell list (linked cells) when u.useCells == 1 — O(N) — and falls
// back to a brute-force O(N^2) scan with a hard cutoff otherwise (small boxes).

// Lorentz-Berthelot combined LJ force of atom i toward atom j (returns vec3).
// Returns zero for the same molecule, a partner without an LJ site, the same
// atom (r2 ~ 0), or a pair beyond the cutoff.
fn ljPair(pi: vec3<f32>, sigI: f32, epsI: f32, molI: f32, j: u32) -> vec3<f32> {
  if (vel[j].w <= 0.0) { return vec3<f32>(0.0); }
  let apj = atomParams[j];
  if (apj.z == molI) { return vec3<f32>(0.0); } // exclude intramolecular
  if (apj.y <= 0.0) { return vec3<f32>(0.0); }   // partner has no LJ site

  let d = minImage(pi - pos[j].xyz);
  let r2 = dot(d, d);
  if (r2 > u.cutoff2 || r2 < 1e-8) { return vec3<f32>(0.0); }

  let sig = 0.5 * (sigI + apj.x);
  let eps = sqrt(epsI * apj.y);
  let sig2 = sig * sig;
  let inv2 = sig2 / r2;
  let inv6 = inv2 * inv2 * inv2;
  let inv12 = inv6 * inv6;
  // F/r = 24*eps*(2*inv12 - inv6)/r2 ; multiply by d for the vector.
  let fmag = 24.0 * eps * (2.0 * inv12 - inv6) / r2;
  return fmag * d;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (vel[i].w <= 0.0) {
    force[i] = vec4<f32>(0.0);
    return;
  }

  let pi = pos[i].xyz;
  let api = atomParams[i];
  let sigI = api.x;
  let epsI = api.y;
  let molI = api.z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (epsI > 0.0) {
    if (u.useCells == 1u) {
      let ci = cellCoord(pi);
      for (var dz = -1; dz <= 1; dz = dz + 1) {
        for (var dy = -1; dy <= 1; dy = dy + 1) {
          for (var dx = -1; dx <= 1; dx = dx + 1) {
            let cidx = cellIndexWrapped(ci + vec3<i32>(dx, dy, dz));
            let cnt = min(atomicLoad(&cellHead[cidx]), u.cellCap);
            for (var s: u32 = 0u; s < cnt; s = s + 1u) {
              let j = cellAtoms[cidx * u.cellCap + s];
              f = f + ljPair(pi, sigI, epsI, molI, j);
            }
          }
        }
      }
    } else {
      for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
        f = f + ljPair(pi, sigI, epsI, molI, j);
      }
    }
  }

  force[i] = vec4<f32>(f, 0.0);
}
