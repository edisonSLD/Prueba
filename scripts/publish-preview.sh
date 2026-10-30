#!/bin/sh
set -eu
cd "$(git rev-parse --show-toplevel)"
# Publish only the committed preview directory, never runtime data.
preview_tree=$(git rev-parse HEAD:preview)
if [ -n "$(git ls-remote --heads origin gh-pages)" ]; then
  git fetch origin gh-pages
  preview_parent=$(git rev-parse FETCH_HEAD)
  preview_commit=$(git commit-tree "$preview_tree" -p "$preview_parent" -m 'Publish La Aurora preview')
else
  preview_commit=$(git commit-tree "$preview_tree" -m 'Publish La Aurora preview')
fi
git push origin "$preview_commit:refs/heads/gh-pages"
