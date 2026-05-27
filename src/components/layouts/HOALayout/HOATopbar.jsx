import React from 'react';

const HOATopbar = () => {
  const preventDefault = (e) => e.preventDefault();

  return (
    <header className="hoa-topbar">
      <div className="hoa-topbar-left">
        <h2>Dashboard <span>/ Overview</span></h2>
      </div>

      <div className="hoa-topbar-center">
        <div className="hoa-topbar-search">
          <img src="/assets/icons/magnifier.svg" alt="" />
          <input type="search" placeholder="Search" />
        </div>
      </div>

      <div className="hoa-topbar-right">
        <button className="hoa-icon-btn"><img src="/assets/icons/file.svg" alt="Docs" /></button>
        <button className="hoa-icon-btn"><img src="/assets/icons/header-grid.svg" alt="Apps" /></button>
        
        <div className="hoa-lang-selector">
          <img src="/assets/icons/rwanda.svg" alt="RW" />
          <span>RW</span>
          <span className="hoa-lang-sep">|</span>
          <span>EN</span>
          <img src="/assets/icons/drop1.svg" alt="Dropdown" className="hoa-caret" />
        </div>

        <div className="hoa-user-profile">
          <div className="hoa-user-avatar">
            <img src="/assets/imgs/default-profile.png" alt="John Doe" />
          </div>
          <div className="hoa-user-info">
            <h6>Hi, John Doe</h6>
            <p>HOA</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HOATopbar;