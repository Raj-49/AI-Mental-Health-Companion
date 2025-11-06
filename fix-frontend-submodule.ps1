# ============================================================================
# Fix Frontend Folder as Git Submodule
# ============================================================================
# This script removes the frontend folder from being treated as a git submodule
# and ensures all files are tracked normally in the main repository.
# ============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Frontend Submodule Fix Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get the script's directory (repository root)
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendPath = Join-Path $RepoRoot "frontend"

Write-Host "[INFO] Repository Root: $RepoRoot" -ForegroundColor Green
Write-Host "[INFO] Frontend Path: $FrontendPath`n" -ForegroundColor Green

# ============================================================================
# STEP 1: Check if frontend folder exists
# ============================================================================
Write-Host "[STEP 1] Checking if frontend folder exists..." -ForegroundColor Yellow

if (-not (Test-Path $FrontendPath)) {
    Write-Host "[ERROR] Frontend folder not found at: $FrontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "[SUCCESS] Frontend folder found.`n" -ForegroundColor Green

# ============================================================================
# STEP 2: Check and remove .git folder inside frontend
# ============================================================================
Write-Host "[STEP 2] Checking for .git folder inside frontend..." -ForegroundColor Yellow

$FrontendGitPath = Join-Path $FrontendPath ".git"

if (Test-Path $FrontendGitPath) {
    Write-Host "[WARNING] Found .git folder inside frontend!" -ForegroundColor Red
    Write-Host "[ACTION] Removing .git folder from frontend..." -ForegroundColor Yellow
    
    try {
        # Remove the .git folder (submodule marker)
        Remove-Item -Path $FrontendGitPath -Recurse -Force
        Write-Host "[SUCCESS] Removed .git folder from frontend.`n" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Failed to remove .git folder: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "[INFO] No .git folder found in frontend. Good!`n" -ForegroundColor Green
}

# ============================================================================
# STEP 3: Check and remove .gitmodules file
# ============================================================================
Write-Host "[STEP 3] Checking for .gitmodules file..." -ForegroundColor Yellow

$GitModulesPath = Join-Path $RepoRoot ".gitmodules"

if (Test-Path $GitModulesPath) {
    Write-Host "[WARNING] Found .gitmodules file!" -ForegroundColor Red
    Write-Host "[ACTION] Removing .gitmodules file..." -ForegroundColor Yellow
    
    try {
        # Remove from git tracking
        git rm -f .gitmodules 2>&1 | Out-Null
        
        # Also remove the file if it still exists
        if (Test-Path $GitModulesPath) {
            Remove-Item -Path $GitModulesPath -Force
        }
        
        Write-Host "[SUCCESS] Removed .gitmodules file.`n" -ForegroundColor Green
    }
    catch {
        Write-Host "[WARNING] Could not remove .gitmodules: $_" -ForegroundColor Yellow
        Write-Host "[INFO] This is usually fine if the file doesn't exist.`n" -ForegroundColor Green
    }
}
else {
    Write-Host "[INFO] No .gitmodules file found. Good!`n" -ForegroundColor Green
}

# ============================================================================
# STEP 4: Remove frontend from git cache (if tracked as submodule)
# ============================================================================
Write-Host "[STEP 4] Removing frontend from git cache..." -ForegroundColor Yellow

try {
    # Remove frontend from git cache without deleting files
    git rm --cached -r frontend 2>&1 | Out-Null
    Write-Host "[SUCCESS] Removed frontend from git cache.`n" -ForegroundColor Green
}
catch {
    Write-Host "[INFO] Frontend was not in cache or already removed.`n" -ForegroundColor Green
}

# ============================================================================
# STEP 5: Check and remove submodule entry from .git/config
# ============================================================================
Write-Host "[STEP 5] Checking .git/config for submodule entries..." -ForegroundColor Yellow

$GitConfigPath = Join-Path $RepoRoot ".git\config"

if (Test-Path $GitConfigPath) {
    try {
        # Remove submodule configuration if it exists
        git config --remove-section submodule.frontend 2>&1 | Out-Null
        Write-Host "[SUCCESS] Removed submodule.frontend from git config.`n" -ForegroundColor Green
    }
    catch {
        Write-Host "[INFO] No submodule.frontend entry in git config.`n" -ForegroundColor Green
    }
}

# ============================================================================
# STEP 6: Remove submodule from .git/modules (if exists)
# ============================================================================
Write-Host "[STEP 6] Checking .git/modules folder..." -ForegroundColor Yellow

$GitModulesDir = Join-Path $RepoRoot ".git\modules\frontend"

if (Test-Path $GitModulesDir) {
    Write-Host "[WARNING] Found .git/modules/frontend!" -ForegroundColor Red
    Write-Host "[ACTION] Removing .git/modules/frontend..." -ForegroundColor Yellow
    
    try {
        Remove-Item -Path $GitModulesDir -Recurse -Force
        Write-Host "[SUCCESS] Removed .git/modules/frontend.`n" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Failed to remove .git/modules/frontend: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "[INFO] No .git/modules/frontend found. Good!`n" -ForegroundColor Green
}

# ============================================================================
# STEP 7: Add all frontend files to git
# ============================================================================
Write-Host "[STEP 7] Adding all frontend files to git..." -ForegroundColor Yellow

try {
    # Add all files in frontend folder
    git add frontend/
    Write-Host "[SUCCESS] All frontend files staged.`n" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Failed to add frontend files: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# STEP 8: Show git status
# ============================================================================
Write-Host "[STEP 8] Current git status:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

git status

Write-Host "`n----------------------------------------" -ForegroundColor Cyan

# ============================================================================
# STEP 9: Verify frontend is not a submodule
# ============================================================================
Write-Host "`n[STEP 9] Verification checks:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

$AllGood = $true

# Check 1: No .git in frontend
if (Test-Path $FrontendGitPath) {
    Write-Host "[❌] .git folder still exists in frontend" -ForegroundColor Red
    $AllGood = $false
}
else {
    Write-Host "[✓] No .git folder in frontend" -ForegroundColor Green
}

# Check 2: No .gitmodules
if (Test-Path $GitModulesPath) {
    Write-Host "[❌] .gitmodules file still exists" -ForegroundColor Red
    $AllGood = $false
}
else {
    Write-Host "[✓] No .gitmodules file" -ForegroundColor Green
}

# Check 3: Frontend files are tracked
$FrontendFiles = git ls-files frontend/ 2>&1
if ($LASTEXITCODE -eq 0 -and $FrontendFiles) {
    Write-Host "[✓] Frontend files are tracked by git" -ForegroundColor Green
}
else {
    Write-Host "[⚠] Frontend files may not be fully tracked" -ForegroundColor Yellow
    $AllGood = $false
}

Write-Host "----------------------------------------`n" -ForegroundColor Cyan

# ============================================================================
# FINAL SUMMARY
# ============================================================================
if ($AllGood) {
    Write-Host "[SUCCESS] ✓ Frontend is now part of the main repository!" -ForegroundColor Green
    Write-Host "[INFO] You can now commit these changes:" -ForegroundColor Cyan
    Write-Host "       git commit -m 'Remove frontend submodule, add as regular folder'" -ForegroundColor White
    Write-Host "       git push origin main`n" -ForegroundColor White
}
else {
    Write-Host "[WARNING] Some issues were detected. Please review the status above." -ForegroundColor Yellow
    Write-Host "[INFO] You may need to manually resolve some issues.`n" -ForegroundColor Cyan
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script completed!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
