# Caller HUD v2 (Option A, polished)

Built only from `../hud-design-system/` (tokens.css, components.css, design-system.md). No new components and no off-token values. Sample data is fake.

- `mockup.html`: open with `?state=live|ended|unknown|empty`
- `hillclimb.tsv`: rounds 1 to 10, scored on the 30-item checklist (section 9), with `check.sh` offToken 0 as the gate
- PNGs: final (live, 1440), state-ended, state-unknown, state-empty-timeline, responsive-1280

Rounds were rerun from `option-a.html` on the shared box after the cloud agent's rounds 1 to 6 were lost (never pushed).

Note: `tools/check.sh` can hang in headless Chrome and print `offToken: 0` from empty output. This run loaded the same `tools/check.html` through Playwright instead, for every state.

Still open: hover, focus and loading states aren't rendered (item 29). At 1440 in the ended state, the sidebar's live item wraps the name to 2 lines. Phone layout not addressed.
