---
name: story-to-tickets
description: Break a user story into documentation and GitHub issues. Use when the user wants to turn a story (a docs/stories/ file or pasted text) into tickets or issues.
---

# Story to Tickets

Break a user story into independent, well-scoped GitHub issues plus a short design doc.

## Flow

1. **Input**: A user story — a `docs/stories/<slug>.md` file (preferred; ask which one if ambiguous) or pasted text.
2. **Break down**: Launch the `product-manager` agent with the story and the relevant parts of the codebase structure. Ask it to return:
   - A short technical design note (what parts of the codebase are touched, in what order)
   - A list of tickets, each independently implementable and testable, as vertical slices, with title, description, and acceptance criteria
3. **Document**: Write the design note to `docs/<slug>-design.md`.
4. **Create tickets** as a parent/subticket hierarchy — one feature (parent) issue plus one subticket per vertical slice:
   - If a GitHub remote exists (`git remote get-url origin` succeeds):
     1. Ensure a label exists for the feature slug (kebab-case, e.g. `feat-dashboard-health-check`): `gh label create "<slug>" --description "Feature: <Feature>" 2>/dev/null || true` (ignore the error if it already exists).
     2. Create the parent feature issue first (title = the story/feature name, body = feature summary + link to the story/design doc; no manual task list — GitHub renders sub-issues automatically) with the feature label attached: `gh issue create --title "<Feature>" --body "..." --label "<slug>"`. Note its number and node ID (`gh issue view <parent-number> --json id -q .id`).
     3. Create each vertical-slice subticket the same way, also tagged with the feature label: `gh issue create --title "..." --body "..." --label "<slug>"`, where the body cross-links dependent subtickets (no `Part of` text needed — the relationship is set natively in the next step).
     4. Link each subticket to the parent as a **native GitHub sub-issue** (not just a body reference) using the GraphQL API, since `gh issue create` has no `--parent` flag:
        ```
        gh api graphql -f query='
          mutation($parentId: ID!, $childId: ID!) {
            addSubIssue(input: { issueId: $parentId, subIssueId: $childId }) {
              subIssue { number }
            }
          }' -f parentId="<parent-node-id>" -f childId="<subticket-node-id>"
        ```
        Get each subticket's node ID via `gh issue view <n> --json id -q .id`. GitHub then shows the parent/child relationship natively in both issues' UI (progress bar, sub-issue list) — no manual checklist maintenance needed.
   - If no remote: write the parent ticket to `docs/tickets/<slug>-0-<title>.md` and each subticket to `docs/tickets/<slug>-<n>-<title>.md` in the same format, with subtickets noting `Part of <slug>-0` and the parent listing them, and tell the user they can be pushed to GitHub later (native sub-issue linking and the feature label only apply once real GitHub issues exist).
5. **Report**: List the created issues (numbers/URLs or file paths), which are the parent and which are subtickets, the feature label/slug applied, and the suggested implementation order.

## Ticket format

Title: imperative, scoped (`Add health-check polling to dashboard`). Body: context (1-2 sentences), acceptance criteria checklist, link to the story/design doc, dependencies on other tickets if any. All tickets (parent and subtickets) carry the feature-slug label; the parent/subticket relationship itself is native GitHub sub-issue linkage, not a body reference (except in the no-remote fallback, which still uses `Part of <slug>-0` text).
