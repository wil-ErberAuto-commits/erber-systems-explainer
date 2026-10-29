# Caller HUD · Outreach page: design critique

⚠️ DEGRADED: single-context. The only source is the screenshot in the review request: its stated path (`erber-auto/design/2026-10-29-outreach-review/current.png`) is not on disk, and the Caller HUD source is not in this repo. I could not hand the screenshot to an isolated reviewer or run the markup detector on the current page. The detector ran on the proposed mockup instead (see the end of this file).

Measurements below come from a 1024px-wide downscale of the page, so sizes are estimates (±1–2px). Where a finding depends on an exact value (for example contrast), it says what to measure.

## Verdict

The owner is right. The page has every piece of data and every control the job needs, but it gives them all the same weight, packs them into a 380px column, and leaves the right 55% of the screen empty. The loudest thing on screen is a bold orange compliance warning, not the customer or the next action. A front-desk person working 25 calls between walk-ins has to read every row, find the controls on every row, and remember the shortcuts from a sentence. Nothing helps them go fast, and nothing catches a mis-click.

Specificity: almost none of it is specific to Erber Auto. Apart from the Caller HUD nav pill, it looks like a generic admin template. The brand shows up as a red badge on a backlog count, which is the wrong place for it.

## Nielsen heuristics (0–4)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | The batch line exists ("5 Due service in this batch of 25. 288 open in the full list.") but reads as a riddle. Clicking Called, Booked, or Not interested gives no visible confirmation. Every row says "Open", which tells you nothing. |
| 2 | Match with the real world | 2 | "An oil change due 2026-09-19." is an ISO date in the past, phrased as if it's still upcoming, with a stray article. Staff think "40 days overdue", not "due 2026-09-19". "Searches the local shop mirror" is system jargon. |
| 3 | User control and freedom | 1 | Outcome buttons are one click with no undo in view. Booked and Not interested sit side by side and look identical. |
| 4 | Consistency and standards | 2 | Uppercase eyebrow labels ("FIND A CUSTOMER", "RECENT CUSTOMERS · 9", "SNOOZE", "LAST 30 DAYS") sit next to sentence-case labels. Snooze is split between three preset buttons, a native date field, and a separate "Snooze until date" button that wraps to its own line. Red, orange, and navy are each used for emphasis with no rule behind them. |
| 5 | Error prevention | 2 | Withholding the text draft without consent is real prevention, and the page deserves credit for it. But the adjacent equal-weight outcome buttons invite mislogging, and the date field shows a blank mm/dd/yyyy with no sensible default. |
| 6 | Recognition rather than recall | 2 | Shortcuts are a paragraph to memorize ("Arrow keys move. C called, B booked, …"), not hints on the controls they trigger. The script you need on every call sits behind a collapsed disclosure. |
| 7 | Flexibility and efficiency | 3 | Real keyboard shortcuts and batching are the best things on the page. They're just undersold. |
| 8 | Aesthetic and minimalist design | 1 | Nine controls in a single action row. A "Due service" tag on every row of the Due service tab. "Phone" repeated on every recent-customer row. Half the screen blank while the useful content is collapsed. |
| 9 | Help users recover from errors | 1 | "Text draft withheld: no marketing consent" names the problem but not what to do instead (call) or how consent changes. There's no undo after a wrong outcome. |
| 10 | Help and documentation | 2 | The subtitle explains the page well ("Nothing on this page is sent to a customer"). That's the only help, and it's the right content in a weak position. |
| **Total** | | **18/40** | **Poor (12–19): major UX overhaul needed** |

## Cognitive load

5 of the 8 checklist items fail, so cognitive load is high:

- **Single focus fails:** the orange warning competes with the name and phone number.
- **Chunking and minimal choices fail:** the action row has 9 controls (Called, Booked, Not interested, the SNOOZE label, 1 day, 7 days, 30 days, the date field, and Snooze until date). That's more than twice the ≤4 rule.
- **Visual hierarchy fails:** name, phone, warning, and buttons all hit at roughly the same weight.
- **Progressive disclosure is inverted:** the script, needed on every call, is hidden. The rarely used custom date is always shown.
- **Working memory fails:** shortcuts must be recalled from a sentence.

## What's working

1. **Consent gating.** The page refuses to draft a text without marketing consent. Keep that behavior exactly; only its presentation is wrong.
2. **Keyboard-first and batched.** Arrow keys, single-letter outcomes, and batches of 25 are the right model for call-list work.
3. **"Nothing on this page is sent to a customer."** This honest, reassuring copy removes a real fear for new staff. Keep it and make it more prominent.

