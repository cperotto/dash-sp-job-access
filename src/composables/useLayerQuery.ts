import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLayer } from '../config/layers'

/** layer ativo sincronizado com ?layer= na url (compartilhável e usado pelo embed) */
export function useLayerQuery() {
  const route = useRoute()
  const router = useRouter()
  return computed({
    get: () => getLayer(route.query.layer as string | undefined).id,
    set: (id: string) => router.replace({ query: { ...route.query, layer: id } }),
  })
}
