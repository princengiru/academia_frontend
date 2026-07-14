import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import { HOAToast, useHOAToast } from './useHOAToast';
import './hoa-dashboard-home.css';

import hoadollar from '../../../assets/icons/hoadollar.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoasquaregrid from '../../../assets/icons/hoasquaregrid.svg';
import hoalistgrid from '../../../assets/icons/hoalistgrid.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoadocfile from '../../../assets/icons/hoadocfile.svg';
import hoaopenfile from '../../../assets/icons/hoaopenfile.svg';
import hoaviewall from '../../../assets/icons/hoaviewall.svg';
import hoacancel from '../../../assets/icons/hoacancel.svg';
import hoaapprove from '../../../assets/icons/hoaapprove.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoagrowth1 from '../../../assets/icons/hoagrowth1.svg';
import hoagrowth2 from '../../../assets/icons/hoagrowth2.svg';
import hoaprojects from '../../../assets/icons/hoaprojects.svg';
import hoacertificates from '../../../assets/icons/hoacertificates.svg';
import hoasparklinegreen from '../../../assets/icons/hoasparklinegreen.svg';
import hoasparklinered from '../../../assets/icons/hoasparklinered.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import defaultAvatar from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getApprovalReviewPath = (req) => {
  if (!req?.id) return '/academia/hoa';
  const id = encodeURIComponent(req.id);
  if (req.type === 'syllabus') return `/academia/hoa/syllabus?mode=pending&id=${id}`;
  if (req.type === 'course') return `/academia/hoa/online-courses?mode=pending&id=${id}`;
  if (req.type === 'project') return `/academia/hoa/projects?mode=pending&id=${id}`;
  return '/academia/hoa';
};

