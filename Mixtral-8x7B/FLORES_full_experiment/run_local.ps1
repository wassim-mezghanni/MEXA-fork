$MODEL_NAME = "mistralai/Mixtral-8x7B-v0.1"
$DATA_DIR = "../../flores200_dataset/devtest"
$SAVE_EMBD_DIR = "./embeddings"
$SAVE_SCORE_DIR = "./scores"
$CSV_OUTPUT_PATH = "../../dashboard/public/data/full_flores_mixtral_8x7b_results.csv"
$PYTHON_PATH = "C:\Users\ge27tuv\classify_venv\Scripts\python.exe"

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
    --num_sents 2000 `
    --save_path $SAVE_EMBD_DIR `
    --file_ext ".devtest" `
    --cache_dir "../../cache" `
    --load_in_4bit

# 2. Computing MEXA alignments...
Write-Host "2. Computing MEXA alignments..."
& $PYTHON_PATH ../../compute_mexa.py `
    --embedding_path $SAVE_EMBD_DIR `
    --save_path $SAVE_SCORE_DIR `
    --num_sents 2000 `
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
#     --output_json "../../dashboard/public/data/projections_full_flores_mixtral_8x7b.json" `
#     --embedding_type embd_weighted `
#     --num_sents 2000 `
#     --file_ext .pkl

# 5. Cleaning up embeddings to conserve disk space...
Write-Host "5. Cleaning up embeddings..."
if (Test-Path "$SAVE_EMBD_DIR\*.pkl") {
    Remove-Item -Path "$SAVE_EMBD_DIR\*.pkl" -Force
}

Write-Host "Job Finished Successfully!"
