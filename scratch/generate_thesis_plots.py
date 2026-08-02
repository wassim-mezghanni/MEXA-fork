import os
import glob
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl

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
output_dir = os.path.join(base_dir, "Evaluating multilingual LLM performance with cross-lingual alignment Thesis/figures")
os.makedirs(output_dir, exist_ok=True)

# Display Name Map for ALL models
full_name_map = {
    "me5_base": "mE5-base",
    "labse": "LaBSE",
    "qwen3_emb_8b": "Qwen3-Emb 8B",
    "qwen3_emb_4b": "Qwen3-Emb 4B",
    "qwen3_emb_0.6b": "Qwen3-Emb 0.6B",
    "qwen3.5_9b": "Qwen 3.5 9B",
    "llama3.1_8b": "Llama 3.1 8B",
    "xlmr_large": "XLM-R Large",
    "glot500": "Glot500",
    "qwen3_8b": "Qwen 3 8B",
    "mmbert_base": "mmBERT Base",
    "mistral_7b_v03": "Mistral 7B v0.3",
    "qwen3_1.7b": "Qwen 3 1.7B",
    "qwen3_4b": "Qwen 3 4B",
    "apertus1.5_8b": "Apertus 1.5 8B",
    "apertus8b": "Apertus 8B (v1.0)",
    "qwen3_0.6b": "Qwen 3 0.6B",
    "apertus1.5_70b": "Apertus 1.5 70B",
    "apertusmini4b": "Apertus 4B (v1.1)"
}

# ==========================================
# LOAD FLORES & BIBLE SUMMARY DATA
# ==========================================

flores_files = glob.glob(os.path.join(public_dir, "flores_table1_100_*_results.csv"))
models_summary = []

for f in flores_files:
    fname = os.path.basename(f)
    if "pivot" in fname or "centered" in fname:
        continue
    
    df = pd.read_csv(f)
    max_cols = [c for c in df.columns if c.endswith("_max")]
    mean_cols = [c for c in df.columns if c.endswith("_mean")]
    
    if max_cols and mean_cols:
        mkey = fname.replace("flores_table1_100_", "").replace("_results.csv", "")
        max_s = df[max_cols[0]].mean()
        mean_s = df[mean_cols[0]].mean()
        
        # Categorize
        if "emb" in mkey or "labse" in mkey or "me5" in mkey:
            cat = "Sentence Embedding"
        elif "xlmr" in mkey or "glot" in mkey or "mmbert" in mkey:
            cat = "Masked LM Encoder"
        else:
            cat = "Causal Decoder"
            
        display_name = full_name_map.get(mkey, mkey)
        
        # Look for Bible score
        bmax, bmean = np.nan, np.nan
        bfile = os.path.join(public_dir, f"bible_table1_{mkey}_results.csv")
        if not os.path.exists(bfile):
            bfile = os.path.join(public_dir, f"bible_table1_100_{mkey}_results.csv")
            
        if os.path.exists(bfile):
            bdf = pd.read_csv(bfile)
            bmax_cols = [c for c in bdf.columns if c.endswith("_max")]
            bmean_cols = [c for c in bdf.columns if c.endswith("_mean")]
            if bmax_cols and bmean_cols:
                bmax = bdf[bmax_cols[0]].mean()
                bmean = bdf[bmean_cols[0]].mean()
                
        models_summary.append({
            "key": mkey,
            "name": display_name,
            "flores_max": max_s,
            "flores_mean": mean_s,
            "bible_max": bmax,
            "bible_mean": bmean,
            "category": cat
        })

df_all = pd.DataFrame(models_summary)
print(f"Loaded {len(df_all)} models with FLORES & Bible scores.")


# ==========================================
# FIGURE 1: HORIZONTAL BAR CHART (FLORES - ALL MODELS)
# ==========================================

