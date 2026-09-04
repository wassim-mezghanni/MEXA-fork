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
mpl.rcParams['axes.linewidth'] = 1.0
mpl.rcParams['grid.color'] = '#cccccc'
mpl.rcParams['grid.linestyle'] = '--'
mpl.rcParams['grid.alpha'] = 0.5

base_dir = "/Users/wassim/MEXA-fork"
public_dir = os.path.join(base_dir, "dashboard/public/data")
output_dirs = [
    os.path.join(base_dir, "Presentation Evaluating multilingual LLM performance with cross-lingual alignment Thesis/figures"),
    os.path.join(base_dir, "tum-thesis-latex-master/figures")
]

for d in output_dirs:
    os.makedirs(d, exist_ok=True)

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

# Count languages per script
script_counts = {}
for code in data['layers']['0']['points'].keys():
    s = get_script_category(code)
    script_counts[s] = script_counts.get(s, 0) + 1

script_display_names = {
    'Latin': f"Latin ({script_counts.get('Latin', 0)} langs)",
    'Arabic': f"Arabic ({script_counts.get('Arabic', 0)} langs)",
    'Cyrillic': f"Cyrillic ({script_counts.get('Cyrillic', 0)} langs)",
    'Devanagari': f"Devanagari ({script_counts.get('Devanagari', 0)} langs)",
    'Ethiopic': f"Ethiopic ({script_counts.get('Ethiopic', 0)} langs)",
    'Other Scripts': f"Other Scripts ({script_counts.get('Other Scripts', 0)} langs)"
}

layers_to_plot = ['0', '16', '32']
titles = {
    '0': "Layer 0 (Language-Segregated)",
    '16': "Layer 16 (Aligned Shared Semantics)",
    '32': "Layer 32 (Vocabulary-Segregated)"
}

fig, axes = plt.subplots(1, 3, figsize=(13.6, 4.8), dpi=300, sharex=False, sharey=False)

for i, l_key in enumerate(layers_to_plot):
    ax = axes[i]
    layer_points = data['layers'][l_key]['points']
    
    # Store points grouped by script
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
                label=script_display_names[script], 
                s=42, 
                alpha=0.90, 
                edgecolors='white', 
                linewidths=0.6
            )
            
    ax.set_title(titles[l_key], fontsize=13.5, fontweight='bold', pad=10)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.grid(False)

# Add single 3-column legend below the 3 subplot boxes for optimal visibility
handles, labels = axes[0].get_legend_handles_labels()
fig.legend(
    handles, 
    labels, 
    loc='lower center', 
    ncol=3, 
    bbox_to_anchor=(0.5, -0.06), 
    fontsize=13, 
    frameon=True,
    facecolor='white',
    framealpha=0.96,
    edgecolor='#cbd5e1',
    markerscale=1.8,
    scatterpoints=1,
    columnspacing=2.8,
    handletextpad=0.6
)

plt.tight_layout()
plt.subplots_adjust(bottom=0.12)

for d in output_dirs:
    out_pdf = os.path.join(d, "fig_embedding_projections.pdf")
    out_png = os.path.join(d, "fig_embedding_projections.png")
    plt.savefig(out_pdf, format='pdf', bbox_inches='tight')
    plt.savefig(out_png, format='png', bbox_inches='tight', dpi=300)
    print("Saved:", out_pdf)

plt.close()

print("Embedding projections plot with enlarged font size generated successfully!")
