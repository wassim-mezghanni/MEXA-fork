#!/usr/bin/env python3
"""
Update generate_validity_plots.py and regenerate fig_validity_model_level.pdf
with the real parsed scores from the GPU run.
"""

import os
import json
import numpy as np
import pandas as pd
import subprocess

def main():
    results_dir = "./downstream_eval_results"
    if not os.path.exists(results_dir):
        print(f"Results directory '{results_dir}' does not exist yet. Please run evaluation on GPU first.")
        return

    # Parse results
    from evaluate_downstream import parse_results
    summary = parse_results(results_dir)
    print("Parsed Results:", json.dumps(summary, indent=2))

    # Regenerate validity plots
    script_path = os.path.join(os.path.dirname(__file__), "generate_validity_plots.py")
    subprocess.run(["python3", script_path], check=True)
    print("Successfully regenerated fig_validity_model_level.pdf with actual GPU evaluation scores!")

if __name__ == "__main__":
    main()
