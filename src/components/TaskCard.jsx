import { useTick, formatElapsed, formatCountdown } from '../hooks/useTick.js';
import './TaskCard.css';

const PRIORITY_META = {
  'On Fire':     { emoji: '🔥', color: 'on-fire' },
  'Big Rock':    { emoji: '🪨', color: 'big-rock' },
  'Easy Ball':   { emoji: '⚾', color: 'easy-ball' },
  'Back Burner': { emoji: '🛋️', color: 'back-burner' },
};

const CATEGORY_EMOJIS = {
  'Household Chores':  '🏠',
  'Work':              '💼',
  'Personal Projects': '✨',
  'Events':            '📅',
};

export default function TaskCard({
  task,
  onComplete,
  onDoingNow,
  onBgDone,
  celebrate,
  variant = 'next',
}) {
  const now = useTick();
  const meta = PRIORITY_META[task.priority] || PRIORITY_META['Back Burner'];

  const elapsed = task.activeStartedAt ? formatElapsed(task.activeStartedAt, now) : null;
  const bgEnd = task.bgTimerStartedAt && task.bgTimerMinutes
    ? task.bgTimerStartedAt + task.bgTimerMinutes * 60 * 1000
    : null;
  const countdown = bgEnd ? formatCountdown(bgEnd, now) : null;
  const bgExpired = bgEnd ? now >= bgEnd : false;

  return (
    <div className={`task-card task-card--${variant} ${celebrate ? 'task-card--celebrate' : ''}`}>
      {celebrate && <Confetti />}

      {/* ── Active timer banner ──────────── */}
      {variant === 'active' && elapsed && (
        <div className="task-card__timer task-card__timer--active">
          <span className="task-card__timer-icon">⏱</span>
          <span className="task-card__timer-val">{elapsed}</span>
          <span className="task-card__timer-label">in progress</span>
        </div>
      )}

      {/* ── Background countdown banner ──── */}
      {variant === 'background' && countdown && (
        <div className={`task-card__timer task-card__timer--bg ${bgExpired ? 'task-card__timer--expired' : ''}`}>
          <span className="task-card__timer-icon">{bgExpired ? '✅' : '⏳'}</span>
          <span className="task-card__timer-val">
            {bgExpired ? 'Timer done!' : countdown}
          </span>
          {!bgExpired && <span className="task-card__timer-label">remaining</span>}
        </div>
      )}

      <div className="task-card__top">
        <div className="task-card__badges">
          {task.priority && (
            <span className={`priority-badge priority-badge--${meta.color}`}>
              <span aria-hidden="true">{meta.emoji}</span> {task.priority}
            </span>
          )}
          {task.category && (
            <span className="category-badge">
              <span aria-hidden="true">{CATEGORY_EMOJIS[task.category] || '🏷️'}</span>
              {task.category}
            </span>
          )}
          {task.isParentTask && (
            <span className="task-badge task-badge--parent">parent</span>
          )}
          {task.isBackgroundTask && (
            <span className="task-badge task-badge--bg">background</span>
          )}
        </div>
        {task.duration && variant !== 'active' && variant !== 'completed' && (
          <span className="task-card__duration">~{task.duration} min</span>
        )}
      </div>

      <p className={`task-card__text ${variant === 'completed' ? 'task-card__text--done' : ''}`}>
        {task.text}
      </p>

      {/* Subtask progress indicator */}
      {task.isParentTask && task.subtasks?.length > 0 && (
        <div className="task-card__subtask-bar">
          {task.subtasks.map((s, i) => (
            <span
              key={s.id || i}
              className={`task-card__subtask-pip ${s.completed ? 'task-card__subtask-pip--done' : s.skipped ? 'task-card__subtask-pip--skip' : ''}`}
              title={s.text}
            />
          ))}
          <span className="task-card__subtask-count">
            {task.subtasks.filter(s => s.completed || s.skipped).length}/{task.subtasks.length}
          </span>
        </div>
      )}

      {variant === 'completed' && task.completedAt && (
        <p className="task-card__completed-at">
          ✓ Completed {formatCompletedAt(task.completedAt)}
        </p>
      )}

      {variant !== 'completed' && (
        <div className="task-card__actions">
          {(variant === 'next' || variant === 'quick-win' || variant === 'behind') && onDoingNow && (
            <button className="btn-doing" onClick={() => onDoingNow(task.id)}>
              I'm doing this now
            </button>
          )}
          {variant === 'background' && onBgDone && (
            <button className="btn-bg-done" onClick={() => onBgDone(task.id)}>
              {bgExpired ? '✓ Done' : 'Done early'}
            </button>
          )}
          {variant !== 'background' && onComplete && (
            <button
              className="btn-complete"
              onClick={() => onComplete(task.id)}
              aria-label={`Mark "${task.text}" complete`}
            >
              ✓ Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatCompletedAt(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Confetti() {
  const dots = Array.from({ length: 14 });
  const colors = ['#1A56A5', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];
  return (
    <div className="confetti" aria-hidden="true">
      {dots.map((_, i) => (
        <span
          key={i}
          className="confetti__dot"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.3}s`,
            width: `${Math.random() * 6 + 5}px`,
            height: `${Math.random() * 6 + 5}px`,
          }}
        />
      ))}
    </div>
  );
}
