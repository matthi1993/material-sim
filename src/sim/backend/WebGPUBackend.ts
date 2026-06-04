// The ONLY file allowed to import WebGPU types. Owns the device, buffers,
// pipelines, and both the compute (physics) and render passes. Contains zero
// physics math itself — all of that lives in the WGSL kernels.

import type { IGPUBackend } from './IGPUBackend'
import type {
  CameraView,
  InitialState,
  SimParams,
  Topology,
} from '../types'

import commonWgsl from '../../shaders/_common.wgsl?raw'
import ljWgsl from '../../shaders/force_lj.wgsl?raw'
import coulombWgsl from '../../shaders/force_coulomb.wgsl?raw'
import bondedWgsl from '../../shaders/force_bonded.wgsl?raw'
import integratePosWgsl from '../../shaders/integrate_pos.wgsl?raw'
import integrateVelWgsl from '../../shaders/integrate_vel.wgsl?raw'
import thermoReduceWgsl from '../../shaders/thermostat_reduce.wgsl?raw'
import thermoScaleWgsl from '../../shaders/thermostat_scale.wgsl?raw'
import renderWgsl from '../../shaders/render.wgsl?raw'
import bondWgsl from '../../shaders/bond.wgsl?raw'
import attractionBuildWgsl from '../../shaders/attraction_build.wgsl?raw'
import attractionWgsl from '../../shaders/attraction.wgsl?raw'
import { KB } from '../params'

