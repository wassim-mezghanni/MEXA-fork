#!/bin/bash
# Recompute ENGLISH-pivot MEXA scores from the CURRENT embeddings on the cluster.
#
# Why: the English-pivot CSVs for Llama 3.1 8B and Mistral 7B v0.3 were generated
# from embeddings extracted in April/May, but the Arabic experiment (Jun 21)
# re-extracted embeddings into the same shared directory, and the German/French
# scores (Jul 4) were computed from those newer embeddings. Cross-pivot
# comparisons therefore mixed two different embedding sets. Re-scoring English
# from the current embeddings makes all four pivots consistent.
#
# To be run on the cluster: ssh wassim@10.152.225.230 "bash -s" < rescore_english_pivot.sh

set -e

MODELS=(
  "llama3.1 8B|meta-llama/Llama-3.1-8B|llama3.1_8b"
  "mistral 0.3 7B|mistralai/Mistral-7B-v0.3|mistral_7b_v03"
  "qwen3 4B|Qwen/Qwen3-4B|qwen3_4b"
  "qwen3 8B|Qwen/Qwen3-8B-Base|qwen3_8b"
  "qwen3.5 9B|Qwen/Qwen3.5-9B-Base|qwen3.5_9b"
)

VENV_DIR="$HOME/mexa_env"
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
fi

cd ~/MEXA-fork

for item in "${MODELS[@]}"; do
  IFS='|' read -r dir model_name suffix <<< "$item"
  echo "Processing Model: $model_name (English pivot, current embeddings)"

  EMBD_DIR="${dir}/FLORES_table1_100_experiment/embeddings"
  SCORE_DIR="${dir}/FLORES_table1_100_english_pivot_rescored"
  mkdir -p "$SCORE_DIR"

  python3 compute_mexa.py \
      --embedding_path "$EMBD_DIR" \
      --save_path "$SCORE_DIR" \
      --num_sents 100 \
      --embedding_type embd_weighted \
      --pivot eng_Latn \
      --file_ext .pkl

  python3 shared/format_results.py \
      --model_name "$model_name" \
      --scores_dir "$SCORE_DIR" \
      --output_csv "dashboard/public/data/flores_table1_100_${suffix}_results.csv"
done

echo "ENGLISH PIVOT RESCORED FOR ALL MODELS!"
echo "Pull the regenerated CSVs (dashboard/public/data/flores_table1_100_*_results.csv)"
echo "back to your local repo so the dashboard uses consistent scores."
