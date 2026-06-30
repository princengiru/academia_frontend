import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './assignments.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const ASSESSMENT_TYPE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Formative', value: 'formative' },
  { label: 'Summative', value: 'summative' },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25];

const FORMATIVE_ASSESSMENT_TYPE_OPTIONS = [
  { label: 'Quiz', value: 'quiz' },
  { label: 'Practice', value: 'practice' },
  { label: 'Homework', value: 'homework' },
];

const SUMMATIVE_ASSESSMENT_TYPE_OPTIONS = [
  { label: 'Final exam', value: 'final_exam' },
  { label: 'Project', value: 'project' },
  { label: 'Presentation', value: 'presentation' },
  { label: 'Practical', value: 'practical' },
];

const QUESTION_TYPE_OPTIONS = [
  { label: 'Multiple choice', value: 'multiple_choice' },
  { label: 'True / False', value: 'true_false' },
  { label: 'Short answer', value: 'short_answer' },
  { label: 'Essay', value: 'essay' },
];

const normalizeAssessmentRow = (row, index) => {
  const category = String(row?.assessment_category || row?.category || row?.type || 'summative').toLowerCase();
  const assessmentType = String(row?.assessment_type || row?.assessmentType || '').replace(/_/g, ' ') || (category === 'formative' ? 'Quiz' : 'Final Exam');
  const is_published = row?.is_published ?? row?.isPublished ?? false;

  return {
    ...row,
    id: row?.id ?? row?._id ?? `assessment-${index}`,
    title: row?.title || row?.assignment_name || 'Assessment',
    category,
    assessmentType,
    is_published: Boolean(is_published),
    courseName: row?.course_name || row?.courseTitle || 'Course',
    studentsAttempts: Number(row?.students_attempts ?? row?.total_attempts ?? 0),
    avgScore: row?.avg_score ?? row?.avgScore ?? '---',
    durationMinutes: Number(row?.duration_minutes ?? row?.time_attempt_minutes ?? 0),
    totalPoints: Number(row?.total_points ?? 0),
    certificatesEarned: Number(row?.certificates_earned ?? 0),
    passingScore: Number(row?.passing_score ?? 0),
    attemptLimit: row?.attempt_limit ?? '---',
    createdAt: row?.created_at || row?.createdAt || null,
    searchText: `${row?.title || row?.assignment_name || ''} ${row?.course_name || row?.courseTitle || ''} ${assessmentType} ${category}`.toLowerCase(),
  };
};

// Reusable SVG Toolbar Component
const RichTextToolbar = () => (
  <div className="prof-toolbar" aria-hidden="true">
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bold"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Italic"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Underline"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
    <span className="prof-toolbar-sep"></span>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bulleted List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="6" r="1.5"/><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Numbered List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7.5" fontSize="6" fill="#64748B">1.</text><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
    <span className="prof-toolbar-sep"></span>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Left"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="5" x2="13" y2="5"/><line x1="3" y1="8" x2="9" y2="8"/><line x1="3" y1="11" x2="13" y2="11"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Center"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="5" y1="5" x2="11" y2="5"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="5" y1="11" x2="11" y2="11"/></svg></button>
    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Align Right"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="5" x2="13" y2="5"/><line x1="7" y1="8" x2="13" y2="8"/><line x1="3" y1="11" x2="13" y2="11"/></svg></button>
  </div>
);

