import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  PROFESSOR_PRODUCT_NAME,
  PROFESSOR_PRODUCT_TAGLINE,
} from '../../../pages/academia/professor/professorBrand';

const Sidebar = ({
  currentPage,
  profileLoading,
  profileSummary,
  profileCompletion,
  profileError,
  onRetryProfile,
  onLogout,
  projectsCount = 0,
  isOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const linkClassName = ({ isActive }) => (isActive ? 'active-menu' : '');
  const managementActive = ['management', 'management-schedule', 'management-lessons-ranks', 'management-student-qa'].includes(currentPage);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    onClose?.();
    if (!query) {
      navigate('/professor/assignments');
      return;
    }
    navigate(`/professor/assignments?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-header prof-sidebar-header">
        <div className="prof-brand">
          <img src="/assets/icons/Favicon.svg" alt="Gonaraza" className="prof-brand-icon" />
          <div className="prof-brand-text">
            <h6>{PROFESSOR_PRODUCT_NAME}</h6>
            <p>{PROFESSOR_PRODUCT_TAGLINE}</p>
          </div>
        </div>
        <button
          type="button"
          className="prof-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <img src="/assets/icons/acc-minus.svg" alt="" />
        </button>
      </div>

      <div className="sidebar-body prof-sidebar-body">
        <form className="prof-sidebar-search" role="search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search assessments..."
            aria-label="Search assessments"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <img src="/assets/icons/magnifier.svg" alt="" />
        </form>

        <NavLink to="/professor" end className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/home-2.svg" alt="Home" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/professor/assignments" className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/lea3.svg" alt="Assessments" />
          <span>Assessments</span>
        </NavLink>

        <NavLink to="/professor/projects" className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/pi1.svg" alt="My Projects" />
          <span>My Projects</span>
          <span className="prof-sidebar-badge">{projectsCount >= 9 ? '9+' : projectsCount}</span>
        </NavLink>

        <NavLink to="/professor/performance" className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/pi2.svg" alt="Performance" />
          <span>Performance</span>
        </NavLink>

        <NavLink to="/professor/earnings" className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/hoadollar.svg" alt="Earnings" />
          <span>Earnings</span>
        </NavLink>

        <NavLink
          to="/professor/management"
          className={managementActive ? 'active-menu' : ''}
          onClick={onClose}
        >
          <img src="/assets/icons/pi3.svg" alt="Management" />
          <span>Management</span>
        </NavLink>

        <NavLink to="/professor/settings" className={linkClassName} onClick={onClose}>
          <img src="/assets/icons/setting-2.svg" alt="Settings" />
          <span>Settings</span>
        </NavLink>
      </div>

      <div className="prof-sidebar-progress">
        <div className="prof-sidebar-progress-head">
          <h6>Profile completion</h6>
          <strong>{profileLoading ? '...' : `${profileCompletion}%`}</strong>
        </div>
        <p>
          {profileLoading
            ? 'Loading your profile summary…'
            : profileError
              ? profileError
              : 'Complete your profile to unlock the full teaching experience.'}
        </p>
        {profileError && !profileLoading ? (
          <button type="button" className="learners-btn learners-btn-primary prof-sidebar-retry" onClick={onRetryProfile}>
            Try again
          </button>
        ) : null}
        <div className="progress" role="progressbar" aria-label="Profile completion" aria-valuenow={profileCompletion} aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar" style={{ width: `${profileCompletion}%` }}></div>
        </div>
      </div>

      <div className="prof-sidebar-profile">
        <div
          className="prof-sidebar-profile-left"
          onClick={() => {
            onClose?.();
            navigate('/professor/account');
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onClose?.();
              navigate('/professor/account');
            }
          }}
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
          <button type="button" className="prof-icon-btn" aria-label="Logout" onClick={onLogout}>
            <img src="/assets/icons/exit-right.svg" alt="Logout" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
