---
name: code-explorer
description: >
  Use this skill to locate where specific UI components, functions, hooks, data
  structures, or logic live in the codebase — without making any changes.
  Trigger this skill whenever the user asks things like "where is X defined",
  "which file handles Y", "find the component that does Z", "where does the
  task data get stored", "what file controls the home screen layout", or any
  question about the location or structure of existing code. Also trigger when
  Claude needs to find a file before editing it, to avoid guessing paths. Always
  use this skill before making targeted code changes — locate first, edit second.
compatibility:
  tools:
    - bash
    - read_file
---

# Code Explorer

Locate UI components, functions, hooks, and data in the codebase.
Make **no changes**. Report only. Keep the main context clean.

---

## Core Rules

1. **Read only.** Never edit, create, or delete files.
2. **Report concisely.** Return file path + component/function name only.
3. **Use a subagent** for the search so results stay isolated from the main context window.
4. **Stop at first confident match.** Do not continue searching after finding the answer.
5. **If ambiguous**, return all plausible matches ranked by confidence.

---

## Search Strategy

Run searches in this order, stopping as soon as you find a confident match:

### Step 1 — Grep by name
```bash
grep -r "ComponentName\|functionName" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -l
```
Use the exact term the user provided. If no results, try partial match.

### Step 2 — Grep by keyword or concept
If the name search fails, search by related keywords:
```bash
grep -r "keyword" src/ --include="*.tsx" --include="*.ts" -l
```
Examples: search "derail" to find the derail button, "localStorage" to find data layer, "Next Actions" to find the home screen section.

### Step 3 — Directory scan
If grep fails, scan the directory structure for likely file names:
```bash
find src/ -name "*.tsx" -o -name "*.ts" | sort
```
Look for file names that match the concept (e.g. `HomeScreen`, `TaskCard`, `DopamineMenu`).

### Step 4 — Read the candidate file
Once a likely file is found, read the top 50 lines to confirm the match:
```bash
head -50 src/path/to/file.tsx
```

---

## Output Format

Return results in this exact format — nothing more:

```
FOUND: src/components/TaskCard.tsx
  → TaskCard (component, line 12)
  → TaskCardProps (interface, line 4)
```

If multiple matches:
```
FOUND (3 matches):
  1. src/components/HomeScreen.tsx → NextActions (component, line 34) [HIGH confidence]
  2. src/hooks/useTasks.ts → getNextActions (function, line 89) [MEDIUM confidence]
  3. src/store/taskStore.ts → nextActions (state key, line 15) [MEDIUM confidence]
```

If nothing found:
```
NOT FOUND: No match for "[term]" in src/
  Searched: component names, keywords, directory scan
  Suggestion: Try searching for "[alternate term]"
```

---

## Common DAM App Locations

Use this map to narrow searches before running grep:

| What you're looking for | Start here |
|---|---|
| Home screen sections | `src/components/HomeScreen` or `src/pages/Home` |
| Task card UI | `src/components/TaskCard` |
| Add Task form | `src/components/AddTask` or `src/pages/AddTask` |
| Dopamine Menu | `src/components/DopamineMenu` |
| Derail button/flow | `src/components/Derail` |
| Mad Dash | `src/components/MadDash` |
| Routines | `src/components/Routine` or `src/hooks/useRoutines` |
| localStorage reads/writes | `src/store` or `src/hooks/useTasks` or `src/utils` |
| Data types / interfaces | `src/types` or `src/models` |
| App routing | `src/App.tsx` or `src/router` |
| Sound / confetti effects | `src/utils` or `src/hooks/useSound` |
| Wind-down / bedtime | `src/components/WindDown` or `src/hooks/useBedtime` |

---

## Subagent Instructions

Spawn a subagent with this prompt:

```
You are a read-only code explorer. Your job is to find where [THING] is defined
in this codebase. Make no changes. Search using bash grep and find commands.
Return only: the file path, component or function name, and line number.
Stop searching as soon as you find a confident match.
```

Pass the user's search term as [THING]. The subagent reports back to the main
context with the formatted result above.

---

## Examples

**User:** "Where is the derail button defined?"
**Search:** `grep -r "Derail\|derail" src/ --include="*.tsx" -l`
**Output:**
```
FOUND: src/components/Derail/DerailButton.tsx
  → DerailButton (component, line 8)
```

**User:** "Which file handles localStorage for tasks?"
**Search:** `grep -r "localStorage" src/ --include="*.ts" --include="*.tsx" -l`
**Output:**
```
FOUND (2 matches):
  1. src/hooks/useTasks.ts → saveTasks (function, line 23) [HIGH confidence]
  2. src/store/taskStore.ts → persistTasks (function, line 41) [MEDIUM confidence]
```

**User:** "Where are the priority label cards rendered?"
**Search:** `grep -r "On Fire\|Big Rock\|Easy Ball\|Back Burner" src/ --include="*.tsx" -l`
**Output:**
```
FOUND: src/components/AddTask/PrioritySelector.tsx
  → PrioritySelector (component, line 6)
  → PriorityCard (component, line 44)
```
