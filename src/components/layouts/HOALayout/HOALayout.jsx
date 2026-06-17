import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import HOASidebar from './HOASidebar';
import HOATopbar from './HOATopbar';
import HOAFooter from './HOAFooter';
import './hoa-layout.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOALayout = ({ children, currentPage: propCurrentPage }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  // --- Authentication Guard ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      // If there is no token, immediately redirect to the sign-in page
      if (!token) {
        navigate('/academia/auth/signin', { replace: true });
      } else {
        // Safe to render the protected layout
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [navigate]);

  // --- Account Status Guard / Polling ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const checkAccountStatus = async () => {
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
      } catch (error) {
        // Silently ignore network errors during background check
      }
    };

    checkAccountStatus();
    const interval = setInterval(checkAccountStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- Auto-detect Current Page ---
  // If a prop isn't passed, it intelligently reads the URL to tell the sidebar what's active.
  const derivedPage = location.pathname.split('/').filter(Boolean).pop();
  
  // If the path is exactly '/academia/hoa', set it to 'index' for the sidebar matching logic
  const currentPage = propCurrentPage || (derivedPage === 'hoa' ? 'index' : derivedPage);

  // --- Scoped Body Styling ---
  useEffect(() => {
    document.body.setAttribute('data-role', 'hoa');
    return () => {
      document.body.removeAttribute('data-role');
    };
  }, []);

  // --- Loading State ---
  // Prevent the layout from flashing on the screen for a split second before the redirect kicks in
  if (!isAuthenticated) {
    return null; // Or return a <LoadingSpinner /> if you prefer
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
    <div className="hoa-dashboard-wrapper animate-fade-in">
      
      {/* Sidebar */}
      <HOASidebar currentPage={currentPage} onLogout={() => setShowLogoutModal(true)} />
      
      {/* Main Content Area */}
      <div className="hoa-main-container">
        <HOATopbar />
        
        {/* Render explicitly passed children OR dynamically load via React Router Outlet */}
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