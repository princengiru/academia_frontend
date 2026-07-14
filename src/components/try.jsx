import { NavLink } from 'react-router-dom';
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

const courseGroups = [
  {
    title: 'View all Courses',
    active: true,
    items: ['Browse all Courses', 'Data & Science', 'Career', 'IT and Software', 'Enterpreneurship', 'Art & Creation Design', 'Partnerships', 'Mathematics & Physics'],
  },
  {
    title: 'Popular Courses',
    items: ['IT and Software', 'Data & Science', 'Career', 'Enterpreneurship'],
  },
  {
    title: 'Free Courses',
    items: ['Career', 'Data & Science', 'Mathematics & Physics'],
  },
  {
    title: 'Applications & Programs',
    items: ['Art & Creation Design', 'Partnerships', 'IT and Software'],
  },
  {
    title: 'Online Courses',
    items: ['Data & Science', 'IT and Software', 'Career', 'Enterpreneurship'],
  },
];

const categories = ['Business', 'Academia', 'News', 'Jobs', 'Marketing'];

function Header() {
  return (
    <header className="site-header">
      <div className="ad-part">
        <video className="banner-video" autoPlay muted loop playsInline>
          <source src={bannerVideo} type="video/mp4" />
        </video>
      </div>

      <div className="first-part-h">
        <div className="first-part-h-l">
          <NavLink to="/">Digital Marketing</NavLink>
          <NavLink to="/">News</NavLink>
          <a href="#">Magazine</a>
          <a href="#">Job Portal</a>
          <a href="#">Academia</a>
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
          <NavLink to="/gonaraza/academia/index">
            <img className="site-logo" src={logoIcon} alt="Gonaraza Academia" />
          </NavLink>
        </div>

        <nav className="second-part-h-menus">
          <NavLink to="/gonaraza/academia/index">Home</NavLink>

          <div className="dropdown courses-dropdown">
            <button id="coursesToggle" className="dropdown-toggle courses-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
              <span>Courses</span>
              <img src={dropIcon} alt="" />
            </button>
            <div className="dropdown-menu courses-dropdown-menu shadow" aria-labelledby="coursesToggle">
              <div className="courses-dropdown-left">
                {courseGroups.map((group, groupIndex) => (
                  <div className="dropend course-group" key={group.title}>
                    <button className={`dropdown-item courses-left-link${group.active ? ' active' : ''}`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="courses-left-text">{group.title}</span>
                      <span className="courses-left-arrow"><img src={rightIcon} alt="" /></span>
                    </button>
                    <div className="dropdown-menu courses-submenu shadow" aria-labelledby={`course-group-${groupIndex}`}>
                      {group.items.map((item, itemIndex) => (
                        <button
                          className={`dropdown-item courses-right-link${itemIndex === 0 ? ' active' : ''}${item === 'Art & Creation Design' || item === 'Partnerships' ? ' soon' : ''}`}
                          type="button"
                          key={item}
                        >
                          <span>{item}</span>
                          {(item === 'Art & Creation Design' || item === 'Partnerships') && <small className="course-soon">Soon</small>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <a href="/gonaraza/academia/projects">Projects</a>
          <a href="#">Community Feed</a>
          <a href="/gonaraza/academia/rewards">Rewards</a>
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

          <div className="second-part-h-link user-h" role="button" tabIndex={0} onClick={() => window.location.assign('/accounts/register-gonaraza?login=1')} onKeyDown={(e) => e.key === 'Enter' && window.location.assign('/accounts/register-gonaraza?login=1')}>
            <img src={accountIcon} alt="" />
          </div>

          <div className="second-part-h-link open-cat" role="button" tabIndex={0} data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
            <img src={ccIcon} alt="" />
          </div>
        </div>
      </div>
      
      {/* Mega Menu & Offcanvas components continue below */}
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
                <button type="button" onClick={() => window.location.assign('accounts/register-gonaraza?login=1')}>Get Started</button>
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
            <div />
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

    </header>
  );
}

export default Header;