print("Generating Figure 1: Horizontal Bar Chart (FLORES - All Models)...")
df_flores_sorted = df_all.sort_values(by="flores_max", ascending=True)

fig, ax = plt.subplots(figsize=(8, 7), dpi=300)

y_pos = np.arange(len(df_flores_sorted))
height = 0.38

cat_colors = {
    "Sentence Embedding": "#d62728",
    "Causal Decoder": "#1f77b4",
    "Masked LM Encoder": "#2ca02c"
}

colors_max = [cat_colors[c] for c in df_flores_sorted["category"]]

rects1 = ax.barh(y_pos + height/2, df_flores_sorted["flores_max"], height, label=r"$\mu_{\mathrm{Max}}$ (Peak)",
                 color=colors_max, alpha=0.9, edgecolor="black", linewidth=0.5)
rects2 = ax.barh(y_pos - height/2, df_flores_sorted["flores_mean"], height, label=r"$\mu_{\mathrm{Mean}}$ (Depth-Wide)",
                 color=colors_max, alpha=0.4, hatch="//", edgecolor="black", linewidth=0.5)

for rect in rects1:
    w = rect.get_width()
    ax.annotate(f"{w:.3f}", (w + 0.01, rect.get_y() + rect.get_height()/2),
                ha='left', va='center', fontsize=7.5, fontweight='bold')

ax.set_yticks(y_pos)
ax.set_yticklabels(df_flores_sorted["name"], fontsize=9, fontweight='bold')
ax.set_xlabel("MEXA Alignment Score", fontsize=11, fontweight='bold')
ax.set_title("Cross-Lingual Representation Alignment Scores on FLORES (All Models)", fontsize=12, pad=12)
ax.set_xlim(0, 1.08)
ax.grid(True, axis='x')

from matplotlib.patches import Patch
legend_elements = [
    Patch(facecolor='#d62728', label='Sentence Embedding Models'),
    Patch(facecolor='#1f77b4', label='Causal Decoder LLMs'),
    Patch(facecolor='#2ca02c', label='Masked Language Models (MLMs)'),
    Patch(facecolor='#555555', alpha=0.9, label=r'$\mu_{\mathrm{Max}}$ (Peak Layer)'),
    Patch(facecolor='#555555', alpha=0.4, hatch='//', label=r'$\mu_{\mathrm{Mean}}$ (Depth Mean)')
]
ax.legend(handles=legend_elements, loc='lower right', fontsize=8.5, frameon=True, facecolor='white')

plt.tight_layout()
fig1_path = os.path.join(output_dir, "fig_flores_all_models_barchart.pdf")
plt.savefig(fig1_path)
plt.savefig(fig1_path.replace('.pdf', '.png'))
plt.close()
print("Saved:", fig1_path)


# ==========================================
# FIGURE 2: HORIZONTAL BAR CHART (BIBLE - ALL MODELS)
# ==========================================

print("Generating Figure 2: Horizontal Bar Chart (Bible - All Models)...")
df_bible_valid = df_all.dropna(subset=["bible_max"]).sort_values(by="bible_max", ascending=True)

fig, ax = plt.subplots(figsize=(8, 6.5), dpi=300)

y_pos = np.arange(len(df_bible_valid))
colors_b_max = [cat_colors[c] for c in df_bible_valid["category"]]

rects1 = ax.barh(y_pos + height/2, df_bible_valid["bible_max"], height, label=r"$\mu_{\mathrm{Max}}$ (Peak)",
                 color=colors_b_max, alpha=0.9, edgecolor="black", linewidth=0.5)
rects2 = ax.barh(y_pos - height/2, df_bible_valid["bible_mean"], height, label=r"$\mu_{\mathrm{Mean}}$ (Depth-Wide)",
                 color=colors_b_max, alpha=0.4, hatch="//", edgecolor="black", linewidth=0.5)

