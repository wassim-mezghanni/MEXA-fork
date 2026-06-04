import ExperimentFindings from '../components/ExperimentFindings';

export default function MistralBibleFindings() {
  return (
    <ExperimentFindings
      title="Mistral 7B v0.3 — Bible (sPBC)"
      description="MEXA evaluation of Mistral AI's Mistral 7B v0.3 model across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/bible_mistral_7b_v03_results.csv"
      modelKeys={['mistralai/Mistral-7B-v0.3_max', 'mistralai/Mistral-7B-v0.3_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_mistral_7b_v03.json"
    />
  );
}
