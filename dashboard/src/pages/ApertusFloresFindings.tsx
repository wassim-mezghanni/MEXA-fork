import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusFloresFindings() {
  return (
    <ExperimentFindings
      title="Apertus 8B — FLORES-200"
      description="MEXA evaluation of Swiss AI's Apertus 8B model (1,811 natively supported languages) across languages using the FLORES-200 parallel corpus (100 sentences). Token-weighted embeddings with max and mean pooling across layers."
      badge="FLORES-200"
      icon="experiment"
      csvPath="/data/flores_apertus_8b_results.csv"
      modelKeys={['swiss-ai/Apertus-8B-2509_max', 'swiss-ai/Apertus-8B-2509_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_apertus_8b.json"
    />
  );
}
