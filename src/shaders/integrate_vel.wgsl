// Velocity Verlet, second half: after forces have been recomputed for the new
// positions (a(t+dt)), kick velocities by the remaining half step.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let mass = vel[i].w;
  if (mass <= 0.0) {
    force[i] = vec4<f32>(0.0);
    return;
  }
  let invm = select(0.0, 1.0 / mass, mass > 0.0);

  let v = vel[i].xyz + (0.5 * u.dt * invm) * force[i].xyz;
  vel[i] = vec4<f32>(v, mass);
}
