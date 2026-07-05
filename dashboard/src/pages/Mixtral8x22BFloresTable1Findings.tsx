import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x22BFloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x22B — FLORES Table 1 (100 Sents)"
      description="Evaluation of Mixtral 8x22B MoE on a 100-sentence subset of FLORES-200, covering 110 Table 1 languages."
      badge="100 Sentences"
      icon="table_chart"
      csvPath="/data/flores_table1_100_mixtral_8x22b_results.csv"
      projectionPath="/data/projections_flores_table1_100_mixtral_8x22b.json"
      modelKeys={['mistralai/Mixtral-8x22B-v0.1_max', 'mistralai/Mixtral-8x22B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (110 langs, 100 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
