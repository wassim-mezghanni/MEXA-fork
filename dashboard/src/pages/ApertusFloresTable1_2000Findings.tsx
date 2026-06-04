import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusFloresTable1_2000Findings() {
  return (
    <ExperimentFindings
      title="Apertus 8B — FLORES Table 1 (2000 sents)"
      description="Reproduction of the MEXA paper's Table 1 setup for Swiss AI's Apertus 8B on FLORES. This subset contains the 116 languages overlapping with the Belebele benchmark, evaluated on the full devtest (2000 sentences). Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 · 2000 sents"
      icon="table_chart"
      csvPath="/data/flores_table1_2000_apertus8b_results.csv"
      modelKeys={['swiss-ai/Apertus-8B-2509_max', 'swiss-ai/Apertus-8B-2509_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_2000_apertus8b.json"
    />
  );
}
