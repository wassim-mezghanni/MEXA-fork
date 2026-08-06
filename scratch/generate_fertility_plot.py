import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
from scipy.stats import pearsonr

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
csv_path = os.path.join(base_dir, "dashboard/public/data/fertility_flores.csv")
output_pdf = os.path.join(base_dir, "tum-thesis-latex-master/figures/fig_fertility_alignment.pdf")
output_png = os.path.join(base_dir, "tum-thesis-latex-master/figures/fig_fertility_alignment.png")

# Load data
df = pd.read_csv(csv_path)

# Drop missing values
df = df.dropna(subset=['fertility', 'alignment'])

# Compute Pearson correlation
r_val, p_val = pearsonr(df['fertility'], df['alignment'])
print(f"Calculated Pearson correlation: r = {r_val:.4f}, p = {p_val:.2e}")

# Classify scripts into broad groups for coloring
def get_group(script):
    if script == 'Latn':
        return 'Latin'
    elif script == 'Arab':
        return 'Arabic'
    elif script == 'Cyrl':
        return 'Cyrillic'
    elif script in ['Hans', 'Hant']:
        return 'Han'
    elif script == 'Deva':
        return 'Devanagari'
    else:
        return 'Other Scripts'

df['group'] = df['script'].apply(get_group)

# Colors and markers matching academic styles
groups = ['Latin', 'Cyrillic', 'Arabic', 'Han', 'Devanagari', 'Other Scripts']
colors = {
    'Latin': '#1f77b4',       # blue
    'Cyrillic': '#ff7f0e',    # orange
    'Arabic': '#2ca02c',      # green
    'Han': '#d62728',         # red
    'Devanagari': '#9467bd',  # purple
    'Other Scripts': '#7f7f7f' # grey
}
markers = {
    'Latin': 'o',
    'Cyrillic': 's',
    'Arabic': '^',
    'Han': 'D',
    'Devanagari': 'v',
    'Other Scripts': 'x'
}

plt.figure(figsize=(6, 4.5), dpi=300)

for g in groups:
    subset = df[df['group'] == g]
    if len(subset) == 0:
        continue
    plt.scatter(
        subset['fertility'], 
        subset['alignment'],
        label=g,
        color=colors[g],
        marker=markers[g],
        alpha=0.85,
        edgecolors='none' if markers[g] == 'x' else 'w',
        linewidths=0.5,
        s=40
    )

# Fit trendline
z = np.polyfit(df['fertility'], df['alignment'], 1)
p = np.poly1d(z)
x_trend = np.linspace(df['fertility'].min(), df['fertility'].max(), 100)
plt.plot(x_trend, p(x_trend), color='#333333', linestyle=':', linewidth=1.5, label=f'Trendline (r = {r_val:.2f})')

plt.title("Tokenizer Fertility vs. MEXA Alignment (FLORES-200)", fontsize=11, fontweight='bold', pad=10)
plt.xlabel("Tokenizer Fertility (average tokens / sentence)", fontsize=9)
plt.ylabel("Cross-Model Average MEXA score ($\mu_{Max}$)", fontsize=9)
plt.grid(True)
plt.legend(loc='lower left', frameon=True, facecolor='white', edgecolor='#e5e5e5', fontsize=8)
plt.tight_layout()

# Save
plt.savefig(output_pdf, format='pdf', bbox_inches='tight')
plt.savefig(output_png, format='png', bbox_inches='tight')
print("Plots generated successfully!")
