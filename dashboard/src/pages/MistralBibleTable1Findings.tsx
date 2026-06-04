import ExperimentFindings from '../components/ExperimentFindings';

export default function MistralBibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Mistral 7B v0.3 — Bible Table 1"
      description="Reproduction of the MEXA paper's Table 1 results for Mistral 7B v0.3 on the Bible (sPBC) dataset. Restricted to the 101 languages overlapping with Belebele. Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 (Bible)"
      icon="auto_stories"
      csvPath="/data/bible_table1_mistral_7b_v03_results.csv"
      modelKeys={['mistralai/Mistral-7B-v0.3_max', 'mistralai/Mistral-7B-v0.3_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (101 langs)"
      poolingMethod="Token-weighted, Max + Mean pooling"
      projectionPath="/data/projections_bible_mistral_7b_v03.json"
    />
  );
}
