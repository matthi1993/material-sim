// Lennard-Jones nonbonded force. One thread per atom; thread i writes force[i]
// only, so no atomics are needed. This kernel INITIALIZES the force buffer.
// O(N^2) with a hard cutoff (allowed). Swap in a neighbor list later.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let pi = pos[i].xyz;
  let api = atomParams[i];
  let sigI = api.x;
  let epsI = api.y;
  let molI = api.z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (epsI > 0.0) {
    for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
      if (j == i) { continue; }
      let apj = atomParams[j];
      if (apj.z == molI) { continue; } // exclude intramolecular
      if (apj.y <= 0.0) { continue; }  // partner has no LJ site

      let d = minImage(pi - pos[j].xyz);
      let r2 = dot(d, d);
      if (r2 > u.cutoff2 || r2 < 1e-8) { continue; }

      // Lorentz-Berthelot combining rules.
      let sig = 0.5 * (sigI + apj.x);
      let eps = sqrt(epsI * apj.y);
      let sig2 = sig * sig;
      let inv2 = sig2 / r2;
      let inv6 = inv2 * inv2 * inv2;
      let inv12 = inv6 * inv6;
      // F/r = 24*eps*(2*inv12 - inv6)/r2 ; multiply by d for the vector.
      let fmag = 24.0 * eps * (2.0 * inv12 - inv6) / r2;
      f = f + fmag * d;
    }
  }

  force[i] = vec4<f32>(f, 0.0);
}
