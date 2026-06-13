// Wires the UI, engine, backend, and renderer together. This is the only place
// that knows about all the pieces at once.

import './ui/components/sim-app'
import { WebGPUBackend } from './sim/backend/WebGPUBackend'
import { SimulationEngine } from './sim/SimulationEngine'
import { Renderer, type AxisKey, type ProjectionMode } from './ui/renderer'
import { buildSystem } from './sim/topology'
import { DEFAULT_RUNTIME, DEFAULT_VIEW, type SimConfig } from './sim/params'
import type { StructureEntry, ViewOptions } from './sim/types'
import {
  isSavedSimulationFile,
  type SavedAtomState,
  type SavedSimulationFile,
} from './sim/persistence'
import type { SimApp } from './ui/components/sim-app'

const app = document.querySelector<SimApp>('sim-app')!

let engine: SimulationEngine | null = null
let renderer: Renderer | null = null
let restarting = false
let currentRuntime = { ...DEFAULT_RUNTIME }
let currentView: ViewOptions = { ...DEFAULT_VIEW }
let currentProjection: ProjectionMode = 'perspective'
let currentConfig: SimConfig | null = null
let currentStructureEntries: StructureEntry[] = []

app.stepsPerFrame = currentRuntime.stepsPerFrame
app.boundaryMode = currentRuntime.boundaryMode
app.targetTemperature = currentRuntime.targetTemperature
app.thermostatEnabled = currentRuntime.thermostatEnabled
app.forceGuardEnabled = currentRuntime.forceGuardEnabled
app.reactiveBondingEnabled = currentRuntime.reactiveBondingEnabled
app.cutoffRadius = currentRuntime.cutoffRadius

// Let the orientation gizmo read the live camera frame each frame.
app.basisProvider = () => renderer?.getBasis() ?? null

async function restart(config: SimConfig, atomState?: SavedAtomState): Promise<void> {
  if (restarting) return
  restarting = true
  try {
    engine?.destroy()

    await app.updateComplete
    const canvas = app.canvas

    renderer = new Renderer(canvas)
    renderer.frameBox(config.box)
    renderer.setProjection(currentProjection)

    const backend = new WebGPUBackend(canvas)
    engine = new SimulationEngine(backend)
    engine.setCameraProvider(() => renderer!.getCamera())
    engine.setStatsListener((s) => {
      app.stats = s
    })
    engine.setStructureListener((entries) => {
      currentStructureEntries = entries
      app.legendEntries = entries
    })

    const { params, topology, initial } = buildSystem(config, currentRuntime.cutoffRadius)
    if (atomState) {
      const expectedLength = params.numAtoms * 4
      if (atomState.numAtoms !== params.numAtoms) {
        throw new Error('Saved atom state does not match the current configuration (atom count mismatch).')
      }
      if (
        atomState.positions.length !== expectedLength ||
        atomState.velocities.length !== expectedLength
      ) {
        throw new Error('Saved atom state has invalid array sizes.')
      }
      initial.positions = new Float32Array(atomState.positions)
      initial.velocities = new Float32Array(atomState.velocities)
    }
    const runtime = {
      ...DEFAULT_RUNTIME,
      ...currentRuntime,
      targetTemperature: config.temperature,
    }
    currentRuntime = runtime
    app.stepsPerFrame = currentRuntime.stepsPerFrame
    app.boundaryMode = currentRuntime.boundaryMode
    app.targetTemperature = currentRuntime.targetTemperature
    app.thermostatEnabled = currentRuntime.thermostatEnabled
    app.forceGuardEnabled = currentRuntime.forceGuardEnabled
    app.reactiveBondingEnabled = currentRuntime.reactiveBondingEnabled
    app.cutoffRadius = currentRuntime.cutoffRadius

    await engine.start(params, topology, initial, runtime)
    if (atomState) {
      engine.restoreSimulatedTime(atomState.simulatedTimePs)
    }
    engine.setViewOptions(currentView)
    currentConfig = cloneConfig(config)
    app.activeConfig = cloneConfig(config)
    app.legendEntries = currentStructureEntries
    app.running = true
  } catch (err) {
    console.error('Simulation failed to start:', err)
    showFatal(err)
  } finally {
    restarting = false
  }
}

app.addEventListener('config-change', (e) => {
  void restart((e as CustomEvent<SimConfig>).detail)
})

