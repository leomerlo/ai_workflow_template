---
name: prepare-release
description: Produce a manual test checklist for a release — fixed smoke tests plus feature tests derived from the diff between the project's release branches. Use when preparing a release, cutting a release, or the user asks what to test before shipping/deploying.
---

# Prepare Release

Turn what changed since the last release into a manual test checklist: a fixed smoke-test baseline
(always run) plus one test block per feature the diff actually touched.

## 0. Find this project's release conventions

Read AGENTS.md's `## Releases` section for the base/release branch names, the tag or version naming
pattern, and where checklists should be written. If that section is still a placeholder (or missing),
ask the user for these three things and offer to fill in `## Releases` in AGENTS.md so future runs
don't need to ask again.

## 1. Diff the release branch against the base branch

```bash
git fetch origin
git diff origin/<base>...origin/<release> --stat
git diff origin/<base>...origin/<release> --name-only
```

Use the triple-dot (merge-base) diff, not `<base>..<release>` — the two branches can each carry commits
the other lacks. Read the full diff (not just `--stat`) for touched files whose purpose isn't obvious
from the filename.

Drop files that carry no manual-test implication: pure refactors, test-only changes, docs-only
changes, and any repo-housekeeping docs. Confirm "no behavior change" by reading the diff, not by
guessing from the filename.

## 2. Map changed files to features

For each remaining file, find the feature it belongs to. If the repo has a doc that maps files to
features (e.g. `docs/INDEX.md`, an ADR index), grep the file path against it. A file can map to more
than one feature entry; a feature can span several changed files — group by feature, not by file.

If no such mapping doc exists, or a file isn't covered by it, name the feature area from context: the
touched module/directory, and the PR/issue if `git log` on that file names one.

## 3. Write one test block per feature

For each mapped feature, find its spec if one exists (a user story under `docs/stories/`, a design doc,
an issue) and turn its acceptance criteria / behavior description into concrete manual steps — what to
do and what to expect. Ground every step in what the diff actually changed, not the feature's full spec
— a release touching one acceptance criterion needs a test for that criterion, not the whole story
replayed.

Write every step for whoever is actually running the checklist, not for a developer reading the diff:
plain language, no field names, code identifiers, file paths, or jargon — describe what the user does
and sees, not the internal mechanism.

Lead with the action, not the mechanism: each step is "do this, see that" — what to click/type and what
should happen — not why it happens or what changed underneath to make it happen. Keep the "what
changed" context to one line per feature block, not repeated inside every step.

Special cases:
- **Database/schema migration touched** — add a step to confirm the migration applied cleanly on the
  target environment before any functional test below it.
- **Access-control / permissions change** — test as each role or account type the change affects, not
  just one.

## 4. Write the checklist file

Confirm the version this release will be tagged as, if not already stated — check existing tags
matching this project's version pattern (from step 0) for the latest one to ground the suggestion.
Write one markdown checklist to the release-checklist location from step 0 (default
`docs/releases/<tag>.md` if none is configured), so the checkboxes can be ticked off by hand while
testing:

```markdown
# Release checklist — <base> → <release> (<date>)

## Smoke tests
- [ ] ...(from SMOKE-TESTS.md, verbatim)

## Feature tests
### <feature name> (<story/design doc link>)
- [ ] ...
```

Load [`SMOKE-TESTS.md`](SMOKE-TESTS.md) for the fixed baseline — the golden paths every release must
verify regardless of what changed. Every feature block must trace to at least one line in the diff; if
a mapped feature yields zero concrete steps, that's a sign to re-read its spec rather than skip it.
Don't add the new file to any standing index doc — it's a per-release working checklist. Tell the user
the file path once written; don't commit it.
