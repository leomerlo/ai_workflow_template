# Design Workflow

How the four design skills (`impeccable`, `design-tokens`, `animate`, `apple-design`) integrate
into this template's existing development workflow (`create-story` → `story-to-tickets` →
`work-issue` → `implement-feat` → `prepare-release`).

## Language

**Backbone** (`impeccable`):
The design skill that runs ambiently for the whole project lifecycle — enforced by a
`PostToolUse`/`Stop` hook plus explicit `/impeccable shape|audit|critique|polish` calls inside
`work-issue`'s existing steps. Owns structure, hierarchy, information architecture,
accessibility, typography, spacing, layout, color, and tokens.
_Avoid_: orchestrator, main design skill

**Token generator** (`design-tokens`):
The design skill invoked to build a layered token system (Primitive → Semantic → Responsive, as
CSS custom properties) from zero — a primary color and a font, nothing else. Only for the
empty-file case; documenting or retrofitting an *existing* system stays the **Backbone**'s
`document`/`extract` commands. Its output feeds `DESIGN.md`'s frontmatter so the **Backbone**'s
hook audits it like anything else.
_Avoid_: token skill, design system generator

**Implementer** (`animate`):
The design skill invoked to build one concrete animation or transition. Decides mechanics only —
tool, property, easing curve, duration or spring config. Never invoked via `/impeccable animate`.
_Avoid_: motion skill, animator

**Feel lens** (`apple-design`):
The design skill consulted — never invoked to write code — only for gesture-driven or physical
motion. Supplies Apple's concrete spring/momentum/velocity values as input to the **Implementer**,
and reviews already-built gestural interactions standalone.
_Avoid_: motion philosophy, apple skill

## Relationships

- The **Backbone** runs for the whole project (ambient hook + explicit calls); the
  **Token generator**, the **Implementer**, and the **Feel lens** only activate for UI work
  inside `work-issue`'s existing Implement step — design gets no step of its own.
- An **Implementer** call may consult the **Feel lens** for a gesture-driven case; the
  **Feel lens** never produces the diff itself — only the **Implementer** does.
- The **Token generator** only runs when no token system exists yet. Once one exists (whether it
  built it or the **Backbone**'s `document`/`extract` did), the **Backbone** owns it from there —
  the **Token generator** never re-runs against an existing `DESIGN.md`.

## Example dialogue

> **Dev:** "I need to add a drawer that opens on tap."
> **Backbone (impeccable, ambient):** already flagged in `/impeccable shape` that this surface
> needs a dismissible panel — that's IA, not motion.
> **Implementer (animate):** picks the tool (CSS `@starting-style` vs Motion), the properties
> (`transform`/`opacity`), and — because a drawer is dismissible by drag — asks the **Feel lens**.
> **Feel lens (apple-design):** hands back `damping 0.8, response 0.3` for the drawer and the
> rubber-banding function for the drag boundary. **animate** writes the diff with those values.

## Decisions

- Design work does not get its own step in `work-issue`; it annotates the existing Implement
  step only when an issue touches UI. `code-review`'s 3 rounds run unchanged afterward — the
  **Backbone**'s pass already happened inside Implement, before Review starts. (Resolved
  2026-08-31)
- Role vocabulary: Backbone / Implementer / Feel lens. (Resolved 2026-08-31)
- The **Backbone**'s hook (`PostToolUse`/`Stop`) stays repo-wide (matches the official
  installer's default) rather than scoped to UI paths — the template doesn't know a downstream
  project's folder structure in advance, and `impeccable` filters non-UI files internally.
  (Resolved 2026-08-31)
- Routing rules (which skill, when, the `/impeccable animate` ban) live in
  [ui-ux-developer.md](.claude/agents/ui-ux-developer.md) as the operative detail; `work-issue`
  only points to it with one line in its Implement step, without duplicating the rule. (Resolved
  2026-08-31)
- `/impeccable init` is not part of the generic README onboarding (which runs for every
  project, UI or not). `ui-ux-developer` triggers it lazily, the first time a task actually
  touches UI and `PRODUCT.md` is missing. (Resolved 2026-08-31)
- `implement-feat` needs no separate design wiring — it delegates every subtask to `work-issue`,
  so the Implement-step rules apply automatically per subtask. (Resolved 2026-08-31)
- The **Feel lens**'s standalone review use (critiquing an already-built gestural interaction)
  is not wired into `work-issue`'s automated pipeline — no new agent call was added for it. It
  stays available on demand, the same way any skill triggers from a direct request. (Resolved
  2026-08-31)
- A Figma-specific token-generator skill we reviewed was deliberately not installed (no Figma
  integration exists here, no MSO project sources tokens from Figma). Its layered-inheritance
  discipline and HSL scale algorithm were ported instead into a new code-native skill, the
  **Token generator** (`design-tokens`), scoped to CSS custom properties, 3 layers instead of 4,
  and the empty-file case only. See [ADR-0002](docs/adr/0002-design-tokens-scope.md). (Resolved
  2026-08-31)

## Flagged ambiguities

- `impeccable` ships its own `/impeccable animate` sub-command that overlaps the standalone
  **Implementer** (`animate`) — different duration tables even. Resolved: `/impeccable animate`
  is banned outright; all animation work routes through `animate`. See
  [ADR-0001](docs/adr/0001-ban-impeccable-animate.md).
- "Design" is overloaded: the `code-review` agent's own description says it checks "design
  issues," meaning code/architecture design — unrelated to this Design Workflow (visual/UX).
  Resolved: keep both terms as-is, no rename; readers of this doc should read "design" in
  `code-review`'s description as code design, not the **Backbone**/**Implementer**/**Feel lens**
  system described here.
