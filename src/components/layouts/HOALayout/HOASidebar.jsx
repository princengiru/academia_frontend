import { NavLink } from 'react-router-dom';

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

const HOASidebar = ({ currentPage }) => {
  const preventDefault = (e) => e.preventDefault();
  const dashboardPages = ['index', 'learners', 'tutors', 'reports', 'settings'];
  const managementPages = ['assignments', 'passed-courses', 'retaken-courses', 'failed-courses'];
  const uploadPages = ['syllabus', 'online-courses', 'projects', 'certificates'];
  const uploadsPanelPages = [...uploadPages];
  const planningPages = PLANNING_NAV_ITEMS.map((item) => item.page);

  const getDashboardIconClassName = () => (dashboardPages.includes(currentPage) ? 'selected' : '');
  const getManagementIconClassName = () => (managementPages.includes(currentPage) ? 'selected' : '');
  const getUploadIconClassName = () => (uploadPages.includes(currentPage) ? 'selected' : '');
  const getPlanningIconClassName = () => (planningPages.includes(currentPage) ? 'selected' : '');

  const getSidebarLinkClassName = ({ isActive, isPending }) => {
    if (isPending) {
      return '';
    }

    return isActive ? 'active' : '';
  };

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
            <NavLink to="/academia/hoa" end className={getDashboardIconClassName}>
              <button aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </NavLink>
            <NavLink to="/academia/hoa/assignments" className={getManagementIconClassName}>
              <button aria-label="Management">
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
                <img src="/assets/icons/briefcase2.svg" alt="Plannings" />
              </button>
            </NavLink>
          </div>

          <div className="sidebar-footer">
            <a href="#" onClick={preventDefault}>
              <button aria-label="Help & FAQs">
                <img src="/assets/icons/tsidebar7-1.svg" alt="Help" />
              </button>
            </a>
            <NavLink to="/academia/hoa/settings" className={getDashboardIconClassName}>
              <button aria-label="Settings">
                <img src="/assets/icons/ss1.svg" alt="Settings" />
              </button>
            </NavLink>
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