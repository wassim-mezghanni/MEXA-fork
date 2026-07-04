"""Build cross-model "language difficulty" datasets for the Bad-Languages page.

For each dataset family (FLORES, Bible) we aggregate EVERY model and experiment:
each per-model results CSV contributes its `avg` (max-pool) score per language.
The model identity is read from the `<model_id>_max` column header, so multiple
experiments for the same model (e.g. table1-100 + table1-2000 + full) collapse
into ONE model column (averaged), giving one clean column per model.

Output (dashboard/public/data/):
  - language_difficulty_flores.json
  - language_difficulty_bible.json

Each JSON: { dataset, num_models, models:[display...], languages:[ {
    code, name, script, avg, min, max, std, num_models, n_above_0_5,
    best_model, worst_model, scores:{model:score} } ] } sorted by avg ascending.

Non-English pivot experiments (*_pivot_*) are excluded — they belong to the
pivot-comparison page, not the standard eng_Latn difficulty analysis.
"""
import os
import glob
import json
import numpy as np
import pandas as pd

DATA_DIR = "/Users/wassim/MEXA-fork/dashboard/public/data"
MIN_MODELS = 3          # drop languages measured by fewer than this many models (noise)
ABOVE_THRESHOLD = 0.5   # "a model handles this language" cutoff


def load_language_names():
    with open(os.path.join(DATA_DIR, "language_names.json")) as f:
        return json.load(f)


def display_name(model_id):
    """`meta-llama/Llama-3.1-8B` -> `Llama-3.1-8B`."""
    return model_id.split("/")[-1]


def build(files, out_name, lang_names):
    files = sorted(f for f in files if "_pivot_" not in os.path.basename(f))
    if not files:
        print(f"[skip] no input files for {out_name}")
        return

    # per_model[display][code] -> list of avg(max-pool) scores across that model's experiments
    per_model = {}
    for f in files:
        df = pd.read_csv(f)
        if "code" not in df.columns:
            continue
        max_col = next((c for c in df.columns if c.endswith("_max")), None)
        if not max_col:
            continue
        model = display_name(max_col[:-4])
        score_col = "avg" if "avg" in df.columns else max_col
        bucket = per_model.setdefault(model, {})
        for _, row in df.iterrows():
            code = row["code"]
            if code == "eng_Latn":      # English is the pivot, not a target
                continue
            val = row[score_col]
            if pd.isna(val):
                continue
            bucket.setdefault(code, []).append(float(val))

    models = sorted(per_model.keys())

    # collapse each model's experiments to a single per-language score (mean)
    model_lang = {m: {c: float(np.mean(v)) for c, v in d.items()} for m, d in per_model.items()}

    # gather all languages
    all_codes = sorted({c for d in model_lang.values() for c in d})

    rows = []
    for code in all_codes:
        scores = {m: model_lang[m][code] for m in models if code in model_lang[m]}
        if len(scores) < MIN_MODELS:
            continue
        vals = np.array(list(scores.values()), dtype=float)
        best_model = max(scores, key=scores.get)
        worst_model = min(scores, key=scores.get)
        iso = code.split("_")[0]
        script = code.split("_")[1] if "_" in code else ""
        rows.append({
            "code": code,
            "name": lang_names.get(iso, iso),
            "script": script,
            "avg": round(float(vals.mean()), 4),
            "min": round(float(vals.min()), 4),
            "max": round(float(vals.max()), 4),
            "std": round(float(vals.std()), 4),
            "num_models": int(len(scores)),
            "n_above_0_5": int((vals >= ABOVE_THRESHOLD).sum()),
            "best_model": best_model,
            "worst_model": worst_model,
            "scores": {m: round(s, 4) for m, s in scores.items()},
        })

    rows.sort(key=lambda r: r["avg"])
    out = {
        "dataset": out_name.split("_")[-1].replace(".json", ""),
        "num_models": len(models),
        "models": models,
        "languages": rows,
    }
    out_path = os.path.join(DATA_DIR, out_name)
    with open(out_path, "w") as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"[ok] {out_name}: {len(rows)} languages, {len(models)} models -> {out_path}")


def main():
    lang_names = load_language_names()

    flores_files = (
        glob.glob(os.path.join(DATA_DIR, "full_flores_*_results.csv"))
        + glob.glob(os.path.join(DATA_DIR, "flores_*_results.csv"))
        + glob.glob(os.path.join(DATA_DIR, "flores-table1*_results.csv"))
        # full-corpus runs that use hyphenated names (merged by model id from the header)
        + glob.glob(os.path.join(DATA_DIR, "*-flores-results.csv"))
    )
    build(flores_files, "language_difficulty_flores.json", lang_names)

    bible_files = (
        glob.glob(os.path.join(DATA_DIR, "bible_*_results.csv"))
        + glob.glob(os.path.join(DATA_DIR, "*-bible-results.csv"))
    )
    build(bible_files, "language_difficulty_bible.json", lang_names)


if __name__ == "__main__":
    main()
