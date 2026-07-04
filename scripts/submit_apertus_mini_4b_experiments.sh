#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Submit ALL 5 MEXA experiments for Apertus-mini 4B (base) to COMA
#   Model: swiss-ai/Apertus-v1.1-4B
#
# Usage (run on the COMA login node, from ~/MEXA-fork):
#   export HF_TOKEN=hf_xxx        # optional; model is public
#   ./submit_apertus_mini_4b_experiments.sh
# ──────────────────────────────────────────────────────────────

set -e

echo "=========================================================="
echo "  Submitting Apertus-mini 4B MEXA experiments to SLURM"
echo "=========================================================="

EXPERIMENTS=(
    "experiments/apertus/apertus mini 4B/FLORES_experiment"
    "experiments/apertus/apertus mini 4B/FLORES_table1_100_experiment"
    "experiments/apertus/apertus mini 4B/FLORES_table1_2000_experiment"
    "experiments/apertus/apertus mini 4B/bible_experiment"
    "experiments/apertus/apertus mini 4B/bible_table1_experiment"
)

SUBMITTED=0
FAILED=0

for exp in "${EXPERIMENTS[@]}"; do
    if [ -f "${exp}/run_coma_cluster.slurm" ]; then
        echo "Submitting: ${exp}..."
        ( cd "${exp}" && sbatch run_coma_cluster.slurm )
        SUBMITTED=$((SUBMITTED + 1))
    else
        echo "WARNING: ${exp}/run_coma_cluster.slurm not found, skipping."
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "============================================"
echo "  Done! Submitted: ${SUBMITTED}, Skipped: ${FAILED}"
echo "============================================"
squeue -u "$USER"
