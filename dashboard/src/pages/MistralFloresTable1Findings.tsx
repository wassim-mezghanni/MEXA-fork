import ExperimentFindings from '../components/ExperimentFindings';

export default function MistralFloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Mistral 7B v0.3 — FLORES Table 1 Reproduction"
      description="Exact reproduction of the MEXA paper's Table 1 results for Mistral 7B v0.3 on FLORES. This subset contains the 116 languages that overlap with the Belebele benchmark, evaluated using the full devtest (2000 sentences)."
      badge="Table 1 Reproduction"
      icon="table_chart"
      csvPath="/data/flores_table1_mistral_7b_v03_results.csv"
      modelKeys={['mistralai/Mistral-7B-v0.3_max', 'mistralai/Mistral-7B-v0.3_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_mistral_7b_v03.json"
    />
  );
}
