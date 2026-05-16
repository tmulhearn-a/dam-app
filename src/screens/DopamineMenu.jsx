import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, CATEGORY_META, DEFAULT_ITEMS } from '../data/dopamineItems.js';
import './DopamineMenu.css';

const MAX_REROLLS = 3;

export default function DopamineMenu() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Appetizers');
  const [rolled, setRolled] = useState(null);       // { item, rollsUsed }
  const [rollsUsed, setRollsUsed] = useState(0);
  const [locked, setLocked] = useState(false);

  const items = DEFAULT_ITEMS[activeCategory] || [];
  const meta = CATEGORY_META[activeCategory];

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setRolled(null);
    setRollsUsed(0);
    setLocked(false);
  };

  const handleRoll = () => {
    if (locked) return;
    const pick = items[Math.floor(Math.random() * items.length)];
    const nextRolls = rollsUsed + 1;
    setRolled(pick);
    setRollsUsed(nextRolls);
    if (nextRolls >= MAX_REROLLS) setLocked(true);
  };

  const handleReset = () => {
    setRolled(null);
    setRollsUsed(0);
    setLocked(false);
  };

  const rerollsLeft = MAX_REROLLS - rollsUsed;

  return (
    <div className="dopamine">
      <header className="dopamine__header">
        <button className="dopamine__back" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
        <div className="dopamine__header-center">
          <h1 className="dopamine__title">⚡ Dopamine Menu</h1>
          <p className="dopamine__subtitle">What does your brain need right now?</p>
        </div>
        <div style={{ width: 64 }} />
      </header>

      {/* ── Category tabs ─────────────────── */}
      <nav className="dopamine__tabs" role="tablist" aria-label="Dopamine categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            className={`dopamine__tab ${activeCategory === cat ? 'dopamine__tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            <span className="dopamine__tab-emoji" aria-hidden="true">
              {CATEGORY_META[cat].emoji}
            </span>
            <span className="dopamine__tab-name">{cat}</span>
          </button>
        ))}
      </nav>

      <main className="dopamine__main">
        {/* ── Category info ─────────────────── */}
        <div className="dopamine__cat-info">
          <p className="dopamine__cat-desc">{meta.description}</p>
          <span className="dopamine__cat-time">⏱ {meta.time}</span>
        </div>

        {/* ── Rolled result ──────────────────── */}
        {rolled && (
          <div className={`dopamine__result ${locked ? 'dopamine__result--locked' : ''}`}>
            <p className="dopamine__result-label">
              {locked ? '🔒 Locked in!' : '🎲 You got…'}
            </p>
            <p className="dopamine__result-item">{rolled}</p>
            {!locked && (
              <p className="dopamine__result-rerolls">
                {rerollsLeft} re-roll{rerollsLeft !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        )}

        {/* ── Roll button ────────────────────── */}
        <div className="dopamine__roll-row">
          {!locked ? (
            <button className="dopamine__roll-btn" onClick={handleRoll}>
              {rolled ? `🎲 Roll Again (${rerollsLeft} left)` : '🎲 Roll'}
            </button>
          ) : (
            <button className="dopamine__reset-btn" onClick={handleReset}>
              Start Over
            </button>
          )}
        </div>

        {/* ── Item list ─────────────────────── */}
        <ul className="dopamine__list" role="list">
          {items.map((item) => (
            <li
              key={item}
              className={`dopamine__item ${rolled === item ? 'dopamine__item--highlighted' : ''}`}
            >
              <span className="dopamine__item-dot" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
