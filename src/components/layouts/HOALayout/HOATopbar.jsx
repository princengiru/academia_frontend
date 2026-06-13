import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import hoatopicon1 from '../../../assets/icons/hoatopicon1.svg';
import hoatopicon2 from '../../../assets/icons/hoatopicon2.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import defaultProfileImage from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const languageOptions = [
  { label: 'RW', flag: '/assets/icons/rwanda.svg' },
  { label: 'EN', flag: hoausflag },
  { label: 'FR', flag: '/assets/icons/france.svg' },
];

const HOATopbar = () => {
  const location = useLocation();
  const dropdownRef = useRef(null);
  
  // --- State ---
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(languageOptions[1]); // Default to EN
  const [adminData, setAdminData] = useState({
    name: 'Loading...',
    role: 'HOA',
    avatar: defaultProfileImage
  });

  // --- Dynamic Breadcrumbs ---
  const getPageName = () => {
    const path = location.pathname;
    if (path.includes('approvals')) return 'Course Approvals';
    if (path.includes('users')) return 'User Management';
    if (path.includes('finances')) return 'Financials';
    if (path.includes('stories')) return 'Community Content';
    if (path.includes('settings')) return 'Settings';
    return 'Overview';
  };

  // --- Close Dropdown on Outside Click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch Admin Profile Data ---
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (mounted && res.ok) {
          const user = data.data || data;
          
          // Safe Image Resolver
          let avatarSrc = defaultProfileImage;
          if (user.avatar) {
            avatarSrc = user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`;
          }

          setAdminData({
            name: user.name || 'Admin',
            role: user.role === 'admin' ? 'Head of Academia' : 'HOA Staff',
            avatar: avatarSrc
          });
        }
      } catch (error) {
        console.error("Failed to load admin profile for Topbar", error);
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, []);

  // --- Handlers ---
  const handleLanguageSelect = (option) => {
    setActiveLanguage(option);
    setIsLanguageOpen(false);
  };

  // --- Extract First Name for Greeting ---
  const firstName = adminData.name !== 'Loading...' ? adminData.name.split(' ')[0] : '...';

  return (
    <header className="hoa-topbar">
      {/* Left: Dynamic Breadcrumbs */}
      <div className="hoa-topbar-left">
        <h2 style={{ textTransform: 'capitalize' }}>
          Dashboard <span>/ {getPageName()}</span>
        </h2>
      </div>

      {/* Center: Search */}
      <div className="hoa-topbar-center">
        <div className="hoa-topbar-search">
          <img src="/assets/icons/magnifier.svg" alt="Search icon" />
          <input type="search" placeholder="Search across academia..." />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="hoa-topbar-right">
        <button className="hoa-icon-btn" title="Notifications">
          <img src={hoatopicon1} alt="Notifications" />
        </button>
        <button className="hoa-icon-btn" title="Apps">
          <img src={hoatopicon2} alt="Apps" />
        </button>
        
        {/* Language Selector */}
        <div className="hoa-lang-selector" ref={dropdownRef}>
          <button
            type="button"
            className="hoa-lang-trigger"
            onClick={() => setIsLanguageOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isLanguageOpen}
          >
            <img src={activeLanguage.flag} alt={activeLanguage.label} />
            <span>{activeLanguage.label}</span>
            <img 
              src={hoadowncaret} 
              alt="Dropdown" 
              className="hoa-caret" 
              style={{ transform: isLanguageOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>
          
          {isLanguageOpen && (
            <div className="hoa-lang-dropdown" role="listbox">
              {languageOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`hoa-lang-option ${activeLanguage.label === option.label ? 'active' : ''}`}
                  onClick={() => handleLanguageSelect(option)}
                >
                  <img src={option.flag} alt={option.label} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="hoa-user-profile">
          <div className="hoa-user-avatar">
            <img src={adminData.avatar} alt={adminData.name} style={{ objectFit: 'cover' }} />
          </div>
          <div className="hoa-user-info">
            <h6>Hi, {firstName}</h6>
            <p>{adminData.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HOATopbar;