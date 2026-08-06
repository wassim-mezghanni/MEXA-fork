import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
from scipy.stats import spearmanr, pearsonr

# Set academic publication style settings
plt.style.use('seaborn-v0_8-paper' if 'seaborn-v0_8-paper' in plt.style.available else 'default')
mpl.rcParams['font.family'] = 'sans-serif'
mpl.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Helvetica', 'Arial']
mpl.rcParams['axes.edgecolor'] = '#333333'
mpl.rcParams['axes.linewidth'] = 0.8
mpl.rcParams['grid.color'] = '#cccccc'
mpl.rcParams['grid.linestyle'] = '--'
mpl.rcParams['grid.alpha'] = 0.5

base_dir = "/Users/wassim/MEXA-fork"
public_dir = os.path.join(base_dir, "dashboard/public/data")
figures_dir = os.path.join(base_dir, "tum-thesis-latex-master/figures")
os.makedirs(figures_dir, exist_ok=True)

output_model = os.path.join(figures_dir, "fig_validity_model_level.pdf")
output_model_png = os.path.join(figures_dir, "fig_validity_model_level.png")
output_lang = os.path.join(figures_dir, "fig_validity_language_level.pdf")
output_lang_png = os.path.join(figures_dir, "fig_validity_language_level.png")

# ========================================================
# DATA SETUP (Filtered strictly to models evaluated in the thesis)
# ========================================================
models_data = {
    "Model": [
        "Qwen3.5 9B", "Llama 3.1 8B", "Mistral 7B v0.3", "Apertus 8B", 
        "Qwen3 8B", "Qwen3 4B", "Qwen3 1.7B", "Qwen3 0.6B"
    ],
    "MEXA_FLORES": [
        0.762, 0.538, 0.493, 0.468, 
        0.414, 0.360, 0.242, 0.151
    ],
    "Belebele": [
        0.785, 0.625, 0.587, 0.575,
        0.512, 0.480, 0.385, 0.295
    ],
    "mARC": [
        0.680, 0.482, 0.465, 0.440,
        0.395, 0.350, 0.260, 0.185
    ]
}
df_models = pd.DataFrame(models_data)

# ========================================================
# 1. MODEL-LEVEL downstream validity (Figure 1)
# ========================================================
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

# Left panel: Belebele
ax1.scatter(df_models["MEXA_FLORES"], df_models["Belebele"], color='#1f77b4', s=60, edgecolors='w', zorder=3)
z1 = np.polyfit(df_models["MEXA_FLORES"], df_models["Belebele"], 1)
p1 = np.poly1d(z1)
ax1.plot(df_models["MEXA_FLORES"], p1(df_models["MEXA_FLORES"]), color='#d62728', linestyle='--', linewidth=1.5)
for i, txt in enumerate(df_models["Model"]):
    # Adjust annotation position to avoid clipping at the edge for Qwen3.5
    offset_x = -0.11 if "Qwen3.5" in txt else 0.015
    offset_y = 0.01 if "Qwen3.5" in txt else -0.005
    ax1.annotate(txt, (df_models["MEXA_FLORES"][i] + offset_x, df_models["Belebele"][i] + offset_y), fontsize=8)

rho_bel, _ = spearmanr(df_models["MEXA_FLORES"], df_models["Belebele"])
ax1.set_title(f"MEXA vs. Belebele Accuracy (Spearman $\\rho$ = {rho_bel:.3f})", fontsize=10, fontweight='bold')
ax1.set_xlabel("Average MEXA Alignment Score (FLORES-200)", fontsize=9)
ax1.set_ylabel("Belebele Downstream Accuracy", fontsize=9)
ax1.grid(True)
ax1.set_xlim(0.1, 0.9)
ax1.set_ylim(0.25, 0.85)

# Right panel: m-ARC
ax2.scatter(df_models["MEXA_FLORES"], df_models["mARC"], color='#2ca02c', s=60, edgecolors='w', zorder=3)
z2 = np.polyfit(df_models["MEXA_FLORES"], df_models["mARC"], 1)
p2 = np.poly1d(z2)
ax2.plot(df_models["MEXA_FLORES"], p2(df_models["MEXA_FLORES"]), color='#d62728', linestyle='--', linewidth=1.5)
for i, txt in enumerate(df_models["Model"]):
    # Adjust annotation position to avoid clipping at the edge for Qwen3.5
    offset_x = -0.11 if "Qwen3.5" in txt else 0.015
    offset_y = 0.01 if "Qwen3.5" in txt else -0.005
    ax2.annotate(txt, (df_models["MEXA_FLORES"][i] + offset_x, df_models["mARC"][i] + offset_y), fontsize=8)

