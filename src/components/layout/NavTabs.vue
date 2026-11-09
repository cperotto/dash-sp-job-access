<script setup lang="ts">
const items = [
  { to: '/', labelKey: 'nav.story' },
  { to: '/dashboard', labelKey: 'nav.dashboard' },
]
</script>

<template>
  <nav class="flex flex-wrap items-center gap-2">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="square-btn px-4 py-2 border-2 text-xs font-bold tracking-wider border-ink text-ink"
      active-class=""
      exact-active-class="active"
    >
      {{ $t(item.labelKey) }}
    </RouterLink>
  </nav>
</template>
