#!/bin/bash
#SBATCH --job-name=mexa-xlmr-large-bible-table1
#SBATCH --output=xlmr_large_bible_table1_output.log
#SBATCH --error=xlmr_large_bible_table1_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — XLM-RoBERTa large on Bible (Table 1 subset)
#
# Configuration (matching paper Table 1):
#   Model:     FacebookAI/xlm-roberta-large  (encoder / masked-LM)
#   Dataset:   Bible (sPBC) — 101 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 103 (all available, as per paper)
#
# Note: XLM-RoBERTa is a bidirectional encoder, NOT a causal LM.
#       The pipeline is invoked with --model_type encoder so that
#       embed_extractor.py loads it via AutoModel. Max len = 512.
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="FacebookAI/xlm-roberta-large"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/bible_table1_101.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_table1_xlmr_large_results.csv"

cd "$SLURM_SUBMIT_DIR"

# Initialize conda and activate the Python 3.11 environment
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# Download Bible dataset if not present
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

# Clean stale embeddings/scores from failed runs
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA Table 1 (Bible) — XLM-RoBERTa large"
echo "  Languages: 101 (Belebele overlap)"
echo "  Model:     $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --model_type encoder \
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
    --output_json "../../dashboard/public/data/projections_bible_table1_xlmr_large.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "Job Finished Successfully!"