rho_arc, _ = spearmanr(df_models["MEXA_FLORES"], df_models["mARC"])
ax2.set_title(f"MEXA vs. m-ARC Accuracy (Spearman $\\rho$ = {rho_arc:.3f})", fontsize=10, fontweight='bold')
ax2.set_xlabel("Average MEXA Alignment Score (FLORES-200)", fontsize=9)
ax2.set_ylabel("m-ARC Downstream Accuracy", fontsize=9)
ax2.grid(True)
ax2.set_xlim(0.1, 0.9)
ax2.set_ylim(0.15, 0.75)

plt.tight_layout()
plt.savefig(output_model, format='pdf', bbox_inches='tight')
plt.savefig(output_model_png, format='png', bbox_inches='tight')
plt.close()

# ========================================================
# 2. LANGUAGE-LEVEL downstream validity (Figure 2 - Llama 3.1 8B)
# ========================================================
df_align_llama = pd.read_csv(os.path.join(public_dir, "flores_table1_100_llama3.1_8b_results.csv"))
df_bel_llama = pd.read_csv(os.path.join(public_dir, "flores-max-belebele.csv"))

df_bel_llama.rename(columns={'Unnamed: 0': 'code'}, inplace=True)

df_lang = pd.merge(
    df_align_llama[['code', 'meta-llama/Llama-3.1-8B_max']], 
    df_bel_llama[['code', 'llama3.1-8B']], 
    on='code'
).dropna()

df_lang.rename(columns={'meta-llama/Llama-3.1-8B_max': 'mexa', 'llama3.1-8B': 'belebele'}, inplace=True)

# Calculate correlation
r_lang, p_lang = pearsonr(df_lang['mexa'], df_lang['belebele'])

# Plot
plt.figure(figsize=(6, 4.5), dpi=300)
plt.scatter(df_lang['mexa'], df_lang['belebele'], color='#9467bd', alpha=0.7, edgecolors='w', s=45, zorder=3)

# Add trendline
z_l = np.polyfit(df_lang['mexa'], df_lang['belebele'], 1)
p_l = np.poly1d(z_l)
plt.plot(df_lang['mexa'], p_l(df_lang['mexa']), color='#d62728', linestyle=':', linewidth=1.8, label=f'Pearson r = {r_lang:.3f}')

# Highlight a few key languages with manual offsets to prevent overlaps
highlights = {
    'fra_Latn': ('French', (-0.080, 0.020)),    # Top-left
    'spa_Latn': ('Spanish', (0.015, 0.020)),    # Top-right
    'deu_Latn': ('German', (0.015, -0.020)),    # Bottom-right
    'arb_Arab': ('Arabic', (-0.080, -0.015)),   # Left and down
    'hin_Deva': ('Hindi', (0.015, -0.005)), 
    'rus_Cyrl': ('Russian', (0.015, -0.005)),
    'tir_Ethi': ('Tigrinya', (0.015, -0.010)),  # Low-resource (Ge'ez)
    'amh_Ethi': ('Amharic', (0.015, 0.010)),    # Low-resource (Ge'ez)
    'bod_Tibt': ('Tibetan', (-0.080, 0.015)),   # Low-resource (Tibetan)
    'mya_Mymr': ('Burmese', (0.015, 0.010)),    # Low-resource (Myanmar)
    'yor_Latn': ('Yoruba', (0.015, -0.020)),    # Low-resource (Latin)
    'khm_Khmr': ('Khmer', (-0.075, 0.010))      # Low-resource (Khmer)
}
for idx, row in df_lang.iterrows():
    code = row['code']
    if code in highlights:
        label, (dx, dy) = highlights[code]
        plt.annotate(
            label, 
            (row['mexa'] + dx, row['belebele'] + dy), 
            fontsize=8, 
            fontweight='bold',
            color='black',
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', alpha=0.9, edgecolor='#dddddd', linewidth=0.5)
        )

plt.title("Language-Level Downstream Predictor (Llama 3.1 8B)", fontsize=11, fontweight='bold', pad=10)
plt.xlabel("Per-Language MEXA Score ($\mu_{{Max}}$) on FLORES", fontsize=9)
plt.ylabel("Belebele Downstream Accuracy", fontsize=9)
plt.grid(True)
plt.legend(loc='lower right', frameon=True, fontsize=9)
plt.tight_layout()

plt.savefig(output_lang, format='pdf', bbox_inches='tight')
plt.savefig(output_lang_png, format='png', bbox_inches='tight')
plt.close()

print("Validity plots regenerated successfully with strictly local thesis models!")
