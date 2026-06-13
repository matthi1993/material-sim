import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { StructureEntry } from '../../sim/types'

/**
 * Floating structure legend pinned to bottom-right. Entries are grouped by
 * connected bonded structure and include counts (e.g. 20 x H2O).
 */
@customElement('atom-legend')
export class AtomLegend extends LitElement {
  @property({ attribute: false }) entries: StructureEntry[] = []

  render() {
    if (this.entries.length === 0) return null
    return html`
      <div class="legend">
        <p class="title">Structures</p>
        <div class="list">
          ${this.entries.map((entry) => this.renderEntry(entry))}
        </div>
      </div>
    `
  }

  private renderEntry(entry: StructureEntry) {
    return html`
      <div class="item">
        <span class="name">${entry.count} x ${entry.name}</span>
        <span class="kind">${entry.kind}</span>
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
      width: min(24rem, calc(100vw - 2 * var(--space-md)));
      max-height: min(38vh, 20rem);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-md);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      font-family: var(--font-ui);
      color: var(--color-text);
    }
    .title {
      margin: 0;
      color: var(--color-text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.7rem;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      overflow: auto;
      padding-right: 2px;
    }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.3rem 0.4rem;
      border: 1px solid var(--color-panel-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-panel) 92%, transparent);
      font-family: var(--font-mono);
      font-size: 0.86rem;
    }
    .name {
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kind {
      color: var(--color-text-dim);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'atom-legend': AtomLegend
  }
}
