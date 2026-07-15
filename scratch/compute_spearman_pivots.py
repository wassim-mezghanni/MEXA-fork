"""Spearman rank correlations of per-language MEXA scores across pivots.

For every model, correlates the language ranking produced by each pivot with
every other pivot's ranking (standard scoring, max-pooled). The six pivot
languages themselves are excluded from the ranking set, since a pivot's own
row is a trivial 1.0 self-score.

Runs locally on the CSVs in dashboard/public/data — no cluster needed.
Output: dashboard/public/data/spearman_flores_table1_100.json
"""
import csv
import json
import os
from scipy.stats import spearmanr

DATA = "dashboard/public/data"

MODELS = [
    ("llama3.1_8b", "meta-llama/Llama-3.1-8B", "Llama 3.1 8B"),
    ("mistral_7b_v03", "mistralai/Mistral-7B-v0.3", "Mistral 7B v0.3"),
    ("qwen3.5_9b", "Qwen/Qwen3.5-9B-Base", "Qwen3.5 9B Base"),
    ("qwen3_8b", "Qwen/Qwen3-8B-Base", "Qwen3 8B Base"),
    ("qwen3_4b", "Qwen/Qwen3-4B", "Qwen3 4B"),
]

PIVOTS = [
    ("eng_Latn", ""),
    ("arb_Arab", "arabic_pivot_"),
    ("deu_Latn", "german_pivot_"),
    ("fra_Latn", "french_pivot_"),
    ("eus_Latn", "basque_pivot_"),
    ("zho_Hans", "chinese_pivot_"),
]
PIVOT_CODES = {p for p, _ in PIVOTS}


def load(suffix, infix, col):
    path = os.path.join(DATA, f"flores_table1_100_{suffix}_{infix}results.csv")
    with open(path) as f:
        return {r["code"]: float(r[col + "_max"]) for r in csv.DictReader(f)}


out = {"pivots": [p for p, _ in PIVOTS], "models": {}}
for suffix, col, label in MODELS:
    scores = {p: load(suffix, infix, col) for p, infix in PIVOTS}
    langs = sorted(set.intersection(*[set(v) for v in scores.values()]) - PIVOT_CODES)
    matrix = {}
    for a, _ in PIVOTS:
        matrix[a] = {}
        for b, _ in PIVOTS:
            rho, _p = spearmanr([scores[a][l] for l in langs], [scores[b][l] for l in langs])
            matrix[a][b] = round(float(rho), 4)
    out["models"][suffix] = {"label": label, "nLangs": len(langs), "rho": matrix}
    row = matrix["eng_Latn"]
    print(f"{label:<16} n={len(langs)}  vs eng: " + "  ".join(f"{p.split('_')[0]}={row[p]:.3f}" for p, _ in PIVOTS[1:]))

with open(os.path.join(DATA, "spearman_flores_table1_100.json"), "w") as f:
    json.dump(out, f)
print("saved", os.path.join(DATA, "spearman_flores_table1_100.json"))
