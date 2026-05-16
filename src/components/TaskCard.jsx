import { useState } from 'react';
import './TaskCard.css';

const PRIORITY_META = {
  'On Fire':    { emoji: '🔥', color: 'on-fire' },
  'Big Rock':   { emoji: '🪨', color: 'big-rock' },
  'Easy Ball':  { emoji: '⚾', color: 'easy-ball' },
  'Back Burner':{ emoji: '🛋️', color: 'back-burner' },
};

export default function TaskCard({ task, onComplete, celebrate, variant = 'next-action' }) {
  const [doing, setDoing] = useState(false);
  const meta = PRIORITY_META[task.priority] || PRIORITY_META['Back Burner'];

  const handleDoingNow = () => setDoing(true);

  const handleComplete = () => {
    if (onComplete) onComplete(task.id);
  };

  return (
    <div className={`task-card task-card--${variant} ${celebrate ? 'task-card--celebrate' : ''} ${doing ? 'task-card--doing' : ''}`}>
      {celebrate && <Confetti />}

      <div className="task-card__top">
        <span className={`priority-badge priority-badge--${meta.color}`}>
          <span aria-hidden="true">{meta.emoji}</span> {task.priority}
        </span>
        {task.duration && (
          <span className="task-card__duration">~{task.duration} min</span>
        )}
      </div>

      <p className="task-card__text">{task.text}</p>

      <div className="task-card__actions">
        {variant === 'next-action' && !doing && (
          <button className="btn-doing" onClick={handleDoingNow}>
            I'm doing this now
          </button>
        )}
        {(variant === 'next-action' && doing) && (
          <span className="task-card__doing-label">⏱ In progress…</span>
        )}
        <button
          className="btn-complete"
          onClick={handleComplete}
          aria-label={`Mark "${task.text}" complete`}
        >
          ✓ Done
        </button>
      </div>
    </div>
  );
}

function Confetti() {
  const dots = Array.from({ length: 14 });
  const colors = ['#1A56A5','#EF4444','#10B981','#F59E0B','#6366F1','#EC4899'];
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
