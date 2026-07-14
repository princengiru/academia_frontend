import { useCallback, useEffect, useRef, useState } from 'react';
import './hoa-toast.css';

export function useHOAToast(defaultDuration = 4000) {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: false, message: '', type: 'success' });
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    if (timerRef.current) clearTimeout(timerRef.current);
    const duration = type === 'error' ? Math.max(defaultDuration, 6000) : defaultDuration;
    timerRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, duration);
  }, [defaultDuration]);

  return { toast, showToast, hideToast };
}

export function HOAToast({ toast, onDismiss }) {
  if (!toast?.show) return null;

  return (
    <div className={`hoa-toast-notification is-${toast.type}`} role="status" aria-live="polite">
      <div className="hoa-toast-icon" aria-hidden="true">
        {toast.type === 'success' ? '✓' : '✗'}
      </div>
      <p className="hoa-toast-message">{toast.message}</p>
      {onDismiss ? (
        <button type="button" className="hoa-toast-dismiss" onClick={onDismiss} aria-label="Dismiss notification">
          ×
        </button>
      ) : null}
    </div>
  );
}
