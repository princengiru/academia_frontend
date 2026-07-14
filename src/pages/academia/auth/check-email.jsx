import React, { useState, useEffect } from 'react';
import { usePublicPageTitle } from '../public/usePublicPageTitle.jsx';
import { useAuthToast } from './useAuthToast.jsx';

// Assets (Update paths to match your React project structure)
import remmIcon from '../../../assets/icons/remm.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaCheckEmail() {
  usePublicPageTitle('Check your email');
  const { showToast, AuthToast } = useAuthToast();
  const [apexEmail, setApexEmail] = useState('');
  const [nexusResent, setNexusResent] = useState(false);
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setApexEmail(user.email || '');
      } catch {
        setApexEmail('');
      }
    }
  }, []);

  const handleResend = async (e) => {
    e.preventDefault();
    setVortexError('');

    if (!apexEmail) {
      setVortexError('No email address found. Sign in again to resend verification.');
      return;
    }

    setTitanLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: apexEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setVortexError(data.error?.message || data.message || 'Failed to resend verification email.');
        return;
      }

      setNexusResent(true);
      showToast('Verification email sent.');
      setTimeout(() => setNexusResent(false), 5000);
    } catch {
      setVortexError('An error occurred while resending.');
    } finally {
      setTitanLoading(false);
    }
  };

  return (
    <>
      {AuthToast}
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
              Please click the link sent to your email
              <span className="address">{apexEmail}</span>
              to verify your account. Thank you.
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
                Verification email resent successfully!
              </div>
            )}

            <a className="submit-btn" href="/">
              Back to Home
            </a>

            <p className="resend-row">
              {nexusResent ? (
                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                  Verification email sent!
                </span>
              ) : (
                <>
                  Didn’t receive an email?
                  <button type="button" onClick={handleResend} disabled={titanLoading}>
                    {titanLoading ? 'Sending...' : 'Resend'}
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

export default AcademiaCheckEmail;