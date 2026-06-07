// Thermostat step 2: Berendsen weak-coupling velocity rescale. Reads the total
// kinetic energy left in reduction[0], derives the instantaneous temperature,
// and nudges every velocity toward the target temperature. Disabled by a
// uniform flag (NVE when off).
//
// lambda = sqrt( 1 + (dt/tau) * (T0/T - 1) )

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (u.thermoOn == 0u) { return; }
  if (vel[i].w <= 0.0) { return; }

  let ke2 = reduction[0]; // sum m*v^2 = 2*KE
  let ndof = f32(3u * u.numAtoms - 3u);
  let temp = ke2 / (ndof * u.kB);
  if (temp <= 1.0) { return; }

  let ratio = u.targetT / temp;
  let lambda = sqrt(max(0.0, 1.0 + (u.dt / u.tau) * (ratio - 1.0)));

  vel[i] = vec4<f32>(vel[i].xyz * lambda, vel[i].w);
}
