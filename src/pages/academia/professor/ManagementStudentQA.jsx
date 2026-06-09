import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-student-qa.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const managementTabs = [
  { id: 'management', label: 'Students' },
  { id: 'management-schedule', label: 'Schedule' },
  { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
  { id: 'management-student-qa', label: 'Student Q&A' },
];

const qaFilters = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'answered', label: 'Answered' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
};

const truncateText = (text, maxLength = 180) => {
  const value = String(text || '').trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
};

const normalizeQuestion = (question, course) => ({
  id: question.id,
  title: question.title || 'Untitled question',
  content: question.content || '',
  status: question.status || 'open',
  isPinned: Boolean(question.is_pinned),
  viewsCount: Number(question.views_count || 0),
  answersCount: Number(question.answers_count || 0),
  studentName: question.student_name || 'Student',
  studentEmail: question.student_email || '',
  studentAvatar: question.student_avatar || '/assets/imgs/default-profile.png',
  weekTitle: question.week_title || '',
  weekNumber: question.week_number || '',
  chapterTitle: question.chapter_title || '',
  courseTitle: question.course_title || course?.title || 'Course',
  courseId: question.course_id || course?.id || null,
  createdAt: question.created_at || question.createdAt || null,
  updatedAt: question.updated_at || question.updatedAt || null,
});

