// Stats formatting helpers. Display only — no simulation state lives here.

import type { SimStats } from '../sim/types'

export function formatFps(fps: number): string {
  return fps > 0 ? fps.toFixed(0) : '—'
}

export function formatTemperature(t: number): string {
  return Number.isNaN(t) ? '—' : `${t.toFixed(0)} K`
}

export function formatStats(s: SimStats): {
  fps: string
  atoms: string
  temperature: string
} {
  return {
    fps: formatFps(s.fps),
    atoms: s.numAtoms.toLocaleString(),
    temperature: formatTemperature(s.temperature),
  }
}
