import { LitElement, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import {
  DEFAULT_RUNTIME,
  MATERIAL_LIST,
  PRESETS,
  type SimConfig,
} from '../../sim/params'
import type { SimStats } from '../../sim/types'
import { formatStats } from '../stats'

const ELEMENT_VARS: Record<string, string> = {
  O: '--el-o',
  H: '--el-h',
  Na: '--el-na',
  Cl: '--el-cl',
  Ar: '--el-ar',
  Fe: '--el-fe',
  Cu: '--el-cu',
}

/**
 * Top-level UI. Renders the canvas and a control panel. Fires events only —
 * it never calls the backend or holds simulation state. main.ts owns the
 * engine and listens for `config-change` / `toggle-run` / `runtime-change`.
 */
@customElement('sim-app')
export class SimApp extends LitElement {
  @property({ attribute: false }) stats: SimStats | null = null
  @property({ type: Boolean }) running = false

  // Per-material amounts (0 = not included). Seeded from the first preset.
  @state() private amounts: Record<string, number> = seedAmounts()
  @state() private bx = PRESETS[0].config.box[0]
  @state() private by = PRESETS[0].config.box[1]
  @state() private bz = PRESETS[0].config.box[2]
  @state() private temp = PRESETS[0].config.temperature
  @state() private cutoff = PRESETS[0].config.cutoffRadius
  @state() private dtFs = PRESETS[0].config.dt * 1000 // fs in the UI
  @state() private speed = DEFAULT_RUNTIME.stepsPerFrame

  @query('canvas') private canvasEl!: HTMLCanvasElement

  get canvas(): HTMLCanvasElement {
    return this.canvasEl
  }

  private buildConfig(): SimConfig {
    const components = MATERIAL_LIST.filter(
      (m) => (this.amounts[m.key] ?? 0) > 0,
    ).map((m) => ({ materialKey: m.key, count: Math.round(this.amounts[m.key]) }))
    return {
      components: components.length > 0 ? components : [{ materialKey: 'water', count: 1 }],
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

  private applyPreset(key: string): void {
    const preset = PRESETS.find((p) => p.key === key)
    if (!preset) return
    const c = preset.config
    const next: Record<string, number> = {}
    for (const m of MATERIAL_LIST) next[m.key] = 0
    for (const comp of c.components) next[comp.materialKey] = comp.count
    this.amounts = next
    this.bx = c.box[0]
    this.by = c.box[1]
    this.bz = c.box[2]
    this.temp = c.temperature
    this.cutoff = c.cutoffRadius
    this.dtFs = c.dt * 1000
    this.apply()
  }

  private setAmount(key: string, v: number): void {
    this.amounts = { ...this.amounts, [key]: Math.max(0, Math.round(v)) }
  }

  private toggleRun(): void {
    this.dispatchEvent(
      new CustomEvent('toggle-run', { bubbles: true, composed: true }),
    )
  }

  /** Live simulation speed change — applies without restarting the system. */
  private setSpeed(v: number): void {
    this.speed = Math.max(1, Math.round(v))
    this.dispatchEvent(
      new CustomEvent('runtime-change', {
        detail: { stepsPerFrame: this.speed },
        bubbles: true,
        composed: true,
      }),
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
    const clamp = (v: number) => Math.min(max, Math.max(min, v))
    return html`
      <label class="field">
        <span class="label-row">
          <span>${label}${unit ? ` (${unit})` : ''}</span>
          <input
            class="value-input"
            type="number"
            min=${min}
            max=${max}
            step=${step}
            .value=${String(value)}
            @change=${(e: Event) => {
              const v = clamp(Number((e.target as HTMLInputElement).value))
              onInput(v)
            }}
          />
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

  private subtitle(): string {
    const active = MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0)
    if (active.length === 0) return 'GPU molecular dynamics'
    return active.map((m) => m.label).join(' + ')
  }

  private legend() {
    const active = MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0)
    const seen = new Set<string>()
    const items = active.flatMap((m) =>
      m.elements
        .filter((el) => !seen.has(el.symbol) && (seen.add(el.symbol), true))
        .map(
          (el) => html`
            <span class="legend-item">
              <i
                class="dot"
                style=${`background: var(${ELEMENT_VARS[el.symbol] ?? '--color-text-dim'})`}
              ></i>
              ${el.symbol}
            </span>
          `,
        ),
    )
    return items.length ? html`<div class="legend">${items}</div>` : null
  }

  render() {
    const s = this.stats ? formatStats(this.stats) : null
    return html`
      <canvas></canvas>

      <aside class="panel">
        <h1>material-sim</h1>
        <p class="subtitle">${this.subtitle()}</p>

        <div class="presets">
          ${PRESETS.map(
            (p) => html`
              <button class="chip" @click=${() => this.applyPreset(p.key)}>
                ${p.label}
              </button>
            `,
          )}
        </div>

        <h2>Mixture</h2>
        <div class="group">
          ${MATERIAL_LIST.map((m) =>
            this.num(
              m.label,
              this.amounts[m.key] ?? 0,
              0,
              4000,
              1,
              (v) => this.setAmount(m.key, v),
              m.unit,
            ),
          )}
        </div>

        ${this.legend()}

        <h2>Conditions</h2>
        <div class="group">
          ${this.num('Box X', this.bx, 1, 20, 0.1, (v) => (this.bx = v), 'nm')}
          ${this.num('Box Y', this.by, 1, 20, 0.1, (v) => (this.by = v), 'nm')}
          ${this.num('Box Z', this.bz, 1, 20, 0.1, (v) => (this.bz = v), 'nm')}
          ${this.num('Cutoff', this.cutoff, 0.3, 2.0, 0.05, (v) => (this.cutoff = v), 'nm')}
          ${this.num('Temperature', this.temp, 1, 3000, 1, (v) => (this.temp = v), 'K')}
          ${this.num('Timestep', this.dtFs, 0.05, 5.0, 0.05, (v) => (this.dtFs = v), 'fs')}
          ${this.num('Speed', this.speed, 1, 64, 1, (v) => this.setSpeed(v), 'steps/frame')}
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
      max-height: calc(100vh - 2 * var(--space-md));
      overflow-y: auto;
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
    h2 {
      margin: var(--space-lg) 0 var(--space-sm);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-text-dim);
    }
    .subtitle {
      margin: var(--space-xs) 0 var(--space-md);
      color: var(--color-text-dim);
      font-size: 0.8rem;
    }
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }
    .chip {
      flex: 0 0 auto;
      padding: var(--space-xs) var(--space-sm);
      font-size: 0.72rem;
      background: var(--color-accent-dim);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      color: var(--color-text);
      cursor: pointer;
    }
    .chip:hover {
      filter: brightness(1.15);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-top: var(--space-md);
      font-size: 0.72rem;
      color: var(--color-text-dim);
      font-family: var(--font-mono);
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
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
    .value-input {
      width: 5.5em;
      padding: 2px 4px;
      box-sizing: border-box;
      text-align: right;
      color: var(--color-text);
      font-family: var(--font-mono);
      font-size: 0.8rem;
      background: var(--color-bg);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
    }
    .value-input:focus {
      outline: none;
      border-color: var(--color-accent);
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

/** Initial per-material amounts taken from the first preset. */
function seedAmounts(): Record<string, number> {
  const next: Record<string, number> = {}
  for (const m of MATERIAL_LIST) next[m.key] = 0
  for (const comp of PRESETS[0].config.components) {
    next[comp.materialKey] = comp.count
  }
  return next
}
