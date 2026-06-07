import React, { useState, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-failed-courses.css';
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
import hoasummative from '../../../assets/icons/hoasummative.svg';
import hoaformative from '../../../assets/icons/hoaformative.svg';
import hoapassedstudents from '../../../assets/icons/hoapassedstudents.svg';
import hoafailedstudents from '../../../assets/icons/hoafailedstudents.svg';
import hoaretakes from '../../../assets/icons/hoaretakes.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';

const HOAFailedCourses = () => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'studentName', direction: 'asc' });
    const [pageSize, setPageSize] = useState('5');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const pageSizeOptions = ['5', '10', '25'];
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('All Status');
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    const clearSelectedRows = () => setSelectedRows([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.rep-action-dropdown-menu') && !event.target.closest('.rep-action-btn')) {
                setActiveActionMenu(null);
            }
            if (!event.target.closest('.rep-filter-dropdown-container') && !event.target.closest('.rep-btn-filters')) {
                setIsFilterOpen(false);
            }
            if (!event.target.closest('.page-size-menu') && !event.target.closest('.page-size-button')) {
                setIsPageSizeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock Data based on the Failed Courses Image
    const failedCoursesData = [
        {
            id: 1,
            studentName: 'Alexis Ndayamabje Froduard', location: 'Rwanda', flag: rwanda,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Formative Assessment', assessmentMeta: '4 Questions',
            attempts: '231', avgScore: '34.67', timeLimit: '90 Min'
        },
        {
            id: 2,
            studentName: 'Nagy Tímea', location: 'Russia', flag: rwanda, // Mock flag 
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '23', avgScore: '35.45', timeLimit: '90 Min'
        },
        {
            id: 3,
            studentName: 'Illés Éva', location: 'America', flag: hoausflag,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Formative Assessment', assessmentMeta: '4 Questions',
            attempts: '---', avgScore: '---', timeLimit: '90 Min'
        },
        {
            id: 4,
            studentName: 'Halász Emese', location: 'Burundi', flag: rwanda, // Mock flag
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '123', avgScore: '19.52', timeLimit: '90 Min'
        },
        {
            id: 5,
            studentName: 'Soós Annamária', location: 'Rwanda', flag: rwanda,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '4', avgScore: '67.43', timeLimit: '90 Min'
        },
        {
            id: 6,
            studentName: 'Varga Dóra', location: 'Rwanda', flag: rwanda,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '4', avgScore: '67.43', timeLimit: '90 Min'
        },
        {
            id: 7,
            studentName: 'Hajdú Dominika', location: 'Rwanda', flag: rwanda,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Formative Assessment', assessmentMeta: '4 Questions',
            attempts: '331', avgScore: '67.43', timeLimit: '90 Min'
        },
        {
            id: 8,
            studentName: 'Kiss Dorka', location: 'Rwanda', flag: rwanda,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Formative Assessment', assessmentMeta: '4 Questions',
            attempts: '4', avgScore: '67.43', timeLimit: '90 Min'
        },
        {
            id: 9,
            studentName: 'Virág Mercédesz', location: 'Mexico', flag: rwanda, // Mock flag
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '4', avgScore: '67.43', timeLimit: '90 Min'
        },
        {
            id: 10,
            studentName: 'László Cintia', location: 'America', flag: hoausflag,
            courseName: 'Javascript Fundamental Quiz',
            assessmentType: 'Summative Assessment', assessmentMeta: '23 Question',
            attempts: '4', avgScore: '67.43', timeLimit: '90 Min'
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

            if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
            if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

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
        <HOALayout currentPage="failed-courses">
            <div className="hoa-failed-courses-page hoa-assignments-page hoa-reports-page">

                {/* Page Header */}
                <div className="hoa-page-header">
                    <h1>Failed Courses</h1>
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
                            <img src={hoasummative} alt="Summative" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>21</h3>
                            <p>Summative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-gray">
                            <img src={hoaformative} alt="Formative" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>21</h3>
                            <p>Formative Assessment</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-green">
                            <img src={hoapassedstudents} alt="Passed" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>+ 2.8K</h3>
                            <p>Passed Students</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-orange">
                            <img src={hoaretakes} alt="Retakes" />
                        </div>
                        <div className="assn-stat-info">
                            <h3>157</h3>
                            <p>Retakes Taken</p>
                        </div>
                    </div>

                    <div className="assn-stat-card">
                        <div className="assn-stat-icon assn-icon-red">
                            <img src={hoafailedstudents} alt="Failed" />
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
                        <h2>Failed Courses</h2>
                        <p>3,461 Courses</p>
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
                                    <div className={`dropdown-item ${selectedFilter === 'All Status' ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }} onClick={() => { setSelectedFilter('All Status'); setIsFilterOpen(false); }}>All Status</div>
                                    <div className={`dropdown-item ${selectedFilter === 'Formative' ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }} onClick={() => { setSelectedFilter('Formative'); setIsFilterOpen(false); }}>Formative</div>
                                    <div className={`dropdown-item ${selectedFilter === 'Summative' ? 'active' : ''}`} style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer' }} onClick={() => { setSelectedFilter('Summative'); setIsFilterOpen(false); }}>Summative</div>
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
                                    <div className="th-inner" onClick={() => handleSort('studentName')}>Student Name (34) <span className={`sort-icon ${sortConfig.key === 'studentName' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th>
                                    <div className="th-inner" onClick={() => handleSort('courseName')}>Course Name (23) <span className={`sort-icon ${sortConfig.key === 'courseName' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div>
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
                                    <div className="th-inner" style={{ justifyContent: 'center' }}>Certificates <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div>
                                </th>
                                <th style={{ width: '40px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedData(failedCoursesData, sortConfig).map((row) => (
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
                                        <button className="rep-btn-failed">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Failed
                                        </button>
                                    </td>
                                    <td style={{ textAlign: 'center', position: 'relative' }}>
                                        <button className="rep-action-btn" onClick={() => setActiveActionMenu(activeActionMenu === row.id ? null : row.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                                        </button>
                                        {activeActionMenu === row.id && (
                                            <div className="rep-action-dropdown-menu">
                                                <div className="dropdown-item" onClick={() => setActiveActionMenu(null)}>View Details</div>
                                                <div className="dropdown-item" onClick={() => setActiveActionMenu(null)}>Contact Student</div>
                                                <div className="dropdown-item" onClick={() => setActiveActionMenu(null)} style={{ color: '#F8285A' }}>Remove Record</div>
                                            </div>
                                        )}
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

export default HOAFailedCourses;