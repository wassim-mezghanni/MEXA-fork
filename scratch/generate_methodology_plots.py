import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

base_dir = "/Users/wassim/MEXA-fork"
output_dir = os.path.join(base_dir, "Evaluating multilingual LLM performance with cross-lingual alignment Thesis/figures")
os.makedirs(output_dir, exist_ok=True)

plt.style.use('seaborn-v0_8-paper' if 'seaborn-v0_8-paper' in plt.style.available else 'default')

# ==============================================================================
# VISUAL 1: FIGURE 3.1 - MEXA PIPELINE SCHEMATIC DIAGRAM
# ==============================================================================
print("Generating Methodology Figure 3.1: MEXA Pipeline Schematic...")

fig = plt.figure(figsize=(10, 3.8), dpi=300)
ax = fig.add_axes([0, 0.35, 1, 0.6])
ax.axis('off')

# Stage 1: Input & Embeddings
box_style_blue = dict(boxstyle="round,pad=0.5", fc="#e6f0fa", ec="#1f77b4", lw=1.5)
box_style_green = dict(boxstyle="round,pad=0.5", fc="#eaf7ed", ec="#2ca02c", lw=1.5)
box_style_red = dict(boxstyle="round,pad=0.5", fc="#fdeaea", ec="#d62728", lw=1.5)
box_style_purple = dict(boxstyle="round,pad=0.5", fc="#f3eefa", ec="#9467bd", lw=1.5)

ax.text(0.10, 0.6, "Stage 1: Hidden States\n& Weighted Pooling\n$e^{(l)} = \\sum w_t h_t^{(l)}$", 
        ha='center', va='center', fontsize=8.5, fontweight='bold', bbox=box_style_blue)

ax.annotate("", xy=(0.23, 0.6), xytext=(0.18, 0.6),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#333333"))

# Stage 2: Cosine Similarity Matrix
ax.text(0.36, 0.6, "Stage 2: Similarity Matrix\n$C^{(l)} \\in \\mathbb{R}^{n \\times n}$\n$c_{ij} = \\cos(e_i^{L_1}, e_j^{L_2})$", 
        ha='center', va='center', fontsize=8.5, fontweight='bold', bbox=box_style_green)

ax.annotate("", xy=(0.49, 0.6), xytext=(0.44, 0.6),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#333333"))

# Stage 3: Bidirectional Retrieval
ax.text(0.63, 0.6, "Stage 3: Bidirectional P@1\nFilter Match Condition:\n$c_{ii} > \\max(c_{ij}, c_{ji})$", 
        ha='center', va='center', fontsize=8.5, fontweight='bold', bbox=box_style_red)

ax.annotate("", xy=(0.77, 0.6), xytext=(0.72, 0.6),
            arrowprops=dict(arrowstyle="->", lw=1.5, color="#333333"))

# Stage 4: Layer Score & Aggregation
ax.text(0.90, 0.6, "Stage 4: Aggregation\n$\\mu C(l)$ per layer\n$\\mu_{\\mathrm{Max}}$ & $\\mu_{\\mathrm{Mean}}$", 
        ha='center', va='center', fontsize=8.5, fontweight='bold', bbox=box_style_purple)

# Matrix thumbnail
matrix_ax = fig.add_axes([0.31, 0.05, 0.12, 0.32])
matrix_data = np.array([
    [0.92, 0.21, 0.15],
    [0.18, 0.88, 0.25],
    [0.12, 0.22, 0.85]
])
im = matrix_ax.imshow(matrix_data, cmap='Blues', vmin=0, vmax=1)
matrix_ax.set_xticks([0, 1, 2])
matrix_ax.set_yticks([0, 1, 2])
matrix_ax.set_xticklabels(['$p_1$', '$p_2$', '$p_3$'], fontsize=7)
matrix_ax.set_yticklabels(['$s_1$', '$s_2$', '$s_3$'], fontsize=7)
matrix_ax.set_title("Matrix $C^{(l)}$", fontsize=8, fontweight='bold')

rect = patches.Rectangle((-0.4, -0.4), 0.8, 0.8, linewidth=1.5, edgecolor='red', facecolor='none')
matrix_ax.add_patch(rect)

fig1_path = os.path.join(output_dir, "fig_mexa_pipeline_diagram.pdf")
plt.savefig(fig1_path, bbox_inches='tight')
plt.savefig(fig1_path.replace('.pdf', '.png'), bbox_inches='tight')
plt.close()
print("Saved:", fig1_path)


# ==============================================================================
# VISUAL 2: FIGURE 3.2 - MEAN-CENTERING GEOMETRY DIAGRAM (FIXED LEGEND & OFFSETS)
# ==============================================================================
print("Generating Methodology Figure 3.2: Mean-Centering Geometry (Cleaned Placement)...")

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8.5, 4.2), dpi=300)

