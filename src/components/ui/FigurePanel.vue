<script setup lang="ts">
defineProps<{
  /** rótulo da figura (ex.: "fig. 1 — …") */
  label: string
  /** fonte ou nota, alinhada à direita */
  source?: string
}>()
</script>

<!-- painel de data-viz do design system: legenda de topo, caixa do plot, legenda inferior -->
<template>
  <figure class="border-2 p-6 flex flex-col border-ink bg-card">
    <figcaption
      class="flex flex-col md:flex-row justify-between gap-2 text-xs font-mono border-b pb-3 mb-4 border-ink"
    >
      <span class="text-ink">{{ label }}</span>
      <span v-if="source" class="text-warm-text">{{ source }}</span>
    </figcaption>
    <div class="relative w-full border bg-white border-ink overflow-hidden">
      <slot />
    </div>
    <div v-if="$slots.legend" class="mt-4">
      <slot name="legend" />
    </div>
  </figure>
</template>
