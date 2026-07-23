import React from 'react';
import { usePublicPageTitle } from '../public/usePublicPageTitle.jsx';

// Assets (Update paths to match your React project structure)
import concordIcon from '../../../assets/icons/concord.svg';
import bgVisual from '../../../assets/imgs/bg.png';

function AcademiaPasswordChanged() {
  usePublicPageTitle('Password changed');
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

        .password-changed-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          height: 100vh;
          width: 100%;
          font-family: "Inter", sans-serif;
          background: var(--page-bg);
          overflow: hidden;
        }

        .password-changed-wrapper * {
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

        .signin-title {
          font-weight: 500;
          font-size: 18px;
          line-height: 18px;
          text-align: center;
          color: #071437;
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
          .password-changed-wrapper {
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

          .status-illustration {
            width: 150px;
          }
        }
      `}</style>

      <main className="password-changed-wrapper">
        <section className="left-col">
          <div className="signin-card">
            <img 
              className="status-illustration" 
              src={concordIcon} 
              alt="Password changed illustration" 
            />

            <h2 className="status-lead">Your password is changed</h2>

            <p className="status-text">
              Your password has been successfully updated.<br />
              Your account's security is our priority.
            </p>

            <a className="submit-btn" href="/auth/signin">
              Sign in
            </a>
          </div>
        </section>

        <section className="right-col">
          <img src={bgVisual} alt="Platform Visual Background" draggable="false" />
        </section>
      </main>
    </>
  );
}

export default AcademiaPasswordChanged;