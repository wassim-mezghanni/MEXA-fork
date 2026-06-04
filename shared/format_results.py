"""
Shared MEXA score formatter — formats per-language JSON scores into a Dashboard CSV.

Replaces the per-experiment format_results.py files. Invoke from any experiment slurm:

    python3 ../../shared/format_results.py \
        --model_name  "Qwen/Qwen3-8B-Base" \
        --scores_dir  ./scores \
        --output_csv  ../../dashboard/public/data/<file>.csv \
        [--label "FLORES Table 1"]

Output CSV columns: code, <MODEL_NAME>_max, <MODEL_NAME>_mean, avg
"""

import os
import json
import argparse
import pandas as pd


def main():
    parser = argparse.ArgumentParser("Format MEXA JSON scores into Dashboard CSV")
    parser.add_argument('--model_name', type=str, required=True,
                        help='HF model identifier used as the CSV column prefix (e.g. "Qwen/Qwen3-8B-Base")')
    parser.add_argument('--scores_dir', type=str, required=True, help="Directory containing .json scores")
    parser.add_argument('--output_csv', type=str, required=True, help="Path to save the resulting .csv file")
    parser.add_argument('--label', type=str, default='',
                        help='Optional banner label, e.g. "FLORES Table 1". Defaults to scores dir name.')
    args = parser.parse_args()

    if not os.path.exists(args.scores_dir):
        print(f"Directory {args.scores_dir} not found. Please run compute_mexa.py first.")
        return

    results = []
    for file in os.listdir(args.scores_dir):
        if not file.endswith('.json'):
            continue
        lang_code = file[:-len('.json')]
        with open(os.path.join(args.scores_dir, file), 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"Failed to parse {file}, skipping.")
                continue
        if not data:
            continue
        scores = list(data.values())
        max_score = max(scores)
        mean_score = sum(scores) / len(scores)
        results.append({
            'code': lang_code,
            f'{args.model_name}_max': round(max_score, 4),
            f'{args.model_name}_mean': round(mean_score, 4),
            'max_score': max_score,
            'mean_score': mean_score,
        })

    if not results:
        print("No valid scores found. CSV not generated.")
        return

    df = pd.DataFrame(results)
    mu_max = df['max_score'].mean()
    mu_mean = df['mean_score'].mean()

    label = args.label or os.path.basename(os.path.normpath(args.scores_dir))
    print(f"\n{'='*50}")
    print(f"  {label} — {args.model_name}")
    print(f"  Languages evaluated: {len(df)}")
    print(f"  µ_Max  = {mu_max:.4f}")
    print(f"  µ_Mean = {mu_mean:.4f}")
    print(f"{'='*50}\n")

    df['avg'] = df[f'{args.model_name}_max']
    df = df[['code', f'{args.model_name}_max', f'{args.model_name}_mean', 'avg']]
    os.makedirs(os.path.dirname(args.output_csv) or '.', exist_ok=True)
    df.to_csv(args.output_csv, index=False)
    print(f"Saved to {args.output_csv}")


if __name__ == "__main__":
    main()
