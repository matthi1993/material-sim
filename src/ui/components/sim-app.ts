import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { DEFAULT_RUNTIME, MATERIALS, type SimConfig } from '../../sim/params'
import type { BoundaryMode, SimStats } from '../../sim/types'
import type { CameraBasis } from '../renderer'
import './control-panel'
import './stats-overlay'
import './atom-legend'
import './view-gizmo'

/**
 * Top-level layout host. Renders the canvas plus the floating overlays
 * (control panel, stats top-right, element legend bottom-right). Holds no
 * simulation state — it forwards `stats`/`running` to children and derives the
 * active-element legend from the last applied config. main.ts owns the engine.
 */
@customElement('sim-app')
export class SimApp extends LitElement {
  @property({ attribute: false }) stats: SimStats | null = null
  @property({ type: Boolean }) running = false
  @property({ type: Number }) stepsPerFrame = DEFAULT_RUNTIME.stepsPerFrame
  @property() boundaryMode: BoundaryMode = DEFAULT_RUNTIME.boundaryMode

  /** Live camera frame source for the orientation gizmo (set by main.ts). */
  @property({ attribute: false }) basisProvider: (() => CameraBasis | null) | null = null

  @state() private activeSymbols: string[] = []

  @query('canvas') private canvasEl!: HTMLCanvasElement

  get canvas(): HTMLCanvasElement {
    return this.canvasEl
  }

  connectedCallback(): void {
    super.connectedCallback()
    // config-change bubbles up from the control panel; mirror it into the
    // legend. It keeps bubbling (composed) so main.ts still restarts the run.
    this.addEventListener('config-change', this.onConfigChange)
  }

  disconnectedCallback(): void {
    this.removeEventListener('config-change', this.onConfigChange)
    super.disconnectedCallback()
  }

  private onConfigChange = (e: Event): void => {
    const config = (e as CustomEvent<SimConfig>).detail
    const seen = new Set<string>()
    const symbols: string[] = []
    for (const comp of config.components) {
      const mat = MATERIALS[comp.materialKey]
      if (!mat || comp.count <= 0) continue
      for (const el of mat.elements) {
        if (!seen.has(el.symbol)) {
          seen.add(el.symbol)
          symbols.push(el.symbol)
        }
      }
    }
    this.activeSymbols = symbols
  }

  render() {
    return html`
      <canvas></canvas>
      <control-panel .running=${this.running} .boundaryMode=${this.boundaryMode}></control-panel>
      <div class="right-stack">
        <stats-overlay
          .stats=${this.stats}
          .stepsPerFrame=${this.stepsPerFrame}
        ></stats-overlay>
        <view-gizmo .basisProvider=${this.basisProvider}></view-gizmo>
      </div>
      <atom-legend .symbols=${this.activeSymbols}></atom-legend>
    `
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: var(--color-bg);
      color: var(--color-text);
      font-family: var(--font-ui);
    }
    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }
    .right-stack {
      position: absolute;
      top: var(--space-md);
      right: var(--space-md);
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-md);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'sim-app': SimApp
  }
}
