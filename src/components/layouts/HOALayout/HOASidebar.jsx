import React from 'react';

const HOASidebar = ({ currentPage }) => {
  const checkActive = (slug) => (currentPage === slug ? 'is-active' : '');
  const preventDefault = (e) => e.preventDefault();

  return (
    <aside className="hoa-sidebar">
      <div className="hoa-sidebar-header">
        <div className="hoa-brand">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" className="hoa-brand-icon" />
          <div className="hoa-brand-text">
            <h6>Gonaraza.com</h6>
            <p>All in one digital marketing</p>
          </div>
        </div>
        <button className="hoa-sidebar-toggle" aria-label="Toggle Sidebar">
          <img src="/assets/icons/left1.svg" alt="" />
        </button>
      </div>

      <div className="hoa-sidebar-search">
        <img src="/assets/icons/magnifier.svg" alt="" aria-hidden="true" />
        <input type="search" placeholder="Search any tab..." />
      </div>

      <div className="hoa-sidebar-nav">
        <span className="hoa-nav-label">DASHBOARD</span>
        
        <a href="/hoa" className={`hoa-nav-link ${checkActive('index')}`}>
          <img src="/assets/icons/home-2.svg" alt="" />
          <span>Home</span>
        </a>
        <a href="/hoa/learners" className={`hoa-nav-link ${checkActive('learners')}`}>
          <img src="/assets/icons/users.svg" alt="" />
          <span>Learners</span>
        </a>
        <a href="/hoa/tutors" className={`hoa-nav-link ${checkActive('tutors')}`}>
          <img src="/assets/icons/lea3.svg" alt="" />
          <span>Tutors</span>
        </a>
        <a href="/hoa/reports" className={`hoa-nav-link ${checkActive('reports')}`}>
          <img src="/assets/icons/charts.svg" alt="" />
          <span>Reports</span>
        </a>
      </div>

      <div className="hoa-sidebar-footer">
        <a href="/hoa/settings" className="hoa-nav-link" aria-label="Settings">
          <img src="/assets/icons/setting-2.svg" alt="" />
        </a>
        <button className="hoa-user-btn" aria-label="Profile">
          <img src="/assets/imgs/default-profile.png" alt="Profile" />
        </button>
      </div>
    </aside>
  );
};

export default HOASidebar;