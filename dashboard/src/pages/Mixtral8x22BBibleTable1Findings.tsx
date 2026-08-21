import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x22BBibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x22B (Bible Table 1)"
      description="Evaluation of Mixtral 8x22B MoE on the Bible dataset (103 sentences) for the 101 Table 1 languages."
      badge="Table 1"
      icon="table_view"
      csvPath="/data/bible_table1_mixtral_8x22b_results.csv"
      projectionPath="/data/projections_bible_table1_mixtral_8x22b.json"
      modelKeys={['mistralai/Mixtral-8x22B-v0.1_max', 'mistralai/Mixtral-8x22B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC, 101 langs, 103 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
