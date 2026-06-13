import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './prepare-course.css';

// Import all the separated steps
import BasicInfo from './prepare/BasicInfo';
import Syllabus from './prepare/Syllabus';
import Curriculum from './prepare/Curriculum';
import Pricing from './prepare/Pricing';
import Review from './prepare/Review';

const PrepareCourse = () => {
  const navigate = useNavigate();
  const feedbackTimerRef = useRef(null);

  // --- Central State ---
  const [activeStep, setActiveStep] = useState('basic');
  const [courseId, setCourseId] = useState(null); 
  const [syllabusId, setSyllabusId] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });

  const pushFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback({ message: '', tone: 'success', visible: false });
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const stepOrder = ['basic', 'syllabus', 'weeks', 'pricing', 'review'];
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
            </div>

            <div className="prof-prepare-steps" aria-label="Steps" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <div className={`prof-prepare-step ${activeStep === 'basic' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('basic')} alt="" />
                <span>1. Course Profile</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'syllabus' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('syllabus')} alt="" />
                <span>2. Public Syllabus</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'weeks' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('weeks')} alt="" />
                <span>3. Curriculum Builder</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'pricing' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('pricing')} alt="" />
                <span>4. Pricing</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'review' ? 'is-active' : ''}`}>
                <img className="prof-prepare-step-icon" src={getStepIcon('review')} alt="" />
                <span>5. Review & Publish</span>
              </div>
            </div>

            <div className="prof-prepare-body" style={{ padding: '32px' }}>
              {activeStep === 'basic' && <BasicInfo {...stepProps} />}
              {activeStep === 'syllabus' && <Syllabus {...stepProps} />}
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