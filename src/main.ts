// Wires the UI, engine, backend, and renderer together. This is the only place
// that knows about all the pieces at once.

import './ui/components/sim-app'
import { WebGPUBackend } from './sim/backend/WebGPUBackend'
import { SimulationEngine } from './sim/SimulationEngine'
import { Renderer, type AxisKey, type ProjectionMode } from './ui/renderer'
import { buildSystem } from './sim/topology'
import { DEFAULT_RUNTIME, DEFAULT_VIEW, type SimConfig } from './sim/params'
import type { ViewOptions } from './sim/types'
import type { SimApp } from './ui/components/sim-app'

const app = document.querySelector<SimApp>('sim-app')!

let engine: SimulationEngine | null = null
let renderer: Renderer | null = null
let restarting = false
let currentRuntime = { ...DEFAULT_RUNTIME }
let currentView: ViewOptions = { ...DEFAULT_VIEW }
let currentProjection: ProjectionMode = 'orthographic'

app.stepsPerFrame = currentRuntime.stepsPerFrame
app.boundaryMode = currentRuntime.boundaryMode
app.targetTemperature = currentRuntime.targetTemperature
app.thermostatEnabled = currentRuntime.thermostatEnabled

// Let the orientation gizmo read the live camera frame each frame.
app.basisProvider = () => renderer?.getBasis() ?? null

async function restart(config: SimConfig): Promise<void> {
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

    const { params, topology, initial } = buildSystem(config)
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

    await engine.start(params, topology, initial, runtime)
    engine.setViewOptions(currentView)
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

app.addEventListener('runtime-change', (e) => {
  const patch = (e as CustomEvent<Partial<typeof currentRuntime>>).detail
  currentRuntime = { ...currentRuntime, ...patch }
  app.stepsPerFrame = currentRuntime.stepsPerFrame
  app.boundaryMode = currentRuntime.boundaryMode
  app.targetTemperature = currentRuntime.targetTemperature
  app.thermostatEnabled = currentRuntime.thermostatEnabled
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
