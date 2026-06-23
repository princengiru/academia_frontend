import React from 'react';

// Icons & Images
import leTec from '../../../../assets/icons/le-tec.svg';
import leftIcon from '../../../../assets/icons/left.svg';
import doneIcon from '../../../../assets/icons/done.svg';
import right1 from '../../../../assets/icons/right1.svg';

const AssessmentView = ({
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
  loadingAssessment
}) => {
  if (!isAssessmentView) return null;

  if (loadingAssessment) {
    return (
      <section className="learners-read-assessment-view">
        <div className="learners-loading" style={{ padding: '80px 40px', textAlign: 'center', fontSize: '15px', color: '#5B0A86', fontWeight: '500' }}>
          Loading assessment details...
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
            <h3>{currentAssessmentDetails.type === 'formative' ? '📝 Quiz' : '📋 Assessment'}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          </div>
        </div>

        <div className="learners-read-assessment-tracker">
          {assessmentTracker.length === 0 ? (
            <div className="learners-empty">No assessment tracker available.</div>
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
                  }
                }}
              >
                {idx + 1}
              </button>
            ))
          )}
        </div>
      </div>

      {!isAssessmentComplete ? (
        assessmentQuestions.length === 0 ? (
          <div className="learners-card learners-empty-state" style={{ margin: '20px 0', padding: '40px', textAlign: 'center' }}>
            <h3>No assessment questions available</h3>
            <p>There are no questions for this assessment yet.</p>
          </div>
        ) : (
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
                    onClick={handleAssessmentSubmit}
                  >
                    <span>Submit Assessment</span>
                  </button>
                )
              )}
            </div>
          </section>
        )
      ) : (
        <section className="learners-read-assessment-complete">
          {/* Score Display (only if showScoreImmediately is true) */}
          {(currentAssessmentDetails.showScoreImmediately || assessmentResult.status === 'graded') ? (
            <>
              <div className="learners-read-assessment-complete-orb" aria-hidden="true">
                <span>{assessmentResult.score}</span>
              </div>
              <div className="learners-read-assessment-complete-copy">
                <h3>
                  <span aria-hidden="true">🎉</span>
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
            <button 
              type="button" 
              className="learners-read-assessment-complete-button" 
              onClick={handleAssessmentCompleteButton}
              disabled={assessmentResult.buttonLabel === 'Retry Quiz' && !hasAttemptsLeft}
            >
              <span>{assessmentResult.buttonLabel === 'Retry Quiz' && !hasAttemptsLeft ? 'No attempts remaining' : assessmentResult.buttonLabel}</span>
              {(assessmentResult.buttonLabel === 'Retry Quiz' && !hasAttemptsLeft) ? null : <img src={right1} alt="Continue" />}
            </button>
          </div>
        </section>
      )}
    </section>
  );
};

export default AssessmentView;
