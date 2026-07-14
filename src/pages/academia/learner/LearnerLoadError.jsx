function LearnerLoadError({ title = 'Something went wrong', message, onRetry, retryLabel = 'Try again' }) {
  if (!message) return null;

  return (
    <div className="learners-card learners-empty-state learners-empty-state--compact">
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="learners-btn learners-btn-primary" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export default LearnerLoadError;
