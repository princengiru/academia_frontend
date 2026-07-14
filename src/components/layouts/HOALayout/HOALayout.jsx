import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import HOASidebar from './HOASidebar';
import HOATopbar from './HOATopbar';
import HOAFooter from './HOAFooter';
import { getHoaPageLabel, hoaPageTitle, resolveHoaCurrentPage } from '../../../pages/academia/hoa/hoaBrand';
import './hoa-layout.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function resolveRoleRedirect(role) {
  const normalized = String(role || '').toLowerCase().trim();
  if (normalized === 'instructor') return '/academia/professor';
  if (normalized === 'student') return '/academia/learner/';
  if (normalized === 'admin') return null;
  return '/academia/index';
}

function readStoredRole() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role || '';
  } catch {
    return '';
  }
}

const HOALayout = ({ children, currentPage: propCurrentPage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const contentScrollRef = useRef(null);
  const [authState, setAuthState] = useState('checking');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const derivedPage = resolveHoaCurrentPage(location.pathname);
  const currentPage = propCurrentPage || derivedPage;

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const content = contentScrollRef.current;
    if (content) content.scrollTop = 0;
  }, [location.pathname, location.search]);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    document.title = hoaPageTitle(getHoaPageLabel(currentPage));
  }, [currentPage]);

  useEffect(() => {
    let cancelled = false;

    const verifyAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/academia/auth/signin', { replace: true });
        return;
      }

      const storedRole = readStoredRole();
      const storedRedirect = resolveRoleRedirect(storedRole);
      if (storedRedirect) {
        navigate(storedRedirect, { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        if (response.status === 401) {
          localStorage.clear();
          navigate('/academia/auth/signin', { replace: true });
          return;
        }

        if (response.status === 403) {
          localStorage.clear();
          navigate('/academia/auth/signin', {
            replace: true,
            state: { error: 'This account has been deactivated. Please contact support.' },
          });
          return;
        }

        if (response.ok) {
          const body = await response.json().catch(() => ({}));
          const user = body?.data?.user || body?.data || body?.user || {};
          if (user && typeof user === 'object') {
            localStorage.setItem('user', JSON.stringify(user));
          }

          const apiRole = user?.role || storedRole;
          const apiRedirect = resolveRoleRedirect(apiRole);
          if (apiRedirect) {
            navigate(apiRedirect, { replace: true });
            return;
          }
        }
      } catch {
        if (resolveRoleRedirect(storedRole)) {
          navigate(resolveRoleRedirect(storedRole), { replace: true });
          return;
        }
      }

      if (!cancelled) {
        setAuthState('allowed');
      }
    };

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || authState !== 'allowed') return undefined;

    const checkAccountStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 403) {
          localStorage.clear();
          navigate('/academia/auth/signin', {
            replace: true,
            state: { error: 'This account has been deactivated. Please contact support.' },
          });
        }
      } catch {
        // Ignore background polling errors
      }
    };

    checkAccountStatus();
    const interval = setInterval(checkAccountStatus, 30000);
    return () => clearInterval(interval);
  }, [authState, navigate]);

  useEffect(() => {
    document.body.setAttribute('data-role', 'hoa');
    return () => {
      document.body.removeAttribute('data-role');
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSidebarOpen, closeSidebar]);

  if (authState === 'checking') {
    return (
      <div className="hoa-auth-loading" role="status" aria-live="polite" aria-busy="true">
        <div className="hoa-auth-loading-card">
          <div className="hoa-auth-loading-spinner" aria-hidden="true" />
          <p>Loading HOA workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hoa-dashboard-wrapper animate-fade-in">
      {isSidebarOpen ? (
        <button
          type="button"
          className="hoa-sidebar-backdrop"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      ) : null}

      <HOASidebar
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onLogout={() => setShowLogoutModal(true)}
      />

      <div className="hoa-main-container" ref={contentScrollRef}>
        <HOATopbar
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={openSidebar}
        />

        <main className="hoa-content-area">
          {children || <Outlet />}
        </main>

        <HOAFooter />
      </div>

      {showLogoutModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="logout-modal">
            <h4>Confirm Logout</h4>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-buttons">
              <button type="button" className="logout-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button
                type="button"
                className="logout-confirm"
                onClick={() => {
                  localStorage.clear();
                  setShowLogoutModal(false);
                  navigate('/academia/auth/signin');
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HOALayout;
