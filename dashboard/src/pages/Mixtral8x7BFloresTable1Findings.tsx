import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x7BFloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x7B — FLORES Table 1 (100 Sents)"
      description="Evaluation of Mixtral 8x7B MoE on a 100-sentence subset of FLORES-200. This subset evaluates the 116 languages overlapping with the Belebele benchmark."
      badge="100 Sentences"
      icon="table_chart"
      csvPath="/data/flores_table1_100_mixtral_8x7b_results.csv"
      modelKeys={['mistralai/Mixtral-8x7B-v0.1_max', 'mistralai/Mixtral-8x7B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs, 100 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
