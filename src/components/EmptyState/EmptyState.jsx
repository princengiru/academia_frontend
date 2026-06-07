import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  title = 'Nothing here yet',
  description = '',
  primaryLabel = 'Create',
  secondaryLabel = null,
  onPrimaryClick = null,
  primaryHref = null,
  icon = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration">{icon || <svg width="84" height="84" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#F3F4F6"/><path d="M7 9h10M7 13h6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
      <div className="empty-state-copy">
        <h3>{title}</h3>
        {description && <p>{description}</p>}

        <div className="empty-state-actions">
          {primaryHref ? (
            <a className="empty-state-btn primary" href={primaryHref}>{primaryLabel}</a>
          ) : (
            <button type="button" className="empty-state-btn primary" onClick={onPrimaryClick}>{primaryLabel}</button>
          )}

          {secondaryLabel && <button type="button" className="empty-state-btn secondary">{secondaryLabel}</button>}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
