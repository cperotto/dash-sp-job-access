import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// base: github pages serve este repositório como project page em
// https://cperotto.github.io/dash-sp-job-access/ — sem isso assets e parquet
// resolvem para a raiz do domínio e quebram em 404.
export default defineConfig({
  base: '/dash-sp-job-access/',
  plugins: [vue(), tailwindcss()],
  optimizeDeps: {
    // duckdb-wasm e maplibre-gl carregam workers/.wasm por url; o pré-bundle do vite
    // em dev desencontra o módulo principal do worker (o estilo do mapa nunca carrega)
    exclude: ['@duckdb/duckdb-wasm', 'maplibre-gl'],
  },
})
