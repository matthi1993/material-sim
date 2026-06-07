import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import type { AxisKey, CameraBasis, ProjectionMode } from '../renderer'

/** One drawable axis end (a labelled handle the user can click). */
interface Handle {
  axis: AxisKey
  label: string
  x: number
  y: number
  depth: number
  color: string
  filled: boolean
}

/**
 * Orientation gizmo: a small navigation cube with X/Y/Z axes reflecting the
 * live camera frame, plus a projection (perspective/orthographic) switch.
 * Reads the camera frame each rAF through `basisProvider` (view-only, no sim
 * state) and emits `camera-axis` / `projection-change` events. main.ts applies
 * them to the renderer.
 */
@customElement('view-gizmo')
export class ViewGizmo extends LitElement {
  /** Supplies the live camera frame; set by main.ts to read the renderer. */
  @property({ attribute: false }) basisProvider: (() => CameraBasis | null) | null = null

  @state() private projection: ProjectionMode = 'orthographic'

  @query('canvas') private canvasEl!: HTMLCanvasElement

  private raf = 0
  private handles: Handle[] = []
  private readonly size = 92
  private colors = { x: '#ff5a63', y: '#5cd97a', z: '#4c8dff', cube: '#8b90a0', bg: '#0b0c10' }

  connectedCallback(): void {
    super.connectedCallback()
    this.raf = requestAnimationFrame(this.frame)
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.raf)
    super.disconnectedCallback()
  }

  firstUpdated(): void {
    const s = getComputedStyle(this)
    this.colors = {
      x: s.getPropertyValue('--axis-x').trim() || this.colors.x,
      y: s.getPropertyValue('--axis-y').trim() || this.colors.y,
      z: s.getPropertyValue('--axis-z').trim() || this.colors.z,
      cube: s.getPropertyValue('--axis-cube').trim() || this.colors.cube,
      bg: s.getPropertyValue('--color-bg').trim() || this.colors.bg,
    }
  }

  private frame = (): void => {
    this.draw()
    this.raf = requestAnimationFrame(this.frame)
  }

  private setProjection(mode: ProjectionMode): void {
    if (this.projection === mode) return
    this.projection = mode
    this.dispatchEvent(
      new CustomEvent<ProjectionMode>('projection-change', {
        detail: mode,
        bubbles: true,
        composed: true,
      }),
    )
  }

  private onPick = (e: PointerEvent): void => {
    const rect = this.canvasEl.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    let best: Handle | null = null
    let bestD = 14 * 14 // hit radius squared
    for (const h of this.handles) {
      const dx = h.x - px
      const dy = h.y - py
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = h
      }
    }
    if (!best) return
    this.dispatchEvent(
      new CustomEvent<AxisKey>('camera-axis', {
        detail: best.axis,
        bubbles: true,
        composed: true,
      }),
    )
  }

  private draw(): void {
    const cv = this.canvasEl
    if (!cv) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const px = Math.round(this.size * dpr)
    if (cv.width !== px) {
      cv.width = px
      cv.height = px
    }
    const ctx = cv.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, this.size, this.size)

    const basis = this.basisProvider?.() ?? null
    const cx = this.size / 2
    const cy = this.size / 2
    if (!basis) return

    const R = this.size * 0.34
    // World axis dir -> 2D screen offset using the camera frame. y flips for
    // canvas coordinates (down is positive).
    const project = (d: [number, number, number]) => ({
      x: d[0] * basis.right[0] + d[1] * basis.right[1] + d[2] * basis.right[2],
      y: -(d[0] * basis.up[0] + d[1] * basis.up[1] + d[2] * basis.up[2]),
      z: d[0] * basis.forward[0] + d[1] * basis.forward[1] + d[2] * basis.forward[2],
    })

    this.drawCube(ctx, cx, cy, R * 0.42, project)

    const axes: { dir: [number, number, number]; key: AxisKey; neg: AxisKey; label: string; color: string }[] = [
      { dir: [1, 0, 0], key: '+x', neg: '-x', label: 'X', color: this.colors.x },
      { dir: [0, 1, 0], key: '+y', neg: '-y', label: 'Y', color: this.colors.y },
      { dir: [0, 0, 1], key: '+z', neg: '-z', label: 'Z', color: this.colors.z },
    ]

    const handles: Handle[] = []
    for (const a of axes) {
      const p = project(a.dir)
      handles.push({ axis: a.key, label: a.label, x: cx + p.x * R, y: cy + p.y * R, depth: p.z, color: a.color, filled: true })
      handles.push({ axis: a.neg, label: '', x: cx - p.x * R, y: cy - p.y * R, depth: -p.z, color: a.color, filled: false })
    }
    this.handles = handles

    // Far handles first so near ones overlap on top.
    const ordered = [...handles].sort((m, n) => m.depth - n.depth)
    for (const h of ordered) {
      if (h.filled) {
        ctx.strokeStyle = h.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(h.x, h.y)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(h.x, h.y, h.filled ? 8 : 5, 0, Math.PI * 2)
      if (h.filled) {
        ctx.fillStyle = h.color
        ctx.fill()
        ctx.fillStyle = this.colors.bg
        ctx.font = '600 9px ui-monospace, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(h.label, h.x, h.y + 0.5)
      } else {
        ctx.fillStyle = this.colors.bg
        ctx.fill()
        ctx.strokeStyle = h.color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }

  private drawCube(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    h: number,
    project: (d: [number, number, number]) => { x: number; y: number; z: number },
  ): void {
    const corners: [number, number, number][] = []
    for (let i = 0; i < 8; i++) {
      corners.push([
        (i & 1 ? 1 : -1) * h,
        (i & 2 ? 1 : -1) * h,
        (i & 4 ? 1 : -1) * h,
      ])
    }
    const pts = corners.map((c) => {
      const p = project(c)
      return { x: cx + p.x, y: cy + p.y, z: p.z }
    })
    const edges = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ]
    ctx.strokeStyle = this.colors.cube
    ctx.globalAlpha = 0.55
    ctx.lineWidth = 1
    for (const [a, b] of edges) {
      ctx.beginPath()
      ctx.moveTo(pts[a].x, pts[a].y)
      ctx.lineTo(pts[b].x, pts[b].y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  render() {
    return html`
      <div class="gizmo">
        <canvas
          width=${this.size}
          height=${this.size}
          @pointerdown=${this.onPick}
        ></canvas>
        <div class="proj">
          <button
            class=${this.projection === 'perspective' ? 'active' : ''}
            @click=${() => this.setProjection('perspective')}
          >
            Persp
          </button>
          <button
            class=${this.projection === 'orthographic' ? 'active' : ''}
            @click=${() => this.setProjection('orthographic')}
          >
            Ortho
          </button>
        </div>
      </div>
    `
  }

  static styles = css`
    :host {
      position: absolute;
      top: calc(var(--space-md) + 52px);
      right: var(--space-md);
      z-index: 2;
    }
    .gizmo {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-sm);
      padding: var(--space-sm);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
    }
    canvas {
      width: 92px;
      height: 92px;
      align-self: center;
      cursor: pointer;
      touch-action: none;
    }
    .proj {
      display: flex;
      gap: var(--space-xs);
    }
    .proj button {
      flex: 1;
      padding: 4px 0;
      font: inherit;
      font-size: 0.66rem;
      color: var(--color-text-dim);
      background: var(--color-accent-dim);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      cursor: pointer;
    }
    .proj button.active {
      color: var(--color-text);
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    .proj button:hover {
      filter: brightness(1.1);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'view-gizmo': ViewGizmo
  }
}
