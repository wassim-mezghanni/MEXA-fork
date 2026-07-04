# Architecture

This repository has two connected layers:

1. **Evaluation pipeline in Python**
2. **Interactive analysis dashboard in React/TypeScript**

They are glued together by generated score files and projection files under `dashboard/public/data/`.

## Pipeline overview

### 1) Extract embeddings
`embed_extractor.py` reads parallel text data and writes per-language pickle files containing sentence embeddings for each layer. The README describes two embedding strategies:

- `embd_weighted` — token-position weighted average
- `embd_lasttoken` — last-token embedding

### 2) Compute MEXA scores
`compute_mexa.py` loads the pivot language and target language embeddings, builds per-layer cosine-similarity matrices, and computes the MEXA alignment score for each layer by checking whether the diagonal entry is larger than the row and column maxima.

### 3) Aggregate results for the dashboard
`shared/format_results.py` converts per-language JSON scores into a CSV with columns like `code`, `<MODEL_NAME>_max`, `<MODEL_NAME>_mean`, and `avg`. The dashboard reads these CSVs to build overview charts and ranking views.

### 4) Produce visualization projections
`compute_projections.py` computes PCA and t-SNE projections for each layer and writes JSON for the dashboard's embedding-projection visualization.

## Dashboard architecture

The dashboard is a Vite app with React Router. `dashboard/src/App.tsx` wires together the app shell and route pages. The sidebar organizes content by:

- global analysis views
- dataset-level views
- model-family findings pages
- validation and comparison tools

The overview page (`dashboard/src/pages/Overview.tsx`) is the main synthesis page. It combines:

- score tables and model comparisons
- score-vs-size analysis
- histograms and ranked views
- low-resource, fertility, tokenization, and script analyses

`dashboard/src/pages/MexaFindings.tsx` and `dashboard/src/pages/RankingValidation.tsx` provide deeper analysis views for cross-lingual behavior and statistical validation.

## Important source relationships

- `embed_extractor.py` → generates embeddings consumed by `compute_mexa.py` and `compute_projections.py`
- `compute_mexa.py` → writes JSON score files consumed by `shared/format_results.py`
- `shared/format_results.py` → writes CSVs in `dashboard/public/data/`
- `compute_projections.py` → writes projection JSON consumed by the dashboard projection components
- `dashboard/src/pages/Overview.tsx` → central consumer of the generated CSVs
- `dashboard/src/pages/RankingValidation.tsx` → compares max vs. mean scores and validates ranking behavior

## Model and dataset scope

The repo currently covers these major model families:

- Llama 3.1 8B
- Mistral 7B v0.3
- Mixtral 8x7B
- Qwen3 8B, 4B, 1.7B, 0.6B
- Qwen3.5 9B
- Apertus 8B and Apertus mini 4B
- XLM-RoBERTa base/large
- LaBSE, Multilingual E5, mmBERT, Qwen3 embeddings, Glot500

The main datasets are FLORES-200 and Bible/sPBC, with sub-views for table1 variants and full-dataset runs.

## Things to watch when changing architecture

- Keep the generated-data contract stable: dashboard pages assume CSV and JSON filenames that match the existing patterns under `dashboard/public/data/`.
- The dashboard has accumulated several model-family routes; route names and sidebar labels must stay aligned with page imports in `App.tsx` and links in `Sidebar.tsx`.
- Some helper scripts in `scratch/` and old per-experiment formatters exist for history, but the shared formatter is the canonical aggregation path now.
