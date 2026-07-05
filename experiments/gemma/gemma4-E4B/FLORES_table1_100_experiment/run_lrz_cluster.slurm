#!/bin/bash
#SBATCH --job-name=mexa-gemma4-e4b-flores-table1-100
#SBATCH --output=flores_table1_100_gemma4_e4b_output.log
#SBATCH --error=flores_table1_100_gemma4_e4b_error.log
#SBATCH --partition=lrz-hgx-h100-94x4
#SBATCH --qos=gpu
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=120G
#SBATCH --time=04:00:00

# ──────────────────────────────────────────────────────────────
# MEXA — Gemma 4 E4B (~4B effective) on FLORES Table 1 (116 langs, 100 sents)
# Target cluster: LRZ AI Systems · Gemma 4 family scaling comparison
#
#   Model:     google/gemma-4-E4B
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 100
#
# Gated repo: token read from ~/.hf_token.
# Model cache is DELETED after a successful run to conserve quota.
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-$(cat ~/.hf_token 2>/dev/null)}"

MODEL_NAME="google/gemma-4-E4B"

cd "$SLURM_SUBMIT_DIR"
REPO_ROOT="$(cd ../../../.. && pwd)"

DATA_DIR="$REPO_ROOT/data/flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="$REPO_ROOT/shared/flores_table1_116.json"
CSV_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/flores_table1_100_gemma4_e4b_results.csv"
PROJ_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/projections_flores_table1_100_gemma4_e4b.json"

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
echo "  MEXA FLORES Table 1 (116 langs, 100 sents) — Gemma 4 E4B (~4B effective)"
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
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 "$REPO_ROOT/compute_mexa.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
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
    --num_sents 100 \
    --file_ext .pkl

echo "5. Cleaning up embeddings and model cache to conserve disk quota..."
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SLURM_SUBMIT_DIR/cache"

echo "Job Finished Successfully!"
