#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Submit ALL Apertus v1.5 (8B and 70B) MEXA experiments to CSCS Daint
#
# Usage (run on the CSCS cluster / login node from ~/MEXA-fork):
#   ./scripts/submit_apertus_v1.5_cscs.sh
# ──────────────────────────────────────────────────────────────

set -e

# Load environment variables from .env if present
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs) 2>/dev/null || true
fi

echo "=========================================================="
echo "  Submitting Apertus v1.5 (8B & 70B) MEXA experiments to CSCS SLURM"
echo "  HF_TOKEN present: $(if [ -n "$HF_TOKEN" ]; then echo "YES"; else echo "NO"; fi)"
echo "=========================================================="
echo ""

EXPERIMENTS=(
    "experiments/apertus/apertus 1.5 8B/FLORES_table1_100_experiment"
    "experiments/apertus/apertus 1.5 8B/bible_table1_experiment"
    "experiments/apertus/apertus 1.5 70B/FLORES_table1_100_experiment"
    "experiments/apertus/apertus 1.5 70B/bible_table1_experiment"
)

SUBMITTED=0
FAILED=0

for exp in "${EXPERIMENTS[@]}"; do
    if [ -f "${exp}/run_cscs_daint.slurm" ]; then
        echo "Submitting: ${exp}..."
        ( cd "${exp}" && sbatch --export=ALL,HF_TOKEN="${HF_TOKEN}" run_cscs_daint.slurm )
        SUBMITTED=$((SUBMITTED + 1))
    elif [ -f "${exp}/run_coma_cluster.slurm" ]; then
        echo "Submitting: ${exp}..."
        ( cd "${exp}" && sbatch --export=ALL,HF_TOKEN="${HF_TOKEN}" run_coma_cluster.slurm )
        SUBMITTED=$((SUBMITTED + 1))
    else
        echo "WARNING: No slurm file found in ${exp}, skipping."
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "============================================"
echo "  Done! Submitted: ${SUBMITTED}, Skipped: ${FAILED}"
echo "============================================"
echo ""
echo "Monitor your queued and running jobs with:"
echo "  squeue -u \$USER"
echo ""
