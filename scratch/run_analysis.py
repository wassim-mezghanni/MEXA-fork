import os
import re
import pandas as pd
import numpy as np
from scipy.stats import spearmanr, kendalltau, wilcoxon

public_dir = "/Users/wassim/MEXA-fork/dashboard/public/data"

# Categorize models
decoder_models = [
    "apertus8b", "llama3.1_8b", "mistral_7b_v03", "qwen3.5_9b",
    "qwen3_0.6b", "qwen3_1.7b", "qwen3_4b", "qwen3_8b"
]
encoder_models = [
    "glot500", "labse", "me5_base", "mmbert_base", "xlmr_large",
    "qwen3_emb_0.6b", "qwen3_emb_4b", "qwen3_emb_8b"
]

all_models = decoder_models + encoder_models

def get_model_type(model_name):
    if model_name in decoder_models:
        return "decoder"
    elif model_name in encoder_models:
        return "encoder"
    return "unknown"

# Find all files for each experiment pattern
exp_patterns = ["flores_table1_100", "flores_table1_2000", "full_flores", "bible_table1", "bible"]

# Load all CSVs
data = {}
for exp in exp_patterns:
    data[exp] = {}
    
for f in os.listdir(public_dir):
    if not f.endswith(".csv"):
        continue
    for exp in exp_patterns:
        if f.startswith(exp + "_") and f.endswith("_results.csv"):
            model_key = f[len(exp)+1 : -len("_results.csv")]
            filepath = os.path.join(public_dir, f)
            try:
                df = pd.read_csv(filepath)
                if 'code' not in df.columns:
                    continue
                max_col = [c for c in df.columns if c.endswith("_max")]
                mean_col = [c for c in df.columns if c.endswith("_mean")]
                if max_col and mean_col:
                    data[exp][model_key] = {
                        'df': df,
                        'max_col': max_col[0],
                        'mean_col': mean_col[0]
                    }
            except Exception as e:
                pass

output = []

def log(msg):
    output.append(msg)
    print(msg)

log("Loaded experiments and counts:")
for exp in exp_patterns:
    log(f"  {exp}: {len(data[exp])} models")

# 1. MAX vs MEAN ANALYSIS
log("\n=== 1. MAX vs MEAN: Model Ranking Consistency ===")

for exp in exp_patterns:
    models_present = list(data[exp].keys())
    if not models_present:
        continue
        
    model_types_to_check = {
        "All Models": models_present,
        "Decoder-only": [m for m in models_present if get_model_type(m) == "decoder"],
        "Encoder-only": [m for m in models_present if get_model_type(m) == "encoder"]
    }
    
    log(f"\nExperiment: {exp} ({len(models_present)} models)")
    for name, m_list in model_types_to_check.items():
        if len(m_list) < 3:
            log(f"  {name}: Too few models ({len(m_list)}) to calculate rank correlation.")
            continue
            
        max_scores = []
        mean_scores = []
        for m in m_list:
            df = data[exp][m]['df']
            max_c = data[exp][m]['max_col']
            mean_c = data[exp][m]['mean_col']
            df_no_eng = df[df['code'] != 'eng_Latn']
            max_scores.append(df_no_eng[max_c].mean())
            mean_scores.append(df_no_eng[mean_c].mean())
            
        rho, p_spearman = spearmanr(max_scores, mean_scores)
        tau, p_kendall = kendalltau(max_scores, mean_scores)
        
        log(f"  {name} ({len(m_list)} models):")
        log(f"    Spearman Rho: {rho:.4f} (p={p_spearman:.4e})")
        log(f"    Kendall Tau:  {tau:.4f} (p={p_kendall:.4e})")
        
        rank_df = pd.DataFrame({
            'Model': m_list,
            'Max_Avg': max_scores,
            'Mean_Avg': mean_scores
        })
        rank_df['Rank_Max'] = rank_df['Max_Avg'].rank(ascending=False)
        rank_df['Rank_Mean'] = rank_df['Mean_Avg'].rank(ascending=False)
        rank_df = rank_df.sort_values('Rank_Max')
        log("    Model Rankings:")
        for idx, row in rank_df.iterrows():
            log(f"      {row['Model']:<20}: Rank Max={int(row['Rank_Max'])} ({row['Max_Avg']:.4f}) | Rank Mean={int(row['Rank_Mean'])} ({row['Mean_Avg']:.4f})")

log("\n=== 2. MAX vs MEAN: Language Ranking Consistency (per model) ===")
for exp in exp_patterns:
    models_present = list(data[exp].keys())
    if not models_present:
        continue
    
    rhos, taus = [], []
    log(f"\nExperiment: {exp}")
    for m in sorted(models_present):
        df = data[exp][m]['df']
        max_c = data[exp][m]['max_col']
        mean_c = data[exp][m]['mean_col']
        df_no_eng = df[df['code'] != 'eng_Latn']
        
        rho, _ = spearmanr(df_no_eng[max_c], df_no_eng[mean_c])
        tau, _ = kendalltau(df_no_eng[max_c], df_no_eng[mean_c])
        rhos.append(rho)
        taus.append(tau)
        
    log(f"  Average Spearman Rho across {len(models_present)} models: {np.mean(rhos):.4f} (Min={np.min(rhos):.4f}, Max={np.max(rhos):.4f})")
    log(f"  Average Kendall Tau across {len(models_present)} models:  {np.mean(taus):.4f} (Min={np.min(taus):.4f}, Max={np.max(taus):.4f})")


