// Cell list, pass 1: reset the per-cell atom counters to zero. One thread per
// cell. Runs before cell_build each time the grid is rebuilt.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= numCells()) { return; }
  atomicStore(&cellHead[i], 0u);
}
