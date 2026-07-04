# Abstract

Large Language Models (LLMs) are trained on English-centric corpora and 
they are increasingly deployed in multilingual settings. Understanding how well these models
actually transfer their capabilities to non-English languages — and *how* to measure this
reliably without expensive, task-specific benchmarks — remains an open problem. This thesis
investigates the multilingual capabilities of English-centric LLMs through the lens of
**cross-lingual alignment**.

The work builds on and extends **MEXA** (Multilingual Evaluation via Cross-Lingual
Alignment), a metric introduced in the ACL 2025 Findings paper. MEXA rests on the observation
that English-centric LLMs implicitly use English as a *pivot* language in their intermediate
layers. Using parallel sentences that share the same meaning across languages, MEXA extracts
layer-wise embeddings, computes cosine-similarity matrices between each language and English,
and quantifies alignment through the **diagonal dominance** of these matrices — the degree to
which a sentence is most similar to its own translation rather than to unrelated sentences.
Scores are aggregated across layers (max-pooling) to produce a single alignment estimate per
language, which serves as a evaluation for how well language understanding transfers from English.

To study this ´, the thesis applies the MEXA pipeline across model families and
scales. We evaluate the **Qwen3** family at multiple sizes (0.6B, 1.7B, 4B, 8B and larger
variants) alongside **Llama 3.1** ,**Mistral** models, allowing a controlled comparison of how
cross-lingual alignment evolves with model size and architecture. Experiments are run on two
complementary parallel corpora: **FLORES-200**, a high-resource benchmark and a large
**Bible corpus** covering a long tail of low-resource languages. Results are computed on an
HPC/SLURM cluster and made explorable through an interactive React/TypeScript dashboard that
visualizes layer-wise heatmaps, score rankings and model comparisons.

The thesis contributes (i) a reproducible, model-agnostic implementation of the MEXA pipeline,
(ii) a systematic comparison of cross-lingual alignment across the Models families and
across model scales, (iii) an analysis of how alignment differs between high- and low-resource
languages, and (iv) a dashboard that makes these findings interpretable. Together, these
results clarify the extent to which English-centric LLMs generalize across languages and
demonstrate that alignment-based metrics offer a cheap, label-free alternative to
downstream multilingual evaluation.


