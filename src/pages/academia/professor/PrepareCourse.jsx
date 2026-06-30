import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
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
  const getStepIcon = (stepName) => {
    const currentIndex = stepOrder.indexOf(activeStep);
    const thisIndex = stepOrder.indexOf(stepName);
    return thisIndex <= currentIndex ? '/assets/icons/check-circle.svg' : '/assets/icons/no-check-circle.svg';
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

  return (
    <ProfessorLayout currentPage="prepare-course">
      <section className="prof-page">
        <section className="prof-prepare">
          
          {feedback.visible && (
            <div className={`learners-account-feedback learners-account-feedback-floating is-${feedback.tone}`}>
              {feedback.message}
            </div>
          )}

          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>Prepare Online Course</h1>
              <div className="learners-home-title-actions">
                <a className="learners-btn learners-btn-primary" href="/academia" onClick={(e) => { e.preventDefault(); navigate('/academia'); }}>
                  <span>Exit Builder</span>
                  <img src="/assets/icons/exit-right.svg" alt="" />
                </a>
              </div>
            </div>
          </section>

          <div className={`prof-prepare-card prof-step-${activeStep}`}>
            <div className="prof-prepare-card-head">
              <h2>Course Builder Workspace</h2>
              <span className="prof-prepare-card-subtitle">Complete all steps to launch your new program.</span>
            </div>

            <div className="prof-prepare-steps" aria-label="Steps">
              {stepOrder.map((step, idx) => {
                const isActive = activeStep === step;
                const isCompleted = stepOrder.indexOf(activeStep) > stepOrder.indexOf(step);
                const stepNames = {
                  basic: 'Course Profile',
                  weeks: 'Curriculum Builder',
                  pricing: 'Pricing',
                  review: 'Review & Publish'
                };
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
                      {isCompleted ? (
                        <svg className="prof-step-check-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : idx + 1}
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
    </ProfessorLayout>
  );
};

export default PrepareCourse;