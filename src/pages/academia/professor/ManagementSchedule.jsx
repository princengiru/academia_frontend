import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-schedule.css';

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

  const scheduleEvents = [
    { id: 1, title: 'Math Explanation', startTime: '06:00 AM', endTime: '08:00 AM', status: 'In Review', statusTone: 'review', attendees: 43, tone: 'lavender', colStart: 2, colSpan: 1, rowStart: 2, rowSpan: 1 },
    { id: 2, title: 'Reading Workshop', startTime: '07:00 AM', endTime: '10:00 AM', status: 'Confirmed', statusTone: 'confirmed', attendees: 28, tone: 'mint', colStart: 3, colSpan: 1, rowStart: 3, rowSpan: 3 },
    { id: 3, title: 'Science Lab', startTime: '08:00 AM', endTime: '11:00 AM', status: 'In Review', statusTone: 'review', attendees: 19, tone: 'blue', colStart: 4, colSpan: 1, rowStart: 4, rowSpan: 3 },
    { id: 4, title: 'Writing Clinic', startTime: '09:00 AM', endTime: '10:00 PM', status: 'Draft', statusTone: 'draft', attendees: 16, tone: 'rose', colStart: 5, colSpan: 1, rowStart: 5, rowSpan: 1 },
    { id: 5, title: 'Weekly Check-in', startTime: '10:00 AM', endTime: '01:00 PM', status: 'Confirmed', statusTone: 'confirmed', attendees: 24, tone: 'sand', colStart: 6, colSpan: 1, rowStart: 6, rowSpan: 3 },
  ];

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
                  <input type="text" defaultValue="Math Explanation" />
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
                  <textarea rows="4" placeholder="Type something..."></textarea>
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
              </div>
            </div>

            <button type="button" className="prof-schedule-modal-submit" onClick={() => setIsModalOpen(false)}>Done</button>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ManagementSchedule;