import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusMini4BFloresTable1Findings() {
  return (
    <ExperimentFindings
      title="Apertus 4B (v1.1) — FLORES Table 1 (100 sents)"
      description="Reproduction of the MEXA paper's Table 1 setup for Swiss AI's Apertus-v1.1-4B (Apertus-mini) on FLORES. This subset contains the 116 languages overlapping with the Belebele benchmark, evaluated on 100 sentences. Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 · 100 sents"
      icon="table_chart"
      csvPath="/data/flores_table1_100_apertusmini4b_results.csv"
      modelKeys={['swiss-ai/Apertus-v1.1-4B_max', 'swiss-ai/Apertus-v1.1-4B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_flores_table1_100_apertusmini4b.json"
    />
  );
}