const Assignments = () => {
  const preventDefault = (e) => e.preventDefault();

  const [assessmentRows, setAssessmentRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const selectAllRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const filterRef = useRef(null);
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

  const [openDropdownId, setOpenDropdownId] = useState(null); // 'type', 'course', 'week', 'qtype' or null
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // Student submissions and attempts state
  const [submissionsAssessment, setSubmissionsAssessment] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);

  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptError, setAttemptError] = useState('');
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);

  const [manualGrades, setManualGrades] = useState({});
  const [attemptFeedback, setAttemptFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradingError, setGradingError] = useState('');

  // --- Submissions Actions ---
  const handleOpenSubmissions = async (row) => {
    setSubmissionsAssessment(row);
    setIsSubmissionsModalOpen(true);
    setSubmissionsLoading(true);
    setSubmissionsError('');
    setSubmissionsList([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSubmissionsError('Authentication missing.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/instructor/assessments/${row.category}/${row.id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (response.ok) {
        setSubmissionsList(Array.isArray(body?.data) ? body.data : []);
      } else {
        setSubmissionsError(body?.error?.message || body?.message || 'Failed to fetch student submissions.');
      }
    } catch (error) {
      setSubmissionsError(error.message || 'Failed to fetch student submissions.');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOpenAttemptDetails = async (attemptId, category) => {
    setSelectedAttemptId(attemptId);
    setIsAttemptModalOpen(true);
    setAttemptLoading(true);
    setAttemptError('');
    setAttemptDetails(null);
    setManualGrades({});
    setAttemptFeedback('');
    setGradingError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAttemptError('Authentication missing.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/instructor/attempts/${category}/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (response.ok) {
        const details = body?.data || body;
        setAttemptDetails(details);
        setAttemptFeedback(details?.attempt?.feedback || '');
        const initialGrades = {};
        if (Array.isArray(details?.questions)) {
          details.questions.forEach(q => {
            initialGrades[q.id] = q.points_earned ?? 0;
          });
        }
        setManualGrades(initialGrades);
      } else {
        setAttemptError(body?.error?.message || body?.message || 'Failed to fetch attempt details.');
      }
    } catch (error) {
      setAttemptError(error.message || 'Failed to fetch attempt details.');
    } finally {
      setAttemptLoading(false);
    }
  };

  const handleSubmitGrade = async () => {
    if (!attemptDetails || !submissionsAssessment) return;
    setSubmittingGrade(true);
    setGradingError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setGradingError('Authentication missing.');
        return;
      }

      const questionGradesPayload = Object.keys(manualGrades).map(qId => ({
        questionId: parseInt(qId),
        pointsEarned: parseFloat(manualGrades[qId] || 0)
      }));

      const response = await fetch(`${API_BASE_URL}/api/instructor/attempts/${submissionsAssessment.category}/${attemptDetails.attempt.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedback: attemptFeedback,
          questionGrades: questionGradesPayload
        })
      });

      const body = await response.json();
      if (response.ok) {
        showToast('Grades submitted successfully!', 'success');
        setIsAttemptModalOpen(false);
        handleOpenSubmissions(submissionsAssessment);
        setRefreshTrigger(prev => prev + 1);
      } else {
        setGradingError(body?.error?.message || body?.message || 'Failed to submit grades.');
      }
    } catch (error) {
      setGradingError(error.message || 'Failed to submit grades.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleDeleteAttempt = (attemptId) => {
    setConfirmModal({
      show: true,
      title: 'Delete Student Attempt',
      message: "Are you sure you want to delete this attempt? This will permanently remove the student's score and answers for this attempt. This action cannot be undone.",
      onConfirm: () => proceedDeleteAttempt(attemptId)
    });
  };

  const proceedDeleteAttempt = async (attemptId) => {
    if (!submissionsAssessment) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication missing.', 'error');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/instructor/attempts/${submissionsAssessment.category}/${attemptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const body = await response.json();
      if (response.ok) {
        showToast('Attempt deleted successfully!', 'success');
        handleOpenSubmissions(submissionsAssessment);
        setRefreshTrigger(prev => prev + 1);
      } else {
        showToast(body?.error?.message || body?.message || 'Failed to delete attempt.', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete attempt.', 'error');
    }
  };

  // Close dropdowns on outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (!event.target.closest('.prof-row-action-menu')) {
        setOpenRowMenuId(null);
      }
      if (!event.target.closest('.assessments-modal-dropdown')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const courseHasSummative = (cId, editingId = null) => {
    return normalizedRows.some(row => {
      const isSummative = row.category === 'summative';
      const rowCourseId = String(row.courseId || row.course_id || '');
      const rowId = String(row.id || '');
      return isSummative && rowCourseId === String(cId) && rowId !== String(editingId);
    });
  };

  const handleStepClick = (targetStep) => {
    const title = createForm.title.trim();
    const courseId = String(createForm.course_id || '').trim();
    const weekId = String(createForm.week_id || '').trim();
    const isFormative = createForm.assessmentKind === 'formative';

    if (targetStep === 'lesson' || targetStep === 'questions' || targetStep === 'pricing') {
      if (!title) {
        setCreateError('Give the assessment a title.');
        setModalStep('basic');
        return;
      }
    }

    if (targetStep === 'questions' || targetStep === 'pricing') {
      if (!courseId) {
        setCreateError('Select a course first.');
        setModalStep('lesson');
        return;
      }
      if (!isFormative && courseHasSummative(courseId, editingAssessmentId)) {
        setCreateError('This course already has a summative assessment. Only one summative assessment is allowed per course.');
        setModalStep('lesson');
        return;
      }
      if (isFormative && !weekId) {
        setCreateError('Select the week for this formative assessment.');
        setModalStep('lesson');
        return;
      }
    }

    setCreateError('');
    setModalStep(targetStep);
  };

  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseWeeks, setCourseWeeks] = useState([]);
  
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('basic');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [createForm, setCreateForm] = useState({
    assessmentKind: 'summative',
    assessmentType: 'final_exam',
    title: '',
    description: '',
    duration_minutes: '60',
    total_points: '100',
    passing_score: '60',
    attempt_limit: '1',
    min_course_progress: '100',
    prerequisite_pass_formative: false,
    show_correct_answers: false,
    show_score_immediately: true,
    randomize_questions: false,
    is_published: true,
    course_id: '',
    week_id: '',
    questions: [],
  });

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: [],
    correct: null,
    explanation: '',
    points: 1,
  });

  const computedTotalPoints = useMemo(() => {
    return (createForm.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  }, [createForm.questions]);

  const stepOrder = ['basic', 'lesson', 'questions', 'pricing'];

  // --- Debounce Search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const updateCreateField = (field, value) => {
    setCreateForm((previous) => ({ ...previous, [field]: value }));
  };

  const assessmentTypeOptions = createForm.assessmentKind === 'formative'
    ? FORMATIVE_ASSESSMENT_TYPE_OPTIONS
    : SUMMATIVE_ASSESSMENT_TYPE_OPTIONS;

  const assessmentTypeLabel = assessmentTypeOptions.find((option) => option.value === createForm.assessmentType)?.label || 'Select type';
  const courseLabel = instructorCourses.find((course) => String(course.id) === String(createForm.course_id))?.title || 'Select a course';
  const weekLabel = courseWeeks.find((week) => String(week.id) === String(createForm.week_id))?.title || 'Select a week';
  const questionTypeLabel = QUESTION_TYPE_OPTIONS.find((option) => option.value === newQuestion.question_type)?.label || 'Select type';

  // --- Core API Fetches ---
  useEffect(() => {
    const controller = new AbortController();
    
    const loadAssessments = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setFetchError('Authentication missing.');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/instructor/assessments?type=${typeFilter}&limit=100&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        const body = await response.json();

        if (response.ok) {
          setAssessmentRows(Array.isArray(body?.data?.assessments) ? body.data.assessments : []);
          setCurrentPage(1);
          setSelectedRowIds(new Set());
        } else {
          setAssessmentRows([]);
          setFetchError(body?.message || body?.error?.message || 'Failed to load assessments.');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAssessmentRows([]);
          setFetchError(error.message || 'Failed to load assessments.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
    return () => controller.abort();
  }, [typeFilter, refreshTrigger]); // Reloads when type filter changes or refreshTrigger increments

  useEffect(() => {
    const controller = new AbortController();

    const loadInstructorCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        const body = await response.json();
        if (!response.ok) return;

        const courses = Array.isArray(body?.data?.courses) ? body.data.courses : [];
        setInstructorCourses(courses);

        setCreateForm((previous) => {
          if (previous.course_id || courses.length === 0) return previous;
          return { ...previous, course_id: String(courses[0].id) };
        });
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Load instructor courses error:', error);
      }
    };

    loadInstructorCourses();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!createForm.course_id || createForm.assessmentKind !== 'formative') {
      setCourseWeeks([]);
      return;
    }

    const controller = new AbortController();

    const loadCourseWeeks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/courses/${createForm.course_id}/weeks`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        const body = await response.json();
        if (!response.ok) {
          setCourseWeeks([]);
          return;
        }

        const weeks = Array.isArray(body?.data?.weeks) ? body.data.weeks : [];
        setCourseWeeks(weeks);
        setCreateForm((previous) => {
          const hasWeek = weeks.some((w) => String(w.id) === String(previous.week_id));
          if (hasWeek) return previous;
          return {
            ...previous,
            week_id: weeks.length > 0 ? String(weeks[0].id) : '',
          };
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Load course weeks error:', error);
          setCourseWeeks([]);
        }
      }
    };

    loadCourseWeeks();
    return () => controller.abort();
  }, [createForm.course_id, createForm.assessmentKind]);


  // --- Modal & Form Logic ---
  const resetCreateForm = () => {
    setCreateForm({
      assessmentKind: 'summative',
      assessmentType: 'final_exam',
      title: '',
      description: '',
      duration_minutes: '60',
      total_points: '100',
      passing_score: '60',
      attempt_limit: '1',
      min_course_progress: '100',
      prerequisite_pass_formative: false,
      show_correct_answers: false,
      show_score_immediately: true,
      randomize_questions: false,
      is_published: true,
      course_id: instructorCourses.length > 0 ? String(instructorCourses[0].id) : '',
      week_id: '',
      questions: [],
    });
    setCourseWeeks([]);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingAssessmentId(null);
    setCreateError('');
    resetCreateForm();
    setNewQuestion({ question_text: '', question_type: 'multiple_choice', options: [], correct: null, explanation: '', points: 1 });
    setModalStep('basic');
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingAssessmentId(null);
    setCreateError('');
    setCreateLoading(false);
    setModalStep('basic');
  };

  const handleEditRow = async (row) => {
    setCreateError('');
    setCreateLoading(false);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication missing.', 'error');
        return;
      }
      
      const isFormative = row.category === 'formative';
      const endpoint = isFormative
        ? `${API_BASE_URL}/api/formative-assessments/${row.id}`
        : `${API_BASE_URL}/api/summative-assessments/${row.id}`;
        
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || body?.error?.message || 'Failed to fetch assessment details.');
      }
      
      const details = body?.data || body;
      
      const mappedQuestions = (details.questions || []).map((q) => {
        let parsedOptions = [];
        if (q.options) {
          try {
            parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          } catch (e) {
            parsedOptions = [];
          }
        }
        
        let correctVal = q.correct_answer;
        if (q.question_type === 'multiple_choice' && typeof q.correct_answer === 'string') {
          try {
            correctVal = JSON.parse(q.correct_answer);
          } catch (e) {
            correctVal = [];
          }
        }
        
        return {
          question_text: q.question_text || '',
          question_type: q.question_type || 'multiple_choice',
          options: parsedOptions,
          correct_answer: q.correct_answer,
          correct: correctVal,
          explanation: q.explanation || '',
          points: Number(q.points) || 1,
          order_index: q.order_index
        };
      });
      
      setCreateForm({
        assessmentKind: isFormative ? 'formative' : 'summative',
        assessmentType: details.assessment_type || details.assessmentType || (isFormative ? 'quiz' : 'final_exam'),
        title: details.title || '',
        description: details.description || '',
        duration_minutes: String(details.duration_minutes ?? '60'),
        total_points: String(details.total_points ?? '100'),
        passing_score: String(details.passing_score ?? '60'),
        attempt_limit: String(details.attempt_limit ?? '1'),
        min_course_progress: String(details.min_course_progress ?? '100'),
        prerequisite_pass_formative: Boolean(details.prerequisite_pass_formative),
        show_correct_answers: Boolean(details.show_correct_answers),
        show_score_immediately: Boolean(details.show_score_immediately),
        randomize_questions: Boolean(details.randomize_questions),
        is_published: Boolean(details.is_published),
        course_id: String(details.course_id || ''),
        week_id: String(details.week_id || ''),
        questions: mappedQuestions,
      });
      
      setIsEditMode(true);
      setEditingAssessmentId(row.id);
      setModalStep('basic');
      setIsModalOpen(true);
    } catch (error) {
      showToast(error.message || 'Failed to load assessment details.', 'error');
    }
  };

  const handleDeleteRow = (id, category) => {
    setConfirmModal({
      show: true,
      title: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? This action cannot be undone.',
      onConfirm: () => proceedDeleteRow(id, category)
    });
  };

  const proceedDeleteRow = async (id, category) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication missing.', 'error');
        return;
      }
      
      const isFormative = category === 'formative';
      const endpoint = isFormative
        ? `${API_BASE_URL}/api/formative-assessments/${id}`
        : `${API_BASE_URL}/api/summative-assessments/${id}`;
        
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || body?.error?.message || 'Failed to delete assessment.');
      }
      
      setAssessmentRows((prev) => prev.filter((row) => row.id !== id));
      setSelectedRowIds((prev) => {
        const next = new Set(prev);
        next.delete(String(id));
        return next;
      });
      showToast('Assessment deleted successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete assessment.', 'error');
    }
  };

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedRowIds);
    if (idsToDelete.length === 0) return;
    
    setConfirmModal({
      show: true,
      title: 'Delete Selected Assessments',
      message: `Are you sure you want to delete the ${idsToDelete.length} selected assessment(s)? This action cannot be undone.`,
      onConfirm: () => proceedBulkDelete(idsToDelete)
    });
  };

  const proceedBulkDelete = async (idsToDelete) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication missing.', 'error');
        return;
      }
      
      const rowsMap = new Map(normalizedRows.map(r => [String(r.id), r.category]));
      
      const deletePromises = idsToDelete.map(async (id) => {
        const category = rowsMap.get(String(id)) || 'summative';
        const isFormative = category === 'formative';
        const endpoint = isFormative
          ? `${API_BASE_URL}/api/formative-assessments/${id}`
          : `${API_BASE_URL}/api/summative-assessments/${id}`;
          
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body?.message || `Failed to delete assessment ID ${id}`);
        }
      });
      
      await Promise.all(deletePromises);
      
      setAssessmentRows((prev) => prev.filter((row) => !selectedRowIds.has(String(row.id))));
      setSelectedRowIds(new Set());
      showToast('Selected assessments deleted successfully.', 'success');
    } catch (error) {
      showToast(error.message || 'An error occurred during bulk deletion.', 'error');
    }
  };

  const addQuestionToBuffer = () => {
    if (!(newQuestion.question_text || '').trim()) {
      setCreateError('Question text cannot be empty.');
      return;
    }

    let options = newQuestion.options || [];
    let correctAnswer = newQuestion.correct;

    if (newQuestion.question_type === 'true_false') {
      options = [{ text: 'True' }, { text: 'False' }];
      correctAnswer = String(newQuestion.correct);
    } else if (newQuestion.question_type === 'multiple_choice') {
      correctAnswer = Array.isArray(newQuestion.correct)
        ? JSON.stringify(newQuestion.correct)
        : (newQuestion.correct == null ? null : String(newQuestion.correct));
    } else {
      correctAnswer = newQuestion.correct == null ? null : String(newQuestion.correct);
    }

    const q = {
      question_text: (newQuestion.question_text || '').trim(),
      question_type: newQuestion.question_type,
      options: options,
      correct_answer: correctAnswer,
      explanation: newQuestion.explanation || '',
      points: Number(newQuestion.points) || 1,
      order_index: (createForm.questions || []).length,
    };

    setCreateForm((prev) => ({ ...prev, questions: [...(prev.questions || []), q] }));
    setNewQuestion({ question_text: '', question_type: 'multiple_choice', options: [], correct: null, explanation: '', points: 1 });
    setCreateError('');
    showToast('Question added to prepared list!', 'success');
  };

  const removeQuestionFromBuffer = (index) => {
    setCreateForm((prev) => ({ ...prev, questions: (prev.questions || []).filter((_, i) => i !== index) }));
    showToast('Question removed from list.', 'info');
  };

  const updateNewQuestionField = (field, value) => {
    setNewQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const addOptionToNewQuestion = () => {
    setNewQuestion((prev) => ({ ...prev, options: [...(prev.options || []), { text: '' }] }));
  };

  const updateNewQuestionOption = (optIndex, value) => {
    setNewQuestion((prev) => ({ ...prev, options: prev.options.map((o, i) => i === optIndex ? { ...o, text: value } : o) }));
  };

  const toggleNewQuestionOptionCorrect = (optIndex) => {
    setNewQuestion((prev) => {
      if (prev.question_type === 'multiple_choice') {
        const current = Array.isArray(prev.correct) ? [...prev.correct] : [];
        const exists = current.includes(optIndex);
        const next = exists ? current.filter((i) => i !== optIndex) : [...current, optIndex];
        return { ...prev, correct: next };
      }
      return prev;
    });
  };

  const handleCreateAssessment = async () => {
    const title = createForm.title.trim();
    const description = createForm.description.trim();
    const courseId = String(createForm.course_id || '').trim();
    const weekId = String(createForm.week_id || '').trim();

    if (!title) {
      setCreateError('Give the assessment a title.');
      setModalStep('basic');
      return;
    }

    if (!courseId) {
      setCreateError('Select a course first.');
      setModalStep('lesson');
      return;
    }

    if (createForm.assessmentKind === 'formative' && !weekId) {
      setCreateError('Select the week for this formative assessment.');
      setModalStep('lesson');
      return;
    }

    if (createForm.assessmentKind === 'summative' && courseHasSummative(courseId, editingAssessmentId)) {
      setCreateError('This course already has a summative assessment. Only one summative assessment is allowed per course.');
      setModalStep('lesson');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setCreateError('Authentication missing.');
      return;
    }

    const isFormative = createForm.assessmentKind === 'formative';
    const payload = {
      title,
      description,
      assessment_type: createForm.assessmentType,
      duration_minutes: Number(createForm.duration_minutes) || 0,
      total_points: computedTotalPoints,
      passing_score: Number(createForm.passing_score) || 60,
      attempt_limit: Number(createForm.attempt_limit) || 1,
      show_correct_answers: Boolean(createForm.show_correct_answers),
      show_score_immediately: Boolean(createForm.show_score_immediately),
      randomize_questions: Boolean(createForm.randomize_questions),
      is_published: Boolean(createForm.is_published),
    };

    if (!isFormative) {
      payload.prerequisite_pass_formative = Boolean(createForm.prerequisite_pass_formative);
      payload.min_course_progress = Number(createForm.min_course_progress) || 100;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
      if (isEditMode) {
        const endpoint = isFormative
          ? `${API_BASE_URL}/api/formative-assessments/${editingAssessmentId}`
          : `${API_BASE_URL}/api/summative-assessments/${editingAssessmentId}`;

        const editPayload = {
          ...payload,
          questions: createForm.questions || []
        };

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editPayload),
        });

        const body = await response.json();
        if (!response.ok) throw new Error(body?.message || body?.error?.message || 'Failed to update assessment.');

        closeCreateModal();
        setRefreshTrigger((prev) => prev + 1);
        showToast('Assessment updated successfully!', 'success');
        return;
      }

      // POST create logic (original)
      const endpoint = isFormative
        ? `${API_BASE_URL}/api/courses/${courseId}/weeks/${weekId}/formative-assessments`
        : `${API_BASE_URL}/api/courses/${courseId}/summative-assessment`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || body?.error?.message || 'Failed to create assessment.');

      const createdAssessment = body?.data || null;
      const assessmentId = createdAssessment?.id || createdAssessment?._id || null;

      // Post Questions Sequentially
      if (assessmentId && Array.isArray(createForm.questions) && createForm.questions.length > 0) {
        const questionEndpointBase = isFormative 
          ? `${API_BASE_URL}/api/formative-assessments/${assessmentId}/questions` 
          : `${API_BASE_URL}/api/summative-assessments/${assessmentId}/questions`;
        
        for (let i = 0; i < createForm.questions.length; i += 1) {
          const q = createForm.questions[i];
          try {
            const qResp = await fetch(questionEndpointBase, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options || null,
                correct_answer: q.correct_answer || null,
                explanation: q.explanation || null,
                points: q.points || 1,
                order_index: q.order_index || i,
              }),
            });

            const qBody = await qResp.json();
            if (!qResp.ok) throw new Error(qBody?.message || qBody?.error?.message || `Failed to add question ${i + 1}`);
          } catch (err) {
            setCreateError(err.message || 'Failed to add questions. The assessment was created, but some questions failed.');
            setCreateLoading(false);
            return;
          }
        }
      }

      closeCreateModal();
      setRefreshTrigger((prev) => prev + 1);
      showToast('Assessment created successfully!', 'success');
    } catch (error) {
      setCreateError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} assessment.`);
      setCreateLoading(false);
    }
  };

  // --- Filtering & Pagination ---
  const normalizedRows = useMemo(
    () => assessmentRows.map((row, index) => normalizeAssessmentRow(row, index)),
    [assessmentRows]
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();
    return normalizedRows.filter((row) => {
      const matchesSearch = !normalizedSearch || row.searchText.includes(normalizedSearch);
      return matchesSearch;
    });
  }, [normalizedRows, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage);
  }, [currentPage, safeCurrentPage]);

  // --- Checkboxes ---
  const visibleSelectedCount = currentRows.filter((row) => selectedRowIds.has(String(row.id))).length;
  const isAllVisibleSelected = currentRows.length > 0 && visibleSelectedCount === currentRows.length;
  const isSomeVisibleSelected = visibleSelectedCount > 0 && visibleSelectedCount < currentRows.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      currentRows.forEach((row) => {
        const key = String(row.id);
        isChecked ? next.add(key) : next.delete(key);
      });
      return next;
    });
  };

  const handleSelectRow = (id) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      const key = String(id);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setTypeFilter('all');
    setPageSize(5);
    setCurrentPage(1);
    setSelectedRowIds(new Set());
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (safeCurrentPage === 1) return [1, 2, 3];
    if (safeCurrentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1];
  }, [safeCurrentPage, totalPages]);

  const typeFilterLabel = ASSESSMENT_TYPE_FILTERS.find((item) => item.value === typeFilter)?.label || 'All';
  const startIndex = filteredRows.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = filteredRows.length === 0 ? 0 : Math.min(safeCurrentPage * pageSize, filteredRows.length);
  const emptyStateMessage = fetchError
    ? fetchError
    : debouncedSearch || typeFilter !== 'all'
      ? 'No assessments match the current filters.'
      : 'Assessments will appear here once the backend returns instructor data.';

  const getStepIcon = (stepName) => {
    const currentIndex = stepOrder.indexOf(modalStep);
    const thisIndex = stepOrder.indexOf(stepName);
    return thisIndex <= currentIndex ? '/assets/icons/check-circle.svg' : '/assets/icons/no-check-circle.svg';
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) closeCreateModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <ProfessorLayout currentPage="assignments">
      {toast.show && (
        <div className={`prof-toast-container toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
      <section className="prof-page assessments-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Assessments</h1>
            <div className="learners-home-title-actions">
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

        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Assessments</h2>
            <p>{loading ? 'Loading from backend...' : `${filteredRows.length} assessment${filteredRows.length === 1 ? '' : 's'} loaded`}</p>
          </div>

          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input
                type="search"
                placeholder="Search assessments..."
                aria-label="Search Assessments"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="prof-filter-dropdown-wrapper" ref={filterRef}>
              <button
                type="button"
                className={`prof-btn-filter ${typeFilter !== 'all' ? 'filter-active' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>{typeFilterLabel}</span>
              </button>
              {isFilterOpen && (
                <div className="prof-filter-dropdown-menu">
                  {ASSESSMENT_TYPE_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={`prof-filter-option ${typeFilter === filter.value ? 'is-active' : ''}`}
                      onClick={() => {
                        setTypeFilter(filter.value);
                        setIsFilterOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="assessments-create-btn" onClick={openCreateModal}>
              <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
              <span>Create new test</span>
            </button>

            <button type="button" className="assessments-create-btn" onClick={handleResetFilters}>
              <span>Reset</span>
            </button>
          </div>
        </section>

        {selectedRowIds.size > 0 && (
          <div className="prof-bulk-actions-bar animate-fade-in">
            <span className="selected-count">{selectedRowIds.size} assessment(s) selected</span>
            <div className="bulk-actions-buttons">
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

        <div className="assessments-table-wrap">
          <div className="table-responsive">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select all assessments">
                      <input type="checkbox" ref={selectAllRef} checked={isAllVisibleSelected} onChange={handleSelectAll} />
                      <span></span>
                    </label>
                  </th>
                  <th>
                    <span>Assignment Details ({filteredRows.length})</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Assessment Category</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Course</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Status</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Students Attempts</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Avg. Score</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Duration (Min)</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Certificates</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Attempt Limit</span>
                    <img src="/assets/icons/sorter.svg" alt="Sort" />
                  </th>
                  <th>
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="prof-table-empty-cell">
                      <div className="prof-table-empty">
                        <span className="prof-table-empty-badge">Professor dashboard</span>
                        <h4>Loading assessments</h4>
                        <p>Fetching instructor assessments from the backend.</p>
                      </div>
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="prof-table-empty-cell">
                      <div className="prof-table-empty">
                        <span className="prof-table-empty-badge">Professor dashboard</span>
                        <h4>{fetchError ? 'Unable to load assessments' : 'No assessments found'}</h4>
                        <p>{emptyStateMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row, index) => (
                    <tr 
                      key={row.id}
                      onClick={() => handleEditRow(row)}
                      style={{ cursor: 'pointer' }}
                      className={selectedRowIds.has(String(row.id)) ? 'is-selected' : ''}
                    >
                      <td className="is-checkbox" onClick={(e) => e.stopPropagation()}>
                        <label className="prof-table-checkbox" aria-label={`Select assessment ${row.id}`}>
                          <input type="checkbox" checked={selectedRowIds.has(String(row.id))} onChange={() => handleSelectRow(row.id)} />
                          <span></span>
                        </label>
                      </td>
                      <td>
                        <div className="assessments-details">
                          <h4>{row.title}</h4>
                          <p>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recently'}</p>
                        </div>
                      </td>
                      <td>
                        <div className="assessments-type">
                          <span className={row.category === 'formative' ? 'formative-pill' : 'summative-pill'}>
                            {row.category}
                          </span>
                          <p>{row.assessmentType}</p>
                        </div>
                      </td>
                      <td>
                        <div className="assessments-type">
                          <span>{row.courseName}</span>
                          <p>{row.totalPoints ? `${row.totalPoints} points` : '---'}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${row.is_published ? 'pill-green' : 'pill-gray'}`}>
                          <span className="dot"></span> {row.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td onClick={(e) => {
                         if (row.studentsAttempts > 0) {
                           e.stopPropagation();
                           handleOpenSubmissions(row);
                         }
                       }}>
                         {row.studentsAttempts > 0 ? (
                           <span className="attempts-interactive-link" title="Click to view submissions">
                             {row.studentsAttempts}
                           </span>
                         ) : (
                           row.studentsAttempts
                         )}
                       </td>
                       <td>{row.avgScore}</td>
                       <td>{row.durationMinutes || '---'}</td>
                       <td>{row.certificatesEarned}</td>
                       <td>{row.attemptLimit}</td>
                       <td className="action-col" onClick={(e) => e.stopPropagation()}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <div className="prof-row-action-menu" style={{ position: 'relative' }}>
                             <button
                               type="button"
                               className="prof-action-btn-circle"
                               onClick={() => setOpenRowMenuId(openRowMenuId === String(row.id) ? null : String(row.id))}
                               title="Actions"
                             >
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                             </button>

                             {openRowMenuId === String(row.id) && (
                               <div className="prof-row-dropdown-menu">
                                 <button
                                   type="button"
                                   onClick={() => {
                                     handleOpenSubmissions(row);
                                     setOpenRowMenuId(null);
                                   }}
                                 >
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                   Submissions
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     handleEditRow(row);
                                     setOpenRowMenuId(null);
                                   }}
                                 >
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                   Edit Builder
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     handleEditRow(row);
                                     setModalStep('questions');
                                     setOpenRowMenuId(null);
                                   }}
                                 >
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                   Questions
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     handleDeleteRow(row.id, row.category);
                                     setOpenRowMenuId(null);
                                   }}
                                   style={{ color: '#EF4444' }}
                                 >
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                   Delete Test
                                 </button>
                               </div>
                             )}
                           </div>
                         </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="assessments-footer">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          setPageSize(option);
                          setCurrentPage(1);
                        }}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>{filteredRows.length === 0 ? '0-0 of 0' : `${startIndex}-${endIndex} of ${filteredRows.length}`}</span>
              <button type="button" className="assessments-page-nav" aria-label="Previous" onClick={() => goToPage(safeCurrentPage - 1)}>←</button>
              {visiblePageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`assessments-page-num ${safeCurrentPage === num ? 'is-active' : ''}`}
                  onClick={() => goToPage(num)}
                >
                  {num}
                </button>
              ))}
              <button type="button" className="assessments-page-nav" aria-label="Next" onClick={() => goToPage(safeCurrentPage + 1)}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ASSESSMENTS MODAL --- */}
      <div className={`assessments-modal ${isModalOpen ? 'is-open' : ''}`} aria-hidden={!isModalOpen}>
        <div className="assessments-modal__backdrop" onClick={closeCreateModal}></div>
        <div className="assessments-modal__dialog" role="dialog" aria-modal="true">
          <div className="assessments-modal__header">
            <h2>{isEditMode ? 'Edit assessment' : 'Create assessment'}</h2>
            <button type="button" className="assessments-modal__close" onClick={closeCreateModal} aria-label="Close modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
            </button>
          </div>

          <div className="assessments-modal__body">
            <div className="prof-prepare-steps assessments-modal-steps" aria-label="Steps">
              <button type="button" className={`prof-prepare-step ${modalStep === 'basic' ? 'is-active' : ''}`} onClick={() => handleStepClick('basic')}>
                <div className="step-circle-wrapper">
                  <span className="step-circle-num">1</span>
                </div>
                <span>Basics</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'lesson' ? 'is-active' : ''}`} onClick={() => handleStepClick('lesson')}>
                <div className="step-circle-wrapper">
                  <span className="step-circle-num">2</span>
                </div>
                <span>Course</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'questions' ? 'is-active' : ''}`} onClick={() => handleStepClick('questions')}>
                <div className="step-circle-wrapper">
                  <span className="step-circle-num">3</span>
                </div>
                <span>Questions</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'pricing' ? 'is-active' : ''}`} onClick={() => handleStepClick('pricing')}>
                <div className="step-circle-wrapper">
                  <span className="step-circle-num">4</span>
                </div>
                <span>Review</span>
              </button>
            </div>

            {createError ? (
              <div className="assessments-modal-error" role="alert">
                {createError}
              </div>
            ) : null}

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'basic' ? 'is-active' : ''}`}>
              <div className="prof-segmented-control-wrapper">
                <span className="segmented-label">Assessment Category</span>
                <div className="prof-segmented-control">
                  <button 
                    type="button" 
                    className={`prof-segmented-btn ${createForm.assessmentKind === 'formative' ? 'is-active' : ''}`}
                    onClick={() => {
                      updateCreateField('assessmentKind', 'formative');
                      updateCreateField('assessmentType', 'quiz');
                      setCreateError('');
                    }}
                  >
                    Formative (Quiz)
                  </button>
                  <button 
                    type="button" 
                    className={`prof-segmented-btn ${createForm.assessmentKind === 'summative' ? 'is-active' : ''}`}
                    onClick={() => {
                      updateCreateField('assessmentKind', 'summative');
                      updateCreateField('assessmentType', 'final_exam');
                      if (createForm.course_id && courseHasSummative(createForm.course_id, editingAssessmentId)) {
                        setCreateError('This course already has a summative assessment. Only one summative assessment is allowed per course.');
                      } else {
                        setCreateError('');
                      }
                    }}
                  >
                    Summative (Exam)
                  </button>
                </div>
              </div>

              <div className="assessments-modal-grid">
                <label className="assessments-modal-field">
                  <span>Title</span>
                  <input type="text" value={createForm.title} onChange={(event) => updateCreateField('title', event.target.value)} placeholder="Final exam, weekly quiz, project check..." />
                </label>
                <label className="assessments-modal-field">
                  <span>Assessment type</span>
                  <div className="dropdown assessments-modal-dropdown">
                    <button 
                      className="assessments-modal-dropdown-btn dropdown-toggle" 
                      type="button" 
                      onClick={() => setOpenDropdownId(openDropdownId === 'type' ? null : 'type')}
                    >
                      <span>{assessmentTypeLabel}</span>
                      <img src="/assets/icons/drop.svg" alt="" />
                    </button>
                    <ul className={`dropdown-menu assessments-modal-dropdown-menu ${openDropdownId === 'type' ? 'show' : ''}`} style={{ display: openDropdownId === 'type' ? 'block' : 'none' }}>
                      {assessmentTypeOptions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              updateCreateField('assessmentType', option.value);
                              setOpenDropdownId(null);
                            }}
                          >
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              </div>

              <label className="assessments-modal-field">
                <span>Description</span>
                <textarea className="learners-settings-textarea assessments-modal-textarea" rows="4" value={createForm.description} onChange={(event) => updateCreateField('description', event.target.value)} placeholder="Describe what the instructor and learners should expect." />
              </label>

              <div className="assessments-modal-step-actions">
                <div></div>
                <button type="button" className="assessments-modal-next" onClick={() => handleStepClick('lesson')}>Next</button>
              </div>
            </div>

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'lesson' ? 'is-active' : ''}`}>
              <div className="assessments-modal-grid">
                <label className="assessments-modal-field">
                  <span>Course</span>
                  <div className="dropdown assessments-modal-dropdown">
                    <button 
                      className="assessments-modal-dropdown-btn dropdown-toggle" 
                      type="button" 
                      onClick={() => setOpenDropdownId(openDropdownId === 'course' ? null : 'course')}
                    >
                      <span>{courseLabel}</span>
                      <img src="/assets/icons/drop.svg" alt="" />
                    </button>
                    <ul className={`dropdown-menu assessments-modal-dropdown-menu ${openDropdownId === 'course' ? 'show' : ''}`} style={{ display: openDropdownId === 'course' ? 'block' : 'none' }}>
                      <li key="none">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            updateCreateField('course_id', '');
                            setOpenDropdownId(null);
                          }}
                        >
                          Select a course
                        </button>
                      </li>
                      {instructorCourses.map((course) => (
                        <li key={course.id}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              const targetCourseId = String(course.id);
                              if (createForm.assessmentKind === 'summative' && courseHasSummative(targetCourseId, editingAssessmentId)) {
                                setCreateError('This course already has a summative assessment. Only one summative assessment is allowed per course.');
                              } else {
                                setCreateError('');
                              }
                              updateCreateField('course_id', targetCourseId);
                              setOpenDropdownId(null);
                            }}
                          >
                            {course.title || course.name || `Course ${course.id}`}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>

                <label className="assessments-modal-field">
                  <span>Duration (minutes)</span>
                  <input type="number" min="1" value={createForm.duration_minutes} onChange={(event) => updateCreateField('duration_minutes', event.target.value)} />
                </label>

                {createForm.assessmentKind === 'formative' ? (
                  <label className="assessments-modal-field">
                    <span>Week</span>
                    <div className="dropdown assessments-modal-dropdown">
                      <button 
                        className="assessments-modal-dropdown-btn dropdown-toggle" 
                        type="button" 
                        onClick={() => setOpenDropdownId(openDropdownId === 'week' ? null : 'week')}
                      >
                        <span>{weekLabel}</span>
                        <img src="/assets/icons/drop.svg" alt="" />
                      </button>
                      <ul className={`dropdown-menu assessments-modal-dropdown-menu ${openDropdownId === 'week' ? 'show' : ''}`} style={{ display: openDropdownId === 'week' ? 'block' : 'none' }}>
                        <li key="none">
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              updateCreateField('week_id', '');
                              setOpenDropdownId(null);
                            }}
                          >
                            Select a week
                          </button>
                        </li>
                        {courseWeeks.map((week) => (
                          <li key={week.id}>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                updateCreateField('week_id', String(week.id));
                                setOpenDropdownId(null);
                              }}
                            >
                              {week.title || `Week ${week.week_number || week.id}`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ) : (
                  <label className="assessments-modal-field">
                    <span>Minimum course progress</span>
                    <input type="number" min="0" max="100" value={createForm.min_course_progress} onChange={(event) => updateCreateField('min_course_progress', event.target.value)} />
                  </label>
                )}

                <label className="assessments-modal-field">
                  <span>Passing percentage (%)</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={createForm.passing_score} 
                      onChange={(event) => updateCreateField('passing_score', event.target.value)} 
                      style={{ paddingRight: '24px' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', fontWeight: '500' }}>%</span>
                  </div>
                </label>

                <label className="assessments-modal-field">
                  <span>Attempts allowed</span>
                  <input type="number" min="1" value={createForm.attempt_limit} onChange={(event) => updateCreateField('attempt_limit', event.target.value)} />
                </label>

                <label className="assessments-modal-field">
                  <span>Total points (auto-calculated)</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${computedTotalPoints} pt`} 
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#64748B', fontWeight: '500' }} 
                  />
                </label>
              </div>

              <div className="assessments-modal-toggles">
                <label className="prof-toggle-switch-wrapper">
                  <span className="toggle-label-text">Publish immediately</span>
                  <div className="prof-toggle-switch">
                    <input type="checkbox" checked={createForm.is_published} onChange={(event) => updateCreateField('is_published', event.target.checked)} />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <label className="prof-toggle-switch-wrapper">
                  <span className="toggle-label-text">Show score immediately</span>
                  <div className="prof-toggle-switch">
                    <input type="checkbox" checked={createForm.show_score_immediately} onChange={(event) => updateCreateField('show_score_immediately', event.target.checked)} />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <label className="prof-toggle-switch-wrapper">
                  <span className="toggle-label-text">Show correct answers</span>
                  <div className="prof-toggle-switch">
                    <input type="checkbox" checked={createForm.show_correct_answers} onChange={(event) => updateCreateField('show_correct_answers', event.target.checked)} />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                <label className="prof-toggle-switch-wrapper">
                  <span className="toggle-label-text">Randomize questions</span>
                  <div className="prof-toggle-switch">
                    <input type="checkbox" checked={createForm.randomize_questions} onChange={(event) => updateCreateField('randomize_questions', event.target.checked)} />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
                {createForm.assessmentKind === 'summative' && (
                  <label className="prof-toggle-switch-wrapper">
                    <span className="toggle-label-text">Require passing formative tests</span>
                    <div className="prof-toggle-switch">
                      <input type="checkbox" checked={createForm.prerequisite_pass_formative} onChange={(event) => updateCreateField('prerequisite_pass_formative', event.target.checked)} />
                      <span className="toggle-slider"></span>
                    </div>
                  </label>
                )}
              </div>

              <div className="assessments-modal-step-actions">
                <button type="button" className="assessments-modal-back" onClick={() => handleStepClick('basic')}>Back</button>
                <button type="button" className="assessments-modal-next" onClick={() => handleStepClick('questions')}>Next</button>
              </div>
            </div>

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'questions' ? 'is-active' : ''}`}>
              <div className="assessments-question-builder">
                <h4>Prepared questions ({(createForm.questions || []).length})</h4>
                {(createForm.questions || []).length === 0 ? (
                  <p className="assessments-question-lead">No questions added yet. Use the form below to add questions.</p>
                ) : (
                  <ul className="questions-buffer-list">
                    {(createForm.questions || []).map((q, idx) => (
                      <li key={`q-${idx}`} className="questions-buffer-item">
                        <div className="questions-buffer-item-left">
                          <span className="q-index-badge">{idx + 1}</span>
                          <div className="q-details-wrap">
                            <strong>{q.question_text}</strong>
                            <div className="q-meta-badges">
                              <span className={`q-type-badge ${q.question_type}`}>{q.question_type.replace(/_/g, ' ')}</span>
                              <span className="q-points-badge">{q.points} pt</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="q-buffer-delete-btn" 
                          onClick={() => removeQuestionFromBuffer(idx)}
                          aria-label="Delete question"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <hr className="assessments-question-divider" />

                <div className="prof-add-question-card">
                  <h4>Add question</h4>
                  
                  <div className="prof-add-question-row">
                    <label className="assessments-modal-field">
                      <span>Type</span>
                      <div className="dropdown assessments-modal-dropdown">
                        <button 
                          className="assessments-modal-dropdown-btn dropdown-toggle" 
                          type="button" 
                          onClick={() => setOpenDropdownId(openDropdownId === 'qtype' ? null : 'qtype')}
                        >
                          <span>{questionTypeLabel}</span>
                          <img src="/assets/icons/drop.svg" alt="" />
                        </button>
                        <ul className={`dropdown-menu assessments-modal-dropdown-menu ${openDropdownId === 'qtype' ? 'show' : ''}`} style={{ display: openDropdownId === 'qtype' ? 'block' : 'none' }}>
                          {QUESTION_TYPE_OPTIONS.map((option) => (
                            <li key={option.value}>
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                  updateNewQuestionField('question_type', option.value);
                                  setOpenDropdownId(null);
                                }}
                              >
                                {option.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </label>

                    <label className="assessments-modal-field">
                      <span>Points</span>
                      <input type="number" min="0" value={newQuestion.points} onChange={(e) => updateNewQuestionField('points', e.target.value)} />
                    </label>
                  </div>

                  <label className="assessments-modal-field" style={{ marginTop: '14px' }}>
                    <span>Question text</span>
                    <textarea className="learners-settings-textarea assessments-modal-textarea" rows="3" value={newQuestion.question_text} onChange={(e) => updateNewQuestionField('question_text', e.target.value)} />
                  </label>

                  {newQuestion.question_type === 'multiple_choice' && (
                    <div className="assessments-modal-field" style={{ marginTop: '14px' }}>
                      <span>Options</span>
                      {(newQuestion.options || []).map((opt, i) => (
                        <div key={`opt-${i}`} className="mc-option-row">
                          <span className="mc-option-index">{String.fromCharCode(65 + i)}</span>
                          <input type="text" value={opt.text} onChange={(e) => updateNewQuestionOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                          <label className={`mc-option-correct ${Array.isArray(newQuestion.correct) && newQuestion.correct.includes(i) ? 'is-correct-selected' : ''}`}>
                            <input type="checkbox" checked={Array.isArray(newQuestion.correct) && newQuestion.correct.includes(i)} onChange={() => toggleNewQuestionOptionCorrect(i)} />
                            <span>Correct</span>
                          </label>
                          <button type="button" className="opt-remove" onClick={() => {
                            setNewQuestion((prev) => {
                              const nextOptions = (prev.options || []).filter((_, optionIndex) => optionIndex !== i);
                              const nextCorrect = Array.isArray(prev.correct)
                                ? prev.correct.filter((optionIndex) => optionIndex !== i).map((optionIndex) => (optionIndex > i ? optionIndex - 1 : optionIndex))
                                : prev.correct;
                              return { ...prev, options: nextOptions, correct: nextCorrect };
                            });
                          }}>Remove</button>
                        </div>
                      ))}
                      <div style={{ marginTop: '8px' }}>
                        <button type="button" className="assessments-modal-secondary" onClick={addOptionToNewQuestion}>Add option</button>
                      </div>
                    </div>
                  )}

                  {newQuestion.question_type === 'true_false' && (
                    <div className="assessments-modal-field" style={{ marginTop: '14px' }}>
                      <span>Correct answer</span>
                      <div className="prof-tf-radio-group">
                        <label className={`prof-tf-radio-label ${newQuestion.correct === 'true' ? 'is-selected' : ''}`}>
                          <input type="radio" name="tf-correct" checked={newQuestion.correct === 'true'} onChange={() => updateNewQuestionField('correct', 'true')} />
                          <span>True</span>
                        </label>
                        <label className={`prof-tf-radio-label ${newQuestion.correct === 'false' ? 'is-selected' : ''}`}>
                          <input type="radio" name="tf-correct" checked={newQuestion.correct === 'false'} onChange={() => updateNewQuestionField('correct', 'false')} />
                          <span>False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {newQuestion.question_type === 'short_answer' && (
                    <label className="assessments-modal-field" style={{ marginTop: '14px' }}>
                      <span>Correct answer keyword</span>
                      <input 
                        type="text" 
                        value={newQuestion.correct || ''} 
                        onChange={(e) => updateNewQuestionField('correct', e.target.value)} 
                        placeholder="Enter the correct keyword..." 
                      />
                    </label>
                  )}

                  <label className="assessments-modal-field" style={{ marginTop: '14px' }}>
                    <span>Explanation (optional)</span>
                    <textarea className="learners-settings-textarea assessments-modal-textarea" rows="2" value={newQuestion.explanation} onChange={(e) => updateNewQuestionField('explanation', e.target.value)} />
                  </label>

                  <div className="add-question-btn-row">
                    <button type="button" className="assessments-modal-secondary" onClick={addQuestionToBuffer}>Add question</button>
                  </div>
                </div>
              </div>

              <div className="assessments-modal-step-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="assessments-modal-back" onClick={() => handleStepClick('lesson')}>Back</button>
                <button type="button" className="assessments-modal-next" onClick={() => handleStepClick('pricing')}>Next</button>
              </div>
            </div>

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'pricing' ? 'is-active' : ''}`}>
              <div className="assessments-modal-summary">
                <div className="prof-summary-header">
                  <div className="prof-summary-title-wrap">
                    <span className="summary-badge-pill">{createForm.assessmentKind === 'formative' ? 'Formative quiz' : 'Summative exam'}</span>
                    <h3>{createForm.title || 'Untitled assessment'}</h3>
                    <p className="summary-desc">{createForm.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="prof-summary-details-grid">
                  <div className="summary-detail-item">
                    <span>Course Target</span>
                    <strong>{instructorCourses.find((course) => String(course.id) === String(createForm.course_id))?.title || 'None Selected'}</strong>
                  </div>
                  <div className="summary-detail-item">
                    <span>Assessment Type</span>
                    <strong>{createForm.assessmentType.replace(/_/g, ' ')}</strong>
                  </div>
                  <div className="summary-detail-item">
                    <span>Duration Limit</span>
                    <strong>{createForm.duration_minutes || '0'} min</strong>
                  </div>
                  <div className="summary-detail-item">
                    <span>Max Attempts</span>
                    <strong>{createForm.attempt_limit || '1'}</strong>
                  </div>
                  <div className="summary-detail-item">
                    <span>Total Points</span>
                    <strong>{computedTotalPoints} pt</strong>
                  </div>
                  <div className="summary-detail-item">
                    <span>Passing Threshold</span>
                    <strong>{createForm.passing_score || '0'}%</strong>
                  </div>
                </div>

                <div className="prof-summary-toggles-status">
                  <span className="toggles-header">Configuration Check</span>
                  <div className="summary-toggles-grid">
                    <div className={`summary-toggle-indicator ${createForm.is_published ? 'is-enabled' : ''}`}>
                      <span className="indicator-dot"></span> Publish Immediately
                    </div>
                    <div className={`summary-toggle-indicator ${createForm.show_score_immediately ? 'is-enabled' : ''}`}>
                      <span className="indicator-dot"></span> Show Score
                    </div>
                    <div className={`summary-toggle-indicator ${createForm.show_correct_answers ? 'is-enabled' : ''}`}>
                      <span className="indicator-dot"></span> Show Answers
                    </div>
                    <div className={`summary-toggle-indicator ${createForm.randomize_questions ? 'is-enabled' : ''}`}>
                      <span className="indicator-dot"></span> Shuffle Questions
                    </div>
                  </div>
                </div>
              </div>

              <div className="assessments-modal-step-actions">
                <button type="button" className="assessments-modal-back" onClick={() => handleStepClick('questions')}>Back</button>
                <button type="button" className="assessments-modal-next" disabled={createLoading} onClick={handleCreateAssessment} style={{ minWidth: '150px' }}>
                  {createLoading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save changes' : 'Create assessment')}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {confirmModal.show && (
        <div className="assessments-modal is-open" style={{ zIndex: 1300 }}>
          <div className="assessments-modal__backdrop" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}></div>
          <div className="assessments-modal__dialog" role="dialog" aria-modal="true" style={{ height: 'auto', width: 'min(440px, calc(100vw - 32px))', margin: 'auto' }}>
            <div className="assessments-modal__header">
              <h2>{confirmModal.title || 'Confirm Action'}</h2>
              <button type="button" className="assessments-modal__close" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} aria-label="Close modal">
                <img src="/assets/icons/popup-close.svg" alt="" />
              </button>
            </div>
            <div className="assessments-modal__body" style={{ padding: '24px 30px' }}>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#4B5675', lineHeight: '1.5' }}>
                {confirmModal.message}
              </p>
              <div className="assessments-modal-step-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="assessments-modal-back" 
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="assessments-modal-next" 
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, show: false }));
                  }}
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px', backgroundColor: '#EF4444' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMISSIONS LIST MODAL --- */}
      {isSubmissionsModalOpen && (
        <div className="assessments-modal is-open" style={{ zIndex: 1200 }}>
          <div className="assessments-modal__backdrop" onClick={() => setIsSubmissionsModalOpen(false)}></div>
          <div className="assessments-modal__dialog" role="dialog" aria-modal="true" style={{ width: 'min(780px, calc(100vw - 32px))', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="assessments-modal__header" style={{ flexShrink: 0 }}>
              <h2>Submissions: {submissionsAssessment?.title}</h2>
              <button type="button" className="assessments-modal__close" onClick={() => setIsSubmissionsModalOpen(false)} aria-label="Close modal">
                <img src="/assets/icons/popup-close.svg" alt="" />
              </button>
            </div>
            <div className="assessments-modal__body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px 30px' }}>
              {submissionsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5B0A86', fontWeight: '500' }}>
                  Loading student submissions...
                </div>
              ) : submissionsError ? (
                <div className="assessments-modal-error" role="alert">
                  {submissionsError}
                </div>
              ) : submissionsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No student submissions found for this assessment yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="assessments-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Attempt No.</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Submitted At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsList.map((sub) => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid #F1F1F4' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img 
                                src={sub.student?.avatar ? `${API_BASE_URL}${sub.student.avatar}` : '/assets/imgs/prof.jpg'} 
                                alt="" 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = '/assets/imgs/prof.jpg'; }}
                              />
                              <div>
                                <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#071437' }}>{sub.student?.name}</h5>
                                <p style={{ margin: 0, fontSize: '11px', color: '#7E8299' }}>{sub.student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '13px', color: '#4B5675' }}>{sub.attempt_number}</td>
                          <td style={{ padding: '12px 8px', fontSize: '13px', color: '#4B5675' }}>{sub.score} / {sub.total_points}</td>
                          <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: '600', color: sub.is_passed ? '#10B981' : '#EF4444' }}>
                            {sub.percentage}%
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span className={`status-pill ${
                              sub.status === 'graded' ? 'pill-green' : sub.status === 'submitted' ? 'pill-blue' : 'pill-gray'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', fontSize: '12px', color: '#7E8299' }}>
                            {new Date(sub.created_at || sub.start_time).toLocaleString()}
                          </td>
                           <td style={{ padding: '12px 8px' }}>
                             <div style={{ display: 'flex', gap: '8px' }}>
                               <button
                                 type="button"
                                 className="assessments-modal-next"
                                 style={{ height: '28px', fontSize: '12px', padding: '0 12px', margin: 0 }}
                                 onClick={() => handleOpenAttemptDetails(sub.id, submissionsAssessment.category)}
                                >
                                  View Answers
                               </button>
                               <button
                                 type="button"
                                 className="assessments-modal-back"
                                 style={{ height: '28px', fontSize: '12px', padding: '0 12px', margin: 0, color: '#EF4444', borderColor: '#EF4444', backgroundColor: 'transparent' }}
                                 onClick={() => handleDeleteAttempt(sub.id)}
                                >
                                  Delete
                               </button>
                             </div>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="assessments-modal__header" style={{ borderTop: '1px solid #E4E6EF', padding: '15px 30px', flexShrink: 0, justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="assessments-modal-back" 
                onClick={() => setIsSubmissionsModalOpen(false)}
                style={{ height: '36px', padding: '0 16px', fontSize: '13px', margin: 0 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT ATTEMPT DETAIL MODAL --- */}
      {isAttemptModalOpen && (
        <div className="assessments-modal is-open" style={{ zIndex: 1250 }}>
          <div className="assessments-modal__backdrop" onClick={() => setIsAttemptModalOpen(false)}></div>
          <div className="assessments-modal__dialog" role="dialog" aria-modal="true" style={{ width: 'min(820px, calc(100vw - 32px))', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="assessments-modal__header" style={{ flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0 }}>Attempt Details - Attempt #{attemptDetails?.attempt?.attempt_number}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#7E8299' }}>
                  Student: <strong>{attemptDetails?.user?.name}</strong> | Score: <strong>{attemptDetails?.attempt?.score}/{attemptDetails?.attempt?.total_points} ({attemptDetails?.attempt?.percentage}%)</strong>
                </p>
              </div>
              <button type="button" className="assessments-modal__close" onClick={() => setIsAttemptModalOpen(false)} aria-label="Close modal">
                <img src="/assets/icons/popup-close.svg" alt="" />
              </button>
            </div>
            <div className="assessments-modal__body" style={{ flexGrow: 1, overflowY: 'auto', padding: '24px 30px', backgroundColor: '#F9F9F9' }}>
              {attemptLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#5B0A86', fontWeight: '500' }}>
                  Loading attempt answers...
                </div>
              ) : attemptError ? (
                <div className="assessments-modal-error" role="alert">
                  {attemptError}
                </div>
              ) : !attemptDetails ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No details found for this attempt.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* KPI Bar */}
                  <div className="attempt-details-kpi-bar" style={{ display: 'flex', gap: '16px', backgroundColor: '#FFF', padding: '16px', borderRadius: '8px', border: '1px solid #E4E6EF' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#7E8299', textTransform: 'uppercase', fontWeight: '600' }}>Duration</span>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#071437', marginTop: '4px' }}>{attemptDetails.attempt.time_taken?.display || '---'}</strong>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #E4E6EF', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#7E8299', textTransform: 'uppercase', fontWeight: '600' }}>Result</span>
                      <strong style={{ display: 'block', fontSize: '15px', color: attemptDetails.attempt.is_passed ? '#10B981' : '#EF4444', marginTop: '4px' }}>
                        {attemptDetails.attempt.is_passed ? 'Passed' : 'Failed'}
                      </strong>
                    </div>
                    <div style={{ flex: 1, borderLeft: '1px solid #E4E6EF', textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#7E8299', textTransform: 'uppercase', fontWeight: '600' }}>Status</span>
                      <strong style={{ display: 'block', fontSize: '15px', color: '#071437', marginTop: '4px', textTransform: 'capitalize' }}>{attemptDetails.attempt.status}</strong>
                    </div>
                  </div>

                  {/* Questions Review */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#071437', margin: '10px 0 0 0' }}>Student Responses Breakdown</h3>
                    
                    {attemptDetails.questions.map((q, idx) => {
                      const isCorrect = q.is_correct;
                      const hasAnswered = q.student_answer !== null && q.student_answer !== undefined;
                      const isTextQ = q.question_type === 'short_answer' || q.question_type === 'essay';

                      return (
                        <div key={q.id} style={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E4E6EF', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <strong style={{ color: '#071437', fontSize: '14px' }}>Q{idx + 1}.</strong>
                              <span style={{ color: '#071437', fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>{stripHtml(q.question_text)}</span>
                            </div>
                            <span style={{ flexShrink: 0, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', backgroundColor: isCorrect ? '#E8F5E9' : '#FFEBEE', color: isCorrect ? '#2E7D32' : '#C62828' }}>
                              {q.points_earned} / {q.points} pts
                            </span>
                          </div>

                          {/* Render choices/options if MCQ or True/False */}
                          {!isTextQ && Array.isArray(q.options) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '26px' }}>
                              {q.options.map((opt, optIdx) => {
                                const optionLabel = typeof opt === 'object' ? (opt.label || opt.text || opt.value) : opt;
                                const cleanOptionLabel = String(optionLabel).trim().toLowerCase();
                                
                                // Determine if this is the student's selected option
                                let isSelected = false;
                                if (hasAnswered) {
                                  const studentAnswers = String(q.student_answer).split(',').map(s => s.trim().toLowerCase());
                                  isSelected = studentAnswers.includes(cleanOptionLabel);
                                }

                                // Determine if this option is the correct answer
                                let isCorrectOpt = false;
                                const correctCol = q.correct_answer;
                                if (typeof opt === 'object' && opt.is_correct) {
                                  isCorrectOpt = true;
                                } else if (correctCol) {
                                  const correctAnswersList = String(correctCol).split(',').map(s => s.trim().toLowerCase());
                                  isCorrectOpt = correctAnswersList.includes(cleanOptionLabel);
                                }

                                let optBg = '#F9F9F9';
                                let optBorder = '1px solid #E4E6EF';
                                let optColor = '#4B5675';

                                if (isSelected) {
                                  optBg = isCorrectOpt ? '#E8F5E9' : '#FFEBEE';
                                  optBorder = isCorrectOpt ? '1px solid #A5D6A7' : '1px solid #EF9A9A';
                                  optColor = isCorrectOpt ? '#1B5E20' : '#B71C1C';
                                } else if (isCorrectOpt) {
                                  optBg = '#E8F5E9';
                                  optBorder = '1px solid #A5D6A7';
                                  optColor = '#1B5E20';
                                }

                                return (
                                  <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', backgroundColor: optBg, border: optBorder, color: optColor, fontSize: '13px' }}>
                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>}
                                    </div>
                                    <span style={{ fontWeight: isSelected || isCorrectOpt ? '600' : 'normal' }}>{stripHtml(optionLabel)}</span>
                                    {isCorrectOpt && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>(Correct)</span>}
                                    {isSelected && !isCorrectOpt && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>(Selected)</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Render written answers for short answer / essay */}
                          {isTextQ && (
                            <div style={{ marginLeft: '26px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: '#F5F8FA', border: '1px solid #E4E6EF' }}>
                                <span style={{ display: 'block', fontSize: '11px', color: '#7E8299', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Student Answer</span>
                                <p style={{ margin: 0, fontSize: '13px', color: '#071437', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                  {q.student_answer || <em>No answer submitted</em>}
                                </p>
                              </div>
                              {q.correct_answer && (
                                <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7', color: '#1B5E20' }}>
                                  <span style={{ display: 'block', fontSize: '11px', color: '#2E7D32', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Expected Correct Answer</span>
                                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                    {q.correct_answer}
                                  </p>
                                </div>
                              )}
                              {q.question_type === 'essay' && (
                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#4B5675' }}>Award Grade:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={q.points}
                                    step="0.5"
                                    value={manualGrades[q.id] ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? '' : Math.min(q.points, Math.max(0, parseFloat(e.target.value) || 0));
                                      setManualGrades(prev => ({ ...prev, [q.id]: val }));
                                    }}
                                    style={{ width: '80px', height: '32px', padding: '0 8px', borderRadius: '4px', border: '1px solid #E4E6EF', fontSize: '13px' }}
                                    placeholder="Points"
                                  />
                                  <span style={{ fontSize: '12px', color: '#7E8299' }}>/ {q.points} pts</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Explanation */}
                          {q.explanation && (
                            <div style={{ marginLeft: '26px', padding: '10px 14px', borderRadius: '6px', backgroundColor: '#FFF9C4', border: '1px solid #FFF59D', color: '#F57F17', fontSize: '12px', lineHeight: '1.5' }}>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Textbox */}
                  <div style={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E4E6EF', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#071437', margin: 0 }}>Overall Attempt Feedback</h4>
                    <textarea
                      value={attemptFeedback}
                      onChange={(e) => setAttemptFeedback(e.target.value)}
                      placeholder="Provide overall feedback on this student's attempt..."
                      rows="3"
                      style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #E4E6EF', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>

                  {gradingError && (
                    <div className="assessments-modal-error" role="alert" style={{ margin: 0 }}>
                      {gradingError}
                    </div>
                  )}

                </div>
              )}
            </div>
            <div className="assessments-modal__header" style={{ borderTop: '1px solid #E4E6EF', padding: '15px 30px', flexShrink: 0, justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button" 
                className="assessments-modal-back" 
                onClick={() => setIsAttemptModalOpen(false)}
                style={{ height: '36px', padding: '0 16px', fontSize: '13px', margin: 0 }}
              >
                Back to Submissions
              </button>
              <button 
                type="button" 
                className="assessments-modal-next" 
                onClick={handleSubmitGrade}
                disabled={submittingGrade}
                style={{ height: '36px', padding: '0 16px', fontSize: '13px', margin: 0, minWidth: '120px' }}
              >
                {submittingGrade ? 'Saving...' : 'Submit Grades'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfessorLayout>
  );
};

export default Assignments;