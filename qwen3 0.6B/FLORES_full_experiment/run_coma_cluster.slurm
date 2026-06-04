#!/bin/bash
#SBATCH --job-name=mexa-qwen3-0.6b-flores-full
#SBATCH --output=qwen3_0.6b_flores_full_output.log
#SBATCH --error=qwen3_0.6b_flores_full_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3 0.6B on FLORES-200 Full Dataset
#
# Configuration:
#   Model:     Qwen/Qwen3-0.6B
#   Dataset:   FLORES-200 devtest (All 204 languages)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 2000 (full devtest)
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3-0.6B"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/full_flores_qwen3_0.6b_results.csv"

# Change to experiment directory using SLURM_SUBMIT_DIR
cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Initialize conda and activate the Python environment
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# Verify CUDA is available on this compute node
python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

# Clean stale scores, but keep embeddings to support resuming
# rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"
mkdir -p "$SAVE_SCORE_DIR"

echo "============================================"
echo "  MEXA — Qwen3 0.6B on FLORES Full"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (204 langs, 2000 sents)"
echo "  Pooling: max + mean"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 2000 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --cache_dir "/storage/home/wassim/.cache/huggingface" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 2000 \
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
    --output_json "../../dashboard/public/data/projections_full_flores_qwen3_0.6b.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
