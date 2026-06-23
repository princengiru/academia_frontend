import React, { useState } from 'react';
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
    // Top-level state
    const [activeType, setActiveType] = useState('Projects'); // 'Projects' or 'People'
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Recommended');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'comments'

    // Dummy data for projects grid
    const projectsData = [
        { id: 1, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '10.6K', views: '10.6K', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
        { id: 2, title: 'Build your software & engineering dream career', author: 'Team owners', isTeam: true, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop' },
        { id: 3, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop' },
        { id: 4, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop' },
        { id: 5, title: 'Build your software & engineering dream career', author: 'Team owners', isTeam: true, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop' },
        { id: 6, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop' },
        { id: 7, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '10.6K', views: '10.6K', img: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop' },
        { id: 8, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1512758684632-a8ea7306fb71?q=80&w=600&auto=format&fit=crop' },
        { id: 9, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '10.6K', views: '10.6K', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop' },
        { id: 10, title: 'Build your software & engineering dream career', author: 'Team owners', isTeam: true, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop' },
        { id: 11, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1541888086925-081335b71946?q=80&w=600&auto=format&fit=crop' },
        { id: 12, title: 'Build your software & engineering dream career', author: 'Jose Carine', isTeam: false, likes: '11', views: '1.2K', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop' },
    ];

    // Dummy data for Comments tab
    const commentsData = Array(6).fill({
        avatar: '/assets/imgs/default-profile.png', // Assuming a fallback will show or use initials
        name: 'Mrs. Anderson',
        timeAgo: '1 Day ago',
        text: 'Nice Project',
        date: 'Apr 23, 2025'
    }).map((comment, idx) => {
        if (idx === 0) {
            return {
                ...comment,
                name: 'Mr. Anderson',
                text: 'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I\'ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?'
            }
        }
        return { ...comment, id: idx + 1 };
    });

    const openProjectModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
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

                {/* Top Stats */}
            <div className="hoap-stats-top-container">
                <div className="hoap-stats-container">
                    <div className="hoap-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Courses</p>
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
                        <h2>Journals & Projects</h2>
                        <p>3,461 Projects</p>
                    </div>
                    <div className="hoap-add-actions">
                        <button className="hoap-btn-outline"><img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Project</button>
                        <button className="hoap-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Category</button>
                    </div>
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
                            <input type="text" placeholder="Search any projects..." />
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
                <div className="hoap-grid">
                    {projectsData.map(project => (
                        <div key={project.id} className="hoap-card" onClick={() => openProjectModal()}>
                            <img src={project.img} alt={project.title} className="hoap-card-img" />
                            <div className="hoap-card-content">
                                <div className="hoap-card-meta">
                                    <span className="hoap-card-author">
                                        By <span style={{ textDecoration: 'underline', color: '#071437', fontWeight: 500, marginLeft: '5px' }}>{project.author}</span>
                                        {project.isTeam && <IconDownCaret style={{ marginLeft: 4, width: 10 }} />}
                                    </span>
                                    <div className="hoap-card-stats">
                                        <span><IconHeart /> {project.likes}</span>
                                        <span><IconEye /> {project.views}</span>
                                    </div>
                                </div>
                                <h4 className="hoap-card-title">{project.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="hoap-pagination-container">
                    <div className="hoap-pagination-right">
                        <button className="hoap-page-nav" style={{ color: '#D8D8E5' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="hoap-page-num">1</button>
                        <button className="hoap-page-num active">2</button>
                        <button className="hoap-page-num">3</button>
                        <button className="hoap-page-num">4</button>
                        <button className="hoap-page-num">5</button>
                        <span style={{ margin: '0 4px', color: '#4B5675' }}>...</span>
                        <button className="hoap-page-nav" style={{ color: '#78829D' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                {/* PROJECT PREVIEW MODAL OVERLAY */}
                <div className={`hoap-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                    <div className="hoap-modal-drawer" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="hoap-modal-top-header">
                            <button className="hoap-modal-close-btn" onClick={closeModal}>
                                <img src={hoagoback} alt="Back" />          
                            </button>
                            <h2>Project Preview</h2>
                            <span className="hoap-update-status" style={{ border: '1px solid #EEF1F6' }}>
                                <img src={hoarefresh} alt="Refresh" className="hoap-sync-icon" />
                                Data updated every 1 hr
                                <span className="hoap-dot" style={{ background: '#17C653' }}></span>
                            </span>
                        </div>

                        {/* Modal Content Scroll Area */}
                        <div className="hoap-modal-content-area">
                            
                            {/* Drawer Sub Header */}
                            <div className="hoap-drawer-owner-row">
                                <div className="hoap-owner-info">
                                    <div className="hoap-owner-avatar-placeholder">
                                        <img src={hoapeople} alt="" width={16} height={16} />
                                    </div>
                                    <span className="hoap-owner-name">Team Owners <IconDownCaret style={{marginLeft: 4}}/></span>
                                    <span className="hoap-owner-dot">•</span>
                                    <span className="hoap-project-type">Building Project</span>
                                </div>
                                <div className="hoap-owner-actions">
                                    <span className="hoap-hirings-count">Total Hirings <strong>3,461</strong></span>
                                    <button className="hoap-btn-icon-light"><IconMoreDots /></button>
                                </div>
                            </div>

                            <hr className="hoap-divider" />

                            {/* Info Grid */}
                            <div className="hoap-drawer-info-grid">
                                <div className="hoap-info-col">
                                    <h5>Project Info</h5>
                                    <ul>
                                        <li><IconBuilding /> Building and Construction</li>
                                        <li><IconClock /> 6 yrs since posted</li>
                                        <li><IconLocation /> Kigali, Rwanda</li>
                                    </ul>
                                </div>
                                <div className="hoap-info-col">
                                    <h5>Tools & Skills</h5>
                                    <ul>
                                        <li>Adobe illustrator</li>
                                        <li>Adobe Photoshop</li>
                                        <li>Coding Skills (CSS, HTML & REACT ), <span className="hoap-link-more">+8 More</span></li>
                                    </ul>
                                </div>
                                <div className="hoap-info-col">
                                    <h5>Projects Stats</h5>
                                    <ul className="hoap-stats-list">
                                        <li><span>Project Views</span> <span>1,345,780</span></li>
                                        <li><span>Project Likes</span> <span>236,890</span></li>
                                        <li><span>Project Feedbacks</span> <span>103,006</span></li>
                                    </ul>
                                </div>
                            </div>

                            <hr className="hoap-divider" />

                            {/* Tabs & Breadcrumbs row */}
                            <div className="hoap-drawer-tabs-row">
                                <div className="hoap-breadcrumbs">
                                    <span className="hoap-bc-link">Projects</span> / <span>Build your software & engineering dream career</span>
                                </div>
                                <div className="hoap-toggle-tabs">
                                    <button className={`hoap-pill-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                                    <button className={`hoap-pill-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                                        <IconCommentsTab /> Comments
                                    </button>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="hoap-tab-content-container">
                                
                                {/* ==== OVERVIEW TAB ==== */}
                                {activeTab === 'overview' && (
                                    <div className="hoap-overview-content">
                                        <h3 className="hoap-section-title">Abstract</h3>
                                        <p className="hoap-abstract-text">
                                            Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
                                        </p>

                                        <div className="hoap-preview-gallery">
                                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop" alt="Main Project" className="hoap-gallery-main" />
                                            <div className="hoap-gallery-sub">
                                                <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=500&auto=format&fit=crop" alt="Sub Project 1" />
                                                <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=500&auto=format&fit=crop" alt="Sub Project 2" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==== COMMENTS TAB ==== */}
                                {activeTab === 'comments' && (
                                    <div className="hoap-comments-content">
                                        <h3 className="hoap-section-title">Comments</h3>
                                        <div className="hoap-comments-list">
                                            {commentsData.map((comment, idx) => (
                                                <div key={idx} className="hoap-comment-item">
                                                    <div className="hoap-comment-avatar">
                                                        <div className="hoap-avatar-circle">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                        </div>
                                                    </div>
                                                    <div className="hoap-comment-body">
                                                        <div className="hoap-comment-header">
                                                            <h4>{comment.name}</h4>
                                                            <span>{comment.timeAgo}</span>
                                                        </div>
                                                        <p className="hoap-comment-text">{comment.text}</p>
                                                        <div className="hoap-comment-actions">
                                                            <button className="hoap-reply-btn"><IconReply /> Reply</button>
                                                            <span className="hoap-posted-date">Posted on <strong>{comment.date}</strong></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOAProjects;