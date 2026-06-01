import React, { useState, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-learners.css';

import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoaopenview from '../../../assets/icons/hoaopenview.svg';
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoauserbadge from '../../../assets/icons/hoauserbadge.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoagrayphone from '../../../assets/icons/hoagrayphone.svg';
import hoagraymail from '../../../assets/icons/hoagraymail.svg';
import hoaverticaldots from '../../../assets/icons/hoaverticaldots.svg';
import hoadownload from '../../../assets/icons/hoadownload.svg';
import hoaknot from '../../../assets/icons/hoaknot.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoadownloadall from '../../../assets/icons/hoadownloadall.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoausericon from '../../../assets/icons/hoausericon.svg';
import hoalocation from '../../../assets/icons/hoalocation.svg';
import hoabriefcase from '../../../assets/icons/hoabriefcase.svg';
import hoafollowers from '../../../assets/icons/hoafollowers.svg';
import hoaproject from '../../../assets/imgs/hoaproject.png';
import hoacalendar from '../../../assets/icons/hoacalendar.svg';


const HOALearners = () => {
  const preventDefault = (e) => e.preventDefault();

  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState('5');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  const [likedProjects, setLikedProjects] = useState({});

  const toggleProjectLike = (idx) => {
    setLikedProjects((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'
  
  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [flagSelections, setFlagSelections] = useState({
    syllabus: { label: 'RWF', flag: rwanda },
    courses: { label: 'RWF', flag: rwanda },
  });

  const [exchangeRate, setExchangeRate] = useState(1350);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/RWF')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.USD) {
          setExchangeRate(1 / data.rates.USD);
        }
      })
      .catch(err => console.error("Failed to fetch exchange rate", err));
  }, []);

  const pageSizeOptions = ['5', '10', '25'];
  const filterOptions = ['All Learners', 'Active', 'Inactive'];
  const flagOptions = [
    { label: 'RWF', flag: rwanda },
    { label: 'USD', flag: hoausflag },
  ];

  const toggleRowSelection = (rowId) => {
    setSelectedRows((currentRows) => (
      currentRows.includes(rowId)
        ? currentRows.filter((selectedRowId) => selectedRowId !== rowId)
        : [...currentRows, rowId]
    ));
  };

  const clearSelectedRows = () => setSelectedRows([]);

  const handlePageSizeSelect = (value) => {
    setPageSize(value);
    setIsPageSizeOpen(false);
  };

  const toggleFlagDropdown = (key) => {
    setOpenFlagDropdown((currentKey) => (currentKey === key ? null : key));
  };

  const selectFlagOption = (key, option) => {
    setFlagSelections((currentSelections) => ({
      ...currentSelections,
      [key]: option,
    }));
    setOpenFlagDropdown(null);
  };

  const handleMouseMove = (e, chartId, seg) => {
    const svgRect = e.target.closest('svg').getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setHoverData({ chartId, text: seg.tooltipText, tooltipClass: seg.tooltipClass, x, y });
  };

  const handleMouseLeave = () => {
    setHoverData({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const renderDonut = (chartId, segments) => {
    const radius = 38;
    const strokeWidth = 16;
    let currentOffsetPercent = 0;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg viewBox="0 0 100 100" className="donut-svg">
          {segments.map((seg, idx) => {
            const dashPercent = seg.percent;
            const offsetPercent = -currentOffsetPercent;
            currentOffsetPercent += seg.percent;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashPercent} 100`}
                strokeDashoffset={offsetPercent}
                pathLength="100"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseMove={(e) => handleMouseMove(e, chartId, seg)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
        {hoverData.chartId === chartId && (
          <div
            className={`donut-tooltip ${hoverData.tooltipClass || ''}`}
            style={{ top: `${hoverData.y + 10}px`, left: `${hoverData.x + 10}px` }}
          >
            {hoverData.text}
          </div>
        )}
      </div>
    );
  };

  const formatRevenue = (baseAmountRWF, currency) => {
    if (currency === 'USD') {
      const amountUSD = baseAmountRWF / exchangeRate;
      if (amountUSD >= 1000000) return `${(amountUSD / 1000000).toFixed(1)}M USD`;
      if (amountUSD >= 1000) return `${(amountUSD / 1000).toFixed(1)}K USD`;
      return `${amountUSD.toFixed(2)} USD`;
    }
    if (baseAmountRWF >= 1000000) return `${(baseAmountRWF / 1000000).toFixed(1)}M RWF`;
    if (baseAmountRWF >= 1000) return `${(baseAmountRWF / 1000).toFixed(1)}K RWF`;
    return `${baseAmountRWF} RWF`;
  };

  const renderFlagDropdown = (key, baseValueRWF) => {
    const selectedFlag = flagSelections[key];
    const displayValue = formatRevenue(baseValueRWF, selectedFlag.label);

    return (
      <div className="hoa-revenue-dropdown-box">
        <span className="revenue-label">Total Revenue</span>
        <div className="revenue-value-picker">
          <span className="revenue-value">{displayValue}</span>
          <div className="flag-dropdown-wrapper">
            <button type="button" className="flag-dropdown-trigger" onClick={() => toggleFlagDropdown(key)}>
              <img src={selectedFlag.flag} alt="flag" className="flag-icon" />
              <img src={hoadowncaret} alt="drop" className="flag-dropdown-caret" />
            </button>
            {openFlagDropdown === key && (
              <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px' }}>
                {flagOptions.map((option, idx) => (
                  <button
                    key={idx} type="button" className="flag-dropdown-option"
                    onClick={() => selectFlagOption(key, option)}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <img src={option.flag} alt="flag" className="flag-icon" />
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: '#4B5675', fontWeight: '500' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const learnersData = [
    { id: 1, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '34.67', attempts: 3, downloads: 3, certs: 3, paid: '222.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 2, name: 'Nagy Tímea', location: 'Russia', flag: '/assets/icons/rwanda.svg', score: '35.45', attempts: 23, downloads: 23, certs: 23, paid: '222.3 USD', status: 'Unpaid', statusColor: 'red' },
    { id: 3, name: 'Illés Éva', location: 'America', flag: hoausflag, score: '---', attempts: '---', downloads: '---', certs: '---', paid: '0 USD', status: 'In Progress', statusColor: 'gray' },
    { id: 4, name: 'Halász Emese', location: 'Burundi', flag: '/assets/icons/rwanda.svg', score: '19.52', attempts: 123, downloads: 123, certs: 123, paid: '23.4 USD', status: 'Paid', statusColor: 'green' },
    { id: 5, name: 'Soós Annamária', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
  ];

  // Modal Dummy Data
  const modalLessons = [
    { id: 1, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Alexis Ndayamabje Froduard', score: '34.67', type: 'Course', duration: '4 Weeks', attempts: '3', status: 'Passed', statusType: 'passed' },
    { id: 2, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Eustolia B. Sadiq', score: '35.45', type: 'Course', duration: '4 Weeks', attempts: '23', status: 'Failed', statusType: 'failed' },
    { id: 3, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Addie V. Biela', score: '---', type: 'Course', duration: '4 Weeks', attempts: '---', status: 'Retake', statusType: 'retake' },
    { id: 4, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Elvira E. Aus', score: '-- --', type: 'Syllabus', duration: '251 Pages', attempts: '123', status: 'Paid', statusType: 'paid' },
    { id: 5, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Jacalyn K. Hanaburgh', score: '-- --', type: 'Syllabus', duration: '251 Pages', attempts: '4', status: 'Paid', statusType: 'paid' },
    { id: 6, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Margert J. Swon', score: '-- --', type: 'Syllabus', duration: '251 Pages', attempts: '4', status: 'Free', statusType: 'free' },
  ];

  const modalDocuments = [
    { id: 1, name: 'Javascript Fundamental', size: '5.6 MB', type: 'ribbon' },
    { id: 2, name: 'Economic Specialist', size: '5.6 MB', type: 'ribbon' },
    { id: 3, name: 'My Resume.pdf', size: '5.6 MB', type: 'pdf' },
    { id: 4, name: 'AO My doc.pdf', size: '5.6 MB', type: 'pdf' },
  ];

  const modalProjects = Array(6).fill({
    image: 'https://via.placeholder.com/300x150/E2E8F0/A1A5B7?text=Project+Preview',
    author: 'Jose Carine',
    likes: '10.6K',
    views: '10.6K',
    title: 'Build your software & engineering dream career'
  });

  return (
    <HOALayout currentPage="learners">

      {/* Page Header */}
      <div className="hoa-page-header">
        <h1>Learners</h1>
        <div className="hoa-header-actions">
          <span className="hoa-update-status">
            <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 5min <span className="dot"></span>
          </span>
          <button className="hoa-btn-primary">
            Go to website <img src={hoagoto} alt="" />
          </button>
        </div>
      </div>

      {/* Stats Container */}
      <div className="hoa-dashboard-stats-container">
        <div className="hoa-card hoa-secondary-stats-row">
          <div className="sub-stat"><h4>13.3M</h4><p>Syllabus Downloads</p></div>
          <div className="sub-stat"><h4>204</h4><p>Online Learners</p></div>
          <div className="sub-stat"><h4>13</h4><p>Competent Learners</p></div>
          <div className="sub-stat"><h4>4.6</h4><p>NYC Learners</p></div>
          <div className="sub-stat"><h4>19.32</h4><p>Average Score <span className="trend down"> <img src={hoadecrease} alt="" /> -4.5%</span></p></div>
          <div className="sub-stat"><h4>84</h4><p>Certificates <span className="trend up"> <img src={hoaincrease} alt="" /> +4.1</span></p></div>
        </div>
      </div>

      <div className="hoa-dashboard-charts-container">
        <div className="hoa-grid-2">
          {/* Syllabus Stats Card */}
          <div className="hoa-card hoa-chart-card">
            <div className="section-title">SYLLABUS'S STATS</div>
            <div className="chart-body-row">
              <div className="donut-wrapper">
                <div className="donut-chart">
                  {renderDonut('syllabus', [
                    { percent: 35, color: '#1B84FF', tooltipText: '34.4K Free' },
                    { percent: 15, color: '#F6B100', tooltipText: '23 Download' },
                    { percent: 25, color: '#17C653', tooltipText: '34.4 Readers' },
                    { percent: 25, color: '#E4E4E7', tooltipText: 'Other' },
                  ])}
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="dot" style={{ background: '#1B84FF' }}></span> <strong>34.4K</strong> Free Downloads</div>
                <div className="legend-item"><span className="dot" style={{ background: '#FFC700' }}></span> <strong>4.4K</strong> Paid Downloads</div>
                <div className="legend-item"><span className="dot" style={{ background: '#17C653' }}></span> <strong>34.4</strong> Online Readers</div>
              </div>
            </div>
            <div className="chart-footer-stats">
              <span><strong>38.8K</strong> Total Downloads</span>
              <span><strong>34.4 H</strong> Avg. Learning Hours</span>
            </div>
            {renderFlagDropdown('syllabus', 9600000)}
          </div>

          {/* Online Courses Stats Card */}
          <div className="hoa-card hoa-chart-card">
            <div className="section-title" style={{ marginBottom: '20px' }}>ONLINE COURSES'S STATS</div>
            <div className="chart-body-row">
              <div className="donut-wrapper">
                <div className="donut-chart">
                  {renderDonut('courses', [
                    { percent: 35, color: '#17C653', tooltipText: '34.4K Free' },
                    { percent: 10, color: '#F6B100', tooltipText: '23 Failed', tooltipClass: 'tooltip-failed' },
                    { percent: 40, color: '#1B84FF', tooltipText: '4.4K Paid' },
                    { percent: 15, color: '#E4E4E7', tooltipText: 'Other' },
                  ])}
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item"><span className="dot" style={{ background: '#1B84FF' }}></span> <strong>34.4K</strong> Free Courses</div>
                <div className="legend-item"><span className="dot" style={{ background: '#FFC700' }}></span> <strong>4.4K</strong> Paid Courses</div>
                <div className="legend-item"><span className="dot" style={{ background: '#17C653' }}></span> <strong>34.4</strong> Avg. Active students</div>
              </div>
            </div>
            <div className="chart-footer-stats">
              <span><strong>38.8K</strong> Total Learners</span>
              <span><strong>34.4 H</strong> Avg. Learning Hours</span>
            </div>
            {renderFlagDropdown('courses', 9600000)}
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="hoa-approvals-header">
        <div>
          <h2>Learners</h2>
          <p>Online Course & Past Papers</p>
        </div>
        <div className="approvals-actions">
          <div className="search-box">
            <img src={hoasearch} alt="" />
            <input type="text" placeholder="Search Lessons..." />
          </div>

          <div className="hoa-filter-dropdown-wrapper">
            <button type="button" className="hoa-btn-light-purple hoa-filter-trigger" onClick={() => setIsFilterOpen((currentOpen) => !currentOpen)}>
              <img src={hoafilter} alt="" /> Filters
            </button>
            {isFilterOpen && (
              <div className="hoa-filter-dropdown">
                {filterOptions.map((option) => (
                  <button key={option} type="button" className="hoa-filter-option" onClick={() => setIsFilterOpen(false)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="hoa-btn-light-purple">
            <img src={hoaadd} alt="" /> Create new test
          </button>
        </div>
      </div>

      {/* Learners List Layout */}
      <div className="hoa-list-container">
        <table className="hoa-list-table learners-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <button type="button" className="th-content minus-btn-container minus-select-button" onClick={clearSelectedRows}>
                  <div className="minus-icon">-</div>
                </button>
              </th>
              <th style={{ width: '100%' }}><div className="th-content">Student Details (34) <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Avg. Score <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Attempts <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Downloads <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Certificates <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Tot. Paid (USD) <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="status-col"><div className="th-content">Status <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {learnersData.map((req) => (
              <tr key={req.id}>
                <td>
                  <input type="checkbox" className="hoa-checkbox" checked={selectedRows.includes(req.id)} onChange={() => toggleRowSelection(req.id)} />
                </td>
                <td>
                  <div className="list-user-col">
                    <div className="user-meta">
                      <h5>{req.name}</h5>
                      <p className="location-with-flag">
                        <img src={req.flag} alt="flag" className="tiny-flag" /> {req.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="fw-600 text-center">{req.score}</td>
                <td className="fw-500 text-center">{req.attempts}</td>
                <td className="fw-500 text-center">{req.downloads}</td>
                <td className="fw-500 text-center">{req.certs}</td>
                <td className="fw-600 text-center">{req.paid}</td>
                <td className="status-col">
                  <span className={`status-pill pill-${req.statusColor}`}>
                    <span className="dot"></span> {req.status}
                  </span>
                </td>
                <td className="action-col">
                  <a href="#" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(); }}>
                    <img src={hoaopenview} alt="Open" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="hoa-pagination-container list-pagination">
        <div className="pagination-left">
          Show
          <div className="page-size-dropdown">
            <button type="button" className="page-size-button" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
              {pageSize} <img src={hoadowncaret} alt="" />
            </button>
            {isPageSizeOpen && (
              <div className="page-size-menu">
                {pageSizeOptions.map((option) => (
                  <button key={option} type="button" className="page-size-option" onClick={() => handlePageSizeSelect(option)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          per page
        </div>
        <div className="hoa-pagination">
          <span className="page-range">1-10 of 5</span>
          <button className="page-nav"><img src={hoaprev} alt="Prev" /></button>
          <button className="page-num">1</button>
          <button className="page-num active">2</button>
          <button className="page-num">3</button>
          <button className="page-nav"><img src={hoanext} alt="Next" /></button>
        </div>
      </div>

      {/* Learner Preview Modal */}
      <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
        <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

          {/* Modal Header */}
          <div className="modal-top-header">
            <button className="modal-back-btn" onClick={closeModal}>
              <img src={hoagoback} alt="" />
            </button>
            <h2>Learner Preview</h2>
            <div className="modal-header-actions">
              <span className="hoa-update-status" style={{ border: '1px solid #EEF1F6' }}>
                <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 1 hr <span className="dot" style={{ background: '#17C653' }}></span>
              </span>
            </div>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="modal-content-area">

            {/* User Profile Info */}
            <div className="modal-profile-box">
              <div className="profile-left">
                <img src="/assets/imgs/default-profile.png" alt="Avatar" className="profile-avatar" />
                <div className="profile-details">
                  <div className="profile-name-row">
                    <h3>John Doe</h3>
                    <span className="badge-active">Active</span>
                    <span className="badge-icon">
                      <img src={hoauserbadge} alt="" /> 6
                    </span>
                  </div>
                  <div className="profile-meta-row">
                    <span className="badge-missing">UI/UX Designer</span> {/* Used for role per tab 2 */}
                    <span className="bullet-sep">•</span>
                    <span className="profile-email">johndoe@gonaraza.com</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <button className="icon-btn"><img src={hoagrayadd} alt="" /></button>
                <button className="icon-btn"><img src={hoagrayphone} alt="" /></button>
                <button className="icon-btn"><img src={hoagraymail} alt="" /></button>
                <button className="icon-btn"><img src={hoaverticaldots} alt="" /></button>
              </div>
            </div>

            {/* Modal Stats Row */}
            <div className="modal-stats-row">
              <div className="mod-stat">
                <h3>13.3K</h3>
                <p>Total Downloads</p>
              </div>
              <div className="mod-stat">
                <h3>13</h3>
                <p>Total Online Courses</p>
              </div>
              <div className="mod-stat">
                <h3>19.32</h3>
                <p>Avg. Learning hours <span className="trend down"> <img src={hoadecrease} alt="" /> -4.5%</span></p>
              </div>
              <div className="mod-stat">
                <h3>4</h3>
                <p>Total Projects</p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="modal-tabs">
              <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Lessons</button>
              <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
              <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
            </div>

            {/* Tab Contents */}
            <div className="modal-tab-content">

              {/* === LESSONS TAB === */}
              {activeTab === 'lessons' && (
                <div className="tab-lessons">
                  <div className="hoa-list-container modal-table-container">
                    <table className="hoa-list-table mod-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}><div className="minus-icon" style={{ margin: '0 auto' }}>-</div></th>
                          <th><div className="th-content">Course Details (34) <span className="sort-icon"><img src={hoaupdowncaret} alt="" /></span></div></th>
                          <th><div className="th-content">Tutor & Avg. Score (23) <span className="sort-icon"><img src={hoaupdowncaret} alt="" /></span></div></th>
                          <th><div className="th-content">Course Type <span className="sort-icon"><img src={hoaupdowncaret} alt="" /></span></div></th>
                          <th className="text-center"><div className="th-content justify-center">Attempts & Visits <span className="sort-icon"><img src={hoaupdowncaret} alt="" /></span></div></th>
                          <th className="status-col"><div className="th-content">Status <span className="sort-icon"><img src={hoaupdowncaret} alt="" /></span></div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalLessons.map((les) => (
                          <tr key={les.id}>
                            <td><input type="checkbox" className="hoa-checkbox" /></td>
                            <td>
                              <div className="user-meta">
                                <h5>{les.title}</h5>
                                <p style={{ fontSize: '11px', color: '#A1A5B7' }}>{les.date}</p>
                              </div>
                            </td>
                            <td>
                              <div className="user-meta">
                                <h5 style={{ fontWeight: '500' }}>{les.tutor}</h5>
                                <p style={{ fontSize: '11px', color: '#A1A5B7' }}>{les.score}</p>
                              </div>
                            </td>
                            <td>
                              <div className="user-meta">
                                <h5 style={{ fontWeight: '500' }}>{les.type}</h5>
                                <p style={{ fontSize: '11px', color: '#A1A5B7' }}>{les.duration}</p>
                              </div>
                            </td>
                            <td className="fw-600 text-center">{les.attempts}</td>
                            <td className="status-col">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                <span className={`mod-status-pill st-${les.statusType}`}>{les.status}</span>
                                <button className="icon-more-btn">⋮</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="hoa-pagination-container list-pagination" style={{ marginBottom: '40px' }}>
                    <div className="pagination-left">
                      Show
                      <div className="page-size-dropdown" style={{ margin: '0 8px' }}>
                        <button type="button" className="page-size-button" style={{ padding: '2px 8px' }}>10 <img src={hoadowncaret} alt="" /></button>
                      </div>
                      per page
                    </div>
                    <div className="hoa-pagination">
                      <span className="page-range">1-10 of 5</span>
                      <button className="page-nav"><img src={hoaleftarrow} style={{ width: '15px', }} alt="Prev" /></button>
                      <button className="page-num">1</button>
                      <button className="page-num active">2</button>
                      <button className="page-num">3</button>
                      <button className="page-nav"><img src={hoarightarrow} style={{ width: '15px' }} alt="Next" /></button>
                    </div>
                  </div>

                  <div className="docs-header">
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#071437' }}>Documents</h3>
                      <p style={{ margin: '0', fontSize: '12px', color: '#A1A5B7' }}>Files & Certificate</p>
                    </div>
                    <button className="hoa-btn-light-purple" style={{ gap: '8px' }}>
                      <img src={hoadownloadall} alt="" />
                      Download All
                    </button>
                  </div>

                  <div className="docs-grid">
                    {modalDocuments.map((doc) => (
                      <div key={doc.id} className="doc-card">
                        <div className="doc-info">
                          {doc.type === 'ribbon' ? (
                            <img src={hoaknot} alt="" />
                          ) : (
                            <img src={hoapdffile} alt="" />)}
                          <div>
                            <h4>{doc.name}</h4>
                            <p>{doc.size}</p>
                          </div>
                        </div>
                        <button className="download-btn">
                          <img src={hoadownload} alt="" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === PROJECTS TAB === */}
              {activeTab === 'projects' && (
                <div className="tab-projects">
                  <div className="proj-info-grid">
                    <div className="info-col">
                      <h4>Profile Info</h4>
                      <ul>
                        <li><img src={hoausericon} alt="" /> UI UX Design</li>
                        <li><img src={hoabriefcase} alt="" /> 6 yrs experience</li>
                        <li><img src={hoalocation} alt="" /> Kigali, Rwanda</li>
                      </ul>
                    </div>
                    <div className="info-col">
                      <h4>Tools & Skills</h4>
                      <ul className="text-list">
                        <li>Adobe Illustrator</li>
                        <li>Adobe Photoshop</li>
                        <li>Coding Skills (CSS, HTML & REACT), +1</li>
                      </ul>
                    </div>
                    <div className="info-col text-right-align">
                      <h4>Projects Stats</h4>
                      <ul className="stats-list">
                        <li><span>Project Views</span> 1,345,780</li>
                        <li><span>Project Likes</span> 236,890</li>
                        <li><span>Project Feedbacks</span> 103,006</li>
                      </ul>
                    </div>
                  </div>

                  <div className="projects-header">
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#071437' }}>My Projects</h3>
                      <p style={{ margin: '0', fontSize: '13px', color: '#A1A5B7' }}><strong>100</strong> Projects in total</p>
                    </div>
                    <button className="follower-btn">
                      <img src={hoafollowers} alt="" />
                      <strong>129</strong> Followers
                    </button>
                  </div>
                  <div className="projects-grid">
                    {modalProjects.map((proj, idx) => (
                      <div key={idx} className="project-card">
                        <div className="proj-img" style={{ backgroundImage: `url(${hoaproject})` }}></div>
                        <div className="proj-meta">
                          <span className="author">By <a href="#" onClick={preventDefault}>{proj.author}</a></span>
                          <div className="proj-stats">
                            <span className="stat-like" onClick={() => toggleProjectLike(idx)} style={{ cursor: 'pointer' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill={likedProjects[idx] ? "#F8285A" : "#A1A5B7"}>
                                <path d="M20.84 4.61A5.5 5.5 0 0012 5.67A5.5 5.5 0 003.16 4.61C2.5 5.28 2 6.2 2 7.21C2 8.23 2.5 9.15 3.16 9.83L12 18.67L20.84 9.83C21.5 9.15 22 8.23 22 7.21C22 6.2 21.5 5.28 20.84 4.61Z" />
                              </svg> {proj.likes}
                            </span>
                            <span className="stat-view"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A5B7" strokeWidth="2"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg> {proj.views}</span>
                          </div>
                        </div>
                        <p className="proj-title">{proj.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* === ACTIVITY TAB === */}
              {activeTab === 'activity' && (
                <div className="tab-activity">

                  <div className="activity-header">
                    <div className="login-info">
                      <span className="label">Last Login</span>
                      <p><strong>Wed Apr 23, 2023</strong> at <strong>11 : 33 PM</strong></p>
                    </div>
                    <div className="priority-badge">
                      <span className="label">Priority</span>
                      <span className="badge-high">High</span>
                    </div>
                  </div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '24px 0 20px 0', color: '#071437', fontSize: '16px',fontWeight:600 }}>
                    <img src={hoacalendar} alt="calendar" />
                    Upcoming Activity
                  </h4>

                  <div className="upcoming-activity-card" style={{ background: '#FAFAFA', borderRadius: '2px', padding: '20px' }}>
                    <div className="event-row" style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, fontSize: '15px', color: '#071437', fontWeight: 600 }}>Event Name</h5>
                      <span className="event-status" style={{ border: '1px solid #17C65333', borderRadius: '4px', padding: '4px 8px', background: '#EAFFF1', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#04B440', fontWeight: 600 }}>Approved <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#17C653" strokeWidth="2" /></svg></span>
                    </div>

                    <p className="event-desc" style={{ fontSize: '13px', color: '#78829D', lineHeight: 1.5, margin: '16px 0 0 0' }}>
                      Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
                    </p>
                    <div className="event-forms" style={{ display: 'flex', background: '#FFFFFF', padding: '12px', borderRadius: '2px', border: '1px solid #F1F1F4', marginTop: '10px' }}>
                      <div className="form-group border-right" style={{ flex: 1, borderRight: '1px solid #EEF1F6', paddingRight: '16px' }}>
                        <label style={{ fontSize: '11px', color: '#A1A5B7', marginBottom: '8px', display: 'block' }}>Reminder</label>
                        <div className="form-select borderless" style={{ border: 'none', background: 'transparent', padding: '0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#071437', fontWeight: 600 }}>No Reminder <img src={hoadowncaret} alt="" /></div>
                      </div>
                      <div className="form-group border-right" style={{ flex: 1, borderRight: '1px solid #EEF1F6', padding: '0 16px' }}>
                        <label style={{ fontSize: '11px', color: '#A1A5B7', marginBottom: '8px', display: 'block' }}>Task Priority</label>
                        <div className="form-select borderless" style={{ border: '1px solid #7239EA33', background: '#F8F5FF', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#7239EA', width: '75px', height: '24px', borderRadius: '30px' }}><span className="dot" style={{ background: '#7239EA', width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }}></span> High <img src={hoadowncaret} alt="" /></div>
                      </div>
                      <div className="form-group" style={{ flex: 1, paddingLeft: '16px' }}>
                        <label style={{ fontSize: '11px', color: '#A1A5B7', marginBottom: '8px', display: 'block' }}>Assigned To</label>
                        <div className="form-select borderless" style={{ border: 'none', background: 'transparent', padding: '0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#071437', fontWeight: 600 }}>
                          <img src="/assets/imgs/default-profile.png" alt="" className="tiny-avatar" style={{ borderRadius: '50%' }} /> Esther Howard <img src={hoadowncaret} alt="" />
                        </div>
                      </div>
                    </div>
                    <div className="event-nav" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                      <button className="nav-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EEF1F6', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><img src={hoaprev} alt="" /></button>
                      <button className="nav-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EEF1F6', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><img src={hoanext} alt="" /></button>
                    </div>
                  </div>


                  <div className="qa-section">
                    <h4 style={{ fontSize: '14px', color: '#071437', margin: '30px 0 15px 0' }}>Questions & Answers</h4>

                    {/* Ticket 1 */}
                    <div className={`ticket-card border-green ${!openTickets[1] ? 'collapsed' : ''}`}>
                      <div className="ticket-header" onClick={() => toggleTicket(1)} style={{ cursor: 'pointer' }}>
                        <div className="ticket-meta">
                          <strong>Ticket No : #TKT1204567</strong>
                          <span>CC : maxsmith@gonaraza.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="ticket-status st-solved">Solved</div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openTickets[1] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                      </div>

                      {openTickets[1] && (
                        <div className="ticket-body">
                          <div className="ticket-user">
                            <img src="/assets/imgs/default-profile.png" alt="" className="tiny-avatar" style={{ borderRadius: '50%' }} />
                            <div>
                              <strong>Max Smith <svg width="12" height="12" viewBox="0 0 24 24" fill="#17C653"><circle cx="12" cy="12" r="10" /><path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" /></svg> <span className="role-badge">Professor</span></strong>
                              <span>maxsmith@gonaraza.com</span>
                            </div>
                          </div>
                          <div className="ticket-content">
                            <p>Ads is not displaying and i paid for all fees, 3 batches please help me as soon as possible.</p>
                            <div className="ticket-attachment" style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
                              <div style={{ paddingTop: '8px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg>
                              </div>
                              <div 
                                className="attach-img" 
                                style={{ backgroundImage: `url(${hoaproject})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100px', width: '140px', borderRadius: '6px', border: '1px solid #DBDFE9', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                onClick={() => setFullScreenImage(hoaproject)}
                              >
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', width: '24px', height: '24px', borderTopLeftRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                </div>
                              </div>
                            </div>
                            <p>Ads is not displaying and i paid for all fees, 3 batches please help me as soon as possible.</p>
                          </div>
                          <div className="ticket-actions">
                            <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.95 8.99672 19.66 9H14Z" stroke="#7239EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 22H3C2.46957 22 1.96086 21.7893 1.58579 21.4142C1.21071 21.0391 1 20.5304 1 20V13C1 12.4696 1.21071 11.9609 1.58579 11.5858C1.96086 11.2107 2.46957 11 3 11H7V22Z" stroke="#7239EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> <span style={{ color: '#7239EA', fontWeight: '600' }}>Yes</span></button>
                            <button><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 15V19C10 19.7956 10.3161 20.5587 10.8787 21.1213C11.4413 21.6839 12.2044 22 13 22L17 13V2H5.72C5.23773 1.99451 4.76961 2.16358 4.40212 2.47597C4.03463 2.78836 3.79234 3.22312 3.72 3.7L2.34 12.7C2.29653 12.9866 2.31575 13.2793 2.39665 13.5577C2.47754 13.8362 2.61794 14.0937 2.80814 14.3125C2.99834 14.5313 3.23389 14.7061 3.49836 14.8248C3.76284 14.9435 4.05001 15.0033 4.34 15H10Z" stroke="#A1A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 2H21C21.5304 2 22.0391 2.21071 22.4142 2.58579C22.7893 2.96086 23 3.46957 23 4V11C23 11.5304 22.7893 12.0391 22.4142 12.4142C22.0391 12.7893 21.5304 13 21 13H17V2Z" stroke="#A1A5B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> <span style={{ color: '#A1A5B7' }}>No</span></button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket 2 */}
                    <div className={`ticket-card border-red ${!openTickets[2] ? 'collapsed' : ''}`}>
                      <div className="ticket-header" onClick={() => toggleTicket(2)} style={{ cursor: 'pointer' }}>
                        <div className="ticket-meta">
                          <strong>Ticket No : #TKT1204567</strong>
                          <span>CC : maxsmith@gonaraza.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="ticket-status st-unsolved">Unsolved</div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openTickets[2] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                      </div>
                      {openTickets[2] && (
                        <div className="ticket-body">
                          <div className="ticket-content"><p>Ticket 2 content goes here.</p></div>
                        </div>
                      )}
                    </div>

                    {/* Ticket 3 */}
                    <div className={`ticket-card border-blue ${!openTickets[3] ? 'collapsed' : ''}`}>
                      <div className="ticket-header" onClick={() => toggleTicket(3)} style={{ cursor: 'pointer' }}>
                        <div className="ticket-meta">
                          <strong>Ticket No : #TKT1204567</strong>
                          <span>CC : maxsmith@gonaraza.com</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="ticket-status st-review">In Review</div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openTickets[3] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                      </div>
                      {openTickets[3] && (
                        <div className="ticket-body">
                          <div className="ticket-content"><p>Ticket 3 content goes here.</p></div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {fullScreenImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', padding: '10px' }}>&times;</button>
          <img src={fullScreenImage} alt="Full Screen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
        </div>
      )}
    </HOALayout>
  );
};

export default HOALearners;