# Caller HUD main page redesign: build spec

Reference: `mockup.html` + `hud.css` on top of the shared shell `app.css` (open in Chrome at 1440×900). States: `?state=live` (default), `?state=ended`, `?state=unknown`, `?state=empty`, `?state=shortcuts`. All colours, sizes and spacing come from `tokens.css` (the same tokens as the Outreach redesign) unless this spec names a local value. All customer data in the mockup is fake (Sample Customer A/B, 555 numbers).

This is a design proposal only. Nothing here is implemented in the real Caller HUD.

| Screenshot | Shows |
|---|---|
| `mockup-1440.png` | Live call with a matched customer: call bar, identity, reason field with a suggestion, vehicle + overdue, shop notes, timeline |
| `state-ended.png` | Call ended: neutral call-state pill, rail says "Listening for calls", saved reason with Edit, today's call at the top of the timeline |
| `state-unknown.png` | No match: "Unknown caller", Create customer / Link to a customer actions, link search, calls from this number only |
| `state-empty-timeline.png` | New customer with no vehicle and no history: Add vehicle prompt, empty timeline |
| `state-shortcuts.png` | Keyboard shortcut sheet open |
| `responsive-1280.png`, `responsive-900.png`, `responsive-390.png` | Breakpoint checks (live state) |

## 1. Layout (1440×900 desktop)

```
┌──────────────────────── Top bar 56px · navy-dark (same as Outreach) ────────┐
├──────────┬──────────────────────────────────────────────────────────────────┤
│ Rail     │ Call bar (white, 1px bottom border)                              │
│ 280px    │  [● Live call 2:14] (208) 555-0142     [Create RO R][Follow up F]│
│ bg       │                     Caller ID line      [Add note N][?]          │
│          ├────────────────────────┬─────────────────────────────────────────┤
│          │ Customer 520px (white) │ Timeline: fills the rest (white)        │
│          │  name / meta / chips   │  composer (textarea, type, Save note)   │
│          │  Why they're calling   │  tabs (All, Visits, Declined, Calls…)   │
│          │  Vehicle + overdue     │  events (scroll)                        │
│          │  Shop notes            │                                         │
└──────────┴────────────────────────┴─────────────────────────────────────────┘
```

- **App grid:** same as Outreach, `var(--rail-w) minmax(0, 1fr)`, height `100vh − 56px`. The page never scrolls. The customer and timeline columns scroll independently.
- **Call bar:** always visible at the top of the main area. It answers "who is on the line and what can I do" at a glance: state pill, number, caller ID, and the actions. It never scrolls away.
- **HUD grid:** `var(--cust-w) minmax(0, 1fr)` with `--cust-w: 520px`. At 1440 the timeline is about 640px wide.
- **No cards.** The columns are flat white panes split by 1px `--color-border`. Blocks inside the customer column are separated by a hairline (`--color-disabled-bg`), not boxed.
- **≤1365px:** rail 248px, customer column 440px. Top-bar tools go icon-only (44×44, label kept as the accessible name). The call bar tightens (gaps 8px, ghost padding 12px, 48px "?" button) so it stays on one row at 1280. Recent-customer names ellipsize.
- **≤1023px:** the rail becomes a top strip (live status, search, nav). Recent customers are hidden. Customer column 360px. The call actions take their own full-width row with Create RO stretched. Timeline tabs scroll sideways.
- **≤767px:** single column. The call bar is sticky at the top. Call actions are pinned to the bottom of the screen (Create RO, Follow up, icon-only Add note; key chips hidden). The customer column comes first, then the timeline.
- **Known rough edges:** at 900px the page is tall (customer column then timeline, side by side but narrow). On a phone the timeline tabs scroll sideways and the top bar shows icons only.

## 2. Type (General Sans, fixed px scale from tokens)

| Role | Size / weight | Colour | Notes |
|---|---|---|---|
| Customer name (h1) | `--text-2xl` 30 / 600 | `--color-navy-dark` | tracking −0.015em, leading tight. The biggest text on the page |
| Caller number in the call bar | `--text-lg` 20 / 600 | text | tabular numbers |
| Call-state pill | `--text-sm` 15 / 600 | success or muted | 40px tall pill |
| Section headings ("Why they're calling", "Vehicle", "Shop notes") | `--text-base` 17 / 600 | text | sentence case |
| Timeline heading | `--text-lg` 20 / 600 | text | |
| Reason text, vehicle name | `--text-base` 17 / 400 and 600 | text | |
| Body, meta, timeline titles | `--text-sm` 15 / 400–600 | text or muted | |
| Dates, chips, caller ID, hints, kbd | `--text-xs` 13 / 500 | `--color-text-muted` | 13px is the floor |

- Weights are 400, 500 and 600 only. The Bold 700 file was never shipped, so its `@font-face` is removed from this folder's `tokens.css` (round 10). The same fix should go into the Outreach tokens.
- Fonts use `font-display: swap`, and Regular + Semibold are preloaded.
- No uppercase eyebrows anywhere. The current page has four.

