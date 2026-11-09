<script setup lang="ts">
import MapExplorer from '../components/map/MapExplorer.vue'
import { useLayerQuery } from '../composables/useLayerQuery'
import { useNoPageScroll } from '../composables/useNoPageScroll'

const layerId = useLayerQuery()
useNoPageScroll()
</script>

<!-- sem header/footer: o mapa ocupa a tela; a navegação é o botão para a data story -->
<template>
  <div class="min-h-screen md:h-screen font-univers">
    <MapExplorer v-model:layer-id="layerId">
      <template #action>
        <RouterLink
          :to="{ name: 'story' }"
          class="flex items-center gap-2.5 px-4 py-3 border-2 border-ink bg-ink text-bg-surface text-[13px] font-bold hover:bg-[var(--color-ink-mid)] transition-colors"
        >
          {{ $t('dashboard.fullStory') }} <span aria-hidden="true">→</span>
        </RouterLink>
      </template>
    </MapExplorer>
  </div>
</template>
