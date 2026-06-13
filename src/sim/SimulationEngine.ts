// Orchestrator. Owns the dispatch loop and run state. Talks to the GPU only
// through IGPUBackend and never touches WebGPU types directly. Contains no
// physics math — it only decides what runs and when.

import type { IGPUBackend } from './backend/IGPUBackend'
import { NeighborListManager } from './managers/NeighborListManager'
import { ThermostatManager } from './managers/ThermostatManager'
import { ELEMENTS } from './elements'
import type {
  Bond,
  CameraView,
  InitialState,
  RuntimeConfig,
  SimParams,
  SimStats,
  StructureEntry,
  Topology,
  ViewOptions,
} from './types'

export type CameraProvider = () => CameraView
export type StatsListener = (stats: SimStats) => void
export type StructureListener = (entries: StructureEntry[]) => void

const STRUCTURE_SAMPLE_EVERY_FRAMES = 15

interface ReactiveRule {
  maxBonds: number
  covalentRadius: number
}

const LEGEND_REACTIVE_RULES: Readonly<Record<number, ReactiveRule>> = {
  [ELEMENTS.H.id]: { maxBonds: 1, covalentRadius: 0.031 },
  [ELEMENTS.C.id]: { maxBonds: 4, covalentRadius: 0.076 },
  [ELEMENTS.O.id]: { maxBonds: 2, covalentRadius: 0.066 },
  [ELEMENTS.N.id]: { maxBonds: 3, covalentRadius: 0.071 },
  [ELEMENTS.Cl.id]: { maxBonds: 1, covalentRadius: 0.102 },
  [ELEMENTS.Br.id]: { maxBonds: 1, covalentRadius: 0.12 },
}

