import pandas as pd
import glob
import os

data_dir = "/Users/wassim/MEXA-fork/dashboard/public/data"
csv_files = glob.glob(os.path.join(data_dir, "*mixtral*results.csv"))

print("File, Mean_of_Max, Mean_of_Mean")
for f in csv_files:
    df = pd.read_csv(f)
    # columns are: code, mistralai/Mixtral-8x7B-v0.1_max, mistralai/Mixtral-8x7B-v0.1_mean, avg
    max_col = [c for c in df.columns if "max" in c][0]
    mean_col = [c for c in df.columns if "mean" in c][0]
    mean_max = df[max_col].mean()
    mean_mean = df[mean_col].mean()
    print(f"{os.path.basename(f)} | {mean_max:.4f} | {mean_mean:.4f}")
