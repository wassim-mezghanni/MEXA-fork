#!/bin/bash
# Local execution for Mac M3
# Note: Since embed_extractor.py uses PyTorch, device_map='auto' often falls back to MPS on Mac M3.
# However, MEXA computations can be intensive depending on the number of sentences.

# Replace this with your actual Hugging Face token (needed for LLaMA 3.1 8B)
HF_TOKEN="YOUR_HF_TOKEN"

# Variables
MODEL_NAME="meta-llama/Meta-Llama-3.1-8B"
DATA_DIR="../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../dashboard/public/data/llama3-1-8b-results.csv"

# Ensure the data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    echo "Please download the FLORES-200 dataset and extract it to MEXA-fork/flores200_dataset/devtest"
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

echo "1. Extracting Embeddings..."
python ../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python ../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python format_results.py \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "Job Finished Successfully! You can now restart your dashboard to view the results."
