import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HOASidebar from './HOASidebar';
import HOATopbar from './HOATopbar';
import HOAFooter from './HOAFooter';
import './hoa-layout.css';

const HOALayout = ({ children, currentPage: propCurrentPage }) => {
  const location = useLocation();

  // --- Auto-detect Current Page ---
  // If a prop isn't passed, it intelligently reads the URL to tell the sidebar what's active.
  const derivedPage = location.pathname.split('/').filter(Boolean).pop();
  
  // If the path is exactly '/academia/hoa', set it to 'index' for the sidebar matching logic
  const currentPage = propCurrentPage || (derivedPage === 'hoa' ? 'index' : derivedPage);

  // --- Scoped Body Styling ---
  useEffect(() => {
    document.body.setAttribute('data-role', 'hoa');
    return () => {
      document.body.removeAttribute('data-role');
    };
  }, []);

  return (
    <div className="hoa-dashboard-wrapper animate-fade-in">
      
      {/* Sidebar */}
      <HOASidebar currentPage={currentPage} />
      
      {/* Main Content Area */}
      <div className="hoa-main-container">
        <HOATopbar />
        
        {/* Render explicitly passed children OR dynamically load via React Router Outlet */}
        <main className="hoa-content-area">
          {children || <Outlet />}
        </main>
        
        <HOAFooter />
      </div>
      
    </div>
  );
};

export default HOALayout;