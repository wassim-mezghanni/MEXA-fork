import os
import json

base_dir = "/Users/wassim/MEXA-fork"
models = [
    "Glot500-base", "LaBSE", "Mixtral-8x7B", "Qwen3-30B-A3B", 
    "Qwen3-Embedding-0.6B", "Qwen3-Embedding-4B", "Qwen3-Embedding-8B", 
    "XLM-RoBERTa large", "apertus 8B", "llama3.1 8B", "mistral 0.3 7B", 
    "mmBERT-base", "multilingual-e5-base", "qwen3 0.6B", "qwen3 1.7B", 
    "qwen3 4B", "qwen3 8B", "qwen3.5 9B"
]

print("Model, Experiment, Num_Score_Files")
for model in models:
    model_path = os.path.join(base_dir, model)
    if not os.path.exists(model_path):
        continue
    for exp in os.listdir(model_path):
        exp_path = os.path.join(model_path, exp)
        if os.path.isdir(exp_path):
            scores_path = os.path.join(exp_path, "scores")
            if os.path.exists(scores_path) and os.path.isdir(scores_path):
                score_files = [f for f in os.listdir(scores_path) if f.endswith(".json")]
                if len(score_files) > 0:
                    print(f"{model} | {exp} | {len(score_files)}")
