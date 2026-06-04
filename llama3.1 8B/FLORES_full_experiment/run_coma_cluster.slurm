#!/bin/bash
#SBATCH --job-name=mexa-llama31-flores-table1
#SBATCH --output=llama31_table1_output.log
#SBATCH --error=llama31_table1_error.log
#SBATCH -w gpu-nvidia-h100
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# Reproduce Table 1 from the MEXA paper (ACL 2025 Findings)
# Target: FLORES µ_Max = 0.6538 for Llama 3.1 8B
#
# Configuration (matching paper exactly):
#   Model:     meta-llama/Llama-3.1-8B
#   Dataset:   FLORES-200 devtest (Full sentences)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   max across layers
#   Pivot:     eng_Latn
# ──────────────────────────────────────────────────────────────

# Replace with your Hugging Face token
HF_TOKEN="${HF_TOKEN:-}"

# Variables — model name matches the paper's README exactly
MODEL_NAME="meta-llama/Llama-3.1-8B"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/full_flores_llama3.1_8b_results.csv"

# ---------------------------------------------------------
# Change to experiment directory using SLURM_SUBMIT_DIR
# ---------------------------------------------------------
cd "$SLURM_SUBMIT_DIR/llama3.1 8B/FLORES_full_experiment"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    echo "Please download the FLORES-200 dataset and extract it to MEXA-fork/flores200_dataset/devtest"
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

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
pip install torch transformers scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

echo "============================================"
echo "  MEXA Table 1 Reproduction — Llama 3.1 8B"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (Full sentences)"
echo "  Target:  mu_Max = 0.6538"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 2000 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
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
    --output_json "../../dashboard/public/data/projections-llama3.1-8b-table1.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
