# Erber HUD design system (light mode) · v1

This is the single source of truth for every Erber office page (Caller HUD, Outreach, Front desk, Parts, Systems).

- **Files:** `tokens.css` holds the values and `components.css` holds the approved components.
- **Rendered specimen:** `reference.html` (`reference.png` at 1440 wide) shows every token and component in the app shell.
- **Translation:** `compare.png` shows how the Claude desktop reference was carried into light mode.

## 0. Rules for whoever builds next (agents included)

1. **Build only from `tokens.css` and `components.css`.** Link both, in that order. Don't add colours, font sizes, weights, spacing, radii, borders or shadows that aren't tokens. Don't restyle a component locally.
2. **Compose pages from the components in §5.** Page CSS may only do layout (grid, flex, widths and order), and only with token values.
3. **New things need approval first.** That covers a new component, a new variant, a new token or a one-off value. Propose it in the PR description (§8) and wait for Wil's OK before building it. Until then, use the nearest existing component.
4. **Light mode only.** There is no dark theme and no dark top bar. Don't add `prefers-color-scheme` styles.
5. **Score by closeness to this system,** not by a generic heuristic score. Use the checklist in §9, and run `tools/check.sh <page.html>`, which must report `offToken: 0`.
6. **Sample data stays obviously fake** (Sample Customer A, 555 numbers). Never reuse real customer names or numbers from screenshots.
7. **Name the product "Caller HUD"** (never ScreenPop).

## 1. What we borrowed from the reference, and what we didn't

The reference is the Claude desktop app (Customize and chat screens, dark). We took its **qualities**, not its content, brand or dark palette.

| Quality in the reference | How it lands here |
|---|---|
| Calm, neutral surfaces with very little colour | Cool light neutrals: canvas `#F7F8FA`, sidebar `#F0F2F5`, white surfaces. Colour is the exception |
| One restrained accent | Navy `#0F2F66` is the only accent: primary button, selected text, focus ring, links |
| A few type sizes | Five sizes (13, 14, 16, 20, 28) and three weights |
| Even, generous spacing | A 4px scale with 8 steps. Content padding 40/48, groups 24 apart |
| Soft 1px borders, subtle radii, almost no shadow | 1px `#E2E5EB` borders, radii 6/8/12, one overlay shadow (toast and popovers only) |
| Quiet sidebar with section labels | Muted 13px sentence-case labels ("Recent customers ▾"), 40px items, selected item tinted |
| Segmented tab controls | One segmented control (track + raised segment) for every tab/filter/mode switch |
| Compact cards: icon, title, subtitle, one action | `.card`: 40px icon tile, 14/600 title, muted subtitle, one 32px icon action |
| Right-side info panel with label/value rows | `.panel` → `.panel-group` → `.kv` rows, muted label left, value right |
| Ghost / secondary / primary buttons | Same three, one primary per view |
| Small muted metadata | 13px `text-muted` everywhere metadata appears |

We did **not** take:
- The dark palette.
- The serif display face (we use General Sans throughout).
- The marketing carousel and gradient hero.
- Third-party brand-coloured logos as card icons (our icon tiles are neutral).
- The Claude content itself.

## 2. Tokens (`tokens.css`)

