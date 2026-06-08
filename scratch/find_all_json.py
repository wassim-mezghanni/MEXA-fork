import os

base_dir = "/Users/wassim/MEXA-fork"
for root, dirs, files in os.walk(base_dir):
    # skip node_modules, .git, cache
    if any(p in root for p in [".git", "node_modules", "cache", ".skills"]):
        continue
    json_files = [f for f in files if f.endswith(".json")]
    if json_files:
        print(f"{root}: {len(json_files)} json files")
