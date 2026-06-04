#!/bin/bash
#SBATCH --job-name=mexa-qwen3.5-9b-flores-table1-2000
#SBATCH --output=qwen3.5_9b_flores_table1_2000_output.log
#SBATCH --error=qwen3.5_9b_flores_table1_2000_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=24:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# Reproduce Table 1 (Subset) from the MEXA paper
# Target: FLORES (116 langs) for Qwen3.5 9B Base
#
# Configuration:
#   Model:     Qwen/Qwen3.5-9B-Base
#   Dataset:   FLORES-200 (116 Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   Max + Mean pooling across layers
#   Sentences: 2000 (full devtest)
# ──────────────────────────────────────────────────────────────

# Replace with your Hugging Face token
HF_TOKEN="${HF_TOKEN:-}"

# Variables
MODEL_NAME="Qwen/Qwen3.5-9B-Base"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_2000_qwen3.5_9b_results.csv"

# ---------------------------------------------------------
# Change to experiment directory using SLURM_SUBMIT_DIR
# ---------------------------------------------------------
cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# ---------------------------------------------------------
# Environment Setup (Conda + CUDA)
# ---------------------------------------------------------
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# All dependencies (including torch+CUDA, transformers, scipy, pandas, datasets, etc.)
# are pre-installed in the conda environment 'mexa_conda'. No need to run pip install.

# Verify CUDA
python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

# Clean stale CPU embeddings from failed runs
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json





echo "============================================"
echo "  MEXA Table 1 Reproduction (116 langs) — Qwen3.5 9B Base"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (116 langs, 2000 sents)"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 2000 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
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
    --output_json "../../dashboard/public/data/projections_flores_table1_2000_qwen3.5_9b.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