### Colour

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--color-canvas` | #F7F8FA | Main content area | — |
| `--color-sidebar` | #F0F2F5 | Left sidebar | — |
| `--color-surface` | #FFFFFF | Cards, panels, inputs, top bar, toast | — |
| `--color-fill` | #ECEEF2 | Hover, segmented track, neutral chip, icon tile | — |
| `--color-fill-strong` | #E2E5EB | Pressed | — |
| `--color-border` | #E2E5EB | Dividers, cards, panels | decorative |
| `--color-border-strong` | #C3C9D4 | Secondary buttons, card hover | decorative (buttons are identified by their label) |
| `--color-border-input` | #878F9E | Text inputs, search, composer | 3.2:1 on surface |
| `--color-text-strong` | #050D57 | Page title and section headings only | 16.4:1 on canvas |
| `--color-text` | #161B26 | Body, titles, controls | 17.2:1 on white |
| `--color-text-muted` | #5B6474 | Metadata, labels, counts | 6.0 white, 5.6 canvas, 5.3 sidebar, 5.1 fill |
| `--color-text-disabled` | #8C94A3 | Disabled controls only | not for content |
| `--color-accent` | #0F2F66 | Primary button, selected text, focus, links | 13.0:1 white text on it; 10.9:1 on accent-tint |
| `--color-accent-hover` | #050D57 | Primary hover | — |
| `--color-accent-tint` | #E7ECF5 | Selected nav item / row background | — |
| `--color-live` / `-bg` | #17703A / #E6F4EA | Live call chip | 5.4:1 |
| `--color-warning` / `-dot` / `-bg` | #7A4B00 / #B87900 / #FFF3D6 | Overdue, declined, needs attention | 6.7:1 |
| `--color-urgent` | #EC3013 | Brand red: status dots and the alert icon only | 4.2:1, so never text |
| `--color-urgent-text` / `-bg` | #B3200C / #FDECE8 | Small red text: missed call, error message | 5.9:1 on bg, 6.7:1 on white |

### Type

General Sans, self-hosted, `font-display: swap`. Weights are 400, 500 and 600. **No Bold file exists, so never set 700.** Tabular numbers are on app-wide.

| Token | Size | Role | Weight | Colour |
|---|---|---|---|---|
| `--text-xl` | 28 | Page title (`.page-title`), one per page | 600, tracking −0.01em | text-strong |
| `--text-lg` | 20 | Section and panel headings (`.section-title`) | 600, tracking −0.01em | text-strong |
| `--text-md` | 16 | Group headings, empty-state title (`.group-title`) | 600 | text |
| `--text-sm` | 14 | Body, controls, card and row titles | 400 body, 500 controls, 600 titles | text |
| `--text-xs` | 13 | Metadata, labels, chips, counts, kbd | 400–500 | text-muted |

Line height is 1.45 for body sizes and 1.25 for lg/xl. Body text is capped at `--measure` (64ch).

### Spacing, radius, borders, elevation, sizing

- **Spacing:** 4, 8, 12, 16, 24, 32, 40, 48 (`--space-1 … --space-12`).
  - Tight inside a group (4–12), generous between groups (24–48).
  - There's more space above a heading than below it.
  - There is no 20 and no odd values.
- **Radius:**
  - `sm` 6: chips, kbd, segments.
  - `md` 8: buttons, inputs, nav items, icon tiles.
  - `lg` 12: cards, panels, lists, toast, composer.
  - `pill`: status chips, dots and avatars only.
- **Borders:** always 1px. The only 2px line is `--indicator-width`, used for the focus ring and the focused-input ring.
- **Elevation:** `--shadow-overlay` is used only for the toast and popovers. Nothing else casts a shadow; borders separate.
- **Sizing:**
  - `--control-h` is 40, for buttons, inputs, nav items and icon buttons.
  - The compact size is 32, for segments, small buttons inside cards, rows and the timeline, and text links.
  - **The minimum target is 32×32** (above the WCAG 2.5.8 AA minimum of 24).
  - Icons are 16 or 20, with a 1.5 stroke and round caps, drawn as SVG. The icon tile is 40.
- **Shell:** top bar 56, sidebar 248, info panel 320, content padding 40 top / 48 sides.
- **Motion:** 120ms for hover/press, 200ms for panels and toasts, ease-out. Reduced motion turns both off. The live dot's slow pulse is the only looping motion.

## 3. Layout

```
┌───────────────── Top bar 56 · white · 1px bottom border ────────────────────┐
├──────────┬───────────────────────────────────────────────┬──────────────────┤
│ Sidebar  │ Content (canvas)                              │ Info panel 320   │
│ 248      │  page title (xl) + muted lede                 │ (canvas)         │
│ sidebar  │  segmented tabs / search / primary action     │  panel heading   │
│ bg       │  sections: section-title (lg), 24 inside,     │  panel groups    │
│          │  40 between, 1px divider                      │  (label/value)   │
└──────────┴───────────────────────────────────────────────┴──────────────────┘
```

- The info panel is optional. Use it for "facts about the thing on screen" (caller, customer, vehicle), never for actions that belong in the content.
- Every page has one `.page-title`. On a record page the title is the record name.
- **Breakpoints:** these are rules for now, to be verified on the first page built with the system.
  - ≤1365: the info panel moves below the content.
  - ≤1023: the sidebar becomes a top strip (live status, search, views).
  - ≤767: single column, and the primary action sits in a bottom bar.

## 4. Colour discipline

- **Navy is the only accent.** It is used for the primary button fill, selected text (nav, segment, row), the focus ring, links, and the accent-tint selected background. Nothing else.
- **Status colour lives inside chips, dots and the timeline icon circle.** It never fills a large area, a card, a row or a section background.
- **Red is for urgent and alerts only.** Examples are a missed call, a failed save, or the phone system being offline.
  - Overdue service is **warning (amber), not red**: it's an opportunity, not an emergency.
  - `#EC3013` is never text. Small red text uses `#B3200C`.
