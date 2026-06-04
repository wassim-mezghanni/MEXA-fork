#!/bin/bash
#SBATCH --job-name=mexa-qwen3-emb-0.6b-bible-table1
#SBATCH --output=qwen3_emb_0.6b_bible_table1_output.log
#SBATCH --error=qwen3_emb_0.6b_bible_table1_error.log
#SBATCH --gres=gpu:nvidia:1
#SBATCH --time=06:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3-Embedding-0.6B on Bible Table 1 (101 langs, sPBC)
#
#   Model:     Qwen/Qwen3-Embedding-0.6B
#   Arch:      Qwen3 decoder backbone (embedding model)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 103
#
# Loaded via --model_type causal (AutoModelForCausalLM).
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3-Embedding-0.6B"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="../../shared/bible_table1_101.json"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_table1_qwen3_emb_0.6b_results.csv"

cd "$SLURM_SUBMIT_DIR"

module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

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
echo "  MEXA Bible Table 1 (101 langs, sPBC) — Qwen3-Embedding-0.6B"
echo "  Model:   $MODEL_NAME"
echo "============================================"

echo "1. Extracting Embeddings..."
python3 ../../embed_extractor.py \
    --model_name "$MODEL_NAME" \
    --model_type causal \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 103 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".txt" \
    --lang_list "$LANG_LIST" \
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
    --output_json "../../dashboard/public/data/projections_bible_table1_qwen3_emb_0.6b.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "Job Finished Successfully!"
