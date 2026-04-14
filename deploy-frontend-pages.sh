#!/bin/bash
# Build in this monorepo, rsync only core/frontend/dist/ into your GitHub Pages
# checkout (e.g. 9Sec-Website), then commit + push. No monorepo code is uploaded.
#
# From monorepo root:
#   ./deploy-frontend-pages.sh "your commit message"
# This runs npm run build in core/frontend/, syncs dist/ to the Pages repo, then
# git add / commit / push there.
#
# Pages checkout resolution:
#   1. If NINESEC_PAGES_ROOT is set, use it.
#   2. Else if ~/src/9Sec-Website exists and is a git repo, use that (default).
#   3. Otherwise exit with instructions to clone the Pages repo or set NINESEC_PAGES_ROOT.
#
# Override path explicitly:
#   NINESEC_PAGES_ROOT=/path/to/9Sec-Website ./deploy-frontend-pages.sh "commit message"
#
# Options:
#   --no-build     Skip npm run build (use existing dist/)
#
# Preserves repo-only files at destination: CNAME, .nojekyll, README.md (not overwritten by --delete).
# Optional: GITHUB_TOKEN for HTTPS push (same as deploy-frontend.sh).

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR"
MONOREPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

DO_BUILD=1
MSG=""
while [ $# -gt 0 ]; do case "$1" in
        --no-build) DO_BUILD=0; shift ;;
        *) MSG="$1"; shift ;;
    esac
done

DEFAULT_PAGES_ROOT="${HOME}/src/9Sec-Website"
PAGES_ROOT="${NINESEC_PAGES_ROOT:-}"
if [ -z "$PAGES_ROOT" ] && [ -d "$DEFAULT_PAGES_ROOT/.git" ]; then
    PAGES_ROOT="$DEFAULT_PAGES_ROOT"
fi
if [ -z "$PAGES_ROOT" ]; then
    echo -e "${RED}Set NINESEC_PAGES_ROOT to your Pages repo clone (e.g. 9Sec-Website).${NC}"
    echo "Detected default path not available: $DEFAULT_PAGES_ROOT"
    echo "Example: NINESEC_PAGES_ROOT=\$HOME/src/9Sec-Website $0 \"Site update\""
    exit 1
fi

if [ ! -d "$PAGES_ROOT/.git" ]; then
    echo -e "${RED}Not a git repository: $PAGES_ROOT${NC}"
    exit 1
fi

if [ -z "$MSG" ]; then
    echo -e "${YELLOW}Enter commit message (Enter for default 'Site update'):${NC} "
    read -r input_msg
    MSG="${input_msg:-Site update}"
fi

echo -e "${CYAN}=== Frontend Pages deploy (dist only) ===${NC}"
echo -e "Monorepo: ${MONOREPO_ROOT}"
echo -e "Pages checkout: ${PAGES_ROOT}"

if [ "$DO_BUILD" -eq 1 ]; then
    echo -e "${CYAN}Running npm run build...${NC}"
    (cd "$FRONTEND_DIR" && npm run build)
else
    echo -e "${YELLOW}Skipping build (--no-build).${NC}"
fi

if [ ! -d "$FRONTEND_DIR/dist" ]; then
    echo -e "${RED}Missing $FRONTEND_DIR/dist — run build first.${NC}"
    exit 1
fi

echo -e "${CYAN}Rsync dist/ → Pages repo root (delete stale assets; protect CNAME / .nojekyll / README.md)...${NC}"
rsync -av --delete \
    --exclude '.git/' \
    --filter='protect /CNAME' \
    --filter='protect /.nojekyll' \
    --filter='protect /README.md' \
    "$FRONTEND_DIR/dist/" "$PAGES_ROOT/"

echo -e "Staging in Pages repo..."
git -C "$PAGES_ROOT" add -A

if git -C "$PAGES_ROOT" diff --cached --quiet; then
    echo -e "${YELLOW}No changes to commit (site already matches dist).${NC}"
    exit 0
fi

echo -e "Committing..."
git -C "$PAGES_ROOT" commit -m "$MSG"

echo -e "Pushing..."
if [ -n "$GITHUB_TOKEN" ]; then
    ORIGIN_URL=$(git -C "$PAGES_ROOT" remote get-url origin)
    REPO_PATH="${ORIGIN_URL#https://github.com/}"
    REPO_PATH="${REPO_PATH#git@github.com:}"
    REPO_PATH="${REPO_PATH%.git}"
    USER="${REPO_PATH%%/*}"
    git -C "$PAGES_ROOT" push "https://${USER}:${GITHUB_TOKEN}@github.com/${REPO_PATH}.git" HEAD
else
    git -C "$PAGES_ROOT" push origin HEAD
fi

echo -e "${GREEN}Pages repo updated and pushed.${NC}"
echo -e "${CYAN}Frontend URL: https://9-Security.github.io/9Sec-Website/${NC}"
