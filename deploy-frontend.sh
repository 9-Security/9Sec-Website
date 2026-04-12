#!/bin/bash
# Nine-Security Frontend — push built site to GitHub Pages
#
# Prerequisites:
#   npm run build   (from this directory: core/frontend)
#   Output: ./dist/  (HTML + hashed assets)
#
# This script runs "git add/commit/push" in the CURRENT working directory.
# It is intended when THIS directory is the git root of the Pages repo
# (e.g. a standalone clone of github.com/9-Security/9Sec-Website).
#
# In the monorepo, core/frontend is usually NOT that repo — then:
#   rsync -av ./dist/ /path/to/9Sec-Website/ && cd /path/to/9Sec-Website && git commit && git push
# Or clone 9Sec-Website, rsync dist into it, commit, push.
#
# Optional: export GITHUB_TOKEN for HTTPS push without SSH.

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Deploying Frontend (GitHub Pages) ===${NC}"

# Check for commit message
if [ "$1" ]; then
    MSG="$1"
else
    echo -e "${YELLOW}Enter commit message (Press Enter for default 'Site Update'):${NC} "
    read input_msg
    if [ -z "$input_msg" ]; then
        MSG="Site Update"
    else
        MSG="$input_msg"
    fi
fi

# Update: Script is now inside 'core/frontend', so current directory IS the frontend root.
# No need to check for 'frontend/' subdirectory or cd into it.

# Git Operations
echo -e "Staging changes..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}No changes to commit for Frontend.${NC}"
else
    echo -e "Committing changes..."
    git commit -m "$MSG"
    
    echo -e "Pushing to GitHub..."
    if [ -n "$GITHUB_TOKEN" ]; then
        ORIGIN_URL=$(git remote get-url origin)
        REPO_PATH="${ORIGIN_URL#https://github.com/}"
        REPO_PATH="${REPO_PATH#git@github.com:}"
        REPO_PATH="${REPO_PATH%.git}"
        USER="${REPO_PATH%%/*}"
        git push "https://${USER}:${GITHUB_TOKEN}@github.com/${REPO_PATH}.git" main
    else
        git push origin main
    fi
    
    if [ $? -eq 0 ]; then
         echo -e "${GREEN}Frontend pushed successfully!${NC}"
    else
         echo -e "${RED}Frontend push failed.${NC}"
    fi
fi

echo -e "\n${CYAN}Frontend URL: https://9-Security.github.io/9Sec-Website/${NC}"
