import ExperimentFindings from '../components/ExperimentFindings';

export default function MistralFloresFindings() {
  return (
    <ExperimentFindings
      title="Mistral 7B v0.3 — FLORES-200"
      description="MEXA evaluation of Mistral AI's Mistral 7B v0.3 model across languages using the FLORES-200 parallel corpus (100 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="FLORES-200"
      icon="experiment"
      csvPath="/data/flores_mistral_7b_v03_results.csv"
      modelKeys={['mistralai/Mistral-7B-v0.3_max', 'mistralai/Mistral-7B-v0.3_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_mistral_7b_v03.json"
    />
  );
}
