import React from 'react';
import { Link } from 'react-router-dom';

export default function ThesisPurpose() {
  const researchQuestions = [
    {
      id: 'RQ1',
      title: 'Scale & Pre-Training Recipe',
      subtitle: 'Model capacity, vocabulary design & data composition',
      description:
        'Investigates how internal representation alignment scales across parameter sweeps (Qwen 3 from 0.6B to 8B, Qwen 3.5 9B, Apertus from 4B to 70B) and compares dense families at matched parameter scale (Llama 3.1 8B vs. Qwen 3 8B vs. Apertus 8B).',
      badge: 'Scaling & Architecture',
      badgeColor: 'bg-primary/10 text-primary border-primary/20',
      icon: 'trending_up',
      links: [
        { label: 'Overview Dashboard', path: '/' },
        { label: 'Qwen 3.5 Findings', path: '/qwen3.5/flores' },
        { label: 'Apertus Analysis', path: '/apertus/flores' },
      ],
      finding: 'Qwen 3.5 9B achieves highest decoder alignment (μ_Max = 0.7794 on FLORES), demonstrating the power of diverse multilingual mixtures over raw parameter scale.',
    },
    {
      id: 'RQ2',
      title: 'Sparse Mixture-of-Experts (MoE)',
      subtitle: 'Dynamic token routing vs. shared interlingua',
      description:
        'Evaluates whether sparse conditional routing fragments the language-agnostic latent representation space across specialized experts, comparing dense baselines against corresponding MoE architectures (Mistral 7B vs. Mixtral 8x7B and 8x22B).',
      badge: 'MoE Dynamics',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      icon: 'hub',
      links: [
        { label: 'MoE In-Depth Analysis', path: '/moe-analysis' },
        { label: 'Mixtral 8x7B Experiments', path: '/mixtral/flores' },
        { label: 'Mixtral 8x22B Results', path: '/mixtral-8x22b/flores-table1-100' },
      ],
      finding: 'MoE routing preserves and enhances cross-lingual alignment (Mixtral 8x22B reaches μ_Max = 0.6120 vs Mistral 7B 0.4934) without expert language fragmentation.',
    },
    {
      id: 'RQ3',
      title: 'Pivot Independence & Geometry',
      subtitle: 'Testing English-centricity vs. true multilingualism',
      description:
        'Refutes the hypothesis that English is a mandatory structural bottleneck by substituting English with French, German, Arabic, Chinese, and Basque anchors. Analyzes representation geometry and language-identity centroid offsets using mean-centering.',
      badge: 'Interlingua Geometry',
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      icon: 'swap_horiz',
      links: [
        { label: 'Pivot Comparison Tool', path: '/pivot-comparison' },
        { label: 'Margin Analysis', path: '/margin-analysis' },
      ],
      finding: 'Non-English pivots match or exceed English alignment. Mean-centering eliminates centroid offsets, bringing peak alignment across all pivots to μ_Max ≥ 0.94.',
    },
    {
      id: 'RQ4',
      title: 'Representational Trajectory & Validity',
      subtitle: 'Encoder vs. Decoder dynamics & downstream predictive power',
      description:
        'Contrasts layer-wise representational trajectories across contrastive encoders (LaBSE, mE5), masked language models (XLM-R, Glot500, mmBERT), and causal decoders. Validates MEXA scores against downstream task performance (Belebele & m-ARC).',
      badge: 'Empirical Validity',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
      icon: 'rule',
      links: [
        { label: 'Benchmark Validation', path: '/validation' },
        { label: 'Bad Languages Diagnostic', path: '/bad-languages' },
        { label: 'MEXA Method Findings', path: '/findings' },
      ],
      finding: 'MEXA scores correlate perfectly with model-level downstream accuracy (ρ = 1.00 on Belebele & m-ARC), establishing MEXA as an efficient diagnostic proxy.',
    },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Hidden State Extraction',
      description: 'Extract layer-wise activation tensors for parallel target (L1) and pivot (L2) sentences across all network depths.',
      icon: 'layers',
    },
    {
      step: '02',
      title: 'Position-Weighted Pooling',
      description: 'Aggregate subword token embeddings using position-weighted averaging to prevent semantic dilution from long sequences.',
      icon: 'linear_scale',
    },
    {
      step: '03',
      title: 'Cosine Similarity & Retrieval',
      description: 'Construct full n × n similarity matrices and enforce bidirectional Precision@1 retrieval to account for hubness & anisotropy.',
      icon: 'compare_arrows',
    },
    {
      step: '04',
      title: 'Score Aggregation (μMax / μMean)',
      description: 'Compute peak alignment across depth (μMax) and layer-averaged alignment (μMean) to characterize emergent interlingua.',
      icon: 'analytics',
    },
  ];

  const modelCategories = [
    {
      category: 'Causal Decoder LLMs',
      desc: 'Autoregressive generative models trained on next-token prediction',
      models: [
        { name: 'Qwen 3.5 9B', peak: '0.7794', note: 'Top Decoder' },
        { name: 'Llama 3.1 8B', peak: '0.6706', note: 'Reference Baseline' },
        { name: 'Qwen 3 (0.6B - 8B)', peak: '0.3459 - 0.5720', note: 'Capacity Sweep' },
        { name: 'Mistral 7B v0.3', peak: '0.4934', note: 'Dense Baseline' },
        { name: 'Apertus 8B & 70B', peak: '0.3817 / 0.3190', note: 'Swiss AI Open' },
      ],
    },
    {
      category: 'Sparse Mixture-of-Experts (MoE)',
      desc: 'Conditional routing architectures activating a subset of experts per token',
      models: [
        { name: 'Mixtral 8x7B', peak: '0.5385', note: '13B Active / 47B Total' },
        { name: 'Mixtral 8x22B', peak: '0.6120', note: '39B Active / 141B Total' },
      ],
    },
    {
      category: 'Dedicated Sentence Embeddings',
      desc: 'Contrastively trained dual-encoders explicitly mapping semantically equivalent sentences',
      models: [
        { name: 'mE5-base', peak: '0.9710', note: 'Highest Peak' },
        { name: 'LaBSE', peak: '0.9510', note: 'Highest Mean (0.7230)' },
        { name: 'Qwen 3 Embedding (0.6B-8B)', peak: '0.7069 - 0.8465', note: 'Decoder Contrastive' },
      ],
    },
    {
      category: 'Masked Language Models (MLMs)',
      desc: 'Bidirectional representation encoders trained on masked token recovery',
      models: [
        { name: 'XLM-RoBERTa Large', peak: '0.6441', note: 'Strong MLM' },
        { name: 'Glot500', peak: '0.5889', note: '500+ Languages' },
        { name: 'mmBERT Base', peak: '0.5094', note: 'Annealed Pre-training' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* ── Top Academic Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-container to-tertiary-container text-white p-8 md:p-12 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-tertiary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase border border-white/20">
              Bachelor's Thesis in Data Analytics & Statistics
            </span>
            <span className="px-3 py-1 bg-secondary-container/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-secondary-fixed border border-white/10">
              Technical University of Munich (TUM)
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
              CIT Campus Heilbronn
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight text-white leading-tight">
              Evaluating Multilingual LLM Performance with Cross-Lingual Alignment
            </h1>
            <p className="text-base md:text-lg text-white/85 max-w-4xl font-body font-normal leading-relaxed">
              An empirical diagnostic dashboard reproducing and extending the MEXA framework across modern decoder families,
              sparse Mixture-of-Experts, non-English pivot anchors, and extreme low-resource linguistic tails.
            </p>
          </div>

          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-6 text-sm text-white/90">
            <div className="flex flex-wrap gap-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-white/60 block">Author</span>
                <span className="font-semibold text-white">Wassim Mezghanni</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-white/60 block">Supervisor</span>
                <span className="font-semibold text-white">Prof. Dr. Alexander Fraser</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-white/60 block">Advisor</span>
                <span className="font-semibold text-white">Shu Okabe</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-white/60 block">Submission Date</span>
                <span className="font-semibold text-white">August 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 bg-white text-primary font-semibold text-sm rounded-lg shadow-md hover:bg-surface-bright hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
                <span>Open Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Thesis Metrics Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Models Evaluated', val: '16+', desc: 'Decoders, MoE, MLMs & Encoders', icon: 'smart_toy' },
          { label: 'Languages Evaluated', val: '1,400+', desc: 'FLORES-200 & Bible Corpus', icon: 'translate' },
          { label: 'Research Questions', val: '4 Pillars', desc: 'Scale, Routing, Pivots, Validity', icon: 'psychology' },
          { label: 'Correlation with Tasks', val: 'ρ = 1.00', desc: 'Predictive of Belebele & m-ARC', icon: 'check_circle' },
        ].map((item, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/70">
                {item.label}
              </span>
              <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
            </div>
            <div className="text-2xl md:text-3xl font-headline font-bold text-primary mb-1">{item.val}</div>
            <div className="text-xs text-on-surface-variant font-body">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Executive Summary & Motivation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-primary/10 text-primary material-symbols-outlined text-2xl">
              auto_stories
            </span>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">Executive Summary & Problem Statement</h2>
              <p className="text-xs text-on-surface-variant">Why reference-free cross-lingual probing matters for LLMs</p>
            </div>
          </div>

          <div className="text-sm text-on-surface-variant/90 font-body space-y-3 leading-relaxed">
            <p>
              Modern multilingual Large Language Models (LLMs) can perform tasks in zero-shot settings across diverse languages.
              However, traditional evaluation benchmarks conflate true multilingual representation quality with prompt sensitivity,
              reasoning capacity, and surface generation dynamics.
            </p>
            <p>
              Under the <strong>Pivot Hypothesis</strong>, pre-trained multilingual transformers form a shared, language-agnostic
              representation space (an <em>interlingua</em>) in their intermediate layers. The <strong>MEXA</strong> (Multilingual Evaluation
              via Cross-Lingual Alignment) framework probes these hidden representation spaces directly using parallel sentences without requiring
              costly task-specific fine-tuning, reference translations, or text generation.
            </p>
            <p>
              This thesis reproduces the original MEXA methodology on standard baselines and provides the first systematic extension across
              modern decoder families (Qwen 3 series, Qwen 3.5 9B, Apertus open models), sparse Mixture-of-Experts (Mixtral 8x7B, 8x22B),
              non-English pivot anchors, and low-resource historical corpora.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant/20 shadow-sm space-y-4">
          <h3 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">dataset</span>
            <span>Benchmark Datasets</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">local_florist</span>
                  <span>FLORES-200</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10">116 & 204 Langs</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Professionally human-translated Wikipedia prose with clean grammar and modern vocabulary. Evaluated in 100-sentence and full 1,012-sentence splits.
              </p>
              <Link to="/datasets/flores" className="text-primary font-medium hover:underline text-[11px] inline-block pt-1">
                Explore FLORES Data →
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">auto_stories</span>
                  <span>Super-Parallel Bible (sPBC)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-tertiary/10">1,400+ Langs</span>
              </div>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Massively multi-way parallel religious text spanning historical orthographies (Syriac, Coptic, Ge'ez) and extreme low-resource indigenous languages.
              </p>
              <Link to="/datasets/bible" className="text-tertiary font-medium hover:underline text-[11px] inline-block pt-1">
                Explore Bible Data →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Research Questions (4 Pillars) ── */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-primary">Four Core Pillars</span>
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
              Thesis Research Questions & Findings
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant max-w-md">
            Click on any research question's direct links to inspect the interactive empirical evidence and charts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchQuestions.map((rq) => (
            <div
              key={rq.id}
              className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-primary text-white font-headline font-bold text-xs">
                      {rq.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${rq.badgeColor}`}>
                      {rq.badge}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">{rq.icon}</span>
                </div>

                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">{rq.title}</h3>
                  <p className="text-xs text-primary font-medium">{rq.subtitle}</p>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">{rq.description}</p>

                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary block mb-1">
                    Key Finding:
                  </span>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{rq.finding}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
                {rq.links.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.path}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-white text-[11px] font-medium text-on-surface-variant transition-colors flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MEXA Pipeline Architecture ── */}
      <div className="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-primary">Methodology</span>
            <h2 className="text-xl font-headline font-bold text-on-surface">The 4-Stage MEXA Evaluation Pipeline</h2>
          </div>
          <Link
            to="/findings"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Read Method Details</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {methodologySteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 relative space-y-2 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-headline font-extrabold text-primary/60">{step.step}</span>
                <span className="material-symbols-outlined text-primary text-lg">{step.icon}</span>
              </div>
              <h4 className="text-sm font-headline font-bold text-on-surface">{step.title}</h4>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Evaluated Model Families Matrix ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-primary">Model Coverage</span>
            <h2 className="text-2xl font-headline font-bold text-on-surface">Evaluated Architecture Taxonomy</h2>
          </div>
          <Link
            to="/comparison"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Compare All Models</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm space-y-3"
            >
              <div>
                <h4 className="text-sm font-headline font-bold text-on-surface">{cat.category}</h4>
                <p className="text-[10px] text-on-surface-variant/70">{cat.desc}</p>
              </div>

              <div className="space-y-2">
                {cat.models.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/10 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-on-surface text-[11px]">{m.name}</div>
                      <div className="text-[9px] text-on-surface-variant/60">{m.note}</div>
                    </div>
                    <span className="font-mono font-bold text-primary text-[11px]">{m.peak}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Direct Quick Jump Navigation ── */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-surface-container-low to-surface-container border border-primary/20 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-on-surface">Quick Access to Thesis Experiment Pages</h3>
          <p className="text-xs text-on-surface-variant">Jump directly to specific models, language analyses, or cross-cutting tools</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Interactive Overview', path: '/', icon: 'dashboard' },
            { label: 'Mixture-of-Experts', path: '/moe-analysis', icon: 'hub' },
            { label: 'Pivot Comparison', path: '/pivot-comparison', icon: 'swap_horiz' },
            { label: 'Margin Analysis', path: '/margin-analysis', icon: 'straighten' },
            { label: 'Downstream Validation', path: '/validation', icon: 'rule' },
            { label: 'Low-Resource Tail', path: '/bad-languages', icon: 'trending_down' },
            { label: 'Layer Alignment Heatmap', path: '/alignment', icon: 'grid_view' },
            { label: 'Model Score Comparison', path: '/comparison', icon: 'compare_arrows' },
          ].map((nav, i) => (
            <Link
              key={i}
              to={nav.path}
              className="p-3.5 rounded-xl bg-surface-container-lowest hover:bg-primary hover:text-white border border-outline-variant/20 shadow-sm transition-all flex items-center gap-2.5 group"
            >
              <span className="material-symbols-outlined text-primary group-hover:text-white text-lg transition-colors">
                {nav.icon}
              </span>
              <span className="text-xs font-semibold text-on-surface group-hover:text-white transition-colors">
                {nav.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