- **Counts are muted** (`.chip-count`, `.side-count`, `.seg .count`), never coloured badges.

## 5. Components (`components.css`)

Each of these is shown in `reference.html`. Anything not listed here needs approval (§8).

| Component | Classes | Anatomy and rules |
|---|---|---|
| **Top bar** | `.topbar`, `.logo`, `.topnav`, `.topbar-tools`, `.topbar-sep`, `.topbar-user` | White with a 1px bottom border. Navy-dark logo (`assets/erber-logo-navy.png`, 18px tall). App links are 40px; the current one gets the accent tint and navy semibold text. Tools on the right are ghost buttons with sentence-case state ("Chime off"), then the staff name (muted) and Sign out (ghost). |
| **Sidebar** | `.sidebar`, `.side-item`, `.side-label`, `.side-count`, `.side-sub`, `.side-foot`, `.avatar` | Sidebar background with a 1px right border. Items are 40px with a 20px muted icon, 14/500 text and an optional muted count on the right. Selected (`aria-current="page"`) gets the accent tint, navy text and a navy icon. Section labels are 13/500 muted sentence case with an optional chevron. They're labels for nav groups, never eyebrows above a heading. The footer has an avatar, name and role. |
| **Segmented tabs** | `.seg` + `role=tab` (or `role=radio`) | Fill track, 4px inset, 32px segments. The selected segment is white with a 1px border and navy semibold text. Counts inside are muted. This is the **only** tab style: use it for page views, filters and modes. 2–5 options. |
| **Search** | `.search` + `input[type=search]` | 40px field with a 16px leading icon, `border-input`, and an optional trailing `.kbd` hint. Placeholder: "Name, phone or RO #". |
| **Buttons** | `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-ghost`, plus `.btn-icon`, `.btn-sm`, `.kbd` | **One primary per view.** Secondary is white with `border-strong`. Ghost is transparent with a fill on hover. The default height is 40, and `.btn-sm` (32) is only for inside cards, rows, timeline, composer and toast. Icon-only buttons need `aria-label`. Shortcut hints use `.kbd` (`aria-hidden`) plus `aria-keyshortcuts` on the button. Disabled buttons are a fill with disabled text; prefer an enabled button with an inline error. |
| **Chips and status** | `.chip`, `.chip-live`, `.chip-ended`, `.chip-warning`, `.chip-urgent`, `.chip-count`, `.dot` | 24px tall, 13/500, a dot plus a short label. Live: "Live call 2:14" (pulsing dot, `role=status`). Ended: "Call ended · 0:05". Warning: "Oil change 40 days overdue". Urgent: "Missed call · 4:51 PM". A plain chip is a tag; a count chip is muted. Chips are not buttons. |
| **Cards** | `.card-grid`, `.card`, `.tile`, `.card-title`, `.card-sub`, `.card-meta` | White, 1px border, radius 12, padding 16. Grid: 40 tile, text, one action. Title 14/600, subtitle 14 muted, meta 13 muted. **Exactly one action,** a 32px secondary icon button (+ to add, ✓ when done). Only for sets of peer items in a 2-column grid. Never page structure, never nested, no shadows. |
| **List rows** | `.list`, `.row`, `.row-title`, `.row-meta`, `.row-end`, `.avatar` | One bordered list container (radius 12) with 1px dividers between rows. Row: 32 avatar or icon, title 14/600 plus meta 13, trailing chip and time. At least 48px tall. Selected (`aria-selected`) gets the accent tint and a navy title. **No coloured side stripes,** no zebra stripes. |
| **Info panel** | `.panel`, `.panel-head`, `.panel-group`, `.panel-label`, `.kv`, `.link` | Right column on the canvas. The head has a section title and an optional status chip. Each group is a white bordered block with a 13/500 muted label (optional chevron or one text link) and `dl` rows that are 40px tall: muted label left, 14/500 value right. Values may be a chip. Facts only, at most one link per group. |
| **Timeline row** | `.timeline`, `.tl-row`, `.tl-date`, `.tl-icon`, `.tl-icon-urgent`, `.tl-title`, `.tl-meta`, `.tl-body` | Columns: 72 date (13 muted), 32 icon circle (fill; urgent tint only for missed or failed), content (title 14/600 with an optional chip, meta 13 muted or body 14), and an optional trailing ghost-sm button or link. 1px divider. Runs of repeated empty events collapse into one row with Show. |
| **Text input** | `.field`, `.input`, `.help`, `.is-error`, `.composer`, `.composer-bar` | Label (14/500) above, 40px input with `border-input`, help (13 muted) below. Focus: navy border plus a 2px navy ring. Error: `urgent-text` border and help with an alert icon, plus a message that names the problem and the fix. Disabled: a fill. The composer is the multi-line version: radius 12, textarea, then a bar with a segmented mode on the left and the primary or secondary save action on the right. |
| **Toast** | `.toast`, `.toast-text` | White, 1px border, radius 12, the overlay shadow. A success icon, a short past-tense message ("Logged as Booked"), Undo (ghost-sm + `.kbd`), and dismiss. `role=status`, bottom centre, 8s. |
| **Empty state** | `.empty`, `.tile`, `.empty-title`, `.empty-body` | Centred in its container: a muted icon tile, 16/600 title saying what's missing, 14 muted body (max 44ch) saying what will appear here, and **one** secondary button. |

