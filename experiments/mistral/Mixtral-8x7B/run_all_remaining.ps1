# HF_TOKEN should be set in the environment before running this script
if (-not $env:HF_TOKEN) {
    Write-Warning "HF_TOKEN environment variable is not set. Hugging Face downloads might fail if the model requires authentication."
}

$CSV_PATH = "H:\Desktop\MEXA-fork\dashboard\public\data\bible_table1_mixtral_8x7b_results.csv"

Write-Host "Waiting for the currently running Bible Table 1 experiment to finish (monitoring $CSV_PATH)..."
while (-not (Test-Path $CSV_PATH)) {
    Start-Sleep -Seconds 60
}
Write-Host "Bible Table 1 experiment finished! Starting the next experiments sequentially..."

# 1. Bible Full
Write-Host "=================================================="
Write-Host "1. Running Bible Full Experiment..."
Write-Host "=================================================="
Push-Location .\bible_experiment
powershell -ExecutionPolicy Bypass -File .\run_local.ps1
Pop-Location

# 2. FLORES Table 1 (2000)
Write-Host "=================================================="
Write-Host "2. Running FLORES Table 1 (2000) Experiment..."
Write-Host "=================================================="
Push-Location .\FLORES_table1_2000_experiment
powershell -ExecutionPolicy Bypass -File .\run_local.ps1
Pop-Location

# 3. FLORES Full
Write-Host "=================================================="
Write-Host "3. Running FLORES Full Experiment..."
Write-Host "=================================================="
Push-Location .\FLORES_full_experiment
powershell -ExecutionPolicy Bypass -File .\run_local.ps1
Pop-Location

Write-Host "All remaining experiments finished successfully!"
