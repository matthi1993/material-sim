import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** Element symbol -> theme color variable (mirrors render.wgsl palette). */
const ELEMENT_VARS: Record<string, string> = {
  O: '--el-o',
  H: '--el-h',
  Na: '--el-na',
  Cl: '--el-cl',
  Ar: '--el-ar',
  Fe: '--el-fe',
  Cu: '--el-cu',
  K: '--el-k',
  Br: '--el-br',
  Ne: '--el-ne',
  Au: '--el-au',
  Ag: '--el-ag',
  Ni: '--el-ni',
}

/**
 * Floating element legend pinned to the bottom-right of the viewport. Receives
 * the list of element symbols currently in the system and shows their colors.
 */
@customElement('atom-legend')
export class AtomLegend extends LitElement {
  @property({ attribute: false }) symbols: string[] = []

  render() {
    if (this.symbols.length === 0) return null
    return html`
      <div class="legend">
        ${this.symbols.map(
          (sym) => html`
            <span class="item">
              <i
                class="dot"
                style=${`background: var(${ELEMENT_VARS[sym] ?? '--color-text-dim'})`}
              ></i>
              ${sym}
            </span>
          `,
        )}
      </div>
    `
  }

  static styles = css`
    :host {
      position: absolute;
      bottom: var(--space-md);
      right: var(--space-md);
      z-index: 2;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-sm);
      max-width: 240px;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--color-text-dim);
    }
    .item {
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
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'atom-legend': AtomLegend
  }
}
