// Stats formatting helpers. Display only — no simulation state lives here.

import type { SimStats } from '../sim/types'

export function formatFps(fps: number): string {
  return fps > 0 ? fps.toFixed(0) : '—'
}

export function formatTemperature(t: number): string {
  return Number.isNaN(t) ? '—' : `${t.toFixed(0)} K`
}

export function formatSimulatedTime(ps: number): string {
  if (!(ps > 0)) return '0 fs'

  const units = [
    { threshold: 24 * 60 * 60 * 1e12, scale: 24 * 60 * 60 * 1e12, label: 'd' },
    { threshold: 60 * 60 * 1e12, scale: 60 * 60 * 1e12, label: 'h' },
    { threshold: 60 * 1e12, scale: 60 * 1e12, label: 'min' },
    { threshold: 1e12, scale: 1e12, label: 's' },
    { threshold: 1e9, scale: 1e9, label: 'ms' },
    { threshold: 1e6, scale: 1e6, label: 'us' },
    { threshold: 1e3, scale: 1e3, label: 'ns' },
    { threshold: 1, scale: 1, label: 'ps' },
    { threshold: 0, scale: 1e-3, label: 'fs' },
  ]

  const unit = units.find((entry) => ps >= entry.threshold) ?? units[units.length - 1]
  const value = ps / unit.scale
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 1 ? 2 : 3
  return `${value.toFixed(digits)} ${unit.label}`
}

export function formatStats(s: SimStats): {
  fps: string
  atoms: string
  temperature: string
  simulatedTime: string
} {
  return {
    fps: formatFps(s.fps),
    atoms: s.numAtoms.toLocaleString(),
    temperature: formatTemperature(s.temperature),
    simulatedTime: formatSimulatedTime(s.simulatedTimePs),
  }
}
