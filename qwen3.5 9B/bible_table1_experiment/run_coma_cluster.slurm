#!/bin/bash
#SBATCH --job-name=mexa-qwen35-bible-table1
#SBATCH --output=qwen35_bible_table1_output.log
#SBATCH --error=qwen35_bible_table1_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=04:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3.5 9B Base on Bible (Table 1 subset)
#
# Configuration (matching paper Table 1):
#   Model:     Qwen/Qwen3.5-9B-Base
#   Dataset:   Bible (sPBC) — 101 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 103 (all available, as per paper)
#
# Note: Qwen3.5 requires transformers >= 4.51.0
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3.5-9B-Base"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/bible_table1_101.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_table1_qwen3.5_9b_results.csv"

cd "$SLURM_SUBMIT_DIR"

# Initialize conda and activate the Python 3.11 environment
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

echo "Ensuring required pip packages are installed..."
pip install --upgrade pip -q
pip install "git+https://github.com/huggingface/transformers.git" torch scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

if [ ! -d "$DATA_DIR" ]; then
    echo "Bible dataset not found. Downloading..."
    python3 ../../download_bible.py --output_dir "$DATA_DIR" --token "$HF_TOKEN"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to download Bible dataset."
        exit 1
    fi
fi

if [ ! -f "$DATA_DIR/eng_Latn.txt" ]; then
    echo "ERROR: Pivot file $DATA_DIR/eng_Latn.txt not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "============================================"
echo "  MEXA Table 1 (Bible) — Qwen3.5 9B Base"
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

echo "4. Computing 2D Projections..."
python3 ../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../dashboard/public/data/projections_bible_table1_qwen3.5_9b.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "Job Finished Successfully!"
