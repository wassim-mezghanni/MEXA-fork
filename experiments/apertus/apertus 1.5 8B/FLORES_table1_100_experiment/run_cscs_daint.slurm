#!/bin/bash
#SBATCH --job-name=mexa-apertus1.5-8b-flores-table1
#SBATCH --output=apertus1.5_8b_flores_table1_output.log
#SBATCH --error=apertus1.5_8b_flores_table1_error.log
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --gpus-per-task=1
#SBATCH --cpus-per-task=8
#SBATCH --mem=64G
#SBATCH --time=06:00:00
#SBATCH --account=summerschool-course2026-cscs
#SBATCH --uenv=pytorch/v2.9.1:v2
#SBATCH --view=default

# ──────────────────────────────────────────────────────────────
# MEXA — Apertus 1.5 8B on CSCS Daint (FLORES Table 1 subset, 100 sents)
#   Model: swiss-ai/Apertus-v1.5-8B
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

export HF_HOME="${SCRATCH:-$HOME}/hf_cache"
export TRANSFORMERS_CACHE="${SCRATCH:-$HOME}/hf_cache"
mkdir -p "$HF_HOME"

MODEL_NAME="swiss-ai/Apertus-v1.5-8B"
DATA_DIR="../../../../data/flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../../../shared/flores_table1_116.json"
CSV_OUTPUT_PATH="../../../../dashboard/public/data/flores_table1_100_apertus1.5_8b_results.csv"

cd "${SLURM_SUBMIT_DIR:-$(pwd)}"

if [ ! -d "$DATA_DIR" ]; then
    echo "ERROR: Data directory $DATA_DIR not found."
    exit 1
fi

mkdir -p "$SAVE_EMBD_DIR"
mkdir -p "$SAVE_SCORE_DIR"

if [ -f "$HOME/.mexa_uenv/bin/activate" ]; then
    source "$HOME/.mexa_uenv/bin/activate"
fi

echo "============================================"
echo "  MEXA Table 1 (116 langs) — Apertus 1.5 8B"
echo "  Model:   $MODEL_NAME"
echo "  Dataset: FLORES-200 (116 langs, 100 sents)"
echo "  Cluster: CSCS Daint@Alps"
echo "  HF_HOME: $HF_HOME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --cache_dir "$HF_HOME" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 ../../../../compute_mexa.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 ../../../../shared/format_results.py --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 ../../../../compute_projections.py \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "../../../../dashboard/public/data/projections_flores_table1_100_apertus1.5_8b.json" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "Job Finished Successfully!"
