import React from 'react';

const Sidebar = ({ currentPage }) => {
  const checkActive = (slug) => (currentPage === slug ? 'active-menu' : '');
  const preventDefault = (e) => e.preventDefault();

  return (
    <section className="sidebar" id="sidebar">
      <div className="sidebar-header prof-sidebar-header">
        <div className="prof-brand">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" className="prof-brand-icon" />
          <div className="prof-brand-text">
            <h6>Gonaraza.com</h6>
            <p>All in one digital marketing</p>
          </div>
        </div>
      </div>

      <div className="sidebar-body prof-sidebar-body">
        <form className="prof-sidebar-search" role="search" onSubmit={preventDefault}>
          <input type="search" placeholder="Search" aria-label="Search" />
          <img src="/assets/icons/magnifier.svg" alt="Search" />
        </form>

        <a href="/professor" className={checkActive('index')}>
          <img src="/assets/icons/home-2.svg" alt="Home" />
          <span>Home</span>
        </a>
        <a href="/professor/prepare-course" className={checkActive('prepare-course')}>
          <img src="/assets/icons/lea3.svg" alt="Prepare Course" />
          <span>Prepare Course</span>
        </a>
        <a href="/professor/assignments" className={checkActive('assignments')}>
          <img src="/assets/icons/lea3.svg" alt="Assessments" />
          <span>Assessments</span>
        </a>
        <a href="/professor/projects" className={checkActive('projects')}>
          <img src="/assets/icons/pi1.svg" alt="My Projects" />
          <span>My Projects</span>
          <span className="prof-sidebar-badge">4</span>
        </a>
        <a href="/professor/performance" className={checkActive('performance')}>
          <img src="/assets/icons/pi2.svg" alt="Performance" />
          <span>Performance</span>
        </a>
        <a href="#" onClick={preventDefault}>
          <img src="/assets/icons/pi2.svg" alt="Analytics" />
          <span>Analytics & Payments</span>
        </a>
        <a 
          href="/professor/management" 
          className={['management', 'management-schedule', 'management-lessons-ranks', 'management-student-qa'].includes(currentPage) ? 'active-menu' : ''}
        >
          <img src="/assets/icons/pi3.svg" alt="Management" />
          <span>Management</span>
        </a>
        <a href="/professor/settings" className={checkActive('settings')}>
          <img src="/assets/icons/setting-2.svg" alt="Settings" />
          <span>Settings</span>
        </a>
      </div>

      <div className="sidebar-events prof-sidebar-events">
        <a href="#" onClick={preventDefault}>
          <p>2 Events Pending</p>
          <p>&gt;</p>
        </a>
      </div>

      <div className="sidebar-advertise prof-sidebar-advertise">
        <h6>Advertise your projects.</h6>
        <p>Do you have a business and your clients don't know where to find you ?</p>
        <button type="button" onClick={preventDefault}>Start now</button>
      </div>

      <div className="prof-sidebar-profile">
        <div className="prof-sidebar-profile-left">
          <div className="prof-sidebar-profile-img">
            <img src="/assets/imgs/default-profile.png" alt="Profile" />
          </div>
          <div className="prof-sidebar-profile-text">
            <h6>Hi, Emmanuel</h6>
            <p>Personal User</p>
          </div>
        </div>
        <div className="prof-sidebar-profile-right">
          <a href="/professor/settings" className="prof-icon-btn" aria-label="Settings">
            <img src="/assets/icons/setting-2.svg" alt="Settings" />
          </a>
          <button type="button" className="prof-icon-btn" aria-label="Logout" onClick={preventDefault}>
            <img src="/assets/icons/exit-right.svg" alt="Logout" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;