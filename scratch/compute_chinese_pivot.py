"""Compute Chinese-pivot MEXA scores (standard AND centered) for all models.

Chinese (zho_Hans) is high-resource but non-Latin script — it fills the missing
cell in the compression-ladder analysis (resource level vs script), and tests
whether Chinese behaves as an internal hub for the Qwen models.

Run on the cluster from the repo root:
    python3 scratch/compute_chinese_pivot.py
"""
import pickle
import numpy as np
import os
import json
import subprocess

PIVOT = "zho_Hans"
NUM_SENTS = 100

MODELS = [
    ("experiments/llama/llama3.1 8B", "meta-llama/Llama-3.1-8B", "llama3.1_8b"),
    ("experiments/mistral/mistral 0.3 7B", "mistralai/Mistral-7B-v0.3", "mistral_7b_v03"),
    ("experiments/qwen/qwen3 4B", "Qwen/Qwen3-4B", "qwen3_4b"),
    ("experiments/qwen/qwen3 8B", "Qwen/Qwen3-8B-Base", "qwen3_8b"),
    ("experiments/qwen/qwen3.5 9B", "Qwen/Qwen3.5-9B-Base", "qwen3.5_9b"),
]


def load_variants(path):
    """Return {False: standard, True: centered} unit-normalized arrays per layer."""
    with open(path, "rb") as f:
        raw = pickle.load(f)
    std, cen = {}, {}
    for layer, sents in raw.items():
        A = np.stack([x["embd_weighted"] for x in sents[:NUM_SENTS]]).astype(np.float64)
        C = A - A.mean(axis=0, keepdims=True)
        std[layer] = A / (np.linalg.norm(A, axis=1, keepdims=True) + 1e-9)
        cen[layer] = C / (np.linalg.norm(C, axis=1, keepdims=True) + 1e-9)
    return {False: std, True: cen}


def mexa(S):
    d = np.diag(S).copy()
    np.fill_diagonal(S, -np.inf)
    return float(np.mean((d > S.max(axis=1)) & (d > S.max(axis=0))))


for model_dir, model_name, suffix in MODELS:
    embd_dir = os.path.join(model_dir, "FLORES_table1_100_experiment", "embeddings")
    langs = sorted(f[:-4] for f in os.listdir(embd_dir) if f.endswith(".pkl"))
    print(f"== {suffix}: {len(langs)} languages ==", flush=True)

    pivot = load_variants(os.path.join(embd_dir, f"{PIVOT}.pkl"))

    dirs = {}
    for centered in (False, True):
        d = os.path.join(model_dir, "FLORES_table1_100_chinese_pivot_scores", "centered" if centered else "standard")
        os.makedirs(d, exist_ok=True)
        dirs[centered] = d

    for lang in langs:
        L = load_variants(os.path.join(embd_dir, f"{lang}.pkl"))
        for centered in (False, True):
            alignments = {str(k): mexa(pivot[centered][k] @ L[centered][k].T) for k in L[centered].keys()}
            with open(os.path.join(dirs[centered], f"{lang}.json"), "w") as f:
                json.dump(alignments, f)
        print(f"  {lang} done", flush=True)

    for centered in (False, True):
        seg = "centered_" if centered else ""
        out_csv = f"dashboard/public/data/flores_table1_100_{suffix}_chinese_pivot_{seg}results.csv"
        subprocess.run([
            "python3", "shared/format_results.py",
            "--model_name", model_name,
            "--scores_dir", dirs[centered],
            "--output_csv", out_csv,
        ], check=True)
        print(f"  saved {out_csv}", flush=True)

print("BASQUE PIVOT DONE")
