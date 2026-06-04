#!/bin/bash
# Script to organize dashboard data filenames and update references in source code (compatible version)

DATA_DIR="dashboard/public/data"
SRC_DIR="dashboard/src"

RENAME_FILES() {
    old=$1
    new=$2
    if [ -f "$DATA_DIR/$old" ]; then
        echo "Moving $old to $new"
        mv "$DATA_DIR/$old" "$DATA_DIR/$new"
        
        # Update references in source code
        echo "Updating references to $old in $SRC_DIR"
        find "$SRC_DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs sed -i '' "s|$old|$new|g"
    fi
}

# Bible
RENAME_FILES "llama3-1-8b-bible-results.csv" "bible_llama3.1_8b_results.csv"
RENAME_FILES "mistral-7b-v03-bible-results.csv" "bible_mistral_7b_v03_results.csv"
RENAME_FILES "qwen3-8b-bible-results.csv" "bible_qwen3_8b_results.csv"
RENAME_FILES "apertus-8b-bible-results.csv" "bible_apertus_8b_results.csv"

# FLORES
RENAME_FILES "llama3-1-8b-results.csv" "flores_llama3.1_8b_results.csv"
RENAME_FILES "mistral-7b-v03-results.csv" "flores_mistral_7b_v03_results.csv"
RENAME_FILES "qwen3-8b-flores-results.csv" "flores_qwen3_8b_results.csv"
RENAME_FILES "apertus-8b-flores-results.csv" "flores_apertus_8b_results.csv"

# Full FLORES
RENAME_FILES "llama3-1-8b-FLORES_full_experiment-results.csv" "full_flores_llama3.1_8b_results.csv"

# Table 1 Bible (101 langs)
RENAME_FILES "llama3-1-8b-bible-table1-results.csv" "bible_table1_llama3.1_8b_results.csv"
RENAME_FILES "mistral-7b-v03-bible-table1-results.csv" "bible_table1_mistral_7b_v03_results.csv"

# Projections
RENAME_FILES "projections-llama3.1-8b-bible.json" "projections_bible_llama3.1_8b.json"
RENAME_FILES "projections-llama3.1-8b.json" "projections_flores_llama3.1_8b.json"
RENAME_FILES "projections-llama3.1-8b-FLORES_full_experiment.json" "projections_full_flores_llama3.1_8b.json"
RENAME_FILES "projections-mistral-7b-v03-bible.json" "projections_bible_mistral_7b_v03.json"
RENAME_FILES "projections-mistral-7b-v03.json" "projections_flores_mistral_7b_v03.json"
RENAME_FILES "projections-qwen3-8b-bible.json" "projections_bible_qwen3_8b.json"
RENAME_FILES "projections-qwen3-8b-flores.json" "projections_flores_qwen3_8b.json"
RENAME_FILES "projections-apertus-8b-bible.json" "projections_bible_apertus_8b.json"
RENAME_FILES "projections-apertus-8b-flores.json" "projections_flores_apertus_8b.json"

# Update Slurm scripts output paths
echo "Updating Slurm scripts output paths..."
find . -maxdepth 2 -name "*.slurm" | xargs sed -i '' "s|llama3-1-8b-table1-results.csv|full_flores_llama3.1_8b_results.csv|g"
find . -maxdepth 2 -name "*.slurm" | xargs sed -i '' "s|llama3-1-8b-bible-table1-results.csv|bible_table1_llama3.1_8b_results.csv|g"
find . -maxdepth 2 -name "*.slurm" | xargs sed -i '' "s|mistral-7b-v03-bible-table1-results.csv|bible_table1_mistral_7b_v03_results.csv|g"

echo "Done organizing files!"
