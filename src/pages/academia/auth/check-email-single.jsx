import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePublicPageTitle } from '../public/usePublicPageTitle.jsx';
import { getApiBaseUrl } from '../../../config/api';

import remmIcon from '../../../assets/icons/remm.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const RESET_EMAIL_KEY = 'passwordResetEmail';

function AcademiaCheckEmailSingle() {
  usePublicPageTitle('Check your email');
  const location = useLocation();
  const [apexEmail, setApexEmail] = useState('');
  const [nexusResent, setNexusResent] = useState(false);
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');

  useEffect(() => {
    const fromState = location.state?.email;
    const stored = localStorage.getItem(RESET_EMAIL_KEY);
    let fromUser = '';
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      fromUser = user?.email || '';
    } catch {
      fromUser = '';
    }
    setApexEmail((fromState || stored || fromUser || '').trim());
  }, [location.state]);

  const handleResend = async (e) => {
    e.preventDefault();
    setVortexError('');
    setNexusResent(false);

    const email = apexEmail.trim().toLowerCase();
    if (!email) {
      setVortexError('No email address found. Go back and enter your email again.');
      return;
    }

    setTitanLoading(true);
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
        setVortexError(data.error?.message || data.message || 'Failed to resend reset email.');
        return;
      }

      localStorage.setItem(RESET_EMAIL_KEY, email);
      setNexusResent(true);
      setTimeout(() => setNexusResent(false), 8000);
    } catch (error) {
      if (error?.name === 'AbortError') {
        setVortexError('Request timed out. Please try again.');
      } else {
        setVortexError(error.message || 'An error occurred while resending.');
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
          --text-muted: #4b5675;
          --primary: #450468;
          --primary-hover: #46066d;
        }

        .check-email-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
          overflow: hidden;
        }

        .check-email-wrapper * {
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
          text-align: center;
        }

        .status-illustration {
          display: block;
          margin: 0 auto 12px;
          width: 174px;
          height: auto;
        }

        .status-lead {
          margin-top: 10px;
          font-size: 18px;
          font-weight: 500;
          line-height: 18px;
          text-align: center;
          color: #071437;
        }

        .status-text {
          margin-top: 20px;
          font-size: 13px;
          font-weight: 400;
          line-height: 18px;
          text-align: center;
          color: var(--text-muted);
        }

        .status-text .address {
          color: #2c3b63;
          font-weight: 500;
          margin: 0 4px;
        }

        .submit-btn {
          margin: 24px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 160px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          line-height: 14px;
          transition: background 0.2s ease;
          cursor: pointer;
        }

        .submit-btn:hover {
          background: var(--primary-hover);
        }

        .resend-row {
          margin-top: 18px;
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        .resend-row button {
          margin-left: 6px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          font-size: inherit;
        }

        .resend-row button:hover {
          text-decoration: underline;
        }

        .resend-row button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          text-decoration: none;
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
          .check-email-wrapper {
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
          .signin-card {
            padding: 20px 16px;
          }

          .left-col {
            padding: 14px;
          }

          .submit-btn {
            font-size: 17px;
          }

          .status-illustration {
            width: 150px;
          }
        }
      `}</style>

      <main className="check-email-wrapper">
        <section className="left-col">
          <div className="signin-card">
            <img
              className="status-illustration"
              src={remmIcon}
              alt="Check email illustration"
            />

            <h2 className="status-lead">Check your email</h2>

            <p className="status-text">
              We sent a password reset link to
              <span className="address">{apexEmail || 'your email'}</span>
              . Open it to choose a new password. The link expires in 1 hour.
            </p>

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

            {nexusResent && (
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
                Reset email resent successfully. Check your inbox.
              </div>
            )}

            <Link className="submit-btn" to="/auth/signin">
              Back to Sign in
            </Link>

            <p className="resend-row">
              {nexusResent ? (
                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                  Reset email sent!
                </span>
              ) : (
                <>
                  Didn’t receive an email?
                  <button type="button" onClick={handleResend} disabled={titanLoading}>
                    {titanLoading ? 'Sending…' : 'Resend'}
                  </button>
                </>
              )}
            </p>
          </div>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Platform Visual Background" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaCheckEmailSingle;
