<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AccessMap, { type HoverInfo } from './AccessMap.vue'
import FeatureInfo from './FeatureInfo.vue'
import LayerTree from './LayerTree.vue'
import MapLegend from './MapLegend.vue'
import LanguageSwitcher from '../layout/LanguageSwitcher.vue'
import { PUBLICATION_URL } from '../../config/site'
import { ZONES } from '../../config/layers'
import { useHexDetails } from '../../composables/useHexDetails'
import { useMapLayer } from '../../composables/useMapLayer'
import { formatValue } from '../../utils/format'

// mapa em tela cheia, com cards sobre ele (md+): à esquerda o trabalho + camadas
// e a camada ativa + escala; à direita o hexágono selecionado; no canto inferior
// direito o slot `action` (link para a data story ou para o dashboard).
// no celular os cards empilham acima e abaixo do mapa.
// usado pelo dashboard e pela rota de embed.
const layerId = defineModel<string>('layerId', { required: true })

const { locale } = useI18n()
const { layer, rows, scale, loading, error } = useMapLayer(toRef(layerId))

const hover = ref<HoverInfo | null>(null)
const selectedH3 = ref<string | null>(null)
const zones = ref<string[]>([])
const { details, loading: detailsLoading } = useHexDetails(selectedH3)

// o tooltip guarda o valor do layer anterior; some até o próximo hover
watch(layerId, () => (hover.value = null))

const getColor = computed(() => scale.value?.color ?? (() => [0, 0, 0, 0] as [number, number, number, number]))
</script>

<template>
  <div class="flex flex-col gap-3 p-3 md:p-0 md:block md:relative md:h-full md:min-h-[480px] md:bg-white md:overflow-hidden">
    <!-- coluna esquerda: só os cards capturam o mouse -->
    <div
      class="flex flex-col gap-3 md:absolute md:top-3 md:left-3 md:z-10 md:w-[28rem] md:max-h-[calc(100%-1.5rem)] md:overflow-y-auto md:pointer-events-none"
    >
      <!-- card 1: o trabalho (título, metadados, texto completo, idioma) + camadas -->
      <div class="map-card md:pointer-events-auto">
        <p class="text-[15px] font-black leading-tight tracking-tight text-ink">{{ $t('site.title') }}</p>
        <p class="mt-1 text-[10px] font-mono text-ink-mid">{{ $t('site.meta') }}</p>
        <div class="mt-1.5 flex items-center justify-between gap-3 text-[11px] font-mono">
          <a
            :href="PUBLICATION_URL"
            target="_blank"
            rel="noopener"
            class="text-[var(--color-accent)] hover:text-ink transition-colors"
          >
            {{ $t('site.fullText') }} ↗
          </a>
          <LanguageSwitcher inline />
        </div>
        <div class="my-3 border-t border-border"></div>
        <LayerTree v-model="layerId" v-model:zones="zones" />
      </div>

      <!-- card 2: camada ativa (título do mapa), descrição e escala -->
      <header class="map-card md:pointer-events-auto">
        <h2 class="text-lg font-black tracking-tight leading-tight text-ink">
          {{ $t(`layers.${layer.id}.label`) }}
        </h2>
        <p class="mt-2 text-xs font-geom-body leading-relaxed text-ink-mid">
          {{ $t(`layers.${layer.id}.description`) }}
        </p>
        <MapLegend v-if="scale" class="mt-3" :legend="scale.legend" :format="layer.format" />
        <!-- zonas ligadas: linha da legenda + descrição breve -->
        <ul v-if="zones.length" class="mt-3 space-y-2">
          <li v-for="zone in ZONES.filter((z) => zones.includes(z.id))" :key="zone.id">
            <p class="flex items-center gap-2 text-[10px] font-mono text-ink">
              <span class="inline-block w-4 h-0 border-t-2" :style="{ borderColor: `var(${zone.colorToken})` }" aria-hidden="true"></span>
              {{ $t(`zones.${zone.id}.legend`) }}
            </p>
            <p class="mt-0.5 pl-6 text-[11px] font-geom-body leading-snug text-ink-mid">{{ $t(`zones.${zone.id}.description`) }}</p>
          </li>
        </ul>
      </header>
    </div>

    <!-- mapa -->
    <div class="relative h-[60vh] border-2 border-ink bg-white md:absolute md:inset-0 md:h-auto md:border-0">
      <AccessMap
        :rows="rows"
        :get-color="getColor"
        :selected-h3="selectedH3"
        :zones="zones"
        @hover="hover = $event"
        @select="selectedH3 = $event"
      />
      <div
        v-if="hover"
        class="map-tooltip absolute pointer-events-none z-20"
        :style="{ left: `${hover.x + 12}px`, top: `${hover.y + 12}px` }"
      >
        <div class="text-ink-mid">{{ $t(`layers.${layer.id}.label`) }}</div>
        <div class="font-bold">{{ formatValue(hover.value, layer.format, locale) }}</div>
      </div>
      <div
        v-if="loading || error"
        class="map-tooltip absolute bottom-3 left-1/2 -translate-x-1/2 z-20"
        :class="{ 'text-warm-text': error }"
      >
        {{ error ? $t('map.error') : $t('map.loading') }}
      </div>
    </div>

    <!-- hexágono selecionado (topo direito): só aparece com um hexágono selecionado -->
    <div
      v-if="selectedH3"
      class="map-card md:absolute md:top-3 md:right-3 md:z-10 md:w-80 md:max-h-[calc(100%-7rem)] md:overflow-y-auto"
    >
      <FeatureInfo
        :details="details"
        :loading="detailsLoading"
        :active-column="layer.column"
        @close="selectedH3 = null"
      />
    </div>

    <!-- canto inferior direito, acima da atribuição do basemap -->
    <div v-if="$slots.action" class="self-end md:absolute md:bottom-10 md:right-3 md:z-10">
      <slot name="action" />
    </div>
  </div>
</template>
