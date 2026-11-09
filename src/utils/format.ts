export type ValueFormat = 'compact' | 'percent'

export function formatValue(value: unknown, format: ValueFormat, locale: string): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  if (format === 'percent') {
    const sign = value > 0 ? '+' : ''
    return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)}%`
  }
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}
