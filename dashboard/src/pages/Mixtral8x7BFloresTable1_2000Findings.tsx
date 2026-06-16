import ExperimentFindings from '../components/ExperimentFindings';

export default function Mixtral8x7BFloresTable1_2000Findings() {
  return (
    <ExperimentFindings
      title="Mixtral 8x7B — FLORES Table 1 (2k Sents)"
      description="Evaluation of Mixtral 8x7B MoE on the 116 Table 1 languages using the full FLORES devtest (2000 sentences)."
      badge="Table 1 Reproduction"
      icon="format_list_numbered"
      csvPath="/data/flores_table1_2000_mixtral_8x7b_results.csv"
      modelKeys={['mistralai/Mixtral-8x7B-v0.1_max', 'mistralai/Mixtral-8x7B-v0.1_mean']}
      modelLabels={['µ_Max', 'µ_Mean']}
      datasetName="FLORES-200 (116 langs, 2000 sents)"
      poolingMethod="Max + Mean pooling across layers"
    />
  );
}