## 3. Colour rules

| Use | Token | Where |
|---|---|---|
| Primary action | `--color-navy` #0F2F66 fill | Create RO (or Create customer for an unknown caller). One filled button per screen |
| Top bar, customer name | `--color-navy-dark` #050D57 | |
| Brand red #EC3013 | `--color-red` | Only the 3px underline on the active top-nav item ("Caller HUD"). Never chips, counts or text |
| Live call | `--color-success` on `--color-success-bg` | Pill + dot with a soft ring. The only green on the page |
| Call ended | `--color-text-muted` on `--color-disabled-bg` | Neutral, so live vs ended is obvious from colour alone and from the words |
| Overdue service | `--color-warning-bg` / `--color-warning-text` | The vehicle chip "Oil change 40 days overdue". Warning, not red: it's an opportunity, not an error |
| Declined work | `--color-warning-text` title | Timeline row |
| Info chip ("4 calls in 14 days") | `--color-info-bg` / `--color-navy` | |
| Money | text colour, two decimals | "$0.00" is not red |
| Focus | 3px `--color-focus` outline | Every control |

Counts (rail nav, timeline tabs) are muted text, never coloured badges. This matches Outreach.

## 4. Spacing

4px base, from tokens. Every gap in `hud.css` uses a `--space-*` token (round 2).

- **Call bar:** padding 16/32. State pill, then 20px, then number + caller ID. Actions are 12px apart.
- **Columns:** padding 24/32/32 (24 at ≤1365).
- **Customer header:** stacks name, meta (4px), chips (12px), Customer record button (12px). Stacking keeps the name and meta on one line each at 1440 (round 3).
- **Blocks:** 24px above, 20px padding under the hairline, heading then 12px to content.
- **Timeline:** composer, then 8px to the type/save row, 20px to the tabs, 8px to the events. Event rows are 12px top and bottom with a hairline. Grid `88px | 1fr | auto` (date, content, action).

## 5. Components

### Call bar

- **State pill**, `role="status"`:
  - Live: green dot + "Live call 2:14". The timer ticks every second.
  - Ended: phone-off icon + "Call ended · 0:05 · 12:19 PM". It stays until the next call rings.
- **Number** (20px) with a caller ID line under it: "Caller ID: SAMPLE CUST A · Mobile". For an unknown caller: "Caller ID: WIRELESS CALLER · No match in the shop mirror".
- **Actions:** Create RO (primary, R), Follow up (secondary, F), Add note (ghost, N, jumps to the composer), then a "?" button that opens the shortcut sheet. All are 56px tall at 1440.
- **Unknown caller actions:** Create customer (primary), Link to a customer (secondary), Add note (ghost, N). There is no Create RO until the number belongs to a customer.

### Customer column

- **Header:** name, a meta line ("Customer since 2024 · 7 visits · Last visit Sep 22, 2026"), a "4 calls in 14 days" info chip when there were 3+ calls in 14 days, and a Customer record button (opens the record; replaces the bare ↗).
- **Why they're calling:**
  - Live: an input "What do they need? Enter saves". Under it, at most one suggestion from the record ("Suggested from their record: Overdue oil change"). Clicking the suggestion fills the field and saves.
  - After saving, and on call ended: the reason as plain text with an Edit button.
- **Vehicle:**
  - The vehicle name ("2014 Ford Expedition"), then meta ("112,480 mi at last visit · Silver · Oil was due Sep 19"), then a warning chip "Oil change 40 days overdue".
  - With no vehicle: "No vehicle on file / Add one before you create an RO." plus an Add vehicle button.
  - Several vehicles: list each with its own due chip, overdue first (not in the mockup).
- **Link to an existing customer** (unknown caller only): a search field "Name, RO #, or another phone", with a hint pointing at Create customer.
- **Shop notes:** shown by default with tags (they were hidden behind "▸ Details"). "Suggestion history" stays collapsed.

### Timeline column

- **Composer at the top:**
  - A 2-line textarea.
  - A segmented radio "Note / Confirmed with customer", which replaces the "Add confirmed note" select.
  - A Save note button (⌘↵). Save note is always enabled; an empty note shows an inline "Type a note first" instead of a disabled grey button.
  - The call-bar button is "Add note" (it jumps here); the composer button is "Save note" (round 8).
- **Tabs:** All / Visits / Declined / Calls & notes, with muted counts. This is the same tab component as Outreach (`role=tablist`, arrow keys move).
- **Events:** newest first.
  - Runs of 2+ calls with no notes collapse into one row ("3 inbound calls · no notes", with Show).
  - Notes show the author.
  - Visits show the RO number and the work, with plain money.
  - Declined work has a warning-toned title.
- **Empty:** "No history yet / Notes you add here and ROs for this customer will show up in this timeline. This call is logged when it ends."
- **Unknown caller:** only calls from this number, with the footnote "Only calls from this number show until it's linked to a customer."

