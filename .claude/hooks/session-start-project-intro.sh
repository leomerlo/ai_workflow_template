#!/bin/bash
# SessionStart hook: on the first session in a repo cloned from this template,
# prompt Claude to interview the user and fill in the "# Project" section of
# CLAUDE.md (description + technologies). Detects "first time" by checking
# whether the template's placeholder comment is still present, so it never
# fires again once that section has real content.
set -euo pipefail

CLAUDE_MD="$CLAUDE_PROJECT_DIR/CLAUDE.md"

input=$(cat)
source=$(jq -r '.source // empty' <<< "$input")

if [ "$source" != "startup" ]; then
  exit 0
fi

if [ ! -f "$CLAUDE_MD" ] || ! grep -q '<!-- Fill in per project: stack, repo layout' "$CLAUDE_MD"; then
  exit 0
fi

jq -n '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: "This is the first Claude Code session in this repository: CLAUDE.md still has the template placeholder under \"# Project\" (\"Fill in per project: stack, repo layout...\"). Before starting other work, briefly interview the user with a few focused questions (AskUserQuestion where useful) about: (1) what this project is/does in 1-3 sentences, and (2) its main technologies (language, frameworks, key libraries, infra, repo layout). Then replace the placeholder comment in CLAUDE.md with a short \"## Description\" and \"## Technologies\" section summarizing the answers. Keep it concise. If the user prefers to skip this for now, do not ask again in this session."
  }
}'
