import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Assets (Update paths to match your React project structure)
import googleIcon from '../../../assets/icons/google.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import bgVisual from '../../../assets/imgs/bg.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaSignIn() {
  const navigate = useNavigate();
  
  // Using rare variable names for state logic
  const [apexEmail, setApexEmail] = useState('');
  const [nexusPassword, setNexusPassword] = useState('');
  const [zenithShowPwd, setZenithShowPwd] = useState(false);
  const [slateRemember, setSlateRemember] = useState(false);
  const [titanLoading, setTitanLoading] = useState(false);
  const [vortexError, setVortexError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVortexError('');
    setTitanLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: apexEmail,
          password: nexusPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVortexError(data.message || 'Login failed');
        setTitanLoading(false);
        return;
      }

      if (data?.data?.requiresOTPVerification) {
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify({ email: data?.data?.email || apexEmail }));
        setTimeout(() => {
          navigate('/academia/auth/verify', { replace: true });
        }, 300);
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      if (slateRemember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect based on role: instructors -> professor dashboard
      const role = (data.data.user?.role || '').toString().toLowerCase();
      const isInstructor = role.includes('instructor') || role.includes('prof') || role.includes('teacher');

      setTimeout(() => {
        if (isInstructor) {
          navigate('/academia/professor', { replace: true });
        } else {
          navigate('/academia/learner/courses', { replace: true });
        }
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      setVortexError(error.message || 'An error occurred during login');
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

        .signin-page-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
        }

        .left-col {
          background: var(--page-bg);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .signin-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 28px 26px;
          box-shadow: 0px 3px 4px 0px #00000008;
          box-sizing: border-box;
        }

        .signin-title {
          font-family: Inter;
          font-weight: 500;
          font-size: 18px;
          line-height: 18px;
          letter-spacing: -1%;
          text-align: center;
          margin: 0;
          color: black;
        }

        .signin-subtitle {
          margin-top: 7px;
          margin-bottom: 0;
          font-family: Inter;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          text-align: center;
          color: var(--text-muted);
        }

        .signin-subtitle a {
          color: var(--primary);
          text-decoration: none;
          margin-left: 6px;
          font-weight: 500;
        }

        .signin-social {
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          padding: 0 20px;
        }

        .social-btn {
          min-height: 32px;
          border: 1px solid var(--field-border);
          border-radius: 8px;
          background: #f8f9fc;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: Inter;
          font-weight: 500;
          font-size: 12px;
          line-height: 12px;
          cursor: pointer;
          color: var(--text-main);
          padding: 0;
        }

        .social-btn .btn-icon {
          width: 16px;
          height: 16px;
          display: inline-block;
          flex: 0 0 auto;
        }

        .social-btn.google .btn-icon {
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          line-height: 16px;
        }

        .social-btn.apple .btn-icon svg {
          width: 16px;
          height: 16px;
          display: block;
          fill: #000000;
        }

        .signin-divider {
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: Inter;
          font-weight: 400;
          font-size: 11px;
          line-height: 12px;
          text-align: center;
          color: #78829D;
        }

        .signin-divider::before,
        .signin-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #d7dce6;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .field-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: Inter;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          color: #071437;
        }

        .field-group > label {
          font-family: Inter;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          color: #071437;
        }

        .field-label-row a {
          text-decoration: none;
          color: var(--primary);
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
          font-family: Inter;
          font-weight: 400;
          font-size: 13px;
          line-height: 14px;
          box-sizing: border-box;
        }

        .input-wrap input::placeholder {
          color: #8a94a9;
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
          background: none;
          border: none;
          padding: 0;
        }

        .input-eye img {
          width: 18px;
          height: 18px;
        }

        .remember-row {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .remember-row input {
          width: 18px;
          height: 18px;
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid #c8cfdb;
          border-radius: 4px;
          background: #f5f7fb;
          accent-color: var(--primary);
          cursor: pointer;
          position: relative;
        }

        .remember-row input:checked {
          background: var(--primary);
          border-color: var(--primary);
        }

        .remember-row input:checked::after {
          content: "";
          position: absolute;
          left: 5px;
          top: 1px;
          width: 4px;
          height: 9px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .submit-btn {
          margin-top: 18px;
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: #ffffff;
          font-family: Inter;
          font-weight: 500;
          font-size: 13px;
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
          max-width: none;
          -webkit-user-drag: none;
          user-select: none;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .signin-page-wrapper {
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

          .signin-title {
            font-size: 18px;
            line-height: 18px;
          }

          .signin-subtitle {
            font-size: 13px;
            line-height: 14px;
          }

          .field-group > label {
            font-size: 14px;
          }

          .signin-social {
            grid-template-columns: 1fr;
          }

          .submit-btn {
            font-size: 17px;
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

            <div className="signin-social">
              <button type="button" className="social-btn google">
                <img className="btn-icon" src={googleIcon} alt="Google" />
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
                  placeholder="email@email.com" 
                  value={apexEmail}
                  onChange={(e) => setApexEmail(e.target.value)}
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
                  type={zenithShowPwd ? "text" : "password"} 
                  placeholder="Enter Password" 
                  value={nexusPassword}
                  onChange={(e) => setNexusPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="input-eye" 
                  onClick={() => setZenithShowPwd(!zenithShowPwd)}
                  aria-label={zenithShowPwd ? "Hide password" : "Show password"}
                >
                  <img src={eyeIcon} alt="Toggle Password Visibility" />
                </button>
              </div>
            </div>

            <label className="remember-row" htmlFor="signinRemember">
              <input 
                id="signinRemember" 
                type="checkbox" 
                checked={slateRemember}
                onChange={(e) => setSlateRemember(e.target.checked)}
                disabled={titanLoading}
              />
              <span>Remember me</span>
            </label>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={titanLoading}
              style={{
                opacity: titanLoading ? 0.7 : 1,
                cursor: titanLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {titanLoading ? 'Signing in...' : 'Sign In'}
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