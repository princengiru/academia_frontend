import { Link } from 'react-router-dom';
import './learner-empty-state.css';

/**
 * Shared learner empty state — matches HOA page-state empty card.
 */
export default function LearnerEmptyState({
  title = 'Nothing here yet',
  message,
  actionLabel,
  actionTo,
  onAction,
  inline = false,
  className = '',
}) {
  const hasLink = Boolean(actionLabel && actionTo);
  const hasButton = Boolean(actionLabel && onAction);

  return (
    <section
      className={`learner-empty-state${inline ? ' learner-empty-state--inline' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="learner-empty-state-card">
        <h3>{title}</h3>
        {message ? <p>{message}</p> : null}
        {hasLink || hasButton ? (
          <div className="learner-empty-state-actions">
            {hasLink ? (
              <Link className="learner-empty-state-btn learner-empty-state-btn--primary" to={actionTo}>
                {actionLabel}
              </Link>
            ) : null}
            {hasButton ? (
              <button
                type="button"
                className="learner-empty-state-btn learner-empty-state-btn--primary"
                onClick={onAction}
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
