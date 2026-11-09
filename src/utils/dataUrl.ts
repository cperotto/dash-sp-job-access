/** url absoluta de um arquivo em public/data, respeitando o base do vite */
export function dataUrl(file: string): string {
  return new URL(`${import.meta.env.BASE_URL}data/${file}`, window.location.href).href
}
