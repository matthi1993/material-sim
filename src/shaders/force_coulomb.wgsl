// Coulomb nonbonded force with a hard cutoff (minimum image). One thread per
// atom; thread i accumulates into force[i] only, then ADDS to the buffer that
// force_lj initialized. Uses inverseSqrt (single instruction) rather than a
// full sqrt; r is genuinely required for the 1/r^2 law.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let pi = pos[i].xyz;
  let qi = pos[i].w;
  let molI = atomParams[i].z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (qi != 0.0) {
    for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
      if (j == i) { continue; }
      if (atomParams[j].z == molI) { continue; } // exclude intramolecular

      let qj = pos[j].w;
      if (qj == 0.0) { continue; }

      let d = minImage(pi - pos[j].xyz);
      let r2 = dot(d, d);
      if (r2 > u.cutoff2 || r2 < 1e-8) { continue; }

      let invr = inverseSqrt(r2);
      // F = k*qi*qj/r^2 * (d/r) = k*qi*qj * d * invr^3
      let fmag = u.coulombK * qi * qj * invr * invr * invr;
      f = f + fmag * d;
    }
  }

  force[i] = force[i] + vec4<f32>(f, 0.0);
}
