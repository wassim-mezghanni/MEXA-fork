#!/bin/bash
#SBATCH --job-name=eval_downstream
#SBATCH --output=eval_downstream_%j.log
#SBATCH --error=eval_downstream_%j.err
#SBATCH --partition=compute
#SBATCH --gres=gpu:nvidia:1
#SBATCH --cpus-per-task=16
#SBATCH --mem=64G
#SBATCH --time=12:00:00

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Job started on $(hostname) at $(date) ==="
echo "CUDA_VISIBLE_DEVICES: $CUDA_VISIBLE_DEVICES"
nvidia-smi

# Activate conda environment on Coma cluster
source /storage/home/wassim/miniforge3/etc/profile.d/conda.sh
conda activate mexa_conda

# Move to repository directory
cd /storage/home/$USER/MEXA-fork || cd "$SLURM_SUBMIT_DIR"

# Run evaluation on all extended models (or specify single model with --model)
python3 scratch/evaluate_downstream.py \
    --model all \
    --output_dir ./downstream_eval_results \
    --batch_size auto

echo "=== Evaluation completed at $(date) ==="
