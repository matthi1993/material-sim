// GPU interface contract. No WebGPU types appear here. Everything above the
// backend talks to the GPU only through this interface, which keeps the
// eventual C++/Dawn migration a matter of writing one new implementation.

import type {
  CameraView,
  InitialState,
  SimParams,
  Topology,
  ViewOptions,
} from '../types'

export interface IGPUBackend {
  /** Allocate buffers, build pipelines, upload initial state, compute a(t=0). */
  initialize(
    params: SimParams,
    topology: Topology,
    initial: InitialState,
  ): Promise<void>

  /** Advance the simulation by `steps` full timesteps. Fire-and-forget. */
  stepSimulation(steps: number): void

  /** Hot-swappable thermostat control (target temperature, on/off). */
  setThermostat(targetTemperature: number, enabled: boolean): void

  /** Live display controls (atom size, line opacity, overlay toggles). */
  setViewOptions(options: ViewOptions): void

  /** Draw the current state into the configured canvas. */
  render(camera: CameraView): void

  /** Debug/export only. Never call inside the simulation loop. */
  readbackPositions(): Promise<Float32Array>

  /** Debug/stats only. Returns (vx,vy,vz,mass) per atom. */
  readbackVelocities(): Promise<Float32Array>

  destroy(): void
}
