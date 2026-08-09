import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib as mpl

# Set academic publication style settings
plt.style.use('seaborn-v0_8-paper' if 'seaborn-v0_8-paper' in plt.style.available else 'default')
mpl.rcParams['font.family'] = 'sans-serif'
mpl.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Helvetica', 'Arial']

base_dir = "/Users/wassim/MEXA-fork"
output_pdf = os.path.join(base_dir, "tum-thesis-latex-master/figures/fig_tokenization_comparison.pdf")
output_png = os.path.join(base_dir, "tum-thesis-latex-master/figures/fig_tokenization_comparison.png")

# Data from json
tokens_eng = ["We", "now", "have", "4", "-month", "-old", "mice", "that", "are", "non", "-di", "abetic", "..."]
tokens_min_lat = ["K", "ami", "kin", "iko", "pun", "yo", "man", "c", "ik", "ba", "um", "ua", "..."]
tokens_min_ara = ["ك", "امي", "ك", "ين", "يك", "و", "ڤ", "و", "ڽ", "و", "من", "چ", "..."]

rows = [
    {"label": "English (Latin)", "tokens": tokens_eng, "count": 22, "mult": "x1.0x", "color": "#e3f2fd", "text_color": "#0d47a1"},
    {"label": "Minangkabau (Latin)", "tokens": tokens_min_lat, "count": 35, "mult": "x1.6x", "color": "#fff3e0", "text_color": "#e65100"},
    {"label": "Minangkabau (Arabic)", "tokens": tokens_min_ara, "count": 55, "mult": "x2.5x", "color": "#f3e5f5", "text_color": "#4a148c"},
]

# Increased vertical figure size & row spacing so labels don't collide with boxes
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
ax.set_xlim(-1, 19.5)
ax.set_ylim(-0.8, 4.8)
ax.axis('off')
fig.patch.set_facecolor('white')

row_spacing = 1.7  # more vertical room between rows

for i, row in enumerate(reversed(rows)):
    y_center = i * row_spacing
    
    # Label sits well ABOVE the token boxes (increased offset from 0.35 → 0.55)
    ax.text(-0.8, y_center + 0.55, row["label"], fontsize=10.5, fontweight='bold',
            ha='left', va='center', color='#222222')
    
    # Token boxes — thin subtle border + gap for distinct cells
    x_offset = 0.0
    box_width = 1.05
    box_height = 0.50
    gap = 0.12  # visible gap between boxes
    
    for token in row["tokens"]:
        rect = patches.FancyBboxPatch(
            (x_offset, y_center - box_height / 2), box_width - gap, box_height,
            boxstyle="round,pad=0.06",
            linewidth=0.4, edgecolor='#dddddd', facecolor=row["color"]
        )
        ax.add_patch(rect)
        
        ax.text(
            x_offset + (box_width - gap) / 2.0, y_center, token,
            fontsize=9.5, color=row["text_color"], ha='center', va='center',
            fontfamily='DejaVu Sans' if row["label"].endswith("(Arabic)") else 'sans-serif'
        )
        
        x_offset += box_width
    
    # Count stats on right
    stat_text = f"{row['count']} TOKENS"
    ax.text(15.2, y_center, stat_text, fontsize=10, fontweight='bold',
            ha='left', va='center', color='#333333')
    
    # Multiplier pill
    pill = patches.FancyBboxPatch(
        (17.8, y_center - 0.22), 1.2, 0.44,
        boxstyle="round,pad=0.05",
        linewidth=0, edgecolor='none', facecolor='#eeeeee'
    )
    ax.add_patch(pill)
    ax.text(18.4, y_center, row["mult"], fontsize=9.5, fontweight='bold',
            ha='center', va='center', color='#555555')

plt.title("Tokenizer Fragmentation & Fertility Tax Example (Qwen3 Tokenizer)",
          fontsize=12, fontweight='bold', pad=15)
plt.tight_layout()

# Save
plt.savefig(output_pdf, format='pdf', bbox_inches='tight')
plt.savefig(output_png, format='png', bbox_inches='tight')
print("Tokenization diagram generated successfully!")
