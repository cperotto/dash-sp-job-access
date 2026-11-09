import { ref, shallowRef, watch, type Ref } from 'vue'
import { fetchHexDetails, type HexDetails } from '../services/accessData'

export function useHexDetails(selectedH3: Ref<string | null>) {
  const details = shallowRef<HexDetails | null>(null)
  const loading = ref(false)

  watch(selectedH3, async (h3) => {
    details.value = null
    if (!h3) return
    loading.value = true
    try {
      const result = await fetchHexDetails(h3)
      if (selectedH3.value === h3) details.value = result
    } finally {
      loading.value = false
    }
  })

  return { details, loading }
}
