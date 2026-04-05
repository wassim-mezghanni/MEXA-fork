import ExperimentFindings from '../components/ExperimentFindings';

export default function MistralFindings() {
  return (
    <ExperimentFindings
      title="Mistral 7B v0.3 — My Results"
      description="MEXA evaluation of Mistral AI's Mistral 7B v0.3 model across languages using the FLORES-200 parallel corpus."
      badge="My Experiment"
      icon="experiment"
      csvPath="/data/mistral-7b-v03-results.csv"
      modelKeys={['mistralai/Mistral-7B-v0.3']}
      modelLabels={['Mistral 7B v0.3']}
      datasetName="FLORES-200"
      poolingMethod="Max pooling across layers"
    />
  );
}
