import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import './management-student-qa.css';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveAssetUrl = (value) => {
  if (!value) return '/assets/imgs/default-profile.png';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
};

const managementTabs = [
  { id: 'management', label: 'Courses' },
  { id: 'management-syllabuses', label: 'Syllabuses' },
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

const IconPin = ({ size = 12, color = "#450468" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color, verticalAlign: 'middle' }}>
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
  </svg>
);

const IconTrash = ({ size = 14, color = "#EF4444" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const getStatusClass = (status) => {
  if (status === 'resolved') return 'is-resolved';
  if (status === 'answered') return 'is-answered';
  if (status === 'closed') return 'is-closed';
  return 'is-open';
};

const StatusPill = ({ status }) => (
  <span className={`prof-qa-status-pill ${getStatusClass(status)}`}>
    <span className="dot" />
    {status}
  </span>
);

const ManagementStudentQA = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const activeTab = 'management-student-qa';

  // --- Core State ---
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');
  const [questionsReloadKey, setQuestionsReloadKey] = useState(0);

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState('');
  const [threadReloadKey, setThreadReloadKey] = useState(0);

  // --- Reply State ---
  const [replyContent, setReplyContent] = useState('');
  const [replySaving, setReplySaving] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const replyTextareaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setReplyAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: '#reply-editor-toolbar'
    }
  }), []);

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
  }, [questionsReloadKey]);

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
  }, [selectedQuestionId, threadReloadKey]);

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

    let content = replyContent.trim();
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

    // Append attachments if any
    if (replyAttachments.length > 0) {
      content += '\n\n📎 Attachments:\n' + replyAttachments.map(f => `• ${f.name}`).join('\n');
    }

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
      setReplyAttachments([]);
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
    setQuestionsReloadKey((key) => key + 1);
  };

  const handleTogglePin = async (questionId, currentPinnedState) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPinned: !currentPinnedState })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || 'Failed to update pin status');

      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isPinned: !currentPinnedState } : q));
      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(prev => ({ ...prev, is_pinned: !currentPinnedState ? 1 : 0 }));
      }

      setReplyFeedback(currentPinnedState ? 'Question unpinned.' : 'Question pinned.');
      setTimeout(() => setReplyFeedback(''), 3000);
    } catch (error) {
      setReplyFeedback(error.message);
    }
  };

  const handleUpdateStatus = async (questionId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || 'Failed to update question status');

      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: newStatus } : q));
      if (selectedQuestion && selectedQuestion.id === questionId) {
        setSelectedQuestion(prev => ({ ...prev, status: newStatus }));
      }

      setReplyFeedback(`Status updated to ${newStatus}.`);
      setTimeout(() => setReplyFeedback(''), 3000);
    } catch (error) {
      setReplyFeedback(error.message);
    }
  };

  const handleToggleOfficialAnswer = async (answerId, currentOfficialState) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/answers/${answerId}/official`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isOfficial: !currentOfficialState })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || 'Failed to update official status');

      if (selectedQuestion) {
        setSelectedQuestion(prev => ({
          ...prev,
          answers: prev.answers.map(ans => ans.id === answerId ? { ...ans, is_official: !currentOfficialState ? 1 : 0 } : ans)
        }));
      }

      setReplyFeedback(!currentOfficialState ? 'Answer marked as official.' : 'Answer unmarked as official.');
      setTimeout(() => setReplyFeedback(''), 3000);
    } catch (error) {
      setReplyFeedback(error.message);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteQuestionAction = async (questionId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.message || 'Failed to delete question');

      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setSelectedQuestionId(null);
      setSelectedQuestion(null);
      setShowDeleteConfirm(false);

      setReplyFeedback('Question deleted successfully.');
      setTimeout(() => setReplyFeedback(''), 3000);
    } catch (error) {
      setReplyFeedback(error.message);
    }
  };

  const replyComposer = (
    <section className="prof-qa-reply-box">
      <div className="prof-qa-reply-toolbar">
        <div id="reply-editor-toolbar" className="prof-qa-editor-toolbar ql-toolbar ql-snow">
          <span className="ql-formats">
            <button type="button" className="ql-bold" aria-label="Bold"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z" /></svg></button>
            <button type="button" className="ql-italic" aria-label="Italic"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13" /><path d="M8 3h4" /><path d="M4 13h4" /></svg></button>
            <button type="button" className="ql-underline" aria-label="Underline"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3" /><path d="M4 13h8" /></svg></button>
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-list" value="bullet" aria-label="Bulleted list"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="5" r="1.3" /><line x1="7" y1="5" x2="13" y2="5" /><circle cx="4" cy="11" r="1.3" /><line x1="7" y1="11" x2="13" y2="11" /></svg></button>
            <button type="button" className="ql-list" value="ordered" aria-label="Numbered list"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7" fontSize="5" fill="currentColor">1.</text><line x1="7" y1="6" x2="13" y2="6" /><text x="2" y="13" fontSize="5" fill="currentColor">2.</text><line x1="7" y1="12" x2="13" y2="12" /></svg></button>
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-align" value="" aria-label="Align left"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="10" y2="8" /><line x1="3" y1="12" x2="13" y2="12" /></svg></button>
            <button type="button" className="ql-align" value="center" aria-label="Align center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="4" y1="4" x2="12" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="4" y1="12" x2="12" y2="12" /></svg></button>
          </span>
        </div>

        <button type="button" className="prof-qa-attach-btn" onClick={() => fileInputRef.current?.click()}>
          <img src="/assets/icons/attach-file.png" alt="" />
          <span>Attach file</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="prof-qa-hidden-input"
          multiple
          onChange={handleFileChange}
        />
      </div>

      <div className="prof-qa-quill-wrap">
        <ReactQuill
          ref={replyTextareaRef}
          theme="snow"
          modules={quillModules}
          placeholder="Write your reply to the student here..."
          value={replyContent}
          onChange={setReplyContent}
        />
      </div>

      {replyAttachments.length > 0 && (
        <div className="prof-qa-reply-attachments">
          {replyAttachments.map((file, idx) => (
            <div key={idx} className="prof-qa-attachment-chip">
              <span>{file.name}</span>
              <button type="button" onClick={() => removeAttachment(idx)} aria-label={`Remove ${file.name}`}>
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {replyFeedback && (
        <p className={`prof-qa-reply-feedback ${replyFeedback.toLowerCase().includes('success') ? 'is-success' : 'is-error'}`}>
          {replyFeedback}
        </p>
      )}

      <div className="prof-qa-send-row">
        <button type="button" className="prof-qa-send-btn" onClick={handleReplySubmit} disabled={replySaving}>
          {replySaving ? 'Sending...' : 'Send reply'}
        </button>
      </div>
    </section>
  );

  const listEmptyDescription = questionsError || 'No student questions have been posted for your courses yet.';

  const threadEmpty = (
    <div className="prof-management-empty-state">
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
    <>
      <section className="prof-management-page prof-management-qa-page">

        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/professor/management-schedule" onClick={(e) => { e.preventDefault(); navigate('/professor/management-schedule'); }}>
                <img src="/assets/icons/plus1.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <span>Add Event</span>
              </a>
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); navigate('/professor/performance'); }}>
                <img src="/assets/icons/van.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </section>

        {/* Tabs */}
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

        {/* Hero Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Student Q&amp;A</h2>
            <p>Questions asked across your courses and chapters</p>
          </div>
        </section>

        <section className="prof-lesson-ranks-toolbar prof-qa-toolbar">
          <div className="prof-qa-stats">
            <img src="/assets/icons/user.svg" alt="" />
            <strong>{questions.length}</strong>
            <span>{questions.filter((question) => question.status === 'open').length} open</span>
          </div>

          <div className="prof-lesson-ranks-search-wrap">
            <div className="prof-lesson-ranks-filters">
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
            </div>

            <div className="prof-lesson-ranks-toolbar-end">
              <div className="prof-lesson-ranks-search">
                <img src="/assets/icons/magnifier.svg" alt="" />
                <input
                  type="search"
                  placeholder="Search questions..."
                  aria-label="Search questions"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <button type="button" className="assessments-create-btn" onClick={handleManualRefresh}>
                <img src={hoarefresh} alt="" aria-hidden="true" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </section>

        {/* Layout Split */}
        <section className="prof-qa-layout">

          {/* Left Panel: Question List */}
          <section className="prof-qa-list-panel">
            {questionsLoading ? (
              <ManagementLoading compact title="Loading questions" message="Fetching student Q&A across your courses." />
            ) : questionsError ? (
              <LearnerLoadError
                title="Could not load questions"
                message={questionsError}
                onRetry={questionsError === 'Authentication missing.' ? undefined : () => setQuestionsReloadKey((key) => key + 1)}
              />
            ) : currentQuestions.length === 0 ? (
              <div className="prof-management-empty-state">
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
              <>
                <div className="prof-qa-list-head">
                  <h3>Questions</h3>
                  <span>{filteredQuestions.length} shown</span>
                </div>
                <div className="prof-qa-list">
                {currentQuestions.map((item) => {
                  const isSelected = selectedQuestionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`prof-qa-row ${isSelected ? 'is-selected' : ''} ${item.isPinned ? 'is-pinned' : ''}`}
                      onClick={() => setSelectedQuestionId(item.id)}
                    >
                      <div className="prof-qa-row-avatar">
                        <img src={resolveAssetUrl(item.studentAvatar)} alt="" />
                      </div>

                      <div className="prof-qa-row-main">
                        <div className="prof-qa-row-top">
                          <strong>{item.studentName}</strong>
                          <time>{formatRelativeTime(item.createdAt)}</time>
                          {item.isPinned && (
                            <span className="prof-qa-pin-badge" title="Pinned">
                              <IconPin size={11} color="#450468" />
                            </span>
                          )}
                        </div>

                        <h4 className="prof-qa-row-title">{item.title}</h4>
                        <p className="prof-qa-row-preview">{truncateText(stripHtml(item.content), 110)}</p>

                        <div className="prof-qa-row-meta">
                          <span className="prof-qa-row-tag">
                            {(item.weekTitle || `Week ${item.weekNumber || '-'}`)} : {item.chapterTitle || 'No chapter'}
                          </span>
                          <span className="prof-qa-row-course">{item.courseTitle}</span>
                          <span className="prof-qa-row-replies">
                            {item.answersCount} {item.answersCount === 1 ? 'reply' : 'replies'}
                          </span>
                        </div>
                      </div>

                      <div className="prof-qa-row-status">
                        <StatusPill status={item.status} />
                      </div>
                    </button>
                  );
                })}
                </div>
              </>
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
              <ManagementLoading compact title="Loading thread" message="Fetching replies and moderation details." />
            ) : threadError ? (
              <LearnerLoadError
                title="Could not load thread"
                message={threadError}
                onRetry={() => setThreadReloadKey((key) => key + 1)}
              />
            ) : threadQuestion ? (
              <>
                <div className="prof-qa-thread-toolbar">
                  <span className="prof-qa-thread-toolbar-label">Moderate</span>

                  <button
                    type="button"
                    className={`prof-qa-action-btn ${threadQuestion.isPinned ? 'is-active' : ''}`}
                    onClick={() => handleTogglePin(threadQuestion.id, threadQuestion.isPinned)}
                  >
                    <IconPin size={11} color={threadQuestion.isPinned ? '#450468' : '#64748B'} />
                    {threadQuestion.isPinned ? 'Pinned' : 'Pin'}
                  </button>

                  <div className="prof-qa-status-dropdown">
                    <button
                      type="button"
                      className="prof-qa-status-toggle"
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    >
                      <span className={`prof-qa-status-dot ${getStatusClass(threadQuestion.status)}`} />
                      <span>{threadQuestion.status}</span>
                      <img src="/assets/icons/down1.svg" alt="" />
                    </button>
                    {statusDropdownOpen && (
                      <div className="prof-qa-status-menu">
                        {['open', 'answered', 'resolved', 'closed'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            className="prof-qa-status-option"
                            onClick={() => {
                              handleUpdateStatus(threadQuestion.id, status);
                              setStatusDropdownOpen(false);
                            }}
                          >
                            <span className={`prof-qa-status-dot ${getStatusClass(status)}`} />
                            <span>{status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="prof-qa-action-btn is-danger"
                    onClick={() => handleDeleteQuestion(threadQuestion.id)}
                  >
                    <IconTrash size={11} color="#DC2626" />
                    Delete
                  </button>
                </div>

                <div className="prof-qa-thread-scrollable-area">
                  <article className="prof-qa-thread-post">
                    <div className="prof-qa-thread-user-row">
                      <img src={resolveAssetUrl(threadQuestion.studentAvatar)} alt="" />
                      <div>
                        <strong>{threadQuestion.studentName || 'Student'}</strong>
                        <span>Asked {formatRelativeTime(threadQuestion.created_at || threadQuestion.createdAt)}</span>
                      </div>
                    </div>

                    <h2>{threadQuestion.title}</h2>

                    <div className="prof-qa-thread-tags">
                      <span className="prof-qa-thread-tag">
                        {threadQuestion.weekTitle || `Week ${threadQuestion.weekNumber || '-'}`} : {threadQuestion.chapterTitle || 'No chapter'}
                      </span>
                      <span className="prof-qa-thread-course">{threadQuestion.courseTitle}</span>
                    </div>

                    <div
                      className="prof-qa-thread-body"
                      dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(threadQuestion.content) }}
                    />

                    <div className="prof-qa-thread-stats">
                      <span>{threadQuestion.answers?.length || threadQuestion.answersCount || 0} replies</span>
                      <StatusPill status={threadQuestion.status} />
                    </div>
                  </article>

                  <h3 className="prof-qa-replies-head">Replies</h3>

                  {threadLoading && threadAnswers.length > 0 && (
                    <div className="prof-qa-thread-updating">Updating thread...</div>
                  )}

                  {threadAnswers.length === 0 ? (
                    <div className="prof-management-empty-state">
                      <div className="prof-management-empty-state-card">
                        <h3>No replies yet</h3>
                        <p>Be the first to respond to this question.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prof-qa-replies-list">
                      {threadAnswers.map((answer) => (
                        <article key={answer.id} className={`prof-qa-reply ${answer.is_official ? 'is-official' : ''}`}>
                          <div className="prof-qa-reply-avatar-col">
                            <img src={resolveAssetUrl(answer.author_avatar)} alt="" />
                          </div>
                          <div className="prof-qa-reply-body">
                            <div className="prof-qa-reply-head">
                              <div>
                                <strong>
                                  {answer.author_name && answer.author_name.trim() !== ''
                                    ? answer.author_name
                                    : (answer.author_role === 'student' ? 'Student' : 'Instructor')}
                                </strong>
                                <time>Replied {formatRelativeTime(answer.created_at)}</time>
                              </div>
                              <div className="prof-qa-reply-actions">
                                {answer.is_official ? (
                                  <span className="prof-qa-official-badge">Official</span>
                                ) : null}
                                <button
                                  type="button"
                                  className={`prof-qa-official-btn ${answer.is_official ? 'is-active' : ''}`}
                                  onClick={() => handleToggleOfficialAnswer(answer.id, answer.is_official)}
                                >
                                  {answer.is_official ? 'Remove official' : 'Mark official'}
                                </button>
                              </div>
                            </div>
                            <div
                              className="prof-qa-reply-content"
                              dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(answer.content) }}
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <div className="prof-qa-thread-footer">
                  {replyComposer}
                </div>
              </>
            ) : (
              threadEmpty
            )}
          </section>

        </section>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="assessments-modal is-open" style={{ zIndex: 1300 }}>
          <div className="assessments-modal__backdrop" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="assessments-modal__dialog" role="dialog" aria-modal="true" style={{ height: 'auto', width: 'min(440px, calc(100vw - 32px))', margin: 'auto' }}>
            <div className="assessments-modal__header">
              <h2>Delete question</h2>
              <button type="button" className="assessments-modal__close" onClick={() => setShowDeleteConfirm(false)} aria-label="Close modal">
                <img src="/assets/icons/popup-close.svg" alt="" />
              </button>
            </div>
            <div className="assessments-modal__body" style={{ padding: '24px 30px' }}>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#4B5675', lineHeight: '1.5' }}>
                Are you sure you want to delete this question? This will permanently delete the thread and all replies. This action cannot be undone.
              </p>
              <div className="assessments-modal-step-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="assessments-modal-back"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="assessments-modal-next"
                  onClick={() => {
                    if (threadQuestion) {
                      handleDeleteQuestionAction(threadQuestion.id);
                    }
                  }}
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px', backgroundColor: '#EF4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagementStudentQA;