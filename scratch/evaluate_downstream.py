#!/usr/bin/env python3
"""
Evaluate downstream multilingual benchmarks (Belebele and m-ARC)
using lm-evaluation-harness for Qwen and Apertus models.

Usage:
  python evaluate_downstream.py --model Qwen/Qwen3-8B-Base --output_dir ./eval_results
"""

import os
import sys
import json
import argparse
import subprocess
import pandas as pd
import numpy as np

# Models to evaluate
EVAL_MODELS = [
    {"name": "Qwen3 0.6B", "hf_path": "Qwen/Qwen3-0.6B"},
    {"name": "Qwen3 1.7B", "hf_path": "Qwen/Qwen3-1.7B"},
    {"name": "Qwen3 4B", "hf_path": "Qwen/Qwen3-4B"},
    {"name": "Qwen3 8B", "hf_path": "Qwen/Qwen3-8B-Base"},
    {"name": "Qwen3.5 9B", "hf_path": "Qwen/Qwen3.5-9B-Base"},
    {"name": "Apertus 8B", "hf_path": "swiss-ai/Apertus-8B-2509"},
]

def run_lmeval(model_path, tasks, num_fewshot, output_path, batch_size="auto"):
    """Run lm-eval command via subprocess."""
    os.makedirs(output_path, exist_ok=True)
    task_str = ",".join(tasks)
    cmd = [
        "lm_eval",
        "--model", "hf",
        "--model_args", f"pretrained={model_path},dtype=bfloat16,trust_remote_code=True",
        "--tasks", task_str,
        "--num_fewshot", str(num_fewshot),
        "--batch_size", str(batch_size),
        "--output_path", output_path,
        "--log_samples"
    ]
    print(f"Running command: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)

def parse_results(results_dir):
    """Parse output JSON files from lm_eval and compute macro-average accuracies."""
    summary = {}
    for root, _, files in os.walk(results_dir):
        for file in files:
            if file.endswith(".json") and "results" in file:
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, "r") as f:
                        data = json.load(f)
                    
                    results = data.get("results", {})
                    belebele_scores = []
                    marc_scores = []
                    
                    for task_name, metrics in results.items():
                        acc = metrics.get("acc,none", metrics.get("acc", None))
                        if acc is not None:
                            if "belebele" in task_name.lower():
                                belebele_scores.append(acc)
                            elif "arc" in task_name.lower():
                                marc_scores.append(acc)
                    
                    summary[root] = {
                        "belebele_mean": np.mean(belebele_scores) if belebele_scores else None,
                        "belebele_n_langs": len(belebele_scores),
                        "marc_mean": np.mean(marc_scores) if marc_scores else None,
                        "marc_n_langs": len(marc_scores)
                    }
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    return summary

def main():
    parser = argparse.ArgumentParser(description="Evaluate downstream multilingual benchmarks on GPU.")
    parser.add_argument("--model", type=str, default="all", help="HF model name or 'all'")
    parser.add_argument("--output_dir", type=str, default="./downstream_eval_results", help="Output directory")
    parser.add_argument("--batch_size", type=str, default="auto", help="Batch size or 'auto'")
    parser.add_argument("--parse_only", action="store_true", help="Only parse existing JSON outputs")
    args = parser.parse_args()

    if args.parse_only:
        summary = parse_results(args.output_dir)
        print("\nParsed Results Summary:")
        print(json.dumps(summary, indent=2))
        return

    models = EVAL_MODELS if args.model == "all" else [{"name": args.model.split("/")[-1], "hf_path": args.model}]

    for m in models:
        model_name = m["name"].replace(" ", "_")
        model_out = os.path.join(args.output_dir, model_name)
        print(f"\n==========================================")
        print(f"Evaluating {m['name']} ({m['hf_path']})")
        print(f"==========================================")
        
        # 1. Belebele (5-shot, log-likelihood)
        print("\n--- Running Belebele (5-shot) ---")
        run_lmeval(
            model_path=m["hf_path"],
            tasks=["belebele"],
            num_fewshot=5,
            output_path=os.path.join(model_out, "belebele"),
            batch_size=args.batch_size
        )
        
        # 2. m-ARC (5-shot, log-likelihood)
        print("\n--- Running m-ARC (5-shot) ---")
        run_lmeval(
            model_path=m["hf_path"],
            tasks=["arc_multilingual"],
            num_fewshot=5,
            output_path=os.path.join(model_out, "marc"),
            batch_size=args.batch_size
        )

    print("\nAll evaluations complete! Parsing results...")
    summary = parse_results(args.output_dir)
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
