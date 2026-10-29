# Outreach page redesign: build spec

Reference: `mockup.html` + `mockup.css` (open in Chrome at 1440×900). States: `?state=withheld` (default), `?state=text`, `?state=empty`, `?state=done`. All colours, sizes, and spacing come from `tokens.css` unless this spec names a local value. All customer data in the mockup is fake.

| Screenshot | Shows |
|---|---|
| `mockup-1440.png` | Default: Due service tab, first customer selected, call only (no text consent) |
| `state-text-allowed-undo.png` | Previous customer just logged as Booked and dismissed from the list (toast with Undo), next customer selected, text draft allowed |
| `state-empty.png` | Empty tab (Declined work, 0) |
| `state-done.png` | Batch finished: list is clear, detail pane shows the tally and next-batch action |
| `state-shortcuts.png` | Keyboard shortcut sheet open (`?state=shortcuts`) |
| `responsive-1280.png`, `responsive-800.png`, `responsive-390.png` | Breakpoint checks (default state) |

## 1. Layout (1440×900 desktop)

```
┌──────────────────────── Top bar 56px · navy-dark ───────────────────────────┐
├──────────┬──────────────────────────────────────────────────────────────────┤
│ Rail     │ Page head (white): h1 + lede, then tabs (48px)                   │
│ 280px    ├────────────────────────┬─────────────────────────────────────────┤
│ bg       │ List 464px (white)     │ Detail: fills the rest (white)          │
│          │  list head             │  scroll area                            │
│          │  rows (scroll)         │  ───────────────────────────────────    │
│          │  list foot 56px        │  sticky outcome bar                     │
└──────────┴────────────────────────┴─────────────────────────────────────────┘
```

- **App grid:** `grid-template-columns: 280px 1fr`, height `100vh − 56px`. The rail, list, and detail panes each scroll independently. The page itself never scrolls.
- **Work grid:** `grid-template-columns: 464px 1fr`. At 1440 the detail pane is 696px wide.
- **Dividers:** 1px `--color-border` between rail and main, and between list and detail. Row dividers use the local `--hairline: #E2E6EE` (same value as `--color-disabled-bg`).
- **No cards inside panes.** The only filled block in the detail pane is the script/draft well (`--color-bg`, radius `--radius-md`).
- **Both grid tracks use `minmax(0, 1fr)`** so long content never pushes the detail pane past the viewport.
- **≤1365px:** rail 248px, list 360px. Top-bar tools go icon-only (44×44, label kept as the accessible name). The page title and lede stack. Tabs scroll sideways. The detail header stacks (phone + Copy number on one row under the name). The outcome and snooze rows may wrap. The footer drops the "↑ ↓ move" hint and keeps the Shortcuts button.
- **≤1023px:** the rail becomes a top strip (live status, search, Overview/Outreach), and recent customers are hidden. The list is 320px. The staff name is hidden.
- **≤767px:** single column. The top-nav links are hidden, the list caps at 40vh, the detail follows, and the outcome bar is sticky at the bottom with Called full width. Snooze sits on its own row and scrolls sideways.
- **Known rough edges:** at about 800px the outcome bar takes three rows. On phones the Snooze options scroll sideways and "Sign out" crowds the top bar.

## 2. Type (General Sans, fixed px scale from tokens)

| Role | Size / weight | Colour | Notes |
|---|---|---|---|
| Page title "Outreach" | `--text-xl` 24 / 600 | `--color-navy-dark` | tracking −0.01em |
| Detail customer name | `--text-2xl` 30 / 600 | `--color-navy-dark` | tracking −0.015em, leading 1.2 |
| List heading, phone in detail | `--text-lg` 20 / 600, `--text-xl` 24 / 600 | text / navy | phone is a `tel:` link |
| Row name, outcome buttons, script text | `--text-base` 17 / 600 (name, buttons), 17 / 400 (script, line-height 1.55, max 64ch) | text | |
| Body, reason, lede, tabs, rail | `--text-sm` 15 / 400–500 | text or muted | |
| Metadata, counts, chips, kbd, hints | `--text-xs` 13 / 500 (kbd 12) | `--color-text-muted` | 13px is the floor; nothing smaller |

