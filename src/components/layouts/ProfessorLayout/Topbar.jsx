import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ profileLoading, profileSummary, onOpenSidebar, isSidebarOpen = false }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      navigate('/professor/assignments');
      return;
    }
    navigate(`/professor/assignments?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="prof-topbar" role="banner">
      <div className="prof-topbar-left">
        <button
          type="button"
          className="prof-mobile-menu-btn"
          onClick={onOpenSidebar}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar"
          aria-label="Open menu"
        >
          <img src="/assets/icons/bars.svg" alt="" />
        </button>
        <form className="prof-topbar-search" role="search" onSubmit={handleSearchSubmit}>
          <img src="/assets/icons/magnifier.svg" alt="" />
          <input
            type="search"
            placeholder="Search assessments..."
            aria-label="Search assessments"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </form>
      </div>

      <div className="prof-topbar-right">
        <div
          className="prof-user"
          onClick={() => navigate('/professor/account')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/professor/account'); }}
          aria-label="Go to account settings"
        >
          <div className="prof-user-avatar">
            <img src={profileSummary?.avatar || '/assets/imgs/default-profile.png'} alt="User" />
          </div>
          <div className="prof-user-meta">
            <h6>{profileLoading ? 'Loading...' : profileSummary?.name || 'Professor'}</h6>
            <p>{profileLoading ? 'Please wait' : profileSummary?.email || profileSummary?.role || 'instructor'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
