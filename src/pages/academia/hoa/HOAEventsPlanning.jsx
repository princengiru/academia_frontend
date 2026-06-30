import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import EventFormModal from '../../../components/HOAEvents/EventFormModal';
import Toast from '../../../components/Toast/Toast';
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
    const s = String(status).toLowerCase();
    if (s === 'scheduled' || s === 'confirmed' || s === 'active') return 'completed';
    if (s === 'cancelled' || s === 'failed') return 'failed';
    return 'progress';
};

const getEventColor = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
        case 'draft': return 'gray';
        case 'scheduled': return 'blue';
        case 'active': return 'green';
        case 'completed': return 'purple';
        case 'cancelled': return 'red';
        default: return 'yellow';
    }
};

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const HOAEventsPlanning = () => {
    const [activeTab, setActiveTab] = useState('scheduling');
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'eventName', direction: 'asc' });
    const [pageSize, setPageSize] = useState('5');
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedWeekStart, setSelectedWeekStart] = useState(() => getMonday(new Date()));
    const [toast, setToast] = useState(null);
    const handleCloseToast = useCallback(() => setToast(null), []);

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    const pageSizeOptions = ['5', '10', '25'];
    const pageSizeRef = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/events?limit=250`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (res.ok && result.success && Array.isArray(result.data)) {
                setEvents(result.data);
                setError(null);
            } else {
                throw new Error(result.message || 'Failed to fetch events');
            }
        } catch (err) {
            console.error('Fetch events error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.rep-action-dropdown-menu') && !event.target.closest('.rep-action-btn')) {
                setActiveActionMenu(null);
            }
            if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) {
                setIsPageSizeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    const updateEventStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await res.json();
            if (res.ok) {
                setToast({ message: `Event status updated to ${newStatus}`, type: 'success' });
                fetchEvents();
            } else {
                throw new Error(result.message || 'Failed to update status');
            }
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (res.ok) {
                setToast({ message: 'Event deleted successfully', type: 'success' });
                fetchEvents();
            } else {
                throw new Error(result.message || 'Failed to delete event');
            }
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

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

    const getWeekRangeLabel = (monday) => {
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        
        const startOpt = { day: '2-digit' };
        const endOpt = { day: '2-digit', month: 'long' };
        
        if (monday.getMonth() !== sunday.getMonth()) {
            startOpt.month = 'short';
        }
        
        const startStr = monday.toLocaleDateString('en-US', startOpt);
        const endStr = sunday.toLocaleDateString('en-US', endOpt);
        return `${startStr} - ${endStr}`;
    };

    const handlePrevWeek = () => {
        setSelectedWeekStart(prev => {
            const next = new Date(prev);
            next.setDate(next.getDate() - 7);
            return next;
        });
    };

    const handleNextWeek = () => {
        setSelectedWeekStart(prev => {
            const next = new Date(prev);
            next.setDate(next.getDate() + 7);
            return next;
        });
    };

    const getHeaderDayLabel = (dayIndex) => {
        const d = new Date(selectedWeekStart);
        d.setDate(d.getDate() + (dayIndex - 1));
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        return { label: `${dayIndex}- ${dayName} ${dayNum}`, date: d };
    };

    const isToday = (date) => new Date().toDateString() === date.toDateString();

    // Dynamic calendar hours calculation for HOAEventsPlanning
    const calendarHoursInfo = useMemo(() => {
        const DEFAULT_START_HOUR = 8; // 8:00 AM
        const DEFAULT_END_HOUR = 18;  // 6:00 PM

        const weekStart = new Date(selectedWeekStart);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let minHour = DEFAULT_START_HOUR;
        let maxHour = DEFAULT_END_HOUR;

        events.forEach(event => {
            if (!event.event_datetime) return;
            const startsAt = new Date(event.event_datetime);
            if (startsAt >= weekStart && startsAt < weekEnd) {
                const durMins = Number(event.duration_minutes || 60);
                const endsAt = event.end_datetime ? new Date(event.end_datetime) : new Date(startsAt.getTime() + durMins * 60000);

                const startHour = startsAt.getHours();
                const endHour = Math.ceil((endsAt.getHours() * 60 + endsAt.getMinutes()) / 60);

                if (startHour < minHour) minHour = startHour;
                if (endHour > maxHour) maxHour = endHour;
            }
        });

        minHour = Math.max(0, minHour);
        maxHour = Math.min(24, maxHour);

        const hours = [];
        for (let h = minHour; h < maxHour; h++) {
            hours.push(h);
        }

        return {
            scheduleHours: hours,
            startHour: minHour,
            endHour: maxHour
        };
    }, [events, selectedWeekStart]);

    const scheduleHours = calendarHoursInfo.scheduleHours;

    const scheduledEvents = useMemo(() => {
        const weekStart = new Date(selectedWeekStart);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const { startHour, endHour } = calendarHoursInfo;
        const calendarStartMins = startHour * 60;
        const totalCalendarMins = (endHour - startHour) * 60;

        const weekEvents = [];

        events.forEach(event => {
            if (!event.event_datetime) return;
            const eventDate = new Date(event.event_datetime);
            if (eventDate >= weekStart && eventDate < weekEnd) {
                const rawDay = eventDate.getDay(); 
                const day = rawDay === 0 ? 7 : rawDay;

                const startMins = eventDate.getHours() * 60 + eventDate.getMinutes();

                let duration = 60;
                if (event.duration_minutes) {
                    duration = event.duration_minutes;
                } else if (event.end_datetime) {
                    duration = (new Date(event.end_datetime) - eventDate) / 60000;
                }

                const endMins = startMins + duration;

                const relativeStart = Math.max(0, startMins - calendarStartMins);
                const top = (relativeStart / 60) * 80;
                const height = (duration / 60) * 80;

                const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endLimit = new Date(eventDate.getTime() + duration * 60000);
                const time = `${formatTime(eventDate)} - ${formatTime(endLimit)}`;

                weekEvents.push({
                    id: event.id,
                    day,
                    top,
                    height,
                    startMins,
                    endMins,
                    title: event.name,
                    subtitle: event.subtitle || event.location || '',
                    time,
                    status: event.status,
                    color: getEventColor(event.status),
                    attendees: event.total_registrations ? `+${event.total_registrations}` : null,
                    rawEvent: event,
                    column: 0,
                    maxColumns: 1
                });
            }
        });

        // Resolve overlaps per day
        const finalizedEvents = [];
        for (let d = 1; d <= 7; d++) {
            const dayEvents = weekEvents.filter(e => e.day === d);
            
            // Sort
            dayEvents.sort((a, b) => {
                if (a.startMins !== b.startMins) return a.startMins - b.startMins;
                return (b.endMins - b.startMins) - (a.endMins - a.startMins);
            });

            const clusters = [];
            dayEvents.forEach(event => {
                let placed = false;
                for (let i = 0; i < clusters.length; i++) {
                    const cluster = clusters[i];
                    const overlaps = cluster.some(member => {
                        return event.startMins < member.endMins && event.endMins > member.startMins;
                    });
                    if (overlaps) {
                        cluster.push(event);
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    clusters.push([event]);
                }
            });

            clusters.forEach(cluster => {
                const columns = [];
                cluster.forEach(event => {
                    let colIndex = 0;
                    while (true) {
                        if (!columns[colIndex]) {
                            columns[colIndex] = [];
                        }
                        const col = columns[colIndex];
                        const overlaps = col.some(member => {
                            return event.startMins < member.endMins && event.endMins > member.startMins;
                        });
                        if (!overlaps) {
                            col.push(event);
                            event.column = colIndex;
                            break;
                        }
                        colIndex++;
                    }
                });

                const maxColumns = columns.length;
                cluster.forEach(event => {
                    event.maxColumns = maxColumns;
                });
            });

            finalizedEvents.push(...dayEvents);
        }

        return finalizedEvents;
    }, [events, selectedWeekStart, calendarHoursInfo]);

    const todayIndicator = useMemo(() => {
        const today = new Date();
        const weekStart = new Date(selectedWeekStart);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const inActiveWeek = today >= weekStart && today < weekEnd;
        if (!inActiveWeek) return null;

        const day = today.getDay();
        const dayColIndex = day === 0 ? 7 : day;
        const currentHour = today.getHours();
        const currentMin = today.getMinutes();

        const { startHour, endHour } = calendarHoursInfo;
        if (currentHour >= startHour && currentHour < endHour) {
            const top = (currentHour - startHour + currentMin / 60) * 80;
            const timeLabel = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return { day: dayColIndex, top, label: timeLabel };
        }
        return null;
    }, [selectedWeekStart, calendarHoursInfo]);

    const logsData = useMemo(() => {
        return events.map(event => {
            const eventDate = new Date(event.event_datetime);
            
            const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let durationMin = 60;
            if (event.duration_minutes) {
                durationMin = event.duration_minutes;
            } else if (event.end_datetime) {
                durationMin = (new Date(event.end_datetime) - eventDate) / 60000;
            }
            const endTime = new Date(eventDate.getTime() + durationMin * 60000);
            const timeRange = `${formatTime(eventDate)} - ${formatTime(endTime)}`;
            
            const hours = Math.floor(durationMin / 60);
            const mins = Math.floor(durationMin % 60);
            const durationStr = `${hours} Hours ${mins} Min`;

            const diffMs = new Date() - eventDate;
            const diffHours = diffMs / 3600000;
            let relativeTime = '';
            if (Math.abs(diffHours) < 24) {
                relativeTime = diffHours > 0 ? `${Math.floor(diffHours)} hours ago` : `in ${Math.floor(Math.abs(diffHours))} hours`;
            } else {
                relativeTime = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }

            return {
                id: event.id,
                eventName: event.name,
                eventTime: relativeTime,
                coordinator: event.creator_name || 'Admin',
                role: event.creator_role || 'admin',
                timeRange,
                students: event.total_registrations || 0,
                duration: durationStr,
                status: event.status,
                rawEvent: event
            };
        });
    }, [events]);

    const stats = useMemo(() => {
        const total = events.length;
        const approved = events.filter(e => ['scheduled', 'active', 'completed'].includes(e.status)).length;
        const failed = events.filter(e => e.status === 'cancelled').length;
        const pending = events.filter(e => e.status === 'draft').length;
        const totalAttendees = events.reduce((sum, e) => sum + (e.total_registrations || 0), 0);
        return { total, approved, failed, pending, totalAttendees };
    }, [events]);

    const handleAddEventClick = () => {
        setEditingEvent(null);
        setIsFormModalOpen(true);
    };

    const handleEditEventClick = (eventObj) => {
        setEditingEvent(eventObj);
        setIsFormModalOpen(true);
    };

    const handleFormSuccess = (msg) => {
        setToast({ message: msg, type: 'success' });
        fetchEvents();
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

    const paginatedLogs = useMemo(() => {
        const sorted = getSortedLogs();
        const size = parseInt(pageSize, 10);
        const start = (currentPage - 1) * size;
        return sorted.slice(start, start + size);
    }, [events, sortConfig, pageSize, currentPage]);

    const totalPages = Math.ceil(logsData.length / parseInt(pageSize, 10)) || 1;

    return (
        <HOALayout currentPage="events-planning" breadcrumb={{ section: 'Plannings', page: 'Overview' }}>
            <div className="hoae-page-wrapper hoa-reports-page">

                <div className="hoa-page-header">
                    <h1>Events & Planning</h1>
                    <div className="hoa-header-actions">
                        <span className="hoa-update-status" onClick={fetchEvents} style={{ cursor: 'pointer' }}>
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            {loading ? 'Refreshing...' : 'Data updated just now'}
                            <span className="dot" style={{ backgroundColor: loading ? '#FFC700' : '#17C653' }}></span>
                        </span>
                        <button type="button" className="hoa-btn-primary" onClick={() => window.open('/', '_blank')}>
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                <div className="hoae-stats-top-container">
                    <div className="hoae-stats-container">
                        <div className="hoae-stat-block">
                            <h3>{stats.total}</h3>
                            <p>Total Events</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>{stats.approved}</h3>
                            <p>Approved Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>{stats.failed}</h3>
                            <p>Failed Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>{stats.pending}</h3>
                            <p>Pending Event</p>
                        </div>
                        <div className="hoae-stat-block">
                            <h3>{stats.totalAttendees}</h3>
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
                                <p>{scheduledEvents.length} Events this week</p>
                            </div>
                            <div className="hoae-date-navigator">
                                <button type="button" className="hoae-icon-btn-outline" aria-label="Previous week" onClick={handlePrevWeek}>
                                    <IconChevronLeft />
                                </button>
                                <span className="hoae-date-range">{getWeekRangeLabel(selectedWeekStart)}</span>
                                <button type="button" className="hoae-icon-btn-outline" aria-label="Next week" onClick={handleNextWeek}>
                                    <IconChevronRight />
                                </button>
                            </div>
                            <div className="hoae-add-actions">
                                <button type="button" className="hoae-btn-outline" onClick={handleAddEventClick}>
                                    <img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add Event
                                </button>
                            </div>
                        </div>

                        <div className="hoae-calendar-wrapper">
                            <div className="hoae-cal-header">
                                <div className="hoae-cal-th hoae-time-col">Hour</div>
                                {[1, 2, 3, 4, 5, 6, 7].map((dayIdx) => {
                                    const header = getHeaderDayLabel(dayIdx);
                                    const isActiveCol = isToday(header.date);
                                    return (
                                        <div key={dayIdx} className={`hoae-cal-th ${isActiveCol ? 'active' : ''}`}>
                                            {header.label}
                                        </div>
                                    );
                                })}
                            </div>
                             <div className="hoae-cal-body">
                                <div className="hoae-cal-times">
                                    {scheduleHours.map((hour) => (
                                        <div key={hour} className="hoae-time-slot">
                                            {hour === 12 ? '12:00 PM' : (hour === 0 || hour === 24 ? '12:00 AM' : `${hour % 12}:00 ${hour > 12 ? 'PM' : 'AM'}`)}
                                        </div>
                                    ))}
                                </div>

                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <div 
                                        key={day} 
                                        className="hoae-day-col"
                                        style={{ height: `${scheduleHours.length * 80}px` }}
                                    >
                                        {[...Array(scheduleHours.length)].map((_, i) => (
                                            <div key={i} className="hoae-grid-line"></div>
                                        ))}

                                        {todayIndicator && todayIndicator.day === day && (
                                            <div className="hoae-current-time-line" style={{ top: `${todayIndicator.top}px` }}>
                                                <span className="hoae-time-badge">{todayIndicator.label}</span>
                                            </div>
                                        )}

                                        {scheduledEvents.filter((event) => event.day === day).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`hoae-event-card hoae-bg-${event.color}`}
                                                style={{ 
                                                    top: `${event.top}px`, 
                                                    height: `${event.height}px`, 
                                                    left: `calc(${(event.column / event.maxColumns) * 100}% + 4px)`,
                                                    width: `calc(${(1 / event.maxColumns) * 100}% - 8px)`,
                                                    cursor: 'pointer' 
                                                }}
                                                onClick={() => handleEditEventClick(event.rawEvent)}
                                            >
                                                <div className="hoae-event-header">
                                                    <h5 title={event.title}>{event.title}</h5>
                                                    <div className="hoae-event-actions" onClick={e => e.stopPropagation()}>
                                                        <IconMoreHorizontal />
                                                        {event.attendees && (
                                                            <span className="hoae-attendees-badge">{event.attendees}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="hoae-event-time">{event.time}</p>
                                                {event.subtitle && <p className="hoae-event-subtitle" title={event.subtitle}>{event.subtitle}</p>}

                                                <div className="hoae-event-status-row">
                                                    <span className={`rep-status rep-st-${getStatusColor(event.status)} hoae-event-status`}>
                                                        <span className="dot"></span> {event.status}
                                                    </span>
                                                </div>

                                                <div className="hoae-event-footer-btns" onClick={e => e.stopPropagation()}>
                                                    {event.status !== 'active' && event.status !== 'scheduled' && (
                                                        <button 
                                                            type="button" 
                                                            className="hoae-btn-confirm"
                                                            onClick={() => updateEventStatus(event.id, 'scheduled')}
                                                        >
                                                            <IconCheck /> Confirm
                                                        </button>
                                                    )}
                                                    {event.status !== 'cancelled' && (
                                                        <button 
                                                            type="button" 
                                                            className="hoae-btn-cancel"
                                                            onClick={() => updateEventStatus(event.id, 'cancelled')}
                                                        >
                                                            <IconX /> Cancel
                                                        </button>
                                                    )}
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
                                <button type="button" className="hoae-btn-outline" onClick={handleAddEventClick}>
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
                                                Event Name ({logsData.length})
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
                                    {paginatedLogs.map((log) => (
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
                                                    <span style={{ textTransform: 'capitalize' }}>{log.role}</span>
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
                                                        {log.status !== 'scheduled' && log.status !== 'active' && (
                                                            <div className="dropdown-item" onClick={() => { updateEventStatus(log.id, 'scheduled'); setActiveActionMenu(null); }}>Confirm</div>
                                                        )}
                                                        <div className="dropdown-item" onClick={() => { handleEditEventClick(log.rawEvent); setActiveActionMenu(null); }}>Edit</div>
                                                        <div className="dropdown-item" onClick={() => { handleDeleteEvent(log.id); setActiveActionMenu(null); }} style={{ color: '#F8285A' }}>Delete</div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedLogs.length === 0 && (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#78829D' }}>
                                                No events found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="hoa-pagination-container list-pagination" ref={pageSizeRef}>
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
                                <span className="page-range">
                                    {logsData.length > 0 ? `${(currentPage - 1) * parseInt(pageSize, 10) + 1}-${Math.min(currentPage * parseInt(pageSize, 10), logsData.length)}` : '0-0'} of {logsData.length}
                                </span>
                                <button 
                                    type="button" 
                                    className="page-nav" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" />
                                </button>
                                {[...Array(totalPages)].map((_, index) => (
                                    <button 
                                        key={index}
                                        type="button" 
                                        className={`page-num ${currentPage === index + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                                <button 
                                    type="button" 
                                    className="page-nav"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    <img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <EventFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => { setIsFormModalOpen(false); setEditingEvent(null); }}
                    onSuccess={handleFormSuccess}
                    event={editingEvent}
                />

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.type === 'error' ? 8000 : 3000}
                        onClose={handleCloseToast}
                    />
                )}

            </div>
        </HOALayout>
    );
};

export default HOAEventsPlanning;
