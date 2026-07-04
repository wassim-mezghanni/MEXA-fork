#!/bin/bash
# To be run on the cluster: ssh wassim@10.152.225.230 "bash -s" < run_other_pivots.sh

set -e

MODELS=(
  "llama3.1 8B|meta-llama/Llama-3.1-8B|llama3.1_8b"
  "mistral 0.3 7B|mistralai/Mistral-7B-v0.3|mistral_7b_v03"
  "qwen3 4B|Qwen/Qwen3-4B|qwen3_4b"
  "qwen3 8B|Qwen/Qwen3-8B-Base|qwen3_8b"
  "qwen3.5 9B|Qwen/Qwen3.5-9B-Base|qwen3.5_9b"
)

PIVOTS=(
  "deu_Latn|german"
  "fra_Latn|french"
)

VENV_DIR="$HOME/mexa_env"
if [ -f "$VENV_DIR/bin/activate" ]; then
  source "$VENV_DIR/bin/activate"
fi

cd ~/MEXA-fork

for item in "${MODELS[@]}"; do
  IFS='|' read -r dir model_name suffix <<< "$item"
  echo "Processing Model: $model_name"
  
  EMBD_DIR="${dir}/FLORES_table1_100_experiment/embeddings"
  
  for p_item in "${PIVOTS[@]}"; do
    IFS='|' read -r pivot_code pivot_name <<< "$p_item"
    echo "  Pivot: $pivot_code ($pivot_name)"
    
    SCORE_DIR="${dir}/FLORES_table1_100_${pivot_name}_pivot_scores"
    mkdir -p "$SCORE_DIR"
    
    # Compute MEXA alignments
    python3 compute_mexa.py \
        --embedding_path "$EMBD_DIR" \
        --save_path "$SCORE_DIR" \
        --num_sents 100 \
        --embedding_type embd_weighted \
        --pivot "$pivot_code" \
        --file_ext .pkl
        
    # Format results
    python3 shared/format_results.py \
        --model_name "$model_name" \
        --scores_dir "$SCORE_DIR" \
        --output_csv "dashboard/public/data/flores_table1_100_${suffix}_${pivot_name}_pivot_results.csv"
        
    # Compute projections
    python3 compute_projections.py \
        --embedding_path "$EMBD_DIR" \
        --output_json "dashboard/public/data/projections_flores_table1_100_${suffix}_${pivot_name}_pivot.json" \
        --embedding_type embd_weighted \
        --num_sents 100 \
        --file_ext .pkl
  done
done

echo "ALL PIVOTS PROCESSED SUCCESSFULLY!"
