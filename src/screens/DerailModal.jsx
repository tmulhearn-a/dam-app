import { useState } from 'react';
import './DerailModal.css';

const CATEGORIES = [
  { id: 'boredom',     label: 'Boredom',                  emoji: '😶‍🌫️' },
  { id: 'anxiety',     label: 'Anxiety',                  emoji: '😰' },
  { id: 'hyperfocus',  label: 'Hyperfocus on wrong task', emoji: '🌀' },
  { id: 'fatigue',     label: 'Fatigue',                  emoji: '😴' },
  { id: 'external',    label: 'External interruption',    emoji: '🔔' },
  { id: 'other',       label: 'Other',                    emoji: '🤷' },
];

const RESPONSES = {
  boredom:    { mode: 'appetizer', msg: 'Boredom noted. Grab a quick Appetizer to reset, then ease back in.' },
  anxiety:    { mode: 'landing',   msg: 'Anxiety mode — totally valid. 5 more minutes of this, then let\'s take one small step.' },
  hyperfocus: { mode: 'landing',   msg: 'Caught in the vortex! Finish this thought, then 5 minutes and we redirect.' },
  fatigue:    { mode: 'appetizer', msg: 'Fatigue talking. A quick reset (move, water, air) can help more than pushing through.' },
  external:   { mode: 'landing',   msg: 'Interrupted — not your fault. 5-minute buffer, then back to it.' },
  other:      { mode: 'landing',   msg: 'Derail logged. 5 minutes, then we get back on track. You\'ve got this.' },
};

export default function DerailModal({ onLog, onClose }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (cat) => {
    setSelected(cat);
    setConfirmed(true);
    onLog(cat.id);
  };

  const response = selected ? RESPONSES[selected.id] : null;

  return (
    <div className="derail-overlay" role="dialog" aria-modal="true" aria-label="Log a derail">
      <div className="derail-backdrop" onClick={onClose} />

      <div className="derail-sheet">
        {!confirmed ? (
          <>
            <div className="derail-sheet__handle" />
            <div className="derail-sheet__icon" aria-hidden="true">🚂</div>
            <h2 className="derail-sheet__title">Off the rails?</h2>
            <p className="derail-sheet__subtitle">What did your brain go to?</p>

            <div className="derail-cats" role="list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className="derail-cat"
                  onClick={() => handleSelect(cat)}
                  role="listitem"
                >
                  <span className="derail-cat__emoji" aria-hidden="true">{cat.emoji}</span>
                  <span className="derail-cat__label">{cat.label}</span>
                </button>
              ))}
            </div>

            <button className="derail-skip" onClick={() => handleSelect(CATEGORIES[5])}>
              Skip — just log it
            </button>
          </>
        ) : (
          <>
            <div className="derail-sheet__handle" />
            <div className="derail-sheet__icon" aria-hidden="true">
              {response?.mode === 'appetizer' ? '⚡' : '🎯'}
            </div>
            <h2 className="derail-sheet__title">Logged ✓</h2>
            <p className="derail-confirm__cat">
              {selected?.emoji} {selected?.label}
            </p>
            <p className="derail-confirm__msg">{response?.msg}</p>

            <div className="derail-confirm__actions">
              {response?.mode === 'appetizer' && (
                <button className="derail-confirm__dopamine" onClick={onClose}>
                  ⚡ Open Dopamine Menu
                </button>
              )}
              <button className="derail-confirm__done" onClick={onClose}>
                Got it — back to work
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
