import React, { useState, useEffect } from 'react';

// Icons & Images
import wAcBook from '../../../../assets/icons/w-ac-book.svg';
import leTec from '../../../../assets/icons/le-tec.svg';
import right1 from '../../../../assets/icons/right1.svg';
import doneIcon from '../../../../assets/icons/done.svg';

const WorkspaceModal = ({
  isWorkspaceOpen,
  setIsWorkspaceOpen,
  activeContent,
  pdfUrl,
  pdfAttachments,
  activePdfIndex,
  setActivePdfIndex,
  textPages,
  activeTextPageIndex,
  setActiveTextPageIndex,
  formatHtmlContent,
  stripHtml,
  attachmentsList,
  API_BASE_URL,
  exerciseQuestionsState,
  currentExerciseIndex,
  setCurrentExerciseIndex,
  exerciseStates,
  exerciseAnswers,
  exerciseGradedList,
  handleExerciseOptionSelect,
  handleExerciseAction,
  isCurrentChapterCompleted,
  markChapterCompleteOnBackend,
  activeChapterId,
  courseId
}) => {
  if (!isWorkspaceOpen) return null;

  // Q&A State
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [qaTitle, setQaTitle] = useState('');
  const [qaContent, setQaContent] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [qaSuccess, setQaSuccess] = useState('');
  const [qaError, setQaError] = useState('');

  // Q&A List States
  const [myQuestions, setMyQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [studentReplies, setStudentReplies] = useState({});

  const fetchMyQuestions = async () => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/qa/my-questions?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const body = await res.json();
        const data = body?.data?.questions || body?.questions || [];
        // Filter by course and chapter
        const filtered = data.filter(q => 
          Number(q.course_id) === Number(courseId) && 
          (q.chapter_id === null || Number(q.chapter_id) === Number(activeChapterId))
        );
        setMyQuestions(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch my questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (isWorkspaceOpen && courseId) {
      fetchMyQuestions();
      setSelectedQuestion(null);
    }
  }, [isWorkspaceOpen, activeChapterId, courseId]);

  const handleQuestionClick = async (q) => {
    if (selectedQuestion?.id === q.id) {
      setSelectedQuestion(null);
      return;
    }
    
    setSelectedQuestion(q);
    setLoadingThread(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/qa/questions/${q.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const body = await res.json();
        setSelectedQuestion(body?.data || q);
      }
    } catch (err) {
      console.error("Failed to load question details:", err);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleStudentReplySubmit = async (e, questionId) => {
    e.preventDefault();
    const replyText = studentReplies[questionId]?.trim();
    if (!replyText) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: replyText })
      });

      if (response.ok) {
        setStudentReplies(prev => ({ ...prev, [questionId]: '' }));
        // Refresh question details/thread
        const detailRes = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailRes.ok) {
          const detailBody = await detailRes.json();
          setSelectedQuestion(detailBody?.data || null);
          fetchMyQuestions(); // Refresh count
        }
      }
    } catch (err) {
      console.error("Failed to submit student reply:", err);
    }
  };

  const handleAskQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setQaError('Course ID is missing. Cannot ask a question.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setQaError('You must be logged in to ask a question.');
      return;
    }

    setQaSubmitting(true);
    setQaError('');
    setQaSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/qa/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId,
          weekId: activeContent?.weekId || null,
          chapterId: activeChapterId || null,
          title: qaTitle.trim(),
          content: qaContent.trim()
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to submit question');
      }

      setQaSuccess('Your question was submitted successfully!');
      setQaTitle('');
      setQaContent('');
      fetchMyQuestions();
      
      // Auto close after 2s
      setTimeout(() => {
        setIsAskQuestionOpen(false);
        setQaSuccess('');
      }, 2000);

    } catch (err) {
      setQaError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setQaSubmitting(false);
    }
  };

  return (
    <div className="learners-workspace-modal-overlay" onClick={() => setIsWorkspaceOpen(false)}>
      <div className="learners-workspace-modal-container" onClick={(e) => e.stopPropagation()}>
        <header className="learners-workspace-modal-header">
          <div className="learners-workspace-modal-title-wrap">
            <span className="learners-workspace-modal-subtitle">{stripHtml(activeContent.weekLabel)}</span>
            <h2 className="learners-workspace-modal-title">{stripHtml(activeContent.chapterLabel)} Workspace</h2>
          </div>
          <button
            type="button"
            className="learners-workspace-modal-close"
            onClick={() => setIsWorkspaceOpen(false)}
            aria-label="Close workspace"
          >
            &times;
          </button>
        </header>

        <div className="learners-workspace-modal-body">
          <section className="learners-read-article-bottom-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>

            {/* PDF Pagination Bar */}
            {pdfUrl ? (
              pdfAttachments.length > 1 && (
                <div className="learners-pdf-pagination-bar">
                  <button
                    type="button"
                    onClick={() => setActivePdfIndex(prev => Math.max(0, prev - 1))}
                    disabled={activePdfIndex === 0}
                    className="learners-pdf-pagination-btn"
                  >
                    &larr; Prev Paper
                  </button>
                  <span className="learners-pdf-pagination-info">
                    Paper {activePdfIndex + 1} of {pdfAttachments.length}: {pdfAttachments[activePdfIndex]?.file_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePdfIndex(prev => Math.min(pdfAttachments.length - 1, prev + 1))}
                    disabled={activePdfIndex === pdfAttachments.length - 1}
                    className="learners-pdf-pagination-btn"
                  >
                    Next Paper &rarr;
                  </button>
                </div>
              )
            ) : (
              textPages.length > 1 && (
                <div className="learners-pdf-pagination-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTextPageIndex(prev => Math.max(0, prev - 1))}
                    disabled={activeTextPageIndex === 0}
                    className="learners-pdf-pagination-btn"
                  >
                    &larr; Prev Page
                  </button>
                  <span className="learners-pdf-pagination-info">
                    Page {activeTextPageIndex + 1} of {textPages.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTextPageIndex(prev => Math.min(textPages.length - 1, prev + 1))}
                    disabled={activeTextPageIndex === textPages.length - 1}
                    className="learners-pdf-pagination-btn"
                  >
                    Next Page &rarr;
                  </button>
                </div>
              )
            )}

            <div className="learners-read-article-paper-a3" aria-hidden="true">
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title="Past Paper PDF Viewer"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', borderRadius: '8px' }}
                  loading="lazy"
                />
              ) : textPages.length > 0 ? (
                <div
                  className="learners-book-text-page"
                  style={{
                    padding: '40px',
                    height: '100%',
                    overflowY: 'auto',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#1E293B',
                  }}
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(textPages[activeTextPageIndex]) }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', padding: '20px', textAlign: 'center' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <h4>No PDF document or text content attached for this lesson</h4>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>There are no downloadable slides, past papers, or text readings provided for this chapter yet.</p>
                </div>
              )}
            </div>

            {/* All Chapter Attachments Section */}
            {attachmentsList.length > 0 && (
              <div className="learners-read-attachments-section" style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#4B5675', marginBottom: '10px' }}>All Chapter Attachments</h4>
                <div className="learners-attachments-grid">
                  {attachmentsList.map((file, idx) => {
                    const fileUrlString = file.file_path.startsWith('http') ? file.file_path : `${API_BASE_URL}${file.file_path}`;
                    const ext = file.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
                    const isPDF = file.file_type === 'application/pdf' || (file.file_path || '').toLowerCase().endsWith('.pdf');
                    const isActivePDF = isPDF && pdfAttachments[activePdfIndex] && (pdfAttachments[activePdfIndex].file_path === file.file_path);
                    return (
                      <a
                        key={`res-${idx}`}
                        href={fileUrlString}
                        download={file.file_name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`learners-attachment-download-card ${isActivePDF ? 'is-active-pdf' : ''}`}
                        onClick={(e) => {
                          if (isPDF) {
                            e.preventDefault();
                            const pdfIdx = pdfAttachments.findIndex(p => p.file_path === file.file_path);
                            if (pdfIdx >= 0) setActivePdfIndex(pdfIdx);
                          }
                        }}
                      >
                        <div className="learners-attachment-ext-badge">
                          {ext}
                        </div>
                        <div className="learners-attachment-meta">
                          <p title={file.file_name}>
                            {file.file_name}
                          </p>
                          <span>
                            {isPDF ? (isActivePDF ? 'Viewing now' : 'Click to view in paper frame') : 'Click to download'}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="learners-read-support-cta" aria-label="Private question support">
            <div className="learners-read-support-cta-copy">
              <h3>Didn’t get it right, Ask a question Privately</h3>
              <p>See your personalized recommendations based on your interests and goals.</p>
            </div>
            <button 
              type="button" 
              className="learners-read-support-cta-btn" 
              onClick={() => {
                setQaError('');
                setQaSuccess('');
                setIsAskQuestionOpen(true);
              }}
            >
              <span>Ask a question</span>
              <img src={wAcBook} alt="Ask" />
            </button>
          </section>

          {/* New Q&A Section: Your Questions & Replies */}
          {myQuestions.length > 0 && (
            <section className="learners-read-support-questions" style={{ marginTop: '24px', marginBottom: '24px', padding: '20px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#071437', margin: '0 0 14px 0', fontFamily: 'Outfit, sans-serif' }}>Your Questions &amp; Replies</h4>
              <div className="learners-qa-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myQuestions.map((q) => {
                  const isThreadOpen = selectedQuestion?.id === q.id;
                  return (
                    <div key={q.id} className="learners-qa-thread-item" style={{ border: '1px solid #F1F5F9', borderRadius: '8px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => handleQuestionClick(q)}
                        style={{ width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FCFCFC', border: 'none', borderBottom: isThreadOpen ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '13px', color: '#1E293B' }}>{q.title}</strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {new Date(q.created_at).toLocaleDateString()} &bull; Status: {q.status}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#5B0A86', fontWeight: '600' }}>
                          {isThreadOpen ? 'Hide Replies' : `${q.answers_count || 0} Replies`}
                        </span>
                      </button>
                      
                      {isThreadOpen && (
                        <div style={{ padding: '16px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <p style={{ fontSize: '13px', color: '#475569', background: '#FAFAFA', padding: '10px 12px', borderRadius: '6px', margin: 0 }}>
                            <strong>Your Question:</strong> {q.content}
                          </p>
                          
                          {loadingThread ? (
                            <span style={{ fontSize: '12px', color: '#64748B' }}>Loading conversation...</span>
                          ) : selectedQuestion.answers && selectedQuestion.answers.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                              {selectedQuestion.answers.map((answer) => (
                                <div key={answer.id} style={{ display: 'flex', gap: '10px', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', borderLeft: answer.is_official ? '3px solid #5B0A86' : '1px solid #E2E8F0' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                      <strong style={{ fontSize: '12px', color: '#0F172A' }}>
                                        {answer.author_name && answer.author_name.trim() !== '' 
                                          ? answer.author_name 
                                          : (answer.author_role === 'student' ? 'Student' : 'Instructor')}
                                      </strong>
                                      <span style={{ fontSize: '10px', color: '#64748B' }}>{new Date(answer.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div 
                                      style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.5' }} 
                                      dangerouslySetInnerHTML={{ __html: answer.content }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>No replies yet. The instructor will respond shortly.</span>
                          )}

                          <form onSubmit={(e) => handleStudentReplySubmit(e, q.id)} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <input
                              type="text"
                              placeholder="Write a follow-up reply..."
                              value={studentReplies[q.id] || ''}
                              onChange={(e) => setStudentReplies(prev => ({ ...prev, [q.id]: e.target.value }))}
                              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                              required
                            />
                            <button
                              type="submit"
                              style={{ padding: '8px 16px', borderRadius: '6px', background: '#5B0A86', color: '#FFFFFF', border: 'none', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="learners-read-exercise" aria-label="Exercise">
            <div className="learners-read-exercise-head">
              <div className="learners-read-exercise-badge" aria-hidden="true">
                <img src={leTec} alt="Exercise" />
              </div>
              <h3>Exercise</h3>
            </div>

            <div className="learners-read-assessment-tracker learners-read-exercise-tracker">
              {exerciseQuestionsState.length === 0 ? (
                <div className="learners-empty-exercises-completion">
                  <p className="learners-no-exercises-text">There are no exercises for this chapter. You can complete this lesson below.</p>
                  {isCurrentChapterCompleted ? (
                    <div className="learners-lesson-completed-badge">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '8px' }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Lesson Completed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="learners-complete-lesson-btn"
                      onClick={() => markChapterCompleteOnBackend(activeChapterId)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Complete Lesson</span>
                    </button>
                  )}
                </div>
              ) : (
                exerciseQuestionsState.map((q, idx) => (
                  <button
                    key={q.id || `ex-${idx}`}
                    type="button"
                    className={`learners-read-assessment-track-item ${idx === currentExerciseIndex ? 'is-current' : ''} ${exerciseStates[idx] !== 'pending' ? `is-${exerciseStates[idx]}` : ''}`}
                    onClick={() => {
                      setCurrentExerciseIndex(idx);
                    }}
                  >
                    {idx + 1}
                  </button>
                ))
              )}
            </div>

            {exerciseQuestionsState.length > 0 && exerciseQuestionsState.every(q => exerciseGradedList[q.id]) && (
              <div className="learners-exercises-completed-banner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <h4>Exercises Completed & Lesson Marked Done!</h4>
                  <p>Great job! You have finished all the interactive exercises for this chapter.</p>
                </div>
              </div>
            )}

            {exerciseQuestionsState[currentExerciseIndex] && (
              <>
                <p className="learners-read-assessment-question learners-read-exercise-question">
                  <span>{exerciseQuestionsState[currentExerciseIndex]?.number}.</span>
                  <span>{stripHtml(exerciseQuestionsState[currentExerciseIndex]?.prompt)}</span>
                </p>

                <div className="learners-read-assessment-options learners-read-exercise-options">
                  {exerciseQuestionsState[currentExerciseIndex]?.options?.length ? exerciseQuestionsState[currentExerciseIndex].options.map((optHusk, optIdx) => {
                    const question = exerciseQuestionsState[currentExerciseIndex];
                    const isSelected = exerciseAnswers[question.id] === optIdx;
                    const isCorrect = (question.correctAnswers || []).includes(optIdx);
                    const isGraded = !!exerciseGradedList[question.id];
                    let stateClass = '';
                    if (isGraded) {
                      if (isSelected) {
                        stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                      } else if (isCorrect) {
                        stateClass = 'is-correct';
                      }
                    }
                    const isMulti = question.type === 'multi';
                    return (
                      <button
                        key={`${question.id}-${optIdx}`}
                        type="button"
                        className={`learners-read-assessment-option learners-read-exercise-option ${isMulti ? 'is-multi' : ''} ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                        onClick={() => handleExerciseOptionSelect(optIdx)}
                      >
                        <span className="learners-read-assessment-option-marker">
                          {isMulti && <img src={doneIcon} alt="Check" />}
                        </span>
                        <span>{stripHtml(typeof optHusk === 'object' ? (optHusk.text || optHusk.label || optHusk.value || optHusk.option || optHusk.option_text || optHusk.optionText || optHusk.content || JSON.stringify(optHusk)) : optHusk)}</span>
                      </button>
                    );
                  }) : (
                    <div className="learners-empty">No options available for this exercise.</div>
                  )}
                </div>

                <button
                  type="button"
                  className={`learners-read-assessment-action learners-read-exercise-action ${!!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] && currentExerciseIndex === exerciseQuestionsState.length - 1 ? 'is-complete' : ''}`}
                  onClick={handleExerciseAction}
                >
                  <span>{!!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] && currentExerciseIndex < exerciseQuestionsState.length - 1 ? 'Next' : 'Done'}</span>
                  <img src={right1} alt="Next" hidden={!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] || currentExerciseIndex >= exerciseQuestionsState.length - 1} />
                </button>
              </>
            )}
          </section>
        </div>
      </div>

      {isAskQuestionOpen && (
        <div className="learners-qa-modal-overlay" onClick={() => setIsAskQuestionOpen(false)}>
          <div className="learners-qa-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="learners-qa-modal-header">
              <h3>Ask a Question Privately</h3>
              <button 
                type="button" 
                className="learners-qa-modal-close" 
                onClick={() => setIsAskQuestionOpen(false)}
                aria-label="Close form"
              >
                &times;
              </button>
            </header>
            <form onSubmit={handleAskQuestionSubmit} className="learners-qa-modal-form">
              <div className="learners-qa-form-group">
                <label htmlFor="qa-title">Title</label>
                <input
                  id="qa-title"
                  type="text"
                  placeholder="What is your question about?"
                  value={qaTitle}
                  onChange={(e) => setQaTitle(e.target.value)}
                  required
                />
              </div>
              <div className="learners-qa-form-group">
                <label htmlFor="qa-content">Details</label>
                <textarea
                  id="qa-content"
                  placeholder="Describe what you are struggling with..."
                  value={qaContent}
                  onChange={(e) => setQaContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              {qaError && <p className="learners-qa-error-msg">{qaError}</p>}
              {qaSuccess && <p className="learners-qa-success-msg">{qaSuccess}</p>}
              <div className="learners-qa-modal-actions">
                <button type="button" className="learners-qa-cancel-btn" onClick={() => setIsAskQuestionOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="learners-qa-submit-btn" disabled={qaSubmitting}>
                  {qaSubmitting ? 'Sending...' : 'Submit Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceModal;
