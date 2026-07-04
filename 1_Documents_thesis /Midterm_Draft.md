# Mid-term Thesis Progress: Methodology & Results Draft

This document contains a structured draft of the **Methodology**, **Results**, and **References** sections for the Mid-term registration report. It includes both clean **Markdown format** (for quick review/web view) and **LaTeX format** (compatible with the `tum-thesis-latex` template) for direct copy-pasting.

---

# SECTION 1: Summary of the Methodology (Datasets & Models)

## 1.1 Methodology Summary (Markdown Bullet Points)

*   **Core Objective**: Evaluating the cross-lingual capabilities of English-centric Large Language Models (LLMs) without relying on expensive monolingual downstream tasks. This is achieved via **MEXA** (Multilingual Evaluation via Cross-Lingual Alignment), which measures how well non-English language representations align with English in the hidden layers of decoder-only LLMs.
*   **Pivot Hypothesis**: The methodology builds on the theory that English-centric models implicitly use English as an internal semantic "pivot" language in their intermediate layers to process non-English inputs.
*   **Alignment Formulation (Retrieval-based P@1)**:
    *   For parallel sentences in a target language $L_1$ and English $L_2$ (the pivot), sentence embeddings $e_{L_1}^{(l)}$ and $e_{L_2}^{(l)}$ are extracted at each layer $l$.
    *   A cosine similarity matrix $C(L_1, L_2, m, l)$ of size $n \times n$ is computed. The diagonal elements $c_{ii}(l)$ represent parallel sentence similarities, while off-diagonals represent non-parallel pairs.
    *   To overcome the **anisotropy** (representation collapse) and **hubness** problems of absolute cosine similarity in LLMs, MEXA uses a robust comparative metric. The binary alignment score for a sentence pair is $1$ if the parallel cosine similarity is strictly greater than all non-parallel similarities in both its row and column (bidirectional retrieval/precision at 1); otherwise, it is $0$.
    *   The total alignment score for layer $l$ is the average of these binary scores:
        $$\mu C(L_1, L_2, m, l) = \frac{1}{n} \sum_{i=1}^{n} \mathbb{1} \left( c_{ii}(l) > \max_{j \neq i} \{ c_{ij}(l), c_{ji}(l) \} \right)$$
*   **Sentence Embedding Extraction Strategies**:
    *   **Last Token**: Extracting the hidden state of the final token in the sentence (which in causal attention theoretically aggregates preceding context).
    *   **Weighted Token Average (Position-Weighted)**: To mitigate causal attention's bias towards early tokens and the diminishing representational context of initial words, tokens are weighted linearly by their position:
        $$e_l = \sum_{t=1}^{T} w_t h_{t}^{(l)}, \quad \text{where } w_t = \frac{t}{\sum_{k=1}^{T} k}$$
*   **Layer-wise Aggregation**:
    *   **Mean-Pooling ($\mu_{\text{Mean}}$)**: Averaging the retrieval alignment scores across all layers.
    *   **Max-Pooling ($\mu_{\text{Max}}$)**: Taking the maximum alignment score achieved across all layers (usually peaking in the middle-to-late layers).
*   **Datasets Used**:
    *   **FLORES-200**: High-quality parallel sentences translated from Wikimedia.
        *   *Table 1 Subset*: 116 languages overlapping with Belebele (100 parallel sentences used for computational efficiency; validated to have nearly zero probability of random high retrieval scores).
        *   *FLORES Full*: 204 languages (2,000 sentences devtest).
    *   **Parallel Bible (sPBC - Super Parallel Bible Corpus)**: Extensive parallel dataset spanning a massive language variety.
        *   *Table 1 Subset*: 101 languages (103 parallel sentences/verses).
        *   *Bible Full*: sPBC dataset covering all available low-resource languages.
*   **Models Evaluated**:
    *   **Llama Family**: `Llama 3.1 8B`, `Meta-Llama-3-8B`, `Llama 2 7B` (and paper-reference `Llama 3.1 70B` to evaluate scaling).
    *   **Mistral Family**: `Mistral-7B-v0.3`.
    *   **Qwen Family**: `Qwen3 8B Base`, `Qwen3.5 9B Base`.
    *   **Apertus Family**: `Apertus 8B` (multilingual model variant).

