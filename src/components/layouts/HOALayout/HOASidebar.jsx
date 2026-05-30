import { NavLink } from 'react-router-dom';

const HOASidebar = ({ currentPage }) => {
  const preventDefault = (e) => e.preventDefault();
  const dashboardPages = ['index', 'learners', 'tutors', 'reports', 'settings'];
  const getIconClassName = ({ isActive }) => (isActive || dashboardPages.includes(currentPage) ? 'selected' : '');
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
            <NavLink to="/academia/hoa" end className={getIconClassName}>
              <button aria-label="Dashboard">
                <img src="/assets/icons/home-2.svg" alt="Dashboard" />
              </button>
            </NavLink>
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
            <NavLink to="/academia/hoa/settings" className={getIconClassName}>
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
          </div>
        </div>

      </div>
    </aside>
  );
};

export default HOASidebar;