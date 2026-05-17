import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ROUTINES } from '../data/routines.js';
import './AddTask.css';

const DEFAULT_CATEGORIES = ['Household Chores', 'Work', 'Personal Projects', 'Events'];

const CATEGORY_EMOJIS = {
  'Household Chores':  '🏠',
  'Work':              '💼',
  'Personal Projects': '✨',
  'Events':            '📅',
};

const PRIORITIES = [
  { label: 'On Fire',     emoji: '🔥', desc: 'Do right now',         color: 'on-fire' },
  { label: 'Big Rock',    emoji: '🪨', desc: 'Schedule it',          color: 'big-rock' },
  { label: 'Easy Ball',   emoji: '⚾', desc: 'Quick do or delegate', color: 'easy-ball' },
  { label: 'Back Burner', emoji: '🛋️', desc: 'Park it for later',    color: 'back-burner' },
];

const CUSTOM_CATEGORY_COLORS = [
  '#EF4444','#F97316','#EAB308','#22C55E','#06B6D4',
  '#8B5CF6','#EC4899','#6B7280',
];

function newSubtask(index) {
  return { _key: `sk_${Date.now()}_${index}`, text: '', order: 'consecutive', isBackground: false, bgTimerMinutes: '', duration: '' };
}

export default function AddTask({ onAdd, customCategories, onSaveCategory, customRoutines, onSaveRoutine }) {
  const navigate = useNavigate();

  // ── Core fields ─────────────────────────
  const [category, setCategory] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(null);
  const [error, setError] = useState('');

  // ── Collapsible section open states ─────
  const [kindOpen, setKindOpen] = useState(false);
  const [timingOpen, setTimingOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // ── "What kind of task?" fields ─────────
  const [isParentTask, setIsParentTask] = useState(false);
  const [subtasks, setSubtasks] = useState([newSubtask(0)]);
  const [isBackgroundTask, setIsBackgroundTask] = useState(false);
  const [bgTimerMinutes, setBgTimerMinutes] = useState('');

  // ── Timing fields ────────────────────────
  const [duration, setDuration] = useState('');
  const [hardDeadline, setHardDeadline] = useState('');
  const [softDeadline, setSoftDeadline] = useState('');
  const [repeat, setRepeat] = useState('none');

  // ── Notes fields ─────────────────────────
  const [notes, setNotes] = useState('');
  const [prepNote, setPrepNote] = useState('');

  // ── Custom category creator ───────────────
  const [showCatCreator, setShowCatCreator] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CUSTOM_CATEGORY_COLORS[0]);

  // ── Routine picker ────────────────────────
  const [routinePickerOpen, setRoutinePickerOpen] = useState(false);

  const allCategories = [...DEFAULT_CATEGORIES, ...(customCategories || []).map(c => c.name)];
  const allRoutines   = [...DEFAULT_ROUTINES, ...(customRoutines || [])];

  // ── Subtask helpers ───────────────────────
  const addSubtask = () => setSubtasks(p => [...p, newSubtask(p.length)]);

  const removeSubtask = (key) => setSubtasks(p => p.filter(s => s._key !== key));

  const updateSubtask = (key, field, value) =>
    setSubtasks(p => p.map(s => s._key === key ? { ...s, [field]: value } : s));

  const moveSubtask = (key, dir) => {
    setSubtasks(prev => {
      const idx = prev.findIndex(s => s._key === key);
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── Routine selection ─────────────────────
  const applyRoutine = useCallback((routine) => {
    setText(routine.name);
    setCategory(routine.category || null);
    setIsParentTask(true);
    setSubtasks(routine.subtasks.map((s, i) => ({
      _key: `sk_${Date.now()}_${i}`,
      text: s.text,
      order: s.order || 'consecutive',
      isBackground: !!s.isBackground,
      bgTimerMinutes: s.bgTimerMinutes ? String(s.bgTimerMinutes) : '',
      duration: s.duration ? String(s.duration) : '',
    })));
    setKindOpen(true);
    setSelectedRoutine(routine);
    setRoutinePickerOpen(false);
  }, []);

  // ── Custom category save ──────────────────
  const handleSaveCategory = () => {
    if (!newCatName.trim()) return;
    const cat = { name: newCatName.trim(), color: newCatColor };
    onSaveCategory(cat);
    setCategory(newCatName.trim());
    setNewCatName('');
    setShowCatCreator(false);
  };

  // ── Save current config as new routine ───
  const handleSaveAsRoutine = () => {
    if (!text.trim() || subtasks.every(s => !s.text.trim())) return;
    const routine = {
      id: `r_custom_${Date.now()}`,
      name: text.trim(),
      category: category || null,
      subtasks: subtasks
        .filter(s => s.text.trim())
        .map((s, i) => ({
          id: `rs${i}`,
          text: s.text.trim(),
          order: s.order,
          isBackground: s.isBackground,
          bgTimerMinutes: s.bgTimerMinutes ? parseInt(s.bgTimerMinutes, 10) : null,
          duration: s.duration ? parseInt(s.duration, 10) : null,
        })),
    };
    onSaveRoutine(routine);
    alert(`"${routine.name}" saved as a routine!`);
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = () => {
    if (!text.trim())  { setError('What needs doing?'); return; }
    if (!priority)     { setError('Pick a priority label.'); return; }

    const cleanSubtasks = isParentTask
      ? subtasks.filter(s => s.text.trim()).map(s => ({
          text: s.text.trim(),
          order: s.order,
          isBackground: s.isBackground,
          bgTimerMinutes: s.bgTimerMinutes ? parseInt(s.bgTimerMinutes, 10) : null,
          duration: s.duration ? parseInt(s.duration, 10) : null,
        }))
      : [];

    onAdd({
      text: text.trim(),
      priority,
      category: category || null,
      duration: duration ? parseInt(duration, 10) : null,
      isParentTask,
      subtasks: cleanSubtasks,
      isBackgroundTask,
      bgTimerMinutes: bgTimerMinutes ? parseInt(bgTimerMinutes, 10) : null,
      hardDeadline: hardDeadline || null,
      softDeadline: softDeadline || null,
      repeat,
      notes,
      prepNote,
    });
  };

  return (
    <div className="add-task">
      <header className="add-task__header">
        <button className="add-task__back" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="add-task__title">Add Task</h1>
        <div style={{ width: 64 }} />
      </header>

      <main className="add-task__main">

        {/* ── 1. Category ─────────────────── */}
        <section className="add-task__section">
          <p className="add-task__label">Category <span className="add-task__optional">(optional)</span></p>
          <div className="add-task__cat-chips">
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`cat-chip ${category === cat ? 'cat-chip--selected' : ''}`}
                onClick={() => setCategory(category === cat ? null : cat)}
              >
                <span>{CATEGORY_EMOJIS[cat] || '🏷️'}</span> {cat}
              </button>
            ))}
            <button className="cat-chip cat-chip--add" onClick={() => setShowCatCreator(v => !v)}>
              + New
            </button>
          </div>

          {showCatCreator && (
            <div className="cat-creator">
              <input
                className="cat-creator__input"
                placeholder="Category name"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                maxLength={24}
              />
              <div className="cat-creator__colors">
                {CUSTOM_CATEGORY_COLORS.map(c => (
                  <button
                    key={c}
                    className={`cat-creator__swatch ${newCatColor === c ? 'cat-creator__swatch--selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setNewCatColor(c)}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <button className="cat-creator__save" onClick={handleSaveCategory}>
                Save Category
              </button>
            </div>
          )}
        </section>

        {/* ── 2. Routine selector ─────────── */}
        <section className="add-task__section">
          <p className="add-task__label">Routine <span className="add-task__optional">(optional)</span></p>
          <button
            className={`routine-selector ${selectedRoutine ? 'routine-selector--selected' : ''}`}
            onClick={() => setRoutinePickerOpen(v => !v)}
          >
            <span>{selectedRoutine ? selectedRoutine.name : 'Select a routine…'}</span>
            <span className="routine-selector__arrow">{routinePickerOpen ? '▲' : '▼'}</span>
          </button>

          {routinePickerOpen && (
            <div className="routine-picker">
              <button
                className="routine-picker__item routine-picker__item--none"
                onClick={() => { setSelectedRoutine(null); setRoutinePickerOpen(false); }}
              >
                None
              </button>
              {allRoutines.map(r => (
                <button
                  key={r.id}
                  className={`routine-picker__item ${selectedRoutine?.id === r.id ? 'routine-picker__item--active' : ''}`}
                  onClick={() => applyRoutine(r)}
                >
                  <span className="routine-picker__name">{r.name}</span>
                  {r.category && <span className="routine-picker__cat">{r.category}</span>}
                  <span className="routine-picker__steps">{r.subtasks.length} steps</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── 3. What needs doing? ────────── */}
        <section className="add-task__section">
          <label className="add-task__label" htmlFor="task-input">What needs doing?</label>
          <textarea
            id="task-input"
            className="add-task__input"
            placeholder="e.g. Reply to Sarah's email"
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            rows={2}
            autoFocus
          />
        </section>

        {/* ── 4. Priority ─────────────────── */}
        <section className="add-task__section">
          <p className="add-task__label">Priority</p>
          <div className="add-task__priorities">
            {PRIORITIES.map(p => (
              <button
                key={p.label}
                className={`priority-card priority-card--${p.color} ${priority === p.label ? 'priority-card--selected' : ''}`}
                onClick={() => { setPriority(p.label); setError(''); }}
                aria-pressed={priority === p.label}
              >
                <span className="priority-card__emoji">{p.emoji}</span>
                <span className="priority-card__label">{p.label}</span>
                <span className="priority-card__desc">{p.desc}</span>
                {priority === p.label && <span className="priority-card__check">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="add-task__error" role="alert">{error}</p>}

        {/* ── 5. Collapsible: What kind? ───── */}
        <CollapsibleSection
          label="What kind of task?"
          open={kindOpen}
          onToggle={() => setKindOpen(v => !v)}
        >
          {/* Parent task toggle */}
          <div className="kind-row">
            <div className="kind-row__info">
              <span className="kind-row__label">Parent task</span>
              <span className="kind-row__desc">This task has subtasks</span>
            </div>
            <Toggle on={isParentTask} onChange={v => { setIsParentTask(v); if (v) setIsBackgroundTask(false); }} />
          </div>

          {/* Subtask builder */}
          {isParentTask && (
            <div className="subtask-builder">
              <p className="subtask-builder__heading">Subtasks</p>
              {subtasks.map((s, idx) => (
                <div key={s._key} className="subtask-row">
                  <div className="subtask-row__main">
                    <input
                      className="subtask-row__input"
                      placeholder={`Step ${idx + 1}`}
                      value={s.text}
                      onChange={e => updateSubtask(s._key, 'text', e.target.value)}
                    />
                    <div className="subtask-row__controls">
                      <button
                        className={`subtask-order-btn ${s.order === 'consecutive' ? 'subtask-order-btn--active' : ''}`}
                        onClick={() => updateSubtask(s._key, 'order', 'consecutive')}
                        title="Consecutive"
                      >→</button>
                      <button
                        className={`subtask-order-btn ${s.order === 'parallel' ? 'subtask-order-btn--active' : ''}`}
                        onClick={() => updateSubtask(s._key, 'order', 'parallel')}
                        title="Parallel"
                      >⇄</button>
                      <button className="subtask-move-btn" onClick={() => moveSubtask(s._key, -1)} disabled={idx === 0}>↑</button>
                      <button className="subtask-move-btn" onClick={() => moveSubtask(s._key, 1)} disabled={idx === subtasks.length - 1}>↓</button>
                      <button className="subtask-remove-btn" onClick={() => removeSubtask(s._key)} disabled={subtasks.length === 1}>×</button>
                    </div>
                  </div>
                  <div className="subtask-row__extra">
                    <label className="subtask-bg-toggle">
                      <input
                        type="checkbox"
                        checked={s.isBackground}
                        onChange={e => updateSubtask(s._key, 'isBackground', e.target.checked)}
                      />
                      <span>Background</span>
                    </label>
                    {s.isBackground && (
                      <div className="subtask-timer-field">
                        <input
                          className="subtask-timer-input"
                          type="number"
                          min="1"
                          max="480"
                          placeholder="min"
                          value={s.bgTimerMinutes}
                          onChange={e => updateSubtask(s._key, 'bgTimerMinutes', e.target.value)}
                        />
                        <span className="subtask-timer-unit">min cycle</span>
                      </div>
                    )}
                    <div className="subtask-duration-field">
                      <input
                        className="subtask-timer-input"
                        type="number"
                        min="1"
                        max="480"
                        placeholder="min"
                        value={s.duration}
                        onChange={e => updateSubtask(s._key, 'duration', e.target.value)}
                      />
                      <span className="subtask-timer-unit">est</span>
                    </div>
                  </div>
                </div>
              ))}
              <button className="subtask-add-btn" onClick={addSubtask}>+ Add step</button>
              {selectedRoutine && (
                <button className="subtask-save-routine-btn" onClick={handleSaveAsRoutine}>
                  💾 Save as new routine
                </button>
              )}
              {!selectedRoutine && subtasks.some(s => s.text.trim()) && (
                <button className="subtask-save-routine-btn" onClick={handleSaveAsRoutine}>
                  💾 Save as routine
                </button>
              )}
            </div>
          )}

          {/* Background task toggle */}
          <div className="kind-row kind-row--mt">
            <div className="kind-row__info">
              <span className="kind-row__label">Background task</span>
              <span className="kind-row__desc">Runs on a timer while you do other things</span>
            </div>
            <Toggle on={isBackgroundTask} onChange={v => { setIsBackgroundTask(v); if (v) setIsParentTask(false); }} />
          </div>

          {isBackgroundTask && (
            <div className="bg-timer-field">
              <label className="add-task__label" htmlFor="bg-timer">How long is the cycle?</label>
              <div className="add-task__duration-row">
                <input
                  id="bg-timer"
                  className="add-task__duration-input"
                  type="number"
                  min="1"
                  max="480"
                  placeholder="45"
                  value={bgTimerMinutes}
                  onChange={e => setBgTimerMinutes(e.target.value)}
                />
                <span className="add-task__duration-unit">minutes</span>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* ── 6. Collapsible: Timing ────────── */}
        <CollapsibleSection
          label="Timing"
          open={timingOpen}
          onToggle={() => setTimingOpen(v => !v)}
        >
          <div className="timing-grid">
            <div className="timing-field">
              <label className="timing-label" htmlFor="est-dur">Time estimate</label>
              <div className="add-task__duration-row">
                <input
                  id="est-dur"
                  className="add-task__duration-input"
                  type="number"
                  min="1"
                  max="480"
                  placeholder="30"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                />
                <span className="add-task__duration-unit">min</span>
              </div>
            </div>

            <div className="timing-field">
              <label className="timing-label" htmlFor="hard-dl">Hard deadline</label>
              <input
                id="hard-dl"
                className="timing-date-input"
                type="date"
                value={hardDeadline}
                onChange={e => setHardDeadline(e.target.value)}
              />
            </div>

            <div className="timing-field">
              <label className="timing-label" htmlFor="soft-dl">Soft deadline</label>
              <input
                id="soft-dl"
                className="timing-date-input"
                type="date"
                value={softDeadline}
                onChange={e => setSoftDeadline(e.target.value)}
              />
            </div>

            <div className="timing-field">
              <p className="timing-label">Repeat</p>
              <div className="repeat-chips">
                {['none','daily','weekly'].map(r => (
                  <button
                    key={r}
                    className={`repeat-chip ${repeat === r ? 'repeat-chip--active' : ''}`}
                    onClick={() => setRepeat(r)}
                  >
                    {r === 'none' ? 'None' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* ── 7. Collapsible: Notes ─────────── */}
        <CollapsibleSection
          label="Notes"
          open={notesOpen}
          onToggle={() => setNotesOpen(v => !v)}
        >
          <div className="notes-fields">
            <textarea
              className="notes-input"
              placeholder="Free text notes…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
            <textarea
              className="notes-input"
              placeholder="Prep note (e.g. guitar is on the stand)"
              value={prepNote}
              onChange={e => setPrepNote(e.target.value)}
              rows={2}
            />
          </div>
        </CollapsibleSection>

        <button
          className="add-task__submit"
          onClick={handleSubmit}
          disabled={!text.trim() || !priority}
        >
          Add Task
        </button>
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────── */

function CollapsibleSection({ label, open, onToggle, children }) {
  return (
    <div className="collapsible">
      <button className="collapsible__toggle" onClick={onToggle} aria-expanded={open}>
        <span className="collapsible__label">{label}</span>
        <span className="collapsible__arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      className={`toggle ${on ? 'toggle--on' : ''}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    >
      <span className="toggle__thumb" />
    </button>
  );
}
