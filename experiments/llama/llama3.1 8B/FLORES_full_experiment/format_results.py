import os
import json
import argparse
import pandas as pd

"""
Format MEXA JSON scores into Dashboard CSV — FLORES-200 dataset (Table 1 reproduction).

This script is for the Table 1 reproduction experiment.
It computes BOTH max and mean pooling across layers, and prints
mu_Max and mu_Mean so you can compare against the paper's Table 1:

  Paper Table 1 (Llama 3.1 8B):
    FLORES µ_Max  = 0.6538
    FLORES µ_Mean = 0.3963

The CSV output includes both pooling columns: _max and _mean.

Model: meta-llama/Llama-3.1-8B
Dataset: FLORES-200 devtest — 2000 sentences (full)
"""

def main():
    parser = argparse.ArgumentParser("Format MEXA json scores into Dashboard CSV (Table 1 reproduction)")
    parser.add_argument('--scores_dir', type=str, required=True, help="Directory containing .json scores")
    parser.add_argument('--output_csv', type=str, required=True, help="Path to save the resulting .csv file")
    args = parser.parse_args()

    results = []

    if not os.path.exists(args.scores_dir):
        print(f"Directory {args.scores_dir} not found. Please run compute_mexa.py first.")
        return

    for file in os.listdir(args.scores_dir):
        if file.endswith('.json'):
            lang_code = file.replace('.json', '')

            with open(os.path.join(args.scores_dir, file), 'r') as f:
                try:
                    data = json.load(f)
                    if not data:
                        continue

                    scores = list(data.values())
                    max_score = max(scores)
                    mean_score = sum(scores) / len(scores)

                    results.append({
                        'code': lang_code,
                        'meta-llama/Llama-3.1-8B_max': round(max_score, 4),
                        'meta-llama/Llama-3.1-8B_mean': round(mean_score, 4),
                        'max_score': max_score,
                        'mean_score': mean_score,
                    })
                except json.JSONDecodeError:
                    print(f"Failed to parse {file}, skipping.")

    if not results:
        print("No valid scores found. CSV not generated.")
        return

    df = pd.DataFrame(results)

    # Compute mu_Max and mu_Mean (paper Table 1 metrics)
    mu_max = df['max_score'].mean()
    mu_mean = df['mean_score'].mean()

    print(f"\n{'='*50}")
    print(f"  FLORES Table 1 Reproduction Results")
    print(f"  Languages evaluated: {len(df)}")
    print(f"  µ_Max  = {mu_max:.4f}  (paper target: 0.6538)")
    print(f"  µ_Mean = {mu_mean:.4f}  (paper target: 0.3963)")
    print(f"{'='*50}\n")

    # CSV for dashboard includes both pooling columns
    df['avg'] = df['meta-llama/Llama-3.1-8B_max']
    df = df[['code', 'meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean', 'avg']]

    os.makedirs(os.path.dirname(args.output_csv), exist_ok=True)
    df.to_csv(args.output_csv, index=False)
    print(f"Formatted results saved to {args.output_csv}")

if __name__ == "__main__":
    main()
