#!/usr/bin/env python3
"""Generate background chapter figures for the thesis."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

OUT = "/Users/wassim/MEXA-fork/tum-thesis-latex-master/figures"

# ── Consistent style ──
plt.rcParams.update({
    'font.family': 'serif',
    'font.size': 10,
    'axes.titlesize': 11,
    'axes.labelsize': 10,
    'figure.dpi': 300,
})

# ============================================================
# FIGURE 1: Encoder vs Decoder Architecture
# ============================================================
def draw_transformer_schematic():
    fig, axes = plt.subplots(1, 2, figsize=(10, 5.5))
    
    for ax_idx, (ax, title, attn_type) in enumerate(zip(
        axes, 
        ['Bidirectional Encoder (e.g., XLM-R)', 'Causal Decoder (e.g., Llama 3.1)'],
        ['bidirectional', 'causal']
    )):
        ax.set_xlim(-0.5, 5.5)
        ax.set_ylim(-0.8, 7.5)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title(title, fontsize=11, fontweight='bold', pad=10)
        
        # Draw input tokens
        tokens = ['The', 'cat', 'sat', '[M]' if attn_type == 'bidirectional' else 'on']
        for i, tok in enumerate(tokens):
            x = i * 1.4 + 0.5
            ax.add_patch(FancyBboxPatch((x - 0.4, -0.5), 0.8, 0.55,
                boxstyle="round,pad=0.05", facecolor='#e8f0fe', edgecolor='#4285f4', linewidth=1))
            ax.text(x, -0.25, tok, ha='center', va='center', fontsize=9, fontfamily='monospace')
        
        ax.text(2.6, -0.85, 'Input tokens', ha='center', va='center', fontsize=8, color='#666')
        
        # Draw layers
        layer_colors = ['#fef7e0', '#fef0c7', '#fde8ae', '#fce095']
        layer_labels = ['Layer 0\n(Embedding)', 'Layer 1', f'Layer {("L/2" if True else "")}', 'Layer L']
        
        for l_idx, (color, label) in enumerate(zip(layer_colors, layer_labels)):
            y = l_idx * 1.5 + 0.5
            ax.add_patch(FancyBboxPatch((0.0, y), 5.0, 1.0,
                boxstyle="round,pad=0.1", facecolor=color, edgecolor='#f9ab00', linewidth=0.8, alpha=0.8))
            
            # Attention type indicator
            if l_idx > 0:
                if attn_type == 'bidirectional':
                    ax.annotate('', xy=(4.2, y+0.5), xytext=(0.8, y+0.5),
                        arrowprops=dict(arrowstyle='<->', color='#34a853', lw=1.2))
                    ax.text(2.5, y+0.75, 'Full attention', ha='center', fontsize=7, color='#34a853')
                else:
                    ax.annotate('', xy=(4.2, y+0.5), xytext=(0.8, y+0.5),
                        arrowprops=dict(arrowstyle='->', color='#ea4335', lw=1.2))
                    ax.text(2.5, y+0.75, 'Causal mask (left-to-right)', ha='center', fontsize=7, color='#ea4335')
            
            ax.text(-0.3, y+0.5, label, ha='right', va='center', fontsize=7.5, color='#555')
            
            # Hidden state notation
            if l_idx < 3:
                ax.text(5.3, y+0.5, f'$h^{{({l_idx})}}$', ha='left', va='center', fontsize=9, 
                    color='#333', math_fontfamily='cm')
        
        # Dots between layer 1 and L/2
        if len(layer_labels) > 2:
            ax.text(2.5, 2.95, '⋮', ha='center', va='center', fontsize=14, color='#999')
        
        # Output arrow
        y_top = 3 * 1.5 + 0.5 + 1.0
        ax.annotate('', xy=(2.5, y_top + 0.6), xytext=(2.5, y_top + 0.05),
            arrowprops=dict(arrowstyle='->', color='#333', lw=1.5))
        
        if attn_type == 'bidirectional':
            ax.text(2.5, y_top + 0.85, 'Masked token prediction', ha='center', fontsize=9, color='#333')
        else:
            ax.text(2.5, y_top + 0.85, 'Next-token prediction', ha='center', fontsize=9, color='#333')
    
    fig.tight_layout(pad=2.0)
    fig.savefig(os.path.join(OUT, 'fig_transformer_schematic.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_transformer_schematic.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Transformer schematic")


# ============================================================
# FIGURE 2: BPE Tokenization Example
# ============================================================
def draw_bpe_example():
    fig, ax = plt.subplots(figsize=(9, 4))
    ax.axis('off')
    ax.set_xlim(-0.5, 12)
    ax.set_ylim(-0.5, 5.5)
    
    # Data: language, tokens, fertility
    examples = [
        ("English", ["The", " scientist", " discovered", " a", " new", " species"], 6, '#4285f4'),
        ("German",  ["Der", " Wissen", "schaft", "ler", " ent", "deck", "te", " eine", " neue", " Art"], 10, '#f9ab00'),
        ("Amharic", ["á", "ˆ", "µ", "á", "ˆ", "ˆ", "á", "ˆ", "«", " á", "ˆ", "°á", "ˆ"], 13, '#ea4335'),
    ]
    
    y_positions = [4.2, 2.5, 0.8]
    
    for (lang, tokens, fert, color), y in zip(examples, y_positions):
        # Language label
        ax.text(-0.3, y, f'{lang}', ha='right', va='center', fontsize=10, fontweight='bold', color='#333')
        
        # Fertility annotation
        ax.text(11.5, y, f'F = {fert}', ha='center', va='center', fontsize=9, 
            color=color, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor=color, alpha=0.15, edgecolor=color, linewidth=0.8))
        
        # Token boxes
        x = 0
        box_scale = min(0.85, 9.5 / len(tokens))
        for tok in tokens:
            width = max(0.4, len(tok) * 0.18) * box_scale
            ax.add_patch(FancyBboxPatch((x, y - 0.3), width, 0.6,
                boxstyle="round,pad=0.04", facecolor=color, alpha=0.15, 
                edgecolor=color, linewidth=0.7))
            ax.text(x + width/2, y, tok.strip() if tok.strip() else '·', 
                ha='center', va='center', fontsize=7, fontfamily='monospace', color='#333')
            x += width + 0.06
    
    # Title
    ax.text(5.5, 5.2, 'BPE tokenization of the same sentence across languages', 
        ha='center', va='center', fontsize=11, fontweight='bold', color='#333')
    ax.text(5.5, 4.85, '(Fertility F = number of subword tokens produced per sentence)', 
        ha='center', va='center', fontsize=8.5, color='#777')
    
    # Arrow annotation
    ax.annotate('', xy=(11.5, 0.5), xytext=(11.5, 4.5),
        arrowprops=dict(arrowstyle='->', color='#ea4335', lw=1.5, linestyle='--'))
    ax.text(12.0, 2.5, 'Higher\nfertility', ha='center', va='center', fontsize=8, 
        color='#ea4335', fontstyle='italic', rotation=0)
    
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'fig_bpe_example.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_bpe_example.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ BPE example")


# ============================================================
# FIGURE 3: Anisotropy Illustration
# ============================================================
def draw_anisotropy():
    fig, axes = plt.subplots(1, 2, figsize=(9, 4))
    
    np.random.seed(42)
    
    # (a) Isotropic space
    ax = axes[0]
    ax.set_title('(a) Isotropic embedding space', fontsize=10, fontweight='bold')
    theta = np.random.uniform(0, 2*np.pi, 60)
    r = np.random.uniform(0.3, 1.0, 60)
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    ax.scatter(x[:30], y[:30], c='#4285f4', s=25, alpha=0.7, label='Language A', zorder=3)
    ax.scatter(x[30:], y[30:], c='#ea4335', s=25, alpha=0.7, label='Language B', zorder=3)
    # Draw unit circle
    circle = plt.Circle((0, 0), 1.0, fill=False, color='#ccc', linestyle='--', linewidth=0.8)
    ax.add_patch(circle)
    ax.set_xlim(-1.4, 1.4)
    ax.set_ylim(-1.4, 1.4)
    ax.set_aspect('equal')
    ax.axhline(0, color='#eee', linewidth=0.5)
    ax.axvline(0, color='#eee', linewidth=0.5)
    ax.legend(fontsize=7, loc='upper left')
    ax.text(0, -1.25, 'Cosine similarity meaningful:\nrandom pairs have low similarity', 
        ha='center', fontsize=7.5, color='#555', fontstyle='italic')
    ax.set_xlabel('Dimension 1', fontsize=8)
    ax.set_ylabel('Dimension 2', fontsize=8)
    ax.tick_params(labelsize=7)
    
    # (b) Anisotropic space (narrow cone)
    ax = axes[1]
    ax.set_title('(b) Anisotropic embedding space', fontsize=10, fontweight='bold')
    # All points clustered in a narrow cone
    theta_a = np.random.normal(0.4, 0.12, 30)
    theta_b = np.random.normal(0.55, 0.12, 30)
    r_a = np.random.uniform(0.7, 1.0, 30)
    r_b = np.random.uniform(0.7, 1.0, 30)
    xa = r_a * np.cos(theta_a)
    ya = r_a * np.sin(theta_a)
    xb = r_b * np.cos(theta_b)
    yb = r_b * np.sin(theta_b)
    ax.scatter(xa, ya, c='#4285f4', s=25, alpha=0.7, label='Language A', zorder=3)
    ax.scatter(xb, yb, c='#ea4335', s=25, alpha=0.7, label='Language B', zorder=3)
    # Draw the narrow cone
    cone_angles = [0.0, 0.95]
    for angle in cone_angles:
        ax.plot([0, 1.3*np.cos(angle)], [0, 1.3*np.sin(angle)], 
            color='#f9ab00', linewidth=1, linestyle='--', alpha=0.6)
    # Shade cone
    cone_theta = np.linspace(0.0, 0.95, 50)
    cone_x = np.concatenate([[0], 1.3*np.cos(cone_theta), [0]])
    cone_y = np.concatenate([[0], 1.3*np.sin(cone_theta), [0]])
    ax.fill(cone_x, cone_y, color='#f9ab00', alpha=0.08)
    
    circle = plt.Circle((0, 0), 1.0, fill=False, color='#ccc', linestyle='--', linewidth=0.8)
    ax.add_patch(circle)
    ax.set_xlim(-1.4, 1.4)
    ax.set_ylim(-1.4, 1.4)
    ax.set_aspect('equal')
    ax.axhline(0, color='#eee', linewidth=0.5)
    ax.axvline(0, color='#eee', linewidth=0.5)
    ax.legend(fontsize=7, loc='upper left')
    ax.text(0, -1.25, 'Cosine similarity unreliable:\nall pairs have high similarity', 
        ha='center', fontsize=7.5, color='#555', fontstyle='italic')
    ax.set_xlabel('Dimension 1', fontsize=8)
    ax.set_ylabel('Dimension 2', fontsize=8)
    ax.tick_params(labelsize=7)
    
    fig.tight_layout(pad=2.0)
    fig.savefig(os.path.join(OUT, 'fig_anisotropy_illustration.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_anisotropy_illustration.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Anisotropy illustration")


# ============================================================
# FIGURE 4: Resource Disparity
# ============================================================
def draw_resource_disparity():
    fig, ax = plt.subplots(figsize=(8, 4))
    
    # Data: script families and approximate counts in FLORES vs Bible
    scripts = ['Latin\n(European)', 'Cyrillic', 'Arabic', 'Devanagari\n& Indic', 'CJK', 
               'Ge\'ez', 'Myanmar', 'Other\n(< 5 langs)']
    flores_counts = [65, 10, 12, 15, 8, 2, 2, 6]
    bible_counts  = [180, 45, 35, 40, 12, 15, 8, 65]
    
    x = np.arange(len(scripts))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, flores_counts, width, label='FLORES-200', color='#4285f4', alpha=0.85, edgecolor='white')
    bars2 = ax.bar(x + width/2, bible_counts, width, label='Bible Corpus (sPBC)', color='#34a853', alpha=0.85, edgecolor='white')
    
    ax.set_ylabel('Number of languages', fontsize=10)
    ax.set_xticks(x)
    ax.set_xticklabels(scripts, fontsize=8)
    ax.legend(fontsize=9)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('Language-script distribution across evaluation corpora', fontsize=11, fontweight='bold', pad=12)
    
    # Resource tier annotations
    ax.axvspan(-0.5, 0.5, alpha=0.04, color='#4285f4')
    ax.axvspan(0.5, 4.5, alpha=0.04, color='#f9ab00')
    ax.axvspan(4.5, 7.5, alpha=0.04, color='#ea4335')
    
    ax.text(0, max(flores_counts + bible_counts) * 1.05, 'High', ha='center', fontsize=7.5, 
        color='#4285f4', fontweight='bold')
    ax.text(2.5, max(flores_counts + bible_counts) * 1.05, 'Medium resource', ha='center', fontsize=7.5, 
        color='#f9ab00', fontweight='bold')
    ax.text(6, max(flores_counts + bible_counts) * 1.05, 'Low resource', ha='center', fontsize=7.5, 
        color='#ea4335', fontweight='bold')
    
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'fig_resource_disparity.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_resource_disparity.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Resource disparity")


# ============================================================
if __name__ == '__main__':
    draw_transformer_schematic()
    draw_bpe_example()
    draw_anisotropy()
    draw_resource_disparity()
    print("\nAll background figures generated.")
