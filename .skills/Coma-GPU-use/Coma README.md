Sections:
1. [Connecting to the cluster](#connecting-to-the-cluster)
1. [Login node](#login-node)
1. [Accessing compute nodes](#accessing-compute-nodes)
1. [Available hardware](#available-hardware)
1. [Software](#software)
1. [Containers](#containers)
1. [Data storage](#data-storage)
1. [Access for external users](#access-for-external-users)
1. [Service requests](#service-requests)

# Connecting to the cluster

The cluster is available only inside the Münchner Wissenschaftsnetz (MWN), you need to use eduVPN if you are working from home or through eduroam.
You can connect to the server via ssh:

```bash
ssh username@cluster.ginkgo-project.de
```

There are some DNS issues when using eduVPN and eduroam that we are currently trying to resolve with campus IT, so if you can't connect to the server by its hostname, try

```bash
ssh username@10.152.225.230
```

If you need to change your ssh keys, open an issue [**here**](#service-requests)

# Login node

When you connect to the cluster, you are on the login node. This node is used by all users at the same time, so please be mindful of how you use it:
* Use the login node for short pre- or post-processing, compiling small projects, developing code, downloading data, ...
* Please don't execute any long-running and CPU-heavy processes, use the compute nodes for that purpose.
* All of your processes will be killed once you log out of your last session, `tmux` or `nohup` will not prevent this.

# Accessing compute nodes

We use [Slurm](https://slurm.schedmd.com/quickstart.html) to manage access to the compute nodes. Accessing a compute node happens through **jobs** that are submitted to a *queue*.

You can run an **interactive job** that gives you a shell with access to the requested resources:

```bash
# anatomy of a salloc call:
salloc [-w hostname] [--gres gpu:vendor:count] [--excusive] [-n number-of-cores] [-t duration] [-p partition]

# run an interactive job on any available node
# This requests only 1 CPU core and no GPUs for 1 hour (default)
# The CPU limits are not enforced, but the GPUs are not available
salloc

# run an interactive job on a specific node with a 2h time limit
# and a single AMD GPU from the develop partition
salloc -w gpu-amd -t 02:00:00 --gres gpu:amd:1 -p develop

# allocate an entire node with 2 GPUs for yourself for 30 minutes
# please only do this if you need to run benchmarks!
salloc --exclusive --gres gpu:nvidia:2 -t 00:30:00

# allocate 24 tasks (= cores) on any node
# this limit is not enforced, but prevents others from allocating these cores
salloc -n 24
```

If you don't want to run an interactive job, you can use `sbatch` to submit a **batch job**, which takes an input script and submits it to a queue.

You can also find some more usage information about Slurm, especially how to write batch job files, at the [LRZ documentation](https://doku.lrz.de/slurm-workload-manager-10745909.html).

# Available hardware

| Hostname   | CPU | Memory | Storage | GPUs <br>(and how to allocate them)| Partition |
| ------     | ------ | ----- | ----- | ---- | ----- |
| login | 1x AMD EPYC 9124 (16C/32T) | 128 GB | 880 GB NVMe SSD | -- | login |
| gpu-nvidia-h100 | 2x Intel Xeon Gold 6548N<br>Sapphire Rapids (32C/64T) | 2 TB | 15 TB NVMe SSD | 4x NVIDIA H100 (96 GB)<br>`--gres gpu:nvidia:1` | compute |
| gpu-nvidia-h200-1/2/3 | 2x AMD EPYC 9555<br>Turin (64C/128T) | 2.3 TB | 7 TB NVMe SSD | 8x NVIDIA H200 (144 GB)<br>`--gres gpu:nvidia:1` | compute |
| gpu-nvidia | 2x Intel Xeon Gold 6438Y+<br>Sapphire Rapids (32C/64T) | 1 TB | 880 GB NVMe SSD | 2x NVIDIA L40S (48 GB)<br>`--gres gpu:nvidia:1` | development |
| gpu-amd    | 2x Intel Xeon Gold 6438Y+<br>Sapphire Rapids (32C/64T) | 256 GB | 880 GB NVMe SSD | 2x AMD MI210 (64 GB)<br>`--gres gpu:amd:1` | develop |
| gpu-intel-pvc | 2x Intel Xeon Platinum 8480+<br>Sapphire Rapids (56C/112T) | 512 GB | 7 TB NVMe SSD | 2x Intel Max 1100 (48 GB)<br>`--gres gpu:intel:1` | develop |
| gpu-intel  | 1x AMD Ryzen 9 7900X3D (12C/24T) | 128 GB | 916 GB NVMe SSD | 2x Intel A770 (16 GB)<br>`--gres gpu:intel:1` | develop |
| rocinante | 2x AMD EPYC 7713<br>Milan (64C/128T) | 512 GB | 880 GB NVMe SSD | 1x NVIDIA A100 (40 GB)<br>2x NVIDIA A2 (16 GB)<br>1x NVIDIA P100 (16 GB)<br>3x AMD MI50 (16 GB) <br>1x Intel A770 (16 GB)<br>`--gres gpu:nvidia/amd/intel:1` | develop |

# Software

The software on the compute nodes is managed via [Spack](https://spack.io/), which is a package manager focused on High Performance Computing environments.

We expose the spack packages via modules, which can be listed through the `module avail` command and loaded with the `module load` command.

```bash
# list all available modules
$ module avail
----------------------------------------------------------------------------------------------------------------------- /storage/apps/opt/rocm-modules ------------------------------------------------------------------------------------------------------------------------
   rocm/5.1.2    rocm/5.2.4    rocm/5.3.0    rocm/5.3.3    rocm/5.4.1    rocm/5.4.3    rocm/5.4.6    rocm/5.5.1    rocm/5.5.3    rocm/5.6.1    rocm/5.7.1    rocm/5.7.3    rocm/6.0.1    rocm/6.0.3    rocm/6.1.1    rocm/6.1.3
   rocm/5.1.4    rocm/5.2.5    rocm/5.3.2    rocm/5.4.0    rocm/5.4.2    rocm/5.4.5    rocm/5.5.0    rocm/5.5.2    rocm/5.6.0    rocm/5.7.0    rocm/5.7.2    rocm/6.0.0    rocm/6.0.2    rocm/6.1.0    rocm/6.1.2    rocm/6.2.0 (D)

------------------------------------------------------------------------------------------------------ /storage/apps/opt/spack/share/spack/lmod/linux-rocky9-x86_64/Core ------------------------------------------------------------------------------------------------------
   apptainer/1.3.4    cmake/3.25.3         cuda/11.1.1    cuda/12.1.1           gcc/9.5.0            git/2.45.2           llvm-amdgpu/6.2.0    llvm/14.0.6                 nvhpc/23.3     nvhpc/24.9                (D)    rocprim/6.2.0
   cmake/3.16.9       cmake/3.26.6         cuda/11.2.2    cuda/12.2.2           gcc/10.5.0           googletest/1.14.0    llvm/6.0.1           llvm/15.0.7                 nvhpc/23.5     openmpi/4.1.6                    rocprofiler-dev/6.2.0
...

# list all cmake versions
$ module avail cmake
------------------------------------------------------------------------------------------------------ /storage/apps/opt/spack/share/spack/lmod/linux-rocky9-x86_64/Core ------------------------------------------------------------------------------------------------------
   cmake/3.16.9    cmake/3.18.6    cmake/3.19.8    cmake/3.20.6    cmake/3.21.7    cmake/3.22.6    cmake/3.23.5    cmake/3.24.4    cmake/3.25.3    cmake/3.26.6    cmake/3.27.9    cmake/3.28.6    cmake/3.29.6    cmake/3.30.5 (D)

# load the default version of cmake
$ module load cmake
# load a specific version of cmake
$ module load cmake/3.16.9
```

If you think there is any software missing that you and others might need, please open an issue [**here**](#service-requests)

If you are using Python-based software, you can create your own environment with [venv](https://docs.python.org/3/library/venv.html) and `pip`, or [conda](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) to install your own software without administrator privileges.

**:warning: WARNING :warning: Do not use the Miniconda installer provided by Anaconda, use Miniforge instead, which relies on community-maintained repositories only.**
Anaconda is trying to collect license fees from academic institutions where people use it. [Details](https://www.theregister.com/2024/08/08/anaconda_puts_the_squeeze_on/)

# Containers

Complex software environments can often most easily be stored via containers. We support the Apptainer/Singularity container runtime, which runs entirely in user-space, and has built-in support for GPUs. The commands you need to know:

### Downloading a container

To pull a container from DockerHub and write it to a Singularity Image File (SIF)

```bash
apptainer pull docker://ubuntu:latest # creates ubuntu_latest.sif
```

### Open a shell inside the container

Once you dowloaded the SIF file, you can enter it via

```bash
apptainer shell ubuntu_latest.sif
```

Inside an apptainer shell, your home directory is mounted regularly, but all software etc. is provided by the container. Note that all files outside the home directory are read-only.

### GPU support

If you want to use an NVIDIA GPU with the application inside the container, pass the `--nv` flag

```bash
apptainer shell --nv tensorflow_latest.sif
```

### Mounting additional paths

If you want to access additional files outside the home directory from the host, you can specify their path using the `--bind` flag. The parameter can take three forms: `bind-path`, `bind-source:bind-destination` or `bind-source:bind-destination:rw/ro`

```bash
# mount /tmp as /tmp, mount /data as /container-data with read-only access
apptainer shell --bind /tmp --bind /data:/container-data:ro alpine_latest.sif
```

### Writable containers and Fakeroot

If you need to modify some files in the container, you can add a persistent overlay, either as a separate file, or inside the container.
For more details, check out https://apptainer.org/docs/user/latest/persistent_overlays.html

If you want to become root inside the container (which doesn't give you actual root permissions, just lets you write to all files inside the container), you can use the `fakeroot` feature of apptainer.
For more details, check out https://apptainer.org/docs/user/latest/fakeroot.html#usage

If you just want a quick-and-dirty fakeroot setup, you can follow the following steps:

```bash
# create a 1GB overlay for all changed/added files on top of the container
apptainer overlay create --fakeroot --size 1024 overlay.img
# enter the container with the overlay mounted
apptainer shell --cleanenv --fakeroot --overlay overlay.img ubuntu_latest.sif
# now you can install your own software
apt-get update
apt-get install git
```

# Data storage

Each user has their own home directory at `/storage/home/<username>` that is part of our storage node, mounted as a network filesystem (NFS). The home directories get snapshotted and backed up to LRZ in Garching daily.
If you accidentally deleted a file, we will most likely be able to recover it, if it was created more than a day ago. Old snapshots will be deleted after 30 days.
Additionally, there is a `nobackup` partition available at `/storage/nobackup/<username>` that should be used for large datasets like training data or models. The nobackup storage dedicated to your user account is also available through a symlink in your home directory: `~/nobackup`. This data will still be snapshotted daily, but will not be included in the off-site backup to LRZ. This allows us to keep the amount of data we need to backup via our internet connection small, while still allowing the restoration of accidentally deleted data from `nobackup`.

We have 60 TB of storage available for software, user homes and research data.

Each node also has a small amount of fast local `scratch` storage that is symlinked to your home directory's scratch path. This storage is not available from other nodes and will not be backed up. If we run into storage limitations, we will clean up this scratch storage, so don't use it for anything permanent.

# Access for external users

External users can log in through our jump host without the need for a VPN:

```bash
ssh -4 -p 55841 username@comavm1.cit.tum.de
```

This access path is only enabled for external users. Alternatively, they can use an ssh config entry like

```
Host coma-cluster
    Hostname comavm1.cit.tum.de
    User username
    Port 55841
    AddressFamily inet
    IdentityFile ~/.ssh/id_rsa
    IdentitiesOnly yes
```

and log in via

```bash
ssh coma-cluster
```

# Service requests

1. [Create a new user account for a TUM employee (Professor, Postdoc, PhD student, ...)](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=New%20user:%20username&issuable_template=New%20user)
1. [Create a new user account for a TUM student as a supervisor (Thesis, Student assistant, ...)](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=New%20student%20user:%20username&issuable_template=New%20student%20user)
1. [Create a new user account for an external collaborator](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=New%20external%20user:%20username&issuable_template=New%20external%20user)
1. [Change your ssh authorized_keys](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=Change%20ssh%20key:%20username&issuable_template=Change%20SSH%20key)
1. [Deactivate a user account](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=Deactivate%20user:%20username&issuable_template=Deactivate%20user)
1. [Software request](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=Software%20request:%20package-name&issuable_template=Software%20request)
1. [Access develop partition](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issue[title]=Access%20develop%20partition:%20username&issuable_template=Access%20develop%20partition)
1. [Other issue or request](https://gitlab-ce.lrz.de/coma-cluster/servicedesk/-/issues/new?issuable_template=Other%20issue)
