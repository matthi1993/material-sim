import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { PRESETS } from '../../sim/params'

/**
 * Row of one-click preset buttons. Emits `preset-select` (CustomEvent<string>)
 * with the preset key; the control panel applies it.
 */
@customElement('preset-bar')
export class PresetBar extends LitElement {
  private select(key: string): void {
    this.dispatchEvent(
      new CustomEvent<string>('preset-select', {
        detail: key,
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    return html`
      <div class="presets">
        ${PRESETS.map(
          (p) => html`
            <button class="chip" @click=${() => this.select(p.key)}>
              ${p.label}
            </button>
          `,
        )}
      </div>
    `
  }

  static styles = css`
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'preset-bar': PresetBar
  }
}
