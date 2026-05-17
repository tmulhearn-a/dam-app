---
name: dam
description: >
  Full product context for DAM (Daily Anchor Method) — an ADHD daily scheduling
  app. Use this skill whenever the user mentions DAM, the DAM app, PRD updates,
  feature discussions, Claude Code prompts for DAM, home screen changes, task
  flow changes, routines, Mad Dash, Dopamine Menu, derail tracking, wind-down,
  or anything related to building or designing the DAM app. Load this skill at
  the start of every DAM-related session to get full product context without
  re-explaining from scratch.
---

# DAM — Daily Anchor Method
**Tagline:** Calm the chaos.
**Type:** ADHD daily scheduling app
**Brand color:** #1A56A5 (blue)
**Platform:** React PWA (current build) → native iOS via Xcode handoff

---

## Process Rules

1. **Before updating PRD docs**, always ask: "Ready to update the docs, or do you want to keep going on this?" Never commit to docs before a topic is fully flushed out.
2. **Claude Code prompts** should be targeted and surgical — never rebuild from scratch, always update existing code only, always push to GitHub and update BUILD_LOG.md.
3. **PRD files** live at: `DAM_PRD_v1.md`, `DAM_PRD_v1.docx`, `DAM_PRD_v2.md`, `DAM_PRD_v2.docx`. Markdown files are for Claude Code. Docx files are for sharing.
4. **BUILD_LOG.md** lives in the GitHub repo and tracks every decision for Xcode handoff.

---

## AI Assistant

User picks one name during onboarding:
- **Scout** — curious, reliable, always looking ahead
- **Sunny** — warm, encouraging, never judging
- **Sparky** — energetic, playful, hype friend

All three share one personality in v1 — warm, funny, shame-free. Distinct voices per name is a v2 feature.

---

## Home Screen Hierarchy (top to bottom)

| Position | Section | Color | Hex |
|---|---|---|---|
| 1 | I'm Doing This Now | Blue | #1A56A5 |
| 2 | Next Two Actions | Blue | #1A56A5 |
| 3 | Running in Background | Purple | #7C3AED |
| 4 | Quick Wins | Green | #059669 |
| 5 | On Track | Teal | #0891B2 |
| 6 | Behind On | Amber | #D97706 |
| 7 | Completed Today | Slate | #64748B |

### I'm Doing This Now Rules
- One active task with a live timer
- Tapping "I'm doing this now" on a new task boots the current one to Next Two Actions
- If booted task is a background task → goes to Running in Background instead
- If Next Two Actions is full → prompt: "Which two do you want to keep?" (3 cards, pick 2, third drops to backlog)
- Once a task has been in I'm Doing This Now it never drops further back than Next Two Actions

---

## Task Priority Labels (parent tasks only)

| Label | Eisenhower | Meaning |
|---|---|---|
| On Fire | Urgent + Important | Do right now |
| Big Rock | Not Urgent + Important | Schedule it |
| Easy Ball | Urgent + Not Important | Quick do or delegate |
| Back Burner | Neither | Park it |

Subtasks do NOT get priority labels — they are checklists only.

---

## Task Categories

Default: Household Chores, Work, Personal Projects, Events
User can add custom categories with a name and color picker.
Categories shown on task cards and used to filter the backlog.

---

## Add Task Flow (full screen structure)

**Always visible:**
1. Category selector
2. Routine selector (searchable dropdown + "Add New Routine")
3. What needs doing? (text field)
4. Priority cards (On Fire, Big Rock, Easy Ball, Back Burner)
5. Add Task button

**Collapsible — What kind of task?**
- Is this a parent task? toggle → opens subtask builder inline
- Is this a background task? toggle → opens timer/chain builder inline

**Collapsible — Timing**
- Time estimate (optional)
- Hard deadline (date picker)
- Soft deadline (date picker)
- Repeat (none / daily / weekly)

**Collapsible — Notes**
- Free text notes
- Prep note

---

## Subtask Builder

Expands inline when parent task toggle is on.

Each subtask has:
- Name (text or voice)
- Consecutive / Parallel toggle (default: consecutive)
- Background task toggle → opens timer field
- Time estimate
- Skip button (destination of skipped subtasks TBD v1.3)

Drag to reorder. Parent marks complete only when all subtasks done or skipped.

**Consecutive:** Next subtask only surfaces when previous is done.
**Parallel:** All surface as checklist inside parent card. Tap any to promote to Next Two Actions.

---

## Background Tasks

- Timer field: how long is the cycle?
- Auto-nudge when timer ends: "[Task] is done — ready for the next step?"
- Manual "Done" button to advance early
- Lives in purple Running in Background section with countdown
- When active step requires user action → can promote to Next Two Actions

### Pre-loaded chains
- Laundry: Start washer → Move to dryer → Fold → Put away
- Dishwasher: Run cycle → Hand wash remaining → Put away
- Charging: Plug in → Unplug when full

---

## Routines (first-class feature)

- Usable in: Add Task, Mad Dash, background tasks, night-before planning
- Add New and Edit Routine use the same window
- Routine changes apply to future instances only — active instances never disrupted

**Routine instances (v1):** Simple dependency linking. When starting a new instance DAM asks "Is this waiting on another instance to finish first?" At flexible steps: "Do this now or batch with other loads?"

**Routine instances (v2):** Full multi-instance orchestration — DAM maps all cross-instance dependencies automatically like a project timeline.

