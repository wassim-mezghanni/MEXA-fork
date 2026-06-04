import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusBibleFindings() {
  return (
    <ExperimentFindings
      title="Apertus 8B — Bible (sPBC)"
      description="MEXA evaluation of Swiss AI's Apertus 8B model (1,811 natively supported languages) across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/bible_apertus_8b_results.csv"
      modelKeys={['swiss-ai/Apertus-8B-2509_max', 'swiss-ai/Apertus-8B-2509_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_apertus_8b.json"
    />
  );
}
