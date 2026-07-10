import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Assets (Update paths to match your React project structure)
import googleIcon from '../../../assets/icons/google.svg';
import eyeIcon from '../../../assets/icons/eye.svg';
import bgVisual from '../../../assets/imgs/bg.png';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AcademiaSignUp() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  // --- Standardized State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('student');
  const [roleOpen, setRoleOpen] = useState(false);
  const [showGoogleRoleModal, setShowGoogleRoleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState('student');

  // --- Click Outside to Close Dropdown ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept Terms & Conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
          is_active: role === 'instructor' ? 0 : 1, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Handle Registration OTP Verification Flow
      if (data?.data?.requiresOTPVerification) {
        setSuccess('Registration successful. Redirecting to verification...');
        localStorage.removeItem('token');
        localStorage.setItem('user', JSON.stringify({ email: data?.data?.email || email }));
        localStorage.setItem('verifyEndpoint', '/api/auth/verify-registration-otp');
        setTimeout(() => {
          navigate('/academia/auth/verify', { replace: true });
        }, 1500); // 1.5 second delay to show the message
        return;
      }

      // Fallback for when registration doesn't require OTP
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      if (data.data.profileCompleted !== undefined) {
        localStorage.setItem('profileCompleted', data.data.profileCompleted);
      }

      // Redirect based on selected role
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      setTimeout(() => {
        if (redirectAfterLogin) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectAfterLogin, { replace: true });
        } else if (role === 'student') {
          navigate('/academia/learner/settings', { replace: true });
        } else {
          // If they are an instructor (is_active: 0), you might want to route them 
          // to a specific "Pending Approval" page rather than the index, depending on your flow.
          navigate('/academia/index', { replace: true });
        }
      }, 500);

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
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

        /* Scoped to prevent CSS leakage */
        .signup-page-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
        }

        .signup-page-wrapper .left-col {
          background: var(--page-bg);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .signup-page-wrapper .signin-card {
          width: 100%;
          max-width: 420px;
          background: white;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 28px 26px;
          box-shadow: 0px 3px 4px 0px #00000008;
          box-sizing: border-box;
        }

        .signup-page-wrapper .signin-title {
          font-weight: 500;
          font-size: 20px;
          text-align: center;
          margin: 0;
          color: black;
        }

        .signup-page-wrapper .signin-subtitle {
          margin-top: 8px;
          margin-bottom: 0;
          font-weight: 400;
          font-size: 14px;
          text-align: center;
          color: var(--text-muted);
        }

        .signup-page-wrapper .signin-subtitle a {
          color: var(--primary);
          text-decoration: none;
          margin-left: 6px;
          font-weight: 500;
        }

        .signup-page-wrapper .signin-social {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 10px;
        }

        .signup-page-wrapper .social-btn {
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

        .signup-page-wrapper .social-btn:hover {
          background: #f8f9fc;
        }

        .signup-page-wrapper .social-btn .btn-icon {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-page-wrapper .social-btn.apple .btn-icon svg {
          width: 16px;
          height: 16px;
          fill: #000000;
        }

        .signup-page-wrapper .signin-divider {
          margin: 24px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 400;
          font-size: 12px;
          color: #78829D;
        }

        .signup-page-wrapper .signin-divider::before,
        .signup-page-wrapper .signin-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #d7dce6;
        }

        .signup-page-wrapper .field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 18px;
        }

        .signup-page-wrapper .field-group > label {
          font-weight: 500;
          font-size: 13px;
          color: #071437;
        }

        .signup-page-wrapper .input-wrap {
          position: relative;
        }

        .signup-page-wrapper .input-wrap input {
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

        .signup-page-wrapper .input-wrap input::placeholder {
          color: #a1a5b7;
        }

        .signup-page-wrapper .input-wrap input:focus {
          border-color: var(--primary);
        }

        .signup-page-wrapper .input-wrap.password input {
          padding-right: 40px;
        }

        .signup-page-wrapper .input-eye {
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

        .signup-page-wrapper .btn-outline-secondary {
          background: #fff;
          color: #2e3a54;
          border-color: var(--field-border);
        }

        .signup-page-wrapper .remember-row {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #4B5675;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
        }

        .signup-page-wrapper .remember-row input {
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

        .signup-page-wrapper .remember-row input:checked {
          background: var(--primary);
          border-color: var(--primary);
        }

        .signup-page-wrapper .remember-row input:checked::after {
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

        .signup-page-wrapper .submit-btn {
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

        .signup-page-wrapper .submit-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .signup-page-wrapper .right-col {
          height: 100vh;
          background: #f5f7fb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-page-wrapper .right-col img {
          display: block;
          height: 100vh;
          width: auto;
          max-width: none;
          object-fit: cover;
        }

        @media (max-width: 900px) {
          .signup-page-wrapper {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
            overflow: auto;
          }
          .signup-page-wrapper .right-col {
            display: none; /* Usually better to hide illustration on mobile auth pages */
          }
        }
      `}</style>
      
      <main className="signup-page-wrapper">
        <section className="left-col">
          <form className="signin-card" onSubmit={handleSubmit}>
            <h1 className="signin-title">Create an Account</h1>
            <p className="signin-subtitle">
              Already have an account? <a href="/academia/auth/signin">Sign in</a>
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

            {success && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #6EE7B7',
                borderRadius: '8px',
                color: '#059669',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {success}
              </div>
            )}

            <div className="signin-social">
              <button
                type="button"
                className="social-btn google"
                onClick={() => setShowGoogleRoleModal(true)}
              >
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
              <label>Role</label>
              <div className="input-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                  aria-haspopup="listbox"
                  aria-expanded={roleOpen}
                  onClick={() => setRoleOpen(!roleOpen)}
                  style={{
                    height: '42px', borderRadius: '8px', padding: '0 14px', fontSize: '14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  {role === 'student' ? 'Student' : 'Instructor'}
                </button>

                {roleOpen && (
                  <ul role="listbox" className="dropdown-menu show" style={{ width: '100%', marginTop: '4px', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <li>
                      <button type="button" className="dropdown-item" style={{ padding: '10px 16px' }} onClick={() => { setRole('student'); setRoleOpen(false); }}>
                        Student
                      </button>
                    </li>
                    <li>
                      <button type="button" className="dropdown-item" style={{ padding: '10px 16px' }} onClick={() => { setRole('instructor'); setRoleOpen(false); }}>
                        Instructor
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="signupEmail">Email</label>
              <div className="input-wrap">
                <input 
                  id="signupEmail" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="signupPassword">Password</label>
              <div className="input-wrap password">
                <input 
                  id="signupPassword" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
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
                  <img src={eyeIcon} alt="Toggle visibility" />
                </button>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="signupConfirm">Confirm Password</label>
              <div className="input-wrap password">
                <input 
                  id="signupConfirm" 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="Re-enter password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="input-eye" 
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  <img src={eyeIcon} alt="Toggle visibility" />
                </button>
              </div>
            </div>

            <label className="remember-row" htmlFor="signupTerms">
              <input 
                id="signupTerms" 
                type="checkbox" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={isLoading}
                required
              />
              <span>I accept the Terms &amp; Conditions</span>
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Academia Learning Platform Signup" draggable="false" />
        </section>
      </main>

      {showGoogleRoleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ marginBottom: '12px', fontSize: '24px', fontWeight: '700', color: '#111827', textAlign: 'center' }}>Choose your role</h3>
            <p style={{ marginBottom: '32px', fontSize: '15px', color: '#6B7280', textAlign: 'center' }}>
              How do you want to use the platform?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', padding: '14px 18px', border: `2px solid ${googleRole === 'student' ? '#450468' : '#E5E7EB'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: googleRole === 'student' ? 'rgba(69, 4, 104, 0.05)' : '#fff'
              }}>
                <input
                  type="radio"
                  name="googleRole"
                  value="student"
                  checked={googleRole === 'student'}
                  onChange={(e) => setGoogleRole(e.target.value)}
                  style={{ marginRight: '16px', accentColor: '#450468', transform: 'scale(1.3)' }}
                />
                <div>
                  <span style={{ fontWeight: '600', color: '#111827', display: 'block', fontSize: '15px' }}>Student / Learner</span>
                  <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px', display: 'block' }}>I want to learn and take courses</span>
                </div>
              </label>

              <label style={{
                display: 'flex', alignItems: 'center', padding: '14px 18px', border: `2px solid ${googleRole === 'instructor' ? '#450468' : '#E5E7EB'}`,
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: googleRole === 'instructor' ? 'rgba(69, 4, 104, 0.05)' : '#fff'
              }}>
                <input
                  type="radio"
                  name="googleRole"
                  value="instructor"
                  checked={googleRole === 'instructor'}
                  onChange={(e) => setGoogleRole(e.target.value)}
                  style={{ marginRight: '16px', accentColor: '#450468', transform: 'scale(1.3)' }}
                />
                <div>
                  <span style={{ fontWeight: '600', color: '#111827', display: 'block', fontSize: '15px' }}>Instructor / Professor</span>
                  <span style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px', display: 'block' }}>I want to teach and manage students</span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setShowGoogleRoleModal(false)}
                style={{ flex: 1, padding: '14px', border: '1px solid #D1D5DB', borderRadius: '10px', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '15px' }}
                onMouseOver={(e) => e.target.style.background = '#F3F4F6'}
                onMouseOut={(e) => e.target.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/google?role=${googleRole}`; }}
                style={{ flex: 1, padding: '14px', border: 'none', borderRadius: '10px', background: '#450468', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', fontSize: '15px' }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                <img src={googleIcon} alt="Google" style={{ width: '18px', filter: 'brightness(0) invert(1)' }} />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AcademiaSignUp;