const ManagementStudentQA = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const activeTab = 'management-student-qa';

  // --- Core State ---
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');
  
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  
  // --- Reply State ---
  const [replyContent, setReplyContent] = useState('');
  const [replySaving, setReplySaving] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState('');

  // --- Filter & Pagination State ---
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Refs for AbortControllers
  const threadAbortController = useRef(null);

  // 1. Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Questions (Master List)
  const fetchQuestions = async (preferredQuestionId = null, signal = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setQuestionsError('Authentication missing.');
      setQuestionsLoading(false);
      return;
    }

    setQuestionsLoading(true);
    setQuestionsError('');

    try {
      const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });

      const dashboardBody = await dashboardResponse.json();
      if (!dashboardResponse.ok) throw new Error(dashboardBody?.message || 'Failed to load instructor courses');

      const instructorCourses = Array.isArray(dashboardBody?.data?.courses) ? dashboardBody.data.courses : [];

      if (instructorCourses.length === 0) {
        if (signal?.aborted) return;
        setQuestions([]);
        setSelectedQuestionId(null);
        setSelectedQuestion(null);
        return;
      }

      // Fetch questions for all courses (Ideally, replace with a single aggregated backend endpoint in the future)
      const settledQuestions = await Promise.allSettled(
        instructorCourses.map(async (course) => {
          const response = await fetch(`${API_BASE_URL}/api/qa/courses/${course.id}/questions?limit=100&sort=latest`, {
            headers: { Authorization: `Bearer ${token}` },
            signal
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body?.message || `Failed to load questions for ${course.title || 'course'}`);
          const courseQuestions = Array.isArray(body?.data?.questions) ? body.data.questions : [];
          return courseQuestions.map((question) => normalizeQuestion(question, course));
        })
      );

      if (signal?.aborted) return;

      const mergedQuestions = settledQuestions.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
      const sortedQuestions = mergedQuestions.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setQuestions(sortedQuestions);

      // Persist selection or select first
      setSelectedQuestionId((current) => {
        if (preferredQuestionId && sortedQuestions.some((q) => q.id === preferredQuestionId)) return preferredQuestionId;
        if (current && sortedQuestions.some((q) => q.id === current)) return current;
        return sortedQuestions.length > 0 ? sortedQuestions[0].id : null;
      });

    } catch (error) {
      if (error.name === 'AbortError') return;
      setQuestionsError(error?.message || 'Failed to load student questions');
      setQuestions([]);
      setSelectedQuestionId(null);
      setSelectedQuestion(null);
    } finally {
      if (!signal?.aborted) setQuestionsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const controller = new AbortController();
    fetchQuestions(null, controller.signal);
    return () => controller.abort();
  }, []);

  // 3. Fetch Active Thread (with Race Condition Guard)
  useEffect(() => {
    if (!selectedQuestionId) {
      setSelectedQuestion(null);
      return;
    }

    const loadThread = async () => {
      // Abort previous thread fetch if clicking rapidly
      if (threadAbortController.current) threadAbortController.current.abort();
      const controller = new AbortController();
      threadAbortController.current = controller;

      const token = localStorage.getItem('token');
      setThreadLoading(true);
      setThreadError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/qa/questions/${selectedQuestionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal
        });

        const body = await response.json();
        if (!response.ok) throw new Error(body?.message || 'Failed to load question thread');
        
        if (!controller.signal.aborted) {
          setSelectedQuestion(body?.data || null);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setThreadError(error?.message || 'Failed to load question thread');
          setSelectedQuestion(null);
        }
      } finally {
        if (!controller.signal.aborted) setThreadLoading(false);
      }
    };

    loadThread();
    return () => {
      if (threadAbortController.current) threadAbortController.current.abort();
    };
  }, [selectedQuestionId]);

  // --- Client Side Filtering ---
  const filteredQuestions = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return questions.filter((question) => {
      const matchesFilter = activeFilter === 'All' || question.status === activeFilter.toLowerCase();
      const haystack = [
        question.title,
        question.content,
        question.studentName,
        question.courseTitle,
        question.chapterTitle,
        question.weekTitle,
      ].join(' ').toLowerCase();

      return matchesFilter && (!query || haystack.includes(query));
    });
  }, [questions, activeFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  useEffect(() => {
    if (safeCurrentPage !== currentPage) setCurrentPage(safeCurrentPage);
  }, [currentPage, safeCurrentPage]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

  // Fallback to preview data while full thread loads
  const selectedQuestionPreview = useMemo(() => questions.find((q) => q.id === selectedQuestionId) || null, [questions, selectedQuestionId]);
  const threadQuestion = selectedQuestion || selectedQuestionPreview;
  const threadAnswers = Array.isArray(selectedQuestion?.answers) ? selectedQuestion.answers : [];

  // Handle auto-selection adjustment when filters change
  useEffect(() => {
    if (selectedQuestionId && !filteredQuestions.some((q) => q.id === selectedQuestionId)) {
      setSelectedQuestionId(filteredQuestions[0]?.id || null);
    }
  }, [filteredQuestions, selectedQuestionId]);

  // --- Handlers ---
  const handleReplySubmit = async (event) => {
    event.preventDefault();
    if (!selectedQuestionId) return;

    const content = replyContent.trim();
    if (!content) {
      setReplyFeedback('Reply content is required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setReplyFeedback('Please sign in before sending a reply.');
      return;
    }

    setReplySaving(true);
    setReplyFeedback('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions/${selectedQuestionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || 'Failed to send reply');

      setReplyContent('');
      setReplyFeedback('Reply sent successfully.');
      
      // Refresh data silently without showing loading spinners
      fetchQuestions(selectedQuestionId);
      
      // Force refresh current thread
      const threadRes = await fetch(`${API_BASE_URL}/api/qa/questions/${selectedQuestionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const threadBody = await threadRes.json();
      if (threadRes.ok) setSelectedQuestion(threadBody?.data || null);

      setTimeout(() => setReplyFeedback(''), 3000); // Clear success message after 3s
    } catch (error) {
      setReplyFeedback(error?.message || 'Failed to send reply');
    } finally {
      setReplySaving(false);
    }
  };

  const handleManualRefresh = (e) => {
    e.preventDefault();
    fetchQuestions(selectedQuestionId);
  };

  const replyComposer = (
    <section className="prof-qa-reply-box">
      <div className="prof-qa-editor-toolbar">
        <button type="button" onClick={preventDefault} aria-label="Bold"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Italic"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13" /><path d="M8 3h4" /><path d="M4 13h4" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Underline"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3" /><path d="M4 13h8" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Bulleted List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="5" r="1.3" /><line x1="7" y1="5" x2="13" y2="5" /><circle cx="4" cy="11" r="1.3" /><line x1="7" y1="11" x2="13" y2="11" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Numbered List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7" fontSize="5" fill="currentColor">1.</text><line x1="7" y1="6" x2="13" y2="6" /><text x="2" y="13" fontSize="5" fill="currentColor">2.</text><line x1="7" y1="12" x2="13" y2="12" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Align Left"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="10" y2="8" /><line x1="3" y1="12" x2="13" y2="12" /></svg></button>
        <button type="button" onClick={preventDefault} aria-label="Align Center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="4" y1="4" x2="12" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="4" y1="12" x2="12" y2="12" /></svg></button>
        
        <button type="button" className="prof-qa-attach-btn" onClick={preventDefault}>
          <img src="/assets/icons/attach-file.png" alt="" />
          <span>Add an attachment</span>
        </button>
      </div>

      <textarea
        className="learners-settings-textarea"
        rows="6"
        placeholder="Write your reply to the student here..."
        value={replyContent}
        onChange={(event) => setReplyContent(event.target.value)}
      />

      {replyFeedback && (
        <p style={{ margin: '0.35rem 0 0', color: replyFeedback.includes('success') ? 'var(--success, #00C853)' : 'var(--danger, #D32F2F)', fontSize: '0.92rem' }}>
          {replyFeedback}
        </p>
      )}

      <button type="button" className="prof-qa-send-btn" onClick={handleReplySubmit} disabled={replySaving}>
        {replySaving ? 'Sending...' : 'Send Message'}
      </button>
    </section>
  );

  const listEmptyDescription = questionsError || 'No student questions have been posted for your courses yet.';

  const threadEmpty = (
    <div className="prof-management-empty-state" style={{ minHeight: 260 }}>
      <div className="prof-management-empty-state-card">
        <h3>Select a question</h3>
        <p>Open a student question from the list to view the thread and reply from here.</p>
        <div className="prof-management-empty-state-actions">
          <button type="button" className="learners-btn learners-btn-primary" onClick={handleManualRefresh}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page prof-management-qa-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/plus1.svg" alt="" />
                <span>Add Event</span>
              </a>
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); navigate('/academia/professor/performance'); }}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="#" onClick={(e) => { preventDefault(e); navigate('/academia'); }}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        {/* Tabs */}
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

        {/* Hero Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Student Q&amp;A</h2>
            <p>Questions asked across your courses and chapters</p>
          </div>
          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input
                type="search"
                placeholder="Search questions..."
                aria-label="Search questions"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <button type="button" className="assessments-create-btn" onClick={handleManualRefresh}>
              <img src="/assets/icons/refresh.svg" alt="" aria-hidden="true" style={{ filter: 'invert(1)' }} />
              <span>Refresh Q&amp;A</span>
            </button>
          </div>
        </section>

        {/* Toolbar */}
        <section className="prof-qa-toolbar">
          <div className="prof-qa-summary">
            <img src="/assets/icons/user.svg" alt="" />
            <span>{questions.length}</span>
            <p>{questions.filter((question) => question.status === 'open').length} open</p>
          </div>

          <div className="prof-qa-search-wrap">
            <input
              type="search"
              placeholder="Search by student, course, chapter, or title..."
              aria-label="Search questions"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <div className="prof-qa-filters">
              {qaFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={activeFilter === filter.label ? 'is-active' : ''}
                  onClick={() => { setActiveFilter(filter.label); setCurrentPage(1); }}
                >
                  {filter.label}
                </button>
              ))}
              <button type="button" className="prof-qa-filter-btn" onClick={preventDefault}>
                <img src="/assets/icons/ac-fi.svg" alt="" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </section>

        {/* Layout Split */}
        <section className="prof-qa-layout">
          
          {/* Left Panel: Question List */}
          <section className="prof-qa-list-panel">
            {questionsLoading ? (
              <div className="prof-lesson-ranks-loading">Loading student questions...</div>
            ) : questionsError ? (
              <div className="prof-lesson-ranks-loading is-error">Error: {questionsError}</div>
            ) : currentQuestions.length === 0 ? (
              <div className="prof-management-empty-state" style={{ minHeight: 300 }}>
                <div className="prof-management-empty-state-card">
                  <h3>{debouncedSearch || activeFilter !== 'All' ? 'No matching questions' : 'No student questions yet'}</h3>
                  <p>{debouncedSearch || activeFilter !== 'All' ? 'Try adjusting your search or filters.' : listEmptyDescription}</p>
                  <div className="prof-management-empty-state-actions">
                    <button type="button" className="learners-btn learners-btn-primary" onClick={handleManualRefresh}>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prof-qa-list">
                {currentQuestions.map((item) => {
                  const isSelected = selectedQuestionId === item.id;
                  return (
                    <article
                      key={item.id}
                      className={`prof-qa-item ${isSelected ? 'is-thread-main' : ''}`}
                      onClick={() => setSelectedQuestionId(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="prof-qa-item-marker" aria-hidden="true">
                        <img src={item.studentAvatar || '/assets/imgs/default-profile.png'} alt="" />
                        <span className="prof-qa-item-marker-line"></span>
                      </div>

                      <div className="prof-qa-item-body">
                        <header className="prof-qa-item-head">
                          <div className="prof-qa-user">
                            <strong>{item.studentName}</strong>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </header>

                        <div className="prof-qa-item-tags">
                          <span className="prof-qa-item-tags-pill">
                            {(item.weekTitle || `Week ${item.weekNumber || '-'}`)} : {item.chapterTitle || 'No chapter'}
                            <img src="/assets/icons/right1.svg" alt="" />
                          </span>
                          <p>{item.courseTitle}</p>
                        </div>

                        <p className="prof-qa-item-content">
                          {truncateText(item.content)}
                        </p>

                        <footer className="prof-qa-item-foot">
                          <a href="#" onClick={preventDefault}>{item.answersCount} View Replies</a>
                          <span>{item.status}</span>
                        </footer>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="prof-qa-list-pagination">
                <button type="button" className="prof-lesson-ranks-pager-nav" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1}>
                  <img src="/assets/icons/left1.svg" alt="Previous" />
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                  // Basic sliding window for pagination
                  let start = Math.max(1, safeCurrentPage - 2);
                  if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                  const pageNumber = start + index;
                  
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      type="button"
                      key={pageNumber}
                      className={`prof-lesson-ranks-pager-num ${safeCurrentPage === pageNumber ? 'is-active' : ''}`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button type="button" className="prof-lesson-ranks-pager-nav" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage === totalPages}>
                  <img src="/assets/icons/right1.svg" alt="Next" />
                </button>
              </div>
            )}
          </section>

          {/* Right Panel: Thread & Reply */}
          <section className="prof-qa-thread-panel">
            {threadLoading && !threadQuestion ? (
              <div className="prof-lesson-ranks-loading">Loading thread...</div>
            ) : threadError ? (
              <div className="prof-lesson-ranks-loading is-error">Error: {threadError}</div>
            ) : threadQuestion ? (
              <>
                <article className="prof-qa-item is-thread-main">
                  <div className="prof-qa-item-marker" aria-hidden="true">
                    <img src={threadQuestion.studentAvatar || '/assets/imgs/default-profile.png'} alt="" />
                    <span className="prof-qa-item-marker-line"></span>
                  </div>

                  <div className="prof-qa-item-body">
                    <header className="prof-qa-item-head">
                      <div className="prof-qa-user">
                        <strong>{threadQuestion.studentName || 'Student'}</strong>
                        <span>{formatRelativeTime(threadQuestion.created_at || threadQuestion.createdAt)}</span>
                      </div>
                    </header>

                    <div className="prof-qa-item-tags">
                      <span className="prof-qa-item-tags-pill">
                        {threadQuestion.weekTitle || `Week ${threadQuestion.weekNumber || '-'}`} : {threadQuestion.chapterTitle || 'No chapter'}
                        <img src="/assets/icons/right1.svg" alt="" />
                      </span>
                      <p>{threadQuestion.courseTitle}</p>
                    </div>

                    <p className="prof-qa-item-content">
                      {threadQuestion.content}
                    </p>

                    <footer className="prof-qa-item-foot">
                      <a href="#" onClick={preventDefault}>{threadQuestion.answers?.length || threadQuestion.answersCount || 0} View Replies</a>
                      <span>{threadQuestion.status}</span>
                    </footer>
                  </div>
                </article>

                {replyComposer}

                <div className="prof-qa-thread-replies">
                  {threadLoading && threadAnswers.length > 0 && (
                    <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>Updating thread...</div>
                  )}
                  {threadAnswers.length === 0 ? (
                    <div className="prof-management-empty-state" style={{ margin: '8px 0 0', minHeight: 180 }}>
                      <div className="prof-management-empty-state-card">
                        <h3>No replies yet</h3>
                        <p>Be the first to respond to this question from the instructor panel.</p>
                      </div>
                    </div>
                  ) : (
                    threadAnswers.map((answer) => (
                      <article key={answer.id} className={`prof-qa-item is-reply ${answer.is_official ? 'is-official' : ''}`}>
                        <div className="prof-qa-item-marker" aria-hidden="true">
                          <img src={answer.author_avatar || '/assets/imgs/default-profile.png'} alt="" />
                          <span className="prof-qa-item-marker-line"></span>
                        </div>
                        <div className="prof-qa-item-body">
                          <header className="prof-qa-item-head">
                            <div className="prof-qa-user">
                              <strong>{answer.author_name || 'Instructor'}</strong>
                              <span>{formatRelativeTime(answer.created_at)}</span>
                            </div>
                          </header>
                          <p className="prof-qa-item-content">
                            {answer.content}
                          </p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </>
            ) : (
              threadEmpty
            )}
          </section>

        </section>
      </section>
    </ProfessorLayout>
  );
};

export default ManagementStudentQA;