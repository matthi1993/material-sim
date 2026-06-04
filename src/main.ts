// Wires the UI, engine, backend, and renderer together. This is the only place
// that knows about all the pieces at once.

import './ui/components/sim-app'
import { WebGPUBackend } from './sim/backend/WebGPUBackend'
import { SimulationEngine } from './sim/SimulationEngine'
import { Renderer } from './ui/renderer'
import { buildWaterSystem } from './sim/topology'
import { DEFAULT_RUNTIME, type SimConfig } from './sim/params'
import type { SimApp } from './ui/components/sim-app'

const app = document.querySelector<SimApp>('sim-app')!

let engine: SimulationEngine | null = null
let renderer: Renderer | null = null
let restarting = false
let currentRuntime = { ...DEFAULT_RUNTIME }

async function restart(config: SimConfig): Promise<void> {
  if (restarting) return
  restarting = true
  try {
    engine?.destroy()

    await app.updateComplete
    const canvas = app.canvas

    renderer = new Renderer(canvas)
    renderer.frameBox(config.box)

    const backend = new WebGPUBackend(canvas)
    engine = new SimulationEngine(backend)
    engine.setCameraProvider(() => renderer!.getCamera())
    engine.setStatsListener((s) => {
      app.stats = s
    })

    const { params, topology, initial } = buildWaterSystem(config)
    const runtime = {
      ...DEFAULT_RUNTIME,
      ...currentRuntime,
      targetTemperature: config.temperature,
    }
    currentRuntime = runtime

    await engine.start(params, topology, initial, runtime)
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
  const { stepsPerFrame } = (e as CustomEvent<{ stepsPerFrame: number }>).detail
  currentRuntime = { ...currentRuntime, stepsPerFrame }
  engine?.setRuntime(currentRuntime)
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
