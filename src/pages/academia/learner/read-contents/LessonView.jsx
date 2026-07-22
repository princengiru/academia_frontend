import React from 'react';
import EnrollmentPaymentPicker from '../EnrollmentPaymentPicker';

const LessonView = ({
  activeContent,
  isEnrolled,
  enrollmentLoading = false,
  isEnrolling,
  handleEnrollFromReader,
  navigate,
  inboundId,
  isAssessmentView,
  stripHtml,
  paymentChoices,
  selectedPaymentValue,
  onPaymentChange,
  paymentsLoading,
  courseIsFree,
  requiresPaymentSetup = false,
  accountHref,
  children,
}) => {
  if (isAssessmentView) return null;

  if (enrollmentLoading) {
    return (
      <div className="learners-read-lesson-view">
        <div className="learners-read-skeleton" aria-busy="true" aria-live="polite">
          <span className="visually-hidden">Checking enrollment…</span>
          <div className="lrn-skel lrn-skel-title" style={{ width: '55%' }} />
          <div className="lrn-skel" style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 18 }} />
          <div className="lrn-skel lrn-skel-text" style={{ width: '100%', marginTop: 18 }} />
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="learners-read-lesson-view">
        <h2 className="learners-read-article-title">{stripHtml(activeContent.headline)}</h2>

        <div className="learners-read-article-media-preview-locked">
          <div className="learners-read-article-media blur-locked">
            <img src={activeContent.image} alt={activeContent.headline} />
          </div>

          <div className="learners-read-lock-overlay">
            <div className="learners-read-lock-card">
              <div className="learners-read-lock-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Enroll to unlock this lesson</h3>
              <p>Join the course today to get access to all the lectures, interactive quizzes, student discussions, and earn your digital certificate.</p>
              <EnrollmentPaymentPicker
                choices={paymentChoices}
                value={selectedPaymentValue}
                onChange={onPaymentChange}
                loading={paymentsLoading}
                requiresPaymentSetup={requiresPaymentSetup}
                accountHref={accountHref}
              />
              <div className="learners-read-lock-actions">
                <button
                  type="button"
                  className="learners-btn learners-btn-primary learners-read-lock-enroll-btn"
                  onClick={handleEnrollFromReader}
                  disabled={isEnrolling || paymentsLoading || requiresPaymentSetup}
                >
                  <span>
                    {isEnrolling
                      ? 'Enrolling...'
                      : (courseIsFree ? 'Enroll for free' : 'Join Course Today')}
                  </span>
                </button>
                <button
                  type="button"
                  className="learners-btn learners-btn-secondary"
                  onClick={() => navigate(`/academia/learner/course-part?id=${inboundId}`)}
                >
                  <span>Back to Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learners-read-lesson-view">
      {activeContent.image ? (
        <div className="learners-read-article-media learners-lesson-cover-image">
          <img src={activeContent.image} alt={stripHtml(activeContent.headline)} />
        </div>
      ) : null}

      {children}
    </div>
  );
};

export default LessonView;
