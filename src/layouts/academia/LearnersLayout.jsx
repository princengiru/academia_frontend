import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import barsIcon from '../../assets/icons/bars.svg';
import accMinus from '../../assets/icons/acc-minus.svg';
import { getProfilePhotoDisplayUrl } from '../../pages/academia/learner/profilePhotoUtils';
import { formatRoleLabel } from '../../pages/academia/learner/learnerProfileShared';
import { LEARNER_PRODUCT_TAGLINE } from '../../pages/academia/learner/learnerBrand';
import acSav from '../../assets/icons/ac-sav.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function LearnersLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);
  const [profileSummary, setProfileSummary] = useState({
    name: '',
    email: '',
    role: '',
    avatar: learnersProfileImage,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState('');
  const [projectsCount, setProjectsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const mainScrollRef = useRef(null);

  useLayoutEffect(() => {
    const main = mainScrollRef.current;
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

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

  useEffect(() => {
    if (!location.pathname.startsWith('/academia/learner/courses')) return;
    const query = new URLSearchParams(location.search).get('search') || '';
    setSearchQuery(query);
  }, [location.pathname, location.search]);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    closeSidebar();
    if (!query) {
      navigate('/academia/learner/courses');
      return;
    }
    navigate(`/academia/learner/courses?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) closeSidebar();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeSidebar]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, closeSidebar]);

  useEffect(() => {
    if (!token) {
      setProfileLoading(false);
      return undefined;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          localStorage.clear();
          navigate('/academia/auth/signin', {
            replace: true,
            state: { error: 'This account has been deactivated. Please contact support.' }
          });
          return;
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Failed to load profile');
        }

        const user = data?.data?.user || {};

        if (user.is_active === false || user.status === 'suspended' || user.deactivated === true) {
          setIsSuspended(true);
          setProfileLoading(false);
          return;
        }

        setProfileSummary({
          name: user.name || user.email || 'Learner',
          email: user.email || '',
          role: formatRoleLabel(user.role || 'learner'),
          avatar: getProfilePhotoDisplayUrl(user.avatar, API_BASE_URL),
        });
        setProfileCompletion(Number(data?.data?.profilePercentage || 0));
        setProfileError('');
      } catch (error) {
        setProfileError(error.message || 'Failed to load profile');
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const list = Array.isArray(data?.data) ? data.data : [];
          setProjectsCount(list.length);
        }
      } catch (error) {
        console.error('Failed to load projects count:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();

    const interval = setInterval(loadProfile, 30000);
    return () => clearInterval(interval);
  }, [navigate, token]);

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

  if (!token) {
    return <Navigate to="/academia/auth/signin" replace />;
  }

  if (isSuspended) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Account Suspended">
        <div className="logout-modal suspension-modal" style={{ borderTop: '4px solid #EF4444' }}>
          <h4 style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span> Account Deactivated
          </h4>
          <p style={{ marginTop: '12px', lineHeight: '1.5' }}>
            Your account has been deactivated or suspended. You can no longer access this platform. Please contact support if you believe this is an error.
          </p>
          <div className="logout-modal-buttons" style={{ marginTop: '20px' }}>
            <button 
              type="button" 
              className="logout-confirm" 
              style={{ background: '#EF4444', color: '#fff', width: '100%', padding: '10px' }} 
              onClick={() => {
                localStorage.clear();
                navigate('/academia/auth/signin');
              }}
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = learnersProfileImage;
  };

  const truncateName = (name, max = 18) => {
    if (!name) return '';
    if (name.length <= max) return name;
    return `${name.slice(0, max - 1).trimEnd()}…`;
  };

  return (
    <div className="dashboard" data-role="learners">
      {isSidebarOpen && (
        <button
          type="button"
          className="learners-sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      <section className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header learners-sidebar-header">
          <div className="learners-brand">
            <img src={learnersBrandIcon} alt="Gonaraza" className="learners-brand-icon" />
            <div className="learners-brand-text">
              <h6>Gonaraza.com</h6>
              <p>{LEARNER_PRODUCT_TAGLINE}</p>
            </div>
          </div>
          <button
            type="button"
            className="learners-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <img src={accMinus} alt="" />
          </button>
        </div>

        <div className="sidebar-body learners-sidebar-body">
          <form className="learners-sidebar-search" role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search courses..."
              aria-label="Search courses"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <img src={learnersSearchIcon} alt="" />
          </form>

          <NavLink to="/academia/learner" end className={linkClassName} onClick={closeSidebar}>
            <img src={learnersHomeIcon} alt="Home" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/academia/learner/courses" className={linkClassName} onClick={closeSidebar}>
            <img src={learnersCoursesIcon} alt="Courses" />
            <span>Courses</span>
          </NavLink>

          <NavLink to="/academia/learner/performance" className={linkClassName} onClick={closeSidebar}>
            <img src={learnersPerformanceIcon} alt="My Performance" />
            <span>My Performance</span>
          </NavLink>

          <NavLink to="/academia/learner/available-test" className={linkClassName} onClick={closeSidebar}>
            <img src={learnersTestIcon} alt="Assessments" />
            <span>Assessments</span>
          </NavLink>

          <NavLink to="/academia/learner/saved-library" className={linkClassName} onClick={closeSidebar}>
            <img src={acSav} alt="Saved Library" />
            <span>Saved Library</span>
          </NavLink>

          <NavLink to="/academia/learner/projects" className={linkClassName} onClick={closeSidebar}>
            <img src={learnersProjectsIcon} alt="My Projects" />
            <span>My Projects</span>
            <span className="learners-sidebar-badge" aria-label={`${projectsCount} projects`}>
              {projectsCount >= 9 ? '9+' : projectsCount}
            </span>
          </NavLink>

          <NavLink to="/academia/learner/certificates" className={linkClassName} onClick={closeSidebar}>
            <img src={learnersCertificatesIcon} alt="My Certificates" />
            <span>My Certificates</span>
          </NavLink>

          <div className="my-line"></div>

          <NavLink to="/academia/learner/settings" className={linkClassName} onClick={closeSidebar}>
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
              ? 'Loading your profile summary…'
              : profileError || 'Complete your profile to unlock the full learning experience.'}
          </p>
          <div className="progress" role="progressbar" aria-label="Profile completion" aria-valuenow={profileCompletion} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-bar" style={{ width: `${profileCompletion}%` }}></div>
          </div>
        </div>

          <div className="learners-sidebar-profile">
          <NavLink to="/academia/learner/account" className="learners-profile-link" onClick={closeSidebar}>
            <div className="learners-sidebar-profile-left">
              <div className="learners-sidebar-profile-img">
                <img src={profileSummary.avatar} alt="Profile" onError={handleProfileImageError} />
              </div>
              <div className="learners-sidebar-profile-text">
                <h6>{profileLoading ? 'Loading…' : `Hi, ${truncateName(profileSummary.name)}`}</h6>
                <p>{profileLoading ? 'Please wait' : profileSummary.role}</p>
              </div>
            </div>
          </NavLink>
          <div className="learners-sidebar-profile-right">
            <button type="button" className="learners-icon-btn" aria-label="Logout" onClick={openLogoutModal}>
              <img src={learnersLogoutIcon} alt="Logout" />
            </button>
          </div>
        </div>
      </section>

      <section className="right-container">
        <header className="learners-topbar" role="banner">
          <div className="learners-topbar-left">
            <button
              type="button"
              className="learners-mobile-menu-btn"
              onClick={openSidebar}
              aria-expanded={isSidebarOpen}
              aria-controls="sidebar"
              aria-label="Open menu"
            >
              <img src={barsIcon} alt="" />
            </button>
            <form className="learners-topbar-search" role="search" onSubmit={handleSearchSubmit}>
              <img src={learnersSearchIcon} alt="" />
              <input
                type="search"
                placeholder="Search courses..."
                aria-label="Search courses"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </form>
          </div>

          <div className="learners-topbar-right">
            <NavLink to="/academia/learner/account" className="learners-user-link">
              <div className="learners-user">
                <div className="learners-user-avatar">
                  <img src={profileSummary.avatar} alt="User" onError={handleProfileImageError} />
                </div>
                <div className="learners-user-meta">
                  <h6>{profileLoading ? 'Loading…' : truncateName(profileSummary.name)}</h6>
                  <p>{profileLoading ? 'Please wait' : profileSummary.email || profileSummary.role}</p>
                </div>
              </div>
            </NavLink>
          </div>
        </header>

        <div className="learners-main" ref={mainScrollRef}>
          <Outlet />

          <footer className="learners-footer" role="contentinfo">
            <div className="learners-footer-inner">
              <p>{new Date().getFullYear()}© gonaraza.com</p>
              <nav className="learners-footer-links" aria-label="Footer">
                <a href="/academia/index">About</a>
                <a href="/academia/learner/courses">Courses</a>
                <a href="/academia/learner/account">Account</a>
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