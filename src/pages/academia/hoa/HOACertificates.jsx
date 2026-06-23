import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-certificates.css';

// Reusing standard project icons
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import certificateimage from '../../../assets/imgs/certificateimage.jpeg';
import hoarank from '../../../assets/icons/hoarank.png';

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

const HOACertificates = () => {
    // Top-level state
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    // Dummy data for certificates grid
    const certificatesData = Array(9).fill(null).map((_, idx) => ({
        id: idx + 1,
        name: idx % 2 === 0 ? 'Alexis Aime Ndambayaje jr' : 'John Doe',
        score: '98.1%',
        chapters: 20,
        courseName: 'Web Development',
        status: 'Passed',
        date: 'Jan 20, 2026'
    }));

    return (
        <HOALayout currentPage="certificates">
            <div className="hoace-certificates-page">
                
                {/* Page Header */}
                <div className="hoace-page-header">
                    <h1>Certificates</h1>
                    <div className="hoace-header-actions">
                        <span className="hoace-update-status">
                            <img src={hoarefresh} alt="Refresh" className="hoace-sync-icon" />
                            Data updated every 5min
                            <span className="hoace-dot"></span>
                        </span>
                        <button className="hoace-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
            <div className="hoace-stats-top-container">
                <div className="hoace-stats-container">
                    <div className="hoace-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Courses</p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>13.3M</h3>
                        <p>Total Learners</p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>204</h3>
                        <p>Avg. Learning Time</p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>
                            19.3M
                            <span className="hoace-currency-dropdown">
                                RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Upload Payments <span className="hoace-trend down">↘ -4.5%</span></p>
                    </div>
                    <div className="hoace-stat-block">
                        <h3>
                            843.5K
                            <span className="hoace-currency-dropdown">
                                RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                            </span>
                        </h3>
                        <p>Course Payments <span className="hoace-trend up">↗ +4.1</span></p>
                    </div>
                </div>
            </div>

                {/* Sub Header & Actions */}
                <div className="hoace-sub-header">
                    <div className="hoace-sub-title">
                        <h2>Certificates</h2>
                        <p>3,461 Rewards</p>
                    </div>
                    <div className="hoace-add-actions">
                        <button className="hoace-btn-primary">
                            <img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Manual Certificate
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="hoace-filters-row">
                    <div className="hoace-filter-container">
                        <div className="hoace-dropdown-trigger" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <IconFilterLines style={{ opacity: 0.5 }} /> {selectedCategory}
                            </span>
                            <IconDownCaret width={14} height={8} style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isCategoryOpen && (
                            <div className="hoace-dropdown-menu">
                                {['All Categories', 'Web Development', 'Design', 'Marketing'].map(opt => (
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
                        <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                        <input type="text" placeholder="Search any Certificates..." />
                    </div>

                    <div className="hoace-date-filter">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <IconCalendar /> Today
                        </span>
                        <IconDownCaret width={12} height={8} style={{ color: '#6B7280' }} />
                    </div>
                </div>

                {/* Certificates Grid */}
                <div className="hoace-grid">
                    {certificatesData.map(cert => (
                        <div key={cert.id} className="hoace-card">
                            
                            {/* Certificate Graphic Representation */}
                            <div className="hoace-cert-graphic" style={{ backgroundImage: `url(${certificateimage})` }}>
                                <div className="hoace-cert-ribbon-wrapper">
                                    <img src={hoarank} alt="" className="hoace-ribbon-img" onError={(e) => e.target.style.display = 'none'} />
                                    <span className="hoace-ribbon-number">{cert.score}</span>
                                </div>
                                <div className="hoace-cert-content">
                                    <p>Proudly presented to</p>
                                    <h4>Dear, {cert.name}</h4>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="hoace-card-body">
                                <div className="hoace-card-row">
                                    <span className="hoace-text-meta"><strong>{cert.chapters}</strong> of {cert.chapters} Chapter</span>
                                    <button className="hoace-download-btn"><IconDownload /> Download</button>
                                </div>
                                <div className="hoace-card-row hoace-mt-12">
                                    <h3 className="hoace-course-title">{cert.courseName}</h3>
                                    <span className="hoace-status-passed">{cert.status}</span>
                                </div>
                                <div className="hoace-card-row hoace-mt-8">
                                    <span className="hoace-text-date">Completed On <strong style={{ color: '#071437' }}>{cert.date}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="hoace-pagination-container">
                    <button className="hoace-page-nav" style={{ color: '#D8D8E5' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button className="hoace-page-num">1</button>
                    <button className="hoace-page-num active">2</button>
                    <button className="hoace-page-num">3</button>
                    <button className="hoace-page-num">4</button>
                    <button className="hoace-page-num">5</button>
                    <span style={{ margin: '0 4px', color: '#4B5675' }}>...</span>
                    <button className="hoace-page-nav" style={{ color: '#78829D' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOACertificates;