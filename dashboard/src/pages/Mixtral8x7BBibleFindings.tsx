import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x7BBibleFindings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x7B — Bible Full (sPBC)"
      description="Evaluation of Mixtral 8x7B MoE on the full Bible dataset (103 sentences) across all available languages."
      badge="Full Dataset"
      icon="auto_stories"
      csvPath="/data/bible_mixtral_8x7b_results.csv"
      modelKeys={['mistralai/Mixtral-8x7B-v0.1_max', 'mistralai/Mixtral-8x7B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC, all languages, 103 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
