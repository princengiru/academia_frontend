import React, { useEffect, useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-events-planning.css';
import './hoa-reports.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';

const IconCheck = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const IconX = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const IconMoreHorizontal = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const IconChevronLeft = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const IconChevronRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const getStatusColor = (status) => {
    if (status === 'Confirmed') return 'completed';
    if (status === 'Canceled') return 'failed';
    return 'progress';
};

const HOAEventsPlanning = () => {
    const [activeTab, setActiveTab] = useState('scheduling');
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'eventName', direction: 'asc' });
    const [pageSize, setPageSize] = useState('5');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const pageSizeOptions = ['5', '10', '25'];

    const scheduledEvents = [
        { id: 1, day: 2, top: 160, height: 160, title: 'Math Exam', time: '08:00 AM - 10:00 AM', status: 'Confirmed', color: 'yellow', attendees: '+4' },
        { id: 2, day: 2, top: 480, height: 80, title: 'Math Explanation', time: '12:00 PM - 01:00 PM', status: 'Confirmed', color: 'blue', attendees: null, subtitle: 'All Students' },
        { id: 3, day: 3, top: 240, height: 120, title: 'Math Explanation', time: '09:00 AM - 10:30 AM', status: 'In Review', color: 'gray', attendees: '+4', subtitle: 'All Students' },
        { id: 4, day: 5, top: 80, height: 120, title: 'Math Explanation', time: '07:00 AM - 08:30 AM', status: 'In Review', color: 'purple', attendees: '+4' },
        { id: 5, day: 5, top: 640, height: 120, title: 'Math Explanation', time: '14:00 PM - 15:30 PM', status: 'In Review', color: 'purple', attendees: '+4' },
        { id: 6, day: 6, top: 320, height: 120, title: 'Math Explanation', time: '10:00 AM - 11:30 AM', status: 'Confirmed', color: 'green', attendees: '+4', subtitle: 'All Students' },
        { id: 7, day: 6, top: 440, height: 120, title: 'Math Explanation', time: '11:30 AM - 01:00 PM', status: 'Canceled', color: 'red', attendees: '+4' },
    ];

    const logsData = Array(8).fill(null).map((_, idx) => ({
        id: idx + 1,
        eventName: 'Math Explanations',
        eventTime: idx === 0 ? '1 day ago' : idx === 1 ? '14 hours ago' : '12 Jan 2024',
        coordinator: idx === 0 ? 'Ndayamabje Froduard' : idx === 1 ? 'Aime' : idx === 2 ? 'Anna' : 'Dominika',
        role: idx === 0 ? 'Tutor' : idx === 1 ? 'Design' : 'Tutor',
        timeRange: idx === 2 ? '---' : '08:00 AM - 10:00 AM',
        students: idx === 2 ? '---' : idx === 1 ? '345' : idx === 0 ? '45' : '23',
        duration: idx === 2 ? '1 Hours 13 Min' : idx === 1 ? '1 Hours 0 Min' : '2 Hours 24 Min',
        status: idx === 1 ? 'Canceled' : idx === 2 ? 'In Review' : 'Confirmed',
    }));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.rep-action-dropdown-menu') && !event.target.closest('.rep-action-btn')) {
                setActiveActionMenu(null);
            }
            if (!event.target.closest('.page-size-menu') && !event.target.closest('.page-size-button')) {
                setIsPageSizeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const clearSelectedRows = () => setSelectedRows([]);

    const toggleRow = (id) => {
        setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedLogs = () => {
        const sorted = [...logsData];
        if (!sortConfig.key) return sorted;

        return sorted.sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    return (
        <HOALayout currentPage="events-planning" breadcrumb={{ section: 'Plannings', page: 'Overview' }}>
            <div className="hoae-page-wrapper hoa-reports-page">

                <div className="hoa-page-header">
                    <h1>Events & Planning</h1>
                    <div className="hoa-header-actions">
                        <span className="hoa-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Data updated every 5min
                            <span className="dot"></span>
                        </span>
                        <button type="button" className="hoa-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                <div className="hoae-stats-top-container">
                    <div className="hoae-stats-container">
                        <div className="hoae-stat-block">
                            <h3>13.3M</h3>
                            <p>Total Events</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>131</h3>
                            <p>Approved Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>204</h3>
                            <p>Failed Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>34</h3>
                            <p>Pending Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>343</h3>
                            <p>Tot. Attendees</p>
                        </div>
                    </div>
                </div>

                <div className="hoae-center-tabs-wrapper">
                    <div className="hoae-tabs-row">
                        <button
                            type="button"
                            className={`hoae-tab-btn ${activeTab === 'scheduling' ? 'active' : ''}`}
                            onClick={() => setActiveTab('scheduling')}
                        >
                            Event Scheduling
                        </button>
                        <button
                            type="button"
                            className={`hoae-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('logs')}
                        >
                            Events Logs
                        </button>
                    </div>
                </div>

                {activeTab === 'scheduling' && (
                    <div className="hoae-tab-content fade-in">
                        <div className="hoae-sub-header">
                            <div className="hoae-sub-title">
                                <h2>Schedule</h2>
                                <p>3,461 Events</p>
                            </div>
                            <div className="hoae-date-navigator">
                                <button type="button" className="hoae-icon-btn-outline" aria-label="Previous week">
                                    <IconChevronLeft />
                                </button>
                                <span className="hoae-date-range">01 - 07 January</span>
                                <button type="button" className="hoae-icon-btn-outline" aria-label="Next week">
                                    <IconChevronRight />
                                </button>
                            </div>
                            <div className="hoae-add-actions">
                                <button type="button" className="hoae-btn-outline">
                                    <img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Event
                                </button>
                            </div>
                        </div>

                        <div className="hoae-calendar-wrapper">
                            <div className="hoae-cal-header">
                                <div className="hoae-cal-th hoae-time-col">Hour</div>
                                <div className="hoae-cal-th">1- Mon</div>
                                <div className="hoae-cal-th active">2- Tue</div>
                                <div className="hoae-cal-th">3- Wed</div>
                                <div className="hoae-cal-th">4- Thu</div>
                                <div className="hoae-cal-th">5- Fri</div>
                                <div className="hoae-cal-th">6- Sat</div>
                                <div className="hoae-cal-th">7- Sun</div>
                            </div>
                            <div className="hoae-cal-body">
                                <div className="hoae-cal-times">
                                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((hour) => (
                                        <div key={hour} className="hoae-time-slot">{hour}:00</div>
                                    ))}
                                </div>

                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <div key={day} className="hoae-day-col">
                                        {[...Array(11)].map((_, i) => (
                                            <div key={i} className="hoae-grid-line"></div>
                                        ))}

                                        {day === 2 && (
                                            <div className="hoae-current-time-line" style={{ top: '280px' }}>
                                                <span className="hoae-time-badge">09 : 30 AM</span>
                                            </div>
                                        )}

                                        {scheduledEvents.filter((event) => event.day === day).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`hoae-event-card hoae-bg-${event.color}`}
                                                style={{ top: `${event.top}px`, height: `${event.height}px` }}
                                            >
                                                <div className="hoae-event-header">
                                                    <h5>{event.title}</h5>
                                                    <div className="hoae-event-actions">
                                                        <IconMoreHorizontal />
                                                        <span className="hoae-attendees-badge">{event.attendees || '<>'}</span>
                                                    </div>
                                                </div>
                                                <p className="hoae-event-time">{event.time}</p>
                                                {event.subtitle && <p className="hoae-event-subtitle">{event.subtitle}</p>}

                                                <div className="hoae-event-status-row">
                                                    <span className={`rep-status rep-st-${getStatusColor(event.status)} hoae-event-status`}>
                                                        <span className="dot"></span> {event.status}
                                                    </span>
                                                    <div className="hoae-avatar-stack">
                                                        <div className="hoae-avatar hoae-av-1"></div>
                                                        <div className="hoae-avatar hoae-av-2"></div>
                                                        <div className="hoae-avatar hoae-av-3"></div>
                                                    </div>
                                                </div>

                                                <div className="hoae-event-footer-btns">
                                                    <button type="button" className="hoae-btn-confirm"><IconCheck /> Confirm</button>
                                                    <button type="button" className="hoae-btn-cancel"><IconX /> Cancel</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="hoae-tab-content fade-in">
                        <div className="rep-table-header-area">
                            <div className="rep-table-title">
                                <h2>Events Logs</h2>
                            </div>
                            <div className="rep-table-actions">
                                <button type="button" className="hoae-btn-outline">
                                    <img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Event
                                </button>
                            </div>
                        </div>

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
                                            <div className="th-inner" onClick={() => handleSort('eventName')}>
                                                Event Name (23)
                                                <span className={`sort-icon ${sortConfig.key === 'eventName' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-inner" onClick={() => handleSort('coordinator')}>
                                                Coordinator
                                                <span className={`sort-icon ${sortConfig.key === 'coordinator' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-inner" onClick={() => handleSort('timeRange')}>
                                                Time Range
                                                <span className={`sort-icon ${sortConfig.key === 'timeRange' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-inner" onClick={() => handleSort('students')}>
                                                Tot. Students
                                                <span className={`sort-icon ${sortConfig.key === 'students' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-inner" onClick={() => handleSort('duration')}>
                                                Duration
                                                <span className={`sort-icon ${sortConfig.key === 'duration' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th>
                                            <div className="th-inner" onClick={() => handleSort('status')}>
                                                Status
                                                <span className={`sort-icon ${sortConfig.key === 'status' ? `active ${sortConfig.direction}` : ''}`}>
                                                    <img src={hoaupdowncaret} alt="Sort" />
                                                </span>
                                            </div>
                                        </th>
                                        <th style={{ width: '40px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getSortedLogs().map((log) => (
                                        <tr key={log.id} className={selectedRows.includes(log.id) ? 'selected-row' : ''}>
                                            <td className="sticky-col-1" style={{ textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    className="rep-checkbox"
                                                    checked={selectedRows.includes(log.id)}
                                                    onChange={() => toggleRow(log.id)}
                                                />
                                            </td>
                                            <td className="sticky-col-2">
                                                <div className="rep-td-course">
                                                    <strong>{log.eventName}</strong>
                                                    <span>{log.eventTime}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="rep-td-tutor">
                                                    <strong>{log.coordinator}</strong>
                                                    <span>{log.role}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{log.timeRange}</span>
                                            </td>
                                            <td>
                                                <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{log.students}</span>
                                            </td>
                                            <td>
                                                <span className="rep-td-reason" style={{ fontWeight: 600, color: '#071437' }}>{log.duration}</span>
                                            </td>
                                            <td>
                                                <span className={`rep-status rep-st-${getStatusColor(log.status)}`}>
                                                    <span className="dot"></span> {log.status}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', position: 'relative' }}>
                                                <button
                                                    type="button"
                                                    className="rep-action-btn"
                                                    onClick={() => setActiveActionMenu(activeActionMenu === log.id ? null : log.id)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="5" r="1"></circle>
                                                        <circle cx="12" cy="12" r="1"></circle>
                                                        <circle cx="12" cy="19" r="1"></circle>
                                                    </svg>
                                                </button>
                                                {activeActionMenu === log.id && (
                                                    <div className="rep-action-dropdown-menu">
                                                        <div className="dropdown-item" onClick={() => setActiveActionMenu(null)}>Approve</div>
                                                        <div className="dropdown-item" onClick={() => setActiveActionMenu(null)}>Edit</div>
                                                        <div className="dropdown-item" onClick={() => setActiveActionMenu(null)} style={{ color: '#F8285A' }}>Delete</div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

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
                                            {pageSizeOptions.map((opt) => (
                                                <button
                                                    key={opt}
                                                    type="button"
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
                                <button type="button" className="page-nav">
                                    <img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" />
                                </button>
                                <button type="button" className="page-num">1</button>
                                <button type="button" className="page-num active">2</button>
                                <button type="button" className="page-num">3</button>
                                <button type="button" className="page-nav">
                                    <img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </HOALayout>
    );
};

export default HOAEventsPlanning;