const HOADashboardHome = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { toast, showToast, hideToast } = useHOAToast();

  // --- UI State ---
  const [viewMode, setViewMode] = useState('list');
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All requests');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('5');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeRef = useRef(null);

  // --- Dropdown States & Refs ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [openActionRowId, setOpenActionRowId] = useState(null);
  const actionMenuRef = useRef(null);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const flagRef = useRef(null);

  // --- Data State ---
  const [dashboardStats, setDashboardStats] = useState({});
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) setIsPageSizeOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) setOpenActionRowId(null);
      if (flagRef.current && !flagRef.current.contains(event.target)) setOpenFlagDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Auto-Reset Pagination on Filter/Search Change ---
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]); // Clear selections when view changes
  }, [searchQuery, activeFilter, pageSize, sortConfig]);

  // --- Data Fetching ---
  const fetchDashboardData = async (mounted = true) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [statsRes, syllabusesRes, coursesRes, projectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/metrics`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/syllabuses/admin/pending-approval`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/courses/admin/pending-approval`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/projects/admin/pending`, { headers }).catch(() => null) // Added Projects
      ]);

      if (!mounted) return;

      if (statsRes?.ok) {
        const statsBody = await statsRes.json();
        setDashboardStats(statsBody?.data || statsBody || {});
      } else {
        setDashboardStats({});
      }

      let pendingList = [];

      // Combine Syllabuses
      if (syllabusesRes?.ok) {
        const sylBody = await syllabusesRes.json();
        
        // ADDED: Check for sylBody.data.data
        const sylArray = Array.isArray(sylBody?.data?.syllabuses) ? sylBody.data.syllabuses 
                       : Array.isArray(sylBody?.data?.data) ? sylBody.data.data 
                       : Array.isArray(sylBody?.data) ? sylBody.data 
                       : (Array.isArray(sylBody) ? sylBody : []);
                       
        const formattedSyls = sylArray.map(item => ({
          id: item.id || item._id,
          type: 'syllabus',
          name: item.instructor_name || item.author_name || 'Instructor',
          location: item.instructor_location || '—',
          status: 'Pending',
          statusColor: 'gray',
          date: new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          rawDate: item.created_at || Date.now(),
          role: 'Syllabus',
          fileCount: item.outlines_count || 0,
          fileIcon: hoapdffile,
          title: item.title || item.category_name || 'Untitled Syllabus'
        }));
        pendingList = [...pendingList, ...formattedSyls];
      }

      // Combine Courses
      if (coursesRes?.ok) {
        const crsBody = await coursesRes.json();
        
        // ADDED: Check for crsBody.data.data
        const crsArray = Array.isArray(crsBody?.data?.courses) ? crsBody.data.courses 
                       : Array.isArray(crsBody?.data?.data) ? crsBody.data.data 
                       : Array.isArray(crsBody?.data) ? crsBody.data 
                       : (Array.isArray(crsBody) ? crsBody : []);
                       
        const formattedCrs = crsArray.map(item => ({
          id: item.id || item._id,
          type: 'course',
          name: item.instructor_name || item.author_name || 'Instructor',
          location: item.instructor_location || '—',
          status: 'Pending',
          statusColor: 'gray',
          date: new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          rawDate: item.created_at || Date.now(),
          role: 'Course',
          fileCount: item.chapters_count || 0,
          fileIcon: hoadocfile,
          title: item.title || item.name || 'Untitled Course'
        }));
        pendingList = [...pendingList, ...formattedCrs];
      }


      // Combine Projects
      if (projectsRes?.ok) {
        const projBody = await projectsRes.json();
        const projArray = Array.isArray(projBody?.data?.projects) ? projBody.data.projects : Array.isArray(projBody?.data) ? projBody.data : (Array.isArray(projBody) ? projBody : []);
        const formattedProj = projArray.map(item => ({
          id: item.id || item._id,
          type: 'project',
          name: item.user?.name || item.student_name || 'Student',
          location: item.user?.location || '—',
          status: 'Pending',
          statusColor: 'gray',
          date: new Date(item.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          rawDate: item.created_at || Date.now(),
          role: 'Project',
          fileCount: item.files?.length || item.images?.length || 1,
          fileIcon: hoadocfile,
          title: item.title || 'Untitled Project'
        }));
        pendingList = [...pendingList, ...formattedProj];
      }

      setApprovalRequests(pendingList);

    } catch (error) {
      console.error("Dashboard data fetch failed", error);
      setErrorMsg("Failed to connect to the server. Displaying empty dashboard.");
      setDashboardStats({});
      setApprovalRequests([]);
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchDashboardData(mounted);
    return () => { mounted = false; };
  }, []);

  // --- API Actions ---
  const handleApprovalAction = async (item, action) => {
    setActionLoadingId(item.id);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      
      let endpointBase = '';
      if (item.type === 'syllabus') endpointBase = `/api/syllabuses/${item.id}/admin`;
      else if (item.type === 'course') endpointBase = `/api/courses/${item.id}/admin`;
      else if (item.type === 'project') endpointBase = `/api/projects/${item.id}`; // Notice projects don't use /admin at the end

      const response = await fetch(`${API_BASE_URL}${endpointBase}/${action}`, { method: 'POST', headers });
      
      if (!response.ok) throw new Error(`Failed to ${action} item.`);
      
      // Remove approved/rejected item from local state
      setApprovalRequests(prev => prev.filter(req => req.id !== item.id));
      showToast(`${item.title || 'Item'} ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
    } catch (error) {
      showToast(error.message || `Failed to ${action} item.`, 'error');
    } finally {
      setActionLoadingId(null);
      setOpenActionRowId(null);
    }
  };

  // --- Master Filtering, Sorting, and Pagination ---
  const processedData = useMemo(() => {
    let filtered = approvalRequests;

    // 1. Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name || '').toLowerCase().includes(q) || 
        (item.title || '').toLowerCase().includes(q) ||
        (item.role || '').toLowerCase().includes(q)
      );
    }

    // 2. Dropdown Filter
    if (activeFilter !== 'All requests') {
      if (activeFilter === 'Syllabuses') filtered = filtered.filter(item => item.type === 'syllabus');
      if (activeFilter === 'Courses') filtered = filtered.filter(item => item.type === 'course');
    }

    // 3. Sorting
    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'date') {
        aVal = new Date(a.rawDate || a.date).getTime();
        bVal = new Date(b.rawDate || b.date).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [approvalRequests, sortConfig, searchQuery, activeFilter]);

  // 4. Pagination
  const totalItems = processedData.length;
  const limit = parseInt(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, currentPage, limit]);

  // --- Handlers for Interactivity ---
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleRowSelection = (rowId) => {
    setSelectedRows((current) => 
      current.includes(rowId) ? current.filter((id) => id !== rowId) : [...current, rowId]
    );
  };

  const toggleAllVisibleRows = () => {
    if (selectedRows.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(paginatedData.map(req => req.id)); // Select all
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate Page Numbers for Pagination UI
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

  // --- Render Helpers ---
  const renderFlagDropdown = (key) => (
    <div className="flag-dropdown-wrapper" ref={openFlagDropdown === key ? flagRef : null}>
      <button
        type="button"
        className="flag-dropdown-trigger"
        onClick={() => setOpenFlagDropdown(openFlagDropdown === key ? null : key)}
      >
        <img src={currency.flag} alt={currency.label} className="flag-icon" />
        <span>{currency.label}</span>
        <img src={hoadowncaret} alt="Toggle" className="flag-dropdown-caret" />
      </button>

      {openFlagDropdown === key && (
        <div className="flag-dropdown-menu" role="listbox">
          {flagOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`}
              onClick={() => { setCurrency(option); setOpenFlagDropdown(null); }}
            >
              <img src={option.flag} alt={option.label} className="flag-icon" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <HOALayout currentPage="index">
      <div className="hoa-dashboard-home-page">
      
        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Dashboard</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchDashboardData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Refresh" className={`sync-icon ${isLoading ? 'spinning' : ''}`} /> 
              {isLoading ? 'Updating...' : 'Data updated every 5min'} 
              <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px', background: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <div className="hoa-dashboard-stats-container">
          {/* Top Main Stats (4 Cards) */}
          <div className="hoa-grid-4">
            <div className="hoa-card hoa-stat-main">
              <div className="stat-top">
                <span><img src={hoagrowth1} alt="Growth" /> Growth</span>
              </div>
              <div className="stat-body">
                <div>
                  <h3>{isLoading ? '...' : dashboardStats?.students || '0'}</h3>
                  <p>Students In Total</p>
                </div>
                <img src={hoasparklinegreen} alt="Trend" className="sparkline" />
              </div>
            </div>
            <div className="hoa-card hoa-stat-main">
              <div className="stat-top">
                <span><img src={hoagrowth2} alt="Growth" /> Growth</span>
              </div>
              <div className="stat-body">
                <div>
                  <h3>{isLoading ? '...' : dashboardStats?.tutors || '0'}</h3>
                  <p>Tutors In Total</p>
                </div>
                <img src={hoasparklinegreen} alt="Trend" className="sparkline" />
              </div>
            </div>
            <div className="hoa-card hoa-stat-main">
              <div className="stat-top">
                <span><img src={hoaprojects} alt="Projects" /> Projects</span>
                <Link to="/academia/hoa/projects">Manage Projects</Link>
              </div>
              <div className="stat-body">
                <div>
                  <h3>{isLoading ? '...' : dashboardStats?.uploads || '0'}</h3>
                  <p>Total Uploads</p>
                </div>
                <img src={hoasparklinered} alt="Trend" className="sparkline" />
              </div>
            </div>
            <div className="hoa-card hoa-stat-main">
              <div className="stat-top">
                <span><img src={hoacertificates} alt="Certificates" /> Certificates</span>
                <Link to="/academia/hoa/certificates">Manage Certificates</Link>
              </div>
              <div className="stat-body">
                <div>
                  <h3>{isLoading ? '...' : dashboardStats?.certificates || '0'}</h3>
                  <p>Total Issued</p>
                </div>
                <img src={hoasparklinegreen} alt="Trend" className="sparkline" />
              </div>
            </div>
          </div>

          {/* Secondary Stats Row (6 items) */}
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.totalSyllabus || '0'}</h4>
              <p>Total Syllabus</p>
            </div>
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.totalCourses || '0'}</h4>
              <p>Total Online Courses</p>
            </div>
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.totalAssignments || '0'}</h4>
              <p>Total Assignments</p>
            </div>
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.avgScore || '0'}</h4>
              <p>Average Score</p>
            </div>
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.totalEvents || '0'}</h4>
              <p>Total Events</p>
            </div>
            <div className="sub-stat">
              <h4>{isLoading ? '...' : dashboardStats?.avgRating || '0'}</h4>
              <p>Avg. Rating</p>
            </div>
          </div>
        </div>

        {/* Gross Revenue Section */}
        <div className="hoa-dashboard-revenue-container">
          <div className="hoa-revenue-section">
            <div className="section-header">
              <span className="section-title">GROSS REVENUE</span>
              <Link to="/academia/hoa/reports" className="manage-link">Manage funds <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></Link>
            </div>
            
            <div className="revenue-amount-box outline-box" style={{width: '300px', borderRadius: '8px'}}>
              <div className="icon-circle">
                <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" /> </span>
              </div>
              <div className="amount-details">
                <div className="amt-row">
                  <h3>+ {formatAmount(`${dashboardStats?.revenue || '0'} USD`).replace(' USD', '').replace(' RWF', '')} <span>{currency.label}</span></h3>
                  {renderFlagDropdown('revenue')}
                </div>
                <p>TOTAL REVENUE</p>
              </div>
            </div>

            <p className="hoa-dashboard-muted">Revenue breakdown by category is not available from the current API.</p>

            {/* Legend */}
            <div className="revenue-legend">
              <span><i className="dot color-syllabus"></i> Syllabus</span>
              <span><i className="dot color-online"></i> Online Courses</span>
              <span><i className="dot color-tutors"></i> Tutors upload payments</span>
              <span><i className="dot color-certs"></i> Certificates</span>
              <span><i className="dot color-tax"></i> Tax</span>
            </div>
          </div>
        </div>

        {/* Split Stats: Learners vs Tutors */}
        <div className="hoa-grid-2" style={{marginBottom: '40px'}}>
          <div className="hoa-card hoa-split-stat">
            <div className="section-header">
              <span className="section-title">LEARNER'S STATS</span>
              <Link to="/academia/hoa/learners" className="manage-link">See Details <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></Link>
            </div>
            <div className="revenue-amount-box outline-box">
              <div className="icon-circle">
                <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" /> </span>
              </div>
              <div className="amount-details">
                <div className="amt-row">
                  <h3>{dashboardStats?.revenue != null && dashboardStats?.revenue !== '' ? `+ ${formatAmount(`${dashboardStats.revenue} USD`).replace(' USD', '').replace(' RWF', '')}` : '—'} <span>{currency.label}</span></h3>
                  {renderFlagDropdown('learner')}
                </div>
                <p>TOTAL REVENUE <span className="hoa-dashboard-muted">Not tracked yet</span></p>
              </div>
            </div>
            <div className="split-footer-stats">
              <div><strong>{dashboardStats?.learnerProjectUploads ?? '—'}</strong> Project Uploads</div>
              <div><strong>{dashboardStats?.learnerAvgHours ?? '—'}</strong> Avg. Learning Hours</div>
            </div>
          </div>

          <div className="hoa-card hoa-split-stat">
            <div className="section-header">
              <span className="section-title">TUTOR'S STATS</span>
              <Link to="/academia/hoa/tutors" className="manage-link">See Details <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></Link>
            </div>
            <div className="revenue-amount-box outline-box">
              <div className="icon-circle">
                <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" /> </span>
              </div>
              <div className="amount-details">
                <div className="amt-row">
                  <h3>{dashboardStats?.tutorRevenue != null && dashboardStats?.tutorRevenue !== '' ? `+ ${formatAmount(`${dashboardStats.tutorRevenue} USD`).replace(' USD', '').replace(' RWF', '')}` : '—'} <span>USD</span></h3>
                  {renderFlagDropdown('tutor')}
                </div>
                <p>TOTAL REVENUE <span className="hoa-dashboard-muted">Not tracked yet</span></p>
              </div>
            </div>
            <div className="split-footer-stats">
              <div><strong>{dashboardStats?.tutorProjectUploads ?? '—'}</strong> Project Uploads</div>
              <div><strong>{dashboardStats?.tutorAvgUploads ?? '—'}</strong> Avg. Uploads</div>
            </div>
          </div>
        </div>

        {/* Approvals Section */}
        <div className="hoa-approvals-header">
          <div>
            <h2>Approvals Request</h2>
            <p>Tutors & Courses ({processedData.length} matches)</p>
          </div>
          <div className="approvals-actions">
            <div className="search-box">
              <img src={hoasearch} alt="Search" />
              <input 
                type="text" 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="view-toggles">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                <img src={hoasquaregrid} alt="Grid" />
              </button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                <img src={hoalistgrid} alt="List" />
              </button>
            </div>
            
            <div className="hoa-filter-dropdown-wrapper" ref={filterRef}>
              <button
                type="button"
                className={`hoa-btn-light-purple hoa-filter-trigger ${activeFilter !== 'All requests' ? 'active-filter' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ 
                  background: activeFilter !== 'All requests' ? '#450468' : '#F3E8FF',
                  color: activeFilter !== 'All requests' ? '#fff' : '#450468'
                }}
              >
                <img src={hoafilter} alt="Filter" style={{ filter: activeFilter !== 'All requests' ? 'brightness(0) invert(1)' : 'none' }} /> 
                {activeFilter === 'All requests' ? 'Filters' : activeFilter}
              </button>
              {isFilterOpen && (
                <div className="hoa-filter-dropdown" role="menu">
                  {['All requests', 'Syllabuses', 'Courses'].map((option) => (
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
          </div>
        </div>

        {/* Conditional Rendering of Grid vs List */}
        {viewMode === 'grid' ? (
          <div className="hoa-grid-3">
            {paginatedData.length === 0 && !isLoading && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                <h4 style={{ color: '#0F172A' }}>No pending approvals</h4>
                <p style={{ color: '#64748B' }}>Adjust your filters or take a break!</p>
              </div>
            )}
            
            {paginatedData.map((req) => (
              <div key={req.id} className="hoa-card hoa-approval-card">
                <div className="approval-user-row">
                  <img src={defaultAvatar} alt="Avatar" className="avatar" />
                  <div className="user-meta">
                    <h5>{req.name}</h5>
                    <p>{req.location}</p>
                  </div>
                  <span className={`status-pill pill-${req.statusColor}`}>
                    <span className="dot"></span> {req.status}
                  </span>
                </div>

                <div className="approval-date-row">
                  <span className="date"><strong>{req.date.split(' ')[0]}</strong> {req.date.substring(3)}</span>
                  <span className="role">~ {req.role}</span>
                </div>
                
                <div style={{ padding: '0 16px', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {req.title}
                </div>

                <div className="approval-file-box">
                  <div className="file-info-group">
                    <div className="file-icon-box">
                      <img src={req.fileIcon} alt="File" />
                    </div>
                    <div className="file-info">
                      <strong><label>{req.fileCount}</label> Files Attached</strong>
                      <button type="button" className="hoa-inline-link" onClick={() => navigate(getApprovalReviewPath(req))}>
                        View All <img src={hoaviewall} style={{width: '4px', height: '8px'}} alt="" />
                      </button>
                    </div>
                  </div>
                  <button type="button" className="open-btn" onClick={() => navigate(getApprovalReviewPath(req))} aria-label="Open review"><img src={hoaopenfile} alt="" /></button>
                </div>

                <div className="approval-action-row">
                  <button 
                    className="btn-cancel" 
                    onClick={() => handleApprovalAction(req, 'reject')}
                    disabled={actionLoadingId === req.id}
                  >
                    <span className="cross"><img src={hoacancel} alt="Cancel" /></span> 
                    {actionLoadingId === req.id ? '...' : 'Reject'}
                  </button>
                  <button 
                    className="btn-approve"
                    onClick={() => handleApprovalAction(req, 'approve')}
                    disabled={actionLoadingId === req.id}
                  >
                    <span className="check"><img src={hoaapprove} alt="Approve" /></span> 
                    {actionLoadingId === req.id ? '...' : 'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hoa-list-container">
            <table className="hoa-list-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" className="th-content minus-btn-container minus-select-button" onClick={toggleAllVisibleRows}>
                      <div className="minus-icon">-</div>
                    </button>
                  </th>
                  <th><div className="th-content" onClick={() => handleSort('name')}>Instructor / Title <span className={`sort-icon ${sortConfig.key === 'name' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                  <th><div className="th-content" onClick={() => handleSort('role')}>Type <span className={`sort-icon ${sortConfig.key === 'role' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                  <th><div className="th-content" onClick={() => handleSort('date')}>Date <span className={`sort-icon ${sortConfig.key === 'date' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                  <th><div className="th-content" onClick={() => handleSort('fileCount')}>Files <span className={`sort-icon ${sortConfig.key === 'fileCount' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                  <th><div className="th-content" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                  <th><div className="th-content">Action</div></th>
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
                          <p style={{ color: '#450468', fontWeight: 500, marginTop: '2px', fontSize: '0.85rem' }}>{req.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="fw-600">{req.role}</td>
                    <td className="fw-500">{req.date}</td>
                    <td>
                      <div className="list-file-col">
                        <img src={req.fileIcon} alt="File" className="list-file-icon" />
                        <div className="file-info">
                          <strong><label>{req.fileCount}</label> Files</strong>
                          <button type="button" className="hoa-inline-link" onClick={() => navigate(getApprovalReviewPath(req))}>
                            View All <img src={hoaviewall} style={{width: '5px', height: '8px'}} alt="" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill pill-${req.statusColor}`}>
                        <span className="dot"></span> {req.status}
                      </span>
                    </td>
                    <td>
                      <div className="list-actions-col">
                        <button className="btn-icon-cancel" onClick={() => handleApprovalAction(req, 'reject')} disabled={actionLoadingId === req.id}><img src={hoacancel} alt="X" /></button>
                        <button className="btn-icon-approve" onClick={() => handleApprovalAction(req, 'approve')} disabled={actionLoadingId === req.id}><img src={hoaapprove} alt="V" /></button>
                        <div className="action-menu-wrapper" ref={openActionRowId === req.id ? actionMenuRef : null}>
                          <button
                            type="button"
                            className="btn-icon-more"
                            onClick={() => setOpenActionRowId(openActionRowId === req.id ? null : req.id)}
                          >
                            ⋮
                          </button>
                          {openActionRowId === req.id && (
                            <div className="action-dropdown" role="menu">
                              <button type="button" className="action-dropdown-item" onClick={() => window.open(`/academia/syllabus-part?courseId=${req.id}`, '_blank')}>View Details</button>
                              <button type="button" className="action-dropdown-item" style={{color: '#10B981'}} onClick={() => handleApprovalAction(req, 'approve')}>Approve</button>
                              <button type="button" className="action-dropdown-item" style={{color: '#EF4444'}} onClick={() => handleApprovalAction(req, 'reject')}>Reject</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr><td colSpan="7" style={{textAlign: 'center', padding: '24px', color: '#64748B'}}>No pending approvals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className={`hoa-pagination-container ${viewMode === 'list' ? 'list-pagination' : ''}`}>
          {viewMode === 'list' && (
            <div className="pagination-left">
               Show 
               <div className="page-size-dropdown" ref={pageSizeRef}>
                 <button
                   type="button"
                   className="page-size-button"
                   onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                 >
                   {pageSize}
                   <img src={hoadowncaret} alt="" />
                 </button>
                 {isPageSizeOpen && (
                   <div className="page-size-menu" role="listbox">
                     {['5', '10', '25'].map((option) => (
                       <button key={option} type="button" className="page-size-option" onClick={() => { setPageSize(option); setIsPageSizeOpen(false); }}>
                         {option}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
               per page
            </div>
          )}
          
          <div className="hoa-pagination">
            {viewMode === 'list' && (
              <span className="page-range">
                {totalItems === 0 ? '0' : `${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalItems)}`} of {totalItems}
              </span>
            )}
            
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

        <HOAToast toast={toast} onDismiss={hideToast} />
      </div>
    </HOALayout>
  );
};

export default HOADashboardHome;