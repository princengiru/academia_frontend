import React from 'react';

const HOAFooter = () => {
  return (
    <footer className="hoa-footer">
      <div className="hoa-footer-brand">
        <img src="/assets/icons/Favicon.svg" alt="Gonaraza" />
        <span>Gonaraza.com<br/><small>All in one digital marketing</small></span>
      </div>
      <div className="hoa-footer-links">
        <span>© Copyright {new Date().getFullYear()} All Right Reserved By Naraza Group Ltd</span>
        <a href="#">Privacy and Policy</a>
        <span className="sep">|</span>
        <a href="#">Terms and Condition</a>
      </div>
    </footer>
  );
};

export default HOAFooter;