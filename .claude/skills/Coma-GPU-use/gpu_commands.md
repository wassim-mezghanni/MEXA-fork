# first : I will be always  on eduroam / inside MWN so use : 
you can connect directly:
bashssh wassim@cluster.ginkgo-project.de
## or if DNS fails:
ssh wassim@10.152.225.230

# GPU Allocation Commands — COMA Cluster

All `salloc` commands to request GPUs on the cluster.

---

## NVIDIA GPUs

```bash
# H100 (96GB) - most powerful
salloc -w gpu-nvidia-h100 --gres gpu:nvidia:1 -t 02:00:00 -p compute
```

```bash
# H200 (144GB) - biggest memory, 3 nodes available
salloc -w gpu-nvidia-h200-1 --gres gpu:nvidia:1 -t 02:00:00 -p compute
salloc -w gpu-nvidia-h200-2 --gres gpu:nvidia:1 -t 02:00:00 -p compute
salloc -w gpu-nvidia-h200-3 --gres gpu:nvidia:1 -t 02:00:00 -p compute
```

```bash
# L40S (48GB)
salloc -w gpu-nvidia --gres gpu:nvidia:1 -t 02:00:00 -p development
```

```bash
# A100 (40GB) - on rocinante
salloc -w rocinante --gres gpu:nvidia:1 -t 02:00:00 -p develop
```

---

## AMD GPUs

```bash
# MI210 (64GB)
salloc -w gpu-amd --gres gpu:amd:1 -t 02:00:00 -p develop
```

```bash
# MI50 (16GB) - on rocinante
salloc -w rocinante --gres gpu:amd:1 -t 02:00:00 -p develop
```

---

## Intel GPUs

```bash
# Intel Max 1100 (48GB)
salloc -w gpu-intel-pvc --gres gpu:intel:1 -t 02:00:00 -p develop
```

```bash
# Intel A770 (16GB)
salloc -w gpu-intel --gres gpu:intel:1 -t 02:00:00 -p develop
```

---

## After Connecting — Verify GPU

```bash
# For NVIDIA
nvidia-smi

# For AMD
rocm-smi

# For Intel
xpu-smi
```

---

> ⚠️ **Tip:** Start with the **develop/development** partition nodes for testing.
> Only use the `compute` partition (H100/H200) for actual training runs.