const WORKGROUP_SIZE = 64
const UNIFORM_BYTES = 64
const CAMERA_BYTES = 96
const VIZ_BYTES = 32
const THERMOSTAT_TAU = 0.1 // ps, Berendsen coupling time
// Coulomb attraction magnitude (kJ/mol/nm) above which a pair is drawn as a
// line. ~700 corresponds to an O...H separation of ~0.26 nm (hydrogen bonds).
const ATTRACTION_THRESHOLD = 700

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

  // Buffers
  private uniformBuffer!: GPUBuffer
  private cameraBuffer!: GPUBuffer
  private posBuffer!: GPUBuffer
  private velBuffer!: GPUBuffer
  private forceBuffer!: GPUBuffer
  private atomParamsBuffer!: GPUBuffer
  private reductionBuffer!: GPUBuffer
  private vizUniformBuffer!: GPUBuffer
  private bondPairsBuffer!: GPUBuffer
  private segCountBuffer!: GPUBuffer
  private segPairsBuffer!: GPUBuffer

  // Cached uniform bytes so hot-swappable fields can be patched in place.
  private uniformData!: ArrayBuffer
  private thermoTargetT = 300
  private thermoOn = 0

  // Compute
  private computeLayout!: GPUBindGroupLayout
  private computeBindGroup!: GPUBindGroup
  private pipelines!: {
    lj: GPUComputePipeline
    coulomb: GPUComputePipeline
    bonded: GPUComputePipeline
    integratePos: GPUComputePipeline
    integrateVel: GPUComputePipeline
    thermoReduce: GPUComputePipeline
    thermoScale: GPUComputePipeline
  }

  // Render
  private renderPipeline!: GPURenderPipeline
  private renderBindGroup!: GPUBindGroup
  private bondPipeline!: GPURenderPipeline
  private bondBindGroup!: GPUBindGroup
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
  ): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not available in this browser.')
    }
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('No WebGPU adapter found.')
    this.device = await adapter.requestDevice()

    this.params = params
    this.numAtoms = params.numAtoms
    this.numMol = params.numMolecules

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
    this.createAttractionPipelines()

    // Compute a(t=0) so the first Velocity-Verlet half-kick is valid.
    this.computeForces()
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

    this.uniformData = buf
    this.device.queue.writeBuffer(this.uniformBuffer, 0, buf)
  }

  /** Buffers used only by the visualization passes (bonds + attraction lines). */
  private createVizBuffers(topology: Topology): void {
    const d = this.device

    // One index pair per intramolecular bond.
    this.numBonds = topology.bonds.length
    const bondPairs = new Uint32Array(Math.max(1, this.numBonds) * 2)
    for (let b = 0; b < this.numBonds; b++) {
      bondPairs[b * 2] = topology.bonds[b].i
      bondPairs[b * 2 + 1] = topology.bonds[b].j
    }
    this.bondPairsBuffer = d.createBuffer({
      size: bondPairs.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    d.queue.writeBuffer(this.bondPairsBuffer, 0, bondPairs)

    // Dynamic attraction segments rebuilt on the GPU every frame.
    this.maxSeg = Math.max(1, this.numAtoms * 4)
    this.segCountBuffer = d.createBuffer({
      size: 16,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    })
    this.segPairsBuffer = d.createBuffer({
      size: this.maxSeg * 2 * 4,
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
    this.device.queue.writeBuffer(this.vizUniformBuffer, 0, buf)
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

  private createComputePipelines(): void {
    const d = this.device

    this.computeLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
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
      ],
    })

    const pipelineLayout = d.createPipelineLayout({
      bindGroupLayouts: [this.computeLayout],
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
      bonded: make(bondedWgsl),
      integratePos: make(integratePosWgsl),
      integrateVel: make(integrateVelWgsl),
      thermoReduce: make(thermoReduceWgsl),
      thermoScale: make(thermoScaleWgsl),
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
      ],
    })

    this.renderBindGroup = d.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.posBuffer } },
        { binding: 2, resource: { buffer: this.atomParamsBuffer } },
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
      ],
    })

    this.bondBindGroup = d.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: this.cameraBuffer } },
        { binding: 1, resource: { buffer: this.vizUniformBuffer } },
        { binding: 2, resource: { buffer: this.posBuffer } },
        { binding: 3, resource: { buffer: this.bondPairsBuffer } },
      ],
    })

    this.bondPipeline = d.createRenderPipeline({
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

  private createAttractionPipelines(): void {
    const d = this.device

    // Compute pass: rebuild the attraction segment list.
    const buildLayout = d.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      ],
    })
    this.attractionBuildBindGroup = d.createBindGroup({
      layout: buildLayout,
      entries: [
        { binding: 0, resource: { buffer: this.vizUniformBuffer } },
        { binding: 1, resource: { buffer: this.posBuffer } },
        { binding: 2, resource: { buffer: this.atomParamsBuffer } },
        { binding: 3, resource: { buffer: this.segCountBuffer } },
        { binding: 4, resource: { buffer: this.segPairsBuffer } },
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
      ],
    })
    this.attractionPipeline = d.createRenderPipeline({
      layout: d.createPipelineLayout({ bindGroupLayouts: [drawLayout] }),
      vertex: { module, entryPoint: 'vs' },
      fragment: {
        module,
        entryPoint: 'fs',
        targets: [{ format: this.format }],
      },
      primitive: { topology: 'line-list' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
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

  /** Recompute forces for the current positions (a single force generation). */
  private computeForces(): void {
    const encoder = this.device.createCommandEncoder()
    const pass = encoder.beginComputePass()
    pass.setBindGroup(0, this.computeBindGroup)
    const ag = this.atomGroups()

    pass.setPipeline(this.pipelines.lj)
    pass.dispatchWorkgroups(ag)
    pass.setPipeline(this.pipelines.coulomb)
    pass.dispatchWorkgroups(ag)
    pass.setPipeline(this.pipelines.bonded)
    pass.dispatchWorkgroups(this.molGroups())

    pass.end()
    this.device.queue.submit([encoder.finish()])
  }

  stepSimulation(steps: number): void {
    const encoder = this.device.createCommandEncoder()
    const pass = encoder.beginComputePass()
    pass.setBindGroup(0, this.computeBindGroup)

    const ag = this.atomGroups()
    const mg = this.molGroups()

    for (let s = 0; s < steps; s++) {
      // Velocity Verlet: half-kick + drift (uses a(t) already in buffer).
      pass.setPipeline(this.pipelines.integratePos)
      pass.dispatchWorkgroups(ag)

      // Recompute a(t+dt).
      pass.setPipeline(this.pipelines.lj)
      pass.dispatchWorkgroups(ag)
      pass.setPipeline(this.pipelines.coulomb)
      pass.dispatchWorkgroups(ag)
      pass.setPipeline(this.pipelines.bonded)
      pass.dispatchWorkgroups(mg)

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

    // Reset the attraction counter, then rebuild the segment list on the GPU.
    this.device.queue.writeBuffer(this.segCountBuffer, 0, new Uint32Array([0]))

    const encoder = this.device.createCommandEncoder()

    const build = encoder.beginComputePass()
    build.setPipeline(this.attractionBuildPipeline)
    build.setBindGroup(0, this.attractionBuildBindGroup)
    build.dispatchWorkgroups(this.atomGroups())
    build.end()

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
    pass.draw(6, this.numAtoms)

    // Intramolecular bonds (cylinder impostors).
    if (this.numBonds > 0) {
      pass.setPipeline(this.bondPipeline)
      pass.setBindGroup(0, this.bondBindGroup)
      pass.draw(6, this.numBonds)
    }

    // Strong electrostatic attractions (lines).
    pass.setPipeline(this.attractionPipeline)
    pass.setBindGroup(0, this.attractionBindGroup)
    pass.draw(2, this.maxSeg)

    pass.end()
    this.device.queue.submit([encoder.finish()])
  }

  private writeCamera(camera: CameraView): void {
    const buf = new ArrayBuffer(CAMERA_BYTES)
    const f = new Float32Array(buf)
    f.set(camera.viewProj, 0)
    f[16] = camera.right[0]
    f[17] = camera.right[1]
    f[18] = camera.right[2]
    f[19] = 0
    f[20] = camera.up[0]
    f[21] = camera.up[1]
    f[22] = camera.up[2]
    f[23] = 0
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
    this.bondPairsBuffer?.destroy()
    this.segCountBuffer?.destroy()
    this.segPairsBuffer?.destroy()
    this.device?.destroy()
  }
}
