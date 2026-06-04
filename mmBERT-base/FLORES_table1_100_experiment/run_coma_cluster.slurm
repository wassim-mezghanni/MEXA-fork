#!/bin/bash
#SBATCH --job-name=mexa-mmbert-base-flores-table1-100
#SBATCH --output=mmbert_base_flores_table1_100_output.log
#SBATCH --error=mmbert_base_flores_table1_100_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — mmBERT-base on FLORES Table 1 (116 langs, 100 sents)
#
#   Model:     jhu-clsp/mmBERT-base
#   Arch:      bidirectional encoder (masked-LM)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 100
#
# Loaded via --model_type encoder (AutoModel).
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="jhu-clsp/mmBERT-base"
DATA_DIR="../../flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/flores_table1_100_mmbert_base_results.csv"

cd "$SLURM_SUBMIT_DIR"

module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA FLORES Table 1 (116 langs, 100 sents) — mmBERT-base"
echo "  Model:   $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --model_type encoder \
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
    --output_json "../../dashboard/public/data/projections_flores_table1_100_mmbert_base.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
