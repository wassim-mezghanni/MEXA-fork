import ExperimentFindings from '../components/ExperimentFindings';

export default function Llama31Table1Findings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — Table 1 Reproduction"
      description="Reproduction of the MEXA paper's Table 1 results for Llama 3.1 8B. FLORES-200 dataset, 100 sentences, token-weighted embeddings with max pooling across layers. Target MEXA score: 0.6538."
      badge="Paper Table 1"
      icon="science"
      csvPath="/data/full_flores_llama3.1_8b_results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B']}
      modelLabels={['Llama 3.1 8B']}
      datasetName="FLORES-200"
      poolingMethod="Max pooling across layers"
      projectionPath="/data/projections_full_flores_llama3.1_8b.json"
    />
  );
}
