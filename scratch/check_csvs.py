import os
import pandas as pd

public_dir = "/Users/wassim/MEXA-fork/dashboard/public/data"
all_files = os.listdir(public_dir)

csv_files = [f for f in all_files if f.endswith(".csv")]
print(f"Total CSV files found: {len(csv_files)}")

# Group by experiment types
exp_patterns = {
    "flores_table1_100": [],
    "flores_table1_2000": [],
    "full_flores": [],
    "bible_table1": [],
    "bible": []
}

for f in csv_files:
    matched = False
    for pat in sorted(exp_patterns.keys(), key=len, reverse=True):
        if f.startswith(pat + "_") and f.endswith("_results.csv"):
            exp_patterns[pat].append(f)
            matched = True
            break
            
print("\nFiles per experiment pattern:")
for pat, files in exp_patterns.items():
    print(f"  {pat}: {len(files)} files")

# Print some file names and their columns
for pat, files in exp_patterns.items():
    if files:
        f = files[0]
        df = pd.read_csv(os.path.join(public_dir, f))
        print(f"\nExample for {pat} ({f}):")
        print(f"  Shape: {df.shape}")
        print(f"  Columns: {list(df.columns)}")
        print(f"  First 3 languages: {list(df['code'].head(3))}")
