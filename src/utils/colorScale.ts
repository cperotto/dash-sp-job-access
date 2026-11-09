import type { RGB } from './cssTokens'

export type RGBA = [number, number, number, number]

export interface ClassLegend {
  kind: 'classes'
  /** from = null na primeira classe (rótulo "≤ to") */
  items: { color: string; from: number | null; to: number }[]
}

export interface GradientLegend {
  kind: 'gradient'
  css: string
  domain: [number, number]
}

export interface ColorScale {
  color: (value: number) => RGBA
  legend: ClassLegend | GradientLegend
}

const toCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`

/** breaks no formato do mapclassify: limite superior inclusivo de cada classe */
export function quantileScale(breaks: number[], ramp: RGB[]): ColorScale {
  const color = (value: number): RGBA => {
    const i = breaks.findIndex((b) => value <= b)
    return [...ramp[i === -1 ? breaks.length - 1 : i], 255]
  }
  const items = breaks.map((to, i) => ({
    color: toCss(ramp[i]),
    from: i === 0 ? null : breaks[i - 1],
    to,
  }))
  return { color, legend: { kind: 'classes', items } }
}

/** interpolação linear entre os stops; valores fora do domínio saturam (como vmin/vmax no matplotlib) */
export function divergingScale(domain: [number, number], ramp: RGB[]): ColorScale {
  const [min, max] = domain
  const last = ramp.length - 1
  const color = (value: number): RGBA => {
    const t = Math.min(Math.max((value - min) / (max - min), 0), 1) * last
    const i = Math.min(Math.floor(t), last - 1)
    const f = t - i
    const mix = (k: number) => Math.round(ramp[i][k] + (ramp[i + 1][k] - ramp[i][k]) * f)
    return [mix(0), mix(1), mix(2), 255]
  }
  const css = `linear-gradient(to right, ${ramp.map(toCss).join(', ')})`
  return { color, legend: { kind: 'gradient', css, domain } }
}
