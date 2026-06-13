import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Review = ({ courseId, setActiveStep, pushFeedback }) => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [courseData, setCourseData] = useState(null);
  const [syllabusOutlines, setSyllabusOutlines] = useState([]);
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

        // 2. Fetch Syllabus Outlines from DB (linked via course.syllabus_id or course_id on syllabus)
        let sId = course.syllabus_id || course.syllabus?.id;
        let sylJson = null;

        if (sId) {
          const sylRes = await fetch(`${API_BASE_URL}/api/syllabuses/${sId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          sylJson = await sylRes.json();
        } else {
          const linkedRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/syllabus`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (linkedRes.ok) {
            sylJson = await linkedRes.json();
          }
        }

        setSyllabusOutlines(sylJson?.data?.outlines || sylJson?.outlines || []);
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
      
      pushFeedback('Course successfully published!', 'success');
      navigate('/academia/professor');
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
      setIsPublishing(false);
    } 
  };

  if (isLoading) {
    return (
      <div className="prof-step-pane is-active">
        <p style={{ color: '#64748B' }}>Loading final course summary from the database...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="prof-step-pane is-active">
        <p style={{ color: '#EF4444', marginBottom: '1rem' }}>No course data found in the database. Please go back to Step 1.</p>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('basic')} style={{ padding: '8px 16px', borderRadius: '6px' }}>
          &larr; Go to Step 1
        </button>
      </div>
    );
  }

  return (
    <div className="prof-step-pane is-active">
      <div style={{ background: '#F8FAFC', padding: '2rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ marginTop: 0, color: '#0F172A', marginBottom: '8px', fontSize: '1.5rem' }}>
              {courseData.title || 'Untitled Course'}
            </h3>
            <span style={{ display: 'inline-block', background: '#E0E7FF', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              Ready to Publish
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ display: 'block', fontSize: '1.5rem', color: '#450468' }}>
              {Number(courseData.price) === 0 ? 'FREE' : `${courseData.price} ${courseData.currency || 'USD'}`}
            </strong>
            <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
              {courseData.category || 'Category'} ({courseData.education_level || 'Level'})
            </span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Duration
            </strong>
            <span style={{ color: '#0F172A', fontWeight: 500 }}>{courseData.duration_weeks} Weeks</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commitment
            </strong>
            <span style={{ color: '#0F172A', fontWeight: 500 }}>{courseData.required_hours_per_week} Hours / Week</span>
          </div>
        </div>

        <h4 style={{ margin: '0 0 1rem 0', color: '#0F172A', borderBottom: '2px solid #E2E8F0', paddingBottom: '8px' }}>
          Syllabus Overview ({syllabusOutlines.length} Topics)
        </h4>
        <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.2rem', color: '#475569' }}>
          {syllabusOutlines.length > 0 ? (
            syllabusOutlines.map((o, i) => <li key={i} style={{ marginBottom: '8px' }}>{o.title}</li>)
          ) : (
            <li>No public topics found in database.</li>
          )}
        </ul>

        <h4 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>
          Curriculum Snapshot ({chapters.length} Chapters)
        </h4>
        <ul style={{ margin: '0 0 1.5rem 0', paddingLeft: '1.2rem', color: '#475569' }}>
          {chapters.length > 0 ? (
            chapters.slice(0, 3).map((chap, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>
                Week {chap.week_number}: {chap.title}
              </li>
            ))
          ) : (
            <li>No chapters found in database.</li>
          )}
          {chapters.length > 3 && <li style={{ fontStyle: 'italic' }}>...and {chapters.length - 3} more chapters.</li>}
        </ul>

        <div style={{ padding: '16px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', color: '#92400E', fontSize: '0.9rem' }}>
          <strong>Note:</strong> Once published, students will immediately be able to enroll in this course. You can still add more chapters and weeks later through your dashboard.
        </div>
      </div>

      <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveStep('pricing')} style={{ flex: 1, padding: '14px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Go Back
        </button>
        <button type="button" className="btn btn-primary" onClick={publishCourse} disabled={isPublishing} style={{ flex: 3, background: '#22C55E', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }}>
          {isPublishing ? 'Publishing to Database...' : 'Launch Course!'}
        </button>
      </div>
    </div>
  );
};

export default Review;