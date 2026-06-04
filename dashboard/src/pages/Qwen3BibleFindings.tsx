import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen3BibleFindings() {
  return (
    <ExperimentFindings
      title="Qwen3 8B Base — Bible (sPBC)"
      description="MEXA evaluation of Qwen3 8B Base model (pretrained on 36T tokens across 119 languages) across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/bible_qwen3_8b_results.csv"
      modelKeys={['Qwen/Qwen3-8B-Base_max', 'Qwen/Qwen3-8B-Base_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_qwen3_8b.json"
    />
  );
}
