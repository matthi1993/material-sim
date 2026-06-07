// Orchestrator. Owns the dispatch loop and run state. Talks to the GPU only
// through IGPUBackend and never touches WebGPU types directly. Contains no
// physics math — it only decides what runs and when.

import type { IGPUBackend } from './backend/IGPUBackend'
import { NeighborListManager } from './managers/NeighborListManager'
import { ThermostatManager } from './managers/ThermostatManager'
import type {
  CameraView,
  InitialState,
  RuntimeConfig,
  SimParams,
  SimStats,
  Topology,
  ViewOptions,
} from './types'

export type CameraProvider = () => CameraView
export type StatsListener = (stats: SimStats) => void

export class SimulationEngine {
  private readonly backend: IGPUBackend

  private params: SimParams | null = null
  private runtime: RuntimeConfig | null = null
  private neighborList: NeighborListManager | null = null
  private thermostat: ThermostatManager | null = null

  private running = false
  private loopActive = false
  private rafHandle = 0

  private cameraProvider: CameraProvider | null = null
  private statsListener: StatsListener | null = null

  // FPS tracking
  private lastFrameTime = 0
  private fps = 0

  // Infrequent temperature sampling (stats only, not in the hot loop)
  private framesSinceSample = 0
  private temperature = Number.NaN
  private sampling = false
  private simulatedTimePs = 0

  constructor(backend: IGPUBackend) {
    this.backend = backend
  }

  setCameraProvider(provider: CameraProvider): void {
    this.cameraProvider = provider
  }

  setStatsListener(listener: StatsListener): void {
    this.statsListener = listener
  }

  async start(
    params: SimParams,
    topology: Topology,
    initial: InitialState,
    runtime: RuntimeConfig,
  ): Promise<void> {
    this.params = params
    this.runtime = runtime
    this.neighborList = new NeighborListManager(params)
    this.thermostat = new ThermostatManager(runtime)

    await this.backend.initialize(params, topology, initial, runtime)
    this.backend.setThermostat(
      runtime.targetTemperature,
      runtime.thermostatEnabled,
    )
    this.backend.setBoundaryMode(runtime.boundaryMode)

    this.temperature = Number.NaN
    this.framesSinceSample = 0
    this.simulatedTimePs = 0
    this.loopActive = true
    this.running = true
    this.lastFrameTime = performance.now()
    this.loop()
  }

  setRuntime(runtime: RuntimeConfig): void {
    this.runtime = runtime
    this.thermostat?.update(runtime)
    this.backend.setThermostat(
      runtime.targetTemperature,
      runtime.thermostatEnabled,
    )
    this.backend.setBoundaryMode(runtime.boundaryMode)
  }

  /** Apply live display options (atom size, line opacity, overlay toggles). */
  setViewOptions(options: ViewOptions): void {
    this.backend.setViewOptions(options)
  }

  pause(): void {
    // Pause only stops simulation stepping; rendering continues for camera edits.
    this.running = false
  }

  resume(): void {
    if (this.running || !this.params) return
    this.running = true
    this.lastFrameTime = performance.now()
  }

  get isRunning(): boolean {
    return this.running
  }

  destroy(): void {
    this.loopActive = false
    this.running = false
    cancelAnimationFrame(this.rafHandle)
    this.backend.destroy()
  }

  private loop = (): void => {
    if (!this.loopActive || !this.runtime) return

    const now = performance.now()
    const dt = now - this.lastFrameTime
    this.lastFrameTime = now
    if (this.running && dt > 0) this.fps = 0.9 * this.fps + 0.1 * (1000 / dt)

    if (this.running) {
      // Tick the neighbor-list manager (no-op until a list is enabled).
      this.neighborList?.shouldRebuild()

      this.backend.stepSimulation(this.runtime.stepsPerFrame)
      this.simulatedTimePs += this.runtime.stepsPerFrame * this.params!.dt
      this.maybeSampleTemperature()
      this.emitStats()
    }

    if (this.cameraProvider) {
      this.backend.render(this.cameraProvider())
    }

    this.rafHandle = requestAnimationFrame(this.loop)
  }

  /** Read velocities occasionally for the temperature readout (diagnostics). */
  private maybeSampleTemperature(): void {
    if (this.sampling || !this.params) return
    if (++this.framesSinceSample < 30) return
    this.framesSinceSample = 0
    this.sampling = true
    void this.backend
      .readbackVelocities()
      .then((v) => {
        this.temperature = ThermostatManager.temperatureFrom(v)
      })
      .finally(() => {
        this.sampling = false
      })
  }

  private emitStats(): void {
    if (!this.statsListener || !this.params) return
    this.statsListener({
      fps: this.fps,
      numAtoms: this.params.numAtoms,
      temperature: this.temperature,
      simulatedTimePs: this.simulatedTimePs,
    })
  }
}
