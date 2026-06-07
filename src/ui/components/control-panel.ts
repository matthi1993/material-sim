import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  DEFAULT_RUNTIME,
  MATERIAL_CATEGORIES,
  MATERIAL_LIST,
  PRESETS,
  type SimConfig,
} from '../../sim/params'
import './number-field'
import './preset-bar'
import './view-controls'

type Tab = 'mixture' | 'conditions' | 'view'

const TABS: { key: Tab; label: string }[] = [
  { key: 'mixture', label: 'Mixture' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'view', label: 'View' },
]

/**
 * Left control panel. Owns the form state for a run and fires events only —
 * never touches the backend or sim state. Emits `config-change` (restart),
 * `toggle-run` and `runtime-change` (live speed). Live display options come
 * from the embedded <view-controls>, which emits `view-change` directly.
 */
@customElement('control-panel')
export class ControlPanel extends LitElement {
  @property({ type: Boolean }) running = false

  @state() private tab: Tab = 'mixture'
  @state() private expanded: Record<string, boolean> = {
    molecules: true,
    ions: true,
    atoms: true,
  }

  // Per-material amounts (0 = not included). Seeded from the first preset.
  @state() private amounts: Record<string, number> = seedAmounts()
  @state() private bx = PRESETS[0].config.box[0]
  @state() private by = PRESETS[0].config.box[1]
  @state() private bz = PRESETS[0].config.box[2]
  @state() private temp = PRESETS[0].config.temperature
  @state() private cutoff = PRESETS[0].config.cutoffRadius
  @state() private dtFs = PRESETS[0].config.dt * 1000 // fs in the UI
  @state() private speed = DEFAULT_RUNTIME.stepsPerFrame

  private buildConfig(): SimConfig {
    const components = MATERIAL_LIST.filter(
      (m) => (this.amounts[m.key] ?? 0) > 0,
    ).map((m) => ({ materialKey: m.key, count: Math.round(this.amounts[m.key]) }))
    return {
      components:
        components.length > 0
          ? components
          : [{ materialKey: 'water', count: 1 }],
      box: [this.bx, this.by, this.bz],
      cutoffRadius: this.cutoff,
      dt: this.dtFs / 1000,
      temperature: this.temp,
    }
  }

  private apply = (): void => {
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

  private setExpanded(key: string, open: boolean): void {
    this.expanded = { ...this.expanded, [key]: open }
  }

  private toggleRun(): void {
    this.dispatchEvent(
      new CustomEvent('toggle-run', { bubbles: true, composed: true }),
    )
  }

  /** Live simulation speed — applies without restarting the system. */
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

  private subtitle(): string {
    const active = MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0)
    if (active.length === 0) return 'GPU molecular dynamics'
    return active.map((m) => m.label.replace(/ \(.*\)$/, '')).join(' + ')
  }

  private renderMixture() {
    return html`
      <div class="group">
        ${MATERIAL_CATEGORIES.map((cat) => {
          const items = MATERIAL_LIST.filter((m) => m.category === cat.key)
          if (items.length === 0) return null
          return html`
            <details
              class="section"
              ?open=${this.expanded[cat.key] ?? true}
              @toggle=${(e: Event) =>
                this.setExpanded(cat.key, (e.currentTarget as HTMLDetailsElement).open)}
            >
              <summary class="section-label">${cat.label}</summary>
              <div class="section-body">
                ${items.map(
                  (m) => html`
                    <number-field
                      label=${m.label}
                      unit=${m.unit}
                      .value=${this.amounts[m.key] ?? 0}
                      min="0"
                      max="1000"
                      step="1"
                      @value-change=${(e: CustomEvent<number>) =>
                        this.setAmount(m.key, e.detail)}
                    ></number-field>
                  `,
                )}
              </div>
            </details>
          `
        })}
      </div>
    `
  }

  private renderConditions() {
    return html`
      <div class="group">
        <number-field label="Box X" unit="nm" .value=${this.bx} min="1" max="20" step="0.1"
          @value-change=${(e: CustomEvent<number>) => (this.bx = e.detail)}></number-field>
        <number-field label="Box Y" unit="nm" .value=${this.by} min="1" max="20" step="0.1"
          @value-change=${(e: CustomEvent<number>) => (this.by = e.detail)}></number-field>
        <number-field label="Box Z" unit="nm" .value=${this.bz} min="1" max="20" step="0.1"
          @value-change=${(e: CustomEvent<number>) => (this.bz = e.detail)}></number-field>
        <number-field label="Cutoff" unit="nm" .value=${this.cutoff} min="0.3" max="2.0" step="0.05"
          @value-change=${(e: CustomEvent<number>) => (this.cutoff = e.detail)}></number-field>
        <number-field label="Temperature" unit="K" .value=${this.temp} min="1" max="3000" step="1"
          @value-change=${(e: CustomEvent<number>) => (this.temp = e.detail)}></number-field>
        <number-field label="Timestep" unit="fs" .value=${this.dtFs} min="0.05" max="5.0" step="0.05"
          @value-change=${(e: CustomEvent<number>) => (this.dtFs = e.detail)}></number-field>
        <number-field label="Speed" unit="steps/frame" .value=${this.speed} min="1" max="64" step="1"
          @value-change=${(e: CustomEvent<number>) => this.setSpeed(e.detail)}></number-field>
      </div>
    `
  }

  render() {
    const body =
      this.tab === 'mixture'
        ? this.renderMixture()
        : this.tab === 'conditions'
          ? this.renderConditions()
          : html`<view-controls></view-controls>`

    return html`
      <aside class="panel">
        <h1>material-sim</h1>
        <p class="subtitle">${this.subtitle()}</p>

        <preset-bar
          @preset-select=${(e: CustomEvent<string>) => this.applyPreset(e.detail)}
        ></preset-bar>

        <div class="tabs">
          ${TABS.map(
            (t) => html`
              <button
                class="tab ${this.tab === t.key ? 'active' : ''}"
                @click=${() => (this.tab = t.key)}
              >
                ${t.label}
              </button>
            `,
          )}
        </div>

        ${body}

        <div class="actions">
          <button class="primary" @click=${this.apply}>Apply &amp; Restart</button>
          <button @click=${this.toggleRun}>
            ${this.running ? 'Pause' : 'Resume'}
          </button>
        </div>
      </aside>
    `
  }

  static styles = css`
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
    .subtitle {
      margin: var(--space-xs) 0 var(--space-md);
      color: var(--color-text-dim);
      font-size: 0.8rem;
    }
    .tabs {
      display: flex;
      gap: var(--space-xs);
      margin: var(--space-lg) 0 var(--space-md);
      border-bottom: 1px solid var(--color-panel-border);
    }
    .tab {
      flex: 1;
      padding: var(--space-sm) 0;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-dim);
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
    }
    .tab.active {
      color: var(--color-text);
      border-bottom-color: var(--color-accent);
    }
    .tab:hover {
      color: var(--color-text);
    }
    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .section-label {
      list-style: none;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-dim);
      margin-top: var(--space-sm);
      padding-bottom: var(--space-xs);
      border-bottom: 1px solid var(--color-panel-border);
      cursor: pointer;
    }
    .section-label:first-child {
      margin-top: 0;
    }
    .section-label::-webkit-details-marker {
      display: none;
    }
    .section {
      display: block;
    }
    .section-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      margin-top: var(--space-sm);
    }
    .actions {
      display: flex;
      gap: var(--space-sm);
      margin: var(--space-lg) 0 0;
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
    .actions button:hover {
      filter: brightness(1.1);
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'control-panel': ControlPanel
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
