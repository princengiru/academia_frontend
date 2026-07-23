import { useNavigate } from 'react-router-dom';
import { Award } from 'lucide-react';

const SEEN_KEY_PREFIX = 'gonaraza-course-complete-seen-';

export function hasSeenCourseCelebration(courseId) {
  if (!courseId) return true;
  try {
    return localStorage.getItem(`${SEEN_KEY_PREFIX}${courseId}`) === '1';
  } catch {
    return false;
  }
}

export function markCourseCelebrationSeen(courseId) {
  if (!courseId) return;
  try {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${courseId}`, '1');
  } catch {
    // ignore
  }
}

function CourseCompleteCelebration({ courseId, courseTitle, onDismiss }) {
  const navigate = useNavigate();

  return (
    <section className="learners-course-complete-celebration" aria-label="Course completed">
      <div className="learners-course-complete-celebration-icon" aria-hidden="true">
        <Award size={28} color="#5B0A86" />
      </div>
      <div className="learners-course-complete-celebration-copy">
        <h3>Course complete!</h3>
        <p>
          You finished <strong>{courseTitle || 'this course'}</strong>. Claim your certificate and showcase your work.
        </p>
      </div>
      <div className="learners-course-complete-celebration-actions">
        <button
          type="button"
          className="learners-btn learners-btn-primary"
          onClick={() => navigate('/learner/certificates')}
        >
          View certificates
        </button>
        <button
          type="button"
          className="learners-btn learners-btn-secondary"
          onClick={() => navigate('/learner/projects')}
        >
          Upload a project
        </button>
        {onDismiss ? (
          <button type="button" className="learners-course-complete-dismiss" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default CourseCompleteCelebration;
