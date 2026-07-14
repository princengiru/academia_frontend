import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import logoIcon from '../assets/icons/logo.svg';
import follow1Icon from '../assets/icons/follow1.svg';
import follow2Icon from '../assets/icons/follow2.svg';
import follow3Icon from '../assets/icons/follow3.svg';
import follow4Icon from '../assets/icons/follow4.svg';
import follow5Icon from '../assets/icons/follow5.svg';
import follow6Icon from '../assets/icons/follow6.svg';
import follow7Icon from '../assets/icons/follow7.svg';
import headerGridIcon from '../assets/icons/header-grid.svg';
import headerSearchIcon from '../assets/icons/header-search.svg';
import accountIcon from '../assets/icons/head3.svg'; // Combined account/head3
import rwandaIcon from '../assets/icons/rwanda.svg';
import ccIcon from '../assets/icons/cc.svg';
import dropIcon from '../assets/icons/drop1.svg';
import rightIcon from '../assets/icons/right1.svg';
import opIcon from '../assets/icons/op.svg';
import bbrIcon from '../assets/icons/bbr.svg';
import bblIcon from '../assets/icons/bbl.svg';
import casttIcon from '../assets/icons/castt.svg';
import bannerVideo from '../assets/vids/banner1.mp4';
import './header.css';
import './header-search.css';
import defaultProfile from '../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const categories = ['Business', 'Academia', 'News', 'Jobs', 'Marketing'];

