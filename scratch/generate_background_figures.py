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
    fig, axes = plt.subplots(1, 2, figsize=(10.5, 5.8))
    
    for ax_idx, (ax, title, attn_type) in enumerate(zip(
        axes, 
        ['Bidirectional Encoder (e.g., XLM-R)', 'Causal Decoder (e.g., Llama 3.1)'],
        ['bidirectional', 'causal']
    )):
        ax.set_xlim(-0.6, 5.8)
        ax.set_ylim(-1.0, 7.6)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title(title, fontsize=11, fontweight='bold', pad=10)
        
        # Draw input tokens
        tokens = ['The', 'cat', 'sat', '[MASK]' if attn_type == 'bidirectional' else 'on']
        for i, tok in enumerate(tokens):
            x = i * 1.35 + 0.45
            ax.add_patch(FancyBboxPatch((x - 0.42, -0.5), 0.84, 0.55,
                boxstyle="round,pad=0.05", facecolor='#eef3fc', edgecolor='#4285f4', linewidth=1))
            ax.text(x, -0.23, tok, ha='center', va='center', fontsize=8.5, fontfamily='monospace')
            # Upward arrow from token to Layer 0
            ax.annotate('', xy=(x, 0.45), xytext=(x, 0.08),
                arrowprops=dict(arrowstyle='->', color='#888', lw=0.9))
        
        ax.text(2.5, -0.85, 'Input tokens', ha='center', va='center', fontsize=8, color='#666')
        
        # Draw layers
        layer_colors = ['#fff9e6', '#fef3cc', '#fdeab0', '#fcdfa0']
        layer_labels = ['Layer 0\n(Embedding)', 'Layer 1', 'Layer L/2', 'Layer L']
        layer_hs = [r'$h^{(0)}$', r'$h^{(1)}$', r'$h^{(L/2)}$', r'$h^{(L)}$']
        
        for l_idx, (color, label, hs) in enumerate(zip(layer_colors, layer_labels, layer_hs)):
            y = l_idx * 1.5 + 0.5
            ax.add_patch(FancyBboxPatch((0.0, y), 5.0, 1.0,
                boxstyle="round,pad=0.1", facecolor=color, edgecolor='#f9ab00', linewidth=0.9, alpha=0.85))
            
            # Attention type indicator
            if l_idx > 0:
                if attn_type == 'bidirectional':
                    ax.annotate('', xy=(4.2, y+0.5), xytext=(0.8, y+0.5),
                        arrowprops=dict(arrowstyle='<->', color='#2e7d32', lw=1.3))
                    ax.text(2.5, y+0.75, 'Full attention', ha='center', fontsize=7.5, color='#2e7d32', fontweight='bold')
                else:
                    ax.annotate('', xy=(4.2, y+0.5), xytext=(0.8, y+0.5),
                        arrowprops=dict(arrowstyle='->', color='#c62828', lw=1.3))
                    ax.text(2.5, y+0.75, 'Causal mask (left-to-right)', ha='center', fontsize=7.5, color='#c62828', fontweight='bold')
            
            ax.text(-0.25, y+0.5, label, ha='right', va='center', fontsize=7.5, color='#444')
            
            # Hidden state notation on the right
            ax.text(5.25, y+0.5, hs, ha='left', va='center', fontsize=9.5, 
                color='#222', math_fontfamily='cm')
        
        # Inter-layer dataflow arrows
        # Between Layer 0 and Layer 1
        ax.annotate('', xy=(2.5, 1.95), xytext=(2.5, 1.55),
            arrowprops=dict(arrowstyle='->', color='#888', lw=1.1))
        
        # Dots and arrows between layer 1 and L/2
        ax.annotate('', xy=(2.5, 3.1), xytext=(2.5, 3.02),
            arrowprops=dict(arrowstyle='-', color='#aaa', lw=0.9))
        ax.text(2.5, 3.25, r'$\vdots$', ha='center', va='center', fontsize=14, color='#777', math_fontfamily='cm')
        ax.annotate('', xy=(2.5, 3.48), xytext=(2.5, 3.4),
            arrowprops=dict(arrowstyle='->', color='#aaa', lw=0.9))
        
        # Between Layer L/2 and Layer L
        ax.annotate('', xy=(2.5, 4.95), xytext=(2.5, 4.55),
            arrowprops=dict(arrowstyle='->', color='#888', lw=1.1))
        
        # Output arrow
        y_top = 3 * 1.5 + 0.5 + 1.0
        ax.annotate('', xy=(2.5, y_top + 0.55), xytext=(2.5, y_top + 0.05),
            arrowprops=dict(arrowstyle='->', color='#333', lw=1.4))
        
        if attn_type == 'bidirectional':
            ax.text(2.5, y_top + 0.78, 'Masked token prediction', ha='center', fontsize=9, fontweight='bold', color='#333')
        else:
            ax.text(2.5, y_top + 0.78, 'Next-token prediction', ha='center', fontsize=9, fontweight='bold', color='#333')
    
    fig.tight_layout(pad=1.8)
    fig.savefig(os.path.join(OUT, 'fig_transformer_schematic.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_transformer_schematic.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Transformer schematic")


# ============================================================
# FIGURE 2: BPE Tokenization Example
# ============================================================
def draw_bpe_example():
    fig, ax = plt.subplots(figsize=(10, 4.2))
    ax.axis('off')
    ax.set_xlim(-0.6, 13.2)
    ax.set_ylim(-0.5, 5.6)
    
    # Data: language, tokens, fertility
    examples = [
        ("English", ["The", " scientist", " discovered", " a", " new", " species"], 6, '#2b6cb0'),
        ("German",  ["Der", " Wissen", "schaft", "ler", " ent", "deck", "te", " eine", " neue", " Art"], 10, '#c05621'),
        ("Amharic", ["<0xE1>", "<0x88>", "<0xB0>", "<0xE1>", "<0x8B>", "<0xAD>", "<0xE1>", "<0x8A>", "<0x95>", "<0xE1>", "<0x89>", "<0xB5>", "<0xE1>"], 13, '#c53030'),
    ]
    
    y_positions = [4.1, 2.4, 0.7]
    
    for (lang, tokens, fert, color), y in zip(examples, y_positions):
        # Language label
        ax.text(-0.3, y, f'{lang}', ha='right', va='center', fontsize=10.5, fontweight='bold', color='#333')
        
        # Fertility annotation badge
        ax.text(10.8, y, f'F = {fert}', ha='center', va='center', fontsize=9, 
            color=color, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.35', facecolor=color, alpha=0.12, edgecolor=color, linewidth=0.9))
        
        # Token boxes
        x = 0.0
        box_scale = min(0.85, 9.2 / len(tokens))
        for tok in tokens:
            width = max(0.42, len(tok) * 0.17) * box_scale
            ax.add_patch(FancyBboxPatch((x, y - 0.3), width, 0.6,
                boxstyle="round,pad=0.04", facecolor=color, alpha=0.12, 
                edgecolor=color, linewidth=0.75))
            ax.text(x + width/2, y, tok.strip() if tok.strip() else '·', 
                ha='center', va='center', fontsize=7.2, fontfamily='monospace', color='#222')
            x += width + 0.06
    
    # Title
    ax.text(5.6, 5.25, 'BPE tokenization of the same sentence across languages', 
        ha='center', va='center', fontsize=11, fontweight='bold', color='#222')
    ax.text(5.6, 4.88, '(Fertility F = number of subword tokens produced per sentence)', 
        ha='center', va='center', fontsize=8.5, color='#666')
    
    # Arrow annotation cleanly on the far right
    ax.annotate('', xy=(12.2, 0.5), xytext=(12.2, 4.3),
        arrowprops=dict(arrowstyle='->', color='#c53030', lw=1.5, linestyle='--'))
    ax.text(12.7, 2.4, 'Higher\nfertility', ha='center', va='center', fontsize=8.5, 
        color='#c53030', fontweight='bold', fontstyle='italic', rotation=0)
    
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'fig_bpe_example.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_bpe_example.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ BPE example")


# ============================================================
# FIGURE 3: Anisotropy Illustration
# ============================================================
def draw_anisotropy():
    fig, axes = plt.subplots(1, 2, figsize=(9.5, 4.3))
    
    np.random.seed(42)
    
    # (a) Isotropic space
    ax = axes[0]
    ax.set_title('(a) Isotropic embedding space', fontsize=10.5, fontweight='bold', pad=8)
    theta = np.random.uniform(0, 2*np.pi, 60)
    r = np.random.uniform(0.3, 1.0, 60)
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    ax.scatter(x[:30], y[:30], c='#4285f4', s=28, alpha=0.75, label='Language A (e.g., English)', zorder=3, edgecolors='none')
    ax.scatter(x[30:], y[30:], c='#ea4335', s=28, alpha=0.75, label='Language B (e.g., French)', zorder=3, edgecolors='none')
    
    # Draw unit circle
    circle = plt.Circle((0, 0), 1.0, fill=False, color='#bbb', linestyle='--', linewidth=0.8)
    ax.add_patch(circle)
    ax.set_xlim(-1.45, 1.45)
    ax.set_ylim(-1.45, 1.45)
    ax.set_aspect('equal')
    ax.axhline(0, color='#e5e5e5', linewidth=0.6)
    ax.axvline(0, color='#e5e5e5', linewidth=0.6)
    ax.legend(fontsize=7.5, loc='upper left', framealpha=0.9)
    ax.text(0, -1.28, 'Cosine similarity meaningful:\nrandom pairs have near-zero similarity', 
        ha='center', fontsize=7.5, color='#444', fontstyle='italic')
    ax.set_xlabel(r'Dimension 1 (e.g., PC 1 / $z_1$ in $\mathbb{R}^d$)', fontsize=8.2)
    ax.set_ylabel(r'Dimension 2 (e.g., PC 2 / $z_2$ in $\mathbb{R}^d$)', fontsize=8.2)
    ax.tick_params(labelsize=7)
    
    # (b) Anisotropic space (narrow cone)
    ax = axes[1]
    ax.set_title('(b) Anisotropic embedding space (LLMs)', fontsize=10.5, fontweight='bold', pad=8)
    # All points clustered in a narrow cone
    theta_a = np.random.normal(0.4, 0.12, 30)
    theta_b = np.random.normal(0.55, 0.12, 30)
    r_a = np.random.uniform(0.7, 1.0, 30)
    r_b = np.random.uniform(0.7, 1.0, 30)
    xa = r_a * np.cos(theta_a)
    ya = r_a * np.sin(theta_a)
    xb = r_b * np.cos(theta_b)
    yb = r_b * np.sin(theta_b)
    ax.scatter(xa, ya, c='#4285f4', s=28, alpha=0.75, label='Language A (e.g., English)', zorder=3, edgecolors='none')
    ax.scatter(xb, yb, c='#ea4335', s=28, alpha=0.75, label='Language B (e.g., French)', zorder=3, edgecolors='none')
    
    # Draw the narrow cone
    cone_angles = [0.0, 0.95]
    for angle in cone_angles:
        ax.plot([0, 1.35*np.cos(angle)], [0, 1.35*np.sin(angle)], 
            color='#f9ab00', linewidth=1.1, linestyle='--', alpha=0.7)
    # Shade cone
    cone_theta = np.linspace(0.0, 0.95, 50)
    cone_x = np.concatenate([[0], 1.35*np.cos(cone_theta), [0]])
    cone_y = np.concatenate([[0], 1.35*np.sin(cone_theta), [0]])
    ax.fill(cone_x, cone_y, color='#f9ab00', alpha=0.09)
    
    circle = plt.Circle((0, 0), 1.0, fill=False, color='#bbb', linestyle='--', linewidth=0.8)
    ax.add_patch(circle)
    ax.set_xlim(-1.45, 1.45)
    ax.set_ylim(-1.45, 1.45)
    ax.set_aspect('equal')
    ax.axhline(0, color='#e5e5e5', linewidth=0.6)
    ax.axvline(0, color='#e5e5e5', linewidth=0.6)
    ax.legend(fontsize=7.5, loc='upper left', framealpha=0.9)
    ax.text(0, -1.28, 'Cosine similarity degraded:\nall pairs share high similarity in cone', 
        ha='center', fontsize=7.5, color='#444', fontstyle='italic')
    ax.set_xlabel(r'Dimension 1 (e.g., PC 1 / $z_1$ in $\mathbb{R}^d$)', fontsize=8.2)
    ax.set_ylabel(r'Dimension 2 (e.g., PC 2 / $z_2$ in $\mathbb{R}^d$)', fontsize=8.2)
    ax.tick_params(labelsize=7)
    
    fig.tight_layout(pad=2.2)
    fig.savefig(os.path.join(OUT, 'fig_anisotropy_illustration.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_anisotropy_illustration.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Anisotropy illustration (updated dimensions)")


# ============================================================
# FIGURE 4: Language-Script Distribution (Natural Green Shades)
# ============================================================
def draw_resource_disparity():
    fig, ax = plt.subplots(figsize=(8.5, 4.4))
    
    # Data: script families and counts in FLORES-200 (204 pairs) vs full Bible corpus (1,401 pairs)
    scripts = ['Latin', 'Cyrillic', 'Arabic', 'Devanagari\n& Indic', 'CJK', 
               'Ge\'ez', 'Myanmar', 'Other\nscripts']
    flores_counts = [95, 18, 22, 28, 8, 2, 2, 29]
    bible_counts  = [920, 85, 65, 110, 12, 18, 15, 176]
    
    x = np.arange(len(scripts))
    width = 0.38
    
    # Harmonious natural green palette
    c_flores = '#52a25f'
    c_bible = '#1b5e20'
    
    bars1 = ax.bar(x - width/2, flores_counts, width, label='FLORES-200 (204 pairs)', color=c_flores, alpha=0.9, edgecolor='white', linewidth=0.8)
    bars2 = ax.bar(x + width/2, bible_counts, width, label='Bible Corpus (sPBC, 1,401 pairs)', color=c_bible, alpha=0.9, edgecolor='white', linewidth=0.8)
    
    ax.set_ylabel('Number of languages / varieties', fontsize=10)
    ax.set_xticks(x)
    ax.set_xticklabels(scripts, fontsize=9)
    ax.set_ylim(0, 1050)
    
    # Add value labels on top of bars
    for bar in bars1:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 15, f'{int(h)}', ha='center', va='bottom', fontsize=7.5, color='#2e7d32')
    for bar in bars2:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., h + 15, f'{int(h)}', ha='center', va='bottom', fontsize=7.5, color='#1b5e20', fontweight='bold')
    
    # Legend placed in open upper right area
    ax.legend(fontsize=9.5, loc='upper right', framealpha=0.95, edgecolor='#ddd')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_title('Language-script distribution across evaluation corpora', fontsize=11, fontweight='bold', pad=12)
    
    # Light horizontal grid lines for readability
    ax.yaxis.grid(True, linestyle='--', alpha=0.3, color='#bbb')
    ax.set_axisbelow(True)
    
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'fig_resource_disparity.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_resource_disparity.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Resource disparity (updated full 1400 counts, removed resource tier labels)")


# ============================================================
# FIGURE 5: Sparse Mixture-of-Experts Architecture
# ============================================================
def draw_moe_architecture():
    fig, ax = plt.subplots(figsize=(10.5, 6.2))
    ax.set_xlim(-0.5, 14.5)
    ax.set_ylim(-0.5, 8.5)
    ax.set_aspect('equal')
    ax.axis('off')
    
    # Title
    ax.text(7.0, 8.1, 'Sparse Mixture-of-Experts (MoE) Architecture', 
        ha='center', va='center', fontsize=12, fontweight='bold', color='#222')
    
    # ── Left Column: Stacked Transformer Blocks ──
    x_stack = 2.0
    w_block = 2.4
    h_attn = 0.55
    h_moe = 0.95
    
    # Bottom dots
    ax.text(x_stack, 0.2, r'$\vdots$', ha='center', va='center', fontsize=14, color='#888', math_fontfamily='cm')
    ax.annotate('', xy=(x_stack, 0.65), xytext=(x_stack, 0.35),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # Block 1
    # Attention 1
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, 0.7), w_block, h_attn,
        boxstyle="round,pad=0.04", facecolor='#eef2fc', edgecolor='#7a94d8', linewidth=0.9))
    ax.text(x_stack, 0.7 + h_attn/2, 'Attention', ha='center', va='center', fontsize=8.5, color='#222')
    
    ax.annotate('', xy=(x_stack, 1.6), xytext=(x_stack, 1.25),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # MoE 1
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, 1.6), w_block, h_moe,
        boxstyle="round,pad=0.05", facecolor='#fdf0ed', edgecolor='#f4b4a6', linewidth=1.0))
    ax.text(x_stack, 1.6 + h_moe/2, 'MoE Layer', ha='center', va='center', fontsize=9.5, fontweight='bold', color='#9c4236')
    
    ax.annotate('', xy=(x_stack, 2.9), xytext=(x_stack, 2.55),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # Attention 2 (Middle)
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, 2.9), w_block, h_attn,
        boxstyle="round,pad=0.04", facecolor='#eef2fc', edgecolor='#7a94d8', linewidth=0.9))
    ax.text(x_stack, 2.9 + h_attn/2, 'Attention', ha='center', va='center', fontsize=8.5, color='#222')
    
    ax.annotate('', xy=(x_stack, 3.8), xytext=(x_stack, 3.45),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # MoE 2 (Middle - Zoom Target)
    y_target_moe = 3.8
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, y_target_moe), w_block, h_moe,
        boxstyle="round,pad=0.05", facecolor='#fdf0ed', edgecolor='#f4b4a6', linewidth=1.2))
    ax.text(x_stack, y_target_moe + h_moe/2, 'MoE Layer', ha='center', va='center', fontsize=9.5, fontweight='bold', color='#9c4236')
    
    ax.annotate('', xy=(x_stack, 5.1), xytext=(x_stack, 4.75),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # Attention 3
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, 5.1), w_block, h_attn,
        boxstyle="round,pad=0.04", facecolor='#eef2fc', edgecolor='#7a94d8', linewidth=0.9))
    ax.text(x_stack, 5.1 + h_attn/2, 'Attention', ha='center', va='center', fontsize=8.5, color='#222')
    
    ax.annotate('', xy=(x_stack, 6.0), xytext=(x_stack, 5.65),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    
    # MoE 3
    ax.add_patch(FancyBboxPatch((x_stack - w_block/2, 6.0), w_block, h_moe,
        boxstyle="round,pad=0.05", facecolor='#fdf0ed', edgecolor='#f4b4a6', linewidth=1.0))
    ax.text(x_stack, 6.0 + h_moe/2, 'MoE Layer', ha='center', va='center', fontsize=9.5, fontweight='bold', color='#9c4236')
    
    # Top dots
    ax.annotate('', xy=(x_stack, 7.3), xytext=(x_stack, 6.95),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    ax.text(x_stack, 7.5, r'$\vdots$', ha='center', va='center', fontsize=14, color='#888', math_fontfamily='cm')
    
    # ── Right Panel: Zoomed-in MoE Block ──
    x_panel = 5.6
    y_panel = 1.5
    w_panel = 8.4
    h_panel = 5.8
    
    # Dashed zoom projection lines
    ax.plot([x_stack + w_block/2, x_panel], [y_target_moe + h_moe, y_panel + h_panel], 
        color='#999', linestyle='--', linewidth=0.9)
    ax.plot([x_stack + w_block/2, x_panel], [y_target_moe, y_panel], 
        color='#999', linestyle='--', linewidth=0.9)
    
    # Large MoE container
    ax.add_patch(FancyBboxPatch((x_panel, y_panel), w_panel, h_panel,
        boxstyle="round,pad=0.1", facecolor='#fdf3f0', edgecolor='#f4b4a6', linewidth=1.3, alpha=0.9))
    ax.text(x_panel + w_panel - 0.4, y_panel + h_panel - 0.35, 'MoE Block', 
        ha='right', va='center', fontsize=10.5, fontweight='bold', color='#9c4236')
    
    # Bottom Attention inside zoomed view
    x_attn_in = x_panel + 3.1
    y_attn_in = y_panel - 0.95
    ax.annotate('', xy=(x_attn_in, y_panel - 0.98), xytext=(x_attn_in, y_panel - 1.4),
        arrowprops=dict(arrowstyle='->', color='#666', lw=1.1))
    ax.add_patch(FancyBboxPatch((x_attn_in - 1.2, y_attn_in), 2.4, 0.6,
        boxstyle="round,pad=0.04", facecolor='#eef2fc', edgecolor='#7a94d8', linewidth=0.9))
    ax.text(x_attn_in, y_attn_in + 0.3, 'Attention', ha='center', va='center', fontsize=8.5, color='#222')
    
    # Split arrow from Attention to Router & Shared Expert
    y_split = y_panel + 0.4
    ax.plot([x_attn_in, x_attn_in], [y_attn_in + 0.6, y_split], color='#555', lw=1.0)
    
    # Branch left to Router
    x_router = x_panel + 2.3
    ax.plot([x_attn_in, x_router], [y_split, y_split], color='#555', lw=1.0)
    ax.annotate('', xy=(x_router, y_panel + 0.8), xytext=(x_router, y_split),
        arrowprops=dict(arrowstyle='->', color='#555', lw=1.0))
    
    # Branch right to Shared Expert
    x_shared = x_panel + 7.1
    ax.plot([x_attn_in, x_shared], [y_split, y_split], color='#555', lw=1.0)
    ax.annotate('', xy=(x_shared, y_panel + 2.4), xytext=(x_shared, y_split),
        arrowprops=dict(arrowstyle='->', color='#555', lw=1.0))
    
    # ── Routed Experts Box ──
    x_re = x_panel + 0.4
    y_re = y_panel + 0.65
    w_re = 5.2
    h_re = 3.8
    ax.add_patch(FancyBboxPatch((x_re, y_re), w_re, h_re,
        boxstyle="round,pad=0.08", facecolor='white', edgecolor='#bbb', linewidth=0.9))
    
    # Header label at top of routed experts box
    ax.text(x_re + w_re/2, y_re + h_re - 0.35, 'Routed Experts ($E$ total, Top-$k$ selected)', 
        ha='center', va='center', fontsize=8.5, fontweight='bold', color='#333')
    
    # Router box
    y_router_box = y_panel + 0.85
    ax.add_patch(FancyBboxPatch((x_router - 0.9, y_router_box), 1.8, 0.55,
        boxstyle="round,pad=0.04", facecolor='#f5f5f5', edgecolor='#888', linewidth=0.8))
    ax.text(x_router, y_router_box + 0.27, 'Router (Gating)', ha='center', va='center', fontsize=7.8, fontweight='bold', color='#333')
    
    # Routing arrows from Router to individual experts
    y_exp = y_panel + 2.05
    expert_xs = [x_re + 0.7, x_re + 1.8, x_re + 4.4]
    expert_names = ['Expert\n0', 'Expert\n1', 'Expert\n$E-1$']
    
    for ex_x in [expert_xs[0], expert_xs[1]]:
        ax.annotate('', xy=(ex_x, y_exp - 0.05), xytext=(x_router, y_router_box + 0.55),
            arrowprops=dict(arrowstyle='->', color='#4285f4', lw=1.0, linestyle='-'))
    # Dot arrow to last expert
    ax.annotate('', xy=(expert_xs[2], y_exp - 0.05), xytext=(x_router, y_router_box + 0.55),
        arrowprops=dict(arrowstyle='->', color='#4285f4', lw=1.0, linestyle=':'))
    
    # Draw individual expert boxes
    w_exp = 0.95
    h_exp = 0.95
    for ex_x, name in zip(expert_xs, expert_names):
        ax.add_patch(FancyBboxPatch((ex_x - w_exp/2, y_exp), w_exp, h_exp,
            boxstyle="round,pad=0.04", facecolor='#e8f0fe', edgecolor='#4285f4', linewidth=0.9))
        ax.text(ex_x, y_exp + h_exp/2, name, ha='center', va='center', fontsize=7.5, color='#1a56db')
    
    # Dots between expert 1 and E-1
    ax.text(x_re + 3.1, y_exp + h_exp/2, r'$\dots$', ha='center', va='center', fontsize=12, color='#777')
    
    # ── Shared Expert Box ──
    w_shared = 1.3
    h_shared = 1.1
    ax.add_patch(FancyBboxPatch((x_shared - w_shared/2, y_panel + 2.4), w_shared, h_shared,
        boxstyle="round,pad=0.05", facecolor='#eaf5ea', edgecolor='#34a853', linewidth=1.0))
    ax.text(x_shared, y_panel + 2.4 + h_shared/2, 'Shared\nExpert', ha='center', va='center', fontsize=8, fontweight='bold', color='#1e7e34')
    
    # ── Summation Node (+) ──
    x_sum = x_panel + 4.8
    y_sum = y_panel + 5.0
    r_sum = 0.25
    sum_circle = plt.Circle((x_sum, y_sum), r_sum, facecolor='white', edgecolor='#333', linewidth=1.1, zorder=4)
    ax.add_patch(sum_circle)
    ax.text(x_sum, y_sum, '+', ha='center', va='center', fontsize=12, fontweight='bold', color='#333', zorder=5)
    
    # Combined line out of Routed Experts top:
    # Exit cleanly from top of Routed Experts box at x = x_re + 2.0 (above Expert 0 and 1)
    x_re_out = x_re + 2.0
    y_re_top = y_re + h_re
    ax.plot([x_re_out, x_re_out], [y_re_top, y_sum], color='#4285f4', lw=1.0)
    ax.annotate('', xy=(x_sum - r_sum, y_sum), xytext=(x_re_out, y_sum),
        arrowprops=dict(arrowstyle='->', color='#4285f4', lw=1.0))
    
    # Arrow from shared expert to sum node
    ax.plot([x_shared, x_shared], [y_panel + 2.4 + h_shared, y_sum], color='#34a853', lw=1.0)
    ax.annotate('', xy=(x_sum + r_sum, y_sum), xytext=(x_shared, y_sum),
        arrowprops=dict(arrowstyle='->', color='#34a853', lw=1.0))
    
    # Output arrow from sum node to top of MoE block
    ax.annotate('', xy=(x_sum, y_panel + h_panel + 0.55), xytext=(x_sum, y_sum + r_sum),
        arrowprops=dict(arrowstyle='->', color='#333', lw=1.3))
    
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, 'fig_moe_architecture.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(OUT, 'fig_moe_architecture.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ MoE architecture schematic")


# ============================================================
if __name__ == '__main__':
    draw_transformer_schematic()
    draw_bpe_example()
    draw_anisotropy()
    draw_resource_disparity()
    draw_moe_architecture()
    print("\nAll background figures generated.")