## Priority issues

There is no P0: staff can finish the task today. They're slow, and mistakes are easy.

### 1. [P1] No obvious next action; the action row is clutter

- **What:** Every row expands into 9 same-sized grey pill controls. Nothing is primary. Booked (the outcome the shop wants) and Not interested (the one that drops a customer) are neighbours with identical styling. "Snooze until date" wraps onto its own line. Targets are about 30–32px tall, under the 44–48px floor.
- **Why it matters:** each row costs a scan-and-aim. Over a 25-call batch, that adds up to minutes and a few mislogged customers. With no undo, a mislog is silent and permanent.
- **Fix:** use one primary button (Called, which is probably the most frequent outcome; confirm with call-log data), one secondary (Booked), and one quiet tertiary (Not interested), separated by space. Put Snooze in its own labelled segmented group with 1 day, 7 days, 30 days, and Pick a date (one control, which opens a calendar defaulting to +14 days). All targets ≥48px, with the primary at 56px. After every outcome, show a toast with Undo (U) for 8 seconds.

### 2. [P1] The consent warning is the loudest thing on the page and is framed as a failure

- **What:** "Text draft withheld: no marketing consent" is bold, about 20px, and orange, larger and louder than the customer's name. Orange text on white at this weight is very likely under 4.5:1. Sample the rendered colour; anything lighter than the token `--color-warning` `#8A5A00` fails.
- **Why it matters:** it reads like an error that blocks the row, when the actual instruction is simple: call, don't text. It also teaches staff to ignore orange, so a real warning later gets missed.
- **Fix:** in the list, show a small neutral "Call only" chip with a lock icon. In the detail panel, put the notice where the text draft would be, using `--color-warning-bg`, `--color-warning-border`, and `--color-warning-text` (`#4A3200`, about 11:1). Lead with the instruction, then the reason and where to fix it. Owner-approved copy: "Call only. No text consent on file. Update it in the customer record if they agree." There is no consent control on Outreach.

### 3. [P1] Half the screen is empty while the essentials are collapsed

- **What:** at desktop width, the content column covers about the left 45% of the main area. The right side is empty apart from the Chime and Alerts buttons. Meanwhile "Script and drafts" is collapsed on the selected row and every other row shows only two lines.
- **Why it matters:** staff click to reveal content they need every time, on a screen that has room to show it permanently.
- **Fix:** split into a list and a detail panel. The list (464px) is the queue. The detail panel (the rest of the width) shows the selected customer with the reason, phone, call script, text draft or consent notice, and a sticky outcome bar. Nothing needs expanding. Arrow keys move the selection, and the panel follows.

### 4. [P1] Rows don't answer "who first, and why"

- **What:** row text is "An oil change due 2026-09-19. · 2014 Ford Expedition". The ISO date is in the past but phrased as future, there's a stray article, and nothing says how overdue. The right edge repeats the tab name ("Due service") plus "Open" on every row. Body text renders at about 13px and metadata at about 11–12px, below the token floor of `--text-xs` 13px for metadata and `--text-sm` 15px for body.
- **Why it matters:** the one fact that sets call order (how overdue) has to be worked out in the head from a date. Repeated tags waste the most valuable spot in the row, the right edge.
- **Fix:** use name (17px semibold) on the left and "40 days over" on the right, with "Oil change · 2014 Ford Expedition" below in muted text. Sort by most overdue, labelled. Drop the per-row tab tag and "Open". Show the tag only in the All tab, where it does tell rows apart. In the detail panel, write "Oil change overdue by 40 days · It was due Sep 19, 2026."

### 5. [P2] Chrome noise: red in the wrong places, a pill tab bar, floating controls

- **What:**
  - The Outreach nav count is a red "984" badge, an alarm colour on a normal backlog, while Overview shows a grey "0".
  - The active top-nav item is a red-tinted pill.
  - A red "Open Caller HUD separately ↗" button floats bottom-right inside the Caller HUD itself.
  - Chime and Alerts float top-right with no visible on/off state.
  - The active tab is a solid navy pill, louder than the page title. Counts sit inside every tab at the same weight.
  - Shortcuts and batch status are two lines of 11px grey prose.