np.random.seed(42)
l1_cluster = np.random.multivariate_normal([2.2, 4.2], [[0.15, 0.05],[0.05, 0.15]], 25)
l2_cluster = np.random.multivariate_normal([5.5, 1.8], [[0.15, 0.05],[0.05, 0.15]], 25)

# Panel 1: Uncentered Space
p1 = ax1.scatter(l1_cluster[:,0], l1_cluster[:,1], color='#1f77b4', label='Target $L_1$ Embeddings', alpha=0.85, s=45, zorder=3)
p2 = ax1.scatter(l2_cluster[:,0], l2_cluster[:,1], color='#d62728', label='Pivot $L_2$ Embeddings', alpha=0.85, s=45, zorder=3)

# Connect translation pairs
for i in range(5):
    ax1.plot([l1_cluster[i,0], l2_cluster[i,0]], [l1_cluster[i,1], l2_cluster[i,1]], 
             '--', color='#777777', alpha=0.6, linewidth=1.2, zorder=2)

mean_l1 = np.mean(l1_cluster, axis=0)
mean_l2 = np.mean(l2_cluster, axis=0)
m1 = ax1.scatter(mean_l1[0], mean_l1[1], color='#0d3b66', marker='X', s=130, label='Language Mean $\\bar{e}_{L_1}$', zorder=5, edgecolors='black')
m2 = ax1.scatter(mean_l2[0], mean_l2[1], color='#6b0504', marker='X', s=130, label='Language Mean $\\bar{e}_{L_2}$', zorder=5, edgecolors='black')

ax1.set_title("(a) Uncentered Vector Space\n(Dominated by Language-Identity Offsets)", fontsize=10, fontweight='bold', pad=10)
ax1.set_xlabel("Dimension 1", fontsize=9, fontweight='bold')
ax1.set_ylabel("Dimension 2", fontsize=9, fontweight='bold')
ax1.set_xlim(0.8, 6.8)
ax1.set_ylim(0.5, 5.5)
ax1.grid(True)

# Place legend in lower left where NO dots exist!
ax1.legend(handles=[p1, p2, m1, m2], fontsize=8, loc='lower left', frameon=True, facecolor='white', framealpha=0.95)

# Panel 2: Mean-Centered Space
l1_centered = l1_cluster - mean_l1
l2_centered = l2_cluster - mean_l2

p3 = ax2.scatter(l1_centered[:,0], l1_centered[:,1], color='#1f77b4', label='Centered $L_1$ ($e_i - \\bar{e}_{L_1}$)', alpha=0.85, s=45, zorder=3)
p4 = ax2.scatter(l2_centered[:,0], l2_centered[:,1], color='#d62728', label='Centered $L_2$ ($e_i - \\bar{e}_{L_2}$)', alpha=0.85, s=45, zorder=3)

for i in range(5):
    ax2.plot([l1_centered[i,0], l2_centered[i,0]], [l1_centered[i,1], l2_centered[i,1]], 
             '--', color='#777777', alpha=0.6, linewidth=1.2, zorder=2)

m3 = ax2.scatter(0, 0, color='black', marker='X', s=130, label='Shared Origin $(0,0)$', zorder=5, edgecolors='white')

ax2.set_title("(b) Mean-Centered Vector Space\n(Offset Removed $\\rightarrow$ Pure Semantic Alignment)", fontsize=10, fontweight='bold', pad=10)
ax2.set_xlabel("Dimension 1", fontsize=9, fontweight='bold')
ax2.set_ylabel("Dimension 2", fontsize=9, fontweight='bold')
ax2.set_xlim(-1.8, 2.5)
ax2.set_ylim(-2.2, 1.8)
ax2.grid(True)

# Place legend in upper right / lower right where NO dots exist!
ax2.legend(handles=[p3, p4, m3], fontsize=8, loc='upper right', frameon=True, facecolor='white', framealpha=0.95)

plt.tight_layout()
fig2_path = os.path.join(output_dir, "fig_meancentering_geometry.pdf")
plt.savefig(fig2_path)
plt.savefig(fig2_path.replace('.pdf', '.png'))
plt.close()
print("Saved:", fig2_path)

print("All methodology figures generated and saved cleanly!")
