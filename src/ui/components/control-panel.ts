import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  DEFAULT_RUNTIME,
  MATERIAL_CATEGORIES,
  MATERIAL_LIST,
  PRESETS,
  type MaterialCategory,
  type MaterialDef,
  type SimConfig,
} from '../../sim/params'
import type { BoundaryMode, RuntimeConfig } from '../../sim/types'
import './number-field'
import './view-controls'

const SETUP_DEFAULT = PRESETS[0].config

type MaterialFilter = 'all' | MaterialCategory

@customElement('control-panel')
export class ControlPanel extends LitElement {
  @property({ type: Boolean }) running = false
  @property() boundaryMode: BoundaryMode = DEFAULT_RUNTIME.boundaryMode
  @property({ type: Number }) stepsPerFrame = DEFAULT_RUNTIME.stepsPerFrame
  @property({ type: Number }) targetTemperature = DEFAULT_RUNTIME.targetTemperature
  @property({ type: Boolean }) thermostatEnabled = DEFAULT_RUNTIME.thermostatEnabled

  @state() private showSetup = false
  @state() private presetKey = PRESETS[0].key
  @state() private filter: MaterialFilter = 'all'
  @state() private search = ''

  @state() private amounts: Record<string, number> = seedAmounts()
  @state() private bx = SETUP_DEFAULT.box[0]
  @state() private by = SETUP_DEFAULT.box[1]
  @state() private bz = SETUP_DEFAULT.box[2]
  @state() private temp = SETUP_DEFAULT.temperature
  @state() private cutoff = SETUP_DEFAULT.cutoffRadius
  @state() private dtFs = SETUP_DEFAULT.dt * 1000

  firstUpdated(): void {
    this.startSimulation()
  }

  private openSetup = (): void => {
    this.showSetup = true
  }

  private closeSetup = (): void => {
    this.showSetup = false
  }

  private toggleRun = (): void => {
    this.dispatchEvent(new CustomEvent('toggle-run', { bubbles: true, composed: true }))
  }

  private setRuntime(patch: Partial<RuntimeConfig>): void {
    this.dispatchEvent(
      new CustomEvent<Partial<RuntimeConfig>>('runtime-change', {
        detail: patch,
        bubbles: true,
        composed: true,
      }),
    )
  }

  private setAmount(key: string, value: number): void {
    this.amounts = { ...this.amounts, [key]: Math.max(0, Math.round(value)) }
  }

  private nudgeAmount(key: string, delta: number): void {
    this.setAmount(key, (this.amounts[key] ?? 0) + delta)
  }

  private applyPreset(key: string): void {
    const preset = PRESETS.find((p) => p.key === key)
    if (!preset) return

    this.presetKey = key
    const next: Record<string, number> = zeroAmounts()
    for (const comp of preset.config.components) next[comp.materialKey] = comp.count

    this.amounts = next
    this.bx = preset.config.box[0]
    this.by = preset.config.box[1]
    this.bz = preset.config.box[2]
    this.cutoff = preset.config.cutoffRadius
    this.dtFs = preset.config.dt * 1000
    this.temp = preset.config.temperature
  }

  private resetSetup = (): void => {
    this.presetKey = ''
    this.search = ''
    this.filter = 'all'
    this.amounts = zeroAmounts()
    this.bx = SETUP_DEFAULT.box[0]
    this.by = SETUP_DEFAULT.box[1]
    this.bz = SETUP_DEFAULT.box[2]
    this.cutoff = SETUP_DEFAULT.cutoffRadius
    this.dtFs = SETUP_DEFAULT.dt * 1000
    this.temp = SETUP_DEFAULT.temperature
  }

  private buildConfig(): SimConfig {
    const components = MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0).map((m) => ({
      materialKey: m.key,
      count: Math.round(this.amounts[m.key]),
    }))

