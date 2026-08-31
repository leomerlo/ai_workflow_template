# Route all animation work through `animate`, never `/impeccable animate`

`impeccable` (the **Backbone**) ships its own `/impeccable animate` sub-command with a description
and duration/easing tables that overlap the standalone `animate` skill (the **Implementer**) almost
one-to-one, but with different concrete values. Left as an implicit convention, both skills compete
for the same "animate this" trigger and which one wins would vary by session, giving inconsistent
motion values across the same codebase.

We explicitly ban invoking `/impeccable animate`. `impeccable`'s role stops at *flagging* that a
surface needs motion (via `shape`/`audit`/`critique`); every concrete animation is built by the
`animate` skill. The alternative — leaving it as an unwritten convention — was rejected because
`impeccable` is a 20-sub-command router where the more specific skill isn't guaranteed to win the
trigger every time.

**Status:** accepted
