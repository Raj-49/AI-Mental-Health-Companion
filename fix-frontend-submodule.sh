#!/bin/bash

# ============================================================================
# Fix Frontend Folder as Git Submodule (Bash/Linux/Mac)
# ============================================================================
# This script removes the frontend folder from being treated as a git submodule
# and ensures all files are tracked normally in the main repository.
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}========================================"
echo -e "Frontend Submodule Fix Script"
echo -e "========================================${NC}\n"

# Get repository root (where the script is located)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_PATH="$REPO_ROOT/frontend"

echo -e "${GREEN}[INFO] Repository Root: $REPO_ROOT"
echo -e "[INFO] Frontend Path: $FRONTEND_PATH${NC}\n"

# ============================================================================
# STEP 1: Check if frontend folder exists
# ============================================================================
echo -e "${YELLOW}[STEP 1] Checking if frontend folder exists...${NC}"

if [ ! -d "$FRONTEND_PATH" ]; then
    echo -e "${RED}[ERROR] Frontend folder not found at: $FRONTEND_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}[SUCCESS] Frontend folder found.${NC}\n"

# ============================================================================
# STEP 2: Check and remove .git folder inside frontend
# ============================================================================
echo -e "${YELLOW}[STEP 2] Checking for .git folder inside frontend...${NC}"

FRONTEND_GIT_PATH="$FRONTEND_PATH/.git"

if [ -e "$FRONTEND_GIT_PATH" ]; then
    echo -e "${RED}[WARNING] Found .git folder inside frontend!${NC}"
    echo -e "${YELLOW}[ACTION] Removing .git folder from frontend...${NC}"
    
    rm -rf "$FRONTEND_GIT_PATH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS] Removed .git folder from frontend.${NC}\n"
    else
        echo -e "${RED}[ERROR] Failed to remove .git folder${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[INFO] No .git folder found in frontend. Good!${NC}\n"
fi

# ============================================================================
# STEP 3: Check and remove .gitmodules file
# ============================================================================
echo -e "${YELLOW}[STEP 3] Checking for .gitmodules file...${NC}"

GITMODULES_PATH="$REPO_ROOT/.gitmodules"

if [ -f "$GITMODULES_PATH" ]; then
    echo -e "${RED}[WARNING] Found .gitmodules file!${NC}"
    echo -e "${YELLOW}[ACTION] Removing .gitmodules file...${NC}"
    
    # Remove from git tracking
    git rm -f .gitmodules 2>/dev/null
    
    # Also remove the file if it still exists
    if [ -f "$GITMODULES_PATH" ]; then
        rm -f "$GITMODULES_PATH"
    fi
    
    echo -e "${GREEN}[SUCCESS] Removed .gitmodules file.${NC}\n"
else
    echo -e "${GREEN}[INFO] No .gitmodules file found. Good!${NC}\n"
fi

# ============================================================================
# STEP 4: Remove frontend from git cache (if tracked as submodule)
# ============================================================================
echo -e "${YELLOW}[STEP 4] Removing frontend from git cache...${NC}"

git rm --cached -r frontend 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Removed frontend from git cache.${NC}\n"
else
    echo -e "${GREEN}[INFO] Frontend was not in cache or already removed.${NC}\n"
fi

# ============================================================================
# STEP 5: Check and remove submodule entry from .git/config
# ============================================================================
echo -e "${YELLOW}[STEP 5] Checking .git/config for submodule entries...${NC}"

git config --remove-section submodule.frontend 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Removed submodule.frontend from git config.${NC}\n"
else
    echo -e "${GREEN}[INFO] No submodule.frontend entry in git config.${NC}\n"
fi

# ============================================================================
# STEP 6: Remove submodule from .git/modules (if exists)
# ============================================================================
echo -e "${YELLOW}[STEP 6] Checking .git/modules folder...${NC}"

GIT_MODULES_DIR="$REPO_ROOT/.git/modules/frontend"

if [ -d "$GIT_MODULES_DIR" ]; then
    echo -e "${RED}[WARNING] Found .git/modules/frontend!${NC}"
    echo -e "${YELLOW}[ACTION] Removing .git/modules/frontend...${NC}"
    
    rm -rf "$GIT_MODULES_DIR"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[SUCCESS] Removed .git/modules/frontend.${NC}\n"
    else
        echo -e "${RED}[ERROR] Failed to remove .git/modules/frontend${NC}"
    fi
else
    echo -e "${GREEN}[INFO] No .git/modules/frontend found. Good!${NC}\n"
fi

# ============================================================================
# STEP 7: Add all frontend files to git
# ============================================================================
echo -e "${YELLOW}[STEP 7] Adding all frontend files to git...${NC}"

git add frontend/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] All frontend files staged.${NC}\n"
else
    echo -e "${RED}[ERROR] Failed to add frontend files${NC}"
    exit 1
fi

# ============================================================================
# STEP 8: Show git status
# ============================================================================
echo -e "${YELLOW}[STEP 8] Current git status:${NC}"
echo -e "${CYAN}----------------------------------------${NC}"

git status

echo -e "\n${CYAN}----------------------------------------${NC}"

# ============================================================================
# STEP 9: Verify frontend is not a submodule
# ============================================================================
echo -e "\n${YELLOW}[STEP 9] Verification checks:${NC}"
echo -e "${CYAN}----------------------------------------${NC}"

ALL_GOOD=true

# Check 1: No .git in frontend
if [ -e "$FRONTEND_GIT_PATH" ]; then
    echo -e "${RED}[❌] .git folder still exists in frontend${NC}"
    ALL_GOOD=false
else
    echo -e "${GREEN}[✓] No .git folder in frontend${NC}"
fi

# Check 2: No .gitmodules
if [ -f "$GITMODULES_PATH" ]; then
    echo -e "${RED}[❌] .gitmodules file still exists${NC}"
    ALL_GOOD=false
else
    echo -e "${GREEN}[✓] No .gitmodules file${NC}"
fi

# Check 3: Frontend files are tracked
FRONTEND_FILES=$(git ls-files frontend/ 2>/dev/null)
if [ $? -eq 0 ] && [ -n "$FRONTEND_FILES" ]; then
    echo -e "${GREEN}[✓] Frontend files are tracked by git${NC}"
else
    echo -e "${YELLOW}[⚠] Frontend files may not be fully tracked${NC}"
    ALL_GOOD=false
fi

echo -e "${CYAN}----------------------------------------${NC}\n"

# ============================================================================
# FINAL SUMMARY
# ============================================================================
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}[SUCCESS] ✓ Frontend is now part of the main repository!${NC}"
    echo -e "${CYAN}[INFO] You can now commit these changes:${NC}"
    echo -e "${NC}       git commit -m 'Remove frontend submodule, add as regular folder'"
    echo -e "       git push origin main${NC}\n"
else
    echo -e "${YELLOW}[WARNING] Some issues were detected. Please review the status above.${NC}"
    echo -e "${CYAN}[INFO] You may need to manually resolve some issues.${NC}\n"
fi

echo -e "${CYAN}========================================"
echo -e "Script completed!"
echo -e "========================================${NC}\n"
