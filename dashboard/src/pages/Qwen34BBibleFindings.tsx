import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen34BBibleFindings() {
  return (
    <ExperimentFindings
      title="Qwen3 4B — Bible (sPBC)"
      description="MEXA evaluation of Qwen3 4B across all available languages using the full Bible (sPBC) parallel corpus (103 sentences, ~1,401 languages). Token-weighted embeddings with max and mean pooling across layers."
      badge="sPBC · all langs"
      icon="auto_stories"
      csvPath="/data/bible_qwen3_4b_results.csv"
      modelKeys={['Qwen/Qwen3-4B_max', 'Qwen/Qwen3-4B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_qwen3_4b.json"
    />
  );
}
