import React from 'react';

const Topbar = ({ profileLoading, profileSummary }) => {
  const preventDefault = (e) => e.preventDefault();

  return (
    <header className="prof-topbar" role="banner">
      <div className="prof-topbar-left">
        <form className="prof-topbar-search" role="search" onSubmit={preventDefault}>
          <img src="/assets/icons/magnifier.svg" alt="Search" />
          <input type="search" placeholder="Search videos..." aria-label="Search videos" />
        </form>
      </div>

      <div className="prof-topbar-right">
        <button type="button" className="prof-topbar-icon" aria-label="Apps" onClick={preventDefault}>
          <img src="/assets/icons/header-grid.svg" alt="Apps" />
        </button>

        <div className="dropdown prof-lang">
          <button className="dropdown-toggle prof-lang-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="/assets/icons/rwanda.svg" alt="RW" />
            <span>RW</span>
            <span className="prof-lang-sep">|</span>
            <span>EN</span>
            <img src="/assets/icons/drop1.svg" alt="Open" />
          </button>
          <ul className="dropdown-menu prof-lang-menu">
            <li><a className="dropdown-item" href="#" onClick={preventDefault}>RW</a></li>
            <li><a className="dropdown-item" href="#" onClick={preventDefault}>EN</a></li>
            <li><a className="dropdown-item" href="#" onClick={preventDefault}>FR</a></li>
          </ul>
        </div>

        <div className="prof-user">
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