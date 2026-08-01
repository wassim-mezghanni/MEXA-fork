#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Submit Mixtral 8x7B (COMA) and 8x22B (LRZ) Experiments
# ──────────────────────────────────────────────────────────────

COMA_HOST="wassim@cluster.ginkgo-project.de"
LRZ_HOST="ai" # as per ~/.ssh/config alias
REMOTE_DIR="~/MEXA-fork"

echo "========================================================="
echo "        Submitting Mixtral Experiments to Clusters"
echo "========================================================="
echo ""

# ──────────────────────────────────────────────────────────────
# Part 1: COMA Cluster (Mixtral 8x7B)
# ──────────────────────────────────────────────────────────────
echo "Checking connection to COMA Cluster..."
if ssh -o ConnectTimeout=5 "$COMA_HOST" "echo Connected" &>/dev/null; then
    echo "✔ Connection to COMA successful! Syncing and submitting jobs..."
    
    rsync -avz \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'embeddings' \
      --exclude 'scores' \
      --exclude 'cache' \
      --exclude 'dashboard/dist' \
      --exclude 'dashboard/build' \
      ./ "${COMA_HOST}:${REMOTE_DIR}/"

    ssh "$COMA_HOST" "bash -s" << 'EOF'
      cd ~/MEXA-fork
      echo "Submitting Mixtral 8x7B FLORES Full on COMA..."
      cd ~/MEXA-fork/experiments/mistral/Mixtral-8x7B/FLORES_full_experiment && sbatch run_coma_cluster.slurm
      
      echo "Submitting Mixtral 8x7B Bible Full on COMA..."
      cd ~/MEXA-fork/experiments/mistral/Mixtral-8x7B/bible_experiment && sbatch run_coma_cluster.slurm
      
      echo ""
      echo "Mixtral 8x7B jobs submitted to COMA. Queue status:"
      squeue -u wassim
EOF
else
    echo "❌ COMA Cluster ($COMA_HOST) is currently unreachable."
    echo "   Ensure you are connected to the MWN/eduVPN."
fi

echo ""
# ──────────────────────────────────────────────────────────────
# Part 2: LRZ AI Systems (Mixtral 8x22B)
# ──────────────────────────────────────────────────────────────
echo "Checking connection to LRZ AI Cluster..."
if ssh -o ConnectTimeout=5 "$LRZ_HOST" "echo Connected" &>/dev/null; then
    echo "✔ Connection to LRZ successful! Syncing and submitting jobs..."

    rsync -avz \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'embeddings' \
      --exclude 'scores' \
      --exclude 'cache' \
      --exclude 'dashboard/dist' \
      --exclude 'dashboard/build' \
      ./ "${LRZ_HOST}:${REMOTE_DIR}/"

    ssh "$LRZ_HOST" "bash -s" << 'EOF'
      echo "Submitting Mixtral 8x22B FLORES Table 1 (2000) on LRZ..."
      cd ~/MEXA-fork/experiments/mistral/Mixtral-8x22B/FLORES_table1_2000_experiment && sbatch run_lrz_cluster.slurm
      
      echo "Submitting Mixtral 8x22B FLORES Full on LRZ..."
      cd ~/MEXA-fork/experiments/mistral/Mixtral-8x22B/FLORES_full_experiment && sbatch run_lrz_cluster.slurm
      
      echo "Submitting Mixtral 8x22B Bible Full on LRZ..."
      cd ~/MEXA-fork/experiments/mistral/Mixtral-8x22B/bible_experiment && sbatch run_lrz_cluster.slurm
      
      echo ""
      echo "Mixtral 8x22B jobs submitted to LRZ. Queue status:"
      squeue -u $USER
EOF
else
    echo "❌ LRZ AI Cluster ($LRZ_HOST) is currently unreachable."
    echo "   Ensure you are connected to the MWN/eduVPN."
fi

echo ""
echo "========================================================="
echo "To run manually once connected to VPN, execute:"
echo "  bash scripts/submit_mixtral_jobs.sh"
echo "========================================================="
