<script setup lang="ts">
import { LAYER_TREE, ZONES, type LayerTreeItem } from '../../config/layers'

const model = defineModel<string>({ required: true })
/** zonas estudadas com contorno visível (independentes da camada ativa) */
const zones = defineModel<string[]>('zones', { default: () => [] })

function toggleZone(id: string) {
  zones.value = zones.value.includes(id) ? zones.value.filter((z) => z !== id) : [...zones.value, id]
}

const isActive = (item: LayerTreeItem) => item.options.some((o) => o.layerId === model.value)

// clicar no nome mantém a opção atual (ex.: o ano) se o item já estiver ativo
function selectItem(item: LayerTreeItem) {
  if (!isActive(item)) model.value = item.options[0].layerId
}
</script>

<template>
  <nav class="space-y-3" :aria-label="$t('map.layer')">
    <h3 class="text-xs font-bold tracking-widest font-univers text-ink-mid">{{ $t('map.layer') }}</h3>
    <ul class="space-y-3">
      <li v-for="group in LAYER_TREE" :key="group.id">
        <p class="text-[10px] font-mono font-bold tracking-widest text-ink-mid">{{ $t(`tree.groups.${group.id}`) }}</p>
        <!-- ramos da árvore: linha vertical + traço horizontal por item -->
        <ul class="mt-1 ml-1 border-l border-ink">
          <li v-for="item in group.items" :key="item.id" class="relative flex flex-wrap items-baseline gap-x-2 pl-3 py-0.5">
            <span class="absolute left-0 top-[0.7rem] w-2 border-t border-ink" aria-hidden="true"></span>
            <button
              type="button"
              class="text-left text-xs transition-colors"
              :class="isActive(item) ? 'font-bold text-ink' : 'text-ink-mid hover:text-ink'"
              :aria-current="isActive(item) && item.options.length === 1 ? 'true' : undefined"
              @click="selectItem(item)"
            >
              {{ $t(`tree.items.${item.id}`) }}
            </button>
            <span v-if="item.options.length > 1" class="flex gap-2 text-[11px] font-mono">
              <button
                v-for="option in item.options"
                :key="option.layerId"
                type="button"
                class="underline underline-offset-2 transition-colors"
                :class="
                  model === option.layerId
                    ? 'font-bold text-ink decoration-2'
                    : 'text-[var(--color-accent)] hover:text-ink'
                "
                :aria-current="model === option.layerId ? 'true' : undefined"
                @click="model = option.layerId"
              >
                {{ option.label }}
              </button>
            </span>
          </li>
        </ul>
      </li>
      <!-- zonas estudadas: caixas de seleção, sobrepostas à camada ativa -->
      <li>
        <p class="text-[10px] font-mono font-bold tracking-widest text-ink-mid">{{ $t('tree.groups.zones') }}</p>
        <ul class="mt-1 ml-1 border-l border-ink">
          <li v-for="zone in ZONES" :key="zone.id" class="relative pl-3 py-0.5">
            <span class="absolute left-0 top-[0.7rem] w-2 border-t border-ink" aria-hidden="true"></span>
            <label
              :title="$t(`zones.${zone.id}.description`)"
              class="flex items-center gap-2 text-xs cursor-pointer" :class="zones.includes(zone.id) ? 'font-bold text-ink' : 'text-ink-mid hover:text-ink'">
              <input
                type="checkbox"
                class="size-3 accent-[var(--color-ink)]"
                :checked="zones.includes(zone.id)"
                @change="toggleZone(zone.id)"
              />
              <span class="inline-block w-4 h-0 border-t-2" :style="{ borderColor: `var(${zone.colorToken})` }" aria-hidden="true"></span>
              {{ $t(`zones.${zone.id}.label`) }}
            </label>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
