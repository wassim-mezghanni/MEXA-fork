#!/bin/bash
#SBATCH --job-name=mexa-mistral-bible-table1
#SBATCH --output=mistral_bible_table1_output.log
#SBATCH --error=mistral_bible_table1_error.log
#SBATCH -w gpu-nvidia-h100
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=04:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Mistral 7B v0.3 on Bible (Table 1 subset)
#
# Configuration (matching paper Table 1):
#   Model:     mistralai/Mistral-7B-v0.3
#   Dataset:   Bible (sPBC) — 101 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 101 (as used in Table 1)
# ──────────────────────────────────────────────────────────────

# Replace with your Hugging Face token
HF_TOKEN="${HF_TOKEN:-}"

# Variables
MODEL_NAME="mistralai/Mistral-7B-v0.3"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/bible_table1_101.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_table1_mistral_7b_v03_results.csv"

# ---------------------------------------------------------
# Change to experiment directory using SLURM_SUBMIT_DIR
# ---------------------------------------------------------
cd "$SLURM_SUBMIT_DIR/mistral 0.3 7B/bible_table1_experiment"

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
pip install torch transformers scipy pandas tqdm datasets sentencepiece accelerate scikit-learn protobuf -q

# ---------------------------------------------------------
# Download Bible Dataset (if not present)
# ---------------------------------------------------------
if [ ! -d "$DATA_DIR" ]; then
    echo "Bible dataset not found. Downloading..."
    python3 ../../download_bible.py --output_dir "$DATA_DIR" --token "$HF_TOKEN"
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "============================================"
echo "  MEXA Table 1 — Mistral 7B v0.3 on Bible"
echo "  Languages: 101 (Belebele overlap)"
echo "  Model:     $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 103 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".txt" \
    --lang_list "$LANG_LIST" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 103 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 ../../shared/format_results.py --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "Job Finished Successfully!"
