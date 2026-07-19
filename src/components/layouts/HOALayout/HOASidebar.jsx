import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HOA_BRAND_SHORT, HOA_PRODUCT_TAGLINE } from '../../../pages/academia/hoa/hoaBrand';

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

const HOASidebar = ({ currentPage, isOpen = false, onClose, onLogout }) => {
  const navigate = useNavigate();

  const dashboardPages = ['index', 'learners', 'tutors', 'reports', 'finance', 'settings'];
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
    <aside className={`hoa-sidebar${isOpen ? ' open' : ''}`} id="hoa-sidebar">
      <div className="sidebar-top-header">
        <div className="brand-logo">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" />
        </div>
        <div className="brand-text">
          <h6>{HOA_BRAND_SHORT}</h6>
          <p>{HOA_PRODUCT_TAGLINE}</p>
        </div>
        <button
          type="button"
          className="sidebar-toggle hoa-sidebar-close"
          aria-label="Close menu"
          onClick={onClose}
        >
          <img src="/assets/icons/Close_SM.svg" alt="" style={{ width: '14px' }} />
        </button>
      </div>

      <div className="sidebar-bottom-section">
        <div className="first-links">
          <div className="sidebar-body">
            <NavLink to="/academia/hoa" className={getDashboardIconClassName} onClick={onClose}>
              <button type="button" aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/assignments" className={getManagementIconClassName} onClick={onClose}>
              <button type="button" aria-label="Management">
                <img src="/assets/icons/bill2.svg" alt="Management" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/syllabus" className={getUploadIconClassName} onClick={onClose}>
              <button type="button" aria-label="Uploads">
                <img src="/assets/icons/agent2.svg" alt="Uploads" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/events-planning" className={getPlanningIconClassName} onClick={onClose}>
              <button type="button" aria-label="Plannings">
                <img src="/assets/icons/mouse-square.svg" alt="Plannings" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/account" className={getAccountIconClassName} onClick={onClose}>
              <button type="button" aria-label="Account">
                <img src="/assets/icons/ss1.svg" alt="Account" />
              </button>
            </NavLink>
          </div>

          <div className="sidebar-footer">
            <NavLink to="/academia/help" aria-label="Help & FAQs" onClick={onClose}>
              <button type="button" aria-label="Help & FAQs">
                <img src="/assets/icons/tsidebar7-1.svg" alt="" />
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

        <div className="second-links">
          <div className="links-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <img src="/assets/icons/magnifier.svg" alt="" className="search-icon" />
              <input type="search" placeholder="Search any tab ..." aria-label="Search menu" />
            </form>

            {dashboardPages.includes(currentPage) && (
              <div className="links-list">
                <h6>DASHBOARD</h6>
                <NavLink to="/academia/hoa" end className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Home</span>
                </NavLink>
                <NavLink to="/academia/hoa/learners" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Learners</span>
                </NavLink>
                <NavLink to="/academia/hoa/tutors" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Tutors</span>
                </NavLink>
                <NavLink to="/academia/hoa/reports" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Reports</span>
                </NavLink>
                <NavLink to="/academia/hoa/finance" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Finance</span>
                </NavLink>
              </div>
            )}

            {managementPages.includes(currentPage) && (
              <div className="links-list">
                <h6>MANAGEMENT</h6>
                <NavLink to="/academia/hoa/assignments" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Assignments</span>
                </NavLink>
                <NavLink to="/academia/hoa/passed-courses" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Passed Courses</span>
                </NavLink>
                <NavLink to="/academia/hoa/retaken-courses" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Retaken Courses</span>
                </NavLink>
                <NavLink to="/academia/hoa/failed-courses" className={getSidebarLinkClassName} onClick={onClose}>
                  <span>Failed Courses</span>
                </NavLink>
              </div>
            )}

            {uploadsPanelPages.includes(currentPage) && (
              <div className="links-list">
                <h6>UPLOADS</h6>
                {UPLOAD_NAV_ITEMS.map(({ label, to }) => (
                  <NavLink key={to} to={to} className={getSidebarLinkClassName} onClick={onClose}>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}

            {planningPages.includes(currentPage) && (
              <div className="links-list">
                <h6>PLANNINGS</h6>
                {PLANNING_NAV_ITEMS.map(({ label, to }) => (
                  <NavLink key={to} to={to} className={getSidebarLinkClassName} onClick={onClose}>
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