---

## 1.2 Methodology Summary (LaTeX Code Block)

```latex
\section{Methodology Summary}
\label{sec:methodology}

The core methodology replicates and extends the \textbf{MEXA} (Multilingual Evaluation via Cross-Lingual Alignment) framework proposed by \citet{kargaran2024mexa}. The evaluation procedure is summarized below:

\begin{itemize}
    \item \textbf{Theoretical Foundation}: Autoregressive English-centric LLMs use English as an internal semantic pivot in their intermediate layers to represent multilingual concepts \citep{wendler2024dolllama2}.
    \item \textbf{Mathematical Formulation}: 
    For a target language $L_1$ and pivot language $L_2$ (English) using model $m$ at layer $l$, sentence embeddings are extracted. Rather than absolute cosine similarity, which is susceptible to anisotropy and hubness, alignment is computed as a bidirectional retrieval rate ($P@1$):
    \begin{equation}
        \mu C(L_1, L_2, m, l) = \frac{1}{n} \sum_{i=1}^{n} \mathbb{1} \left( c_{ii}(l) > \max_{j \in \{1,\dots,n\}\setminus\{i\}} \{ c_{ij}(l), c_{ji}(l) \} \right)
    \end{equation}
    where $c_{ij}(l)$ is the cosine similarity between target sentence $i$ and pivot sentence $j$ at layer $l$.
    \item \textbf{Embedding Extraction Methods}:
    \begin{itemize}
        \item \textbf{Last Token}: Embeddings are extracted from the hidden representation of the final token of the input sentence.
        \item \textbf{Weighted Average}: A position-weighted token averaging is implemented to respect causal attention constraints:
        \begin{equation}
            e_l = \sum_{t=1}^{T} w_t h_{t}^{(l)}, \quad \text{where } w_t = \frac{t}{\sum_{k=1}^{T} k}
        \end{equation}
    \end{itemize}
    \item \textbf{Pooling Strategies}: Single scores are aggregated across layers using either Mean Pooling ($\mu_{\text{Mean}}$) or Max Pooling ($\mu_{\text{Max}}$).
    \item \textbf{Datasets}:
    \begin{itemize}
        \item \textbf{FLORES-200}: The devtest set of 116 languages overlapping with Belebele (using both $100$ and $2,000$ sentences for validation) and the full corpus (204 languages).
        \item \textbf{Super Parallel Bible Corpus (sPBC)}: A subset of $101$ languages ($103$ sentences) overlapping with downstream tasks, and the full $1,401$-language dataset.
    \end{itemize}
    \item \textbf{Models under Analysis}: Autoregressive decoder-only models, including the Llama family (\texttt{Llama 3.1 8B}), Mistral (\texttt{Mistral-7B-v0.3}), Qwen family (\texttt{Qwen3 8B}, \texttt{Qwen3.5 9B}), and \texttt{Apertus 8B}.
\end{itemize}
```

---

# SECTION 2: Presenting the Results (Tables & Figures)

## 2.1 Results Table (Markdown)

Below is the complete comparison of computed MEXA scores across our experimental runs and reference baselines from the original paper. 

