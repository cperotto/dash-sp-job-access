import { onBeforeUnmount, onMounted } from 'vue'

const CLASS = 'no-page-scroll'

/** trava o scroll vertical da página enquanto o componente estiver montado (regra em design-system.css) */
export function useNoPageScroll() {
  onMounted(() => document.documentElement.classList.add(CLASS))
  onBeforeUnmount(() => document.documentElement.classList.remove(CLASS))
}
