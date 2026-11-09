<script setup lang="ts">
import { computed, ref } from 'vue'
import AccessMap from '../components/map/AccessMap.vue'
import MapLegend from '../components/map/MapLegend.vue'
import FigurePanel from '../components/ui/FigurePanel.vue'
import SectionHeader from '../components/ui/SectionHeader.vue'
import { useMapLayer } from '../composables/useMapLayer'

// data story: contexto → resultados → discussão. textos são placeholders até a
// redação da versão de divulgação (segue os voice principles do workstation).
const { layer, rows, scale } = useMapLayer(ref('delta_pct'))
const getColor = computed(() => scale.value?.color ?? (() => [0, 0, 0, 0] as [number, number, number, number]))

const sections = ['context', 'results', 'discussion'] as const
</script>

<template>
  <div class="space-y-16">
    <section v-for="section in sections" :key="section" class="space-y-6">
      <SectionHeader
        :title="$t(`story.sections.${section}`)"
        :caption="section === 'context' ? $t('story.caption') : undefined"
      />
      <p class="font-geom-body text-sm leading-relaxed text-ink max-w-3xl">{{ $t('story.placeholder') }}</p>

      <FigurePanel v-if="section === 'results'" :label="$t('story.figures.delta')" :source="$t('map.source')">
        <div class="relative h-[70vh] max-h-[720px]">
          <AccessMap :rows="rows" :get-color="getColor" :interactive="false" />
        </div>
        <template #legend>
          <div class="max-w-sm">
            <MapLegend v-if="scale" :legend="scale.legend" :format="layer.format" />
          </div>
        </template>
      </FigurePanel>
    </section>
  </div>
</template>
