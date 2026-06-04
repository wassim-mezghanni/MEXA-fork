import ExperimentFindings from '../components/ExperimentFindings';

export default function Qwen35BibleFindings() {
  return (
    <ExperimentFindings
      title="Qwen3.5 9B Base — Bible (sPBC)"
      description="MEXA evaluation of Qwen3.5 9B Base across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/bible_qwen3.5_9b_results.csv"
      modelKeys={['Qwen/Qwen3.5-9B-Base_max', 'Qwen/Qwen3.5-9B-Base_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_qwen3.5_9b.json"
    />
  );
}
