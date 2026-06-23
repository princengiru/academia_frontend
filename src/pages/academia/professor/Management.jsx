import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Management = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State & Path Checking ---
  const isSyllabusView = location.pathname.includes('management-syllabuses');
  const activeTab = isSyllabusView ? 'management-syllabuses' : 'management';

  const managementTabs = [
    { id: 'management', label: 'Courses' },
    { id: 'management-syllabuses', label: 'Syllabuses' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Table & Fetch State ---
  const [courses, setCourses] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Search & Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Status');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // --- Pagination State ---
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // --- Table Selection State ---
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const selectAllRef = useRef(null);

  // --- Action Dropdown State ---
  const [openRowMenuId, setOpenRowMenuId] = useState(null);

  // --- Modal Drawer State (Enrolled Students) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCourseTitle, setModalCourseTitle] = useState('');
  const [modalStudents, setModalStudents] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // --- UI Toast Message ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const filterOptions = ['All Status', 'Published', 'Draft', 'Pending Approval', 'Rejected'];

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (!event.target.closest('.prof-row-action-menu')) {
        setOpenRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on query change
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Data
  const loadDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication missing. Please sign in.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load dashboard data');

      const rawCourses = data?.data?.courses || [];
      const rawSyllabuses = data?.data?.syllabuses || [];
      const earnings = data?.data?.courseEarnings || [];

      const mapped = rawCourses.map((c) => {
        const earn = earnings.find(e => e.id === c.id) || {};
        const studentsCount = earn.students || 0;
        const revenue = earn.course_revenue || 0;

        return {
          id: c.id,
          title: c.title || 'Untitled Course',
          description: c.description || 'No description provided.',
          thumbnail: c.thumbnail_url || c.thumbnail || '',
          category: c.category || 'Uncategorized',
          level: c.level ? (c.level.charAt(0).toUpperCase() + c.level.slice(1)) : 'Beginner',
          language: c.language || 'English',
          duration_weeks: c.duration_weeks || 4,
          price: parseFloat(c.price || 0),
          status: c.status || 'draft',
          status_approval: c.status_approval || 'pending',
          rejection_reason: c.rejection_reason || null,
          studentsCount,
          revenue,
          created_at: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        };
      });

      const mappedSyllabuses = rawSyllabuses.map((s) => {
        return {
          id: s.id,
          title: s.title || 'Untitled Syllabus',
          description: s.description || 'No description provided.',
          thumbnail: s.thumbnail_url || '',
          category: s.category || 'Uncategorized',
          level: s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Beginner',
          price: parseFloat(s.price || 0),
          subscription_price: parseFloat(s.subscription_price || 0),
          status: s.status || 'draft',
          status_approval: s.status_approval || 'pending',
          rejection_reason: s.rejection_reason || null,
          outline_count: s.outline_count || 0,
          created_at: s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        };
      });

      setCourses(mapped);
      setSyllabuses(mappedSyllabuses);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 3. Client-side Search and Filters
  const filteredCourses = useMemo(() => {
    let result = isSyllabusView ? syllabuses : courses;

    // Status Filter
    if (activeFilter !== 'All Status') {
      const filterKey = activeFilter.toLowerCase();
      if (filterKey === 'pending approval') {
        result = result.filter(r => String(r.status_approval).toLowerCase() === 'pending');
      } else if (filterKey === 'rejected') {
        result = result.filter(r => String(r.status_approval).toLowerCase() === 'rejected');
      } else if (filterKey === 'approved') {
        result = result.filter(r => String(r.status_approval).toLowerCase() === 'approved');
      } else {
        result = result.filter(r => String(r.status).toLowerCase() === filterKey);
      }
    }

    // Debounced Search Text
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(r => (
        String(r.title).toLowerCase().includes(q) ||
        String(r.category).toLowerCase().includes(q) ||
        String(r.level).toLowerCase().includes(q)
      ));
    }

    return result;
  }, [courses, syllabuses, isSyllabusView, debouncedSearch, activeFilter]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage);
  }, [safeCurrentPage, currentPage]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentRows = filteredCourses.slice(startIndex, startIndex + pageSize);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safeCurrentPage === 1) return [1, 2, 3];
    if (safeCurrentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1];
  }, [safeCurrentPage, totalPages]);

  // Checkbox Multiselect logic
  const isAllVisibleSelected = currentRows.length > 0 && currentRows.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = currentRows.some(row => selectedRowIds.has(row.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      currentRows.forEach(row => isChecked ? next.add(row.id) : next.delete(row.id));
      return next;
    });
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Row Actions Handlers ---

  const handleEditCourse = (courseId) => {
    navigate('/academia/professor/prepare-course', { state: { courseId } });
  };

  const handleEditSyllabus = (syllabusId) => {
    navigate('/academia/professor/prepare-syllabus', { state: { syllabusId } });
  };

  const handlePublishCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Course published successfully!', 'success');
        loadDashboardData();
      } else {
        showToast(data.message || 'Failed to publish course', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing course', 'error');
    }
  };

  const handlePublishSyllabus = async (syllabusId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'published' })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Syllabus published successfully!', 'success');
        loadDashboardData();
      } else {
        showToast(data.message || 'Failed to publish syllabus', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing syllabus', 'error');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will remove all syllabus and chapters.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Course deleted successfully!', 'success');
        loadDashboardData();
      } else {
        showToast(data.message || 'Failed to delete course', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting course', 'error');
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm('Are you sure you want to delete this syllabus?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Syllabus deleted successfully!', 'success');
        loadDashboardData();
      } else {
        showToast(data.message || 'Failed to delete syllabus', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting syllabus', 'error');
    }
  };

  // --- Bulk Actions Handlers ---

  const handleBulkPublish = async () => {
    if (selectedRowIds.size === 0) return;
    const idsArray = Array.from(selectedRowIds);
    let succeeded = 0;
    let failed = 0;
    const token = localStorage.getItem('token');

    for (const id of idsArray) {
      try {
        const url = isSyllabusView ? `${API_BASE_URL}/api/syllabuses/${id}` : `${API_BASE_URL}/api/courses/${id}/publish`;
        const method = 'PUT';
        const body = isSyllabusView ? JSON.stringify({ status: 'published' }) : undefined;

        const res = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body
        });
        if (res.ok) succeeded++;
        else failed++;
      } catch (err) {
        failed++;
      }
    }

    showToast(`Bulk publish complete! Succeeded: ${succeeded}, Failed: ${failed}`, succeeded > 0 ? 'success' : 'error');
    setSelectedRowIds(new Set());
    loadDashboardData();
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.size === 0) return;
    const itemLabel = isSyllabusView ? 'syllabuses' : 'courses';
    if (!window.confirm(`Are you sure you want to delete the ${selectedRowIds.size} selected ${itemLabel}?`)) return;

    const idsArray = Array.from(selectedRowIds);
    let succeeded = 0;
    let failed = 0;
    const token = localStorage.getItem('token');

    for (const id of idsArray) {
      try {
        const url = isSyllabusView ? `${API_BASE_URL}/api/syllabuses/${id}` : `${API_BASE_URL}/api/courses/${id}`;
        const res = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) succeeded++;
        else failed++;
      } catch (err) {
        failed++;
      }
    }

    showToast(`Bulk delete complete! Succeeded: ${succeeded}, Failed: ${failed}`, succeeded > 0 ? 'success' : 'error');
    setSelectedRowIds(new Set());
    loadDashboardData();
  };

  // --- Enrolled Students Fetching & Modal ---

  const handleViewStudents = async (courseId, courseTitle) => {
    setModalCourseTitle(courseTitle);
    setIsModalOpen(true);
    setModalLoading(true);
    setModalStudents([]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setModalStudents(data.data);
      } else if (res.ok && Array.isArray(data)) {
        setModalStudents(data);
      } else {
        console.error('Unexpected database enrollments response:', data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading student enrollments', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalStudents([]);
  };

  // Formatting amount
  const formatPrice = (price) => {
    if (price <= 0) return 'Free';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  const formatRevenue = (rev) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(rev);
  };

  const renderRows = () => {
    const activeItemsLength = isSyllabusView ? syllabuses.length : courses.length;
    if (isLoading && activeItemsLength === 0) {
      return (
        <tr>
          <td colSpan={isSyllabusView ? 8 : 9} style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '1.8rem', height: '1.8rem' }}></div>
            <p style={{ marginTop: '10px', color: '#6B7280', fontSize: '13px' }}>Loading {isSyllabusView ? 'syllabuses' : 'courses'} data...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={isSyllabusView ? 8 : 9} style={{ textAlign: 'center', padding: '3rem', color: '#EF4444' }}>
            <strong>Error:</strong> {error}
          </td>
        </tr>
      );
    }

    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan={isSyllabusView ? 8 : 9} style={{ padding: '3.5rem' }}>
            <div className="prof-management-empty-state">
              <div className="prof-management-empty-state-card">
                <h3>No {isSyllabusView ? 'syllabuses' : 'courses'} found</h3>
                <p>{debouncedSearch ? 'Adjust your search queries or filters.' : `You haven't prepared any ${isSyllabusView ? 'syllabuses' : 'online courses'} yet. Build one to get started!`}</p>
                {!debouncedSearch && (
                  <div className="prof-management-empty-state-actions">
                    <button className="learners-btn learners-btn-primary" onClick={() => navigate(isSyllabusView ? '/academia/professor/prepare-syllabus' : '/academia/professor/prepare-course')}>
                      Create {isSyllabusView ? 'Syllabus' : 'Course'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return currentRows.map((row) => {
      // Determine publish status tone (Draft or Published)
      let publishClass = 'pill-gray';
      let publishLabel = 'Draft';
      const statusLower = String(row.status || 'draft').toLowerCase();
      if (statusLower === 'published') {
        publishClass = 'pill-green';
        publishLabel = 'Published';
      }

      // Determine review status tone (Approved, Pending, Rejected)
      let reviewClass = 'pill-orange';
      let reviewLabel = 'Pending';
      const approvalLower = String(row.status_approval || 'pending').toLowerCase();
      if (approvalLower === 'approved') {
        reviewClass = 'pill-green';
        reviewLabel = 'Approved';
      } else if (approvalLower === 'rejected') {
        reviewClass = 'pill-red';
        reviewLabel = 'Rejected';
      }

      return (
        <tr
          key={row.id}
          onClick={() => {
            if (isSyllabusView) {
              handleEditSyllabus(row.id);
            } else {
              handleViewStudents(row.id, row.title);
            }
          }}
          style={{ cursor: 'pointer' }}
          className={selectedRowIds.has(row.id) ? 'is-selected' : ''}
        >
          <td className="is-checkbox" onClick={(e) => e.stopPropagation()}>
            <label className="prof-table-checkbox" aria-label={`Select ${row.title}`}>
              <input
                type="checkbox"
                checked={selectedRowIds.has(row.id)}
                onChange={(e) => handleSelectRow(e, row.id)}
              />
              <span></span>
            </label>
          </td>
          <td>
            <div className="prof-course-details-col">
              {row.thumbnail ? (
                <img
                  src={row.thumbnail.startsWith('http') ? row.thumbnail : `${API_BASE_URL}${row.thumbnail}`}
                  alt=""
                  className="prof-course-thumbnail"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="prof-course-gradient-placeholder">
                  {row.title.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="prof-course-meta">
                <h4>{row.title}</h4>
                <p>{row.category} • {row.level}{!isSyllabusView && ` • ${row.duration_weeks} Weeks`}</p>
              </div>
            </div>
          </td>
          <td className="fw-600">
            {isSyllabusView ? formatPrice(row.subscription_price || row.price) : formatPrice(row.price)}
          </td>
          {isSyllabusView ? (
            <td className="fw-500 text-center">{row.outline_count} topic(s)</td>
          ) : (
            <>
              <td className="fw-500 text-center">{row.studentsCount} student(s)</td>
              <td className="fw-600 text-center">{formatRevenue(row.revenue)}</td>
            </>
          )}
          <td className="fw-500">{row.created_at}</td>
          <td>
            <span className={`status-pill ${publishClass}`}>
              <span className="dot"></span> {publishLabel}
            </span>
          </td>
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }} onClick={(e) => e.stopPropagation()}>
              <span className={`status-pill ${reviewClass}`}>
                <span className="dot"></span> {reviewLabel}
              </span>
              {approvalLower === 'rejected' && row.rejection_reason && (
                <span 
                  className="prof-rejection-reason-text" 
                  title={row.rejection_reason}
                  style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  Reason: {row.rejection_reason}
                </span>
              )}
            </div>
          </td>
          <td className="action-col" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {!isSyllabusView && (
                <button
                  type="button"
                  className="prof-action-btn-circle"
                  onClick={() => handleViewStudents(row.id, row.title)}
                  title="View Enrolled Students"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              )}

              <div className="prof-row-action-menu" style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="prof-action-btn-circle"
                  onClick={() => setOpenRowMenuId(openRowMenuId === row.id ? null : row.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                </button>

                {openRowMenuId === row.id && (
                  <div className="prof-row-dropdown-menu">
                    <button
                      type="button"
                      onClick={() => {
                        if (isSyllabusView) {
                          handleEditSyllabus(row.id);
                        } else {
                          handleEditCourse(row.id);
                        }
                        setOpenRowMenuId(null);
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                      Edit Builder
                    </button>
                    {row.status !== 'published' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSyllabusView) {
                            handlePublishSyllabus(row.id);
                          } else {
                            handlePublishCourse(row.id);
                          }
                          setOpenRowMenuId(null);
                        }}
                        style={{ color: '#10B981' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Publish {isSyllabusView ? 'Syllabus' : 'Course'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isSyllabusView) {
                          handleDeleteSyllabus(row.id);
                        } else {
                          handleDeleteCourse(row.id);
                        }
                        setOpenRowMenuId(null);
                      }}
                      style={{ color: '#EF4444' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      Delete {isSyllabusView ? 'Syllabus' : 'Course'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page">

        {/* Floating Toast Notification */}
        {toast.show && (
          <div className={`prof-toast-container toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}

        {/* Header section */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); loadDashboardData(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                <span>Refresh Data</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/" target="_blank" rel="noreferrer">
                <span>Go to website</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-45deg)' }}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </a>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
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

        {/* Filter, Search & Create Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>{isSyllabusView ? 'Syllabus Management' : 'Course Management'}</h2>
            <p>{isSyllabusView ? 'Administer, publish and organize outlines for your syllabuses' : 'Administer, publish and view student enrollments for your programs'}</p>
          </div>

          <div className="assessments-hero-actions">
            {/* Search Input */}
            <div className="assessments-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="search"
                placeholder={isSyllabusView ? 'Search Syllabuses...' : 'Search Courses...'}
                aria-label={isSyllabusView ? 'Search Syllabuses' : 'Search Courses'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="prof-filter-dropdown-wrapper" ref={filterRef}>
              <button
                type="button"
                className={`prof-btn-filter ${activeFilter !== 'All Status' ? 'filter-active' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>{activeFilter}</span>
              </button>
              {isFilterOpen && (
                <div className="prof-filter-dropdown-menu">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`prof-filter-option ${activeFilter === option ? 'is-active' : ''}`}
                      onClick={() => { setActiveFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Button */}
            <button
              type="button"
              className="assessments-create-btn"
              onClick={() => navigate(isSyllabusView ? '/academia/professor/prepare-syllabus' : '/academia/professor/prepare-course')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>{isSyllabusView ? 'Prepare Syllabus' : 'Prepare Course'}</span>
            </button>
          </div>
        </section>

        {/* Bulk Action Bar (Displayed when checklists are selected) */}
        {selectedRowIds.size > 0 && (
          <div className="prof-bulk-actions-bar animate-fade-in">
            <span className="selected-count">{selectedRowIds.size} {isSyllabusView ? 'syllabuses' : 'courses'} selected</span>
            <div className="bulk-actions-buttons">
              <button type="button" className="bulk-btn bulk-btn-publish" onClick={handleBulkPublish}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Publish Selected
              </button>
              <button type="button" className="bulk-btn bulk-btn-delete" onClick={handleBulkDelete}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete Selected
              </button>
              <button type="button" className="bulk-btn bulk-btn-cancel" onClick={() => setSelectedRowIds(new Set())}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Main Table section */}
        <section className="assessments-table-wrap">
          <div className="table-responsive">
            <table className="assessments-table prof-courses-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label={`Select all ${isSyllabusView ? 'syllabuses' : 'courses'}`}>
                      <input
                        type="checkbox"
                        ref={selectAllRef}
                        checked={isAllVisibleSelected}
                        onChange={handleSelectAll}
                      />
                      <span></span>
                    </label>
                  </th>
                  <th>{isSyllabusView ? 'Syllabus Details' : 'Course Details'} ({filteredCourses.length})</th>
                  <th>Price</th>
                  {isSyllabusView ? (
                    <th className="text-center">Chapters</th>
                  ) : (
                    <>
                      <th className="text-center">Enrolled</th>
                      <th className="text-center">Total Revenue</th>
                    </>
                  )}
                  <th>Created Date</th>
                  <th>Publish Status</th>
                  <th>Review Status</th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                {renderRows()}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="assessments-footer">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <ul className="dropdown-menu">
                  {[5, 10, 25].map(size => (
                    <li key={size}>
                      <button type="button" className="dropdown-item" onClick={() => handlePageSizeChange(size)}>
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>
                {filteredCourses.length === 0 ? '0-0 of 0' : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredCourses.length)} of ${filteredCourses.length}`}
              </span>
              <button
                type="button"
                className="assessments-page-nav"
                aria-label="Previous"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
              >
                ←
              </button>

              {visiblePageNumbers.map(num => (
                <button
                  key={num}
                  type="button"
                  className={`assessments-page-num ${safeCurrentPage === num ? 'is-active' : ''}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                className="assessments-page-nav"
                aria-label="Next"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </section>

      </section>

      {/* Enrolled Students Modal */}
      {isModalOpen && (
        <div className="prof-management-modal is-open">
          <div className="prof-management-modal-backdrop" onClick={closeModal}></div>
          <div className="prof-management-modal-dialog">
            <div className="prof-management-modal-header">
              <div>
                <h3>Students Enrolled</h3>
                <p className="modal-subtitle">Course: <strong>{modalCourseTitle}</strong> ({modalStudents.length} enrolled)</p>
              </div>
              <button type="button" className="prof-management-modal-close" onClick={closeModal} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="prof-management-modal-body">
              {modalLoading ? (
                <div className="modal-loading-state">
                  <div className="spinner-border text-primary" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                  <p style={{ marginTop: '10px' }}>Loading student list...</p>
                </div>
              ) : modalStudents.length === 0 ? (
                <div className="modal-empty-state">
                  <p>No students are currently enrolled in this course.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="modal-students-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalStudents.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="modal-user-col">
                              <img
                                src={student.avatar ? (student.avatar.startsWith('http') ? student.avatar : `${API_BASE_URL}${student.avatar}`) : '/assets/imgs/default-profile.png'}
                                alt=""
                                className="modal-avatar"
                                onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                              />
                              <span className="modal-student-name">{student.student_name || student.student_email || 'Unknown Student'}</span>
                            </div>
                          </td>
                          <td>{student.student_email}</td>
                          <td>{student.created_at ? new Date(student.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProfessorLayout>
  );
};

export default Management;