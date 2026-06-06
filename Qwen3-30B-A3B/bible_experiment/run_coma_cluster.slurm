#!/bin/bash
#SBATCH --job-name=mexa-qwen3-30b-a3b-bible-full
#SBATCH --output=qwen3_30b_a3b_bible_full_output.log
#SBATCH --error=qwen3_30b_a3b_bible_full_error.log
#SBATCH --gres=gpu:nvidia:2
#SBATCH --time=24:00:00
#SBATCH --partition=compute

# ──────────────────────────────────────────────────────────────
# MEXA — Qwen3-30B-A3B (Qwen3 Sparse MoE) on Bible Full (all langs, sPBC)
#
#   Model:     Qwen/Qwen3-30B-A3B-Base
#   Arch:      Sparse Mixture-of-Experts decoder (~30.5B total, ~3.3B active/token, 128 experts top-8)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 103
#
# ~30B params (~61GB bf16) → 2 GPUs; device_map='auto' shards it.
# Loaded via --model_type causal (AutoModelForCausalLM / Qwen3MoeForCausalLM).
# ──────────────────────────────────────────────────────────────

HF_TOKEN="${HF_TOKEN:-}"

MODEL_NAME="Qwen/Qwen3-30B-A3B-Base"
DATA_DIR="../../bible_dataset/103"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
CSV_OUTPUT_PATH="../../dashboard/public/data/bible_qwen3_30b_a3b_results.csv"

cd "$SLURM_SUBMIT_DIR"

module load cuda/12.6.3
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

set -e

if [ ! -d "$DATA_DIR" ]; then
    echo "Bible dataset not found. Downloading..."
    python3 ../../download_bible.py --output_dir "$DATA_DIR" --token "$HF_TOKEN"
    if [ $? -ne 0 ]; then echo "ERROR: Failed to download Bible dataset."; exit 1; fi
fi
if [ ! -f "$DATA_DIR/eng_Latn.txt" ]; then
    echo "ERROR: Pivot file $DATA_DIR/eng_Latn.txt not found."; exit 1
fi

mkdir -p $SAVE_EMBD_DIR
mkdir -p $SAVE_SCORE_DIR

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; print(f'CUDA OK: {torch.cuda.device_count()}x {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "============================================"
echo "  MEXA Bible Full (all langs, sPBC) — Qwen3-30B-A3B (MoE)"
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
    --output_json "../../dashboard/public/data/projections_bible_qwen3_30b_a3b.json" \
    --embedding_type embd_weighted \
    --num_sents 103 \
    --file_ext .pkl

echo "5. Cleaning up embeddings to conserve disk quota..."
rm -rf "$SAVE_EMBD_DIR"/*.pkl

echo "Job Finished Successfully!"
