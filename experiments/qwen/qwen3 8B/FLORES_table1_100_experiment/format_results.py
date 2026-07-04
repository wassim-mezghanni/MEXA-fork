import os
import json
import argparse
import pandas as pd

"""
Format MEXA JSON scores into Dashboard CSV — FLORES Table 1 subset (Qwen3 8B Base).

Computes BOTH max and mean pooling across layers, prints µ_Max and µ_Mean
so you can compare against the paper's Table 1 numbers.

Model: Qwen/Qwen3-8B-Base
Dataset: FLORES-200 devtest — 100 sentences, 116 languages (Belebele overlap)
"""

MODEL_NAME = "Qwen/Qwen3-8B-Base"


def main():
    parser = argparse.ArgumentParser("Format MEXA scores for Table 1 (Qwen3 8B Base — FLORES)")
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
                        f'{MODEL_NAME}_max': round(max_score, 4),
                        f'{MODEL_NAME}_mean': round(mean_score, 4),
                        'max_score': max_score,
                        'mean_score': mean_score,
                    })
                except json.JSONDecodeError:
                    print(f"Failed to parse {file}, skipping.")

    if not results:
        print("No valid scores found. CSV not generated.")
        return

    df = pd.DataFrame(results)

    mu_max = df['max_score'].mean()
    mu_mean = df['mean_score'].mean()

    print(f"\n{'='*50}")
    print(f"  FLORES Table 1 — Qwen3 8B Base Results")
    print(f"  Languages: {len(df)}")
    print(f"  µ_Max  = {mu_max:.4f}")
    print(f"  µ_Mean = {mu_mean:.4f}")
    print(f"{'='*50}\n")

    df['avg'] = df[f'{MODEL_NAME}_max']
    df = df[['code', f'{MODEL_NAME}_max', f'{MODEL_NAME}_mean', 'avg']]

    os.makedirs(os.path.dirname(args.output_csv), exist_ok=True)
    df.to_csv(args.output_csv, index=False)
    print(f"Formatted results saved to {args.output_csv}")


if __name__ == "__main__":
    main()
