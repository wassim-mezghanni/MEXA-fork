import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen3FloresTable1_2000Findings() {
  return (
    <ExperimentFindings
      title="Qwen3 8B Base — FLORES Table 1 (2000 sents)"
      description="Reproduction of the MEXA paper's Table 1 setup for Qwen3 8B Base on FLORES. This subset contains the 116 languages overlapping with the Belebele benchmark, evaluated on the full devtest (2000 sentences). Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 · 2000 sents"
      icon="table_chart"
      csvPath="/data/flores_table1_2000_qwen3_8b_results.csv"
      modelKeys={['Qwen/Qwen3-8B-Base_max', 'Qwen/Qwen3-8B-Base_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_2000_qwen3_8b.json"
    />
  );
}
