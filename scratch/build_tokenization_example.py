"""Generate the worked tokenization example used by the TokenizationDemo UI component.

Takes the first parallel FLORES sentence in three forms (English, Minangkabau-Latin,
Minangkabau-Arabic), tokenizes each with the Qwen3 tokenizer, and writes the token
pieces + counts to dashboard/public/data/tokenization_example.json.
"""
import json
import os

from transformers import AutoTokenizer

ROOT = "/Users/wassim/MEXA-fork"
FLORES_DIR = os.path.join(ROOT, "flores200_dataset/devtest")
OUT = os.path.join(ROOT, "dashboard/public/data/tokenization_example.json")
TOKENIZER = "Qwen/Qwen3-0.6B"

FORMS = [
    ("English", "eng_Latn", "Latin"),
    ("Minangkabau · Latin", "min_Latn", "Latin"),
    ("Minangkabau · Arabic", "min_Arab", "Arabic"),
]


def first_line(code):
    with open(os.path.join(FLORES_DIR, f"{code}.devtest"), encoding="utf-8") as f:
        return f.readline().strip()


def main():
    tok = AutoTokenizer.from_pretrained(TOKENIZER)
    forms, eng_count = [], None
    for label, code, script in FORMS:
        text = first_line(code)
        ids = tok(text, add_special_tokens=False)["input_ids"]
        pieces = [tok.decode([i]) for i in ids]
        if eng_count is None:
            eng_count = len(pieces)
        forms.append({
            "label": label, "code": code, "script": script, "text": text,
            "tokens": pieces, "count": len(pieces),
            "multiplier": round(len(pieces) / eng_count, 1),
        })

    json.dump({"tokenizer": TOKENIZER, "sentence_id": 1, "forms": forms},
              open(OUT, "w"), ensure_ascii=False, indent=1)
    print(f"wrote {OUT}")
    for f in forms:
        print(f"  {f['label']:24s} count={f['count']:3d}  x{f['multiplier']}")


if __name__ == "__main__":
    main()
