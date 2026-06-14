"""Build full dataset-detail metadata for the FLORES and Bible dashboard pages.

Scans the actual corpus directories to derive: language inventory (code, name,
script), per-script language counts, sentence counts, and dataset-level facts.

Output (dashboard/public/data/):
  - dataset_details_flores.json
  - dataset_details_bible.json
"""
import os
import glob
import json

ROOT = "/Users/wassim/MEXA-fork"
DATA_DIR = os.path.join(ROOT, "dashboard/public/data")
LANG_NAMES = json.load(open(os.path.join(DATA_DIR, "language_names.json"), encoding="utf-8"))

# Mirror of dashboard/src/utils/scriptNames.ts
SCRIPT_NAMES = {
    "Arab": "Arabic", "Armn": "Armenian", "Beng": "Bengali", "Cans": "Canadian Syllabics",
    "Copt": "Coptic", "Cyrl": "Cyrillic", "Deva": "Devanagari", "Ethi": "Ethiopic (Geʿez)",
    "Geor": "Georgian", "Grek": "Greek", "Gujr": "Gujarati", "Guru": "Gurmukhi (Punjabi)",
    "Hang": "Hangul (Korean)", "Hani": "Han (Chinese)", "Hans": "Han (Simplified)",
    "Hant": "Han (Traditional)", "Hebr": "Hebrew", "Jpan": "Japanese", "Khmr": "Khmer",
    "Knda": "Kannada", "Laoo": "Lao", "Latn": "Latin", "Limb": "Limbu", "Mlym": "Malayalam",
    "Mymr": "Myanmar (Burmese)", "Olck": "Ol Chiki (Santali)", "Orya": "Odia (Oriya)",
    "Sinh": "Sinhala", "Syrc": "Syriac", "Taml": "Tamil", "Telu": "Telugu",
    "Tfng": "Tifinagh (Berber)", "Thai": "Thai", "Tibt": "Tibetan",
}

META = {
    "flores": {
        "id": "flores",
        "name": "FLORES-200",
        "fullName": "FLORES-200 — Facebook Low Resource MT Evaluation (devtest split)",
        "source": "Meta AI / NLLB · github.com/facebookresearch/flores",
        "license": "CC-BY-SA 4.0",
        "description": (
            "High-quality, professionally translated parallel sentences drawn from Wikimedia "
            "(Wikinews, Wikijunior, Wikivoyage). Every language contains the same sentences, "
            "making it a true many-to-many parallel corpus. Used here as the high-resource "
            "benchmark for cross-lingual alignment."
        ),
        "subsets": [
            {"name": "Table 1 (100)", "langs": "116", "sents": "100", "note": "Belebele-overlap subset for fast reproduction of the paper"},
            {"name": "Table 1 (2000)", "langs": "116", "sents": "≤1012", "note": "Same languages, full devtest sentences"},
            {"name": "Full", "langs": "204", "sents": "≤1012", "note": "All FLORES-200 languages, full devtest"},
        ],
        "dir": os.path.join(ROOT, "flores200_dataset/devtest"),
        "ext": ".devtest",
    },
    "bible": {
        "id": "bible",
        "name": "Bible (sPBC)",
        "fullName": "Super Parallel Bible Corpus — 103-verse subset",
        "source": "cis-lmu/sPBC · huggingface.co/datasets/cis-lmu/sPBC",
        "license": "Per-translation (research use); compilation by cis-lmu",
        "description": (
            "A massively multilingual parallel corpus of Bible verses covering the long tail of "
            "low-resource languages. The 103-verse subset provides the same verses across every "
            "language, used here as the low-resource counterpart to FLORES. Translations are "
            "overwhelmingly in romanized/Latin orthography regardless of a language's native script."
        ),
        "subsets": [
            {"name": "Table 1", "langs": "101", "sents": "103", "note": "Downstream-overlap subset matching the paper"},
            {"name": "Full", "langs": "1401", "sents": "103", "note": "All available sPBC languages"},
        ],
        "dir": os.path.join(ROOT, "bible_dataset/103"),
        "ext": ".txt",
    },
}


def build(cfg):
    files = sorted(glob.glob(os.path.join(cfg["dir"], f"*{cfg['ext']}")))
    languages, script_counts = [], {}
    sents_per_lang = 0
    for path in files:
        code = os.path.basename(path)[: -len(cfg["ext"])]
        iso, _, script = code.partition("_")
        if not script:
            continue
        # sentence count from English pivot (all files are parallel / equal length)
        if code == "eng_Latn":
            with open(path, encoding="utf-8") as f:
                sents_per_lang = sum(1 for line in f if line.strip())
        languages.append({
            "code": code,
            "iso": iso,
            "name": LANG_NAMES.get(iso, iso),
            "script": script,
            "scriptName": SCRIPT_NAMES.get(script, script),
        })
        script_counts[script] = script_counts.get(script, 0) + 1

    languages.sort(key=lambda x: x["name"].lower())
    scripts = sorted(
        ({"code": s, "name": SCRIPT_NAMES.get(s, s), "count": c,
          "pct": round(100 * c / len(languages), 1)} for s, c in script_counts.items()),
        key=lambda x: -x["count"],
    )

    out = {
        "id": cfg["id"], "name": cfg["name"], "fullName": cfg["fullName"],
        "source": cfg["source"], "license": cfg["license"], "description": cfg["description"],
        "numLanguages": len(languages),
        "numScripts": len(scripts),
        "sentsPerLang": sents_per_lang,
        "subsets": cfg["subsets"],
        "scripts": scripts,
        "languages": languages,
    }
    out_path = os.path.join(DATA_DIR, f"dataset_details_{cfg['id']}.json")
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"[ok] {cfg['id']}: {len(languages)} langs, {len(scripts)} scripts, "
          f"{sents_per_lang} sents/lang -> {os.path.basename(out_path)}")


for cfg in META.values():
    build(cfg)
