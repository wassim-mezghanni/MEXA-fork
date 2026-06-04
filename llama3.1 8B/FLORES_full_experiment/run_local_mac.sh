#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Local execution (Mac M3) — Table 1 Reproduction
# Target: FLORES mu_Max = 0.6538 for Llama 3.1 8B
#
# NOTE: Running on MPS (Mac) may produce slightly different
# floating-point results compared to CUDA (H100).
# For exact reproduction, run on the COMA cluster instead.
# ──────────────────────────────────────────────────────────────

# Replace with your Hugging Face token
HF_TOKEN="${HF_TOKEN:-}"

# Variables — model name matches the paper's README exactly
MODEL_NAME="meta-llama/Llama-3.1-8B"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/llama3-1-8b-table1-results.csv"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    echo "Please download the FLORES-200 dataset and extract it to MEXA-fork/flores200_dataset/devtest"
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "============================================"
echo "  MEXA Table 1 Reproduction — Llama 3.1 8B"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (Full sentences)"
echo "  Target:  mu_Max = 0.6538"
echo "============================================"

echo "1. Extracting Embeddings..."
python ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 2000 \
    --save_path "$SAVE_EMBD_DIR" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python ../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 2000 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python format_results.py \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python ../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../dashboard/public/data/projections-llama3.1-8b-table1.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully! You can now restart your dashboard to view the results."
