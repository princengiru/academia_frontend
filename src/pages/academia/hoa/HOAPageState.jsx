import { Link } from 'react-router-dom';
import './hoa-page-state.css';

export function HOALoading({ message = 'Loading…', inline = false }) {
  return (
    <section className={`hoa-page-state hoa-page-state--loading${inline ? ' hoa-page-state--inline' : ''}`} aria-live="polite" aria-busy="true">
      <div className="hoa-page-state-card">
        <div className="hoa-page-state-spinner" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </section>
  );
}

export function HOALoadError({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  backTo = '/hoa',
  backLabel = 'Back to dashboard',
  inline = false,
}) {
  if (!message) return null;

  return (
    <section className={`hoa-page-state hoa-page-state--error${inline ? ' hoa-page-state--inline' : ''}`}>
      <div className="hoa-page-state-card">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="hoa-page-state-actions">
          {onRetry ? (
            <button type="button" className="hoa-page-state-btn hoa-page-state-btn--primary" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
          <Link className="hoa-page-state-btn hoa-page-state-btn--ghost" to={backTo}>
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HOAEmptyState({
  title = 'Nothing here yet',
  message,
  actionLabel,
  actionTo,
  inline = false,
}) {
  return (
    <section className={`hoa-page-state hoa-page-state--empty${inline ? ' hoa-page-state--inline' : ''}`}>
      <div className="hoa-page-state-card">
        <h2>{title}</h2>
        {message ? <p>{message}</p> : null}
        {actionLabel && actionTo ? (
          <div className="hoa-page-state-actions">
            <Link className="hoa-page-state-btn hoa-page-state-btn--primary" to={actionTo}>
              {actionLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function HOATableEmptyRow({ colSpan, title, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="hoa-table-empty-cell">
        <HOAEmptyState inline title={title} message={message} />
      </td>
    </tr>
  );
}
