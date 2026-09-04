import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.font_manager as fm
import matplotlib as mpl

# Set academic publication style settings
plt.style.use('seaborn-v0_8-paper' if 'seaborn-v0_8-paper' in plt.style.available else 'default')
mpl.rcParams['font.family'] = 'sans-serif'
mpl.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Helvetica', 'Arial']

# Register Kefa for Amharic Ge'ez script
kefa_path = '/System/Library/Fonts/Supplemental/KefaIII.ttf'
if os.path.exists(kefa_path):
    fm.fontManager.addfont(kefa_path)
    ethiopic_font = fm.FontProperties(fname=kefa_path)
else:
    ethiopic_font = None

base_dir = "/Users/wassim/MEXA-fork"
out_dir = os.path.join(base_dir, "tum-thesis-latex-master/figures")

# ==============================================================================
# CASE 1: Annotated Byte-Fallback
# Keeps the byte-fallback tokens (<0xE1>, <0x88>...) showing the LLaMA reality,
# but displays the original Ge'ez sentence above and explicitly labels it
# "UTF-8 Byte Fallback (LLaMA BPE)" so no reader mistakes it for a missing font.
# ==============================================================================
def generate_case1():
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.axis('off')
    ax.set_xlim(-0.8, 14.0)
    ax.set_ylim(-0.6, 5.8)
    fig.patch.set_facecolor('white')

    rows = [
        {
            "lang": "English",
            "script": "Latin",
            "sentence": '"The scientist discovered a new species"',
            "tokens": ["The", " scientist", " discovered", " a", " new", " species"],
            "fert": 6,
            "color": "#1f77b4",
            "y": 4.2
        },
        {
            "lang": "German",
            "script": "Latin",
            "sentence": '"Der Wissenschaftler entdeckte eine neue Art"',
            "tokens": ["Der", " Wissen", "schaft", "ler", " ent", "deck", "te", " eine", " neue", " Art"],
            "fert": 10,
            "color": "#c05621",
            "y": 2.5
        },
        {
            "lang": "Amharic",
            "script": "Ge'ez",
            "sentence": '"ሳይንቲስቱ አዲስ ዝርያ አገኘ"  (LLaMA BPE: UTF-8 byte fallback)',
            "tokens": ["<0xE1>", "<0x88>", "<0xB3>", "<0xE1>", "<0x8B>", "<0xAD>", "<0xE1>", "<0x8A>", "<0x95>", "<0xE1>", "<0x89>", "<0xB2>", "..."],
            "fert": 38,
            "color": "#c53030",
            "y": 0.8
        }
    ]

    for row in rows:
        y = row["y"]
        color = row["color"]
        
        # Language header & original text
        ax.text(-0.6, y + 0.38, f'{row["lang"]} ({row["script"]})', ha='left', va='center', 
                fontsize=10.5, fontweight='bold', color='#222')
        
        # If Amharic, use Ethiopic font for the sentence string
        if row["lang"] == "Amharic" and ethiopic_font:
            # Split sentence into Amharic part and English note
            ax.text(2.6, y + 0.38, '"ሳይንቲስቱ አዲስ ዝርያ አገኘ"', fontproperties=ethiopic_font, 
                    fontsize=10.5, color='#444', va='center')
            ax.text(5.5, y + 0.38, '(LLaMA-3 Byte-Level BPE Fallback)', fontsize=8.5, 
                    fontstyle='italic', color='#c53030', va='center', fontweight='bold')
        else:
            ax.text(2.6, y + 0.38, row["sentence"], ha='left', va='center', 
                    fontsize=9.0, fontstyle='italic', color='#555')

        # Fertility badge
        ax.text(11.8, y - 0.05, f'F = {row["fert"]}', ha='center', va='center', fontsize=9, 
                color=color, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.35', facecolor=color, alpha=0.12, edgecolor=color, linewidth=0.9))

        # Token boxes
        x = -0.6
        box_scale = min(0.88, 11.2 / len(row["tokens"]))
        for tok in row["tokens"]:
            width = max(0.48, len(tok) * 0.165) * box_scale
            ax.add_patch(patches.FancyBboxPatch((x, y - 0.32), width, 0.52,
                boxstyle="round,pad=0.04", facecolor=color, alpha=0.12, 
                edgecolor=color, linewidth=0.75))
            ax.text(x + width/2, y - 0.06, tok.strip() if tok.strip() else '·', 
                    ha='center', va='center', fontsize=7.2, fontfamily='monospace', color='#111')
            x += width + 0.06

    # Explanatory note at the bottom for Amharic
    ax.text(-0.6, -0.42, 
            "* Note: Amharic characters have no merges in LLaMA's BPE vocabulary; each 3-byte Ge'ez character decomposes into 3 raw UTF-8 byte tokens (<0x..>).",
            fontsize=8.0, color='#666', fontstyle='italic')

    # Title
    ax.text(5.6, 5.45, 'BPE Tokenization of the Same Sentence Across Languages (Case 1: Byte Fallback)', 
            ha='center', va='center', fontsize=11, fontweight='bold', color='#111')
    ax.text(5.6, 5.12, '(Fertility F = number of subword tokens produced per sentence)', 
            ha='center', va='center', fontsize=8.5, color='#666')

    # Arrow annotation on far right
    ax.annotate('', xy=(13.1, 0.6), xytext=(13.1, 4.4),
                arrowprops=dict(arrowstyle='->', color='#c53030', lw=1.5, linestyle='--'))
    ax.text(13.5, 2.5, 'Higher\nfertility\n(Fragmentation)', ha='center', va='center', fontsize=8.5, 
            color='#c53030', fontweight='bold', fontstyle='italic')

    fig.tight_layout()
    fig.savefig(os.path.join(out_dir, 'fig_bpe_example_case1_byte_fallback.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(out_dir, 'fig_bpe_example_case1_byte_fallback.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Generated Case 1 (Annotated Byte-Fallback)")


# ==============================================================================
# CASE 2: Native Ge'ez Subwords (Multilingual BPE with Script Support)
# Shows actual Ge'ez subword tokens in native script (as done in Qwen / Glot500)
# and contrasts it directly with how high fertility still manifests in morphemes.
# ==============================================================================
def generate_case2():
    fig, ax = plt.subplots(figsize=(10.5, 4.8), dpi=300)
    ax.axis('off')
    ax.set_xlim(-0.8, 14.0)
    ax.set_ylim(-0.6, 5.8)
    fig.patch.set_facecolor('white')

    # Subwords in native script
    rows = [
        {
            "lang": "English",
            "script": "Latin",
            "sentence": '"The scientist discovered a new species"',
            "tokens": ["The", " scientist", " discovered", " a", " new", " species"],
            "fert": 6,
            "color": "#1f77b4",
            "y": 4.2,
            "is_amharic": False
        },
        {
            "lang": "German",
            "script": "Latin",
            "sentence": '"Der Wissenschaftler entdeckte eine neue Art"',
            "tokens": ["Der", " Wissen", "schaft", "ler", " ent", "deck", "te", " eine", " neue", " Art"],
            "fert": 10,
            "color": "#c05621",
            "y": 2.5,
            "is_amharic": False
        },
        {
            "lang": "Amharic",
            "script": "Ge'ez",
            "sentence": '"ሳይንቲስቱ አዲስ ዝርያ አገኘ"  (Multilingual BPE with Ge\'ez merges, e.g., Glot500 / Qwen)',
            "tokens": ["ሳይ", "ንቲ", "ስቱ", " አ", "ዲስ", " ዝር", "ያ", " አ", "ገኘ"],
            "fert": 9,
            "color": "#2ca02c",
            "y": 0.8,
            "is_amharic": True
        }
    ]

    for row in rows:
        y = row["y"]
        color = row["color"]
        
        # Language header & original text
        ax.text(-0.6, y + 0.38, f'{row["lang"]} ({row["script"]})', ha='left', va='center', 
                fontsize=10.5, fontweight='bold', color='#222')
        
        if row["is_amharic"] and ethiopic_font:
            ax.text(2.6, y + 0.38, '"ሳይንቲስቱ አዲስ ዝርያ አገኘ"', fontproperties=ethiopic_font, 
                    fontsize=10.5, color='#444', va='center')
            ax.text(6.4, y + 0.38, '(Tokenized in Native Ge\'ez Script)', fontsize=8.5, 
                    fontstyle='italic', color='#2ca02c', va='center', fontweight='bold')
        else:
            ax.text(2.6, y + 0.38, row["sentence"], ha='left', va='center', 
                    fontsize=9.0, fontstyle='italic', color='#555')

        # Fertility badge
        ax.text(11.8, y - 0.05, f'F = {row["fert"]}', ha='center', va='center', fontsize=9, 
                color=color, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.35', facecolor=color, alpha=0.12, edgecolor=color, linewidth=0.9))

        # Token boxes
        x = -0.6
        box_scale = min(0.95, 11.2 / len(row["tokens"]))
        for tok in row["tokens"]:
            width = max(0.60, len(tok) * 0.22) * box_scale
            ax.add_patch(patches.FancyBboxPatch((x, y - 0.32), width, 0.52,
                boxstyle="round,pad=0.04", facecolor=color, alpha=0.12, 
                edgecolor=color, linewidth=0.75))
            
            if row["is_amharic"] and ethiopic_font:
                ax.text(x + width/2, y - 0.06, tok.strip(), 
                        fontproperties=ethiopic_font, ha='center', va='center', fontsize=9.5, color='#111')
            else:
                ax.text(x + width/2, y - 0.06, tok.strip() if tok.strip() else '·', 
                        ha='center', va='center', fontsize=7.6, fontfamily='monospace', color='#111')
            x += width + 0.08

    # Explanatory note at the bottom
    ax.text(-0.6, -0.42, 
            "* Note: When the tokenizer includes Ge'ez vocabulary (e.g. Glot500/Qwen), tokens remain in native script. Without script merges (e.g. LLaMA), fertility surges to 38+ byte tokens.",
            fontsize=8.0, color='#666', fontstyle='italic')

    # Title
    ax.text(5.6, 5.45, 'BPE Tokenization of the Same Sentence Across Languages (Case 2: Native Script Subwords)', 
            ha='center', va='center', fontsize=11, fontweight='bold', color='#111')
    ax.text(5.6, 5.12, '(Fertility F = number of subword tokens produced per sentence)', 
            ha='center', va='center', fontsize=8.5, color='#666')

    # Arrow annotation on far right
    ax.annotate('', xy=(13.1, 0.6), xytext=(13.1, 4.4),
                arrowprops=dict(arrowstyle='->', color='#2ca02c', lw=1.5, linestyle='--'))
    ax.text(13.5, 2.5, 'Subword\nsegmentation', ha='center', va='center', fontsize=8.5, 
            color='#2ca02c', fontweight='bold', fontstyle='italic')

    fig.tight_layout()
    fig.savefig(os.path.join(out_dir, 'fig_bpe_example_case2_script_subwords.pdf'), bbox_inches='tight')
    fig.savefig(os.path.join(out_dir, 'fig_bpe_example_case2_script_subwords.png'), bbox_inches='tight', dpi=200)
    plt.close(fig)
    print("✓ Generated Case 2 (Native Ge'ez Subwords)")


if __name__ == "__main__":
    generate_case1()
    generate_case2()
