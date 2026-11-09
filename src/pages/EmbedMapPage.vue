<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MapExplorer from '../components/map/MapExplorer.vue'
import { useLayerQuery } from '../composables/useLayerQuery'
import { useNoPageScroll } from '../composables/useNoPageScroll'
import { isLocale, setLocale } from '../i18n'

// versão para iframe: só o mapa e seus elementos de contexto, sem header/footer/nav.
// parâmetros: ?layer=<id do layer>&lang=pt|en
const route = useRoute()
const router = useRouter()
const layerId = useLayerQuery()
useNoPageScroll()

watchEffect(() => {
  const lang = route.query.lang
  // não persiste: o idioma do embed não deve sobrescrever a escolha feita no site
  if (isLocale(lang)) setLocale(lang, false)
})

const dashboardHref = computed(
  () => router.resolve({ name: 'dashboard', query: { layer: layerId.value } }).href,
)
</script>

<template>
  <!-- md+: mapa preenche a altura do iframe; no celular os cards empilham e a página cresce -->
  <div class="min-h-screen md:h-screen font-univers">
    <MapExplorer v-model:layer-id="layerId">
      <template #action>
        <a
          :href="dashboardHref"
          target="_blank"
          rel="noopener"
          class="block px-3 py-2 border-2 border-ink bg-ink text-bg-surface text-xs font-bold hover:bg-[var(--color-ink-mid)] transition-colors"
        >
          {{ $t('embed.openDashboard') }} ↗
        </a>
      </template>
    </MapExplorer>
  </div>
</template>
