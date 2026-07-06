"""Compute CENTERED MEXA scores for all models and pivots.

Centered MEXA mean-centers each language's embeddings per layer (subtracting
the language's mean vector) before cosine similarity. This removes the shared
"language identity" component whose per-pivot compression makes raw MEXA
scores incomparable across pivots.

Writes per-language score JSONs (same format as compute_mexa.py) and formats
them into dashboard CSVs via shared/format_results.py.

Run on the cluster from the repo root:
    python3 scratch/compute_centered_mexa.py
"""
import pickle
import numpy as np
import os
import json
import subprocess

NUM_SENTS = 100

PIVOTS = [
    ("eng_Latn", ""),  # empty infix -> flores_table1_100_<suffix>_centered_results.csv
    ("arb_Arab", "arabic_pivot_"),
    ("deu_Latn", "german_pivot_"),
    ("fra_Latn", "french_pivot_"),
]

MODELS = [
    ("experiments/llama/llama3.1 8B", "meta-llama/Llama-3.1-8B", "llama3.1_8b"),
    ("experiments/mistral/mistral 0.3 7B", "mistralai/Mistral-7B-v0.3", "mistral_7b_v03"),
    ("experiments/qwen/qwen3 4B", "Qwen/Qwen3-4B", "qwen3_4b"),
    ("experiments/qwen/qwen3 8B", "Qwen/Qwen3-8B-Base", "qwen3_8b"),
    ("experiments/qwen/qwen3.5 9B", "Qwen/Qwen3.5-9B-Base", "qwen3.5_9b"),
]


def load_centered_normed(path):
    """Load embeddings, mean-center per layer, unit-normalize."""
    with open(path, "rb") as f:
        raw = pickle.load(f)
    out = {}
    for layer, sents in raw.items():
        A = np.stack([x["embd_weighted"] for x in sents[:NUM_SENTS]]).astype(np.float64)
        A = A - A.mean(axis=0, keepdims=True)
        A /= np.linalg.norm(A, axis=1, keepdims=True) + 1e-9
        out[layer] = A
    return out


def mexa(S):
    d = np.diag(S).copy()
    np.fill_diagonal(S, -np.inf)
    return float(np.mean((d > S.max(axis=1)) & (d > S.max(axis=0))))


for model_dir, model_name, suffix in MODELS:
    embd_dir = os.path.join(model_dir, "FLORES_table1_100_experiment", "embeddings")
    langs = sorted(f[:-4] for f in os.listdir(embd_dir) if f.endswith(".pkl"))
    print(f"== {suffix}: {len(langs)} languages ==", flush=True)

    pivot_embd = {p: load_centered_normed(os.path.join(embd_dir, f"{p}.pkl")) for p, _ in PIVOTS}

    score_dirs = {}
    for p, infix in PIVOTS:
        d = os.path.join(model_dir, "FLORES_table1_100_centered_scores", p)
        os.makedirs(d, exist_ok=True)
        score_dirs[p] = d

    for lang in langs:
        L = load_centered_normed(os.path.join(embd_dir, f"{lang}.pkl"))
        for p, _ in PIVOTS:
            alignments = {str(k): mexa(pivot_embd[p][k] @ L[k].T) for k in L.keys()}
            with open(os.path.join(score_dirs[p], f"{lang}.json"), "w") as f:
                json.dump(alignments, f)
        print(f"  {lang} done", flush=True)

    for p, infix in PIVOTS:
        out_csv = f"dashboard/public/data/flores_table1_100_{suffix}_{infix}centered_results.csv"
        subprocess.run([
            "python3", "shared/format_results.py",
            "--model_name", model_name,
            "--scores_dir", score_dirs[p],
            "--output_csv", out_csv,
        ], check=True)
        print(f"  saved {out_csv}", flush=True)

print("ALL CENTERED SCORES DONE")
