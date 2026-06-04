import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31FloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — FLORES Table 1 Reproduction"
      description="Exact reproduction of the MEXA paper's Table 1 results for Llama 3.1 8B on FLORES. This subset contains the 116 languages that overlap with the Belebele benchmark, evaluated using the full devtest (2000 sentences). Target µ_Max = 0.6538."
      badge="Table 1 Reproduction"
      icon="table_chart"
      csvPath="/data/flores_table1_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_llama3.1_8b.json"
    />
  );
}
