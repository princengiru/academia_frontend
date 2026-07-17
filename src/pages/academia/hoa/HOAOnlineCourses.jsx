import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-online-courses.css';// Reuse standard project icons
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoawhiteadd from '../../../assets/icons/hoawhiteadd.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoarank from '../../../assets/icons/hoarank.png';
import hoatime from '../../../assets/icons/hoatime.svg';
import hoagraycalendar from '../../../assets/icons/hoagraycalendar.svg';
import hoapaperstack from '../../../assets/icons/hoapaperstack.svg';
import hoapayicon from '../../../assets/icons/hoapayicon.svg';
import hoabasics from '../../../assets/icons/hoabasics.svg';
import hoaverticaldots from '../../../assets/icons/hoaverticaldots.svg';
// Custom inline SVGs for specific icons
const IconUserBust = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

const IconRightArrow = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const IconDownCaret = ({ width = 12, height = 8, className = "", style = {} }) => (
    <svg width={width} height={height} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="2 2 8 8 14 2"></polyline>
    </svg>
);

const IconDuration = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const IconSkill = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const IconWallet = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
    </svg>
);

const IconLightbulb = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5"></path>
    </svg>
);

const IconReply = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
    </svg>
);

const HOAOnlineCourses = () => {
    // API Configuration
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const [searchParams, setSearchParams] = useSearchParams();
    const deepLinkHandledRef = useRef(null);

    // Moderation Mode: 'explorer' (Approved), 'pending', 'rejected'
    const [mode, setMode] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get('mode');
        return modeParam === 'pending' || modeParam === 'rejected' || modeParam === 'explorer'
            ? modeParam
            : (params.get('id') ? 'pending' : 'explorer');
    });

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [isCourseFilterOpen, setIsCourseFilterOpen] = useState(false);
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');

    // Data lists
    const [approvedCourses, setApprovedCourses] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [rejectedCourses, setRejectedCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selected Course detail state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

    // Modal display state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'students', 'qa'
    const [expandedReplies, setExpandedReplies] = useState({});

    // Custom Toast state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Rejection Modal
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [rejectionCourseId, setRejectionCourseId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Approve Modal
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approveCourseId, setApproveCourseId] = useState(null);

    const [openStudentMenuId, setOpenStudentMenuId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Approved
            const approvedRes = await fetch(`${API_BASE_URL}/api/courses/admin/approved?limit=100`, { headers });
            const approvedResult = await approvedRes.json();
            if (approvedResult.success) {
                const list = approvedResult.data?.data || approvedResult.data || approvedResult.courses || [];
                setApprovedCourses(Array.isArray(list) ? list : []);
            }

            // Fetch Pending
            const pendingRes = await fetch(`${API_BASE_URL}/api/courses/admin/pending-approval?limit=100`, { headers });
            const pendingResult = await pendingRes.json();
            if (pendingResult.success) {
                const list = pendingResult.data?.data || pendingResult.data || pendingResult.courses || [];
                setPendingCourses(Array.isArray(list) ? list : []);
            }

            // Fetch Rejected
            const rejectedRes = await fetch(`${API_BASE_URL}/api/courses/admin/rejected?limit=100`, { headers });
            const rejectedResult = await rejectedRes.json();
            if (rejectedResult.success) {
                const list = rejectedResult.data?.data || rejectedResult.data || rejectedResult.courses || [];
                setRejectedCourses(Array.isArray(list) ? list : []);
            }
        } catch (err) {
            console.error('Error fetching courses list:', err);
            showToast('Failed to load courses', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Detailed Course enrollment & Q&A states
    const [courseEnrollments, setCourseEnrollments] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(false);
    const [courseQuestions, setCourseQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [questionReplies, setQuestionReplies] = useState({});
    const [loadingReplies, setLoadingReplies] = useState({});

    const fetchCourseEnrollments = async (courseId) => {
        setLoadingEnrollments(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollments`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setCourseEnrollments(result.data);
            } else if (result.success && Array.isArray(result.data?.data)) {
                setCourseEnrollments(result.data.data);
            } else if (Array.isArray(result.enrollments)) {
                setCourseEnrollments(result.enrollments);
            } else {
                setCourseEnrollments([]);
            }
        } catch (err) {
            console.error('Failed to load course enrollments:', err);
            setCourseEnrollments([]);
        } finally {
            setLoadingEnrollments(false);
        }
    };

    const fetchCourseQuestions = async (courseId) => {
        setLoadingQuestions(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/qa/courses/${courseId}/questions?limit=100`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (result.success && result.data && Array.isArray(result.data.questions)) {
                setCourseQuestions(result.data.questions);
            } else {
                setCourseQuestions([]);
            }
        } catch (err) {
            console.error('Failed to load course Q&A:', err);
            setCourseQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const fetchQuestionReplies = async (questionId) => {
        if (questionReplies[questionId]) {
            toggleReplies(questionId);
            return;
        }

        setLoadingReplies(prev => ({ ...prev, [questionId]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const result = await res.json();
            if (result.success && result.data && Array.isArray(result.data.answers)) {
                setQuestionReplies(prev => ({ ...prev, [questionId]: result.data.answers }));
            }
        } catch (err) {
            console.error('Failed to load answers for question:', err);
        } finally {
            setLoadingReplies(prev => ({ ...prev, [questionId]: false }));
            toggleReplies(questionId);
        }
    };

    const loadCourseDetails = async (course) => {
        setLoadingCourseDetails(true);
        setSelectedCourse(course);
        setIsModalOpen(true);
        setCourseEnrollments([]);
        setCourseQuestions([]);
        setQuestionReplies({});
        setExpandedReplies({});
        fetchCourseEnrollments(course.id);
        fetchCourseQuestions(course.id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setSelectedCourse(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch course details');
            }
        } catch (err) {
            console.error('Error fetching course details:', err);
            showToast('Failed to load course structure details', 'error');
        } finally {
            setLoadingCourseDetails(false);
        }
    };

    const handleApproveCourse = (courseId) => {
        setApproveCourseId(courseId);
        setApproveModalOpen(true);
    };

    const submitApproval = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/courses/${approveCourseId}/admin/approve`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const result = await res.json();
            if (result.success) {
                showToast('Course approved successfully!', 'success');
                setApproveModalOpen(false);
                setIsModalOpen(false);
                fetchCourses();
            } else {
                throw new Error(result.message || 'Failed to approve course');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleRejectCourse = (courseId) => {
        setRejectionCourseId(courseId);
        setRejectionReason('');
        setRejectionModalOpen(true);
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            showToast('Rejection reason is required', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/courses/${rejectionCourseId}/admin/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectionReason })
            });
            const result = await res.json();
            if (result.success) {
                showToast('Course rejected successfully', 'success');
                setRejectionModalOpen(false);
                setIsModalOpen(false);
                fetchCourses();
            } else {
                throw new Error(result.message || 'Failed to reject course');
            }
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        const deepLinkId = searchParams.get('id');
        if (!deepLinkId || deepLinkHandledRef.current === String(deepLinkId) || loading) return;

        const matchId = (item) => String(item?.id ?? item?._id) === String(deepLinkId);
        const match =
            pendingCourses.find(matchId) ||
            approvedCourses.find(matchId) ||
            rejectedCourses.find(matchId);

        if (!match) return;

        deepLinkHandledRef.current = String(deepLinkId);
        if (pendingCourses.some(matchId) && mode !== 'pending') setMode('pending');
        else if (rejectedCourses.some(matchId) && mode !== 'rejected') setMode('rejected');
        else if (approvedCourses.some(matchId) && mode !== 'explorer') setMode('explorer');

        loadCourseDetails(match);

        const next = new URLSearchParams(searchParams);
        next.delete('id');
        setSearchParams(next, { replace: true });
    }, [searchParams, pendingCourses, approvedCourses, rejectedCourses, loading, mode, setSearchParams]);

    const filteredCourses = useMemo(() => {
        const currentList = mode === 'explorer'
            ? approvedCourses
            : mode === 'pending'
                ? pendingCourses
                : rejectedCourses;

        return currentList.filter(course => {
            const matchesSearch = (course.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (course.instructor_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());

            if (mode === 'explorer') {
                if (activeFilter === 'Free') {
                    return matchesSearch && (parseFloat(course.price) === 0 || course.price === 'Free');
                }
                if (activeFilter === 'Paid') {
                    return matchesSearch && parseFloat(course.price) > 0;
                }
            }
            return matchesSearch;
        });
    }, [mode, approvedCourses, pendingCourses, rejectedCourses, searchQuery, activeFilter]);

    const toggleReplies = (id) => {
        setExpandedReplies(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Add these for the modal table:
    const [modalSortConfig, setModalSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [modalSelectedRows, setModalSelectedRows] = useState([]);
    const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
    const { currency, setCurrency, formatAmount } = useCurrency();

    const handleModalSort = (key) => {
        let direction = 'asc';
        if (modalSortConfig.key === key && modalSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setModalSortConfig({ key, direction });
    };

    const getSortedData = (data, config) => {
        if (!config.key) return data;
        return [...data].sort((a, b) => {
            let aVal = a[config.key];
            let bVal = b[config.key];
            if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const toggleModalRowSelection = (rowId) => {
        setModalSelectedRows((currentRows) => (
            currentRows.includes(rowId)
                ? currentRows.filter((selectedRowId) => selectedRowId !== rowId)
                : [...currentRows, rowId]
        ));
    };

    const toggleFlagDropdown = (key) => {
        setOpenFlagDropdown((currentKey) => (currentKey === key ? null : key));
    };

    const selectFlagOption = (option) => {
        setCurrency(option);
        setOpenFlagDropdown(null);
    };

    // Dummy data for courses grid
    const coursesData = Array(10).fill({
        title: 'Software Development',
        author: 'Emma Furgreance',
        students: 17,
        date: 'Jan 4th 2026',
        bg: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop'
    }).map((course, idx) => ({
        ...course,
        id: idx + 1,
        isFree: idx === 0 || idx === 3 || idx === 5,
        price: idx === 0 || idx === 3 || idx === 5 ? 'Free' : '$5 / Month'
    }));

    // Dummy data for Students table inside modal
    const studentsData = Array(8).fill({
        name: 'Alexis Ndayamabje Froduard',
        country: 'Rwanda',
        title: 'Javascript Fundamental Quiz',
        type: 'Course',
        duration: '4 Weeks',
        amount: '222.3 USD',
        visits: '23',
        certs: '6',
        score: '12.34 %',
        feeType: 'Paid',
        feeAmount: '35 USD',
        status: 'Completed',
    }).map((student, idx) => ({
        ...student,
        id: idx + 1,
        type: idx > 2 ? 'Syllabus' : 'Course',
        duration: idx > 2 ? '251 Pages' : '4 Weeks',
        feeType: idx === 0 || idx === 3 || idx === 6 ? 'Free' : 'Paid',
        feeAmount: idx === 0 || idx === 3 || idx === 6 ? '0 USD' : '35 USD',
        status: idx === 1 ? 'Failed' : idx === 2 ? 'In Progress' : 'Completed'
    }));

    // Dummy data for Q&A tab
    const qaData = Array(4).fill({
        avatar: '/assets/imgs/default-profile.png',
        name: 'Mrs. Anderson',
        timeAgo: '1 Day ago',
        week: 'Wk1 : Chapter 4',
        title: 'Core Principles of Cybersecurity, Leadership and Oversight',
        text: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...',
        replies: 12,
        date: 'Apr 23, 2025'
    }).map((qa, idx) => ({
        ...qa,
        id: idx + 1,
        week: idx === 2 ? 'Wk2 : Chapter 23' : 'Wk1 : Chapter 4',
        title: idx === 2 ? 'Mathematics and Science' : qa.title,
        replies: idx === 0 ? 0 : 12,
        replyData: idx === 0 ? [] : [
            {
                id: 1,
                avatar: '/assets/imgs/default-profile.png',
                name: 'Tutor',
                timeAgo: '12 Hours ago',
                text: 'This is a great question. The answer lies in the fundamental principles of mathematics as applied to cybersecurity. Check chapter 5 for more details.'
            }
        ]
    }));

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
        setOpenStudentMenuId(null);
        setConfirmAction(null);
    };

    const handleUnenrollStudent = (student) => {
        const userId = student?.user_id ?? student?.userId;
        const courseId = selectedCourse?.id ?? student?.course_id;
        if (!courseId || !userId) {
            showToast('Missing student or course id for unenroll.', 'error');
            return;
        }
        setOpenStudentMenuId(null);
        setConfirmAction({
            kind: 'unenroll',
            userId,
            courseId,
            studentName: student?.student_name || 'This student',
            title: 'Unenroll student from course?',
            message: `${student?.student_name || 'This student'} will be removed from "${selectedCourse?.title || 'this course'}". Progress will be archived and they can re-enroll later.`,
            confirmLabel: 'Unenroll',
            destructive: true,
        });
    };

    const executeConfirmAction = async () => {
        if (!confirmAction || confirmLoading) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        setConfirmLoading(true);
        try {
            if (confirmAction.kind === 'unenroll') {
                const courseId = confirmAction.courseId || selectedCourse?.id;
                const res = await fetch(`${API_BASE_URL}/api/admin/learners/${confirmAction.userId}/unenroll`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        course_id: courseId,
                        reason: `Admin unenroll from ${selectedCourse?.title || 'course'}`,
                    }),
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(body?.message || body?.error?.message || 'Failed to unenroll student');
                }
                showToast('Student unenrolled successfully.', 'success');
                if (courseId) fetchCourseEnrollments(courseId);
            }
            setConfirmAction(null);
        } catch (err) {
            showToast(err.message || 'Action failed', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    return (
        <HOALayout currentPage="online-courses">
            <div className="hoa-online-courses-page">
                {/* Page Header */}
                <div className="oc-page-header">
                    <h1>Online Courses</h1>
                    <div className="oc-header-actions">
                        <span className="oc-update-status">
                            <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                            Data updated every 5min
                            <span className="dot"></span>
                        </span>
                        <button className="oc-btn-primary">
                            Go to website <img src={hoagoto} alt="Go" />
                        </button>
                    </div>
                </div>

                {/* Moderation Mode Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', borderBottom: '1px solid #EEF1F6', paddingBottom: '12px' }}>
                    <div className="oc-type-toggles" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className={`oc-type-btn ${mode === 'explorer' ? 'active' : ''}`} 
                            onClick={() => { setMode('explorer'); setSelectedCourse(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'explorer' ? '#450468' : 'transparent', color: mode === 'explorer' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Courses Explorer ({approvedCourses.length})
                        </button>
                        <button 
                            className={`oc-type-btn ${mode === 'pending' ? 'active' : ''}`} 
                            onClick={() => { setMode('pending'); setSelectedCourse(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'pending' ? '#450468' : 'transparent', color: mode === 'pending' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Pending Moderation ({pendingCourses.length})
                        </button>
                        <button 
                            className={`oc-type-btn ${mode === 'rejected' ? 'active' : ''}`} 
                            onClick={() => { setMode('rejected'); setSelectedCourse(null); }} 
                            style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: mode === 'rejected' ? '#450468' : 'transparent', color: mode === 'rejected' ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                        >
                            Rejected Courses ({rejectedCourses.length})
                        </button>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="oc-stats-top-container">
                    <div className="oc-stats-container">
                        <div className="oc-stat-block">
                            <h3>{approvedCourses.length}</h3>
                            <p>Total Courses</p>
                        </div>
                        <div className="oc-stat-block">
                            <h3>13.3M</h3>
                            <p>Total Learners</p>
                        </div>
                        <div className="oc-stat-block">
                            <h3>204</h3>
                            <p>Avg. Learning Time</p>
                        </div>
                        <div className="oc-stat-block">
                            <h3>
                                19.3M
                                <span className="oc-currency-dropdown">
                                    RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                                </span>
                            </h3>
                            <p>Upload Payments <span className="oc-trend down">↘ -4.5%</span></p>
                        </div>
                        <div className="oc-stat-block">
                            <h3>
                                843.5K
                                <span className="oc-currency-dropdown">
                                    RWF <img src={rwanda} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                                </span>
                            </h3>
                            <p>Course Payments <span className="oc-trend up">↗ +4.1</span></p>
                        </div>
                    </div>
                </div>

                {/* Sub Header & Actions */}
                <div className="oc-sub-header">
                    <div className="oc-sub-title">
                        <h2>{mode === 'explorer' ? 'Approved Courses' : mode === 'pending' ? 'Pending Courses' : 'Rejected Courses'}</h2>
                        <p>{filteredCourses.length} courses</p>
                    </div>
                    {mode === 'explorer' && (
                        <div className="oc-add-actions">
                            <button className="oc-btn-outline"><img src={hoagrayadd} style={{ width: 16 }} alt="" /> Add New Course</button>
                            <button className="oc-btn-primary"><img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Add Category</button>
                        </div>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="oc-filters-row">
                    <div className="oc-course-filter-container">
                        <div className="oc-course-filter" onClick={() => setIsCourseFilterOpen(!isCourseFilterOpen)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={hoafilter2} style={{ width: 16, opacity: 0.5 }} alt="" /> {selectedCourseFilter}
                            </span>
                            <IconDownCaret width={14} height={8} style={{ transform: isCourseFilterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                        </div>
                        {isCourseFilterOpen && (
                            <div className="oc-filter-dropdown-menu">
                                {['All Courses', 'My Courses', 'Favorite Courses'].map(opt => (
                                    <button
                                        key={opt}
                                        className="oc-filter-dropdown-item"
                                        onClick={() => {
                                            setSelectedCourseFilter(opt);
                                            setIsCourseFilterOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="oc-main-header-bar">
                        <div className="oc-search-bar">
                            <img src={hoasearch} alt="Search" style={{ opacity: 0.5, width: 14 }} />
                            <input 
                                type="text" 
                                placeholder="Search courses or instructor..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {mode === 'explorer' && (
                            <div className="oc-type-toggles">
                                {['All', 'Free', 'Paid'].map(filter => (
                                    <button
                                        key={filter}
                                        className={`oc-type-btn ${activeFilter === filter ? 'active' : ''}`}
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="oc-v-divider"></div>
                        <button className="oc-btn-filter-pill">
                            <img src={hoafilter} style={{ width: 12, opacity: 0.5 }} alt="" /> Filters
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <span style={{ fontSize: '14px', color: '#78829D' }}>Loading courses...</span>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FCFCFC', borderRadius: '12px', border: '1.5px dashed #E4E6EF', margin: '20px 0' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#071437', marginBottom: '4px' }}>No courses found</h4>
                        <p style={{ fontSize: '13px', color: '#78829D', margin: 0 }}>There are no courses in this view at this time.</p>
                    </div>
                ) : (
                    <div className="oc-grid">
                        {filteredCourses.map(course => {
                            const courseBg = course.thumbnail_url || course.thumbnail 
                                ? `${API_BASE_URL}${course.thumbnail_url || course.thumbnail}`
                                : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop';
                            const isFree = parseFloat(course.price) === 0 || !course.price || course.price === 'Free';
                            
                            return (
                                <div key={course.id} className="oc-card" onClick={() => loadCourseDetails(course)}>
                                    <img src={courseBg} alt="" className="oc-card-bg" style={{ objectFit: 'cover' }} />
                                    <div className="oc-card-badge" >
                                        {isFree ? 'Free' : `$${course.price} / Month`}
                                    </div>
                                    <div className="oc-card-ribbon-wrapper">
                                        <img src={hoarank} alt="" className="oc-ribbon-img" onError={(e) => e.target.style.display = 'none'} />
                                        <span className="oc-ribbon-number">#{course.id}</span>
                                    </div>
                                    <div className="oc-card-content">
                                        <p className="oc-card-author">{course.instructor_name || 'Instructor'}</p>
                                        <h4 className="oc-card-title">{course.title}</h4>
                                        <p className="oc-card-students">Category: {course.category || 'General'}</p>
                                        <div className="oc-card-footer">
                                            <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
                                            <IconRightArrow />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="oc-pagination-container">
                    <div className="oc-pagination-right">
                        <button className="oc-page-nav" style={{ color: '#D8D8E5' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="oc-page-num active">1</button>
                        <button className="oc-page-nav" style={{ color: '#78829D' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>

                {/* COURSE PREVIEW MODAL OVERLAY */}
                <div className={`oc-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
                    <div className="oc-modal-drawer" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="oc-modal-top-header" style={{ display: 'flex', alignItems: 'center' }}>
                            <button className="oc-modal-back-btn" onClick={closeModal}>
                                <img src={hoagoback} alt="Back" />
                            </button>
                            <h2>Course Preview</h2>

                            {/* Moderator Actions in Header */}
                            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: '16px', alignItems: 'center' }}>
                                {selectedCourse?.id && (
                                    <button
                                        type="button"
                                        onClick={() => window.open(`/academia/course-details?id=${selectedCourse.id}`, '_blank', 'noopener,noreferrer')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: '#F5F8FF',
                                            border: '1px solid #E1E9FF',
                                            color: '#450468',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Public preview
                                    </button>
                                )}
                                {selectedCourse?.status_approval === 'pending' && (
                                    <>
                                    <button 
                                        onClick={() => handleRejectCourse(selectedCourse.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: '#FFF5F5',
                                            border: '1px solid #FEE2E2',
                                            color: '#E53E3E',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleApproveCourse(selectedCourse.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: '#E8FFF3',
                                            border: '1px solid #D1FAE5',
                                            color: '#10B981',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Approve
                                    </button>
                                    </>
                                )}
                            </div>

                            <span className="oc-update-status" style={{ border: '1px solid #EEF1F6', marginLeft: '0' }}>
                                <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                                Data updated every 1 hr
                                <span className="dot" style={{ background: '#17C653' }}></span>
                            </span>
                        </div>

                        {/* Modal Content Scroll Area */}
                        {loadingCourseDetails ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
                                <span style={{ fontSize: '14px', color: '#78829D' }}>Loading details...</span>
                            </div>
                        ) : selectedCourse ? (
                            <div className="oc-modal-content-area">

                                {/* Modal Stats Row */}
                                <div className="oc-modal-stats-row">
                                    <div className="oc-mod-stat">
                                        <h3>0 <span style={{ fontSize: 10, color: '#A1A5B7' }}>USD <img src={hoausflag} style={{ width: 10, borderRadius: '50%', margin: '0 2px' }} alt="" /> <img src={hoadowncaret} style={{ width: 8 }} alt="" /></span></h3>
                                        <p>Total Students</p>
                                    </div>
                                    <div className="oc-mod-stat">
                                        <h3>0 <span style={{ fontSize: 10, color: '#A1A5B7' }}>RWF <img src={rwanda} style={{ width: 10, borderRadius: '50%', margin: '0 2px' }} alt="" /> <img src={hoadowncaret} style={{ width: 8 }} alt="" /></span></h3>
                                        <p>Upload Amount</p>
                                    </div>
                                    <div className="oc-mod-stat">
                                        <h3>0 <span style={{ fontSize: 10, color: '#A1A5B7' }}>USD <img src={hoausflag} style={{ width: 10, borderRadius: '50%', margin: '0 2px' }} alt="" /> <img src={hoadowncaret} style={{ width: 8 }} alt="" /></span></h3>
                                        <p>Courses Income</p>
                                    </div>
                                    <div className="oc-mod-stat" style={{ borderRight: 'none' }}>
                                        <h3>{selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleDateString() : 'N/A'} <span style={{ fontSize: 10, color: '#A1A5B7' }}>{selectedCourse.created_at ? new Date(selectedCourse.created_at).toLocaleTimeString() : ''}</span></h3>
                                        <p>Date Uploaded</p>
                                    </div>
                                </div>

                                {/* Modal Tabs Navigation */}
                                <div className="oc-modal-tabs">
                                    <button className={`oc-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
                                    <button className={`oc-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Students</button>
                                    <button className={`oc-tab-btn ${activeTab === 'qa' ? 'active' : ''}`} onClick={() => setActiveTab('qa')}>Students Q&A</button>
                                </div>

                                {/* Modal Tab Content Area */}
                                <div className="oc-modal-tab-content">

                                    {/* ==== OVERVIEW TAB ==== */}
                                    {activeTab === 'overview' && (
                                        <div>
                                            <div className="oc-breadcrumbs">
                                                <span className="oc-bc-link">Online courses</span> / <span>{selectedCourse.category || 'General'}</span> /
                                            </div>

                                            {/* Rejection Log Banner */}
                                            {selectedCourse.status_approval === 'rejected' && (
                                                <div style={{
                                                    background: '#FFF5F5',
                                                    border: '1px solid #FEE2E2',
                                                    padding: '16px',
                                                    borderRadius: '8px',
                                                    marginBottom: '20px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C53030' }}>
                                                        This Course was Rejected
                                                    </span>
                                                    <span style={{ fontSize: '12px', color: '#742A2A', lineHeight: 1.4 }}>
                                                        <strong>Reason:</strong> {selectedCourse.rejection_reason || 'No specific reason provided.'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="oc-overview-header">
                                                <div className="oc-overview-title">
                                                    <h2>{selectedCourse.title}</h2>
                                                    <p>Prepared by <strong>{selectedCourse.instructor_name || 'Instructor'}</strong></p>
                                                </div>
                                                <div className="oc-overview-ribbon-wrapper">
                                                    <img src={hoarank} alt="" className="oc-ribbon-img" onError={(e) => e.target.style.display = 'none'} />
                                                    <span className="oc-ribbon-number">{selectedCourse.id}</span>
                                                </div>
                                            </div>

                                            <h3 className="oc-overview-subtitle">{selectedCourse.subtitle || 'Course Overview'}</h3>
                                            <div
                                                className="oc-overview-desc oc-rich-content"
                                                dangerouslySetInnerHTML={{ __html: selectedCourse.description || 'No description provided.' }}
                                            />

                                            {selectedCourse.thumbnail_url || selectedCourse.thumbnail ? (
                                                <img 
                                                    src={`${API_BASE_URL}${selectedCourse.thumbnail_url || selectedCourse.thumbnail}`} 
                                                    alt="Course Hero" 
                                                    className="oc-overview-hero-img" 
                                                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                                                />
                                            ) : null}

                                            <div className="oc-info-cards">
                                                <div className="oc-info-card">
                                                    <div className="oc-ic-head">
                                                        <img src={hoatime} alt="" />
                                                        <p>Duration</p>
                                                    </div>
                                                    <h4>{selectedCourse.duration_weeks || 4} weeks</h4>
                                                </div>
                                                <div className="oc-info-card">
                                                    <div className="oc-ic-head">
                                                        <img src={hoagraycalendar} alt="" />
                                                        <p>Weekly study</p>
                                                    </div>
                                                    <h4>{selectedCourse.required_hours_per_week || 4} hours</h4>
                                                </div>
                                                <div className="oc-info-card">
                                                    <div className="oc-ic-head">
                                                        <img src={hoapaperstack} alt="" />
                                                        <p>Skill Level</p>
                                                    </div>
                                                    <h4 style={{ textTransform: 'capitalize' }}>{selectedCourse.education_level || 'Intermediate'}</h4>
                                                </div>
                                                <div className="oc-info-card" style={{ position: 'relative' }}>
                                                    <div className="oc-discount-badge" style={{ display: 'none' }}>-4% Off</div>
                                                    <div className="oc-ic-head">
                                                        <img src={hoapayicon} alt="" />
                                                        <p>Subscription</p>
                                                    </div>
                                                    <h4>
                                                        {parseFloat(selectedCourse.price) === 0 ? (
                                                            'Free'
                                                        ) : (
                                                            <>
                                                                <span style={{ color: '#EF305E' }}>${selectedCourse.price}</span> Per month
                                                            </>
                                                        )}
                                                    </h4>
                                                </div>
                                            </div>

                                            <h3 className="oc-section-title">Target Audience & Objectives</h3>
                                            <div
                                                className="oc-overview-desc oc-rich-content"
                                                style={{ marginBottom: 32 }}
                                                dangerouslySetInnerHTML={{ __html: selectedCourse.target_audience || selectedCourse.objectives || 'No details provided.' }}
                                            />

                                            <h3 className="oc-section-title">Course Breakdown</h3>
                                            <div className="oc-breakdown-list">
                                                {selectedCourse.weeks && selectedCourse.weeks.length > 0 ? (
                                                    selectedCourse.weeks.map((week, wIdx) => (
                                                        <div className="oc-bd-week-group" key={week.id || wIdx}>
                                                            <div className="oc-bd-week-col">
                                                                <div className="oc-bd-week">{week.title || `Week ${week.week_number}`}</div>
                                                            </div>
                                                            <div className="oc-bd-items-col">
                                                                <div className="oc-bd-item">
                                                                    <div className="oc-bd-icon-col">
                                                                        <div className="oc-bd-icon"><img src={hoabasics} alt="" /></div>
                                                                        {week.chapters && week.chapters.length > 0 && <div className="oc-bd-line"></div>}
                                                                    </div>
                                                                    <div className="oc-bd-content" style={{ paddingBottom: 24 }}>
                                                                        <h4 style={{
                                                                            margin: '0 0 4px 0',
                                                                            fontSize: 14,
                                                                            color: '#071437',
                                                                            fontWeight: 600,
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: '2',
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis'
                                                                        }}>
                                                                            {week.description || 'Weekly study plan & objectives'}
                                                                        </h4>
                                                                        <p style={{
                                                                            margin: 0,
                                                                            fontSize: 13,
                                                                            color: '#4B5675',
                                                                            display: '-webkit-box',
                                                                            WebkitLineClamp: '3',
                                                                            WebkitBoxOrient: 'vertical',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis'
                                                                        }}>
                                                                            {week.learning_objectives ? week.learning_objectives.replace(/"/g, '') : 'Learn new skills, pursue your interests or advance your career.'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {week.chapters && week.chapters.map((chap, cIdx) => (
                                                                    <div className="oc-bd-item" key={chap.id || cIdx}>
                                                                        <div className="oc-bd-icon-col">
                                                                            <div className="oc-bd-icon" style={{ color: '#450468', fontSize: 12, fontWeight: 700 }}>
                                                                                {cIdx + 1}
                                                                            </div>
                                                                            {cIdx !== week.chapters.length - 1 && <div className="oc-bd-line"></div>}
                                                                        </div>
                                                                        <div className="oc-bd-content" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: cIdx !== week.chapters.length - 1 ? 24 : 0 }}>
                                                                            {chap.thumbnail ? (
                                                                                <img src={`${API_BASE_URL}${chap.thumbnail}`} alt="thumb" style={{ width: 80, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                                                                            ) : (
                                                                                <div style={{ width: 80, height: 60, borderRadius: 4, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9CA3AF' }}>No Video</div>
                                                                            )}
                                                                            <div>
                                                                                <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#071437', fontWeight: 600 }}>{chap.title}</h4>
                                                                                <p style={{ margin: 0, fontSize: 11, color: '#A1A5B7' }}>
                                                                                    {chap.subtitle || 'Chapter lecture'} • {chap.duration ? `${chap.duration} mins` : 'Video content'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p style={{ fontSize: '13px', color: '#78829D' }}>No breakdown structure uploaded for this course yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ==== STUDENTS TAB ==== */}
                                    {activeTab === 'students' && (
                                        <div>
                                            <div className="oc-breadcrumbs">
                                                <span className="oc-bc-link">Online courses</span> / <span>Students</span> /
                                            </div>

                                            {loadingEnrollments ? (
                                                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading students...</p>
                                            ) : courseEnrollments.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', marginTop: '16px' }}>
                                                    <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No student enrollments for this course.</p>
                                                </div>
                                            ) : (
                                                <div className="oc-students-table-wrap">
                                                    <table className="hoa-list-table oc-students-table">
                                                        <thead>
                                                            <tr>
                                                                <th><div className="th-content">Student</div></th>
                                                                <th><div className="th-content">Email</div></th>
                                                                <th><div className="th-content">Enrolled</div></th>
                                                                <th className="action-col" />
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {courseEnrollments.map((student) => {
                                                                const avatarSrc = student.avatar
                                                                    ? (student.avatar.startsWith('http') ? student.avatar : `${API_BASE_URL}${student.avatar}`)
                                                                    : '/assets/imgs/default-profile.png';
                                                                const rowKey = String(student.id || student.user_id);
                                                                return (
                                                                    <tr key={rowKey}>
                                                                        <td>
                                                                            <div className="list-user-col">
                                                                                <img
                                                                                    src={avatarSrc}
                                                                                    alt={student.student_name}
                                                                                    onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                                                                />
                                                                                <div className="user-meta">
                                                                                    <h5>{student.student_name}</h5>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="user-meta">
                                                                                <p>{student.student_email}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td>
                                                                            <div className="user-meta">
                                                                                <p>{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="action-col">
                                                                            <div className="hoa-row-action-menu">
                                                                                <button
                                                                                    type="button"
                                                                                    className="table-link-icon"
                                                                                    onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        setOpenStudentMenuId(openStudentMenuId === rowKey ? null : rowKey);
                                                                                    }}
                                                                                >
                                                                                    <img src={hoaverticaldots} alt="Actions" style={{ width: '12px', opacity: 0.7 }} />
                                                                                </button>
                                                                                {openStudentMenuId === rowKey ? (
                                                                                    <div className="hoa-row-dropdown-menu">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="hoa-row-dropdown-item is-danger"
                                                                                            onClick={(e) => {
                                                                                                e.preventDefault();
                                                                                                e.stopPropagation();
                                                                                                handleUnenrollStudent(student);
                                                                                            }}
                                                                                        >
                                                                                            Unenroll
                                                                                        </button>
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ==== STUDENTS Q&A TAB ==== */}
                                    {activeTab === 'qa' && (
                                        <div>
                                            <div className="oc-breadcrumbs">
                                                <span className="oc-bc-link">Online courses</span> / <span>Students Q&A</span> /
                                            </div>

                                            {loadingQuestions ? (
                                                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Loading Q&A...</p>
                                            ) : courseQuestions.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', marginTop: '16px' }}>
                                                    <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No student discussions or questions for this course.</p>
                                                </div>
                                            ) : (
                                                <div className="oc-qa-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {courseQuestions.map((q) => {
                                                        const isExpanded = !!expandedReplies[q.id];
                                                        const replies = questionReplies[q.id] || [];
                                                        const isLoadingRep = !!loadingReplies[q.id];
                                                        const authorAvatar = q.student_avatar ? (q.student_avatar.startsWith('http') ? q.student_avatar : `${API_BASE_URL}${q.student_avatar}`) : '/assets/imgs/default-profile.png';
                                                        
                                                        return (
                                                            <div key={q.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#FFFFFF' }}>
                                                                {/* Question Header */}
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                        <img 
                                                                            src={authorAvatar} 
                                                                            alt={q.student_name} 
                                                                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                                                                            onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                                                        />
                                                                        <div>
                                                                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#071437' }}>{q.student_name}</h4>
                                                                            <span style={{ fontSize: '11px', color: '#A1A5B7' }}>
                                                                                {new Date(q.created_at).toLocaleDateString()}
                                                                                {q.week_number ? ` • Week ${q.week_number}` : ''}
                                                                                {q.chapter_title ? ` • ${q.chapter_title}` : ''}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <span style={{ 
                                                                        fontSize: '11px', 
                                                                        fontWeight: '600', 
                                                                        padding: '4px 8px', 
                                                                        borderRadius: '4px',
                                                                        background: q.status === 'resolved' ? '#E8FFF3' : '#FFF5F5',
                                                                        color: q.status === 'resolved' ? '#50CD89' : '#F1416C',
                                                                        textTransform: 'capitalize'
                                                                    }}>
                                                                        {q.status}
                                                                    </span>
                                                                </div>

                                                                {/* Question Title & Content */}
                                                                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#071437', margin: '0 0 6px 0' }}>{q.title}</h3>
                                                                <p style={{ fontSize: '13px', color: '#4B5675', lineHeight: '1.5', margin: '0 0 12px 0' }}>{q.content}</p>

                                                                {/* Question Footer / Reply toggle */}
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                                                    <span style={{ fontSize: '12px', color: '#78829D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                                        {q.answers_count || 0} replies
                                                                    </span>

                                                                    <button 
                                                                        onClick={() => fetchQuestionReplies(q.id)}
                                                                        style={{ 
                                                                            background: 'none', 
                                                                            border: 'none', 
                                                                            color: '#450468', 
                                                                            fontSize: '12px', 
                                                                            fontWeight: '600', 
                                                                            cursor: 'pointer',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '4px'
                                                                        }}
                                                                    >
                                                                        {isLoadingRep ? 'Loading...' : isExpanded ? 'Hide Replies' : 'Show Replies'}
                                                                    </button>
                                                                </div>

                                                                {/* Replies Section */}
                                                                {isExpanded && (
                                                                    <div style={{ marginTop: '16px', borderTop: '1px dashed #E4E6EF', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '6px' }}>
                                                                        {replies.length === 0 ? (
                                                                            <p style={{ margin: 0, fontSize: '12px', color: '#78829D', fontStyle: 'italic' }}>No replies yet.</p>
                                                                        ) : (
                                                                            replies.map((reply) => {
                                                                                const replyAvatar = reply.author_avatar ? (reply.author_avatar.startsWith('http') ? reply.author_avatar : `${API_BASE_URL}${reply.author_avatar}`) : '/assets/imgs/default-profile.png';
                                                                                return (
                                                                                    <div key={reply.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                                                                        <img 
                                                                                            src={replyAvatar} 
                                                                                            alt={reply.author_name} 
                                                                                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                                                                                            onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                                                                        />
                                                                                        <div style={{ flex: 1 }}>
                                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#071437' }}>
                                                                                                    {reply.author_name}
                                                                                                    {(reply.author_role === 'instructor' || reply.author_role === 'admin') && (
                                                                                                        <span style={{ marginLeft: '6px', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', background: '#E8FFF3', color: '#50CD89', padding: '2px 6px', borderRadius: '4px' }}>Staff</span>
                                                                                                    )}
                                                                                                </span>
                                                                                                <span style={{ fontSize: '11px', color: '#A1A5B7' }}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                            </div>
                                                                                            <div 
                                                                                                style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#4B5675', lineHeight: '1.4', whiteSpace: 'pre-wrap' }} 
                                                                                                dangerouslySetInnerHTML={{ __html: reply.content }}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

            </div>

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className="premium-toast" style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    background: toast.type === 'success' ? '#E8FFF3' : '#FFF5F5',
                    border: toast.type === 'success' ? '1px solid #50CD89' : '1px solid #F1416C',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: toast.type === 'success' ? '#50CD89' : '#F1416C',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {toast.type === 'success' ? '✓' : '✕'}
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: toast.type === 'success' ? '#1E293B' : '#651A1A'
                    }}>
                        {toast.message}
                    </span>
                </div>
            )}

            {/* Unenroll / confirm actions — fixed overlay (must sit above course drawer) */}
            {confirmAction && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 10050,
                        background: 'rgba(15, 23, 42, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 16,
                    }}
                    onClick={() => !confirmLoading && setConfirmAction(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: 'min(420px, calc(100vw - 32px))',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #EEF1F6',
                            padding: '24px',
                            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
                        }}
                    >
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0F172A' }}>{confirmAction.title}</h3>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>{confirmAction.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                type="button"
                                disabled={confirmLoading}
                                onClick={() => setConfirmAction(null)}
                                style={{
                                    height: '36px',
                                    padding: '0 14px',
                                    borderRadius: '6px',
                                    border: '1px solid #DBDFE9',
                                    background: '#fff',
                                    color: '#4B5675',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={confirmLoading}
                                onClick={executeConfirmAction}
                                style={{
                                    height: '36px',
                                    padding: '0 14px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: confirmAction.destructive ? '#EF4444' : '#450468',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: confirmLoading ? 'wait' : 'pointer',
                                    opacity: confirmLoading ? 0.75 : 1,
                                }}
                            >
                                {confirmLoading ? 'Working…' : confirmAction.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Approve Confirmation Modal Overlay */}
            {approveModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(7, 20, 55, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        width: '100%',
                        maxWidth: '450px',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(7, 20, 55, 0.15)',
                        border: '1px solid #EEF1F6',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#E8FFF3',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <span style={{ fontSize: '20px', color: '#50CD89', fontWeight: 'bold' }}>✓</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>
                            Approve Course
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to approve this course? Once approved, it will be published and learners will be able to enroll and pay for it.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button
                                onClick={() => setApproveModalOpen(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#F9F9F9',
                                    border: '1px solid #E4E6EF',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitApproval}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#50CD89',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '100px'
                                }}
                            >
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Rejection Modal Overlay */}
            {rejectionModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(7, 20, 55, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: '#FFFFFF',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: '0 10px 30px rgba(7, 20, 55, 0.15)',
                        border: '1px solid #EEF1F6'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>
                            Reject Course
                        </h3>
                        <p style={{ fontSize: '13px', color: '#78829D', marginBottom: '16px', lineHeight: '1.4' }}>
                            Please provide a detailed reason for rejecting this course. The instructor will receive this explanation via email.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Type rejection explanation here..."
                            style={{
                                width: '100%',
                                height: '120px',
                                borderRadius: '8px',
                                border: '1px solid #E4E6EF',
                                padding: '12px',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                color: '#071437',
                                resize: 'none',
                                marginBottom: '20px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setRejectionModalOpen(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#F9F9F9',
                                    border: '1px solid #E4E6EF',
                                    color: '#475569',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    background: '#F1416C',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Reject Course
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </HOALayout>
    );
};

export default HOAOnlineCourses;
