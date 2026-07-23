import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import './management-schedule.css';
import hoagoto from '../../../assets/icons/hoagoto.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- Helpers for Calendar and Time ---
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

  // --- Tab Setup ---
  const managementTabs = [
    { id: 'management', label: 'Courses' },
    { id: 'management-syllabuses', label: 'Syllabuses' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  const [activeTab, setActiveTab] = useState('management-schedule');

  // --- UI Alerts & Modals ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimerRef = useRef(null);
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, type === 'error' ? 8000 : 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // --- Data Fetching ---
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [eventsReloadKey, setEventsReloadKey] = useState(0);

  const loadEvents = async (signal) => {
    const token = localStorage.getItem('token');
    setEventsLoading(true);
    setEventsError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/created/my?limit=100&offset=0`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: signal
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || 'Failed to load schedule events');

      setEvents(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setEventsError(error.message || 'Failed to load schedule events');
      }
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
  }, [eventsReloadKey]);

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

  // Dynamic weekly day labels mapping actual dates of the selected week
  const scheduleDays = useMemo(() => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today);
    const selectedWeekStart = startOfWeek(weekStartDate);
    const isCurrentWeek = currentWeekStart.getTime() === selectedWeekStart.getTime();

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayDay = today.getDay();
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1;

    return labels.map((label, idx) => {
      const dayDate = new Date(selectedWeekStart);
      dayDate.setDate(selectedWeekStart.getDate() + idx);
      const dateNum = dayDate.getDate();
      return {
        label: `${dateNum}- ${label}`,
        isActive: isCurrentWeek && idx === todayIndex
      };
    });
  }, [weekStartDate]);

  // Dynamic schedule hours calculation to auto-expand calendar display window when necessary
  const calendarHoursInfo = useMemo(() => {
    const DEFAULT_START_HOUR = 8; // 8:00 AM
    const DEFAULT_END_HOUR = 18;  // 6:00 PM

    const weekStart = startOfWeek(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let minHour = DEFAULT_START_HOUR;
    let maxHour = DEFAULT_END_HOUR;

    events.forEach(event => {
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
      const meridiem = h >= 12 ? 'PM' : 'AM';
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      hours.push(`${String(hour12).padStart(2, '0')}:00 ${meridiem}`);
    }

    return {
      scheduleHours: hours,
      startHour: minHour,
      endHour: maxHour
    };
  }, [events, weekStartDate]);

  const scheduleHours = calendarHoursInfo.scheduleHours;

  // --- Add/Edit/Duplicate Event Modal State & DB fields ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [eventName, setEventName] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [eventStatus, setEventStatus] = useState('In-Review');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  // New DB fields states
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [isVirtual, setIsVirtual] = useState(true);
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);

  // Fetch instructor courses once on mount
  const loadInstructorCourses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data?.data?.courses) {
        setInstructorCourses(data.data.courses);
      }
    } catch (err) {
      console.error('Failed to load instructor courses for selector:', err);
    }
  };

  useEffect(() => {
    loadInstructorCourses();
  }, []);

  // Time Picker State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [calendarMonth, setCalendarMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  // Upload & Collaborators State
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingAttachmentName, setExistingAttachmentName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorDraft, setCollaboratorDraft] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

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
        handleCloseModal();
        setIsWeekMenuOpen(false);
        setIsStatusMenuOpen(false);
        setIsTimePickerOpen(false);
        setOpenEventMenuId(null);
      }
    };
    document.addEventListener('keydown', handleGlobalEvents);
    return () => document.removeEventListener('keydown', handleGlobalEvents);
  }, []);

  // Debounced search for student users
  useEffect(() => {
    if (!collaboratorDraft.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(collaboratorDraft)}`);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          setSearchResults(result.data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Error searching students in schedule:', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [collaboratorDraft]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest('.prof-schedule-modal-search')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Automatically fetch enrolled students when courseId changes
  useEffect(() => {
    if (!courseId) return;
    const fetchCourseStudents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollments`);
        const result = await res.json();
        if (res.ok && result.success && Array.isArray(result.data)) {
          const courseStudents = result.data.map(en => ({
            id: en.id, // user_id
            name: en.student_name,
            email: en.student_email,
            avatar: en.avatar ? (en.avatar.startsWith('http') ? en.avatar : `${API_BASE_URL}${en.avatar}`) : '/assets/imgs/default-profile.png'
          }));
          setCollaborators(prev => {
            const map = new Map(prev.map(c => [c.id, c]));
            courseStudents.forEach(s => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error('Failed to load course students for schedule:', err);
      }
    };
    fetchCourseStudents();
  }, [courseId]);

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
      setUploadedFiles([files[0]]); // single file upload supported on backend
    }
  };

  // Close and reset event modal states
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEventId(null);
    setIsEditMode(false);
    setEventName('');
    setEventSubtitle('');
    setEventDescription('');
    setDurationMinutes(60);
    setEventStatus('In-Review');
    setExistingAttachmentName('');
    setUploadedFiles([]);
    setCourseId('');
    setIsVirtual(true);
    setMeetingLink('');
    setLocation('');
    setRegistrationRequired(false);
    setMaxParticipants('');
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    setSelectedDate(d);
    setCollaborators([]);
    setCollaboratorDraft('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // --- Edit & Duplicate Open Trigger Actions ---
  const handleEditEventClick = (eventId) => {
    const originalEvent = events.find(e => e.id === eventId);
    if (!originalEvent) return;

    setEditingEventId(originalEvent.id);
    setIsEditMode(true);
    setEventName(originalEvent.name || '');
    setEventSubtitle(originalEvent.subtitle || '');
    setEventDescription(originalEvent.description || '');
    setDurationMinutes(originalEvent.duration_minutes || 60);
    setExistingAttachmentName(originalEvent.attachment_name || '');
    setUploadedFiles([]); // clear staging

    // Bind database state columns
    setCourseId(originalEvent.course_id || '');
    setIsVirtual(originalEvent.is_virtual === 1 || originalEvent.is_virtual === true);
    setMeetingLink(originalEvent.meeting_link || '');
    setLocation(originalEvent.location || '');
    setRegistrationRequired(originalEvent.registration_required === 1 || originalEvent.registration_required === true);
    setMaxParticipants(originalEvent.max_participants || '');

    const statusMap = {
      'in_review': 'In-Review',
      'in-review': 'In-Review',
      'confirmed': 'Confirmed',
      'draft': 'Draft'
    };
    const mappedStatus = statusMap[originalEvent.status?.toLowerCase()] || 'In-Review';
    setEventStatus(mappedStatus);

    if (originalEvent.event_datetime) {
      const dateObj = new Date(originalEvent.event_datetime);
      setSelectedDate(dateObj);
      setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }

    if (originalEvent.specific_participants && Array.isArray(originalEvent.specific_participants) && originalEvent.specific_participants.length > 0) {
      Promise.all(originalEvent.specific_participants.map(async (id) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
          const data = await res.json();
          if (res.ok && data?.success && data?.data) {
            return {
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
              avatar: data.data.avatar ? (data.data.avatar.startsWith('http') ? data.data.avatar : `${API_BASE_URL}${data.data.avatar}`) : '/assets/imgs/default-profile.png'
            };
          }
        } catch (e) {
          console.error('Error loading participant details:', e);
        }
        return { id, name: `Student #${id}`, email: '', avatar: '/assets/imgs/default-profile.png' };
      })).then(resolved => {
        setCollaborators(resolved.filter(Boolean));
      });
    } else {
      setCollaborators([]);
    }

    setIsModalOpen(true);
    setOpenEventMenuId(null);
  };

  const handleDuplicateEventClick = (eventId) => {
    const originalEvent = events.find(e => e.id === eventId);
    if (!originalEvent) return;

    setEditingEventId(null);
    setIsEditMode(false);
    setEventName(`${originalEvent.name || ''} (Copy)`);
    setEventSubtitle(originalEvent.subtitle || '');
    setEventDescription(originalEvent.description || '');
    setDurationMinutes(originalEvent.duration_minutes || 60);
    setExistingAttachmentName('');
    setUploadedFiles([]);

    // Bind database state columns
    setCourseId(originalEvent.course_id || '');
    setIsVirtual(originalEvent.is_virtual === 1 || originalEvent.is_virtual === true);
    setMeetingLink(originalEvent.meeting_link || '');
    setLocation(originalEvent.location || '');
    setRegistrationRequired(originalEvent.registration_required === 1 || originalEvent.registration_required === true);
    setMaxParticipants(originalEvent.max_participants || '');

    const statusMap = {
      'in_review': 'In-Review',
      'in-review': 'In-Review',
      'confirmed': 'Confirmed',
      'draft': 'Draft'
    };
    const mappedStatus = statusMap[originalEvent.status?.toLowerCase()] || 'In-Review';
    setEventStatus(mappedStatus);

    if (originalEvent.event_datetime) {
      const dateObj = new Date(originalEvent.event_datetime);
      setSelectedDate(dateObj);
      setCalendarMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }

    if (originalEvent.specific_participants && Array.isArray(originalEvent.specific_participants) && originalEvent.specific_participants.length > 0) {
      Promise.all(originalEvent.specific_participants.map(async (id) => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
          const data = await res.json();
          if (res.ok && data?.success && data?.data) {
            return {
              id: data.data.id,
              name: data.data.name,
              email: data.data.email,
              avatar: data.data.avatar ? (data.data.avatar.startsWith('http') ? data.data.avatar : `${API_BASE_URL}${data.data.avatar}`) : '/assets/imgs/default-profile.png'
            };
          }
        } catch (e) {
          console.error('Error loading participant details:', e);
        }
        return { id, name: `Student #${id}`, email: '', avatar: '/assets/imgs/default-profile.png' };
      })).then(resolved => {
        setCollaborators(resolved.filter(Boolean));
      });
    } else {
      setCollaborators([]);
    }

    setIsModalOpen(true);
    setOpenEventMenuId(null);
  };

  // --- Create Event Handler ---
  const handleCreateEvent = async () => {
    if (!eventName || !selectedDate) {
      showToast('Please provide an event name and time.', 'error');
      return;
    }

    // Check for overlap with existing events
    const newStart = selectedDate.getTime();
    const newEnd = newStart + Number(durationMinutes) * 60000;

    const hasOverlap = events.some(event => {
      if (event.status === 'cancelled' || event.status === 'failed') return false;
      const eventStart = new Date(event.event_datetime).getTime();
      const eventDur = Number(event.duration_minutes || 60);
      const eventEnd = eventStart + eventDur * 60000;
      return newStart < eventEnd && newEnd > eventStart;
    });

    if (hasOverlap) {
      showToast('This time slot is already taken by another event in your schedule.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', eventName);
    if (eventSubtitle) formData.append('subtitle', eventSubtitle);
    if (eventDescription) formData.append('description', eventDescription);
    formData.append('status', eventStatus.toLowerCase().replace(/ /g, '_'));
    formData.append('event_datetime', selectedDate.toISOString());
    formData.append('duration_minutes', String(Number(durationMinutes) || 60));

    // Append database fields
    if (courseId) {
      formData.append('course_id', String(courseId));
    }
    formData.append('is_virtual', isVirtual ? '1' : '0');
    if (isVirtual && meetingLink) {
      formData.append('meeting_link', meetingLink);
    }
    if (!isVirtual && location) {
      formData.append('location', location);
    }
    formData.append('registration_required', registrationRequired ? '1' : '0');
    if (registrationRequired && maxParticipants) {
      formData.append('max_participants', String(maxParticipants));
    }

    if (uploadedFiles.length > 0) {
      formData.append('attachment', uploadedFiles[0]);
    }

    const isSpecific = collaborators.length > 0;
    formData.append('audience_type', isSpecific ? 'specific' : 'all');
    if (isSpecific) {
      formData.append('specific_participants', JSON.stringify(collaborators.map(c => String(c.id))));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create event');

      showToast('Event created successfully!', 'success');
      loadEvents();
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Failed to create event. Please try again.', 'error');
    }
  };

  // --- Update Event Handler ---
  const handleSaveEvent = async () => {
    if (!eventName || !selectedDate) {
      showToast('Please provide an event name and time.', 'error');
      return;
    }

    // Check for overlap with existing events (excluding the current event)
    const newStart = selectedDate.getTime();
    const newEnd = newStart + Number(durationMinutes) * 60000;

    const hasOverlap = events.some(event => {
      if (event.id === editingEventId) return false;
      if (event.status === 'cancelled' || event.status === 'failed') return false;
      const eventStart = new Date(event.event_datetime).getTime();
      const eventDur = Number(event.duration_minutes || 60);
      const eventEnd = eventStart + eventDur * 60000;
      return newStart < eventEnd && newEnd > eventStart;
    });

    if (hasOverlap) {
      showToast('This time slot is already taken by another event in your schedule.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', eventName);
    formData.append('subtitle', eventSubtitle || '');
    formData.append('description', eventDescription || '');
    formData.append('status', eventStatus.toLowerCase().replace(/ /g, '_'));
    formData.append('event_datetime', selectedDate.toISOString());
    formData.append('duration_minutes', String(Number(durationMinutes) || 60));

    // Overwrite database fields
    formData.append('course_id', courseId ? String(courseId) : '');
    formData.append('is_virtual', isVirtual ? '1' : '0');
    formData.append('meeting_link', isVirtual ? (meetingLink || '') : '');
    formData.append('location', !isVirtual ? (location || '') : '');
    formData.append('registration_required', registrationRequired ? '1' : '0');
    formData.append('max_participants', registrationRequired ? (maxParticipants ? String(maxParticipants) : '') : '');

    if (uploadedFiles.length > 0) {
      formData.append('attachment', uploadedFiles[0]);
    }

    const isSpecific = collaborators.length > 0;
    formData.append('audience_type', isSpecific ? 'specific' : 'all');
    if (isSpecific) {
      formData.append('specific_participants', JSON.stringify(collaborators.map(c => String(c.id))));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${editingEventId}`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to update event');

      showToast('Event updated successfully!', 'success');
      loadEvents();
      handleCloseModal();
    } catch (err) {
      showToast(err.message || 'Failed to update event. Please try again.', 'error');
    }
  };

  // --- Delete Event Handler ---
  const handleDeleteEventClick = (eventId, eventTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event',
      message: `Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone.`,
      onConfirm: async () => {
        const token = localStorage.getItem('token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || 'Failed to delete event');

          showToast('Event deleted successfully!', 'success');
          setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch (err) {
          showToast(err.message || 'Failed to delete event', 'error');
        }
      }
    });
    setOpenEventMenuId(null);
  };

  // Compute Grid Events
  const scheduleEvents = useMemo(() => {
    const weekStart = startOfWeek(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // 1. Filter events belonging to this week and calculate their basic positioning info
    const weekEvents = events
      .filter(event => {
        const startsAt = new Date(event.event_datetime);
        return startsAt >= weekStart && startsAt < weekEnd;
      })
      .map(event => {
        const startsAt = new Date(event.event_datetime);
        const durMins = Number(event.duration_minutes || 60);
        const endsAt = event.end_datetime ? new Date(event.end_datetime) : new Date(startsAt.getTime() + durMins * 60000);

        const dayOffset = diffInDays(startsAt, weekStart);
        const dayIndex = clamp(dayOffset, 0, 6);
        const dayColumn = dayIndex + 2;

        // Calculate minutes since midnight for sorting/overlap detection
        const startMins = startsAt.getHours() * 60 + startsAt.getMinutes();
        const endMins = endsAt.getHours() * 60 + endsAt.getMinutes();

        // Calculate positioning percentages relative to dynamic calendar hours
        const { startHour, endHour } = calendarHoursInfo;
        const calendarStartMins = startHour * 60;
        const totalCalendarMins = (endHour - startHour) * 60;

        const relativeStart = Math.max(0, startMins - calendarStartMins);
        const relativeEnd = Math.min(totalCalendarMins, endMins - calendarStartMins);
        const duration = Math.max(10, relativeEnd - relativeStart); // Enforce min 10 minutes duration visually

        const top = (relativeStart / totalCalendarMins) * 100;
        const height = (duration / totalCalendarMins) * 100;

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
          dayIndex,
          dayColumn,
          startMins,
          endMins,
          top,
          height,
          duration,
          originalStart: startsAt,
          specificParticipants: Array.isArray(event.specific_participants) ? event.specific_participants : []
        };
      });

    // 2. Perform layout planning per day to handle overlaps
    const finalizedEvents = [];

    for (let d = 0; d < 7; d++) {
      const dayEvents = weekEvents.filter(e => e.dayIndex === d);

      // Sort day events: earlier start time first; if equal, longer duration first
      dayEvents.sort((a, b) => {
        if (a.startMins !== b.startMins) return a.startMins - b.startMins;
        return (b.endMins - b.startMins) - (a.endMins - a.startMins);
      });

      // Group overlapping events into clusters
      const clusters = [];
      dayEvents.forEach(event => {
        let added = false;
        for (let cluster of clusters) {
          const overlaps = cluster.some(cEvent => {
            return event.startMins < cEvent.endMins && cEvent.startMins < event.endMins;
          });
          if (overlaps) {
            cluster.push(event);
            added = true;
            break;
          }
        }
        if (!added) {
          clusters.push([event]);
        }
      });

      // Assign column index and maxColumns for overlap resolution
      clusters.forEach(cluster => {
        const columns = [];
        cluster.forEach(event => {
          let colIndex = 0;
          while (true) {
            if (!columns[colIndex]) {
              columns[colIndex] = [event];
              event.column = colIndex;
              break;
            }
            const overlapsInCol = columns[colIndex].some(cEvent => {
              return event.startMins < cEvent.endMins && cEvent.startMins < event.endMins;
            });
            if (!overlapsInCol) {
              columns[colIndex].push(event);
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
  }, [events, weekStartDate]);

  return (
    <>
      <section className="prof-management-page" onClick={() => {
        if (isWeekMenuOpen) setIsWeekMenuOpen(false);
        if (openEventMenuId) setOpenEventMenuId(null);
      }}>

        {/* Floating Toast Notification */}
        {toast.show && (
          <div className={`prof-toast-container toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); loadEvents(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                <span>Refresh Data</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="prof-management-tabs" aria-label="Management sections">
          {managementTabs.map((tab) => (
            <Link
              key={tab.id}
              to={`/professor/${tab.id}`}
              className={`prof-management-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Schedule Board */}
        <section className="prof-schedule-wrap">
          <header className="prof-schedule-header">
            <h2>Schedule</h2>

            <div className="prof-schedule-period" aria-label="Current week">
              <button type="button" className="prof-schedule-nav" onClick={() => handleWeekNav(-7)} aria-label="Previous week">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <span>{formatWeekRange(weekStartDate)}</span>
              <button type="button" className="prof-schedule-nav" onClick={() => handleWeekNav(7)} aria-label="Next week">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>

            <div className="prof-schedule-actions">
              <button
                type="button"
                className="prof-schedule-btn"
                onClick={(e) => { e.stopPropagation(); setIsWeekMenuOpen(!isWeekMenuOpen); }}
              >
                <span>This Week</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              {isWeekMenuOpen && (
                <div className="prof-schedule-week-menu" onClick={e => e.stopPropagation()}>
                  <button type="button" onClick={() => handleWeekPreset('this')}>This Week</button>
                  <button type="button" onClick={() => handleWeekPreset('next')}>Next Week</button>
                  <button type="button" onClick={() => handleWeekPreset('last')}>Last Week</button>
                </div>
              )}

              <button type="button" className="prof-schedule-btn is-primary" onClick={() => setIsModalOpen(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Add Event</span>
              </button>
            </div>
          </header>

          <section className="prof-schedule-board" aria-label="Weekly calendar">
            {eventsLoading ? (
              <ManagementLoading title="Loading schedule" message="Fetching your upcoming events." />
            ) : eventsError ? (
              <LearnerLoadError
                title="Could not load schedule"
                message={eventsError}
                onRetry={() => setEventsReloadKey((key) => key + 1)}
              />
            ) : scheduleEvents.length === 0 ? (
              <div className="prof-management-empty-state" style={{ margin: '18px 0' }}>
                <div className="prof-management-empty-state-card">
                  <h3>No events this week</h3>
                  <p>There are no scheduled events for the selected week. Create an event to populate your schedule.</p>
                  <div className="prof-management-empty-state-actions">
                    <button className="learners-btn learners-btn-primary" onClick={() => setIsModalOpen(true)}>Add Event</button>
                  </div>
                </div>
              </div>
            ) : null}

            {!eventsLoading && !eventsError && scheduleEvents.length > 0 && (
            <div
              className="prof-schedule-grid"
              style={{
                gridTemplateRows: `42px repeat(${scheduleHours.length}, minmax(78px, auto))`
              }}
            >
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

              {/* Day column container wrappers for overlap-resilient layout */}
              {scheduleDays.map((_, dayIndex) => {
                const dayColumn = dayIndex + 2;
                const dayEvents = scheduleEvents.filter(e => e.dayIndex === dayIndex);

                return (
                  <div
                    key={`day-col-${dayIndex}`}
                    className="prof-schedule-day-column"
                    style={{
                      gridColumn: dayColumn,
                      gridRow: `2 / span ${scheduleHours.length}`,
                      position: 'relative',
                      pointerEvents: 'none'
                    }}
                  >
                    {dayEvents.map((event) => {
                      const isCompact = event.duration < 35;
                      const isMidCompact = event.duration >= 35 && event.duration < 60;

                      return (
                        <article
                          key={event.id}
                          className={`prof-schedule-event tone-${event.tone} ${isCompact ? 'is-compact' : ''} ${isMidCompact ? 'is-mid-compact' : ''}`}
                          style={{
                            position: 'absolute',
                            top: `${event.top}%`,
                            height: `${event.height}%`,
                            left: `calc(${(event.column / event.maxColumns) * 100}% + 2px)`,
                            width: `calc(${(1 / event.maxColumns) * 100}% - 4px)`,
                            pointerEvents: 'auto',
                            minHeight: isCompact ? '38px' : (isMidCompact ? '54px' : '78px'),
                          }}
                        >
                          <div className="prof-schedule-event-head">
                            <div>
                              <h4>{event.title}</h4>
                            </div>
                            <button
                              type="button"
                              className="prof-schedule-event-menu"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenEventMenuId(openEventMenuId === event.id ? null : event.id);
                              }}
                              aria-label="Event options"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                              </svg>
                            </button>

                            {openEventMenuId === event.id && (
                              <div className="prof-schedule-event-actions" onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => handleEditEventClick(event.id)}>Edit</button>
                                <button type="button" onClick={() => handleDuplicateEventClick(event.id)}>Duplicate</button>
                                <button type="button" onClick={() => handleDeleteEventClick(event.id, event.title)} style={{ color: '#EF4444' }}>Delete</button>
                              </div>
                            )}
                          </div>

                          <div className="prof-schedule-event-time">
                            <span>{event.startTime}</span>
                            <i>-</i>
                            <span>{event.endTime}</span>
                          </div>

                          {!isCompact && (
                            <div className="prof-schedule-event-meta">
                              {!isMidCompact && event.specificParticipants && event.specificParticipants.length > 0 && (
                                <div className="prof-schedule-event-attendees" aria-label="Attendees">
                                  {Array.from({ length: Math.min(3, event.specificParticipants.length) }).map((_, aIdx) => (
                                    <img
                                      key={aIdx}
                                      className="prof-schedule-event-avatar"
                                      src="/assets/imgs/default-profile.png"
                                      alt=""
                                      style={{ zIndex: 4 - aIdx }}
                                    />
                                  ))}
                                  {event.specificParticipants.length > 3 && (
                                    <span className="prof-schedule-event-avatar-count">+{event.specificParticipants.length - 3}</span>
                                  )}
                                  {event.specificParticipants.length <= 3 && (
                                    <span className="prof-schedule-event-avatar-count">{event.specificParticipants.length}</span>
                                  )}
                                </div>
                              )}

                              <strong className={`is-${event.statusTone}`}>
                                <i></i>
                                <span>{event.status}</span>
                              </strong>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            )}
          </section>
        </section>
      </section>

      {/* --- ADD / EDIT / DUPLICATE EVENT MODAL --- */}
      {isModalOpen && (
        <div className="prof-management-modal is-open" aria-hidden={!isModalOpen}>
          <div className="prof-management-modal-backdrop" onClick={handleCloseModal}></div>

          <div className="prof-management-modal-dialog event-form-dialog" role="dialog" aria-modal="true" aria-labelledby="scheduleEventModalTitle">
            <div className="prof-management-modal-header">
              <h3 id="scheduleEventModalTitle">{isEditMode ? 'Edit Event' : (editingEventId === null && eventName.includes('(Copy)') ? 'Duplicate Event' : 'Add Event')}</h3>
              <button type="button" className="prof-management-modal-close" onClick={handleCloseModal} aria-label="Close modal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="prof-management-modal-body" onClick={() => {
              if (isStatusMenuOpen) setIsStatusMenuOpen(false);
              if (isTimePickerOpen) setIsTimePickerOpen(false);
              if (isCourseMenuOpen) setIsCourseMenuOpen(false);
            }}>
              <div className="prof-schedule-modal-grid">
                <div className="prof-schedule-modal-fields">

                  {/* Row 1 (Title) */}
                  <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                    <span>Event Name</span>
                    <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event title" />
                  </label>

                  {/* Row 2 (Subtitle & Associated Course) */}
                  <div className="prof-schedule-modal-row">
                    <label className="prof-schedule-modal-field">
                      <span>Event Subtitle</span>
                      <input type="text" value={eventSubtitle} onChange={(e) => setEventSubtitle(e.target.value)} placeholder="Optional subtitle" />
                    </label>

                    <div className="prof-schedule-modal-field" style={{ position: 'relative' }}>
                      <span>Associated Course</span>
                      <button
                        type="button"
                        className="prof-schedule-modal-select"
                        onClick={(e) => { e.stopPropagation(); setIsCourseMenuOpen(!isCourseMenuOpen); setIsStatusMenuOpen(false); setIsTimePickerOpen(false); }}
                      >
                        <span>{instructorCourses.find(c => String(c.id) === String(courseId))?.title || '-- None (General Event) --'}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                      {isCourseMenuOpen && (
                        <div className="prof-schedule-modal-status-menu" style={{ maxHeight: '200px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => { setCourseId(''); setIsCourseMenuOpen(false); }}>-- None (General Event) --</button>
                          {instructorCourses.map(course => (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => { setCourseId(String(course.id)); setIsCourseMenuOpen(false); }}
                            >
                              {course.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3 (Date/Time, Duration, Status) */}
                  <div className="prof-schedule-modal-row prof-schedule-modal-row--3">
                    <div className="prof-schedule-modal-field prof-schedule-modal-field--time">
                      <span>Event Time</span>
                      <div
                        className={`prof-schedule-modal-time-input ${isTimePickerOpen ? 'is-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setIsTimePickerOpen(!isTimePickerOpen); setIsStatusMenuOpen(false); }}
                      >
                        <input
                          type="text"
                          value={`${formatInputDateTime(selectedDate)} - ${formatTime12h(new Date(selectedDate.getTime() + Number(durationMinutes) * 60000))}`}
                          readOnly
                        />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>

                      {/* Time & Date Picker Panel */}
                      {isTimePickerOpen && (
                        <div className="prof-schedule-modal-picker" onClick={e => e.stopPropagation()}>
                          <div className="prof-schedule-modal-calendar">
                            <div className="prof-schedule-modal-calendar-head">
                              <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                              <strong>{calendarMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</strong>
                              <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
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
                              <button type="button" onClick={() => adjustTime('hour-up')}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                              </button>
                              <strong>{pad2(selectedDate.getHours() % 12 === 0 ? 12 : selectedDate.getHours() % 12)}</strong>
                              <button type="button" onClick={() => adjustTime('hour-down')}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </button>
                            </div>
                            <span className="prof-schedule-modal-time-sep">:</span>
                            <div className="prof-schedule-modal-timecol">
                              <button type="button" onClick={() => adjustTime('minute-up')}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                              </button>
                              <strong>{pad2(selectedDate.getMinutes())}</strong>
                              <button type="button" onClick={() => adjustTime('minute-down')}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </button>
                            </div>
                            <button type="button" className="prof-schedule-modal-meridiem" onClick={toggleMeridiem}>
                              {selectedDate.getHours() >= 12 ? 'PM' : 'AM'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="prof-schedule-modal-field">
                      <span>Duration (Minutes)</span>
                      <input
                        type="number"
                        min="15"
                        step="15"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        title="Duration in minutes"
                      />
                    </label>

                    <label className="prof-schedule-modal-field">
                      <span>Status</span>
                      <button
                        type="button"
                        className="prof-schedule-modal-select"
                        onClick={(e) => { e.stopPropagation(); setIsStatusMenuOpen(!isStatusMenuOpen); setIsTimePickerOpen(false); }}
                      >
                        <span className="prof-schedule-modal-status-dot"></span>
                        <span>{eventStatus}</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                      {isStatusMenuOpen && (
                        <div className="prof-schedule-modal-status-menu" onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => { setEventStatus('In-Review'); setIsStatusMenuOpen(false); }}>In-Review</button>
                          <button type="button" onClick={() => { setEventStatus('Confirmed'); setIsStatusMenuOpen(false); }}>Confirmed</button>
                          <button type="button" onClick={() => { setEventStatus('Draft'); setIsStatusMenuOpen(false); }}>Draft</button>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Row 4 (Event Format - Segments) */}
                  <div className="prof-schedule-modal-field prof-schedule-modal-field--full">
                    <span>Event Format</span>
                    <div className="prof-schedule-format-segments">
                      <button
                        type="button"
                        className={`format-segment-btn ${isVirtual ? 'is-active' : ''}`}
                        onClick={() => setIsVirtual(true)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        Virtual Event
                      </button>
                      <button
                        type="button"
                        className={`format-segment-btn ${!isVirtual ? 'is-active' : ''}`}
                        onClick={() => setIsVirtual(false)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        In-Person Event
                      </button>
                    </div>
                  </div>

                  {/* Row 5 (Conditional Venue Link / Location) */}
                  {isVirtual ? (
                    <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                      <span>Meeting Link (Zoom, Meet, Teams...)</span>
                      <input
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://zoom.us/j/..."
                      />
                    </label>
                  ) : (
                    <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                      <span>Physical Location / Venue Address</span>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Room 102, Science Hall or Building Address"
                      />
                    </label>
                  )}

                  {/* Row 6 (Access & Capacity Toggles) */}
                  <div className="prof-schedule-modal-row">
                    <div className="prof-schedule-modal-field">
                      <span>Registration Requirements</span>
                      <label className="prof-schedule-toggle-wrap">
                        <input
                          type="checkbox"
                          checked={registrationRequired}
                          onChange={(e) => setRegistrationRequired(e.target.checked)}
                        />
                        <span className="prof-schedule-toggle-slider"></span>
                        <span className="prof-schedule-toggle-label">Registration Required</span>
                      </label>
                    </div>

                    <label className={`prof-schedule-modal-field ${!registrationRequired ? 'is-hidden-capacity' : ''}`}>
                      <span>Max Attendees / Capacity</span>
                      <input
                        type="number"
                        min="1"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        placeholder="Unlimited"
                        disabled={!registrationRequired}
                      />
                    </label>
                  </div>

                  {/* Row 7 (Audience Collaboration) */}
                  <div className="prof-schedule-modal-field prof-schedule-modal-field--full" style={{ position: 'relative' }}>
                    <span>Invite Students</span>
                    <div className="prof-schedule-modal-search">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      <span>@</span>
                      <input
                        type="text"
                        value={collaboratorDraft}
                        onChange={(e) => setCollaboratorDraft(e.target.value)}
                        placeholder="Search student by name or email..."
                      />
                    </div>

                    {showSearchDropdown && searchResults.length > 0 && (
                      <div className="prof-schedule-modal-status-menu" style={{ position: 'absolute', top: '70px', left: 0, right: 0, zIndex: 1200, maxHeight: '200px', overflowY: 'auto' }}>
                        {searchResults.map(student => (
                          <button
                            key={student.id}
                            type="button"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px', gap: '2px', textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              if (!collaborators.some(c => c.id === student.id)) {
                                setCollaborators(prev => [...prev, {
                                  id: student.id,
                                  name: student.name,
                                  email: student.email,
                                  avatar: student.avatar ? (student.avatar.startsWith('http') ? student.avatar : `${API_BASE_URL}${student.avatar}`) : '/assets/imgs/default-profile.png'
                                }]);
                              }
                              setCollaboratorDraft('');
                              setSearchResults([]);
                              setShowSearchDropdown(false);
                            }}
                          >
                            <strong style={{ fontSize: '13px', color: '#450468' }}>{student.name}</strong>
                            <span style={{ fontSize: '11px', color: '#78829D' }}>{student.email}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="prof-schedule-modal-chips" style={{ marginTop: '8px' }}>
                      {collaborators.map(collab => (
                        <span key={collab.id} className="prof-schedule-modal-chip">
                          <img src={collab.avatar || '/assets/imgs/default-profile.png'} alt="" onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }} />
                          <span>{collab.name} {collab.email ? `(${collab.email})` : ''}</span>
                          <button type="button" onClick={() => setCollaborators(collaborators.filter(c => c.id !== collab.id))} aria-label="Remove collaborator">×</button>
                        </span>
                      ))}
                      {collaborators.length === 0 && (
                        <span style={{ fontSize: '12px', color: '#78829D', padding: '4px' }}>
                          No students invited yet. Search above or select an Associated Course.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 8 (Upload Files) */}
                  <label
                    className={`prof-schedule-modal-upload ${isDragOver ? 'is-dragover' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
                  >
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} />
                    <span className="prof-schedule-modal-upload-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4A0A73' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </span>
                    <span className="prof-schedule-modal-upload-copy">
                      <strong>
                        {uploadedFiles.length > 0
                          ? `${uploadedFiles[0].name}`
                          : (existingAttachmentName
                            ? `Existing: ${existingAttachmentName}`
                            : 'Drop a file here or click to upload.')
                        }
                      </strong>
                      <small>
                        {uploadedFiles.length > 0
                          ? 'Ready to upload'
                          : (existingAttachmentName
                            ? 'Click to replace attachment'
                            : 'Upload event case files, if any.')
                        }
                      </small>
                    </span>
                  </label>

                  {/* Row 9 (Description) */}
                  <label className="prof-schedule-modal-field prof-schedule-modal-field--full">
                    <span>Event Description</span>
                    <textarea rows="4" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Type something..."></textarea>
                  </label>
                </div>
              </div>

              <div className="prof-schedule-modal-actions">
                <button type="button" className="prof-schedule-modal-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="button" className="prof-schedule-modal-submit" onClick={isEditMode ? handleSaveEvent : handleCreateEvent}>
                  {isEditMode ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="prof-management-modal is-open">
          <div className="prof-management-modal-backdrop" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
          <div className="prof-management-modal-dialog confirmation-dialog animate-fade-in">
            <div className="prof-management-modal-header confirmation-header">
              <h3>{confirmModal.title}</h3>
              <button type="button" className="prof-management-modal-close" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="prof-management-modal-body confirmation-body">
              <p>{confirmModal.message}</p>
            </div>
            <div className="confirmation-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn-danger"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagementSchedule;