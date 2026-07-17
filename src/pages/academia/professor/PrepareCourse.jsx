import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './prepare-course.css';

// Import all the separated steps
import BasicInfo from './prepare/BasicInfo';
import Curriculum from './prepare/Curriculum';
import Pricing from './prepare/Pricing';
import Review from './prepare/Review';

const PrepareCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const feedbackTimerRef = useRef(null);

  // --- Central State ---
  const [activeStep, setActiveStep] = useState('basic');
  const [courseId, setCourseId] = useState(location.state?.courseId || null);
  const [syllabusId, setSyllabusId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });

  const pushFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback({ message: '', tone: 'success', visible: false });
    }, tone === 'error' ? 8000 : 5000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const stepOrder = ['basic', 'weeks', 'pricing', 'review'];
  const stepNames = {
    basic: 'Basic Information',
    weeks: 'Curriculum Builder',
    pricing: 'Pricing & Payments',
    review: 'Review',
  };

  const exitBuilder = () => {
    navigate(courseId ? '/academia/professor/management' : '/academia/professor');
  };

  // Props passed down to every step
  const stepProps = {
    courseId,
    setCourseId,
    syllabusId,
    setSyllabusId,
    setActiveStep,
    pushFeedback
  };

  const activeStepIndex = stepOrder.indexOf(activeStep);

  return (
      <section className="prof-page">
        <section className="prof-prepare">

          {feedback.visible && (
            <div className={`learners-account-feedback learners-account-feedback-floating is-${feedback.tone}`}>
              {feedback.message}
            </div>
          )}

          <div className={`prof-prepare-card prof-course-ac-form prof-step-${activeStep}`}>
            <div className="prof-prepare-card-head">
              <div className="prof-prepare-card-head-row">
                <h2>{courseId ? 'Edit Course' : 'Prepare Course'}</h2>
                <button type="button" className="learners-btn learners-btn-primary" onClick={exitBuilder} style={{ border: 'none', cursor: 'pointer' }}>
                  <span>Exit Builder</span>
                  <img src="/assets/icons/exit-right.svg" alt="" />
                </button>
              </div>
            </div>

            <div
              className="prof-prepare-steps"
              aria-label="Steps"
              style={{
                '--step-count': stepOrder.length,
                '--step-progress': Math.max(0, activeStepIndex) / Math.max(1, stepOrder.length - 1),
              }}
            >
              {stepOrder.map((step, idx) => {
                const isActive = activeStep === step;
                const isCompleted = activeStepIndex > idx;
                return (
                  <div
                    key={step}
                    className={`prof-prepare-step ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
                    onClick={() => {
                      if (courseId || step === 'basic') {
                        setActiveStep(step);
                      }
                    }}
                  >
                    <div className="prof-step-number-bubble">
                      {isCompleted || isActive ? (
                        <svg className="prof-step-check-svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : null}
                    </div>
                    <span className="prof-step-label">{stepNames[step]}</span>
                  </div>
                );
              })}
            </div>

            <div className="prof-prepare-body">
              {activeStep === 'basic' && <BasicInfo {...stepProps} />}
              {activeStep === 'weeks' && <Curriculum {...stepProps} />}
              {activeStep === 'pricing' && <Pricing {...stepProps} />}
              {activeStep === 'review' && <Review {...stepProps} />}
            </div>
          </div>
        </section>
      </section>
  );
};

export default PrepareCourse;
