import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import { HOALoadError, HOALoading, HOAEmptyState, HOATableEmptyRow } from './HOAPageState';
import { HOAToast, useHOAToast } from './useHOAToast';
import './hoa-tutors.css';

// --- Icons & Images ---
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoaopenview from '../../../assets/icons/hoaopenview.svg';
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoauserbadge from '../../../assets/icons/hoauserbadge.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoagrayphone from '../../../assets/icons/hoagrayphone.svg';
import hoagraymail from '../../../assets/icons/hoagraymail.svg';
import hoaverticaldots from '../../../assets/icons/hoaverticaldots.svg';
import hoadownload from '../../../assets/icons/hoadownload.svg';
import hoaknot from '../../../assets/icons/hoaknot.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoadownloadall from '../../../assets/icons/hoadownloadall.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoausericon from '../../../assets/icons/hoausericon.svg';
import hoalocation from '../../../assets/icons/hoalocation.svg';
import hoabriefcase from '../../../assets/icons/hoabriefcase.svg';
import hoafollowers from '../../../assets/icons/hoafollowers.svg';
import hoaproject from '../../../assets/imgs/hoaproject.png';
import hoacalendar from '../../../assets/icons/hoacalendar.svg';
import hoavbadge from '../../../assets/icons/hoavbadge.svg';
import hoareply from '../../../assets/icons/hoareply.svg';
import hoayellowstar from '../../../assets/icons/hoayellowstar.svg';
import hoasyllabus from '../../../assets/icons/hoasyllabus.svg';
import hoaonlinecourses from '../../../assets/icons/hoaonlinecourses.svg';
import hoaprojects from '../../../assets/icons/hoaprojects.svg';
import hoatotalstudents from '../../../assets/icons/hoatotalstudents.svg';
import hoabrickspattern from '../../../assets/imgs/hoabrickspattern.png';
import defaultAvatar from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return (
    <>
      {day} - {month} - {year} <span className="font-11-gray500">{hours}:{minutes}:{seconds}</span>
    </>
  );
};

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return defaultAvatar;
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;
  return `${API_BASE_URL}${avatarPath}`;
};