| Model | FLORES Table 1 <br> (116 langs · 100 sents) | FLORES Table 1 <br> (116 langs · 2000 sents) | Bible Table 1 <br> (101 langs · sPBC) | FLORES Full <br> (204 langs · 2000 sents) | Bible Full <br> (sPBC · all langs) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| | **$\mu_{\text{Max}}$** \| **$\mu_{\text{Mean}}$** | **$\mu_{\text{Max}}$** \| **$\mu_{\text{Mean}}$** | **$\mu_{\text{Max}}$** \| **$\mu_{\text{Mean}}$** | **$\mu_{\text{Max}}$** \| **$\mu_{\text{Mean}}$** | **$\mu_{\text{Max}}$** \| **$\mu_{\text{Mean}}$** |
| **Paper · Llama 3.1 8B** *(Ref)* | 0.6538 \| 0.3963 | — \| — | 0.4212 \| 0.2103 | — \| — | — \| — |
| **Paper · Mistral 7B v0.3** *(Ref)*| 0.4716 \| 0.2642 | — \| — | 0.2606 \| 0.1198 | — \| — | — \| — |
| **Llama 3.1 8B** *(Ours)* | 0.6735 \| 0.4196 | 0.6065 \| 0.3370 | 0.4180 \| 0.2076 | 0.5611 \| 0.3235 | 0.0781 \| 0.0320 |
| **Mistral 7B v0.3** *(Ours)* | 0.4980 \| 0.2878 | 0.4066 \| 0.2127 | 0.2571 \| 0.1179 | 0.4102 \| 0.2232 | 0.0465 \| 0.0181 |
| **Qwen3 8B Base** *(Ours)* | 0.5759 \| 0.3211 | — \| — | 0.2970 \| 0.1350 | 0.4723 \| 0.2509 | 0.0499 \| 0.0186 |
| **Qwen3.5 9B Base** *(Ours)* | 0.7814 \| 0.5557 | — \| — | 0.4821 \| 0.2624 | — \| — | — \| — |
| **Apertus 8B** *(Ours)* | 0.3873 \| 0.1637 | — \| — | 0.4299 \| 0.1896 | 0.3264 \| 0.1267 | 0.0667 \| 0.0237 |

---

## 2.2 Results Table (LaTeX Code Block)

```latex
\section{Experimental Results}
\label{sec:results}

We report the computed MEXA alignment scores ($\mu_{\text{Max}}$ and $\mu_{\text{Mean}}$) across several experimental variants in Table~\ref{tab:mexa_results}. This includes our direct reproductions of the baseline configurations (100 sentences from FLORES and 101 languages from Bible) and scaled sweeps covering the full dataset variants.

\begin{table*}[t]
\centering
\small
\caption{MEXA alignment scores comparing our model runs against reference paper baselines across FLORES and Bible corpus subsets and full sweeps.}
\label{tab:mexa_results}
\begin{tabular}{l|cc|cc|cc|cc|cc}
\toprule
\textbf{Model} & \multicolumn{2}{c|}{\textbf{FLORES Table 1}} & \multicolumn{2}{c|}{\textbf{FLORES Table 1}} & \multicolumn{2}{c|}{\textbf{Bible Table 1}} & \multicolumn{2}{c|}{\textbf{FLORES Full}} & \multicolumn{2}{c}{\textbf{Bible Full}} \\
 & \multicolumn{2}{c|}{(116 langs · 100 sents)} & \multicolumn{2}{c|}{(116 langs · 2000 sents)} & \multicolumn{2}{c|}{(101 langs · sPBC)} & \multicolumn{2}{c|}{(204 langs · 2000 sents)} & \multicolumn{2}{c}{(sPBC · all langs)} \\
 & $\mu_{\text{Max}}$ & $\mu_{\text{Mean}}$ & $\mu_{\text{Max}}$ & $\mu_{\text{Mean}}$ & $\mu_{\text{Max}}$ & $\mu_{\text{Mean}}$ & $\mu_{\text{Max}}$ & $\mu_{\text{Mean}}$ & $\mu_{\text{Max}}$ & $\mu_{\text{Mean}}$ \\
\midrule
\textit{Paper References:} & & & & & & & & & & \\
~~\citet{kargaran2024mexa} Llama 3.1 8B & 0.6538 & 0.3963 & --- & --- & 0.4212 & 0.2103 & --- & --- & --- & --- \\
~~\citet{kargaran2024mexa} Mistral 7B & 0.4716 & 0.2642 & --- & --- & 0.2606 & 0.1198 & --- & --- & --- & --- \\
\midrule
\textit{Our Re-runs \& Extensions:} & & & & & & & & & & \\
~~Llama 3.1 8B & 0.6735 & 0.4196 & 0.6065 & 0.3370 & 0.4180 & 0.2076 & 0.5611 & 0.3235 & 0.0781 & 0.0320 \\
~~Mistral 7B v0.3 & 0.4980 & 0.2878 & 0.4066 & 0.2127 & 0.2571 & 0.1179 & 0.4102 & 0.2232 & 0.0465 & 0.0181 \\
~~Qwen3 8B Base & 0.5759 & 0.3211 & --- & --- & 0.2970 & 0.1350 & 0.4723 & 0.2509 & 0.0499 & 0.0186 \\
~~Qwen3.5 9B Base & \textbf{0.7814} & \textbf{0.5557} & --- & --- & \textbf{0.4821} & \textbf{0.2624} & --- & --- & --- & --- \\
~~Apertus 8B & 0.3873 & 0.1637 & --- & --- & 0.4299 & 0.1896 & 0.3264 & 0.1267 & 0.0667 & 0.0237 \\
\bottomrule
\end{tabular}
\end{table*}
```

