// The ONLY file allowed to import WebGPU types. Owns the device, buffers,
// pipelines, and both the compute (physics) and render passes. Contains zero
// physics math itself — all of that lives in the WGSL kernels.

import type { IGPUBackend } from './IGPUBackend'
import type {
  Bond,
  BoundaryMode,
  CameraView,
  InitialState,
  RuntimeConfig,
  SimParams,
  Topology,
  ViewOptions,
} from '../types'

import commonWgsl from '../../shaders/_common.wgsl?raw'
import ljWgsl from '../../shaders/force_lj.wgsl?raw'
import coulombWgsl from '../../shaders/force_coulomb.wgsl?raw'
import bondedWgsl from '../../shaders/force_bonded.wgsl?raw'
import integratePosWgsl from '../../shaders/integrate_pos.wgsl?raw'
import integrateVelWgsl from '../../shaders/integrate_vel.wgsl?raw'
import cullBoundaryWgsl from '../../shaders/cull_boundary.wgsl?raw'
import thermoReduceWgsl from '../../shaders/thermostat_reduce.wgsl?raw'
import thermoScaleWgsl from '../../shaders/thermostat_scale.wgsl?raw'
import cellClearWgsl from '../../shaders/cell_clear.wgsl?raw'
import cellBuildWgsl from '../../shaders/cell_build.wgsl?raw'
import renderWgsl from '../../shaders/render.wgsl?raw'
import bondWgsl from '../../shaders/bond.wgsl?raw'
import boxWgsl from '../../shaders/box.wgsl?raw'
import attractionBuildWgsl from '../../shaders/attraction_build.wgsl?raw'
import attractionWgsl from '../../shaders/attraction.wgsl?raw'
import { KB } from '../params'

const WORKGROUP_SIZE = 64
const UNIFORM_BYTES = 112
const CAMERA_BYTES = 128
const VIZ_BYTES = 64
const THERMOSTAT_TAU = 0.1 // ps, Berendsen coupling time
// Cell list is used only when it pays off: the box must hold at least a 3x3x3
// grid (so 27-neighbor wrapping never double-counts) and the system must be
// large enough that O(N) beats the brute-force O(N^2) constant factor.
const CELL_MIN_GRID = 3
const CELL_MIN_ATOMS = 1500
// Skip the (O(N^2)) attraction-visualization pass above this size; it is a
// diagnostic overlay, not physics, and dominates frame time for big systems.
const ATTRACTION_MAX_ATOMS = 4000
// Coulomb attraction magnitude (kJ/mol/nm) above which a pair is drawn as a
// line. ~450 catches forming hydrogen bonds; weaker ones fade in toward full
// opacity around ~2.5x this value (see attraction_build.wgsl).
const ATTRACTION_THRESHOLD = 650
// Lennard-Jones attractive force magnitude (kJ/mol/nm) above which a pair is
// drawn. Far smaller than the Coulomb scale; tuned to catch close-contact wells
// without flooding the view with weak long-range tails.
const LJ_ATTRACTION_THRESHOLD = 70
// Bond stretch force magnitude (kJ/mol/nm) above which a bond reaches toward
// full opacity; relaxed bonds stay faint (floor in bond.wgsl).
const BOND_THRESHOLD = 150

export class WebGPUBackend implements IGPUBackend {
  private readonly canvas: HTMLCanvasElement

  private device!: GPUDevice
  private context!: GPUCanvasContext
  private format!: GPUTextureFormat

  private params!: SimParams
  private numAtoms = 0
  private numMol = 0
  private numBonds = 0
  private maxSeg = 0
  private bondR0 = 0
  private bondK = 0

  // Cell-list grid (nonbonded neighbor search).
  private useCells = false
  private numCells = 1
  private cellCap = 1
  private allocatedCellCount = 1
  private allocatedCellCap = 1
  private gridDim: [number, number, number] = [1, 1, 1]
  private cellSize: [number, number, number] = [1, 1, 1]
  private showAttractions = true

  // Live display options (set via setViewOptions; default to a sensible view).
  private atomScale = 1
  private forceOpacity = 1
  private showForces = true
  private showBonds = true
  private showBox = false
  private periodicTilesX = 1
  private periodicTilesY = 1
  private periodicTilesZ = 1
  private topologyBonds: Bond[] = []
  private atomsByMolecule: number[][] = []
  private boundaryCleanupPending = false

  // Buffers
  private uniformBuffer!: GPUBuffer
  private cameraBuffer!: GPUBuffer
  private posBuffer!: GPUBuffer
  private velBuffer!: GPUBuffer
  private forceBuffer!: GPUBuffer
  private atomParamsBuffer!: GPUBuffer
  private reductionBuffer!: GPUBuffer
  private vizUniformBuffer!: GPUBuffer
  private molRangesBuffer!: GPUBuffer
  private molBondsBuffer!: GPUBuffer
  private molAnglesBuffer!: GPUBuffer
  private segCountBuffer!: GPUBuffer
  private segPairsBuffer!: GPUBuffer
  private cellHeadBuffer!: GPUBuffer
  private cellAtomsBuffer!: GPUBuffer

