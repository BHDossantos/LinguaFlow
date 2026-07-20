#!/usr/bin/env bash
# Vercel "Ignored Build Step" command.
# Exit 1 => build the app.  Exit 0 => skip the deploy.
#
# Content-only pushes (course seed SQL, ingestion interchange JSON, docs,
# the daily-agent files) do not change the deployed Next.js app, so they
# must NOT spend a Vercel deployment. This skips the build when a commit
# touches ONLY those paths, and builds normally for real code changes.

set -euo pipefail

# Range of commits in this push. Fall back to last commit if unavailable.
BASE="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
HEAD="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# All files changed in the range (fallback: last commit).
if ! CHANGED="$(git diff --name-only "$BASE" "$HEAD" 2>/dev/null)"; then
  CHANGED="$(git diff --name-only HEAD^ HEAD 2>/dev/null || true)"
fi

# No detectable changes → be safe and build.
if [ -z "$CHANGED" ]; then
  echo "No diff detected — building."
  exit 1
fi

# If EVERY changed file is under a content/docs-only path, skip the build.
# grep -qvE prints nothing (and exits 1) when all lines match the ignore
# pattern; that means "nothing outside the ignore set" → skip.
IGNORE='^(supabase/|scripts/ingest/examples/|docs/|\.claude/)'
if echo "$CHANGED" | grep -qvE "$IGNORE"; then
  echo "Code changed — building:"
  echo "$CHANGED" | grep -vE "$IGNORE" | sed 's/^/  /'
  exit 1
else
  echo "Content/docs-only push — skipping deploy."
  exit 0
fi
