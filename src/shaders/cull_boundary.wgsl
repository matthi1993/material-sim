// Boundary cleanup pass. Marks atoms outside the active domain as dead by
// zeroing their mass/charge/LJ params and pushing them far off-screen.

fn shouldCull(p: vec3<f32>) -> bool {
  switch (u.boundaryMode) {
    case 0u: {
      return any(p < vec3<f32>(0.0)) || any(p >= u.box);
    }
    case 2u: {
      return p.y < 0.0 || p.x < 0.0 || p.x >= u.box.x || p.z < 0.0 || p.z >= u.box.z;
    }
    default: {
      return false;
    }
  }
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }
  if (vel[i].w <= 0.0) { return; }
  if (!shouldCull(pos[i].xyz)) { return; }

  pos[i] = vec4<f32>(vec3<f32>(1e9), 0.0);
  vel[i] = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  force[i] = vec4<f32>(0.0);
  atomParams[i] = vec4<f32>(0.0, 0.0, -1.0, atomParams[i].w);
}