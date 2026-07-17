import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './management.css';
import '../hoa/hoa-online-courses.css';
import '../hoa/hoa-syllabus.css';

// Import all premium icons from assets
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
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
import hoaviewpaper from '../../../assets/icons/hoaviewpaper.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Inline SVGs for UI parity
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

const IconUserBust = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const IconEye = ({ width = 14, height = 14, color = "currentColor" }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const IconDocument = ({ width = 14, height = 14, color = "currentColor", strokeWidth = 1.5 }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);

const stripHtml = (html) => {
  if (!html) return '';
  // Replace HTML entities for non-breaking spaces
  let cleanHtml = html.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  try {
    const doc = new DOMParser().parseFromString(cleanHtml, 'text/html');
    let text = doc.body.textContent || "";
    // Replace unicode non-breaking spaces
    return text.replace(/\u00a0/g, ' ');
  } catch (e) {
    let text = cleanHtml.replace(/<[^>]*>/g, '');
    return text.replace(/\u00a0/g, ' ');
  }
};

const cleanDescriptionHtml = (html) => {
  if (!html) return '';
  return html.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');
};

const Management = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Tab Navigation Setup ---
  const isSyllabusView = location.pathname.includes('management-syllabuses');
  const activeTab = isSyllabusView ? 'management-syllabuses' : 'management';

  const managementTabs = [
    { id: 'management', label: 'Courses' },
    { id: 'management-syllabuses', label: 'Syllabuses' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Currency & Formatters ---
  const { currency, setCurrency, formatAmount, formatRaw } = useCurrency();
  const [openFlagDropdown, setOpenFlagDropdown] = useState(false);

  // --- Base Data States ---
  const [courses, setCourses] = useState([]);
  const [syllabuses, setSyllabuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Filter / Search / Toggles ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriceFilter, setActivePriceFilter] = useState('All'); // 'All', 'Free', 'Paid'
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Draft', 'Pending', 'Approved', 'Rejected'
  const [courseTypeFilter, setCourseTypeFilter] = useState('All Courses');
  const [isCourseFilterDropdownOpen, setIsCourseFilterDropdownOpen] = useState(false);

  // --- Drawer / Modal Previews ---
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);
  const [activeTabDetail, setActiveTabDetail] = useState('overview'); // 'overview', 'students', 'qa'

  // --- Detailed course states ---
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentsError, setEnrollmentsError] = useState('');
  const [courseQuestions, setCourseQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [questionReplies, setQuestionReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [repliesError, setRepliesError] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});

  // --- Syllabus Taxonomy Explorer State ---
  const [syllabusMode, setSyllabusMode] = useState('explorer'); // 'explorer', 'my-syllabuses'
  const [categoryTree, setCategoryTree] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [fullyExpandedCats, setFullyExpandedCats] = useState([]);
  const [currentView, setCurrentView] = useState(1); // 1 = Topics Grid, 2 = Outlines List, 3 = Outline Detail
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedOutline, setSelectedOutline] = useState(null);

  // --- Detailed Syllabus States (For own syllabuses preview) ---
  const [selectedMySyllabus, setSelectedMySyllabus] = useState(null);
  const [mySyllabusOutlines, setMySyllabusOutlines] = useState([]);
  const [loadingMySyllabusDetails, setLoadingMySyllabusDetails] = useState(false);
  const [syllabusOutlinesError, setSyllabusOutlinesError] = useState('');

  // --- Toast Notifications ---
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // In-app delete confirm (avoids browser "localhost says" dialog)
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage, location.state.toastTone || 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // --- Fetch Base Instructor Dashboard ---
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

  // --- Fetch Taxonomy categories tree ---
  const fetchCategoryTree = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/categories/tree`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCategoryTree(result.data);
        
        // Expand first by default
        const firstCat = result.data[0];
        if (firstCat) {
          setExpandedCategories([firstCat.id]);
          const firstSub = firstCat.subcategories?.[0];
          if (firstSub) {
            setSelectedSubCat(firstSub.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load categories tree:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    fetchCategoryTree();
  }, []);

  // --- Course Details Sliding Drawer Logic ---
  const loadCourseDetails = async (course) => {
    setSelectedCourse(course);
    setLoadingCourseDetails(true);
    setActiveTabDetail('overview');
    setCourseEnrollments([]);
    setCourseQuestions([]);
    setQuestionReplies({});
    setExpandedReplies({});
    setEnrollmentsError('');
    setQuestionsError('');
    setRepliesError({});

    // Fetch enrolled students
    fetchCourseEnrollments(course.id);
    // Fetch questions
    fetchCourseQuestions(course.id);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setSelectedCourse(prev => ({ ...prev, ...result.data }));
      }
    } catch (err) {
      console.error('Error fetching course structure details:', err);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  const fetchCourseEnrollments = async (courseId) => {
    setLoadingEnrollments(true);
    setEnrollmentsError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enrollments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setCourseEnrollments(result.data);
      } else if (Array.isArray(result)) {
        setCourseEnrollments(result);
      } else {
        setCourseEnrollments([]);
        setEnrollmentsError(result.message || 'Could not load enrollments.');
      }
    } catch (err) {
      setCourseEnrollments([]);
      setEnrollmentsError(err.message || 'Could not load enrollments.');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchCourseQuestions = async (courseId) => {
    setLoadingQuestions(true);
    setQuestionsError('');
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
        setQuestionsError(result.message || 'Could not load Q&A discussions.');
      }
    } catch (err) {
      setCourseQuestions([]);
      setQuestionsError(err.message || 'Could not load Q&A discussions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchQuestionReplies = async (questionId) => {
    if (questionReplies[questionId]) {
      setExpandedReplies(prev => ({ ...prev, [questionId]: !prev[questionId] }));
      return;
    }

    setLoadingReplies(prev => ({ ...prev, [questionId]: true }));
    setRepliesError(prev => ({ ...prev, [questionId]: '' }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.answers)) {
        setQuestionReplies(prev => ({ ...prev, [questionId]: result.data.answers }));
        setExpandedReplies(prev => ({ ...prev, [questionId]: true }));
      } else {
        setRepliesError(prev => ({ ...prev, [questionId]: result.message || 'Could not load replies.' }));
        setExpandedReplies(prev => ({ ...prev, [questionId]: true }));
      }
    } catch (err) {
      setRepliesError(prev => ({ ...prev, [questionId]: err.message || 'Could not load replies.' }));
      setExpandedReplies(prev => ({ ...prev, [questionId]: true }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // --- Syllabus Details Preview Logic ---
  const loadMySyllabusDetails = async (syllabus) => {
    setSelectedMySyllabus(syllabus);
    setLoadingMySyllabusDetails(true);
    setMySyllabusOutlines([]);
    setSyllabusOutlinesError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabus.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.data && Array.isArray(result.data.outlines)) {
        setMySyllabusOutlines(result.data.outlines);
      } else {
        setMySyllabusOutlines([]);
        setSyllabusOutlinesError(result.message || 'Could not load syllabus outlines.');
      }
    } catch (err) {
      setMySyllabusOutlines([]);
      setSyllabusOutlinesError(err.message || 'Could not load syllabus outlines.');
    } finally {
      setLoadingMySyllabusDetails(false);
    }
  };

  // --- Action Handlers ---
  const handleEditCourse = (courseId) => {
    navigate('/academia/professor/prepare-course', { state: { courseId } });
  };

  const handleEditSyllabus = (syllabusId) => {
    navigate(`/academia/professor/prepare-syllabus?id=${syllabusId}`, { state: { syllabusId } });
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
        setSelectedCourse(null);
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
        setSelectedMySyllabus(null);
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
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Course deleted successfully!', 'success');
        setSelectedCourse(null);
        loadDashboardData();
        return true;
      }
      showToast(data.message || 'Failed to delete course', 'error');
      return false;
    } catch (err) {
      console.error(err);
      showToast('Error deleting course', 'error');
      return false;
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/syllabuses/${syllabusId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Syllabus deleted successfully!', 'success');
        setSelectedMySyllabus(null);
        loadDashboardData();
        return true;
      }
      showToast(data.message || 'Failed to delete syllabus', 'error');
      return false;
    } catch (err) {
      console.error(err);
      showToast('Error deleting syllabus', 'error');
      return false;
    }
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm || deleteLoading) return;
    setDeleteLoading(true);
    try {
      if (deleteConfirm.type === 'syllabus') {
        await handleDeleteSyllabus(deleteConfirm.id);
      } else if (deleteConfirm.type === 'course') {
        await handleDeleteCourse(deleteConfirm.id);
      }
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  // --- Filter Computations ---
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' ||
        String(course.title).toLowerCase().includes(q) ||
        String(course.category).toLowerCase().includes(q) ||
        String(course.level).toLowerCase().includes(q);

      // 2. All/Free/Paid Toggles
      let matchesPrice = true;
      if (activePriceFilter === 'Free') {
        matchesPrice = course.price === 0;
      } else if (activePriceFilter === 'Paid') {
        matchesPrice = course.price > 0;
      }

      // 3. Status Filters (All, Draft, Pending, Approved, Rejected)
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        if (statusFilter === 'Draft') {
          matchesStatus = String(course.status).toLowerCase() === 'draft';
        } else if (statusFilter === 'Pending') {
          matchesStatus = String(course.status_approval).toLowerCase() === 'pending';
        } else if (statusFilter === 'Approved') {
          matchesStatus = String(course.status_approval).toLowerCase() === 'approved';
        } else if (statusFilter === 'Rejected') {
          matchesStatus = String(course.status_approval).toLowerCase() === 'rejected';
        }
      }

      return matchesSearch && matchesPrice && matchesStatus;
    });
  }, [courses, searchQuery, activePriceFilter, statusFilter]);

  // --- Calculated Dashboard Stats ---
  const totalCoursesCount = courses.length;
  const totalStudentsEnrolled = courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
  const averageLearningTime = 204; // Static benchmark
  const totalUploadPaymentsRWF = totalCoursesCount * 5000;
  const totalCourseRevenueRWF = courses.reduce((acc, c) => acc + (c.revenue || 0), 0);

  // Flatten subcategories
  const allSubcategories = useMemo(() => {
    const list = [];
    categoryTree.forEach(cat => {
      if (Array.isArray(cat.subcategories)) {
        cat.subcategories.forEach(sub => {
          list.push({
            ...sub,
            categoryId: cat.id,
            categoryName: cat.name
          });
        });
      }
    });
    return list;
  }, [categoryTree]);

  const selectedSubcatData = useMemo(() => {
    return allSubcategories.find(s => s.id === selectedSubCat) || null;
  }, [allSubcategories, selectedSubCat]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const toggleShowMore = (catId, e) => {
    e.stopPropagation();
    setFullyExpandedCats(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // --- Sub-renders for the Taxonomy Explorer (Views 1, 2, 3) ---
  const renderTaxonomyView1 = () => {
    const topics = selectedSubcatData?.topics || [];
    return (
      <>
        <div className="syll-view-title-row">
          <h2>{selectedSubcatData?.name || 'Explorer'}</h2>
          <div className="syll-followers-info">
            <span className="syll-followers-count"><IconUserBust /> {topics.length} Academic Topics</span>
          </div>
        </div>
        <p className="syll-desc-text">
          Select a curriculum topic below to view the educational outlines and files mapped to this category.
        </p>

        {topics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B', fontSize: '13px' }}>No topics found under this subcategory.</p>
          </div>
        ) : (
          <div className="syll-topics-grid">
            {topics.map((topic) => (
              <div key={topic.id} className="syll-topic-card">
                <div className="syll-tc-left">
                  <h4 onClick={() => { setSelectedTopic(topic); setCurrentView(2); }}>{topic.name}</h4>
                  <p>{topic.papers ? topic.papers.length : 0} Outlines</p>
                </div>
                <button className="syll-btn-view" onClick={() => { setSelectedTopic(topic); setCurrentView(2); }}>
                  <IconEye width={14} height={14} color="#99A1B7" /> View Papers
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderTaxonomyView2 = () => {
    const papers = selectedTopic?.papers || [];
    return (
      <>
        <div className="syll-view-title-row">
          <button className="oc-modal-back-btn" onClick={() => setCurrentView(1)} style={{ marginRight: '12px' }}>
            <img src={hoagoback} alt="Back" style={{ width: '16px' }} />
          </button>
          <h2>{selectedTopic?.name}</h2>
        </div>
        <p className="syll-desc-text">
          {selectedTopic?.description || 'Browse research papers and syllabus outlines for this subject.'}
        </p>

        <h3 className="syll-list-subtitle">Outlines & Papers</h3>

        {papers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
            <p style={{ color: '#64748B', fontSize: '13px' }}>No outlines uploaded under this topic.</p>
          </div>
        ) : (
          <div className="syll-papers-list">
            {papers.map((paper, idx) => (
              <div key={paper.id || idx} className="syll-paper-item">
                <div className="syll-pi-left">
                  <h4 onClick={() => { setSelectedOutline(paper); setCurrentView(3); }}>{paper.title}</h4>
                  <p className="author">By Academia Team</p>
                </div>
                <div className="syll-pi-right">
                  <button className="syll-btn-view" onClick={() => { setSelectedOutline(paper); setCurrentView(3); }}>
                    <img src={hoaviewpaper} alt="View Paper" /> View Paper
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderTaxonomyView3 = () => {
    return (
      <>
        <div className="syll-detail-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="oc-modal-back-btn" onClick={() => setCurrentView(2)}>
            <img src={hoagoback} alt="Back" style={{ width: '16px' }} />
          </button>
          <h2>{selectedOutline?.title}</h2>
          <span className="syll-badge-paid" style={{ marginLeft: 'auto' }}>Approved <IconExternalLink /></span>
        </div>

        <div className="syll-author-row" style={{ marginTop: '16px' }}>
          <div className="syll-author-info">
            <img src="/assets/imgs/default-profile.png" alt="Author" className="syll-author-avatar" />
            <span className="syll-author-name">By Academia Team</span>
          </div>
        </div>

        <div className="syll-section-block" style={{ marginTop: '20px' }}>
          <h3>Description / Abstract</h3>
          <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6' }}>
            {selectedOutline?.abstract || selectedOutline?.description || 'No description available for this syllabus outline.'}
          </p>
        </div>

        {selectedOutline?.file_url && (
          <div className="syll-section-block" style={{ marginTop: '20px' }}>
            <h3>Attached Syllabus File</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginTop: '8px' }}>
              <IconDocument color="#450468" width={20} height={20} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1E293B', display: 'block' }}>{selectedOutline.file_name || 'syllabus-document'}</span>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{selectedOutline.file_type || 'PDF Document'}</span>
              </div>
              <a 
                href={selectedOutline.file_url.startsWith('http') ? selectedOutline.file_url : `${API_BASE_URL}${selectedOutline.file_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="syll-btn-primary"
                style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '11px', height: 'auto', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Open File <IconExternalLink />
              </a>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
      <div className="prof-management-page">

        {/* Global Stats Banner */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management Workspace</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { e.preventDefault(); loadDashboardData(); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                <span>Sync Data</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {/* Primary Sub-Navigation Tabs */}
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

        {/* ========================================================
            COURSES TAB CONTENT
            ======================================================== */}
        {activeTab === 'management' && (
          <div className="hoa-online-courses-page animate-fade-in">
            {/* Top stats block */}
            <div className="oc-stats-top-container">
              <div className="oc-stats-container">
                <div className="oc-stat-block">
                  <h3>{totalCoursesCount}</h3>
                  <p>My Courses</p>
                </div>
                <div className="oc-stat-block">
                  <h3>{totalStudentsEnrolled}</h3>
                  <p>Total Learners</p>
                </div>
                <div className="oc-stat-block">
                  <h3>{averageLearningTime}h</h3>
                  <p>Avg. Study Time</p>
                </div>
                <div className="oc-stat-block">
                  <h3>
                    {formatRaw(totalUploadPaymentsRWF)}
                    <span className="oc-currency-dropdown" onClick={() => setOpenFlagDropdown(!openFlagDropdown)} style={{ position: 'relative' }}>
                      {currency.label} <img src={currency.flag} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                      {openFlagDropdown && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, background: '#FFFFFF', border: '1px solid #EEF1F6', borderRadius: '4px', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                          {flagOptions.map(option => (
                            <button key={option.label} type="button" onClick={(e) => { e.stopPropagation(); setCurrency(option); setOpenFlagDropdown(false); }} style={{ padding: '6px 12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                              <img src={option.flag} style={{ width: 12 }} alt="" /> {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </span>
                  </h3>
                  <p>Upload Fees</p>
                </div>
                <div className="oc-stat-block">
                  <h3>
                    {formatRaw(totalCourseRevenueRWF)}
                    <span className="oc-currency-dropdown" onClick={() => setOpenFlagDropdown(!openFlagDropdown)} style={{ position: 'relative' }}>
                      {currency.label} <img src={currency.flag} alt="flag" style={{ width: 10, borderRadius: '50%' }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                    </span>
                  </h3>
                  <p>Course Earnings <span className="oc-trend up">↗ +4.1%</span></p>
                </div>
              </div>
            </div>

            {/* Sub Header & Actions */}
            <div className="oc-sub-header">
              <div className="oc-sub-title">
                <h2>Program Portfolio</h2>
                <p>Manage drafts, publish updates, and view performance outcomes</p>
              </div>
              <div className="oc-add-actions">
                <button className="oc-btn-primary" onClick={() => navigate('/academia/professor/prepare-course')}>
                  <img src={hoawhiteadd} style={{ width: 16 }} alt="" /> Prepare Course
                </button>
              </div>
            </div>

            {/* Filter Dropdown & Status Switcher tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 20px 0', borderBottom: '1px solid #EEF1F6', paddingBottom: '12px' }}>
              <div className="oc-type-toggles" style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Draft', 'Pending', 'Approved', 'Rejected'].map(status => (
                  <button 
                    key={status}
                    className={`oc-type-btn ${statusFilter === status ? 'active' : ''}`} 
                    onClick={() => { setStatusFilter(status); setSelectedCourse(null); }} 
                    style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: statusFilter === status ? '#450468' : 'transparent', color: statusFilter === status ? '#FFFFFF' : '#78829D', transition: 'all 0.2s' }}
                  >
                    {status} ({
                      status === 'All' ? courses.length : courses.filter(c => {
                        if (status === 'Pending') return String(c.status_approval).toLowerCase() === 'pending';
                        if (status === 'Approved') return String(c.status_approval).toLowerCase() === 'approved';
                        if (status === 'Rejected') return String(c.status_approval).toLowerCase() === 'rejected';
                        return String(c.status).toLowerCase() === status.toLowerCase();
                      }).length
                    })
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Search Row */}
            <div className="oc-filters-row">
              <div className="oc-course-filter-container">
                <div className="oc-course-filter" onClick={() => setIsCourseFilterDropdownOpen(!isCourseFilterDropdownOpen)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={hoafilter2} style={{ width: 16, opacity: 0.5 }} alt="" /> {courseTypeFilter}
                  </span>
                  <IconDownCaret style={{ transform: isCourseFilterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#6B7280' }} />
                </div>
                {isCourseFilterDropdownOpen && (
                  <div className="oc-filter-dropdown-menu">
                    {['All Courses', 'My Courses'].map(opt => (
                      <button
                        key={opt}
                        className="oc-filter-dropdown-item"
                        onClick={() => {
                          setCourseTypeFilter(opt);
                          setIsCourseFilterDropdownOpen(false);
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
                    placeholder="Search program names or details..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="oc-type-toggles">
                  {['All', 'Free', 'Paid'].map(filter => (
                    <button
                      key={filter}
                      className={`oc-type-btn ${activePriceFilter === filter ? 'active' : ''}`}
                      onClick={() => setActivePriceFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Redesigned Courses Cards Grid */}
            {error && !isLoading ? (
              <LearnerLoadError
                title="Could not load courses"
                message={error}
                onRetry={error === 'Authentication missing. Please sign in.' ? undefined : loadDashboardData}
              />
            ) : isLoading ? (
              <ManagementLoading title="Loading courses" message="Fetching your course list." />
            ) : filteredCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FCFCFC', borderRadius: '12px', border: '1.5px dashed #E4E6EF', margin: '20px 0' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#071437', marginBottom: '4px' }}>No courses found</h4>
                <p style={{ fontSize: '13px', color: '#78829D', margin: 0 }}>Adjust your search terms or draft filters to view other courses.</p>
              </div>
            ) : (
              <div className="oc-grid">
                {filteredCourses.map((course) => {
                  const courseBg = course.thumbnail
                    ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`)
                    : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop';
                  
                  const isFree = course.price === 0;

                  // Render status label details
                  let approvalClass = 'pill-orange';
                  let approvalLabel = 'Pending Review';
                  if (String(course.status_approval).toLowerCase() === 'approved') {
                    approvalClass = 'pill-green';
                    approvalLabel = 'Approved';
                  } else if (String(course.status_approval).toLowerCase() === 'rejected') {
                    approvalClass = 'pill-red';
                    approvalLabel = 'Rejected';
                  }

                  if (String(course.status).toLowerCase() === 'draft') {
                    approvalClass = 'pill-gray';
                    approvalLabel = 'Draft';
                  }

                  return (
                    <div key={course.id} className="oc-card" onClick={() => loadCourseDetails(course)}>
                      <img src={courseBg} alt="" className="oc-card-bg" style={{ objectFit: 'cover' }} />
                      <div className="oc-card-badge">
                        {isFree ? 'Free' : formatAmount(course.price)}
                      </div>
                      <div className="oc-card-ribbon-wrapper">
                        <img src={hoarank} alt="" className="oc-ribbon-img" />
                        <span className="oc-ribbon-number">#{course.id}</span>
                      </div>
                      <div className="oc-card-content">
                        <p className="oc-card-author">{course.category || 'General'} • {course.level}</p>
                        <h4 className="oc-card-title">{course.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span className={`status-pill ${approvalClass}`} style={{ transform: 'scale(0.9)', transformOrigin: 'left center' }}>
                            <span className="dot"></span> {approvalLabel}
                          </span>
                        </div>
                        <div className="oc-card-footer" style={{ marginTop: '12px' }}>
                          <span>Created: {course.created_at}</span>
                          <IconRightArrow />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Redesigned Sliding Detailed Preview Drawer */}
            <div className={`oc-modal-overlay ${selectedCourse ? 'open' : ''}`} onClick={() => setSelectedCourse(null)}>
              <div className="oc-modal-drawer" onClick={(e) => e.stopPropagation()}>
                {selectedCourse && (
                  <>
                    {/* Header */}
                    <div className="oc-modal-top-header" style={{ display: 'flex', alignItems: 'center' }}>
                      <button className="oc-modal-back-btn" onClick={() => setSelectedCourse(null)}>
                        <img src={hoagoback} alt="Back" />
                      </button>
                      <h2>Course Workspace</h2>

                      {/* Course Workspace Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: '16px' }}>
                        <button 
                          onClick={() => handleEditCourse(selectedCourse.id)}
                          style={{ padding: '8px 16px', borderRadius: '8px', background: '#F3E8FF', border: '1px solid rgba(69, 4, 104, 0.2)', color: '#450468', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit Builder
                        </button>
                        {selectedCourse.status !== 'published' && (
                          <button 
                            onClick={() => handlePublishCourse(selectedCourse.id)}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#E8FFF3', border: '1px solid #D1FAE5', color: '#10B981', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Publish Course
                          </button>
                        )}
                        <button 
                          onClick={() => setDeleteConfirm({
                            type: 'course',
                            id: selectedCourse.id,
                            title: 'Delete course?',
                            message: `Delete "${selectedCourse.title}"? This will remove all chapters and content. This cannot be undone.`,
                          })}
                          style={{ padding: '8px 16px', borderRadius: '8px', background: '#FFF5F5', border: '1px solid #FEE2E2', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>

                      <span className="oc-update-status" style={{ border: '1px solid #EEF1F6' }}>
                        <img src={hoarefresh} alt="Refresh" className="sync-icon" />
                        Live DB Sync
                        <span className="dot" style={{ background: '#17C653' }}></span>
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="oc-modal-content-area">
                      {/* Course Stats Metrics */}
                      <div className="oc-modal-stats-row">
                        <div className="oc-mod-stat">
                          <h3>{selectedCourse.studentsCount || 0}</h3>
                          <p>Total Enrolled</p>
                        </div>
                        <div className="oc-mod-stat">
                          <h3>{formatAmount(selectedCourse.price)}</h3>
                          <p>Price Structure</p>
                        </div>
                        <div className="oc-mod-stat">
                          <h3>{formatAmount(selectedCourse.revenue || 0)}</h3>
                          <p>Total Gross Income</p>
                        </div>
                        <div className="oc-mod-stat" style={{ borderRight: 'none' }}>
                          <h3>{selectedCourse.created_at}</h3>
                          <p>Date Prepared</p>
                        </div>
                      </div>

                      {/* Modal Internal Navigation */}
                      <div className="oc-modal-tabs">
                        <button className={`oc-tab-btn ${activeTabDetail === 'overview' ? 'active' : ''}`} onClick={() => setActiveTabDetail('overview')}>Overview</button>
                        <button className={`oc-tab-btn ${activeTabDetail === 'students' ? 'active' : ''}`} onClick={() => setActiveTabDetail('students')}>Students</button>
                        <button className={`oc-tab-btn ${activeTabDetail === 'qa' ? 'active' : ''}`} onClick={() => setActiveTabDetail('qa')}>Student Q&A</button>
                      </div>

                      {/* Tab Content Panels */}
                      <div className="oc-modal-tab-content">
                        {/* ========================================================
                            OVERVIEW PANEL
                            ======================================================== */}
                        {activeTabDetail === 'overview' && (
                          <div>
                            <div className="oc-breadcrumbs">
                              <span className="oc-bc-link">Online Courses</span> / <span>{selectedCourse.category}</span> /
                            </div>

                            {/* Rejection Reasons Banner */}
                            {selectedCourse.status_approval === 'rejected' && selectedCourse.rejection_reason && (
                              <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#C53030' }}>This Course was Rejected</span>
                                <span style={{ fontSize: '12px', color: '#742A2A', lineHeight: 1.4 }}>
                                  <strong>Reason:</strong> {selectedCourse.rejection_reason}
                                </span>
                              </div>
                            )}

                            <div className="oc-overview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div className="oc-overview-title">
                                <h2>{selectedCourse.title}</h2>
                                <p>Language: <strong>{selectedCourse.language}</strong> • Category: <strong>{selectedCourse.category}</strong></p>
                              </div>
                              <div className="oc-overview-ribbon-wrapper">
                                <img src={hoarank} alt="" className="oc-ribbon-img" />
                                <span className="oc-ribbon-number">{selectedCourse.id}</span>
                              </div>
                            </div>

                            <h3 className="oc-overview-subtitle">Description</h3>
                            <div className="oc-overview-desc" dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(selectedCourse.description) }} />

                            <div className="oc-info-cards" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '20px 0' }}>
                              <div className="oc-info-card" style={{ flex: 1, minWidth: '130px' }}>
                                <div className="oc-ic-head">
                                  <img src={hoatime} alt="" />
                                  <p>Duration</p>
                                </div>
                                <h4>{selectedCourse.duration_weeks || 4} Weeks</h4>
                              </div>
                              <div className="oc-info-card" style={{ flex: 1, minWidth: '130px' }}>
                                <div className="oc-ic-head">
                                  <img src={hoapaperstack} alt="" />
                                  <p>Skill Level</p>
                                </div>
                                <h4 style={{ textTransform: 'capitalize' }}>{selectedCourse.level}</h4>
                              </div>
                              <div className="oc-info-card" style={{ flex: 1, minWidth: '130px' }}>
                                <div className="oc-ic-head">
                                  <img src={hoapayicon} alt="" />
                                  <p>Pricing Tier</p>
                                </div>
                                <h4>{selectedCourse.price === 0 ? 'Free' : formatAmount(selectedCourse.price)}</h4>
                              </div>
                            </div>

                            {/* Syllabus Structure Weeks & Lectures Breakdown */}
                            <h3 className="oc-section-title" style={{ marginTop: '28px', borderBottom: '1px solid #EEF1F6', paddingBottom: '10px' }}>Curriculum Breakdown</h3>
                            <div className="oc-breakdown-list" style={{ marginTop: '16px' }}>
                              {loadingCourseDetails ? (
                                <ManagementLoading compact title="Loading curriculum" message="Fetching course outline and lectures." />
                              ) : selectedCourse.weeks && selectedCourse.weeks.length > 0 ? (
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
                                          <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#071437', fontWeight: 600 }}>
                                            {week.description || 'Weekly study objectives & topics'}
                                          </h4>
                                          <p style={{ margin: 0, fontSize: 13, color: '#4B5675' }}>
                                            {week.learning_objectives || 'Master the concepts and practical skillsets outlined in this chapter.'}
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
                                              <img src={`${API_BASE_URL}${chap.thumbnail}`} alt="thumb" style={{ width: 80, height: 60, borderRadius: 4, objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                              <div style={{ width: 80, height: 60, borderRadius: 4, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9CA3AF' }}>No Video</div>
                                            )}
                                            <div>
                                              <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#071437', fontWeight: 600 }}>{chap.title}</h4>
                                              <p style={{ margin: 0, fontSize: 11, color: '#A1A5B7' }}>
                                                {chap.subtitle || 'Lecture lecture'} • {chap.duration ? `${chap.duration} mins` : 'Video content'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p style={{ fontSize: '13px', color: '#78829D' }}>No curriculum lectures uploaded for this course yet.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* ========================================================
                            STUDENTS LIST PANEL
                            ======================================================== */}
                        {activeTabDetail === 'students' && (
                          <div>
                            <div className="oc-breadcrumbs">
                              <span className="oc-bc-link">Online Courses</span> / <span>Enrolled Students</span> /
                            </div>

                            {loadingEnrollments ? (
                              <ManagementLoading compact title="Loading enrollments" message="Fetching enrolled students." />
                            ) : enrollmentsError ? (
                              <LearnerLoadError
                                title="Could not load enrollments"
                                message={enrollmentsError}
                                onRetry={() => selectedCourse?.id && fetchCourseEnrollments(selectedCourse.id)}
                              />
                            ) : courseEnrollments.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', marginTop: '16px' }}>
                                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No student enrollments for this program.</p>
                              </div>
                            ) : (
                              <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                                <table className="oc-students-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #EEF1F6', textAlign: 'left' }}>
                                      <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#8A92A6', textTransform: 'uppercase' }}>STUDENT</th>
                                      <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#8A92A6', textTransform: 'uppercase' }}>EMAIL</th>
                                      <th style={{ padding: '12px 8px', fontSize: '11px', fontWeight: '600', color: '#8A92A6', textTransform: 'uppercase' }}>ENROLLED DATE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {courseEnrollments.map((student) => {
                                      const avatarSrc = student.avatar
                                        ? (student.avatar.startsWith('http') ? student.avatar : `${API_BASE_URL}${student.avatar}`)
                                        : '/assets/imgs/default-profile.png';
                                      return (
                                        <tr key={student.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                          <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img 
                                              src={avatarSrc} 
                                              alt={student.student_name} 
                                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                                              onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                            />
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#071437' }}>{student.student_name || student.student_email || 'Anonymous Student'}</span>
                                          </td>
                                          <td style={{ padding: '16px 8px', fontSize: '13px', color: '#4B5675' }}>{student.student_email}</td>
                                          <td style={{ padding: '16px 8px', fontSize: '13px', color: '#4B5675' }}>
                                            {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
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

                        {/* ========================================================
                            QA DISCUSSION PANEL
                            ======================================================== */}
                        {activeTabDetail === 'qa' && (
                          <div>
                            <div className="oc-breadcrumbs">
                              <span className="oc-bc-link">Online Courses</span> / <span>Q&A Discussions</span> /
                            </div>

                            {loadingQuestions ? (
                              <ManagementLoading compact title="Loading discussions" message="Fetching Q&A posts for this course." />
                            ) : questionsError ? (
                              <LearnerLoadError
                                title="Could not load discussions"
                                message={questionsError}
                                onRetry={() => selectedCourse?.id && fetchCourseQuestions(selectedCourse.id)}
                              />
                            ) : courseQuestions.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', marginTop: '16px' }}>
                                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>No Q&A posts from learners found for this course.</p>
                              </div>
                            ) : (
                              <div className="oc-qa-list" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {courseQuestions.map((q) => {
                                  const isExpanded = !!expandedReplies[q.id];
                                  const replies = questionReplies[q.id] || [];
                                  const isLoadingRep = !!loadingReplies[q.id];
                                  const authorAvatar = q.student_avatar
                                    ? (q.student_avatar.startsWith('http') ? q.student_avatar : `${API_BASE_URL}${q.student_avatar}`)
                                    : '/assets/imgs/default-profile.png';
                                  
                                  return (
                                    <div key={q.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px', background: '#FFFFFF' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <img 
                                            src={authorAvatar} 
                                            alt={q.student_name} 
                                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                                            onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                          />
                                          <div>
                                            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#071437' }}>{q.student_name}</h4>
                                            <span style={{ fontSize: '11px', color: '#A1A5B7' }}>
                                              Posted: {new Date(q.created_at).toLocaleDateString()}
                                              {q.week_number ? ` • Week ${q.week_number}` : ''}
                                              {q.chapter_title ? ` • ${q.chapter_title}` : ''}
                                            </span>
                                          </div>
                                        </div>
                                        <span style={{ 
                                          fontSize: '10px', 
                                          fontWeight: '700', 
                                          padding: '2px 8px', 
                                          borderRadius: '4px',
                                          background: q.status === 'resolved' ? '#E8FFF3' : '#FFF5F5',
                                          color: q.status === 'resolved' ? '#50CD89' : '#F1416C',
                                          textTransform: 'uppercase'
                                        }}>
                                          {q.status}
                                        </span>
                                      </div>

                                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#071437', margin: '0 0 6px 0' }}>{q.title}</h3>
                                      <p style={{ fontSize: '13px', color: '#4B5675', lineHeight: '1.4', margin: '0 0 12px 0' }}>{q.content}</p>

                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                        <span style={{ fontSize: '12px', color: '#78829D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                          {q.answers_count || 0} Replies
                                        </span>

                                        <button 
                                          onClick={() => fetchQuestionReplies(q.id)}
                                          style={{ background: 'none', border: 'none', color: '#450468', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                          {isLoadingRep ? 'Loading...' : isExpanded ? 'Hide Replies' : 'Show Replies'}
                                        </button>
                                      </div>

                                      {isExpanded && (
                                        <div style={{ marginTop: '12px', borderTop: '1px dashed #E4E6EF', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '6px' }}>
                                          {repliesError[q.id] ? (
                                            <LearnerLoadError
                                              title="Could not load replies"
                                              message={repliesError[q.id]}
                                              onRetry={() => fetchQuestionReplies(q.id)}
                                            />
                                          ) : replies.length === 0 ? (
                                            <p style={{ margin: 0, fontSize: '11px', color: '#78829D', fontStyle: 'italic' }}>No replies to this post yet.</p>
                                          ) : (
                                            replies.map((reply) => {
                                              const repAvatar = reply.author_avatar
                                                ? (reply.author_avatar.startsWith('http') ? reply.author_avatar : `${API_BASE_URL}${reply.author_avatar}`)
                                                : '/assets/imgs/default-profile.png';
                                              return (
                                                <div key={reply.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                  <img 
                                                    src={repAvatar} 
                                                    alt={reply.author_name} 
                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                                                    onError={(e) => { e.target.src = '/assets/imgs/default-profile.png'; }}
                                                  />
                                                  <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#071437' }}>
                                                        {reply.author_name}
                                                        {(reply.author_role === 'instructor' || reply.author_role === 'admin') && (
                                                          <span style={{ marginLeft: '6px', fontSize: '8px', fontWeight: '700', textTransform: 'uppercase', background: '#E8FFF3', color: '#50CD89', padding: '1px 4px', borderRadius: '4px' }}>Staff</span>
                                                        )}
                                                      </span>
                                                      <span style={{ fontSize: '11px', color: '#A1A5B7' }}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div 
                                                      style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#4B5675', lineHeight: '1.4', whiteSpace: 'pre-wrap' }} 
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SYLLABUSES TAB CONTENT
            ======================================================== */}
        {activeTab === 'management-syllabuses' && (
          <div className="hoa-syllabus-page animate-fade-in">
            {/* Top stats blocks */}
            <div className="syll-top-stats-container">
              <div className="syll-stats-container">
                <div className="syll-stat-block">
                  <h3>{categoryTree.length}</h3>
                  <p>Taxonomy Categories</p>
                </div>
                <div className="syll-stat-block">
                  <h3>{syllabuses.length}</h3>
                  <p>My Syllabuses</p>
                </div>
                <div className="syll-stat-block">
                  <h3>{syllabuses.filter(s => String(s.status_approval).toLowerCase() === 'pending').length}</h3>
                  <p>Pending Moderations</p>
                </div>
                <div className="syll-stat-block">
                  <h3>{syllabuses.filter(s => String(s.status_approval).toLowerCase() === 'rejected').length}</h3>
                  <p>Rejected Attempts</p>
                </div>
              </div>
            </div>

            {/* Redesigned sub-header & switches */}
            <div className="syll-sub-header">
              <div className="syll-sub-title">
                <h2>Syllabus Directory</h2>
                <p>Browse global taxonomies or check and manage your personal outline submissions</p>
              </div>
              <div className="syll-type-toggles" style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`syll-type-btn ${syllabusMode === 'explorer' ? 'active' : ''}`} 
                  onClick={() => { setSyllabusMode('explorer'); setSelectedMySyllabus(null); }}
                >
                  Taxonomy Explorer
                </button>
                <button 
                  className={`syll-type-btn ${syllabusMode === 'my-syllabuses' ? 'active' : ''}`} 
                  onClick={() => { setSyllabusMode('my-syllabuses'); setSelectedMySyllabus(null); }}
                >
                  My Syllabuses ({syllabuses.length})
                </button>
              </div>
            </div>

            {/* Layout Panels */}
            {syllabusMode === 'explorer' ? (
              <div className="syll-layout">
                {/* Left Sidebar categories tree */}
                <div className="syll-sidebar">
                  <div className="syll-course-filter">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 600 }}>
                      <img src={hoafilter2} style={{ width: 16 }} alt="" /> Curriculum Explorer
                    </span>
                  </div>

                  <div className="syll-cat-list" style={{ marginTop: '12px' }}>
                    {categoryTree.map((cat, idx) => (
                      <div key={cat.id || idx}>
                        <div
                          className={`syll-cat-header ${expandedCategories.includes(cat.id) ? 'active' : ''}`}
                          onClick={() => toggleCategory(cat.id)}
                        >
                          {cat.name}
                          <IconDownCaret 
                            width={14} height={8}
                            style={{ transform: expandedCategories.includes(cat.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#071437' }}
                          />
                        </div>

                        {expandedCategories.includes(cat.id) && cat.subcategories && (
                          <div className="syll-subcat-list">
                            {(fullyExpandedCats.includes(cat.id) ? cat.subcategories : cat.subcategories.slice(0, 6)).map((sub, sidx) => (
                              <div
                                key={sub.id || sidx}
                                className={`syll-subcat-item ${selectedSubCat === sub.id ? 'active' : ''}`}
                                onClick={() => { setSelectedSubCat(sub.id); setCurrentView(1); }}
                              >
                                <div className="syll-radio-label">
                                  <div className="syll-radio-circle"></div>
                                  {sub.name}
                                </div>
                                <span className="syll-count-badge">{sub.topics ? sub.topics.length : 0}</span>
                              </div>
                            ))}
                            {cat.subcategories.length > 6 && (
                              <button 
                                className="syll-show-more"
                                onClick={(e) => toggleShowMore(cat.id, e)}
                              >
                                {fullyExpandedCats.includes(cat.id) ? 'Show Less' : `+ ${cat.subcategories.length - 6} More`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right content exploration workspace */}
                <div className="syll-content-pane">
                  {currentView === 1 && renderTaxonomyView1()}
                  {currentView === 2 && renderTaxonomyView2()}
                  {currentView === 3 && renderTaxonomyView3()}
                </div>
              </div>
            ) : (
              // ========================================================
              // MY SYLLABUSES MODE
              // ========================================================
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#071437', margin: 0 }}>My Syllabus Proposals</h3>
                  <button className="syll-btn-primary" style={{ height: '36px' }} onClick={() => navigate('/academia/professor/prepare-syllabus')}>
                    <img src={hoawhiteadd} style={{ width: 14 }} alt="" /> Prepare Syllabus
                  </button>
                </div>

                {selectedMySyllabus ? (
                  // Detailed Syllabus View Pane (Preserves review visual layout)
                  <div className="syll-detail-view" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #EEF1F6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '20px' }}>
                      <button 
                        onClick={() => { setSelectedMySyllabus(null); setMySyllabusOutlines([]); }} 
                        className="syll-back-btn"
                        style={{ border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                      >
                        &larr; Back to My Syllabus List
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Syllabus workspace actions */}
                        <button 
                          onClick={() => handleEditSyllabus(selectedMySyllabus.id)}
                          style={{ padding: '6px 14px', borderRadius: '6px', background: '#F3E8FF', border: '1px solid rgba(69, 4, 104, 0.2)', color: '#450468', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit Builder
                        </button>
                        {selectedMySyllabus.status !== 'published' && (
                          <button 
                            onClick={() => handlePublishSyllabus(selectedMySyllabus.id)}
                            style={{ padding: '6px 14px', borderRadius: '6px', background: '#E8FFF3', border: '1px solid #D1FAE5', color: '#10B981', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Publish Syllabus
                          </button>
                        )}
                        <button 
                          onClick={() => setDeleteConfirm({
                            type: 'syllabus',
                            id: selectedMySyllabus.id,
                            title: 'Delete syllabus?',
                            message: `Delete "${selectedMySyllabus.title}"? This will remove the syllabus and its outlines. This cannot be undone.`,
                          })}
                          style={{ padding: '6px 14px', borderRadius: '6px', background: '#FFF5F5', border: '1px solid #FEE2E2', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#071437', marginBottom: '8px' }}>{selectedMySyllabus.title}</h2>
                    <p style={{ fontSize: '12px', color: '#78829D', marginBottom: '16px' }}>
                      Created on: <strong>{selectedMySyllabus.created_at}</strong> • Price Tier: <strong>{formatAmount(selectedMySyllabus.price)}</strong>
                    </p>

                    {/* Rejection notice details */}
                    {String(selectedMySyllabus.status_approval).toLowerCase() === 'rejected' && selectedMySyllabus.rejection_reason && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '16px', borderRadius: '8px', color: '#991B1B', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px 0' }}>Rejection Explanation</h4>
                        <p style={{ fontSize: '12.5px', margin: 0, lineHeight: 1.4 }}>{selectedMySyllabus.rejection_reason}</p>
                      </div>
                    )}

                    <div className="syll-section-block" style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#071437', marginBottom: '8px' }}>Description Summary</h3>
                      <div 
                        style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(selectedMySyllabus.description || 'No description provided.') }}
                      />
                    </div>

                    {/* Outlines list inside selected My Syllabus */}
                    <div className="syll-section-block" style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#071437', marginBottom: '12px' }}>Syllabus Outlines / Papers ({mySyllabusOutlines.length})</h3>
                      {loadingMySyllabusDetails ? (
                        <ManagementLoading compact title="Loading outlines" message="Fetching syllabus papers." />
                      ) : syllabusOutlinesError ? (
                        <LearnerLoadError
                          title="Could not load outlines"
                          message={syllabusOutlinesError}
                          onRetry={() => selectedMySyllabus && loadMySyllabusDetails(selectedMySyllabus)}
                        />
                      ) : mySyllabusOutlines.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#64748B' }}>No outlines uploaded for this syllabus yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {mySyllabusOutlines.map((outline, idx) => (
                            <div key={outline.id || idx} style={{ border: '1px solid #F1F5F9', borderRadius: '8px', padding: '16px', background: '#FCFCFC' }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}>{idx + 1}. {outline.title}</h4>
                              <div 
                                style={{ fontSize: '12.5px', color: '#475569', marginBottom: '10px', lineHeight: 1.5 }}
                                dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(outline.abstract || outline.description || 'No description provided.') }}
                              />
                              {outline.file_url && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IconDocument color="#8B5CF6" width={16} height={16} />
                                  <a 
                                    href={outline.file_url.startsWith('http') ? outline.file_url : `${API_BASE_URL}${outline.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 500, textDecoration: 'none' }}
                                  >
                                    View Attached Material ({outline.file_name || 'Document'})
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Grid List of own syllabuses
                  <div className="syll-papers-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {error && !isLoading ? (
                      <div style={{ gridColumn: '1/-1' }}>
                        <LearnerLoadError
                          title="Could not load syllabuses"
                          message={error}
                          onRetry={error === 'Authentication missing. Please sign in.' ? undefined : loadDashboardData}
                        />
                      </div>
                    ) : isLoading ? (
                      <div style={{ gridColumn: '1/-1' }}>
                        <ManagementLoading title="Loading syllabuses" message="Fetching your syllabus list." />
                      </div>
                    ) : syllabuses.length === 0 ? (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1' }}>
                        <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>You have not prepared any syllabuses yet.</p>
                      </div>
                    ) : (
                      syllabuses.map((syllabus) => {
                        let approvalClass = 'pill-orange';
                        let approvalLabel = 'Pending Review';
                        if (String(syllabus.status_approval).toLowerCase() === 'approved') {
                          approvalClass = 'pill-green';
                          approvalLabel = 'Approved';
                        } else if (String(syllabus.status_approval).toLowerCase() === 'rejected') {
                          approvalClass = 'pill-red';
                          approvalLabel = 'Rejected';
                        }

                        if (String(syllabus.status).toLowerCase() === 'draft') {
                          approvalClass = 'pill-gray';
                          approvalLabel = 'Draft';
                        }

                        return (
                          <div 
                            key={syllabus.id} 
                            className="syll-paper-item" 
                            style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid #EEF1F6', cursor: 'pointer', transition: 'all 0.2s', gap: '8px' }}
                            onClick={() => loadMySyllabusDetails(syllabus)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#071437', margin: 0 }}>{syllabus.title}</h3>
                              <span className={`status-pill ${approvalClass}`} style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
                                <span className="dot"></span> {approvalLabel}
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                              Prepared on {syllabus.created_at} • {syllabus.outline_count} Outlines
                            </p>
                            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, maxHeight: '54px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', margin: '4px 0 0 0' }}>
                              {stripHtml(syllabus.description) || 'No description summary details provided.'}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Global Toast Alert Notification */}
        {toast.show && (
          <div className={`prof-toast-container toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        )}

        {deleteConfirm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10050,
              background: 'rgba(15, 23, 42, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => !deleteLoading && setDeleteConfirm(null)}
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
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0F172A' }}>{deleteConfirm.title}</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>{deleteConfirm.message}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setDeleteConfirm(null)}
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
                  disabled={deleteLoading}
                  onClick={confirmDeleteAction}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: deleteLoading ? 'wait' : 'pointer',
                    opacity: deleteLoading ? 0.75 : 1,
                  }}
                >
                  {deleteLoading ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
};

export default Management;