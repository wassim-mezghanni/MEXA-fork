#!/bin/bash
#SBATCH --job-name=mexa-glot500-bible-full
#SBATCH --output=glot500_bible_full_output.log
#SBATCH --error=glot500_bible_full_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=12:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Glot500-base on Bible Full (all langs, sPBC)
#
#   Model:     cis-lmu/glot500-base
#   Arch:      bidirectional encoder (masked-LM)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 103
#
# Loaded via --model_type encoder (AutoModel).
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="cis-lmu/glot500-base"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_glot500_results.csv"

cd "$SLURM_SUBMIT_DIR"

module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_glot

set -e

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

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA Bible Full (all langs, sPBC) — Glot500-base"
echo "  Model:   $MODEL_NAME"
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
    --output_json "../../dashboard/public/data/projections_bible_glot500.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "Job Finished Successfully!"
