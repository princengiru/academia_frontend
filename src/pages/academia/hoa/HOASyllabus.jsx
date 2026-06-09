import React, { useState, useRef, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-syllabus.css';

// Reusing general icons based on standard project structure
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoaviewpaper from '../../../assets/icons/hoaviewpaper.svg';

// Custom inline SVGs for specific icons needed in this design
const IconFollowers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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

const IconUserBust = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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

const HOASyllabus = () => {
    // State to manage drill-down: 1 = Topics Grid, 2 = Papers List, 3 = Paper Detail
    const [currentView, setCurrentView] = useState(1);

    // Sidebar state
    const [expandedCategories, setExpandedCategories] = useState(['math']);
    const [selectedSubCat, setSelectedSubCat] = useState('algebra');
    const [fullyExpandedCats, setFullyExpandedCats] = useState([]);
    const [isCourseFilterOpen, setIsCourseFilterOpen] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');
    
    // Pagination state
    const [pageSize, setPageSize] = useState('10');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const pageSizeOptions = ['5', '10', '20'];

    const pageSizeRef = useRef(null);

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

    // Data mocks based exactly on images
    const mathSubcats = [
        { id: 'algebra', name: 'Algebra', count: '410' },
        { id: 'calculus', name: 'Calculus', count: '12' },
        { id: 'comp_math', name: 'Computational Math', count: '2,899' },
        { id: 'app_math', name: 'Applied Math', count: '23' },
        { id: 'func_analysis', name: 'Functional analysis', count: '567' },
        { id: 'geometry', name: 'Geometry', count: '1,099' },
        { id: 'topology', name: 'Topology', count: '45' },
        { id: 'number_theory', name: 'Number Theory', count: '120' },
        { id: 'statistics', name: 'Statistics', count: '300' },
        { id: 'discrete_math', name: 'Discrete Math', count: '150' }
    ];

    const historySubcats = [
        { id: 'ancient_hist', name: 'Ancient History', count: '145' },
        { id: 'modern_hist', name: 'Modern History', count: '210' },
        { id: 'world_wars', name: 'World Wars', count: '89' }
    ];

    const engineeringSubcats = [
        { id: 'civil_eng', name: 'Civil Engineering', count: '320' },
        { id: 'mech_eng', name: 'Mechanical Engineering', count: '180' },
        { id: 'elec_eng', name: 'Electrical Eng.', count: '450' }
    ];

    const economicsSubcats = [
        { id: 'microecon', name: 'Microeconomics', count: '210' },
        { id: 'macroecon', name: 'Macroeconomics', count: '175' }
    ];

    const psychologySubcats = [
        { id: 'cognitive_psy', name: 'Cognitive Psychology', count: '90' },
        { id: 'clinical_psy', name: 'Clinical Psychology', count: '120' }
    ];

    const dataSubcats = [
        { id: 'machine_learning', name: 'Machine Learning', count: '890' },
        { id: 'data_viz', name: 'Data Visualization', count: '420' },
        { id: 'big_data', name: 'Big Data Analytics', count: '550' }
    ];

    const itSubcats = [
        { id: 'web_dev', name: 'Web Development', count: '1,200' },
        { id: 'mobile_dev', name: 'Mobile Development', count: '850' },
        { id: 'cyber_sec', name: 'Cybersecurity', count: '630' }
    ];

    const cloudSubcats = [
        { id: 'aws', name: 'AWS Architecture', count: '410' },
        { id: 'azure', name: 'Azure Fundamentals', count: '230' }
    ];

    const cyberSubcats = [
        { id: 'ethical_hack', name: 'Ethical Hacking', count: '150' },
        { id: 'net_sec', name: 'Network Security', count: '95' }
    ];

    const sidebarCategories = [
        { id: 'math', name: 'Mathematics & Science', subcats: mathSubcats },
        { id: 'history', name: 'History', subcats: historySubcats },
        { id: 'engineering', name: 'Engineering', subcats: engineeringSubcats },
        { id: 'economics', name: 'Economics', subcats: economicsSubcats },
        { id: 'psychology', name: 'Psychology', subcats: psychologySubcats },
        { id: 'data', name: 'Data Science', subcats: dataSubcats },
        { id: 'it1', name: 'IT & Software development', subcats: itSubcats },
        { id: 'cloud', name: 'Cloud Computing', subcats: cloudSubcats },
        { id: 'cyber', name: 'Cybersecurity', subcats: cyberSubcats }
    ];

    const gridTopics = Array(9).fill({
        title: 'Linear Algebra',
        meta: '14 Papers | 11 Followers'
    });

    const listPapers = [
        { id: 1, title: 'An Operadic Approach to Internal Structures', author: 'Dr. Xavier KABARANGA', type: 'Paid' },
        { id: 2, title: 'On bornological semi-abelian algebras', author: 'Dr. Xavier KABARANGA', type: 'Free' },
        { id: 3, title: 'A Universal Investigation of n-representations of n-quivers', author: 'Dr. Xavier KABARANGA', type: 'Paid' },
    ];

    // Sub-renders for the 3 distinct views to keep main return clean
    const renderView1Grid = () => (
        <>
            <div className="syll-view-title-row">
                <h2>Algebra</h2>
                <div className="syll-followers-info">
                    <span className="syll-followers-count"><IconUserBust /> 12.7K Followers</span>
                    <button className="syll-btn-purple-dark">View Followers <IconEye width={14} height={14} color="#fff" /></button>
                </div>
            </div>
            <p className="syll-desc-text">
                Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
            </p>

            <div className="syll-topics-grid">
                {gridTopics.map((topic, idx) => (
                    <div key={idx} className="syll-topic-card">
                        <div className="syll-tc-left">
                            <h4 onClick={() => setCurrentView(2)}>{topic.title}</h4>
                            <p>{topic.meta}</p>
                        </div>
                        <button className="syll-btn-view" onClick={() => setCurrentView(2)}>
                            <IconEye width={14} height={14} color="#99A1B7" /> View Topics
                        </button>
                    </div>
                ))}
            </div>

            <div className="hoa-pagination-container list-pagination">
                <div className="pagination-left">
                    Show
                    <div className="page-size-dropdown mx-8" style={{ margin: '0 8px' }} ref={pageSizeRef}>
                        <button 
                            type="button" 
                            className="page-size-button px-8-py-2"
                            onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                        >
                            {pageSize} <img src={hoadowncaret} alt="" style={{ transform: isPageSizeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                    <span className="page-range">1-{pageSize} of 5</span>
                    <button className="page-nav"><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" /></button>
                    <button className="page-num">1</button>
                    <button className="page-num active">2</button>
                    <button className="page-num">3</button>
                    <button className="page-nav"><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" /></button>
                </div>
            </div>
        </>
    );

    const renderView2List = () => (
        <>
            <div className="syll-view-title-row">
                <h2>Linear Algebra</h2>
                <div className="syll-followers-info">
                    <span className="syll-followers-count"><IconUserBust /> 12.7K Followers</span>
                    <button className="syll-btn-purple-dark">View Followers <IconEye width={14} height={14} color="#fff" /></button>
                </div>
            </div>
            <p className="syll-desc-text">
                Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
            </p>

            <h3 className="syll-list-subtitle">Key research themes</h3>

            <div className="syll-papers-list">
                {listPapers.map((paper) => (
                    <div key={paper.id} className="syll-paper-item">
                        <div className="syll-pi-left">
                            <h4 onClick={() => setCurrentView(3)}>{paper.title}</h4>
                            <p className="author">By {paper.author}</p>
                            <p className="preview">
                                Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... <a href="#" className="syll-read-more" onClick={(e) => { e.preventDefault(); setCurrentView(3); }}>Read more</a>
                            </p>
                        </div>
                        <div className="syll-pi-right">
                            <button className="syll-btn-view" onClick={() => setCurrentView(3)}>
                                <img src={hoaviewpaper} alt="View Paper" /> View Paper
                            </button>
                            <span className={paper.type === 'Paid' ? 'syll-badge-paid' : 'syll-badge-free'}>
                                {paper.type} <IconExternalLink />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hoa-pagination-container list-pagination">
                <div className="pagination-left">
                    Show
                    <div className="page-size-dropdown mx-8" style={{ margin: '0 8px' }} ref={pageSizeRef}>
                        <button 
                            type="button" 
                            className="page-size-button px-8-py-2"
                            onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                        >
                            {pageSize} <img src={hoadowncaret} alt="" style={{ transform: isPageSizeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                    <span className="page-range">1-{pageSize} of 5</span>
                    <button className="page-nav"><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" /></button>
                    <button className="page-num">1</button>
                    <button className="page-num active">2</button>
                    <button className="page-num">3</button>
                    <button className="page-nav"><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" /></button>
                </div>
            </div>
        </>
    );

    const renderView3Detail = () => (
        <>
            <div className="syll-detail-header">
                <h2>On bornological semi-abelian algebras</h2>
                <span className="syll-badge-paid">Paid <IconExternalLink /></span>
            </div>

            <div className="syll-author-row">
                <div className="syll-author-info">
                    <img src="/assets/imgs/default-profile.png" alt="Author" className="syll-author-avatar" />
                    <span className="syll-author-name">By Dr. Xavier KABARANGA</span>
                </div>
                <div className="syll-downloads-info">
                    <IconDownloadCloud /> 234.5K Downloads
                </div>
            </div>

            <div className="syll-section-block">
                <h3>Abstract</h3>
                <p>
                    Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
                </p>
            </div>

            <div className="syll-accordion-header">
                <h3>Outline</h3>
                <img src={hoadowncaret} alt="" style={{ opacity: 0.5 }} />
            </div>

            <div className="syll-rating-footer">
                <div className="syll-rating-left">
                    <h4>Rating</h4>
                    <p>2,482 Ratings</p>
                </div>
                <div className="syll-rating-right">
                    <span className="syll-rating-score">4.8</span>
                    <div className="syll-stars">
                        <IconStar /><IconStar /><IconStar /><IconStar /><IconStar />
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <HOALayout currentPage="syllabus">
            <div className="hoa-syllabus-page">

                {/* Page Header */}
                <div className="syll-page-header">
                    <h1>Syllabus</h1>
                    <div className="syll-header-actions">
                        <span className="syll-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Data updated every 5min
                            <span className="dot"></span>
                        </span>
                        <button className="syll-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats - Single Card Wrapper */}
                <div className="syll-stats-container">
                    <div className="syll-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Syllabus</p>
                    </div>
                    <div className="syll-stat-block">
                        <h3>13.3M</h3>
                        <p>Syllabus Downloads</p>
                    </div>
                    <div className="syll-stat-block">
                        <h3>204</h3>
                        <p>Avg. Read time</p>
                    </div>
                    <div className="syll-stat-block">
                        <h3>
                            19.3M
                            <span className="syll-currency-dropdown">
                                RWF <img src="/assets/icons/rwanda.svg" alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Upload Payments <span className="syll-trend down">↘ -4.5%</span></p>
                    </div>
                    <div className="syll-stat-block">
                        <h3>
                            843.5K
                            <span className="syll-currency-dropdown">
                                RWF <img src="/assets/icons/rwanda.svg" alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Download Amount <span className="syll-trend up">↗ +4.1</span></p>
                    </div>
                </div>

                {/* Sub Header & Add Buttons */}
                <div className="syll-sub-header">
                    <div className="syll-sub-title">
                        <h2>Syllabus</h2>
                        <p>3,461 Past Papers</p>
                    </div>
                    <div className="syll-add-actions">
                        <button className="syll-btn-outline"><img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Syllabus</button>
                        <button className="syll-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Category</button>
                    </div>
                </div>

                {/* Two Column Layout */}
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
                            {sidebarCategories.map((cat, idx) => (
                                <div key={idx}>
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

                                    {expandedCategories.includes(cat.id) && cat.subcats && (
                                        <div className="syll-subcat-list">
                                            {(fullyExpandedCats.includes(cat.id) ? cat.subcats : cat.subcats.slice(0, 6)).map((sub, sidx) => (
                                                <div
                                                    key={sidx}
                                                    className={`syll-subcat-item ${selectedSubCat === sub.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedSubCat(sub.id)}
                                                >
                                                    <div className="syll-radio-label">
                                                        <div className="syll-radio-circle"></div>
                                                        {sub.name}
                                                    </div>
                                                    <span className="syll-count-badge">{sub.count}</span>
                                                </div>
                                            ))}
                                            {cat.subcats.length > 6 && (
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
                        {/* Area Header */}
                        <div className="syll-main-header-wrapper">
                            <div className="syll-main-header-bar">
                                <div className="syll-search-bar">
                                    <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                                    <input type="text" placeholder="Search any Courses..." />
                                </div>
                                <div className="syll-header-actions">
                                    <div className="syll-type-toggles">
                                        {['All', 'Free', 'Paid'].map(filter => (
                                            <button
                                                key={filter}
                                                className={`syll-type-btn ${activeFilter === filter ? 'active' : ''}`}
                                                onClick={() => setActiveFilter(filter)}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="syll-v-divider"></div>
                                    <button className="syll-btn-filter-pill">
                                        <IconFilterSliders /> Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Body Content */}
                        <div className="syll-content-body">

                            {/* Dynamic Breadcrumbs */}
                            <div className="syll-breadcrumbs">
                                <button className="syll-back-btn" onClick={() => setCurrentView(Math.max(1, currentView - 1))}>
                                    <IconLeftCaret width={10} height={16} strokeWidth={2.5} />
                                </button>
                                <span className={`syll-bc-link ${currentView === 1 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(1)}>Mathematics & Science</span> 
                                <span style={{color: '#E4E6EF'}}>/</span>
                                <span className={`syll-bc-link ${currentView === 2 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(1)}>Algebra</span> 
                                <span style={{color: '#E4E6EF'}}>/</span>
                                {currentView >= 2 && (
                                    <> <span className={`syll-bc-link ${currentView === 3 ? 'syll-bc-active' : ''}`} onClick={() => setCurrentView(2)}>Linear Algebra</span> <span style={{color: '#E4E6EF'}}>/</span></>
                                )}
                            </div>

                            {currentView === 1 && renderView1Grid()}
                            {currentView === 2 && renderView2List()}
                            {currentView === 3 && renderView3Detail()}

                        </div>
                    </div>

                </div>
            </div>
        </HOALayout>
    );
};

export default HOASyllabus;