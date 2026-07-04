import os
import json
import argparse
import pandas as pd

def main():
    parser = argparse.ArgumentParser("Format MEXA json scores into Dashboard CSV")
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
                    max_score = max(data.values()) if data else 0.0

                    results.append({
                        'code': lang_code,
                        'mistralai/Mistral-7B-v0.3': max_score
                    })
                except json.JSONDecodeError:
                    print(f"Failed to parse {file}, skipping.")

    if not results:
        print("No valid scores found. CSV not generated.")
        return

    df = pd.DataFrame(results)
    df['avg'] = df['mistralai/Mistral-7B-v0.3']
    df = df[['code', 'mistralai/Mistral-7B-v0.3', 'avg']]

    os.makedirs(os.path.dirname(args.output_csv), exist_ok=True)
    df.to_csv(args.output_csv, index=False)
    print(f"Formatted results successfully saved to {args.output_csv}")

if __name__ == "__main__":
    main()
