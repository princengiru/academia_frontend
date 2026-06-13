import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-tutors.css';

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
import hoayellowstar from '../../../assets/icons/hoayellowstar.svg';
import hoasyllabus from '../../../assets/icons/hoasyllabus.svg';
import hoaonlinecourses from '../../../assets/icons/hoaonlinecourses.svg';
import hoaprojects from '../../../assets/icons/hoaprojects.svg';
import hoatotalstudents from '../../../assets/icons/hoatotalstudents.svg';
import hoabrickspattern from '../../../assets/imgs/hoabrickspattern.png';
import defaultAvatar from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOATutors = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const { currency, setCurrency, formatAmount } = useCurrency();

  // --- Main Data State ---
  const [tutorsData, setTutorsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- UI/Filter State ---
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Tutors');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('5');
  const pageSizeOptions = ['5', '10', '25'];

  // --- Dropdowns & Refs ---
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const pageSizeRef = useRef(null);
  const filterRef = useRef(null);
  const flagRef = useRef(null);

  // --- Modal & Detailed View State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTutorId, setActiveTutorId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalSelectedRows, setModalSelectedRows] = useState([]);
  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  const [likedProjects, setLikedProjects] = useState({});
  const [openAttendees, setOpenAttendees] = useState(false);
  const [openThisWeek, setOpenThisWeek] = useState(false);
  const [activeWeekFilter, setActiveWeekFilter] = useState('This week');
  const weekFilters = ['Today', 'This week', 'This month', 'This year'];
  const [openDots, setOpenDots] = useState(null);

  const filterOptions = ['All Tutors', 'Active', 'Inactive', 'Suspended'];

  const attendeesList = [
    { name: 'John Doe', avatar: defaultAvatar },
    { name: 'Jane Smith', avatar: defaultAvatar },
    { name: 'Esther Howard', avatar: defaultAvatar },
    { name: 'Cody Fisher', avatar: defaultAvatar },
  ];

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
  const fetchTutorsData = async (mounted = true) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/academia/auth/signin');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, tutorsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/instructors/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/instructors`, { headers }).catch(() => null)
      ]);

      if (!mounted) return;

      // Check for token expiry
      if (statsRes?.status === 401 || tutorsRes?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/academia/auth/signin');
        return;
      }

      if (statsRes?.ok) {
        const sBody = await statsRes.json();
        setStatsData(sBody?.data || sBody);
      } else {
        setStatsData({}); // Empty state
      }

      if (tutorsRes?.ok) {
        const tBody = await tutorsRes.json();
        const list = Array.isArray(tBody?.data) ? tBody.data : (Array.isArray(tBody) ? tBody : []);
        
        setTutorsData(list.map(tutor => ({
          id: tutor.id || tutor._id,
          name: tutor.name || 'Unknown Tutor',
          location: tutor.location || 'Global',
          flag: tutor.country_code === 'RW' ? rwanda : hoausflag,
          phone: tutor.phone || '---',
          email: tutor.email || 'No email',
          role: tutor.specialization || 'Tutor',
          uploads: tutor.total_uploads || '0',
          paid: tutor.total_earnings || '0',
          status: tutor.status === 'active' ? 'Active' : 'Inactive',
          statusColor: tutor.status === 'active' ? 'green' : 'gray'
        })));
      } else {
        setTutorsData([]);
      }
    } catch (error) {
      console.error("Failed to fetch tutors", error);
      if (mounted) {
        setStatsData({});
        setTutorsData([]);
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchTutorsData(mounted);
    return () => { mounted = false; };
  }, []);

  // --- Memoized Sorting & Filtering (Main Table) ---
  const processedData = useMemo(() => {
    let filtered = tutorsData || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q));
    }

    if (activeFilter !== 'All Tutors') {
      filtered = filtered.filter(item => item.status === activeFilter);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (['uploads', 'paid'].includes(sortConfig.key)) {
        aVal = Number(String(aVal).replace(/[^0-9.-]+/g, '')) || 0;
        bVal = Number(String(bVal).replace(/[^0-9.-]+/g, '')) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tutorsData, sortConfig, searchQuery, activeFilter]);

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

  const openModal = (tutorId) => {
    setActiveTutorId(tutorId);
    // Future: Trigger fetch for GET /api/admin/instructors/{tutorId}/profile
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTutorId(null);
    setActiveTab('lessons');
  };

  const toggleProjectLike = (idx) => {
    setLikedProjects((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
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
      
      if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
      if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
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

  // --- Dummy Data for Modal ---
  const modalLessons = [
    { id: 1, title: 'Javascript Fundamental', date: '12 Jan 2024', type: 'Course', duration: '4 Weeks', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Free', feeAmount: '0 USD', feeColor: '#5014D0', status: 'Published', statusType: 'paid' },
    { id: 2, title: 'React Hooks Deep Dive', date: '15 Feb 2024', type: 'Course', duration: '2 Weeks', students: '120', views: '1.4K Views', amount: '150.0 USD', amountSub: '15', certs: '3', score: '10.50 %', feeStatus: 'Paid', feeAmount: '35 USD', feeColor: '#04B440', status: 'Draft', statusType: 'failed' },
  ];
  
  const modalDocuments = [
    { id: 1, name: 'Syllabus PDF', size: '5.6 MB', type: 'pdf' },
    { id: 2, name: 'Instructor ID', size: '1.2 MB', type: 'pdf' },
  ];

  const modalProjects = Array(6).fill({
    image: 'https://via.placeholder.com/300x150/E2E8F0/A1A5B7?text=Project+Preview',
    author: 'Tutor Admin',
    likes: '1.2K',
    views: '5.4K',
    title: 'Advanced Architecture Presentation'
  });

  return (
    <HOALayout currentPage="tutors">
      <div className="hoa-tutors-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Tutors</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchTutorsData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="" className={`sync-icon ${isLoading ? 'spinning' : ''}`} /> 
              {isLoading ? 'Updating...' : 'Data updated every 5min'} <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {/* Stats Container */}
        <div className="hoa-dashboard-stats-container">
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat"><h4>{statsData?.total_tutors || '0'}</h4><p>Total Tutors</p></div>
            <div className="sub-stat"><h4>{statsData?.syllabus_uploads || '0'}</h4><p>Syllabus Uploads</p></div>
            <div className="sub-stat"><h4>{statsData?.online_courses || '0'}</h4><p>Online Courses</p></div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount(`${statsData?.upload_payments || 0} RWF`).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Upload Payments <span className="trend down"> <img src={hoadecrease} alt="" /> -0.0%</span></p>
            </div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount(`${statsData?.amount_paid || 0} RWF`).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Amount Paid <span className="trend up"> <img src={hoaincrease} alt="" /> +0.0%</span></p>
            </div>
          </div>
        </div>

        <div className="hoa-dashboard-charts-container">
          <div className="hoa-grid-2">
            {/* ONLINE LEARNERS'S STATUS (Reused context for Tutors) */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">TUTORS ACTIVITY STATUS</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">{statsData?.active_tutors || 0} <span className="hoa-stat-badge badge-green">+0.0%</span></h3><p className="hoa-stat-label">Active</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">{statsData?.offline_tutors || 0} <span className="hoa-stat-badge badge-red">-0.0%</span></h3><p className="hoa-stat-label">Offline</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">{statsData?.total_events || 0} <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Events Hosted</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Revenue Generated</span>
                <div className="hoa-revenue-dropdown" style={{position: 'relative'}} onClick={() => setOpenFlagDropdown(openFlagDropdown === 'rev1' ? null : 'rev1')}>
                  {formatAmount(`${statsData?.total_revenue || 0} RWF`)} <img src={currency.flag} className="currency-icon" alt="flag" style={{cursor: 'pointer'}} /> <img src={hoadowncaret} alt="drop" style={{cursor: 'pointer'}} />
                  {openFlagDropdown === 'rev1' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: 0, zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrency(option); setOpenFlagDropdown(null); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TUTOR'S CONTENT STATUS */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">CONTENT PUBLICATION</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">{statsData?.published_courses || 0} <span className="hoa-stat-badge badge-green">+0.0%</span></h3><p className="hoa-stat-label">Published</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">{statsData?.pending_courses || 0} <span className="hoa-stat-badge badge-red">-0.0%</span></h3><p className="hoa-stat-label">Pending</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">{statsData?.total_projects || 0} <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Projects</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Payouts</span>
                <div className="hoa-revenue-dropdown" style={{position: 'relative'}} onClick={() => setOpenFlagDropdown(openFlagDropdown === 'rev2' ? null : 'rev2')}>
                  {formatAmount(`${statsData?.total_payouts || 0} RWF`)} <img src={currency.flag} className="currency-icon" alt="flag" style={{cursor: 'pointer'}} /> <img src={hoadowncaret} alt="drop" style={{cursor: 'pointer'}} />
                  {openFlagDropdown === 'rev2' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: 0, zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrency(option); setOpenFlagDropdown(null); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* List Header */}
        <div className="hoa-approvals-header">
          <div>
            <h2>Tutors</h2>
            <p>Active Platform Instructors</p>
          </div>
          <div className="approvals-actions">
            <div className="search-box">
              <img src={hoasearch} alt="" />
              <input 
                type="text" 
                placeholder="Search Tutors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hoa-filter-dropdown-wrapper" ref={filterRef}>
              <button 
                type="button" 
                className={`hoa-btn-light-purple hoa-filter-trigger ${activeFilter !== 'All Tutors' ? 'active-filter' : ''}`} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ 
                  background: activeFilter !== 'All Tutors' ? '#450468' : '#F3E8FF',
                  color: activeFilter !== 'All Tutors' ? '#fff' : '#450468'
                }}
              >
                <img src={hoafilter} alt="" style={{ filter: activeFilter !== 'All Tutors' ? 'brightness(0) invert(1)' : 'none' }} /> Filters
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
              <img src={hoaadd} alt="Add" /> Add new Tutor
            </button>
          </div>
        </div>

        {/* Tutors List Layout */}
        <div className="hoa-list-container">
          <table className="hoa-list-table learners-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <button type="button" className="th-content minus-btn-container minus-select-button" onClick={toggleAllVisibleRows}>
                    <div className="minus-icon">-</div>
                  </button>
                </th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('name')}>Tutor Details ({processedData.length}) <span className={`sort-icon ${sortConfig.key === 'name' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('phone')}>Contact Info <span className={`sort-icon ${sortConfig.key === 'phone' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('role')}>Role <span className={`sort-icon ${sortConfig.key === 'role' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('uploads')}>Uploads <span className={`sort-icon ${sortConfig.key === 'uploads' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap', position: 'relative' }}>
                  <div className="th-content justify-center" onClick={() => handleSort('paid')}>
                    Amount Paid ({currency.label}) <img src={currency.flag} alt="flag" className="icon-12-mx4" onClick={(e) => { e.stopPropagation(); setOpenFlagDropdown('main-paid'); }} style={{ cursor: 'pointer' }} />
                    <span className={`sort-icon ${sortConfig.key === 'paid' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span>
                  </div>
                  {openFlagDropdown === 'main-paid' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: '50%', transform: 'translateX(50%)', zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={() => { setCurrency(option); setOpenFlagDropdown(null); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="status-col" ><div className="th-content" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((tutor) => (
                <tr key={tutor.id} className={selectedRows.includes(tutor.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" className="hoa-checkbox" checked={selectedRows.includes(tutor.id)} onChange={() => toggleRowSelection(tutor.id)} />
                  </td>
                  <td>
                    <div className="list-user-col">
                      <div className="user-meta">
                        <h5>{tutor.name}</h5>
                        <p className="location-with-flag">
                          <img src={tutor.flag} alt="flag" className="tiny-flag" /> {tutor.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-meta">
                      <h5 style={{ fontWeight: 600 }}>{tutor.phone}</h5>
                      <p className="font-11-gray">{tutor.email}</p>
                    </div>
                  </td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.role}</td>
                  <td className="fw-500 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.uploads}</td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{formatAmount(tutor.paid)}</td>
                  <td className="status-col">
                    <span className={`status-pill pill-${tutor.statusColor}`}>
                      <span className="dot"></span> {tutor.status}
                    </span>
                  </td>
                  <td className="action-col">
                    <a href="#view" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(tutor.id); }}>
                      <img src={hoaopenview} alt="Open" />
                    </a>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && !isLoading && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>No Tutors found.</td></tr>
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

        {/* --- Tutor Preview Modal --- */}
        <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

            <div className="modal-top-header">
              <button className="modal-back-btn" onClick={closeModal}>
                <img src={hoagoback} alt="" />
              </button>
              <h2>Tutors Preview</h2>
              <div className="modal-header-actions">
                <span className="hoa-update-status border-eef1f6">
                  <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 1 hr <span className="dot bg-green"></span>
                </span>
              </div>
            </div>

            <div className="modal-content-area">

              <div className="modal-profile-grid">
                {/* Profile Card */}
                <div className="modal-profile-card">
                  <div className="modal-profile-bg-wrapper">
                    <div className="modal-profile-bg" style={{ background: `url(${hoabrickspattern}) center / 100% 100% no-repeat`, opacity: 1 }}></div>
                  </div>

                  <div className="profile-top-row">
                    <img src={defaultAvatar} alt="Avatar" className="profile-lg-avatar" />
                    <button className="btn-view-details">View Details</button>
                  </div>

                  <div className="profile-info-grid">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="profile-label">Full name :</span>
                      <strong className="profile-value">{tutorsData.find(t => t.id === activeTutorId)?.name || 'Loading...'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="profile-label">Total Paid :</span>
                        <strong className="profile-value-flex" style={{ position: 'relative', zIndex: 9999 }}>{formatAmount(`${tutorsData.find(t => t.id === activeTutorId)?.paid || 0} USD`).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /> </span>
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="profile-bottom-row">
                    <div className="flex-center-gap8">
                      <span className="status-badge-blue">Active</span>
                      <span className="status-badge-purple"><img src={hoauserbadge} alt="" /> 6</span>
                      <span className="status-badge-yellow"><img src={hoayellowstar} alt="" /> 4.8</span>
                    </div>
                    <div className="profile-actions gap-2">
                      <button className="icon-btn icon-28"><img src={hoagrayadd} alt="" /></button>
                      <button className="icon-btn icon-28 tooltip-trigger">
                        <span className="action-tooltip">{tutorsData.find(t => t.id === activeTutorId)?.phone || 'N/A'}</span>
                        <img src={hoagrayphone} alt="" />
                      </button>
                      <button className="icon-btn icon-28 tooltip-trigger">
                        <span className="action-tooltip">{tutorsData.find(t => t.id === activeTutorId)?.email || 'N/A'}</span>
                        <img src={hoagraymail} alt="" />
                      </button>
                      <button className="icon-btn icon-28"><img src={hoaverticaldots} alt="" /></button>
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoausericon} alt="dept" className="opacity-50" /> Specialization</span>
                    <span className="profile-info-val">{tutorsData.find(t => t.id === activeTutorId)?.role || 'Tutor'}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoabriefcase} alt="role" className="opacity-50" /> Experience</span>
                    <span className="profile-info-val">3 Yrs</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoasyllabus} alt="syll" className="opacity-50" /> Syllabus</span>
                    <span className="profile-info-val">12</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoaonlinecourses} alt="courses" className="opacity-50" /> Online Courses</span>
                    <span className="profile-info-val">{tutorsData.find(t => t.id === activeTutorId)?.uploads || 0}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoaprojects} alt="proj" className="opacity-50" /> Projects</span>
                    <span className="profile-info-val">14</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoatotalstudents} alt="stud" className="opacity-50" /> Total Students</span>
                    <span className="profile-info-val">234</span>
                  </div>
                </div>
              </div>

              {/* Modal Stats Row */}
              <div className="modal-stats-row modal-stats-row-no-border">
                <div className="mod-stat mod-stat-br-pr">
                  <h3 className="flex-center-gap4">+ {formatAmount('2.8K USD').replace(' USD', '').replace(' RWF', '')} <span className="stat-currency">{currency.label}</span></h3>
                  <p>Downloads Income</p>
                </div>
                <div className="mod-stat mod-stat-br-px">
                  <h3 className="flex-center-gap4">+ {formatAmount('2.8K USD').replace(' USD', '').replace(' RWF', '')} <span className="stat-currency">{currency.label}</span></h3>
                  <p>Courses Income</p>
                </div>
                <div className="mod-stat mod-stat-br-px">
                  <h3 className="flex-center-gap4">{formatAmount('2340044 RWF').replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label}</span></h3>
                  <p>Upload Amount</p>
                </div>
                <div className="mod-stat mod-stat-pl">
                  <h3 className="font-15-mt6">23 - March - 2026 <span className="font-11-gray500">14:00:45</span></h3>
                  <p>Date Joined</p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Content</button>
                <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
                <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
              </div>

              {/* Tab Contents */}
              <div className="modal-tab-content">

                {/* --- LESSONS/CONTENT TAB --- */}
                {activeTab === 'lessons' && (
                  <div className="tab-lessons">
                    <div className="hoa-list-container modal-table-container">
                      <table className="hoa-list-table mod-table">
                        <thead>
                          <tr>
                            <th className="w-40">
                              <button type="button" className="th-content minus-btn-container minus-select-button" onClick={() => setModalSelectedRows([])}>
                                <div className="minus-icon m-auto">-</div>
                              </button>
                            </th>
                            <th><div className="th-content" onClick={() => handleModalSort('title')}>Course Details <span className={`sort-icon ${modalSortConfig.key === 'title' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('type')}>Type <span className={`sort-icon ${modalSortConfig.key === 'type' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('students')}>Tot. Students <span className={`sort-icon ${modalSortConfig.key === 'students' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('amount')}>Tot. Amount <span className={`sort-icon ${modalSortConfig.key === 'amount' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th className="status-col"><div className="th-content" onClick={() => handleModalSort('status')}>Status <span className={`sort-icon ${modalSortConfig.key === 'status' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedData(modalLessons, modalSortConfig).map((les) => (
                            <tr key={les.id} className={modalSelectedRows.includes(les.id) ? 'selected-row' : ''}>
                              <td><input type="checkbox" className="hoa-checkbox" checked={modalSelectedRows.includes(les.id)} onChange={() => toggleModalRowSelection(les.id)} /></td>
                              <td>
                                <div className="user-meta">
                                  <h5>{les.title}</h5>
                                  <p className="font-11-gray">{les.date}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-500">{les.type}</h5>
                                  <p className="font-11-gray">{les.duration}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-600">{les.students}</h5>
                                  <p className="font-11-gray">{les.views}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-600">{formatAmount(les.amount)}</h5>
                                </div>
                              </td>
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

                    <div className="docs-header" style={{ marginTop: '30px' }}>
                      <div>
                        <h3 className="mod-docs-title">Documents</h3>
                        <p className="mod-docs-subtitle">Files & Credentials</p>
                      </div>
                      <button className="hoa-btn-light-purple gap-8">
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
                  <div className="tab-projects">
                    <div className="projects-header">
                      <div>
                        <h3 className="mod-projects-title">Tutor Projects</h3>
                        <p className="mod-projects-subtitle"><strong>6</strong> Projects in total</p>
                      </div>
                    </div>
                    <div className="projects-grid">
                      {modalProjects.map((proj, idx) => (
                        <div key={idx} className="project-card">
                          <div className="proj-img" style={{ backgroundImage: `url(${hoaproject})` }}></div>
                          <div className="proj-meta">
                            <span className="author">By <a href="#" onClick={preventDefault}>{proj.author}</a></span>
                            <div className="proj-stats">
                              <span className="stat-like" onClick={() => toggleProjectLike(idx)}>
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

                {/* --- ACTIVITY TAB --- */}
                {activeTab === 'activity' && (
                  <div className="tab-activity">
                    <h4 className="activity-title" style={{ marginTop: '10px' }}>
                      <img src={hoacalendar} alt="calendar" /> System Logs
                    </h4>

                    <div className="qa-section">
                      <div className={`ticket-card border-green ${!openTickets[1] ? 'collapsed' : ''}`}>
                        <div className="ticket-header" onClick={() => toggleTicket(1)} style={{ cursor: 'pointer' }}>
                          <div className="ticket-meta">
                            <strong>Log No : #LOG1204567</strong>
                            <span>Action: Syllabus Upload</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="ticket-status st-solved">Success</div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openTickets[1] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" /></svg>
                          </div>
                        </div>

                        {openTickets[1] && (
                          <div className="ticket-body">
                            <div className="ticket-content">
                              <p>Tutor successfully uploaded a new syllabus module pending approval.</p>
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

export default HOATutors;