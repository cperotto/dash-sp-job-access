<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LOCALES, setLocale } from '../../i18n'

// empilhado (header do layout padrão) ou em linha, "pt · en" (card do mapa)
defineProps<{ inline?: boolean }>()

const { locale } = useI18n()
</script>

<template>
  <span
    class="flex tracking-wider leading-tight"
    :class="inline ? 'items-center gap-1.5' : 'flex-col items-start text-xs'"
  >
    <template v-for="(lang, i) in LOCALES" :key="lang">
      <span v-if="inline && i > 0" class="text-ink-mid" aria-hidden="true">·</span>
      <button
        type="button"
        :aria-label="`switch to ${lang}`"
        :class="
          locale === lang
            ? ['font-bold text-ink', inline && 'underline underline-offset-2']
            : inline
              ? 'text-[var(--color-accent)] hover:text-ink transition-colors'
              : 'font-normal text-ink/30 hover:text-ink/60 transition-colors'
        "
        @click="setLocale(lang)"
      >
        {{ lang }}
      </button>
    </template>
  </span>
</template>
