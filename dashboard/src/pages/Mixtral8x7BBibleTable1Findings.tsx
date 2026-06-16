import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x7BBibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x7B — Bible Table 1"
      description="Evaluation of Mixtral 8x7B MoE on the Bible dataset (103 sentences) for the 101 Table 1 languages."
      badge="Table 1"
      icon="table_view"
      csvPath="/data/bible_table1_mixtral_8x7b_results.csv"
      modelKeys={['mistralai/Mixtral-8x7B-v0.1_max', 'mistralai/Mixtral-8x7B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC, 101 langs, 103 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