const LEGEND_CAPTURE_SCALE = 1.25

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
  private structureListener: StructureListener | null = null

  // FPS tracking
  private lastFrameTime = 0
  private fps = 0

  // Infrequent temperature sampling (stats only, not in the hot loop)
  private framesSinceSample = 0
  private framesSinceStructureSample = 0
  private temperature = Number.NaN
  private sampling = false
  private structureSampling = false
  private simulatedTimePs = 0
  private atomTypeIds: Int32Array | null = null
  private staticBonds: Bond[] = []

  constructor(backend: IGPUBackend) {
    this.backend = backend
  }

  setCameraProvider(provider: CameraProvider): void {
    this.cameraProvider = provider
  }

  setStatsListener(listener: StatsListener): void {
    this.statsListener = listener
  }

  setStructureListener(listener: StructureListener): void {
    this.structureListener = listener
  }

  async start(
    params: SimParams,
    topology: Topology,
    initial: InitialState,
    runtime: RuntimeConfig,
  ): Promise<void> {
    this.params = params
    this.runtime = runtime
    this.atomTypeIds = topology.atomTypeIds.slice()
    this.staticBonds = topology.bonds.slice()
    this.neighborList = new NeighborListManager(params)
    this.thermostat = new ThermostatManager(runtime)

    await this.backend.initialize(params, topology, initial, runtime)
    this.backend.setThermostat(
      runtime.targetTemperature,
      runtime.thermostatEnabled,
    )
    this.backend.setForceGuard(runtime.forceGuardEnabled)
    this.backend.setReactiveBonding(runtime.reactiveBondingEnabled)
    this.backend.setCutoffRadius(runtime.cutoffRadius)
    this.backend.setBoundaryMode(runtime.boundaryMode)

    this.temperature = Number.NaN
    this.framesSinceSample = 0
    this.framesSinceStructureSample = 0
    this.simulatedTimePs = 0
    this.structureSampling = false

    // Seed the legend immediately from static topology, then periodic updates
    // add reactive bonds as they form.
    if (this.structureListener && this.atomTypeIds) {
      this.structureListener(
        this.buildStructureSummary(
          params.numAtoms,
          this.atomTypeIds,
          this.staticBonds,
          new Uint32Array(0),
        ),
      )
    }
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
    this.backend.setForceGuard(runtime.forceGuardEnabled)
    this.backend.setReactiveBonding(runtime.reactiveBondingEnabled)
    this.backend.setCutoffRadius(runtime.cutoffRadius)
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

  async snapshotAtomState(): Promise<{
    positions: Float32Array
    velocities: Float32Array
    numAtoms: number
    simulatedTimePs: number
  } | null> {
    if (!this.params) return null
    const [positions, velocities] = await Promise.all([
      this.backend.readbackPositions(),
      this.backend.readbackVelocities(),
    ])
    return {
      positions,
      velocities,
      numAtoms: this.params.numAtoms,
      simulatedTimePs: this.simulatedTimePs,
    }
  }

  restoreSimulatedTime(simulatedTimePs: number): void {
    this.simulatedTimePs = Math.max(0, simulatedTimePs)
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
      this.maybeSampleStructures()
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

  private maybeSampleStructures(): void {
    if (this.structureSampling || !this.params || !this.atomTypeIds || !this.structureListener) return
    if (++this.framesSinceStructureSample < STRUCTURE_SAMPLE_EVERY_FRAMES) return
    this.framesSinceStructureSample = 0
    this.structureSampling = true
    void Promise.all([
      this.backend.readbackReactiveBondPairs().catch(() => new Uint32Array(0)),
      this.backend.readbackPositions().catch(() => null),
    ])
      .then(([pairs, positions]) => {
        let resolvedPairs = pairs
        if (this.runtime?.reactiveBondingEnabled && positions && resolvedPairs.length === 0) {
          resolvedPairs = this.inferReactivePairsFromPositions(positions, this.atomTypeIds!, this.staticBonds, this.params!)
        }
        const entries = this.buildStructureSummary(this.params!.numAtoms, this.atomTypeIds!, this.staticBonds, resolvedPairs)
        this.structureListener?.(entries)
      })
      .finally(() => {
        this.structureSampling = false
      })
  }

  private inferReactivePairsFromPositions(
    positions: Float32Array,
    atomTypeIds: Int32Array,
    staticBonds: Bond[],
    params: SimParams,
  ): Uint32Array {
    const n = params.numAtoms
    const existing = new Set<string>()
    const bondCounts = new Uint8Array(n)
    for (const b of staticBonds) {
      const i = Math.min(b.i, b.j)
      const j = Math.max(b.i, b.j)
      existing.add(`${i}:${j}`)
      if (b.i >= 0 && b.i < n) bondCounts[b.i]++
      if (b.j >= 0 && b.j < n) bondCounts[b.j]++
    }

    const candidates: Array<{ i: number; j: number; score: number }> = []
    for (let i = 0; i < n; i++) {
      const ri = LEGEND_REACTIVE_RULES[atomTypeIds[i]]
      if (!ri || bondCounts[i] >= ri.maxBonds) continue
      for (let j = i + 1; j < n; j++) {
        const rj = LEGEND_REACTIVE_RULES[atomTypeIds[j]]
        if (!rj || bondCounts[j] >= rj.maxBonds) continue
        if (existing.has(`${i}:${j}`)) continue

        let dx = positions[i * 4 + 0] - positions[j * 4 + 0]
        let dy = positions[i * 4 + 1] - positions[j * 4 + 1]
        let dz = positions[i * 4 + 2] - positions[j * 4 + 2]
        if (this.runtime?.boundaryMode === 'periodic' || this.runtime?.boundaryMode === 'open-top') {
          dx -= params.box[0] * Math.round(dx / params.box[0])
          dz -= params.box[2] * Math.round(dz / params.box[2])
          if (this.runtime?.boundaryMode === 'periodic') {
            dy -= params.box[1] * Math.round(dy / params.box[1])
          }
        }

        const r2 = dx * dx + dy * dy + dz * dz
        if (r2 < 1e-10) continue
        const cov = ri.covalentRadius + rj.covalentRadius
        const rMax = cov * LEGEND_CAPTURE_SCALE
        if (r2 > rMax * rMax) continue
        candidates.push({ i, j, score: r2 / (cov * cov) })
      }
    }

    candidates.sort((a, b) => a.score - b.score)
    const out: number[] = []
    for (const c of candidates) {
      const ri = LEGEND_REACTIVE_RULES[atomTypeIds[c.i]]
      const rj = LEGEND_REACTIVE_RULES[atomTypeIds[c.j]]
      if (!ri || !rj) continue
      if (bondCounts[c.i] >= ri.maxBonds || bondCounts[c.j] >= rj.maxBonds) continue
      bondCounts[c.i]++
      bondCounts[c.j]++
      out.push(c.i, c.j)
    }
    return Uint32Array.from(out)
  }

  private buildStructureSummary(
    numAtoms: number,
    atomTypeIds: Int32Array,
    staticBonds: Bond[],
    reactivePairs: Uint32Array,
  ): StructureEntry[] {
    const parent = new Int32Array(numAtoms)
    const rank = new Uint8Array(numAtoms)
    for (let i = 0; i < numAtoms; i++) parent[i] = i

    const find = (x: number): number => {
      let root = x
      while (parent[root] !== root) root = parent[root]
      while (parent[x] !== x) {
        const p = parent[x]
        parent[x] = root
        x = p
      }
      return root
    }

    const unite = (a: number, b: number): void => {
      let ra = find(a)
      let rb = find(b)
      if (ra === rb) return
      if (rank[ra] < rank[rb]) {
        const t = ra
        ra = rb
        rb = t
      }
      parent[rb] = ra
      if (rank[ra] === rank[rb]) rank[ra]++
    }

    for (const bond of staticBonds) {
      if (bond.i >= 0 && bond.i < numAtoms && bond.j >= 0 && bond.j < numAtoms) unite(bond.i, bond.j)
    }
    for (let i = 0; i + 1 < reactivePairs.length; i += 2) {
      const a = reactivePairs[i]
      const b = reactivePairs[i + 1]
      if (a < numAtoms && b < numAtoms) unite(a, b)
    }

    const symbolById = new Map<number, string>()
    for (const element of Object.values(ELEMENTS)) symbolById.set(element.id, element.symbol)

    const componentCounts = new Map<number, Map<string, number>>()
    for (let atom = 0; atom < numAtoms; atom++) {
      const root = find(atom)
      const symbol = symbolById.get(atomTypeIds[atom]) ?? '?'
      const formula = componentCounts.get(root)
      if (formula) formula.set(symbol, (formula.get(symbol) ?? 0) + 1)
      else componentCounts.set(root, new Map([[symbol, 1]]))
    }

    const formulaCounts = new Map<string, number>()
    const formulaKinds = new Map<string, 'molecule' | 'atom'>()
    for (const symbolMap of componentCounts.values()) {
      const label = this.formatFormula(symbolMap)
      formulaCounts.set(label, (formulaCounts.get(label) ?? 0) + 1)
      const atomTotal = [...symbolMap.values()].reduce((s, v) => s + v, 0)
      formulaKinds.set(label, atomTotal > 1 ? 'molecule' : 'atom')
    }

    return [...formulaCounts.entries()]
      .map(([name, count]) => ({
        name,
        count,
        kind: formulaKinds.get(name) ?? 'atom',
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  }

  private formatFormula(counts: Map<string, number>): string {
    const symbols = [...counts.keys()]
    const hasC = counts.has('C')
    const ordered: string[] = []
    if (hasC) {
      ordered.push('C')
      if (counts.has('H')) ordered.push('H')
      for (const s of symbols.filter((s) => s !== 'C' && s !== 'H').sort((a, b) => a.localeCompare(b))) {
        ordered.push(s)
      }
    } else {
      ordered.push(...symbols.sort((a, b) => a.localeCompare(b)))
    }

    let out = ''
    for (const s of ordered) {
      const n = counts.get(s) ?? 0
      if (n <= 0) continue
      out += s
      if (n > 1) out += String(n)
    }
    return out || '?'
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
