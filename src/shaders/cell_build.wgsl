// Cell list, pass 2: bin every atom into its grid cell. One thread per atom.
// atomicAdd reserves a slot; atoms beyond the per-cell capacity are dropped
// (a rare, graceful degradation rather than a crash). Run after positions
// update and before the nonbonded force kernels read the list.

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= u.numAtoms) { return; }

  let c = cellCoord(pos[i].xyz);
  let idx = cellIndexWrapped(c);
  let slot = atomicAdd(&cellHead[idx], 1u);
  if (slot < u.cellCap) {
    cellAtoms[idx * u.cellCap + slot] = i;
  }
}
