import React, { useState, useEffect, useRef, useCallback } from 'react';
import './EventFormModal.css';
import Toast from '../Toast/Toast';

const EventFormModal = ({ isOpen, onClose, onSuccess, event = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        status: 'draft',
        event_datetime: '',
        end_datetime: '',
        duration_minutes: '',
        location: '',
        description: '',
        audience_type: 'all',
        course_id: '',
        max_participants: '',
        registration_required: false,
        is_virtual: false,
        meeting_link: ''
    });
    
    const [courses, setCourses] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const fileInputRef = useRef(null);

    const handleCloseToast = useCallback(() => setToast(null), []);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Fetch approved courses list on open
    useEffect(() => {
        if (isOpen) {
            const fetchCourses = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/courses/admin/approved?limit=100`);
                    const result = await res.json();
                    if (res.ok && result.success && result.data && Array.isArray(result.data.data)) {
                        setCourses(result.data.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch courses:', err);
                }
            };
            fetchCourses();
        }
    }, [isOpen]);

    // Handle close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.create-event-search-wrapper')) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search for student users
    useEffect(() => {
        if (!studentSearch.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(studentSearch)}`);
                const result = await res.json();
                if (res.ok && result.success && Array.isArray(result.data)) {
                    setSearchResults(result.data);
                    setShowSearchDropdown(true);
                }
            } catch (err) {
                console.error('Error searching students:', err);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [studentSearch]);

    // Resolve specific participant IDs in edit mode
    useEffect(() => {
        const loadParticipants = async () => {
            if (event && Array.isArray(event.specific_participants) && event.specific_participants.length > 0) {
                try {
                    const resolved = await Promise.all(
                        event.specific_participants.map(async (id) => {
                            try {
                                const res = await fetch(`${API_BASE_URL}/api/users/${id}`);
                                const result = await res.json();
                                if (res.ok && result.success && result.data) {
                                    return {
                                        id: result.data.id,
                                        name: result.data.name,
                                        email: result.data.email
                                    };
                                }
                            } catch (e) {
                                console.error(`Failed to load profile for user ${id}:`, e);
                            }
                            return { id, name: `Student #${id}`, email: '' };
                        })
                    );
                    setSelectedStudents(resolved.filter(Boolean));
                } catch (err) {
                    console.error('Error pre-populating participants:', err);
                }
            } else {
                setSelectedStudents([]);
            }
        };
        if (isOpen) {
            loadParticipants();
        }
    }, [event, isOpen]);

    // Populate data when in edit mode
    useEffect(() => {
        if (isOpen) {
            if (event) {
                let formattedDate = '';
                if (event.event_datetime) {
                    try {
                        const date = new Date(event.event_datetime);
                        const tzOffset = date.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
                        formattedDate = localISOTime;
                    } catch (e) {
                        formattedDate = '';
                    }
                }

                let formattedEndDate = '';
                if (event.end_datetime) {
                    try {
                        const date = new Date(event.end_datetime);
                        const tzOffset = date.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
                        formattedEndDate = localISOTime;
                    } catch (e) {
                        formattedEndDate = '';
                    }
                }

                setFormData({
                    name: event.name || '',
                    subtitle: event.subtitle || '',
                    status: event.status || 'draft',
                    event_datetime: formattedDate,
                    end_datetime: formattedEndDate,
                    duration_minutes: event.duration_minutes || '',
                    location: event.location || '',
                    description: event.description || '',
                    audience_type: event.audience_type || 'all',
                    course_id: event.course_id || '',
                    max_participants: event.max_participants || '',
                    registration_required: !!event.registration_required,
                    is_virtual: !!event.is_virtual,
                    meeting_link: event.meeting_link || ''
                });
                setAttachmentName(event.attachment_name || '');
                setAttachment(null);
            } else {
                setFormData({
                    name: '',
                    subtitle: '',
                    status: 'draft',
                    event_datetime: '',
                    end_datetime: '',
                    duration_minutes: '',
                    location: '',
                    description: '',
                    audience_type: 'all',
                    course_id: '',
                    max_participants: '',
                    registration_required: false,
                    is_virtual: false,
                    meeting_link: ''
                });
                setAttachmentName('');
                setAttachment(null);
            }
        }
    }, [event, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCourseChange = async (e) => {
        const selectedCourseId = e.target.value;
        setFormData(prev => ({ ...prev, course_id: selectedCourseId }));

        if (!selectedCourseId) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/courses/${selectedCourseId}/enrollments`);
            const result = await res.json();
            if (res.ok && result.success && Array.isArray(result.data)) {
                const enrolledStudents = result.data.map(en => ({
                    id: en.id, // user ID
                    name: en.student_name,
                    email: en.student_email
                }));
                // Add course students without duplicates
                setSelectedStudents(prev => {
                    const map = new Map(prev.map(s => [s.id, s]));
                    enrolledStudents.forEach(s => map.set(s.id, s));
                    return Array.from(map.values());
                });
            }
        } catch (err) {
            console.error('Failed to load course students:', err);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudents(prev => {
            if (prev.some(s => s.id === student.id)) return prev;
            return [...prev, { id: student.id, name: student.name, email: student.email }];
        });
        setStudentSearch('');
        setSearchResults([]);
        setShowSearchDropdown(false);
    };

    const handleRemoveStudent = (id) => {
        setSelectedStudents(prev => prev.filter(s => s.id !== id));
    };

    const handleAttachmentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachment(file);
            setAttachmentName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setToast({ message: 'Event Name is required', type: 'error' });
            return;
        }

        if (!formData.event_datetime) {
            setToast({ message: 'Event Date & Time is required', type: 'error' });
            return;
        }

        if (formData.audience_type === 'specific' && selectedStudents.length === 0) {
            setToast({ message: 'Please tag at least one student for specific audience type', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('subtitle', formData.subtitle.trim());
            formDataToSend.append('status', formData.status);
            formDataToSend.append('event_datetime', new Date(formData.event_datetime).toISOString());
            
            if (formData.end_datetime) {
                formDataToSend.append('end_datetime', new Date(formData.end_datetime).toISOString());
            }
            if (formData.duration_minutes) {
                formDataToSend.append('duration_minutes', parseInt(formData.duration_minutes, 10));
            }
            formDataToSend.append('location', formData.location.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('audience_type', formData.audience_type);
            
            if (formData.audience_type === 'specific') {
                formDataToSend.append('specific_participants', JSON.stringify(selectedStudents.map(s => String(s.id))));
            }

            if (formData.course_id) {
                formDataToSend.append('course_id', parseInt(formData.course_id, 10));
            }
            if (formData.max_participants) {
                formDataToSend.append('max_participants', parseInt(formData.max_participants, 10));
            }
            formDataToSend.append('registration_required', formData.registration_required ? 'true' : 'false');
            formDataToSend.append('is_virtual', formData.is_virtual ? 'true' : 'false');
            formDataToSend.append('meeting_link', formData.meeting_link.trim());

            if (attachment) {
                formDataToSend.append('attachment', attachment);
            }

            const token = localStorage.getItem('token');
            const url = event 
                ? `${API_BASE_URL}/api/events/${event.id}`
                : `${API_BASE_URL}/api/events`;
            
            const method = event ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formDataToSend
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error?.message || result.message || `Failed to ${event ? 'update' : 'create'} event`);
            }

            if (result.success) {
                setToast({ message: `Event ${event ? 'updated' : 'created'} successfully!`, type: 'success' });
                setTimeout(() => {
                    onSuccess(event ? 'Event updated successfully!' : 'Event created successfully!');
                    handleClose();
                }, 1500);
            } else {
                throw new Error(result.message || 'Action failed');
            }
        } catch (err) {
            setToast({ message: err.message || `Failed to ${event ? 'update' : 'create'} event`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            subtitle: '',
            status: 'draft',
            event_datetime: '',
            end_datetime: '',
            duration_minutes: '',
            location: '',
            description: '',
            audience_type: 'all',
            course_id: '',
            max_participants: '',
            registration_required: false,
            is_virtual: false,
            meeting_link: ''
        });
        setSelectedStudents([]);
        setStudentSearch('');
        setSearchResults([]);
        setAttachment(null);
        setAttachmentName('');
        setToast(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="create-event-modal-overlay" onClick={handleClose}>
            <div className="create-event-modal-content" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={handleClose}
                    className="create-event-modal-close"
                >
                    ×
                </button>

                <div className="create-event-modal-header">
                    <h2>{event ? 'Edit Event' : 'Create Event'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="create-event-row">
                        <div className="create-event-form-group">
                            <label className="create-event-form-label required">Event Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Math Exam Prep"
                                className="create-event-form-input"
                                required
                            />
                        </div>
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Subtitle</label>
                            <input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="Short summary"
                                className="create-event-form-input"
                            />
                        </div>
                    </div>

                    <div className="create-event-row">
                        <div className="create-event-form-group">
                            <label className="create-event-form-label required">Event Date & Time</label>
                            <input
                                type="datetime-local"
                                name="event_datetime"
                                value={formData.event_datetime}
                                onChange={handleChange}
                                className="create-event-form-input"
                                required
                            />
                        </div>
                        <div className="create-event-row-sub">
                            <div className="create-event-form-group">
                                <label className="create-event-form-label">Duration (Min)</label>
                                <input
                                    type="number"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleChange}
                                    placeholder="e.g., 90"
                                    className="create-event-form-input"
                                />
                            </div>
                            <div className="create-event-form-group">
                                <label className="create-event-form-label">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="end_datetime"
                                    value={formData.end_datetime}
                                    onChange={handleChange}
                                    className="create-event-form-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="create-event-form-group">
                        <label className="create-event-form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide full details of the event planning"
                            rows={3}
                            className="create-event-form-textarea"
                        />
                    </div>

                    <div className="create-event-row">
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Audience Type</label>
                            <select
                                name="audience_type"
                                value={formData.audience_type}
                                onChange={handleChange}
                                className="create-event-form-select"
                            >
                                <option value="all">All Students</option>
                                <option value="specific">Specific Students</option>
                            </select>
                        </div>
                        
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Associated Course</label>
                            <select
                                name="course_id"
                                value={formData.course_id}
                                onChange={handleCourseChange}
                                className="create-event-form-select"
                            >
                                <option value="">Select a Course (Optional)</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {formData.audience_type === 'specific' && (
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Search & Tag Students</label>
                            <div className="create-event-search-wrapper">
                                <input
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="Search by student name or email..."
                                    className="create-event-form-input"
                                />
                                {showSearchDropdown && searchResults.length > 0 && (
                                    <div className="create-event-search-results">
                                        {searchResults.map(student => (
                                            <div
                                                key={student.id}
                                                className="create-event-search-item"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelectStudent(student);
                                                }}
                                            >
                                                <strong>{student.name}</strong>
                                                <span>{student.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="create-event-chips">
                                {selectedStudents.map(student => (
                                    <div key={student.id} className="create-event-chip">
                                        <span>{student.name} ({student.email})</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStudent(student.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {selectedStudents.length === 0 && (
                                    <span style={{ fontSize: '12px', color: '#A1A5B7', padding: '4px' }}>
                                        No tagged students yet. Search above or select a Course.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="create-event-row">
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Location (Physical)</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Room or Address"
                                className="create-event-form-input"
                            />
                        </div>
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Max Participants</label>
                            <input
                                type="number"
                                name="max_participants"
                                value={formData.max_participants}
                                onChange={handleChange}
                                placeholder="e.g., 50"
                                className="create-event-form-input"
                            />
                        </div>
                    </div>

                    <div className="create-event-row">
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="create-event-form-select"
                            >
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="create-event-row-checkboxes">
                        <div className="create-event-checkbox-group">
                            <input
                                type="checkbox"
                                id="is_virtual"
                                name="is_virtual"
                                checked={formData.is_virtual}
                                onChange={handleChange}
                                className="create-event-checkbox"
                            />
                            <label htmlFor="is_virtual">Is Virtual Meeting</label>
                        </div>
                        <div className="create-event-checkbox-group">
                            <input
                                type="checkbox"
                                id="registration_required"
                                name="registration_required"
                                checked={formData.registration_required}
                                onChange={handleChange}
                                className="create-event-checkbox"
                            />
                            <label htmlFor="registration_required">Registration Required</label>
                        </div>
                    </div>

                    {formData.is_virtual && (
                        <div className="create-event-form-group">
                            <label className="create-event-form-label">Meeting URL (Zoom/Teams)</label>
                            <input
                                type="url"
                                name="meeting_link"
                                value={formData.meeting_link}
                                onChange={handleChange}
                                placeholder="https://zoom.us/j/..."
                                className="create-event-form-input"
                            />
                        </div>
                    )}

                    <div className="create-event-form-group">
                        <label className="create-event-form-label">Event Attachment/Resource</label>
                        <div className="create-event-file-upload" onClick={() => fileInputRef.current?.click()}>
                            <div className="create-event-file-placeholder">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                </svg>
                                <p>{attachmentName ? `Selected: ${attachmentName}` : 'Click to attach resource file'}</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleAttachmentChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="create-event-form-actions">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="create-event-btn create-event-btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="create-event-btn create-event-btn-primary"
                        >
                            {event ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Creating...' : 'Create Event')}
                        </button>
                    </div>
                </form>

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.type === 'error' ? 8000 : 3000}
                        onClose={handleCloseToast}
                    />
                )}
            </div>
        </div>
    );
};

export default EventFormModal;
