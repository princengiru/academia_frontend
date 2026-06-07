import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-assignments.css';
import './hoa-reports.css';

// Reusing Icons matching the provided design structure
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';

const HOAAssignments = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
    const [pageSize, setPageSize] = useState('10');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const pageSizeOptions = ['5', '10', '25'];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All Status');

    const clearSelectedRows = () => setSelectedRows([]);

    // Mock Data: Table Rows based on the image provided
    const assignmentsData = [
        {
            id: 1,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '1 day ago',
            type: 'Assessment',
            attempts: '231',
            avgScore: '34.67',
            timeLimit: '90 Min',
            certificates: '21',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 2,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '14 hours ago',
            type: 'Assessment',
            attempts: '23',
            avgScore: '35.45',
            timeLimit: '90 Min',
            certificates: '12',
            status: 'Not Published',
            statusColor: 'failed'
        },
        {
            id: 3,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '---',
            avgScore: '---',
            timeLimit: '90 Min',
            certificates: '---',
            status: 'In Review',
            statusColor: 'progress'
        },
        {
            id: 4,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '123',
            avgScore: '19.52',
            timeLimit: '90 Min',
            certificates: '1',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 5,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '4',
            avgScore: '67.43',
            timeLimit: '90 Min',
            certificates: '1',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 6,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '331',
            avgScore: '67.43',
            timeLimit: '90 Min',
            certificates: '33',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 7,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '4',
            avgScore: '67.43',
            timeLimit: '90 Min',
            certificates: '3',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 8,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '4',
            avgScore: '67.43',
            timeLimit: '90 Min',
            certificates: '4',
            status: 'Uploaded',
            statusColor: 'completed'
        },
        {
            id: 9,
            title: 'Javascript Fundamental Quiz',
            timeAgo: '12 Jan 2024',
            type: 'Assessment',
            attempts: '4',
            avgScore: '67.43',
            timeLimit: '90 Min',
            certificates: '3',
            status: 'Uploaded',
            statusColor: 'completed'
        }
    ];

    const toggleRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
        );
    };

    const getSortedData = (data, config) => {
        if (!config.key) return data;
        return [...data].sort((a, b) => {
            let aVal = a[config.key];
            let bVal = b[config.key];
            if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        setSortConfig({ key, direction });
    };

    return (
        <HOALayout currentPage="assignments">
            <div className="hoa-assignments-page hoa-reports-page">

                {/* Page Header */}
                <div className="hoa-page-header">
                    <h1>Assignments</h1>
                    <div className="hoa-header-actions">
                        <span className="hoa-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Data updated every 5min
                            <span className="dot"></span>
                        </span>
                        <button className="hoa-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="assn-stats-row">
                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-gray">
                            {/* Mocking the icon shown in design */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        </div>
                        <div className="assn-stat-info">
                            <h3>21</h3>
                            <p>Summative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-gray">
                            {/* Mocking the icon shown in design */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"></path><path d="M19 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>
                        </div>
                        <div className="assn-stat-info">
                            <h3>21</h3>
                            <p>Formative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-green">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#17C653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div className="assn-stat-info">
                            <h3>+ 2.8K</h3>
                            <p>Passed Students</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-orange">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F6B100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline></svg>
                        </div>
                        <div className="assn-stat-info">
                            <h3>157</h3>
                            <p>Retakes Taken</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-red">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F8285A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </div>
                        <div className="assn-stat-info">
                            <h3>1.8K</h3>
                            <p>Failed Students</p>
                        </div>
                    </div>
                </div>

                {/* Table Area Header */}
                <div className="rep-table-header-area">
                    <div className="rep-table-title">
                        <h2>Assignments</h2>
                        <p>3,461 Tests & Exams</p>
                    </div>
                    <div className="rep-table-actions">
                        <div className="rep-search-box">
                            <img src={hoasearch} alt="Search" className="search-icon" />
                            <div className="search-divider"></div>
                            <input type="text" placeholder="Search Lessons..." />
                        </div>
                        <div className="rep-filter-dropdown-container" style={{ position: 'relative' }}>
                            <button className="rep-btn-filters" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                                <img src={hoafilter} alt="Filter" style={{ width: 14 }} /> {selectedFilter === 'All Status' ? 'Filters' : selectedFilter}
                            </button>
                            {isFilterOpen && (
                                <div className="learners-performance-period-menu" style={{ position: 'absolute', background: '#FFF', top: '100%', right: 0, marginTop: '8px', zIndex: 10 }}>
                                    <div className={`dropdown-item ${selectedFilter === 'All Status' ? 'active' : ''}`} onClick={() => { setSelectedFilter('All Status'); setIsFilterOpen(false); }}>All Status</div>
                                    <div className={`dropdown-item ${selectedFilter === 'Uploaded' ? 'active' : ''}`} onClick={() => { setSelectedFilter('Uploaded'); setIsFilterOpen(false); }}>Uploaded</div>
                                    <div className={`dropdown-item ${selectedFilter === 'In Review' ? 'active' : ''}`} onClick={() => { setSelectedFilter('In Review'); setIsFilterOpen(false); }}>In Review</div>
                                    <div className={`dropdown-item ${selectedFilter === 'Not Published' ? 'active' : ''}`} onClick={() => { setSelectedFilter('Not Published'); setIsFilterOpen(false); }}>Not Published</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
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
                                    <div className="th-inner" onClick={() => handleSort('title')}>Assignment Details (23) <span className={`sort-icon ${sortConfig.key === 'title' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
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
                            {getSortedData(assignmentsData, sortConfig).map((row) => (
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
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="rep-action-btn">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Section */}
                <div className="hoa-pagination-container list-pagination">
                    <div className="pagination-left">
                        Show
                        <div className="page-size-dropdown mx-8">
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
                        <span className="page-range">1-{pageSize} of 5</span>
                        <button className="page-nav"><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" /></button>
                        <button className="page-num">1</button>
                        <button className="page-num active">2</button>
                        <button className="page-num">3</button>
                        <button className="page-nav"><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" /></button>
                    </div>
                </div>

            </div>
        </HOALayout>
    );
};

export default HOAAssignments;