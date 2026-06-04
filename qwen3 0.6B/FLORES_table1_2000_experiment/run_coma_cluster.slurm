#!/bin/bash
#SBATCH --job-name=mexa-qwen3-0.6b-flores-table1-2000
#SBATCH --output=qwen3_0.6b_flores_table1_2000_output.log
#SBATCH --error=qwen3_0.6b_flores_table1_2000_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# Reproduce Table 1 (Subset) from the MEXA paper
# Target: FLORES (116 langs) for Qwen3 0.6B
#
# Configuration:
#   Model:     Qwen/Qwen3-0.6B
#   Dataset:   FLORES-200 (116 Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   Max + Mean pooling across layers
#   Sentences: 2000 (full devtest)
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

# Variables
MODEL_NAME="Qwen/Qwen3-0.6B"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_2000_qwen3_0.6b_results.csv"

# Change to experiment directory using SLURM_SUBMIT_DIR
cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Environment Setup (Conda + CUDA)
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# Verify CUDA is available on this compute node
python3 -c "import torch; print(f'torch {torch.__version__}, CUDA built: {torch.version.cuda}, available: {torch.cuda.is_available()}'); assert torch.cuda.is_available(), 'CUDA not available!'; print(f'GPU: {torch.cuda.get_device_name(0)}')"

# Clean stale scores, but keep embeddings to support resuming
# rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA Table 1 Reproduction (116 langs) — Qwen3 0.6B"
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
    --output_json "../../dashboard/public/data/projections_flores_table1_2000_qwen3_0.6b.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