Type helpers: `.page-title`, `.section-title`, `.group-title`, `.lede`, `.meta`, `.body`, `.sr`, `.ico`, `.ico-sm`.

## 6. Do and don't

**Do**
- Let surfaces and spacing do the separating: canvas vs white, 1px borders, 24–48 between groups.
- Keep one primary button per view, and make it the action staff take most.
- Write labels in sentence case, and name controls by their action ("Save note", "Create RO").
- Put metadata in 13px muted text on one line, joined with " · ".
- Use the info panel for label/value facts and the content area for work.
- Show status as a chip with words ("Live call 2:14"), never as colour alone.
- Theme browser surfaces: focus ring, selection, caret and scrollbars (already in tokens).

**Don't**
- Don't use dark mode or dark bars. Don't use navy as a large background fill, even for the top bar.
- Don't use red for overdue, counts, badges or decoration, and don't use `#EC3013` as text.
- Don't use uppercase eyebrows or kickers above headings, or section numbers.
- Don't nest cards, use a card as page structure, put more than one action on a card, or add coloured side borders.
- Don't add shadows on cards, buttons or panels. The overlay shadow is for the toast and popovers only.
- Don't use any size outside the five, any weight of 700, or font sizes below 13.
- Don't use underline tabs, pill-filter tabs, or a second tab style. Use the segmented control.
- Don't use emoji or unicode glyphs as icons. Use the 1.5-stroke SVG set.
- Don't use one-off hex values, px values or inline styles in pages.

## 7. Accessibility floor

- Text contrast is ≥4.5:1 (all token pairs above pass). Input borders are 3.2:1. The focus ring is 2px navy with a 2px offset on every control.
- Targets are ≥32×32, and standard controls are 40.
- Status is carried by words as well as colour. Live and ended chips use `role=status`, and the call timer must not announce every second.
- Tabs and radios use real roles with roving tabindex. Rows in a selectable list use `listbox` / `option` + `aria-selected`.
- Keyboard-hint chips are `aria-hidden`, and the button carries `aria-keyshortcuts`.
- `prefers-reduced-motion` turns off transitions and the live pulse.

## 8. Changing the system (approval first)

1. In the PR description, write the need: the page, the job, and why no existing component fits.
2. Sketch the proposed component using existing tokens only. If it needs a new token, say which and why.
3. **Wait for Wil's approval.** Don't build the component in a page until it's approved.
4. Once approved:
   - Add it to `components.css`, with any new token in `tokens.css`.
   - Add it to `reference.html`, re-render `reference.png`, and add a row in §5.
   - Bump the version at the top of this file.

