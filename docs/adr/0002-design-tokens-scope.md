# `design-tokens` only generates from zero; `impeccable` keeps document/extract

We reviewed and deliberately did not install a third-party Figma token-generator skill (Figma
Variables via plugin API — no Figma integration exists in this environment, and no MSO project
uses Figma as a token source of truth). Instead we built `design-tokens`, a code-native skill
that ports its layered-inheritance discipline and its HSL color-scale algorithm to plain CSS
custom properties.

`impeccable` already owns two commands that sound like the same job: `document` (reverse-engineers
`DESIGN.md` from a codebase that already has a visual system) and `extract` (pulls tokens/components
out of code already repeated 3+ times). Neither generates a system from nothing — `extract`'s own
first step explicitly stops and asks rather than creating one. Scoping `design-tokens` to the
empty-file case only — never touching a project that already has tokens or a `DESIGN.md` — was a
deliberate choice to avoid recreating the exact `/impeccable animate` vs `animate` overlap this
repo already resolved once (see [ADR-0001](0001-ban-impeccable-animate.md)). The alternative —
folding token generation into `impeccable` itself, or leaving the boundary as an unwritten
convention — was rejected for the same reason ADR-0001 gives: `impeccable` is a wide router, and
an unwritten boundary between three similarly-described commands would drift.

**Status:** accepted
