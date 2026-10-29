# Caller HUD · main page (office.erberauto.com/#callerhud): design critique

⚠️ DEGRADED: single-context. The only source is the screenshot in the request: its stated path (`erber-auto/design/2026-10-29-caller-hud-review/current.png`) is not on disk, and the Caller HUD source is not in this repo. I couldn't hand the screenshot to an isolated reviewer or run the detector on the live page. The detector and the contrast and tap checks run on the proposed mockup instead (see `hillclimb.tsv`).

The screenshot shows the call-ended state for a real staff member's own number, so this file quotes structure, not data. Sizes are estimates from a 1024px-wide capture (±1–2px).

## Verdict

This is the screen staff glance at with a phone to their ear, and it answers the three glance questions badly:

1. **Am I on a call right now?** The only call state is "Call ended · 0:05", in about 10px grey next to the name. A live call and a finished one look almost the same. Two floating pills, "Muted" and "Alerts off", sit at the top right. "Muted" in particular reads as "the call is muted" when it means the chime is off.
2. **Why are they calling?** The section is an uppercase eyebrow over "No reason on file". It's passive, there's no way to capture a reason, and the most important answer on the page is blank.
3. **Which vehicle, and what's due?** Two red chips, "1 overdue · Oil" and "No vehicle", contradict each other: something is overdue, on no vehicle. No vehicle is named anywhere on the page.

The actions are in the right place and well chosen: Create RO is primary and Follow up secondary. The rest of the page then spends its weight on a timeline that repeats "Inbound call · ended Phone system" four times in larger type than the customer's name meta.

## Nielsen heuristics (0–4)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 1 | Call state (live or ended, duration) is about 10px grey. No live indicator, no timer emphasis. "Muted" is ambiguous. |
| 2 | Match with the real world | 2 | "No vehicle" next to "1 overdue · Oil". "Add confirmed note" as a select label. "Phone system" as a note author. A red "$0" on a visit. |
| 3 | User control and freedom | 2 | Notes have no visible edit or undo. The name's ↗ link gives no hint where it goes. |
| 4 | Consistency and standards | 2 | Three emphasis systems: red-tint chips, a navy pill filter, a red-tint nav pill. Uppercase eyebrows ("WHY THEY'RE CALLING", "TIMELINE", "FIND A CUSTOMER") sit next to sentence case. Timeline rows (about 17px) are bigger than the section content they belong to. |
| 5 | Error prevention | 2 | Nothing prompts staff to fix the missing vehicle before Create RO. The note type ("Add confirmed note") is chosen from a select beside the input, so it's easy to file the wrong type. |
| 6 | Recognition rather than recall | 2 | Shop notes, tags and caller ID are hidden behind "▸ Details", which is exactly the context staff need mid-call. Visits and the overdue service aren't linked to a vehicle. |
| 7 | Flexibility and efficiency | 1 | No visible shortcuts for Create RO, Follow up or Add note. The note input is a second-class element in the middle of the card. |
| 8 | Aesthetic and minimalist design | 2 | Four near-identical call rows. The right half of the card is empty beside the name. Floating controls (Muted, Alerts off, "Open Caller HUD separately"). |
| 9 | Help users recover from errors | 1 | "No reason on file" and "No vehicle" state a problem with no next step. The disabled "Add note" is light grey on grey (likely under 4.5:1) and doesn't say why it's disabled. |
| 10 | Help and documentation | 1 | Nothing explains the note types, "suggestion history", or what the ↗ does. |
| **Total** | | **16/40** | **Poor (12–19): major UX overhaul needed** |

Cognitive load: 5 of the 8 checklist items fail (single focus, visual hierarchy, grouping, working memory, progressive disclosure), so load is high. The note row alone asks for three decisions at once: text, type and submit.

## What's working

1. **The right primary action.** Create RO is the one filled button, top right, where the eye ends. Keep it there.
2. **Overdue service shows next to the name.** "1 overdue · Oil" is exactly the conversation starter front desk needs. It just needs a vehicle and a number of days.
3. **One timeline with filters** (All, Visits, Declined, Calls & notes). That's the right model, and it's poorly weighted today.

## Priority issues

### 1. [P1] Call state isn't glanceable

- **What:** "Call ended · 0:05" is tiny grey text beside the name. There's no visual difference between ringing, live and ended. "Muted" and "Alerts off" float above the card as unlabeled pills.
- **Why it matters:** staff glance at this screen mid-conversation or between calls. If the HUD can't tell them in under a second whether the person on screen is the person on the line, they'll talk to the wrong record.
- **Fix:** a full-width call bar at the top of the page. It holds a state pill (green "Live call 2:14" with a dot, neutral "Call ended · 0:05 · 12:19 PM", warning "Unknown caller"), the caller's number at 20px, and the call actions. Rename the chime toggles to "Chime on/off" and "Alerts on/off" and move them into the top bar, as in the Outreach redesign.

