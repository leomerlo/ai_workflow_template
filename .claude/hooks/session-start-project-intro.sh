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

release_context=""
if [ -d "$CLAUDE_PROJECT_DIR/.claude/skills/prepare-release" ]; then
  release_context=" This project also has the \"prepare-release\" skill installed. Additionally ask whether releases are cut by diffing two branches (e.g. dev -> main); if so, capture the base/release branch names, the release tag or version naming pattern, and where release checklists should be written, and fill those into a \"## Releases\" section in CLAUDE.md (a placeholder for it already exists there). Then ask for the golden-path smoke tests every release must verify regardless of what changed (e.g. core user flows to click through by hand), and write them as a checklist into .claude/skills/prepare-release/SMOKE-TESTS.md, replacing its placeholder content. Skip this part if the project has no such release process."
fi

jq -n --arg release_context "$release_context" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("This is the first Claude Code session in this repository: CLAUDE.md still has the template placeholder under \"# Project\" (\"Fill in per project: stack, repo layout...\"). Before starting other work, briefly interview the user with a few focused questions (AskUserQuestion where useful) about: (1) what this project is/does in 1-3 sentences, and (2) its main technologies (language, frameworks, key libraries, infra, repo layout). Then replace the placeholder comment in CLAUDE.md with a short \"## Description\" and \"## Technologies\" section summarizing the answers. Keep it concise." + $release_context + " If the user prefers to skip any of this for now, do not ask again in this session.")
  }
}'