### Left rail (shared with Outreach)

- **Live block:** "On a call · Sample Customer A · 2:14", or "Listening for calls · Last call ended 12:19 PM".
- **Find a customer:** the search placeholder is "Name, phone, RO", short enough to fit at 248px.
- **Nav:** Current caller (selected), Overview, Outreach, each with a muted count.
- **Recent customers:** name, number and time.

### Shortcut sheet

The same popover as Outreach, anchored under the call bar on the right. It lists R, F, N, ⌘↵, ↵ and ?, with the footnote "Shortcuts work whenever you're not typing in a field. Esc leaves a field."

## 6. Behaviour

- **Ring/answer:** the HUD switches to the caller and the state pill turns live. Focus does not move into a field, so single-key shortcuts work right away.
- **Hang up:** the pill turns neutral with the duration and the time. The page stays on this caller until the next call or until staff pick someone else. The call is added to the top of the timeline.
- **Keyboard (proposals):**
  - R creates an RO, F schedules a follow up, N focuses the composer.
  - ⌘↵ (Ctrl+Enter on Windows) saves the note, ↵ saves the reason, ? toggles the sheet.
  - Single keys work only when focus is not in a text field. Esc leaves a field.
- **Create RO with no vehicle:** allowed, but the RO form opens on the vehicle step. The Vehicle block's Add vehicle prompt is there to fix it earlier.
- **Unknown caller:** Link to a customer focuses the link search. Choosing a match turns the page into the live state for that customer, and the call is attached.
- **Missed incoming call while on a call:** out of scope for the mockup. Use `--color-red-text` here only, since it's real urgency.

## 7. States checklist

| State | Mockup | Notes |
|---|---|---|
| Live call, matched customer | yes | default |
| Call ended | yes | reason saved, today's call in the timeline |
| Unknown caller / no match | yes | Create customer / Link |
| Empty timeline + no vehicle | yes | new customer |
| Shortcut sheet | yes | |
| Ringing (before answer) | no | Proposal: the pill says "Ringing" in info colours; same layout |
| Several vehicles | no | see Components |
| Multiple matches for one number | no | Proposal: a "2 customers use this number" chip with a chooser in place of the name |
| Loading / mirror offline | no | Proposal: keep the call bar; show "Shop mirror offline, showing cached record from 12:02 PM" under the name |

## 8. Copy changes

| Current | Proposed |
|---|---|
| "Call ended · 0:05" (tiny grey) | "Call ended · 0:05 · 12:19 PM" pill |
| "Muted" / "Alerts off" pills | "Chime off" / "Alerts off" in the top bar |
| WHY THEY'RE CALLING / No reason on file | Why they're calling + "What do they need? Enter saves" |
| "1 overdue · Oil" + "No vehicle" | "2014 Ford Expedition" + "Oil change 40 days overdue", or "No vehicle on file" + Add vehicle |
| "Add confirmed note" select | Note / Confirmed with customer |
| Disabled "Add note" | Save note (⌘↵), always enabled |
| "Inbound call · ended Phone system" ×4 | "3 inbound calls · no notes" (Show) and a "4 calls in 14 days" chip |
| "$0" in red | "$0.00 (free with last oil change)" |
| ↗ by the name | Customer record |
| ▸ Details | Shop notes shown; "Suggestion history" collapsed |
| "Open Caller HUD separately" (floating) | Pop out, in the top bar |
| TIMELINE / FIND A CUSTOMER eyebrows | Timeline / Find a customer (sentence case) |

## 9. Accessibility

- Contrast is ≥4.5:1 everywhere and targets are ≥44px; both are measured in all four states by `tools/score.sh` (0 fails).
- The call-state pill is `role="status"`, so screen readers hear "Call ended" without moving focus. The timer must not announce every second; only the state change is announced.
- Shortcut buttons carry `aria-keyshortcuts`; the visible key chips are `aria-hidden`.
- The timeline filter is a real tablist with a tabpanel and roving tabindex. The note type is a radiogroup.
- The grouped-calls Show button has `aria-expanded` and the label "Show 3 inbound calls".
- Live vs ended is carried by the words as well as the colour.

## 10. Open decisions for the owner

1. **The suggested reason:** is one suggestion from the record (overdue service, open declined work) welcome, or should the field start blank?
2. **Shortcut keys:** R / F / N, plus ⌘↵ for Save note. These need checking against any shortcuts the office already uses.
3. **The "Current caller" rail item:** keep it as its own view, or fold it into Overview.
4. **Grouping calls:** collapse runs of 2+ calls with no notes, or only 3+.
5. **The tokens fix:** apply `font-display: swap` and drop the missing Bold face in the Outreach tokens too.

## 11. Hill climb

`hillclimb.tsv` logs the 10 rounds. The mockup scored 39 at baseline and 47 at the end. The score is Nielsen /40 + audit /20 − detector findings − contrast fails − tap fails. The current production page scores 16/40 on Nielsen alone (`critique.md`).
