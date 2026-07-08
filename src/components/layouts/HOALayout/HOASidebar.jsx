import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const UPLOAD_NAV_ITEMS = [
  { label: 'Syllabus', to: '/academia/hoa/syllabus', page: 'syllabus' },
  { label: 'Online Courses', to: '/academia/hoa/online-courses', page: 'online-courses' },
  { label: 'Projects', to: '/academia/hoa/projects', page: 'projects' },
  { label: 'Certificates', to: '/academia/hoa/certificates', page: 'certificates' },
];

const PLANNING_NAV_ITEMS = [
  { label: 'Events & Planning', to: '/academia/hoa/events-planning', page: 'events-planning' },
  { label: 'E-Travel', to: '/academia/hoa/e-travel', page: 'e-travel' },
  { label: 'Terms & Conditions', to: '/academia/hoa/terms-conditions', page: 'terms-conditions' },
  { label: 'Community', to: '/academia/hoa/community', page: 'community' },
];

const HOASidebar = ({ currentPage, onLogout }) => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  
  // Categorization for the dual-column layout
  const dashboardPages = ['index', 'learners', 'tutors', 'reports', 'settings'];
  const managementPages = ['assignments', 'passed-courses', 'retaken-courses', 'failed-courses'];
  const uploadPages = ['syllabus', 'online-courses', 'projects', 'certificates'];
  const uploadsPanelPages = [...uploadPages];
  const planningPages = PLANNING_NAV_ITEMS.map((item) => item.page);

  const getDashboardIconClassName = () => (dashboardPages.includes(currentPage) ? 'selected' : '');
  const getManagementIconClassName = () => (managementPages.includes(currentPage) ? 'selected' : '');
  const getUploadIconClassName = () => (uploadPages.includes(currentPage) ? 'selected' : '');
  const getPlanningIconClassName = () => (planningPages.includes(currentPage) ? 'selected' : '');
  const getAccountIconClassName = () => (currentPage === 'account' ? 'selected' : '');

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
            <NavLink to="/academia/hoa" className={getDashboardIconClassName}>
              <button type="button" aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/assignments" className={getManagementIconClassName}>
              <button type="button" aria-label="Management">
                <img src="/assets/icons/bill2.svg" alt="Management" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/syllabus" className={getUploadIconClassName}>
              <button aria-label="Uploads">
                <img src="/assets/icons/agent2.svg" alt="Uploads" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/events-planning" className={getPlanningIconClassName}>
              <button aria-label="Plannings">
                <img src="/assets/icons/mouse-square.svg" alt="Plannings" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/account" className={getAccountIconClassName}>
              <button type="button" aria-label="Account">
                <img src="/assets/icons/ss1.svg" alt="Account" />
              </button>
            </NavLink>
          </div>

          <div className="sidebar-footer">
            <a href="#help" onClick={preventDefault}>
              <button type="button" aria-label="Help & FAQs">
                <img src="/assets/icons/tsidebar7-1.svg" alt="Help" />
              </button>
            </a>
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

            {uploadsPanelPages.includes(currentPage) && (
              <div className="links-list">
                <h6>UPLOADS</h6>
                {UPLOAD_NAV_ITEMS.map(({ label, to }) => (
                  <NavLink key={to} to={to} className={getSidebarLinkClassName}>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}

            {planningPages.includes(currentPage) && (
              <div className="links-list">
                <h6>PLANNINGS</h6>
                {PLANNING_NAV_ITEMS.map(({ label, to }) => (
                  <NavLink key={to} to={to} className={getSidebarLinkClassName}>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default HOASidebar;