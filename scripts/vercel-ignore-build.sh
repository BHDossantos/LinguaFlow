#!/usr/bin/env bash
# Vercel "Ignored Build Step" command.
#   exit 1  => BUILD the app.
#   exit 0  => SKIP the deploy.
#
# CRITICAL: this must FAIL OPEN. A previous version (set -euo pipefail + a
# HEAD^ fallback) could exit non-1 on a shallow-clone git hiccup — and Vercel
# treats any non-1 exit as "skip" — which silently blocked real code deploys and
# left production stale for days. So: no `set -e`, always exit exactly 0 or 1,
# default to BUILD, and SKIP only when we can see the complete, accurate diff and
# every changed file is content/docs (course seed SQL, ingestion interchange
# JSON, docs, daily-agent files) — things that don't change the deployed app.

BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"
HEAD="${VERCEL_GIT_COMMIT_SHA:-HEAD}"

# We can only skip safely with a real, complete diff, which needs the previous
# deployed commit to exist in this (often shallow) clone. If it doesn't, BUILD.
if [ -z "$BASE" ] || ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "No reliable base commit to diff against — building."
  exit 1
fi

CHANGED="$(git diff --name-only "$BASE" "$HEAD" 2>/dev/null)"
if [ -z "$CHANGED" ]; then
  echo "Empty or failed diff — building."
  exit 1
fi

# If ANY changed file is outside the content/docs set, build. Only skip when the
# entire diff is content/docs.
IGNORE='^(supabase/|scripts/ingest/examples/|docs/|\.claude/)'
if echo "$CHANGED" | grep -qvE "$IGNORE"; then
  echo "Code changed — building:"
  echo "$CHANGED" | grep -vE "$IGNORE" | sed 's/^/  /'
  exit 1
fi

echo "Content/docs-only change — skipping deploy."
exit 0
