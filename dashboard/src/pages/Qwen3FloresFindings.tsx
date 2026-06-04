import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen3FloresFindings() {
  return (
    <ExperimentFindings
      title="Qwen3 8B Base — FLORES-200"
      description="MEXA evaluation of Qwen3 8B Base model (pretrained on 36T tokens across 119 languages) using the FLORES-200 parallel corpus (100 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="FLORES-200"
      icon="experiment"
      csvPath="/data/flores_qwen3_8b_results.csv"
      modelKeys={['Qwen/Qwen3-8B-Base_max', 'Qwen/Qwen3-8B-Base_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_qwen3_8b.json"
    />
  );
}
