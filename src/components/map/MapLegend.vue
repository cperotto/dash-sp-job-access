<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ClassLegend, GradientLegend } from '../../utils/colorScale'
import { formatValue, type ValueFormat } from '../../utils/format'

const props = defineProps<{
  legend: ClassLegend | GradientLegend
  format: ValueFormat
  title?: string
  description?: string
}>()

const { locale } = useI18n()
const fmt = (value: number) => formatValue(value, props.format, locale.value)

const gradientTicks = computed(() => {
  if (props.legend.kind !== 'gradient') return []
  const [min, max] = props.legend.domain
  // extremos saturam: valores além do domínio recebem a cor da ponta
  return [`≤ ${fmt(min)}`, fmt((min + max) / 2), `≥ ${fmt(max)}`]
})
</script>

<template>
  <div class="space-y-2 text-xs font-mono text-ink">
    <p v-if="title" class="font-bold font-univers text-sm tracking-tight">{{ title }}</p>
    <p v-if="description" class="font-geom-body leading-relaxed text-ink-mid">{{ description }}</p>

    <!-- duas colunas lidas de cima para baixo: as 8 classes cabem em 4 linhas -->
    <ul
      v-if="legend.kind === 'classes'"
      class="grid grid-flow-col gap-x-4 gap-y-1"
      :style="{ gridTemplateRows: `repeat(${Math.ceil(legend.items.length / 2)}, auto)` }"
    >
      <li v-for="item in legend.items" :key="item.to" class="flex items-center gap-2">
        <span class="legend-swatch" :style="{ background: item.color }"></span>
        <span>{{ item.from === null ? `≤ ${fmt(item.to)}` : `${fmt(item.from)} – ${fmt(item.to)}` }}</span>
      </li>
    </ul>

    <div v-else class="space-y-1">
      <div class="h-2.5 w-full" :style="{ background: legend.css }"></div>
      <div class="flex justify-between text-[10px] text-ink-mid">
        <span v-for="tick in gradientTicks" :key="tick">{{ tick }}</span>
      </div>
    </div>
  </div>
</template>
