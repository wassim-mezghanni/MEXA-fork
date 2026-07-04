#!/bin/bash
#SBATCH --job-name=mexa-qwen3-table1-100-ar
#SBATCH --output=qwen3_flores_table1_output.log
#SBATCH --error=qwen3_flores_table1_error.log
#SBATCH -w gpu-nvidia-h100
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3 8B Base on FLORES (Table 1 subset, 100 sents) with Arabic pivot
#
# Configuration:
#   Model:     Qwen/Qwen3-8B-Base
#   Dataset:   FLORES-200 — 116 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     arb_Arab (Arabic)
#   Sentences: 100 (Table 1 subset)
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

# Variables
MODEL_NAME="Qwen/Qwen3-8B-Base"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="../FLORES_table1_100_experiment/embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_100_qwen3_8b_arabic_pivot_results.csv"

# ---------------------------------------------------------
# Change to experiment directory using SLURM_SUBMIT_DIR
# ---------------------------------------------------------
cd "$SLURM_SUBMIT_DIR/qwen3 8B/FLORES_table1_100_arabic_pivot_experiment"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p "$SAVE_EMBD_DIR"
mkdir -p "$SAVE_SCORE_DIR"

# ---------------------------------------------------------
# Environment Setup
# ---------------------------------------------------------
VENV_DIR="$HOME/mexa_env"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment in $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

echo "Ensuring required pip packages are installed..."
pip install --upgrade pip -q
pip install "transformers>=4.51.0" torch scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

echo "============================================"
echo "  MEXA Table 1 (116 langs, Arabic pivot) — Qwen3 8B Base"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (116 langs, 100 sents)"
echo "  Pivot:   arb_Arab"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot arb_Arab \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 ../../shared/format_results.py --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 ../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../dashboard/public/data/projections_flores_table1_100_qwen3_8b_arabic_pivot.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
