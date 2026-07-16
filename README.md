# AI Workflow Template

A stack-agnostic agentic development workflow for Claude Code: skills that take a feature from idea to reviewed implementation, and role agents that keep each step honest. Extracted from a working project; drop it into any codebase.

## The workflow

1. **`create-story`** — an interview (shaped by the `product-manager` agent) turns a rough idea into an unambiguous user story in `docs/stories/`.
2. **`story-to-tickets`** — breaks the story into a short design doc plus independent, vertically-sliced GitHub issues.
3. **`work-issue`** — plans from an issue, delegates implementation to the developer agents, has `qa-tester` close test gaps, then runs 3 `code-review` rounds and a final `security-review` gate.

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

1. Copy `.claude/`, `CLAUDE.md`, and `docs/` into your repo.
2. Fill in the placeholders in `CLAUDE.md`: stack, repo layout, and the real `test` / `typecheck` / `lint` commands.
3. Add quality gates for your stack: pre-commit hooks (e.g. Husky + lint-staged) and a CI pipeline that runs typecheck, lint, and tests.
4. Start with `/create-story`.

The workflow assumes a GitHub remote for issues (`gh` CLI); without one, tickets fall back to `docs/tickets/` files.
