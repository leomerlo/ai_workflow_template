---
name: explain
description: Walks the user through this ai_workflow_template repo in plain language — what it is, the end-to-end skill order, what each skill/agent does, and how the design workflow (if present) nests inside it. Use when the user has just cloned this template and needs orientation, asks "how does this template work" / "what do I do first" / "explain this repo", or explicitly runs /explain.
---

# Explain This Template

A guided, plain-language walkthrough — not a code task. **Read the actual docs each time rather than repeating memorized text.** Skills and agents get added or changed over time (this repo's own design workflow was added mid-session once already); a hardcoded explanation here would drift out of sync with what's actually installed.

## What to read first

1. `AGENTS.md` (or `CLAUDE.md`, its symlink) — the Skills, Agents, and Hooks lists are the ground truth for what exists.
2. `README.md` — the end-to-end workflow narrative, and its "Design workflow" section if present.
3. `CONTEXT.md`, if it exists — vocabulary and routing rules for anything documented there (typically the design skills).
4. **The full body of every `.claude/skills/*/SKILL.md`** listed in `AGENTS.md`, not just its frontmatter `description` — the "Flow"/"Workflow"/"Quick start" sections are what actually let you describe inputs, steps, and output per skill instead of restating its one-line summary.
5. **The full body of every `.claude/agents/*.md`** — each agent file states what it actually does and doesn't do, not just the one-line role from `README.md`'s table.

Don't just point the user at these files — synthesize them into one answer, in whatever language the user is writing in.

## What to cover, in order

Go one level deeper than a name + one-liner for every skill and agent: for each, cover **what it needs as input, what it actually does step by step, what it produces, and one concrete example command** (a real invocation, e.g. `/work-issue 42`, not just the bare skill name).

1. **One sentence**: what this template is (an agentic dev workflow — skills that take a feature from idea to reviewed implementation, agents that keep each step honest).
2. **The end-to-end order**, numbered. For each of `create-story` → `story-to-tickets` → `work-issue` → (`implement-feat`, only if the work got split into sub-issues) → `prepare-release`: what it takes as input, the concrete steps it runs, what artifact it leaves behind (a file, a set of GitHub issues, a merged PR, a checklist), and an example command. Say plainly what to run first on a brand-new project (`/create-story`).
3. **Inside `work-issue`**, in real detail: the plan → red/green TDD loop → `qa-tester` gap-fill → 3 `code-review` rounds → `security-review` gate sequence, who does each step (which agent, delegated by area — `backend-developer` vs `ui-ux-developer`), and what "done" looks like. If a design workflow is installed, mention it kicks in here too (next point) rather than as a separate phase.
4. **Every agent** in `.claude/agents/`, individually — not lumped into step 3's mention. What each one is actually responsible for and, where it matters, what it explicitly does *not* do (e.g. `code-review`/`security-review` are read-only).
5. **The design workflow**, only if present (e.g. `.claude/skills/impeccable` exists) — per skill: what it does mechanically (not just its role name), when it fires (ambient hook vs. explicit invocation vs. consulted-not-invoked), and one example. Pull names/roles from `CONTEXT.md`'s Language section if it exists rather than restating from memory (names and roles are decided per-repo). If `docs/adr/` has entries, mention the non-obvious decisions they record (e.g. a banned sub-command) — that's exactly the "why would they do it this way" content an ADR exists for.
6. **What runs on its own, no invocation needed** — the hooks: this one (`session-start-project-intro`), and a design-skill drift-audit hook if installed. Say what triggers each (`SessionStart`, `PostToolUse`/`Stop`, etc.) and what it actually checks or does.
7. **Close with one concrete next step** — usually "run `/create-story` to describe the first feature," or point at wherever the user's actual work already is (an open issue, an in-progress story) if that's evident from context.

## Tone

Plain language, no jargon wall — depth doesn't mean density. This is for someone who just cloned the repo and doesn't remember the skill names or the order, so favor short paragraphs and concrete examples over dense prose. It's fine to be long; it should not be vague. Still link to `AGENTS.md`/`README.md`/`CONTEXT.md` for anything that goes beyond this (e.g. the full DESIGN.md token schema) rather than reproducing entire reference files inline.
