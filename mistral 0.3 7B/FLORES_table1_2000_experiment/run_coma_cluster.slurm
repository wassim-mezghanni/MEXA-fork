#!/bin/bash
#SBATCH --job-name=mexa-mistral-flores-table1-repro
#SBATCH --output=mistral_flores_table1_output.log
#SBATCH --error=mistral_flores_table1_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=24:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# Reproduce Table 1 (Subset) from the MEXA paper
# Target: FLORES (116 langs) for Mistral 7B v0.3
#
# Configuration:
#   Model:     mistralai/Mistral-7B-v0.3
#   Dataset:   FLORES-200 (116 Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   Max + Mean pooling across layers
#   Sentences: 2000 (full devtest)
# ──────────────────────────────────────────────────────────────

# Replace with your Hugging Face token
HF_TOKEN="${HF_TOKEN:-}"

# Variables
MODEL_NAME="mistralai/Mistral-7B-v0.3"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_mistral_7b_v03_results.csv"

# ---------------------------------------------------------
# Change to experiment directory using SLURM_SUBMIT_DIR
# ---------------------------------------------------------
cd "$SLURM_SUBMIT_DIR/mistral 0.3 7B/FLORES_table1_2000_experiment"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# ---------------------------------------------------------
# Environment Setup
# ---------------------------------------------------------
VENV_DIR="$HOME/mexa_env"
source "$VENV_DIR/bin/activate"

echo "============================================"
echo "  MEXA Table 1 Reproduction (116 langs) — Mistral 7B v0.3"
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
    --output_json "../../dashboard/public/data/projections_flores_table1_mistral_7b_v03.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
