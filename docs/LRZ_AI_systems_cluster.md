# LRZ Munich AI Systems Cluster

## 1.1 AI Systems Login
There are two ways how users can access the AI Systems: either via a Terminal (SSH) or via the interactive Web Interface. More information below.

### Login via Terminal (SSH)
Use SSH within your terminal to connect to `login.ai.lrz.de` and log in with your LRZ credentials. Ensure your device is connected to the Munich Scientific Network (MWN). 

The following command logs you into the AI Systems, specifically onto one of the dedicated login nodes. These nodes are intended for preparing and submitting jobs to the compute nodes. From the login nodes, you can allocate resources located on the compute nodes using the Slurm Workload Manager. The compute nodes offer direct access to powerful hardware resources, including CPUs, GPUs, and large memory capacities.

```bash
ssh login.ai.lrz.de -l ge27tuv2
```

> [!WARNING]
> **Attention:** Do not perform heavy computations on the login nodes!

### SSH Key Setup
1. Generate an SSH key pair on your local machine:
   ```bash
   ssh-keygen -t ed25519 -C "ge27tuv2@ai" -f ~/.ssh/id_ed25519_lrz_ai
   ```

2. Copy the public key to the server:
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519_lrz_ai.pub ge27tuv2@login.ai.lrz.de
   ```

3. Create a config entry in your local `~/.ssh/config` file:
   ```text
   Host ai
       HostName login.ai.lrz.de
       User ge27tuv2
       IdentityFile ~/.ssh/id_ed25519_lrz_ai
       ForwardAgent yes
   ```

4. Test the connection:
   ```bash
   ssh ai
   ```

### Login via Browser
Alternatively, you can access the web-based frontend at [https://login.ai.lrz.de](https://login.ai.lrz.de) using the same LRZ credentials. For more information, see *6. Interactive Apps* in their docs.

---

## 1.2 Cluster Policies & Advice

### Important Rules
* **GPU Resource Requests:** You **must** specify the number of GPUs when submitting a job:
  ```bash
  #SBATCH --gres=gpu:<N>
  ```
  Jobs submitted without the `GRES` parameter will remain permanently pending (`PD` state) with the reason `QOSMinGRES`.
* **No Privilege Escalation:** Ordinary users are not allowed to use `sudo` or perform privilege escalation.
* **Slurm Query limits:** Slurm commands (`sinfo`, `squeue`, `sacct`, etc.) rely on expensive remote procedure calls. **Never automate them inside loops** as this can overwhelm the head node and constitute a Denial of Service (DoS) attack.
* **Session Lifetime:** Remote sessions and user processes on login nodes are limited to **30 days** and will be terminated when they exceed this duration.

### Support and Status
* **Cluster Status & Announcements:** [Affected Services - LRZ AI Systems](https://status.lrz.de/affected/ai-systems)
* **Official Documentation:** [LRZ AI Systems Documentation](https://doku.lrz.de/display/PUBLIC/LRZ+AI+Systems)

---

## 1.3 Available Partitions & Hardware

Based on `sinfo`, the LRZ AI Systems cluster provides access to the following partitions:

| Partition | GPU Type | GPUs per Node | Memory/VRAM | Purpose/Notes |
|---|---|---|---|---|
| `lrz-v100x2` (Default) | NVIDIA V100 | 2 | - | General purpose GPU jobs |
| `lrz-hpe-p100x4` | NVIDIA P100 | 4 | - | Legacy/HPE compute nodes |
| `lrz-dgx-1-p100x8` | NVIDIA P100 | 8 | - | High-density P100 nodes |
| `lrz-dgx-1-v100x8` | NVIDIA V100 | 8 | - | DGX-1 V100 nodes |
| `lrz-dgx-a100-80x8` | NVIDIA A100 | 8 | 80 GB | High-performance, high-memory |
| `lrz-hgx-a100-80x4` | NVIDIA A100 | 4 | 80 GB | HGX A100 nodes |
| `lrz-dgx-a100-40x8-mig` | NVIDIA A100 | 8 (MIG) | 40 GB | Multi-Instance GPU (sliced resources) |
| `lrz-hgx-h100-94x4` | NVIDIA H100 | 4 | 94 GB | SOTA H100 nodes (30 nodes available) |
| `lrz-cpu` | None (CPU only) | - | - | Non-GPU workloads |
| `mcml-dgx-a100-40x8` | NVIDIA A100 | 8 | 40 GB | MCML-specific partition |
| `mcml-hgx-a100-80x4` | NVIDIA A100 | 4 | 80 GB | MCML-specific partition |
| `mcml-hgx-h100-94x4` | NVIDIA H100 | 4 | 94 GB | MCML-specific H100 partition |
| `test-v100x2` | NVIDIA V100 | 2 | - | Testing & debugging partition |

---

## 1.4 User Account Association & QOS

Your account has the following resource allocations on the cluster:

* **Account:** `default`
* **QOS (Quality of Service) Access:**
  * `gpu`: Allowed to submit GPU jobs (V100, A100, H100).
  * `cpu`: Allowed to submit CPU-only jobs.
  * `mig`: Allowed to submit Multi-Instance GPU sliced jobs.
* **Partition Associations:** Since no specific partitions are restricted in your Slurm association, you can submit to all partitions listed in `sinfo` as long as you match them with the correct QOS setting (e.g., using `--qos=gpu` for GPU nodes).
