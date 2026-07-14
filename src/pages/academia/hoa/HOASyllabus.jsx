import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-syllabus.css';

// Reusing general icons based on standard project structure
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hofilter from '../../../assets/icons/hoafilter.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoaviewpaper from '../../../assets/icons/hoaviewpaper.svg';

// Custom inline SVGs for specific icons
const IconUserBust = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const IconEye = ({ width = 14, height = 14, color = "currentColor" }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const IconDocument = ({ width = 14, height = 14, color = "currentColor", strokeWidth = 1.5 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const IconLeftCaret = ({ width = 8, height = 12, className = "", style = {}, strokeWidth = 2.5 }) => (
    <svg width={width} height={height} viewBox="0 0 8 12" fill="none" className={className} style={style}>
        <path d="M6.5 1L1.5 6L6.5 11" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconExternalLink = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);

const IconFilterSliders = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3"></circle>
        <line x1="11" y1="8" x2="21" y2="8"></line>
        <line x1="3" y1="8" x2="5" y2="8"></line>
        <circle cx="16" cy="16" r="3"></circle>
        <line x1="3" y1="16" x2="13" y2="16"></line>
        <line x1="19" y1="16" x2="21" y2="16"></line>
    </svg>
);

const IconDownloadCloud = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 17l4 4 4-4M12 12v9"></path><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"></path></svg>
);

const IconStar = ({ fill = "#FFC700" }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={fill} stroke={fill} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const stripHtml = (html) => {
    if (!html) return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    } catch (e) {
        return html.replace(/<[^>]*>/g, '');
    }
};

const HOASyllabus = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const deepLinkHandledRef = useRef(null);

    // Mode switcher: 'explorer', 'pending', 'rejected'
    const [mode, setMode] = useState(() => {
        const modeParam = new URLSearchParams(window.location.search).get('mode');
        return modeParam === 'pending' || modeParam === 'rejected' || modeParam === 'explorer'
            ? modeParam
            : (new URLSearchParams(window.location.search).get('id') ? 'pending' : 'explorer');
    });

    // Navigation view: 1 = Topics Grid, 2 = Outlines/Papers List, 3 = Outline Detail
    const [currentView, setCurrentView] = useState(1);
    const [isOutlineOpen, setIsOutlineOpen] = useState(false);

    // Sidebar state
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [selectedSubCat, setSelectedSubCat] = useState(null); // Subcategory ID
    const [fullyExpandedCats, setFullyExpandedCats] = useState([]);
    const [isCourseFilterOpen, setIsCourseFilterOpen] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');
    
    // Pagination state
    const [pageSize, setPageSize] = useState('10');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const pageSizeOptions = ['5', '10', '20'];
    const pageSizeRef = useRef(null);

    // Database states
    const [categoryTree, setCategoryTree] = useState([]);
    const [pendingSyllabuses, setPendingSyllabuses] = useState([]);
    const [rejectedSyllabuses, setRejectedSyllabuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Detailed Syllabus state for moderation
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const [syllabusOutlines, setSyllabusOutlines] = useState([]);
    const [loadingSyllabusDetails, setLoadingSyllabusDetails] = useState(false);

    // Selected items for navigation
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedOutline, setSelectedOutline] = useState(null);

    // Custom Rejection Modal state
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionSyllabusId, setRejectionSyllabusId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Custom Approve Modal state
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveSyllabusId, setApproveSyllabusId] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // --- Loading functions ---
    const fetchCategoryTree = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/categories/tree`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setCategoryTree(result.data);
                
                // Set initial expanded cat and active subcat
                const firstCat = result.data[0];
                if (firstCat) {
                    setExpandedCategories([firstCat.id]);
                    const firstSub = firstCat.subcategories?.[0];
                    if (firstSub) {
                        setSelectedSubCat(firstSub.id);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load categories tree:', err);
            showToast('Failed to load categories taxonomy', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingSyllabuses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/syllabuses/admin/pending-approval`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success) {
                const list = Array.isArray(result.data?.syllabuses)
                    ? result.data.syllabuses
                    : Array.isArray(result.data?.data)
                        ? result.data.data
                        : Array.isArray(result.data)
                            ? result.data
                            : [];
                setPendingSyllabuses(list);
            }
        } catch (err) {
            console.error('Failed to fetch pending syllabuses:', err);
            showToast('Failed to fetch pending approvals', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchRejectedSyllabuses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/syllabuses/admin/rejected?limit=100`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success && result.data) {
                setRejectedSyllabuses(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch rejected syllabuses:', err);
            showToast('Failed to fetch rejected list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadSyllabusDetails = async (syllabus) => {
        setSelectedSyllabus(syllabus);
        setLoadingSyllabusDetails(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabus.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success && result.data && Array.isArray(result.data.outlines)) {
                setSyllabusOutlines(result.data.outlines);
            }
        } catch (err) {
            console.error('Failed to load syllabus details:', err);
            showToast('Failed to load syllabus outlines', 'error');
        } finally {
            setLoadingSyllabusDetails(false);
        }
    };

    // --- Action Handlers ---
    const handleApproveSyllabus = (syllabusId) => {
        setApproveSyllabusId(syllabusId);
        setApproveModalOpen(true);
    };

    const submitApproval = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/syllabuses/${approveSyllabusId}/admin/approve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success) {
                showToast('Syllabus approved successfully!', 'success');
                setApproveModalOpen(false);
                setSelectedSyllabus(null);
                setSyllabusOutlines([]);
                fetchPendingSyllabuses();
                fetchCategoryTree(); // Refresh tree
            } else {
                throw new Error(result.message || 'Failed to approve syllabus');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectSyllabus = (syllabusId) => {
        setRejectionSyllabusId(syllabusId);
        setRejectionReason('');
        setRejectionModalOpen(true);
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            showToast('Rejection reason is required', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/syllabuses/${rejectionSyllabusId}/admin/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const result = await res.json();
            if (result.success) {
                showToast('Syllabus rejected successfully', 'success');
                setRejectionModalOpen(false);
                setSelectedSyllabus(null);
                setSyllabusOutlines([]);
                fetchPendingSyllabuses();
                fetchCategoryTree(); // Refresh tree
            } else {
                throw new Error(result.message || 'Failed to reject syllabus');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    useEffect(() => {
        fetchCategoryTree();
        fetchPendingSyllabuses();
    }, []);

    useEffect(() => {
        if (mode === 'pending') {
            fetchPendingSyllabuses();
        } else if (mode === 'rejected') {
            fetchRejectedSyllabuses();
        }
    }, [mode]);

    useEffect(() => {
        const deepLinkId = searchParams.get('id');
        if (!deepLinkId || deepLinkHandledRef.current === String(deepLinkId)) return;

        const matchId = (item) => String(item?.id ?? item?._id) === String(deepLinkId);
        const pendingList = Array.isArray(pendingSyllabuses) ? pendingSyllabuses : [];
        const rejectedRaw = rejectedSyllabuses?.data || rejectedSyllabuses;
        const rejectedList = Array.isArray(rejectedRaw) ? rejectedRaw : [];

        const match = pendingList.find(matchId) || rejectedList.find(matchId);
        if (!match) return;

        deepLinkHandledRef.current = String(deepLinkId);
        if (rejectedList.some(matchId) && mode !== 'rejected') {
            setMode('rejected');
        } else if (pendingList.some(matchId) && mode !== 'pending') {
            setMode('pending');
        }
        loadSyllabusDetails(match);

        const next = new URLSearchParams(searchParams);
        next.delete('id');
        setSearchParams(next, { replace: true });
    }, [searchParams, pendingSyllabuses, rejectedSyllabuses, mode, setSearchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) {
                setIsPageSizeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Main header filter state
    const [activeFilter, setActiveFilter] = useState('All');

    const toggleCategory = (catId) => {
        setExpandedCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const toggleShowMore = (catId, e) => {
        e.stopPropagation();
        setFullyExpandedCats(prev => 
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    // Flatten subcategories
    const allSubcategories = useMemo(() => {
        const list = [];
        categoryTree.forEach(cat => {
            if (Array.isArray(cat.subcategories)) {
                cat.subcategories.forEach(sub => {
                    list.push({
                        ...sub,
                        categoryId: cat.id,
                        categoryName: cat.name
                    });
                });
            }
        });
        return list;
    }, [categoryTree]);

    const selectedSubcatData = useMemo(() => {
        return allSubcategories.find(s => s.id === selectedSubCat) || null;
    }, [allSubcategories, selectedSubCat]);

    // Sub-renders for the 3 distinct views to keep main return clean
    const renderView1Grid = () => {
        const topics = selectedSubcatData?.topics || [];
        return (
            <>
                <div className="syll-view-title-row">
                    <h2>{selectedSubcatData?.name || 'Explorer'}</h2>
                    <div className="syll-followers-info">
                        <span className="syll-followers-count"><IconUserBust /> {topics.length} Academic Topics</span>
                    </div>
                </div>
                <p className="syll-desc-text">
                    Select a curriculum topic below to view the educational outlines, papers, and files mapped to this category.
                </p>

                {topics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontSize: '13px' }}>No topics found under this subcategory.</p>
                    </div>
                ) : (
                    <div className="syll-topics-grid">
                        {topics.map((topic) => (
                            <div key={topic.id} className="syll-topic-card">
                                <div className="syll-tc-left">
                                    <h4 onClick={() => { setSelectedTopic(topic); setCurrentView(2); }}>{topic.name}</h4>
                                    <p>{topic.papers ? topic.papers.length : 0} Outlines</p>
                                </div>
                                <button className="syll-btn-view" onClick={() => { setSelectedTopic(topic); setCurrentView(2); }}>
                                    <IconEye width={14} height={14} color="#99A1B7" /> View Papers
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const renderView2List = () => {
        const papers = selectedTopic?.papers || [];
        return (
            <>
                <div className="syll-view-title-row">
                    <h2>{selectedTopic?.name}</h2>
                </div>
                <p className="syll-desc-text">
                    {selectedTopic?.description || 'Browse research papers and syllabus outlines for this subject.'}
                </p>

                <h3 className="syll-list-subtitle">Outlines & Papers</h3>

                {papers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontSize: '13px' }}>No outlines uploaded under this topic.</p>
                    </div>
                ) : (
                    <div className="syll-papers-list">
                        {papers.map((paper, idx) => (
                            <div key={paper.id || idx} className="syll-paper-item">
                                <div className="syll-pi-left">
                                    <h4 onClick={() => { setSelectedOutline(paper); setCurrentView(3); }}>{paper.title}</h4>
                                    <p className="author">By Academia Team</p>
                                </div>
                                <div className="syll-pi-right">
                                    <button className="syll-btn-view" onClick={() => { setSelectedOutline(paper); setCurrentView(3); }}>
                                        <img src={hoaviewpaper} alt="View Paper" /> View Paper
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const renderView3Detail = () => {
        return (
            <>
                <div className="syll-detail-header">
                    <h2>{selectedOutline?.title}</h2>
                    <span className="syll-badge-paid">Approved <IconExternalLink /></span>
                </div>

                <div className="syll-author-row">
                    <div className="syll-author-info">
                        <img src="/assets/imgs/default-profile.png" alt="Author" className="syll-author-avatar" />
                        <span className="syll-author-name">By Academia Team</span>
                    </div>
                </div>

                <div className="syll-section-block">
                    <h3>Description / Abstract</h3>
                    <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6' }}>
                        {selectedOutline?.abstract || selectedOutline?.description || 'No description available for this syllabus outline.'}
                    </p>
                </div>

                {selectedOutline?.file_url && (
                    <div className="syll-section-block">
                        <h3>Attached Syllabus File</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '8px' }}>
                            <IconDocument color="#450468" width={20} height={20} />
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', display: 'block' }}>{selectedOutline.file_name || 'syllabus-document'}</span>
                                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{selectedOutline.file_type || 'PDF Document'}</span>
                            </div>
                            <a 
                                href={selectedOutline.file_url.startsWith('http') ? selectedOutline.file_url : `${API_BASE_URL}${selectedOutline.file_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="syll-btn-primary"
                                style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', height: 'auto', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                                Open File <IconExternalLink />
                            </a>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // --- Moderation Views ---
    const renderPendingSyllabuses = () => {
        if (selectedSyllabus) return renderSyllabusDetails();

        return (
            <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#071437', marginBottom: '16px' }}>Syllabuses Awaiting Moderation</h2>
                {pendingSyllabuses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontSize: '13px' }}>No syllabuses pending approval at this time.</p>
                    </div>
                ) : (
                    <div className="syll-papers-list">
                        {pendingSyllabuses.map((syllabus) => (
                            <div key={syllabus.id} className="syll-paper-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #EEF1F6', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#071437', marginBottom: '4px' }}>{syllabus.title}</h3>
                                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                                        Uploaded by <strong>{syllabus.instructor_name || 'Instructor'}</strong> on {new Date(syllabus.created_at).toLocaleDateString()}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {stripHtml(syllabus.description) || 'No description provided.'}
                                    </p>
                                </div>
                                <div>
                                    <button 
                                        className="syll-btn-purple-dark" 
                                        onClick={() => loadSyllabusDetails(syllabus)}
                                        style={{ padding: '8px 16px', fontSize: '12px' }}
                                    >
                                        Review Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderRejectedSyllabuses = () => {
        if (selectedSyllabus) return renderSyllabusDetails();

        const dataList = rejectedSyllabuses.data || rejectedSyllabuses || [];
        return (
            <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#071437', marginBottom: '16px' }}>Rejected Syllabuses Log</h2>
                {dataList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontSize: '13px' }}>No rejected syllabuses found in the system.</p>
                    </div>
                ) : (
                    <div className="syll-papers-list">
                        {dataList.map((syllabus) => (
                            <div key={syllabus.id} className="syll-paper-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #EEF1F6', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#071437', marginBottom: '4px' }}>{syllabus.title}</h3>
                                    <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
                                        Uploaded by <strong>{syllabus.instructor_name || 'Instructor'}</strong> on {new Date(syllabus.created_at).toLocaleDateString()}
                                    </p>
                                    <p style={{ fontSize: '13px', background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', margin: '4px 0 0 0' }}>
                                        <strong>Rejection Reason:</strong> {syllabus.rejection_reason || 'No reason specified'}
                                    </p>
                                </div>
                                <div>
                                    <button 
                                        className="syll-btn-view" 
                                        onClick={() => loadSyllabusDetails(syllabus)}
                                        style={{ padding: '8px 16px', fontSize: '12px' }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSyllabusDetails = () => {
        if (!selectedSyllabus) return null;
        return (
            <div className="syll-detail-view" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #EEF1F6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
                    <button 
                        onClick={() => { setSelectedSyllabus(null); setSyllabusOutlines([]); }} 
                        className="syll-back-btn"
                        style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600, cursor: 'pointer' }}
                    >
                        &larr; Back to Review List
                    </button>
                    <span className="syll-badge-paid" style={{ textTransform: 'uppercase', fontSize: '10px', padding: '4px 10px', borderRadius: '20px' }}>
                        {selectedSyllabus.status_approval}
                    </span>
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>{selectedSyllabus.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <img 
                        src={selectedSyllabus.instructor_avatar ? (selectedSyllabus.instructor_avatar.startsWith('http') ? selectedSyllabus.instructor_avatar : `${API_BASE_URL}${selectedSyllabus.instructor_avatar}`) : '/assets/imgs/default-profile.png'} 
                        alt="Instructor" 
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
                    />
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                        Instructor: <strong>{selectedSyllabus.instructor_name || 'Instructor'}</strong>
                    </span>
                </div>

                <div className="syll-section-block" style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#071437', marginBottom: '8px' }}>Description</h3>
                    <div 
                        style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: selectedSyllabus.description || 'No description provided.' }}
                    />
                </div>

                {selectedSyllabus.objectives && (
                    <div className="syll-section-block" style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#071437', marginBottom: '8px' }}>Syllabus Objectives</h3>
                        <div 
                            style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}
                            dangerouslySetInnerHTML={{ __html: selectedSyllabus.objectives }}
                        />
                    </div>
                )}

                {selectedSyllabus.rejection_reason && selectedSyllabus.status_approval === 'rejected' && (
                    <div className="syll-section-block" style={{ marginBottom: '20px', background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '16px', borderRadius: '8px', color: '#991B1B' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Rejection Reason</h3>
                        <p style={{ fontSize: '13px', lineHeight: 1.5 }}>{selectedSyllabus.rejection_reason}</p>
                    </div>
                )}

                <div className="syll-section-block" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#071437', marginBottom: '12px' }}>Syllabus Outlines / Papers ({syllabusOutlines.length})</h3>
                    {loadingSyllabusDetails ? (
                        <p style={{ fontSize: '13px', color: '#64748B' }}>Loading outlines...</p>
                    ) : syllabusOutlines.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#64748B' }}>No outlines uploaded for this syllabus.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {syllabusOutlines.map((outline, idx) => (
                                <div key={outline.id || idx} style={{ border: '1px solid #F1F5F9', borderRadius: '8px', padding: '16px', background: '#FCFCFC' }}>
                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>{idx + 1}. {outline.title}</h4>
                                    <div 
                                        style={{ fontSize: '12.5px', color: '#475569', marginBottom: '10px', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                        dangerouslySetInnerHTML={{ __html: outline.abstract || outline.description || 'No description provided.' }}
                                    />
                                    {outline.file_url && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <IconDocument color="#8B5CF6" width={16} height={16} />
                                            <a 
                                                href={outline.file_url.startsWith('http') ? outline.file_url : `${API_BASE_URL}${outline.file_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 500, textDecoration: 'none' }}
                                            >
                                                View Material ({outline.file_name || 'Document'})
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedSyllabus.status_approval === 'pending' && (
                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: '20px' }}>
                        <button 
                            className="syll-btn-primary" 
                            onClick={() => handleApproveSyllabus(selectedSyllabus.id)}
                            style={{ padding: '10px 24px', fontSize: '13px', height: 'auto', background: '#10B981', color: '#FFFFFF' }}
                        >
                            Approve Syllabus
                        </button>
                        <button 
                            className="syll-btn-outline" 
                            onClick={() => handleRejectSyllabus(selectedSyllabus.id)}
                            style={{ padding: '10px 24px', fontSize: '13px', height: 'auto', borderColor: '#EF4444', color: '#EF4444' }}
                        >
                            Reject Syllabus
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <HOALayout currentPage="syllabus">
            <div className="hoa-syllabus-page">

                {/* Page Header */}
                <div className="syll-page-header">
                    <h1>Syllabus Management</h1>
                    <div className="syll-header-actions">
                        <span className="syll-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Live Database Sync
                            <span className="dot"></span>
                        </span>
                    </div>
                </div>

                {/* Top Stats - Single Card Wrapper */}
                <div className="syll-top-stats-container">
                    <div className="syll-stats-container">
                        <div className="syll-stat-block">
                            <h3>{categoryTree.length}</h3>
                            <p>Taxonomy Categories</p>
                        </div>
                        <div className="syll-stat-block">
                            <h3>{pendingSyllabuses.length}</h3>
                            <p>Pending Approvals</p>
                        </div>
                        <div className="syll-stat-block">
                            <h3>{rejectedSyllabuses.data ? rejectedSyllabuses.data.length : rejectedSyllabuses.length}</h3>
                            <p>Rejected Syllabuses</p>
                        </div>
                        <div className="syll-stat-block">
                            <h3>1.8K</h3>
                            <p>Curriculum Downloads</p>
                        </div>
                    </div>
                </div>

                {/* Sub Header & Add Buttons */}
                <div className="syll-sub-header">
                    <div className="syll-sub-title">
                        <h2>
                            {mode === 'explorer' ? 'Syllabus Explorer' : mode === 'pending' ? 'Syllabus Moderation' : 'Rejected Syllabuses'}
                        </h2>
                        <p>
                            {mode === 'explorer' 
                                ? 'Browse categories, subcategories, topics, and academic outlines' 
                                : mode === 'pending' 
                                    ? 'Review and approve pending instructor syllabuses' 
                                    : 'View history of rejected syllabus attempts and reasons'}
                        </p>
                    </div>
                    <div className="syll-type-toggles" style={{ display: 'flex', gap: '8px' }}>
                        <button className={`syll-type-btn ${mode === 'explorer' ? 'active' : ''}`} onClick={() => { setMode('explorer'); setSelectedSyllabus(null); }}>Taxonomy Explorer</button>
                        <button className={`syll-type-btn ${mode === 'pending' ? 'active' : ''}`} onClick={() => { setMode('pending'); setSelectedSyllabus(null); }}>Pending ({pendingSyllabuses.length})</button>
                        <button className={`syll-type-btn ${mode === 'rejected' ? 'active' : ''}`} onClick={() => { setMode('rejected'); setSelectedSyllabus(null); }}>Rejected</button>
                    </div>
                </div>

                {/* Two Column Layout */}
                {mode === 'explorer' ? (
                    <div className="syll-layout">
                        {/* Left Sidebar */}
                        <div className="syll-sidebar">
                            <div className="syll-course-filter" onClick={() => setIsCourseFilterOpen(!isCourseFilterOpen)}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <img src={hoafilter2} style={{ width: 16 }} alt="" /> {selectedCourseFilter}
                                </span>
                                <IconDownCaret 
                                    width={14} height={8} 
                                    style={{ transform: isCourseFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} 
                                />
                                
                                {isCourseFilterOpen && (
                                    <div className="syll-course-dropdown">
                                        {['All Courses', 'My Courses', 'Archived Courses'].map(option => (
                                            <div 
                                                key={option} 
                                                className={`syll-course-dropdown-item ${selectedCourseFilter === option ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCourseFilter(option);
                                                    setIsCourseFilterOpen(false);
                                                }}
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="syll-cat-list">
                                {categoryTree.map((cat, idx) => (
                                    <div key={cat.id || idx}>
                                        <div
                                            className={`syll-cat-header ${expandedCategories.includes(cat.id) ? 'active' : ''}`}
                                            onClick={() => toggleCategory(cat.id)}
                                        >
                                            {cat.name}
                                            <IconDownCaret 
                                                width={14} height={8}
                                                style={{ transform: expandedCategories.includes(cat.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#071437' }}
                                            />
                                        </div>

                                        {expandedCategories.includes(cat.id) && cat.subcategories && (
                                            <div className="syll-subcat-list">
                                                {(fullyExpandedCats.includes(cat.id) ? cat.subcategories : cat.subcategories.slice(0, 6)).map((sub, sidx) => (
                                                    <div
                                                        key={sub.id || sidx}
                                                        className={`syll-subcat-item ${selectedSubCat === sub.id ? 'active' : ''}`}
                                                        onClick={() => { setSelectedSubCat(sub.id); setCurrentView(1); }}
                                                    >
                                                        <div className="syll-radio-label">
                                                            <div className="syll-radio-circle"></div>
                                                            {sub.name}
                                                        </div>
                                                        <span className="syll-count-badge">{sub.topics ? sub.topics.length : 0}</span>
                                                    </div>
                                                ))}
                                                {cat.subcategories.length > 6 && (
                                                    <div className="syll-show-more" onClick={(e) => toggleShowMore(cat.id, e)}>
                                                        {fullyExpandedCats.includes(cat.id) ? (
                                                            <>
                                                                <IconDownCaret width={12} height={8} style={{ transform: 'rotate(180deg)' }} /> Show less
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconDownCaret width={12} height={8} /> Show more
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Main Content Area */}
                        <div className="syll-main-area">
                            {/* Dynamic Body Content */}
                            <div className="syll-content-body">
                                {/* Dynamic Breadcrumbs */}
                                <div className="syll-breadcrumbs">
                                    <button className="syll-back-btn" onClick={() => setCurrentView(Math.max(1, currentView - 1))}>
                                        <IconLeftCaret width={10} height={16} strokeWidth={2.5} />
                                    </button>
                                    <span className={`syll-bc-link ${currentView === 1 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(1)}>
                                        {selectedSubcatData?.categoryName || 'Syllabus'}
                                    </span> 
                                    <span style={{color: '#E4E6EF'}}>/</span>
                                    <span className={`syll-bc-link ${currentView === 2 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(1)}>
                                        {selectedSubcatData?.name || 'Explorer'}
                                    </span> 
                                    {currentView >= 2 && (
                                        <>
                                            <span style={{color: '#E4E6EF'}}>/</span>
                                            <span className={`syll-bc-link ${currentView === 3 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(2)}>
                                                {selectedTopic?.name || 'Topic'}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {currentView === 1 && renderView1Grid()}
                                {currentView === 2 && renderView2List()}
                                {currentView === 3 && renderView3Detail()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#FCFCFC', borderRadius: '12px', border: '1px solid #EEF1F6', padding: '24px', minHeight: '400px' }}>
                        {mode === 'pending' && renderPendingSyllabuses()}
                        {mode === 'rejected' && renderRejectedSyllabuses()}
                    </div>
                )}
            </div>

            {/* Custom Approve Confirmation Modal Overlay */}
            {approveModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(7, 20, 55, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(7, 20, 55, 0.15)',
                        border: '1px solid #EEF1F6',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#E8FFF3',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '20px', color: '#50CD89', fontWeight: 'bold' }}>✓</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>
                            Approve Syllabus
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to approve this syllabus? Once approved, it will be published and accessible on the public syllabus page.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setApproveModalOpen(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#F9F9F9',
                                    border: '1px solid #E4E6EF',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitApproval}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#50CD89',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Rejection Modal Overlay */}
            {rejectionModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(7, 20, 55, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(7, 20, 55, 0.15)',
                        border: '1px solid #EEF1F6'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>
                            Reject Syllabus
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '16px', lineHeight: '1.5' }}>
                            Are you sure you want to reject this syllabus? Please provide a clear rejection reason to help the instructor improve the syllabus.
                        </p>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#071437', marginBottom: '6px' }}>
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter details on what needs to be corrected (e.g. outline formatting, clarity, missing resources)..."
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #DBDFE9',
                                    fontSize: '13px',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setRejectionModalOpen(false)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: '#F9F9F9',
                                    border: '1px solid #E4E6EF',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    background: '#D9272E',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Reject Syllabus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Toast Alert */}
            {toast.show && (
              <div className={`hoa-toast-notification is-${toast.type}`}>
                <div className="hoa-toast-icon">
                  {toast.type === 'success' ? '✓' : '✗'}
                </div>
                <p className="hoa-toast-message">{toast.message}</p>
              </div>
            )}
        </HOALayout>
    );
};

export default HOASyllabus;
