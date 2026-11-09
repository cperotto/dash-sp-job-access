import { query } from './duckdb'
import { dataUrl } from '../utils/dataUrl'
import type { FeatureCollection, MultiPolygon } from 'geojson'
import { ACCESS_FILE, BREAKS_FILE, ZONES_FILE, type LayerConfig } from '../config/layers'

export interface HexRow {
  h3: string
  value: number
}

export type HexDetails = Record<string, string | number | null>

export function fetchLayerRows(layer: LayerConfig): Promise<HexRow[]> {
  // hexágonos sem acesso (níveis) ou sem variação/indefinidos (Δ) ficam fora,
  // como nos mapas da dissertação (gdf[col] > 0 e gdf[col] != 0)
  const where =
    layer.scale.kind === 'quantile'
      ? `${layer.column} > 0`
      : `${layer.column} IS NOT NULL AND ${layer.column} <> 0`
  return query<HexRow>(
    `SELECT h3, ${layer.column} AS value FROM read_parquet('${layer.file}') WHERE ${where}`,
    [layer.file],
  )
}

export async function fetchHexDetails(h3: string): Promise<HexDetails | null> {
  const rows = await query<HexDetails>(
    `SELECT * FROM read_parquet('${ACCESS_FILE}') WHERE h3 = ?`,
    [ACCESS_FILE],
    [h3],
  )
  return rows[0] ?? null
}

let breaksPromise: Promise<Record<string, number[]>> | null = null

export function fetchBreaks(): Promise<Record<string, number[]>> {
  breaksPromise ??= fetch(dataUrl(BREAKS_FILE)).then((res) => {
    if (!res.ok) throw new Error(`${BREAKS_FILE}: http ${res.status}`)
    return res.json()
  })
  return breaksPromise
}

export type ZoneCollection = FeatureCollection<MultiPolygon, { zone: string; cells: number }>

let zonesPromise: Promise<ZoneCollection> | null = null

/** contornos das zonas estudadas (geojson estático, sem duckdb) */
export function fetchZones(): Promise<ZoneCollection> {
  zonesPromise ??= fetch(dataUrl(ZONES_FILE)).then((res) => {
    if (!res.ok) throw new Error(`${ZONES_FILE}: http ${res.status}`)
    return res.json()
  })
  return zonesPromise
}