- **Why it matters:** when red means "backlog", "current page", and "pop out", it can't also mean "urgent", and in Caller HUD an incoming call is the urgent thing. Floating controls look like ads or leftovers.
- **Fix:**
  - Limit brand red `#EC3013` to the 3px underline on the active top-nav item. Use `#B3200C` only for small red text that carries real urgency.
  - Show counts in muted text.
  - Move Chime, Alerts, and Pop out into the top bar as labelled toggles ("Chime on").
  - Use underline tabs: a 3px navy bar on the active tab, muted counts.
  - Replace the batch prose with "5 left in this batch of 25 · 288 open in all" and a 4px progress bar.
  - Put shortcut keys on the buttons themselves.

### Also found (P2–P3)

- **[P2] Left rail:**
  - "FIND A CUSTOMER" and "RECENT CUSTOMERS · 9" are eyebrow labels. Use a real form label and a sentence-case heading.
  - "· Phone ·" on every recent row is noise, since every entry is a call.
  - "Incoming calls" with a green dot doesn't say whether it's listening or idle. Write "Listening for calls / No incoming call right now".
  - The search input is about 30px tall, below the 44px floor.
- **[P2] Missing states:** nothing on screen shows what happens after logging (does the row leave? does selection advance?), when a batch finishes, when a tab is empty, while the list loads, or when the mirror is stale or offline. "▸ LAST 30 DAYS" doesn't say last 30 days of what.
- **[P2] Phone number:** underlined navy at a weight that competes with the name. It's the most-used datum on the row, so give it its own spot (top-right of the detail panel, 24px, tap-to-call, and a Copy number button).
- **[P3] Numerals:** use tabular figures for phones, counts, and times so columns line up.
- **[P3] Native date field:** the unstyled native date field ("mm / dd / yyyy") breaks the visual language. Replace it with the Pick a date control.

## Persona red flags

**Alex, a front-desk power user working a 25-call batch:** the shortcuts exist, but nothing on screen confirms which key does what or that a key press landed. With no undo, one wrong B/N key silently mislogs a customer. Every row needs a click on "Script and drafts" before the call. No done state means they can't tell the batch is finished without counting.

**Sam, keyboard-only or low vision:**
- The orange warning text likely fails AA contrast.
- 11–13px metadata at muted grey is hard at arm's length.
- Pill buttons around 30px tall fail the 44px target floor.
- The consent state is shown by colour plus a sentence but has no icon, and the row status ("Open") carries no information for a screen reader.

**Jordan, a new or seasonal hire on the front desk:**
- "Batch of 25" versus "288 in the full list" needs explaining.
- "Snooze until date" next to a blank date field doesn't say which to use.
- "Text draft withheld" doesn't tell them they should still call.

## Impeccable craft floor (Operate mode) check

| Floor rule | Current page | Mockup |
|---|---|---|
| Glanceable: who, why, how urgent in one look | Fails: ISO past date, no overdue count | Name / "40 days over" / reason · vehicle |
| One obvious next action | Fails: 9 equal controls | Called is primary, Booked secondary, Not interested tertiary, Snooze grouped |
| No nested cards | Passes (rows are flat) | Passes: flat panes, one well for the script |
| No eyebrow labels | Fails: four uppercase kickers | None. Real labels and headings only |
| Text contrast ≥4.5:1 | Orange warning and 11px greys at risk | All text pairs from tokens, ≥4.5:1 (detector clean) |
| Targets 44–48px | Fails: about 30px pills and input | 48px floor, 56px for outcome buttons, 44px for small secondaries |
| Real states | Only the default is visible | Default, call-only, text allowed, dismissed + undo, empty, batch done. Loading and error are specified in `spec.md` |

## Detector results (run on the proposed mockup)

`impeccable detect` on `outreach-review/mockup.html` reports 0 contrast failures after one fix (keyboard hints on the ghost buttons were 3.7:1; they now use explicit token colours). Two warnings remain, both false positives:

- **"Tight line height 1.28x":** single-line headings using `--leading-tight` (1.2). They never wrap at 1440px.
- **"Cramped padding on `.seg`":** the segmented snooze control's buttons are meant to fill their outline edge to edge. Each button has its own 16px horizontal padding and a 48px height.

## Owner decisions (Oct 29, 2026)

- Called stays the primary button.
- Every outcome (Called, Booked, Not interested, any Snooze) dismisses the customer from the list right away and selects the next one. Undo (U, 8s) brings them back.
- Staff can't change consent on Outreach. The notice is read-only with the copy above.
