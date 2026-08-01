#!/bin/bash
#SBATCH --job-name=mexa-mixtral-8x22b-flores-table1-2000
#SBATCH --output=mixtral_8x22b_flores_table1_2000_output.log
#SBATCH --error=mixtral_8x22b_flores_table1_2000_error.log
#SBATCH --partition=lrz-hgx-h100-94x4
#SBATCH --qos=gpu
#SBATCH --gres=gpu:4
#SBATCH --cpus-per-task=16
#SBATCH --mem=500G
#SBATCH --time=12:00:00

# ──────────────────────────────────────────────────────────────
# MEXA — Mixtral 8x22B on FLORES Table 1 (116 langs, 2000 sents)
# Target cluster: LRZ AI Systems · runs INSIDE an enroot/pyxis container
#
#   Model:     mistralai/Mixtral-8x22B-v0.1
#   Arch:      Sparse MoE decoder (~141B total, ~39B active/token, 8 experts top-2)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 2000
# ──────────────────────────────────────────────────────────────

cd "$SLURM_SUBMIT_DIR"

srun --container-image=nvcr.io#nvidia/pytorch:24.12-py3 \
     --container-mounts="$HOME:$HOME" \
     --container-workdir="$SLURM_SUBMIT_DIR" \
     bash "$SLURM_SUBMIT_DIR/container_payload.sh"
