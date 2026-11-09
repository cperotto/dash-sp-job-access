<script setup lang="ts">
import { PUBLICATION_URL } from '../../config/site'
</script>

<template>
  <footer
    class="fixed bottom-0 left-0 w-full border-t-4 text-white z-50 font-univers bg-ink border-ink transition-transform duration-300 translate-y-0"
  >
    <div class="max-w-7xl mx-auto px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-end justify-between gap-3">
      <div class="max-w-3xl">
        <h4 class="text-sm md:text-base font-black leading-tight text-warm-light">{{ $t('site.title') }}</h4>
        <p class="mt-1 text-[10px] font-mono text-accent-light">{{ $t('site.author') }} · {{ $t('site.meta') }}</p>
      </div>
      <a
        :href="PUBLICATION_URL"
        target="_blank"
        rel="noopener"
        class="shrink-0 text-xs font-mono font-bold text-bg-surface hover:text-[var(--color-warm-light)] transition-colors"
      >
        {{ $t('site.fullText') }} ↗
      </a>
    </div>
  </footer>
</template>