# 2. SUBSET VS FULL ANALYSIS
log("\n=== 3. SUBSET vs FULL: Language Ranking Consistency ===")

# Comparison A: Flores Table 1 100 vs Flores Table 1 2000
overlap_models = set(data['flores_table1_100'].keys()).intersection(set(data['flores_table1_2000'].keys()))
log(f"\nComparing Flores Table 1 (100 sentences) vs (2000 sentences) - {len(overlap_models)} overlapping models:")

model_types = {"all": overlap_models, "decoder": [m for m in overlap_models if get_model_type(m) == "decoder"], "encoder": [m for m in overlap_models if get_model_type(m) == "encoder"]}

for mtype, m_set in model_types.items():
    if not m_set:
        continue
    log(f"  {mtype.capitalize()} models:")
    rhos_max, rhos_mean = [], []
    taus_max, taus_mean = [], []
    for m in sorted(m_set):
        df100 = data['flores_table1_100'][m]['df']
        df2000 = data['flores_table1_2000'][m]['df']
        
        max_c100 = data['flores_table1_100'][m]['max_col']
        max_c2000 = data['flores_table1_2000'][m]['max_col']
        mean_c100 = data['flores_table1_100'][m]['mean_col']
        mean_c2000 = data['flores_table1_2000'][m]['mean_col']
        
        merged = pd.merge(df100, df2000, on='code', suffixes=('_100', '_2000'))
        merged = merged[merged['code'] != 'eng_Latn']
        
        rho_max, _ = spearmanr(merged[max_c100 + '_100'], merged[max_c2000 + '_2000'])
        rho_mean, _ = spearmanr(merged[mean_c100 + '_100'], merged[mean_c2000 + '_2000'])
        tau_max, _ = kendalltau(merged[max_c100 + '_100'], merged[max_c2000 + '_2000'])
        tau_mean, _ = kendalltau(merged[mean_c100 + '_100'], merged[mean_c2000 + '_2000'])
        
        rhos_max.append(rho_max)
        rhos_mean.append(rho_mean)
        taus_max.append(tau_max)
        taus_mean.append(tau_mean)
        
    log(f"    Max metric  - Avg Rho: {np.mean(rhos_max):.4f} (Min={np.min(rhos_max):.4f}, Max={np.max(rhos_max):.4f}) | Avg Tau: {np.mean(taus_max):.4f}")
    log(f"    Mean metric - Avg Rho: {np.mean(rhos_mean):.4f} (Min={np.min(rhos_mean):.4f}, Max={np.max(rhos_mean):.4f}) | Avg Tau: {np.mean(taus_mean):.4f}")

log(f"\nModel Ranking consistency for Flores Table 1 (100 vs 2000 sents):")
m_list = sorted(list(overlap_models))
for metric in ['max', 'mean']:
    scores_100 = []
    scores_2000 = []
    for m in m_list:
        df100 = data['flores_table1_100'][m]['df']
        df2000 = data['flores_table1_2000'][m]['df']
        col_100 = data['flores_table1_100'][m][f'{metric}_col']
        col_2000 = data['flores_table1_2000'][m][f'{metric}_col']
        scores_100.append(df100[df100['code'] != 'eng_Latn'][col_100].mean())
        scores_2000.append(df2000[df2000['code'] != 'eng_Latn'][col_2000].mean())
        
    rho, _ = spearmanr(scores_100, scores_2000)
    tau, _ = kendalltau(scores_100, scores_2000)
    log(f"  Metric {metric.upper()}: Spearman Rho={rho:.4f}, Kendall Tau={tau:.4f}")

# Comparison B: Flores Table 1 2000 vs FLORES Full
overlap_models = set(data['flores_table1_2000'].keys()).intersection(set(data['full_flores'].keys()))
log(f"\nComparing Flores Table 1 (116 langs) vs Flores Full (204 langs) - 2000 sents - {len(overlap_models)} overlapping models:")
for m in sorted(overlap_models):
    df_sub = data['flores_table1_2000'][m]['df']
    df_full = data['full_flores'][m]['df']
    
    max_sub = data['flores_table1_2000'][m]['max_col']
    max_full = data['full_flores'][m]['max_col']
    mean_sub = data['flores_table1_2000'][m]['mean_col']
    mean_full = data['full_flores'][m]['mean_col']
    
    merged = pd.merge(df_sub, df_full, on='code', suffixes=('_sub', '_full'))
    merged = merged[merged['code'] != 'eng_Latn']
    
    rho_max, _ = spearmanr(merged[max_sub + '_sub'], merged[max_full + '_full'])
    rho_mean, _ = spearmanr(merged[mean_sub + '_sub'], merged[mean_full + '_full'])
    log(f"  {m:<20}: Max Rho={rho_max:.4f} | Mean Rho={rho_mean:.4f}")

