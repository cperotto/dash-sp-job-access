import type { ValueFormat } from '../utils/format'

export const ACCESS_FILE = 'access_h3.parquet'
export const BREAKS_FILE = 'breaks.json'
export const BOUNDARY_FILE = 'sp.geojson'
export const ZONES_FILE = 'zones.geojson'

/**
 * zonas estudadas: contornos ligados/desligados por cima da camada de dados.
 * `id` = propriedade `zone` em public/data/zones.geojson; rótulos em i18n zones.<id>
 */
export const ZONES: { id: string; colorToken: string }[] = [
  { id: 'eetu', colorToken: '--map-zone-eetu' },
  { id: 'economic', colorToken: '--map-zone-economic' },
]

export type ScaleSpec =
  /** classes de quantis de public/data/breaks.json; cores de `ramp` (padrão --map-level, k=8) */
  | { kind: 'quantile'; breaksKey: string; ramp?: string }
  /** contínua de domain[0] a domain[1], cores --map-diverging-* */
  | { kind: 'diverging'; domain: [number, number] }

export interface LayerConfig {
  /** id usado na url (?layer=) e nas chaves i18n layers.<id>.* */
  id: string
  file: string
  column: string
  scale: ScaleSpec
  format: ValueFormat
}

const quantile = (id: string): LayerConfig => ({
  id,
  file: ACCESS_FILE,
  column: id,
  scale: { kind: 'quantile', breaksKey: id },
  format: 'compact',
})

// empregos e população: quebras do primeiro ano aplicadas aos dois anos, k=7
const landUse = (id: string, breaksKey: string): LayerConfig => ({
  id,
  file: ACCESS_FILE,
  column: id,
  scale: { kind: 'quantile', breaksKey, ramp: '--map-level7' },
  format: 'compact',
})

const diverging = (id: string, max: number): LayerConfig => ({
  id,
  file: ACCESS_FILE,
  column: id,
  scale: { kind: 'diverging', domain: [-max, max] },
  format: 'percent',
})

// escalas replicam os mapas da dissertação (pde-sp): quantis k=8 por ano
// (08_access___scenarios.py), Δ% real em −100/+100 e cenários isolados em
// −70/+70 (09_decomposingEffects.py); empregos e população em quantis k=7 com as
// quebras de 2013/2010 nos dois anos (01_dataPrep/07_eda.py)
export const LAYERS: LayerConfig[] = [
  quantile('access_2013'),
  quantile('access_2022'),
  diverging('delta_pct', 100),
  landUse('jobs_2013', 'jobs'),
  landUse('jobs_2021', 'jobs'),
  landUse('pop_2010', 'pop'),
  landUse('pop_2022', 'pop'),
  diverging('delta_pct_jobs_solo', 70),
  diverging('delta_pct_housing_solo', 70),
  diverging('delta_pct_network_solo', 70),
]

export const DEFAULT_LAYER_ID = 'delta_pct'

export function getLayer(id: string | undefined): LayerConfig {
  return LAYERS.find((layer) => layer.id === id) ?? LAYERS.find((layer) => layer.id === DEFAULT_LAYER_ID)!
}

/**
 * menu em árvore: grupo → item → opções. item com mais de uma opção
 * (ex.: acessibilidade 2013/2022) mostra as opções como links após o nome.
 * rótulos em i18n: tree.groups.<id>, tree.items.<id>
 */
export interface LayerTreeItem {
  id: string
  options: { layerId: string; label?: string }[]
}

export interface LayerTreeGroup {
  id: string
  items: LayerTreeItem[]
}

export const LAYER_TREE: LayerTreeGroup[] = [
  {
    id: 'observed',
    items: [
      {
        id: 'access',
        options: [
          { layerId: 'access_2013', label: '2013' },
          { layerId: 'access_2022', label: '2022' },
        ],
      },
      { id: 'delta', options: [{ layerId: 'delta_pct' }] },
    ],
  },
  {
    id: 'land_use',
    items: [
      {
        id: 'jobs',
        options: [
          { layerId: 'jobs_2013', label: '2013' },
          { layerId: 'jobs_2021', label: '2021' },
        ],
      },
      {
        id: 'population',
        options: [
          { layerId: 'pop_2010', label: '2010' },
          { layerId: 'pop_2022', label: '2022' },
        ],
      },
    ],
  },
  {
    id: 'scenarios',
    items: [
      { id: 'jobs_solo', options: [{ layerId: 'delta_pct_jobs_solo' }] },
      { id: 'housing_solo', options: [{ layerId: 'delta_pct_housing_solo' }] },
      { id: 'network_solo', options: [{ layerId: 'delta_pct_network_solo' }] },
    ],
  },
]

/** campos do card do hexágono, agrupados; rótulos em i18n detailGroups.<id> e fields.<column> */
export const DETAIL_GROUPS: { id: string; fields: { column: string; format: ValueFormat }[] }[] = [
  {
    id: 'observed',
    fields: [
      { column: 'access_2013', format: 'compact' },
      { column: 'access_2022', format: 'compact' },
      { column: 'delta', format: 'compact' },
      { column: 'delta_pct', format: 'percent' },
    ],
  },
  {
    id: 'land_use',
    fields: [
      { column: 'jobs_2013', format: 'compact' },
      { column: 'jobs_2021', format: 'compact' },
      { column: 'pop_2010', format: 'compact' },
      { column: 'pop_2022', format: 'compact' },
    ],
  },
  {
    id: 'scenario_jobs',
    fields: [
      { column: 'access_jobs_solo', format: 'compact' },
      { column: 'delta_pct_jobs_solo', format: 'percent' },
    ],
  },
  {
    id: 'scenario_housing',
    fields: [
      { column: 'access_housing_solo', format: 'compact' },
      { column: 'delta_pct_housing_solo', format: 'percent' },
    ],
  },
  {
    id: 'scenario_network',
    fields: [
      { column: 'access_network_solo', format: 'compact' },
      { column: 'delta_pct_network_solo', format: 'percent' },
    ],
  },
]
