import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusMini4BFloresFindings() {
  return (
    <ExperimentFindings
      title="Apertus 4B (v1.1) (FLORES-200)"
      description="MEXA evaluation of Swiss AI's Apertus-v1.1-4B (Apertus-mini) base model across languages using the FLORES-200 parallel corpus (100 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="FLORES-200"
      icon="experiment"
      csvPath="/data/apertus-mini-4b-flores-results.csv"
      modelKeys={['swiss-ai/Apertus-v1.1-4B_max', 'swiss-ai/Apertus-v1.1-4B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections-apertus-mini-4b-flores.json"
    />
  );
}
