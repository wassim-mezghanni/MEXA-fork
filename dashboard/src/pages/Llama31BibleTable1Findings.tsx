import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31BibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — Bible Table 1"
      description="Reproduction of the MEXA paper's Table 1 results for Llama 3.1 8B on the Bible (sPBC) dataset. Restricted to the 101 languages overlapping with Belebele. Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 (Bible)"
      icon="auto_stories"
      csvPath="/data/bible_table1_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (101 langs)"
      poolingMethod="Token-weighted, Max + Mean pooling"
      projectionPath="/data/projections_bible_llama3.1_8b.json"
    />
  );
}
