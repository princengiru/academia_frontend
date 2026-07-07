import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ currentPage, profileLoading, profileSummary, profileCompletion, profileError, onLogout }) => {
  const navigate = useNavigate();
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

        <Link to="/academia/professor" className={checkActive('index')}>
          <img src="/assets/icons/home-2.svg" alt="Home" />
          <span>Home</span>
        </Link>

        <Link to="/academia/professor/assignments" className={checkActive('assignments')}>
          <img src="/assets/icons/lea3.svg" alt="Assessments" />
          <span>Assessments</span>
        </Link>
        <Link to="/academia/professor/projects" className={checkActive('projects')}>
          <img src="/assets/icons/pi1.svg" alt="My Projects" />
          <span>My Projects</span>
          <span className="prof-sidebar-badge">4</span>
        </Link>
        <Link to="/academia/professor/performance" className={checkActive('performance')}>
          <img src="/assets/icons/pi2.svg" alt="Performance" />
          <span>Performance</span>
        </Link>
        <button type="button" className="prof-sidebar-action" onClick={preventDefault}>
          <img src="/assets/icons/pi2.svg" alt="Analytics" />
          <span>Analytics & Payments</span>
        </button>
        <Link 
          to="/academia/professor/management" 
          className={['management', 'management-schedule', 'management-lessons-ranks', 'management-student-qa'].includes(currentPage) ? 'active-menu' : ''}
        >
          <img src="/assets/icons/pi3.svg" alt="Management" />
          <span>Management</span>
        </Link>
        <Link to="/academia/professor/settings" className={checkActive('settings')}>
          <img src="/assets/icons/setting-2.svg" alt="Settings" />
          <span>Settings</span>
        </Link>
      </div>

      {/* <div className="sidebar-events prof-sidebar-events">
        <button type="button" className="prof-sidebar-events-link" onClick={preventDefault}>
          <p>2 Events Pending</p>
          <p>&gt;</p>
        </button>
      </div> */}

      <div className="prof-sidebar-progress">
        <div className="prof-sidebar-progress-head">
          <h6>Profile completion</h6>
          <strong>{profileLoading ? '...' : `${profileCompletion}%`}</strong>
        </div>
        <p>
          {profileLoading
            ? 'Loading profile data from the backend.'
            : profileError || 'Backed by your saved profile data.'}
        </p>
        <div className="progress" role="progressbar" aria-label="Profile completion" aria-valuenow={profileCompletion} aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar" style={{ width: `${profileCompletion}%` }}></div>
        </div>
      </div>

      <div className="sidebar-advertise prof-sidebar-advertise">
        <h6>Advertise your projects.</h6>
        <p>Do you have a business and your clients don't know where to find you ?</p>
        <button type="button" onClick={preventDefault}>Start now</button>
      </div>

      <div className="prof-sidebar-profile">
        <div 
          className="prof-sidebar-profile-left"
          onClick={() => navigate('/academia/professor/account')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/academia/professor/account'); }}
          aria-label="Go to account settings"
        >
          <div className="prof-sidebar-profile-img">
            <img src={profileSummary?.avatar || '/assets/imgs/default-profile.png'} alt="Profile" />
          </div>
          <div className="prof-sidebar-profile-text">
            <h6>{profileLoading ? 'Loading...' : `Hi, ${profileSummary?.name || 'Professor'}`}</h6>
            <p>{profileLoading ? 'Please wait' : profileSummary?.role || 'instructor'}</p>
          </div>
        </div>
        <div className="prof-sidebar-profile-right">
          <button type="button" className="prof-icon-btn" aria-label="Logout" onClick={onLogout || preventDefault}>
            <img src="/assets/icons/exit-right.svg" alt="Logout" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;