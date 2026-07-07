#!/bin/bash
#SBATCH --job-name=mexa-gemma4-12b-bible-table1
#SBATCH --output=gemma4_12b_bible_table1_output.log
#SBATCH --error=gemma4_12b_bible_table1_error.log
#SBATCH --partition=lrz-hgx-h100-94x4
#SBATCH --qos=gpu
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=120G
#SBATCH --time=06:00:00

# ──────────────────────────────────────────────────────────────
# MEXA — Gemma 4 12B (12B dense) — Bible Table 1 (101 langs, 103 verses)
# Target cluster: LRZ AI Systems (login.ai.lrz.de)
#
#   Model:     google/gemma-4-12B
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 103
#
# Gated repo: token read from ~/.hf_token.
# Model cache is DELETED after a successful run to conserve quota.
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-$(cat ~/.hf_token 2>/dev/null)}"

MODEL_NAME="google/gemma-4-12B"

cd "$SLURM_SUBMIT_DIR"
REPO_ROOT="$(cd ../../../.. && pwd)"

DATA_DIR="$REPO_ROOT/data/bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="$REPO_ROOT/shared/bible_table1_101.json"
CSV_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/bible_table1_gemma4_12b_results.csv"
PROJ_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/projections_bible_table1_gemma4_12b.json"

export HF_HOME="${HF_HOME:-$SLURM_SUBMIT_DIR/cache}"

source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

if [ -z "$HF_TOKEN" ]; then echo "ERROR: HF_TOKEN not set (Gemma repos are gated)."; exit 1; fi
if [ ! -d "$DATA_DIR" ]; then echo "ERROR: Data directory $DATA_DIR not found."; exit 1; fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "Ensuring required pip packages are installed..."
pip install --upgrade pip -q
pip install torch "git+https://github.com/huggingface/transformers.git" scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.device_count()}x {torch.cuda.get_device_name(0)}')"

echo "============================================"
echo "  MEXA Bible Table 1 (101 langs, 103 verses) — Gemma 4 12B (12B dense)"
echo "  Model:   $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 "$REPO_ROOT/embed_extractor.py" \
    --model_name "$MODEL_NAME" \
    --model_type causal \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 103 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".txt" \
    --lang_list "$LANG_LIST" \
    --cache_dir "$HF_HOME" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 "$REPO_ROOT/compute_mexa.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 103 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 "$REPO_ROOT/shared/format_results.py" --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 "$REPO_ROOT/compute_projections.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "$PROJ_OUTPUT_PATH" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "5. Cleaning up embeddings and model cache to conserve disk quota..."
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SLURM_SUBMIT_DIR/cache"

echo "Job Finished Successfully!"
