#!/bin/bash

# Configuration
CLUSTER_HOST="wassim@cluster.ginkgo-project.de"
REMOTE_DIR="~/MEXA-fork"

echo "=== 1. Syncing local changes to the COMA Cluster ==="
echo "Destination: ${CLUSTER_HOST}:${REMOTE_DIR}"

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
    echo "ERROR: Sync failed. Please make sure you are connected to the VPN (MWN/Eduroam) and can SSH into the cluster."
    exit 1
fi

echo ""
echo "=== 2. Submitting FLORES Table 1 (2000 sents) experiments ==="

ssh "${CLUSTER_HOST}" "bash -s" << 'EOF'
  cd ~/MEXA-fork

  echo "Submitting Qwen3 8B — FLORES Table 1 (2000 sents)..."
  cd "qwen3 8B/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting Qwen3.5 9B — FLORES Table 1 (2000 sents)..."
  cd "qwen3.5 9B/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting Apertus 8B — FLORES Table 1 (2000 sents)..."
  cd "apertus 8B/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting XLM-RoBERTa large — FLORES Table 1 (2000 sents)..."
  cd "XLM-RoBERTa large/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting XLM-RoBERTa base — FLORES Table 1 (2000 sents)..."
  cd "XLM-RoBERTa base/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo "Submitting LaBSE — FLORES Table 1 (2000 sents)..."
  cd "LaBSE/FLORES_table1_2000_experiment" && sbatch run_coma_cluster.slurm && cd ~/MEXA-fork

  echo ""
  echo "=== All 5 jobs submitted successfully! ==="
  squeue -u wassim
EOF
