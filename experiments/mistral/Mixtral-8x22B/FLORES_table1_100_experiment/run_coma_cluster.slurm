#!/bin/bash
#SBATCH --job-name=mexa-mixtral-8x22b-flores-table1-100
#SBATCH --output=mixtral_8x22b_flores_table1_100_output.log
#SBATCH --error=mixtral_8x22b_flores_table1_100_error.log
#SBATCH --partition=compute
#SBATCH --gres=gpu:nvidia:4
#SBATCH --cpus-per-task=16
#SBATCH --mem=300G
#SBATCH --time=12:00:00

# ──────────────────────────────────────────────────────────────
# MEXA — Mixtral 8x22B (Sparse MoE) on FLORES Table 1 (116 langs, 100 sents)
# COMA Cluster (4x NVIDIA H200 144GB = 576GB VRAM, bfloat16 full precision)
# ──────────────────────────────────────────────────────────────

cd "$SLURM_SUBMIT_DIR"
REPO_ROOT="$(cd ../../../.. && pwd)"

# Activate conda
source "$HOME/miniforge3/etc/profile.d/conda.sh"
conda activate mexa_conda

export HF_TOKEN="${HF_TOKEN:-$(cat ~/.hf_token 2>/dev/null)}"
export HUGGING_FACE_HUB_TOKEN="$HF_TOKEN"
export HF_HUB_ENABLE_HF_TRANSFER=0

mkdir -p /scratch/wassim/tmp
export TMPDIR="/scratch/wassim/tmp"

MODEL_NAME="mistralai/Mixtral-8x22B-v0.1"
DATA_DIR="$REPO_ROOT/data/flores200_dataset/devtest"
SAVE_EMBD_DIR="./embeddings"
SAVE_SCORE_DIR="./scores"
LANG_LIST="$REPO_ROOT/shared/flores_table1_116.json"
CSV_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/flores_table1_100_mixtral_8x22b_results.csv"
PROJ_OUTPUT_PATH="$REPO_ROOT/dashboard/public/data/projections_flores_table1_100_mixtral_8x22b.json"

# Cache models on fast 13TB /storage/nobackup
MODEL_CACHE="/storage/nobackup/wassim/hf_cache"
export HF_HOME="$MODEL_CACHE"
mkdir -p "$MODEL_CACHE" "$SAVE_EMBD_DIR" "$SAVE_SCORE_DIR"

echo "============================================"
echo "  MEXA FLORES Table 1 (116 langs, 100 sents) — Mixtral 8x22B (SMoE)"
echo "  Model:   $MODEL_NAME"
echo "  Nodes:   $SLURMD_NODENAME"
echo "  GPUs:    4x NVIDIA H200 (576GB VRAM total)"
echo "============================================"

python3 -c "import torch; assert torch.cuda.is_available(), 'CUDA not available!'; n=torch.cuda.device_count(); print(f'CUDA OK: {n}x {torch.cuda.get_device_name(0)}')"

rm -rf "$SAVE_EMBD_DIR"/*.pkl
rm -rf "$SAVE_SCORE_DIR"/*.json

echo "1. Extracting Embeddings across 4x H200s (bfloat16)..."
python3 "$REPO_ROOT/embed_extractor.py" \
    --model_name "$MODEL_NAME" \
    --model_type causal \
    --data_path "$DATA_DIR" \
    --gpus '0' \
    --num_sents 100 \
    --save_path "$SAVE_EMBD_DIR" \
    --file_ext ".devtest" \
    --lang_list "$LANG_LIST" \
    --cache_dir "$MODEL_CACHE" \
    --token "$HF_TOKEN"

echo "2. Computing MEXA alignments..."
python3 "$REPO_ROOT/compute_mexa.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --save_path "$SAVE_SCORE_DIR" \
    --num_sents 100 \
    --embedding_type embd_weighted \
    --pivot eng_Latn \
    --file_ext .pkl

echo "3. Formatting Results for the Dashboard..."
python3 "$REPO_ROOT/shared/format_results.py" --model_name "$MODEL_NAME" \
    --scores_dir "$SAVE_SCORE_DIR" \
    --output_csv "$CSV_OUTPUT_PATH"

echo "4. Computing 2D Projections..."
python3 "$REPO_ROOT/compute_projections.py" \
    --embedding_path "$SAVE_EMBD_DIR" \
    --output_json "$PROJ_OUTPUT_PATH" \
    --embedding_type embd_weighted \
    --num_sents 100 \
    --file_ext .pkl

echo "5. Cleaning up embeddings to conserve disk quota..."
rm -rf "$SAVE_EMBD_DIR"/*.pkl

echo "Job Finished Successfully!"
