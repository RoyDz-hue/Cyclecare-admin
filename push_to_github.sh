#!/usr/bin/env bash
# Quick Push Script for CycleCare Admin PWA to GitHub
set -e

if [ -z "$1" ]; then
  echo "Usage: ./push_to_github.sh <GITHUB_REPO_URL>"
  echo "Example: ./push_to_github.sh https://github.com/YOUR_USERNAME/cyclecare-admin.git"
  exit 1
fi

REPO_URL="$1"

echo "Setting remote origin to $REPO_URL..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "Pushing 'main' branch to GitHub..."
git branch -M main
git push -u origin main

echo "✓ Successfully pushed to $REPO_URL!"
