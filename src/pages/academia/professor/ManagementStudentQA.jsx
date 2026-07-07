import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import { ChevronDown, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import './management-student-qa.css';

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

const IconChatBubble = ({ size = 12, color = "#64748B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color, verticalAlign: 'middle' }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

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
    fetchQuestions(selectedQuestionId);
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
    <section className="prof-qa-reply-box" style={{ display: 'flex', flexDirection: 'column', minHeight: '260px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', flexShrink: 0 }}>
      <div id="reply-editor-toolbar" className="prof-qa-editor-toolbar ql-toolbar ql-snow" style={{ border: 'none', borderBottom: '1px solid #E2E8F0', padding: '8px 12px' }}>
        <button type="button" className="ql-bold" aria-label="Bold"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z" /></svg></button>
        <button type="button" className="ql-italic" aria-label="Italic"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13" /><path d="M8 3h4" /><path d="M4 13h4" /></svg></button>
        <button type="button" className="ql-underline" aria-label="Underline"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3" /><path d="M4 13h8" /></svg></button>
        <button type="button" className="ql-list" value="bullet" aria-label="Bulleted List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="5" r="1.3" /><line x1="7" y1="5" x2="13" y2="5" /><circle cx="4" cy="11" r="1.3" /><line x1="7" y1="11" x2="13" y2="11" /></svg></button>
        <button type="button" className="ql-list" value="ordered" aria-label="Numbered List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7" fontSize="5" fill="currentColor">1.</text><line x1="7" y1="6" x2="13" y2="6" /><text x="2" y="13" fontSize="5" fill="currentColor">2.</text><line x1="7" y1="12" x2="13" y2="12" /></svg></button>
        <button type="button" className="ql-align" value="" aria-label="Align Left"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="10" y2="8" /><line x1="3" y1="12" x2="13" y2="12" /></svg></button>
        <button type="button" className="ql-align" value="center" aria-label="Align Center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="4" y1="4" x2="12" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="4" y1="12" x2="12" y2="12" /></svg></button>

        <button type="button" className="prof-qa-attach-btn" onClick={() => fileInputRef.current?.click()} style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
          <img src="/assets/icons/attach-file.png" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
          <span style={{ fontSize: '11px', color: '#78829D', fontWeight: '500' }}>Add an attachment</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          onChange={handleFileChange}
        />
      </div>

      <ReactQuill
        ref={replyTextareaRef}
        theme="snow"
        modules={quillModules}
        placeholder="Write your reply to the student here..."
        value={replyContent}
        onChange={setReplyContent}
        style={{ background: '#FFFFFF', minHeight: '140px', flex: '1 0 auto' }}
      />

      {replyAttachments.length > 0 && (
        <div className="prof-qa-reply-attachments" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', marginBottom: '10px' }}>
          {replyAttachments.map((file, idx) => (
            <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', gap: '6px' }}>
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#4B5675', fontWeight: '500' }}>{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', fontWeight: 'bold', fontSize: '14px', padding: '0 2px' }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {replyFeedback && (
        <p style={{ margin: '0.35rem 0 0', color: replyFeedback.includes('success') ? 'var(--success, #00C853)' : 'var(--danger, #D32F2F)', fontSize: '0.92rem' }}>
          {replyFeedback}
        </p>
      )}

      <button
        type="button"
        className="prof-qa-send-btn"
        onClick={handleReplySubmit}
        disabled={replySaving}
        style={{
          background: '#450468',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-end',
          margin: '12px',
          flexShrink: 0
        }}
      >
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
                <img src="/assets/icons/plus1.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <span>Add Event</span>
              </a>
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); navigate('/academia/professor/performance'); }}>
                <img src="/assets/icons/van.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="#" onClick={(e) => { preventDefault(e); navigate('/academia'); }}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
          <div className="assessments-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="assessments-search" style={{ background: '#FFFFFF', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', width: '240px' }}>
              <Search size={14} color="#64748B" />
              <input
                type="search"
                placeholder="Search questions..."
                aria-label="Search questions"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', width: '100%', color: '#071437' }}
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleManualRefresh}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                color: '#FFFFFF',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                height: '34px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = '#450468';
                e.currentTarget.style.borderColor = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
            >
              <RefreshCw size={12} />
              <span>Refresh Q&amp;A</span>
            </button>
          </div>
        </section>

        {/* Toolbar */}
        <section className="prof-qa-toolbar">
          <div className="prof-qa-summary">
            <img src="/assets/icons/user.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
                <img src="/assets/icons/ac-fi.svg" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
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
                      className={`prof-qa-item ${isSelected ? 'is-selected' : ''} ${item.isPinned ? 'is-pinned' : ''}`}
                      onClick={() => setSelectedQuestionId(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="prof-qa-item-marker" aria-hidden="true">
                        <img src={resolveAssetUrl(item.studentAvatar)} alt="" />
                      </div>

                      <div className="prof-qa-item-body">
                        <header className="prof-qa-item-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="prof-qa-user">
                            <strong>{item.studentName}</strong>
                            <span>{formatRelativeTime(item.createdAt)}</span>
                          </div>
                          {item.isPinned && (
                            <span className="prof-qa-pin-badge" title="Pinned by Instructor">
                              <IconPin size={12} color="#450468" />
                            </span>
                          )}
                        </header>

                        <h4 className="prof-qa-item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#071437', margin: '4px 0 6px 0' }}>
                          {item.title}
                        </h4>

                        <div className="prof-qa-item-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span className="prof-qa-item-tags-pill" style={{ fontSize: '10px', background: '#F3E8FF', color: '#450468', padding: '2px 8px', borderRadius: '4px' }}>
                            {(item.weekTitle || `Week ${item.weekNumber || '-'}`)} : {item.chapterTitle || 'No chapter'}
                          </span>
                          <span className="prof-qa-course-tag" style={{ fontSize: '10px', color: '#64748B', background: '#F8FAFC', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                            {item.courseTitle}
                          </span>
                        </div>

                        <p className="prof-qa-item-content" style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                          {truncateText(stripHtml(item.content))}
                        </p>

                        <footer className="prof-qa-item-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingBlock: '8px', borderTop: '1px dashed #EEF1F6' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <IconChatBubble size={12} color="#64748B" />
                            {item.answersCount} {item.answersCount === 1 ? 'reply' : 'replies'}
                          </span>
                          <span className={`status-pill pill-${item.status === 'resolved' ? 'green' : item.status === 'answered' ? 'purple' : item.status === 'closed' ? 'gray' : 'orange'}`} style={{ fontSize: '9px', padding: '2px 8px', textTransform: 'capitalize', fontWeight: 700 }}>
                            <span className="dot"></span>
                            {item.status}
                          </span>
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
          <section className="prof-qa-thread-panel" style={{ height: '780px', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 20px 10px 20px' }}>
            {threadLoading && !threadQuestion ? (
              <div className="prof-lesson-ranks-loading">Loading thread...</div>
            ) : threadError ? (
              <div className="prof-lesson-ranks-loading is-error">Error: {threadError}</div>
            ) : threadQuestion ? (
              <>
                {/* Moderation Controls toolbar */}
                <div className="prof-qa-thread-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Moderate Question:</span>

                  <button
                    type="button"
                    onClick={() => handleTogglePin(threadQuestion.id, threadQuestion.isPinned)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: '1px solid #DBDFE9', background: threadQuestion.isPinned ? '#F3E8FF' : '#FFFFFF', color: threadQuestion.isPinned ? '#450468' : '#64748B', cursor: 'pointer' }}
                  >
                    <IconPin size={11} color={threadQuestion.isPinned ? '#450468' : '#64748B'} />
                    {threadQuestion.isPinned ? 'Pinned' : 'Pin'}
                  </button>

                  {/* Custom Status Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid #DBDFE9', 
                        background: '#FFFFFF', 
                        color: '#4B5675', 
                        cursor: 'pointer',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A1A5B7'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#DBDFE9'}
                    >
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: threadQuestion.status === 'resolved' ? '#50CD89' : threadQuestion.status === 'answered' ? '#7239EA' : threadQuestion.status === 'closed' ? '#7E8299' : '#FFA800'
                      }} />
                      <span style={{ textTransform: 'capitalize' }}>{threadQuestion.status}</span>
                      <ChevronDown size={12} color="#78829D" style={{ marginLeft: '2px' }} />
                    </button>
                    {statusDropdownOpen && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        marginTop: '4px', 
                        background: '#FFFFFF', 
                        border: '1px solid #E2E8F0', 
                        borderRadius: '8px', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)', 
                        padding: '4px', 
                        zIndex: 1000, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2px', 
                        minWidth: '120px' 
                      }}>
                        {['open', 'answered', 'resolved', 'closed'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => {
                              handleUpdateStatus(threadQuestion.id, status);
                              setStatusDropdownOpen(false);
                            }}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              width: '100%', 
                              border: 'none', 
                              background: 'transparent', 
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              textAlign: 'left', 
                              cursor: 'pointer', 
                              fontSize: '11px', 
                              fontWeight: 600, 
                              color: '#4B5675', 
                              transition: 'background 0.2s, color 0.2s' 
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#F8FAFC';
                              e.currentTarget.style.color = '#071437';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#4B5675';
                            }}
                          >
                            <span style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: status === 'resolved' ? '#50CD89' : status === 'answered' ? '#7239EA' : status === 'closed' ? '#7E8299' : '#FFA800'
                            }} />
                            <span style={{ textTransform: 'capitalize' }}>{status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(threadQuestion.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: '1px solid #FCA5A5', background: '#FFF5F5', color: '#EF4444', marginLeft: 'auto', cursor: 'pointer' }}
                  >
                    <IconTrash size={11} color="#EF4444" />
                    Delete
                  </button>
                </div>

                {/* Scrollable replies listing & main card */}
                <div className="prof-qa-thread-scrollable-area" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px', marginBottom: '12px' }}>
                  <article className="prof-qa-item is-thread-main" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div className="prof-qa-item-marker" aria-hidden="true" style={{ alignSelf: 'center' }}>
                        <img src={resolveAssetUrl(threadQuestion.studentAvatar)} alt="" />
                      </div>
                      <div className="prof-qa-item-body">
                        <div className="prof-qa-user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <strong style={{ fontSize: '14px' }}>{threadQuestion.studentName || 'Student'}</strong>
                          <span style={{ fontSize: '11px', color: '#78829D' }}>Asked {formatRelativeTime(threadQuestion.created_at || threadQuestion.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderBottom: '1px solid #EEF1F6', paddingBottom: '10px' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#071437', margin: '4px 0 8px 0' }}>{threadQuestion.title}</h2>
                      <div className="prof-qa-item-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="prof-qa-item-tags-pill" style={{ fontSize: '10px', background: '#F3E8FF', color: '#450468', padding: '2px 8px', borderRadius: '4px' }}>
                          {threadQuestion.weekTitle || `Week ${threadQuestion.weekNumber || '-'}`} : {threadQuestion.chapterTitle || 'No chapter'}
                        </span>
                        <span className="prof-qa-course-tag" style={{ fontSize: '10px', color: '#64748B', background: '#F8FAFC', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                          {threadQuestion.courseTitle}
                        </span>
                      </div>
                    </div>

                    <div
                      className="prof-qa-item-content"
                      style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '4px 0 10px 0' }}
                      dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(threadQuestion.content) }}
                    />

                    <footer className="prof-qa-thread-meta-bar" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', marginTop: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        <IconChatBubble size={14} color="#64748B" />
                        <span>{threadQuestion.answers?.length || threadQuestion.answersCount || 0} replies</span>
                      </div>

                      <div style={{ width: '1px', height: '14px', background: '#E2E8F0' }} aria-hidden="true" />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        <span style={{ color: '#64748B' }}>Status:</span>
                        <span className={`status-pill pill-${threadQuestion.status === 'resolved' ? 'green' : threadQuestion.status === 'answered' ? 'purple' : threadQuestion.status === 'closed' ? 'gray' : 'orange'}`} style={{ fontSize: '10px', padding: '2px 10px', textTransform: 'capitalize', fontWeight: 700 }}>
                          <span className="dot"></span>
                          {threadQuestion.status}
                        </span>
                      </div>
                    </footer>
                  </article>

                  <div className="prof-qa-thread-replies" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {threadLoading && threadAnswers.length > 0 && (
                      <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>Updating thread...</div>
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
                        <article key={answer.id} className={`prof-qa-item is-reply ${answer.is_official ? 'is-official' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <div className="prof-qa-item-marker" aria-hidden="true" style={{ alignSelf: 'center' }}>
                                <img src={resolveAssetUrl(answer.author_avatar)} alt="" />
                              </div>
                              <div className="prof-qa-item-body">
                                <div className="prof-qa-user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                  <strong style={{ fontSize: '13px', color: '#1E293B' }}>
                                    {answer.author_name && answer.author_name.trim() !== ''
                                      ? answer.author_name
                                      : (answer.author_role === 'student' ? 'Student' : 'Instructor')}
                                  </strong>
                                  <span style={{ fontSize: '11px', color: '#78829D' }}>Replied {formatRelativeTime(answer.created_at)}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {answer.is_official ? (
                                <span style={{ fontSize: '10px', color: '#10B981', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  ✓ Verified Official Response
                                </span>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleToggleOfficialAnswer(answer.id, answer.is_official)}
                                style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', border: '1px solid #DBDFE9', background: answer.is_official ? '#FFF1F2' : '#FFFFFF', color: answer.is_official ? '#F43F5E' : '#64748B', cursor: 'pointer' }}
                              >
                                {answer.is_official ? 'Remove Official Flag' : 'Mark Official'}
                              </button>
                            </div>
                          </div>

                          <div
                            className="prof-qa-item-content"
                            style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.6', margin: '4px 0 0 0' }}
                            dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(answer.content) }}
                          />
                        </article>
                      ))
                    )}
                  </div>
                </div>

                {replyComposer}
              </>
            ) : (
              threadEmpty
            )}
          </section>

        </section>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', maxWidth: '360px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ 
                background: '#FEE2E2', 
                borderRadius: '50%', 
                width: '36px', 
                height: '36px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={20} color="#EF4444" />
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#071437', margin: 0 }}>Delete Question</h4>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
              Are you sure you want to delete this question? This will permanently delete the thread and all replies. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ border: '1px solid #DBDFE9', background: '#FFFFFF', color: '#4B5675', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (threadQuestion) {
                    handleDeleteQuestionAction(threadQuestion.id);
                  }
                }}
                style={{ border: 'none', background: '#EF4444', color: '#FFFFFF', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfessorLayout>
  );
};

export default ManagementStudentQA;