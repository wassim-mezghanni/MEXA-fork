# MEXA — Multilingual Evaluation via Cross-Lingual Alignment

## Thesis Context
This repository is part of a **Bachelor's thesis** on evaluating the multilingual capabilities of English-centric Large Language Models. It implements and extends the MEXA metric introduced in the ACL 2025 Findings paper ([arXiv 2410.05873](http://arxiv.org/abs/2410.05873)).

**Core idea:** English-centric LLMs semantically use English as a pivot language in their intermediate layers. MEXA measures the alignment between non-English languages and English using parallel sentences, estimating how well language understanding transfers from English to other languages.

## Tech Stack

### ML Pipeline (Python)
- **Deep Learning:** PyTorch
- **Model Loading:** Hugging Face Transformers (`AutoTokenizer`, `AutoModelForCausalLM`)
- **Numerical Computing:** NumPy, SciPy
- **Data Processing:** Pandas, JSON, Pickle
- **Supported Models:** Llama 3.1 (8B, 70B), Gemma, Mistral, OLMo, and any HF-compatible causal LM

### Dashboard (React + TypeScript)
- **Framework:** React 18 + TypeScript
- **Build:** Vite 5
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Drag & Drop:** @dnd-kit

## Repository Structure
```
MEXA-fork/
├── embed_extractor.py          # Extract layer-wise embeddings from LLMs
├── compute_mexa.py             # Compute MEXA alignment scores (cosine similarity)
├── 2025.findings-acl.1385.pdf  # Published ACL paper
│
├── dashboard/                  # Interactive visualization dashboard
│   ├── src/
│   │   ├── App.jsx             # Main app + routing
│   │   ├── pages/              # Overview, MexaFindings
│   │   ├── components/         # Sidebar, ModelComparison, ScoreRanking, Heatmap
│   │   ├── charts/             # BarChart, LineChart, DonutChart, CorrelationMatrix, LayerwiseHeatmap, DataTable, ...
│   │   ├── form/               # Input, Select, Checkbox, LayerSlider, DatePicker
│   │   ├── ui/                 # Button, Card, Modal, Accordion, Skeleton, Tabs, ...
│   │   └── utils/              # Utility functions
│   └── public/data/            # Pre-computed CSV scores + language metadata JSON
│
└── llama3.1_experiment/        # Experiment scripts
    ├── run_local_mac.sh        # Local execution
    ├── run_coma_cluster.slurm  # HPC/SLURM cluster job submission
    └── format_results.py       # Format JSON scores into CSV for dashboard
```

## ML Pipeline
1. **Extract embeddings** — `embed_extractor.py` pulls layer-wise embeddings from LLMs (weighted average or last-token methods)
2. **Compute alignment** — `compute_mexa.py` calculates cosine similarity matrices between language embeddings across all layers
3. **MEXA metric** — Measures diagonal dominance to quantify cross-lingual alignment
4. **Aggregate** — Max-pool scores across layers
5. **Visualize** — Format results into CSV/JSON and display in the dashboard

## Datasets
- **FLORES-200** — 100 sentences from devtest (high-resource parallel corpus)
- **Bible corpus** — 103 sentences across 1,401 languages (massive low-resource coverage)

## Commands

### Dashboard
```bash
cd dashboard
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
```

### ML Scripts
```bash
python embed_extractor.py --model <model_name> --dataset <dataset> --output <path>
python compute_mexa.py --embeddings <path> --output <path>
```

## Style Guidelines (Dashboard)
- Components use TypeScript (`.tsx`) with interfaces extending native HTML attributes
- Tailwind CSS for all styling — follow design tokens in `src/index.css`
- Recharts for all data visualizations
- Lucide React for icons
- Prefer editing existing components over creating new files
