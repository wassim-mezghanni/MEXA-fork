import os
import json
import pandas as pd
import numpy as np

data_dir = "/Users/wassim/MEXA-fork/dashboard/public/data"
lang_names_path = os.path.join(data_dir, "language_names.json")

# Load language name mappings
with open(lang_names_path, "r", encoding="utf-8") as f:
    lang_names = json.load(f)

def get_readable_name(code):
    iso = code.split("_")[0]
    return lang_names.get(iso, code) + f" ({code})"

def analyze_dataset(pattern):
    print(f"\n==========================================")
    print(f"  Worst Performing Languages in {pattern.upper()}")
    print(f"==========================================")
    
    files = [f for f in os.listdir(data_dir) if f.startswith(pattern) and f.endswith("_results.csv")]
    if not files:
        print("No files found.")
        return
        
    scores_dict = {}
    
    for f in files:
        filepath = os.path.join(data_dir, f)
        df = pd.read_csv(filepath)
        if 'code' not in df.columns:
            continue
            
        # Find the max score column
        max_col = [c for c in df.columns if c.endswith("_max")]
        if not max_col:
            continue
        col = max_col[0]
        
        # Add to scores dictionary
        for _, row in df.iterrows():
            code = row['code']
            if code == 'eng_Latn': # Skip pivot
                continue
            val = row[col]
            if pd.isna(val):
                continue
            if code not in scores_dict:
                scores_dict[code] = []
            scores_dict[code].append(val)
            
    # Calculate average and standard deviation
    results = []
    for code, scores in scores_dict.items():
        if len(scores) < len(files) / 2: # Keep only languages with data in at least half of the models
            continue
        results.append({
            'code': code,
            'name': get_readable_name(code),
            'avg_score': np.mean(scores),
            'min_score': np.min(scores),
            'max_score': np.max(scores),
            'num_models': len(scores)
        })
        
    # Sort by avg_score ascending (worst first)
    df_results = pd.DataFrame(results).sort_values('avg_score')
    
    print("\nTop 25 Worst Languages (Sorted by Average Max Alignment Score):")
    for i, (_, row) in enumerate(df_results.head(25).iterrows(), 1):
        print(f"{i:>2}. {row['name']:<50} | Avg: {row['avg_score']:.4f} | Min: {row['min_score']:.4f} | Max: {row['max_score']:.4f} | ({row['num_models']} models)")

print("Running worst language extractor...")
analyze_dataset("full_flores")
analyze_dataset("bible")
