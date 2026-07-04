import ExperimentFindings from '../components/ExperimentFindings';

export default function ApertusMini4BBibleTable1Findings() {
  return (
    <ExperimentFindings
      title="Apertus 4B (v1.1) — Bible Table 1"
      description="Reproduction of the MEXA paper's Table 1 setup for Swiss AI's Apertus-v1.1-4B (Apertus-mini) on the Bible (sPBC) corpus. This subset contains the 101 languages overlapping with the Belebele benchmark (103 sentences). Token-weighted embeddings, Max + Mean pooling."
      badge="Table 1 · Bible"
      icon="table_view"
      csvPath="/data/bible_table1_apertusmini4b_results.csv"
      modelKeys={['swiss-ai/Apertus-v1.1-4B_max', 'swiss-ai/Apertus-v1.1-4B_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="Bible (sPBC) (101 langs)"
      poolingMethod="Max + Mean pooling across layers"
      projectionPath="/data/projections_bible_table1_apertusmini4b.json"
    />
  );
}
