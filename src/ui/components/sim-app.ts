import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { DEFAULT_CONFIG, TIP3P, type SimConfig } from '../../sim/params'
import type { SimStats } from '../../sim/types'
import { formatStats } from '../stats'

/**
 * Top-level UI. Renders the canvas and a control panel. Fires events only —
 * it never calls the backend or holds simulation state. main.ts owns the
 * engine and listens for `config-change` / `toggle-run`.
 */
@customElement('sim-app')
export class SimApp extends LitElement {
  @property({ attribute: false }) stats: SimStats | null = null
  @property({ type: Boolean }) running = false

  @state() private mols = DEFAULT_CONFIG.numMolecules
  @state() private bx = DEFAULT_CONFIG.box[0]
  @state() private by = DEFAULT_CONFIG.box[1]
  @state() private bz = DEFAULT_CONFIG.box[2]
  @state() private temp = DEFAULT_CONFIG.temperature
  @state() private cutoff = DEFAULT_CONFIG.cutoffRadius
  @state() private dtFs = DEFAULT_CONFIG.dt * 1000 // fs in the UI

  @query('canvas') private canvasEl!: HTMLCanvasElement

  get canvas(): HTMLCanvasElement {
    return this.canvasEl
  }

  private buildConfig(): SimConfig {
    return {
      forceField: TIP3P,
      numMolecules: Math.max(1, Math.round(this.mols)),
      box: [this.bx, this.by, this.bz],
      cutoffRadius: this.cutoff,
      dt: this.dtFs / 1000,
      temperature: this.temp,
    }
  }

  private apply(): void {
    this.dispatchEvent(
      new CustomEvent('config-change', {
        detail: this.buildConfig(),
        bubbles: true,
        composed: true,
      }),
    )
  }

  private toggleRun(): void {
    this.dispatchEvent(
      new CustomEvent('toggle-run', { bubbles: true, composed: true }),
    )
  }

  firstUpdated(): void {
    // Kick off the first run once the canvas exists.
    this.apply()
  }

  private num(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onInput: (v: number) => void,
    unit = '',
  ) {
    return html`
      <label class="field">
        <span class="label-row">
          <span>${label}</span>
          <span class="value">${value}${unit ? ` ${unit}` : ''}</span>
        </span>
        <input
          type="range"
          min=${min}
          max=${max}
          step=${step}
          .value=${String(value)}
          @input=${(e: Event) =>
            onInput(Number((e.target as HTMLInputElement).value))}
        />
      </label>
    `
  }

  render() {
    const s = this.stats ? formatStats(this.stats) : null
    return html`
      <canvas></canvas>

      <aside class="panel">
        <h1>material-sim</h1>
        <p class="subtitle">TIP3P water · GPU MD</p>

        <div class="group">
          ${this.num('Molecules', this.mols, 8, 1000, 1, (v) => (this.mols = v))}
          ${this.num('Box X', this.bx, 1, 6, 0.1, (v) => (this.bx = v), 'nm')}
          ${this.num('Box Y', this.by, 1, 6, 0.1, (v) => (this.by = v), 'nm')}
          ${this.num('Box Z', this.bz, 1, 6, 0.1, (v) => (this.bz = v), 'nm')}
          ${this.num('Cutoff', this.cutoff, 0.6, 1.2, 0.05, (v) => (this.cutoff = v), 'nm')}
          ${this.num('Temperature', this.temp, 1, 600, 1, (v) => (this.temp = v), 'K')}
          ${this.num('Timestep', this.dtFs, 0.2, 1.0, 0.1, (v) => (this.dtFs = v), 'fs')}
        </div>

        <div class="actions">
          <button class="primary" @click=${this.apply}>Apply &amp; Restart</button>
          <button @click=${this.toggleRun}>
            ${this.running ? 'Pause' : 'Resume'}
          </button>
        </div>

        <div class="stats">
          <div><span>FPS</span><b>${s ? s.fps : '—'}</b></div>
          <div><span>Atoms</span><b>${s ? s.atoms : '—'}</b></div>
          <div><span>Temp</span><b>${s ? s.temperature : '—'}</b></div>
        </div>
      </aside>
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
    .panel {
      position: absolute;
      top: var(--space-md);
      left: var(--space-md);
      width: var(--panel-width);
      box-sizing: border-box;
      padding: var(--space-lg);
      background: color-mix(in srgb, var(--color-panel) 88%, transparent);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
    }
    h1 {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.02em;
    }
    .subtitle {
      margin: var(--space-xs) 0 var(--space-md);
      color: var(--color-text-dim);
      font-size: 0.8rem;
    }
    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: 0.8rem;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      color: var(--color-text-dim);
    }
    .value {
      color: var(--color-text);
      font-family: var(--font-mono);
    }
    input[type='range'] {
      width: 100%;
      accent-color: var(--color-accent);
      background: transparent;
    }
    .actions {
      display: flex;
      gap: var(--space-sm);
      margin: var(--space-lg) 0 var(--space-md);
    }
    button {
      flex: 1;
      padding: var(--space-sm);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: var(--color-accent-dim);
      color: var(--color-text);
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
    }
    button.primary {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }
    button:hover {
      filter: brightness(1.1);
    }
    .stats {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding-top: var(--space-md);
      border-top: 1px solid var(--color-panel-border);
      font-size: 0.8rem;
    }
    .stats div {
      display: flex;
      justify-content: space-between;
    }
    .stats span {
      color: var(--color-text-dim);
    }
    .stats b {
      font-family: var(--font-mono);
      font-weight: 600;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'sim-app': SimApp
  }
}
