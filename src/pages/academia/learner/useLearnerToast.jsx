import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './learner-toast.css';

const LearnerToastContext = createContext(null);

const DEFAULT_DURATION = 5500;

function normalizeType(type) {
  if (type === 'error' || type === 'danger') return 'error';
  if (type === 'warning') return 'warning';
  return 'success';
}

export function LearnerToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast({ message: '', type: 'success' });
  }, []);

  const showToast = useCallback((message, type = 'success', duration = DEFAULT_DURATION) => {
    if (!message) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const nextType = normalizeType(type);
    setToast({ message: String(message), type: nextType });
    const ms = nextType === 'error' ? Math.max(duration, 7000) : duration;
    timerRef.current = window.setTimeout(() => {
      setToast({ message: '', type: 'success' });
      timerRef.current = null;
    }, ms);
  }, []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <LearnerToastContext.Provider value={value}>
      {children}
      {toast.message ? (
        <div
          className={`learner-toast learner-toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <p className="learner-toast-message">{toast.message}</p>
          <button
            type="button"
            className="learner-toast-close"
            onClick={hideToast}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ) : null}
    </LearnerToastContext.Provider>
  );
}

export function useLearnerToast() {
  const ctx = useContext(LearnerToastContext);
  if (!ctx) {
    throw new Error('useLearnerToast must be used within LearnerToastProvider');
  }
  return ctx;
}