function Header() {
  const [activeCourseGroup, setActiveCourseGroup] = useState(0);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();
    const query = headerSearchQuery.trim();
    if (!query) return;
    navigate(`/academia/courses?search=${encodeURIComponent(query)}`);
    setHeaderSearchOpen(false);
    setHeaderSearchQuery('');
  };

  useEffect(() => {
    if (!headerSearchOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setHeaderSearchOpen(false);
        setHeaderSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [headerSearchOpen]);

  // Load and refresh user profile details
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {}

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const body = await response.json();
          if (body?.data?.user) {
            setUser(body.data.user);
            localStorage.setItem('user', JSON.stringify(body.data.user));
          }
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching header profile:', err);
      }
    };
    fetchProfile();
  }, [token]);

  const resolveProfileAvatar = (avatarVal) => {
    if (!avatarVal) return null;
    if (avatarVal.startsWith('http://') || avatarVal.startsWith('https://') || avatarVal.startsWith('data:')) {
      return avatarVal;
    }
    return `${API_BASE_URL}${avatarVal.startsWith('/') ? '' : '/'}${avatarVal}`;
  };

  // Load real categories from the database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body?.data)) {
            setFetchedCategories(body.data);
          }
        }
      } catch (err) {
        console.error('Error fetching categories for header:', err);
      }
    };
    loadCategories();
  }, []);

  // Compute dynamic course groups using fetched categories, with robust static fallbacks
  const dynamicCourseGroups = useMemo(() => {
    const categoryNames = fetchedCategories.length > 0
      ? fetchedCategories.map(c => c.name)
      : ['Data & Science', 'Career', 'IT and Software', 'Enterpreneurship', 'Art & Creation Design', 'Partnerships', 'Mathematics & Physics'];

    return [
      {
        title: 'View all Courses',
        filter: 'All',
        items: ['Browse all Courses', ...categoryNames],
      },
      {
        title: 'Popular Courses',
        filter: 'Popular',
        items: categoryNames.slice(0, Math.min(categoryNames.length, 5)),
      },
      {
        title: 'Free Courses',
        filter: 'Free',
        items: categoryNames.slice(0, Math.min(categoryNames.length, 4)),
      },
      {
        title: 'Applications & Programs',
        filter: 'All',
        items: categoryNames.slice(0, Math.min(categoryNames.length, 5)),
      },
      {
        title: 'Online Courses',
        filter: 'All',
        items: categoryNames,
      },
    ];
  }, [fetchedCategories]);

  const handleItemClick = (group, item) => {
    if (item === 'Browse all Courses') {
      navigate('/academia/courses?filter=All');
      return;
    }
    const filterVal = group.filter || 'All';
    navigate(`/academia/courses?filter=${filterVal}&category=${encodeURIComponent(item)}`);
  };

  return (
    <>
      <div className="ad-part">
        <video className="banner-video" autoPlay muted loop playsInline>
          <source src={bannerVideo} type="video/mp4" />
        </video>
      </div>

      <header className="site-header">

        <div className="first-part-h">
          <div className="first-part-h-l">
            <NavLink to="/" end>Digital Marketing</NavLink>
            <a href="#">News</a>
            <a href="#">Magazine</a>
            <a href="#">Job Portal</a>
            <NavLink to="/academia/index">Academia</NavLink>
          </div>

          <div className="first-part-h-r" aria-label="Social links">
            <a href="#" aria-label="Follow link 1">
              <img src={follow1Icon} alt="" />
            </a>
            <a href="https://wa.me/250782761021" target="_blank" rel="noreferrer">
              <img src={follow2Icon} alt="" />
            </a>
            <a href="https://x.com/GonarazaCom" target="_blank" rel="noreferrer">
              <img src={follow3Icon} alt="" />
            </a>
            <a href="https://www.instagram.com/gonaraza.com_" target="_blank" rel="noreferrer">
              <img src={follow4Icon} alt="" />
            </a>
            <a href="https://www.tiktok.com/@gonaraza.com_official" target="_blank" rel="noreferrer">
              <img src={follow5Icon} alt="" />
            </a>
            <a href="https://www.facebook.com/Gonaraza.comOfficial" target="_blank" rel="noreferrer">
              <img src={follow6Icon} alt="" />
            </a>
            <a href="https://youtube.com/@onewebsellerbuyerconnect" target="_blank" rel="noreferrer">
              <img src={follow7Icon} alt="" />
            </a>
          </div>
        </div>

        <div className="second-part-h active">
          <div className="second-part-h-logo">
            <NavLink to="/academia/index">
              <img className="site-logo" src={logoIcon} alt="Gonaraza Academia" />
            </NavLink>
          </div>

          <nav className="second-part-h-menus">
            <NavLink to="/academia/index">Home</NavLink>

            <div className="dropdown courses-dropdown">
              <button id="coursesToggle" className="dropdown-toggle courses-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                <span>Courses</span>
                <img src={dropIcon} alt="" />
              </button>
              <div className="dropdown-menu courses-dropdown-menu shadow" aria-labelledby="coursesToggle">
                <div className="courses-dropdown-left">
                  {dynamicCourseGroups.map((group, groupIndex) => (
                    <div className="course-group" key={group.title}>
                      <button
                        className={`courses-left-link${activeCourseGroup === groupIndex ? ' active' : ''}`}
                        type="button"
                        /* disable Bootstrap click toggle completely so they act on hover only */
                        aria-expanded={activeCourseGroup === groupIndex}
                        onMouseEnter={() => setActiveCourseGroup(groupIndex)}
                        onFocus={() => setActiveCourseGroup(groupIndex)}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <span className="courses-left-text">{group.title}</span>
                        <span className="courses-left-arrow"><img src={rightIcon} alt="" /></span>
                      </button>
                      <div
                        className={`courses-submenu shadow${activeCourseGroup === groupIndex ? ' show' : ''}`}
                        aria-labelledby={`course-group-${groupIndex}`}
                      >
                        {group.items.map((item, itemIndex) => (
                          <button
                            className={`courses-right-link${activeCourseGroup === groupIndex && itemIndex === 0 ? ' active' : ''}`}
                            type="button"
                            key={item}
                            onClick={() => handleItemClick(group, item)}
                          >
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/academia/projects">Projects</NavLink>
            <NavLink to="/academia/syllabuses">Syllabuses</NavLink>
            <NavLink to="/academia/watch">Community Feed</NavLink>
            <NavLink to="/academia/certificates">Certificates</NavLink>
          </nav>

          <div className="second-part-h-links" aria-label="Header actions">
            {headerSearchOpen ? (
              <form className="header-search" onSubmit={handleHeaderSearchSubmit} noValidate>
                <div className="header-search-inner">
                  <img src={headerSearchIcon} alt="" aria-hidden="true" />
                  <input
                    className="header-search-input"
                    type="text"
                    value={headerSearchQuery}
                    onChange={(event) => setHeaderSearchQuery(event.target.value)}
                    placeholder="Search courses..."
                    aria-label="Search courses"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="header-search-clear"
                    aria-label="Close search"
                    onClick={() => {
                      setHeaderSearchOpen(false);
                      setHeaderSearchQuery('');
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="header-action"
                aria-label="Search courses"
                onClick={() => setHeaderSearchOpen(true)}
              >
                <img src={headerSearchIcon} alt="" />
              </button>
            )}
            <button type="button" className="header-action" aria-label="App grid">
              <img src={headerGridIcon} alt="" />
            </button>

            <span className="header-language-static" aria-label="Language: English">
              <img src={rwandaIcon} alt="" />
              <span className="selected-option">EN</span>
            </span>

            {user ? (
              <div className="dropdown custom-header-select-dropdown d-flex align-items-center">
                <button className="center header-action header-account-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                  <img 
                    src={resolveProfileAvatar(user.avatar) || defaultProfile} 
                    alt="" 
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} 
                    onError={(e) => { e.target.src = accountIcon; }}
                  />
                </button>
                <ul className="dropdown-menu shadow header-language-menu dropdown-menu-end header-account-menu" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
                  <li className="dropdown-header text-start" style={{ padding: '8px 16px', borderBottom: '1px solid #F1F1F4', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600', color: '#071437', fontSize: '13px' }}>{user.name || 'User'}</div>
                    <div style={{ color: '#7E8299', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </li>
                  <li>
                    <button 
                       type="button" 
                       className="dropdown-item d-flex align-items-center gap-2" 
                       onClick={() => {
                         navigate('/academia/projects');
                       }}
                       style={{ fontSize: '13px', color: '#4B5675' }}
                     >
                       <User size={14} style={{ color: '#8B5CF6' }} />
                       <span>Profile</span>
                     </button>
                   </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      type="button" 
                      className="dropdown-item d-flex align-items-center gap-2 text-danger" 
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                        navigate('/academia/auth/signin');
                      }}
                      style={{ fontSize: '13px' }}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button 
                type="button"
                className="second-part-h-link user-h" 
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
                  navigate('/academia/auth/signin');
                }}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                aria-label="Sign in"
              >
                <img src={accountIcon} alt="Sign In" />
              </button>
            )}

            <div className="second-part-h-link open-cat" role="button" tabIndex={0} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
              <img src={ccIcon} alt="" />
            </div>
          </div>
        </div>

        <div className="mega-menu">
          <div className="mega-menu-sidebar">
            <div className="mega-menu-sidebar-h">
              <h3>Categories</h3>
            </div>
            <div className="mega-menu-sidebar-l">
              {categories.map((category, index) => (
                <a href="#" className={`desktop-cat-trigger${index === 0 ? ' active' : ''}`} key={category}>
                  <img src={ccIcon} alt="" />
                  <span>{category}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="mega-menu-body">
            <div className="mega-menu-body-h">
              <h5>Subcategories</h5>
              <div>
                <a href="accounts/register-gonaraza">Do you have business?</a>
                <button type="button">Get Started</button>
              </div>
            </div>
            <div className="mega-menu-body-items">
              <div className="desktop-subcat-container" style={{ display: 'block' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <div className="mega-menu-body-item-sub" style={{ display: 'flex', margin: 10 }}>
                    <div className="mega-menu-body-item-img">
                      <img src={logoIcon} alt="" />
                    </div>
                    <div className="mega-menu-body-item-text">
                      <p>Sample Subcategory</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mega-menu-ending">
            <div className="mega-menu-ending-h">
              <div>
                <h3>
                  <img className="ending-toggle" src={bblIcon} alt="" />
                  <span id="desktop-ending-title">Results</span>
                </h3>
              </div>
            </div>
            <div className="mega-menu-ending-b">
              <div className="mega-menu-ending-side">
                <div className="ending-subcats" style={{ display: 'none' }} />
              </div>
              <div className="mega-menu-body">
                <div className="mega-menu-body-items">
                  <div className="desktop-ads-container" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <a href="business-homepage?ref=sample" className="mega-menu-body-item-sub" style={{ display: 'flex', margin: 10, textDecoration: 'none', color: 'inherit' }}>
                        <div className="mega-menu-body-item-img">
                          <img src={logoIcon} alt="" />
                        </div>
                        <div className="mega-menu-body-item-text">
                          <p>Sample Ad</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="phone-categories">
          <div className="phone-categories-list">
            <a href="search_results?subcategory_id=1"><p>Clothes &amp; Apparel</p></a>
            <a href="search_results?subcategory_id=2"><p>Communication &amp; Media Tools</p></a>
            <a href="search_results?subcategory_id=3"><p>Vegetables</p></a>
            <a href="search_results?subcategory_id=4"><p>Foods &amp; Beverages</p></a>
          </div>
          <button className="open-cat-btn" type="button"><img src={casttIcon} alt="" /></button>
        </div>

        <div className="categories-dropup-container">
          <div className="categories-dropup">
            <div className="categories-dropup-h"><button type="button" /></div>
            <div className="categories-dropup-b">
              <div className="categories-dropup-b1">
                <div className="categories-dropup-bh"><h4>Categories</h4></div>
                <div className="categories-dropup-b1-c">
                  {categories.map((category) => (
                    <p className="mobile-genesis-trigger" key={category}>
                      <img src={ccIcon} alt="" />
                      <span>{category}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="categories-dropup-b2">
                <div className="categories-dropup-bh">
                  <button type="button"><img src={bbrIcon} alt="" /></button>
                  <h4 id="mobile-exodus-title">Select Category</h4>
                </div>
                <div className="categories-dropup-b2-c"><div className="mobile-subcat-group" style={{ display: 'none' }} /></div>
              </div>
              <div className="categories-dropup-b3">
                <div className="categories-dropup-bh">
                  <button type="button"><img src={bbrIcon} alt="" /></button>
                  <h4 id="mobile-ads-title">Results</h4>
                </div>
                <div className="categories-dropup-b3-c"><div className="mobile-ads-group" style={{ display: 'none' }} /></div>
              </div>
            </div>
          </div>
        </div>

        <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
          <div className="offcanvas-header">
            <div className="offcanvas-header-logo">
              <img src={logoIcon} alt="" />
            </div>
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#071437' }}>{user.name || 'User'}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    navigate('/academia/auth/signin');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <img src={opIcon} alt="" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
                  navigate('/academia/auth/signin');
                }}
              >
                <img src={opIcon} alt="" />
                <span>Sign In</span>
              </button>
            )}
          </div>
          <div className="offcanvas-body">
            {user && (
              <div style={{ padding: '10px 0', borderBottom: '1px solid #F1F1F4', marginBottom: '10px' }}>
                <a 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const role = (user.role || '').toLowerCase().trim();
                    if (role === 'instructor') navigate('/academia/professor');
                    else if (role === 'student') navigate('/academia/learner/');
                    else if (role === 'admin') navigate('/academia/hoa');
                    else navigate('/academia/index');
                  }}
                  style={{ fontWeight: '600', color: '#450468', display: 'block', padding: '10px 0' }}
                >
                  My Dashboard
                </a>
              </div>
            )}
            <a href="https://gonaraza.com">Digital Marketing</a>
            <a href="https://gonaraza.com/news">News</a>
            <a href="#">Magazine</a>
            <a href="#">Job Portal</a>
            <div className="accordion" id="jobFilterAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="jobTypeHeading1">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#jobTypeCollapse1" aria-expanded="false" aria-controls="jobTypeCollapse1">
                    Job Type
                  </button>
                </h2>
                <div id="jobTypeCollapse1" className="accordion-collapse collapse" aria-labelledby="jobTypeHeading1" data-bs-parent="#jobFilterAccordion">
                  <div className="accordion-body">
                    <a href="#">Home</a>
                    <a href="#">Jobs Categories</a>
                    <a href="#">Professional Jobs</a>
                    <a href="#">Job Seekers Profiles</a>
                  </div>
                </div>
              </div>
            </div>
            <a href="#">Academia</a>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
