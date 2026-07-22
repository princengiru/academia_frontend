import React, { useState, useEffect } from 'react';
import wAcBook from '../../../../assets/icons/w-ac-book.svg';
import leTec from '../../../../assets/icons/le-tec.svg';
import right1 from '../../../../assets/icons/right1.svg';
import doneIcon from '../../../../assets/icons/done.svg';
import { isYoutubeUrl, resolveVideoSrc, resolveYoutubeEmbedUrl } from './lessonMediaUtils';

function LessonWorkspacePanels({
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
  handleExerciseTextChange,
  handleExerciseAction,
  isCurrentChapterCompleted,
  markChapterCompleteOnBackend,
  activeChapterId,
  courseId,
}) {
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [qaTitle, setQaTitle] = useState('');
  const [qaContent, setQaContent] = useState('');
  const [qaSubmitting, setQaSubmitting] = useState(false);
  const [qaSuccess, setQaSuccess] = useState('');
  const [qaError, setQaError] = useState('');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const body = await res.json();
        const data = body?.data?.questions || body?.questions || [];
        const filtered = data.filter((q) =>
          Number(q.course_id) === Number(courseId)
          && (q.chapter_id === null || Number(q.chapter_id) === Number(activeChapterId))
        );
        setMyQuestions(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch my questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (!courseId) return;
    fetchMyQuestions();
    setSelectedQuestion(null);
  }, [activeChapterId, courseId]);

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
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const body = await res.json();
        setSelectedQuestion(body?.data || q);
      }
    } catch (err) {
      console.error('Failed to load question details:', err);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyText }),
      });

      if (response.ok) {
        setStudentReplies((prev) => ({ ...prev, [questionId]: '' }));
        const detailRes = await fetch(`${API_BASE_URL}/api/qa/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (detailRes.ok) {
          const detailBody = await detailRes.json();
          setSelectedQuestion(detailBody?.data || null);
          fetchMyQuestions();
        }
      }
    } catch (err) {
      console.error('Failed to submit student reply:', err);
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          weekId: activeContent?.weekId || null,
          chapterId: activeChapterId || null,
          title: qaTitle.trim(),
          content: qaContent.trim(),
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to submit question');
      }

      setQaSuccess('Your question was submitted successfully!');
      setQaTitle('');
      setQaContent('');
      fetchMyQuestions();

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

  const hasVideo = Boolean(activeContent?.video_url);
  const hasPdf = Boolean(pdfUrl);
  const hasText = textPages.length > 0;
  const showReadingPane = hasPdf || hasText || !hasVideo;

  const exerciseTotal = exerciseQuestionsState.length;
  const exerciseDone = exerciseQuestionsState.filter((q) => exerciseGradedList[q.id]).length;
  const exercisePercent = exerciseTotal > 0 ? Math.round((exerciseDone / exerciseTotal) * 100) : 0;
  const allExercisesGraded = exerciseTotal > 0 && exerciseDone === exerciseTotal;

  return (
    <div className="learners-lesson-workspace-panels">
      <section className="learners-read-article-bottom-section learners-lesson-content-section">
        {hasPdf ? (
          pdfAttachments.length > 1 && (
            <div className="learners-pdf-pagination-bar">
              <button
                type="button"
                onClick={() => setActivePdfIndex((prev) => Math.max(0, prev - 1))}
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
                onClick={() => setActivePdfIndex((prev) => Math.min(pdfAttachments.length - 1, prev + 1))}
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
                onClick={() => setActiveTextPageIndex((prev) => Math.max(0, prev - 1))}
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
                onClick={() => setActiveTextPageIndex((prev) => Math.min(textPages.length - 1, prev + 1))}
                disabled={activeTextPageIndex === textPages.length - 1}
                className="learners-pdf-pagination-btn"
              >
                Next Page &rarr;
              </button>
            </div>
          )
        )}

        <div className="learners-read-article-paper-a3 learners-lesson-content-frame">
          {hasVideo && (
            <div className="learners-workspace-video-wrap learners-lesson-video-wrap">
              {isYoutubeUrl(activeContent.video_url) ? (
                <iframe
                  width="100%"
                  src={resolveYoutubeEmbedUrl(activeContent.video_url)}
                  title="Lesson Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={resolveVideoSrc(activeContent.video_url, API_BASE_URL)}
                  controls
                />
              )}
            </div>
          )}

          {showReadingPane && (
            <div className="learners-lesson-reading-pane">
              {hasPdf ? (
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title="Lesson PDF"
                  className="learners-lesson-pdf-frame"
                  loading="lazy"
                />
              ) : hasText ? (
                <div
                  key={`${activeChapterId}-${activeTextPageIndex}`}
                  className="learners-book-text-page"
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(textPages[activeTextPageIndex]) }}
                />
              ) : (
                <div className="learners-lesson-empty-reading">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <h4>No reading material attached</h4>
                  <p>This lesson does not include slides, past papers, or written content yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {attachmentsList.length > 0 && (
          <div className="learners-read-attachments-section">
            <h4 className="learners-lesson-attachments-title">Chapter downloads</h4>
            <div className="learners-attachments-grid">
              {attachmentsList.map((file, idx) => {
                const filePath = file.file_path || file.file_url || '';
                const fileUrlString = filePath.startsWith('http') ? filePath : `${API_BASE_URL}${filePath}`;
                const ext = file.file_name?.split('.').pop()?.toUpperCase() || 'FILE';
                const isPDF = file.file_type === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf');
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
                        const pdfIdx = pdfAttachments.findIndex((p) => p.file_path === file.file_path);
                        if (pdfIdx >= 0) setActivePdfIndex(pdfIdx);
                      }
                    }}
                  >
                    <div className="learners-attachment-ext-badge">{ext}</div>
                    <div className="learners-attachment-meta">
                      <p title={file.file_name}>{file.file_name}</p>
                      <span>
                        {isPDF ? (isActivePDF ? 'Viewing now' : 'Click to view in reader') : 'Click to download'}
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
          <h3>Need help with this lesson?</h3>
          <p>Ask your instructor a private question about this chapter.</p>
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
          <img src={wAcBook} alt="" />
        </button>
      </section>

      {loadingQuestions ? (
        <p className="learners-lesson-qa-loading">Loading your questions…</p>
      ) : null}

      {myQuestions.length > 0 && (
        <section className="learners-read-support-questions learners-lesson-qa-section">
          <h4>Your questions &amp; replies</h4>
          <div className="learners-qa-list">
            {myQuestions.map((q) => {
              const isThreadOpen = selectedQuestion?.id === q.id;
              return (
                <div key={q.id} className="learners-qa-thread-item">
                  <button type="button" className="learners-qa-thread-toggle" onClick={() => handleQuestionClick(q)}>
                    <div>
                      <strong>{q.title}</strong>
                      <span>
                        {new Date(q.created_at).toLocaleDateString()} &bull; Status: {q.status}
                      </span>
                    </div>
                    <span className="learners-qa-thread-count">
                      {isThreadOpen ? 'Hide replies' : `${q.answers_count || 0} replies`}
                    </span>
                  </button>

                  {isThreadOpen && (
                    <div className="learners-qa-thread-body">
                      <p className="learners-qa-thread-question">
                        <strong>Your question:</strong> {q.content}
                      </p>

                      {loadingThread ? (
                        <span className="learners-lesson-qa-loading">Loading conversation…</span>
                      ) : selectedQuestion.answers && selectedQuestion.answers.length > 0 ? (
                        <div className="learners-qa-answers">
                          {selectedQuestion.answers.map((answer) => (
                            <div key={answer.id} className={`learners-qa-answer ${answer.is_official ? 'is-official' : ''}`}>
                              <div>
                                <div className="learners-qa-answer-head">
                                  <strong>
                                    {answer.author_name && answer.author_name.trim() !== ''
                                      ? answer.author_name
                                      : (answer.author_role === 'student' ? 'Student' : 'Instructor')}
                                  </strong>
                                  <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                                </div>
                                <div
                                  className="learners-qa-answer-content"
                                  dangerouslySetInnerHTML={{ __html: answer.content }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="learners-qa-no-replies">No replies yet. Your instructor will respond shortly.</span>
                      )}

                      <form onSubmit={(e) => handleStudentReplySubmit(e, q.id)} className="learners-qa-reply-form">
                        <input
                          type="text"
                          placeholder="Write a follow-up reply…"
                          value={studentReplies[q.id] || ''}
                          onChange={(e) => setStudentReplies((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          required
                        />
                        <button type="submit">Send</button>
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
            <img src={leTec} alt="" />
          </div>
          <div>
            <h3>Practice exercise</h3>
            {exerciseTotal > 0 ? (
              <div className="learners-exercise-progress-wrap">
                <div className="learners-exercise-progress-head">
                  <span>Exercise progress</span>
                  <strong>{exerciseDone} / {exerciseTotal} ({exercisePercent}%)</strong>
                </div>
                <div
                  className="learners-exercise-progress-bar"
                  role="progressbar"
                  aria-valuenow={exercisePercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div className="learners-exercise-progress-fill" style={{ width: `${exercisePercent}%` }} />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="learners-read-assessment-tracker learners-read-exercise-tracker">
          {exerciseQuestionsState.length === 0 ? (
            <div className="learners-empty-exercises-completion">
              <p className="learners-no-exercises-text">There are no exercises for this chapter. Mark the lesson complete when you are done reading.</p>
              {isCurrentChapterCompleted ? (
                <div className="learners-lesson-completed-badge">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '8px' }}>
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Lesson completed</span>
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
                  <span>Complete lesson</span>
                </button>
              )}
            </div>
          ) : (
            exerciseQuestionsState.map((q, idx) => (
              <button
                key={q.id || `ex-${idx}`}
                type="button"
                className={`learners-read-assessment-track-item ${idx === currentExerciseIndex ? 'is-current' : ''} ${exerciseStates[idx] !== 'pending' ? `is-${exerciseStates[idx]}` : ''}`}
                onClick={() => setCurrentExerciseIndex(idx)}
              >
                {idx + 1}
              </button>
            ))
          )}
        </div>

        {allExercisesGraded && (
          <div className="learners-exercises-completed-banner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <h4>Exercises completed</h4>
              <p>Great work — moving you to the next lesson shortly.</p>
            </div>
          </div>
        )}

        {exerciseQuestionsState[currentExerciseIndex] && (
          <>
            <p className="learners-read-assessment-question learners-read-exercise-question">
              <span>{exerciseQuestionsState[currentExerciseIndex]?.number}.</span>
              <span>{stripHtml(exerciseQuestionsState[currentExerciseIndex]?.prompt)}</span>
            </p>

            {exerciseQuestionsState[currentExerciseIndex]?.type === 'multi' && (
              <p className="learners-read-exercise-hint">Select all that apply</p>
            )}

            <div className="learners-read-assessment-options learners-read-exercise-options">
              {(() => {
                const question = exerciseQuestionsState[currentExerciseIndex];
                const isGraded = !!exerciseGradedList[question.id];

                if (question.type === 'text') {
                  const textValue = typeof exerciseAnswers[question.id] === 'string' ? exerciseAnswers[question.id] : '';
                  return (
                    <textarea
                      className="learners-read-exercise-textarea"
                      placeholder="Type your answer here..."
                      value={textValue}
                      onChange={(e) => handleExerciseTextChange(e.target.value)}
                      disabled={isGraded}
                      rows={5}
                    />
                  );
                }

                if (!question.options?.length) {
                  return <div className="learners-empty">No options available for this exercise.</div>;
                }

                const answer = exerciseAnswers[question.id];
                const selected = Array.isArray(answer) ? answer : [];
                const isMulti = question.type === 'multi';

                return question.options.map((optHusk, optIdx) => {
                  const isSelected = selected.includes(optIdx);
                  const isCorrect = (question.correctAnswers || []).includes(optIdx);
                  let stateClass = '';
                  if (isGraded) {
                    if (isSelected) {
                      stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                    } else if (isCorrect) {
                      stateClass = 'is-correct';
                    }
                  }
                  return (
                    <button
                      key={`${question.id}-${optIdx}`}
                      type="button"
                      className={`learners-read-assessment-option learners-read-exercise-option ${isMulti ? 'is-multi' : ''} ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                      onClick={() => handleExerciseOptionSelect(optIdx)}
                      disabled={isGraded}
                    >
                      <span className="learners-read-assessment-option-marker">
                        {isMulti && <img src={doneIcon} alt="" />}
                      </span>
                      <span>{stripHtml(typeof optHusk === 'object' ? (optHusk.text || optHusk.label || optHusk.value || optHusk.option || optHusk.option_text || optHusk.optionText || optHusk.content || JSON.stringify(optHusk)) : optHusk)}</span>
                    </button>
                  );
                });
              })()}
            </div>

            <button
              type="button"
              className={`learners-read-assessment-action learners-read-exercise-action ${!!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] && currentExerciseIndex === exerciseQuestionsState.length - 1 ? 'is-complete' : ''}`}
              onClick={handleExerciseAction}
            >
              <span>{!!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] && currentExerciseIndex < exerciseQuestionsState.length - 1 ? 'Next' : 'Done'}</span>
              <img src={right1} alt="" hidden={!exerciseGradedList[exerciseQuestionsState[currentExerciseIndex].id] || currentExerciseIndex >= exerciseQuestionsState.length - 1} />
            </button>
          </>
        )}
      </section>

      {isAskQuestionOpen && (
        <div className="learners-qa-modal-overlay" onClick={() => setIsAskQuestionOpen(false)}>
          <div className="learners-qa-modal-container" onClick={(e) => e.stopPropagation()}>
            <header className="learners-qa-modal-header">
              <h3>Ask a question privately</h3>
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
                  placeholder="Describe what you are struggling with…"
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
                  {qaSubmitting ? 'Sending…' : 'Submit question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonWorkspacePanels;
