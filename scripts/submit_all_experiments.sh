#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Submit ALL MEXA experiments to the COMA cluster
#
# Usage: ./submit_all_experiments.sh
#
# All 9 jobs will be queued. SLURM schedules them as H100 GPUs
# become available. Each job uses 1 GPU.
#
# Total estimated GPU-hours: ~36h
#   - 5 FLORES experiments (2h each) = 10h
#   - 4 Bible experiments (6h each)  = 24h
#   - 1 Table1 experiment (6h)       =  6h  (counted in FLORES above)
# ──────────────────────────────────────────────────────────────

set -e

echo "============================================"
echo "  Submitting ALL MEXA experiments to SLURM"
echo "============================================"
echo ""

EXPERIMENTS=(
    "experiments/llama/llama3.1 8B/FLORES_full_experiment"
    "experiments/llama/llama3.1 8B/FLORES_table1_100_experiment"
    "experiments/llama/llama3.1 8B/FLORES_experiment"
    "experiments/llama/llama3.1 8B/bible_experiment"
    "experiments/llama/llama3.1 8B/bible_table1_experiment"
    "experiments/mistral/mistral 0.3 7B/FLORES_experiment"
    "experiments/mistral/mistral 0.3 7B/FLORES_table1_100_experiment"
    "experiments/mistral/mistral 0.3 7B/bible_experiment"
    "experiments/mistral/mistral 0.3 7B/bible_table1_experiment"
    "experiments/apertus/apertus 8B/FLORES_table1_100_experiment"
    "experiments/apertus/apertus 8B/bible_table1_experiment"
    "experiments/qwen/qwen3 8B/FLORES_experiment"
    "experiments/qwen/qwen3 8B/bible_experiment"
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
