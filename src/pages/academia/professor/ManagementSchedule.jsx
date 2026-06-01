import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-schedule.css';
import EmptyState from '../../../components/EmptyState/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helpers for Calendar and Time
const startOfWeek = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatWeekRange = (weekStart) => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = String(weekStart.getDate()).padStart(2, '0');
  const endDay = String(weekEnd.getDate()).padStart(2, '0');
  const startMonth = weekStart.toLocaleString('en-US', { month: 'long' });
  const endMonth = weekEnd.toLocaleString('en-US', { month: 'long' });

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} - ${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
};

const pad2 = (value) => String(value).padStart(2, '0');

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const formatTime12h = (value) => {
  const hours24 = value.getHours();
  const minutes = pad2(value.getMinutes());
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  let hour12 = hours24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${pad2(hour12)}:${minutes} ${meridiem}`;
};

const diffInDays = (a, b) => {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / 86400000);
};

const formatInputDateTime = (date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours24 = date.getHours();
  const minutes = pad2(date.getMinutes());
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  let hour12 = hours24 % 12;
  if (hour12 === 0) hour12 = 12;
  return `${month}/${day} ${pad2(hour12)}:${minutes} ${meridiem}`;
};

const generateCalendarDays = (year, month, selectedDate) => {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < 42; i++) {
    let dayNumber, cellDate, isMuted = false;

    if (i < offset) {
      dayNumber = daysInPrevMonth - offset + i + 1;
      cellDate = new Date(year, month - 1, dayNumber);
      isMuted = true;
    } else if (i >= offset + daysInMonth) {
      dayNumber = i - (offset + daysInMonth) + 1;
      cellDate = new Date(year, month + 1, dayNumber);
      isMuted = true;
    } else {
      dayNumber = i - offset + 1;
      cellDate = new Date(year, month, dayNumber);
    }

    const isSelected = 
      cellDate.getFullYear() === selectedDate.getFullYear() &&
      cellDate.getMonth() === selectedDate.getMonth() &&
      cellDate.getDate() === selectedDate.getDate();

    days.push({ dayNumber, dateObj: cellDate, isMuted, isSelected });
  }
  return days;
};


const ManagementSchedule = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Data Setup ---
  const managementTabs = [
    { id: 'management', label: 'Students' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  const [activeTab, setActiveTab] = useState('management-schedule');

  const scheduleDays = [
    { label: '1- Mon', isActive: false },
    { label: '2- Tue', isActive: true },
    { label: '3- Wed', isActive: false },
    { label: '4- Thu', isActive: false },
    { label: '5- Fri', isActive: false },
    { label: '6- Sat', isActive: false },
    { label: '7- Sun', isActive: false },
  ];

  const scheduleHours = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00'];

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  // --- Schedule Week Navigation State ---
  const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date()));
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState(false);
  const [openEventMenuId, setOpenEventMenuId] = useState(null);

  const handleWeekNav = (direction) => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + direction);
    setWeekStartDate(newDate);
  };

  const handleWeekPreset = (preset) => {
    const base = startOfWeek(new Date());
    if (preset === 'next') base.setDate(base.getDate() + 7);
    if (preset === 'last') base.setDate(base.getDate() - 7);
    setWeekStartDate(base);
    setIsWeekMenuOpen(false);
  };

  // --- Add Event Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventStatus, setEventStatus] = useState('In-Review');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const [eventName, setEventName] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Time Picker State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0, 0));
  const [calendarMonth, setCalendarMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  // Upload & Collaborators State
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Sheilah MUGABEKAZI', avatar: '/assets/imgs/default-profile.png' },
    { id: 2, name: 'Landry Perly', avatar: '/assets/imgs/default-profile.png' },
  ]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // Handle ESC and click-outside for floating menus
  useEffect(() => {
    const handleGlobalEvents = (e) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        setIsWeekMenuOpen(false);
        setIsStatusMenuOpen(false);
        setIsTimePickerOpen(false);
        setOpenEventMenuId(null);
      }
    };
    document.addEventListener('keydown', handleGlobalEvents);
    return () => document.removeEventListener('keydown', handleGlobalEvents);
  }, [isModalOpen]);

  // --- Time Picker Logic ---
  const adjustTime = (mode) => {
    const newDate = new Date(selectedDate);
    if (mode === 'hour-up') newDate.setHours(newDate.getHours() + 1);
    if (mode === 'hour-down') newDate.setHours(newDate.getHours() - 1);
    if (mode === 'minute-up') newDate.setMinutes((Math.floor(newDate.getMinutes() / 5) * 5 + 5) % 60);
    if (mode === 'minute-down') {
      const current = Math.floor(newDate.getMinutes() / 5) * 5;
      newDate.setMinutes((current + 55) % 60);
    }
    setSelectedDate(newDate);
  };

  const toggleMeridiem = () => {
    const newDate = new Date(selectedDate);
    newDate.setHours((newDate.getHours() + 12) % 24);
    setSelectedDate(newDate);
  };

  const selectDay = (dayDateObj) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(dayDateObj.getFullYear(), dayDateObj.getMonth(), dayDateObj.getDate());
    setSelectedDate(newDate);
    setCalendarMonth(new Date(dayDateObj.getFullYear(), dayDateObj.getMonth(), 1));
  };

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');

    const loadEvents = async () => {
      setEventsLoading(true);
      setEventsError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/created/my?limit=100&offset=0`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to load schedule events');
        }

        if (!mounted) return;
        setEvents(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        if (mounted) setEventsError(error.message || 'Failed to load schedule events');
      } finally {
        if (mounted) setEventsLoading(false);
      }
    };

    loadEvents();
    return () => { mounted = false; };
  }, []);

  // Create event handler
  const handleCreateEvent = async () => {
    if (!eventName || !selectedDate) {
      return alert('Please provide an event name and time');
    }

    const token = localStorage.getItem('token');
    const payload = {
      name: eventName,
      subtitle: eventSubtitle,
      description: eventDescription,
      status: eventStatus.toLowerCase().replace(/ /g, '_'),
      event_datetime: selectedDate.toISOString(),
      duration_minutes: Number(durationMinutes) || 60,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create event');

      // Prepend created event and close modal
      const created = data?.data || null;
      if (created) setEvents(prev => [created, ...prev]);
      setIsModalOpen(false);
      // reset modal fields
      setEventName(''); setEventSubtitle(''); setEventDescription(''); setDurationMinutes(60);
    } catch (err) {
      alert(err.message || 'Failed to create event');
    }
  };

  const scheduleEvents = useMemo(() => {
    const weekStart = startOfWeek(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return events
      .map((event) => {
        const startsAt = new Date(event.event_datetime);
        const durationMinutes = Number(event.duration_minutes || 60);
        const endsAt = event.end_datetime ? new Date(event.end_datetime) : new Date(startsAt.getTime() + durationMinutes * 60000);
        const dayOffset = diffInDays(startsAt, weekStart);
        const hour = startsAt.getHours();
        const minutes = startsAt.getMinutes();
        const dayColumn = clamp(dayOffset + 2, 2, 8);
        const hourIndex = clamp(hour - 6, 0, scheduleHours.length - 1);
        const rowStart = hourIndex + 2;
        const rowSpan = Math.max(1, Math.ceil(Math.max(30, (endsAt - startsAt) / 60000) / 60));
        const tone = event.status === 'confirmed' || event.status === 'scheduled'
          ? 'mint'
          : event.status === 'draft'
            ? 'rose'
            : event.status === 'completed'
              ? 'sand'
              : 'lavender';

        return {
          id: event.id,
          title: event.name,
          startTime: formatTime12h(startsAt),
          endTime: formatTime12h(endsAt),
          status: event.status ? event.status.replace(/_/g, ' ') : 'scheduled',
          statusTone: event.status === 'draft' ? 'draft' : (event.status === 'completed' ? 'confirmed' : 'review'),
          attendees: Number(event.total_registrations || 0),
          tone,
          colStart: dayColumn,
          colSpan: 1,
          rowStart,
          rowSpan,
          minutes,
        };
      })
      .filter(event => {
        const startsAt = new Date(events.find(item => item.id === event.id)?.event_datetime);
        return startsAt >= weekStart && startsAt < weekEnd;
      });
  }, [events, weekStartDate]);

  return (
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page" onClick={() => {
        // Global click handler to close menus if they are open
        if (isWeekMenuOpen) setIsWeekMenuOpen(false);
        if (openEventMenuId) setOpenEventMenuId(null);
      }}>
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); setIsModalOpen(true); }}>
                <img src="/assets/icons/plus1.svg" alt="" />
                <span>Add Event</span>
              </a>
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        <nav className="prof-management-tabs" aria-label="Management sections">
          {managementTabs.map((tab) => (
            <Link 
              key={tab.id}
              to={`/academia/professor/${tab.id}`} 
              className={`prof-management-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <section className="prof-schedule-wrap">
          <header className="prof-schedule-header">
            <h2>Schedule</h2>

            <div className="prof-schedule-period" aria-label="Current week">
              <button type="button" className="prof-schedule-nav" onClick={() => handleWeekNav(-7)} aria-label="Previous week">
                <img src="/assets/icons/left1.svg" alt="" aria-hidden="true" />
              </button>
              <span>{formatWeekRange(weekStartDate)}</span>
              <button type="button" className="prof-schedule-nav" onClick={() => handleWeekNav(7)} aria-label="Next week">
                <img src="/assets/icons/right1.svg" alt="" aria-hidden="true" />
              </button>
            </div>

            <div className="prof-schedule-actions">
              <button 
                type="button" 
                className="prof-schedule-btn" 
                onClick={(e) => { e.stopPropagation(); setIsWeekMenuOpen(!isWeekMenuOpen); }}
              >
                <span>This Week</span>
                <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
              </button>
              
              {isWeekMenuOpen && (
                <div className="prof-schedule-week-menu" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => handleWeekPreset('this')}>This Week</button>
                  <button type="button" onClick={() => handleWeekPreset('next')}>Next Week</button>
                  <button type="button" onClick={() => handleWeekPreset('last')}>Last Week</button>
                </div>
              )}

              <button type="button" className="prof-schedule-btn is-primary" onClick={() => setIsModalOpen(true)}>
                <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
                <span>Add Event</span>
              </button>
            </div>
          </header>

          <section className="prof-schedule-board" aria-label="Weekly calendar">
            {eventsLoading && (
              <div className="prof-schedule-board-state">Loading schedule...</div>
            )}

            {!eventsLoading && eventsError && (
              <div className="prof-schedule-board-state is-error">Error: {eventsError}</div>
            )}

            {!eventsLoading && !eventsError && scheduleEvents.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <img src="/assets/icons/empty-calendar.svg" alt="No events" style={{ width: 96, height: 96, opacity: 0.95 }} />
                <h3 style={{ marginTop: '.5rem' }}>No events this week</h3>
                <p style={{ margin: 0, color: 'var(--muted, #666)', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>There are no scheduled events for the selected week. Create an event to populate your schedule.</p>
                <div style={{ marginTop: '.75rem' }}>
                  <button className="learners-btn learners-btn-primary" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Add Event</button>
                </div>
              </div>
            )}

            <div className="prof-schedule-grid">
              <div className="prof-schedule-corner">Hour</div>

              {scheduleDays.map((day, idx) => (
                <div key={idx} className={`prof-schedule-day-head ${day.isActive ? 'is-active' : ''}`}>
                  {day.label}
                </div>
              ))}

              {scheduleHours.map((hourLabel, hourIndex) => {
                const hourRow = hourIndex + 2;
                return (
                  <React.Fragment key={`hr-${hourIndex}`}>
                    <div className="prof-schedule-hour" style={{ gridColumn: 1, gridRow: hourRow }}>
                      {hourLabel}
                    </div>
                    {scheduleDays.map((_, dayIndex) => {
                      const dayColumn = dayIndex + 2;
                      return <div key={`slot-${dayIndex}-${hourIndex}`} className="prof-schedule-slot" style={{ gridColumn: dayColumn, gridRow: hourRow }}></div>;
                    })}
                  </React.Fragment>
                );
              })}

              {scheduleEvents.map((event) => (
                <article
                  key={event.id}
                  className={`prof-schedule-event tone-${event.tone}`}
                  style={{ 
                    gridColumn: `${event.colStart} / span ${event.colSpan}`, 
                    gridRow: `${event.rowStart} / span ${event.rowSpan}` 
                  }}
                >
                  <div className="prof-schedule-event-head">
                    <div><h4>{event.title}</h4></div>

                    <button 
                      type="button" 
                      className="prof-schedule-event-menu" 
                      onClick={(e) => { e.stopPropagation(); setOpenEventMenuId(openEventMenuId === event.id ? null : event.id); }} 
                      aria-label="Event options"
                    >
                      <img src="/assets/icons/dots-horizontal.svg" alt="" aria-hidden="true" />
                    </button>

                    {openEventMenuId === event.id && (
                      <div className="prof-schedule-event-actions" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={preventDefault}>Edit</button>
                        <button type="button" onClick={preventDefault}>Duplicate</button>
                        <button type="button" onClick={preventDefault}>Delete</button>
                      </div>
                    )}
                  </div>

                  <div className="prof-schedule-event-time">
                    <span>{event.startTime}</span><i>-</i><span>{event.endTime}</span>
                  </div>

                  <div className="prof-schedule-event-meta">
                    <div className="prof-schedule-event-attendees" aria-label="Attendees">
                      <img className="prof-schedule-event-avatar" src="/assets/imgs/default-profile.png" alt="" />
                      <img className="prof-schedule-event-avatar" src="/assets/imgs/default-profile.png" alt="" />
                      <img className="prof-schedule-event-avatar" src="/assets/imgs/default-profile.png" alt="" />
                      <span className="prof-schedule-event-avatar-count">{event.attendees}+</span>
                    </div>

                    <strong className={`is-${event.statusTone}`}>
                      <i></i>
                      <span>{event.status}</span>
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </section>

      {/* --- ADD EVENT MODAL --- */}
      <div className={`assessments-modal prof-schedule-modal ${isModalOpen ? 'is-open' : ''}`} aria-hidden={!isModalOpen}>
        <div className="assessments-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
        
        <div className="assessments-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="scheduleEventModalTitle">
          <div className="assessments-modal__header">
            <h2 id="scheduleEventModalTitle">Add Event</h2>
            <button type="button" className="assessments-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Close add event modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
            </button>
          </div>

          <div className="assessments-modal__body prof-schedule-modal__body" onClick={() => {
            if (isStatusMenuOpen) setIsStatusMenuOpen(false);
            if (isTimePickerOpen) setIsTimePickerOpen(false);
          }}>
            <div className="prof-schedule-modal-grid">
              <div className="prof-schedule-modal-fields">
                
                <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                  <span>Event name</span>
                  <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event title" />
                </label>

                <div className="prof-schedule-modal-row">
                  <label className="prof-schedule-modal-field">
                    <span>Status</span>
                    <button 
                      type="button" 
                      className="prof-schedule-modal-select" 
                      onClick={(e) => { e.stopPropagation(); setIsStatusMenuOpen(!isStatusMenuOpen); setIsTimePickerOpen(false); }}
                    >
                      <span className="prof-schedule-modal-status-dot"></span>
                      <span>{eventStatus}</span>
                      <img src="/assets/icons/drop.svg" alt="" />
                    </button>
                    {isStatusMenuOpen && (
                      <div className="prof-schedule-modal-status-menu" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => { setEventStatus('In-Review'); setIsStatusMenuOpen(false); }}>In-Review</button>
                        <button type="button" onClick={() => { setEventStatus('Confirmed'); setIsStatusMenuOpen(false); }}>Confirmed</button>
                        <button type="button" onClick={() => { setEventStatus('Draft'); setIsStatusMenuOpen(false); }}>Draft</button>
                      </div>
                    )}
                  </label>

                  <div className="prof-schedule-modal-field prof-schedule-modal-field--time">
                    <span>Event Time</span>
                    <div 
                      className={`prof-schedule-modal-time-input ${isTimePickerOpen ? 'is-active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setIsTimePickerOpen(!isTimePickerOpen); setIsStatusMenuOpen(false); }}
                    >
                      <input type="text" value={`${formatInputDateTime(selectedDate)} - 4/18 04:00 AM`} readOnly />
                      <img src="/assets/icons/calendar-add.svg" alt="" aria-hidden="true" />
                    </div>
                    
                    {/* Time & Date Picker */}
                    {isTimePickerOpen && (
                      <div className="prof-schedule-modal-picker" onClick={e => e.stopPropagation()}>
                        <div className="prof-schedule-modal-calendar">
                          <div className="prof-schedule-modal-calendar-head">
                            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} aria-label="Previous month"><img src="/assets/icons/left1.svg" alt="" /></button>
                            <strong>{calendarMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</strong>
                            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} aria-label="Next month"><img src="/assets/icons/right1.svg" alt="" /></button>
                          </div>

                          <div className="prof-schedule-modal-calendar-grid">
                            <span className="prof-schedule-modal-dow">Su</span><span className="prof-schedule-modal-dow">Mo</span><span className="prof-schedule-modal-dow">Tu</span><span className="prof-schedule-modal-dow">We</span><span className="prof-schedule-modal-dow">Th</span><span className="prof-schedule-modal-dow">Fr</span><span className="prof-schedule-modal-dow">Sa</span>
                            {generateCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth(), selectedDate).map((day, idx) => (
                              <button 
                                key={idx} 
                                type="button" 
                                className={`${day.isMuted ? 'is-muted' : ''} ${day.isSelected ? 'is-selected' : ''}`}
                                onClick={() => selectDay(day.dateObj)}
                              >
                                {day.dayNumber}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="prof-schedule-modal-timepicker">
                          <div className="prof-schedule-modal-timecol">
                            <button type="button" onClick={() => adjustTime('hour-up')} aria-label="Increase hour">↑</button>
                            <strong>{pad2(selectedDate.getHours() % 12 === 0 ? 12 : selectedDate.getHours() % 12)}</strong>
                            <button type="button" onClick={() => adjustTime('hour-down')} aria-label="Decrease hour">↓</button>
                          </div>
                          <span className="prof-schedule-modal-time-sep">:</span>
                          <div className="prof-schedule-modal-timecol">
                            <button type="button" onClick={() => adjustTime('minute-up')} aria-label="Increase minute">↑</button>
                            <strong>{pad2(selectedDate.getMinutes())}</strong>
                            <button type="button" onClick={() => adjustTime('minute-down')} aria-label="Decrease minute">↓</button>
                          </div>
                          <button type="button" className="prof-schedule-modal-meridiem" onClick={toggleMeridiem}>
                            {selectedDate.getHours() >= 12 ? 'PM' : 'AM'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                  <span>Event Subtitle</span>
                  <input type="text" value={eventSubtitle} onChange={(e) => setEventSubtitle(e.target.value)} placeholder="Optional subtitle" />
                </label>

                <div className="prof-schedule-modal-field prof-schedule-modal-field--full">
                  <span>Add Collaboration</span>
                  <div className="prof-schedule-modal-search">
                    <img src="/assets/icons/magnifier.svg" alt="" aria-hidden="true" />
                    <span>@</span>
                    <input type="text" defaultValue="All Student" />
                  </div>

                  <div className="prof-schedule-modal-chips">
                    {collaborators.map(collab => (
                      <span key={collab.id} className="prof-schedule-modal-chip">
                        <img src={collab.avatar} alt="" />
                        <span>{collab.name}</span>
                        <button type="button" onClick={() => setCollaborators(collaborators.filter(c => c.id !== collab.id))} aria-label="Remove collaborator">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <label 
                  className={`prof-schedule-modal-upload ${isDragOver ? 'is-dragover' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
                >
                  <input type="file" ref={fileInputRef} multiple onChange={(e) => handleFiles(e.target.files)} />
                  <span className="prof-schedule-modal-upload-icon">
                    <img src="/assets/icons/file.svg" alt="" aria-hidden="true" />
                  </span>
                  <span className="prof-schedule-modal-upload-copy">
                    <strong>{uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Drop files here or click to upload.'}</strong>
                    <small>{uploadedFiles.length > 0 ? 'Ready to upload' : 'Upload case files, if any.'}</small>
                  </span>
                </label>
                <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                  <span>Event Description</span>
                  <textarea rows="4" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Type something..."></textarea>
                </label>
              </div>
            </div>

            <div className="prof-schedule-modal-actions">
              <button type="button" className="prof-schedule-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="button" className="prof-schedule-modal-submit" onClick={handleCreateEvent}>Create Event</button>
            </div>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ManagementSchedule;