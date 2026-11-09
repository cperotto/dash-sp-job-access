<script setup lang="ts">
import ColorBar from './ColorBar.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import NavTabs from './NavTabs.vue'
</script>

<!-- cabeçalho fixo: título do trabalho + nav + faixa cromática; o AppLayout controla o reveal no scroll -->
<template>
  <div class="fixed top-0 left-0 w-full z-50 transition-transform duration-300 translate-y-0">
    <header class="relative z-10 border-b-2 bg-surface border-ink">
      <div
        class="max-w-7xl mx-auto px-6 py-4 md:py-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6"
      >
        <div class="max-w-3xl">
          <h1 class="text-lg md:text-2xl font-black tracking-tight leading-tight text-ink">
            {{ $t('site.title') }}
          </h1>
          <p class="mt-2 text-xs font-mono text-ink-mid">{{ $t('site.meta') }}</p>
        </div>
        <div class="flex items-end gap-6 md:ml-auto">
          <LanguageSwitcher />
          <NavTabs />
        </div>
      </div>
    </header>
    <ColorBar />
  </div>
</template>
