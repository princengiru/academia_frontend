import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Review = ({ courseId, setActiveStep, pushFeedback }) => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [courseData, setCourseData] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const loadSummary = async () => {
      const token = localStorage.getItem('token');
      try {
        // 1. Fetch Course Data from DB to guarantee accuracy
        const courseRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const courseJson = await courseRes.json();
        const course = courseJson.data || courseJson;
        setCourseData(course);
        setChapters(course.chapters || []);
      } catch (error) {
        console.error(error);
        pushFeedback("Could not load full course summary from database.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [courseId, pushFeedback]);

  const publishCourse = async () => {
    if (!courseId) return pushFeedback('Course ID missing.', 'error');

    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/publish`, {
        method: 'PUT', 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to publish course.');
      
      navigate('/academia/professor', { state: { toastMessage: 'Course successfully published!', toastTone: 'success' } });
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
      setIsPublishing(false);
    } 
  };

  if (isLoading) {
    return (
      <div className="prof-step-pane is-active prof-review-loading-pane">
        <div className="prof-review-spinner"></div>
        <p>Loading final course summary from the database...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="prof-step-pane is-active prof-review-empty-pane">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>No course data found in the database. Please go back to Step 1.</p>
        <button type="button" className="prof-btn-back-premium" onClick={() => setActiveStep('basic')}>
          &larr; Go to Step 1
        </button>
      </div>
    );
  }

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      <div className="prof-review-container">
        
        {/* Course Card Preview Mockup */}
        <div className="prof-review-card-mockup">
          <div className="prof-review-card-header">
            <div className="prof-review-header-details">
              <h3>{courseData.title || 'Untitled Course'}</h3>
              <span className="prof-review-status-badge">Ready to Publish</span>
            </div>
            <div className="prof-review-header-pricing">
              <strong className="prof-review-price-value">
                {Number(courseData.price) === 0 ? 'FREE' : `${courseData.price} ${courseData.currency || 'USD'}`}
              </strong>
              <span className="prof-review-meta-tag">
                {courseData.category || 'Category'} &bull; {courseData.education_level || 'Level'}
              </span>
            </div>
          </div>
          
          <div className="prof-review-metrics-grid">
            <div className="prof-review-metric-item">
              <strong className="prof-review-metric-label">Duration</strong>
              <span className="prof-review-metric-val">{courseData.duration_weeks} Weeks</span>
            </div>
            <div className="prof-review-metric-item">
              <strong className="prof-review-metric-label">Commitment</strong>
              <span className="prof-review-metric-val">{courseData.required_hours_per_week} Hours / Week</span>
            </div>
          </div>



          <h4 className="prof-review-section-title">
            Curriculum Snapshot <span>({chapters.length} Chapters)</span>
          </h4>
          <ul className="prof-review-list">
            {chapters.length > 0 ? (
              chapters.slice(0, 3).map((chap, i) => (
                <li key={i}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Week {chap.week_number}: {chap.title}</span>
                </li>
              ))
            ) : (
              <li className="is-empty-item">No chapters found in curriculum database.</li>
            )}
            {chapters.length > 3 && (
              <li className="prof-review-list-more">
                ...and {chapters.length - 3} more chapters in syllabus.
              </li>
            )}
          </ul>

          <div className="prof-review-notice-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="9" x2="12.01" y2="9"/>
            </svg>
            <p>
              Once published, students will immediately be able to view and enroll in this course. You can still append new weeks or edit chapters later through your professor dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="prof-actions-footer-premium">
        <button type="button" className="prof-btn-back-premium" onClick={() => setActiveStep('pricing')}>
          Go Back
        </button>
        <button type="button" className="prof-btn-launch-premium" onClick={publishCourse} disabled={isPublishing}>
          {isPublishing ? 'Launching Course...' : 'Launch Course Now!'}
        </button>
      </div>
    </div>
  );
};

export default Review;