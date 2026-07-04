import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusMini4BBibleFindings() {
  return (
    <ExperimentFindings
      title="Apertus 4B (v1.1) — Bible (sPBC)"
      description="MEXA evaluation of Swiss AI's Apertus-v1.1-4B (Apertus-mini) base model across ~1,400 languages using the Bible (sPBC) parallel corpus (103 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="Bible (sPBC)"
      icon="auto_stories"
      csvPath="/data/apertus-mini-4b-bible-results.csv"
      modelKeys={['swiss-ai/Apertus-v1.1-4B_max', 'swiss-ai/Apertus-v1.1-4B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections-apertus-mini-4b-bible.json"
    />
  );
}
