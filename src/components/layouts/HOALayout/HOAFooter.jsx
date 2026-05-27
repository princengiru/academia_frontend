import React from 'react';

const HOAFooter = () => {
  return (
    <footer className="hoa-footer">
      <div className="hoa-footer-brand">
        <img src="/assets/icons/Favicon.svg" alt="Gonaraza" />
        <div className="brand-text">
          <h6>Gonaraza.com</h6>
          <p>All in one digital marketing</p>
        </div>
      </div>
      
      <div className="hoa-footer-links">
        <span>© Copyright {new Date().getFullYear()} All Right Reserved By Naraza Group Ltd</span>
        <span className="sep">|</span>
        <a href="#">Privacy and Policy</a>
        <span className="sep">|</span>
        <a href="#">Terms and Condition</a>
      </div>
    </footer>
  );
};

export default HOAFooter;