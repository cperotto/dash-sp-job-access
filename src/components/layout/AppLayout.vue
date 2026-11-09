<script setup lang="ts">
import { useTemplateRef } from 'vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import { useScrollReveal } from '../../composables/useScrollReveal'

const header = useTemplateRef<InstanceType<typeof AppHeader>>('header')
const footer = useTemplateRef<InstanceType<typeof AppFooter>>('footer')

useScrollReveal(
  () => header.value?.$el,
  () => footer.value?.$el,
)
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden font-univers">
    <AppHeader ref="header" />
    <main class="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 pt-64 md:pt-36 pb-40 md:pb-32">
      <div class="relative min-h-[500px] flex flex-col">
        <slot />
      </div>
    </main>
    <AppFooter ref="footer" />
  </div>
</template>
