import { useState } from 'react';
import TaskCard from '../components/TaskCard.jsx';
import './Home.css';

const PRIORITY_ORDER = { 'On Fire': 0, 'Big Rock': 1, 'Easy Ball': 2, 'Back Burner': 3 };

function sortedIncomplete(tasks) {
  return tasks
    .filter((t) => !t.completed)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.createdAt - b.createdAt);
}

export default function Home({ tasks, onComplete, celebrateId }) {
  const [behindExpanded, setBehindExpanded] = useState(false);

  const incomplete = sortedIncomplete(tasks);
  const nextActions = incomplete.slice(0, 2);
  const behindOn = incomplete.slice(2);
  const isEmpty = incomplete.length === 0;

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__logo">
          <span className="home__logo-dam">DAM</span>
          <span className="home__logo-sub">Daily Anchor Method</span>
        </div>
        <div className="home__tagline">calm the chaos</div>
      </header>

      <main className="home__main">
        {/* ── Next Actions ────────────────────── */}
        <section className="home__section">
          <h2 className="home__section-label">
            <span className="home__section-dot home__section-dot--brand" />
            Next Actions
          </h2>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <div className="home__cards">
              {nextActions.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  celebrate={celebrateId === task.id}
                  variant="next-action"
                />
              ))}
              {nextActions.length === 0 && (
                <p className="home__all-done">All caught up — nice work! 🎉</p>
              )}
            </div>
          )}
        </section>

        {/* ── Behind On ───────────────────────── */}
        {behindOn.length > 0 && (
          <section className="home__section">
            <button
              className="home__behind-toggle"
              onClick={() => setBehindExpanded((v) => !v)}
              aria-expanded={behindExpanded}
            >
              <span className="home__section-dot home__section-dot--amber" />
              <span className="home__section-label home__section-label--amber">
                Behind On ({behindOn.length})
              </span>
              <span className="home__chevron">{behindExpanded ? '▲' : '▼'}</span>
            </button>

            {behindExpanded && (
              <div className="home__cards home__cards--behind">
                {behindOn.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    celebrate={celebrateId === task.id}
                    variant="behind"
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Bottom padding so FABs don't cover last card */}
      <div style={{ height: 120 }} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state__avatar">🌊</div>
      <p className="empty-state__msg">
        Your day is a blank canvas.<br />
        Want to add your first task?
      </p>
      <div className="empty-state__ghost">
        <div className="ghost-card">
          <div className="ghost-card__badge" />
          <div className="ghost-card__line ghost-card__line--long" />
          <div className="ghost-card__line ghost-card__line--short" />
        </div>
      </div>
      <p className="empty-state__hint">Tap <strong>+ Add Task</strong> to get started</p>
    </div>
  );
}
