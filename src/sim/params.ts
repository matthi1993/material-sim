// Default runtime values and JSON-driven material/preset catalog.

import { ELEMENTS, type ElementDef } from './elements'
import { type MoleculeTemplate } from './molecules'
import type { RuntimeConfig, Vec3, ViewOptions } from './types'

export { ELEMENTS, type ElementDef } from './elements'
export type { MoleculeTemplate } from './molecules'

export const KB = 0.00831446261815324
export const COULOMB_K = 138.935458

export type MaterialCategory = 'molecules' | 'polymers' | 'ions' | 'atoms'
export type MaterialKind = 'molecule' | 'ionic' | 'atomic'

export interface MaterialDef {
  key: string
  label: string
  kind: MaterialKind
  category: MaterialCategory
  elements: ElementDef[]
  molecule?: MoleculeTemplate
  nn: number
  unit: string
}

export interface MixtureComponent {
  materialKey: string
  count: number
}

export interface SimConfig {
  components: MixtureComponent[]
  box: Vec3
  dt: number
  temperature: number
}

export interface Preset {
  key: string
  label: string
  topic: string
  topicLabel: string
  config: SimConfig
}

export interface PresetTopic {
  key: string
  label: string
}

interface MaterialJson {
  key: string
  label: string
  kind: MaterialKind
  category: MaterialCategory
  elements: string[]
  nn: number
  unit: string
  order?: number
  molecule?: {
    sites: Array<{ element: string; pos: [number, number, number]; charge?: number; sigma?: number; epsilon?: number }>
    bonds: Array<{ a: number; b: number; r0: number; k: number }>
    angles: Array<{ a: number; b: number; c: number; theta0: number; k: number }>
  }
}

interface PresetJson {
  key: string
  label: string
  topic: string
  topicLabel: string
  topicOrder?: number
  order?: number
  config: SimConfig
}

const elementBySymbol = ELEMENTS as Record<string, ElementDef>

function readMaterial(path: string, raw: unknown): MaterialDef & { order: number } {
  const data = raw as MaterialJson
  const elements = data.elements.map((symbol) => {
    const element = elementBySymbol[symbol]
    if (!element) throw new Error(`Unknown element symbol "${symbol}" in ${path}`)
    return element
  })

  const material: MaterialDef = {
    key: data.key,
    label: data.label,
    kind: data.kind,
    category: data.category,
    elements,
    nn: data.nn,
    unit: data.unit,
  }

  if (data.kind === 'molecule') {
    if (data.molecule) {
      material.molecule = {
        sites: data.molecule.sites.map((site) => {
          const element = elementBySymbol[site.element]
          if (!element) throw new Error(`Unknown molecule site element "${site.element}" in ${path}`)
          return {
            el: element,
            pos: site.pos,
            charge: site.charge,
            sigma: site.sigma,
            epsilon: site.epsilon,
          }
        }),
        bonds: data.molecule.bonds,
        angles: data.molecule.angles.map((angle) => ({
          a: angle.a,
          b: angle.b,
          c: angle.c,
          theta0: angle.theta0,
          k: angle.k,
        })),
      }
    } else {
      throw new Error(`Molecule material must define molecule in ${path}`)
    }
  }

  return { ...material, order: data.order ?? Number.MAX_SAFE_INTEGER }
}

function readPreset(raw: unknown): Preset & { order: number; topicOrder: number } {
  const data = raw as PresetJson
  return {
    key: data.key,
    label: data.label,
    topic: data.topic,
    topicLabel: data.topicLabel,
    config: data.config,
    order: data.order ?? Number.MAX_SAFE_INTEGER,
    topicOrder: data.topicOrder ?? Number.MAX_SAFE_INTEGER,
  }
}

const materialFiles = import.meta.glob('../assets/catalog/materials/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const presetFiles = import.meta.glob('../assets/catalog/presets/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

const materialEntries = Object.entries(materialFiles)
  .map(([path, raw]) => readMaterial(path, raw))
  .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))

export const MATERIALS: Record<string, MaterialDef> = Object.fromEntries(
  materialEntries.map((material) => [material.key, material]),
)

export const MATERIAL_LIST: MaterialDef[] = materialEntries.map(({ order: _order, ...material }) => material)

export const MATERIAL_CATEGORIES: { key: MaterialCategory; label: string }[] = [
  { key: 'molecules', label: 'Molecules' },
  { key: 'polymers', label: 'Polymers' },
  { key: 'ions', label: 'Ions' },
  { key: 'atoms', label: 'Atoms & metals' },
]

const presetEntries = Object.values(presetFiles)
  .map((raw) => readPreset(raw))
  .sort((left, right) => {
    if (left.topicOrder !== right.topicOrder) return left.topicOrder - right.topicOrder
    if (left.topic !== right.topic) return left.topic.localeCompare(right.topic)
    return left.order - right.order || left.label.localeCompare(right.label)
  })

export const PRESETS: Preset[] = presetEntries.map(({ order: _order, topicOrder: _topicOrder, ...preset }) => preset)

const presetTopicsByKey = new Map<string, PresetTopic>()
for (const preset of PRESETS) {
  if (!presetTopicsByKey.has(preset.topic)) {
    presetTopicsByKey.set(preset.topic, { key: preset.topic, label: preset.topicLabel })
  }
}

export const PRESET_TOPICS: PresetTopic[] = [...presetTopicsByKey.values()]

export const DEFAULT_CONFIG: SimConfig = PRESETS[0]?.config ?? {
  components: [{ materialKey: 'argon', count: 1 }],
  box: [2, 2, 2],
  dt: 0.001,
  temperature: 300,
}

export const DEFAULT_RUNTIME: RuntimeConfig = {
  targetTemperature: 300,
  thermostatEnabled: true,
  forceGuardEnabled: true,
  cutoffRadius: 0.9,
  stepsPerFrame: 8,
  boundaryMode: 'periodic',
}

export const DEFAULT_VIEW: ViewOptions = {
  atomScale: 1,
  forceOpacity: 1,
  showForces: true,
  showBonds: true,
  showBox: true,
}
