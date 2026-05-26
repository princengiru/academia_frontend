import { useEffect, useLayoutEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import './learners-layout.css';
import learnersBrandIcon from '../../assets/icons/Favicon.svg';
import learnersSearchIcon from '../../assets/icons/magnifier.svg';
import learnersHomeIcon from '../../assets/icons/home-2.svg';
import learnersCoursesIcon from '../../assets/icons/lea1.svg';
import learnersPerformanceIcon from '../../assets/icons/lea2.svg';
import learnersTestIcon from '../../assets/icons/lea3.svg';
import learnersProjectsIcon from '../../assets/icons/lea4.svg';
import learnersCertificatesIcon from '../../assets/icons/lea5.svg';
import learnersSettingsIcon from '../../assets/icons/setting-2.svg';
import learnersProfileImage from '../../assets/imgs/default-profile.png';
import learnersLogoutIcon from '../../assets/icons/exit-right.svg';
import learnersAppsIcon from '../../assets/icons/header-grid.svg';
import learnersFlagIcon from '../../assets/icons/rwanda.svg';
import learnersDropdownIcon from '../../assets/icons/drop1.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LearnersLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSummary, setProfileSummary] = useState({
    name: '',
    email: '',
    role: '',
    avatar: learnersProfileImage,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState('');

  const openLogoutModal = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setShowLogoutModal(true);
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
    setShowLogoutModal(false);
    navigate('/academia/auth/signin');
  };
  const linkClassName = ({ isActive }) => (isActive ? 'active-menu' : '');

  if (!token) {
    return <Navigate to="/academia/auth/signin" replace />;
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        const user = data?.data?.user || {};

        const resolveAssetUrl = (value) => {
          if (!value) return learnersProfileImage;
          if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
          if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
          return `${API_BASE_URL}/${value}`;
        };

        setProfileSummary({
          name: user.name || user.email || 'Learner',
          email: user.email || '',
          role: user.role || 'learner',
          avatar: resolveAssetUrl(user.avatar),
        });
        setProfileCompletion(Number(data?.data?.profilePercentage || 0));
        setProfileError('');
      } catch (error) {
        setProfileError(error.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [navigate, token]);

  const truncateName = (name, max = 18) => {
    if (!name) return '';
    if (name.length <= max) return name;
    return `${name.slice(0, max - 1).trimEnd()}…`;
  };

  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlHeight = html.style.height;
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlRole = html.getAttribute('data-role');
    const previousBodyRole = body.getAttribute('data-role');

    html.style.height = '100%';
    html.style.overflow = 'hidden';
    html.setAttribute('data-role', 'learners');
    body.setAttribute('data-role', 'learners');

    return () => {
      html.style.height = previousHtmlHeight;
      html.style.overflow = previousHtmlOverflow;

      if (previousHtmlRole === null) {
        html.removeAttribute('data-role');
      } else {
        html.setAttribute('data-role', previousHtmlRole);
      }

      if (previousBodyRole === null) {
        body.removeAttribute('data-role');
      } else {
        body.setAttribute('data-role', previousBodyRole);
      }
    };
  }, []);

  return (
    <div className="dashboard" data-role="learners">
      <section className="sidebar" id="sidebar">
        <div className="sidebar-header learners-sidebar-header">
          <div className="learners-brand">
            <img src={learnersBrandIcon} alt="Gonaraza" className="learners-brand-icon" />
            <div className="learners-brand-text">
              <h6>Gonaraza.com</h6>
              <p>All in one digital marketing</p>
            </div>
          </div>
        </div>

        <div className="sidebar-body learners-sidebar-body">
          <form className="learners-sidebar-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <input type="search" placeholder="Search" aria-label="Search" />
            <img src={learnersSearchIcon} alt="Search" />
          </form>

          <NavLink to="/academia/learner" end className={linkClassName}>
            <img src={learnersHomeIcon} alt="Home" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/academia/learner/courses" className={linkClassName}>
            <img src={learnersCoursesIcon} alt="Courses" />
            <span>Courses</span>
          </NavLink>

          <NavLink to="/academia/learner/performance" className={linkClassName}>
            <img src={learnersPerformanceIcon} alt="My Performance" />
            <span>My Performance</span>
          </NavLink>

          <NavLink to="/academia/learner/available-test" className={linkClassName}>
            <img src={learnersTestIcon} alt="Available Test" />
            <span>Available Test</span>
          </NavLink>

          <NavLink to="/academia/learner/projects" className={linkClassName}>
            <img src={learnersProjectsIcon} alt="My Projects" />
            <span>My Projects</span>
            <span className="learners-sidebar-badge" aria-label="4 notifications">4</span>
          </NavLink>

          <NavLink to="/academia/learner/certificates" className={linkClassName}>
            <img src={learnersCertificatesIcon} alt="My Certificates" />
            <span>My Certificates</span>
          </NavLink>

          <div className="my-line"></div>

          <NavLink to="/academia/learner/settings" className={linkClassName}>
            <img src={learnersSettingsIcon} alt="Settings" />
            <span>Settings</span>
          </NavLink>
        </div>

        <div className="learners-sidebar-progress">
          <div className="learners-sidebar-progress-head">
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

          <div className="learners-sidebar-profile">
          <NavLink to="/academia/learner/account" className="learners-profile-link">
            <div className="learners-sidebar-profile-left">
              <div className="learners-sidebar-profile-img">
                <img src={profileSummary.avatar} alt="Profile" />
              </div>
              <div className="learners-sidebar-profile-text">
                <h6>{profileLoading ? 'Loading...' : `Hi, ${truncateName(profileSummary.name)}`}</h6>
                <p>{profileLoading ? 'Please wait' : profileSummary.role}</p>
              </div>
            </div>
          </NavLink>
          <div className="learners-sidebar-profile-right">
            <NavLink to="/academia/learner/settings" className="learners-icon-btn" aria-label="Settings">
              <img src={learnersSettingsIcon} alt="Settings" />
            </NavLink>
            <button type="button" className="learners-icon-btn" aria-label="Logout" onClick={openLogoutModal}>
              <img src={learnersLogoutIcon} alt="Logout" />
            </button>
          </div>
        </div>
      </section>

      <section className="right-container">
        <header className="learners-topbar" role="banner">
          <div className="learners-topbar-left">
            <form className="learners-topbar-search" role="search" onSubmit={(event) => event.preventDefault()}>
              <img src={learnersSearchIcon} alt="Search" />
              <input type="search" placeholder="Search videos..." aria-label="Search videos" />
            </form>
          </div>

          <div className="learners-topbar-right">
            <button type="button" className="learners-topbar-icon" aria-label="Apps" onClick={(event) => event.preventDefault()}>
              <img src={learnersAppsIcon} alt="Apps" />
            </button>

            <div className="dropdown learners-lang">
              <button className="dropdown-toggle learners-lang-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={learnersFlagIcon} alt="RW" />
                <span>RW</span>
                <span className="learners-lang-sep">|</span>
                <span>EN</span>
                <img src={learnersDropdownIcon} alt="Open" />
              </button>
              <ul className="dropdown-menu learners-lang-menu">
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>RW</a></li>
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>EN</a></li>
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>FR</a></li>
              </ul>
            </div>

            <NavLink to="/academia/learner/account" className="learners-user-link">
              <div className="learners-user">
                <div className="learners-user-avatar">
                  <img src={profileSummary.avatar} alt="User" />
                </div>
                <div className="learners-user-meta">
                  <h6>{profileLoading ? 'Loading...' : truncateName(profileSummary.name)}</h6>
                  <p>{profileLoading ? 'Please wait' : profileSummary.email || profileSummary.role}</p>
                </div>
              </div>
            </NavLink>
          </div>
        </header>

        <div className="learners-main">
          <Outlet />

          <footer className="learners-footer" role="contentinfo">
            <div className="learners-footer-inner">
              <p>{new Date().getFullYear()}© gonaraza.com</p>
              <nav className="learners-footer-links" aria-label="Footer">
                <a href="#" onClick={(event) => event.preventDefault()}>About</a>
                <a href="#" onClick={(event) => event.preventDefault()}>Support</a>
                <a href="#" onClick={(event) => event.preventDefault()}>Purchase</a>
              </nav>
            </div>
          </footer>
        </div>
      </section>

      {showLogoutModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="logout-modal">
            <h4>Confirm Logout</h4>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button type="button" className="logout-cancel" onClick={cancelLogout}>Cancel</button>
              <button type="button" className="logout-confirm" onClick={confirmLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearnersLayout;