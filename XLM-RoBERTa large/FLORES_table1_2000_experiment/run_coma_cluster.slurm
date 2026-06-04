#!/bin/bash
#SBATCH --job-name=mexa-xlmr-large-flores-table1-2000
#SBATCH --output=xlmr_large_flores_table1_2000_output.log
#SBATCH --error=xlmr_large_flores_table1_2000_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=12:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — XLM-RoBERTa large on FLORES (Table 1 subset, 2000 sents)
#
# Configuration (matching paper Table 1):
#   Model:     FacebookAI/xlm-roberta-large  (encoder / masked-LM)
#   Dataset:   FLORES-200 — 116 languages (Belebele overlap)
#   Embedding: token-weighted (embd_weighted)
#   Pooling:   both max and mean across layers
#   Pivot:     eng_Latn
#   Sentences: 2000 (full devtest)
#
# Note: XLM-RoBERTa is a bidirectional encoder, NOT a causal LM.
#       The pipeline is invoked with --model_type encoder so that
#       embed_extractor.py loads it via AutoModel instead of
#       AutoModelForCausalLM. Max sequence length is 512 tokens.
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="FacebookAI/xlm-roberta-large"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_2000_xlmr_large_results.csv"

cd "$SLURM_SUBMIT_DIR"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

# Initialize conda and activate the Python 3.11 environment
module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

# All dependencies (torch+CUDA, transformers, scipy, pandas, datasets, etc.)
# are pre-installed in the conda environment 'mexa_conda'.

# Verify CUDA
python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

# Clean stale embeddings/scores from failed runs
rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA Table 1 (116 langs) — XLM-RoBERTa large"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (116 langs, 2000 sents)"
echo "  Pooling: max + mean"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --model_type encoder \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 2000 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
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
    --output_json "../../dashboard/public/data/projections_flores_table1_2000_xlmr_large.json" \
    --embedding_type embd_weighted \
    --num_sents 2000 \
    --file_ext .pkl

echo "Job Finished Successfully!"
