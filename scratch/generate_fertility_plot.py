import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib as mpl
from scipy.stats import pearsonr, spearmanr

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
        label=f"{g} (n={len(subset)})",
        color=colors[g],
        marker=markers[g],
        alpha=0.80,
        edgecolors='none' if markers[g] == 'x' else 'w',
        linewidths=0.5,
        s=38
    )

# Fit log-linear trendline
log_fert = np.log(df['fertility'])
z = np.polyfit(log_fert, df['alignment'], 1)
p = np.poly1d(z)
x_trend = np.geomspace(df['fertility'].min(), df['fertility'].max(), 100)
r_log, _ = pearsonr(log_fert, df['alignment'])
rho_spear, _ = spearmanr(df['fertility'], df['alignment'])

plt.plot(x_trend, p(np.log(x_trend)), color='#222222', linestyle='--', linewidth=1.5, 
         label=f'Log-fit ($r={r_log:.2f}$, $\\rho={rho_spear:.2f}$)')

plt.xscale('log')
plt.xticks([20, 30, 50, 75, 100, 150, 200], ['20', '30', '50', '75', '100', '150', '200'])
plt.title("Tokenizer Fertility vs. MEXA Alignment (FLORES-200)", fontsize=11, fontweight='bold', pad=10)
plt.xlabel("Tokenizer Fertility (tokens / sentence, log scale)", fontsize=9)
plt.ylabel("Cross-Model Average MEXA score ($\mu_{Max}$)", fontsize=9)
plt.grid(True, which='both', linestyle='--', alpha=0.5)
plt.legend(loc='lower left', frameon=True, facecolor='white', edgecolor='#e5e5e5', fontsize=7.5)
plt.tight_layout()

# Save
plt.savefig(output_pdf, format='pdf', bbox_inches='tight')
plt.savefig(output_png, format='png', bbox_inches='tight')
print(f"Log-scale fertility plots generated successfully! r_log={r_log:.4f}, rho={rho_spear:.4f}")

