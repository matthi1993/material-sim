// Thermostat step 1: reduce total kinetic energy (actually 2*KE = sum m*v^2)
// into reduction[0]. Single workgroup, grid-stride load + shared-memory tree
// reduction. Runs entirely on the GPU — no readback.

var<workgroup> partial: array<f32, 256>;

@compute @workgroup_size(256)
fn main(@builtin(local_invocation_id) lid: vec3<u32>) {
  let t = lid.x;

  var sum = 0.0;
  var i = t;
  loop {
    if (i >= u.numAtoms) { break; }
    let v = vel[i].xyz;
    let m = vel[i].w;
    sum = sum + m * dot(v, v);
    i = i + 256u;
  }
  partial[t] = sum;
  workgroupBarrier();

  var stride = 128u;
  loop {
    if (t < stride) {
      partial[t] = partial[t] + partial[t + stride];
    }
    workgroupBarrier();
    if (stride == 1u) { break; }
    stride = stride >> 1u;
  }

  if (t == 0u) {
    reduction[0] = partial[0];
  }
}
