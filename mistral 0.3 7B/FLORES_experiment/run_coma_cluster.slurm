#!/bin/bash
#SBATCH --job-name=mexa-mistral7b-flores
#SBATCH --output=mistral_output.log
#SBATCH --error=mistral_error.log
#SBATCH -w gpu-nvidia-h100
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=02:00:00
#SBATCH --partition=compute

# Mistral 7B v0.3 (~14GB fp16) fits on L40S (48GB) — no need for H100/H200
# Execute: sbatch run_coma_cluster.slurm
#
# Configuration:
#   Model:     mistralai/Mistral-7B-v0.3
#   Dataset:   FLORES-200 devtest — 100 sentences
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   max + mean across layers
#   Pivot:     eng_Latn

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="mistralai/Mistral-7B-v0.3"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/mistral-7b-v03-results.csv"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    echo "Please download the FLORES-200 dataset and extract it to MEXA-fork/flores200_dataset/devtest"
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Environment Setup
VENV_DIR="$HOME/mexa_env"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment in $VENV_DIR..."
    python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

echo "Ensuring required pip packages are installed..."
pip install --upgrade pip -q
pip install torch transformers scipy pandas tqdm datasets sentencepiece accelerate protobuf scikit-learn -q

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
    --output_json "../../dashboard/public/data/projections-mistral-7b-v03.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
