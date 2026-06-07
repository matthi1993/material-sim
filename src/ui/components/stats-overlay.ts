import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { SimStats } from '../../sim/types'
import { formatStats } from '../stats'

/**
 * Floating live-stats readout pinned to the top-right of the viewport.
 * Display only — receives a SimStats snapshot and renders it.
 */
@customElement('stats-overlay')
export class StatsOverlay extends LitElement {
  @property({ attribute: false }) stats: SimStats | null = null

  render() {
    const s = this.stats ? formatStats(this.stats) : null
    return html`
      <div class="overlay">
        <div class="stats">
          <div><span>FPS</span><b>${s ? s.fps : '—'}</b></div>
          <div><span>Atoms</span><b>${s ? s.atoms : '—'}</b></div>
          <div><span>Temp</span><b>${s ? s.temperature : '—'}</b></div>
          <div><span>Time</span><b>${s ? s.simulatedTime : '0 fs'}</b></div>
        </div>
      </div>
    `
  }

  static styles = css`
    .overlay {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      width: min(20rem, calc(100vw - 2 * var(--space-md)));
      padding: var(--space-md);
      background: var(--color-overlay);
      border: 1px solid var(--color-panel-border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      font-size: 0.8rem;
    }
    .stats {
      display: flex;
      gap: var(--space-lg);
    }
    .stats div {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    .stats span {
      color: var(--color-text-dim);
      font-size: 0.62rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .stats b {
      font-family: var(--font-mono);
      font-weight: 600;
      font-size: 0.95rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'stats-overlay': StatsOverlay
  }
}
