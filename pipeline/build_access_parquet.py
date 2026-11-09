"""Gera o parquet de acessibilidade por hexágono H3 (res. 9) usado pelo app.

Fonte: pde-sp/data/effects/pond_T001_effects.csv (resultados da dissertação,
2013 e 2022 já unidos por hexágono, com os cenários de componente isolado).
`pond_T001` = empregos alcançáveis em 60 min ponderados pela população do
hexágono de origem. Pastas "versão Quali" não são usadas.

Empregos e população por hexágono vêm dos insumos do cálculo
(pde-sp/data/address): destinations__{2013,2021}.csv (`T001`, empregos formais
da RAIS geocodificados) e origins__{2013,2022}.csv (`N_HOUSING`, população dos
censos 2010 e 2022 interpolada para a grade h3 em 01_dataPrep/08_gradeCenso.py;
o arquivo "2013" é o censo 2010).

Zonas estudadas (contornos sobrepostos no mapa): conjuntos de hexágonos de
pde-sp/data/economicZones/economicZones.geojson (zonas econômicas) e
pde-sp/data/eetu/activeEETU.geojson (eixos eetu ativos), os mesmos usados em
02_access/10_elasticities.py; dissolvidos em multipolígonos com o h3.

Saídas:
  public/data/access_h3.parquet  uma linha por hexágono, colunas legíveis
  public/data/breaks.json        quebras de quantis: acessibilidade k=8 por ano (hexágonos com
                                 acesso > 0); empregos e população k=7 do primeiro ano
  public/data/sp.geojson         limite municipal (contexto dos mapas)
  public/data/zones.geojson      contorno das zonas estudadas (propriedade `zone`)

uso: python pipeline/build_access_parquet.py [--pde-sp ../pde-sp/data]
"""

import argparse
import json
import shutil
from pathlib import Path

import h3
import mapclassify
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "data"

# quantis k=8 sobre hexágonos com acesso > 0, como em
# pde-sp/02_access/08_access___scenarios.py (plotHexMap)
N_QUANTILES = 8

# empregos e população: quantis k=7 do primeiro ano aplicados aos dois anos,
# como em pde-sp/01_dataPrep/07_eda.py (bins_T001_2013, bins_housing_2013)
N_LAND_USE_QUANTILES = 7

# (arquivo em data/address, coluna de id, coluna de valor) → coluna no parquet
LAND_USE = {
    "jobs_2013": ("destinations__2013.csv", "id_hex", "T001"),
    "jobs_2021": ("destinations__2021.csv", "id_hex", "T001"),
    "pop_2010": ("origins__2013.csv", "h3_09", "N_HOUSING"),
    "pop_2022": ("origins__2022.csv", "h3_09", "N_HOUSING"),
}

COLUMNS = {
    "h3_09": "h3",
    "T001__real__2013": "access_2013",
    "T001__real__2022": "access_2022",
    "AAreal___delta": "delta",
    "AAreal___deltaPerc": "delta_pct",
    "T001__jobs__solo": "access_jobs_solo",
    "T001__housing__solo": "access_housing_solo",
    "T001__network__solo": "access_network_solo",
    "AAdev2013__fromSoloJobs__perc": "delta_pct_jobs_solo",
    "AAdev2013__fromSoloHousing__perc": "delta_pct_housing_solo",
    "AAdev2013__fromSoloNetwork__perc": "delta_pct_network_solo",
}


def load_effects(pde_sp_data: Path) -> pd.DataFrame:
    path = pde_sp_data / "effects" / "pond_T001_effects.csv"
    df = pd.read_csv(path, sep=";", decimal=",", usecols=list(COLUMNS))
    df = df.rename(columns=COLUMNS)
    # divisão por zero na origem gera ±inf no delta %; vira nulo
    return df.replace([np.inf, -np.inf], np.nan)


def load_land_use(pde_sp_data: Path) -> pd.DataFrame:
    """empregos e população por hexágono, um vetor por coluna (soma por h3)"""
    frames = []
    for column, (file, id_col, value_col) in LAND_USE.items():
        df = pd.read_csv(pde_sp_data / "address" / file, sep=";", usecols=[id_col, value_col])
        frames.append(df.groupby(id_col)[value_col].sum().rename(column).rename_axis("h3"))
    return pd.concat(frames, axis=1).reset_index()


# id da zona (config/layers.ts → ZONES) → arquivo em pde-sp/data
ZONES = {
    "economic": "economicZones/economicZones.geojson",
    "eetu": "eetu/activeEETU.geojson",
}


def build_zones(pde_sp_data: Path) -> dict:
    """une os hexágonos de cada zona num multipolígono (só o contorno externo e os buracos)"""
    features = []
    for zone, file in ZONES.items():
        source = json.loads((pde_sp_data / file).read_text())
        cells = sorted({f["properties"]["h3_09"] for f in source["features"]})
        geometry = h3.cells_to_geo(cells)
        features.append({"type": "Feature", "properties": {"zone": zone, "cells": len(cells)}, "geometry": geometry})
    return {"type": "FeatureCollection", "features": features}


def quantile_breaks(values: pd.Series, k: int = N_QUANTILES) -> list[float]:
    positive = values[values > 0]
    return [float(b) for b in mapclassify.Quantiles(positive, k=k).bins]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pde-sp", type=Path, default=ROOT.parent / "pde-sp" / "data")
    args = parser.parse_args()

    # outer: hexágonos com empregos ou população fora da tabela de acessibilidade também entram
    df = load_effects(args.pde_sp).merge(load_land_use(args.pde_sp), on="h3", how="outer")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_parquet(OUT_DIR / "access_h3.parquet", index=False)

    breaks = {col: quantile_breaks(df[col]) for col in ("access_2013", "access_2022")}
    breaks["jobs"] = quantile_breaks(df["jobs_2013"], N_LAND_USE_QUANTILES)
    breaks["pop"] = quantile_breaks(df["pop_2010"], N_LAND_USE_QUANTILES)
    (OUT_DIR / "breaks.json").write_text(json.dumps(breaks, indent=2))
    shutil.copy(args.pde_sp / "sp.geojson", OUT_DIR / "sp.geojson")
    zones = build_zones(args.pde_sp)
    (OUT_DIR / "zones.geojson").write_text(json.dumps(zones, separators=(",", ":")))
    for f in zones["features"]:
        print(f"zona {f['properties']['zone']}: {f['properties']['cells']} hexágonos, {f['geometry']['type']}")

    print(f"{len(df)} hexágonos → {OUT_DIR / 'access_h3.parquet'}")
    print(df.describe().T[["min", "50%", "max"]])


if __name__ == "__main__":
    main()