### Pre-loaded default routines
- Morning routine (Personal)
- Laundry (Household)
- Dishwasher (Household)
- Email triage (Work)
- Quick bedroom clean (Household)
- End of day work wrap (Work)

---

## Mad Dash Mode

Sprint for avoided tasks.

1. User sets time (e.g. 20 min)
2. Selects avoided tasks
3. AI pushes back on estimates: "That usually takes 45 min — but let's just do 20 min of it right now."
4. Parent tasks break into subtasks (AI suggests, user confirms, saved as personal routine)
5. Each subtask: regal trumpet + medium confetti + vibration
6. End of sprint: full confetti explosion + regal trumpet
7. Incomplete tasks roll silently to backlog — no shame

---

## Dopamine Menu

Five categories: Appetizers (under 10 min), Entrees (30+ min), Sides (add-ons), Desserts (mindfully), Specials (occasional).

**Roll mechanic:** Pick category → Roll (up to 3 times, then locks in) → Timer added to selection.

**AI recommendation:** When 2+ tasks in backlog and user is stuck → recommends category based on available time.

Each item has optional prep note. All items editable/deletable. Custom items can be added anytime.

---

## Sound Hierarchy

| Event | Default | Alternatives (buried in Fun Settings) |
|---|---|---|
| Mad Dash task complete | Regal trumpet | — |
| Derail button tap | Train horn | Referee whistle, foghorn, thunder |
| Regular task complete | Game sound effect | Simple chime |
| Mad Dash complete | Regal trumpet + full confetti | — |

Sound customization lives in Fun Settings subsection — intentionally buried to reduce fiddling.

---

## Confetti Hierarchy

- Single task complete → light confetti
- Mad Dash subtask complete → medium confetti + regal trumpet
- Mad Dash complete → full confetti explosion + regal trumpet

---

## Derail Tracking

- Persistent floating button on all screens
- Tap → train horn sounds → 15-sec voice note prompt
- AI categorizes derail type (boredom, anxiety, fatigue, hyperfocus, external interruption)
- AI offers: (A) controlled landing — 5 more min then redirect, or (B) Dopamine Menu Appetizer
- Derail animation (brief train going off the rails) → v2
- Weekly analytics only (not daily)

---

## Fire Scale (AI assessment, conversational only in v1)

| Level | Meaning |
|---|---|
| Earth is Burning | Everything overwhelmed |
| Wildfire | Multiple urgent tasks spreading |
| House Fire | One major urgent situation |
| Dumpster Fire | Messy but contained |
| Bonfire | Intentional productive burn |
| Fireplace | Steady, under control |
| Candle | Calm, focused |
| Birthday Candle | Light load, almost done |
| Matchstick | Fresh start |

Visual fire scale indicator on home screen → v2.

---

## Mantra Library

30 pre-loaded mantras. User can add their own. Active reframe option — user taps "Reframe this" and AI rewrites the negative thought compassionately. Mantras surface randomly in reminders and on-demand from side menu.

---

## Wind-Down Routine

Starts 90 min before target bedtime. Separate weekday and Friday/Saturday bedtime settings.

| Time | Action |
|---|---|
| T−90 min | First gentle notification |
| T−60 min | Night-before planning voice memo |
| T−45 min | Mantra of the night |
| T−30 min | End-of-day review + Win Summary |
| T−15 min | App shifts to cooler deeper blue tones |
| T−0 min | Sleep mode — no notifications until morning |

Win Summary celebrates completions only. Incomplete tasks roll silently to tomorrow.

---

## Onboarding Sequence

1. Welcome + choose assistant name (Scout / Sunny / Sparky)
2. Bedtime (required) — weekday + Friday/Saturday pickers
3. Clock offset (optional) — 0 to 60 min, shown with ★ indicator
4. Dopamine Menu (skippable — defaults pre-loaded, or customize from preset picker)
5. First plan (optional) — framed as "Build your first plan"
6. Notifications — asked last, after user understands the value
7. Home screen (empty state if no tasks)

---

## TBD in v1.3

- Skipped subtask destination (backlog or dismissed)
- On Track section criteria
- Quick Wins time threshold
- Routine window full field spec (informed by PWA build)
- Task detail view
- Voice vs text differences in Add Task flow

---

## v2 Feature List

- Android app
- Distinct AI voices per assistant name
- Full Eisenhower Matrix visual UI
- Task categories and projects with full grouping
- Completed tasks calendar view
- Parking Lot Party (Mad Dash for all Back Burner tasks)
- Spitfire / Chaos Capture mode (rapid triage of inbox avalanche)
- Attainable cleaning schedule (anchor to user's 6-song playlist)
- Proactive AI routine nudges ("it's the 1st, ready for your bills sprint?")
- Red hue overlay during active Mad Dash
- Derail train animation
- Full multi-instance routine orchestration
- Fire scale visual indicator on home screen
- Apple Calendar read integration
- Offline mode
- Ignoring wind-down behavior logic
- Enhanced wind-down visual (more dramatic blue shift, user-configurable)
- Shorter express wind-down option (15 min)

---

## Claude Code Prompt Template

Use this template when handing changes to Claude Code:

```
I need to make targeted changes to the DAM app based on my updated PRD.
Do not rebuild from scratch — update the existing code only.
Push changes to GitHub and update BUILD_LOG.md with what changed and why.

Here are the specific changes:
[list numbered changes with bullet point details]

Important notes:
- Keep all existing functionality not mentioned above
- Update localStorage data model as needed
- Update BUILD_LOG.md with every decision made
```
