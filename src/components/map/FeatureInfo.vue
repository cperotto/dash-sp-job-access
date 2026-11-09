<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { DETAIL_GROUPS } from '../../config/layers'
import type { HexDetails } from '../../services/accessData'
import { formatValue } from '../../utils/format'

defineProps<{
  details: HexDetails | null
  loading: boolean
  /** coluna do layer selecionado, destacada em negrito */
  activeColumn: string
}>()

defineEmits<{ close: [] }>()

const { locale } = useI18n()
</script>

<template>
  <div class="space-y-3">
    <div class="flex justify-between items-baseline gap-4">
      <h3 class="text-xs font-bold tracking-widest font-univers text-ink-mid">{{ $t('map.info') }}</h3>
      <div class="flex items-baseline gap-3">
        <span v-if="details" class="text-[10px] font-mono text-ink-mid">{{ details.h3 }}</span>
        <button
          type="button"
          class="text-sm font-bold leading-none text-ink hover:text-[var(--color-accent)] transition-colors"
          :aria-label="$t('map.close')"
          :title="$t('map.close')"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>
    </div>
    <p v-if="loading" class="text-xs font-mono text-ink-mid">{{ $t('map.loading') }}</p>
    <div v-else-if="details" class="space-y-3">
      <section v-for="group in DETAIL_GROUPS" :key="group.id">
        <p class="text-[10px] font-mono tracking-widest text-ink-mid border-b border-ink pb-1">
          {{ $t(`detailGroups.${group.id}`) }}
        </p>
        <dl class="text-xs font-mono">
          <div
            v-for="field in group.fields"
            :key="field.column"
            class="flex justify-between gap-4 py-0.5"
            :class="field.column === activeColumn ? 'font-bold text-ink' : 'text-ink-mid'"
          >
            <dt>{{ $t(`fields.${field.column}`) }}</dt>
            <dd class="text-ink">{{ formatValue(details[field.column], field.format, locale) }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>
