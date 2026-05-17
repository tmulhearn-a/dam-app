import { useState } from 'react';
import './ConflictModal.css';

export default function ConflictModal({ tasks, conflictModal, onResolve, onCancel }) {
  const { bootedId, existingNextIds } = conflictModal;
  const threeIds = [bootedId, ...existingNextIds];
  const threeTasks = threeIds.map(id => tasks.find(t => t.id === id)).filter(Boolean);

  const [selected, setSelected] = useState(new Set([bootedId, existingNextIds[0]]));

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        if (next.size < 2) next.add(id);
        else {
          // Replace the first selected to maintain max 2
          const [first] = next;
          next.delete(first);
          next.add(id);
        }
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 2) onResolve([...selected]);
  };

  const PRIORITY_META = {
    'On Fire':     { emoji: '🔥' },
    'Big Rock':    { emoji: '🪨' },
    'Easy Ball':   { emoji: '⚾' },
    'Back Burner': { emoji: '🛋️' },
  };

  return (
    <div className="conflict-overlay" role="dialog" aria-modal="true" aria-label="Next Actions full">
      <div className="conflict-backdrop" onClick={onCancel} />
      <div className="conflict-sheet">
        <div className="conflict-sheet__handle" />
        <div className="conflict-sheet__icon" aria-hidden="true">🔄</div>
        <h2 className="conflict-sheet__title">Next Actions is full</h2>
        <p className="conflict-sheet__subtitle">
          Pick the two tasks to keep in Next Actions. The third drops back to your backlog.
        </p>

        <div className="conflict-cards">
          {threeTasks.map(task => {
            const isSelected = selected.has(task.id);
            const meta = PRIORITY_META[task.priority] || { emoji: '📋' };
            return (
              <button
                key={task.id}
                className={`conflict-card ${isSelected ? 'conflict-card--selected' : ''}`}
                onClick={() => toggle(task.id)}
                aria-pressed={isSelected}
              >
                <div className="conflict-card__top">
                  <span className="conflict-card__emoji">{meta.emoji}</span>
                  <span className="conflict-card__priority">{task.priority}</span>
                  {task.id === bootedId && (
                    <span className="conflict-card__tag">was active</span>
                  )}
                  <span className="conflict-card__check">{isSelected ? '✓' : ''}</span>
                </div>
                <p className="conflict-card__text">{task.text}</p>
              </button>
            );
          })}
        </div>

        <p className="conflict-count">
          {selected.size} of 2 selected
        </p>

        <div className="conflict-actions">
          <button
            className="conflict-confirm"
            onClick={handleConfirm}
            disabled={selected.size !== 2}
          >
            Keep these two
          </button>
          <button className="conflict-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
