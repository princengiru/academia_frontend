import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Assets (Update paths to match your React project structure)
import smartphoneIcon from '../../../assets/icons/smartphone1.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaVerify() {
  const navigate = useNavigate();
  
  // Rare variable names for state logic
  const [apexOtp, setApexOtp] = useState(['', '', '', '', '', '']);
  const [nexusTimer, setNexusTimer] = useState(37);
  const zenithRefs = useRef([]);
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Get email from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserEmail(user.email || '');
    }
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (nexusTimer > 0) {
      const intervalId = setInterval(() => {
        setNexusTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [nexusTimer]);

  const handleChange = (e, index) => {
    const huskVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...apexOtp];
    newOtp[index] = huskVal;
    setApexOtp(newOtp);

    // Auto-focus next input
    if (huskVal && index < 5) {
      zenithRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (newOtp.join('').length === 6) {
      submitOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    // Auto-focus previous input on backspace if current is empty
    if (e.key === 'Backspace' && !apexOtp[index] && index > 0) {
      zenithRefs.current[index - 1]?.focus();
    }
  };

  const submitOTP = async (otpCode) => {
    if (!userEmail) {
      setVortexError('Email not found. Please login again.');
      return;
    }

    setVortexError('');
    setTitanLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVortexError(data.error?.message || data.message || 'OTP verification failed');
        setTitanLoading(false);
        return;
      }

      // Store token and redirect
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setTimeout(() => {
        navigate('/academia/learner/courses', { replace: true });
      }, 500);
    } catch (error) {
      console.error('OTP verification error:', error);
      setVortexError(error.message || 'An error occurred');
      setTitanLoading(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (pasteData) {
      const newOtp = [...apexOtp];
      pasteData.split('').forEach((char, i) => {
        newOtp[i] = char;
      });
      setApexOtp(newOtp);

      // Focus the next empty input, or the last one if full
      const focusIndex = Math.min(pasteData.length, 5);
      zenithRefs.current[focusIndex]?.focus();
    }
  };

  const handleResend = (e) => {
    e.preventDefault();
    if (nexusTimer === 0) {
      setNexusTimer(37);
      setVortexError('');
      console.log('OTP Resent to:', userEmail);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = apexOtp.join('');

    if (code.length !== 6) {
      setVortexError('Please enter all 6 digits');
      return;
    }

    submitOTP(code);
  };

  return (
    <>
      <style>{`
        :root {
          --page-bg: #ffffff;
          --card-border: #f1f1f4;
          --text-muted: #4b5675;
          --field-border: #dbdfe9;
          --primary: #450468;
          --primary-hover: #46066d;
        }

        .verify-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
          overflow: hidden;
        }

        .verify-wrapper * {
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

        .verify-illustration {
          display: block;
          margin: 0 auto 12px;
        }

        .signin-title {
          font-size: 18px;
          font-weight: 500;
          line-height: 18px;
          text-align: center;
          color: #071437;
        }

        .signin-subtitle {
          margin-top: 30px;
          font-size: 13px;
          font-weight: 400;
          line-height: 14px;
          text-align: center;
          color: var(--text-muted);
        }

        .phone-mask {
          margin-top: 15px;
          text-align: center;
          font-weight: 600;
          color: #071437;
        }

        .otp-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin: 30px 0;
        }

        .otp-input {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--field-border);
          border-radius: 6px;
          background: transparent;
        }

        .otp-input input {
          width: 100%;
          height: 100%;
          border: 0;
          border-radius: 6px;
          outline: none;
          text-align: center;
          font-family: Inter, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #2e3a54;
          background: transparent;
        }

        .otp-input input:focus {
          border-color: #b6bfd1;
          box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .resend-row {
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
        }

        .resend-row a,
        .resend-row button {
          margin-left: 6px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
        }
        
        .resend-row button:disabled {
          color: #999;
          cursor: default;
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
          .verify-wrapper {
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

          .otp-row {
            gap: 8px;
          }

          .submit-btn {
            font-size: 17px;
          }
        }
      `}</style>

      <main className="verify-wrapper">
        <section className="left-col">
          <form className="signin-card" onSubmit={handleSubmit}>
            <img 
              className="verify-illustration" 
              src={smartphoneIcon} 
              alt="Smartphone" 
            />
            <h1 className="signin-title">Verify your phone</h1>
            <p className="signin-subtitle">Enter the verification code we sent to</p>
            <div className="phone-mask">******7859</div>

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

            <div className="otp-row" aria-label="verification code">
              {apexOtp.map((husk, idx) => (
                <div key={idx} className="otp-input">
                  <input
                    ref={(el) => (zenithRefs.current[idx] = el)}
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]*"
                    value={husk}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                  />
                </div>
              ))}
            </div>

            <div className="resend-row">
              Didn’t receive a code?{' '}
              {nexusTimer > 0 ? (
                <span id="timer">({nexusTimer}s)</span>
              ) : null}{' '}
              <button 
                type="button" 
                onClick={handleResend} 
                disabled={nexusTimer > 0}
              >
                Resend
              </button>
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
              {titanLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Platform Visual Background" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaVerify;