import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen306BFloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Qwen3 0.6B — FLORES Table 1 Reproduction"
      description="Reproduction of the MEXA paper's Table 1 setup for Qwen3 0.6B on FLORES. This subset contains the 116 languages overlapping with the Belebele benchmark, evaluated on 100 parallel sentences. Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 Reproduction"
      icon="table_chart"
      csvPath="/data/flores_table1_100_qwen3_0.6b_results.csv"
      modelKeys={['Qwen/Qwen3-0.6B_max', 'Qwen/Qwen3-0.6B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_100_qwen3_0.6b.json"
    />
  );
}
