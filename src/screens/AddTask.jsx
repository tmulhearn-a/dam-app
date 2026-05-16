import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddTask.css';

const PRIORITIES = [
  { label: 'On Fire',     emoji: '🔥', desc: 'Do right now',           color: 'on-fire' },
  { label: 'Big Rock',    emoji: '🪨', desc: 'Schedule it',            color: 'big-rock' },
  { label: 'Easy Ball',   emoji: '⚾', desc: 'Quick do or delegate',   color: 'easy-ball' },
  { label: 'Back Burner', emoji: '🛋️', desc: 'Park it for later',      color: 'back-burner' },
];

export default function AddTask({ onAdd }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(null);
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) { setError('What needs doing?'); return; }
    if (!priority)    { setError('Pick a priority label.'); return; }
    onAdd(text.trim(), priority, duration ? parseInt(duration, 10) : null);
  };

  return (
    <div className="add-task">
      <header className="add-task__header">
        <button className="add-task__back" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
        <h1 className="add-task__title">Add Task</h1>
        <div style={{ width: 64 }} />
      </header>

      <main className="add-task__main">
        {/* ── Text input ─────────────────────── */}
        <section className="add-task__section">
          <label className="add-task__label" htmlFor="task-input">
            What needs doing?
          </label>
          <textarea
            id="task-input"
            className="add-task__input"
            placeholder="e.g. Reply to Sarah's email"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            rows={3}
            autoFocus
          />
        </section>

        {/* ── Duration ──────────────────────── */}
        <section className="add-task__section">
          <label className="add-task__label" htmlFor="duration-input">
            Time estimate <span className="add-task__optional">(optional)</span>
          </label>
          <div className="add-task__duration-row">
            <input
              id="duration-input"
              className="add-task__duration-input"
              type="number"
              min="1"
              max="480"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span className="add-task__duration-unit">minutes</span>
          </div>
        </section>

        {/* ── Priority selector ─────────────── */}
        <section className="add-task__section">
          <p className="add-task__label">Priority</p>
          <div className="add-task__priorities">
            {PRIORITIES.map((p) => (
              <button
                key={p.label}
                className={`priority-card priority-card--${p.color} ${priority === p.label ? 'priority-card--selected' : ''}`}
                onClick={() => { setPriority(p.label); setError(''); }}
                aria-pressed={priority === p.label}
              >
                <span className="priority-card__emoji" aria-hidden="true">{p.emoji}</span>
                <span className="priority-card__label">{p.label}</span>
                <span className="priority-card__desc">{p.desc}</span>
                {priority === p.label && (
                  <span className="priority-card__check" aria-hidden="true">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="add-task__error" role="alert">{error}</p>}

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
