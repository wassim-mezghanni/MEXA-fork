$MODEL_NAME = "mistralai/Mixtral-8x7B-v0.1"
$DATA_DIR = "../../bible_dataset/103"
$SAVE_EMBD_DIR = "./embeddings"
$SAVE_SCORE_DIR = "./scores"
$CSV_OUTPUT_PATH = "../../dashboard/public/data/bible_mixtral_8x7b_results.csv"
$PYTHON_PATH = "C:\Users\ge27tuv\classify_venv\Scripts\python.exe"

# Download Bible dataset if not found
if (-not (Test-Path $DATA_DIR)) {
    Write-Host "Bible dataset not found. Downloading..."
    & $PYTHON_PATH ../../download_bible.py --output_dir $DATA_DIR
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ERROR: Failed to download Bible dataset."
        exit 1
    }
}
if (-not (Test-Path "$DATA_DIR\eng_Latn.txt")) {
    Write-Error "ERROR: Pivot file $DATA_DIR\eng_Latn.txt not found."
    exit 1
}

# Create directories if they do not exist
New-Item -ItemType Directory -Force -Path $SAVE_EMBD_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $SAVE_SCORE_DIR | Out-Null

# 1. Extracting Embeddings...
Write-Host "1. Extracting Embeddings in 4-bit precision..."
& $PYTHON_PATH ../../embed_extractor.py `
    --model_name $MODEL_NAME `
    --model_type causal `
    --data_path $DATA_DIR `
    --gpus '0' `
    --num_sents 103 `
    --save_path $SAVE_EMBD_DIR `
    --file_ext ".txt" `
    --cache_dir "../../cache" `
    --load_in_4bit

# 2. Computing MEXA alignments...
Write-Host "2. Computing MEXA alignments..."
& $PYTHON_PATH ../../compute_mexa.py `
    --embedding_path $SAVE_EMBD_DIR `
    --save_path $SAVE_SCORE_DIR `
    --num_sents 103 `
    --embedding_type embd_weighted `
    --pivot eng_Latn `
    --file_ext .pkl

# 3. Formatting Results for the Dashboard...
Write-Host "3. Formatting Results for the Dashboard..."
& $PYTHON_PATH ../../shared/format_results.py `
    --model_name $MODEL_NAME `
    --scores_dir $SAVE_SCORE_DIR `
    --output_csv $CSV_OUTPUT_PATH

# # 4. Computing 2D Projections...
# Write-Host "4. Computing 2D Projections..."
# & $PYTHON_PATH ../../compute_projections.py `
#     --embedding_path $SAVE_EMBD_DIR `
#     --output_json "../../dashboard/public/data/projections_bible_mixtral_8x7b.json" `
#     --embedding_type embd_weighted `
#     --num_sents 103 `
#     --file_ext .pkl

# 5. Cleaning up embeddings to conserve disk space...
Write-Host "5. Cleaning up embeddings..."
if (Test-Path "$SAVE_EMBD_DIR\*.pkl") {
    Remove-Item -Path "$SAVE_EMBD_DIR\*.pkl" -Force
}

Write-Host "Job Finished Successfully!"
