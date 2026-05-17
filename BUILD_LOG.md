# DAM — Build Log & Xcode Handoff Document

**App:** DAM (Daily Anchor Method)  
**PWA Build Date:** May 2026  
**Stack:** React 18 + Vite + React Router v6  
**Target:** iOS native (SwiftUI) — Xcode handoff planned for following weekend  
**PRD Version:** v1.0 (May 15, 2026)

---

## 1. Scope Decisions

### What was built in this PWA (v1 scope, 4 screens)
| Screen | Route | Notes |
|---|---|---|
| Home | `#/` | Two Next Actions, Behind On Tasks (collapsed), empty state |
| Add Task | `#/add` | Text input, optional duration, four priority labels |
| Dopamine Menu | `#/dopamine` | Five category tabs, Roll mechanic, 3 re-rolls max |
| Derail Modal | Overlay (no route) | Bottom sheet, 6 categories, confirmed response, logged to localStorage |

### What was explicitly excluded (per PRD §17)
- Side menu / full navigation drawer (navigating back uses `←` header button in this PWA)
- Mad Dash mode
- Mantra Library
- Daily Log / voice journaling
- Wind-down routine
- Derail train animation (deferred to v2 per PRD)
- AI-driven task prioritization (simulated: sort by priority label → creation time)
- Voice input (text-only in PWA; Apple Speech framework in Xcode)
- Completed Tasks screen
- Repeating tasks
- Hard/soft deadlines
- Fire Scale visual (conversational only in v1 per PRD)

---

## 2. Architecture Decisions

### Routing: HashRouter
- **Why:** PWA served as static files. HashRouter (`#/path`) requires zero server config. BrowserRouter would 404 on direct-to-path loads without a server rewrite rule.
- **Xcode note:** Replace with SwiftUI `NavigationStack`. Routes map directly to Views.

### Data: localStorage via `useLocalStorage` hook
- **Why:** PRD §16.3 — all data stored locally by default. No backend in v1.
- **Keys used:** `dam_tasks` (array of Task), `dam_derails` (array of DerailEntry)
- **Xcode note:** Replace with SwiftData (iOS 17+) or Core Data. Schema is identical — see §3 below.

### State management: React `useState` + `useCallback` in `App.jsx`
- **Why:** Tasks and derails are app-level state shared across screens. No Redux/Zustand needed at this scale.
- **Xcode note:** Use `@EnvironmentObject` or `@Observable` (Swift 5.9+) for the equivalent.

### Styling: Plain CSS with custom properties
- **Why:** Zero dependency, maps directly to SwiftUI design tokens. Every `var(--brand)` maps to a Swift `Color` constant.
- **No Tailwind / no CSS-in-JS** — intentional for Xcode readability.

### Floating buttons: Fixed-position, bottom-right
- **Why:** PRD §2.1 — always visible on all screens. Three FABs stacked vertically.
- **Xcode note:** Use a ZStack overlay on the root ContentView so FABs persist across NavigationStack pushes.

---

## 3. Data Schemas

### Task
```typescript
{
  id: string          // "t_<timestamp>"
  text: string        // User-entered task description
  priority: string    // "On Fire" | "Big Rock" | "Easy Ball" | "Back Burner"
  duration: number | null  // Minutes, user-entered (optional)
  completed: boolean
  createdAt: number   // Unix timestamp ms
  completedAt: number | null
}
```

### DerailEntry
```typescript
{
  id: string          // "d_<timestamp>"
  category: string    // "boredom" | "anxiety" | "hyperfocus" | "fatigue" | "external" | "other"
  timestamp: number   // Unix timestamp ms
}
```

---

## 4. Design Tokens → Swift Color Constants

All design decisions use CSS custom properties defined in `src/index.css`. Direct mapping for Xcode:

