import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const preventDefault = (e) => e.preventDefault();

  return (
    <footer className="prof-footer" role="contentinfo">
      <div className="prof-footer-inner">
        <p>{currentYear}© gonaraza.com</p>
        <nav className="prof-footer-links" aria-label="Footer">
          <a href="#" onClick={preventDefault}>About</a>
          <a href="#" onClick={preventDefault}>Support</a>
          <a href="#" onClick={preventDefault}>Purchase</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;