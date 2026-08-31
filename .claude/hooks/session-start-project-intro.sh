#!/bin/bash
# SessionStart hook: on the first session in a repo cloned from this template,
# prompt Claude to first walk the user through the template (via the "explain"
# skill, if present) and then interview them to fill in the "# Project" section
# of AGENTS.md (description + technologies). Detects "first time" by checking
# whether the template's placeholder comment is still present, so it never
# fires again once that section has real content. The user can re-run the
# walkthrough any time afterward with /explain.
#
# AGENTS.md is the source of truth; CLAUDE.md is kept as a symlink to it so
# Claude Code picks it up. Recreate the symlink here in case it was dropped
# (e.g. a plain `cp` instead of a git clone/checkout).
set -euo pipefail

AGENTS_MD="$CLAUDE_PROJECT_DIR/AGENTS.md"
CLAUDE_MD="$CLAUDE_PROJECT_DIR/CLAUDE.md"

if [ -f "$AGENTS_MD" ] && [ ! -e "$CLAUDE_MD" ]; then
  ln -s AGENTS.md "$CLAUDE_MD"
fi

input=$(cat)
source=$(jq -r '.source // empty' <<< "$input")

if [ "$source" != "startup" ]; then
  exit 0
fi

if [ ! -f "$AGENTS_MD" ] || ! grep -q '<!-- Fill in per project: stack, repo layout' "$AGENTS_MD"; then
  exit 0
fi

release_context=""
if [ -d "$CLAUDE_PROJECT_DIR/.claude/skills/prepare-release" ]; then
  release_context=" This project also has the \"prepare-release\" skill installed. Additionally ask whether releases are cut by diffing two branches (e.g. dev -> main); if so, capture the base/release branch names, the release tag or version naming pattern, and where release checklists should be written, and fill those into a \"## Releases\" section in AGENTS.md (a placeholder for it already exists there). Then ask for the golden-path smoke tests every release must verify regardless of what changed (e.g. core user flows to click through by hand), and write them as a checklist into .claude/skills/prepare-release/SMOKE-TESTS.md, replacing its placeholder content. Skip this part if the project has no such release process."
fi

explain_context=""
if [ -d "$CLAUDE_PROJECT_DIR/.claude/skills/explain" ]; then
  explain_context="Before anything else, invoke the \"explain\" skill (via the Skill tool) to give the user a plain-language walkthrough of this template — what it is, the order to run its skills in, and what each piece does. The user can re-run this any time later with /explain, so it's fine to keep it brief now. Once that's done, "
fi

jq -n --arg release_context "$release_context" --arg explain_context "$explain_context" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("This is the first Claude Code session in this repository: AGENTS.md still has the template placeholder under \"# Project\" (\"Fill in per project: stack, repo layout...\"). " + $explain_context + "briefly interview the user with a few focused questions (AskUserQuestion where useful) about: (1) what this project is/does in 1-3 sentences, and (2) its main technologies (language, frameworks, key libraries, infra, repo layout). Then replace the placeholder comment in AGENTS.md with a short \"## Description\" and \"## Technologies\" section summarizing the answers. Keep it concise." + $release_context + " If the user prefers to skip any of this for now, do not ask again in this session.")
  }
}'
