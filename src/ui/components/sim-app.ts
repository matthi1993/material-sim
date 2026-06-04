import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { MATERIALS, type SimConfig } from '../../sim/params'
import type { SimStats } from '../../sim/types'
import './control-panel'
import './stats-overlay'
import './atom-legend'

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
      <control-panel .running=${this.running}></control-panel>
      <stats-overlay .stats=${this.stats}></stats-overlay>
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'sim-app': SimApp
  }
}
