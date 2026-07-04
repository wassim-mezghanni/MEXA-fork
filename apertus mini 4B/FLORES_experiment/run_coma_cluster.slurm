#!/bin/bash
#SBATCH --job-name=mexa-apertusmini4b-flores
#SBATCH --output=apertusmini4b_flores_output.log
#SBATCH --error=apertusmini4b_flores_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=04:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Apertus-mini 4B (base) on FLORES-200 (full)
#
# Configuration:
#   Model:     swiss-ai/Apertus-v1.1-4B
#   Dataset:   FLORES-200 devtest — all available languages, 100 sentences
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#
# Note: Apertus v1.1 requires transformers >= 4.56.0
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="swiss-ai/Apertus-v1.1-4B"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/apertus-mini-4b-flores-results.csv"

cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Initialize conda and activate the Python 3.11 environment
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# Verify CUDA
python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

# Clean stale embeddings/scores from failed runs
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA — Apertus-mini 4B on FLORES-200"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (100 sentences)"
echo "  Pooling: max + mean"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 ../../shared/format_results.py --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 ../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../dashboard/public/data/projections-apertus-mini-4b-flores.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
