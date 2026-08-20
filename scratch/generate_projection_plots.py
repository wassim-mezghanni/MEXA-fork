import os
import json
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
figures_dir = os.path.join(base_dir, "tum-thesis-latex-master/figures")
os.makedirs(figures_dir, exist_ok=True)

output_pdf = os.path.join(figures_dir, "fig_embedding_projections.pdf")
output_png = os.path.join(figures_dir, "fig_embedding_projections.png")

# Load Llama 3.1 8B projections
proj_path = os.path.join(public_dir, "projections_flores_table1_llama3.1_8b.json")
with open(proj_path) as f:
    data = json.load(f)

# Helper to identify script category from language code
def get_script_category(code):
    script_part = code.split('_')[-1]
    if script_part == 'Latn':
        return 'Latin'
    elif script_part == 'Arab':
        return 'Arabic'
    elif script_part == 'Cyrl':
        return 'Cyrillic'
    elif script_part == 'Deva':
        return 'Devanagari'
    elif script_part == 'Ethi':
        return 'Ethiopic'
    else:
        return 'Other Scripts'

# Grouping colors and markers
colors = {
    'Latin': '#1f77b4',
    'Arabic': '#ff7f0e',
    'Cyrillic': '#2ca02c',
    'Devanagari': '#d62728',
    'Ethiopic': '#9467bd',
    'Other Scripts': '#7f7f7f'
}

markers = {
    'Latin': 'o',        # Circle
    'Arabic': 's',       # Square
    'Cyrillic': '^',     # Triangle up
    'Devanagari': 'D',   # Diamond
    'Ethiopic': 'v',     # Triangle down
    'Other Scripts': 'X' # Filled X
}

layers_to_plot = ['0', '16', '32']
titles = {
    '0': "Layer 0 (Segregated by Language)",
    '16': "Layer 16 (Aligned Shared Semantics)",
    '32': "Layer 32 (Segregated by Vocabulary)"
}

fig, axes = plt.subplots(1, 3, figsize=(12, 4.2), dpi=300, sharex=False, sharey=False)

for i, l_key in enumerate(layers_to_plot):
    ax = axes[i]
    layer_points = data['layers'][l_key]['points']
    
    # Store points grouped by script for legend plotting
    points_by_script = {s: [] for s in colors.keys()}
    
    for code, pt in layer_points.items():
        script = get_script_category(code)
        coords = pt['tsne'] # using 2D t-SNE coordinates
        points_by_script[script].append(coords)
        
    for script, coords_list in points_by_script.items():
        if len(coords_list) > 0:
            arr = np.array(coords_list)
            ax.scatter(
                arr[:, 0], 
                arr[:, 1], 
                color=colors[script], 
                marker=markers[script], 
                label=script, 
                s=25, 
                alpha=0.85, 
                edgecolors='white', 
                linewidths=0.4
            )
            
    ax.set_title(titles[l_key], fontsize=10, fontweight='bold')
    ax.set_xticks([])
    ax.set_yticks([])
    ax.grid(False)

# Add single legend below subplots with larger marker scale for clear visibility
handles, labels = axes[0].get_legend_handles_labels()
fig.legend(
    handles, 
    labels, 
    loc='lower center', 
    ncol=6, 
    bbox_to_anchor=(0.5, -0.05), 
    fontsize=9, 
    frameon=True,
    markerscale=1.4,
    scatterpoints=1
)

plt.tight_layout()
plt.savefig(output_pdf, format='pdf', bbox_inches='tight')
plt.savefig(output_png, format='png', bbox_inches='tight')
plt.close()

print("Embedding projections plot generated successfully!")
