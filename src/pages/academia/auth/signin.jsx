import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Assets (Update paths to match your React project structure)
import googleIcon from '../../../assets/icons/google.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaSignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- Standardized State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || new URLSearchParams(location.search).get('error') || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || data.message || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      // Handle 2FA / OTP Verification Flow
      if (data?.data?.requiresOTPVerification) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify({ email: data?.data?.email || email }));
        localStorage.setItem('verifyEndpoint', '/api/auth/verify-login-otp');
        setTimeout(() => {
          navigate('/academia/auth/verify', { replace: true });
        }, 300);
        return;
      }

      // --- Successful Login ---
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Route based on exact role matching
      const userRole = (data.data.user?.role || '').toLowerCase().trim();

      setTimeout(() => {
        if (userRole === 'instructor') {
          navigate('/academia/professor', { replace: true });
        } else if (userRole === 'student') {
          navigate('/academia/learner/', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/academia/hoa', { replace: true });
        } else {
          // Fallback if role is undefined or not standard
          navigate('/academia/index', { replace: true });
        }
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setError('A network error occurred. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --page-bg: white;
          --card-bg: white;
          --card-border: #F1F1F4;
          --text-main: #1c2742;
          --text-muted: #4B5675;
          --field-border: #DBDFE9;
          --field-bg: #f2f4f8;
          --primary: #450468;
          --primary-hover: #46066d;
        }

        /* Scoped specifically to this wrapper to prevent CSS leakage */
        .signin-page-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
        }

        .signin-page-wrapper .left-col {
          background: var(--page-bg);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .signin-page-wrapper .signin-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 28px 26px;
          box-shadow: 0px 3px 4px 0px #00000008;
          box-sizing: border-box;
        }

        .signin-page-wrapper .signin-title {
          font-weight: 500;
          font-size: 20px;
          text-align: center;
          margin: 0;
          color: black;
        }

        .signin-page-wrapper .signin-subtitle {
          margin-top: 8px;
          margin-bottom: 0;
          font-weight: 400;
          font-size: 14px;
          text-align: center;
          color: var(--text-muted);
        }

        .signin-page-wrapper .signin-subtitle a {
          color: var(--primary);
          text-decoration: none;
          margin-left: 6px;
          font-weight: 500;
        }

        .signin-page-wrapper .signin-social {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 10px;
        }

        .signin-page-wrapper .social-btn {
          min-height: 38px;
          border: 1px solid var(--field-border);
          border-radius: 8px;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          color: var(--text-main);
          padding: 0;
          transition: background 0.2s ease;
        }

        .signin-page-wrapper .social-btn:hover {
          background: #f8f9fc;
        }

        .signin-page-wrapper .social-btn .btn-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signin-page-wrapper .social-btn.apple .btn-icon svg {
          width: 16px;
          height: 16px;
          fill: #000000;
        }

        .signin-page-wrapper .signin-divider {
          margin: 24px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 400;
          font-size: 12px;
          color: #78829D;
        }

        .signin-page-wrapper .signin-divider::before,
        .signin-page-wrapper .signin-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #d7dce6;
        }

        .signin-page-wrapper .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 18px;
        }

        .signin-page-wrapper .field-group > label {
          font-weight: 500;
          font-size: 13px;
          color: #071437;
        }

        .signin-page-wrapper .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 400;
          font-size: 13px;
          color: #071437;
        }

        .signin-page-wrapper .field-label-row a {
          text-decoration: none;
          color: var(--primary);
          font-weight: 500;
        }

        .signin-page-wrapper .input-wrap {
          position: relative;
        }

        .signin-page-wrapper .input-wrap input {
          width: 100%;
          height: 42px;
          border-radius: 8px;
          border: 1px solid var(--field-border);
          background: transparent;
          padding: 0 14px;
          color: #2e3a54;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .signin-page-wrapper .input-wrap input::placeholder {
          color: #a1a5b7;
        }

        .signin-page-wrapper .input-wrap input:focus {
          border-color: var(--primary);
        }

        .signin-page-wrapper .input-wrap.password input {
          padding-right: 40px;
        }

        .signin-page-wrapper .input-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #97a1b5;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .signin-page-wrapper .remember-row {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4B5675;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
        }

        .signin-page-wrapper .remember-row input {
          width: 18px;
          height: 18px;
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid #c8cfdb;
          border-radius: 4px;
          background: #f5f7fb;
          cursor: pointer;
          position: relative;
        }

        .signin-page-wrapper .remember-row input:checked {
          background: var(--primary);
          border-color: var(--primary);
        }

        .signin-page-wrapper .remember-row input:checked::after {
          content: "";
          position: absolute;
          left: 5px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .signin-page-wrapper .submit-btn {
          margin-top: 24px;
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .signin-page-wrapper .submit-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .signin-page-wrapper .right-col {
          height: 100vh;
          background: #f5f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signin-page-wrapper .right-col img {
          display: block;
          height: 100vh;
          width: auto;
          max-width: none;
          object-fit: cover;
        }

        @media (max-width: 900px) {
          .signin-page-wrapper {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          .signin-page-wrapper .right-col {
            display: none;
          }
        }
      `}</style>

      <main className="signin-page-wrapper">
        <section className="left-col">
          <form className="signin-card" onSubmit={handleSubmit}>
            <h1 className="signin-title">Sign in</h1>
            <p className="signin-subtitle">
              Need an account? <a href="/academia/auth/signup">Sign up</a>
            </p>

            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <div className="signin-social">
              <button type="button" className="social-btn google">
                <span className="btn-icon"><img src={googleIcon} alt="Google" style={{ width: '16px' }} /></span>
                Use Google
              </button>
              
              <button type="button" className="social-btn apple">
                <span className="btn-icon" aria-hidden="true">
                  <svg viewBox="0 0 384 512">
                    <path d="M318.7 268.7c-.2-49.6 40.6-73.5 42.4-74.6-23.1-33.8-58.9-38.5-71.7-39-30.5-3.1-59.6 18-75.1 18-15.6 0-39.7-17.6-65.2-17.1-33.5 .5-64.5 19.5-81.8 49.8-35.1 60.8-9 150.8 25.2 200.2 16.7 24.1 36.6 51.2 62.8 50.2 25.2-1 34.7-16.3 65.2-16.3 30.5 0 39 16.3 65.8 15.8 27.3-.5 44.6-24.6 61.2-48.8 19.2-28.1 27.1-55.3 27.6-56.7-.6-.3-52.8-20.3-53-80.5zM269.3 111.5c13.9-16.9 23.3-40.3 20.8-63.5-20 .8-44.2 13.3-58.5 30.2-12.9 14.9-24.2 38.6-21.2 61.4 22.3 1.7 45-11.3 58.9-28.1z"/>
                  </svg>
                </span>
                Use Apple
              </button>
            </div>

            <div className="signin-divider">OR</div>

            <div className="field-group">
              <label htmlFor="signinEmail">Email</label>
              <div className="input-wrap">
                <input 
                  id="signinEmail" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="signinPassword">Password</label>
                <a href="/academia/auth/forgot-password">Forgot Password?</a>
              </div>
              <div className="input-wrap password">
                <input 
                  id="signinPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="input-eye" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img src={eyeIcon} alt="Toggle Password Visibility" />
                </button>
              </div>
            </div>

            <label className="remember-row" htmlFor="signinRemember">
              <input 
                id="signinRemember" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me for 30 days</span>
            </label>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'wait' : 'pointer',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Academia Learning Platform" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaSignIn;