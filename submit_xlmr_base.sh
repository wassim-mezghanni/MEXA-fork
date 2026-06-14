#!/bin/bash

# Configuration
CLUSTER_HOST="wassim@cluster.ginkgo-project.de"
REMOTE_DIR="~/MEXA-fork"

echo "=== 1. Syncing local changes to the COMA Cluster ==="
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'embeddings' \
  --exclude 'scores' \
  --exclude 'cache' \
  --exclude 'dashboard/dist' \
  --exclude 'dashboard/build' \
  ./ "${CLUSTER_HOST}:${REMOTE_DIR}/"

if [ $? -ne 0 ]; then
    echo "ERROR: Sync failed. Let's try IP address fallback..."
    CLUSTER_HOST="wassim@10.152.225.230"
    rsync -avz \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'embeddings' \
      --exclude 'scores' \
      --exclude 'cache' \
      --exclude 'dashboard/dist' \
      --exclude 'dashboard/build' \
      ./ "${CLUSTER_HOST}:${REMOTE_DIR}/"
    if [ $? -ne 0 ]; then
        echo "ERROR: Fallback sync failed too. Please verify VPN connection."
        exit 1
    fi
fi

echo ""
echo "=== 2. Submitting XLM-RoBERTa Base Experiments ==="

ssh "${CLUSTER_HOST}" "bash -s" << 'EOF'
  cd ~/MEXA-fork

  echo "Submitting FLORES Full..."
  cd "XLM-RoBERTa base/FLORES_full_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting FLORES Table 1 (100 sents)..."
  cd "XLM-RoBERTa base/FLORES_table1_100_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting FLORES Table 1 (2000 sents)..."
  cd "XLM-RoBERTa base/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting Bible Full..."
  cd "XLM-RoBERTa base/bible_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting Bible Table 1..."
  cd "XLM-RoBERTa base/bible_table1_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo ""
  echo "=== All 5 XLM-RoBERTa base jobs submitted successfully! ==="
  squeue -u wassim
EOF
