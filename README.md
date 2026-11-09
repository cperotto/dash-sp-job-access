# dash-sp-job-access

> **live project:** [https://cperotto.github.io/dash-sp-job-access/#/dashboard](https://cperotto.github.io/dash-sp-job-access/#/dashboard)

job accessibility in são paulo, 2013 → 2022 — data story + spatial dashboard  
vue + vite + tailwind, deck.gl over maplibre, duckdb-wasm over parquet, hostable on github pages

built upon the findings of the master's thesis *os movimentos da acessibilidade: interações entre regulação, uso do solo e mobilidade em são paulo entre 2013 e 2022* (*the movements of accessibility: interactions between regulation, land use, and mobility in são paulo between 2013 and 2022*) (perotto, insper, 2025). original data and processing pipeline are available in the [pde-sp](https://github.com/cperotto/pde-sp) repository.

---

## pages

| route | content |
|---|---|
| `#/` | **data story** — context → results → discussion, text + html maps and charts |
| `#/dashboard` | **dashboard** — full-screen map without header/footer, featuring overlay cards: (1) thesis title, link to full text, language switcher, and tree-structured layer menu; (2) active layer, description, and scale; hexagon inspection panel at top-right (visible only when a hexagon is selected, dismissible via ✕; displays all metrics with active layer in bold); button to data story at bottom-right |
| `#/embed/mapa` | **embed** — identical map and overlay cards as the dashboard; bottom-right link to open the full dashboard |

routes live after the `#` (hash history) to run smoothly on github pages without server-side routing configuration, matching the `me` website.

### embed in personal website

the embed route supports `?layer=<id>` and `?lang=pt|en` (the embed language parameter does not overwrite the language preference saved on the host site):

```html
<iframe
  src="https://cperotto.github.io/dash-sp-job-access/#/embed/mapa?layer=delta_pct&lang=pt"
  width="100%" height="640" style="border:0" loading="lazy"
  title="job accessibility in são paulo"></iframe>
```

the iframe isolates vue, deck.gl, and duckdb-wasm from the `me` site (react), avoiding cross-framework dependencies.

---

## development

```bash
npm install
npm run dev          # http://localhost:5173/dash-sp-job-access/
```

```bash
npm run typecheck    # vue-tsc without emit
npm run build        # typecheck + build → dist/
npm run preview      # serve dist/ at /dash-sp-job-access/
```

## data

the app reads static files from `public/data/`, generated from `pde-sp` via the python pipeline:

```bash
uv venv .venv && uv pip install --python .venv/bin/python -r pipeline/requirements.txt
.venv/bin/python pipeline/build_access_parquet.py            # default: ../pde-sp/data
.venv/bin/python pipeline/build_access_parquet.py --pde-sp /path/to/pde-sp/data
```

| file | source | content |
|---|---|---|
| `access_h3.parquet` | `pde-sp/data/effects/pond_T001_effects.csv` + `pde-sp/data/address/{destinations,origins}__*.csv` | one row per h3 resolution 9 hexagon (14,480 cells): `h3`, `access_2013`, `access_2022` (`pond_T001`: population-weighted reachable jobs within 60 min), `delta`, `delta_pct`, isolated component scenario columns (`*_solo`), `jobs_2013`/`jobs_2021` (formal rais jobs in the hexagon), and `pop_2010`/`pop_2022` (census population interpolated onto the grid; 2010 census serves as the 2013 population in the index) |
| `breaks.json` | computed in the pipeline | quantile breaks: accessibility k=8 per year (hexagons with access > 0 only); jobs (`jobs`) and population (`pop`) k=7 from the baseline year, applied to both years |
| `sp.geojson` | `pde-sp/data/sp.geojson` | municipal boundary (map context) |
| `zones.geojson` | `pde-sp/data/economicZones/economicZones.geojson`, `pde-sp/data/eetu/activeEETU.geojson` | study zones (economic zones and active eetu transit corridors): hexagons of each zone dissolved into multipolygons with their `h3` ids; boundary outlines toggleable in the menu, rendered above the active layer |

the "versão Quali" folders from `pde-sp` are not used.

in the browser, `src/services/duckdb.ts` registers the parquet file over http and duckdb-wasm executes sql against it (reading only requested columns). each dashboard layer corresponds to a query: `SELECT h3, <column> AS value …`; the hexagon inspection card executes: `SELECT * … WHERE h3 = ?`.

### adding a layer

1. ensure the column exists in the parquet file (`COLUMNS` in `pipeline/build_access_parquet.py`);
2. add an entry in `LAYERS` (`src/config/layers.ts`) specifying column name, scale type (`quantile` with `breaksKey` or `diverging` with `domain`), and value formatting;
3. position the layer in the menu under `LAYER_TREE` (group → item → options; items with multiple options, such as accessibility years, display options as links next to the label) and, if it is a new column, in `DETAIL_GROUPS` (hexagon inspection card);
4. add translation keys in `src/i18n/locales/pt.json` and `en.json`: `layers.<id>.label` (map title) and `.description`, `tree.items.<item>`, and `fields.<column>`.

---

## design system

the [`src/styles/design-system.css`](src/styles/design-system.css) file serves as the single source of truth for visual tokens and design rules:

- **blocks 1–5** mirror the design system of the [`me`](https://github.com/cperotto/me) site (swiss / bauhaus style): ink/accent/warm palette over cream paper background, archivo + plus jakarta sans + mono, **all text in lowercase**, **zero border-radius**, 2px borders, semantic utilities (`.text-ink`, `.bg-card`, `.border-ink`, `.square-btn`…). changes in `me` should be reflected here.
- **block 6** is specific to this project and replicates the colormaps from the thesis maps:
  - `--map-level-*` — matplotlib's `coolwarm_r` in 8 classes (quantiles) for accessibility levels;
  - `--map-zone-*` — outlines of study zones (transit corridors — eetu — in dark blue, economic zones in green; outline only);
  - `--map-level7-*` — `coolwarm_r` in 7 classes for jobs and population per hexagon (`01_dataPrep/07_eda.py`);
  - `--map-diverging-*` — continuous `coolwarm_r` for variations (observed Δ% in −100/+100; isolated scenarios in −70/+70);
  - `--map-polarity-*` — scenario × observed polarities (`09_decomposingEffects.py`);
  - `--map-lisa-*` — lisa spatial clusters (`splot` defaults);
  - municipal boundary in 40% white with gray outline, matching the thesis figures.

  the `coolwarm_r` color stops are generated by `pipeline/sample_colormaps.py` — do not edit manually. deck.gl reads these css variables at runtime (`src/utils/cssTokens.ts`), preserving css as the single source of truth.

layout components (`AppHeader`, `AppFooter`, `ColorBar`, `NavTabs`, `SectionHeader`) replicate the markup of their react counterparts in `me`.

## languages

**vue-i18n** with `pt` (default) and `en`, located in `src/i18n/locales/`. the selected language is persisted in `localStorage` under the `lang` key, matching the one used by the `me` site. to add a new language: create `locales/<code>.json`, register it in `messages` and in `LOCALES` (`src/i18n/index.ts`).

---

## project structure

```
index.html                    google fonts (archivo, plus jakarta sans)
vite.config.ts                base /dash-sp-job-access/, vue + tailwind plugins
pipeline/
  build_access_parquet.py     pde-sp → public/data (parquet, breaks, boundaries)
  sample_colormaps.py         coolwarm_r stops for design-system.css
  requirements.txt            pandas, pyarrow, mapclassify, matplotlib, h3
public/data/                  static data files consumed by the app (generated)
src/
  main.ts                     app entry point (router + i18n + css)
  App.vue                     layout switcher based on route (standard for data story; bare for dashboard and embed)
  router/index.ts             routes: story, dashboard, embed
  i18n/
    index.ts                  vue-i18n, LOCALES, setLocale
    locales/pt.json · en.json ui localization strings
  styles/
    design-system.css         tokens, global rules, utilities, map scales
  config/
    layers.ts                 layers, tree menu (LAYER_TREE), study zones (ZONES), hexagon card fields
    site.ts                   link to the full thesis text
  services/                   data access (headless)
    duckdb.ts                 duckdb-wasm instance, file registration, query()
    accessData.ts             queries: layer rows, hexagon detail, breaks
  composables/
    useMapLayer.ts            data + color scale for active layer
    useHexDetails.ts          selected hexagon data
    useLayerQuery.ts          active layer synchronized with ?layer=
    useScrollReveal.ts        header/footer scroll reveal (ported from me)
  utils/
    colorScale.ts             quantile and diverging scales → rgba color + legend
    cssTokens.ts              reads css variables (colors, numbers) for deck.gl
    format.ts                 value formatting (compact, %)
  components/
    layout/                   AppLayout, AppHeader, AppFooter, NavTabs, LanguageSwitcher, ColorBar
    ui/                       SectionHeader, FigurePanel (data story figure container)
    map/
      AccessMap.vue           maplibre + deck.gl (H3HexagonLayer), hover and selection
      MapExplorer.vue         map + fullscreen container + overlay cards (thesis & layers, active layer & scale, hexagon details) and `action` slot (dashboard & embed)
      LayerTree.vue           hierarchical layer menu with year links
      MapLegend.vue           class-based or gradient legend
      FeatureInfo.vue         hexagon inspection card: all metrics, active layer in bold
  pages/
    StoryPage.vue             data story
    DashboardPage.vue         dashboard
    EmbedMapPage.vue          iframe embed version
```

## deployment

vite's `base` is already configured for `/dash-sp-job-access/` (github pages project site at `https://cperotto.github.io/dash-sp-job-access/`). only the github actions workflow is pending — the workflow from `me` (`.github/workflows/deploy.yml`) can be used as a template.
