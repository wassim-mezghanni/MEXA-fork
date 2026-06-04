import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31FloresFindings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — FLORES-200"
      description="MEXA evaluation of Meta's Llama 3.1 8B model across 205 languages using the FLORES-200 parallel corpus (100 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="FLORES-200"
      icon="experiment"
      csvPath="/data/flores_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_llama3.1_8b.json"
    />
  );
}
