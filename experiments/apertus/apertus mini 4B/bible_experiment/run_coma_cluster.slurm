#!/bin/bash
#SBATCH --job-name=mexa-apertusmini4b-bible
#SBATCH --output=apertusmini4b_bible_output.log
#SBATCH --error=apertusmini4b_bible_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=08:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Apertus-mini 4B (base) on Bible (sPBC) Dataset
#
# Configuration (matching paper Section 4.1):
#   Model:     swiss-ai/Apertus-v1.1-4B
#   Dataset:   Bible (sPBC) — 103 parallel sentences, ~1401 languages
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 103 (all available, as per paper)
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="swiss-ai/Apertus-v1.1-4B"
DATA_DIR="../../../../data/bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../../../dashboard/public/data/apertus-mini-4b-bible-results.csv"

cd "$SLURM_SUBMIT_DIR"

# Initialize conda and activate the Python 3.11 environment
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# Download Bible dataset if not present
if [ ! -d "$DATA_DIR" ]; then
    echo "Bible dataset not found. Downloading..."
    python3 ../../../../../../download_bible.py --output_dir "$DATA_DIR" --token "$HF_TOKEN"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to download Bible dataset."
        echo "You may need to manually download from: https://huggingface.co/datasets/cis-lmu/sPBC"
        exit 1
    fi
fi

if [ ! -f "$DATA_DIR/eng_Latn.txt" ]; then
    echo "ERROR: Pivot file $DATA_DIR/eng_Latn.txt not found."
    exit 1
fi

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "============================================"
echo "  MEXA — Apertus-mini 4B on Bible (sPBC)"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: Bible (103 sentences)"
echo "  Pooling: max + mean"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../../../../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 103 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".txt" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../../../../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 103 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 ../../../../../../shared/format_results.py --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 ../../../../../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../../../dashboard/public/data/projections-apertus-mini-4b-bible.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "Job Finished Successfully!"
