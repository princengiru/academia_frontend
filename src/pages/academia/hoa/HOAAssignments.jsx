import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { HOALoadError, HOALoading, HOATableEmptyRow } from './HOAPageState';
import { HOAToast, useHOAToast } from './useHOAToast';
import './hoa-assignments.css';
import './hoa-reports.css';

// --- Icons ---
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoasummative from '../../../assets/icons/hoasummative.svg';
import hoaformative from '../../../assets/icons/hoaformative.svg';
import hoapassedstudents from '../../../assets/icons/hoapassedstudents.svg';
import hoafailedstudents from '../../../assets/icons/hoafailedstudents.svg';
import hoaretakes from '../../../assets/icons/hoaretakes.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOAAssignments = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useHOAToast();

  // --- Data State ---
  const [statsData, setStatsData] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // --- UI/Filter State ---
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Status');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  // --- Dropdowns & Pagination ---
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const pageSizeRef = useRef(null); 
  
  const pageSizeOptions = ['5', '10', '25'];
  const filterOptions = ['All Status', 'Uploaded', 'In Review', 'Not Published', 'Completed'];

  // --- Click Outside Handler ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.rep-action-dropdown-menu') && !event.target.closest('.rep-action-btn')) {
        setActiveActionMenu(null);
      }
      if (!event.target.closest('.learners-performance-period-menu') && !event.target.closest('.rep-btn-filters')) {
        setIsFilterOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) {
        setIsPageSizeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Data Fetching ---
  const fetchAssignmentsData = async (mounted = true) => {
    setIsLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/signin');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, assignmentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/assessments/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/assessments/recent-assignments`, { headers }).catch(() => null)
      ]);

      if (!mounted) return;

      if (statsRes?.status === 401 || assignmentsRes?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/signin');
        return;
      }

      // 1. Map Stats
      if (statsRes?.ok) {
        const sBody = await statsRes.json();
        const rawStats = sBody?.data || sBody || {};
        
        const extractVal = (val) => {
           if (val === null || val === undefined) return '0';
           if (typeof val === 'object') return val.count || val.value || '0';
           return val;
        };

        setStatsData({
          total_summative: extractVal(rawStats.total_summative),
          total_formative: extractVal(rawStats.total_formative),
          passed_students: extractVal(rawStats.passed_students),
          total_retakes: extractVal(rawStats.total_retakes),
          failed_students: extractVal(rawStats.failed_students)
        });
      } else {
        setStatsData({});
      }

      // 2. Map Table Data
      if (assignmentsRes?.ok) {
        const aBody = await assignmentsRes.json();
        const list = Array.isArray(aBody?.data) ? aBody.data : (Array.isArray(aBody) ? aBody : []);
        
        setAssignmentsData(list.map(item => ({
          id: item.id || item._id,
          title: item.title || 'Untitled Assessment',
          timeAgo: item.created_at ? new Date(item.created_at).toLocaleDateString() : '—',
          rawDate: item.created_at || Date.now(),
          type: item.type || 'Assessment',
          attempts: item.total_attempts || '0',
          avgScore: item.average_score ? parseFloat(item.average_score).toFixed(2) : '0.00',
          timeLimit: item.duration || '—',
          certificates: item.certificates_issued || '0',
          status: item.status || 'In Review',
          statusColor: (item.status || '').toLowerCase().includes('pub') || (item.status || '').toLowerCase().includes('com') ? 'completed' 
                     : (item.status || '').toLowerCase().includes('rev') ? 'progress' 
                     : 'failed'
        })));
      } else {
        const errorBody = await assignmentsRes?.json().catch(() => ({}));
        throw new Error(errorBody?.message || errorBody?.error?.message || 'Failed to load assignments.');
      }

    } catch (error) {
      console.error("Failed to fetch assignments", error);
      if (mounted) {
        setStatsData({});
        setAssignmentsData([]);
        setFetchError(error.message || 'Failed to load assignments.');
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchAssignmentsData(mounted);
    return () => { mounted = false; };
  }, [retryKey]);

  // --- Memoized Sorting & Filtering ---
  const processedData = useMemo(() => {
    let filtered = assignmentsData || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => (item.title || '').toLowerCase().includes(q));
    }

    if (selectedFilter !== 'All Status') {
      filtered = filtered.filter(item => item.status === selectedFilter);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (['attempts', 'avgScore', 'certificates'].includes(sortConfig.key)) {
        aVal = Number(String(aVal).replace(/[^0-9.-]+/g, '')) || 0;
        bVal = Number(String(bVal).replace(/[^0-9.-]+/g, '')) || 0;
      }
      if (sortConfig.key === 'title') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [assignmentsData, sortConfig, searchQuery, selectedFilter]);

  // --- Pagination Logic ---
  const totalItems = processedData.length;
  const limit = parseInt(pageSize) || 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [searchQuery, selectedFilter, pageSize]);

  // --- Handlers ---
  const toggleRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  const clearSelectedRows = () => {
    if (selectedRows.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(req => req.id));
    }
  };

  const handleSort = (key) => {
    setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAction = async (id, actionType) => {
    setActiveActionMenu(null);

    const unavailableMessages = {
      Approve: 'Assessment approval is not available until the admin assessments API is connected.',
      Disapprove: 'Assessment disapproval is not available until the admin assessments API is connected.',
      Edit: 'Editing assessments from HOA is not available yet.',
      Delete: 'Deleting assessments from HOA is not available yet.',
    };

    showToast(unavailableMessages[actionType] || 'This action is not available yet.', 'error');
  };

  return (
    <HOALayout currentPage="assignments">
      <div className="hoa-assignments-page hoa-reports-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Assignments</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchAssignmentsData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Refresh" className={`sync-icon ${isLoading ? 'spinning' : ''}`} />
              {isLoading ? 'Updating...' : 'Data updated every 5min'}
              <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/index', '_blank')}>
              Go to website <img src={hoagoto} alt="Go" />
            </button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="assn-stats-row">
          <div className="assn-stat-card">
            <div className="assn-stat-icon assn-icon-gray"><img src={hoasummative} alt="Summative" /></div>
            <div className="assn-stat-info">
              <h3>{statsData?.total_summative || '0'}</h3>
              <p>Summative Assessment</p>
            </div>
          </div>

          <div className="assn-stat-card">
            <div className="assn-stat-icon assn-icon-gray"><img src={hoaformative} alt="Formative" /></div>
            <div className="assn-stat-info">
              <h3>{statsData?.total_formative || '0'}</h3>
              <p>Formative Assessment</p>
            </div>
          </div>

          <div className="assn-stat-card">
            <div className="assn-stat-icon assn-icon-green"><img src={hoapassedstudents} alt="Passed" /></div>
            <div className="assn-stat-info">
              <h3>{statsData?.passed_students ? `+ ${statsData.passed_students}` : '0'}</h3>
              <p>Passed Students</p>
            </div>
          </div>

          <div className="assn-stat-card">
            <div className="assn-stat-icon assn-icon-orange"><img src={hoaretakes} alt="Retakes" /></div>
            <div className="assn-stat-info">
              <h3>{statsData?.total_retakes || '0'}</h3>
              <p>Retakes Taken</p>
            </div>
          </div>

          <div className="assn-stat-card">
            <div className="assn-stat-icon assn-icon-red"><img src={hoafailedstudents} alt="Failed" /></div>
            <div className="assn-stat-info">
              <h3>{statsData?.failed_students || '0'}</h3>
              <p>Failed Students</p>
            </div>
          </div>
        </div>

        {/* Table Area Header */}
        <div className="rep-table-header-area">
          <div className="rep-table-title">
            <h2>Assignments</h2>
            <p>{totalItems} Tests & Exams</p>
          </div>
          <div className="rep-table-actions">
            <div className="rep-search-box">
              <img src={hoasearch} alt="Search" className="search-icon" />
              <div className="search-divider"></div>
              <input 
                type="text" 
                placeholder="Search Assessments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="rep-filter-dropdown-container" style={{ position: 'relative' }}>
              <button 
                className={`rep-btn-filters ${selectedFilter !== 'All Status' ? 'active-filter' : ''}`} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={selectedFilter !== 'All Status' ? { background: '#450468', color: '#fff', border: '1px solid #450468' } : {}}
              >
                <img src={hoafilter} alt="Filter" style={{ width: 14, filter: selectedFilter !== 'All Status' ? 'brightness(0) invert(1)' : 'none' }} /> 
                {selectedFilter === 'All Status' ? 'Filters' : selectedFilter}
              </button>
              
              {isFilterOpen && (
                <div className="learners-performance-period-menu" style={{ position: 'absolute', background: '#FFF', top: '100%', right: 0, marginTop: '8px', zIndex: 10, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {filterOptions.map(option => (
                    <div 
                      key={option}
                      className={`dropdown-item ${selectedFilter === option ? 'active' : ''}`} 
                      onClick={() => { setSelectedFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading && assignmentsData.length === 0 ? (
          <HOALoading message="Loading assignments…" />
        ) : fetchError ? (
          <HOALoadError
            title="Could not load assignments"
            message={fetchError}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        ) : (
        <>
        <div className="rep-table-wrapper">
          <table className="rep-table">
            <thead>
              <tr>
                <th className="sticky-col-1" style={{ width: '40px', textAlign: 'center' }}>
                  <button type="button" className="minus-btn-container minus-select-button" onClick={clearSelectedRows}>
                    <div className="rep-minus-box">-</div>
                  </button>
                </th>
                <th className="sticky-col-2">
                  <div className="th-inner" onClick={() => handleSort('title')}>Assignment Details <span className={`sort-icon ${sortConfig.key === 'title' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('type')}>Type <span className={`sort-icon ${sortConfig.key === 'type' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('attempts')}>Students Attempts <span className={`sort-icon ${sortConfig.key === 'attempts' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('avgScore')}>Avg. Score <span className={`sort-icon ${sortConfig.key === 'avgScore' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('timeLimit')}>Time Attempt (Min) <span className={`sort-icon ${sortConfig.key === 'timeLimit' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('certificates')}>Certificates <span className={`sort-icon ${sortConfig.key === 'certificates' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                </th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected-row' : ''}>
                  <td className="sticky-col-1" style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="rep-checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="sticky-col-2">
                    <div className="rep-td-course">
                      <strong>{row.title}</strong>
                      <span>{row.timeAgo}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rep-td-reason" style={{ fontWeight: 600 }}>{row.type}</span>
                  </td>
                  <td>
                    <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.attempts}</span>
                  </td>
                  <td>
                    <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.avgScore}</span>
                  </td>
                  <td>
                    <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.timeLimit}</span>
                  </td>
                  <td>
                    <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.certificates}</span>
                  </td>
                  <td>
                    <span className={`rep-status rep-st-${row.statusColor}`}>
                      <span className="dot"></span> {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button className="rep-action-btn" onClick={() => setActiveActionMenu(activeActionMenu === row.id ? null : row.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                    {activeActionMenu === row.id && (
                      <div className="rep-action-dropdown-menu">
                        <div className="dropdown-item" onClick={() => handleAction(row.id, 'Approve')}>Approve</div>
                        <div className="dropdown-item" onClick={() => handleAction(row.id, 'Disapprove')}>Disapprove</div>
                        <div className="dropdown-item" onClick={() => handleAction(row.id, 'Edit')}>Edit</div>
                        <div className="dropdown-item" onClick={() => handleAction(row.id, 'Delete')} style={{ color: '#F8285A' }}>Delete</div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && !isLoading && (
                <HOATableEmptyRow
                  colSpan={9}
                  title="No assignments found"
                  message={searchQuery || selectedFilter !== 'All Status' ? 'Try adjusting your search or filters.' : 'Assessment assignments will appear here once they are created.'}
                />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown mx-8" ref={pageSizeRef}>
              <button
                type="button"
                className="page-size-button px-8-py-2"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              >
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map(opt => (
                    <button
                      key={opt}
                      className="page-size-option"
                      onClick={() => { setPageSize(opt); setIsPageSizeOpen(false); }}
                    >
                      {opt}
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
              <img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: currentPage === 1 ? 0.5 : 1 }} alt="Prev" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num} 
                className={`page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => goToPage(num)}
              >
                {num}
              </button>
            ))}

            <button className="page-nav" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
              <img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }} alt="Next" />
            </button>
          </div>
        </div>
        </>
        )}

      </div>
      <HOAToast toast={toast} onDismiss={hideToast} />
    </HOALayout>
  );
};

export default HOAAssignments;