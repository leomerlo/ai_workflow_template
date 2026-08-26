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
     1. Create the parent feature issue first (title = the story/feature name, body = feature summary + link to the story/design doc + a task-list placeholder that will be filled in step 3): `gh issue create --title "<Feature>" --body "..."`. Note its number.
     2. Create each vertical-slice subticket with `gh issue create --title "..." --body "..."`, where the body includes a `Part of #<parent-number>` line and cross-links dependent subtickets.
     3. Update the parent issue's body to add a task list checking off each subticket by number (`- [ ] #<n>`) via `gh issue edit <parent-number> --body "..."`.
   - If no remote: write the parent ticket to `docs/tickets/<slug>-0-<title>.md` and each subticket to `docs/tickets/<slug>-<n>-<title>.md` in the same format, with subtickets noting `Part of <slug>-0` and the parent listing them, and tell the user they can be pushed to GitHub later.
5. **Report**: List the created issues (numbers/URLs or file paths), which are the parent and which are subtickets, and the suggested implementation order.

## Ticket format

Title: imperative, scoped (`Add health-check polling to dashboard`). Body: context (1-2 sentences), acceptance criteria checklist, link to the story/design doc, dependencies on other tickets if any. Subtickets additionally state `Part of #<parent-number>` (or `Part of <slug>-0` when no GitHub remote).
