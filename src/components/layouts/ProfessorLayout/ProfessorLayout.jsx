import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

// Importing the localized styles
import './client-layout.css';
import './learners-layout.css'; // Keep if you want fallback/shared utilities accessible
import './prof-layout.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const defaultProfileImage = '/assets/imgs/default-profile.png';

const ProfessorLayout = ({ children, currentPage }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
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
  const [isSuspended, setIsSuspended] = useState(false);

  const openLogoutModal = (event) => {
    if (event && event.preventDefault) event.preventDefault();
    setShowLogoutModal(true);
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const confirmLogout = () => {
    try {
      localStorage.clear();
    } catch (error) {
      // ignore storage cleanup issues
    }

    setShowLogoutModal(false);
    navigate('/academia/auth/signin');
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

  useEffect(() => {
    if (!token) {
      setProfileLoading(false);
      return;
    }

    let mounted = true;

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

        if (!mounted) return;

        const user = data?.data?.user || {};
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
  }, []);

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

  return (
    <div className="dashboard">
      <Sidebar
        currentPage={currentPage}
        profileLoading={profileLoading}
        profileSummary={profileSummary}
        profileCompletion={profileCompletion}
        profileError={profileError}
        onLogout={openLogoutModal}
      />
      
      <section className="right-container">
        <Topbar profileLoading={profileLoading} profileSummary={profileSummary} />
        
        <div className="prof-content">
          {/* Inject the specific page content here */}
          {children}
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