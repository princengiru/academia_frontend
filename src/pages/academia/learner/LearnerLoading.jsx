import './learner-loading.css';

function LearnerLoading({ title = 'Loading...', message, compact = false }) {
  return (
    <div
      className={`learners-loading-state${compact ? ' is-compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="learners-loading-state-spinner" aria-hidden="true" />
      <div className="learners-loading-state-copy">
        <strong>{title}</strong>
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
}

export default LearnerLoading;
