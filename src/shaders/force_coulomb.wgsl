// Coulomb nonbonded force with a hard cutoff (minimum image). One thread per
// atom; thread i accumulates into force[i] only, then ADDS to the buffer that
// force_lj initialized. Uses inverseSqrt (single instruction) rather than a
// full sqrt. Uses the GPU cell list when u.useCells == 1, else brute force.

// Coulomb force of atom i toward atom j. Returns zero for the same molecule,
// an uncharged partner, the same atom, or a pair beyond the cutoff.
fn coulombPair(pi: vec3<f32>, qi: f32, molI: f32, j: u32) -> vec3<f32> {
  if (atomParams[j].z == molI) { return vec3<f32>(0.0); } // exclude intramolecular
  let qj = pos[j].w;
  if (qj == 0.0) { return vec3<f32>(0.0); }

  let d = minImage(pi - pos[j].xyz);
  let r2 = dot(d, d);
  if (r2 > u.cutoff2 || r2 < 1e-8) { return vec3<f32>(0.0); }

  let invr = inverseSqrt(r2);
  // F = k*qi*qj/r^2 * (d/r) = k*qi*qj * d * invr^3
  let fmag = u.coulombK * qi * qj * invr * invr * invr;
  return fmag * d;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let pi = pos[i].xyz;
  let qi = pos[i].w;
  let molI = atomParams[i].z;

  var f = vec3<f32>(0.0, 0.0, 0.0);

  if (qi != 0.0) {
    if (u.useCells == 1u) {
      let ci = cellCoord(pi);
      for (var dz = -1; dz <= 1; dz = dz + 1) {
        for (var dy = -1; dy <= 1; dy = dy + 1) {
          for (var dx = -1; dx <= 1; dx = dx + 1) {
            let cidx = cellIndexWrapped(ci + vec3<i32>(dx, dy, dz));
            let cnt = min(atomicLoad(&cellHead[cidx]), u.cellCap);
            for (var s: u32 = 0u; s < cnt; s = s + 1u) {
              let j = cellAtoms[cidx * u.cellCap + s];
              f = f + coulombPair(pi, qi, molI, j);
            }
          }
        }
      }
    } else {
      for (var j: u32 = 0u; j < u.numAtoms; j = j + 1u) {
        f = f + coulombPair(pi, qi, molI, j);
      }
    }
  }

  force[i] = force[i] + vec4<f32>(f, 0.0);
}
