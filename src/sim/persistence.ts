import type { SimConfig } from './params'
import type { RuntimeConfig, ViewOptions } from './types'

export interface SavedAtomState {
  numAtoms: number
  simulatedTimePs: number
  positions: number[]
  velocities: number[]
}

export interface SavedSimulationFile {
  version: 1
  savedAt: string
  config: SimConfig
  atomState?: SavedAtomState
  runtime?: Partial<RuntimeConfig>
  view?: Partial<ViewOptions>
  projection?: 'orthographic' | 'perspective'
}

export function isSavedSimulationFile(value: unknown): value is SavedSimulationFile {
  if (!value || typeof value !== 'object') return false
  const data = value as Record<string, unknown>
  if (data.version !== 1) return false
  if (!isSimConfig(data.config)) return false
  if (data.atomState !== undefined && !isAtomState(data.atomState)) return false
  if (data.projection !== undefined && data.projection !== 'orthographic' && data.projection !== 'perspective') {
    return false
  }
  return true
}

function isAtomState(value: unknown): value is SavedAtomState {
  if (!value || typeof value !== 'object') return false
  const state = value as Record<string, unknown>
  if (typeof state.numAtoms !== 'number' || state.numAtoms < 1) return false
  if (typeof state.simulatedTimePs !== 'number') return false
  if (!Array.isArray(state.positions) || !Array.isArray(state.velocities)) return false
  if (state.positions.length !== state.velocities.length) return false
  if (state.positions.length !== state.numAtoms * 4) return false
  if (state.positions.length % 4 !== 0) return false
  if (!state.positions.every((v) => typeof v === 'number')) return false
  if (!state.velocities.every((v) => typeof v === 'number')) return false
  return true
}

function isSimConfig(value: unknown): value is SimConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as Record<string, unknown>
  if (!Array.isArray(config.components)) return false
  if (!Array.isArray(config.box) || config.box.length !== 3) return false
  if (typeof config.dt !== 'number' || typeof config.temperature !== 'number') return false

  for (const component of config.components) {
    if (!component || typeof component !== 'object') return false
    const entry = component as Record<string, unknown>
    if (typeof entry.materialKey !== 'string' || typeof entry.count !== 'number') return false
  }

  return config.box.every((axis) => typeof axis === 'number')
}
