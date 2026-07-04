# Thesis Structure

**Working title:** Evaluating the Multilingual Capabilities of English-Centric LLMs via Cross-Lingual Alignment (MEXA)

This outline follows the supervisor's writing guidelines (`notes_on_writing.md`): balanced Background / Methodology / Results chapters, named experimental settings, a contributions bullet list and outline paragraph at the end of the introduction, and limitations plus future work in the conclusion.

---

## Chapter 1 — Introduction 

### 1.1 Motivation
LLMs are English-centric; evaluating multilingual ability is hard for low-resource languages where benchmarks do not exist. MEXA offers a benchmark-free proxy via cross-lingual alignment with English as a pivot.

### 1.2 Research Questions
- **RQ1:** Can the MEXA results of the original paper be reproduced?
- **RQ2:** Does MEXA generalise to model families not studied in the paper (Qwen3, Apertus)?
- **RQ3:** How does MEXA behave on encoder/embedding models, which have no causal pivot structure?
- **RQ4:** How do Mixture-of-Experts models (Mixtral 8x7B, 8x22B) compare to dense models of similar size?
- **RQ5:** Which languages consistently align poorly across all models, and why (script, resource level, tokenization)?

### 1.3 Contributions
Bullet list (required by the writing notes):
- Reproduction of the original MEXA results
- Extension to new model families and architectures (Qwen3, Apertus, encoders/embedding models)
- Study of Mixture-of-Experts models
- Cross-experiment analysis of poorly aligned languages
- Interactive dashboard as a deliverable

### 1.4 Thesis Outline
One paragraph: "Chapter 2 covers …, Chapter 3 describes …, …"

---

## Chapter 2 — Background and Related Work 

Organised by concept, building up to MEXA — not a list of papers.

### 2.1 Multilingual Language Models
Decoder-only LLMs (Llama, Mistral, Qwen) vs. multilingual encoders (XLM-R, Glot500, mmBERT) vs. sentence embedding models (LaBSE, mE5); dense vs. Mixture-of-Experts architectures. This motivates the model selection in Chapter 3.

### 2.2 English as a Pivot Language
Interpretability literature on English-centric internal representations ("LLMs think in English"); intermediate-layer semantics.

### 2.3 Multilingual Evaluation
Benchmark-based evaluation (Belebele, ARC and their limits for low-resource languages) vs. alignment-based / benchmark-free approaches.

### 2.4 The MEXA Metric
The method in detail: parallel sentences, layer-wise embeddings, cosine similarity, diagonal dominance, layer pooling. Numbered equations referenced with `\eqref{}`.

### 2.5 Parallel Corpora
FLORES-200 and the Bible corpus, with citations.

---

## Chapter 3 — Methodology 

Every experimental setting is named here so the Results chapter can refer back to it.

### 3.1 The MEXA Pipeline
Implementation: embedding extraction (weighted-average vs. last-token), similarity computation, aggregation (mean/max pooling). Include a pipeline figure (vectorised PDF).

### 3.2 Models
One subsection per group, each with explicit motivation ("we consider X because …"):

- **3.2.1 Reproduction models** — Llama 3.1 8B, Mistral 7B v0.3 (from the original paper).
- **3.2.2 New decoder families** — Qwen3 (0.6B / 1.7B / 4B / 8B — also a scaling axis), Qwen3.5 9B, Apertus (Mini 4B, 8B).
- **3.2.3 Encoder and embedding models** — XLM-R base/large, Glot500, mmBERT, LaBSE, mE5, Qwen3-Embedding 0.6B / 4B / 8B; how MEXA is adapted to non-causal models (methodological contribution — be explicit about what changes).
- **3.2.4 Mixture-of-Experts models** — Mixtral 8x7B and 8x22B, motivated by whether sparse routing affects cross-lingual alignment.

Include a summary table of all models (parameters, architecture, training data language coverage) — booktabs.

### 3.3 Datasets
FLORES-200 (100 devtest sentences) and Bible (103 sentences, 1,401 languages); why both (high-resource breadth vs. massive low-resource coverage).

### 3.4 Experimental Settings
Named settings referenced throughout Chapter 4:

| Setting | Description |
|---|---|
| **Repro** | Paper models on FLORES / Bible |
| **Families** | Qwen3 / Qwen3.5 / Apertus |
| **Enc** | Encoder and embedding models |
| **MoE** | Mixtral 8x7B / 8x22B |
| **Pivot** | Arabic / French / German pivots instead of English |
| **Downstream** | Correlation with Belebele / ARC |

### 3.5 Evaluation and Analysis Methods
Layer-wise analysis, correlation with downstream benchmarks (Pearson/Spearman), tokenizer fertility, cross-experiment identification of poorly aligned languages.

### 3.6 Implementation and Compute
Hardware (SLURM cluster), hyperparameters, precision — everything needed for reproducibility. Brief description of the dashboard (details in Appendix).

---

## Chapter 4 — Results and Discussion 

One section per named setting. Each opens with one or two sentences restating the setting and motivation (with a reference to the corresponding Methodology section), then focuses on trends and answers to the RQs — not table narration.

### 4.1 Reproduction of the Original Results (Repro)
Do the scores match the paper? Where do they deviate and why?

### 4.2 New Model Families (Families)
Qwen3 scaling behaviour (0.6B → 8B); Apertus vs. Qwen vs. Llama; are the paper's conclusions family-specific?

### 4.3 Encoder and Embedding Models (Enc)
How alignment profiles differ from decoders (e.g., the layer at which alignment peaks); do explicitly multilingual encoders beat English-centric decoders?

### 4.4 Mixture-of-Experts Models (MoE)
Mixtral 8x7B / 8x22B vs. dense counterparts.

### 4.5 Non-English Pivots (Pivot)
Is English special, or does any high-resource language work as a pivot?

### 4.6 Cross-Experiment Language Analysis
Languages consistently poorly aligned across all models; connection to script, resource level, and tokenizer fertility. Synthesis section for RQ5.

### 4.7 Validity of MEXA (Downstream)
Correlation with Belebele / ARC across the extended model set: does MEXA remain a good proxy outside the original paper's models?

Formatting: bold the best results in tables; every figure/table gets a number and is referenced in the text.

---

## Chapter 5 — Conclusion 

### 5.1 Summary


### 5.2 Limitations
E.g., 100–103 sentences per language, single embedding-extraction choices, no training-data control, downstream benchmarks only available for higher-resource languages.

### 5.3 Future Work
E.g., larger MoE coverage, instruction-tuned models, more pivots, other parallel corpora.

---

## Appendix
Full per-language score tables, additional layer-wise heatmaps, extra projection plots, dashboard screenshots and usage. Each appendix item must be mentioned somewhere in the main text.

## References
ACL-style `(Author et al., year)`, peer-reviewed versions preferred:
- MEXA: cite the ACL 2025 Findings paper, not the arXiv version
- FLORES-200: via the NLLB paper
- Each model: via its technical report

---

