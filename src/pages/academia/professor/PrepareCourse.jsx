import React, { useState, useRef } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './prepare-course.css';

const PrepareCourse = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Step Navigation State ---
  const [activeStep, setActiveStep] = useState('basic');
  const stepOrder = ['basic', 'lesson', 'pricing', 'review'];

  // Helper to determine step icons based on progress
  const getStepIcon = (stepName) => {
    const currentIndex = stepOrder.indexOf(activeStep);
    const thisIndex = stepOrder.indexOf(stepName);
    return thisIndex <= currentIndex ? '/assets/icons/check-circle.svg' : '/assets/icons/no-check-circle.svg';
  };

  // --- Dropdown States ---
  const [courseCategory, setCourseCategory] = useState('IT Technology and Artificial Intelligence');
  const [educationLevel, setEducationLevel] = useState('Intermediate');
  const [courseTitle, setCourseTitle] = useState('IT Technology and Artificial Intelligence');

  // --- Exercise Section State ---
  const [exerciseMode, setExerciseMode] = useState('checkbox'); // checkbox, radio, optional
  const [answers, setAnswers] = useState([
    { id: 1, text: 'Preparation: Establishing policies, training the incident response team, defining playbooks for various...', status: 'correct' },
    { id: 2, text: 'Identification (Detection & Analysis): Monitoring systems to detect potential breaches, analyzing evid...', status: 'wrong' },
    { id: 3, text: 'Containment: Isolating affected systems to prevent further spread of the attack, which includes shor...', status: 'correct' },
    { id: 4, text: 'Eradication: Removing the root cause of the incident, such as deleting malware, closing vulnerabilit...', status: 'correct' },
    { id: 5, text: 'Lessons Learned (Post-Incident Activity): Conducting a review to analyze the cause, evaluating the e...', status: 'wrong' }
  ]);

  // Answer Action Handlers
  const handleAnswerStatus = (id, newStatus) => {
    setAnswers(answers.map(ans => ans.id === id ? { ...ans, status: ans.status === newStatus ? null : newStatus } : ans));
  };

  const handleUpdateAnswer = (id) => {
    const targetAnswer = answers.find(ans => ans.id === id);
    const newText = window.prompt('Edit answer', targetAnswer.text);
    if (newText !== null && newText.trim() !== '') {
      setAnswers(answers.map(ans => ans.id === id ? { ...ans, text: newText } : ans));
    }
  };

  const handleAddAnswer = () => {
    const newId = answers.length > 0 ? Math.max(...answers.map(a => a.id)) + 1 : 1;
    setAnswers([...answers, { id: newId, text: 'New answer...', status: null }]);
  };

  // --- Image Attach Simulation ---
  const descriptionRef = useRef(null);
  const handleAttachImage = (e) => {
    e.preventDefault();
    if (descriptionRef.current) {
      // In React, textareas can only hold strings, so we simulate an image drop with text placeholders.
      // If you implement a real rich text editor later (like Quill or Draft.js), this logic will be replaced.
      const start = descriptionRef.current.selectionStart;
      const end = descriptionRef.current.selectionEnd;
      const text = descriptionRef.current.value;
      const injection = '\n[Attached Image: file.png]\n';
      descriptionRef.current.value = text.substring(0, start) + injection + text.substring(end);
      descriptionRef.current.focus();
    }
  };

  // Reusable SVG Toolbar Component
  const RichTextToolbar = () => (
    <div className="prof-toolbar" aria-hidden="true">
      <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bold"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
      <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Italic"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
      <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Underline"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
      <span className="prof-toolbar-sep"></span>
      <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bulleted List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="6" r="1.5"/><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
      <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Numbered List"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7.5" fontSize="6" fill="#64748B">1.</text><line x1="7" y1="6" x2="13" y2="6"/></svg></button>
    </div>
  );

  return (
    <ProfessorLayout currentPage="prepare-course">
      <section className="prof-page">
        <section className="prof-prepare">
          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>Prepare Online Course</h1>
              <div className="learners-home-title-actions">
                <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                  <img src="/assets/icons/van.svg" alt="" />
                  <span>View Analytics</span>
                </a>
                <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                  <span>Go to website</span>
                  <img src="/assets/icons/exit-right.svg" alt="" />
                </a>
              </div>
            </div>
          </section>

          <div className="prof-prepare-stats" role="group" aria-label="Course overview metrics">
            <div className="prof-prepare-stat">
              <h4>2</h4>
              <p>Total Courses</p>
            </div>
            <div className="prof-prepare-stat">
              <h4>13</h4>
              <p>Total Syllabus</p>
            </div>
            <div className="prof-prepare-stat">
              <h4>16</h4>
              <p>Published <span className="is-positive">1 +4.1</span></p>
            </div>
            <div className="prof-prepare-stat">
              <h4>65.2</h4>
              <p>Average Score</p>
            </div>
            <div className="prof-prepare-stat">
              <h4>4.5</h4>
              <p>Average Rating</p>
            </div>
          </div>

          <form className={`prof-prepare-card prof-step-${activeStep}`} onSubmit={preventDefault}>
            <div className="prof-prepare-card-head">
              <h2>Prepare Online Course</h2>
            </div>

            {/* --- Step Header Navigation --- */}
            <div className="prof-prepare-steps" aria-label="Steps">
              <div className={`prof-prepare-step ${activeStep === 'basic' ? 'is-active' : ''}`} onClick={() => setActiveStep('basic')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('basic')} alt="" aria-hidden="true" />
                <span>Basic Information</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'lesson' ? 'is-active' : ''}`} onClick={() => setActiveStep('lesson')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('lesson')} alt="" aria-hidden="true" />
                <span>Lesson Preparation</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'pricing' ? 'is-active' : ''}`} onClick={() => setActiveStep('pricing')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('pricing')} alt="" aria-hidden="true" />
                <span>Pricing &amp; Payments</span>
              </div>
              <div className={`prof-prepare-step ${activeStep === 'review' ? 'is-active' : ''}`} onClick={() => setActiveStep('review')}>
                <img className="prof-prepare-step-icon" src={getStepIcon('review')} alt="" aria-hidden="true" />
                <span>Review</span>
              </div>
            </div>

            <div className="prof-prepare-body">
              
              {/* --- STEP 1: BASIC INFORMATION --- */}
              <div className={`prof-step-pane ${activeStep === 'basic' ? 'is-active' : ''}`}>
                <div className="prof-field-group">
                  <label htmlFor="courseCategory">Course Category</label>
                  <div className="dropdown prof-generic-dropdown">
                    <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="prof-dropdown-value">{courseCategory}</span>
                      <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </button>
                    <ul className="dropdown-menu prof-dropdown-menu">
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseCategory('IT Technology and Artificial Intelligence')}>IT Technology and Artificial Intelligence</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseCategory('Cybersecurity and Risk Management')}>Cybersecurity and Risk Management</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseCategory('Software Engineering')}>Software Engineering</button></li>
                    </ul>
                  </div>
                </div>

                <div className="prof-grid-two prof-basic-grid">
                  <div className="prof-field-group">
                    <label htmlFor="durationWeeks">Duration (Weeks)</label>
                    <input id="durationWeeks" className="learners-settings-field-control prof-step-input" type="number" defaultValue="4" min="1" step="1" />
                  </div>
                  <div className="prof-field-group">
                    <label htmlFor="requiredHours">Required Hours Per week</label>
                    <input id="requiredHours" className="learners-settings-field-control prof-step-input" type="number" defaultValue="60" min="1" step="1" />
                  </div>
                </div>

                <div className="prof-grid-two prof-basic-grid">
                  <div className="prof-field-group">
                    <label htmlFor="subscriptionPrice">Subscription</label>
                    <div className="prof-subscription-wrap">
                      <select className="learners-settings-field-control prof-step-input prof-currency-select" aria-label="Currency" defaultValue="USD">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input id="subscriptionPrice" className="learners-settings-field-control prof-step-input" type="text" defaultValue="3.5 USD" />
                    </div>
                  </div>
                  <div className="prof-field-group">
                    <label htmlFor="educationLevel">Education Level</label>
                    <div className="dropdown prof-generic-dropdown">
                      <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span className="prof-dropdown-value">{educationLevel}</span>
                        <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                      </button>
                      <ul className="dropdown-menu prof-dropdown-menu">
                        <li><button className="dropdown-item" type="button" onClick={() => setEducationLevel('Beginner')}>Beginner</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => setEducationLevel('Intermediate')}>Intermediate</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => setEducationLevel('Advanced')}>Advanced</button></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="whoCourseFor">Who is this course for?</label>
                  <RichTextToolbar />
                  <textarea id="whoCourseFor" className="learners-settings-textarea" rows="2" placeholder="Type a question..."></textarea>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="courseGoal">What to be achieved in this course?</label>
                  <RichTextToolbar />
                  <textarea id="courseGoal" className="learners-settings-textarea" rows="4" defaultValue="• Describe the fundamentals of a cybersecurity major incident response process.&#10;• Explain key industry frameworks (NIST and SANS).&#10;• Develop your own cybersecurity major incident response plan.&#10;• Test, measure, and improve your cybersecurity major incident management process."></textarea>
                </div>

                <div className="prof-lesson-actions-row">
                  <button type="button" className="btn btn-primary" onClick={() => setActiveStep('lesson')}>Start course preparation</button>
                </div>
              </div>


              {/* --- STEP 2: LESSON PREPARATION --- */}
              <div className={`prof-step-pane ${activeStep === 'lesson' ? 'is-active' : ''}`}>
                <div className="prof-lesson-nav-row">
                  <button type="button" className="prof-lesson-nav-back" aria-label="Back to previous week" onClick={() => setActiveStep('basic')}>
                    <img src="/assets/icons/left.svg" alt="Back" style={{ width: '22px', height: '22px' }} />
                  </button>
                  <span className="prof-lesson-nav-title">Week 1</span>
                  <button type="button" className="prof-lesson-nav-add">
                    <img src="/assets/icons/plus.svg" alt="Add" style={{ width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} />
                    Add new week
                  </button>
                </div>

                <div className="prof-field-group">
                  <label>Chapter Thumbnail</label>
                  <div className="prof-upload-dropzone" style={{ border: '2px dashed #450468', background: '#45046808' }}>
                    <span className="prof-upload-icon"><img src="/assets/icons/file.svg" alt="Upload" /></span>
                    <span className="prof-upload-text">Drop files here or click to upload.<br /><small>Upload case files, if any.</small></span>
                  </div>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="courseTitle">Course Title</label>
                  <div className="dropdown prof-generic-dropdown">
                    <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className="prof-dropdown-value">{courseTitle}</span>
                      <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" aria-hidden="true" />
                    </button>
                    <ul className="dropdown-menu prof-dropdown-menu">
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseTitle('IT Technology and Artificial Intelligence')}>IT Technology and Artificial Intelligence</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseTitle('Cybersecurity and Risk Management')}>Cybersecurity and Risk Management</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => setCourseTitle('Software Engineering')}>Software Engineering</button></li>
                    </ul>
                  </div>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="courseSubtitle">Course Subtitle</label>
                  <RichTextToolbar />
                  <textarea id="courseSubtitle" className="learners-settings-textarea" rows="2" placeholder="Type a question..."></textarea>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="introRules">Introduction Message / Rules</label>
                  <RichTextToolbar />
                  <textarea id="introRules" className="learners-settings-textarea" rows="2" placeholder="Type something..."></textarea>
                </div>

                <div className="prof-field-group">
                  <label htmlFor="description">Description</label>
                  <div className="prof-toolbar" aria-hidden="true">
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bold"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Italic"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Underline"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
                    <span className="prof-toolbar-sep"></span>
                    <button type="button" className="prof-description-attach-btn" onClick={handleAttachImage}>
                       <svg width="16" height="16" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                       Attach File
                    </button>
                  </div>
                  <textarea id="description" ref={descriptionRef} className="learners-settings-textarea prof-description-textarea" rows="4" placeholder="Type description..."></textarea>
                </div>

                <div className="prof-field-group">
                  <div className="prof-exercise-head">
                    <label htmlFor="exercise">Exercise</label>
                    <div className="prof-ex-controls-top">
                      <div className="prof-ex-mode">
                        <label className={`prof-ex-mode-btn ${exerciseMode === 'checkbox' ? 'is-active' : ''}`}>
                          <input className="prof-ex-mode-radio" type="radio" name="prof-ex-mode" value="checkbox" checked={exerciseMode === 'checkbox'} onChange={() => setExerciseMode('checkbox')} />
                          <span>Checkbox</span>
                        </label>
                        <label className={`prof-ex-mode-btn ${exerciseMode === 'radio' ? 'is-active' : ''}`}>
                          <input className="prof-ex-mode-radio" type="radio" name="prof-ex-mode" value="radio" checked={exerciseMode === 'radio'} onChange={() => setExerciseMode('radio')} />
                          <span>Radio Choose</span>
                        </label>
                        <label className={`prof-ex-mode-btn ${exerciseMode === 'optional' ? 'is-active' : ''}`}>
                          <input className="prof-ex-mode-radio" type="radio" name="prof-ex-mode" value="optional" checked={exerciseMode === 'optional'} onChange={() => setExerciseMode('optional')} />
                          <span>Optional Reply</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prof-toolbar" aria-hidden="true">
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Bold"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Italic"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
                    <button type="button" className="prof-toolbar-btn" tabIndex="-1" aria-label="Underline"><svg width="16" height="16" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
                    <div style={{ flex: '1 1 auto' }}></div>
                    <button type="button" className="prof-ex-add-answer" onClick={handleAddAnswer}>
                      <img src="/assets/icons/plus1.svg" alt="" aria-hidden="true" /><span>Add an answer</span>
                    </button>
                  </div>
                  <textarea id="exercise" className="learners-settings-textarea" rows="2" placeholder="Type a question..."></textarea>

                  {/* Answers Map */}
                  <ul className={`prof-exercise-answers mode-${exerciseMode}`}>
                    {answers.map((ans, idx) => (
                      <li key={ans.id} className={`${ans.status === 'correct' ? 'is-correct' : ''} ${ans.status === 'wrong' ? 'is-wrong' : ''}`}>
                        {exerciseMode !== 'optional' && (
                          <input 
                            type={exerciseMode === 'radio' ? 'radio' : 'checkbox'} 
                            name={exerciseMode === 'radio' ? 'prof-ex-answer' : `prof-ex-answer-${idx}`} 
                            className="prof-ex-input" 
                          />
                        )}
                        <span>{ans.text}</span>
                        <span className="prof-ex-answer-actions">
                          <button type="button" aria-label="Correct" onClick={() => handleAnswerStatus(ans.id, 'correct')}><img src="/assets/icons/as2.svg" alt="Correct" /></button>
                          <button type="button" aria-label="Wrong" onClick={() => handleAnswerStatus(ans.id, 'wrong')}><img src="/assets/icons/as4.svg" alt="Wrong" /></button>
                          <button type="button" aria-label="Update" onClick={() => handleUpdateAnswer(ans.id)}><img src="/assets/icons/b-pencil.svg" alt="Update" /></button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="prof-lesson-actions-row">
                  <button type="button" className="btn btn-outline-secondary">Save Draft</button>
                  <button type="button" className="btn btn-outline-primary">Add Chapter</button>
                  <button type="button" className="btn btn-primary" onClick={() => setActiveStep('pricing')}>Done</button>
                </div>

              </div>

            </div>
          </form>
        </section>
      </section>
    </ProfessorLayout>
  );
};

export default PrepareCourse;