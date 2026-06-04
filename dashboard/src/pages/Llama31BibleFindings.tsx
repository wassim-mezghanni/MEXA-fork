import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31BibleFindings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — Bible (sPBC)"
      description="MEXA evaluation of Meta's Llama 3.1 8B model across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/bible_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B_max', 'meta-llama/Llama-3.1-8B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_llama3.1_8b.json"
    />
  );
}
