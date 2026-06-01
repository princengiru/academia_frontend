import React, { useEffect } from 'react';
import HOASidebar from './HOASidebar';
import HOATopbar from './HOATopbar';
import HOAFooter from './HOAFooter';
import './hoa-layout.css';

const HOALayout = ({ children, currentPage }) => {
  useEffect(() => {
    document.body.setAttribute('data-role', 'hoa');
    return () => {
      document.body.removeAttribute('data-role');
    };
  }, []);

  return (
    <div className="hoa-dashboard-wrapper">
      <HOASidebar currentPage={currentPage} />
      <div className="hoa-main-container">
        <HOATopbar />
        <main className="hoa-content-area">
          {children}
        </main>
        <HOAFooter />
      </div>
    </div>
  );
};

export default HOALayout;