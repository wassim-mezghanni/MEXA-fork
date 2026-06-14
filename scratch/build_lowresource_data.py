"""Aggregate per-model MEXA results into cross-model average scores per language,
for both the full FLORES (204 langs) and full Bible (1401 langs) corpora.

Output (written to dashboard/public/data/):
  - lowresource_flores_avg.csv
  - lowresource_bible_avg.csv
Columns: code, avg (mean of per-model max-pool), avg_mean, min, max, num_models

A language is kept only if it has a score in at least half of the available models,
matching the convention in find_bad_languages.py (filters out noisy single-model langs).
"""
import os
import glob
import numpy as np
import pandas as pd

DATA_DIR = "/Users/wassim/MEXA-fork/dashboard/public/data"


def aggregate(files, out_name):
    files = sorted(files)
    if not files:
        print(f"[skip] no input files for {out_name}")
        return

    per_lang_max, per_lang_mean = {}, {}
    for f in files:
        df = pd.read_csv(f)
        if "code" not in df.columns:
            continue
        max_col = next((c for c in df.columns if c.endswith("_max")), None)
        mean_col = next((c for c in df.columns if c.endswith("_mean")), None)
        if not max_col:
            continue
        for _, row in df.iterrows():
            code = row["code"]
            if code == "eng_Latn":  # English is the pivot, not a target
                continue
            mx = row[max_col]
            if pd.isna(mx):
                continue
            per_lang_max.setdefault(code, []).append(float(mx))
            if mean_col and not pd.isna(row[mean_col]):
                per_lang_mean.setdefault(code, []).append(float(row[mean_col]))

    n_models = len(files)
    rows = []
    for code, vals in per_lang_max.items():
        if len(vals) < n_models / 2:
            continue
        means = per_lang_mean.get(code, [])
        rows.append({
            "code": code,
            "avg": round(float(np.mean(vals)), 4),
            "avg_mean": round(float(np.mean(means)), 4) if means else "",
            "min": round(float(np.min(vals)), 4),
            "max": round(float(np.max(vals)), 4),
            "num_models": len(vals),
        })

    out = pd.DataFrame(rows).sort_values("avg")
    out_path = os.path.join(DATA_DIR, out_name)
    out.to_csv(out_path, index=False)
    print(f"[ok] {out_name}: {len(out)} languages from {n_models} models")


# Full FLORES = 204-lang runs (full_flores_*); the low-resource tail lives here.
flores_files = glob.glob(os.path.join(DATA_DIR, "full_flores_*_results.csv"))
aggregate(flores_files, "lowresource_flores_avg.csv")

# Full Bible = bible_*_results.csv, excluding the bible_table1_* subset runs.
bible_files = [
    f for f in glob.glob(os.path.join(DATA_DIR, "bible_*_results.csv"))
    if "table1" not in os.path.basename(f)
]
aggregate(bible_files, "lowresource_bible_avg.csv")
