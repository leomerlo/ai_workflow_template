---
name: create-story
description: Interview the user to dig into what they're trying to build, then write the resulting user story to docs/stories/. Use when the user wants to define a feature, write a user story, or says "create a story".
---

# Create Story

Turn a rough feature idea into an unambiguous user story through a focused interview, shaped by the product-manager agent.

## Flow

1. **Prime**: Launch the `product-manager` agent with the user's initial idea and ask it to return the key unknowns worth probing (target user, problem, scope boundaries, edge cases, success measure).
2. **Interview**: Ask the user **one focused question at a time** (use AskUserQuestion with concrete options when the answer space is enumerable). Dig like an interrogator, not a form:
   - Who is this for, and what problem does it solve for them?
   - What is explicitly in scope for the first version? What is out?
   - What are the edge cases and failure modes?
   - How do we know it worked (success criteria)?
     Follow up on vague answers until each branch is resolved. Challenge scope: propose deferring anything not essential to the MVP.
3. **Draft**: Write the story, then have the `product-manager` agent review it for gaps and ambiguity. Fix what it finds.
4. **Save**: Write the final story to `docs/stories/<kebab-case-slug>.md`.

## Story format

```markdown
# <Title>

As a <user>, I want <capability>, so that <benefit>.

## Context

<problem being solved, 2-4 sentences>

## Acceptance criteria

- [ ] <concrete, verifiable statement>

## Out of scope

- <explicitly deferred items>

## Open questions

- <anything intentionally left unresolved>
```

## Done when

The story file exists in `docs/stories/`, every acceptance criterion is verifiable, and the user has confirmed the final story. Point the user to `story-to-tickets` as the next step.
