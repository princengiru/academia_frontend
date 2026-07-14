import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-projects.css';

// Standard project icons (reused from your imports)
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoapeople from '../../../assets/icons/hoapeople.svg';
import hoagoback from '../../../assets/icons/hoagoback.svg';

// Custom inline SVGs for specific icons needed in Projects
const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconHeart = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const IconEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const IconCloseDrawer = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 19 12 12 5"></polyline>
        <line x1="5" y1="5" x2="5" y2="19"></line>
    </svg>
);

const IconMoreDots = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const IconBuilding = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="9" y1="22" x2="9" y2="22"></line>
        <line x1="15" y1="22" x2="15" y2="22"></line>
        <line x1="9" y1="6" x2="9" y2="6"></line>
        <line x1="15" y1="6" x2="15" y2="6"></line>
        <line x1="9" y1="10" x2="9" y2="10"></line>
        <line x1="15" y1="10" x2="15" y2="10"></line>
        <line x1="9" y1="14" x2="9" y2="14"></line>
        <line x1="15" y1="14" x2="15" y2="14"></line>
    </svg>
);

const IconClock = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const IconLocation = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const IconReply = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
    </svg>
);

const IconCommentsTab = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="9" x2="15" y2="9"></line>
        <line x1="9" y1="13" x2="15" y2="13"></line>
        <line x1="9" y1="17" x2="13" y2="17"></line>
    </svg>
);

