// Velocity Verlet, first half: kick velocities by half a step using the forces
// currently in the buffer (a(t)), drift positions a full step, then wrap into
// the periodic box. Mass is stored in vel.w.

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

  var v = vel[i].xyz + (0.5 * u.dt * invm) * force[i].xyz;
  var p = pos[i].xyz + u.dt * v;

  if (u.boundaryMode == 0u) {
    p = p - u.box * floor(p / u.box);
  } else if (u.boundaryMode == 2u) {
    p.x = p.x - u.box.x * floor(p.x / u.box.x);
    p.z = p.z - u.box.z * floor(p.z / u.box.z);
  }

  pos[i] = vec4<f32>(p, pos[i].w);
  vel[i] = vec4<f32>(v, mass);
}
