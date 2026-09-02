import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.lines import Line2D

# Academic publication style
plt.style.use('seaborn-v0_8-paper' if 'seaborn-v0_8-paper' in plt.style.available else 'default')
mpl.rcParams['font.family'] = 'sans-serif'
mpl.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Helvetica', 'Arial']
mpl.rcParams['axes.edgecolor'] = '#333333'
mpl.rcParams['axes.linewidth'] = 0.9
mpl.rcParams['grid.color'] = '#e2e8f0'
mpl.rcParams['grid.linestyle'] = '--'
mpl.rcParams['grid.alpha'] = 0.7

base_dir = "/Users/wassim/MEXA-fork"
public_dir = os.path.join(base_dir, "dashboard/public/data")

output_dirs = [
    os.path.join(base_dir, "Presentation Evaluating multilingual LLM performance with cross-lingual alignment Thesis/figures"),
    os.path.join(base_dir, "tum-thesis-latex-master/figures")
]

def get_scores(model_key):
    f = os.path.join(public_dir, f"flores_table1_100_{model_key}_results.csv")
    df = pd.read_csv(f)
    max_col = [c for c in df.columns if c.endswith("_max")][0]
    mean_col = [c for c in df.columns if c.endswith("_mean")][0]
    return df[max_col].mean(), df[mean_col].mean()

qwen3_models = [
    {"name": "3 0.6B", "params": 0.6, "key": "qwen3_0.6b"},
    {"name": "3 1.7B", "params": 1.7, "key": "qwen3_1.7b"},
    {"name": "3 4B",   "params": 4.0, "key": "qwen3_4b"},
    {"name": "3 8B",   "params": 8.0, "key": "qwen3_8b"},
]

qwen3_emb_models = [
    {"name": "Emb 0.6B", "params": 0.6, "key": "qwen3_emb_0.6b"},
    {"name": "Emb 4B",   "params": 4.0, "key": "qwen3_emb_4b"},
    {"name": "Emb 8B",   "params": 8.0, "key": "qwen3_emb_8b"},
]

qwen35_model = {"name": "3.5 9B", "params": 9.0, "key": "qwen3.5_9b"}

# Extract data
q3_x = [m["params"] for m in qwen3_models]
q3_max = [get_scores(m["key"])[0] for m in qwen3_models]
q3_mean = [get_scores(m["key"])[1] for m in qwen3_models]

emb_x = [m["params"] for m in qwen3_emb_models]
emb_max = [get_scores(m["key"])[0] for m in qwen3_emb_models]
emb_mean = [get_scores(m["key"])[1] for m in qwen3_emb_models]

q35_x = [qwen35_model["params"]]
q35_max = [get_scores(qwen35_model["key"])[0]]
q35_mean = [get_scores(qwen35_model["key"])[1]]

fig, ax = plt.subplots(figsize=(8.4, 5.2), dpi=300)

# Colors
c_q3 = "#1f77b4"      # Blue for Qwen 3 Base
c_emb = "#d62728"     # Red for Qwen Embedding
c_q35 = "#7e22ce"     # Distinct Royal Purple for Qwen 3.5

# 1. Qwen 3 Base Decoders (Line connecting 0.6B -> 8B)
ax.plot(q3_x, q3_max, marker='o', markersize=7.5, linewidth=2.4, 
        color=c_q3, zorder=4)
ax.plot(q3_x, q3_mean, marker='o', markersize=6.5, linewidth=2.0, linestyle='--', 
        color=c_q3, zorder=4)

# 2. Qwen 3 Embedding Models (Line connecting 0.6B -> 8B)
ax.plot(emb_x, emb_max, marker='s', markersize=7.5, linewidth=2.4, 
        color=c_emb, zorder=4)
ax.plot(emb_x, emb_mean, marker='s', markersize=6.5, linewidth=2.0, linestyle='--', 
        color=c_emb, zorder=4)

# 3. Qwen 3.5 9B (Standalone point with its own distinct color & marker)
ax.scatter(q35_x, q35_max, marker='D', s=90, color=c_q35, edgecolor='#3b0764', linewidth=1.2, zorder=5)
ax.scatter(q35_x, q35_mean, marker='D', s=80, facecolors='#f3e8ff', edgecolors=c_q35, linewidth=1.8, zorder=5)

