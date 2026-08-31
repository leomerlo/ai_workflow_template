# AI Workflow Template

A stack-agnostic agentic development workflow for Claude Code: skills that take a feature from idea to reviewed implementation, and role agents that keep each step honest. Extracted from a working project; drop it into any codebase.

## The workflow

1. **`create-story`** — an interview (shaped by the `product-manager` agent) turns a rough idea into an unambiguous user story in `docs/stories/`.
2. **`story-to-tickets`** — breaks the story into a short design doc plus independent, vertically-sliced GitHub issues.
3. **`work-issue`** — plans from an issue, delegates implementation to the developer agents (test-first, red-green), has `qa-tester` close test gaps, then runs 3 `code-review` rounds and a final `security-review` gate.
4. **`implement-feat`** — for a parent/feature issue with sub-issues, orchestrates `work-issue` over every subtask in dependency order, merging each into a shared feature branch.
5. **`prepare-release`** — before shipping, diffs the release branches and produces a manual test checklist: a fixed smoke-test baseline plus one test block per feature the diff actually touched.

## Other skills

- **`explain`** — a plain-language, live-read walkthrough of this template (what it is, the skill order, what each piece does). Fires automatically on first clone via the `session-start-project-intro` hook; re-run any time with `/explain`.
- **`sync-project-info`** — re-scans an existing codebase (e.g. after dropping a working app into the template) and refreshes `AGENTS.md`'s Description/Technologies/Commands to match reality, instead of interviewing from scratch.

## Design workflow

Four design skills plug into `work-issue`'s existing Implement step for UI work — no separate phase, see [CONTEXT.md](CONTEXT.md) for the full rationale and [`docs/adr/`](docs/adr/) for the trade-offs:

- **`impeccable`** — the backbone. Runs ambiently (a hook audits every UI edit and does a deep pass on stop) plus explicit `shape`/`audit`/`critique`/`polish` calls from the `ui-ux-developer` agent.
- **`design-tokens`** — the token generator. Builds a layered token system (Primitive → Semantic → Responsive, CSS custom properties) from a primary color and a font, only when none exists yet; documenting or retrofitting an existing system stays `impeccable`'s job.
- **`animate`** — the implementer. Builds one concrete animation at a time: tool, property, curve, duration/spring.
- **`apple-design`** — the feel lens. Consulted (never invoked to write code) for gesture-driven motion, and usable standalone to critique an already-built interaction.

`ui-ux-developer` (`.claude/agents/ui-ux-developer.md`) owns the operative routing rules between the four.

## Role agents (`.claude/agents/`)

| Agent | Role |
| --- | --- |
| `product-manager` | Refines requirements, writes acceptance criteria, challenges scope |
| `backend-developer` | Implements server-side changes with tests |
| `ui-ux-developer` | Implements UI changes with accessibility and tests |
| `qa-tester` | Finds missing edge cases and writes the missing tests |
| `code-review` | Read-only diff review: bugs, design, missing tests |
| `security-review` | Read-only security gate: injection, authn/authz, secrets, data exposure |

## Using it in a project

The recommended way to bring this template into your repo is [`git subtree`](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_subtree_merge): it copies the template's files into your repo (no submodule pointer, no extra clone step for collaborators) while still letting you pull upstream updates later with a normal `git subtree pull`.

Either way, once the files are in place:

1. On the first session, the `session-start-project-intro` hook first walks you through this template (via the `explain` skill — what it is, the skill order, what each piece does; re-run any time with `/explain`), then interviews you about the project's purpose and stack (and, if `prepare-release` is present, its release conventions and smoke tests) and fills in `AGENTS.md` for you. If real code already exists, run `/sync-project-info` instead to derive that info from the repo rather than from memory.
2. Add quality gates for your stack: pre-commit hooks (e.g. Husky + lint-staged) and a CI pipeline that runs typecheck, lint, and tests.
3. Start with `/create-story`.

The workflow assumes a GitHub remote for issues (`gh` CLI); without one, tickets fall back to `docs/tickets/` files.

### Option A — subtree (recommended)

Run this once per repo to add the template as a remote, then pull it in:

```bash
git remote add ai-workflow-template https://github.com/leomerlo/ai_workflow_template.git
git fetch ai-workflow-template
```

**New project (empty repo, or one with no conflicting paths):**

```bash
git subtree add --prefix=. ai-workflow-template main --squash
```

This adds `.claude/`, `AGENTS.md`, `CLAUDE.md`, and `docs/` at the root of your repo in one squashed commit.

**Existing project (repo already has files):**

`subtree add` fails if any of the template's paths (`.claude/`, `AGENTS.md`, `CLAUDE.md`, `docs/`) already exist in your repo. If none of them do, the same command as above works. If some do — e.g. you already have a `docs/` or an `AGENTS.md` — pull the template into a throwaway folder first and merge by hand:

```bash
git subtree add --prefix=.ai-workflow-template-tmp ai-workflow-template main --squash
# move/merge the pieces you need (.claude/, AGENTS.md, CLAUDE.md, docs/) into place,
# resolving conflicts with your existing files, then:
rm -rf .ai-workflow-template-tmp
git add -A && git commit -m "Merge ai-workflow-template"
```

If your copy method doesn't preserve the `CLAUDE.md` → `AGENTS.md` symlink (some zip/GitHub-archive downloads don't), recreate it: `ln -s AGENTS.md CLAUDE.md`.

**Pulling future updates** (either case), once the remote is set up:

```bash
git subtree pull --prefix=. ai-workflow-template main --squash
```

### Option B — manual copy

Copy `.claude/`, `AGENTS.md`, `CLAUDE.md` (a symlink to `AGENTS.md`, so Claude Code picks it up too), and `docs/` into your repo. If your copy method doesn't preserve symlinks, just recreate it: `ln -s AGENTS.md CLAUDE.md`. This is simpler for a one-off copy but gives up the ability to pull upstream updates later.
