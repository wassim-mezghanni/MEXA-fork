#!/bin/bash
# ──────────────────────────────────────────────────────────────
# Sync local MEXA-fork to CSCS Daint and submit Apertus 1.5 jobs
#
# Usage (run from your local machine):
#   ./scripts/sync_and_submit_cscs.sh
# ──────────────────────────────────────────────────────────────

set -e

REMOTE_HOST="${CSCS_HOST:-daint}"
REMOTE_DIR="${REMOTE_DIR:-~/MEXA-fork}"

echo "=========================================================="
echo " 1. Syncing local MEXA-fork to CSCS Daint (${REMOTE_HOST})"
echo "=========================================================="

rsync -avz \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'embeddings' \
  --exclude 'scores' \
  --exclude 'cache' \
  --exclude 'dashboard/dist' \
  --exclude 'dashboard/build' \
  ./ "${REMOTE_HOST}:${REMOTE_DIR}/"

echo ""
echo "=========================================================="
echo " 2. Submitting Apertus 1.5 (8B & 70B) jobs on CSCS Daint"
echo "=========================================================="

ssh "${REMOTE_HOST}" "bash -s" << 'EOF'
  cd ~/MEXA-fork
  chmod +x scripts/submit_apertus_v1.5_cscs.sh
  ./scripts/submit_apertus_v1.5_cscs.sh
EOF

echo ""
echo "=== Done! Apertus 1.5 experiments submitted to CSCS Daint. ==="
