import { Link } from 'react-router-dom';
import './public-page-state.css';

export function PublicLoading({ message = 'Loading…' }) {
  return (
    <section className="public-page-state public-page-state--loading" aria-live="polite" aria-busy="true">
      <div className="public-page-state-card">
        <div className="public-page-state-spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </section>
  );
}

export function PublicLoadError({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  backTo = '/index',
  backLabel = 'Back to Academia home',
}) {
  if (!message) return null;

  return (
    <section className="public-page-state public-page-state--error">
      <div className="public-page-state-card">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="public-page-state-actions">
          {onRetry ? (
            <button type="button" className="public-page-state-btn public-page-state-btn--primary" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
          <Link className="public-page-state-btn public-page-state-btn--ghost" to={backTo}>
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PublicEmptyState({ title = 'Nothing here yet', message, actionLabel, actionTo, onAction }) {
  return (
    <section className="public-page-state public-page-state--empty">
      <div className="public-page-state-card">
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
        {actionLabel && (actionTo || onAction) ? (
          <div className="public-page-state-actions">
            {onAction ? (
              <button type="button" className="public-page-state-btn public-page-state-btn--primary" onClick={onAction}>
                {actionLabel}
              </button>
            ) : (
              <Link className="public-page-state-btn public-page-state-btn--primary" to={actionTo}>
                {actionLabel}
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