# Comparison C: Bible Table 1 vs Bible Full
overlap_models = set(data['bible_table1'].keys()).intersection(set(data['bible'].keys()))
log(f"\nComparing Bible Table 1 (101 langs) vs Bible Full (1401 langs) - {len(overlap_models)} overlapping models:")
rhos_max, rhos_mean = [], []
for m in sorted(overlap_models):
    df_sub = data['bible_table1'][m]['df']
    df_full = data['bible'][m]['df']
    
    max_sub = data['bible_table1'][m]['max_col']
    max_full = data['bible'][m]['max_col']
    mean_sub = data['bible_table1'][m]['mean_col']
    mean_full = data['bible'][m]['mean_col']
    
    merged = pd.merge(df_sub, df_full, on='code', suffixes=('_sub', '_full'))
    merged = merged[merged['code'] != 'eng_Latn']
    
    rho_max, _ = spearmanr(merged[max_sub + '_sub'], merged[max_full + '_full'])
    rho_mean, _ = spearmanr(merged[mean_sub + '_sub'], merged[mean_full + '_full'])
    rhos_max.append(rho_max)
    rhos_mean.append(rho_mean)
    log(f"  {m:<20}: Max Rho={rho_max:.4f} | Mean Rho={rho_mean:.4f}")
log(f"  Average over all models: Max Rho={np.mean(rhos_max):.4f}, Mean Rho={np.mean(rhos_mean):.4f}")


# 3. FLORES VS BIBLE ANALYSIS
log("\n=== 4. FLORES vs BIBLE ===")

overlap_models = set(data['flores_table1_100'].keys()).intersection(set(data['bible_table1'].keys()))
log(f"\nComparing Flores Table 1 vs Bible Table 1 - {len(overlap_models)} overlapping models:")

scores_flores_max = []
scores_flores_mean = []
scores_bible_max = []
scores_bible_mean = []
m_list = sorted(list(overlap_models))

for m in m_list:
    df_f = data['flores_table1_100'][m]['df']
    df_b = data['bible_table1'][m]['df']
    
    col_f_max = data['flores_table1_100'][m]['max_col']
    col_f_mean = data['flores_table1_100'][m]['mean_col']
    col_b_max = data['bible_table1'][m]['max_col']
    col_b_mean = data['bible_table1'][m]['mean_col']
    
    scores_flores_max.append(df_f[df_f['code'] != 'eng_Latn'][col_f_max].mean())
    scores_flores_mean.append(df_f[df_f['code'] != 'eng_Latn'][col_f_mean].mean())
    scores_bible_max.append(df_b[df_b['code'] != 'eng_Latn'][col_b_max].mean())
    scores_bible_mean.append(df_b[df_b['code'] != 'eng_Latn'][col_b_mean].mean())

rho_max, _ = spearmanr(scores_flores_max, scores_bible_max)
rho_mean, _ = spearmanr(scores_flores_mean, scores_bible_mean)
log(f"  Model Ranking correlation between Flores Table 1 and Bible Table 1:")
log(f"    Max metric:  Spearman Rho = {rho_max:.4f}")
log(f"    Mean metric: Spearman Rho = {rho_mean:.4f}")

log(f"\nLanguage ranking correlation per model (overlapping languages):")
rhos_max, rhos_mean = [], []
for m in m_list:
    df_f = data['flores_table1_100'][m]['df']
    df_b = data['bible_table1'][m]['df']
    
    col_f_max = data['flores_table1_100'][m]['max_col']
    col_f_mean = data['flores_table1_100'][m]['mean_col']
    col_b_max = data['bible_table1'][m]['max_col']
    col_b_mean = data['bible_table1'][m]['mean_col']
    
    merged = pd.merge(df_f, df_b, on='code', suffixes=('_f', '_b'))
    merged = merged[merged['code'] != 'eng_Latn']
    
    rho_max, _ = spearmanr(merged[col_f_max + '_f'], merged[col_b_max + '_b'])
    rho_mean, _ = spearmanr(merged[col_f_mean + '_f'], merged[col_b_mean + '_b'])
    
    rhos_max.append(rho_max)
    rhos_mean.append(rho_mean)
    log(f"  {m:<20}: Overlap Langs={len(merged)} | Max Rho={rho_max:.4f} | Mean Rho={rho_mean:.4f}")
    
log(f"  Average across all models: Max Rho={np.mean(rhos_max):.4f}, Mean Rho={np.mean(rhos_mean):.4f}")

# Write to file
with open("/Users/wassim/MEXA-fork/scratch/analysis_results.txt", "w") as out_f:
    out_f.write("\n".join(output))
