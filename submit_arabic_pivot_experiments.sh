#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Submit ALL MEXA experiments with Arabic pivot to the COMA cluster
#
# Usage: ./submit_arabic_pivot_experiments.sh
# ──────────────────────────────────────────────────────────────

set -e

echo "=========================================================="
echo "  Submitting ALL MEXA Arabic Pivot experiments to SLURM"
echo "=========================================================="
echo ""

EXPERIMENTS=(
    "llama3.1 8B/FLORES_table1_100_arabic_pivot_experiment"
    "mistral 0.3 7B/FLORES_table1_100_arabic_pivot_experiment"
    "qwen3 4B/FLORES_table1_100_arabic_pivot_experiment"
    "qwen3 8B/FLORES_table1_100_arabic_pivot_experiment"
    "qwen3.5 9B/FLORES_table1_100_arabic_pivot_experiment"
)

SUBMITTED=0
FAILED=0

for exp in "${EXPERIMENTS[@]}"; do
    if [ -f "${exp}/run_coma_cluster.slurm" ]; then
        echo "Submitting: ${exp}..."
        sbatch "${exp}/run_coma_cluster.slurm"
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
echo ""
echo "Monitor your jobs with:"
echo "  squeue -u \$USER"
echo ""
echo "Check logs in each experiment directory:"
echo "  tail -f <experiment>/*_output.log"
