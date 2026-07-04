import os

root_dir = "/Users/wassim/MEXA-fork"
experiments_dir = os.path.join(root_dir, "experiments")

for dirpath, dirnames, filenames in os.walk(experiments_dir):
    for filename in filenames:
        if filename == "run_coma_cluster.slurm":
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_dir)
            # Count the number of directories in rel_path to determine depth
            parts = rel_path.split(os.sep)
            depth = len(parts) - 1  # -1 because parts includes the filename itself
            
            # The original files assumed they were at depth 2 (e.g. model/experiment/run_coma_cluster.slurm)
            # meaning they used "../../" to refer to the root.
            # Now they are at depth 3 or 4.
            # We want to replace paths accordingly:
            # - For python script/files in root: " ../../" -> " " + "../" * depth
            # - For shared: "../../shared/" -> "../" * depth + "shared/"
            # - For dashboard data: "../../dashboard/public/data/" -> "../" * depth + "dashboard/public/data/"
            # - For flores dataset: "../../flores200_dataset/" -> "../" * depth + "data/flores200_dataset/"
            # - For bible dataset: "../../bible_dataset/" -> "../" * depth + "data/bible_dataset/"
            
            with open(filepath, "r") as f:
                content = f.read()
            
            # We construct the prefix mapping.
            # Original depth was 2. So we replace:
            # 1. "../../flores200_dataset" -> "../" * depth + "data/flores200_dataset"
            # 2. "../../bible_dataset" -> "../" * depth + "data/bible_dataset"
            # 3. "../../shared/" -> "../" * depth + "shared/"
            # 4. "../../dashboard/public/data" -> "../" * depth + "dashboard/public/data"
            # 5. "../../embed_extractor.py" -> "../" * depth + "embed_extractor.py"
            # 6. "../../compute_mexa.py" -> "../" * depth + "compute_mexa.py"
            # 7. "../../compute_projections.py" -> "../" * depth + "compute_projections.py"
            # 8. "../../*.py" (e.g. for any other python script) -> "../" * depth + "*.py"
            
            up_root = "../" * depth
            
            # Let's perform replacements safely. We do specific replacements first to avoid issues.
            new_content = content
            
            # Replace datasets (note they might end with /devtest or similar)
            new_content = new_content.replace("../../flores200_dataset", up_root + "data/flores200_dataset")
            new_content = new_content.replace("../../bible_dataset", up_root + "data/bible_dataset")
            
            # Replace dashboard public data path
            new_content = new_content.replace("../../dashboard/public/data", up_root + "dashboard/public/data")
            
            # Replace shared directory reference
            new_content = new_content.replace("../../shared", up_root + "shared")
            
            # Replace any other script references
            new_content = new_content.replace("../../embed_extractor.py", up_root + "embed_extractor.py")
            new_content = new_content.replace("../../compute_mexa.py", up_root + "compute_mexa.py")
            new_content = new_content.replace("../../compute_projections.py", up_root + "compute_projections.py")
            new_content = new_content.replace("../../compute_averages.py", up_root + "compute_averages.py")
            new_content = new_content.replace("../../download_bible.py", up_root + "download_bible.py")
            
            # Also catch any other python3 ../../ calls
            new_content = new_content.replace(" ../../", " " + up_root)
            
            if new_content != content:
                print(f"Updating {rel_path} (depth {depth})...")
                with open(filepath, "w") as f:
                    f.write(new_content)
