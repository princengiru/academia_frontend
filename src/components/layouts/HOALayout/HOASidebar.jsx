import React from 'react';

const HOASidebar = ({ currentPage }) => {
  const checkActive = (slug) => (currentPage === slug ? 'active' : '');
  const preventDefault = (e) => e.preventDefault();

  return (
    <aside className="hoa-sidebar">
      
      {/* 1. NEW: Unified Top Header Spanning Both Columns */}
      <div className="sidebar-top-header">
        <div className="brand-logo">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" />
        </div>
        <div className="brand-text">
          <h6>Gonaraza.com</h6>
          <p>All in one digital marketing</p>
        </div>
        <button className="sidebar-toggle" aria-label="Toggle Sidebar">
          <img src="/assets/icons/unfold.svg" alt="Toggle" style={{ width: '16px' }} />
        </button>
      </div>

      {/* 2. Bottom Section Split into Left and Right Columns */}
      <div className="sidebar-bottom-section">
        
        {/* Left Column: First Links */}
        <div className="first-links">
          <div className="sidebar-body">
            <a href="/hoa" className={checkActive('index') || checkActive('learners') || checkActive('tutors') || checkActive('reports') ? 'selected' : ''}>
              <button aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </a>
            <a href="#" onClick={preventDefault}>
              <button aria-label="Management">
                <img src="/assets/icons/bill2.svg" alt="Management" />
              </button>
            </a>
            <a href="#" onClick={preventDefault}>
              <button aria-label="Reports">
                <img src="/assets/icons/agent2.svg" alt="Reports" />
              </button>
            </a>
            <a href="#" onClick={preventDefault}>
              <button aria-label="Chat">
                <img src="/assets/icons/tsidebar2-1.svg" alt="Chat" />
              </button>
            </a>
          </div>

          <div className="sidebar-footer">
            <a href="#" onClick={preventDefault}>
              <button aria-label="Help & FAQs">
                <img src="/assets/icons/tsidebar7-1.svg" alt="Help" />
              </button>
            </a>
            <a href="/hoa/settings" className={checkActive('settings') ? 'selected' : ''}>
              <button aria-label="Settings">
                <img src="/assets/icons/ss1.svg" alt="Settings" />
              </button>
            </a>
            <button className="js-logout-btn no-logout-text" aria-label="Logout">
              <img src="/assets/icons/exit-right.svg" alt="Logout" />
            </button>
          </div>
        </div>

        {/* Right Column: Second Links */}
        <div className="second-links">
          <div className="links-container">
            <form onSubmit={preventDefault}>
              <img src="/assets/icons/magnifier.svg" alt="Search" className="search-icon" />
              <input type="search" placeholder="Search any tab ..." />
            </form>
            
            <div className="links-list">
              <h6>DASHBOARD</h6>
              <a href="/hoa" className={checkActive('index')}>
                <span>Home</span>
              </a>
              <a href="/hoa/learners" className={checkActive('learners')}>
                <span>Learners</span>
              </a>
              <a href="/hoa/tutors" className={checkActive('tutors')}>
                <span>Tutors</span>
              </a>
              <a href="/hoa/reports" className={checkActive('reports')}>
                <span>Reports</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default HOASidebar;