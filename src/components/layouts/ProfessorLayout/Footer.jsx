import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="prof-footer" role="contentinfo">
      <div className="prof-footer-inner">
        <p>{currentYear}© gonaraza.com</p>
        <nav className="prof-footer-links" aria-label="Footer">
          <a href="/academia/index">About</a>
          <a href="/academia/professor/management">Courses</a>
          <a href="/academia/professor/account">Account</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
