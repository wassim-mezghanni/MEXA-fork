import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen306BFloresFindings() {
  return (
    <ExperimentFindings
      title="Qwen3 0.6B — FLORES Full"
      description="MEXA evaluation of Qwen3 0.6B on the full FLORES-200 devtest — 204 languages evaluated on 2000 parallel sentences. Token-weighted embeddings with max and mean pooling across layers."
      badge="204 langs · 2000 sents"
      icon="local_florist"
      csvPath="/data/full_flores_qwen3_0.6b_results.csv"
      modelKeys={['Qwen/Qwen3-0.6B_max', 'Qwen/Qwen3-0.6B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (204 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_full_flores_qwen3_0.6b.json"
    />
  );
}
