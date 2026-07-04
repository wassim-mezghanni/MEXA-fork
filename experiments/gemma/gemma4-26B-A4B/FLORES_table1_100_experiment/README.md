# Gemma 4 26B-A4B — FLORES Table 1 (100 sents) on LRZ AI Systems

MoE model: 25.2B total / 3.8B active params → ~51GB in bf16, fits on a single
H100 94GB (`lrz-hgx-h100-94x4`) or A100 80GB (`lrz-hgx-a100-80x4`).

## One-time setup on the cluster

```bash
# 1. From your Mac: sync the repo (excludes heavy/derived files)
rsync -avz --exclude node_modules --exclude '*.pkl' --exclude cache \
    ~/MEXA-fork ge27tuv2@login.ai.lrz.de:~/

# 2. On the login node: install miniforge if not present
ssh ai
wget "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
bash Miniforge3-$(uname)-$(uname -m).sh -b
source "$HOME/miniforge3/etc/profile.d/conda.sh"

# 3. Create the env (packages are pip-installed inside the job)
conda create -n mexa_conda python=3.11 -y
```

## Hugging Face access (gated repo)

1. Accept the Gemma license at https://huggingface.co/google/gemma-4-26B-A4B
2. Create a read token at https://huggingface.co/settings/tokens

## Submit

```bash
cd ~/MEXA-fork/experiments/gemma/gemma4-26B-A4B/FLORES_table1_100_experiment
export HF_TOKEN=hf_...
sbatch --export=ALL run_lrz_cluster.slurm

# Check status (sparingly — LRZ forbids automated/looped Slurm queries)
squeue --me
tail -f gemma4_26b_a4b_flores_table1_100_output.log
```

## Retrieve results

```bash
# From your Mac
rsync -avz "ge27tuv2@login.ai.lrz.de:~/MEXA-fork/dashboard/public/data/flores_table1_100_gemma4_26b_a4b_results.csv" \
    ~/MEXA-fork/dashboard/public/data/
rsync -avz "ge27tuv2@login.ai.lrz.de:~/MEXA-fork/dashboard/public/data/projections_flores_table1_100_gemma4_26b_a4b.json" \
    ~/MEXA-fork/dashboard/public/data/
```

## Notes

- `--gres=gpu:1` and `--qos=gpu` are mandatory on LRZ; jobs without GRES stay
  pending forever with reason `QOSMinGRES`.
- The ~50GB model download lands in `./cache` inside this experiment dir
  (`HF_HOME` is set there) — delete it after the run to free quota.
- The multimodal checkpoint is loaded text-only via `AutoModelForCausalLM`
  (`--model_type causal`), same path as the Qwen3-30B-A3B MoE experiment.
- 30 transformer layers → 31 hidden states per sentence; `compute_mexa.py`
  max/mean-pools across them as usual.