Candidates already noticed (not approved, don't build): a toggle switch (the reference has one), a modal or popover sheet, a destructive button, a banner for "phone system offline", a progress or context meter (the reference's context bar), and a tooltip.

## 9. Consistency checklist (the hill-climb score)

This replaces the generic Nielsen + audit score for future hill climbs. **Score = items passed out of 30.**
- Each round changes one thing, re-renders, re-scores, and is kept only if the score goes up (or ties with a clear visual win).
- **Any unapproved new component costs −3** and must be reverted or sent for approval.
- Items A1–A6 come from `tools/check.sh <page>`. B–E are judged against `reference.png`.

**A. Tokens (automated, `tools/check.sh`)**
1. Colour: 0 off-token colours (text, background, border, placeholder).
2. Type: 0 off-scale sizes, weights or families.
3. Spacing: 0 off-scale padding, margin or gap values.
4. Shape: 0 off-token radii, border widths or shadows.
5. Contrast: 0 text below 4.5:1 (3:1 at 24px and above).
6. Targets: 0 interactive elements below 32×32.

**B. Colour discipline**
7. Navy appears only on the primary button, selected states, focus and links.
8. There is at most one primary button in each view.
9. Red appears only for real urgency (missed call, error, offline), and `#EC3013` is never text.
10. Status colours appear only inside chips, dots or timeline icons; no large tinted areas.
11. Counts are muted, not coloured badges.

**C. Type and spacing**
12. There's exactly one `.page-title`, and headings follow xl → lg → md with no skipped roles.
13. Metadata is 13px muted; no secondary information is set in body text.
14. There are no uppercase eyebrows, kickers or section numbers.
15. Groups are separated by 24–48, items inside a group by 4–12, and there's more space above headings than below.
16. Body text is capped at 64ch, and nothing wraps awkwardly at 1440 or 1280.

**D. Components**
17. Every element maps to a §5 component; page CSS only lays them out.
18. All tabs, filters and modes use the segmented control.
19. Buttons follow the hierarchy (primary, then secondary, then ghost), with `.btn-sm` only inside cards, rows, timeline, composer and toast.
20. Cards have one tile, title, subtitle, at most one meta line and exactly one action, and are never nested.
21. Lists are one bordered container with 1px dividers; selection uses the accent tint, not a stripe.
22. The info panel holds only label/value facts with at most one link per group.
23. Inputs have a visible label, help or error text below, and the composer pattern for multi-line text.
24. Empty states have an icon tile, a title, a body and one action.
25. The toast is the only floating element, and it uses the overlay shadow.

**E. Shell and fit**
26. The shell matches: white top bar with the navy logo, a quiet sidebar with section labels, a canvas content area, and an optional 320 panel.
27. The sidebar has exactly one selected item, and selection looks the same in the top nav, sidebar, segments and rows.
28. Icons come from the 1.5-stroke SVG set at 16 or 20 only.
29. States are real: hover, focus, selected, disabled, error, empty and loading are covered where the page has them.
30. Side by side with `reference.png`, the page reads as the same app: same density, same calm, nothing louder than the reference.

`reference.html` passes A1–A6 (`tools/check.sh` reports `offToken: 0`). It's a specimen sheet, so it deliberately breaks item 8 (several primaries on one page); the rest of the checklist is written against it.

## 10. Files and tools

| Path | What |
|---|---|
| `tokens.css` | All tokens and the browser-surface styles (focus, selection, caret, scrollbars) |
| `components.css` | The approved components |
| `reference.html` / `reference.png` | Every token and component in the shell, 1440 wide |
| `compare.html` / `compare.png` | Claude reference (recreated, dark) next to the light translation |
| `fonts/` | General Sans Regular, Medium, Semibold (no Bold) |
| `assets/erber-logo-navy.png` | Logo for the light top bar, recoloured from the white logo |
| `tools/check.sh [page] [--shot out.png] [--width 1440]` | Token conformance, contrast and target check, plus an optional full-page render |
| `refs/` (to add) | Wil's three reference screenshots weren't on the build machine. Commit them as `refs/claude-customize.png`, `refs/claude-chat.png` and `refs/current-caller-hud.png` so future reviews can compare against the originals |
