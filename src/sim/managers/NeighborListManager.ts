// Neighbor-list management. The water MVP uses a brute-force O(N^2) force kernel
// with a hard cutoff, which is correct and fast enough for a few thousand
// atoms. This manager is the seam where a cell-list / Verlet neighbor list will
// plug in (rebuilt every ~20 steps) without touching the engine or the UI.

import type { SimParams } from '../types'

export class NeighborListManager {
  private rebuildInterval = 20
  private stepsSinceRebuild = 0
  private enabled = false

  constructor(_params: SimParams) {
    // Reserved: allocate cell-list buffers from params.box / cutoffRadius.
  }

  /** Returns true when the neighbor list should be rebuilt this step. */
  shouldRebuild(): boolean {
    if (!this.enabled) return false
    if (this.stepsSinceRebuild >= this.rebuildInterval) {
      this.stepsSinceRebuild = 0
      return true
    }
    this.stepsSinceRebuild++
    return false
  }
}
