---
name: implement-feat
description: Work every subtask of a parent GitHub issue in dependency order, each one delegated to a subagent running work-issue, merging into a shared feature branch and pausing for validation between subtasks. Use when the user references a parent/feature issue and says "work on feature N", "implement feature N", or "/implement-feat".
---

# Implement Feature

Take a parent GitHub issue with sub-issues (created e.g. by `story-to-tickets`) from **dependency-ordered subtasks → merged feature branch → PR into the repo's default integration branch**, delegating each subtask to `work-issue`.

This skill never writes code itself — it orchestrates. All code changes happen inside subagents running `work-issue` in its "Orchestrated mode".

## Hard rules

1. **Stateless.** Never keep a local progress file. Every run re-derives where things stand from GitHub (sub-issue state/labels, open PRs against the feature branch) so the flow survives being resumed in a new session.
2. **Sequential, always.** Even subtasks with no dependency between them are worked one at a time, in topological order. Never run two subtask subagents concurrently — it risks both worktrees diverging from the same feature branch base.
3. **Never invent a branch/dependency order** you're not confident in. Cycles, missing sub-issue references, or no usable slug for the branch name are all reasons to stop and ask, not to guess.
4. **This skill owns the parent issue exclusively** (labels, closing). `work-issue` subagents must never touch it — see the "Orchestrated mode" section of `work-issue/SKILL.md`.

## Flow

### 1. Gather subtasks and resolve order

```bash
gh issue view <parent> --json title,labels,state
gh api repos/<owner>/<repo>/issues/<parent>/sub_issues -q '.[].number'
```

For each sub-issue, fetch its body (`gh issue view <n> --json body`) and look for `Depends on #N` / `Blocked by #N` references to other sub-issues in the same set. Build a topological order from these edges.

- If the graph has a cycle, or a dependency references a number that isn't one of the parent's sub-issues, **stop** and ask the user how to resolve it before doing anything else (no label, no branch).
- No separate confirmation gate otherwise — once the order is resolved cleanly, proceed directly to step 2.

### 2. Label the parent and create the feature branch

```bash
gh issue edit <parent> --add-label "in progress"
```

Pick a slug for the branch name from one of the parent's existing labels — skip generic/status labels (`in progress`, `p0`/`p1`/`p2`, etc.) and use whichever label identifies the story/feature (the one `story-to-tickets` creates). **If no usable label exists, stop and ask the user for the slug** — do not guess one from the title.

```bash
git fetch origin
# Prefer the repo's integration branch (usually origin/main, or origin/dev if the project uses one — see AGENTS.md's Releases section)
git branch feat/<slug> origin/<integration-branch>
git push -u origin feat/<slug>
```

This skill runs from the main checkout — no worktree of its own, since it never edits code, only runs `git`/`gh` plumbing.

### 3. Work each subtask in order

For each sub-issue N in the resolved order:

1. Launch `Agent` with `subagent_type: general-purpose` (it needs the `Skill` tool). Prompt it to invoke the `work-issue` skill for issue N, explicitly stating this is **orchestrated mode**: base branch is `feat/<slug>` (already exists, do not create it), never touch the parent issue, use `AskUserQuestion` instead of just waiting for the plan gate and the post-PR validation gate, open the PR against `feat/<slug>`, and stop short of merging/cleanup/closing the subtask issue (see `work-issue`'s "Orchestrated mode" section for the full contract — link it in the prompt).
2. The subagent will surface an `AskUserQuestion` for its implementation plan, and another once the PR is open and CI is green, asking you to validate before merging. Answer both as they come.
3. Once you approve the final validation question, merge the subtask's PR into the feature branch:
   ```bash
   gh pr merge <subtask-pr> --merge
   ```
   (adjust to squash/rebase if that's this repo's convention). Delete the remote subtask branch if it isn't cleaned up automatically.
4. Now that the subagent's turn has ended, finish what it deferred: close the subtask issue if `Closes #N` didn't auto-close it, remove its "in progress" label, and remove its worktree — `EnterWorktree(path: .claude/worktrees/issue-<n>)` followed by `ExitWorktree(action: "remove", discard_changes: true)`.
5. Move to the next subtask in the order.

### 4. Close out the feature

Once every subtask is merged into `feat/<slug>`:

```bash
git push origin feat/<slug>
gh pr create --base <integration-branch> --head feat/<slug> \
  --title "<Feature title>" \
  --body "$(cat <<'EOF'
## Summary
- <one bullet per merged subtask>

## Test plan
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] Manual validation of the full feature end-to-end

Closes #<parent>
EOF
)"
```

Then **stop** and ask the user to validate the whole feature (not just the individual subtasks) before merging.

On approval:

```bash
gh pr merge <feature-pr> --merge
gh issue edit <parent> --remove-label "in progress"
gh issue view <parent> --json state -q .state   # if still OPEN:
gh issue close <parent> --comment "Done in #<feature-PR>."
```

## Resuming a partial run

Re-derive everything from GitHub — don't assume anything about a prior session:

- Sub-issues already `closed` (and merged into the feature branch) → skip.
- An open sub-issue with an open PR against `feat/<slug>` → pick up at the validation step for that one, don't relaunch its subagent.
- An open sub-issue with no PR yet → next one to launch, once its dependencies (per the graph) are satisfied.
- Feature branch already exists → skip step 2's branch creation, but still confirm the parent has the "in progress" label.
