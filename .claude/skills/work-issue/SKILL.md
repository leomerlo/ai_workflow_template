---
name: work-issue
description: Plan from a GitHub issue, implement it with tests, run 3 code-review rounds and a security review. Use when the user references an issue number or says "work on issue N".
---

# Work Issue

Take a GitHub issue from plan to reviewed implementation.

## Flow

### 1. Plan

- Fetch the issue: `gh issue view <n> --comments` (if no remote, ask for the ticket file in `docs/tickets/` instead).
- Explore the related code, then present a short implementation plan: files to touch, approach, tests to write. Get user confirmation before coding.

### 2. Implement

- As soon as the plan is approved, mark the issue as in progress: `gh label create "in progress" --color FBCA04 --force && gh issue edit <n> --add-label "in progress"`.
- Delegate by area: `backend-developer` agent for server-side changes, `ui-ux-developer` agent for UI changes. Small cross-cutting glue can be done directly.
- Keep to the plan; build the minimum viable change.

### 3. Test

- Every change ships with colocated unit tests. Launch the `qa-tester` agent on the diff to find missing edge cases and add the missing tests.
- Gate: the project's typecheck and test commands (see CLAUDE.md) must pass before review starts.

### 4. Review — 3 rounds of code review, then security review

- **Rounds 1-3**: launch the `code-review` agent on the full current diff (`git diff` against the base). For each finding, judge validity; fix valid ones. Each round reviews the _updated_ diff. If a round returns nothing actionable, record it and still run the remaining rounds.
- **Security round**: launch the `security-review` agent on the final diff. Fix valid findings (re-run tests after fixes).

### 5. Report

Summarize: what was implemented, tests added, findings fixed per round (including "none"), and final test status. If a remote exists, offer to post the summary as a comment on the issue.

### 6. Close the issue on merge

When the PR gets merged (in this session or a later one), do not rely on `Closes #N` auto-close — verify and close explicitly:

```bash
gh issue view <n> --json state -q .state   # if still OPEN:
gh issue close <n> --comment "Done in #<PR>."
gh issue edit <n> --remove-label "in progress"
```
