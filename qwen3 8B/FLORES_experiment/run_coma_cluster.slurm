#!/bin/bash
#SBATCH --job-name=mexa-qwen3-8b-flores
#SBATCH --output=qwen3_flores_output.log
#SBATCH --error=qwen3_flores_error.log
#SBATCH -w gpu-nvidia-h100
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=02:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3 8B Base on FLORES-200 Dataset
#
# Configuration:
#   Model:     Qwen/Qwen3-8B-Base
#   Dataset:   FLORES-200 devtest — 100 sentences
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#
# Note: Qwen3 requires transformers >= 4.51.0
# Qwen3 is pretrained on 36T tokens across 119 languages
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3-8B-Base"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/qwen3-8b-flores-results.csv"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    echo "Please download the FLORES-200 dataset and extract it to MEXA-fork/flores200_dataset/devtest"
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

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
# Qwen3 requires transformers >= 4.51.0
pip install "transformers>=4.51.0" torch scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

echo "============================================"
echo "  MEXA — Qwen3 8B Base on FLORES-200"
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
    --output_json "../../dashboard/public/data/projections-qwen3-8b-flores.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
