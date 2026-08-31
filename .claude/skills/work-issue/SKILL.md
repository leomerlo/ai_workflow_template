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

### 2. Implement — test-driven, red before green

- As soon as the plan is approved, mark the issue as in progress: `gh label create "in progress" --color FBCA04 --force && gh issue edit <n> --add-label "in progress"`.
- Isolate the work in its own worktree: `EnterWorktree(name: "issue-<n>")`. Everything from here through the PR push (implementation, tests, all review rounds) happens inside it. Note the worktree path from the tool result — it's needed to re-enter later.
- Delegate by area: `backend-developer` agent for server-side changes, `ui-ux-developer` agent for UI changes. Small cross-cutting glue can be done directly. Instruct the delegate to follow the TDD loop below rather than writing implementation first.
- Break the issue's acceptance criteria into seams — the public interfaces (exported API, rendered output/interactions) where each criterion is observable. One acceptance criterion may need one or several seams.
- Red → green loop, one slice at a time:
  1. Pick one acceptance criterion. Write one colocated test (`*.test.*`) against its seam, asserting behavior through the public interface — not internals, not mocks of internal collaborators. Expected values come from the spec/acceptance criteria, not recomputed the way the code will compute them.
  2. Run it and confirm it fails (red) — this proves the test actually exercises the criterion.
  3. Write the minimum code to make it pass (green). No speculative extras.
  4. Repeat for the next criterion. Don't write all tests up front (horizontal slicing) — each cycle should respond to what the last one taught you.
- Refactoring happens at the review stage (step 4), not inside the red-green loop.
- Keep to the plan; build the minimum viable change.

### 3. Test

- With acceptance criteria covered by the loop above, launch the `qa-tester` agent on the diff to find missing edge cases (error paths, boundary conditions) and add the missing tests.
- Gate: the project's typecheck and test commands (see AGENTS.md) must pass before review starts.

### 4. Review — 3 rounds of code review, then security review

- **Rounds 1-3**: launch the `code-review` agent on the full current diff (`git diff` against the base). For each finding, judge validity; fix valid ones. Each round reviews the _updated_ diff. If a round returns nothing actionable, record it and still run the remaining rounds.
- **Security round**: launch the `security-review` agent on the final diff. Fix valid findings (re-run tests after fixes).

### 5. Report

Summarize: what was implemented, tests added, findings fixed per round (including "none"), and final test status. If a remote exists, offer to post the summary as a comment on the issue.

Once the branch is pushed and the PR opened, leave the worktree: `ExitWorktree(action: "keep")`. This returns the session to the main checkout without discarding the branch. If more commits are needed later (review feedback, CI fixes), go back in with `EnterWorktree(path: <worktree path>)`.

### 6. Close the issue on merge

When the PR gets merged (in this session or a later one), do not rely on `Closes #N` auto-close — verify and close explicitly:

```bash
gh issue view <n> --json state -q .state   # if still OPEN:
gh issue close <n> --comment "Done in #<PR>."
gh issue edit <n> --remove-label "in progress"
```

Then clean up the worktree, since its branch is now merged: `EnterWorktree(path: <worktree path>)` followed by `ExitWorktree(action: "remove", discard_changes: true)`.

## Orchestrated mode (invoked from `implement-feat`)

`implement-feat` breaks a parent issue into subtasks and delegates each one to a fresh subagent that follows this skill. When you (this skill) are invoked by such a subagent — the prompt will say so explicitly, naming the parent issue and the feature branch to use — adapt as follows:

- **No plan gate — skip step 1 entirely.** Subagents cannot call `AskUserQuestion`, so `implement-feat` runs planning itself (via a separate read-only planning subagent) and gets the human's approval *before* launching you. The prompt that invoked you includes the already-approved plan verbatim — use it as-is. Do not re-explore, do not revise it, do not wait for confirmation; go straight to marking the issue in progress and entering the worktree.
- **Base branch is fixed.** The worktree must branch from the feature branch `implement-feat` names, not the repo's default integration branch. `EnterWorktree(name: ...)` always branches from the default branch (or local HEAD, per `worktree.baseRef`), so it can't target an arbitrary feature branch — instead create the worktree manually and register it:
  ```bash
  git fetch origin
  git worktree add .claude/worktrees/issue-<n> -b feat/issue-<n>-<slug> origin/feat/<feature-slug>
  ```
  then switch the session into it with `EnterWorktree(path: .claude/worktrees/issue-<n>)`.
- **Never touch the parent issue.** No labels, no closing, no comments on it. `implement-feat` owns all of that.
- **No post-PR validation gate either.** Once the PR is open and CI is green (if applicable), do not stop-and-wait and do not call `AskUserQuestion` — you have no access to it. Simply end your turn; state the PR URL and CI status clearly in your final report. `implement-feat` collects the human's validation itself after your turn ends.
- **Open the PR against the feature branch**, not the repo's default integration branch.
- **Do not merge the PR yourself, do not remove the worktree, and do not run step 6** — `implement-feat` does the merge after its own validation gate passes, then closes the subtask issue, removes its "in progress" label, and cleans up the worktree itself, since those only make sense once the PR is actually merged and your turn has already ended by then. Your job ends once the PR is open, CI is green (if applicable), and you've reported that in your final report.
