function ManagementLoading({ title = 'Loading...', message, compact = false }) {
  return (
    <div
      className={`prof-management-loading${compact ? ' is-compact' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="prof-management-loading-spinner" aria-hidden="true" />
      <div className="prof-management-loading-copy">
        <strong>{title}</strong>
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
}

export default ManagementLoading;
