import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x7BFloresFindings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x7B — FLORES Full Evaluation"
      description="Evaluation of Mixtral 8x7B MoE on the full FLORES-200 dataset (2000 sentences per language) across all available languages."
      badge="Full Dataset"
      icon="local_florist"
      csvPath="/data/full_flores_mixtral_8x7b_results.csv"
      modelKeys={['mistralai/Mixtral-8x7B-v0.1_max', 'mistralai/Mixtral-8x7B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (all languages, 2000 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
