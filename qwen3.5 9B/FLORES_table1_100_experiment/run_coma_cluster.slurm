#!/bin/bash
#SBATCH --job-name=mexa-qwen35-table1-100
#SBATCH --output=qwen35_flores_table1_output.log
#SBATCH --error=qwen35_flores_table1_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3.5 9B Base on FLORES (Table 1 subset, 100 sents)
#
# Configuration (matching paper Table 1):
#   Model:     Qwen/Qwen3.5-9B-Base
#   Dataset:   FLORES-200 — 116 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 100 (Table 1 subset)
#
# Note: Qwen3.5 requires transformers >= 4.51.0
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3.5-9B-Base"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_100_qwen3.5_9b_results.csv"

cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Initialize conda and activate the Python 3.11 environment
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

echo "Ensuring required pip packages are installed..."
pip install --upgrade pip -q
pip install "git+https://github.com/huggingface/transformers.git" torch scipy pandas tqdm datasets sentencepiece accelerate scikit-learn -q

echo "============================================"
echo "  MEXA Table 1 (116 langs) — Qwen3.5 9B Base"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (116 langs, 100 sents)"
echo "  Pooling: max + mean"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
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
    --output_json "../../dashboard/public/data/projections_flores_table1_100_qwen3.5_9b.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
