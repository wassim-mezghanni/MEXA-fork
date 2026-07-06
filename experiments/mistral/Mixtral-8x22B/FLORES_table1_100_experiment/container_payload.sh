#!/bin/bash
# Runs INSIDE the pyxis container (rootfs on node-local /raid).
set -e

cd "$SLURM_SUBMIT_DIR"
REPO_ROOT="$(cd ../../../.. && pwd)"

HF_TOKEN="${HF_TOKEN:-$(cat "$HOME/.hf_token" 2>/dev/null)}"
MODEL_NAME="mistralai/Mixtral-8x22B-v0.1"

DATA_DIR="$REPO_ROOT/data/flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="$REPO_ROOT/shared/flores_table1_116.json"
CSV_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/flores_table1_100_mixtral_8x22b_lrzverify_results.csv"
PROJ_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/projections_flores_table1_100_mixtral_8x22b_lrzverify.json"

# Container rootfs is backed by node-local /raid (1.7TB) — hold the
# ~282GB checkpoint there; it vanishes with the container at job end.
MODEL_CACHE="/model_cache"
mkdir -p "$MODEL_CACHE"

echo "=== container storage:"
df -h / "$MODEL_CACHE"

if [ -z "$HF_TOKEN" ]; then echo "ERROR: HF_TOKEN not set."; exit 1; fi
if [ ! -d "$DATA_DIR" ]; then echo "ERROR: Data directory $DATA_DIR not found."; exit 1; fi

mkdir -p "$SAVE_EMBD_DIR" "$SAVE_SCORE_DIR"

echo "Installing pipeline packages (torch ships with the NGC image)..."
pip install -q "git+https://github.com/huggingface/transformers.git" scipy pandas tqdm datasets sentencepiece accelerate scikit-learn

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; n=torch.cuda.device_count(); assert n>=4, f'expected 4 GPUs, got {n}'; print(f'CUDA OK: {n}x {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA FLORES Table 1 VERIFY — Mixtral 8x22B (SMoE, 4x H100)"
echo "  Model:   $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 "$REPO_ROOT/embed_extractor.py" \
    --model_name "$MODEL_NAME" \
    --model_type causal \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
    --cache_dir "$MODEL_CACHE" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 "$REPO_ROOT/compute_mexa.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results (verification CSV — original left untouched)..."
python3 "$REPO_ROOT/shared/format_results.py" --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 "$REPO_ROOT/compute_projections.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "$PROJ_OUTPUT_PATH" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "5. Cleaning up embeddings to conserve disk quota..."
rm -rf "$SAVE_EMBD_DIR"/*.pkl

echo "Job Finished Successfully!"