| Token | Hex | Swift Name |
|---|---|---|
| `--brand` | `#1A56A5` | `Color.damBlue` |
| `--brand-dark` | `#1244a0` | `Color.damBlueDark` |
| `--brand-light` | `#e8f0fb` | `Color.damBlueLight` |
| `--on-fire` | `#EF4444` | `Color.priorityOnFire` |
| `--big-rock` | `#6366F1` | `Color.priorityBigRock` |
| `--easy-ball` | `#10B981` | `Color.priorityEasyBall` |
| `--back-burner` | `#9CA3AF` | `Color.priorityBackBurner` |
| `--amber` | `#F59E0B` | `Color.amberBehind` |
| `--bg` | `#F8FAFF` | `Color.appBackground` |
| `--surface` | `#FFFFFF` | `Color.surface` |
| `--text-primary` | `#1F2937` | `Color.textPrimary` |
| `--text-secondary` | `#6B7280` | `Color.textSecondary` |
| `--text-muted` | `#9CA3AF` | `Color.textMuted` |

---

## 5. Component → SwiftUI View Mapping

| React Component | SwiftUI Equivalent | Notes |
|---|---|---|
| `Home.jsx` | `HomeView.swift` | |
| `AddTask.jsx` | `AddTaskView.swift` | |
| `DopamineMenu.jsx` | `DopamineMenuView.swift` | |
| `DerailModal.jsx` | `.sheet()` modifier on root | Bottom sheet — use `.presentationDetents([.medium, .large])` |
| `FloatingButtons.jsx` | `FloatingButtonsView.swift` in a `ZStack` | |
| `TaskCard.jsx` | `TaskCardView.swift` | |
| `.priority-badge` | `PriorityBadge.swift` | Reusable tag component |
| `Confetti` (in TaskCard) | [`ConfettiSwiftUI`](https://github.com/simibac/ConfettiSwiftUI) or custom `TimelineView` | |

---

## 6. Screen-by-Screen Notes for Xcode

### 6.1 Home Screen
- **Two Next Actions logic:** Sort incomplete tasks by `PRIORITY_ORDER` (On Fire=0, Big Rock=1, Easy Ball=2, Back Burner=3), then `createdAt` ascending. Take first 2.
- **Behind On Tasks:** The remainder (index 2+). Amber styling. Collapsed by default (`@State var behindExpanded = false`).
- **Empty state:** Shown when `tasks.filter { !$0.completed }.isEmpty`. Ghost card is a placeholder with opacity 0.45.
- **Confetti:** Triggered by `celebrateId` state in parent. 1.8s duration then cleared. CSS `confetti-fall` keyframe → use `withAnimation` + `TimelineView` in SwiftUI.
- **"I'm doing this now" button:** Sets local `doing` state — no backend event in v1. In Xcode, add a `startedAt` timestamp to the Task model for v2 timer tracking.

### 6.2 Add Task Screen
- **Validation:** Text must be non-empty AND a priority must be selected before submit button is active.
- **Priority grid:** 2×2 CSS grid. In SwiftUI: `LazyVGrid(columns: [GridItem(), GridItem()])`.
- **Duration field:** Optional. Stored as `Int?` minutes. Shows "~X min" in TaskCard.
- **Navigation:** On submit, calls `onAdd()` then navigates to `/`. In SwiftUI: `dismiss()` environment action.

### 6.3 Dopamine Menu Screen
- **Pre-loaded items:** Defined in `src/data/dopamineItems.js`. Copy the arrays verbatim into a Swift `DopamineItems.swift` constant file or a bundled JSON.
- **Roll mechanic:** `Math.random()` pick. Max 3 rolls total (`MAX_REROLLS = 3`). After 3rd roll, button becomes "Start Over". In SwiftUI: `Int.random(in:)`.
- **Tab bar:** Horizontal scroll. In SwiftUI: `ScrollView(.horizontal)` + `HStack` of tab buttons, or `TabView` with `.tabViewStyle(.page)`.
- **Re-roll state resets** when switching categories.

### 6.4 Derail Modal
- **Trigger:** Floating 🚂 button, always visible. In SwiftUI: `@State var derailPresented = false` on root view, `.sheet(isPresented:)`.
- **Two states:** Category selection → Confirmation. Both within same sheet.
- **Log on tap:** Category selected → immediately logged → UI transitions to confirmation. No "confirm" step — per PRD "one tap".
- **Response modes:**
  - `landing` → "5 minutes, then back" message
  - `appetizer` → "Quick reset" message + button to open Dopamine Menu
- **Derail categories stored:** lowercase id (`boredom`, `anxiety`, `hyperfocus`, `fatigue`, `external`, `other`).

---

## 7. Animations & Sound

### Confetti
- **PWA:** CSS `@keyframes confetti-fall` — 14 `<span>` dots, random position/color/size/delay
- **Xcode:** Use [ConfettiSwiftUI](https://github.com/simibac/ConfettiSwiftUI) package (MIT). One line: `ConfettiCannon(trigger: $celebrate)`

### Sounds (per PRD §11)
| Event | Default Sound | Xcode implementation |
|---|---|---|
| Task complete | Game sound effect | `AVAudioPlayer` or `SystemSoundID` |
| Mad Dash subtask (v2) | Regal trumpet | Custom audio asset |
| Derail tap | Train horn | Custom audio asset |

Sound files not included in PWA v1. Assets to be added to Xcode project's `Resources/Sounds/`.

### Sheet animation
- **PWA:** `slide-up` keyframe with `cubic-bezier(0.34,1.56,0.64,1)` (spring-like)
- **Xcode:** `.sheet()` uses system spring animation automatically. Match with `.animation(.spring(response: 0.3, dampingFraction: 0.7))` for custom elements.

---

## 8. PWA → Xcode Checklist

On handoff weekend, complete in this order:

- [ ] Create new Xcode project (iOS App, SwiftUI, minimum deployment iOS 16.0)
- [ ] Copy design tokens from §4 into `Colors.swift` extension
- [ ] Copy `DopamineItems.swift` from `src/data/dopamineItems.js`
- [ ] Set up SwiftData models from schemas in §3
- [ ] Build `TaskCardView` first (most reused component)
- [ ] Build `HomeView` with `NavigationStack`
- [ ] Build `AddTaskView` (presented via `NavigationLink` or `.navigationDestination`)
- [ ] Build `DopamineMenuView`
- [ ] Build `DerailSheet` as `.sheet()` with `DerailModalView`
- [ ] Build `FloatingButtonsView` in root `ZStack`
- [ ] Wire `EnvironmentObject` for tasks and derails
- [ ] Add App Icons (192×192 and 512×512 already in `/public` — export at required iOS sizes)
- [ ] Add confetti package via Swift Package Manager
- [ ] Add audio assets and wire `AVAudioPlayer`
- [ ] Set `Info.plist` — NSMicrophoneUsageDescription (for voice input in v2)
- [ ] Set minimum deployment target: iOS 16.0

---

## 9. File Structure

```
dam-app/
├── index.html                    # PWA entry — maps to @main App struct
├── vite.config.js                # Build config — not needed in Xcode
├── package.json
├── public/
│   └── manifest.json             # PWA manifest — replaces Info.plist in Xcode
└── src/
    ├── main.jsx                  # ReactDOM.createRoot → @main DAMApp.swift
    ├── App.jsx                   # Root state + routing → ContentView.swift
    ├── index.css                 # Design tokens → Colors.swift + typography
    ├── data/
    │   └── dopamineItems.js      # → DopamineItems.swift (constant data)
    ├── hooks/
    │   └── useLocalStorage.js    # → SwiftData @Model + @Environment
    ├── components/
    │   ├── FloatingButtons.jsx   # → FloatingButtonsView.swift
    │   ├── FloatingButtons.css
    │   ├── TaskCard.jsx          # → TaskCardView.swift
    │   └── TaskCard.css
    └── screens/
        ├── Home.jsx              # → HomeView.swift
        ├── Home.css
        ├── AddTask.jsx           # → AddTaskView.swift
        ├── AddTask.css
        ├── DopamineMenu.jsx      # → DopamineMenuView.swift
        ├── DopamineMenu.css
        ├── DerailModal.jsx       # → DerailSheet presented via .sheet()
        └── DerailModal.css
```

---

## 10. Known PWA Limitations (not bugs — intentional v1 scope)

| Limitation | PWA behavior | Xcode solution |
|---|---|---|
| No voice input | Text-only textarea | Apple Speech framework (`SFSpeechRecognizer`) |
| No sounds | Silent | `AVAudioPlayer` with bundled audio assets |
| No real confetti library | CSS dot animation | ConfettiSwiftUI package |
| No push notifications | Not implemented | `UserNotifications` framework |
| No icons (192/512 PNG) | Placeholder — add before deploy | Generate from brand color `#1A56A5` |
| Hash routing (`#/`) | Required for static PWA | Replace with SwiftUI NavigationStack |
| localStorage | Browser only | SwiftData |
| AI task prioritization | Sorted by label + createdAt | Claude API via URLSession |

---

## 11. Running the PWA Locally

```bash
# Requires Node.js 18+
npm install
npm run dev
# → http://localhost:5173

# Build for production
npm run build
npm run preview
```

---

## UPDATE LOG — v1.2 (May 2026)

**PRD version:** v1.2 (PRD sections §19–28 added)  
**Scope:** Targeted update — no rebuild. All existing functionality preserved.

---

### Files Changed

| File | Change type | Summary |
|---|---|---|
| `src/index.css` | Updated | Added 12 section color CSS tokens; updated amber from #F59E0B → #D97706 per PRD §19 |
| `src/App.jsx` | Major update | New state model, migration, setActiveTask boot logic, conflict resolution, autoFillNext |
| `src/hooks/useTick.js` | New | 1-second interval hook returning Date.now(); formatElapsed / formatCountdown helpers |
| `src/data/routines.js` | New | 6 pre-loaded default routines from PRD §23.4 |
| `src/screens/ConflictModal.jsx/css` | New | "Pick 2" sheet triggered when Next Actions is full during boot |
| `src/components/TaskCard.jsx` | Major update | 6 variants, live timer, bg countdown, category badge, subtask progress pips |
| `src/components/TaskCard.css` | Major update | Section-tinted card variants, timer banner, badge styles |
| `src/screens/Home.jsx` | Major update | 7-section hierarchy, category filter chips, SectionHeader component |
| `src/screens/Home.css` | Major update | Section color classes, filter row, collapsible toggle styles |
| `src/screens/AddTask.jsx` | Major update | Category selector, routine picker, 3 collapsible sections, subtask builder, bg toggle |
| `src/screens/AddTask.css` | Major update | All new field styles: chips, toggle switch, subtask rows, collapsible, timing grid |

---

### Architecture Decisions

#### Task Status Model (replaces `completed: boolean`)
- **Why:** Multiple home sections need to distinguish states beyond just complete/incomplete. Added `status: 'active' | 'next' | 'background' | 'backlog' | 'completed'`.
- **Migration:** `migrateTask()` runs on every task that lacks a `status` field. On first mount, a `useEffect` detects legacy tasks and runs `autoFillNext(tasks.map(migrateTask))` once. Idempotent — safe to re-run.
- **Xcode:** Replace `status` string enum with a Swift `TaskStatus` enum. Migration is not needed in SwiftData (define the model with `status` from the start).

#### `autoFillNext(tasks)`
- Ensures the "Next Two Actions" section always has up to 2 tasks when slots are available.
- Called after every mutation: `addTask`, `completeTask`, `setActiveTask`, `resolveConflict`, `advanceBgTask`.
- Sort order: priority label rank first, then `createdAt` ascending (oldest first).
- Background tasks (`isBackgroundTask: true`) are excluded from auto-promotion into Next Actions.
- **Xcode:** Implement as a computed property on the ViewModel that watches the task store.

#### `setActiveTask` Boot Logic
- Reads current `migratedTasks` from closure (tasks in `useCallback` deps array) to detect conflicts before calling `setTasks`.
- If current active is a background task, it boots to `'background'` not `'next'`.
- If `bootedDest === 'next'` and 2 tasks already in Next Actions: sets `conflictModal` state instead of mutating tasks.
- **Xcode:** Implement as a method on a `TaskStore` ObservableObject.

#### ConflictModal
- Shows 3 task cards: the booted active task + 2 existing next-action tasks.
- User taps 2 to select. Tapping a 3rd replaces the first selected (never allows >2).
- `hasBeenActive` rule: if the dropped task was previously active, it stays in `'next'` rather than `'backlog'`. Edge case: this could temporarily create 3 next tasks, but `autoFillNext` won't demote them (it only promotes, never demotes).
- **Xcode:** `.sheet(isPresented:)` with a custom `ConflictView`. Use `@State var selectedIds: Set<String>`.

#### Background Task Timer
- `bgTimerStartedAt` is set to `Date.now()` when the task is added (not when the user presses "start").
- Countdown = `(bgTimerStartedAt + bgTimerMinutes * 60000) - now`.
- Expired state shown when countdown reaches 0 (card changes from purple to green "Done" state).
- "Done early" button calls `advanceBgTask` which completes the task (v1 PWA — chains are v1.3).
- **Xcode:** Use a `Timer.publish(every: 1, on: .main, in: .common)` in the background task card view.

#### `useTick()` Hook
- Single `setInterval(1000ms)` per component instance using it.
- TaskCard calls this for both `'active'` (elapsed timer) and `'background'` (countdown) variants.
- For components that don't need a live clock (next, behind, quick-win, completed), `useTick` still fires but the result is unused — acceptable overhead for a PWA.
- **Xcode optimization:** Use a single environment-provided `currentTime` that ticks once per second globally. Avoids N timers for N cards.

---

### New Data Fields (additions to Task schema)

```typescript
// Added in v1.2
category:          string | null           // 'Household Chores' | 'Work' | 'Personal Projects' | 'Events' | custom
status:            'active'|'next'|'background'|'backlog'|'completed'
hasBeenActive:     boolean                 // once true, task never auto-demotes below 'next'
activeStartedAt:   number | null           // Date.now() ms when activated
isParentTask:      boolean
subtasks:          SubTask[]
isBackgroundTask:  boolean
bgTimerMinutes:    number | null
bgTimerStartedAt:  number | null           // set on task creation when isBackgroundTask
hardDeadline:      string | null           // ISO date string
softDeadline:      string | null
repeat:            'none' | 'daily' | 'weekly'
notes:             string
prepNote:          string
```

```typescript
// SubTask schema
{
  id:              string
  text:            string
  order:           'consecutive' | 'parallel'
  isBackground:    boolean
  bgTimerMinutes:  number | null
  duration:        number | null
  completed:       boolean
  skipped:         boolean
}
```

### New localStorage Keys

| Key | Type | Contents |
|---|---|---|
| `dam_custom_categories` | `{name, color}[]` | User-created categories |
| `dam_custom_routines` | `Routine[]` | User-saved custom routines |

(Existing keys `dam_tasks` and `dam_derails` preserved.)

---

### Home Screen Sections — Xcode Implementation Notes

| Section | Status field | Variant | Color |
|---|---|---|---|
| I'm Doing This Now | `'active'` | `task-card--active` | `#1A56A5` |
| Next Two Actions | `'next'` (max 2) | `task-card--next` | `#1A56A5` |
| Running in Background | `'background'` | `task-card--background` | `#7C3AED` |
| Quick Wins | `'backlog'` + `duration <= 5` | `task-card--quick-win` | `#059669` |
| On Track | TBD v1.3 | — | `#0891B2` |
| Behind On | `'backlog'` + `duration > 5 or null` | `task-card--behind` | `#D97706` |
| Completed Today | `'completed'` + today | `task-card--completed` | `#64748B` |

**Category filter:** Applied to "Quick Wins" and "Behind On" sections only. Active, Next, Background, and Completed Today always show all tasks regardless of filter.

---

### Add Task Screen — Xcode Implementation Notes

**Section order (top to bottom):**
1. Category chips — horizontal scroll; `LazyHStack` in SwiftUI
2. Routine picker — dropdown sheet; `.confirmationDialog` or custom `.sheet`
3. Task text — `TextField` multiline
4. Priority 2×2 grid — `LazyVGrid(columns: [GridItem(), GridItem()])`
5. "What kind of task?" — `DisclosureGroup` in SwiftUI
6. "Timing" — `DisclosureGroup`
7. "Notes" — `DisclosureGroup`
8. Submit button — full-width `.buttonStyle`

**Routine picker pre-fill behavior:** Selecting a routine calls `applyRoutine()` which sets `text`, `category`, `isParentTask = true`, and `subtasks` from the routine's step list. User can edit before submitting — the routine is not modified (PRD §25.2: "Routine changes apply to future uses only").

**Subtask builder:** Up/down arrow buttons for reorder (drag-and-drop deferred to Xcode — use `.onMove` in a `List` with `EditButton`).

**Custom category creator:** 8-swatch color palette. Saves to `dam_custom_categories`. Appears in all category selectors throughout app.

**Save as Routine:** Button appears at the bottom of the subtask builder when subtasks have content. Saves to `dam_custom_routines` with current task name, category, and subtask config.

---

### Deferred to v1.3 (per PRD §28)

- Background task chain advancement (currently "done early" = complete the whole task)
- Subtask skip destination (currently skipped subtasks are tracked but destination logic TBD)
- On Track section criteria and task population
- Quick Wins exact threshold (currently 5 min; final value TBD)
- Routine Window (dedicated Add/Edit Routine screen)
- Task detail view (tap into a card)

---

### Task Row Edit Button — v1.2 (undocumented until now)

**What:** Each task card (all non-completed variants) shows a `✏️` pencil button in the actions row, right of the Done button.

**How it works:**
- `TaskCard` accepts `onEdit` prop; renders `<button className="btn-edit">✏️</button>` when the prop is present
- `Home.jsx` passes `onEdit` to every `TaskCard` across all sections (active, next, background, quick-win, behind); completed cards intentionally receive no `onEdit` — no editing a done task
- `App.jsx` → `handleEditNav(id)` navigates to `/add` with `{ state: { editTask: task } }`
- `AddTask.jsx` reads `useLocation().state.editTask` on mount to pre-fill all fields; on submit calls `onEdit(id, taskData)` → `updateTask` in App
- `updateTask` merges new field values onto the existing task, preserving `status`, `hasBeenActive`, `activeStartedAt`, `completedAt`, and any subtask completion state

**Design decision — navigation vs modal overlay:** Edit opens as a full-screen `/add` route, not a floating modal sheet. Rationale: AddTask already has the full field set (category, routine, priority, timing, parent/background toggles, notes). Duplicating that as a modal would be significant complexity for v1. Navigation approach is functionally equivalent and cleaner for Xcode handoff (present as a `.sheet` or `NavigationLink` push in SwiftUI).

**iOS / Xcode handoff:** In SwiftUI, trigger the edit sheet via `.sheet(isPresented:) { AddTaskView(editTask: task) }`. The `AddTaskView` init should accept an optional `Task?` and pre-populate `@State` fields from it.

**Styling:** `.btn-edit` — `border-light` background, `text-secondary` color, 10px × 12px padding, `radius-sm`. Uses `flex-shrink: 0` so it never gets squeezed by longer task names or wider action buttons.

*End of BUILD_LOG.md — DAM v1.2 PWA*
