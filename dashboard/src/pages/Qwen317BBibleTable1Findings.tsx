import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen317BBibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Qwen3 1.7B — Bible Table 1"
      description="Reproduction of the MEXA paper's Table 1 setup for Qwen3 1.7B on the Bible (sPBC) dataset. Restricted to the 101 languages overlapping with Belebele. Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 (Bible)"
      icon="auto_stories"
      csvPath="/data/bible_table1_qwen3_1.7b_results.csv"
      modelKeys={['Qwen/Qwen3-1.7B_max', 'Qwen/Qwen3-1.7B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (101 langs)"
      poolingMethod="Token-weighted, Max + Mean pooling"
      projectionPath="/data/projections_bible_table1_qwen3_1.7b.json"
    />
  );
}