  // Cached uniform bytes so hot-swappable fields can be patched in place.
  private uniformData!: ArrayBuffer
  private thermoTargetT = 300
  private thermoOn = 0
  private forceGuardOn = 1
  private boundaryMode: BoundaryMode = 'periodic'

  // Compute
  private computeLayout!: GPUBindGroupLayout
  private computeBindGroup!: GPUBindGroup
  private bondedLayout!: GPUBindGroupLayout
  private bondedBindGroup!: GPUBindGroup
  private pipelines!: {
    lj: GPUComputePipeline
    coulomb: GPUComputePipeline
    bonded: GPUComputePipeline
    integratePos: GPUComputePipeline
    integrateVel: GPUComputePipeline
    cullBoundary: GPUComputePipeline
    thermoReduce: GPUComputePipeline
    thermoScale: GPUComputePipeline
    cellClear: GPUComputePipeline
    cellBuild: GPUComputePipeline
  }

  // Render
  private renderPipeline!: GPURenderPipeline
  private renderBindGroup!: GPUBindGroup
  private bondPipeline!: GPURenderPipeline
  private bondBindGroup!: GPUBindGroup
  private boxPipeline!: GPURenderPipeline
  private boxBindGroup!: GPUBindGroup
  private attractionPipeline!: GPURenderPipeline
  private attractionBindGroup!: GPUBindGroup
  private attractionBuildPipeline!: GPUComputePipeline
  private attractionBuildBindGroup!: GPUBindGroup
  private depthTexture: GPUTexture | null = null
  private depthSize = { w: 0, h: 0 }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async initialize(
    params: SimParams,
    topology: Topology,
    initial: InitialState,
    runtime: RuntimeConfig,
  ): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not available in this browser.')
    }
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No WebGPU adapter found.')
    const requestedStorageBuffers = Math.min(
      10,
      adapter.limits.maxStorageBuffersPerShaderStage,
    )
    this.device = await adapter.requestDevice({
      requiredLimits: {
        maxStorageBuffersPerShaderStage: requestedStorageBuffers,
      },
    })

    this.params = params
    this.numAtoms = params.numAtoms
    this.numMol = params.numMolecules
    this.topologyBonds = topology.bonds.slice()
    this.atomsByMolecule = this.groupAtomsByMolecule(topology.moleculeIds)
    this.thermoTargetT = runtime.targetTemperature
    this.thermoOn = runtime.thermostatEnabled ? 1 : 0
    this.forceGuardOn = runtime.forceGuardEnabled ? 1 : 0
    this.boundaryMode = runtime.boundaryMode
    this.computeGrid()
    this.showAttractions = this.numAtoms <= ATTRACTION_MAX_ATOMS

    this.context = this.canvas.getContext('webgpu') as GPUCanvasContext
    this.format = navigator.gpu.getPreferredCanvasFormat()
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'opaque',
    })

    this.createBuffers(initial)
    this.createVizBuffers(topology)
    this.writeUniforms(topology)
    this.writeVizUniform()
    this.createComputePipelines()
    this.createRenderPipeline()
    this.createBondPipeline()
    this.createBoxPipeline()
    this.createAttractionPipelines()

    // Compute a(t=0) so the first Velocity-Verlet half-kick is valid.
    this.computeForces()
  }

  /**
   * Size the cell-list grid from the box and cutoff. Cells are at least one
   * cutoff wide so a 3x3x3 neighbor stencil captures every interacting pair.
   * Falls back to brute force for small boxes/systems (useCells = false).
   */
  private computeGrid(): void {
    const p = this.params
    const cutoff = p.cutoffRadius
    const gx = Math.max(1, Math.floor(p.box[0] / cutoff))
    const gy = Math.max(1, Math.floor(p.box[1] / cutoff))
    const gz = Math.max(1, Math.floor(p.box[2] / cutoff))
    this.gridDim = [gx, gy, gz]
    this.cellSize = [p.box[0] / gx, p.box[1] / gy, p.box[2] / gz]
    this.numCells = gx * gy * gz

    const bigEnough = Math.min(gx, gy, gz) >= CELL_MIN_GRID
    this.useCells =
      this.boundaryMode === 'periodic' && bigEnough && this.numAtoms >= CELL_MIN_ATOMS

    // Capacity per cell from mean density with headroom for fluctuations.
    const mean = this.numAtoms / Math.max(1, this.numCells)
    this.cellCap = Math.min(256, Math.max(32, Math.ceil(mean * 2.5)))
  }

  private createBuffers(initial: InitialState): void {
    const d = this.device
    const atomBytes = this.numAtoms * 16

    this.uniformBuffer = d.createBuffer({
      size: UNIFORM_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.cameraBuffer = d.createBuffer({
      size: CAMERA_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
    this.posBuffer = d.createBuffer({
      size: atomBytes,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })
    this.velBuffer = d.createBuffer({
      size: atomBytes,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    })
    this.forceBuffer = d.createBuffer({
      size: atomBytes,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.atomParamsBuffer = d.createBuffer({
      size: atomBytes,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.reductionBuffer = d.createBuffer({
      size: 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.cellHeadBuffer = d.createBuffer({
      size: this.numCells * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.cellAtomsBuffer = d.createBuffer({
      size: this.numCells * this.cellCap * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.allocatedCellCount = this.numCells
    this.allocatedCellCap = this.cellCap

    d.queue.writeBuffer(this.posBuffer, 0, initial.positions)
    d.queue.writeBuffer(this.velBuffer, 0, initial.velocities)
    d.queue.writeBuffer(this.atomParamsBuffer, 0, initial.atomParams)
    d.queue.writeBuffer(this.forceBuffer, 0, new Float32Array(this.numAtoms * 4))
  }

  private writeUniforms(topology: Topology): void {
    const p = this.params
    const buf = new ArrayBuffer(UNIFORM_BYTES)
    const dv = new DataView(buf)
    const bond = topology.bonds[0]
    const angle = topology.angles[0]

    dv.setFloat32(0, p.box[0], true)
    dv.setFloat32(4, p.box[1], true)
    dv.setFloat32(8, p.box[2], true)
    dv.setFloat32(12, p.cutoffRadius * p.cutoffRadius, true)
    dv.setUint32(16, p.numAtoms, true)
    dv.setUint32(20, p.numMolecules, true)
    dv.setFloat32(24, p.dt, true)
    dv.setFloat32(28, p.coulombConstant, true)
    dv.setFloat32(32, bond ? bond.r0 : 0, true)
    dv.setFloat32(36, bond ? bond.k : 0, true)
    dv.setFloat32(40, angle ? angle.theta0 : 0, true)
    dv.setFloat32(44, angle ? angle.kTheta : 0, true)
    dv.setFloat32(48, this.thermoTargetT, true)
    dv.setFloat32(52, THERMOSTAT_TAU, true)
    dv.setFloat32(56, KB, true)
    dv.setUint32(60, this.thermoOn, true)
    // Cell-list grid.
    dv.setUint32(64, this.gridDim[0], true)
    dv.setUint32(68, this.gridDim[1], true)
    dv.setUint32(72, this.gridDim[2], true)
    dv.setUint32(76, this.cellCap, true)
    dv.setFloat32(80, this.cellSize[0], true)
    dv.setFloat32(84, this.cellSize[1], true)
    dv.setFloat32(88, this.cellSize[2], true)
    dv.setUint32(92, this.useCells ? 1 : 0, true)
    dv.setUint32(96, this.boundaryModeCode(), true)
    dv.setUint32(100, this.forceGuardOn, true)

    this.uniformData = buf
    this.device.queue.writeBuffer(this.uniformBuffer, 0, buf)
  }

  /** Buffers used only by the visualization passes (bonds + attraction lines). */
  private createVizBuffers(topology: Topology): void {
    const d = this.device

    this.numBonds = topology.bonds.length
    const firstBond = topology.bonds[0]
    this.bondR0 = firstBond ? firstBond.r0 : 0
    this.bondK = firstBond ? firstBond.k : 0

    // Per-molecule ranges into the flat bond/angle lists (4 u32 each). Consumed
    // by the bonded force kernel (group 1, binding 0).
    const ranges =
      topology.molRanges.length > 0 ? topology.molRanges : new Uint32Array(4)
    this.molRangesBuffer = d.createBuffer({
      size: ranges.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    d.queue.writeBuffer(this.molRangesBuffer, 0, ranges)

    // Flat bond list: 16 bytes each — (i, j) u32, (r0, k) f32. Shared by the
    // bonded force kernel and the bond visualization pass.
    const bondBuf = new ArrayBuffer(Math.max(1, this.numBonds) * 16)
    const bondDv = new DataView(bondBuf)
    for (let b = 0; b < this.numBonds; b++) {
      const bd = topology.bonds[b]
      bondDv.setUint32(b * 16 + 0, bd.i, true)
      bondDv.setUint32(b * 16 + 4, bd.j, true)
      bondDv.setFloat32(b * 16 + 8, bd.r0, true)
      bondDv.setFloat32(b * 16 + 12, bd.k, true)
    }
    this.molBondsBuffer = d.createBuffer({
      size: bondBuf.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    d.queue.writeBuffer(this.molBondsBuffer, 0, bondBuf)

    // Flat angle list: 32 bytes each — (i, j-center, k, _) u32,
    // (theta0, kTheta, _, _) f32.
    const numAngles = topology.angles.length
    const angleBuf = new ArrayBuffer(Math.max(1, numAngles) * 32)
    const angleDv = new DataView(angleBuf)
    for (let a = 0; a < numAngles; a++) {
      const an = topology.angles[a]
      angleDv.setUint32(a * 32 + 0, an.i, true)
      angleDv.setUint32(a * 32 + 4, an.j, true)
      angleDv.setUint32(a * 32 + 8, an.k, true)
      angleDv.setFloat32(a * 32 + 16, an.theta0, true)
      angleDv.setFloat32(a * 32 + 20, an.kTheta, true)
    }
    this.molAnglesBuffer = d.createBuffer({
      size: angleBuf.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    d.queue.writeBuffer(this.molAnglesBuffer, 0, angleBuf)

    // Dynamic attraction segments rebuilt on the GPU every frame. Each segment
    // is 4 u32 (atom i, atom j, packed alpha, kind). Sized for several
    // attractive partners per atom across the force kinds.
    this.maxSeg = Math.max(1, this.numAtoms * 8)
    this.segCountBuffer = d.createBuffer({
      size: 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.segPairsBuffer = d.createBuffer({
      size: this.maxSeg * 4 * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })

    this.vizUniformBuffer = d.createBuffer({
      size: VIZ_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })
  }

  private writeVizUniform(): void {
    const p = this.params
    const buf = new ArrayBuffer(VIZ_BYTES)
    const dv = new DataView(buf)
    dv.setFloat32(0, p.box[0], true)
    dv.setFloat32(4, p.box[1], true)
    dv.setFloat32(8, p.box[2], true)
    dv.setFloat32(12, p.coulombConstant, true)
    dv.setFloat32(16, p.cutoffRadius * p.cutoffRadius, true)
    dv.setFloat32(20, ATTRACTION_THRESHOLD, true)
    dv.setUint32(24, p.numAtoms, true)
    dv.setUint32(28, this.maxSeg, true)
    dv.setFloat32(32, LJ_ATTRACTION_THRESHOLD, true)
    dv.setFloat32(36, BOND_THRESHOLD, true)
    dv.setFloat32(40, this.bondR0, true)
    dv.setFloat32(44, this.bondK, true)
    dv.setFloat32(48, this.forceOpacity, true)
    dv.setUint32(52, this.boundaryModeCode(), true)
    this.device.queue.writeBuffer(this.vizUniformBuffer, 0, buf)
  }

  private boundaryModeCode(): number {
    switch (this.boundaryMode) {
      case 'open':
        return 1
      case 'open-top':
        return 2
      default:
        return 0
    }
  }

  /** Hot-swappable thermostat control (RuntimeConfig, not SimParams). */
  setThermostat(targetTemperature: number, enabled: boolean): void {
    this.thermoTargetT = targetTemperature
    this.thermoOn = enabled ? 1 : 0
    if (!this.uniformData) return
    const dv = new DataView(this.uniformData)
    dv.setFloat32(48, this.thermoTargetT, true)
    dv.setUint32(60, this.thermoOn, true)
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData)
  }

  setForceGuard(enabled: boolean): void {
    this.forceGuardOn = enabled ? 1 : 0
    if (!this.uniformData) return
    const dv = new DataView(this.uniformData)
    dv.setUint32(100, this.forceGuardOn, true)
    this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData)
  }

  setCutoffRadius(cutoffRadius: number): void {
    const clamped = Math.max(0.05, cutoffRadius)
    if (!this.params || this.params.cutoffRadius === clamped) return
    this.params.cutoffRadius = clamped
    this.computeGrid()
    this.enforceCellBufferCapacity()

    if (this.uniformData) {
      const dv = new DataView(this.uniformData)
      dv.setFloat32(12, clamped * clamped, true)
      dv.setUint32(64, this.gridDim[0], true)
      dv.setUint32(68, this.gridDim[1], true)
      dv.setUint32(72, this.gridDim[2], true)
      dv.setUint32(76, this.cellCap, true)
      dv.setFloat32(80, this.cellSize[0], true)
      dv.setFloat32(84, this.cellSize[1], true)
      dv.setFloat32(88, this.cellSize[2], true)
      dv.setUint32(92, this.useCells ? 1 : 0, true)
      this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData)
    }

    if (this.vizUniformBuffer) {
      const buf = new ArrayBuffer(4)
      new DataView(buf).setFloat32(0, clamped * clamped, true)
      this.device.queue.writeBuffer(this.vizUniformBuffer, 16, buf)
    }

    if (!this.boundaryCleanupPending) this.computeForces()
  }

  private enforceCellBufferCapacity(): void {
    if (
      this.numCells > this.allocatedCellCount ||
      this.cellCap > this.allocatedCellCap
    ) {
      // Keep runtime-cutoff updates safe without reallocating GPU buffers.
      this.useCells = false
    }
  }

  setBoundaryMode(mode: BoundaryMode): void {
    if (this.boundaryMode === mode) return
    const previousMode = this.boundaryMode
    this.boundaryMode = mode
    this.computeGrid()
    this.enforceCellBufferCapacity()
    if (this.uniformData) {
      const dv = new DataView(this.uniformData)
      dv.setUint32(92, this.useCells ? 1 : 0, true)
      dv.setUint32(96, this.boundaryModeCode(), true)
      this.device.queue.writeBuffer(this.uniformBuffer, 0, this.uniformData)
    }
    if (this.vizUniformBuffer) {
      const buf = new ArrayBuffer(4)
      new DataView(buf).setUint32(0, this.boundaryModeCode(), true)
      this.device.queue.writeBuffer(this.vizUniformBuffer, 52, buf)
    }
    this.boundaryCleanupPending = true
    void this.sanitizeBoundaryTransition(previousMode, mode)
  }

  private groupAtomsByMolecule(moleculeIds: Int32Array): number[][] {
    const groups = new Map<number, number[]>()
    for (let i = 0; i < moleculeIds.length; i++) {
      const id = moleculeIds[i]
      const group = groups.get(id)
      if (group) group.push(i)
      else groups.set(id, [i])
    }
    return [...groups.values()]
  }

  private wrappedAxes(mode: BoundaryMode): [boolean, boolean, boolean] {
    switch (mode) {
      case 'periodic':
        return [true, true, true]
      case 'open-top':
        return [true, false, true]
      default:
        return [false, false, false]
    }
  }

  /** Live display controls (atom size, line opacity, overlay toggles). */
  setViewOptions(options: ViewOptions): void {
    this.atomScale = options.atomScale
    this.forceOpacity = options.forceOpacity
    this.showForces = options.showForces
    this.showBonds = options.showBonds
    this.showBox = options.showBox
    const legacyTileCount = Math.max(1, Math.round(options.periodicTiles ?? 1))
    this.periodicTilesX = Math.max(1, Math.min(6, Math.round(options.periodicTilesX ?? legacyTileCount)))
    this.periodicTilesY = Math.max(1, Math.min(6, Math.round(options.periodicTilesY ?? legacyTileCount)))
    this.periodicTilesZ = Math.max(1, Math.min(6, Math.round(options.periodicTilesZ ?? legacyTileCount)))
    // Patch the line opacity in the viz uniform without a full rewrite.
    const buf = new ArrayBuffer(4)
    new DataView(buf).setFloat32(0, this.forceOpacity, true)
    this.device.queue.writeBuffer(this.vizUniformBuffer, 48, buf)
  }

  private renderTileGrid(): [number, number, number] {
    if (this.boundaryMode !== 'periodic') return [1, 1, 1]
    return [this.periodicTilesX, this.periodicTilesY, this.periodicTilesZ]
  }

  private renderTileCount(): number {
    const [x, y, z] = this.renderTileGrid()
    return x * y * z
  }

  private createComputePipelines(): void {
    const d = this.device

    this.computeLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    })

    this.computeBindGroup = d.createBindGroup({
      layout: this.computeLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer } },
        { binding: 1, resource: { buffer: this.posBuffer } },
        { binding: 2, resource: { buffer: this.atomParamsBuffer } },
        { binding: 3, resource: { buffer: this.forceBuffer } },
        { binding: 4, resource: { buffer: this.velBuffer } },
        { binding: 5, resource: { buffer: this.reductionBuffer } },
        { binding: 6, resource: { buffer: this.cellHeadBuffer } },
        { binding: 7, resource: { buffer: this.cellAtomsBuffer } },
      ],
    })

    const pipelineLayout = d.createPipelineLayout({
      bindGroupLayouts: [this.computeLayout],
    })

    // The bonded kernel adds a second bind group (group 1) holding the flat
    // per-molecule bond/angle data; molecules own disjoint atoms so it writes
    // the shared force buffer without atomics.
    this.bondedLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    })
    this.bondedBindGroup = d.createBindGroup({
      layout: this.bondedLayout,
      entries: [
        { binding: 0, resource: { buffer: this.molRangesBuffer } },
        { binding: 1, resource: { buffer: this.molBondsBuffer } },
        { binding: 2, resource: { buffer: this.molAnglesBuffer } },
      ],
    })
    const bondedPipelineLayout = d.createPipelineLayout({
      bindGroupLayouts: [this.computeLayout, this.bondedLayout],
    })

    const make = (kernelSrc: string): GPUComputePipeline =>
      d.createComputePipeline({
        layout: pipelineLayout,
        compute: {
          module: d.createShaderModule({ code: commonWgsl + '\n' + kernelSrc }),
          entryPoint: 'main',
        },
      })

    this.pipelines = {
      lj: make(ljWgsl),
      coulomb: make(coulombWgsl),
      bonded: d.createComputePipeline({
        layout: bondedPipelineLayout,
        compute: {
          module: d.createShaderModule({ code: commonWgsl + '\n' + bondedWgsl }),
          entryPoint: 'main',
        },
      }),
      integratePos: make(integratePosWgsl),
      integrateVel: make(integrateVelWgsl),
      cullBoundary: make(cullBoundaryWgsl),
      thermoReduce: make(thermoReduceWgsl),
      thermoScale: make(thermoScaleWgsl),
      cellClear: make(cellClearWgsl),
      cellBuild: make(cellBuildWgsl),
    }
  }

  private createRenderPipeline(): void {
    const d = this.device
    const module = d.createShaderModule({ code: renderWgsl })

    const layout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    })

    this.renderBindGroup = d.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.posBuffer } },
        { binding: 2, resource: { buffer: this.atomParamsBuffer } },
        { binding: 3, resource: { buffer: this.velBuffer } },
      ],
    })

    this.renderPipeline = d.createRenderPipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format: this.format }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'none' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
    })
  }

  private createBondPipeline(): void {
    const d = this.device
    const module = d.createShaderModule({ code: bondWgsl })

    const layout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    })

    this.bondBindGroup = d.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.vizUniformBuffer } },
        { binding: 2, resource: { buffer: this.posBuffer } },
        { binding: 3, resource: { buffer: this.molBondsBuffer } },
        { binding: 4, resource: { buffer: this.velBuffer } },
      ],
    })

    this.bondPipeline = d.createRenderPipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: false,
        depthCompare: 'less',
      },
    })
  }

  /** Periodic-box wireframe pass. Reuses the camera + viz uniforms. */
  private createBoxPipeline(): void {
    const d = this.device
    const module = d.createShaderModule({ code: boxWgsl })

    const layout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      ],
    })

    this.boxBindGroup = d.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.vizUniformBuffer } },
      ],
    })

    this.boxPipeline = d.createRenderPipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [layout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: false,
        depthCompare: 'less',
      },
    })
  }

  private createAttractionPipelines(): void {
    const d = this.device

    // Compute pass: rebuild the attraction segment list.
    const buildLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    })
    this.attractionBuildBindGroup = d.createBindGroup({
      layout: buildLayout,
      entries: [
        { binding: 0, resource: { buffer: this.vizUniformBuffer } },
        { binding: 1, resource: { buffer: this.posBuffer } },
        { binding: 2, resource: { buffer: this.atomParamsBuffer } },
        { binding: 3, resource: { buffer: this.velBuffer } },
        { binding: 4, resource: { buffer: this.segCountBuffer } },
        { binding: 5, resource: { buffer: this.segPairsBuffer } },
      ],
    })
    this.attractionBuildPipeline = d.createComputePipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [buildLayout] }),
      compute: {
        module: d.createShaderModule({ code: attractionBuildWgsl }),
        entryPoint: 'main',
      },
    })

    // Render pass: draw the segments as lines.
    const module = d.createShaderModule({ code: attractionWgsl })
    const drawLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
        { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 4, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
        { binding: 5, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      ],
    })
    this.attractionBindGroup = d.createBindGroup({
      layout: drawLayout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.vizUniformBuffer } },
        { binding: 2, resource: { buffer: this.posBuffer } },
        { binding: 3, resource: { buffer: this.segCountBuffer } },
        { binding: 4, resource: { buffer: this.segPairsBuffer } },
        { binding: 5, resource: { buffer: this.velBuffer } },
      ],
    })
    this.attractionPipeline = d.createRenderPipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [drawLayout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [
          {
            format: this.format,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: false,
        depthCompare: 'less',
      },
    })
  }

  private atomGroups(): number {
    return Math.ceil(this.numAtoms / WORKGROUP_SIZE)
  }

  private molGroups(): number {
    return Math.ceil(this.numMol / WORKGROUP_SIZE)
  }

  private cellGroups(): number {
    return Math.ceil(this.numCells / WORKGROUP_SIZE)
  }

  /** Rebuild the cell list (clear counters, then bin atoms). No-op if unused. */
  private buildCells(pass: GPUComputePassEncoder, ag: number): void {
    if (!this.useCells) return
    pass.setPipeline(this.pipelines.cellClear)
    pass.dispatchWorkgroups(this.cellGroups())
    pass.setPipeline(this.pipelines.cellBuild)
    pass.dispatchWorkgroups(ag)
  }

  private cullForBoundary(pass?: GPUComputePassEncoder): void {
    const ag = this.atomGroups()
    if (pass) {
      pass.setPipeline(this.pipelines.cullBoundary)
      pass.dispatchWorkgroups(ag)
      return
    }

    const encoder = this.device.createCommandEncoder()
    const compute = encoder.beginComputePass()
    compute.setBindGroup(0, this.computeBindGroup)
    compute.setPipeline(this.pipelines.cullBoundary)
    compute.dispatchWorkgroups(ag)
    compute.end()
    this.device.queue.submit([encoder.finish()])
  }

  private unwrapDelta(delta: number, boxSize: number): number {
    if (boxSize <= 0) return delta
    return delta - boxSize * Math.round(delta / boxSize)
  }

  private unwrapMoleculesForRemovedWrap(
    positions: Float32Array,
    velocities: Float32Array,
    removedWrap: readonly [boolean, boolean, boolean],
  ): void {
    const adjacency = new Map<number, number[]>()
    for (const bond of this.topologyBonds) {
      const a = bond.i
      const b = bond.j
      const listA = adjacency.get(a)
      if (listA) listA.push(b)
      else adjacency.set(a, [b])
      const listB = adjacency.get(b)
      if (listB) listB.push(a)
      else adjacency.set(b, [a])
    }

    for (const group of this.atomsByMolecule) {
      let anchorIndex = -1
      for (const atomIndex of group) {
        if (velocities[atomIndex * 4 + 3] > 0) {
          anchorIndex = atomIndex
          break
        }
      }
      if (anchorIndex < 0) continue

      const members = new Set<number>(group)
      const visited = new Set<number>()
      const queue: number[] = []
      visited.add(anchorIndex)
      queue.push(anchorIndex)

      while (queue.length > 0) {
        const atomIndex = queue.shift()!
        const neighbors = adjacency.get(atomIndex)
        if (!neighbors) continue
        const baseX = positions[atomIndex * 4 + 0]
        const baseY = positions[atomIndex * 4 + 1]
        const baseZ = positions[atomIndex * 4 + 2]

        for (const neighborIndex of neighbors) {
          if (!members.has(neighborIndex)) continue
          if (velocities[neighborIndex * 4 + 3] <= 0) continue
          if (visited.has(neighborIndex)) continue

          let dx = positions[neighborIndex * 4 + 0] - positions[atomIndex * 4 + 0]
          let dy = positions[neighborIndex * 4 + 1] - positions[atomIndex * 4 + 1]
          let dz = positions[neighborIndex * 4 + 2] - positions[atomIndex * 4 + 2]

          if (removedWrap[0]) dx = this.unwrapDelta(dx, this.params.box[0])
          if (removedWrap[1]) dy = this.unwrapDelta(dy, this.params.box[1])
          if (removedWrap[2]) dz = this.unwrapDelta(dz, this.params.box[2])

          positions[neighborIndex * 4 + 0] = baseX + dx
          positions[neighborIndex * 4 + 1] = baseY + dy
          positions[neighborIndex * 4 + 2] = baseZ + dz

          visited.add(neighborIndex)
          queue.push(neighborIndex)
        }
      }

      const anchorX = positions[anchorIndex * 4 + 0]
      const anchorY = positions[anchorIndex * 4 + 1]
      const anchorZ = positions[anchorIndex * 4 + 2]

      for (const atomIndex of group) {
        if (velocities[atomIndex * 4 + 3] <= 0) continue
        if (visited.has(atomIndex)) continue
        let dx = positions[atomIndex * 4 + 0] - anchorX
        let dy = positions[atomIndex * 4 + 1] - anchorY
        let dz = positions[atomIndex * 4 + 2] - anchorZ

        if (removedWrap[0]) dx = this.unwrapDelta(dx, this.params.box[0])
        if (removedWrap[1]) dy = this.unwrapDelta(dy, this.params.box[1])
        if (removedWrap[2]) dz = this.unwrapDelta(dz, this.params.box[2])

        positions[atomIndex * 4 + 0] = anchorX + dx
        positions[atomIndex * 4 + 1] = anchorY + dy
        positions[atomIndex * 4 + 2] = anchorZ + dz
      }
    }
  }

  private async sanitizeBoundaryTransition(
    previousMode: BoundaryMode,
    nextMode: BoundaryMode,
  ): Promise<void> {
    try {
      const [prevWrapX, prevWrapY, prevWrapZ] = this.wrappedAxes(previousMode)
      const [nextWrapX, nextWrapY, nextWrapZ] = this.wrappedAxes(nextMode)
      const removedWrap = [prevWrapX && !nextWrapX, prevWrapY && !nextWrapY, prevWrapZ && !nextWrapZ] as const

      const positions = await this.readbackPositions()
      const velocities = await this.readbackVelocities()
      if (removedWrap[0] || removedWrap[1] || removedWrap[2]) {
        this.unwrapMoleculesForRemovedWrap(positions, velocities, removedWrap)
        this.device.queue.writeBuffer(this.posBuffer, 0, positions)
      }

      // Transition can invalidate previously computed forces; reset and rebuild.
      const forces = new Float32Array(this.numAtoms * 4)
      this.device.queue.writeBuffer(this.forceBuffer, 0, forces)

      this.computeForces()
    } finally {
      this.boundaryCleanupPending = false
    }
  }

  /** Recompute forces for the current positions (a single force generation). */
  private computeForces(): void {
    const encoder = this.device.createCommandEncoder()
    const pass = encoder.beginComputePass()
    pass.setBindGroup(0, this.computeBindGroup)
    const ag = this.atomGroups()

    this.buildCells(pass, ag)

    pass.setPipeline(this.pipelines.lj)
    pass.dispatchWorkgroups(ag)
    pass.setPipeline(this.pipelines.coulomb)
    pass.dispatchWorkgroups(ag)
    if (this.numMol > 0) {
      pass.setBindGroup(1, this.bondedBindGroup)
      pass.setPipeline(this.pipelines.bonded)
      pass.dispatchWorkgroups(this.molGroups())
    }

    pass.end()
    this.device.queue.submit([encoder.finish()])
  }

  stepSimulation(steps: number): void {
    if (this.boundaryCleanupPending) return
    const encoder = this.device.createCommandEncoder()
    const pass = encoder.beginComputePass()
    pass.setBindGroup(0, this.computeBindGroup)

    const ag = this.atomGroups()
    const mg = this.molGroups()

    for (let s = 0; s < steps; s++) {
      // Velocity Verlet: half-kick + drift (uses a(t) already in buffer).
      pass.setPipeline(this.pipelines.integratePos)
      pass.dispatchWorkgroups(ag)
      this.cullForBoundary(pass)

      // Rebuild the neighbor grid at the new positions, then a(t+dt).
      this.buildCells(pass, ag)
      pass.setPipeline(this.pipelines.lj)
      pass.dispatchWorkgroups(ag)
      pass.setPipeline(this.pipelines.coulomb)
      pass.dispatchWorkgroups(ag)
      if (this.numMol > 0) {
        pass.setBindGroup(1, this.bondedBindGroup)
        pass.setPipeline(this.pipelines.bonded)
        pass.dispatchWorkgroups(mg)
      }

      // Second half-kick.
      pass.setPipeline(this.pipelines.integrateVel)
      pass.dispatchWorkgroups(ag)

      // Thermostat: reduce KE (1 workgroup) then rescale (no-op when off).
      pass.setPipeline(this.pipelines.thermoReduce)
      pass.dispatchWorkgroups(1)
      pass.setPipeline(this.pipelines.thermoScale)
      pass.dispatchWorkgroups(ag)
    }

    pass.end()
    this.device.queue.submit([encoder.finish()])
  }

  render(camera: CameraView): void {
    this.writeCamera(camera)
    this.ensureDepth()
    const tileCount = this.renderTileCount()

    // Build the attraction segment list only when the overlay is actually drawn.
    const drawForces = this.showForces && this.showAttractions
    if (drawForces) {
      this.device.queue.writeBuffer(this.segCountBuffer, 0, new Uint32Array([0]))
    }

    const encoder = this.device.createCommandEncoder()

    if (drawForces) {
      const build = encoder.beginComputePass()
      build.setPipeline(this.attractionBuildPipeline)
      build.setBindGroup(0, this.attractionBuildBindGroup)
      build.dispatchWorkgroups(this.atomGroups())
      build.end()
    }

    const view = this.context.getCurrentTexture().createView()
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          clearValue: { r: 0.043, g: 0.047, b: 0.063, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture!.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
    })

    // Atoms (sphere impostors).
    pass.setPipeline(this.renderPipeline)
    pass.setBindGroup(0, this.renderBindGroup)
    pass.draw(6, this.numAtoms * tileCount)

    // Periodic-box wireframe (12 edges).
    if (this.showBox) {
      pass.setPipeline(this.boxPipeline)
      pass.setBindGroup(0, this.boxBindGroup)
      pass.draw(2, 12 * tileCount)
    }

    // Intramolecular bonds (lines).
    if (this.numBonds > 0 && this.showBonds) {
      pass.setPipeline(this.bondPipeline)
      pass.setBindGroup(0, this.bondBindGroup)
      pass.draw(2, this.numBonds * tileCount)
    }

    // Attractive interactions: Coulomb + Lennard-Jones (lines).
    if (drawForces) {
      pass.setPipeline(this.attractionPipeline)
      pass.setBindGroup(0, this.attractionBindGroup)
      pass.draw(2, this.maxSeg * tileCount)
    }

    pass.end()
    this.device.queue.submit([encoder.finish()])
  }

  private writeCamera(camera: CameraView): void {
    const buf = new ArrayBuffer(CAMERA_BYTES)
    const f = new Float32Array(buf)
    const tileGrid = this.renderTileGrid()
    f.set(camera.viewProj, 0)
    f[16] = camera.right[0]
    f[17] = camera.right[1]
    f[18] = camera.right[2]
    f[19] = this.atomScale // packed into camera.right.w
    f[20] = camera.up[0]
    f[21] = camera.up[1]
    f[22] = camera.up[2]
    f[23] = 0
    f[24] = tileGrid[0]
    f[25] = tileGrid[1]
    f[26] = tileGrid[2]
    f[27] = 0
    f[28] = this.params.box[0]
    f[29] = this.params.box[1]
    f[30] = this.params.box[2]
    f[31] = 0
    this.device.queue.writeBuffer(this.cameraBuffer, 0, buf)
  }

  private ensureDepth(): void {
    const w = this.canvas.width
    const h = this.canvas.height
    if (this.depthTexture && this.depthSize.w === w && this.depthSize.h === h) {
      return
    }
    this.depthTexture?.destroy()
    this.depthTexture = this.device.createTexture({
      size: { width: w, height: h },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    this.depthSize = { w, h }
  }

  async readbackPositions(): Promise<Float32Array> {
    return this.readback(this.posBuffer)
  }

  async readbackVelocities(): Promise<Float32Array> {
    return this.readback(this.velBuffer)
  }

  private async readback(src: GPUBuffer): Promise<Float32Array> {
    const bytes = this.numAtoms * 16
    const staging = this.device.createBuffer({
      size: bytes,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    })
    const encoder = this.device.createCommandEncoder()
    encoder.copyBufferToBuffer(src, 0, staging, 0, bytes)
    this.device.queue.submit([encoder.finish()])
    await staging.mapAsync(GPUMapMode.READ)
    const copy = new Float32Array(staging.getMappedRange().slice(0))
    staging.unmap()
    staging.destroy()
    return copy
  }

  destroy(): void {
    this.depthTexture?.destroy()
    this.posBuffer?.destroy()
    this.velBuffer?.destroy()
    this.forceBuffer?.destroy()
    this.atomParamsBuffer?.destroy()
    this.reductionBuffer?.destroy()
    this.uniformBuffer?.destroy()
    this.cameraBuffer?.destroy()
    this.vizUniformBuffer?.destroy()
    this.molRangesBuffer?.destroy()
    this.molBondsBuffer?.destroy()
    this.molAnglesBuffer?.destroy()
    this.segCountBuffer?.destroy()
    this.segPairsBuffer?.destroy()
    this.cellHeadBuffer?.destroy()
    this.cellAtomsBuffer?.destroy()
    this.device?.destroy()
  }
}
