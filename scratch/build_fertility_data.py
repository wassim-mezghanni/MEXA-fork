"""Compute tokenizer fertility (tokens per sentence) for each language and join it
with the cross-model MEXA alignment scores, so the dashboard can plot the
fertility -> alignment relationship (the mechanism behind the script gap).

Runs over both parallel corpora:
  - FLORES-200 (flores200_dataset/devtest/*.devtest) -> fertility_flores.csv
  - Bible / sPBC (bible_dataset/103/*.txt)            -> fertility_bible.csv

Fertility is averaged across several tokenizers (decoder + encoder families). Any
tokenizer that fails to load (e.g. a gated repo with no token) is skipped and noted,
so the script runs anywhere with whatever it can fetch.

Columns: code, script, fertility (mean tokens/sentence across tokenizers),
         alignment (cross-model avg MEXA max-pool), num_tokenizers
"""
import os
import csv

import numpy as np

ROOT = "/Users/wassim/MEXA-fork"
DATA_DIR = os.path.join(ROOT, "dashboard/public/data")
N_SENTS = 100  # fertility is stable; ~100 parallel sentences is plenty and fast

# Public tokenizers cover the run without auth; gated ones are attempted and skipped
# gracefully if the HF token is missing or lacks access. "kind" lets us report a
# decoder-only fertility (the pivot story is about decoders) alongside the blended one.
TOKENIZERS = [
    ("Qwen/Qwen3-0.6B", "decoder"),               # decoder family (shared across Qwen3 sizes)
    ("FacebookAI/xlm-roberta-base", "encoder"),   # encoder
    ("cis-lmu/glot500-base", "encoder"),          # broad-coverage multilingual encoder
    ("intfloat/multilingual-e5-base", "encoder"), # sentence encoder
    ("meta-llama/Llama-3.1-8B", "decoder"),       # decoder (gated — skipped if no access)
]

# (label, corpus directory, per-language file extension, alignment csv, output csv)
CORPORA = [
    ("FLORES", os.path.join(ROOT, "flores200_dataset/devtest"), ".devtest",
     "lowresource_flores_avg.csv", "fertility_flores.csv"),
    ("Bible", os.path.join(ROOT, "bible_dataset/103"), ".txt",
     "lowresource_bible_avg.csv", "fertility_bible.csv"),
]


def load_token():
    env = os.path.join(ROOT, ".env")
    if not os.path.exists(env):
        return None
    for line in open(env):
        if "HF" in line.upper() and "=" in line:
            return line.split("=", 1)[1].strip()
    return None


def load_alignment(name):
    align = {}
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        return align
    with open(path) as f:
        for row in csv.DictReader(f):
            try:
                align[row["code"]] = float(row["avg"])
            except (KeyError, ValueError):
                pass
    return align


def read_sentences(corpus_dir, code, ext, n):
    path = os.path.join(corpus_dir, f"{code}{ext}")
    if not os.path.exists(path):
        return []
    out = []
    with open(path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= n:
                break
            line = line.strip()
            if line:
                out.append(line)
    return out


def build_corpus(label, corpus_dir, ext, align_csv, out_csv, tokenizers):
    align = load_alignment(align_csv)
    if not align:
        print(f"[skip] {label}: no alignment file {align_csv}")
        return
    if not os.path.isdir(corpus_dir):
        print(f"[skip] {label}: corpus dir not found {corpus_dir}")
        return

    codes = sorted(c for c in align if c != "eng_Latn")
    n_dec = sum(1 for _, _, kind in tokenizers if kind == "decoder")
    rows = []
    for code in codes:
        sents = read_sentences(corpus_dir, code, ext, N_SENTS)
        if not sents:
            continue
        chars_per_sent = np.mean([len(s) for s in sents])
        all_tok, dec_tok = [], []
        for _, tok, kind in tokenizers:
            enc = tok(sents, add_special_tokens=False)["input_ids"]
            tps = np.mean([len(ids) for ids in enc])
            all_tok.append(tps)
            if kind == "decoder":
                dec_tok.append(tps)
        fert_all = float(np.mean(all_tok))
        rows.append({
            "code": code,
            "script": code.split("_")[1] if "_" in code else "",
            "fertility": round(fert_all, 3),                                   # blended, all tokenizers
            "fertility_decoder": round(float(np.mean(dec_tok)), 3) if dec_tok else "",
            "tokens_per_char": round(fert_all / chars_per_sent, 4) if chars_per_sent else "",
            "alignment": round(align[code], 4),
            "num_tokenizers": len(tokenizers),
        })

    out_path = os.path.join(DATA_DIR, out_csv)
    fields = ["code", "script", "fertility", "fertility_decoder", "tokens_per_char",
              "alignment", "num_tokenizers"]
    with open(out_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"[ok] {label}: wrote {len(rows)} languages to {out_csv} "
          f"(fertility over {len(tokenizers)} tokenizers, {n_dec} decoder)")


def main():
    from transformers import AutoTokenizer

    token = load_token()
    tokenizers = []
    for name, kind in TOKENIZERS:
        try:
            tok = AutoTokenizer.from_pretrained(name, token=token, trust_remote_code=True)
            tokenizers.append((name, tok, kind))
            print(f"[ok] loaded {name} ({kind})")
        except Exception as e:
            print(f"[skip] {name}: {str(e)[:80]}")
    if not tokenizers:
        print("No tokenizers loaded — aborting.")
        return

    for label, corpus_dir, ext, align_csv, out_csv in CORPORA:
        build_corpus(label, corpus_dir, ext, align_csv, out_csv, tokenizers)


if __name__ == "__main__":
    main()
