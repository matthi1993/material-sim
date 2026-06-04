import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { DEFAULT_VIEW } from '../../sim/params'
import type { ViewOptions } from '../../sim/types'
import './number-field'

/**
 * Live display controls (atom size, force-line opacity, overlay toggles).
 * Self-contained: owns the ViewOptions state and emits `view-change` on every
 * edit. Applies without restarting the run.
 */
@customElement('view-controls')
export class ViewControls extends LitElement {
  @state() private view: ViewOptions = { ...DEFAULT_VIEW }

  private setView(patch: Partial<ViewOptions>): void {
    this.view = { ...this.view, ...patch }
    this.dispatchEvent(
      new CustomEvent('view-change', {
        detail: this.view,
        bubbles: true,
        composed: true,
      }),
    )
  }

  private toggle(label: string, checked: boolean, on: (v: boolean) => void) {
    return html`
      <label class="toggle">
        <span>${label}</span>
        <input
          type="checkbox"
          .checked=${checked}
          @change=${(e: Event) => on((e.target as HTMLInputElement).checked)}
        />
      </label>
    `
  }

  render() {
    const v = this.view
    return html`
      <div class="group">
        <number-field label="Atom size" .value=${v.atomScale} min="0.2" max="5" step="0.1"
          @value-change=${(e: CustomEvent<number>) => this.setView({ atomScale: e.detail })}></number-field>
        <number-field label="Force line opacity" .value=${v.forceOpacity} min="0" max="1" step="0.05"
          @value-change=${(e: CustomEvent<number>) => this.setView({ forceOpacity: e.detail })}></number-field>
        ${this.toggle('Show force lines', v.showForces, (b) => this.setView({ showForces: b }))}
        ${this.toggle('Show bonds', v.showBonds, (b) => this.setView({ showBonds: b }))}
        ${this.toggle('Show box', v.showBox, (b) => this.setView({ showBox: b }))}
      </div>
    `
  }

  static styles = css`
    .group {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--color-text-dim);
    }
    .toggle input {
      accent-color: var(--color-accent);
      width: 16px;
      height: 16px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'view-controls': ViewControls
  }
}
