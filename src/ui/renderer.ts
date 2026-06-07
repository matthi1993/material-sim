// Camera + canvas controller. Pure view math (no physics, no GPU types). Owns
// an orbit camera and produces a CameraView for the backend each frame. Reads
// no simulation state.

import type { CameraView, Vec3 } from '../sim/types'

export type ProjectionMode = 'orthographic' | 'perspective'
/** Signed principal axis the camera can snap to look down. */
export type AxisKey = '+x' | '-x' | '+y' | '-y' | '+z' | '-z'

/** Orthonormal camera frame in world space (for the orientation gizmo). */
export interface CameraBasis {
  right: Vec3
  up: Vec3
  forward: Vec3
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement

  private target: Vec3 = [1, 1, 1]
  private distance = 5
  private azimuth = 0.6
  private elevation = 0.4
  private projection: ProjectionMode = 'orthographic'

  private dragging = false
  private lastX = 0
  private lastY = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.attachControls()
    this.resize()
  }

  /** Center the camera on a box and frame it. */
  frameBox(box: Vec3): void {
    this.target = [box[0] / 2, box[1] / 2, box[2] / 2]
    this.distance = Math.max(box[0], box[1], box[2]) * 1.8
  }

  setProjection(mode: ProjectionMode): void {
    this.projection = mode
  }

  getProjection(): ProjectionMode {
    return this.projection
  }

  /** Orbit so the camera looks straight down a signed principal axis. */
  snapToAxis(axis: AxisKey): void {
    const halfPi = Math.PI / 2 - 1e-3 // avoid the gimbal pole at exactly ±90°
    switch (axis) {
      case '+x': this.azimuth = 0; this.elevation = 0; break
      case '-x': this.azimuth = Math.PI; this.elevation = 0; break
      case '+z': this.azimuth = halfPi; this.elevation = 0; break
      case '-z': this.azimuth = -halfPi; this.elevation = 0; break
      case '+y': this.elevation = halfPi; break
      case '-y': this.elevation = -halfPi; break
    }
  }

  /** Current camera frame, used by the orientation gizmo. */
  getBasis(): CameraBasis {
    const eye = this.computeEye()
    const { right, up } = lookAt(eye, this.target, [0, 1, 0])
    const forward = normalize(sub(this.target, eye))
    return { right, up, forward }
  }

  private computeEye(): Vec3 {
    const ce = Math.cos(this.elevation)
    return [
      this.target[0] + this.distance * ce * Math.cos(this.azimuth),
      this.target[1] + this.distance * Math.sin(this.elevation),
      this.target[2] + this.distance * ce * Math.sin(this.azimuth),
    ]
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.floor(this.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.floor(this.canvas.clientHeight * dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  getCamera(): CameraView {
    this.resize()
    const aspect = this.canvas.width / this.canvas.height

    const eye = this.computeEye()
    const worldUp: Vec3 = [0, 1, 0]
    const { view, right, up } = lookAt(eye, this.target, worldUp)

    let proj: Float32Array
    if (this.projection === 'perspective') {
      proj = perspectiveZO((45 * Math.PI) / 180, aspect, 0.02, 1000)
    } else {
      // Orthographic: vertical extent scales with camera distance so the wheel
      // still zooms. No perspective foreshortening.
      const halfH = this.distance * 0.5
      const halfW = halfH * aspect
      proj = orthographicZO(-halfW, halfW, -halfH, halfH, 0.05, 1000)
    }
    const viewProj = multiply(proj, view)

    return { viewProj, right, up }
  }

  private attachControls(): void {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true
      this.lastX = e.clientX
      this.lastY = e.clientY
      this.canvas.setPointerCapture(e.pointerId)
    })
    this.canvas.addEventListener('pointerup', (e) => {
      this.dragging = false
      this.canvas.releasePointerCapture(e.pointerId)
    })
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return
      const dx = e.clientX - this.lastX
      const dy = e.clientY - this.lastY
      this.lastX = e.clientX
      this.lastY = e.clientY
      this.azimuth += dx * 0.01
      this.elevation = clamp(this.elevation + dy * 0.01, -1.5, 1.5)
    })
    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        const f = Math.exp(e.deltaY * 0.001)
        this.distance = clamp(this.distance * f, 0.5, 200)
      },
      { passive: false },
    )
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}
function normalize(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

/** Column-major view matrix. Returns camera right/up for billboarding. */
function lookAt(
  eye: Vec3,
  center: Vec3,
  up: Vec3,
): { view: Float32Array; right: Vec3; up: Vec3 } {
  const f = normalize(sub(center, eye)) // forward
  const s = normalize(cross(f, up)) // right
  const u = cross(s, f) // true up

  const view = new Float32Array(16)
  view[0] = s[0]
  view[1] = u[0]
  view[2] = -f[0]
  view[3] = 0
  view[4] = s[1]
  view[5] = u[1]
  view[6] = -f[1]
  view[7] = 0
  view[8] = s[2]
  view[9] = u[2]
  view[10] = -f[2]
  view[11] = 0
  view[12] = -dot(s, eye)
  view[13] = -dot(u, eye)
  view[14] = dot(f, eye)
  view[15] = 1
  return { view, right: s, up: u }
}

/** Orthographic with z mapped to [0, 1] (WebGPU clip space), column-major. */
function orthographicZO(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
): Float32Array {
  const m = new Float32Array(16)
  m[0] = 2 / (right - left)
  m[5] = 2 / (top - bottom)
  m[10] = 1 / (near - far)
  m[12] = -(right + left) / (right - left)
  m[13] = -(top + bottom) / (top - bottom)
  m[14] = near / (near - far)
  m[15] = 1
  return m
}

/** Right-handed perspective with z mapped to [0, 1] (WebGPU), column-major. */
function perspectiveZO(
  fovy: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1 / Math.tan(fovy / 2)
  const m = new Float32Array(16)
  m[0] = f / aspect
  m[5] = f
  m[10] = far / (near - far)
  m[11] = -1
  m[14] = (near * far) / (near - far)
  return m
}

/** a * b, both column-major. */
function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let sum = 0
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + r] * b[c * 4 + k]
      }
      out[c * 4 + r] = sum
    }
  }
  return out
}
