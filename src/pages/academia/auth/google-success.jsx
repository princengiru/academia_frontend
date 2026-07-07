import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AcademiaGoogleSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    const errorParam = params.get('error');

    if (errorParam) {
      const messages = {
        google_cancelled: 'Google sign-in was cancelled.',
        google_token_failed: 'Failed to authenticate with Google. Please try again.',
        google_no_email: 'Your Google account does not have a verified email.',
        google_server_error: 'A server error occurred. Please try again.',
      };
      setError(messages[errorParam] || 'An unexpected error occurred.');
      setTimeout(() => navigate('/academia/auth/signin', { replace: true }), 3000);
      return;
    }

    if (!token || !userRaw) {
      setError('Invalid authentication response.');
      setTimeout(() => navigate('/academia/auth/signin', { replace: true }), 2000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const role = (user.role || '').toLowerCase().trim();
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');

      setTimeout(() => {
        if (redirectAfterLogin) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectAfterLogin, { replace: true });
        } else if (role === 'instructor') {
          navigate('/academia/professor', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/academia/learner/', { replace: true });
        }
      }, 800);
    } catch (e) {
      console.error('Google success parse error:', e);
      setError('Authentication data was corrupted.');
      setTimeout(() => navigate('/academia/auth/signin', { replace: true }), 2000);
    }
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#f9f9f9',
      gap: '16px',
    }}>
      {error ? (
        <>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <p style={{ color: '#c33', fontSize: '15px', textAlign: 'center', maxWidth: '320px' }}>{error}</p>
          <p style={{ color: '#999', fontSize: '13px' }}>Redirecting to sign in...</p>
        </>
      ) : (
        <>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(69, 4, 104, 0.15)',
            borderTop: '3px solid #450468',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: '#450468', fontWeight: 600, fontSize: '15px' }}>Signing you in...</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}

export default AcademiaGoogleSuccess;