### 2. [P1] "Why they're calling" is blank and can't be filled

- **What:** an eyebrow label over "No reason on file", with no input.
- **Why it matters:** the reason is the thing staff need to remember after hanging up, and the thing the next person needs to see. Today it lives in their head.
- **Fix:** an inline reason field ("What do they need?", Enter saves) as the first thing under the name. Offer one suggestion when the data supports it, for example "Overdue oil change" when an oil change is overdue. After saving, show the reason as plain text with Edit.

### 3. [P1] Vehicle and overdue status contradict each other and name nothing

- **What:** the red chips "1 overdue · Oil" and "No vehicle" appear side by side. No year, make or model is shown, and there's no mileage and no number of days overdue.
- **Why it matters:** "your oil change is overdue" is the upsell on every call, and staff can't say which vehicle it's for. Red on both chips also makes "No vehicle" look like an error the customer caused.
- **Fix:** add a Vehicle section: "2014 Ford Expedition · 112,480 mi at last visit" with a warning-toned "Oil change overdue by 40 days". When there's no vehicle, show "No vehicle on file" with an Add vehicle button, so the gap gets fixed before Create RO.

### 4. [P1] The timeline is loud where it should be quiet

- **What:**
  - Four "Inbound call · ended Phone system" rows at about 17px, larger than the meta line under the name.
  - A dangling "—" on the first row.
  - The single visit shows "$0" in red.
  - Note entry is a three-part row: an input, a select labelled "Add confirmed note", and a disabled grey button.
- **Why it matters:** the eye lands on call-log noise instead of the visit and notes. Repeated calls are also a signal (four calls in two weeks), and the page hides it by listing them.
- **Fix:**
  - Collapse runs of calls that have no notes into one line ("3 earlier calls, Oct 16–23 · no notes", with Show).
  - Show "4 calls in 14 days" as an info chip by the name.
  - Use body size for rows and muted text for dates. Show money in plain text ($0.00).
  - Make the composer a two-line textarea with a two-option segmented control ("Note" / "Confirmed with customer") and an enabled Add note button (N to focus, ⌘Enter to save).

### 5. [P2] Context is hidden, and the chrome repeats the Outreach problems

- **What:**
  - "▸ Details" hides shop notes, tags and caller ID.
  - Outreach shows a red "986" badge.
  - The active nav item is a red-tinted pill with a split caret.
  - "Open Caller HUD separately" floats bottom-right inside the Caller HUD.
  - The rail has no current location, so nothing is selected.
  - Eyebrow labels throughout.
- **Fix:**
  - Show shop notes, tags and caller ID by default in the customer column. Only "Suggestion history" stays collapsed.
  - Reuse the Outreach shell: a navy-dark top bar with a red underline on the active app, muted counts, Chime / Alerts / Pop out in the top bar, and a selected "Current caller" rail item.

### Also found (P2–P3)

- **[P2] Disabled "Add note":** light grey on grey, likely under 4.5:1. The button also gives no reason for being disabled.
- **[P2] Name link:** "↗" next to the name gives no hint where it goes. Label it "Customer record".
- **[P2] Undersized targets:** the timeline filter pills are about 28px tall and the search input about 30px.
- **[P3] Visit count:** "customer since 2024 · 7 visits" while the timeline shows one visit. Either the filter or the count is wrong. Say "7 visits (1 shown)" or show them all.
- **[P3] Empty space:** the right half of the card header (beside the name) is unused. In the mockup, the call bar takes the actions and the customer column holds identity.

## Persona red flags

**Front-desk staffer mid-call (power user):** they can't tell at a glance whether the call is still live. There are no shortcuts to start an RO or a note, and the note needs a mouse trip to a select. Reason and vehicle can't be captured without leaving the page.

**Sam (keyboard or low vision):** status is shown in about 10px grey text, the disabled button has low contrast, the filter pills are under 44px, and "Muted" carries ambiguous meaning.

**Jordan (new hire):** "Add confirmed note", "Phone system", "suggestion history" and the "No vehicle" + "1 overdue" pair all need explaining.

## Craft floor (Operate mode)

| Rule | Current | Mockup |
|---|---|---|
| Glanceable call state, caller, reason, vehicle | Fails on all four | Call bar + name + reason + vehicle above the fold |
| One obvious next action | Passes (Create RO) | Kept: Create RO primary in the call bar |
| No nested cards | The page is a card on grey with nested chip clusters | Flat columns, hairline dividers |
| No eyebrow labels | Fails (four) | None |
| Contrast ≥4.5:1 | Disabled button, grey status text at risk | Measured: 0 fails (tools/score.sh) |
| 44–48px targets | Filter pills and search fail | Measured: 0 fails |
| Real states | Only call-ended is shown | Live, ended, unknown caller, empty timeline, responsive 1280 |
