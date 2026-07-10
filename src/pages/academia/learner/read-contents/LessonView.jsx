import React from 'react';

// Icons & Images
import wAcBook from '../../../../assets/icons/w-ac-book.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  let videoId = '';
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  } else if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts[1]) {
      videoId = parts[1].split(/[&#]/)[0];
    }
  } else if (url.includes('youtube.com/v/')) {
    const parts = url.split('youtube.com/v/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const isYoutubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const LessonView = ({
  activeContent,
  isEnrolled,
  isEnrolling,
  handleEnrollFromReader,
  navigate,
  inboundId,
  isAssessmentView,
  setIsWorkspaceOpen,
  stripHtml
}) => {
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
              <div className="learners-read-lock-actions">
                <button
                  type="button"
                  className="learners-btn learners-btn-primary learners-read-lock-enroll-btn"
                  onClick={handleEnrollFromReader}
                  disabled={isEnrolling}
                >
                  <span>{isEnrolling ? 'Enrolling...' : 'Join Course Today'}</span>
                </button>
                <button
                  type="button"
                  className="learners-btn learners-btn-secondary"
                  onClick={() => navigate(`/academia/learner/course-part?id=${inboundId}`, { state: { courseId: inboundId } })}
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

  if (isAssessmentView) return null;

  return (
    <div className="learners-read-lesson-view">
      <h2 className="learners-read-article-title">{stripHtml(activeContent.headline)}</h2>

      {/* cover / thumbnail */}
      {activeContent.image && (
        <div className="learners-read-article-media" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          <img src={activeContent.image} alt={activeContent.headline} style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
        </div>
      )}

      <section className="learners-workspace-launch-section" style={{ marginTop: '30px' }}>
        <div className="learners-workspace-launch-banner">
          <div className="learners-workspace-launch-copy">
            <h3>Interactive Workspace & Quiz</h3>
            <p>Open the interactive book reader workspace to observe past papers, download slides, ask questions, and complete this chapter's exercises.</p>
          </div>
          <button
            type="button"
            className="learners-btn learners-btn-primary learners-workspace-launch-btn"
            onClick={() => setIsWorkspaceOpen(true)}
          >
            <span>Open Workspace</span>
            <img src={wAcBook} alt="Workspace" style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LessonView;
