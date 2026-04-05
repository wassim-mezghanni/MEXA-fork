import { useState, useEffect } from 'react';
import { LayerwiseHeatmap } from '../charts/LayerwiseHeatmap';
import { FeatureRadar } from '../charts/FeatureRadar';
import { LatentSpaceProjection } from '../charts/LatentSpaceProjection';
import { ScoreDistribution } from '../charts/ScoreDistribution';
import { AttentionFlowExplorer } from '../charts/AttentionFlowExplorer';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { LanguageCard } from '../ui/LanguageCard';
import { LayerSlider } from '../form/LayerSlider';
import { ExperimentTimeline } from '../ui/ExperimentTimeline';

/* ── Data helpers ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const models = headers.slice(1);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = { code: cols[0] };
    for (let j = 1; j < cols.length; j++) {
      row[models[j - 1]] = cols[j];
    }
    data.push(row);
  }
  return { models, data };
}

/* ── Mock data for visualizations ── */
const HEATMAP_ROWS = [
  {
    label: 'English → Hindi',
    color: '0, 70, 85',
    opacities: [10,20,30,40,60,80,100,90,70,50,30,20,40,60,80,100,90,70,50,30,20,10,5,10,20,40,60,80,100,90,70,50],
  },
  {
    label: 'English → French',
    color: '0, 71, 73',
    opacities: [5,10,15,20,25,30,40,50,60,70,80,90,100,90,80,70,60,50,40,30,20,15,10,5,5,10,15,20,25,30,40,50],
  },
];

const HEATMAP_LEGEND = [
  { color: 'bg-primary', label: 'High Semantic Alignment' },
  { color: 'bg-primary/20', label: 'Representational Drift' },
];

const RADAR_DATASETS = [
  { label: 'Llama 3.1 (Global)', values: [0.78, 0.67, 0.78, 0.67], fill: 'rgba(0,70,85,0.15)', stroke: '#004655' },
  { label: 'Hindi Finetune', values: [0.56, 0.44, 0.56, 0.44], fill: 'rgba(0,71,73,0.3)', stroke: '#004749', strokeWidth: 1.5 },
];

const RADAR_SCORES = [
  { label: 'Llama 3.1 (Global)', value: '0.892', colorClass: 'text-primary' },
  { label: 'Hindi Finetune', value: '0.741', colorClass: 'text-tertiary' },
];

const DISTRIBUTION_CURVES = [
  {
    path: 'M 0 90 Q 100 90, 150 50 T 200 10 T 250 50 T 400 90',
    fillPath: 'M 0 90 Q 100 90, 150 50 T 200 10 T 250 50 T 400 90 L 400 90 L 0 90 Z',
    stroke: '#004655',
    fill: 'rgba(0, 70, 85, 0.05)',
  },
  {
    path: 'M 0 90 Q 50 90, 100 80 T 200 40 T 300 80 T 400 90',
    stroke: '#004749',
    strokeDasharray: '4 2',
  },
];

const DISTRIBUTION_STATS = [
  { label: 'Standard Dev', value: '0.024', borderColor: 'border-primary', textColor: 'text-primary' },
  { label: 'Kurtosis Index', value: '1.842', borderColor: 'border-tertiary', textColor: 'text-tertiary' },
];

const SOURCE_TOKENS = ['The', 'architectural', 'integrity', 'of', 'the', 'system', 'remains', 'stable.'];
const TARGET_TOKENS = ['सिस्टम', 'की', 'वास्तुकला', 'अखंडता', 'स्थिर', 'बनी', 'हुई', 'है।'];

/* ── Correlation Matrix mock ── */
const CORR_LABELS = ['Llama 3.1', 'Mistral 7B', 'Gemma 2B', 'Phi-3', 'XGLM 4.5B'];
const CORR_MATRIX = [
  [1.000, 0.874, 0.621, 0.743, 0.582],
  [0.874, 1.000, 0.698, 0.812, 0.649],
  [0.621, 0.698, 1.000, 0.534, 0.891],
  [0.743, 0.812, 0.534, 1.000, 0.467],
  [0.582, 0.649, 0.891, 0.467, 1.000],
];

