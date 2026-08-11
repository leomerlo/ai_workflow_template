---
name: sync-project-info
description: Re-scan the actual codebase (e.g. after an existing app was dropped into this template) and refresh CLAUDE.md's project/stack info to match reality. Use when the user says an app was copied/imported in, CLAUDE.md is stale or wrong, or asks to sync/refresh/update the project info or detected stack.
---

# Sync Project Info

Reconcile CLAUDE.md's "# Project" section with what's actually in the repo, instead of interviewing from scratch. Use this when real code already exists (a project was copied in, or has drifted from what CLAUDE.md says) — most of the answer is derivable from files, not the user's memory.

## Flow

1. **Scan, don't ask first.** Derive as much as possible directly from the repo:
   - Language/runtime & package manager: `package.json`/lockfile, `requirements.txt`/`pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, etc.
   - Frameworks & major libraries: dependencies in the manifest, framework-specific config files (`next.config.*`, `angular.json`, `manage.py`, etc.).
   - Database/storage: ORM config, migration folders, connection strings in `.env.example`, docker-compose services.
   - Real commands: `scripts` block (or Makefile/task runner) for test, lint, typecheck, build — don't guess, read them.
   - Test conventions: where test files actually live and what they're named (colocated vs `tests/`, `*.test.*` vs `*_test.*`).
   - Deployment/CI: `Dockerfile`, `.github/workflows/*`, `Procfile`, IaC folders.
   - Existing docs: `README.md` often states the project's purpose better than any inference from code.

2. **Diff against CLAUDE.md.** Read the current CLAUDE.md. For each fact above, classify as: matches / stale (contradicts the repo) / missing.

3. **Ask only what can't be derived.** Don't interview on anything you already found in step 1. Use AskUserQuestion only for genuine gaps — typically the project's purpose/audience, and any command or convention that's ambiguous or absent from the repo (e.g. no `scripts` block, or a monorepo with unclear per-package commands).

4. **Write the update.** Edit CLAUDE.md in place:
   - Replace the `<!-- Fill in per project: stack, repo layout... -->` placeholder (if still present) with `## Description` (what the project is/does, 1-3 sentences) and `## Technologies` (language, frameworks, key libraries, infra, repo layout) under `# Project` — same structure the `session-start-project-intro` hook produces, so removing the placeholder also prevents that hook from firing again.
   - Update `## Commands` to the real commands (don't invent ones that don't exist — say what actually runs).
   - Update `## Testing conventions` to match observed reality.
   - Preserve everything else in CLAUDE.md untouched (principles, skills/agents lists, etc.) unless it's now factually wrong.

## Done when

CLAUDE.md's Description/Technologies/Commands/Testing sections match the actual repo and the user has confirmed anything you couldn't derive.
