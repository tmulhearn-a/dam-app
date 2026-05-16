import './FloatingButtons.css';

const FABS = [
  { key: 'add',      emoji: '+',  label: 'Add Task',     title: 'Add Task' },
  { key: 'dopamine', emoji: '⚡', label: 'Dopamine',     title: 'Dopamine Menu' },
  { key: 'derail',   emoji: '🚂', label: 'Derail',       title: 'Log a Derail' },
];

export default function FloatingButtons({ onAdd, onDopamine, onDerail }) {
  const handlers = { add: onAdd, dopamine: onDopamine, derail: onDerail };

  return (
    <div className="fab-stack" role="group" aria-label="Quick actions">
      {FABS.map(({ key, emoji, label, title }) => (
        <button
          key={key}
          className={`fab fab--${key}`}
          onClick={handlers[key]}
          title={title}
          aria-label={title}
        >
          <span className="fab__emoji" aria-hidden="true">{emoji}</span>
          <span className="fab__label">{label}</span>
        </button>
      ))}
    </div>
  );
}
