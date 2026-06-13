import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-learners.css';

// --- Icons & Images ---
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
import hoavbadge from '../../../assets/icons/hoavbadge.svg';
import hoareply from '../../../assets/icons/hoareply.svg';
import defaultAvatar from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOALearners = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const { currency, setCurrency, formatAmount } = useCurrency();

  // --- Main Data State ---
  const [learnersData, setLearnersData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI/Filter State ---
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Learners');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('5');
  const pageSizeOptions = ['5', '10', '25']; // Restored missing variable
  
  // --- Dropdowns & Refs ---
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const pageSizeRef = useRef(null);
  const filterRef = useRef(null);
  const flagRef = useRef(null);

  // --- Modal & Detailed View State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLearnerId, setActiveLearnerId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalSelectedRows, setModalSelectedRows] = useState([]);
  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });

  const filterOptions = ['All Learners', 'Active', 'Inactive', 'Suspended'];

  // --- Click Outside Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) setIsPageSizeOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (flagRef.current && !flagRef.current.contains(event.target)) setOpenFlagDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Data Fetching ---
  const fetchLearnersData = async (mounted = true) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // If no token exists, boot them immediately
      if (!token) {
        navigate('/academia/auth/signin');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, learnersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/learners/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/learners`, { headers }).catch(() => null)
      ]);

      if (!mounted) return;

      // Handle 401 Unauthorized / Token Expiry
      if (statsRes?.status === 401 || learnersRes?.status === 401) {
        console.warn("Unauthorized access. Token may be expired.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/academia/auth/signin');
        return;
      }

      if (statsRes?.ok) {
        const sBody = await statsRes.json();
        setStatsData(sBody?.data || sBody);
      } else {
        setStatsData({}); // Fallback
      }

      if (learnersRes?.ok) {
        const lBody = await learnersRes.json();
        const list = Array.isArray(lBody?.data) ? lBody.data : (Array.isArray(lBody) ? lBody : []);
        setLearnersData(list.map(user => ({
          id: user.id || user._id,
          name: user.name || 'Unknown Learner',
          location: user.location || 'Global',
          flag: user.country_code === 'RW' ? rwanda : hoausflag,
          score: user.average_score || '0.00',
          attempts: user.total_attempts || 0,
          downloads: user.total_downloads || 0,
          certs: user.total_certificates || 0,
          paid: user.total_spent || '0',
          status: user.status === 'active' ? 'Active' : 'Inactive',
          statusColor: user.status === 'active' ? 'green' : 'gray'
        })));
      } else {
        setLearnersData([]);
      }
    } catch (error) {
      console.error("Failed to fetch learners", error);
      if (mounted) {
        setStatsData({});
        setLearnersData([]);
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchLearnersData(mounted);
    return () => { mounted = false; };
  }, []);

  // --- Memoized Sorting & Filtering (Main Table) ---
  const processedData = useMemo(() => {
    let filtered = learnersData || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => (item.name || '').toLowerCase().includes(q));
    }

    if (activeFilter !== 'All Learners') {
      filtered = filtered.filter(item => item.status === activeFilter);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Convert to number for comparison if applicable
      if (['score', 'attempts', 'downloads', 'certs', 'paid'].includes(sortConfig.key)) {
        aVal = Number(String(aVal).replace(/[^0-9.-]+/g, '')) || 0;
        bVal = Number(String(bVal).replace(/[^0-9.-]+/g, '')) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [learnersData, sortConfig, searchQuery, activeFilter]);

  // --- Pagination ---
  const totalItems = processedData.length;
  const limit = parseInt(pageSize) || 5;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [searchQuery, activeFilter, pageSize]);

  // --- Handlers ---
  const toggleRowSelection = (rowId) => {
    setSelectedRows((current) => current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]);
  };
  
  const toggleAllVisibleRows = () => {
    if (selectedRows.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(req => req.id));
    }
  };

  const handleSort = (key) => {
    setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleModalSort = (key) => {
    setModalSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const openModal = (learnerId) => {
    setActiveLearnerId(learnerId);
    // TODO: Trigger fetch for GET /api/admin/learners/{learnerId}/profile
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setActiveLearnerId(null);
    setActiveTab('lessons');
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // --- Sorting Utility for Modal Data ---
  const getSortedData = (data, config) => {
    if (!config.key || !Array.isArray(data)) return data || [];
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      if (config.key === 'date') {
         aVal = new Date(aVal).getTime() || 0;
         bVal = new Date(bVal).getTime() || 0;
      }
      
      // Handle special numeric cases like "---"
      if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
      if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Donut Chart Renderer ---
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
                key={idx} cx="50" cy="50" r={radius} fill="none"
                stroke={seg.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashPercent} 100`} strokeDashoffset={offsetPercent}
                pathLength="100"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseMove={(e) => {
                  const svgRect = e.target.closest('svg').getBoundingClientRect();
                  setHoverData({ chartId, text: seg.tooltipText, tooltipClass: seg.tooltipClass, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
                }}
                onMouseLeave={() => setHoverData({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 })}
              />
            );
          })}
        </svg>
        {hoverData.chartId === chartId && (
          <div className={`donut-tooltip ${hoverData.tooltipClass || ''}`} style={{ top: `${hoverData.y + 10}px`, left: `${hoverData.x + 10}px` }}>
            {hoverData.text}
          </div>
        )}
      </div>
    );
  };

  // --- Flag Dropdown Renderer ---
  const renderFlagDropdown = (key, baseValueRWF) => (
    <div className="hoa-revenue-dropdown-box" ref={openFlagDropdown === key ? flagRef : null}>
      <span className="revenue-label">Total Revenue</span>
      <div className="revenue-value-picker">
        <span className="revenue-value">{formatAmount(baseValueRWF)}</span>
        <div className="flag-dropdown-wrapper">
          <button type="button" className="flag-dropdown-trigger" onClick={() => setOpenFlagDropdown(openFlagDropdown === key ? null : key)}>
            <img src={currency.flag} alt="flag" className="flag-icon" />
            <img src={hoadowncaret} alt="drop" className="flag-dropdown-caret" />
          </button>
          {openFlagDropdown === key && (
            <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px' }}>
              {flagOptions.map((option, idx) => (
                <button
                  key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`}
                  onClick={() => { setCurrency(option); setOpenFlagDropdown(null); }}
                >
                  <img src={option.flag} alt="flag" className="flag-icon" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Dummy Data for the Modal (Needs mapping from backend later) ---
  const modalLessons = [
    { id: 1, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', tutor: 'Alexis Froduard', score: '85.67', type: 'Course', duration: '4 Weeks', attempts: '3', status: 'Passed', statusType: 'passed' },
    { id: 2, title: 'React UI Architecture', date: '15 Feb 2024', tutor: 'Sarah Jenkins', score: '45.45', type: 'Course', duration: '4 Weeks', attempts: '2', status: 'Failed', statusType: 'failed' },
  ];
  const modalDocuments = [
    { id: 1, name: 'Javascript Fundamental', size: '5.6 MB', type: 'ribbon' },
    { id: 3, name: 'My Resume.pdf', size: '1.2 MB', type: 'pdf' },
  ];

  return (
    <HOALayout currentPage="learners">
      <div className="hoa-learners-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Learners</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchLearnersData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Sync" className={`sync-icon ${isLoading ? 'spinning' : ''}`} /> 
              {isLoading ? 'Updating...' : 'Data updated every 5min'} <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {/* Top Mini Stats Container */}
        <div className="hoa-dashboard-stats-container">
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat"><h4>{statsData?.syllabus_downloads || '0'}</h4><p>Syllabus Downloads</p></div>
            <div className="sub-stat"><h4>{statsData?.online_learners || '0'}</h4><p>Online Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.competent_learners || '0'}</h4><p>Competent Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.nyc_learners || '0'}</h4><p>NYC Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.avg_score || '0.0'}</h4><p>Average Score <span className="trend down"> <img src={hoadecrease} alt="" /> -4.5%</span></p></div>
            <div className="sub-stat"><h4>{statsData?.certificates || '0'}</h4><p>Certificates <span className="trend up"> <img src={hoaincrease} alt="" /> +4.1</span></p></div>
          </div>
        </div>

        {/* Charts Container */}
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
              <img src={hoasearch} alt="Search" />
              <input 
                type="text" 
                placeholder="Search Learners..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hoa-filter-dropdown-wrapper" ref={filterRef}>
              <button 
                type="button" 
                className={`hoa-btn-light-purple hoa-filter-trigger ${activeFilter !== 'All Learners' ? 'active-filter' : ''}`} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ 
                  background: activeFilter !== 'All Learners' ? '#450468' : '#F3E8FF',
                  color: activeFilter !== 'All Learners' ? '#fff' : '#450468'
                }}
              >
                <img src={hoafilter} alt="" style={{ filter: activeFilter !== 'All Learners' ? 'brightness(0) invert(1)' : 'none' }} /> 
                {activeFilter === 'All Learners' ? 'Filters' : activeFilter}
              </button>
              {isFilterOpen && (
                <div className="hoa-filter-dropdown">
                  {filterOptions.map((option) => (
                    <button 
                      key={option} 
                      type="button" 
                      className={`hoa-filter-option ${activeFilter === option ? 'active' : ''}`}
                      onClick={() => { setActiveFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="hoa-btn-light-purple">
              <img src={hoaadd} alt="Add" /> Create new test
            </button>
          </div>
        </div>

        {/* Learners List Layout */}
        <div className="hoa-list-container">
          <table className="hoa-list-table learners-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <button type="button" className="th-content minus-btn-container minus-select-button" onClick={toggleAllVisibleRows}>
                    <div className="minus-icon" style={{ margin: '0 auto' }}>-</div>
                  </button>
                </th>
                <th><div className="th-content" onClick={() => handleSort('name')}>Student Details ({processedData.length}) <span className={`sort-icon ${sortConfig.key === 'name' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="text-center"><div className="th-content justify-center" onClick={() => handleSort('score')}>Avg. Score <span className={`sort-icon ${sortConfig.key === 'score' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="text-center"><div className="th-content justify-center" onClick={() => handleSort('attempts')}>Attempts <span className={`sort-icon ${sortConfig.key === 'attempts' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="text-center"><div className="th-content justify-center" onClick={() => handleSort('downloads')}>Downloads <span className={`sort-icon ${sortConfig.key === 'downloads' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="text-center"><div className="th-content justify-center" onClick={() => handleSort('certs')}>Certificates <span className={`sort-icon ${sortConfig.key === 'certs' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="text-center" style={{ position: 'relative' }}>
                  <div className="th-content justify-center" onClick={() => handleSort('paid')}>
                    Tot. Paid ({currency.label}) <span className={`sort-icon ${sortConfig.key === 'paid' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span>
                  </div>
                </th>
                <th className="status-col"><div className="th-content" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((req) => (
                <tr key={req.id} className={selectedRows.includes(req.id) ? 'selected-row' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="hoa-checkbox"
                      checked={selectedRows.includes(req.id)}
                      onChange={() => toggleRowSelection(req.id)}
                    />
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
                  <td className="fw-600 text-center">{formatAmount(req.paid)}</td>
                  <td className="status-col">
                    <span className={`status-pill pill-${req.statusColor}`}>
                      <span className="dot"></span> {req.status}
                    </span>
                  </td>
                  <td className="action-col">
                    <a href="#view" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(req.id); }}>
                      <img src={hoaopenview} alt="Open" />
                    </a>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && !isLoading && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>No learners found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown" ref={pageSizeRef}>
              <button type="button" className="page-size-button" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map((option) => (
                    <button key={option} type="button" className="page-size-option" onClick={() => { setPageSize(option); setIsPageSizeOpen(false); }}>
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            per page
          </div>
          <div className="hoa-pagination">
            <span className="page-range">
              {totalItems === 0 ? '0' : `${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalItems)}`} of {totalItems}
            </span>
            <button className="page-nav" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <img src={hoaprev} alt="Prev" style={{ opacity: currentPage === 1 ? 0.5 : 1 }} />
            </button>
            
            {getPageNumbers().map(num => (
              <button 
                key={num} 
                className={`page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => goToPage(num)}
              >
                {num}
              </button>
            ))}

            {totalPages > 3 && currentPage < totalPages - 1 && <span className="page-dots">...</span>}

            <button className="page-nav" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <img src={hoanext} alt="Next" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }} />
            </button>
          </div>
        </div>

        {/* --- Learner Preview Modal --- */}
        <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

            <div className="modal-top-header">
              <button className="modal-back-btn" onClick={closeModal}>
                <img src={hoagoback} alt="Back" />
              </button>
              <h2>Learner Preview</h2>
              <div className="modal-header-actions">
                <span className="hoa-update-status" style={{ border: '1px solid #EEF1F6' }}>
                  <img src={hoarefresh} alt="Sync" className="sync-icon" /> Data updated every 1 hr <span className="dot" style={{ background: '#17C653' }}></span>
                </span>
              </div>
            </div>

            <div className="modal-content-area">
              
              {/* User Profile Info */}
              <div className="modal-profile-box">
                <div className="profile-left">
                  <img src={defaultAvatar} alt="Avatar" className="profile-avatar" />
                  <div className="profile-details">
                    <div className="profile-name-row">
                      <h3>{learnersData.find(l => l.id === activeLearnerId)?.name || 'Loading Learner...'}</h3>
                      <span className="badge-active">Active</span>
                      <span className="badge-icon"><img src={hoauserbadge} alt="" /> 6</span>
                    </div>
                    <div className="profile-meta-row">
                      <span className="badge-missing">Enrolled Student</span>
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="icon-btn" title="Add Note"><img src={hoagrayadd} alt="Add" /></button>
                  <button className="icon-btn tooltip-trigger" title="Call">
                    <span className="action-tooltip">+250 123 456 789</span>
                    <img src={hoagrayphone} alt="Call" />
                  </button>
                  <button className="icon-btn tooltip-trigger" title="Email">
                    <span className="action-tooltip">student@academia.com</span>
                    <img src={hoagraymail} alt="Email" />
                  </button>
                  <button className="icon-btn"><img src={hoaverticaldots} alt="More" /></button>
                </div>
              </div>

              {/* Modal Stats Row */}
              <div className="modal-stats-row">
                <div className="mod-stat">
                  <h3>{learnersData.find(l => l.id === activeLearnerId)?.downloads || 0}</h3>
                  <p>Total Downloads</p>
                </div>
                <div className="mod-stat">
                  <h3>{learnersData.find(l => l.id === activeLearnerId)?.attempts || 0}</h3>
                  <p>Total Courses</p>
                </div>
                <div className="mod-stat">
                  <h3>{learnersData.find(l => l.id === activeLearnerId)?.score || 0}</h3>
                  <p>Avg. Score <span className="trend down"> <img src={hoadecrease} alt="" /> -4.5%</span></p>
                </div>
                <div className="mod-stat">
                  <h3>{learnersData.find(l => l.id === activeLearnerId)?.certs || 0}</h3>
                  <p>Certificates Issued</p>
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
                
                {/* --- LESSONS TAB --- */}
                {activeTab === 'lessons' && (
                  <div className="tab-lessons">
                    <div className="hoa-list-container modal-table-container">
                      <table className="hoa-list-table mod-table">
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}>
                              <button type="button" className="th-content minus-btn-container minus-select-button" onClick={() => setModalSelectedRows([])}>
                                <div className="minus-icon" style={{ margin: '0 auto' }}>-</div>
                              </button>
                            </th>
                            <th><div className="th-content" onClick={() => handleModalSort('title')}>Course Details <span className={`sort-icon ${modalSortConfig.key === 'title' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('tutor')}>Tutor & Score <span className={`sort-icon ${modalSortConfig.key === 'tutor' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('type')}>Type <span className={`sort-icon ${modalSortConfig.key === 'type' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th className="text-center"><div className="th-content justify-center" onClick={() => handleModalSort('attempts')}>Attempts <span className={`sort-icon ${modalSortConfig.key === 'attempts' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th className="status-col"><div className="th-content" onClick={() => handleModalSort('status')}>Status <span className={`sort-icon ${modalSortConfig.key === 'status' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedData(modalLessons, modalSortConfig).map((les) => (
                            <tr key={les.id} className={modalSelectedRows.includes(les.id) ? 'selected-row' : ''}>
                              <td><input type="checkbox" className="hoa-checkbox" checked={modalSelectedRows.includes(les.id)} onChange={() => setModalSelectedRows(c => c.includes(les.id) ? c.filter(id => id !== les.id) : [...c, les.id])} /></td>
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

                    <div className="docs-header" style={{ marginTop: '20px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#071437' }}>Documents</h3>
                        <p style={{ margin: '0', fontSize: '12px', color: '#A1A5B7' }}>Files & Certificates</p>
                      </div>
                      <button className="hoa-btn-light-purple" style={{ gap: '8px' }}>
                        <img src={hoadownloadall} alt="" /> Download All
                      </button>
                    </div>

                    <div className="docs-grid">
                      {modalDocuments.map((doc) => (
                        <div key={doc.id} className="doc-card">
                          <div className="doc-info">
                            <img src={doc.type === 'ribbon' ? hoaknot : hoapdffile} alt="" />
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

                {/* --- PROJECTS TAB --- */}
                {activeTab === 'projects' && (
                  <div className="tab-projects" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <h4>Portfolio Coming Soon</h4>
                    <p>Learner submitted projects will appear here once connected to the API.</p>
                  </div>
                )}

                {/* --- ACTIVITY TAB --- */}
                {activeTab === 'activity' && (
                  <div className="tab-activity">
                    <div className="activity-header">
                      <div className="login-info">
                        <span className="label">Last Login</span>
                        <p><strong>Wed Apr 23, 2024</strong> at <strong>11 : 33 PM</strong></p>
                      </div>
                      <div className="priority-badge">
                        <span className="label">Status</span>
                        <span className="badge-high" style={{ background: '#DCFCE7', color: '#16A34A', border: 'none' }}>Online</span>
                      </div>
                    </div>

                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '24px 0 20px 0', color: '#071437', fontSize: '16px', fontWeight: 600 }}>
                      <img src={hoacalendar} alt="calendar" /> System Logs
                    </h4>
                    
                    <div className="qa-section">
                      <div className={`ticket-card border-green ${!openTickets[1] ? 'collapsed' : ''}`}>
                        <div className="ticket-header" onClick={() => toggleTicket(1)} style={{ cursor: 'pointer' }}>
                          <div className="ticket-meta">
                            <strong>Log No : #LOG1204567</strong>
                            <span>Action: Course Enrollment</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="ticket-status st-solved">Success</div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openTickets[1] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" /></svg>
                          </div>
                        </div>

                        {openTickets[1] && (
                          <div className="ticket-body">
                            <div className="ticket-content">
                              <p>Successfully enrolled in "Javascript Fundamental Quiz" via mobile money payment.</p>
                            </div>
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
        
        {/* Fullscreen Image Preview */}
        {fullScreenImage && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', padding: '10px' }}>&times;</button>
            <img src={fullScreenImage} alt="Full Screen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}

      </div>
    </HOALayout>
  );
};

export default HOALearners;