    return {
      components,
      box: [this.bx, this.by, this.bz],
      cutoffRadius: this.cutoff,
      dt: this.dtFs / 1000,
      temperature: this.temp,
    }
  }

  private startSimulation = (): void => {
    this.dispatchEvent(
      new CustomEvent('config-change', {
        detail: this.buildConfig(),
        bubbles: true,
        composed: true,
      }),
    )
    this.showSetup = false
  }

  private get hasSelection(): boolean {
    return MATERIAL_LIST.some((m) => (this.amounts[m.key] ?? 0) > 0)
  }

  private get estimatedAtoms(): number {
    let total = 0
    for (const m of MATERIAL_LIST) {
      const c = Math.max(0, Math.round(this.amounts[m.key] ?? 0))
      if (c <= 0) continue
      total += c * atomsPerUnit(m)
    }
    return total
  }

  private get filteredMaterials(): MaterialDef[] {
    const q = this.search.trim().toLowerCase()
    return MATERIAL_LIST.filter((m) => {
      const byCategory = this.filter === 'all' || m.category === this.filter
      if (!byCategory) return false
      if (!q) return true
      return m.label.toLowerCase().includes(q) || m.key.toLowerCase().includes(q)
    })
  }

  private mixtureSummary(): string {
    const active = MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0)
    if (active.length === 0) return 'No particles selected'
    return active
      .slice(0, 3)
      .map((m) => `${m.label.replace(/ \(.*\)$/, '')}: ${this.amounts[m.key]}`)
      .join(' | ')
  }

  private boundaryButton(mode: BoundaryMode, label: string) {
    return html`
      <button
        class="boundary-option ${this.boundaryMode === mode ? 'active' : ''}"
        @click=${() => this.setRuntime({ boundaryMode: mode })}
      >
        ${label}
      </button>
    `
  }

  private runtimeField(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    unit: string,
    patch: (v: number) => Partial<RuntimeConfig>,
  ) {
    return html`
      <number-field
        label=${label}
        unit=${unit}
        .value=${value}
        min=${String(min)}
        max=${String(max)}
        step=${String(step)}
        @value-change=${(e: CustomEvent<number>) => this.setRuntime(patch(e.detail))}
      ></number-field>
    `
  }

  private renderMaterialFilter(): unknown {
    const options: { key: MaterialFilter; label: string }[] = [
      { key: 'all', label: 'All' },
      ...MATERIAL_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
    ]

    return html`
      <div class="filter-row">
        ${options.map(
          (o) => html`
            <button
              class="filter-chip ${this.filter === o.key ? 'active' : ''}"
              @click=${() => (this.filter = o.key)}
            >
              ${o.label}
            </button>
          `,
        )}
      </div>
    `
  }

  private renderMaterialRow(m: MaterialDef): unknown {
    const value = this.amounts[m.key] ?? 0
    return html`
      <div class="material-row ${m.key === 'polymer-c24' ? 'polymer' : ''}">
        <div class="material-meta">
          <strong>${m.label}</strong>
          <span>${m.unit}</span>
        </div>
        <div class="stepper">
          <button @click=${() => this.nudgeAmount(m.key, -1)} aria-label="Decrease">-</button>
          <input
            type="number"
            min="0"
            max="1000"
            step="1"
            .value=${String(value)}
            @change=${(e: Event) => this.setAmount(m.key, Number((e.target as HTMLInputElement).value))}
          />
          <button @click=${() => this.nudgeAmount(m.key, 1)} aria-label="Increase">+</button>
        </div>
      </div>
    `
  }

  private renderSetupDialog(): unknown {
    if (!this.showSetup) return null

    return html`
      <div class="dialog-backdrop" @click=${this.closeSetup}>
        <section class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <header class="dialog-head">
            <div>
              <h2>Create Simulation</h2>
              <p>Build a new scene with presets or custom particle counts.</p>
            </div>
            <button class="icon-btn" @click=${this.closeSetup} aria-label="Close">x</button>
          </header>

          <div class="preset-strip">
            ${PRESETS.map(
              (p) => html`
                <button
                  class="preset-pill ${this.presetKey === p.key ? 'active' : ''}"
                  @click=${() => this.applyPreset(p.key)}
                >
                  ${p.label}
                </button>
              `,
            )}
          </div>

          <div class="dialog-grid">
            <section class="pane pane-materials">
              <h3>Particles</h3>
              <input
                class="search"
                type="text"
                placeholder="Search materials..."
                .value=${this.search}
                @input=${(e: Event) => (this.search = (e.target as HTMLInputElement).value)}
              />
              ${this.renderMaterialFilter()}
              <div class="material-list">
                ${this.filteredMaterials.length > 0
                  ? this.filteredMaterials.map((m) => this.renderMaterialRow(m))
                  : html`<p class="empty">No matching materials.</p>`}
              </div>
            </section>

            <section class="pane pane-conditions">
              <h3>Conditions</h3>
              <div class="conditions-grid">
                <number-field label="Box X" unit="nm" .value=${this.bx} min="1" max="20" step="0.1"
                  @value-change=${(e: CustomEvent<number>) => (this.bx = e.detail)}></number-field>
                <number-field label="Box Y" unit="nm" .value=${this.by} min="1" max="20" step="0.1"
                  @value-change=${(e: CustomEvent<number>) => (this.by = e.detail)}></number-field>
                <number-field label="Box Z" unit="nm" .value=${this.bz} min="1" max="20" step="0.1"
                  @value-change=${(e: CustomEvent<number>) => (this.bz = e.detail)}></number-field>
                <number-field label="Cutoff" unit="nm" .value=${this.cutoff} min="0.3" max="2.0" step="0.05"
                  @value-change=${(e: CustomEvent<number>) => (this.cutoff = e.detail)}></number-field>
                <number-field label="Initial temperature" unit="K" .value=${this.temp} min="1" max="3000" step="1"
                  @value-change=${(e: CustomEvent<number>) => (this.temp = e.detail)}></number-field>
                <number-field label="Timestep" unit="fs" .value=${this.dtFs} min="0.05" max="5.0" step="0.05"
                  @value-change=${(e: CustomEvent<number>) => (this.dtFs = e.detail)}></number-field>
              </div>
            </section>

            <aside class="pane pane-summary">
              <h3>Summary</h3>
              <div class="summary-card">
                <div>
                  <span>Selected materials</span>
                  <b>${MATERIAL_LIST.filter((m) => (this.amounts[m.key] ?? 0) > 0).length}</b>
                </div>
                <div>
                  <span>Estimated atoms</span>
                  <b>${this.estimatedAtoms}</b>
                </div>
                <div>
                  <span>Polymer chains</span>
                  <b>${this.amounts['polymer-c24'] ?? 0}</b>
                </div>
              </div>
            </aside>
          </div>

          <footer class="dialog-actions">
            <button class="ghost" @click=${this.resetSetup}>Reset</button>
            <button class="ghost" @click=${this.closeSetup}>Cancel</button>
            <button class="primary" ?disabled=${!this.hasSelection} @click=${this.startSimulation}>
              Start Simulation
            </button>
          </footer>
        </section>
      </div>
    `
  }

  render() {
    return html`
      <aside class="panel">
        <div class="head">
          <div>
            <h1>material-sim</h1>
            <p class="subtitle">${this.mixtureSummary()}</p>
          </div>
          <button class="new-btn" @click=${this.openSetup}>New Simulation</button>
        </div>

        <section class="section-block">
          <h2>Runtime</h2>
          <div class="actions">
            <button class="pause-btn" @click=${this.toggleRun}>
              ${this.running ? 'Pause' : 'Resume'}
            </button>
            <label class="toggle-inline">
              <span>Thermostat</span>
              <input
                type="checkbox"
                .checked=${this.thermostatEnabled}
                @change=${(e: Event) =>
                  this.setRuntime({ thermostatEnabled: (e.target as HTMLInputElement).checked })}
              />
            </label>
          </div>
          <div class="group">
            ${this.runtimeField(
              'Simulation speed',
              this.stepsPerFrame,
              1,
              64,
              1,
              'steps/frame',
              (v) => ({ stepsPerFrame: Math.max(1, Math.round(v)) }),
            )}
            ${this.runtimeField(
              'Target temperature',
              this.targetTemperature,
              1,
              3000,
              1,
              'K',
              (v) => ({ targetTemperature: v }),
            )}
          </div>
          <div class="boundary-group">
            <span class="boundary-label">Boundary</span>
            <div class="boundary-options">
              ${this.boundaryButton('periodic', 'Periodic')}
              ${this.boundaryButton('open', 'Open')}
              ${this.boundaryButton('open-top', 'Open Top')}
            </div>
          </div>
        </section>

        <section class="section-block">
          <h2>View</h2>
          <view-controls></view-controls>
        </section>
      </aside>

      ${this.renderSetupDialog()}
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
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      z-index: 3;
    }

    .head {
      display: flex;
      justify-content: space-between;
      gap: var(--space-md);
      align-items: flex-start;
    }

    h1 {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.03em;
    }

    h2 {
      margin: 0;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-dim);
    }

    .subtitle {
      margin: var(--space-xs) 0 0;
      color: var(--color-text-dim);
      font-size: 0.73rem;
      line-height: 1.4;
      max-width: 18rem;
    }

    .new-btn,
    .ghost,
    .primary,
    .boundary-option,
    .icon-btn,
    .preset-pill,
    .filter-chip,
    .stepper button {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 90%, transparent);
      color: var(--color-text);
      font: inherit;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .new-btn {
      white-space: nowrap;
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .ghost {
      color: var(--color-text-dim);
    }

    .primary {
      background: var(--color-accent);
      border-color: var(--color-accent);
    }

    .primary[disabled] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      padding: var(--space-md);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      background: color-mix(in srgb, var(--color-panel) 92%, transparent);
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: var(--space-sm);
      align-items: center;
    }

    .pause-btn {
      padding: var(--space-sm) var(--space-md);
      border: 1px solid var(--color-accent);
      border-radius: var(--radius);
      background: var(--color-accent);
      color: var(--color-text);
      font: inherit;
      cursor: pointer;
    }

    .toggle-inline {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--color-text-dim);
      font-size: 0.78rem;
    }

    .toggle-inline input {
      width: 16px;
      height: 16px;
      accent-color: var(--color-accent);
    }

    .boundary-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .boundary-label {
      color: var(--color-text-dim);
      font-size: 0.75rem;
    }

    .boundary-options {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-xs);
    }

    .boundary-option {
      padding: var(--space-sm) var(--space-xs);
      color: var(--color-text-dim);
      font-size: 0.74rem;
    }

    .boundary-option.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: color-mix(in srgb, var(--color-bg) 72%, transparent);
      backdrop-filter: blur(3px);
      display: grid;
      place-items: center;
      padding: var(--space-lg);
    }

    .dialog {
      width: min(72rem, calc(100vw - 2 * var(--space-lg)));
      max-height: calc(100vh - 2 * var(--space-lg));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      background:
        radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--color-accent-dim) 40%, transparent), transparent 60%),
        var(--color-panel);
      border: 1px solid var(--color-panel-border);
      border-radius: 14px;
      box-shadow: 0 20px 70px rgba(0, 0, 0, 0.45);
      padding: var(--space-lg);
    }

    .dialog-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .dialog-head h2 {
      margin: 0;
      text-transform: none;
      letter-spacing: 0.01em;
      color: var(--color-text);
      font-size: 1.2rem;
    }

    .dialog-head p {
      margin: var(--space-xs) 0 0;
      color: var(--color-text-dim);
      font-size: 0.82rem;
    }

    .icon-btn {
      width: 2rem;
      height: 2rem;
      padding: 0;
      line-height: 1;
    }

    .preset-strip {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      padding-bottom: var(--space-sm);
      border-bottom: 1px solid var(--color-panel-border);
    }

    .preset-pill {
      padding: 0.35rem 0.55rem;
      color: var(--color-text-dim);
      font-size: 0.72rem;
    }

    .preset-pill.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .dialog-grid {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: 1.4fr 1fr 0.7fr;
      gap: var(--space-md);
    }

    .pane {
      min-height: 0;
      overflow: hidden;
      border: 1px solid var(--color-panel-border);
      border-radius: 10px;
      padding: var(--space-md);
      background: color-mix(in srgb, var(--color-panel) 94%, transparent);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .pane h3 {
      margin: 0;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-dim);
    }

    .search {
      width: 100%;
      padding: 0.45rem 0.55rem;
      color: var(--color-text);
      background: var(--color-bg);
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      font: inherit;
      box-sizing: border-box;
    }

    .search:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
    }

    .filter-chip {
      padding: 0.25rem 0.55rem;
      font-size: 0.7rem;
      color: var(--color-text-dim);
    }

    .filter-chip.active {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-dim);
    }

    .material-list {
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding-right: 0.15rem;
    }

    .material-row {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.5rem;
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 96%, transparent);
    }

    .material-row.polymer {
      border-color: color-mix(in srgb, var(--color-accent) 60%, var(--color-panel-border));
      background: color-mix(in srgb, var(--color-accent-dim) 35%, var(--color-panel));
    }

    .material-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .material-meta strong {
      font-size: 0.77rem;
      line-height: 1.2;
    }

    .material-meta span {
      font-size: 0.68rem;
      color: var(--color-text-dim);
    }

    .stepper {
      display: grid;
      grid-template-columns: 1.7rem 3.6rem 1.7rem;
      gap: 2px;
      align-items: center;
    }

    .stepper button {
      padding: 0;
      height: 1.8rem;
      font-size: 0.95rem;
    }

    .stepper input {
      width: 100%;
      box-sizing: border-box;
      height: 1.8rem;
      border-radius: 8px;
      border: 1px solid var(--color-panel-border);
      background: var(--color-bg);
      color: var(--color-text);
      text-align: center;
      font: inherit;
      font-size: 0.78rem;
    }

    .stepper input:focus {
      outline: none;
      border-color: var(--color-accent);
    }

    .conditions-grid {
      overflow: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .summary-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-sm);
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 96%, transparent);
    }

    .summary-card div {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-sm);
    }

    .summary-card span {
      color: var(--color-text-dim);
      font-size: 0.72rem;
    }

    .summary-card b {
      font-family: var(--font-mono);
      font-size: 0.95rem;
    }

    .empty {
      margin: 0;
      color: var(--color-text-dim);
      font-size: 0.75rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-sm);
      border-top: 1px solid var(--color-panel-border);
      padding-top: var(--space-md);
    }

    button:hover {
      filter: brightness(1.08);
    }

    @media (max-width: 1100px) {
      .dialog-grid {
        grid-template-columns: 1fr;
      }

      .pane-summary {
        order: -1;
      }
    }

    @media (max-width: 760px) {
      .panel {
        width: calc(100vw - 2 * var(--space-md));
        max-height: 48vh;
      }

      .actions {
        grid-template-columns: 1fr;
      }

      .boundary-options {
        grid-template-columns: 1fr;
      }

      .dialog {
        width: calc(100vw - 2 * var(--space-md));
        max-height: calc(100vh - 2 * var(--space-md));
        padding: var(--space-md);
      }

      .dialog-actions {
        justify-content: stretch;
      }

      .dialog-actions button {
        flex: 1;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'control-panel': ControlPanel
  }
}

function zeroAmounts(): Record<string, number> {
  const next: Record<string, number> = {}
  for (const m of MATERIAL_LIST) next[m.key] = 0
  return next
}

function seedAmounts(): Record<string, number> {
  const next = zeroAmounts()
  for (const comp of PRESETS[0].config.components) next[comp.materialKey] = comp.count
  return next
}

function atomsPerUnit(m: MaterialDef): number {
  if (m.kind === 'molecule' && m.molecule) return m.molecule.sites.length
  if (m.kind === 'ionic') return 2
  return 1
}
