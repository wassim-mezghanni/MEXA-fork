import os

base_dir = "/Users/wassim/MEXA-fork"
found = False

for root, dirs, files in os.walk(base_dir):
    if "scores" in dirs:
        scores_dir = os.path.join(root, "scores")
        score_files = [f for f in os.listdir(scores_dir) if f.endswith(".json")]
        if score_files:
            rel_path = os.path.relpath(scores_dir, base_dir)
            print(f"{rel_path}: {len(score_files)} files")
            found = True

if not found:
    print("No score files found.")
