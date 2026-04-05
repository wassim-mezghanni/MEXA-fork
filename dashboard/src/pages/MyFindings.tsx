import ExperimentFindings from '../components/ExperimentFindings';

export default function MyFindings() {
  return (
    <ExperimentFindings
      title="Llama 3.1 8B — My Results"
      description="Personal reproduction and evaluation of the MEXA metric on Meta's Llama 3.1 8B model across 205 languages using the FLORES-200 parallel corpus."
      badge="My Experiment"
      icon="experiment"
      csvPath="/data/llama3-1-8b-results.csv"
      modelKeys={['meta-llama/Llama-3.1-8B']}
      modelLabels={['Llama 3.1 8B']}
      datasetName="FLORES-200"
      poolingMethod="Max pooling across layers"
    />
  );
}
