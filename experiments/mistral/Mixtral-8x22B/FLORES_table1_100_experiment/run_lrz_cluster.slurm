#!/bin/bash
#SBATCH --job-name=mexa-mixtral-8x22b-flores-table1-100-verify
#SBATCH --output=mixtral_8x22b_flores_table1_100_verify_output.log
#SBATCH --error=mixtral_8x22b_flores_table1_100_verify_error.log
#SBATCH --partition=lrz-hgx-h100-94x4
#SBATCH --qos=gpu
#SBATCH --gres=gpu:4
#SBATCH --cpus-per-task=16
#SBATCH --mem=500G
#SBATCH --time=12:00:00

# ──────────────────────────────────────────────────────────────
# MEXA — Mixtral 8x22B VERIFICATION RUN on FLORES Table 1 (116 langs, 100 sents)
# Target cluster: LRZ AI Systems · runs INSIDE an enroot/pyxis container
#
#   Model:     mistralai/Mixtral-8x22B-v0.1
#   Arch:      Sparse MoE decoder (~141B total, ~39B active/token, 8 experts top-2)
#   Embedding: token-weighted (embd_weighted) · Max + Mean pooling
#   Pivot:     eng_Latn · Sentences: 100
#
# Purpose: independent re-run to verify previously imported results
#   (µ_Max 0.5184 / µ_Mean 0.2686). Outputs go to *_lrzverify files —
#   the original CSVs are NOT overwritten.
#
# Why a container: the ~282GB bf16 checkpoint exceeds the 100GB DSS home
# quota, and /raid (1.7TB node-local NVMe) is root-owned. Inside an enroot
# container the rootfs lives ON /raid, so the HF cache goes to /model_cache
# in the container and is discarded automatically when the job ends.
# 4× H100 94GB (376GB VRAM total); device_map='auto' shards the model.
# ──────────────────────────────────────────────────────────────

cd "$SLURM_SUBMIT_DIR"

srun --container-image=nvcr.io#nvidia/pytorch:24.12-py3 \
     --container-mounts="$HOME:$HOME" \
     --container-workdir="$SLURM_SUBMIT_DIR" \
     bash "$SLURM_SUBMIT_DIR/container_payload.sh"