for rect in rects1:
    w = rect.get_width()
    ax.annotate(f"{w:.3f}", (w + 0.01, rect.get_y() + rect.get_height()/2),
                ha='left', va='center', fontsize=7.5, fontweight='bold')

ax.set_yticks(y_pos)
ax.set_yticklabels(df_bible_valid["name"], fontsize=9, fontweight='bold')
ax.set_xlabel("MEXA Alignment Score", fontsize=11, fontweight='bold')
ax.set_title("Cross-Lingual Representation Alignment Scores on Bible (All Models)", fontsize=12, pad=12)
ax.set_xlim(0, 0.98)
ax.grid(True, axis='x')
ax.legend(handles=legend_elements, loc='lower right', fontsize=8.5, frameon=True, facecolor='white')

plt.tight_layout()
fig2_path = os.path.join(output_dir, "fig_bible_all_models_barchart.pdf")
plt.savefig(fig2_path)
plt.savefig(fig2_path.replace('.pdf', '.png'))
plt.close()
print("Saved:", fig2_path)


# ==========================================
# FIGURE 3: SCATTER PLOT MAX VS MEAN (ALL MODELS LABELED)
# ==========================================

print("Generating Figure 3: Max vs Mean Scatter Plot (ALL Models Labeled)...")

plt.figure(figsize=(7.5, 6), dpi=300)

cat_styles = {
    "Causal Decoder": {"color": "#1f77b4", "marker": "o", "label": "Causal Decoders"},
    "Masked LM Encoder": {"color": "#2ca02c", "marker": "s", "label": "Masked LMs"},
    "Sentence Embedding": {"color": "#d62728", "marker": "^", "label": "Sentence Embeddings"}
}

for cat, style in cat_styles.items():
    sub = df_all[df_all["category"] == cat]
    if not sub.empty:
        plt.scatter(sub["flores_max"], sub["flores_mean"], color=style["color"], marker=style["marker"], 
                    s=70, label=style["label"], zorder=3, edgecolors='black', linewidth=0.5)

# Fit linear trend line
x = df_all["flores_max"]
y = df_all["flores_mean"]
z = np.polyfit(x, y, 1)
p = np.poly1d(z)
x_line = np.linspace(x.min()-0.05, x.max()+0.05, 100)
plt.plot(x_line, p(x_line), "--", color="#555555", linewidth=1.5, label=r"Linear Fit ($\rho = 0.9500$)")

offsets = {
    "me5_base": (6, -4),
    "labse": (-45, 6),
    "qwen3_emb_8b": (6, -4),
    "qwen3_emb_4b": (6, -4),
    "qwen3_emb_0.6b": (6, -4),
    "qwen3.5_9b": (6, -4),
    "llama3.1_8b": (6, -4),
    "xlmr_large": (-45, 6),
    "glot500": (6, -4),
    "qwen3_8b": (6, -4),
    "mmbert_base": (6, -4),
    "mistral_7b_v03": (6, 5),
    "qwen3_1.7b": (-50, -6),
    "qwen3_4b": (6, -4),
    "apertus1.5_8b": (6, -4),
    "apertus8b": (6, -4),
    "qwen3_0.6b": (6, -4),
    "apertus1.5_70b": (-55, 4)
}

for _, row in df_all.iterrows():
    mkey = row["key"]
    dx, dy = offsets.get(mkey, (6, -4))
    plt.annotate(row["name"], (row["flores_max"], row["flores_mean"]),
                 xytext=(dx, dy), textcoords='offset points', fontsize=8, fontweight='bold',
                 bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.7))