---

## 2.3 Visual Analysis (Figures Drafted in Dashboard)

For your mid-term document, you can report the following key diagnostic figures that have been constructed in your dashboard system:

*   **Figure 1: Layer-wise Delta Heatmap**
    *   *Caption*: Cosine Similarity Shift ($\Delta$) per layer ($1$ to $32$) across parallel corpora (English $\leftrightarrow$ Hindi, English $\leftrightarrow$ French).
    *   *Observation*: Alignment is minimal in the early input layers, steadily rises and peaks in the intermediate/middle layers (layers $12$ to $24$) supporting the pivot hypothesis, and then declines in the final layers as representations specialize towards the target languages' native vocabulary and token statistics.
*   **Figure 2: Feature Radar Chart**
    *   *Caption*: Radial comparison of semantic feature preservation between baseline global models (e.g., Llama 3.1 Global) and specific language fine-tunes (e.g., Llama 3.1 Hindi Finetune) across four semantic axes.
*   **Figure 3: Latent Space Alignment (t-SNE Projection)**
    *   *Caption*: Two-dimensional t-SNE projection of parallel English-Hindi sentence embeddings extracted across the 1536-dimensional latent space. Shows clustering tightness in middle layers compared to dispersion in early/late layers.
*   **Figure 4: Score Distributions**
    *   *Caption*: Probability density curves of alignment scores across models, showing high kurtosis and low standard deviation in highly-aligned models like Qwen3.5 9B.
*   **Figure 5: Attention Flow Explorer**
    *   *Caption*: Visualizing token-level cross-lingual alignment through attention weights to analyze how word-to-word relationships are preserved across different layers and attention heads.
*   **Figure 6: Cross-Model Pearson Correlation Matrix**
    *   *Caption*: Pairwise Pearson correlation of per-language alignment scores across different LLMs (Llama, Mistral, Gemma, Phi, XGLM). High correlation values ($>0.85$ between Llama 3.1 and Mistral) indicate that structural cross-lingual alignment is highly consistent across architecture families.

---

# SECTION 3: References

## 3.1 References (Markdown)

1.  **Kargaran, A. H., Modarressi, A., Nikeghbal, N., Diesner, J., Yvon, F., & Schütze, H.** (2025). *MEXA: Multilingual Evaluation of English-Centric LLMs via Cross-Lingual Alignment*. In *Findings of the Association for Computational Linguistics (ACL 2025)*.
2.  ...

## 3.2 References (LaTeX BibTeX Entries)

```latex
@inproceedings{kargaran2024mexa,
  title        = {{MEXA}: Multilingual Evaluation of {E}nglish-Centric {LLMs} via Cross-Lingual Alignment},
  author       = {Kargaran, Amir Hossein and Modarressi, Ali and Nikeghbal, Nafiseh and Diesner, Jana and Yvon, Fran{\c{c}}ois and Sch{\"u}tze, Hinrich},
  booktitle    = {Findings of the Association for Computational Linguistics: ACL 2025},
  year         = {2025},
  url          = {https://arxiv.org/abs/2410.05873}
}
```

---

# SECTION 4: Acknowledgements

*   **Cluster Usage Statement**: 
    > Experiments presented in this work were carried out using the CIT-TUM-HN cluster at TUM Campus Heilbronn.
