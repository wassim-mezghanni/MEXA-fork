# Data and Results

## Core datasets

### FLORES-200
FLORES-200 is the main high-resource parallel benchmark used in the repo. The README states that the project commonly uses the first 100 sentences from the devtest split for the standard evaluation setup, and the repository also contains larger FLORES variants such as full-dataset runs and table1-specific subsets.

### Bible / sPBC
The Bible corpus used here is the multilingual parallel Bible dataset (sPBC). The README notes it contains 103 sentences across 1,401 languages, making it the low-resource counterpart to FLORES in this project.

## Result artifact types

The repository uses several related artifact layers:

- **Embedding pickles** — intermediate outputs from `embed_extractor.py`
- **Per-language MEXA JSON** — layerwise alignment scores from `compute_mexa.py`
- **Formatted CSV summaries** — produced by `shared/format_results.py`
- **Projection JSON** — produced by `compute_projections.py`
- **Dashboard CSV/JSON inputs** — stored under `dashboard/public/data/`
- **Raw logs** — stdout/stderr for each experiment run

## Dashboard data contract

`dashboard/src/App.tsx` and `dashboard/src/pages/Overview.tsx` expect static files in `dashboard/public/data/`, including:

- `language_names.json`
- `flores-max-belebele.csv`
- `flores-mean-arc.csv`
- `bible-max-belebele.csv`
- `bible-mean-arc.csv`
- projection JSON files matching the model/dataset route names

`RankingValidation.tsx` additionally uses result CSVs and compares model families by max vs. mean behavior.

## Model families represented in the data

The repository has outputs for both decoder-style and encoder-style systems:

- decoder-style LLMs: Llama 3.1, Mistral, Mixtral, Qwen3, Qwen3.5, Apertus
- encoder-style baselines: XLM-RoBERTa, LaBSE, Multilingual E5, mmBERT, Glot500, Qwen3 embeddings

## Naming conventions

Most artifact names encode:

- model family
- parameter size or variant
- dataset or benchmark slice
- sample count, when relevant (`100`, `2000`, `full`)
- pivot-specific experiments, when relevant

Examples visible in the repo include `flores_table1_100_qwen3_8b_results.csv`, `projections_full_flores_labse.json`, and folders such as `Qwen3-Embedding-8B/FLORES_full_experiment/`.

## Why this matters

The data layer is the main contract between experimentation and the dashboard. If a source file or filename changes, downstream pages may stop loading even if the compute code is correct.

## Practical guidance

- When adding a new experiment, make sure both the raw JSON/CSV artifacts and the dashboard-facing copies are generated.
- Prefer updating the shared formatter rather than adding more one-off `format_results.py` copies.
- Keep generated files consistent with the route and sidebar naming in the dashboard.
