import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
import ln1Icon from '../assets/icons/ln1.svg';
import ln2Icon from '../assets/icons/ln2.svg';
import ln3Icon from '../assets/icons/ln3.svg';
import opIcon from '../assets/icons/op.svg';
import bbrIcon from '../assets/icons/bbr.svg';
import bblIcon from '../assets/icons/bbl.svg';
import casttIcon from '../assets/icons/castt.svg';
import bannerVideo from '../assets/vids/banner1.mp4';
import './Header.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const categories = ['Business', 'Academia', 'News', 'Jobs', 'Marketing'];

function Header() {
  const [activeCourseGroup, setActiveCourseGroup] = useState(0);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const navigate = useNavigate();

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
      navigate('/academia/learner/courses?filter=All');
      return;
    }
    const filterVal = group.filter || 'All';
    navigate(`/academia/learner/courses?filter=${filterVal}&category=${encodeURIComponent(item)}`);
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

            <NavLink to="/academia/journals">Projects</NavLink>
            <NavLink to="/academia/syllabuses">Syllabuses</NavLink>
            <NavLink to="/academia/watch">Community Feed</NavLink>
            <NavLink to="/academia/rewards">Rewards</NavLink>
          </nav>

          <div className="second-part-h-links" aria-label="Header actions">
            <button type="button" className="header-action" aria-label="Search">
              <img src={headerSearchIcon} alt="" />
            </button>
            <button type="button" className="header-action" aria-label="App grid">
              <img src={headerGridIcon} alt="" />
            </button>

            <div className="dropdown custom-header-select-dropdown d-flex align-items-center">
              <button className="dropdown-toggle center header-action header-language" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={rwandaIcon} alt="" />
                <span className="selected-option">KN</span>
              </button>
              <ul className="dropdown-menu shadow header-language-menu">
                <li><a className="dropdown-item active" href="#"><img src={ln1Icon || rwandaIcon} alt="" /><span>Kinyarwanda</span></a></li>
                <li><a className="dropdown-item" href="#"><img src={ln2Icon || rwandaIcon} alt="" /><span>English</span></a></li>
                <li><a className="dropdown-item" href="#"><img src={ln3Icon || rwandaIcon} alt="" /><span>French</span></a></li>
              </ul>
            </div>

            <Link className="second-part-h-link user-h" to="/academia/auth/signin" aria-label="Sign in">
              <img src={accountIcon} alt="" />
            </Link>

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
            <button type="button" onClick={() => navigate('/academia/auth/signin')}>
              <img src={opIcon} alt="" />
              <span>Sign In</span>
            </button>
          </div>
          <div className="offcanvas-body">
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
