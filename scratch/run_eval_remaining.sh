#!/bin/bash
#SBATCH --job-name=eval_remaining
#SBATCH --output=eval_remaining_%j.log
#SBATCH --error=eval_remaining_%j.err
#SBATCH --partition=compute
#SBATCH --gres=gpu:nvidia:1
#SBATCH --cpus-per-task=16
#SBATCH --mem=64G
#SBATCH --time=12:00:00

set -e

echo "=== Job started on $(hostname) at $(date) ==="
echo "CUDA_VISIBLE_DEVICES: $CUDA_VISIBLE_DEVICES"
nvidia-smi

source /storage/home/wassim/miniforge3/etc/profile.d/conda.sh
conda activate mexa_conda

cd /storage/home/wassim/MEXA-fork || cd "$SLURM_SUBMIT_DIR"

export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True

# 1. Evaluate Qwen3.5 9B (large vocabulary ~248k, using batch_size 4 to prevent logits OOM)
echo "Evaluating Qwen3.5 9B..."
python3 scratch/evaluate_downstream.py \
    --model "Qwen/Qwen3.5-9B-Base" \
    --output_dir ./downstream_eval_results \
    --batch_size 4

# 2. Evaluate Apertus 8B
echo "Evaluating Apertus 8B..."
python3 scratch/evaluate_downstream.py \
    --model "swiss-ai/Apertus-8B-2509" \
    --output_dir ./downstream_eval_results \
    --batch_size 8

echo "=== All remaining models evaluated successfully at $(date) ==="
