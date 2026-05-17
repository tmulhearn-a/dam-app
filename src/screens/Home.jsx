import { useState, useMemo } from 'react';
import TaskCard from '../components/TaskCard.jsx';
import './Home.css';

const PRIORITY_ORDER = { 'On Fire': 0, 'Big Rock': 1, 'Easy Ball': 2, 'Back Burner': 3 };

const DEFAULT_CATEGORIES = ['Household Chores', 'Work', 'Personal Projects', 'Events'];

function isToday(ts) {
  if (!ts) return false;
  const d = new Date(ts);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

function sortByPriority(tasks) {
  return [...tasks].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4) || a.createdAt - b.createdAt
  );
}

export default function Home({ tasks, onComplete, onDoingNow, onBgDone, celebrateId, customCategories }) {
  const [behindExpanded, setBehindExpanded] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const allCategories = ['All', ...DEFAULT_CATEGORIES, ...(customCategories || []).map(c => c.name)];

  const activeTask    = useMemo(() => tasks.find(t => t.status === 'active'), [tasks]);
  const nextTasks     = useMemo(() => tasks.filter(t => t.status === 'next').slice(0, 2), [tasks]);
  const bgTasks       = useMemo(() => tasks.filter(t => t.status === 'background'), [tasks]);
  const quickWins     = useMemo(() =>
    tasks.filter(t => t.status === 'backlog' && t.duration && t.duration <= 5), [tasks]);
  const behindOn      = useMemo(() =>
    sortByPriority(tasks.filter(t => t.status === 'backlog' && !(t.duration && t.duration <= 5))), [tasks]);
  const completedToday = useMemo(() =>
    tasks.filter(t => t.status === 'completed' && isToday(t.completedAt))
      .sort((a, b) => b.completedAt - a.completedAt), [tasks]);

  const filterTasks = (list) =>
    filterCategory === 'All' ? list : list.filter(t => t.category === filterCategory);

  const filteredBehind   = filterTasks(behindOn);
  const filteredWins     = filterTasks(quickWins);

  const hasAnyTask = tasks.some(t => t.status !== 'completed');

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__logo">
          <span className="home__logo-dam">DAM</span>
          <span className="home__logo-sub">Daily Anchor Method</span>
        </div>
        <div className="home__tagline">calm the chaos</div>
      </header>

      {/* ── Category filter ──────────────── */}
      <div className="home__filter-row">
        {allCategories.map(cat => (
          <button
            key={cat}
            className={`home__filter-chip ${filterCategory === cat ? 'home__filter-chip--active' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="home__main">

        {/* ── 1. I'm Doing This Now ──────── */}
        <SectionHeader color="blue" label="I'm Doing This Now" />
        {activeTask ? (
          <div className="home__cards">
            <TaskCard
              key={activeTask.id}
              task={activeTask}
              onComplete={onComplete}
              celebrate={celebrateId === activeTask.id}
              variant="active"
            />
          </div>
        ) : (
          <div className="home__empty-section home__empty-section--blue">
            Nothing active yet — tap "I'm doing this now" on a task below
          </div>
        )}

        {/* ── 2. Next Two Actions ──────────── */}
        <SectionHeader color="blue" label="Next Two Actions" count={nextTasks.length} max={2} />
        {!hasAnyTask ? (
          <EmptyState />
        ) : nextTasks.length > 0 ? (
          <div className="home__cards">
            {nextTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDoingNow={onDoingNow}
                celebrate={celebrateId === task.id}
                variant="next"
              />
            ))}
          </div>
        ) : (
          <div className="home__empty-section home__empty-section--blue">
            All caught up — nice work! 🎉
          </div>
        )}

        {/* ── 3. Running in Background ─────── */}
        {bgTasks.length > 0 && (
          <>
            <SectionHeader color="purple" label="Running in Background" count={bgTasks.length} />
            <div className="home__cards">
              {bgTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onBgDone={onBgDone}
                  celebrate={celebrateId === task.id}
                  variant="background"
                />
              ))}
            </div>
          </>
        )}

        {/* ── 4. Quick Wins ──────────────── */}
        {filteredWins.length > 0 && (
          <>
            <SectionHeader color="green" label="Quick Wins" count={filteredWins.length} note="under 5 min" />
            <div className="home__cards">
              {filteredWins.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onDoingNow={onDoingNow}
                  celebrate={celebrateId === task.id}
                  variant="quick-win"
                />
              ))}
            </div>
          </>
        )}

        {/* ── 5. On Track (placeholder) ──── */}
        <SectionHeader color="teal" label="On Track" note="TBD v1.3" />
        <div className="home__empty-section home__empty-section--teal">
          Criteria for this section are coming in v1.3
        </div>

        {/* ── 6. Behind On ───────────────── */}
        {filteredBehind.length > 0 && (
          <>
            <button
              className="home__section-toggle home__section-toggle--amber"
              onClick={() => setBehindExpanded(v => !v)}
              aria-expanded={behindExpanded}
            >
              <span className="home__section-toggle-dot home__section-toggle-dot--amber" />
              <span>Behind On ({filteredBehind.length})</span>
              <span className="home__chevron">{behindExpanded ? '▲' : '▼'}</span>
            </button>
            {behindExpanded && (
              <div className="home__cards">
                {filteredBehind.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={onComplete}
                    onDoingNow={onDoingNow}
                    celebrate={celebrateId === task.id}
                    variant="behind"
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── 7. Completed Today ─────────── */}
        {completedToday.length > 0 && (
          <>
            <button
              className="home__section-toggle home__section-toggle--slate"
              onClick={() => setCompletedExpanded(v => !v)}
              aria-expanded={completedExpanded}
            >
              <span className="home__section-toggle-dot home__section-toggle-dot--slate" />
              <span>Completed Today ({completedToday.length})</span>
              <span className="home__chevron">{completedExpanded ? '▲' : '▼'}</span>
            </button>
            {completedExpanded && (
              <div className="home__cards">
                {completedToday.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    celebrate={celebrateId === task.id}
                    variant="completed"
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>
      <div style={{ height: 140 }} />
    </div>
  );
}

function SectionHeader({ color, label, count, max, note }) {
  return (
    <h2 className={`home__section-header home__section-header--${color}`}>
      <span className={`home__section-dot home__section-dot--${color}`} />
      <span className="home__section-header-label">{label}</span>
      {count != null && max != null && (
        <span className="home__section-header-count">{count}/{max}</span>
      )}
      {note && <span className="home__section-header-note">{note}</span>}
    </h2>
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
