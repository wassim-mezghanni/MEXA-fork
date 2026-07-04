# OpenWiki Quickstart

This repository documents and implements **MEXA**: **M**ultilingual **E**valuation via **Cross**-Lingual **A**lignment. The core idea is that English-centric LLMs often use English as a pivot in intermediate representations, and that alignment between English and other languages can help estimate multilingual capability.

Start here, then follow the section pages below:

- [Architecture](architecture.md)
- [Workflows](workflows.md)
- [Data and results](data-and-results.md)
- [Dashboard](dashboard.md)

## What this repository contains

The repo is split into three main areas:

1. **ML / evaluation pipeline** — Python scripts that extract embeddings, compute MEXA alignment scores, and generate projection artifacts.
2. **Research dashboard** — a React + TypeScript + Vite app under `dashboard/` that visualizes scores, comparisons, rankings, and experiment findings.
3. **Experiment artifacts** — model-specific run directories, SLURM submission scripts, score JSON files, CSV summaries, and projection files for multiple model families and datasets.

The primary datasets used in the repo are:

- **FLORES-200** — parallel data used for multilingual evaluation
- **Bible / sPBC** — a large multilingual parallel corpus for low-resource coverage

## Best starting points in source

- `README.md` — high-level project description and command examples
- `.claude/CLAUDE.md` — concise project concept and repository structure
- `compute_mexa.py` — computes per-language alignment scores
- `compute_projections.py` — creates PCA/t-SNE projection data for the dashboard
- `shared/format_results.py` — converts score JSON into dashboard CSVs
- `dashboard/src/App.tsx` — dashboard routing and app shell
- `dashboard/src/pages/Overview.tsx` — central overview of models, datasets, and score comparisons
- `dashboard/src/pages/MexaFindings.tsx` — MEXA analysis views and supporting charts
- `dashboard/src/pages/RankingValidation.tsx` — statistical validation and correlation exploration

## Repository layout at a glance

- `dashboard/` — browser UI for reading results
- `shared/` — helpers shared across experiment formatting and aggregation
- `scratch/` — ad hoc analysis scripts used during exploration
- `*_experiment/` folders — model/dataset-specific runs, logs, and formatted outputs
- `submit_*.sh`, `run_coma_cluster.slurm` — orchestration for local and cluster execution
- `skills/` and `.skills/` — reusable instruction material for agents and contributors

## How to work safely here

- Prefer the shared formatter in `shared/format_results.py` over older per-experiment format scripts when generating dashboard CSVs.
- Treat `dashboard/public/data/` as generated analysis input for the UI; changes there usually come from pipeline reruns.
- Many folders contain raw logs and intermediate artifacts from experiments. Update docs by describing patterns and workflows, not every file.
- The root `.env` file exists, but it must not be read or documented.

## Navigation map for future edits

- Change a compute script? Read [Architecture](architecture.md) and [Workflows](workflows.md).
- Add a new model, dataset, or experiment output? Read [Data and results](data-and-results.md).
- Change the UI, a page, or a chart? Read [Dashboard](dashboard.md).

## Recent repo context

Recent commits show the project evolving from a basic MEXA dashboard into a broader evaluation workspace with more model families, more datasets, projection data, ranking validation, and experiment automation. The current codebase includes both decoder-only and encoder-style baselines, plus Apertus and Qwen3 family runs.
