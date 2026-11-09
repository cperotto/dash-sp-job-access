"""Amostra o colormap `coolwarm_r` do matplotlib e imprime os stops hex.

Os mapas da dissertação (pde-sp) usam `coolwarm_r` em todos os coropléticos.
A saída deste script é colada em `src/styles/design-system.css` como variáveis
`--map-level-*` (8 classes de quantis), `--map-level7-*` (7 classes) e `--map-diverging-*` (rampa contínua).

uso: python pipeline/sample_colormaps.py
"""

import matplotlib
import matplotlib.colors as mcolors

N_LEVEL_CLASSES = 8   # k=8 em pde-sp/02_access/08_access___scenarios.py
N_LAND_USE_CLASSES = 7  # k=7 em pde-sp/01_dataPrep/07_eda.py (empregos e população)
N_DIVERGING_STOPS = 11

cmap = matplotlib.colormaps["coolwarm_r"]


def sample(n: int) -> list[str]:
    # geopandas com scheme + k classes amostra o cmap em k pontos igualmente espaçados em [0, 1]
    return [mcolors.to_hex(cmap(i / (n - 1))) for i in range(n)]


def as_css(prefix: str, colors: list[str]) -> str:
    return "\n".join(f"  --{prefix}-{i}: {c};" for i, c in enumerate(colors))


if __name__ == "__main__":
    print("/* coolwarm_r — níveis (k=8, quantis) */")
    print(as_css("map-level", sample(N_LEVEL_CLASSES)))
    print("/* coolwarm_r — empregos e população (k=7, quantis) */")
    print(as_css("map-level7", sample(N_LAND_USE_CLASSES)))
    print("/* coolwarm_r — divergente contínua (vmin → vmax) */")
    print(as_css("map-diverging", sample(N_DIVERGING_STOPS)))
