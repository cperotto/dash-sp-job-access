<script setup lang="ts">
defineProps<{
  /** título da seção, prefixado com "/" por convenção */
  title: string
  /** legenda mono opcional, alinhada à direita */
  caption?: string
}>()
</script>

<template>
  <div class="flex justify-between items-baseline border-b pb-3 border-ink mt-0">
    <h2 class="text-2xl font-black tracking-tight text-ink">{{ title }}</h2>
    <span v-if="caption" class="text-xs font-mono text-ink-mid">{{ caption }}</span>
  </div>
</template>
