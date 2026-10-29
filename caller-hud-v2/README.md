# Caller HUD v2 (Option A, polished)

Built only from `../hud-design-system/` (tokens.css, components.css, design-system.md). No new components and no off-token values. Sample data is fake.

- `caller-hud.html`: open with `?state=live|ended|unknown|empty`
- `hillclimb.tsv`: rounds 0 to 10, scored on the 30-item checklist (section 9). The gate is offToken 0 in every state.
- `tools/score.sh`: the cloud agent's gate script
- PNGs: final (live, 1440), state-ended, state-unknown, state-empty-timeline, responsive-1280

Rounds 0 to 6 were recovered by replaying the cloud agent's file writes from its transcript. Round 4 and round 5 were reverted, as the agent decided. Rounds 7 to 10 were run on the shared box.

Note: `tools/check.sh` can hang in headless Chrome and print `offToken: 0` from empty output. This run loaded the same `tools/check.html` through Playwright instead.

Still open: no loading state (item 29), because the system has no loading component. Hover and focus states aren't rendered. The phone layout isn't addressed.
