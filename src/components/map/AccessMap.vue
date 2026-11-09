<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GeoJsonLayer } from '@deck.gl/layers'
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import type { PickingInfo } from '@deck.gl/core'
import { BOUNDARY_FILE, ZONES } from '../../config/layers'
import { dataUrl } from '../../utils/dataUrl'
import { fetchZones, type HexRow, type ZoneCollection } from '../../services/accessData'
import type { RGBA } from '../../utils/colorScale'
import { readColor, readNumber } from '../../utils/cssTokens'

export interface HoverInfo {
  h3: string
  value: number
  x: number
  y: number
}

const props = withDefaults(
  defineProps<{
    rows: HexRow[]
    getColor: (value: number) => RGBA
    selectedH3?: string | null
    /** ids das zonas estudadas com contorno visível (config/layers.ts → ZONES) */
    zones?: string[]
    /** false: mapa estático (figuras da data story) */
    interactive?: boolean
  }>(),
  { selectedH3: null, zones: () => [], interactive: true },
)

const emit = defineEmits<{
  hover: [info: HoverInfo | null]
  select: [h3: string | null]
}>()

// maplibre 6 carrega o worker de um arquivo separado resolvido por import.meta.url,
// que o pré-bundle do vite quebra; a url explícita funciona em dev e no build
setWorkerUrl(maplibreWorkerUrl)

// basemap neutro e sem rótulos (sem token); os mapas da dissertação não tinham basemap
const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json'
const SP_BOUNDS: [[number, number], [number, number]] = [
  [-46.83, -24.01],
  [-46.36, -23.36],
]

const container = useTemplateRef<HTMLDivElement>('container')
let map: MapLibreMap | null = null
let overlay: MapboxOverlay | null = null
const zonesData = shallowRef<ZoneCollection | null>(null)

function zoneLayers() {
  if (!zonesData.value || props.zones.length === 0) return []
  const features = zonesData.value.features.filter((f) => props.zones.includes(f.properties.zone))
  const colors = Object.fromEntries(ZONES.map((z) => [z.id, readColor(z.colorToken)]))
  const width = readNumber('--map-zone-line-width')
  return [
    new GeoJsonLayer<ZoneCollection['features'][number]['properties']>({
      id: 'zones',
      data: features,
      filled: false,
      stroked: true,
      getLineColor: (f) => colors[f.properties.zone],
      lineWidthUnits: 'pixels',
      getLineWidth: width,
      updateTriggers: { getLineColor: props.zones },
    }),
  ]
}

function buildLayers() {
  const boundaryLine = readColor('--map-boundary-line')
  const boundaryFill = readColor('--map-boundary-fill')
  const boundaryOpacity = Math.round(readNumber('--map-boundary-fill-opacity') * 255)
  const selectedLine = readColor('--map-selected-line')

  return [
    // contexto: limite municipal sob os hexágonos, como nos mapas da dissertação
    new GeoJsonLayer({
      id: 'boundary',
      data: dataUrl(BOUNDARY_FILE),
      filled: true,
      stroked: true,
      getFillColor: [...boundaryFill, boundaryOpacity],
      getLineColor: boundaryLine,
      lineWidthUnits: 'pixels',
      getLineWidth: readNumber('--map-boundary-line-width'),
    }),
    new H3HexagonLayer<HexRow>({
      id: 'access-hex',
      data: props.rows,
      getHexagon: (d) => d.h3,
      getFillColor: (d) => props.getColor(d.value),
      stroked: false,
      extruded: false,
      pickable: props.interactive,
      autoHighlight: props.interactive,
      highlightColor: [...readColor('--map-hover-line'), 90],
      updateTriggers: { getFillColor: props.getColor },
      onHover: (info: PickingInfo<HexRow>) =>
        emit('hover', info.object ? { ...info.object, x: info.x, y: info.y } : null),
      onClick: (info: PickingInfo<HexRow>) => emit('select', info.object?.h3 ?? null),
    }),
    ...zoneLayers(),
    new H3HexagonLayer<string>({
      id: 'selected-hex',
      data: props.selectedH3 ? [props.selectedH3] : [],
      getHexagon: (d) => d,
      filled: false,
      stroked: true,
      extruded: false,
      getLineColor: selectedLine,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
    }),
  ]
}

onMounted(() => {
  map = new MapLibreMap({
    container: container.value!,
    style: BASEMAP_STYLE,
    bounds: SP_BOUNDS,
    fitBoundsOptions: { padding: 16 },
    interactive: props.interactive,
    attributionControl: { compact: true },
  })
  overlay = new MapboxOverlay({ interleaved: false, layers: buildLayers() })
  map.addControl(overlay)
  if (props.interactive) fetchZones().then((data) => (zonesData.value = data)).catch(console.error)
})

watch(
  () => [props.rows, props.getColor, props.selectedH3, props.zones, zonesData.value],
  () => overlay?.setProps({ layers: buildLayers() }),
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  overlay = null
})
</script>

<template>
  <!-- wrapper absoluto: o css do maplibre força position: relative no container do mapa -->
  <div class="absolute inset-0">
    <div ref="container" class="w-full h-full"></div>
  </div>
</template>
