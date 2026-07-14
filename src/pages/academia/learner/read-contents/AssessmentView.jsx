import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Award, AlertTriangle, CheckCircle } from 'lucide-react';


// Icons & Images
import leTec from '../../../../assets/icons/le-tec.svg';
import leftIcon from '../../../../assets/icons/left.svg';
import doneIcon from '../../../../assets/icons/done.svg';
import right1 from '../../../../assets/icons/right1.svg';

import { computeCertificateTotalHours } from '../enrollmentPaymentUtils';
import CourseCompleteCelebration from './CourseCompleteCelebration';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AssessmentView = ({
  courseId,
  courseMeta = {},
  showCourseCelebration = false,
  courseTitle = '',
  onDismissCourseCelebration,
  isAssessmentView,
  currentAssessmentDetails,
  maxAttempts,
  attemptNumber,
  assessmentTimerActive,
  timeRemainingSeconds,
  formatTimer,
  assessmentTracker,
  getTrackerItemClass,
  syncTextAnswer,
  assessmentQuestions,
  setCurrentAssessmentIndex,
  currentAssessmentIndex,
  isAssessmentComplete,
  assessmentResult,
  assessmentTextAnswer,
  setAssessmentTextAnswer,
  isAssessmentReviewMode,
  selectedAssessmentOptions,
  handleAssessmentOptionSelect,
  handleAssessmentNavigation,
  handleAssessmentSubmit,
  setIsAssessmentReviewMode,
  setIsAssessmentComplete,
  handleAssessmentCompleteButton,
  hasAttemptsLeft,
  stripHtml,
  loadingAssessment,
  isAssessmentStarted,
  setIsAssessmentStarted,
  isConfirmingSubmit,
  setIsConfirmingSubmit,
  assessmentAttemptData,
  startAssessmentTimer,
  handleStartAssessment,
  showToast
}) => {
  const navigate = useNavigate();
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [claimMessage, setClaimMessage] = React.useState('');
  const [hasClaimed, setHasClaimed] = React.useState(false);
  const [checkingCertificate, setCheckingCertificate] = React.useState(false);

  React.useEffect(() => {
    setHasClaimed(false);
    setClaimMessage('');
  }, [courseId, currentAssessmentDetails?.id]);

  React.useEffect(() => {
    let cancelled = false;

    const checkExistingCertificate = async () => {
      if (!isAssessmentView || !isAssessmentComplete || currentAssessmentDetails?.type !== 'summative' || !courseId) {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      setCheckingCertificate(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/certificates/user/my-certificates?limit=100&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const body = await res.json();
        const listData = body?.data ?? body;
        const items = Array.isArray(listData?.certificates)
          ? listData.certificates
          : Array.isArray(listData?.data)
            ? listData.data
            : Array.isArray(listData)
              ? listData
              : [];

        const alreadyIssued = items.some((cert) => {
          const certCourseId = cert.courseId ?? cert.course_id ?? cert.course?.id;
          return Number(certCourseId) === Number(courseId);
        });

        if (!cancelled && alreadyIssued) {
          setHasClaimed(true);
          setClaimMessage('Certificate already issued for this course.');
        }
      } catch (err) {
        console.error('Failed to check existing certificate:', err);
      } finally {
        if (!cancelled) setCheckingCertificate(false);
      }
    };

    checkExistingCertificate();
    return () => { cancelled = true; };
  }, [isAssessmentView, isAssessmentComplete, currentAssessmentDetails?.type, courseId]);

  const handleClaimCertificate = async () => {
    if (hasClaimed) {
      navigate('/academia/learner/certificates');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please sign in to claim your certificate.", "error");
      return;
    }
    
    setIsClaiming(true);
    setClaimMessage("");
    
    try {
      const scoreVal = assessmentResult?.score ? parseFloat(assessmentResult.score.replace('%', '')) : 75;
      const totalHours = computeCertificateTotalHours(courseMeta);
      const payload = {
        final_score: scoreVal,
        formative_score: scoreVal,
      };
      if (totalHours) payload.total_hours = totalHours;

      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/certificates/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const body = await res.json();
      if (!res.ok) {
        const message = body.message || "Failed to claim certificate.";
        if (/already issued/i.test(message)) {
          setHasClaimed(true);
          setClaimMessage('Certificate already issued for this course.');
          return;
        }
        throw new Error(message);
      }
      
      setHasClaimed(true);
      setClaimMessage('Certificate request submitted! We will notify you when it is approved.');
    } catch (err) {
      setClaimMessage(err.message || "Could not claim certificate.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isAssessmentView) return null;

  if (loadingAssessment) {
    return (
      <section className="learners-read-assessment-view">
        <div className="learners-loading" style={{ padding: '80px 40px', textAlign: 'center', fontSize: '15px', color: '#5B0A86', fontWeight: '500' }}>
          Loading assessment…
        </div>
      </section>
    );
  }

  return (
    <section className="learners-read-assessment-view">
      <div className="learners-read-assessment-strip">
        <div className="learners-read-assessment-strip-top">
          <div className="learners-read-assessment-strip-title">
            <div className="learners-read-assessment-badge" aria-hidden="true">
              <img src={leTec} alt="Assessment" />
            </div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentAssessmentDetails.type === 'formative' ? (
                <>
                  <ClipboardList size={18} color="#5B0A86" />
                  <span>Quiz</span>
                </>
              ) : (
                <>
                  <Award size={18} color="#5B0A86" />
                  <span>Assessment</span>
                </>
              )}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {(isAssessmentStarted || isAssessmentReviewMode) && (
              <>
                {maxAttempts && (
                  <span className="learners-read-assessment-attempt-badge">
                    Attempt {attemptNumber}{maxAttempts ? ` / ${maxAttempts}` : ''}
                  </span>
                )}
                {assessmentTimerActive && timeRemainingSeconds > 0 ? (
                  <p className={`learners-read-assessment-time ${timeRemainingSeconds <= 60 ? 'is-danger' : timeRemainingSeconds <= 300 ? 'is-warning' : ''}`}>
                    Time remaining : <strong>{formatTimer(timeRemainingSeconds)}</strong>
                  </p>
                ) : currentAssessmentDetails.durationMinutes > 0 ? (
                  <p className="learners-read-assessment-time is-expired">Time's up!</p>
                ) : (
                  <p className="learners-read-assessment-time">No time limit</p>
                )}
              </>
            )}
          </div>
        </div>

        {(isAssessmentStarted || isAssessmentReviewMode) && (
          <div className="learners-read-assessment-tracker">
            {assessmentTracker.length === 0 ? (
              <div className="learners-empty learners-empty-state--compact">No question tracker available.</div>
            ) : (
              assessmentTracker.map((huskState, idx) => (
                <button
                  key={`track-${idx}-${huskState}`}
                  type="button"
                  className={getTrackerItemClass(idx)}
                  onClick={() => {
                    syncTextAnswer();
                    if (idx < assessmentQuestions.length) {
                      setCurrentAssessmentIndex(idx);
                      setIsConfirmingSubmit(false);
                    }
                  }}
                >
                  {idx + 1}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {!isAssessmentComplete ? (
        assessmentQuestions.length === 0 ? (
          <div className="learners-card learners-empty-state" style={{ margin: '20px 0', padding: '40px', textAlign: 'center' }}>
            <h3>No assessment questions available</h3>
            <p>There are no questions for this assessment yet.</p>
          </div>
        ) : !isAssessmentStarted && !isAssessmentReviewMode ? (
          /* Assessment Preparation/Start Screen */
          <section className="learners-read-assessment-card learners-assessment-prep-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#5B0A86', letterSpacing: '0.05em' }}>
                Ready to Start
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '6px', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
                {currentAssessmentDetails.title || 'Assessment Instructions'}
              </h2>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                Please review the guidelines and details of this assessment below before beginning your attempt. Once you start, the timer cannot be paused.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Questions</span>
                <strong style={{ fontSize: '18px', color: '#0F172A' }}>{assessmentQuestions.length} Questions</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Time Limit</span>
                <strong style={{ fontSize: '18px', color: '#0F172A' }}>
                  {currentAssessmentDetails.durationMinutes > 0 ? `${currentAssessmentDetails.durationMinutes} Minutes` : 'No time limit'}
                </strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Passing Score</span>
                <strong style={{ fontSize: '18px', color: '#0F172A' }}>{currentAssessmentDetails.passingScore}%</strong>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Allowed Attempts</span>
                <strong style={{ fontSize: '18px', color: '#0F172A' }}>
                  Attempt {attemptNumber} {maxAttempts ? `of ${maxAttempts}` : '(Unlimited)'}
                </strong>
              </div>
            </div>

            <div style={{ background: '#FFFDF5', border: '1px solid #FDF0CD', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#854D0E', lineHeight: '1.5' }}>
                <strong>Important Note:</strong> Keep a steady internet connection. Do not close or refresh this tab while taking the assessment. If your time expires, your current answers will be auto-submitted.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="button"
                className="learners-btn learners-btn-primary"
                style={{ background: '#5B0A86', padding: '12px 28px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
                onClick={handleStartAssessment}
              >
                <span>{assessmentAttemptData?.start_time ? 'Resume Attempt' : 'Start Assessment'}</span>
              </button>
            </div>
          </section>
        ) : isConfirmingSubmit ? (
          /* Safeguard Submission Confirmation Screen */
          <section className="learners-read-assessment-card learners-assessment-confirm-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#5B0A86', letterSpacing: '0.05em' }}>
                Safe Guard Check
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '6px', marginBottom: '8px', fontFamily: 'Outfit, sans-serif' }}>
                Confirm Submission
              </h2>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
                Please check if you have answered all questions. You cannot change your answers after submitting this assessment.
              </p>
            </div>

            {(() => {
              const total = assessmentQuestions.length;
              const answered = assessmentTracker.filter(status => status === 'answered').length;
              const unanswered = total - answered;

              const unansweredIndices = [];
              assessmentTracker.forEach((status, idx) => {
                if (status === 'pending') {
                  unansweredIndices.push(idx);
                }
              });

              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Total Questions</span>
                      <strong style={{ fontSize: '18px', color: '#0F172A' }}>{total}</strong>
                    </div>
                    <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #D1FAE5' }}>
                      <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '600', textTransform: 'uppercase' }}>Answered</span>
                      <strong style={{ fontSize: '18px', color: '#047857' }}>{answered}</strong>
                    </div>
                    <div style={{ background: unanswered > 0 ? '#FEF2F2' : '#F8FAFC', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', border: unanswered > 0 ? '1px solid #FEE2E2' : 'none' }}>
                      <span style={{ fontSize: '11px', color: unanswered > 0 ? '#991B1B' : '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Unanswered</span>
                      <strong style={{ fontSize: '18px', color: unanswered > 0 ? '#DC2626' : '#0F172A' }}>{unanswered}</strong>
                    </div>
                  </div>

                  {unanswered > 0 ? (
                    <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
                        <strong style={{ fontSize: '14px', color: '#991B1B' }}>You have unanswered questions!</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: '#7F1D1D', margin: 0 }}>
                        Click on any of the question badges below to return and complete them:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                        {unansweredIndices.map((qIdx) => (
                          <button
                            key={`unanswered-${qIdx}`}
                            type="button"
                            style={{
                              background: '#DC2626',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
                              transition: 'transform 0.15s ease'
                            }}
                            onClick={() => {
                              setCurrentAssessmentIndex(qIdx);
                              setIsConfirmingSubmit(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            Go to Q{qIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <CheckCircle size={20} color="#15803D" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: '13px', color: '#166534', fontWeight: '500' }}>
                        All questions have been answered. You are good to submit!
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <button
                      type="button"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        padding: '12px 24px',
                        borderRadius: '24px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={() => setIsConfirmingSubmit(false)}
                    >
                      Go Back
                    </button>
                    <button
                      type="button"
                      style={{
                        background: '#5B0A86',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '12px 28px',
                        borderRadius: '24px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(91, 10, 134, 0.2)'
                      }}
                      onClick={() => {
                        setIsConfirmingSubmit(false);
                        handleAssessmentSubmit();
                      }}
                    >
                      Submit Assessment
                    </button>
                  </div>
                </>
              );
            })()}
          </section>
        ) : (
          /* Standard Quiz Card taking layout */
          <section className="learners-read-assessment-card">
            <div className="learners-read-assessment-card-top">
              <div className="learners-read-assessment-card-title">
                <img src={leftIcon} alt="Back" />
                <span>Assessment</span>
              </div>
              <strong>{assessmentQuestions[currentAssessmentIndex]?.progressText}</strong>
            </div>

            {/* Modern Progress Bar */}
            <div className="learners-assessment-progress-bar-container">
              <div 
                className="learners-assessment-progress-bar-fill"
                style={{ width: `${(assessmentTracker.filter(status => status === 'answered').length / assessmentQuestions.length) * 100}%` }}
              ></div>
            </div>

            <p className="learners-read-assessment-question" style={{ marginTop: '20px' }}>
              <span>{assessmentQuestions[currentAssessmentIndex]?.number}.</span>
              <span>{stripHtml(assessmentQuestions[currentAssessmentIndex]?.prompt)}</span>
            </p>

            {assessmentQuestions[currentAssessmentIndex]?.image && (
              <div className="learners-read-assessment-image-wrap">
                <img src={assessmentQuestions[currentAssessmentIndex].image} alt="Assessment reference" />
              </div>
            )}

            {/* Render based on question type */}
            {(() => {
              const currentQ = assessmentQuestions[currentAssessmentIndex];
              const isTextQ = currentQ?.type === 'short_answer' || currentQ?.type === 'essay';
              const showAnswers = currentAssessmentDetails.showCorrectAnswers;

              if (isTextQ) {
                return (
                  <div className="learners-read-assessment-text-answer">
                    {currentQ.type === 'essay' ? (
                      <textarea
                        className="learners-assessment-textarea"
                        placeholder="Write your answer here..."
                        value={assessmentTextAnswer}
                        onChange={(e) => setAssessmentTextAnswer(e.target.value)}
                        onBlur={syncTextAnswer}
                        disabled={isAssessmentReviewMode}
                        rows={6}
                      />
                    ) : (
                      <input
                        type="text"
                        className="learners-assessment-text-input"
                        placeholder="Type your answer..."
                        value={assessmentTextAnswer}
                        onChange={(e) => setAssessmentTextAnswer(e.target.value)}
                        onBlur={syncTextAnswer}
                        disabled={isAssessmentReviewMode}
                      />
                    )}
                    {isAssessmentReviewMode && showAnswers && currentQ.correctAnswer && (
                      <div className="learners-assessment-correct-answer-reveal">
                        <span className="learners-assessment-correct-label">Correct answer:</span>
                        <span>{currentQ.correctAnswer}</span>
                      </div>
                    )}
                    {isAssessmentReviewMode && currentQ.explanation && showAnswers && (
                      <div className="learners-assessment-explanation">
                        <strong>Explanation:</strong> {currentQ.explanation}
                      </div>
                    )}
                  </div>
                );
              }

              // Multiple choice / true-false options
              return (
                <div className="learners-read-assessment-options">
                  {currentQ?.options?.map((optHusk, optIdx) => {
                    const isMulti = currentQ.type === 'multi';
                    const isSelected = selectedAssessmentOptions.includes(optIdx);
                    const isCorrectOpt = (currentQ.correctAnswers || []).includes(optIdx);

                    let stateClass = '';
                    if (isAssessmentReviewMode && showAnswers) {
                      if (isSelected) {
                        stateClass = isCorrectOpt ? 'is-correct' : 'is-wrong';
                      } else if (isCorrectOpt) {
                        stateClass = 'is-correct';
                      }
                    } else {
                      if (isSelected) {
                        stateClass = 'is-selected';
                      }
                    }

                    return (
                      <button
                        key={`${currentQ?.id || currentAssessmentIndex}-${optIdx}`}
                        type="button"
                        className={`learners-read-assessment-option ${isMulti ? 'is-multi' : ''} ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                        onClick={() => handleAssessmentOptionSelect(optIdx, currentQ.type)}
                        disabled={isAssessmentReviewMode}
                      >
                        <span className="learners-read-assessment-option-marker">
                          {isMulti && <img src={doneIcon} alt="Check" />}
                        </span>
                        <span>{stripHtml(typeof optHusk === 'object' ? (optHusk.text || optHusk.label || optHusk.value || optHusk.option || optHusk.option_text || optHusk.optionText || optHusk.content || JSON.stringify(optHusk)) : optHusk)}</span>
                      </button>
                    );
                  })}
                  {isAssessmentReviewMode && currentQ?.explanation && showAnswers && (
                    <div className="learners-assessment-explanation">
                      <strong>Explanation:</strong> {currentQ.explanation}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navigation & Submit Action buttons */}
            <div className="learners-assessment-actions-row">
              {currentAssessmentIndex > 0 && (
                <button
                  type="button"
                  className="learners-btn-nav is-prev"
                  onClick={() => handleAssessmentNavigation('prev')}
                >
                  <img src={leftIcon} alt="Prev" />
                  <span>Previous</span>
                </button>
              )}

              {isAssessmentReviewMode && (
                <button
                  type="button"
                  className="learners-btn-nav is-back"
                  onClick={() => {
                    setIsAssessmentReviewMode(false);
                    setIsAssessmentComplete(true);
                  }}
                >
                  <span>Back to Results</span>
                </button>
              )}

              {currentAssessmentIndex < assessmentQuestions.length - 1 ? (
                <button
                  type="button"
                  className="learners-btn-nav is-next"
                  onClick={() => handleAssessmentNavigation('next')}
                >
                  <span>Next</span>
                  <img src={right1} alt="Next" />
                </button>
              ) : (
                !isAssessmentReviewMode && (
                  <button
                    type="button"
                    className="learners-btn-nav is-submit"
                    onClick={() => {
                      syncTextAnswer();
                      setIsConfirmingSubmit(true);
                    }}
                  >
                    <span>Submit Assessment</span>
                  </button>
                )
              )}
            </div>
          </section>
        )
      ) : !assessmentResult?.score && !assessmentResult?.headline ? (
        <div className="learners-loading" style={{ padding: '80px 40px', textAlign: 'center', fontSize: '15px', color: '#5B0A86', fontWeight: '500' }}>
          Loading assessment results…
        </div>
      ) : (
        <section className="learners-read-assessment-complete">
          {showCourseCelebration ? (
            <CourseCompleteCelebration
              courseId={courseId}
              courseTitle={courseTitle}
              onDismiss={onDismissCourseCelebration}
            />
          ) : null}
          {/* Score Display (only if showScoreImmediately is true) */}
          {(currentAssessmentDetails.showScoreImmediately || assessmentResult.status === 'graded') ? (
            <>
              <div className="learners-read-assessment-complete-orb" aria-hidden="true">
                <span>{assessmentResult.score}</span>
              </div>
              <div className="learners-read-assessment-complete-copy">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Award size={20} color="#5B0A86" style={{ flexShrink: 0 }} />
                  <span>{assessmentResult.headline}</span>
                </h3>
              </div>
              <div className="learners-read-assessment-complete-stats">
                {assessmentResult.stats.map((huskStat, idx) => (
                  <div key={idx} className={`learners-read-assessment-complete-stat ${huskStat.tone ? `is-${huskStat.tone}` : ''}`}>
                    <strong>{huskStat.value}</strong>
                    <span>{huskStat.label}</span>
                  </div>
                ))}
              </div>
              <p className="learners-read-assessment-complete-summary">{assessmentResult.summary}</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="learners-read-assessment-complete-orb" aria-hidden="true" style={{ background: '#F0E6F6', borderColor: '#D9C8E6' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5B0A86" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#071437', marginTop: '16px' }}>Quiz Submitted Successfully</h3>
              <p style={{ color: '#4B5675', fontSize: '14px', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
                Your attempt has been recorded. The instructor will grade it if required, or you can check your grades dashboard later.
              </p>
            </div>
          )}

          <div className="learners-results-actions-row">
            {(currentAssessmentDetails.showScoreImmediately || assessmentResult.status === 'graded') && currentAssessmentDetails.showCorrectAnswers && (
              <button 
                type="button" 
                className="learners-btn-secondary" 
                onClick={() => {
                  setIsAssessmentReviewMode(true);
                  setIsAssessmentComplete(false);
                  setCurrentAssessmentIndex(0);
                }}
              >
                Review Questions
              </button>
            )}

            {(() => {
              const scorePct = parseFloat(assessmentResult.score?.replace('%', '')) || 0;
              const isPassed = scorePct >= (currentAssessmentDetails.passingScore || 60);
              const isSummative = currentAssessmentDetails.type === 'summative';

              if (isSummative && isPassed) {
                if (checkingCertificate) {
                  return null;
                }
                return (
                  <button
                    type="button"
                    className="learners-btn-primary"
                    onClick={handleClaimCertificate}
                    disabled={isClaiming}
                    style={{
                      background: hasClaimed ? '#10B981' : '#5B0A86',
                      color: '#FFFFFF',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: isClaiming ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Award size={16} />
                    <span>
                      {isClaiming
                        ? 'Claiming...'
                        : hasClaimed
                          ? 'View Certificates'
                          : 'Claim Certificate'}
                    </span>
                  </button>
                );
              }
              return null;
            })()}

            {assessmentResult.buttonLabel === 'Continue' && (
              <button
                type="button"
                className="learners-read-assessment-complete-button"
                onClick={handleAssessmentCompleteButton}
              >
                <span>{assessmentResult.continueLabel ? `Continue to ${assessmentResult.continueLabel}` : 'Continue'}</span>
                <img src={right1} alt="Continue" />
              </button>
            )}

            {assessmentResult.buttonLabel === 'Retry Quiz' && (
              <button
                type="button"
                className="learners-read-assessment-complete-button"
                onClick={handleAssessmentCompleteButton}
              >
                <span>Retry Quiz</span>
                <img src={right1} alt="Retry" />
              </button>
            )}

            {assessmentResult.buttonLabel === 'No attempt left' && (
              <button
                type="button"
                className="learners-read-assessment-complete-button"
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              >
                <span>No attempt left</span>
              </button>
            )}
          </div>

          {claimMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: hasClaimed ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${hasClaimed ? '#A7F3D0' : '#FCA5A5'}`,
              color: hasClaimed ? '#065F46' : '#991B1B',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {claimMessage}
            </div>
          )}
        </section>
      )}
    </section>
  );
};

export default AssessmentView;
