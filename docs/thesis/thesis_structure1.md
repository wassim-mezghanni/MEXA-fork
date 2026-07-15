# Thesis Structure

**Working title:** Evaluating multilingual LLM performance with cross-lingual alignment

---

## Chapter 1 — Introduction
- 1.1 Motivation
- 1.2 Research Questions
- 1.3 Contributions
- 1.4 Thesis Outline

## Chapter 2 — Background 
- 2.1 Multilingual Language Models 
  - 2.1.1 Architectures and Pre-training
  - 2.1.2 The Tokenization Bottleneck : challenges with subword tokenizers in non-Latin or the low-resource languages 
  - 2.1.3 Cross-lingual Transfer :
  How models represent semantic concepts across different languages in a shared space.
- 2.2 English as a Pivot Language
  - 2.2.1 Pivot Translation and Alignment : The classic role of English a bridge in multilingual NLP 
  - 2.2.2 English Centricity and Bias : Limitations of relying on English
- 2.3 Multilingual Evaluation 
  - 2.3.1 Standard Benchmarks (FLORES, MMLU )
  - 2.3.2 Reference-Based vs. Reference-Free Metrics : pros and cons of traditional evaluation metrics (BLEU, COMET) vs. model-based metrics.
  - 2.3.3 Challenges in Cross-lingual Alignment Evaluation
- 2.4 Parallel Corpora
  - 2.4.1 Sources and Typology
  - 2.4.2 Resource Disparity : The gap between high-resource and low-resource language pairs and its impact on alignment

## Chapter 3 — Methodology
- 3.1 The MEXA Pipeline
- 3.2 Models
  - 3.2.1 Reproduction Models 
  - 3.2.2 New Decoder Families
  - 3.2.3 Mixture-of-Experts Models 
  - 3.2.4 Encoder and Embedding Models
- 3.3 Datasets (Parallel Corpora )
- 3.4 Experimental Settings : Evaluation and Analysis Methods , Implementation and Compute

## Chapter 4 — Results and Discussion
- 4.1 Mexa score reulst 
- 4.1.1Reproduction of the Original Results 
- 4.1.2 New Model Families 
- 4.1.3 Encoder and Embedding Models (Enc)
- 4.4 Mixture-of-Experts Models (MoE)
- 4.5 Non-English Pivots (Pivot)
- 4.6 Cross-Experiment Language Analysis
- 4.7 Validity of MEXA (Downstream)???

## Chapter 5 — Conclusion
- 5.1 Summary
- 5.2 Limitations
- 5.3 Future Work

## Appendix

## References
