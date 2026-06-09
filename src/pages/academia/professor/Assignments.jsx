import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './assignments.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  return {
    ...row,
    id: row?.id ?? row?._id ?? `assessment-${index}`,
    title: row?.title || row?.assignment_name || 'Assessment',
    category,
    assessmentType,
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
  
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseWeeks, setCourseWeeks] = useState([]);
  
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState('basic');
  
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
  }, [typeFilter]); // Reloads when type filter changes

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
        setCreateForm((previous) => ({
          ...previous,
          week_id: weeks.length > 0 ? String(weeks[0].id) : '',
        }));
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
    setCreateError('');
    resetCreateForm();
    setNewQuestion({ question_text: '', question_type: 'multiple_choice', options: [], correct: null, explanation: '', points: 1 });
    setModalStep('basic');
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setCreateError('');
    setCreateLoading(false);
    setModalStep('basic');
  };

  const addQuestionToBuffer = () => {
    const q = {
      question_text: (newQuestion.question_text || '').trim(),
      question_type: newQuestion.question_type,
      options: newQuestion.options || [],
      correct_answer: Array.isArray(newQuestion.correct) ? JSON.stringify(newQuestion.correct) : (newQuestion.correct == null ? null : String(newQuestion.correct)),
      explanation: newQuestion.explanation || '',
      points: Number(newQuestion.points) || 1,
      order_index: (createForm.questions || []).length,
    };

    if (!q.question_text) {
      setCreateError('Question text cannot be empty.');
      return;
    }

    setCreateForm((prev) => ({ ...prev, questions: [...(prev.questions || []), q] }));
    setNewQuestion({ question_text: '', question_type: 'multiple_choice', options: [], correct: null, explanation: '', points: 1 });
    setCreateError('');
  };

  const removeQuestionFromBuffer = (index) => {
    setCreateForm((prev) => ({ ...prev, questions: (prev.questions || []).filter((_, i) => i !== index) }));
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

    const token = localStorage.getItem('token');
    if (!token) {
      setCreateError('Authentication missing.');
      return;
    }

    const isFormative = createForm.assessmentKind === 'formative';
    const endpoint = isFormative
      ? `${API_BASE_URL}/api/courses/${courseId}/weeks/${weekId}/formative-assessments`
      : `${API_BASE_URL}/api/courses/${courseId}/summative-assessment`;

    const payload = {
      title,
      description,
      assessment_type: createForm.assessmentType,
      duration_minutes: Number(createForm.duration_minutes) || 0,
      total_points: Number(createForm.total_points) || 100,
      passing_score: Number(createForm.passing_score) || 60,
      attempt_limit: Number(createForm.attempt_limit) || 1,
      show_correct_answers: Boolean(createForm.show_correct_answers),
      show_score_immediately: Boolean(createForm.show_score_immediately),
      randomize_questions: Boolean(createForm.randomize_questions),
      is_published: Boolean(createForm.is_published),
    };

    if (!isFormative) {
      payload.prerequisite_pass_formative = false;
      payload.min_course_progress = Number(createForm.min_course_progress) || 100;
    }

    setCreateLoading(true);
    setCreateError('');

    try {
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
        const questionEndpointBase = isFormative ? `${API_BASE_URL}/api/formative-assessments/${assessmentId}/questions` : `${API_BASE_URL}/api/summative-assessments/${assessmentId}/questions`;
        
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
            return; // Break out early on question failure
          }
        }
      }

      // Success
      closeCreateModal();
      // To trigger a reload, we can just reset the filter to itself or rely on the user to refresh
      window.location.reload(); 
    } catch (error) {
      setCreateError(error.message || 'Failed to create assessment.');
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

            <div className="dropdown">
              <button type="button" className="dropdown-toggle assessments-create-btn" data-bs-toggle="dropdown" aria-expanded="false">
                <span>{typeFilterLabel}</span>
                <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
              </button>
              <ul className="dropdown-menu">
                {ASSESSMENT_TYPE_FILTERS.map((filter) => (
                  <li key={filter.value}>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setTypeFilter(filter.value);
                        setCurrentPage(1);
                      }}
                    >
                      {filter.label}
                    </button>
                  </li>
                ))}
              </ul>
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
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="prof-table-empty-cell">
                      <div className="prof-table-empty">
                        <span className="prof-table-empty-badge">Professor dashboard</span>
                        <h4>Loading assessments</h4>
                        <p>Fetching instructor assessments from the backend.</p>
                      </div>
                    </td>
                  </tr>
                ) : currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="prof-table-empty-cell">
                      <div className="prof-table-empty">
                        <span className="prof-table-empty-badge">Professor dashboard</span>
                        <h4>{fetchError ? 'Unable to load assessments' : 'No assessments found'}</h4>
                        <p>{emptyStateMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="is-checkbox">
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
                          <span>{row.category}</span>
                          <p>{row.assessmentType}</p>
                        </div>
                      </td>
                      <td>
                        <div className="assessments-type">
                          <span>{row.courseName}</span>
                          <p>{row.totalPoints ? `${row.totalPoints} points` : '---'}</p>
                        </div>
                      </td>
                      <td>{row.studentsAttempts}</td>
                      <td>{row.avgScore}</td>
                      <td>{row.durationMinutes || '---'}</td>
                      <td>{row.certificatesEarned}</td>
                      <td>{row.attemptLimit}</td>
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
            <h2>Create assessment</h2>
            <button type="button" className="assessments-modal__close" onClick={closeCreateModal} aria-label="Close modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
            </button>
          </div>

          <div className="assessments-modal__body">
            <div className="prof-prepare-steps assessments-modal-steps" aria-label="Steps">
              <button type="button" className={`prof-prepare-step ${modalStep === 'basic' ? 'is-active' : ''}`} onClick={() => setModalStep('basic')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('basic')} alt="" aria-hidden="true" />
                <span>Basics</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'lesson' ? 'is-active' : ''}`} onClick={() => setModalStep('lesson')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('lesson')} alt="" aria-hidden="true" />
                <span>Course</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'questions' ? 'is-active' : ''}`} onClick={() => setModalStep('questions')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('questions')} alt="" aria-hidden="true" />
                <span>Questions</span>
              </button>
              <button type="button" className={`prof-prepare-step ${modalStep === 'pricing' ? 'is-active' : ''}`} onClick={() => setModalStep('pricing')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('pricing')} alt="" aria-hidden="true" />
                <span>Review</span>
              </button>
            </div>

            {createError ? (
              <div className="assessments-modal-error" role="alert">
                {createError}
              </div>
            ) : null}

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'basic' ? 'is-active' : ''}`}>
              <div className="assessments-modal-modes">
                <label className={`assessments-modal-radio ${createForm.assessmentKind === 'formative' ? 'is-selected' : ''}`}>
                  <input type="radio" name="assessmentKind" checked={createForm.assessmentKind === 'formative'} onChange={() => {
                    updateCreateField('assessmentKind', 'formative');
                    updateCreateField('assessmentType', 'quiz');
                  }} />
                  <span className="assessments-modal-radio__ui"></span>
                  <span>Formative</span>
                </label>
                <label className={`assessments-modal-radio ${createForm.assessmentKind === 'summative' ? 'is-selected' : ''}`}>
                  <input type="radio" name="assessmentKind" checked={createForm.assessmentKind === 'summative'} onChange={() => {
                    updateCreateField('assessmentKind', 'summative');
                    updateCreateField('assessmentType', 'final_exam');
                  }} />
                  <span className="assessments-modal-radio__ui"></span>
                  <span>Summative</span>
                </label>
              </div>

              <div className="assessments-modal-grid">
                <label className="assessments-modal-field">
                  <span>Title</span>
                  <input type="text" value={createForm.title} onChange={(event) => updateCreateField('title', event.target.value)} placeholder="Final exam, weekly quiz, project check..." />
                </label>
                <label className="assessments-modal-field">
                  <span>Assessment type</span>
                  <div className="dropdown assessments-modal-dropdown">
                    <button type="button" className="dropdown-toggle assessments-modal-dropdown-btn" data-bs-toggle="dropdown" aria-expanded="false">
                      <span>{assessmentTypeLabel}</span>
                      <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </button>
                    <ul className="dropdown-menu assessments-modal-dropdown-menu">
                      {assessmentTypeOptions.map((option) => (
                        <li key={option.value}>
                          <button type="button" className="dropdown-item" onClick={() => updateCreateField('assessmentType', option.value)}>
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

              <div className="assessments-modal-step-actions assessments-modal-step-actions--lesson">
                <button type="button" className="assessments-modal-secondary" onClick={() => setModalStep('lesson')}>Next</button>
                <button type="button" className="assessments-modal-secondary is-disabled" disabled>Questions later</button>
                <button type="button" className="assessments-modal-next" onClick={() => setModalStep('pricing')}>Review</button>
              </div>
            </div>

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'lesson' ? 'is-active' : ''}`}>
              <div className="assessments-modal-grid">
                <label className="assessments-modal-field">
                  <span>Course</span>
                  <div className="dropdown assessments-modal-dropdown">
                    <button type="button" className="dropdown-toggle assessments-modal-dropdown-btn" data-bs-toggle="dropdown" aria-expanded="false">
                      <span>{courseLabel}</span>
                      <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </button>
                    <ul className="dropdown-menu assessments-modal-dropdown-menu">
                      <li>
                        <button type="button" className="dropdown-item" onClick={() => updateCreateField('course_id', '')}>
                          Select a course
                        </button>
                      </li>
                      {instructorCourses.map((course) => (
                        <li key={course.id}>
                          <button type="button" className="dropdown-item" onClick={() => updateCreateField('course_id', String(course.id))}>
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
                      <button type="button" className="dropdown-toggle assessments-modal-dropdown-btn" data-bs-toggle="dropdown" aria-expanded="false">
                        <span>{weekLabel}</span>
                        <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                      </button>
                      <ul className="dropdown-menu assessments-modal-dropdown-menu">
                        <li>
                          <button type="button" className="dropdown-item" onClick={() => updateCreateField('week_id', '')}>
                            Select a week
                          </button>
                        </li>
                        {courseWeeks.map((week) => (
                          <li key={week.id}>
                            <button type="button" className="dropdown-item" onClick={() => updateCreateField('week_id', String(week.id))}>
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
                  <span>Passing score</span>
                  <input type="number" min="0" max="100" value={createForm.passing_score} onChange={(event) => updateCreateField('passing_score', event.target.value)} />
                </label>

                <label className="assessments-modal-field">
                  <span>Attempts allowed</span>
                  <input type="number" min="1" value={createForm.attempt_limit} onChange={(event) => updateCreateField('attempt_limit', event.target.value)} />
                </label>

                <label className="assessments-modal-field">
                  <span>Total points</span>
                  <input type="number" min="1" value={createForm.total_points} onChange={(event) => updateCreateField('total_points', event.target.value)} />
                </label>
              </div>

              <div className="assessments-modal-toggles">
                <label className="assessments-modal-toggle">
                  <input type="checkbox" checked={createForm.is_published} onChange={(event) => updateCreateField('is_published', event.target.checked)} />
                  <span>Publish immediately</span>
                </label>
                <label className="assessments-modal-toggle">
                  <input type="checkbox" checked={createForm.show_score_immediately} onChange={(event) => updateCreateField('show_score_immediately', event.target.checked)} />
                  <span>Show score immediately</span>
                </label>
                <label className="assessments-modal-toggle">
                  <input type="checkbox" checked={createForm.show_correct_answers} onChange={(event) => updateCreateField('show_correct_answers', event.target.checked)} />
                  <span>Show correct answers</span>
                </label>
                <label className="assessments-modal-toggle">
                  <input type="checkbox" checked={createForm.randomize_questions} onChange={(event) => updateCreateField('randomize_questions', event.target.checked)} />
                  <span>Randomize questions</span>
                </label>
              </div>

              <div className="assessments-modal-step-actions assessments-modal-step-actions--lesson">
                <button type="button" className="assessments-modal-back" onClick={() => setModalStep('basic')}>Back</button>
                <button type="button" className="assessments-modal-secondary" onClick={() => setModalStep('questions')}>Questions</button>
                <button type="button" className="assessments-modal-next" onClick={() => setModalStep('questions')}>Next</button>
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
                        <div>
                          <strong>{q.question_text}</strong>
                          <div className="muted">{q.question_type} — {q.points}pt</div>
                        </div>
                        <div>
                          <button type="button" className="assessments-modal-secondary" onClick={() => removeQuestionFromBuffer(idx)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <hr className="assessments-question-divider" />

                <h4>Add question</h4>
                <label className="assessments-modal-field">
                  <span>Type</span>
                  <div className="dropdown assessments-modal-dropdown">
                    <button type="button" className="dropdown-toggle assessments-modal-dropdown-btn" data-bs-toggle="dropdown" aria-expanded="false">
                      <span>{questionTypeLabel}</span>
                      <img src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </button>
                    <ul className="dropdown-menu assessments-modal-dropdown-menu">
                      {QUESTION_TYPE_OPTIONS.map((option) => (
                        <li key={option.value}>
                          <button type="button" className="dropdown-item" onClick={() => updateNewQuestionField('question_type', option.value)}>
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>

                <label className="assessments-modal-field">
                  <span>Question text</span>
                  <textarea className="learners-settings-textarea assessments-modal-textarea" rows="4" value={newQuestion.question_text} onChange={(e) => updateNewQuestionField('question_text', e.target.value)} />
                </label>

                {newQuestion.question_type === 'multiple_choice' && (
                  <div className="assessments-modal-field">
                    <span>Options</span>
                    {(newQuestion.options || []).map((opt, i) => (
                      <div key={`opt-${i}`} className="mc-option-row">
                        <input type="text" value={opt.text} onChange={(e) => updateNewQuestionOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                        <label className="mc-option-correct">
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
                    <div>
                      <button type="button" className="assessments-modal-secondary" onClick={addOptionToNewQuestion}>Add option</button>
                    </div>
                  </div>
                )}

                {newQuestion.question_type === 'true_false' && (
                  <div className="assessments-modal-field">
                    <span>Correct answer</span>
                    <div>
                      <label><input type="radio" name="tf-correct" checked={newQuestion.correct === 'true'} onChange={() => updateNewQuestionField('correct', 'true')} /> True</label>
                      <label style={{ marginLeft: 12 }}><input type="radio" name="tf-correct" checked={newQuestion.correct === 'false'} onChange={() => updateNewQuestionField('correct', 'false')} /> False</label>
                    </div>
                  </div>
                )}

                <label className="assessments-modal-field">
                  <span>Points</span>
                  <input type="number" min="0" value={newQuestion.points} onChange={(e) => updateNewQuestionField('points', e.target.value)} />
                </label>

                <label className="assessments-modal-field">
                  <span>Explanation (optional)</span>
                  <textarea className="learners-settings-textarea assessments-modal-textarea" rows="3" value={newQuestion.explanation} onChange={(e) => updateNewQuestionField('explanation', e.target.value)} />
                </label>

                <div className="assessments-modal-step-actions">
                  <button type="button" className="assessments-modal-back" onClick={() => setModalStep('lesson')}>Back</button>
                  <button type="button" className="assessments-modal-secondary" onClick={addQuestionToBuffer}>Add question</button>
                  <button type="button" className="assessments-modal-next" onClick={() => setModalStep('pricing')}>Review</button>
                </div>
              </div>
            </div>

            <div className={`prof-step-pane assessments-modal-step-pane ${modalStep === 'pricing' ? 'is-active' : ''}`}>
              <div className="assessments-modal-summary">
                <h3>{createForm.title || 'Untitled assessment'}</h3>
                <p>{createForm.assessmentKind === 'formative' ? 'Formative assessment' : 'Summative assessment'}</p>
                <div className="assessments-modal-summary-grid">
                  <div><span>Course</span><strong>{instructorCourses.find((course) => String(course.id) === String(createForm.course_id))?.title || 'Select a course'}</strong></div>
                  <div><span>Type</span><strong>{createForm.assessmentType.replace(/_/g, ' ')}</strong></div>
                  <div><span>Duration</span><strong>{createForm.duration_minutes || '0'} min</strong></div>
                  <div><span>Attempts</span><strong>{createForm.attempt_limit || '1'}</strong></div>
                </div>
              </div>

              <div className="assessments-modal-step-actions assessments-modal-step-actions--pricing">
                <button type="button" className="assessments-modal-back" onClick={() => setModalStep('lesson')}>Back</button>
                <button type="button" className="assessments-modal-next assessments-modal-next--done" disabled={createLoading} onClick={handleCreateAssessment}>
                  {createLoading ? 'Creating...' : 'Create assessment'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default Assignments;