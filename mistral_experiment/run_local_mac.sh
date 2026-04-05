#!/bin/bash
# Local execution for Mac — Mistral 7B v0.3

HF_TOKEN="YOUR_HF_TOKEN"

MODEL_NAME="mistralai/Mistral-7B-v0.3"
DATA_DIR="../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../dashboard/public/data/mistral-7b-v03-results.csv"

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
