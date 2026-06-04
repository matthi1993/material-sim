// Intramolecular (bonded) forces for the 3-site water layout: atoms are stored
// molecule-major as [O, H, H]. One thread per MOLECULE owns its 3 atoms, so the
// two O-H harmonic bonds and the H-O-H harmonic angle are accumulated without
// atomics or races. ADDS to the force buffer after the nonbonded passes.
//
// EXTENSION: for arbitrary topologies (AMBER proteins, polymers) replace this
// with a per-bond / per-angle kernel using atomic float accumulation. The
// engine layer is already topology-driven; only this kernel assumes water.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let m = gid.x;
  if (m >= u.numMol) { return; }

  let o  = m * 3u;
  let h1 = o + 1u;
  let h2 = o + 2u;

  let po = pos[o].xyz;
  let p1 = pos[h1].xyz;
  let p2 = pos[h2].xyz;

  var fo = vec3<f32>(0.0, 0.0, 0.0);
  var f1 = vec3<f32>(0.0, 0.0, 0.0);
  var f2 = vec3<f32>(0.0, 0.0, 0.0);

  // --- Bond O-H1 ---
  {
    let d = minImage(p1 - po);          // O -> H1
    let r = length(d);
    let inv = 1.0 / r;
    let fb = -u.kb * (r - u.r0);         // dV/dr = kb*(r-r0); F = -dV/dr
    let fv = (fb * inv) * d;
    f1 = f1 + fv;
    fo = fo - fv;
  }

  // --- Bond O-H2 ---
  {
    let d = minImage(p2 - po);          // O -> H2
    let r = length(d);
    let inv = 1.0 / r;
    let fb = -u.kb * (r - u.r0);
    let fv = (fb * inv) * d;
    f2 = f2 + fv;
    fo = fo - fv;
  }

  // --- Angle H1-O-H2 (central atom O) ---
  {
    let a = minImage(p1 - po);          // O -> H1
    let b = minImage(p2 - po);          // O -> H2
    let ra = length(a);
    let rb = length(b);
    let inva = 1.0 / ra;
    let invb = 1.0 / rb;
    let c = clamp(dot(a, b) * inva * invb, -0.9999, 0.9999);
    let theta = acos(c);
    let s = sqrt(1.0 - c * c);
    let dV = u.ka * (theta - u.theta0);  // dV/dtheta
    let coef = dV / s;
    // F_i = (dV/sin) * d(cos)/dr_i
    let g1 = coef * (b * (inva * invb) - c * a * (inva * inva));
    let g2 = coef * (a * (inva * invb) - c * b * (invb * invb));
    f1 = f1 + g1;
    f2 = f2 + g2;
    fo = fo - (g1 + g2);
  }

  force[o]  = force[o]  + vec4<f32>(fo, 0.0);
  force[h1] = force[h1] + vec4<f32>(f1, 0.0);
  force[h2] = force[h2] + vec4<f32>(f2, 0.0);
}
