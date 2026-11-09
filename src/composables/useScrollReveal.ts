import { onBeforeUnmount, onMounted } from 'vue'

type ElementGetter = () => HTMLElement | null | undefined

// porte do useScrollReveal de me/src/components/Layout.tsx:
// - no fim da página: header e footer visíveis
// - rolando para baixo: footer some, header recolhe até sobrar a faixa de cores
// - rolando para cima / no topo: ambos reaparecem
export function useScrollReveal(getHeader: ElementGetter, getFooter: ElementGetter) {
  let lastScrollY = 0

  const onScroll = () => {
    const header = getHeader()
    const footer = getFooter()
    const currentScrollY = window.scrollY
    const atBottom =
      currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 20

    let headerTransform = 'translateY(0)'
    let footerTransform = 'translateY(0)'
    if (!atBottom && currentScrollY > lastScrollY && currentScrollY > 10) {
      headerTransform = 'translateY(calc(-100% + 0.75rem))'
      footerTransform = 'translateY(100%)'
    }
    if (header) header.style.transform = headerTransform
    if (footer) footer.style.transform = footerTransform
    lastScrollY = currentScrollY
  }

  onMounted(() => {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', onScroll)
  })
  onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
}
