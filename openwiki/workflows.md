# Workflows

## 1) Run an experiment
Experiment folders are organized by model family and dataset variant. They usually contain:

- a SLURM submission script, such as `run_coma_cluster.slurm`
- optional local runner scripts such as `run_local_mac.sh` or `run_local.ps1`
- raw logs for stdout/stderr
- generated language score files in `scores/` or `scores_100/`

The recent git history shows the repo expanding through repeated experiment additions for Llama 3.1, Mistral, Mixtral, Qwen3, Qwen3.5, LaBSE, XLM-R, Glot500, mmBERT, and Apertus.

## 2) Format score outputs
Use `shared/format_results.py` to convert per-language JSON output into a dashboard-ready CSV.

Typical flow:

1. Run `compute_mexa.py` for a model/dataset pair.
2. Collect the resulting per-language JSON files.
3. Run the shared formatter with the model name and output CSV path.
4. Copy or generate the CSV into `dashboard/public/data/`.

The formatter computes the max and mean from each JSON file and emits a row per language. It also prints summary statistics for the run.

## 3) Generate projections
Use `compute_projections.py` when you need PCA/t-SNE visualizations for a model's embeddings.

It reads embedding pickle files from a directory, computes language means per layer, then writes a single JSON document containing:

- languages in processing order
- number of layers
- per-layer projection coordinates
- PCA variance ratios

## 4) Work with the dashboard
Typical dashboard workflow:

- `cd dashboard`
- `npm install` if dependencies are missing
- `npm run dev` for local development
- `npm run build` before publishing changes
- `npm run lint` to catch React/TypeScript issues

The current app shell uses React Router and a large sidebar. When adding a new analysis page, update both the route table in `dashboard/src/App.tsx` and the navigation groups in `dashboard/src/components/Sidebar.tsx`.

## 5) Research / analysis helpers
The `scratch/` directory contains one-off scripts for analysis, averaging, exploration, and ranking checks. These are useful as provenance for how summary statistics were derived, but they are not the primary user-facing workflow.

## Things future agents should watch

- Many file names encode model, dataset, and sample-count information. Preserve those naming conventions when adding new results.
- Generated outputs are part of the analysis surface; changing them usually requires coordinating the downstream CSV and projection files.
- The dashboard consumes static data from `dashboard/public/data/`, so any new experiment is incomplete until its CSV/JSON artifacts exist there.
