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
4. **Create tickets**:
   - If a GitHub remote exists (`git remote get-url origin` succeeds): create each ticket with `gh issue create --title "..." --body "..."`, referencing the story doc and cross-linking dependent issues.
   - If no remote: write each ticket to `docs/tickets/<slug>-<n>-<title>.md` in the same format and tell the user they can be pushed to GitHub later.
5. **Report**: List the created issues (numbers/URLs or file paths) and the suggested implementation order.

## Ticket format

Title: imperative, scoped (`Add health-check polling to dashboard`). Body: context (1-2 sentences), acceptance criteria checklist, link to the story/design doc, dependencies on other tickets if any.
