# dash-sp-job-access

acessibilidade a empregos em são paulo, 2013 → 2022 — data story + dashboard espacial  
vue + vite + tailwind, deck.gl sobre maplibre, duckdb-wasm sobre parquet, hospedável no github pages

construído sobre os resultados da dissertação *os movimentos da acessibilidade: interações entre regulação, uso do solo e mobilidade em são paulo entre 2013 e 2022* (perotto, insper, 2025). os dados e o processamento originais estão no repositório [pde-sp](https://github.com/cperotto/pde-sp).

---

## páginas

| rota | conteúdo |
|---|---|
| `#/` | **data story** — contexto → resultados → discussão, texto + mapas e gráficos em html |
| `#/dashboard` | **dashboard** — mapa em tela cheia, sem header/footer, com cards sobre ele: (1) título do trabalho, link do texto completo, idioma e menu de camadas em árvore; (2) camada ativa, descrição e escala; consulta do hexágono no topo direito (só com um hexágono selecionado, fecha no ✕; todos os dados, camada ativa em negrito); botão para a data story no canto inferior direito |
| `#/embed/mapa` | **embed** — o mesmo mapa e cards do dashboard; no canto inferior direito, link para abrir o dashboard completo |

as rotas vivem depois do `#` (hash history) para funcionar no github pages sem configuração de servidor, como no site `me`.

### embed no site pessoal

a rota de embed aceita `?layer=<id>` e `?lang=pt|en` (o idioma do embed não sobrescreve a escolha salva no site):

```html
<iframe
  src="https://cperotto.github.io/dash-sp-job-access/#/embed/mapa?layer=delta_pct&lang=pt"
  width="100%" height="640" style="border:0" loading="lazy"
  title="acessibilidade a empregos em são paulo"></iframe>
```

o iframe isola vue, deck.gl e duckdb-wasm do site `me` (react), sem dependências cruzadas.

---

## desenvolvimento

```bash
npm install
npm run dev          # http://localhost:5173/dash-sp-job-access/
```

```bash
npm run typecheck    # vue-tsc sem emitir
npm run build        # typecheck + build → dist/
npm run preview      # serve dist/ em /dash-sp-job-access/
```

## dados

o app lê arquivos estáticos de `public/data/`, gerados a partir do `pde-sp` pelo pipeline python:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r pipeline/requirements.txt
.venv/bin/python pipeline/build_access_parquet.py            # padrão: ../pde-sp/data
.venv/bin/python pipeline/build_access_parquet.py --pde-sp /caminho/para/pde-sp/data
```

| arquivo | origem | conteúdo |
|---|---|---|
| `access_h3.parquet` | `pde-sp/data/effects/pond_T001_effects.csv` + `pde-sp/data/address/{destinations,origins}__*.csv` | uma linha por hexágono h3 res. 9 (14.480): `h3`, `access_2013`, `access_2022` (`pond_T001`: empregos alcançáveis em 60 min ponderados pela população), `delta`, `delta_pct`, colunas dos cenários de componente isolado (`*_solo`), `jobs_2013`/`jobs_2021` (empregos formais da rais no hexágono) e `pop_2010`/`pop_2022` (população dos censos interpolada para a grade; o censo 2010 é a população de 2013 no índice) |
| `breaks.json` | calculado no pipeline | quebras de quantis: acessibilidade k=8 por ano (só hexágonos com acesso > 0); empregos (`jobs`) e população (`pop`) k=7 do primeiro ano, aplicadas aos dois anos |
| `sp.geojson` | `pde-sp/data/sp.geojson` | limite municipal (contexto dos mapas) |
| `zones.geojson` | `pde-sp/data/economicZones/economicZones.geojson`, `pde-sp/data/eetu/activeEETU.geojson` | zonas estudadas (zonas econômicas e eixos eetu ativos): os hexágonos de cada zona dissolvidos num multipolígono com o `h3`; contornos ligados/desligados no menu, por cima da camada ativa |

pastas "versão Quali" do `pde-sp` não são usadas.

no navegador, `src/services/duckdb.ts` registra o parquet por http e o duckdb-wasm executa sql sobre ele (lendo só as colunas pedidas). cada camada do dashboard é uma consulta `SELECT h3, <coluna> AS value …`; o painel de consulta faz `SELECT * … WHERE h3 = ?`.

### adicionar uma camada

1. garantir que a coluna exista no parquet (`COLUMNS` em `pipeline/build_access_parquet.py`);
2. adicionar uma entrada em `LAYERS` (`src/config/layers.ts`) com coluna, escala (`quantile` com `breaksKey` ou `diverging` com `domain`) e formato;
3. posicionar a camada no menu em `LAYER_TREE` (grupo → item → opções; um item com mais de uma opção, como os anos da acessibilidade, mostra as opções como links após o nome) e, se for coluna nova, em `DETAIL_GROUPS` (card do hexágono);
4. adicionar os textos em `src/i18n/locales/pt.json` e `en.json`: `layers.<id>.label` (título do mapa) e `.description`, `tree.items.<item>` e `fields.<coluna>`.

---

## design system

o arquivo [`src/styles/design-system.css`](src/styles/design-system.css) é a fonte única de tokens e regras visuais:

- **blocos 1–5** espelham o design system do site [`me`](https://github.com/cperotto/me) (estilo suíço / bauhaus): paleta ink/accent/warm sobre papel creme, archivo + plus jakarta sans + mono, **todo texto em minúsculas**, **raio zero**, bordas de 2px, utilitários semânticos (`.text-ink`, `.bg-card`, `.border-ink`, `.square-btn`…). alterações no `me` devem ser replicadas aqui.
- **bloco 6** é específico deste projeto e replica as escalas de cor dos mapas da dissertação:
  - `--map-level-*` — `coolwarm_r` do matplotlib em 8 classes (quantis) para níveis de acessibilidade;
  - `--map-zone-*` — contornos das zonas estudadas (eixos de transporte — eetu — em azul-escuro, zonas econômicas em verde; só a linha);
  - `--map-level7-*` — `coolwarm_r` em 7 classes para empregos e população por hexágono (`01_dataPrep/07_eda.py`);
  - `--map-diverging-*` — `coolwarm_r` contínua para variações (Δ% real em −100/+100; cenários isolados em −70/+70);
  - `--map-polarity-*` — polaridades cenário × observado (`09_decomposingEffects.py`);
  - `--map-lisa-*` — clusters lisa (padrão do `splot`);
  - limite municipal branco a 40% com contorno cinza, como nos pngs da dissertação.

  os stops do `coolwarm_r` são gerados por `pipeline/sample_colormaps.py` — não editar à mão. o deck.gl lê essas variáveis em runtime (`src/utils/cssTokens.ts`), então o css continua sendo a fonte única.

os componentes de layout (`AppHeader`, `AppFooter`, `ColorBar`, `NavTabs`, `SectionHeader`) reproduzem a marcação dos equivalentes react do `me`.

## idiomas

**vue-i18n** com `pt` (padrão) e `en`, em `src/i18n/locales/`. o idioma escolhido é salvo em `localStorage` na chave `lang`, a mesma usada pelo site `me`. para adicionar um idioma: criar `locales/<código>.json`, registrar em `messages` e em `LOCALES` (`src/i18n/index.ts`).

---

## estrutura

```
index.html                    fontes do google (archivo, plus jakarta sans)
vite.config.ts                base /dash-sp-job-access/, plugins vue + tailwind
pipeline/
  build_access_parquet.py     pde-sp → public/data (parquet, quebras, limite)
  sample_colormaps.py         stops do coolwarm_r para o design-system.css
  requirements.txt            pandas, pyarrow, mapclassify, matplotlib, h3
public/data/                  arquivos estáticos lidos pelo app (gerados)
src/
  main.ts                     cria o app (router + i18n + css)
  App.vue                     escolhe o layout pela rota (padrão na data story; bare no dashboard e no embed)
  router/index.ts             rotas: story, dashboard, embed
  i18n/
    index.ts                  vue-i18n, LOCALES, setLocale
    locales/pt.json · en.json textos da interface
  styles/
    design-system.css         tokens, regras globais, utilitários, escalas dos mapas
  config/
    layers.ts                 camadas, menu em árvore (LAYER_TREE), zonas estudadas (ZONES), campos do card do hexágono
    site.ts                   link do texto completo da dissertação
  services/                   acesso a dados (sem ui)
    duckdb.ts                 instância do duckdb-wasm, registro de arquivos, query()
    accessData.ts             consultas: linhas por camada, detalhe do hexágono, quebras
  composables/
    useMapLayer.ts            dados + escala de cor da camada ativa
    useHexDetails.ts          dados do hexágono selecionado
    useLayerQuery.ts          camada ativa sincronizada com ?layer=
    useScrollReveal.ts        reveal de header/footer no scroll (porte do me)
  utils/
    colorScale.ts             escalas de quantis e divergente → cor rgba + legenda
    cssTokens.ts              lê variáveis css (cores, números) para o deck.gl
    format.ts                 formatação de valores (compacto, %)
  components/
    layout/                   AppLayout, AppHeader, AppFooter, NavTabs, LanguageSwitcher, ColorBar
    ui/                       SectionHeader, FigurePanel (painel de figura da data story)
    map/
      AccessMap.vue           maplibre + deck.gl (H3HexagonLayer), hover e seleção
      MapExplorer.vue         mapa + mapa em tela cheia + cards (trabalho e camadas, camada ativa e escala, hexágono) e slot `action` (dashboard e embed)
      LayerTree.vue           menu de camadas em árvore, com anos como links
      MapLegend.vue           legenda por classes ou gradiente
      FeatureInfo.vue         card do hexágono: todos os campos, camada ativa em negrito
  pages/
    StoryPage.vue             data story
    DashboardPage.vue         dashboard
    EmbedMapPage.vue          versão para iframe
```

## deploy

o `base` do vite já aponta para `/dash-sp-job-access/` (project page em `https://cperotto.github.io/dash-sp-job-access/`). falta o workflow do github actions — o do `me` (`.github/workflows/deploy.yml`) serve como modelo.
