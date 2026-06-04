import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Reusable labeled control: a numeric input paired with a range slider.
 * Fires `value-change` (CustomEvent<number>) on every edit. Holds no app
 * state — the parent owns the value and passes it back in.
 */
@customElement('number-field')
export class NumberField extends LitElement {
  @property() label = ''
  @property() unit = ''
  @property({ type: Number }) value = 0
  @property({ type: Number }) min = 0
  @property({ type: Number }) max = 100
  @property({ type: Number }) step = 1

  private clamp(v: number): number {
    return Math.min(this.max, Math.max(this.min, v))
  }

  private emit(v: number): void {
    this.dispatchEvent(
      new CustomEvent<number>('value-change', {
        detail: this.clamp(v),
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    return html`
      <label class="field">
        <span class="label-row">
          <span>${this.label}${this.unit ? ` (${this.unit})` : ''}</span>
          <input
            class="value-input"
            type="number"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.value)}
            @change=${(e: Event) =>
              this.emit(Number((e.target as HTMLInputElement).value))}
          />
        </span>
        <input
          type="range"
          min=${this.min}
          max=${this.max}
          step=${this.step}
          .value=${String(this.value)}
          @input=${(e: Event) =>
            this.emit(Number((e.target as HTMLInputElement).value))}
        />
      </label>
    `
  }

  static styles = css`
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      font-size: 0.8rem;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-text-dim);
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'number-field': NumberField
  }
}