# Annotations
# Qwen 3 Base labels
for i, m in enumerate(qwen3_models):
    offset = (0, 8)
    if m["params"] == 0.6:
        offset = (-6, 8)
    ax.annotate(m["name"], (q3_x[i], q3_max[i]), xytext=offset, textcoords='offset points',
                ha='center', va='bottom', fontsize=9.5, fontweight='bold', color='#1e293b')

# Qwen 3 Emb labels
for i, m in enumerate(qwen3_emb_models):
    ax.annotate(m["name"], (emb_x[i], emb_max[i]), xytext=(0, 8), textcoords='offset points',
                ha='center', va='bottom', fontsize=9.5, fontweight='bold', color='#1e293b')

# Qwen 3.5 9B label
ax.annotate(qwen35_model["name"], (q35_x[0], q35_max[0]), xytext=(0, 8), textcoords='offset points',
            ha='center', va='bottom', fontsize=10, fontweight='bold', color=c_q35)

# Axis Styling
ax.set_title("Parameter Scaling of Cross-Lingual Alignment in Qwen Family", fontsize=13, fontweight='bold', pad=14)
ax.set_xlabel("Model Parameters (Billions)", fontsize=11.5, fontweight='bold', labelpad=8)
ax.set_ylabel("MEXA Alignment Score", fontsize=11.5, fontweight='bold', labelpad=8)

all_ticks = [0.6, 1.7, 4.0, 8.0, 9.0]
ax.set_xticks(all_ticks)
ax.set_xticklabels(["0.6B", "1.7B", "4B", "8B", "9B"], fontsize=10.5, fontweight='bold')
ax.set_xticks([1.0, 2.0, 3.0, 5.0, 6.0, 7.0], minor=True)

ax.set_xlim(0.2, 9.6)
ax.set_ylim(0.08, 0.93)
ax.grid(True, which='major', axis='both')
ax.grid(True, which='minor', axis='x', linestyle=':', alpha=0.4)

# Explicit Custom Legend Handles for complete visual fidelity
legend_elements = [
    Line2D([0], [0], color=c_q3, marker='o', markersize=6.5, lw=2.2, label=r"Qwen 3 Base ($\mu_{\mathrm{Max}}$)"),
    Line2D([0], [0], color=c_emb, marker='s', markersize=6.5, lw=2.2, label=r"Qwen 3 Emb ($\mu_{\mathrm{Max}}$)"),
    Line2D([0], [0], marker='D', color='w', markerfacecolor=c_q35, markeredgecolor='#3b0764', markersize=7.5, label=r"Qwen 3.5 9B ($\mu_{\mathrm{Max}}$)"),
    Line2D([0], [0], color=c_q3, marker='o', markersize=6.0, lw=1.8, linestyle='--', label=r"Qwen 3 Base ($\mu_{\mathrm{Mean}}$)"),
    Line2D([0], [0], color=c_emb, marker='s', markersize=6.0, lw=1.8, linestyle='--', label=r"Qwen 3 Emb ($\mu_{\mathrm{Mean}}$)"),
    Line2D([0], [0], marker='D', color='w', markerfacecolor='#f3e8ff', markeredgecolor=c_q35, markeredgewidth=1.6, markersize=7.0, label=r"Qwen 3.5 9B ($\mu_{\mathrm{Mean}}$)"),
]

legend = ax.legend(handles=legend_elements, loc='lower right', fontsize=8.5, frameon=True, 
                   facecolor='white', framealpha=0.96, edgecolor='#cbd5e1', ncol=2)
legend.get_frame().set_linewidth(0.8)

plt.tight_layout()

for out_dir in output_dirs:
    os.makedirs(out_dir, exist_ok=True)
    pdf_path = os.path.join(out_dir, "fig_parameter_scaling.pdf")
    png_path = os.path.join(out_dir, "fig_parameter_scaling.png")
    plt.savefig(pdf_path, format='pdf', bbox_inches='tight')
    plt.savefig(png_path, format='png', bbox_inches='tight', dpi=300)
    print(f"Saved: {pdf_path} and {png_path}")

plt.close()
