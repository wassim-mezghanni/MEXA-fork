"""Compute MEXA margin-analysis data for the dashboard.

For each (model, pivot, language) this measures WHY MEXA scores differ across
pivots: the margin (true-pair similarity minus best distractor similarity) that
the mexa() criterion thresholds on, plus per-pivot space geometry (within-
language spread and non-parallel baseline similarity).

Run on the cluster from the repo root:
    python3 scratch/compute_margin_analysis.py
"""
import pickle
import numpy as np
import os
import json

PIVOTS = ["eng_Latn", "arb_Arab", "deu_Latn", "fra_Latn"]
NUM_SENTS = 100

MODELS = [
    ("experiments/llama/llama3.1 8B", "llama3.1_8b"),
    ("experiments/mistral/mistral 0.3 7B", "mistral_7b_v03"),
    ("experiments/qwen/qwen3 4B", "qwen3_4b"),
    ("experiments/qwen/qwen3 8B", "qwen3_8b"),
    ("experiments/qwen/qwen3.5 9B", "qwen3.5_9b"),
]


def load_normed(path):
    """Load a pickle and return {layer_key: unit-normalized (n, d) array}."""
    with open(path, "rb") as f:
        raw = pickle.load(f)
    out = {}
    for layer, sents in raw.items():
        A = np.stack([x["embd_weighted"] for x in sents[:NUM_SENTS]]).astype(np.float64)
        A /= np.linalg.norm(A, axis=1, keepdims=True) + 1e-9
        out[layer] = A
    return out


def layer_stats(P, L):
    """Similarity-matrix stats for one pivot/language layer pair."""
    S = P @ L.T
    d = np.diag(S).copy()
    np.fill_diagonal(S, -np.inf)
    row_max = S.max(axis=1)
    col_max = S.max(axis=0)
    mexa = float(np.mean((d > row_max) & (d > col_max)))
    margin = float(np.mean(d - row_max))
    np.fill_diagonal(S, np.nan)
    return {
        "mexa": mexa,
        "margin": margin,
        "diag": float(d.mean()),
        "maxOff": float(row_max.mean()),
        "offMean": float(np.nanmean(S)),
    }


for model_dir, suffix in MODELS:
    embd_dir = os.path.join(model_dir, "FLORES_table1_100_experiment", "embeddings")
    langs = sorted(f[:-4] for f in os.listdir(embd_dir) if f.endswith(".pkl"))
    print(f"== {suffix}: {len(langs)} languages ==", flush=True)

    pivot_embd = {p: load_normed(os.path.join(embd_dir, f"{p}.pkl")) for p in PIVOTS}
    layer_keys = sorted(pivot_embd[PIVOTS[0]].keys(), key=lambda k: int(k))
    mid = layer_keys[round(0.4 * (len(layer_keys) - 1))]

    # Space geometry per pivot at a fixed representative layer
    geometry = {}
    for p in PIVOTS:
        A = pivot_embd[p][mid]
        S = A @ A.T
        np.fill_diagonal(S, np.nan)
        geometry[p] = {"withinSim": round(float(np.nanmean(S)), 4)}

    languages = {}
    baseline_acc = {p: [] for p in PIVOTS}
    for lang in langs:
        L = load_normed(os.path.join(embd_dir, f"{lang}.pkl"))
        entry = {}
        for p in PIVOTS:
            per_layer = [layer_stats(pivot_embd[p][k], L[k]) for k in layer_keys]
            best = max(range(len(per_layer)), key=lambda i: per_layer[i]["mexa"])
            b = per_layer[best]
            entry[p] = {
                "bestLayer": int(layer_keys[best]),
                "mexa": round(b["mexa"], 4),
                "margin": round(b["margin"], 4),
                "diag": round(b["diag"], 4),
                "maxOff": round(b["maxOff"], 4),
                "marginByLayer": [round(x["margin"], 4) for x in per_layer],
                "mexaByLayer": [round(x["mexa"], 4) for x in per_layer],
            }
            if lang not in PIVOTS:
                mid_i = layer_keys.index(mid)
                baseline_acc[p].append(per_layer[mid_i]["offMean"])
        languages[lang] = entry
        print(f"  {lang} done", flush=True)

    for p in PIVOTS:
        geometry[p]["baselineSim"] = round(float(np.mean(baseline_acc[p])), 4)

    out = {
        "model": suffix,
        "pivots": PIVOTS,
        "layerKeys": [int(k) for k in layer_keys],
        "geometryLayer": int(mid),
        "geometry": geometry,
        "languages": languages,
    }
    out_path = f"dashboard/public/data/margins_flores_table1_100_{suffix}.json"
    with open(out_path, "w") as f:
        json.dump(out, f)
    print(f"  saved {out_path}", flush=True)

print("ALL MODELS DONE")
