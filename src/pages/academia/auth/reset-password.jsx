import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Assets (Update paths to match your React project structure)
import eyeIcon from '../../../assets/icons/eye.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Using rare variable names for state logic
  const [nexusPassword, setNexusPassword] = useState('');
  const [zenithConfirm, setZenithConfirm] = useState('');
  const [slateShowPwd, setSlateShowPwd] = useState(false);
  const [echoShowConfirm, setEchoShowConfirm] = useState(false);
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');
  const [stellarSuccess, setStellarSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVortexError('');
    setStellarSuccess('');

    if (!token) {
      setVortexError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (nexusPassword === '' || zenithConfirm === '') {
      setVortexError('Please fill in both password fields.');
      return;
    }

    if (nexusPassword !== zenithConfirm) {
      setVortexError('Passwords do not match.');
      return;
    }

    setTitanLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: nexusPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVortexError(data.message || 'Password reset failed');
        setTitanLoading(false);
        return;
      }

      setStellarSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/academia/auth/signin', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setVortexError(error.message || 'An error occurred');
      setTitanLoading(false);
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

        .reset-password-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
          overflow: hidden;
        }

        .reset-password-wrapper * {
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
          font-weight: 500;
          font-size: 18px;
          line-height: 18px;
          letter-spacing: -1%;
          text-align: center;
          color: var(--text-main);
        }

        .signin-subtitle {
          margin-top: 7px;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          text-align: center;
          color: var(--text-muted);
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .field-group > label {
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          color: #071437;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 100%;
          height: 40px;
          border-radius: 6px;
          border: 1px solid var(--field-border);
          background: transparent;
          padding: 0 12px;
          color: #2e3a54;
          outline: none;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
        }

        .input-wrap input::placeholder {
          color: #8a94a9;
          opacity: 1;
        }

        .input-wrap input:focus {
          border-color: #b6bfd1;
          box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .input-wrap.password input {
          padding-right: 40px;
        }

        .input-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #97a1b5;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 0;
        }

        .input-eye img {
          width: 18px;
          height: 18px;
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
          letter-spacing: -1%;
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
          .reset-password-wrapper {
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

          .input-wrap input {
            height: 40px;
            font-size: 13px;
          }

          .submit-btn {
            font-size: 17px;
          }
        }
      `}</style>

      <main className="reset-password-wrapper">
        <section className="left-col">
          <main className="signin-card">
            <h1 className="signin-title">Reset Password</h1>
            <p className="signin-subtitle">Enter your new password</p>

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

            <form id="resetForm" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="input-wrap password">
                  <input 
                    id="newPassword" 
                    name="newPassword" 
                    type={slateShowPwd ? "text" : "password"} 
                    placeholder="Enter Password" 
                    value={nexusPassword}
                    onChange={(e) => setNexusPassword(e.target.value)}
                    disabled={titanLoading}
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-eye" 
                    onClick={() => setSlateShowPwd(!slateShowPwd)}
                    aria-label={slateShowPwd ? "Hide new password" : "Show new password"}
                    disabled={titanLoading}
                  >
                    <img src={eyeIcon} alt="Toggle password visibility" />
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrap password">
                  <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={echoShowConfirm ? "text" : "password"} 
                    placeholder="Re-enter a new Password" 
                    value={zenithConfirm}
                    onChange={(e) => setZenithConfirm(e.target.value)}
                    disabled={titanLoading}
                    required 
                  />
                  <button 
                    type="button" 
                    className="input-eye" 
                    onClick={() => setEchoShowConfirm(!echoShowConfirm)}
                    aria-label={echoShowConfirm ? "Hide confirm password" : "Show confirm password"}
                    disabled={titanLoading}
                  >
                    <img src={eyeIcon} alt="Toggle password visibility" />
                  </button>
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
                {titanLoading ? 'Resetting...' : 'Submit'}
              </button>
            </form>
          </main>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Platform Visual Background" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaResetPassword;