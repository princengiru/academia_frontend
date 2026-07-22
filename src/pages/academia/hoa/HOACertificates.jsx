import React, { useState, useEffect, useMemo, useRef } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { HOALoadError, HOALoading, HOAEmptyState } from './HOAPageState';
import { openCertificatePreview } from '../certificateUtils';
import './hoa-certificates.css';

// Reusing standard project icons
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoarank from '../../../assets/icons/hoarank.png';
import hoadownloadall from '../../../assets/icons/hoadownloadall.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoacalendar2 from '../../../assets/icons/hoacalendar2.svg';

// Custom inline SVGs for the Certificates page
const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconCalendar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const IconDownload = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const IconFilterLines = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
        <line x1="10" y1="18" x2="14" y2="18"></line>
    </svg>
);

const DATE_FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];

const formatCertDate = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const isWithinDateFilter = (date, filter) => {
    if (filter === 'All Time') return true;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'Today') {
        return date >= startOfToday;
    }

    if (filter === 'This Week') {
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        return date >= startOfWeek;
    }

    if (filter === 'This Month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    return true;
};

const HOACertificates = () => {
    // Top-level state
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState('All Time');

    // Real database certificates state
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryKey, setRetryKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const toastTimerRef = useRef(null);
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, type === 'error' ? 8000 : 5000);
    };

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchCertificates = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/certificates`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.message || "Failed to load certificates");
            }
            const list = body.data || body || [];
            setCertificates(list);
        } catch (err) {
            setError(err.message);
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const [approvingId, setApprovingId] = useState(null);

    const handleDownloadCertificate = (cert) => {
        const number = cert?.certificate_number || cert?.certificateNumber;
        if (!number) {
            showToast('Download is not available until this certificate has a certificate number.', 'error');
            return;
        }
        openCertificatePreview(number, { newTab: true });
    };

    const handleApprove = async (certId) => {
        const token = localStorage.getItem('token');
        if (!token || approvingId) return;

        setApprovingId(certId);
        const previous = certificates;
        setCertificates((prev) =>
            prev.map((c) => (c.id === certId ? { ...c, is_verified: 1 } : c))
        );

        try {
            const res = await fetch(`${API_BASE_URL}/api/certificates/${certId}/verify`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.message || "Failed to verify certificate");
            }
            showToast("Certificate approved and verified successfully!", "success");
            fetchCertificates();
        } catch (err) {
            setCertificates(previous);
            showToast(err.message, "error");
        } finally {
            setApprovingId(null);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [retryKey]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedDateFilter]);

    const categories = useMemo(() => {
        const uniq = new Set(certificates.map(c => c.course_name || c.course_title).filter(Boolean));
        return ['All Categories', ...Array.from(uniq)];
    }, [certificates]);

    const filteredCertificates = useMemo(() => {
        return certificates.filter((cert) => {
            const name = cert.student_name || cert.name || '';
            const title = cert.course_name || cert.course_title || '';
            const num = cert.certificate_number || '';
            
            const matchesSearch = !searchQuery || 
                String(name).toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(title).toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(num).toLowerCase().includes(searchQuery.toLowerCase());
                
            const completedAt = cert.issue_date ? new Date(cert.issue_date) : new Date();
            const matchesDate = isWithinDateFilter(completedAt, selectedDateFilter);
            
            const matchesCategory = selectedCategory === 'All Categories' || title === selectedCategory;
            
            return matchesSearch && matchesDate && matchesCategory;
        });
    }, [certificates, searchQuery, selectedDateFilter, selectedCategory]);

    const paginatedCertificates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCertificates, currentPage, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / itemsPerPage));

    return (
        <HOALayout currentPage="certificates">
            <div className="hoace-certificates-page">
                
                {/* Page Header */}
                <div className="hoace-page-header">
                    <h1>Certificates</h1>
                    <div className="hoace-header-actions">
                        <span className="hoace-update-status" style={{ cursor: 'pointer' }} onClick={fetchCertificates}>
                            <img src={hoarefresh} alt="Refresh" className="hoace-sync-icon" />
                            Refresh data
                            <span className="hoace-dot"></span>
                        </span>
                        <button className="hoace-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
            <div className="hoace-stats-top-container">
                <div className="hoace-stats-container">
                    <div className="hoace-stat-block">
                        <h3>{certificates.length}</h3>
                        <p>Total Certificates</p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>{certificates.filter(c => c.is_verified === 1).length}</h3>
                        <p>Approved Certificates</p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>{certificates.filter(c => c.is_verified !== 1).length}</h3>
                        <p>Pending Approval</p>
                    </div>
                </div>
            </div>

                {/* Sub Header & Actions */}
                <div className="hoace-sub-header">
                    <div className="hoace-sub-title">
                        <h2>Manage Claims</h2>
                        <p>{filteredCertificates.length} {filteredCertificates.length === 1 ? 'Certificate' : 'Certificates'}</p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="hoace-filters-row">
                    <div className="hoace-filter-container">
                        <div className="hoace-category-trigger" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={hoafilter2} style={{ width: 16, opacity: 0.5 }} alt="" /> {selectedCategory}
                            </span>
                            <IconDownCaret width={14} height={8} style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isCategoryOpen && (
                            <div className="hoace-dropdown-menu">
                                {categories.map(opt => (
                                    <button
                                        key={opt}
                                        className="hoace-dropdown-item"
                                        onClick={() => {
                                            setSelectedCategory(opt);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hoace-search-bar-wrapper">
                        <div className="hoace-search-input">
                            <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                            <input 
                                type="text" 
                                placeholder="Search any Certificates..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="hoace-v-divider" />
                        <div className="hoace-filter-container hoace-date-filter-container">
                            <div
                                className="hoace-date-filter"
                                onClick={() => setIsDateOpen(!isDateOpen)}
                                role="button"
                                tabIndex={0}
                                aria-haspopup="listbox"
                                aria-expanded={isDateOpen}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setIsDateOpen(!isDateOpen);
                                    }
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <img src={hoacalendar2} alt="calendar" /> {selectedDateFilter}
                                </span>
                                <IconDownCaret
                                    width={12}
                                    height={8}
                                    style={{
                                        color: '#6B7280',
                                        transform: isDateOpen ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </div>
                            {isDateOpen && (
                                <div className="hoace-dropdown-menu hoace-date-dropdown-menu">
                                    {DATE_FILTER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            className={`hoace-dropdown-item${selectedDateFilter === opt ? ' active' : ''}`}
                                            onClick={() => {
                                                setSelectedDateFilter(opt);
                                                setIsDateOpen(false);
                                            }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Certificates Grid */}
                <div className="hoace-grid">
                    {loading && certificates.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <HOALoading message="Loading certificate requests…" />
                        </div>
                    ) : error && certificates.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <HOALoadError
                                title="Could not load certificates"
                                message={error}
                                onRetry={() => setRetryKey((key) => key + 1)}
                            />
                        </div>
                    ) : paginatedCertificates.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <HOAEmptyState
                                title="No certificate requests found"
                                message={searchQuery || selectedCategory !== 'All Categories' || selectedDateFilter !== 'All Time'
                                    ? 'Try adjusting your search or filters.'
                                    : 'Certificate claims will appear here once learners complete courses.'}
                            />
                        </div>
                    ) : paginatedCertificates.map(cert => {
                        const scoreStr = cert.final_score !== undefined && cert.final_score !== null
                            ? `${parseFloat(cert.final_score).toFixed(1)}%`
                            : '—';
                        const dateStr = cert.issue_date ? formatCertDate(new Date(cert.issue_date)) : 'N/A';
                        
                        const isApproved = cert.is_verified === 1;
                        const hours = cert.total_hours || 10;

                        return (
                            <div key={cert.id} className={`hoace-card${isApproved ? ' is-approved' : ' is-pending'}`}>
                                <div className="hoace-card-top">
                                    <div className="hoace-card-seal" aria-hidden="true">
                                        <img src={hoarank} alt="" className="hoace-ribbon-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                        <span className="hoace-ribbon-number">{scoreStr}</span>
                                    </div>
                                    <div className="hoace-card-top-copy">
                                        <span className="hoace-card-kicker">{isApproved ? 'Approved certificate' : 'Pending claim'}</span>
                                        <h3 className="hoace-course-title">{cert.course_name || cert.course_title}</h3>
                                        <p className="hoace-card-learner">{cert.student_name || 'Learner'}</p>
                                    </div>
                                </div>

                                <div className="hoace-card-body">
                                    <div className="hoace-card-meta">
                                        <span><strong>{hours}</strong>h study</span>
                                        <span>Claimed {dateStr}</span>
                                        <span className={`hoace-status-pill${isApproved ? ' is-approved' : ' is-pending'}`}>
                                            {isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>

                                    <div className="hoace-card-actions">
                                        {isApproved ? (
                                            <button
                                                type="button"
                                                className="hoace-download-btn"
                                                onClick={() => handleDownloadCertificate(cert)}
                                            >
                                                <img src={hoadownloadall} alt="" /> Download
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="hoace-approve-btn"
                                                onClick={() => handleApprove(cert.id)}
                                                disabled={approvingId === cert.id}
                                            >
                                                {approvingId === cert.id ? 'Approving…' : 'Approve Claim'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="hoace-pagination-container">
                    <button 
                        className="hoace-page-nav" 
                        style={{ color: currentPage === 1 ? '#D8D8E5' : '#450468', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button 
                            key={i + 1} 
                            className={`hoace-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button 
                        className="hoace-page-nav" 
                        style={{ color: currentPage === totalPages ? '#D8D8E5' : '#450468', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

            </div>
            {/* Floating Toast Notification */}
            {toast.show && (
                <div className={`hoace-toast-container toast-${toast.type}`} style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 9999,
                }}>
                    <span className="toast-icon" style={{ fontWeight: 'bold' }}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </span>
                    <span className="toast-message" style={{ fontSize: '13px', fontWeight: 500 }}>{toast.message}</span>
                </div>
            )}
        </HOALayout>
    );
};

export default HOACertificates;