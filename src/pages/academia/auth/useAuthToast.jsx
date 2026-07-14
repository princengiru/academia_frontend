import { useCallback, useState } from 'react';
import './auth-toast.css';

export function useAuthToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const AuthToast = toast ? (
    <div className={`auth-toast auth-toast--${toast.type}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button type="button" className="auth-toast-close" aria-label="Dismiss" onClick={clearToast}>
        ×
      </button>
    </div>
  ) : null;

  return { showToast, clearToast, AuthToast };
}
