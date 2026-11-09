import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import { getLayer, type LayerConfig } from '../config/layers'
import { fetchBreaks, fetchLayerRows, type HexRow } from '../services/accessData'
import { divergingScale, quantileScale, type ColorScale } from '../utils/colorScale'
import { readRamp } from '../utils/cssTokens'

async function buildScale(layer: LayerConfig): Promise<ColorScale> {
  if (layer.scale.kind === 'diverging') {
    return divergingScale(layer.scale.domain, readRamp('--map-diverging'))
  }
  const breaks = await fetchBreaks()
  return quantileScale(breaks[layer.scale.breaksKey], readRamp(layer.scale.ramp ?? '--map-level'))
}

/** dados + escala de cor do layer ativo; recarrega quando o id muda */
export function useMapLayer(layerId: Ref<string>) {
  const layer = computed(() => getLayer(layerId.value))
  const rows = shallowRef<HexRow[]>([])
  const scale = shallowRef<ColorScale | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  watch(
    layer,
    async (current) => {
      loading.value = true
      error.value = null
      try {
        const [data, colorScale] = await Promise.all([fetchLayerRows(current), buildScale(current)])
        if (layer.value.id !== current.id) return // usuário trocou de layer no meio da carga
        rows.value = data
        scale.value = colorScale
      } catch (e) {
        console.error(e)
        error.value = e instanceof Error ? e.message : String(e)
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  return { layer, rows, scale, loading, error }
}
