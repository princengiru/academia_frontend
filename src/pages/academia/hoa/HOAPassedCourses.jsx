import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { HOALoadError, HOALoading, HOATableEmptyRow } from './HOAPageState';
import { HOAToast, useHOAToast } from './useHOAToast';
import './hoa-passed-courses.css';
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
import rwanda from '../../../assets/icons/rwanda.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadownload3 from '../../../assets/icons/hoadownload3.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOAPassedCourses = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useHOAToast();

    // --- Data State ---
    const [statsData, setStatsData] = useState(null);
    const [passedCoursesData, setPassedCoursesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [retryKey, setRetryKey] = useState(0);

    // --- UI/Filter State ---
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'studentName', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Status');
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    // --- Dropdowns & Pagination ---
    const [pageSize, setPageSize] = useState('10');
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const pageSizeRef = useRef(null);
    const filterRef = useRef(null);

    const pageSizeOptions = ['5', '10', '25'];
    const filterOptions = ['All Status', 'Formative', 'Summative'];

    // --- Click Outside Handler ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.rep-action-dropdown-menu') && !event.target.closest('.rep-action-btn')) {
                setActiveActionMenu(null);
            }
            if (filterRef.current && !filterRef.current.contains(event.target)) {
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
    const fetchPassedCoursesData = async (mounted = true) => {
        setIsLoading(true);
        setFetchError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/academia/auth/signin');
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
                navigate('/academia/auth/signin');
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

            // 2. Map Table Data (STRICTLY filtering for 'passed' or 'completed' records)
            if (assignmentsRes?.ok) {
                const aBody = await assignmentsRes.json();
                const list = Array.isArray(aBody?.data) ? aBody.data : (Array.isArray(aBody) ? aBody : []);
                
                const parsedList = list
                    .filter(item => {
                        const status = (item.status || '').toLowerCase();
                        const score = parseFloat(item.average_score || 0);
                        // Define "Passed" logic: Status is passed/completed OR score is >= 50
                        return status.includes('pass') || status.includes('complet') || score >= 50;
                    })
                    .map(item => ({
                        id: item.id || item._id,
                        studentName: item.student_name || 'Unknown Student',
                        location: item.location || '—',
                        flag: item.country_code === 'US' ? hoausflag : rwanda, // Fallback to rwanda if unknown
                        courseName: item.course_title || item.title || 'Untitled Assessment',
                        assessmentType: item.type || 'Assessment',
                        assessmentMeta: item.question_count ? `${item.question_count} Questions` : '—',
                        attempts: item.total_attempts || '0',
                        avgScore: item.average_score ? parseFloat(item.average_score).toFixed(2) : '0.00',
                        timeLimit: item.duration || '—',
                    }));
                
                setPassedCoursesData(parsedList);
            } else {
                const errorBody = await assignmentsRes?.json().catch(() => ({}));
                throw new Error(errorBody?.message || errorBody?.error?.message || 'Failed to load passed courses.');
            }

        } catch (error) {
            console.error("Failed to fetch passed courses", error);
            if (mounted) {
                setStatsData({});
                setPassedCoursesData([]);
                setFetchError(error.message || 'Failed to load passed courses.');
            }
        } finally {
            if (mounted) setIsLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        fetchPassedCoursesData(mounted);
        return () => { mounted = false; };
    }, [retryKey]);

    // --- Memoized Sorting & Filtering ---
    const processedData = useMemo(() => {
        let filtered = passedCoursesData || [];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                (item.studentName || '').toLowerCase().includes(q) || 
                (item.courseName || '').toLowerCase().includes(q)
            );
        }

        // Dropdown Filter (Formative vs Summative)
        if (selectedFilter !== 'All Status') {
            filtered = filtered.filter(item => (item.assessmentType || '').toLowerCase().includes(selectedFilter.toLowerCase()));
        }

        // Sort
        if (!sortConfig.key) return filtered;

        return [...filtered].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (['attempts', 'avgScore'].includes(sortConfig.key)) {
                aVal = Number(String(aVal).replace(/[^0-9.-]+/g, '')) || 0;
                bVal = Number(String(bVal).replace(/[^0-9.-]+/g, '')) || 0;
            }
            if (['studentName', 'courseName', 'assessmentType'].includes(sortConfig.key)) {
                aVal = (aVal || '').toLowerCase();
                bVal = (bVal || '').toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [passedCoursesData, sortConfig, searchQuery, selectedFilter]);

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
        setSelectedRows((prev) => prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]);
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

    const handleAction = (id, actionType) => {
        setActiveActionMenu(null);

        if (actionType === 'View Details') {
            showToast('Opening learners — use the learner profile for full course history.', 'success');
            navigate('/academia/hoa/learners');
            return;
        }

        const unavailableMessages = {
            'Contact Student': 'Contacting students from HOA is not available yet.',
            'Remove Record': 'Removing records from this list does not change backend data until the admin API is connected.',
        };

        showToast(unavailableMessages[actionType] || 'This action is not available yet.', 'error');
    };

    const handleDownloadCertificate = () => {
        showToast('Certificate download is not available from HOA yet. Learners can download from their account.', 'error');
    };

    return (
        <HOALayout currentPage="passed-courses">
            <div className="hoa-passed-courses-page hoa-assignments-page hoa-reports-page">

                {/* Page Header */}
                <div className="hoa-page-header">
                    <h1>Passed Courses</h1>
                    <div className="hoa-header-actions">
                        <span className="hoa-update-status" onClick={() => fetchPassedCoursesData(true)} style={{ cursor: 'pointer' }}>
                            <img src={hoarefresh} alt="Refresh" className={`sync-icon ${isLoading ? 'spinning' : ''}`} />
                            {isLoading ? 'Updating...' : 'Data updated every 5min'}
                            <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
                        </span>
                        <button className="hoa-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="assn-stats-row">
                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-gray">
                            <img src={hoasummative} alt="Summative" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>{statsData?.total_summative || '0'}</h3>
                            <p>Summative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-gray">
                            <img src={hoaformative} alt="Formative" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>{statsData?.total_formative || '0'}</h3>
                            <p>Formative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-green">
                            <img src={hoapassedstudents} alt="Passed" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>{statsData?.passed_students ? `+ ${statsData.passed_students}` : '0'}</h3>
                            <p>Passed Students</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-orange">
                            <img src={hoaretakes} alt="Retakes" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>{statsData?.total_retakes || '0'}</h3>
                            <p>Retakes Taken</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-red">
                            <img src={hoafailedstudents} alt="Failed" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>{statsData?.failed_students || '0'}</h3>
                            <p>Failed Students</p>
                        </div>
                    </div>
                </div>

                {/* Table Area Header */}
                <div className="rep-table-header-area">
                    <div className="rep-table-title">
                        <h2>Passed</h2>
                        <p>{totalItems} Courses</p>
                    </div>
                    <div className="rep-table-actions">
                        <div className="rep-search-box">
                            <img src={hoasearch} alt="Search" className="search-icon" />
                            <div className="search-divider"></div>
                            <input 
                                type="text" 
                                placeholder="Search Students or Courses..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="rep-filter-dropdown-container" style={{ position: 'relative' }} ref={filterRef}>
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
                                            style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }} 
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
                {isLoading && passedCoursesData.length === 0 ? (
                    <HOALoading message="Loading passed courses…" />
                ) : fetchError ? (
                    <HOALoadError
                        title="Could not load passed courses"
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
                                    <div className="th-inner" onClick={() => handleSort('studentName')}>Student Name <span className={`sort-icon ${sortConfig.key === 'studentName' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th>
                                    <div className="th-inner" onClick={() => handleSort('courseName')}>Course Name <span className={`sort-icon ${sortConfig.key === 'courseName' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th>
                                    <div className="th-inner" onClick={() => handleSort('assessmentType')}>Assessment Type <span className={`sort-icon ${sortConfig.key === 'assessmentType' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <div className="th-inner" style={{ justifyContent: 'center' }} onClick={() => handleSort('attempts')}>Attempts <span className={`sort-icon ${sortConfig.key === 'attempts' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <div className="th-inner" style={{ justifyContent: 'center' }} onClick={() => handleSort('avgScore')}>Avg. Score <span className={`sort-icon ${sortConfig.key === 'avgScore' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <div className="th-inner" style={{ justifyContent: 'center' }} onClick={() => handleSort('timeLimit')}>Time (Min) <span className={`sort-icon ${sortConfig.key === 'timeLimit' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th style={{ textAlign: 'center' }}>
                                    <div className="th-inner" style={{ justifyContent: 'center' }}>Certificates</div>
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
                                            <strong>{row.studentName}</strong>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><img src={row.flag} alt="flag" style={{ width: 14, borderRadius: '50%' }} /> {row.location}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="rep-td-course">
                                            <strong style={{ fontWeight: 500 }}>{row.courseName}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="rep-td-course">
                                            <strong>{row.assessmentType}</strong>
                                            <span>{row.assessmentMeta}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.attempts}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.avgScore}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{row.timeLimit}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="rep-btn-download" onClick={() => handleDownloadCertificate(row.id)}>
                                            <img src={hoadownload3} alt="Download" /> Download
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'center', position: 'relative' }}>
                                        <button className="rep-action-btn" onClick={() => setActiveActionMenu(activeActionMenu === row.id ? null : row.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                        </button>
                                        {activeActionMenu === row.id && (
                                            <div className="rep-action-dropdown-menu">
                                                <div className="dropdown-item" onClick={() => handleAction(row.id, 'View Details')}>View Details</div>
                                                <div className="dropdown-item" onClick={() => handleAction(row.id, 'Contact Student')}>Contact Student</div>
                                                <div className="dropdown-item" onClick={() => handleAction(row.id, 'Remove Record')} style={{ color: '#F8285A' }}>Remove Record</div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {paginatedData.length === 0 && !isLoading && (
                                <HOATableEmptyRow
                                    colSpan={9}
                                    title="No passed courses found"
                                    message={searchQuery || selectedFilter !== 'All Status' ? 'Try adjusting your search or filters.' : 'Students who pass assessments will appear here.'}
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

export default HOAPassedCourses;