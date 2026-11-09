// lê tokens de cor de src/styles/design-system.css para o deck.gl,
// mantendo o css como fonte única das escalas

export type RGB = [number, number, number]

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// o minificador de css do build reescreve cores na forma mais curta
// (#ffffff → #fff, #808080 → gray); o canvas normaliza qualquer cor css para #rrggbb
const colorContext = document.createElement('canvas').getContext('2d')!

function cssColorToRgb(color: string): RGB {
  colorContext.fillStyle = '#000000'
  colorContext.fillStyle = color
  const hex = String(colorContext.fillStyle).replace('#', '')
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB
}

export function readColor(name: string): RGB {
  return cssColorToRgb(readToken(name))
}

export function readNumber(name: string): number {
  return Number(readToken(name))
}

/** lê --<prefix>-0, --<prefix>-1, … até a primeira variável ausente */
export function readRamp(prefix: string): RGB[] {
  const ramp: RGB[] = []
  for (let i = 0; readToken(`${prefix}-${i}`); i++) ramp.push(readColor(`${prefix}-${i}`))
  return ramp
}
