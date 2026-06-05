#!/usr/bin/env python3
"""
Atsisiunčia RC JAR atvirus duomenis ir išfiltruoja katalikų parapijas.
Šaltinis: https://www.registrucentras.lt/aduomenys/?byla=JAR_IREGISTRUOTI.csv
(senas JAR_JA_PIRMINIAI.zip nebeprieinamas)
"""
import io
import json
import os

import pandas as pd
import requests

JAR_DATA_URL = "https://www.registrucentras.lt/aduomenys/?byla=JAR_IREGISTRUOTI.csv"
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "lietuvos_parapijos.csv")
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "lietuvos_parapijos.json")


def download_jar_csv() -> str:
    print("1. Atsisiunčiami Registrų Centro JAR duomenys (JAR_IREGISTRUOTI.csv)...")
    response = requests.get(
        JAR_DATA_URL,
        timeout=300,
        headers={"User-Agent": "AETERNA-parish-import/1.0"},
    )
    if response.status_code != 200:
        raise RuntimeError(f"RC HTTP {response.status_code}")
    text = response.content.decode("utf-8")
    print(f"   Gauta {len(text) // 1024} KB")
    return text


def filter_parishes(csv_data: str) -> pd.DataFrame:
    print("2. Filtruojamos katalikų parapijos...")
    df = pd.read_csv(io.StringIO(csv_data), sep="|", dtype=str)
    df["search_name"] = df["ja_pavadinimas"].str.lower()

    is_parapija = df["search_name"].str.contains("parapija", na=False)
    is_ortodoksu = df["search_name"].str.contains(
        r"stačiatikių|ortodoksų|parapija.*vyskupija", na=False, regex=True
    )
    is_liuteronu = df["search_name"].str.contains("liuteronų", na=False)
    is_reformatu = df["search_name"].str.contains("reformatų", na=False)
    is_sentikiu = df["search_name"].str.contains("sentikių", na=False)

    parapijos_df = df[
        is_parapija & ~is_ortodoksu & ~is_liuteronu & ~is_reformatu & ~is_sentikiu
    ].copy()

    stat = parapijos_df["stat_pavadinimas"].fillna("")
    parapijos_df = parapijos_df[
        stat.isna()
        | stat.eq("")
        | stat.str.contains("neįregistruot", case=False, na=False)
    ]

    final_df = (
        parapijos_df[["ja_kodas", "ja_pavadinimas", "adresas"]]
        .rename(
            columns={
                "ja_kodas": "kodas",
                "ja_pavadinimas": "pavadinimas",
                "adresas": "adresas",
            }
        )
        .sort_values(by="pavadinimas")
        .reset_index(drop=True)
    )
    return final_df


def main() -> None:
    csv_raw = download_jar_csv()
    result_df = filter_parishes(csv_raw)
    result_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    records = result_df.to_dict(orient="records")
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print("\n=== SĖKMINGAI BAIGTA ===")
    print(f"Parapijų: {len(result_df)}")
    print(f"CSV: {OUTPUT_CSV}")
    print(f"JSON: {OUTPUT_JSON}")
    print(result_df.head())


if __name__ == "__main__":
    main()
