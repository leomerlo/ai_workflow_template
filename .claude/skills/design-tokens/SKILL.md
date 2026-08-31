---
name: design-tokens
description: Generates a from-scratch, layered design-token system in code (CSS custom properties) — an algorithmic 11-step color scale per hue, spacing/radius/type-size primitives, a light/dark semantic layer, and a breakpoint-aware responsive layer — from just a primary color (plus optional secondary) and a font name. Use when starting a new UI surface that has no design tokens yet and needs a token system built from scratch. Not for documenting an existing system (use impeccable's `document` command) or retrofitting tokens out of code already repeated 3+ times in the project (use impeccable's `extract` command) — this skill only generates new, from-zero token systems.
---

# Design Tokens

Builds a 3-layer token system — **Primitive → Semantic → Responsive** — as plain CSS custom properties, from a primary color, an optional secondary color, and a font name. No build step, no framework dependency.

## Division of labor (read this first)

Three `impeccable` commands sound adjacent. They are not the same job:

| Command | Starts from | Produces |
|---|---|---|
| `design-tokens` (this skill) | A primary color + font, nothing else | A new token system, from zero |
| `/impeccable extract` | Code already repeating a pattern 3+ times | Tokens/components pulled out of *existing* code |
| `/impeccable document` | A codebase that already has a visual system | `DESIGN.md` describing what's *already there* |

If `DESIGN.md` already exists and just needs refreshing, or the project already has tokens somewhere, this is the wrong skill — use `document` or `extract`. This skill is for the empty-file case only.

## Quick start

1. Get the primary color (hex), optional secondary color, and font family name — from the user or the brief. Don't ask about breakpoints, hue choices for success/error/warning, or scale steps; those are fixed below.
2. Run the scale generator once per hue needed (primary, secondary if given, plus green/red/yellow/grey defaults — see [REFERENCE.md](REFERENCE.md)):
   ```bash
   node .claude/skills/design-tokens/scripts/generate-scale.mjs "#7C3AED" purple
   ```
   This prints the 11-step scale as hex values and a ready-to-paste CSS block. It's pure math (HSL interpolation) — always run it, never hand-compute or approximate a scale.
3. Build the three layers in order — Primitive, then Semantic (aliasing Primitive), then Responsive (aliasing Primitive) — following [REFERENCE.md](REFERENCE.md) for the exact groups, naming convention, and the Light/Dark and breakpoint tables.
4. Write the output into the project's stylesheet, and populate `DESIGN.md`'s YAML frontmatter (`colors`/`typography`/`rounded`/`spacing`/`components`) from the same values, so `impeccable`'s existing hook/audit reads it with no extra glue — see "DESIGN.md handoff" in REFERENCE.md.

## Hard rules

- **Every Semantic and Responsive token aliases a Primitive token — never a raw hex or px value.** If a value doesn't fit an existing Primitive step, add the step to the Primitive scale, don't hardcode a one-off.
- **Name Primitive color groups by hue** (`purple`, `pink`), never by role (`primary`, `secondary`) — role naming belongs to the Semantic layer.
- **Don't fabricate font weights.** Check what the given font family actually ships (its installed `@font-face` weights, or the Google Fonts API if it's a web font) before creating a weight token; if a needed weight is missing, fall back to the nearest available weight and say so.
- **Don't add a 4th layer.** No brand-theme-swapping layer — this template doesn't need multi-brand mode switching today. If a project genuinely needs it later, that's a new decision to make explicitly, not a default to build in.
- **Reuse an existing hue's scale** rather than generating a near-duplicate for a color that already has one.

## Reference

Full layer definitions, the naming convention, the Light/Dark and Responsive tables, and the `DESIGN.md` frontmatter mapping live in [REFERENCE.md](REFERENCE.md). Read it before building Semantic or Responsive — don't improvise the Surface/Text/Border mappings from scratch each time.
