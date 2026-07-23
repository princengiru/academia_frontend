import React, { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import { resolveProfessorCurrentPage } from '../../../pages/academia/professor/professorBrand';

// Importing the localized styles
import './learners-layout.css';
import './prof-layout.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const defaultProfileImage = '/assets/imgs/default-profile.png';

const ProfessorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentScrollRef = useRef(null);
  const token = localStorage.getItem('token');
  const currentPage = resolveProfessorCurrentPage(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSummary, setProfileSummary] = useState({
    name: '',
    email: '',
    role: '',
    avatar: defaultProfileImage,
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileError, setProfileError] = useState('');
  const [profileReloadKey, setProfileReloadKey] = useState(0);
  const [isSuspended, setIsSuspended] = useState(false);
  const [projectsCount, setProjectsCount] = useState(0);

  const openLogoutModal = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setShowLogoutModal(true);
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const cancelLogout = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    try {
      localStorage.clear();
    } catch (error) {
      // ignore storage cleanup issues
    }

    setShowLogoutModal(false);
    navigate('/auth/signin');
  };

  const truncateName = (name, max = 18) => {
    if (!name) return '';
    if (name.length <= max) return name;
    return `${name.slice(0, max - 1).trimEnd()}…`;
  };

  const resolveAssetUrl = (value) => {
    if (!value) return defaultProfileImage;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
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
    html.setAttribute('data-role', 'prof');
    body.setAttribute('data-role', 'prof');

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

  useLayoutEffect(() => {
    const content = contentScrollRef.current;
    if (content) content.scrollTop = 0;
  }, [location.pathname]);

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
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          localStorage.clear();
          navigate('/auth/signin', {
            replace: true,
            state: { error: 'This account has been deactivated. Please contact support.' }
          });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Failed to load profile');
        }

        if (!mounted) return;

        const user = data?.data?.user || {};

        if (user.is_active === false || user.status === 'suspended' || user.deactivated === true) {
          setIsSuspended(true);
          setProfileLoading(false);
          return;
        }

        setProfileSummary({
          name: user.name || user.email || 'Professor',
          email: user.email || '',
          role: user.role || 'instructor',
          avatar: resolveAssetUrl(user.avatar),
        });
        setProfileCompletion(Number(data?.data?.profilePercentage || 0));
        setProfileError('');
      } catch (error) {
        if (mounted) {
          setProfileError(error.message || 'Failed to load profile');
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && mounted) {
          const list = Array.isArray(data?.data) ? data.data : [];
          setProjectsCount(list.length);
        }
      } catch (error) {
        console.error('Failed to load projects count:', error);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    const interval = setInterval(loadProfile, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate, profileReloadKey, token]);

  useEffect(() => {
    // Dev helper: rewrite any <img src="/assets/..."> to Vite-served /src/assets/ so images load
    // This keeps your existing absolute paths working in the dev server without copying assets.
    const fixAssets = () => {
      document.querySelectorAll('img').forEach((img) => {
        const raw = img.getAttribute('src');
        if (raw && raw.startsWith('/assets/')) {
          img.setAttribute('src', `/src${raw}`);
        }
      });
    };

    // Run immediately and also after a short delay (in case images are injected later)
    fixAssets();
    const t = setTimeout(fixAssets, 500);
    return () => clearTimeout(t);
  }, []);

  if (!token) {
    return <Navigate to="/auth/signin" replace />;
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
                navigate('/auth/signin');
              }}
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" data-role="prof">
      {isSidebarOpen && (
        <button
          type="button"
          className="prof-sidebar-backdrop"
          onClick={closeSidebar}
          aria-label="Close menu"
        />
      )}

      <Sidebar
        currentPage={currentPage}
        profileLoading={profileLoading}
        profileSummary={profileSummary}
        profileCompletion={profileCompletion}
        profileError={profileError}
        onRetryProfile={() => setProfileReloadKey((key) => key + 1)}
        onLogout={openLogoutModal}
        projectsCount={projectsCount}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <section className="right-container">
        <Topbar
          profileLoading={profileLoading}
          profileSummary={profileSummary}
          onOpenSidebar={openSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        
        <div className="prof-content" ref={contentScrollRef}>
          <div className="prof-content-body">
            <Outlet />
          </div>
          <Footer />
        </div>

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
        
      </section>
    </div>
  );
};

export default ProfessorLayout;