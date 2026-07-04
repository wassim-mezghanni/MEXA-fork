import os
import csv

MODELS = [
    {"label": "Llama 3.1 8B", "suffix": "llama3.1_8b", "max_col": "meta-llama/Llama-3.1-8B_max", "mean_col": "meta-llama/Llama-3.1-8B_mean"},
    {"label": "Mistral 7B v0.3", "suffix": "mistral_7b_v03", "max_col": "mistralai/Mistral-7B-v0.3_max", "mean_col": "mistralai/Mistral-7B-v0.3_mean"},
    {"label": "Qwen 3.5 9B Base", "suffix": "qwen3.5_9b", "max_col": "Qwen/Qwen3.5-9B-Base_max", "mean_col": "Qwen/Qwen3.5-9B-Base_mean"},
    {"label": "Qwen 3 8B Base", "suffix": "qwen3_8b", "max_col": "Qwen/Qwen3-8B-Base_max", "mean_col": "Qwen/Qwen3-8B-Base_mean"},
    {"label": "Qwen 3 4B", "suffix": "qwen3_4b", "max_col": "Qwen/Qwen3-4B_max", "mean_col": "Qwen/Qwen3-4B_mean"}
]

PIVOTS = [
    {"key": "english", "file_pattern": "flores_table1_100_{suffix}_results.csv"},
    {"key": "arabic", "file_pattern": "flores_table1_100_{suffix}_arabic_pivot_results.csv"},
    {"key": "german", "file_pattern": "flores_table1_100_{suffix}_german_pivot_results.csv"},
    {"key": "french", "file_pattern": "flores_table1_100_{suffix}_french_pivot_results.csv"}
]

DATA_DIR = "dashboard/public/data"

def get_average(file_path, max_col, mean_col):
    if not os.path.exists(file_path):
        return None, None
    
    max_scores = []
    mean_scores = []
    
    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if max_col in row and row[max_col]:
                max_scores.append(float(row[max_col]))
            if mean_col in row and row[mean_col]:
                mean_scores.append(float(row[mean_col]))
                
    if not max_scores or not mean_scores:
        return None, None
        
    return sum(max_scores) / len(max_scores), sum(mean_scores) / len(mean_scores)

print(f"{'Model':<20} | {'Pivot':<8} | {'Max Avg':<8} | {'Mean Avg':<8}")
print("-" * 52)

for model in MODELS:
    for pivot in PIVOTS:
        file_name = pivot["file_pattern"].format(suffix=model["suffix"])
        file_path = os.path.join(DATA_DIR, file_name)
        max_avg, mean_avg = get_average(file_path, model["max_col"], model["mean_col"])
        if max_avg is not None:
            print(f"{model['label']:<20} | {pivot['key']:<8} | {max_avg:.4f} | {mean_avg:.4f}")
        else:
            print(f"{model['label']:<20} | {pivot['key']:<8} | {'N/A':<8} | {'N/A':<8}")
