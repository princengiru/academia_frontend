import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-online-courses.css';

// Reuse standard project icons
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
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoarank from '../../../assets/icons/hoarank.png';

// Custom inline SVGs for specific icons
const IconUserBust = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const IconRightArrow = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconDuration = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const IconSkill = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const IconWallet = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
);

const IconLightbulb = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5"></path>
    </svg>
);

const IconReply = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
    </svg>
);

const HOAOnlineCourses = () => {
    // Top-level state
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCourseFilterOpen, setIsCourseFilterOpen] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'qa'

    // Dummy data for courses grid
    const coursesData = Array(10).fill({
        title: 'Software Development',
        author: 'Emma Furgreance',
        students: 17,
        date: 'Jan 4th 2026',
        bg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop'
    }).map((course, idx) => ({
        ...course,
        id: idx + 1,
        isFree: idx === 0 || idx === 3 || idx === 5,
        price: idx === 0 || idx === 3 || idx === 5 ? 'Free' : '$5 / Month'
    }));

    // Dummy data for Students table inside modal
    const studentsData = Array(8).fill({
        name: 'Alexis Ndayamabje Froduard',
        country: 'Rwanda',
        title: 'Javascript Fundamental Quiz',
        type: 'Course',
        duration: '4 Weeks',
        amount: '222.3 USD',
        visits: '23',
        certs: '6',
        score: '12.34 %',
        feeType: 'Paid',
        feeAmount: '35 USD',
        status: 'Completed',
    }).map((student, idx) => ({
        ...student,
        id: idx + 1,
        type: idx > 2 ? 'Syllabus' : 'Course',
        duration: idx > 2 ? '251 Pages' : '4 Weeks',
        feeType: idx === 0 || idx === 3 || idx === 6 ? 'Free' : 'Paid',
        feeAmount: idx === 0 || idx === 3 || idx === 6 ? '0 USD' : '35 USD',
        status: idx === 1 ? 'Failed' : idx === 2 ? 'In Progress' : 'Completed'
    }));

    // Dummy data for Q&A tab
    const qaData = Array(4).fill({
        avatar: '/assets/imgs/default-profile.png',
        name: 'Mrs. Anderson',
        timeAgo: '1 Day ago',
        week: 'Wk1 : Chapter 4',
        title: 'Core Principles of Cybersecurity, Leadership and Oversight',
        text: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...',
        replies: 12,
        date: 'Apr 23, 2025'
    }).map((qa, idx) => ({
        ...qa,
        id: idx + 1,
        week: idx === 2 ? 'Wk2 : Chapter 23' : 'Wk1 : Chapter 4',
        title: idx === 2 ? 'Mathematics and Science' : qa.title,
        replies: idx === 0 ? 0 : 12
    }));

    const openCourseModal = (course) => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <HOALayout currentPage="online-courses">
            <div className="hoa-online-courses-page">
                {/* Page Header */}
                <div className="oc-page-header">
                    <h1>Online Courses</h1>
                    <div className="oc-header-actions">
                        <span className="oc-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Data updated every 5min
                            <span className="dot"></span>
                        </span>
                        <button className="oc-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="oc-stats-container">
                    <div className="oc-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Courses</p>
                    </div>
                    <div className="oc-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Learners</p>
                    </div>
                    <div className="oc-stat-block">
                        <h3>204</h3>
                        <p>Avg. Learning Time</p>
                    </div>
                    <div className="oc-stat-block">
                        <h3>
                            19.3M
                            <span className="oc-currency-dropdown">
                                RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Upload Payments <span className="oc-trend down">↘ -4.5%</span></p>
                    </div>
                    <div className="oc-stat-block">
                        <h3>
                            843.5K
                            <span className="oc-currency-dropdown">
                                RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Course Payments <span className="oc-trend up">↗ +4.1</span></p>
                    </div>
                </div>

                {/* Sub Header & Actions */}
                <div className="oc-sub-header">
                    <div className="oc-sub-title">
                        <h2>Courses</h2>
                        <p>3,461 Lessons</p>
                    </div>
                    <div className="oc-add-actions">
                        <button className="oc-btn-outline"><img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add New Course</button>
                        <button className="oc-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Category</button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="oc-filters-row">
                    <div className="oc-course-filter-container">
                        <div className="oc-course-filter" onClick={() => setIsCourseFilterOpen(!isCourseFilterOpen)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={hoafilter2} style={{ width: 16, opacity: 0.5 }} alt="" /> {selectedCourseFilter}
                            </span>
                            <IconDownCaret width={14} height={8} style={{ transform: isCourseFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isCourseFilterOpen && (
                            <div className="oc-filter-dropdown-menu">
                                {['All Courses', 'My Courses', 'Favorite Courses'].map(opt => (
                                    <button 
                                        key={opt}
                                        className="oc-filter-dropdown-item"
                                        onClick={() => {
                                            setSelectedCourseFilter(opt);
                                            setIsCourseFilterOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="oc-main-header-bar">
                        <div className="oc-search-bar">
                            <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                            <input type="text" placeholder="Search any Courses..." />
                        </div>

                        <div className="oc-type-toggles">
                            {['All', 'Free', 'Paid'].map(filter => (
                                <button
                                    key={filter}
                                    className={`oc-type-btn ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(filter)}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="oc-v-divider"></div>
                        <button className="oc-btn-filter-pill">
                            <img src={hoafilter} style={{ width: 12, opacity: 0.5 }} alt="" /> Filters
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="oc-grid">
                    {coursesData.map(course => (
                        <div key={course.id} className="oc-card" onClick={() => openCourseModal(course)}>
                            <img src={course.bg} alt="" className="oc-card-bg" />
                            <div className="oc-card-badge" >
                                {course.price}
                            </div>
                            <div className="oc-card-ribbon-wrapper">
                                <img src={hoarank} alt="" className="oc-ribbon-img" onError={(e) => e.target.style.display = 'none'} />
                                <span className="oc-ribbon-number">#{course.id}</span>
                            </div>
                            <div className="oc-card-content">
                                <p className="oc-card-author">{course.author}</p>
                                <h4 className="oc-card-title">{course.title}</h4>
                                <p className="oc-card-students">Student : {course.students}</p>
                                <div className="oc-card-footer">
                                    <span>Created on : {course.date}</span>
                                    <IconRightArrow />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="oc-pagination-container">
                    <div className="oc-pagination-right">
                        <button className="oc-page-nav" style={{ color: '#D8D8E5' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="oc-page-num">1</button>
                        <button className="oc-page-num active">2</button>
                        <button className="oc-page-num">3</button>
                        <button className="oc-page-num">4</button>
                        <button className="oc-page-num">5</button>
                        <span style={{margin: '0 4px', color: '#4B5675'}}>...</span>
                        <button className="oc-page-nav" style={{ color: '#78829D' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                {/* COURSE PREVIEW MODAL OVERLAY */}
                <div className={`oc-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                    <div className="oc-modal-drawer" onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div className="oc-modal-top-header">
                            <button className="oc-modal-back-btn" onClick={closeModal}>
                                <img src={hoagoback} alt="Back" />
                            </button>
                            <h2>Course Preview</h2>
                            <span className="oc-update-status" style={{ border: '1px solid #EEF1F6' }}>
                                <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                                Data updated every 1 hr
                                <span className="dot" style={{ background: '#17C653' }}></span>
                            </span>
                        </div>

                        {/* Modal Content Scroll Area */}
                        <div className="oc-modal-content-area">
                            
                            {/* Modal Stats Row */}
                            <div className="oc-modal-stats-row">
                                <div className="oc-mod-stat">
                                    <h3>+ 2.8K <span style={{fontSize: 10, color: '#A1A5B7'}}>USD <img src={hoausflag} style={{width: 10, borderRadius: '50%', margin: '0 2px'}} alt=""/> <img src={hoadowncaret} style={{width: 8}} alt=""/></span></h3>
                                    <p>Total Student</p>
                                </div>
                                <div className="oc-mod-stat">
                                    <h3>2,340,044 <span style={{fontSize: 10, color: '#A1A5B7'}}>RWF <img src={rwanda} style={{width: 10, borderRadius: '50%', margin: '0 2px'}} alt=""/> <img src={hoadowncaret} style={{width: 8}} alt=""/></span></h3>
                                    <p>Upload Amount</p>
                                </div>
                                <div className="oc-mod-stat">
                                    <h3>+ 2.8K <span style={{fontSize: 10, color: '#A1A5B7'}}>USD <img src={hoausflag} style={{width: 10, borderRadius: '50%', margin: '0 2px'}} alt=""/> <img src={hoadowncaret} style={{width: 8}} alt=""/></span></h3>
                                    <p>Courses Income</p>
                                </div>
                                <div className="oc-mod-stat" style={{ borderRight: 'none' }}>
                                    <h3>23 - March - 2026 <span style={{fontSize: 10, color: '#A1A5B7'}}>14:00:45</span></h3>
                                    <p>Date Uploaded</p>
                                </div>
                            </div>

                            {/* Modal Tabs Navigation */}
                            <div className="oc-modal-tabs">
                                <button className={`oc-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                                <button className={`oc-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
                                <button className={`oc-tab-btn ${activeTab === 'qa' ? 'active' : ''}`} onClick={() => setActiveTab('qa')}>Students Q&A</button>
                            </div>

                            {/* Modal Tab Content Area */}
                            <div className="oc-modal-tab-content">
                                
                                {/* ==== OVERVIEW TAB ==== */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <div className="oc-breadcrumbs">
                                            <span className="oc-bc-link">Online courses</span> / <span>Cyber security</span> /
                                        </div>

                                        <div className="oc-overview-header">
                                            <div className="oc-overview-title">
                                                <h2>Cyber Security</h2>
                                                <p>Prepared by <strong>Emmanuella Jean Marie Vianney</strong></p>
                                            </div>
                                            <div className="oc-overview-ribbon">
                                                29
                                            </div>
                                        </div>

                                        <h3 className="oc-overview-subtitle">Core Principles of Cybersecurity, Leadership and Oversight</h3>
                                        <p className="oc-overview-desc">
                                            Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making.
                                        </p>

                                        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" alt="Course Hero" className="oc-overview-hero-img" />

                                        <div className="oc-info-cards">
                                            <div className="oc-info-card">
                                                <div className="oc-ic-head">
                                                    <IconDuration />
                                                    <p>Duration</p>
                                                </div>
                                                <h4>4 weeks</h4>
                                            </div>
                                            <div className="oc-info-card">
                                                <div className="oc-ic-head">
                                                    <IconCalendar />
                                                    <p>Weekly study</p>
                                                </div>
                                                <h4>4 hours</h4>
                                            </div>
                                            <div className="oc-info-card">
                                                <div className="oc-ic-head">
                                                    <IconSkill />
                                                    <p>Skill Level</p>
                                                </div>
                                                <h4>Intermediate</h4>
                                            </div>
                                            <div className="oc-info-card" style={{ position: 'relative' }}>
                                                <div className="oc-discount-badge">-4% Off</div>
                                                <div className="oc-ic-head">
                                                    <IconWallet />
                                                    <p>subscription</p>
                                                </div>
                                                <h4><span style={{color: '#F8285A'}}>5$</span> Per month</h4>
                                            </div>
                                        </div>

                                        <h3 className="oc-section-title">Introduction</h3>
                                        <p className="oc-overview-desc" style={{ marginBottom: 32 }}>
                                            Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... <span className="oc-read-more">Read more</span>
                                        </p>

                                        <h3 className="oc-section-title">Course Breakdown</h3>
                                        <div className="oc-breakdown-list">
                                            <div className="oc-bd-item">
                                                <div className="oc-bd-week">Week 1</div>
                                                <div className="oc-bd-icon-col">
                                                    <div className="oc-bd-icon"><IconLightbulb /></div>
                                                    <div className="oc-bd-line"></div>
                                                </div>
                                                <div className="oc-bd-content">
                                                    <h4>Basic understanding and breakdowns</h4>
                                                    <p>Learn new skills, pursue your interests or advance your career with our short online courses.</p>
                                                </div>
                                            </div>
                                            <div className="oc-bd-item" style={{ marginBottom: 0 }}>
                                                <div className="oc-bd-week" style={{ background: 'transparent', color: '#071437', borderLeftColor: 'transparent' }}>
                                                    <div style={{ width: 32, height: 32, border: '1px solid #EEF1F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>1</div>
                                                </div>
                                                <div className="oc-bd-icon-col">
                                                    <div className="oc-bd-icon" style={{ borderColor: 'transparent', width: 4 }}></div>
                                                </div>
                                                <div className="oc-bd-content" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=100&auto=format&fit=crop" alt="thumb" style={{ width: 80, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                                                    <div>
                                                        <h4 style={{ margin: '0 0 4px 0' }}>Introduction to Entire Course</h4>
                                                        <p style={{ margin: 0, fontSize: 11, color: '#A1A5B7' }}>Video • 20 mins</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==== STUDENTS TAB ==== */}
                                {activeTab === 'students' && (
                                    <div>
                                        <div className="oc-breadcrumbs">
                                            <span className="oc-bc-link">Online courses</span> / <span>Students</span> /
                                        </div>

                                        <div className="oc-table-container">
                                            <table className="oc-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: 40 }}><div style={{ width: 14, height: 14, background: '#450468', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>-</div></th>
                                                        <th>Students Details (34) <img src={hoaupdowncaret} alt="" /></th>
                                                        <th>Course Type <img src={hoaupdowncaret} alt="" /></th>
                                                        <th>Tot. Amount & Visits <img src={hoaupdowncaret} alt="" /></th>
                                                        <th>Certificates & Avg. Score <img src={hoaupdowncaret} alt="" /></th>
                                                        <th>Charging Fee <img src={hoaupdowncaret} alt="" /></th>
                                                        <th>Status <img src={hoaupdowncaret} alt="" /></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentsData.map(student => (
                                                        <tr key={student.id}>
                                                            <td><input type="checkbox" /></td>
                                                            <td>
                                                                <div className="oc-user-meta">
                                                                    <h5>{student.name}</h5>
                                                                    <p>{student.country}</p>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="oc-user-meta">
                                                                    <h5>{student.type}</h5>
                                                                    <p>{student.duration}</p>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="oc-user-meta">
                                                                    <h5>{student.amount}</h5>
                                                                    <p>{student.visits}</p>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="oc-user-meta">
                                                                    <h5>{student.certs}</h5>
                                                                    <p>{student.score}</p>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="oc-user-meta">
                                                                    <h5 className={student.feeType === 'Free' ? 'oc-fee-free' : 'oc-fee-paid'}>{student.feeType}</h5>
                                                                    <p>{student.feeAmount}</p>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`oc-status-pill ${student.status.toLowerCase().replace(' ', '')}`}>
                                                                    {student.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Table Pagination */}
                                        <div className="oc-pagination-container">
                                            <div className="oc-pagination-right">
                                                <button className="oc-page-nav" style={{ color: '#D8D8E5' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                                </button>
                                                <button className="oc-page-num">1</button>
                                                <button className="oc-page-num active">2</button>
                                                <button className="oc-page-num">3</button>
                                                <button className="oc-page-num">4</button>
                                                <button className="oc-page-num">5</button>
                                                <span style={{margin: '0 4px', color: '#4B5675'}}>...</span>
                                                <button className="oc-page-nav" style={{ color: '#78829D' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ==== STUDENTS Q&A TAB ==== */}
                                {activeTab === 'qa' && (
                                    <div>
                                        <div className="oc-breadcrumbs">
                                            <span className="oc-bc-link">Online courses</span> / <span>Students Q&A</span> /
                                        </div>

                                        <div className="oc-qa-list">
                                            {qaData.map(qa => (
                                                <div key={qa.id} className="oc-qa-item">
                                                    <img src={qa.avatar} alt="Avatar" className="oc-qa-avatar" />
                                                    <div className="oc-qa-content">
                                                        <div className="oc-qa-header">
                                                            <h4>{qa.name}</h4>
                                                            <span>{qa.timeAgo}</span>
                                                        </div>
                                                        <div className="oc-qa-meta-row">
                                                            <div className="oc-qa-badge">{qa.week} <IconRightArrow /></div>
                                                            <span className="oc-qa-title">{qa.title}</span>
                                                        </div>
                                                        <p className="oc-qa-text">{qa.text} <span className="oc-read-more">Read more</span></p>
                                                        
                                                        <div className="oc-qa-footer">
                                                            <div className="oc-qa-replies">
                                                                <IconReply /> {qa.replies} View Replies
                                                            </div>
                                                            <span>Sent on {qa.date}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Q&A Pagination */}
                                        <div className="oc-pagination-container" style={{ borderTop: 'none', marginTop: 0 }}>
                                            <div className="oc-pagination-right">
                                                <button className="oc-page-nav" style={{ color: '#D8D8E5' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                                </button>
                                                <button className="oc-page-num">1</button>
                                                <button className="oc-page-num active">2</button>
                                                <button className="oc-page-num">3</button>
                                                <button className="oc-page-num">4</button>
                                                <button className="oc-page-num">5</button>
                                                <span style={{margin: '0 4px', color: '#4B5675'}}>...</span>
                                                <button className="oc-page-nav" style={{ color: '#78829D' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </button>
                                            </div>
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

export default HOAOnlineCourses;