/* ── Language Card examples ── */
const SAMPLE_LANGUAGES = [
  {
    code: 'hin_Deva', name: 'Hindi', family: 'Indo-European', script: 'Devanagari',
    resourceLevel: 'high',
    scores: [{ model: 'Llama 3.1', score: 0.82 }, { model: 'Mistral 7B', score: 0.76 }, { model: 'Gemma 2B', score: 0.61 }],
    avgScore: 0.730,
  },
  {
    code: 'yor_Latn', name: 'Yoruba', family: 'Niger-Congo', script: 'Latin',
    resourceLevel: 'low',
    scores: [{ model: 'Llama 3.1', score: 0.41 }, { model: 'Mistral 7B', score: 0.33 }, { model: 'Gemma 2B', score: 0.28 }],
    avgScore: 0.340,
  },
  {
    code: 'fra_Latn', name: 'French', family: 'Indo-European', script: 'Latin',
    resourceLevel: 'high',
    scores: [{ model: 'Llama 3.1', score: 0.91 }, { model: 'Mistral 7B', score: 0.88 }, { model: 'Gemma 2B', score: 0.79 }],
    avgScore: 0.860,
  },
  {
    code: 'tha_Thai', name: 'Thai', family: 'Kra-Dai', script: 'Thai',
    resourceLevel: 'medium',
    scores: [{ model: 'Llama 3.1', score: 0.68 }, { model: 'Mistral 7B', score: 0.59 }, { model: 'Gemma 2B', score: 0.52 }],
    avgScore: 0.597,
  },
];

/* ── Experiment timeline mock ── */
const EXPERIMENT_ENTRIES = [
  { id: 'exp-007', title: 'FLORES-200 Full Sweep — 32 layers', timestamp: '2 Apr 2026, 18:42', status: 'completed', model: 'Llama 3.1 8B', dataset: 'FLORES-200', score: 0.847, duration: '4h 12m' },
  { id: 'exp-006', title: 'Bible Corpus — Max Pooling', timestamp: '1 Apr 2026, 09:15', status: 'completed', model: 'Llama 3.1 8B', dataset: 'Bible', score: 0.791, duration: '3h 08m' },
  { id: 'exp-005', title: 'Mistral Comparison Baseline', timestamp: '31 Mar 2026, 14:30', status: 'running', model: 'Mistral 7B', dataset: 'FLORES-200', duration: '1h 52m' },
  { id: 'exp-004', title: 'Low-Resource Lang Subset (15 langs)', timestamp: '30 Mar 2026, 11:00', status: 'failed', model: 'Gemma 2B', dataset: 'FLORES-200', duration: '0h 34m' },
  { id: 'exp-003', title: 'Phi-3 Layer-wise Analysis', timestamp: '28 Mar 2026, 16:20', status: 'completed', model: 'Phi-3', dataset: 'FLORES-200', score: 0.723, duration: '2h 45m' },
  { id: 'exp-002', title: 'Hindi-English Attention Mapping', timestamp: '27 Mar 2026, 10:05', status: 'completed', model: 'Llama 3.1 8B', dataset: 'Bible', score: 0.812, duration: '1h 20m' },
  { id: 'exp-001', title: 'Initial Setup + Validation Run', timestamp: '25 Mar 2026, 08:30', status: 'queued', model: 'XGLM 4.5B', dataset: 'FLORES-200' },
];

export default function Overview() {
  const [layerValue, setLayerValue] = useState([8, 24]);
  const [, setLanguageNames] = useState({});
  const [, setAllData] = useState({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [langNamesRes, fmb, fma, bmb, bma, llamaCsvRes] = await Promise.all([
          fetch('/data/language_names.json').then((r) => r.json()),
          fetch('/data/flores-max-belebele.csv').then((r) => r.text()),
          fetch('/data/flores-mean-arc.csv').then((r) => r.text()),
          fetch('/data/bible-max-belebele.csv').then((r) => r.text()),
          fetch('/data/bible-mean-arc.csv').then((r) => r.text()),
          fetch('/data/llama3-1-8b-results.csv')
            .then((r) => r.text())
            .catch(() => ''),
        ]);

        const floresNameMap = {};
        const allCsvTexts = [fmb, fma, bmb, bma, llamaCsvRes].filter(Boolean);
        const allFloresCodes = new Set();
        allCsvTexts.forEach((csv) => {
          csv.trim().split('\n').slice(1).forEach((line) => {
            const code = line.split(',')[0];
            if (code) allFloresCodes.add(code);
          });
        });
        allFloresCodes.forEach((floresCode) => {
          const isoCode = floresCode.split('_')[0];
          const baseName = langNamesRes[isoCode];
          floresNameMap[floresCode] = baseName || floresCode;
        });

        setLanguageNames(floresNameMap);
        setAllData({
          'flores-max': parseCSV(fmb),
          'flores-mean': parseCSV(fma),
          'bible-max': parseCSV(bmb),
          'bible-mean': parseCSV(bma),
          my_results: llamaCsvRes ? parseCSV(llamaCsvRes) : null,
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-4xl">
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          Llama 3.1 Cross-Lingual Evaluation
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl italic">
          A comprehensive suite for assessing the semantic alignment and representational drift
          of high-resource vs. low-resource languages across model depth.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        <LayerwiseHeatmap
          title="Fig 01. Layer-wise Delta Heatmap"
          subtitle="Cosine Similarity Shift [Δ] per Layer (1-32) Across Parallel Corpuses"
          rows={HEATMAP_ROWS}
          legend={HEATMAP_LEGEND}
          className="col-span-12 lg:col-span-8"
        />

        <FeatureRadar
          title="Fig 02. Feature Radar"
          datasets={RADAR_DATASETS}
          scores={RADAR_SCORES}
          className="col-span-12 lg:col-span-4"
        />

        <LatentSpaceProjection
          title="Fig 03. Latent Space Alignment"
          subtitle="t-SNE Projection: English [En] vs Hindi [Hi] across 1536d space"
          className="col-span-12 lg:col-span-7"
        />

        <ScoreDistribution
          title="Fig 04. Score Distributions"
          curves={DISTRIBUTION_CURVES}
          stats={DISTRIBUTION_STATS}
          className="col-span-12 lg:col-span-5"
        />

        <AttentionFlowExplorer
          title="Fig 05. Attention Flow Explorer"
          subtitle="Visualizing token-level cross-lingual mapping across Attention Heads"
          sourceTokens={SOURCE_TOKENS}
          targetTokens={TARGET_TOKENS}
          highlightSource={[2]}
          highlightTarget={[2]}
          className="col-span-12"
        />

        {/* ── Fig 06: Correlation Matrix ── */}
        <CorrelationMatrix
          title="Fig 06. Cross-Model Correlation"
          subtitle="Pairwise Pearson correlation of per-language scores across models"
          labels={CORR_LABELS}
          matrix={CORR_MATRIX}
          className="col-span-12 lg:col-span-7"
        />

        {/* ── Layer Slider (shared control) ── */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              Layer Range Selector
            </h3>
            <p className="text-xs text-on-surface-variant font-label mb-8">
              Select a layer range to filter Heatmap, Projection, and Attention views
            </p>
          </div>
          <LayerSlider
            label="Model Layers"
            min={1}
            max={32}
            value={layerValue}
            onChange={setLayerValue}
            range
            tickInterval={4}
          />
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Input', range: [1, 8] },
              { label: 'Mid-Model', range: [9, 24] },
              { label: 'Logit Head', range: [25, 32] },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setLayerValue(preset.range)}
                className="text-[10px] font-bold uppercase tracking-widest py-2 rounded bg-surface-container-lowest text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Language Cards row ── */}
        <div className="col-span-12">
          <h3 className="text-lg font-headline font-bold text-primary mb-6 uppercase tracking-wider">
            Fig 07. Language Profiles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_LANGUAGES.map((lang) => (
              <LanguageCard key={lang.code} {...lang} />
            ))}
          </div>
        </div>

        {/* ── Experiment Timeline ── */}
        <ExperimentTimeline
          title="Experiment Log"
          entries={EXPERIMENT_ENTRIES}
          maxVisible={5}
          className="col-span-12"
        />
      </div>
    </div>
  );
}
