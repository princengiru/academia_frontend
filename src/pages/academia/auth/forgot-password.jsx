import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicPageTitle } from '../public/usePublicPageTitle.jsx';
import { getApiBaseUrl } from '../../../config/api';

import bgVisual from '../../../assets/imgs/bg.png';

const RESET_EMAIL_KEY = 'passwordResetEmail';

function AcademiaForgotPassword() {
  usePublicPageTitle('Forgot password');
  const navigate = useNavigate();
  const [apexEmail, setApexEmail] = useState('');
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');
  const [stellarSuccess, setStellarSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVortexError('');
    setStellarSuccess('');
    setTitanLoading(true);

    const email = apexEmail.trim().toLowerCase();
    if (!email) {
      setVortexError('Please enter your email address.');
      setTitanLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setVortexError(data.error?.message || data.message || 'Request failed');
        return;
      }

      localStorage.setItem(RESET_EMAIL_KEY, email);
      setStellarSuccess('Password reset link sent. Check your inbox (and spam).');
      setTimeout(() => {
        navigate('/auth/check-email-single', {
          replace: true,
          state: { email, purpose: 'password-reset' },
        });
      }, 700);
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error?.name === 'AbortError') {
        setVortexError('Request timed out. The server took too long — try again.');
      } else {
        setVortexError(error.message || 'Could not reach the server. Check your connection.');
      }
    } finally {
      window.clearTimeout(timeoutId);
      setTitanLoading(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --page-bg: #ffffff;
          --card-border: #f1f1f4;
          --text-main: #071437;
          --text-muted: #4b5675;
          --field-border: #dbdfe9;
          --primary: #450468;
          --primary-hover: #46066d;
        }

        .forgot-password-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
          overflow: hidden;
        }

        .forgot-password-wrapper * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .left-col {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .signin-card {
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 28px 26px;
          box-shadow: 0 3px 4px 0 #00000008;
        }

        .signin-title {
          font-size: 18px;
          font-weight: 500;
          line-height: 18px;
          text-align: center;
          color: var(--text-main);
        }

        .signin-subtitle {
          margin-top: 8px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 400;
          line-height: 14px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
        }

        .field-group > label {
          color: var(--text-main);
          font-size: 13px;
          font-weight: 400;
          line-height: 14px;
        }

        .input-wrap input {
          width: 100%;
          height: 40px;
          border: 1px solid var(--field-border);
          border-radius: 6px;
          background: transparent;
          color: #2e3a54;
          font-size: 13px;
          font-weight: 400;
          line-height: 14px;
          padding: 0 12px;
          outline: none;
        }

        .input-wrap input::placeholder {
          color: #8a94a9;
          opacity: 1;
        }

        .input-wrap input:focus {
          border-color: #b6bfd1;
          box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .submit-btn {
          margin-top: 18px;
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: #ffffff;
          font-size: 13px;
          font-weight: 500;
          line-height: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .submit-btn:hover {
          background: var(--primary-hover);
        }

        .right-col {
          height: 100vh;
          background: #f5f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .right-col img {
          display: block;
          height: 100vh;
          width: auto;
          user-select: none;
          -webkit-user-drag: none;
        }

        @media (max-width: 900px) {
          .forgot-password-wrapper {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }

          .right-col {
            height: auto;
            min-height: 50vh;
          }

          .right-col img {
            height: auto;
            width: 100%;
            max-height: 50vh;
            object-fit: contain;
          }

          .signin-card {
            max-width: 560px;
          }
        }

        @media (max-width: 560px) {
          .left-col {
            padding: 14px;
          }

          .signin-card {
            padding: 20px 16px;
          }

          .submit-btn {
            font-size: 17px;
          }
        }
      `}</style>

      <main className="forgot-password-wrapper">
        <section className="left-col">
          <form className="signin-card" onSubmit={handleSubmit}>
            <h1 className="signin-title">Forgot password</h1>
            <p className="signin-subtitle">Enter your email and we will send a reset link</p>

            {vortexError && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '6px',
                color: '#c33',
                fontSize: '13px',
                fontFamily: 'Inter',
              }}>
                {vortexError}
              </div>
            )}

            {stellarSuccess && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#efe',
                border: '1px solid #cfc',
                borderRadius: '6px',
                color: '#3c3',
                fontSize: '13px',
                fontFamily: 'Inter',
              }}>
                {stellarSuccess}
              </div>
            )}

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@email.com"
                  value={apexEmail}
                  onChange={(e) => setApexEmail(e.target.value)}
                  disabled={titanLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              className="submit-btn"
              type="submit"
              disabled={titanLoading}
              style={{
                opacity: titanLoading ? 0.7 : 1,
                cursor: titanLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {titanLoading ? 'Sending...' : 'Continue →'}
            </button>
          </form>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Platform Visual" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaForgotPassword;
