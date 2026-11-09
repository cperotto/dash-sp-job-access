import { createI18n } from 'vue-i18n'
import pt from './locales/pt.json'
import en from './locales/en.json'

export const LOCALES = ['pt', 'en'] as const
export type Locale = (typeof LOCALES)[number]

// mesma chave usada pelo site me, para o idioma escolhido lá valer aqui
const STORAGE_KEY = 'lang'

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

function savedLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return isLocale(saved) ? saved : 'pt'
  } catch {
    return 'pt'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale(),
  fallbackLocale: 'pt',
  messages: { pt, en },
})

export function setLocale(locale: Locale, persist = true) {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  if (!persist) return
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // armazenamento bloqueado (aba privada, iframe sem permissão): mantém só na sessão
  }
}