- `font-variant-numeric: tabular-nums` on the whole app (phones, counts, times line up).
- **Weights:** 400, 500, and 600 only. `GeneralSans-Bold.otf` (700) is referenced by `tokens.css` but missing from `assets/fonts`. Either add the file or never use 700 (the mockup doesn't).
- **No uppercase labels or eyebrows.** Group labels ("Find a customer", "Snooze") are sentence case, semibold or medium.

## 3. Colour rules

| Use | Token | Where |
|---|---|---|
| Primary action, selected tab, selected row name, links, phone | `--color-navy` #0F2F66 | Called button, active tab bar (3px), phone number |
| Top bar, headings | `--color-navy-dark` #050D57 | |
| Brand red #EC3013 | `--color-red` | Only the 3px underline on the active top-nav item. Never text, never badges, never counts |
| Small red text (real urgency only) | `--color-red-text` #B3200C | Reserved for things like a missed incoming call. Not used for "overdue", because every row in a due list is overdue, so red would carry no information |
| Selected row | `--color-info-bg` + inset 1px navy ring | No coloured left border |
| Call-only chip, consent notice | `--color-warning-bg` / `--color-warning-border` / `--color-warning-text` #4A3200 | ~11:1 contrast |
| Text OK chip, done check | `--color-success` on `--color-success-bg` | |
| Undo toast | `--color-text` fill, white text, success-tinted check icon | |
| Focus | 3px `--color-focus` outline (inset 3px ring on rows) | Every control |

Counts (tabs, rail nav) are always muted text, never a coloured badge.

## 4. Spacing

4px base, from tokens.

- **Page head:** padding 20/32/0. Title and lede on one baseline, with a 20px gap. Tabs sit 12px below.
- **List head:** padding 16/24/12. Batch line sits 8px below the heading, and the meter 8px below that.
- **Row:** padding 12/24. Name line, then reason line. The selected row adds a flags line 8px below (Call only / Text OK chip + phone). Rows are about 64px tall, or about 92px when selected.
- **Detail:** padding 20/32. The header block (name/meta/reason on the left, phone + Copy number right-aligned on the right) has 20px of bottom padding and a hairline under it. Sections (Call script, Text draft) are 20px apart. The heading row is 44px tall (heading left, copy button right), then 8px to the well.
- **Outcome bar:** padding 12/32/16, top border `--color-border`, `--shadow-bar`. Row 1 has the outcome buttons with 12px gaps. Row 2 (8px below) has the Snooze label (84px min) and the segmented control.
- **Left rail:** padding 20/16, with 24px between groups (live status, search, nav, recent).

## 5. Components

### Buttons

The radius is `--radius-md` on every button.

| Variant | Height | Style |
|---|---|---|
| Primary (`Called`) | 56 (`--tap-primary`), min-width 168 | navy fill, white text; hover/pressed `--color-navy-dark` |
| Secondary (`Booked`, `Copy script`, `Copy number`, `Copy text`) | 56 in the outcome bar, 44 for copy buttons | white, navy text, 1px `--color-border-strong`; hover `--color-info-bg` with a navy border |
| Ghost (`Not interested`, `Review this batch`, `Show all lists`) | 56 / 48 | no fill, muted text; hover `--color-disabled-bg` |
| Disabled | | `--color-disabled-bg` / `--color-disabled-text`, no border |
| Loading (copy buttons) | | the label swaps to "Copied" with a check icon for 1.5s. This is the confirmation state, not a spinner |

### Other components

- **Snooze group:** an inset track (`--color-bg` fill, 1px `--color-border`, 3px padding, 2px gaps) holding four 44px segments (white, 1px border, 7px radius, no wrapping): 1 day (1), 7 days (7), 30 days, and Pick a date. "Pick a date" opens a calendar popover (escape the pane with `position: fixed` or a popover) defaulting to today + 14. The old separate "Snooze until date" button is removed.
- **Keyboard hints:** a `kbd` chip (20px, 12px text, 1px border) inside the button it triggers. Shortcuts: C Called, B Booked, N Not interested, 1 / 7 snooze, S copy script, T copy text, U undo, ↑↓ move, Enter start next batch, ? opens the shortcut sheet. The chips are `aria-hidden="true"`, and the button carries `aria-keyshortcuts` (for example `aria-keyshortcuts="c"`), so screen readers announce "Called", not "Called C". The list footer shows "↑ ↓ move" plus a real 44px "? Shortcuts" button.
- **Shortcut sheet:** the Shortcuts button (or ?) opens a popover (`popover`, light dismiss, Esc). It's 416px wide, anchored above the list footer, with a radius of `--radius-lg`. It has the heading "Keyboard shortcuts" and a 44px close button. Rows have zebra fill (`--color-bg` on odd rows) and no dividers; each pairs a plain-language action with its keys. The foot line reads "Every outcome removes the customer from the list. Undo brings them back."
- **Sort control:** "Most overdue first" is a real 44px button (`aria-haspopup="listbox"`) that opens the sort options. It must never be a styled label.
- **Tabs:** underline style, 48px tall, label plus a muted count. Active: navy text, semibold, 3px navy bottom bar. Hover: `--color-border` bottom bar.
- **Consent notice (no text consent):**
  - Placement: under the "Text draft" heading, where the draft would be.
  - Contents: a lock icon and the owner-approved copy, verbatim: "**Call only.** No text consent on file. Update it in the customer record if they agree." ("Call only." is semibold; the rest is regular.)
  - The list row shows the small "Call only" chip with a lock icon.
  - Staff cannot change consent on Outreach. There is no consent control, toggle, or link-styled button on this page, and the notice is read-only (`role="note"`).
- **Consent present:** the draft appears in the well with Copy text (T), and a small success-coloured line underneath: "Text consent on file since <Mon YYYY>". Read-only, no control.
- **Icons:** a single stroke set, 1.75px stroke, 20px (16px small), `currentColor`. The mockup uses inline SVG. In the app, use the project's icon library at the same stroke weight. No emoji or unicode arrows as icons (keycaps inside `kbd` are fine).

## 6. Behaviour

1. **Selection:** the first unworked row is selected on load. ↑↓ or a click moves the selection, and the detail pane follows. The list is a `listbox` with roving `tabindex`.
2. **Logging an outcome:**
   - Every outcome dismisses the customer: Called, Booked, Not interested, and any Snooze (1 day, 7 days, 30 days, or a picked date). The row leaves the list immediately (no greyed-out row, no outcome tag, no exit animation beyond the 120ms `--duration-fast` collapse) and the next customer is selected. If it was the last row, selection moves to the previous one; if none remain, show the batch-done state.
   - The dismissed customer moves to the "Worked recently" count in the list footer.
   - The batch line updates ("4 left in this batch of 25"), and the meter fills.
   - A toast shows above the list footer: "**Sample Customer A** logged as Booked · Undo (U)". It has `role="status"`, stays 8s, pauses on hover, and one toast replaces the previous one.
3. **Undo** (button or U, available for the 8s the toast is up) clears the logged outcome, puts the customer back in their original list position, and selects them again. After the toast expires, undo is no longer offered on this page.
4. **Batch done:** when all 25 are worked, the detail pane shows the done state: a check, "Batch done", "You worked all 25 due-service customers in this batch. 263 are still open.", a tally (Booked / Called / Snoozed / Not interested), and buttons for Start next 25 (primary, Enter) and Review this batch. The list pane is empty apart from "No one left in this batch / Worked customers are under Worked recently."
5. **Incoming call (not mocked):** a ringing call overrides everything. The rail's live block turns into the call card, the page doesn't lose the outreach selection, and staff return to the same customer afterwards. This is where red text belongs.

## 7. States checklist

| State | Spec |
|---|---|
| Loading list | 5 skeleton rows (two grey bars each, `--hairline`), batch line skeleton, detail pane skeleton header. No spinner |
| Empty tab | Spans list + detail. Inbox icon (40px, `--color-border-strong` stroke), heading "No <list> to follow up", one sentence on what lands here, primary button to the busiest non-empty list ("Work Due service 288"), ghost "Show all lists" |
| Error / mirror offline | Inline banner at the top of the list pane, warning tokens: "Can't reach the shop mirror. Showing the list from <time>." with Retry. Outcome buttons stay enabled and queue locally if supported, otherwise disabled with that reason in a tooltip |
| Row: default / hover / focus / selected | bg white / `--color-bg` / 3px inset focus ring / `--color-info-bg` + 1px navy ring. There is no logged row state: a logged row is removed |
| No phone on file | Phone slot reads "No phone on file" (muted), and Called and Booked are disabled. Not interested and Snooze stay enabled |
| Long names | Row name truncates with ellipsis at one line. The detail name wraps (max 2 lines) |

## 8. Copy changes

| Current | New |
|---|---|
| "Copy a script or draft, then call or text yourself. Nothing on this page is sent to a customer." | "Copy the script, call or text from your own phone, then log what happened. Nothing on this page contacts the customer." |
| "5 Due service in this batch of 25. 288 open in the full list." | "5 left in this batch of 25 · 288 open in all" |
| "An oil change due 2026-09-19. · 2014 Ford Expedition" | Row: "Oil change · 2014 Ford Expedition" + "40 days over". Detail: "Oil change overdue by 40 days · It was due Sep 19, 2026." |
| "Text draft withheld: no marketing consent" | "Call only. No text consent on file. Update it in the customer record if they agree." |
| "Snooze until date" + date input | "Pick a date" inside the Snooze group |
| "Arrow keys move. C called, …" | kbd chips on buttons + "↑ ↓ move · ? shortcuts" |
| "▸ LAST 30 DAYS" | "Worked recently 41" |
| "Incoming calls" | "Listening for calls / No incoming call right now" |
| "Open Caller HUD separately ↗" (floating) | "Pop out" in the top bar |
| Chime / Alerts (floating) | "Chime on" / "Alerts on" toggles in the top bar (`aria-pressed`) |

Outcome labels (Called, Booked, Not interested) are unchanged.

## 9. Accessibility

- Every text/background pair is ≥4.5:1. The `impeccable detect` run on the mockup reports no contrast failures.
- Targets: 48px minimum (`--tap-min`), 56px for outcome buttons, 44px for compact secondaries (copy buttons, toast Undo, top-bar tools, snooze segments, sort, Shortcuts, sheet close).
- Tabs: `role=tab` with `aria-controls` pointing to a single `role=tabpanel` that's labelled by the active tab. Roving `tabindex` (active tab 0, others −1).
- Status is never shown by colour alone: consent uses an icon and words, and every outcome is announced in the toast text.
- The toast and batch line are `role="status"` live regions. The outcome bar is labelled "Log the outcome". Snooze is a labelled `role="group"`.
- `prefers-reduced-motion` drops transitions to 0 (already in tokens). Motion stays limited to 120–200ms colour fades.

## 10. Owner decisions (Oct 29, 2026)

1. **Primary outcome:** Called stays the primary button. Booked is secondary, Not interested is tertiary.
2. **Dismissal:** Called, Booked, Not interested, and any Snooze each dismiss the customer immediately and select the next one. Undo (U, 8s toast) brings them back.
3. **Consent:** staff cannot change consent on Outreach. No consent control on this page. Notice copy is fixed: "Call only. No text consent on file. Update it in the customer record if they agree."

Still open: whether the batch size stays at 25.

## 11. Follow-ups not in the mockup

- **"Put back" after the Undo window:** open "Worked recently" in place, with each customer's outcome, time, and a 44px Put back button that clears the outcome and returns them to the top of the list. Hill-climb round 10 tried this and reverted it. It tied on score, the outcome tags wrapped, and the detail pane kept showing a queue customer. Build it with non-wrapping tags, and select the worked customer in the detail pane.
- **Fonts:** serve WOFF2 with `font-display: swap` instead of OTF. No converter was available here.