app.addEventListener('file-save', async () => {
  if (!currentConfig) return

  const snapshot = await engine?.snapshotAtomState()
  const atomState: SavedAtomState | undefined = snapshot
    ? {
        numAtoms: snapshot.numAtoms,
        simulatedTimePs: snapshot.simulatedTimePs,
        positions: Array.from(snapshot.positions),
        velocities: Array.from(snapshot.velocities),
      }
    : undefined

  const payload: SavedSimulationFile = {
    version: 1,
    savedAt: new Date().toISOString(),
    config: cloneConfig(currentConfig),
    atomState,
    runtime: { ...currentRuntime },
    view: { ...currentView },
    projection: currentProjection,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `simulation-${new Date().toISOString().replaceAll(':', '-')}.json`
  link.click()
  URL.revokeObjectURL(objectUrl)
})

app.addEventListener('file-load', (event) => {
  const payload = (event as CustomEvent<unknown>).detail
  if (!isSavedSimulationFile(payload)) {
    showFatal('Invalid simulation file format')
    return
  }

  if (payload.runtime) {
    currentRuntime = { ...currentRuntime, ...payload.runtime }
    app.stepsPerFrame = currentRuntime.stepsPerFrame
    app.boundaryMode = currentRuntime.boundaryMode
    app.targetTemperature = currentRuntime.targetTemperature
    app.thermostatEnabled = currentRuntime.thermostatEnabled
    app.forceGuardEnabled = currentRuntime.forceGuardEnabled
    app.reactiveBondingEnabled = currentRuntime.reactiveBondingEnabled
    app.cutoffRadius = currentRuntime.cutoffRadius
    engine?.setRuntime(currentRuntime)
  }

  if (payload.view) {
    currentView = { ...currentView, ...payload.view }
    engine?.setViewOptions(currentView)
  }

  if (payload.projection) {
    currentProjection = payload.projection
    renderer?.setProjection(currentProjection)
  }

  void restart(payload.config, payload.atomState)
})

app.addEventListener('file-load-error', (event) => {
  const message = (event as CustomEvent<string>).detail
  showFatal(`Could not read simulation file: ${message}`)
})

app.addEventListener('runtime-change', (e) => {
  const patch = (e as CustomEvent<Partial<typeof currentRuntime>>).detail
  currentRuntime = { ...currentRuntime, ...patch }
  app.stepsPerFrame = currentRuntime.stepsPerFrame
  app.boundaryMode = currentRuntime.boundaryMode
  app.targetTemperature = currentRuntime.targetTemperature
  app.thermostatEnabled = currentRuntime.thermostatEnabled
  app.forceGuardEnabled = currentRuntime.forceGuardEnabled
  app.reactiveBondingEnabled = currentRuntime.reactiveBondingEnabled
  app.cutoffRadius = currentRuntime.cutoffRadius
  engine?.setRuntime(currentRuntime)
})

app.addEventListener('view-change', (e) => {
  currentView = { ...currentView, ...(e as CustomEvent<Partial<ViewOptions>>).detail }
  engine?.setViewOptions(currentView)
})

app.addEventListener('camera-axis', (e) => {
  renderer?.snapToAxis((e as CustomEvent<AxisKey>).detail)
})

app.addEventListener('projection-change', (e) => {
  currentProjection = (e as CustomEvent<ProjectionMode>).detail
  renderer?.setProjection(currentProjection)
})

app.addEventListener('toggle-run', () => {
  if (!engine) return
  if (engine.isRunning) {
    engine.pause()
    app.running = false
  } else {
    engine.resume()
    app.running = true
  }
})

window.addEventListener('resize', () => renderer?.resize())

function showFatal(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  const div = document.createElement('div')
  div.textContent = `Could not start the simulation: ${msg}`
  div.style.cssText =
    'position:fixed;bottom:16px;left:16px;right:16px;padding:12px 16px;' +
    'background:#3a1d1d;color:#ffd7d7;border:1px solid #6b2b2b;' +
    'border-radius:8px;font-family:system-ui;z-index:10'
  document.body.appendChild(div)
}

function cloneConfig(config: SimConfig): SimConfig {
  return {
    components: config.components.map((component) => ({ ...component })),
    box: [config.box[0], config.box[1], config.box[2]],
    dt: config.dt,
    temperature: config.temperature,
  }
}
