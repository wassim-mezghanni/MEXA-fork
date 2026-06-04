import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31FullDatasetFindings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — Full Dataset (FLORES-200)"
      description="Evaluation of Llama 3.1 8B on the full FLORES-200 dataset (204 languages) using the maximum available sentence count (2000 sentences) for highest precision. Token-weighted embeddings, Max + Mean pooling."
      badge="Full Dataset (2000 sents)"
      icon="science"
      csvPath="/data/full_flores_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (full)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_full_flores_llama3.1_8b.json"
    />
  );
}
