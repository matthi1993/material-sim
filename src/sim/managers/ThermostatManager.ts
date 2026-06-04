// Thermostat management. The MVP runs NVE (energy-conserving) with velocities
// seeded from a Maxwell-Boltzmann distribution at the target temperature, so no
// thermostat is required to get a stable, physical run. This manager is the
// seam for a Berendsen / velocity-rescale / Nose-Hoover thermostat later. A GPU
// implementation will reduce kinetic energy on-device and rescale velocities in
// a kernel — never via per-step CPU readback.

import { KB } from '../params'
import type { RuntimeConfig } from '../types'

export class ThermostatManager {
  private config: RuntimeConfig

  constructor(config: RuntimeConfig) {
    this.config = config
  }

  update(config: RuntimeConfig): void {
    this.config = config
  }

  get enabled(): boolean {
    return this.config.thermostatEnabled
  }

  /** Instantaneous temperature from kinetic energy (stats/diagnostics only). */
  static temperatureFrom(velocities: Float32Array): number {
    const n = velocities.length / 4
    let ke2 = 0 // 2 * kinetic energy
    for (let i = 0; i < n; i++) {
      const vx = velocities[i * 4 + 0]
      const vy = velocities[i * 4 + 1]
      const vz = velocities[i * 4 + 2]
      const m = velocities[i * 4 + 3]
      ke2 += m * (vx * vx + vy * vy + vz * vz)
    }
    const ndof = Math.max(1, 3 * n - 3)
    return ke2 / (ndof * KB)
  }
}
