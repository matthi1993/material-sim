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
  @property({ attribute: false }) activeConfig: SimConfig | null = null
  @property({ type: Boolean }) running = false
  @property({ type: Number }) stepsPerFrame = DEFAULT_RUNTIME.stepsPerFrame
  @property() boundaryMode: BoundaryMode = DEFAULT_RUNTIME.boundaryMode
  @property({ type: Number }) targetTemperature = DEFAULT_RUNTIME.targetTemperature
  @property({ type: Boolean }) thermostatEnabled = DEFAULT_RUNTIME.thermostatEnabled
  @property({ type: Boolean }) forceGuardEnabled = DEFAULT_RUNTIME.forceGuardEnabled
  @property({ type: Number }) cutoffRadius = DEFAULT_RUNTIME.cutoffRadius

  /** Live camera frame source for the orientation gizmo (set by main.ts). */
  @property({ attribute: false }) basisProvider: (() => CameraBasis | null) | null = null

  @state() private activeSymbols: string[] = []
  @state() private fileMenuOpen = false

  @query('canvas') private canvasEl!: HTMLCanvasElement
  @query('#load-sim-file') private loadFileInput!: HTMLInputElement

  get canvas(): HTMLCanvasElement {
    return this.canvasEl
  }

  connectedCallback(): void {
    super.connectedCallback()
    // config-change bubbles up from the control panel; mirror it into the
    // legend. It keeps bubbling (composed) so main.ts still restarts the run.
    this.addEventListener('config-change', this.onConfigChange)
    document.addEventListener('click', this.onDocumentClick)
  }

  disconnectedCallback(): void {
    this.removeEventListener('config-change', this.onConfigChange)
    document.removeEventListener('click', this.onDocumentClick)
    super.disconnectedCallback()
  }

  private onDocumentClick = (): void => {
    this.fileMenuOpen = false
  }

  private onFileMenuClick = (event: Event): void => {
    event.stopPropagation()
    this.fileMenuOpen = !this.fileMenuOpen
  }

  private requestSave = (): void => {
    this.fileMenuOpen = false
    this.dispatchEvent(new CustomEvent('file-save', { bubbles: true, composed: true }))
  }

  private requestLoad = (): void => {
    this.fileMenuOpen = false
    this.loadFileInput.value = ''
    this.loadFileInput.click()
  }

  private onLoadFileChange = async (event: Event): Promise<void> => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      this.dispatchEvent(
        new CustomEvent('file-load', {
          detail: parsed,
          bubbles: true,
          composed: true,
        }),
      )
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('file-load-error', {
          detail: error instanceof Error ? error.message : String(error),
          bubbles: true,
          composed: true,
        }),
      )
    }
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
      <header class="topbar" @click=${(event: Event) => event.stopPropagation()}>
        <div class="menu-root">
          <button class="menu-button" @click=${this.onFileMenuClick}>File</button>
          ${this.fileMenuOpen
            ? html`
                <div class="menu-panel">
                  <button class="menu-item" @click=${this.requestSave}>Save simulation...</button>
                  <button class="menu-item" @click=${this.requestLoad}>Load simulation...</button>
                </div>
              `
            : null}
        </div>
        <p class="topbar-title">material-sim</p>
      </header>

      <input
        id="load-sim-file"
        class="hidden-input"
        type="file"
        accept="application/json,.json"
        @change=${this.onLoadFileChange}
      />

      <canvas></canvas>
      <control-panel
        .activeConfig=${this.activeConfig}
        .running=${this.running}
        .boundaryMode=${this.boundaryMode}
        .stepsPerFrame=${this.stepsPerFrame}
        .targetTemperature=${this.targetTemperature}
        .thermostatEnabled=${this.thermostatEnabled}
        .forceGuardEnabled=${this.forceGuardEnabled}
        .cutoffRadius=${this.cutoffRadius}
      ></control-panel>
      <div class="right-stack">
        <stats-overlay
          .stats=${this.stats}
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

    .topbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--titlebar-height);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 0 var(--space-md);
      box-sizing: border-box;
      background: color-mix(in srgb, var(--color-panel) 88%, transparent);
      border-bottom: 1px solid var(--color-panel-border);
      backdrop-filter: blur(10px);
    }

    .topbar-title {
      margin: 0;
      color: var(--color-text-dim);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .menu-root {
      position: relative;
    }

    .menu-button,
    .menu-item {
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 95%, transparent);
      color: var(--color-text);
      font: inherit;
      font-size: 0.76rem;
      cursor: pointer;
    }

    .menu-button {
      padding: 0.3rem 0.7rem;
    }

    .menu-panel {
      position: absolute;
      top: calc(100% + var(--space-xs));
      left: 0;
      width: 13rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px;
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: var(--color-panel);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    }

    .menu-item {
      text-align: left;
      border: none;
      background: transparent;
      padding: 0.45rem 0.55rem;
      border-radius: 6px;
    }

    .menu-item:hover,
    .menu-button:hover {
      filter: brightness(1.08);
    }

    .hidden-input {
      display: none;
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
      top: calc(var(--titlebar-height) + var(--space-md));
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