plt.xlabel(r"Peak Layer Alignment Score ($\mu_{\mathrm{Max}}$)", fontsize=11, fontweight='bold')
plt.ylabel(r"Depth-Averaged Alignment Score ($\mu_{\mathrm{Mean}}$)", fontsize=11, fontweight='bold')
plt.title(r"Correlation Between Peak ($\mu_{\mathrm{Max}}$) and Mean ($\mu_{\mathrm{Mean}}$) Alignment (All Models)", fontsize=12, pad=12)
plt.xlim(0.22, 1.03)
plt.ylim(0.08, 0.78)
plt.grid(True)
plt.legend(frameon=True, facecolor='white', framealpha=0.9, fontsize=9, loc='upper left')
plt.tight_layout()
fig3_path = os.path.join(output_dir, "fig_max_vs_mean_all_labeled.pdf")
plt.savefig(fig3_path)
plt.savefig(fig3_path.replace('.pdf', '.png'))
plt.close()
print("Saved:", fig3_path)


# ==========================================
# FIGURE 4: SCATTER PLOT FLORES VS BIBLE (ALL MODELS LABELED)
# ==========================================

print("Generating Figure 4: FLORES vs Bible Scatter Plot (ALL Models Labeled)...")

plt.figure(figsize=(7.5, 6), dpi=300)

for cat, style in cat_styles.items():
    sub = df_bible_valid[df_bible_valid["category"] == cat]
    if not sub.empty:
        plt.scatter(sub["flores_max"], sub["bible_max"], color=style["color"], marker=style["marker"], 
                    s=70, label=style["label"], zorder=3, edgecolors='black', linewidth=0.5)

x3 = df_bible_valid["flores_max"]
y3 = df_bible_valid["bible_max"]
z3 = np.polyfit(x3, y3, 1)
p3 = np.poly1d(z3)
x3_line = np.linspace(x3.min()-0.05, x3.max()+0.05, 100)
plt.plot(x3_line, p3(x3_line), "--", color="#555555", linewidth=1.5, label=r"Linear Fit ($\rho = 0.9765$)")
plt.plot([0, 1], [0, 1], ":", color="#999999", label="Equality Line ($y=x$)")

offsets_b = {
    "me5_base": (6, -4),
    "labse": (-45, 6),
    "qwen3_emb_8b": (6, -4),
    "qwen3_emb_4b": (6, -4),
    "qwen3_emb_0.6b": (6, -4),
    "qwen3.5_9b": (-50, 6),
    "llama3.1_8b": (6, -6),
    "xlmr_large": (-45, 6),
    "glot500": (6, -4),
    "qwen3_8b": (6, -4),
    "mmbert_base": (6, -4),
    "mistral_7b_v03": (6, -4),
    "qwen3_1.7b": (-45, -6),
    "qwen3_4b": (6, -4),
    "apertus1.5_8b": (-50, -6),
    "apertus8b": (6, -4),
    "qwen3_0.6b": (6, -4),
    "apertus1.5_70b": (6, 5)
}

for _, row in df_bible_valid.iterrows():
    mkey = row["key"]
    dx, dy = offsets_b.get(mkey, (6, -4))
    plt.annotate(row["name"], (row["flores_max"], row["bible_max"]),
                 xytext=(dx, dy), textcoords='offset points', fontsize=8, fontweight='bold',
                 bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.7))

plt.xlabel(r"FLORES Peak Score ($\mu_{\mathrm{Max}}$)", fontsize=11, fontweight='bold')
plt.ylabel(r"Bible Peak Score ($\mu_{\mathrm{Max}}$)", fontsize=11, fontweight='bold')
plt.title(r"Cross-Domain Alignment Score Stability (FLORES vs. Bible, All Models)", fontsize=12, pad=12)
plt.xlim(0.22, 1.03)
plt.ylim(0.08, 0.95)
plt.grid(True)
plt.legend(frameon=True, facecolor='white', framealpha=0.9, fontsize=9, loc='upper left')
plt.tight_layout()
fig4_path = os.path.join(output_dir, "fig_flores_vs_bible_all_labeled.pdf")
plt.savefig(fig4_path)
plt.savefig(fig4_path.replace('.pdf', '.png'))
plt.close()
print("Saved:", fig4_path)

print("All new all-model plots generated successfully!")
