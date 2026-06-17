import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const HOASidebar = ({ currentPage, onLogout }) => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  
  // Categorization for the dual-column layout
  const dashboardPages = ['index', 'learners', 'tutors', 'reports', 'settings'];
  const managementPages = ['assignments', 'passed-courses', 'retaken-courses', 'failed-courses'];

  const getDashboardIconClassName = () => (dashboardPages.includes(currentPage) ? 'selected' : '');
  const getManagementIconClassName = () => (managementPages.includes(currentPage) ? 'selected' : '');

  const getSidebarLinkClassName = ({ isActive }) => (isActive ? 'active' : '');

  const handleLogout = (e) => {
    if (onLogout) {
      onLogout(e);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/academia/auth/signin');
    }
  };

  return (
    <aside className="hoa-sidebar">

      {/* 1. Unified Top Header Spanning Both Columns */}
      <div className="sidebar-top-header">
        <div className="brand-logo">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" />
        </div>
        <div className="brand-text">
          <h6>Gonaraza.com</h6>
          <p>All in one digital marketing</p>
        </div>
        <button type="button" className="sidebar-toggle" aria-label="Toggle Sidebar">
          <img src="/assets/icons/unfold.svg" alt="Toggle" style={{ width: '16px' }} />
        </button>
      </div>

      {/* 2. Bottom Section Split into Left and Right Columns */}
      <div className="sidebar-bottom-section">

        {/* --- Left Column: Primary Icons --- */}
        <div className="first-links">
          <div className="sidebar-body">
            <NavLink to="/academia/hoa" end className={getDashboardIconClassName}>
              <button type="button" aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/assignments" className={getManagementIconClassName}>
              <button type="button" aria-label="Management">
                <img src="/assets/icons/bill2.svg" alt="Management" />
              </button>
            </NavLink>
            <a href="#reports" onClick={preventDefault}>
              <button type="button" aria-label="Reports">
                <img src="/assets/icons/agent2.svg" alt="Reports" />
              </button>
            </a>
            <a href="#chat" onClick={preventDefault}>
              <button type="button" aria-label="Chat">
                <img src="/assets/icons/tsidebar2-1.svg" alt="Chat" />
              </button>
            </a>
          </div>

          <div className="sidebar-footer">
            <a href="#help" onClick={preventDefault}>
              <button type="button" aria-label="Help & FAQs">
                <img src="/assets/icons/tsidebar7-1.svg" alt="Help" />
              </button>
            </a>
            <NavLink to="/academia/hoa/settings" className={getDashboardIconClassName}>
              <button type="button" aria-label="Settings">
                <img src="/assets/icons/ss1.svg" alt="Settings" />
              </button>
            </NavLink>
            <button 
              type="button" 
              className="js-logout-btn no-logout-text" 
              aria-label="Logout"
              onClick={handleLogout}
            >
              <img src="/assets/icons/exit-right.svg" alt="Logout" />
            </button>
          </div>
        </div>

        {/* --- Right Column: Sub-menus --- */}
        <div className="second-links">
          <div className="links-container">
            <form onSubmit={preventDefault}>
              <img src="/assets/icons/magnifier.svg" alt="Search" className="search-icon" />
              <input type="search" placeholder="Search any tab ..." />
            </form>

            {/* Render Dashboard Sub-links */}
            {dashboardPages.includes(currentPage) && (
              <div className="links-list">
                <h6>DASHBOARD</h6>
                <NavLink to="/academia/hoa" end className={getSidebarLinkClassName}>
                  <span>Home</span>
                </NavLink>
                <NavLink to="/academia/hoa/learners" className={getSidebarLinkClassName}>
                  <span>Learners</span>
                </NavLink>
                <NavLink to="/academia/hoa/tutors" className={getSidebarLinkClassName}>
                  <span>Tutors</span>
                </NavLink>
                <NavLink to="/academia/hoa/reports" className={getSidebarLinkClassName}>
                  <span>Reports</span>
                </NavLink>
              </div>
            )}

            {/* Render Management Sub-links */}
            {managementPages.includes(currentPage) && (
              <div className="links-list">
                <h6>MANAGEMENT</h6>
                <NavLink to="/academia/hoa/assignments" className={getSidebarLinkClassName}>
                  <span>Assignments</span>
                </NavLink>
                <NavLink to="/academia/hoa/passed-courses" className={getSidebarLinkClassName}>
                  <span>Passed Courses</span>
                </NavLink>
                <NavLink to="/academia/hoa/retaken-courses" className={getSidebarLinkClassName}>
                  <span>Retaken Courses</span>
                </NavLink>
                <NavLink to="/academia/hoa/failed-courses" className={getSidebarLinkClassName}>
                  <span>Failed Courses</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default HOASidebar;