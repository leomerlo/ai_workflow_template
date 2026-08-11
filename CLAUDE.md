# Project

<!-- Fill in per project: stack, repo layout (e.g. npm workspaces monorepo with server/ and client/), test framework. -->

## Principles

- **Build the minimum viable change; don't overengineer.** Grow the code only when a concrete need appears. No speculative abstractions.
- **All new code ships with unit tests.** A feature without tests is not done.
- All code, docs, comments, and commit messages in English.

## Commands

<!-- Fill in per project. Every project must define at least: -->

- `npm test` — run all unit tests
- `npm run typecheck` — static type checking
- `npm run lint` — linting across the repo

Run the typecheck and test commands before considering a change done. Wire them into a pre-commit hook (e.g. Husky + lint-staged) and CI.

## Testing conventions

- Tests are colocated with the code: `*.test.*` next to the module they cover.
- Test through public boundaries (exported app/API for backends, rendered output and user interactions for UIs), not implementation details.

## Skills

- `create-story` — interview the user to produce a user story in `docs/stories/`
- `story-to-tickets` — break a user story into a design doc and GitHub issues
- `work-issue` — plan from an issue, implement, test, 3 code-review rounds + security review
- `sync-project-info` — re-scan the codebase and refresh this file's Description/Technologies (e.g. after copying an existing app into the template)

## Agents

`product-manager`, `ui-ux-developer`, `backend-developer`, `qa-tester`, `code-review`, `security-review` in `.claude/agents/`.

## Hooks

- `session-start-project-intro` — on the first session in a repo cloned from this template (while the `# Project` placeholder in this file is still unfilled), interviews the user about what the project does and its technologies, then fills in `## Description` and `## Technologies` here. See `.claude/hooks/session-start-project-intro.sh`.