const HOATutors = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const { currency, setCurrency, formatAmount } = useCurrency();
  const { toast, showToast, hideToast } = useHOAToast();

  // --- Main Data State ---
  const [tutorsData, setTutorsData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // --- UI/Filter State ---
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Tutors');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('5');
  const pageSizeOptions = ['5', '10', '25'];

  // --- Dropdowns & Refs ---
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const pageSizeRef = useRef(null);
  const filterRef = useRef(null);
  const flagRef = useRef(null);

  // --- Modal & Detailed View State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTutorId, setActiveTutorId] = useState(null);
  const [activeTutorProfile, setActiveTutorProfile] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalSelectedRows, setModalSelectedRows] = useState([]);
  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  const [likedProjects, setLikedProjects] = useState({});
  const [openAttendees, setOpenAttendees] = useState(false);

  const [submittingCourseId, setSubmittingCourseId] = useState(null);
  const [submittingSyllabusId, setSubmittingSyllabusId] = useState(null);
  const [openModalCourseActionId, setOpenModalCourseActionId] = useState(null);

  const handleApproveCourse = async (courseId) => {
    setSubmittingCourseId(courseId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/admin/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to approve course.");
      
      setActiveTutorProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coursesWithDetails: (prev.coursesWithDetails || []).map(c => 
            c.id === courseId ? { ...c, status_approval: 'approved' } : c
          )
        };
      });
      showToast('Course approved successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve course.', 'error');
    } finally {
      setSubmittingCourseId(null);
      setOpenModalCourseActionId(null);
    }
  };

  const handleRejectCourse = async (courseId) => {
    const reason = prompt("Enter reason for rejection:");
    if (reason === null) return;
    
    setSubmittingCourseId(courseId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/admin/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error("Failed to reject course.");
      
      setActiveTutorProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          coursesWithDetails: (prev.coursesWithDetails || []).map(c => 
            c.id === courseId ? { ...c, status_approval: 'rejected' } : c
          )
        };
      });
      showToast('Course rejected.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reject course.', 'error');
    } finally {
      setSubmittingCourseId(null);
      setOpenModalCourseActionId(null);
    }
  };

  const handleApproveSyllabus = async (syllabusId) => {
    setSubmittingSyllabusId(syllabusId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}/admin/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to approve syllabus.");
      
      setActiveTutorProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          allSyllabuses: (prev.allSyllabuses || []).map(s => 
            s.id === syllabusId ? { ...s, status_approval: 'approved' } : s
          )
        };
      });
      showToast('Syllabus approved successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve syllabus.', 'error');
    } finally {
      setSubmittingSyllabusId(null);
    }
  };

  const handleRejectSyllabus = async (syllabusId) => {
    const reason = prompt("Enter reason for rejection:");
    if (reason === null) return;
    
    setSubmittingSyllabusId(syllabusId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}/admin/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error("Failed to reject syllabus.");
      
      setActiveTutorProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          allSyllabuses: (prev.allSyllabuses || []).map(s => 
            s.id === syllabusId ? { ...s, status_approval: 'rejected' } : s
          )
        };
      });
      showToast('Syllabus rejected.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reject syllabus.', 'error');
    } finally {
      setSubmittingSyllabusId(null);
    }
  };
  const [openThisWeek, setOpenThisWeek] = useState(false);
  const [activeWeekFilter, setActiveWeekFilter] = useState('This week');
  const weekFilters = ['Today', 'This week', 'This month', 'This year'];
  const [openDots, setOpenDots] = useState(null);

  const filterOptions = ['All Tutors', 'Active', 'Inactive', 'Suspended'];

  const attendeesList = [
    { name: 'John Doe', avatar: defaultAvatar },
    { name: 'Jane Smith', avatar: defaultAvatar },
    { name: 'Esther Howard', avatar: defaultAvatar },
    { name: 'Cody Fisher', avatar: defaultAvatar },
  ];

  // --- Click Outside Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target)) setIsPageSizeOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
      if (flagRef.current && !flagRef.current.contains(event.target)) setOpenFlagDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Data Fetching ---
  const fetchTutorsData = async (mounted = true) => {
    setIsLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/signin');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, tutorsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/instructors/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/instructors`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/reports/payment-summary`, { headers }).catch(() => null),
      ]);

      if (!mounted) return;

      // Check for token expiry
      if (statsRes?.status === 401 || tutorsRes?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/signin');
        return;
      }

      let nextStats = {};
      if (statsRes?.ok) {
        const sBody = await statsRes.json();
        nextStats = sBody?.data || sBody || {};
      }

      // Prefer payment-summary totals when available (same source as Finance)
      if (summaryRes?.ok) {
        const summaryBody = await summaryRes.json();
        const totals = summaryBody?.data?.totals || {};
        if (totals.total_paid != null) {
          nextStats = {
            ...nextStats,
            total_revenue: totals.total_paid,
            amount_paid: totals.total_paid,
            upload_payments: totals.total_fees ?? nextStats.upload_payments ?? 0,
            total_payouts: 0,
            payouts_available: false,
          };
        }
      }

      setStatsData(nextStats);

      if (tutorsRes?.ok) {
        const tBody = await tutorsRes.json();
        const list = Array.isArray(tBody?.data) ? tBody.data : (Array.isArray(tBody) ? tBody : []);
        
        setTutorsData(list.map(tutor => ({
          id: tutor.id || tutor._id,
          name: tutor.name || 'Unknown Tutor',
          location: tutor.location || 'Global',
          flag: (tutor.country_code === 'RW' || (tutor.location && tutor.location.toLowerCase().includes('rw'))) ? rwanda : hoausflag,
          phone: tutor.phone || '---',
          email: tutor.email || 'No email',
          role: tutor.bio || 'Tutor',
          uploads: tutor.uploads || '0',
          paid: tutor.amount_paid || '0',
          status: tutor.status === 'active' ? 'Active' : 'Inactive',
          statusColor: tutor.status === 'active' ? 'green' : 'gray',
          averageRating: tutor.average_rating || 0
        })));
      } else {
        const errorBody = await tutorsRes?.json().catch(() => ({}));
        throw new Error(errorBody?.message || errorBody?.error?.message || 'Failed to load tutors.');
      }
    } catch (error) {
      console.error("Failed to fetch tutors", error);
      if (mounted) {
        setStatsData({});
        setTutorsData([]);
        setFetchError(error.message || 'Failed to load tutors.');
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchTutorsData(mounted);
    return () => { mounted = false; };
  }, [retryKey]);

  // --- Memoized Sorting & Filtering (Main Table) ---
  const processedData = useMemo(() => {
    let filtered = tutorsData || [];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q));
    }

    if (activeFilter !== 'All Tutors') {
      filtered = filtered.filter(item => item.status === activeFilter);
    }

    if (!sortConfig.key) return filtered;

    return [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (['uploads', 'paid'].includes(sortConfig.key)) {
        aVal = Number(String(aVal).replace(/[^0-9.-]+/g, '')) || 0;
        bVal = Number(String(bVal).replace(/[^0-9.-]+/g, '')) || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tutorsData, sortConfig, searchQuery, activeFilter]);

  // --- Pagination ---
  const totalItems = processedData.length;
  const limit = parseInt(pageSize) || 5;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return processedData.slice(start, start + limit);
  }, [processedData, currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [searchQuery, activeFilter, pageSize]);

  // --- Handlers ---
  const toggleRowSelection = (rowId) => {
    setSelectedRows((current) => current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]);
  };
  
  const toggleAllVisibleRows = () => {
    if (selectedRows.length === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map(req => req.id));
    }
  };

  const handleSort = (key) => {
    setSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleModalSort = (key) => {
    setModalSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const toggleModalRowSelection = (rowId) => {
    setModalSelectedRows((current) => current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]);
  };

  const openModal = async (tutorId) => {
    setActiveTutorId(tutorId);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setActiveTutorProfile(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/signin');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [response, revRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/instructors/${tutorId}/profile`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/reports/revenue-by-instructor?limit=200`, { headers }).catch(() => null),
      ]);
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/signin');
        return;
      }

      let profile = null;
      if (response.ok) {
        const body = await response.json();
        profile = body?.data || body;
      }

      const listTutor = tutorsData.find((t) => t.id === tutorId);
      let invoiceRevenue = Number(listTutor?.paid) || 0;
      if (revRes?.ok) {
        const revBody = await revRes.json();
        const match = (revBody?.data?.instructors || []).find(
          (row) => String(row.instructor_id) === String(tutorId)
        );
        if (match) invoiceRevenue = Number(match.total_revenue) || 0;
      }

      setActiveTutorProfile({
        ...(profile || { id: tutorId, name: listTutor?.name, avatar: listTutor?.avatar }),
        stats: {
          ...(profile?.stats || {}),
          totalRevenueOfCourses: invoiceRevenue,
          totalStudents: profile?.stats?.totalStudents ?? listTutor?.students,
          totalCourses: profile?.stats?.totalCourses ?? listTutor?.uploads,
        },
      });
    } catch (err) {
      console.error("Error fetching tutor profile details:", err);
    } finally {
      setIsModalLoading(false);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setActiveTutorId(null);
    setActiveTutorProfile(null);
    setActiveTab('lessons');
  };

  const toggleProjectLike = (idx) => {
    setLikedProjects((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // --- Sorting Utility for Modal Data ---
  const getSortedData = (data, config) => {
    if (!config.key || !Array.isArray(data)) return data || [];
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      if (config.key === 'date') {
         aVal = new Date(aVal).getTime() || 0;
         bVal = new Date(bVal).getTime() || 0;
      }
      
      if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
      if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // --- Donut Chart Renderer ---
  const renderDonut = (chartId, segments) => {
    const radius = 38;
    const strokeWidth = 16;
    let currentOffsetPercent = 0;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg viewBox="0 0 100 100" className="donut-svg">
          {segments.map((seg, idx) => {
            const dashPercent = seg.percent;
            const offsetPercent = -currentOffsetPercent;
            currentOffsetPercent += seg.percent;

            return (
              <circle
                key={idx} cx="50" cy="50" r={radius} fill="none"
                stroke={seg.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashPercent} 100`} strokeDashoffset={offsetPercent}
                pathLength="100"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseMove={(e) => {
                  const svgRect = e.target.closest('svg').getBoundingClientRect();
                  setHoverData({ chartId, text: seg.tooltipText, tooltipClass: seg.tooltipClass, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
                }}
                onMouseLeave={() => setHoverData({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 })}
              />
            );
          })}
        </svg>
        {hoverData.chartId === chartId && (
          <div className={`donut-tooltip ${hoverData.tooltipClass || ''}`} style={{ top: `${hoverData.y + 10}px`, left: `${hoverData.x + 10}px` }}>
            {hoverData.text}
          </div>
        )}
      </div>
    );
  };

  const lessonsList = useMemo(() => {
    if (activeTutorProfile?.coursesWithDetails && activeTutorProfile.coursesWithDetails.length > 0) {
      return activeTutorProfile.coursesWithDetails.map(course => {
        let status = 'Draft';
        let statusType = 'failed';
        if (course.status === 'published') {
          if (course.status_approval === 'approved') {
            status = 'Approved';
            statusType = 'paid';
          } else if (course.status_approval === 'rejected') {
            status = 'Rejected';
            statusType = 'failed';
          } else {
            status = 'Pending Approval';
            statusType = 'warning';
          }
        }
        return {
          id: course.id,
          title: course.title,
          date: new Date(course.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: 'Course',
          duration: course.level || 'Beginner',
          students: String(course.studentCount || 0),
          views: `${Math.round((course.studentCount || 0) * 2.5 + 5)} Views`,
          amount: `${(course.price || 0) * (course.studentCount || 0)} USD`,
          status,
          statusType,
          isPending: course.status === 'published' && course.status_approval === 'pending'
        };
      });
    }
    return [];
  }, [activeTutorProfile]);

  const documentsList = useMemo(() => {
    if (activeTutorProfile?.allSyllabuses && activeTutorProfile.allSyllabuses.length > 0) {
      return activeTutorProfile.allSyllabuses.map((syll, idx) => {
        let size = 'Pending';
        if (syll.status_approval === 'approved') size = 'Approved';
        else if (syll.status_approval === 'rejected') size = 'Rejected';
        return {
          id: syll.id,
          name: syll.title || `Syllabus #${idx + 1}`,
          size,
          type: 'pdf',
          url: syll.thumbnail_url,
          isPending: syll.status_approval === 'pending'
        };
      });
    }
    return [];
  }, [activeTutorProfile]);

  const projectsList = useMemo(() => {
    if (activeTutorProfile?.uploadedProjects && activeTutorProfile.uploadedProjects.length > 0) {
      return activeTutorProfile.uploadedProjects.map((proj, idx) => ({
        id: proj.id,
        image: proj.thumbnail_url ? (proj.thumbnail_url.startsWith('http') ? proj.thumbnail_url : `${API_BASE_URL}${proj.thumbnail_url}`) : null,
        author: activeTutorProfile.name || 'Tutor Admin',
        likes: `${proj.likes_count || 0}`,
        views: `${proj.saves_count || 0}`,
        title: proj.title || 'Untitled Project'
      }));
    }
    return [];
  }, [activeTutorProfile]);

  const activityLogs = useMemo(() => {
    const logs = [];
    if (activeTutorProfile) {
      (activeTutorProfile.coursesWithDetails || []).forEach(course => {
        logs.push({
          id: `course-${course.id}`,
          logNo: `#LOG-C${course.id}`,
          action: 'Course Created',
          status: 'Success',
          statusType: 'solved',
          description: `Tutor created a new course "${course.title}" with status "${course.status}".`,
          date: course.created_at
        });
      });
      (activeTutorProfile.allSyllabuses || []).forEach(syll => {
        logs.push({
          id: `syll-${syll.id}`,
          logNo: `#LOG-S${syll.id}`,
          action: 'Syllabus Upload',
          status: syll.status_approval === 'approved' ? 'Success' : 'Pending',
          statusType: syll.status_approval === 'approved' ? 'solved' : 'warning',
          description: `Tutor uploaded syllabus "${syll.title}" for review.`,
          date: syll.created_at
        });
      });
      (activeTutorProfile.uploadedProjects || []).forEach(proj => {
        logs.push({
          id: `proj-${proj.id}`,
          logNo: `#LOG-P${proj.id}`,
          action: 'Project Upload',
          status: proj.approval_status === 'approved' ? 'Success' : 'Pending',
          statusType: proj.approval_status === 'approved' ? 'solved' : 'warning',
          description: `Tutor uploaded project "${proj.title}" with status "${proj.approval_status}".`,
          date: proj.created_at
        });
      });
    }
    if (logs.length > 0) {
      return logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return [];
  }, [activeTutorProfile]);

  return (
    <HOALayout currentPage="tutors">
      <div className="hoa-tutors-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Tutors</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchTutorsData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="" className={`sync-icon ${isLoading ? 'spinning' : ''}`} /> 
              {isLoading ? 'Updating...' : 'Data updated every 5min'} <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/index', '_blank')}>
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {/* Stats Container */}
        <div className="hoa-dashboard-stats-container">
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat"><h4>{statsData?.total_tutors || '0'}</h4><p>Total Tutors</p></div>
            <div className="sub-stat"><h4>{statsData?.syllabus_uploads || '0'}</h4><p>Syllabus Uploads</p></div>
            <div className="sub-stat"><h4>{statsData?.online_courses || '0'}</h4><p>Online Courses</p></div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount(Number(statsData?.upload_payments) || 0).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Platform Fees</p>
            </div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount(Number(statsData?.amount_paid) || 0).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Collected (invoices)</p>
            </div>
          </div>
        </div>

        <div className="hoa-dashboard-charts-container">
          <div className="hoa-grid-2">
            {/* ONLINE LEARNERS'S STATUS (Reused context for Tutors) */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">TUTORS ACTIVITY STATUS</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">{statsData?.active_tutors || 0} <span className="hoa-stat-badge badge-green">+0.0%</span></h3><p className="hoa-stat-label">Active</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">{statsData?.offline_tutors || 0} <span className="hoa-stat-badge badge-red">-0.0%</span></h3><p className="hoa-stat-label">Offline</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">{statsData?.total_events || 0} <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Events Hosted</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Revenue Generated</span>
                <div className="hoa-revenue-dropdown" style={{position: 'relative'}} onClick={() => setOpenFlagDropdown(openFlagDropdown === 'rev1' ? null : 'rev1')}>
                  {formatAmount(Number(statsData?.total_revenue) || 0)} <img src={currency.flag} className="currency-icon" alt="flag" style={{cursor: 'pointer'}} /> <img src={hoadowncaret} alt="drop" style={{cursor: 'pointer'}} />
                  {openFlagDropdown === 'rev1' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: 0, zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrency(option); setOpenFlagDropdown(null); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TUTOR'S CONTENT STATUS */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">CONTENT PUBLICATION</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">{statsData?.published_courses || 0} <span className="hoa-stat-badge badge-green">+0.0%</span></h3><p className="hoa-stat-label">Published</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">{statsData?.pending_courses || 0} <span className="hoa-stat-badge badge-red">-0.0%</span></h3><p className="hoa-stat-label">Pending</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">{statsData?.total_projects || 0} <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Projects</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Payouts</span>
                <div className="hoa-revenue-dropdown">
                  <span style={{ fontSize: 13, color: '#99a1b7', fontWeight: 500 }}>Not available yet</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* List Header */}
        <div className="hoa-approvals-header">
          <div>
            <h2>Tutors</h2>
            <p>Active Platform Instructors</p>
          </div>
          <div className="approvals-actions">
            <div className="search-box">
              <img src={hoasearch} alt="" />
              <input 
                type="text" 
                placeholder="Search Tutors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hoa-filter-dropdown-wrapper" ref={filterRef}>
              <button 
                type="button" 
                className={`hoa-btn-light-purple hoa-filter-trigger ${activeFilter !== 'All Tutors' ? 'active-filter' : ''}`} 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ 
                  background: activeFilter !== 'All Tutors' ? '#450468' : '#F3E8FF',
                  color: activeFilter !== 'All Tutors' ? '#fff' : '#450468'
                }}
              >
                <img src={hoafilter} alt="" style={{ filter: activeFilter !== 'All Tutors' ? 'brightness(0) invert(1)' : 'none' }} /> Filters
              </button>
              {isFilterOpen && (
                <div className="hoa-filter-dropdown">
                  {filterOptions.map((option) => (
                    <button 
                      key={option} 
                      type="button" 
                      className={`hoa-filter-option ${activeFilter === option ? 'active' : ''}`}
                      onClick={() => { setActiveFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="hoa-btn-light-purple">
              <img src={hoaadd} alt="Add" /> Add new Tutor
            </button>
          </div>
        </div>

        {/* Tutors List Layout */}
        {isLoading && tutorsData.length === 0 ? (
          <HOALoading message="Loading tutors…" />
        ) : fetchError ? (
          <HOALoadError
            title="Could not load tutors"
            message={fetchError}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        ) : (
        <>
        <div className="hoa-list-container">
          <table className="hoa-list-table learners-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <button type="button" className="th-content minus-btn-container minus-select-button" onClick={toggleAllVisibleRows}>
                    <div className="minus-icon">-</div>
                  </button>
                </th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('name')}>Tutor Details ({processedData.length}) <span className={`sort-icon ${sortConfig.key === 'name' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('phone')}>Contact Info <span className={`sort-icon ${sortConfig.key === 'phone' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('role')}>Role <span className={`sort-icon ${sortConfig.key === 'role' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('uploads')}>Uploads <span className={`sort-icon ${sortConfig.key === 'uploads' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap', position: 'relative' }}>
                  <div className="th-content justify-center" onClick={() => handleSort('paid')}>
                    Amount Paid ({currency.label}) <img src={currency.flag} alt="flag" className="icon-12-mx4" onClick={(e) => { e.stopPropagation(); setOpenFlagDropdown('main-paid'); }} style={{ cursor: 'pointer' }} />
                    <span className={`sort-icon ${sortConfig.key === 'paid' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span>
                  </div>
                  {openFlagDropdown === 'main-paid' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: '50%', transform: 'translateX(50%)', zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={() => { setCurrency(option); setOpenFlagDropdown(null); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="status-col" ><div className="th-content" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((tutor) => (
                <tr key={tutor.id} className={selectedRows.includes(tutor.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" className="hoa-checkbox" checked={selectedRows.includes(tutor.id)} onChange={() => toggleRowSelection(tutor.id)} />
                  </td>
                  <td>
                    <div className="list-user-col">
                      <div className="user-meta">
                        <h5>{tutor.name}</h5>
                        <p className="location-with-flag">
                          <img src={tutor.flag} alt="flag" className="tiny-flag" /> {tutor.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-meta">
                      <h5 style={{ fontWeight: 600 }}>{tutor.phone}</h5>
                      <p className="font-11-gray">{tutor.email}</p>
                    </div>
                  </td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.role}</td>
                  <td className="fw-500 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.uploads}</td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{formatAmount(tutor.paid)}</td>
                  <td className="status-col">
                    <span className={`status-pill pill-${tutor.statusColor}`}>
                      <span className="dot"></span> {tutor.status}
                    </span>
                  </td>
                  <td className="action-col">
                    <a href="#view" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(tutor.id); }}>
                      <img src={hoaopenview} alt="Open" />
                    </a>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && !isLoading && (
                <HOATableEmptyRow
                  colSpan={8}
                  title="No tutors found"
                  message={searchQuery || activeFilter !== 'All Tutors' ? 'Try adjusting your search or filters.' : 'Instructor accounts will appear here once tutors are registered.'}
                />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown" ref={pageSizeRef}>
              <button type="button" className="page-size-button" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map((option) => (
                    <button key={option} type="button" className="page-size-option" onClick={() => { setPageSize(option); setIsPageSizeOpen(false); }}>
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            per page
          </div>
          <div className="hoa-pagination">
            <span className="page-range">
              {totalItems === 0 ? '0' : `${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalItems)}`} of {totalItems}
            </span>
            <button className="page-nav" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              <img src={hoaprev} alt="Prev" style={{ opacity: currentPage === 1 ? 0.5 : 1 }} />
            </button>
            
            {getPageNumbers().map(num => (
              <button 
                key={num} 
                className={`page-num ${currentPage === num ? 'active' : ''}`}
                onClick={() => goToPage(num)}
              >
                {num}
              </button>
            ))}

            {totalPages > 3 && currentPage < totalPages - 1 && <span className="page-dots">...</span>}

            <button className="page-nav" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <img src={hoanext} alt="Next" style={{ opacity: currentPage === totalPages ? 0.5 : 1 }} />
            </button>
          </div>
        </div>
        </>
        )}

        {/* --- Tutor Preview Modal --- */}
        <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

            <div className="modal-top-header">
              <button className="modal-back-btn" onClick={closeModal}>
                <img src={hoagoback} alt="" />
              </button>
              <h2>Tutors Preview</h2>
              <div className="modal-header-actions">
                <span className="hoa-update-status border-eef1f6">
                  <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 1 hr <span className="dot bg-green"></span>
                </span>
              </div>
            </div>

            <div className="modal-content-area">
              {isModalLoading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '100px 0',
                  color: '#78829D',
                  fontFamily: 'inherit'
                }}>
                  <div style={{
                    border: '4px solid rgba(69, 4, 104, 0.1)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    borderLeftColor: '#450468',
                    animation: 'modal-spin 1s linear infinite',
                    marginBottom: '16px'
                  }}></div>
                  <style>{`
                    @keyframes modal-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <span>Loading Tutor Profile...</span>
                </div>
              ) : (
                <>
                  <div className="modal-profile-grid">
                    {/* Profile Card */}
                    <div className="modal-profile-card">
                      <div className="modal-profile-bg-wrapper">
                        <div className="modal-profile-bg" style={{ background: `url(${hoabrickspattern}) center / 100% 100% no-repeat`, opacity: 1 }}></div>
                      </div>

                      <div className="profile-top-row">
                        <img src={getAvatarUrl(activeTutorProfile?.avatar || tutorsData.find(t => t.id === activeTutorId)?.avatar)} alt="Avatar" className="profile-lg-avatar" onError={(e) => { e.target.src = defaultAvatar; }} />
                        <button className="btn-view-details">View Details</button>
                      </div>

                      <div className="profile-info-grid">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="profile-label">Full name :</span>
                          <strong className="profile-value">{activeTutorProfile?.name || tutorsData.find(t => t.id === activeTutorId)?.name || 'Loading...'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="profile-label">Total Paid :</span>
                            <strong className="profile-value-flex" style={{ position: 'relative', zIndex: 9999 }}>{formatAmount(Number(activeTutorProfile?.stats?.totalRevenueOfCourses ?? tutorsData.find(t => t.id === activeTutorId)?.paid) || 0).replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /> </span>
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="profile-bottom-row">
                        <div className="flex-center-gap8">
                          <span className={`status-badge-${activeTutorProfile?.status === 'active' || tutorsData.find(t => t.id === activeTutorId)?.status === 'Active' ? 'blue' : 'gray'}`}>
                            {activeTutorProfile?.status === 'active' || tutorsData.find(t => t.id === activeTutorId)?.status === 'Active' ? 'Active' : 'Offline'}
                          </span>
                          <span className="status-badge-purple"><img src={hoauserbadge} alt="" /> {activeTutorProfile?.stats?.totalCourses ?? tutorsData.find(t => t.id === activeTutorId)?.uploads ?? 0}</span>
                          <span className="status-badge-yellow"><img src={hoayellowstar} alt="" /> {activeTutorProfile?.average_rating ?? tutorsData.find(t => t.id === activeTutorId)?.averageRating ?? 4.8}</span>
                        </div>
                        <div className="profile-actions gap-2">
                          <button className="icon-btn icon-28"><img src={hoagrayadd} alt="" /></button>
                          <button className="icon-btn icon-28 tooltip-trigger">
                            <span className="action-tooltip">{activeTutorProfile?.phone || tutorsData.find(t => t.id === activeTutorId)?.phone || 'N/A'}</span>
                            <img src={hoagrayphone} alt="" />
                          </button>
                          <button className="icon-btn icon-28 tooltip-trigger">
                            <span className="action-tooltip">{activeTutorProfile?.email || tutorsData.find(t => t.id === activeTutorId)?.email || 'N/A'}</span>
                            <img src={hoagraymail} alt="" />
                          </button>
                          <button className="icon-btn icon-28"><img src={hoaverticaldots} alt="" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Info List */}
                    <div className="profile-info-list">
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoausericon} alt="dept" className="opacity-50" /> Specialization</span>
                        <span className="profile-info-val">{activeTutorProfile?.skills || tutorsData.find(t => t.id === activeTutorId)?.role || 'Tutor'}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoabriefcase} alt="role" className="opacity-50" /> Experience</span>
                        <span className="profile-info-val">{activeTutorProfile?.bio || '—'}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoasyllabus} alt="syll" className="opacity-50" /> Syllabus</span>
                        <span className="profile-info-val">{activeTutorProfile?.stats?.totalSyllabuses ?? '—'}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoaonlinecourses} alt="courses" className="opacity-50" /> Online Courses</span>
                        <span className="profile-info-val">{activeTutorProfile?.stats?.totalCourses ?? tutorsData.find(t => t.id === activeTutorId)?.uploads ?? '—'}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoaprojects} alt="proj" className="opacity-50" /> Projects</span>
                        <span className="profile-info-val">{activeTutorProfile?.stats?.totalUploadedProjects ?? '—'}</span>
                      </div>
                      <div className="profile-info-row">
                        <span className="profile-info-label"><img src={hoatotalstudents} alt="stud" className="opacity-50" /> Total Students</span>
                        <span className="profile-info-val">{activeTutorProfile?.stats?.totalStudents ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Stats Row */}
                  <div className="modal-stats-row modal-stats-row-no-border">
                    <div className="mod-stat mod-stat-br-pr">
                      <h3 className="flex-center-gap4">
                        —
                        <span className="stat-currency">{currency.label}</span>
                      </h3>
                      <p>Downloads Income <span className="hoa-reports-muted">not tracked</span></p>
                    </div>
                    <div className="mod-stat mod-stat-br-px">
                      <h3 className="flex-center-gap4">
                        {activeTutorProfile?.stats?.totalRevenueOfCourses != null
                          ? `+ ${formatAmount(Number(activeTutorProfile.stats.totalRevenueOfCourses) || 0).replace(' USD', '').replace(' RWF', '')}`
                          : '—'}
                        <span className="stat-currency">{currency.label}</span>
                      </h3>
                      <p>Courses Income</p>
                    </div>
                    <div className="mod-stat mod-stat-br-px">
                      <h3 className="flex-center-gap4">—</h3>
                      <p>Syllabus fees <span className="hoa-reports-muted">not tracked</span></p>
                    </div>
                    <div className="mod-stat mod-stat-pl">
                      <h3 className="font-15-mt6">{activeTutorProfile?.created_at ? formatDate(activeTutorProfile.created_at) : '—'}</h3>
                      <p>Date Joined</p>
                    </div>
                  </div>

                  {/* Tabs Navigation */}
                  <div className="modal-tabs">
                    <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Content</button>
                    <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
                    <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
                  </div>

                  {/* Tab Contents */}
                  <div className="modal-tab-content">

                    {/* --- LESSONS/CONTENT TAB --- */}
                    {activeTab === 'lessons' && (
                      <div className="tab-lessons">
                        <div className="hoa-list-container modal-table-container">
                          <table className="hoa-list-table mod-table">
                            <thead>
                              <tr>
                                <th className="w-40">
                                  <button type="button" className="th-content minus-btn-container minus-select-button" onClick={() => setModalSelectedRows([])}>
                                    <div className="minus-icon m-auto">-</div>
                                  </button>
                                </th>
                                <th><div className="th-content" onClick={() => handleModalSort('title')}>Course Details <span className={`sort-icon ${modalSortConfig.key === 'title' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                                <th><div className="th-content" onClick={() => handleModalSort('type')}>Type <span className={`sort-icon ${modalSortConfig.key === 'type' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                                <th><div className="th-content" onClick={() => handleModalSort('students')}>Tot. Students <span className={`sort-icon ${modalSortConfig.key === 'students' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                                <th><div className="th-content" onClick={() => handleModalSort('amount')}>Tot. Amount <span className={`sort-icon ${modalSortConfig.key === 'amount' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                                <th className="status-col"><div className="th-content" onClick={() => handleModalSort('status')}>Status <span className={`sort-icon ${modalSortConfig.key === 'status' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                              </tr>
                            </thead>
                            <tbody>
                              {getSortedData(lessonsList, modalSortConfig).map((les) => (
                                <tr key={les.id} className={modalSelectedRows.includes(les.id) ? 'selected-row' : ''}>
                                  <td><input type="checkbox" className="hoa-checkbox" checked={modalSelectedRows.includes(les.id)} onChange={() => toggleModalRowSelection(les.id)} /></td>
                                  <td>
                                    <div className="user-meta">
                                      <h5>{les.title}</h5>
                                      <p className="font-11-gray">{les.date}</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <h5 className="fw-500">{les.type}</h5>
                                      <p className="font-11-gray">{les.duration}</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <h5 className="fw-600">{les.students}</h5>
                                      <p className="font-11-gray">{les.views}</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <h5 className="fw-600">{formatAmount(les.amount)}</h5>
                                    </div>
                                  </td>
                                  <td className="status-col">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', position: 'relative' }}>
                                      <span className={`mod-status-pill st-${les.statusType}`}>{les.status}</span>
                                      {les.isPending ? (
                                        <>
                                          <button 
                                            className="icon-more-btn"
                                            onClick={() => setOpenModalCourseActionId(openModalCourseActionId === les.id ? null : les.id)}
                                          >
                                            ⋮
                                          </button>
                                          {openModalCourseActionId === les.id && (
                                            <div 
                                              className="action-dropdown" 
                                              role="menu"
                                              style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                background: '#fff',
                                                border: '1px solid #CBD5E1',
                                                borderRadius: '4px',
                                                padding: '4px',
                                                zIndex: 99999,
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                              }}
                                            >
                                              <button 
                                                type="button" 
                                                className="action-dropdown-item" 
                                                style={{ color: '#10B981', display: 'block', width: '100%', padding: '6px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                onClick={() => handleApproveCourse(les.id)}
                                                disabled={submittingCourseId === les.id}
                                              >
                                                Approve
                                              </button>
                                              <button 
                                                type="button" 
                                                className="action-dropdown-item" 
                                                style={{ color: '#EF4444', display: 'block', width: '100%', padding: '6px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                onClick={() => handleRejectCourse(les.id)}
                                                disabled={submittingCourseId === les.id}
                                              >
                                                Reject
                                              </button>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <button className="icon-more-btn">⋮</button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {lessonsList.length === 0 && !isModalLoading && (
                                <HOATableEmptyRow
                                  colSpan={6}
                                  title="No courses found"
                                  message="This tutor has not published any courses yet."
                                />
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="docs-header" style={{ marginTop: '30px' }}>
                          <div>
                            <h3 className="mod-docs-title">Documents</h3>
                            <p className="mod-docs-subtitle">Files & Credentials</p>
                          </div>
                          <button className="hoa-btn-light-purple gap-8">
                            <img src={hoadownloadall} alt="" /> Download All
                          </button>
                        </div>

                        <div className="docs-grid">
                          {documentsList.map((doc) => (
                            <div key={doc.id} className="doc-card" style={{ position: 'relative' }}>
                              <div className="doc-info">
                                <img src={doc.type === 'ribbon' ? hoaknot : hoapdffile} alt="" />
                                <div>
                                  <h4>{doc.name}</h4>
                                  <p>{doc.size}</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {doc.isPending && (
                                  <>
                                    <button 
                                      className="icon-btn" 
                                      style={{ padding: '4px', cursor: 'pointer', border: '1px solid #10B981', background: '#ecfdf5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      onClick={() => handleApproveSyllabus(doc.id)}
                                      disabled={submittingSyllabusId === doc.id}
                                      title="Approve Syllabus"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                    </button>
                                    <button 
                                      className="icon-btn" 
                                      style={{ padding: '4px', cursor: 'pointer', border: '1px solid #EF4444', background: '#fef2f2', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      onClick={() => handleRejectSyllabus(doc.id)}
                                      disabled={submittingSyllabusId === doc.id}
                                      title="Reject Syllabus"
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </>
                                )}
                                <button className="download-btn" onClick={() => doc.url && window.open(doc.url.startsWith('http') ? doc.url : `${API_BASE_URL}${doc.url}`, '_blank')}>
                                  <img src={hoadownload} alt="" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {!isModalLoading && documentsList.length === 0 && (
                            <p style={{ color: '#64748B', fontSize: '14px' }}>No syllabus documents available for this tutor.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* --- PROJECTS TAB --- */}
                    {activeTab === 'projects' && (
                      <div className="tab-projects">
                        <div className="projects-header">
                          <div>
                            <h3 className="mod-projects-title">Tutor Projects</h3>
                            <p className="mod-projects-subtitle"><strong>{projectsList.length}</strong> Projects in total</p>
                          </div>
                        </div>
                        <div className="projects-grid">
                          {projectsList.map((proj, idx) => (
                            <div key={idx} className="project-card">
                              <div className="proj-img" style={{ backgroundImage: `url(${proj.image || hoaproject})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }} onClick={() => setFullScreenImage(proj.image || hoaproject)}></div>
                              <div className="proj-meta">
                                <span className="author">By <a href="#" onClick={preventDefault}>{proj.author}</a></span>
                                <div className="proj-stats">
                                  <span className="stat-like" onClick={() => toggleProjectLike(idx)}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill={likedProjects[idx] ? "#F8285A" : "#A1A5B7"}>
                                      <path d="M20.84 4.61A5.5 5.5 0 0012 5.67A5.5 5.5 0 003.16 4.61C2.5 5.28 2 6.2 2 7.21C2 8.23 2.5 9.15 3.16 9.83L12 18.67L20.84 9.83C21.5 9.15 22 8.23 22 7.21C22 6.2 21.5 5.28 20.84 4.61Z" />
                                    </svg> {proj.likes}
                                  </span>
                                  <span className="stat-view"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A5B7" strokeWidth="2"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg> {proj.views}</span>
                                </div>
                              </div>
                              <p className="proj-title">{proj.title}</p>
                            </div>
                          ))}
                          {projectsList.length === 0 && !isModalLoading && (
                            <HOAEmptyState
                              inline
                              title="No projects uploaded"
                              message="This tutor has not uploaded any projects yet."
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* --- ACTIVITY TAB --- */}
                    {activeTab === 'activity' && (
                      <div className="tab-activity">
                        <h4 className="activity-title" style={{ marginTop: '10px' }}>
                          <img src={hoacalendar} alt="calendar" /> System Logs
                        </h4>

                        <div className="qa-section">
                          {activityLogs.length === 0 && !isModalLoading ? (
                            <HOAEmptyState
                              inline
                              title="No activity yet"
                              message="Course, syllabus, and project events will appear here once this tutor has upload history."
                            />
                          ) : activityLogs.map((log) => {
                            const isOpen = openTickets[log.id] !== undefined ? openTickets[log.id] : (activityLogs[0]?.id === log.id);
                            return (
                              <div key={log.id} className={`ticket-card ${log.statusType === 'solved' ? 'border-green' : 'border-yellow'} ${!isOpen ? 'collapsed' : ''}`} style={{ marginBottom: '12px' }}>
                                <div className="ticket-header" onClick={() => toggleTicket(log.id)} style={{ cursor: 'pointer' }}>
                                  <div className="ticket-meta">
                                    <strong>Log No : {log.logNo}</strong>
                                    <span>Action: {log.action}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className={`ticket-status st-${log.statusType}`}>{log.status}</div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78829D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" /></svg>
                                  </div>
                                </div>

                                {isOpen && (
                                  <div className="ticket-body">
                                    <div className="ticket-content">
                                      <p>{log.description}</p>
                                      {log.date && <small style={{ color: '#99A1B7', display: 'block', marginTop: '6px' }}>Date: {new Date(log.date).toLocaleString()}</small>}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Fullscreen Image Preview */}
        {fullScreenImage && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', padding: '10px' }}>&times;</button>
            <img src={fullScreenImage} alt="Full Screen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}

        <HOAToast toast={toast} onDismiss={hideToast} />
      </div>
    </HOALayout>
  );
};

export default HOATutors;