const HOAProjects = () => {
    // API Configuration
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [searchParams, setSearchParams] = useSearchParams();
    const deepLinkHandledRef = useRef(null);

    // Moderation Mode: 'explorer' (Approved), 'pending', 'rejected'
    const [mode, setMode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get('mode');
        return modeParam === 'pending' || modeParam === 'rejected' || modeParam === 'explorer'
            ? modeParam
            : (params.get('id') ? 'pending' : 'explorer');
    });

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeType, setActiveType] = useState('Projects'); // 'Projects' or 'People'
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Recommended');
    
    // Data lists
    const [approvedProjects, setApprovedProjects] = useState([]);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [rejectedProjects, setRejectedProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selected Project detail state
    const [selectedProject, setSelectedProject] = useState(null);
    const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);

    // Modal display state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'comments'

    // Comments state
    const [projectComments, setProjectComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Custom Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Rejection Modal
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionProjectId, setRejectionProjectId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Approve Modal
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveProjectId, setApproveProjectId] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Approved
            const approvedRes = await fetch(`${API_BASE_URL}/api/projects/admin/approved?limit=100`, { headers });
            const approvedResult = await approvedRes.json();
            if (approvedResult.success) {
                const list = approvedResult.data?.projects || approvedResult.data || approvedResult.projects || [];
                setApprovedProjects(Array.isArray(list) ? list : []);
            }

            // Fetch Pending
            const pendingRes = await fetch(`${API_BASE_URL}/api/projects/admin/pending?limit=100`, { headers });
            const pendingResult = await pendingRes.json();
            if (pendingResult.success) {
                const list = pendingResult.data?.projects || pendingResult.data || pendingResult.projects || [];
                setPendingProjects(Array.isArray(list) ? list : []);
            }

            // Fetch Rejected
            const rejectedRes = await fetch(`${API_BASE_URL}/api/projects/admin/rejected?limit=100`, { headers });
            const rejectedResult = await rejectedRes.json();
            if (rejectedResult.success) {
                const list = rejectedResult.data?.projects || rejectedResult.data || rejectedResult.projects || [];
                setRejectedProjects(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error('Error fetching projects list:', err);
            showToast('Failed to load projects', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectComments = async (projectId) => {
        setLoadingComments(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments?limit=100`, { headers });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setProjectComments(result.data);
            } else {
                setProjectComments([]);
            }
        } catch (err) {
            console.error('Failed to load comments for project:', err);
            setProjectComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const loadProjectDetails = async (proj) => {
        setLoadingProjectDetails(true);
        setSelectedProject(proj);
        setIsModalOpen(true);
        setProjectComments([]);
        setActiveTab('overview');
        fetchProjectComments(proj.id);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_BASE_URL}/api/projects/${proj.id}`, { headers });
            const result = await res.json();
            if (result.success && result.data) {
                setSelectedProject(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch project details');
            }
        } catch (err) {
            console.error('Error fetching project details:', err);
            showToast('Failed to load project details', 'error');
        } finally {
            setLoadingProjectDetails(false);
        }
    };

    const handleApproveProject = (projectId) => {
        setApproveProjectId(projectId);
        setApproveModalOpen(true);
    };

    const submitApproval = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/projects/${approveProjectId}/approve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success) {
                showToast('Project approved successfully!', 'success');
                setApproveModalOpen(false);
                setIsModalOpen(false);
                fetchProjects();
            } else {
                throw new Error(result.message || 'Failed to approve project');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectProject = (projectId) => {
        setRejectionProjectId(projectId);
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
            const res = await fetch(`${API_BASE_URL}/api/projects/${rejectionProjectId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectionReason.trim() })
            });
            const result = await res.json();
            if (result.success) {
                showToast('Project rejected successfully', 'success');
                setRejectionModalOpen(false);
                setIsModalOpen(false);
                fetchProjects();
            } else {
                throw new Error(result.message || 'Failed to reject project');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        const deepLinkId = searchParams.get('id');
        if (!deepLinkId || deepLinkHandledRef.current === String(deepLinkId) || loading) return;

        const matchId = (item) => String(item?.id ?? item?._id) === String(deepLinkId);
        const match =
            pendingProjects.find(matchId) ||
            approvedProjects.find(matchId) ||
            rejectedProjects.find(matchId);

        if (!match) return;

        deepLinkHandledRef.current = String(deepLinkId);
        if (pendingProjects.some(matchId) && mode !== 'pending') setMode('pending');
        else if (rejectedProjects.some(matchId) && mode !== 'rejected') setMode('rejected');
        else if (approvedProjects.some(matchId) && mode !== 'explorer') setMode('explorer');

        loadProjectDetails(match);

        const next = new URLSearchParams(searchParams);
        next.delete('id');
        setSearchParams(next, { replace: true });
    }, [searchParams, pendingProjects, approvedProjects, rejectedProjects, loading, mode, setSearchParams]);

    const filteredProjects = useMemo(() => {
        const currentList = mode === 'explorer'
            ? approvedProjects
            : mode === 'pending'
                ? pendingProjects
                : rejectedProjects;

        return currentList.filter(project => {
            const matchesSearch = (project.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (project.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [mode, approvedProjects, pendingProjects, rejectedProjects, searchQuery]);

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    return (
        <HOALayout currentPage="projects">
            <div className="hoap-projects-page">
                {/* Page Header */}
                <div className="hoap-page-header">
                    <h1>Projects</h1>
                    <div className="hoap-header-actions">
                        <span className="hoap-update-status">
                            <img src={hoarefresh} alt="Refresh" className="hoap-sync-icon" />
                            Data updated every 5min
                            <span className="hoap-dot"></span>
                        </span>
                        <button className="hoap-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Moderation Mode Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', borderBottom: '1px solid #EEF1F6', paddingBottom: '12px' }}>
                    <div className="hoap-type-toggles" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className={`hoap-type-btn ${mode === 'explorer' ? 'active' : ''}`} 
                            onClick={() => { setMode('explorer'); setSelectedProject(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'explorer' ? '#450468' : 'transparent', color: mode === 'explorer' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Projects Explorer ({approvedProjects.length})
                        </button>
                        <button 
                            className={`hoap-type-btn ${mode === 'pending' ? 'active' : ''}`} 
                            onClick={() => { setMode('pending'); setSelectedProject(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'pending' ? '#450468' : 'transparent', color: mode === 'pending' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Pending Moderation ({pendingProjects.length})
                        </button>
                        <button 
                            className={`hoap-type-btn ${mode === 'rejected' ? 'active' : ''}`} 
                            onClick={() => { setMode('rejected'); setSelectedProject(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'rejected' ? '#450468' : 'transparent', color: mode === 'rejected' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Rejected Projects ({rejectedProjects.length})
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="hoap-stats-top-container">
                    <div className="hoap-stats-container">
                        <div className="hoap-stat-block">
                            <h3>{approvedProjects.length}</h3>
                            <p>Total Projects</p>
                        </div>
                        <div className="hoap-stat-block">
                            <h3>13.3M</h3>
                            <p>Total Learners</p>
                        </div>
                        <div className="hoap-stat-block">
                            <h3>204</h3>
                            <p>Avg. Learning Time</p>
                        </div>
                        <div className="hoap-stat-block">
                            <h3>
                                19.3M
                                <span className="hoap-currency-dropdown">
                                    RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                                </span>
                            </h3>
                            <p>Upload Payments <span className="hoap-trend down">↘ -4.5%</span></p>
                        </div>
                        <div className="hoap-stat-block">
                            <h3>
                                843.5K
                                <span className="hoap-currency-dropdown">
                                    RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                                </span>
                            </h3>
                            <p>Course Payments <span className="hoap-trend up">↗ +4.1</span></p>
                        </div>
                    </div>
                </div>

                {/* Sub Header & Actions */}
                <div className="hoap-sub-header">
                    <div className="hoap-sub-title">
                        <h2>{mode === 'explorer' ? 'Approved Projects' : mode === 'pending' ? 'Pending Projects' : 'Rejected Projects'}</h2>
                        <p>{filteredProjects.length} projects</p>
                    </div>
                    {mode === 'explorer' && (
                        <div className="hoap-add-actions">
                            <button className="hoap-btn-outline"><img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Project</button>
                            <button className="hoap-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Category</button>
                        </div>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="hoap-filters-row">
                    <div className="hoap-filter-container">
                        <div className="hoap-dropdown-trigger" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={hoafilter2} style={{ width: 16, opacity: 0.5 }} alt="" /> {selectedFilter}
                            </span>
                            <IconDownCaret width={14} height={8} style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isFilterOpen && (
                            <div className="hoap-dropdown-menu">
                                {['Recommended', 'Most Recent', 'Most Popular'].map(opt => (
                                    <button
                                        key={opt}
                                        className="hoap-dropdown-item"
                                        onClick={() => {
                                            setSelectedFilter(opt);
                                            setIsFilterOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hoap-main-header-bar">
                        <div className="hoap-search-bar">
                            <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                            <input 
                                type="text" 
                                placeholder="Search projects or author..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="hoap-type-toggles">
                            {['Projects', 'People'].map(filter => (
                                <button
                                    key={filter}
                                    className={`hoap-type-btn ${activeType === filter ? 'active' : ''}`}
                                    onClick={() => setActiveType(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="hoap-v-divider"></div>
                        <button className="hoap-btn-filter-pill">
                            <img src={hoafilter} style={{ width: 12, opacity: 0.5 }} alt="" /> Filters
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <span style={{ fontSize: '14px', color: '#78829D' }}>Loading projects...</span>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FCFCFC', borderRadius: '12px', border: '1.5px dashed #E4E6EF', margin: '20px 0' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#071437', marginBottom: '4px' }}>No projects found</h4>
                        <p style={{ fontSize: '13px', color: '#78829D', margin: 0 }}>There are no projects in this view at this time.</p>
                    </div>
                ) : (
                    <div className="hoap-grid">
                        {filteredProjects.map(project => {
                            const projectBg = project.thumbnail_url
                                ? `${API_BASE_URL}${project.thumbnail_url}`
                                : 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop';
                            
                            return (
                                <div key={project.id} className="hoap-card" onClick={() => loadProjectDetails(project)}>
                                    <img src={projectBg} alt="" className="hoap-card-img" style={{ objectFit: 'cover' }} />
                                    <div className="hoap-card-content">
                                        <div className="hoap-card-meta">
                                            <span className="hoap-card-author">
                                                By <span style={{ textDecoration: 'underline', color: '#071437', fontWeight: 500, marginLeft: '5px' }}>{project.user_name || 'Author'}</span>
                                            </span>
                                            <div className="hoap-card-stats">
                                                <span><IconHeart /> {project.likes_count || 0}</span>
                                                <span><IconEye /> {project.views_count || 0}</span>
                                            </div>
                                        </div>
                                        <h4 className="hoap-card-title">{project.title}</h4>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="hoap-pagination-container">
                    <div className="hoap-pagination-right">
                        <button className="hoap-page-nav" style={{ color: '#D8D8E5' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="hoap-page-num active">1</button>
                        <button className="hoap-page-nav" style={{ color: '#78829D' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                {/* PROJECT PREVIEW MODAL OVERLAY */}
                <div className={`hoap-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                    <div className="hoap-modal-drawer" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="hoap-modal-top-header" style={{ display: 'flex', alignItems: 'center' }}>
                            <button className="hoap-modal-close-btn" onClick={closeModal}>
                                <img src={hoagoback} alt="Back" />          
                            </button>
                            <h2>Project Preview</h2>

                            {/* Moderator Actions in Header */}
                            {selectedProject?.approval_status === 'pending' && (
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: '16px' }}>
                                    <button 
                                        onClick={() => handleRejectProject(selectedProject.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: '#FFF5F5',
                                            border: '1px solid #FEE2E2',
                                            color: '#E53E3E',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveProject(selectedProject.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: '#E8FFF3',
                                            border: '1px solid #D1FAE5',
                                            color: '#10B981',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Approve
                                    </button>
                                </div>
                            )}

                            <span className="hoap-update-status" style={{ border: '1px solid #EEF1F6', marginLeft: selectedProject?.approval_status === 'pending' ? '0' : 'auto' }}>
                                <img src={hoarefresh} alt="Refresh" className="hoap-sync-icon" />
                                Data updated every 1 hr
                                <span className="hoap-dot" style={{ background: '#17C653' }}></span>
                            </span>
                        </div>

                        {/* Modal Content Scroll Area */}
                        {loadingProjectDetails ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
                                <span style={{ fontSize: '14px', color: '#78829D' }}>Loading details...</span>
                            </div>
                        ) : selectedProject ? (
                            <div className="hoap-modal-content-area">
                                
                                {/* Rejection Log Banner */}
                                {selectedProject.approval_status === 'rejected' && (
                                    <div style={{
                                        background: '#FFF5F5',
                                        border: '1px solid #FEE2E2',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#C53030' }}>
                                            This Project was Rejected
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#742A2A', lineHeight: 1.4 }}>
                                            <strong>Reason:</strong> {selectedProject.rejection_reason || 'No specific reason provided.'}
                                        </span>
                                    </div>
                                )}

                                {/* Drawer Sub Header */}
                                <div className="hoap-drawer-owner-row">
                                    <div className="hoap-owner-info">
                                        <div className="hoap-owner-avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {selectedProject.user_avatar ? (
                                                <img src={selectedProject.user_avatar.startsWith('http') ? selectedProject.user_avatar : `${API_BASE_URL}${selectedProject.user_avatar}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <img src={hoapeople} alt="" width={16} height={16} />
                                            )}
                                        </div>
                                        <span className="hoap-owner-name">{selectedProject.user_name || 'Author'} <IconDownCaret style={{marginLeft: 4}}/></span>
                                        <span className="hoap-owner-dot">•</span>
                                        <span className="hoap-project-type">Academic Project</span>
                                    </div>
                                    <div className="hoap-owner-actions">
                                        <button className="hoap-btn-icon-light"><IconMoreDots /></button>
                                    </div>
                                </div>

                                <hr className="hoap-divider" />

                                {/* Info Grid */}
                                <div className="hoap-drawer-info-grid">
                                    <div className="hoap-info-col">
                                        <h5>Project Info</h5>
                                        <ul>
                                            <li><IconBuilding /> {selectedProject.category || 'Academic Development'}</li>
                                            <li><IconClock /> Created: {new Date(selectedProject.created_at).toLocaleDateString()}</li>
                                            <li><IconLocation /> Platform Upload</li>
                                        </ul>
                                    </div>
                                    <div className="hoap-info-col">
                                        <h5>Collaborators</h5>
                                        <ul>
                                            {(selectedProject.collaborators && selectedProject.collaborators.length > 0) ? (
                                                selectedProject.collaborators.map((c, i) => (
                                                    <li key={i}>{typeof c === 'string' ? c : c.name || c.email}</li>
                                                ))
                                            ) : (
                                                <li>No collaborators</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="hoap-info-col">
                                        <h5>Projects Stats</h5>
                                        <ul className="hoap-stats-list">
                                            <li><span>Project Views</span> <span>{selectedProject.views_count || 0}</span></li>
                                            <li><span>Project Likes</span> <span>{selectedProject.likes_count || 0}</span></li>
                                            <li><span>Project Saves</span> <span>{selectedProject.saves_count || 0}</span></li>
                                        </ul>
                                    </div>
                                </div>

                                <hr className="hoap-divider" />

                                {/* Tabs & Breadcrumbs row */}
                                <div className="hoap-drawer-tabs-row">
                                    <div className="hoap-breadcrumbs">
                                        <span className="hoap-bc-link">Projects</span> / <span>{selectedProject.title}</span>
                                    </div>
                                    <div className="hoap-toggle-tabs">
                                        <button className={`hoap-pill-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                                        <button className={`hoap-pill-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                                            <IconCommentsTab /> Comments ({projectComments.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="hoap-tab-content-container">
                                    
                                    {/* ==== OVERVIEW TAB ==== */}
                                    {activeTab === 'overview' && (
                                        <div className="hoap-overview-content">
                                            <h3 className="hoap-section-title">Abstract</h3>
                                            <p className="hoap-abstract-text" style={{ whiteSpace: 'pre-wrap' }}>
                                                {selectedProject.abstract || 'No abstract/description provided for this project.'}
                                            </p>

                                            <div className="hoap-preview-gallery">
                                                {selectedProject.thumbnail_url && (
                                                    <img src={`${API_BASE_URL}${selectedProject.thumbnail_url}`} alt="Main Project" className="hoap-gallery-main" style={{ objectFit: 'cover', maxHeight: '350px' }} />
                                                )}
                                                <div className="hoap-gallery-sub">
                                                    {selectedProject.images && selectedProject.images.map((img, index) => (
                                                        <img key={index} src={`${API_BASE_URL}${img}`} alt={`Sub Project ${index + 1}`} style={{ objectFit: 'cover', maxHeight: '150px' }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ==== COMMENTS TAB ==== */}
                                    {activeTab === 'comments' && (
                                        <div className="hoap-comments-content">
                                            <h3 className="hoap-section-title">Comments</h3>
                                            {loadingComments ? (
                                                <p style={{ fontSize: '13px', color: '#78829D' }}>Loading comments...</p>
                                            ) : projectComments.length === 0 ? (
                                                <p style={{ fontSize: '13px', color: '#78829D', fontStyle: 'italic' }}>No comments yet.</p>
                                            ) : (
                                                <div className="hoap-comments-list">
                                                    {projectComments.map((comment) => {
                                                        const commentAvatar = comment.user_avatar ? (comment.user_avatar.startsWith('http') ? comment.user_avatar : `${API_BASE_URL}${comment.user_avatar}`) : '/assets/imgs/default-profile.png';
                                                        return (
                                                            <div key={comment.id} className="hoap-comment-item">
                                                                <div className="hoap-comment-avatar">
                                                                    <img src={commentAvatar} alt={comment.user_name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }} />
                                                                </div>
                                                                <div className="hoap-comment-body">
                                                                    <div className="hoap-comment-header">
                                                                        <h4>{comment.user_name || 'Anonymous'}</h4>
                                                                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="hoap-comment-text" style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                                                    <div className="hoap-comment-actions">
                                                                        <span className="hoap-posted-date">Posted on <strong>{new Date(comment.created_at).toLocaleDateString()}</strong></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : null}
                    </div>
                </div>

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
                            Approve Project
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to approve this project? Once approved, it will be published and available to all users.
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
                            Reject Project
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '16px', lineHeight: '1.4' }}>
                            Please provide a detailed reason for rejecting this project. The student will receive this explanation via email.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Type rejection explanation here..."
                            style={{
                                width: '100%',
                                height: '120px',
                                borderRadius: '8px',
                                border: '1px solid #E4E6EF',
                                padding: '12px',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                color: '#071437',
                                resize: 'none',
                                marginBottom: '20px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setRejectionModalOpen(false)}
                                style={{
                                    padding: '10px 20px',
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
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#F1416C',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Reject Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className="premium-toast" style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    background: toast.type === 'success' ? '#E8FFF3' : '#FFF5F5',
                    border: toast.type === 'success' ? '1px solid #50CD89' : '1px solid #F1416C',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: toast.type === 'success' ? '#50CD89' : '#F1416C',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: toast.type === 'success' ? '#1E293B' : '#651A1A'
                    }}>
                        {toast.message}
                    </span>
                </div>
            )}
        </HOALayout>
    );
};

export default HOAProjects;