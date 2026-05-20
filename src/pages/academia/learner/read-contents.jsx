import React, { useState, useEffect } from 'react';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import profImg from '../../../assets/imgs/prof.jpg';
import accMinus from '../../../assets/icons/acc-minus.svg';
import checkCircle from '../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../assets/icons/no-check-circle.svg';
import acCl from '../../../assets/icons/ac-cl.svg';
import acOp from '../../../assets/icons/ac-op.svg';
import right1 from '../../../assets/icons/right1.svg';
import bars from '../../../assets/icons/bars.svg';
import wAcBook from '../../../assets/icons/w-ac-book.svg';
import leTec from '../../../assets/icons/le-tec.svg';
import leftIcon from '../../../assets/icons/left.svg';
import doneIcon from '../../../assets/icons/done.svg';
import dtiktok from '../../../assets/icons/dtiktok.svg';
import dwhat from '../../../assets/icons/dwhat.svg';
import dfaceb from '../../../assets/icons/dfaceb.svg';
import dinstagram from '../../../assets/icons/dinstagram.svg';
import acSms from '../../../assets/icons/ac-sms.svg';
import acSend from '../../../assets/icons/ac-send.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import './read-contents.css';

const apexCourseMeta = {
  title: 'Cyber Security',
  author: 'Emmanuella Jean Marie Vianney',
  authorImage: profImg,
  authorRole: 'Author',
  publishedOn: '12 Jan 2029',
  headline: 'Core Principles of Cybersecurity, Leadership and Oversight',
  summary: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making.',
  image: acOnImg,
  duration: '4 weeks',
  weekly: '4 hours',
  level: 'Intermediate',
  price: '$5 Per month',
  discount: '-4% Off',
  intro: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings...',
  audience: 'This course is ideal for cyber security engineers, service desk analysts, IT managers, and service desk managers looking to improve incident response skills, implement frameworks, and create practical CIRPs.',
};

const slateCourseReader = {
  title: 'Cyber Security',
  author: 'Emmanuella Jean Marie Vianney',
  score: '0.0%',
};

const genesisOutcomes = [
  'Describe the fundamentals of a cybersecurity major incident response process.',
  'Explain key industry frameworks (NIST and SANS).',
  'Develop your own cybersecurity major incident response plan.',
  'Test, measure, and improve your cybersecurity major incident management process.',
  'A certificate of achievement in cyber 100% legit',
];

const slateExerciseQuestions = [
  {
    id: 'exercise-q1',
    number: 1,
    type: 'single',
    prompt: 'Describe the fundamentals of a cybersecurity major incident response process.',
    options: [
      'Preparation: Establishing policies, training the incident response team, defining playbooks for various scenarios, and implementing security tools (e.g., SIEM, backups).',
      'Identification (Detection & Analysis): Monitoring systems to detect potential breaches, analyzing evidence, determining the scope and severity, and initiating the incident response plan.',
      'Containment: Isolating affected systems to prevent further spread of the attack, which includes short-term containment (e.g., disconnecting infected machines) and long-term containment.',
      'Eradication: Removing the root cause of the incident, such as deleting malware, closing vulnerabilities, and removing compromised accounts from the network.',
      'All above',
    ],
    correctAnswers: [4],
  },
];

const genesisAssessmentTracker = [
  'wrong', 'correct', 'correct', 'correct', 'wrong', 'correct', 'correct', 'wrong', 'wrong', 'correct', 'correct', 'correct',
  'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'wrong', 'correct', 'correct', 'correct',
];

const slateAssessmentQuestions = [
  {
    id: 'assessment-q1',
    number: 1,
    progressText: '8/26',
    type: 'single',
    prompt: 'Describe the fundamentals of a cybersecurity major incident response process.',
    options: [
      'Preparation: Establishing policies, training the incident response team, defining playbooks for various scenarios, and implementing security tools (e.g., SIEM, backups).',
      'Identification (Detection & Analysis): Monitoring systems to detect potential breaches, analyzing evidence, determining the scope and severity, and initiating the incident response plan.',
      'Containment: Isolating affected systems to prevent further spread of the attack, which includes short-term containment (e.g., disconnecting infected machines) and long-term containment.',
      'Eradication: Removing the root cause of the incident, such as deleting malware, closing vulnerabilities, and removing compromised accounts from the network.',
      'All above',
    ],
    correctAnswers: [2],
  },
  {
    id: 'assessment-q2',
    number: 2,
    progressText: '26/26',
    type: 'multi',
    prompt: 'Describe the fundamentals of a cybersecurity major incident response process.',
    image: acOnImg,
    options: [
      'Preparation: Establishing policies, training the incident response team, defining playbooks for various scenarios, and implementing security tools (e.g., SIEM, backups).',
      'Identification (Detection & Analysis): Monitoring systems to detect potential breaches, analyzing evidence, determining the scope and severity, and initiating the incident response plan.',
      'Containment: Isolating affected systems to prevent further spread of the attack, which includes short-term containment (e.g., disconnecting infected machines) and long-term containment.',
      'Eradication: Removing the root cause of the incident, such as deleting malware, closing vulnerabilities, and removing compromised accounts from the network.',
      'Lessons Learned (Post-Incident Activity): Conducting a review to analyze the cause, evaluating the effectiveness of the response, and updating the plan to strengthen future security postures.',
    ],
    correctAnswers: [0, 2, 3],
  },
];

const apexAssessmentResult = {
  score: '89.8%',
  headline: 'Congratulations John Doe,',
  summary: 'Week 1 done, Ready to lock in ultimately on other weeks',
  buttonLabel: 'Continue WEEK 2',
  stats: [
    { value: '26', label: 'Questions' },
    { value: '21', label: 'Correct answer' },
    { value: '5', label: 'Wrong Answer' },
    { value: '1h 7min', label: 'Time' },
    { value: 'Passed', label: 'Status', tone: 'success' },
  ],
};

const slateOutlineWeeks = [
  {
    id: 'week-1',
    title: 'Week 1',
    completed: false,
    expanded: true,
    chapters: [
      { id: 'chapter-1', title: 'Chapter 1', completed: true },
      { id: 'chapter-2', title: 'Chapter 2', completed: true },
      { id: 'chapter-3', title: 'Chapter 3', completed: false },
      { id: 'chapter-4', title: 'Chapter 4', completed: false },
      { id: 'chapter-5', title: 'Chapter 5', completed: false },
      { id: 'chapter-6', title: 'Chapter 6', completed: false },
      { id: 'assessment', title: 'Assessment', completed: false },
    ],
  },
  { id: 'week-2', title: 'Week 2', completed: false, expanded: false, chapters: [] },
  { id: 'week-3', title: 'Week 3', completed: false, expanded: false, chapters: [] },
  { id: 'week-4', title: 'Week 4', completed: false, expanded: false, chapters: [] },
];

const apexChapterContent = {
  'chapter-1': {
    weekLabel: 'Week 1',
    chapterLabel: 'Chapter 1 : Milestone to achieve Basic understanding and breakdowns',
    progressLabel: 'Viewed : 0%',
    headline: 'Core Principles of Cybersecurity, Leadership and Oversight',
    summary: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making.',
    image: acOnImg,
    introTitle: 'Introduction',
    introBody: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings...',
    introLinkLabel: 'Read more',
    audienceTitle: 'Who is the course for?',
    audienceBody: 'This course is ideal for cyber security engineers, service desk analysts, IT managers, and service desk managers looking to improve incident response skills, implement frameworks, and create practical CIRPs.',
  },
  'chapter-2': {
    weekLabel: 'Week 1',
    chapterLabel: 'Chapter 2 : Core incident management principles',
    progressLabel: 'Viewed : 18%',
    headline: 'Incident Management Foundations and Operating Principles',
    summary: 'This chapter explains the core operating principles used to identify, classify, and route incidents quickly across a security team.',
    image: acOnImg,
    introTitle: 'Introduction',
    introBody: 'You will review severity levels, response ownership, and the difference between normal support operations and major incident handling.',
    introLinkLabel: 'Read more',
    audienceTitle: 'Who is the course for?',
    audienceBody: 'This chapter is useful for service desk teams, security engineers, operations leads, and managers responsible for response workflows.',
  },
  'assessment': {
    weekLabel: 'Week 1',
    chapterLabel: 'Assessment : Core Principles of Cybersecurity, Leadership and Oversight',
    progressLabel: 'Viewed : 23.45%',
    headline: 'Week 1 Assessment',
    summary: 'Complete the checkpoint to verify your understanding of week one before moving into the next section.',
    image: acOnImg,
    introTitle: 'Introduction',
    introBody: 'The assessment combines short scenario reasoning with core concept questions drawn from the first six chapters.',
    introLinkLabel: 'Read more',
    audienceTitle: 'Who is the course for?',
    audienceBody: 'This checkpoint is for learners finishing the first week and preparing to move into the next section.',
  },
};

function LearnersReadContents() {
  const preventDefault = (e) => e.preventDefault();

  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({ 'week-1': true });
  const [activeChapterId, setActiveChapterId] = useState('chapter-1');

  // Exercise State
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseStates, setExerciseStates] = useState(slateExerciseQuestions.map(() => 'pending'));
  const [selectedExerciseOption, setSelectedExerciseOption] = useState(null);
  const [isExerciseGraded, setIsExerciseGraded] = useState(false);

  // Assessment State
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [selectedAssessmentOptions, setSelectedAssessmentOptions] = useState([]);
  const [isAssessmentGraded, setIsAssessmentGraded] = useState(false);
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false);

  // Dynamic Content Loading based on Active Chapter
  // Fallback to chapter-1 if content is undefined in our mock dict
  const activeContent = apexChapterContent[activeChapterId] || apexChapterContent['chapter-1'];
  const isAssessmentView = activeChapterId === 'assessment';

  const toggleWeek = (weekId) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const handleChapterSelect = (chapterId) => {
    setActiveChapterId(chapterId);
    if (window.innerWidth <= 991) setIsSidebarOpen(false);
    
    // Reset States
    if (chapterId === 'assessment') {
      setCurrentAssessmentIndex(0);
      setSelectedAssessmentOptions([]);
      setIsAssessmentGraded(false);
      setIsAssessmentComplete(false);
    } else {
      setCurrentExerciseIndex(0);
      setSelectedExerciseOption(null);
      setIsExerciseGraded(false);
      setExerciseStates(slateExerciseQuestions.map(() => 'pending'));
    }
  };

  // Exercise Logic
  const handleExerciseOptionSelect = (idx) => {
    if (isExerciseGraded) return;
    setSelectedExerciseOption(idx);
  };

  const handleExerciseAction = () => {
    const question = slateExerciseQuestions[currentExerciseIndex];
    if (!isExerciseGraded) {
      if (selectedExerciseOption === null) return;
      const isCorrect = question.correctAnswers.includes(selectedExerciseOption);
      const newStates = [...exerciseStates];
      newStates[currentExerciseIndex] = isCorrect ? 'correct' : 'wrong';
      setExerciseStates(newStates);
      setIsExerciseGraded(true);
    } else {
      if (currentExerciseIndex < slateExerciseQuestions.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setSelectedExerciseOption(null);
        setIsExerciseGraded(false);
      }
    }
  };

  // Assessment Logic
  const handleAssessmentOptionSelect = (idx, type) => {
    if (isAssessmentGraded) return;
    if (type === 'single') {
      setSelectedAssessmentOptions([idx]);
    } else {
      setSelectedAssessmentOptions((prev) => 
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    }
  };

  const handleAssessmentAction = () => {
    const question = slateAssessmentQuestions[currentAssessmentIndex];
    if (!isAssessmentGraded) {
      if (selectedAssessmentOptions.length === 0) return;
      setIsAssessmentGraded(true);
    } else {
      if (currentAssessmentIndex < slateAssessmentQuestions.length - 1) {
        setCurrentAssessmentIndex((prev) => prev + 1);
        setSelectedAssessmentOptions([]);
        setIsAssessmentGraded(false);
      } else {
        setIsAssessmentComplete(true);
      }
    }
  };

  return (
    <LearnersPageShell title="Read Contents" description="Learners content reading layout scaffold.">
      <section className="learners-read-contents-page">
        <section className="learners-home-title">
        <div className="learners-home-title-top">
          <h1>Courses</h1>
          <div className="learners-home-title-actions">
            <a className="learners-btn learners-btn-secondary" href="/" onClick={preventDefault}>
              <img src={acSav} alt="Save" />
              <span>Saved Library</span>
            </a>
            <a className="learners-btn learners-btn-primary" href="/" onClick={preventDefault}>
              <span>Go to website</span>
              <img src={wExitRight} alt="Exit" />
            </a>
          </div>
        </div>
        </section>

        <div className="filters-grid-b-h">
        <button type="button" onClick={preventDefault}>
          <img src={acLe} alt="Left" />
        </button>
        <div>
          <p>Mathematics & Science</p>
          <span>/</span>
          <span>Algebra</span>
          <span>/</span>
        </div>
        </div>

        <div className={`learners-read-contents-shell ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
          <aside className="learners-read-contents-sidebar" aria-label="Course contents">
            <div className="learners-read-contents-sidebar-card">
              <div className="learners-read-contents-sidebar-head">
                <div>
                  <h1>{slateCourseReader.title}</h1>
                  <p>Prepared by <strong>{slateCourseReader.author}</strong></p>
                </div>
                <button 
                  type="button" 
                  className="learners-read-contents-close" 
                  onClick={() => setIsSidebarOpen(false)}
                  aria-expanded={isSidebarOpen} 
                  aria-label="Close contents sidebar"
                >
                  <img src={accMinus} alt="Close" />
                </button>
              </div>

              <div className="learners-read-contents-score-row">
                <span className="learners-read-contents-score-badge">{slateCourseReader.score}</span>
                <span className="learners-read-contents-score-label">Avg. Score</span>
              </div>

              <div className="learners-read-contents-divider"></div>

              <div className="learners-read-contents-outline">
                {slateOutlineWeeks.map((huskWeek) => (
                  <section 
                    key={huskWeek.id} 
                    className={`learners-read-week ${expandedWeeks[huskWeek.id] ? 'is-open' : ''}`}
                  >
                    <div className="learners-read-week-rail" aria-hidden="true">
                      <img
                        className="learners-read-week-status"
                        src={huskWeek.completed ? checkCircle : noCheckCircle}
                        alt="Status"
                      />
                    </div>

                    <div className="learners-read-week-body">
                      <button
                        type="button"
                        className="learners-read-week-toggle"
                        onClick={() => toggleWeek(huskWeek.id)}
                        aria-expanded={expandedWeeks[huskWeek.id] ? 'true' : 'false'}
                      >
                        <span className="learners-read-week-title">{huskWeek.title}</span>
                        {huskWeek.chapters && huskWeek.chapters.length > 0 ? (
                          <>
                            <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-minus" src={acCl} alt="Collapse" />
                            <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus" src={acOp} alt="Expand" />
                          </>
                        ) : (
                          <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus only" src={acOp} alt="Expand" />
                        )}
                      </button>

                      {huskWeek.chapters && huskWeek.chapters.length > 0 && (
                        <div className="learners-read-week-panel">
                          <div className="learners-read-chapters">
                            {huskWeek.chapters.map((huskChapter) => (
                              <button
                                key={huskChapter.id}
                                type="button"
                                className={`learners-read-chapter ${activeChapterId === huskChapter.id ? 'is-active' : ''}`}
                                onClick={() => handleChapterSelect(huskChapter.id)}
                              >
                                <span className="learners-read-chapter-line" aria-hidden="true"></span>
                                <span className="learners-read-chapter-title">{huskChapter.title}</span>
                                <img 
                                  src={huskChapter.completed ? checkCircle : noCheckCircle} 
                                  alt={huskChapter.completed ? "Completed" : "Not completed"} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                ))}

                <section className="learners-read-week learners-read-week-assessment">
                  <div className="learners-read-week-rail" aria-hidden="true">
                    <img className="learners-read-week-status" src={noCheckCircle} alt="Status" />
                  </div>
                  <div className="learners-read-week-body">
                    <button 
                      type="button" 
                      className="learners-read-week-toggle learners-read-week-toggle-link"
                      onClick={() => handleChapterSelect('assessment')}
                    >
                      <span className="learners-read-week-title">Summative Assessment</span>
                      <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-arrow" src={right1} alt="Open" />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </aside>

          <div 
            className="learners-read-contents-backdrop" 
            hidden={!isSidebarOpen || window.innerWidth > 991} 
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <main className="learners-read-contents-main">
            <div className="learners-read-contents-topbar">
              <button 
                type="button" 
                className="learners-read-contents-open" 
                onClick={() => setIsSidebarOpen(true)}
                aria-expanded={isSidebarOpen} 
                aria-label="Toggle contents sidebar"
              >
                <img src={bars} alt="Menu" />
                <span>Contents</span>
              </button>
            </div>

            <section className="learners-read-contents-summary-card" aria-label="Current lesson summary">
              <div className="learners-read-contents-summary-main">
                <h2>{activeContent.weekLabel}</h2>
                <p>{activeContent.chapterLabel}</p>
              </div>
              <div className="learners-read-contents-summary-side">
                <h3>Progress</h3>
                <p>{activeContent.progressLabel}</p>
              </div>
            </section>

            <article className="learners-read-article">
              
              {/* LESSON VIEW */}
              {!isAssessmentView && (
                <div className="learners-read-lesson-view">
                  <h2 className="learners-read-article-title">{activeContent.headline}</h2>
                  <p className="learners-read-article-summary">{activeContent.summary}</p>

                  <div className="learners-read-article-media">
                    <img src={activeContent.image} alt={activeContent.headline} />
                  </div>

                  <section className="learners-read-article-detail-section">
                    <h3>{activeContent.introTitle}</h3>
                    <p>
                      <span>{activeContent.introBody}</span>
                      <a href="/" onClick={preventDefault}>{activeContent.introLinkLabel}</a>
                    </p>
                  </section>

                  <section className="learners-read-article-detail-section learners-read-article-detail-section-last">
                    <h3>{activeContent.audienceTitle}</h3>
                    <p>{activeContent.audienceBody}</p>
                  </section>

                  <section className="learners-read-article-bottom-section">
                    <h3>What will you achieve?</h3>
                    <p>By the end of the course, you'll be able to...</p>
                    <ul className="learners-read-article-outcomes">
                      {genesisOutcomes.map((husk, idx) => (
                        <li key={idx}>{husk}</li>
                      ))}
                    </ul>
                    <h3 className="learners-read-article-paper-title">Observe well this past papers</h3>
                    <div className="learners-read-article-paper-a3" aria-label="A3 paper space"></div>
                  </section>

                  <section className="learners-read-support-cta" aria-label="Private question support">
                    <div className="learners-read-support-cta-copy">
                      <h3>Didn’t get it right, Ask a question Privately</h3>
                      <p>See your personalized recommendations based on your interests and goals.</p>
                    </div>
                    <button type="button" className="learners-read-support-cta-btn" onClick={preventDefault}>
                      <span>Ask a question</span>
                      <img src={wAcBook} alt="Ask" />
                    </button>
                  </section>

                  <section className="learners-read-exercise" aria-label="Exercise">
                    <div className="learners-read-exercise-head">
                      <div className="learners-read-exercise-badge" aria-hidden="true">
                        <img src={leTec} alt="Exercise" />
                      </div>
                      <h3>Exercise</h3>
                    </div>

                    <div className="learners-read-assessment-tracker learners-read-exercise-tracker">
                      {slateExerciseQuestions.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`learners-read-assessment-track-item ${idx === currentExerciseIndex ? 'is-current' : ''} ${exerciseStates[idx] !== 'pending' ? `is-${exerciseStates[idx]}` : ''}`}
                          onClick={() => {
                            setCurrentExerciseIndex(idx);
                            setSelectedExerciseOption(null);
                            setIsExerciseGraded(false);
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <p className="learners-read-assessment-question learners-read-exercise-question">
                      <span>{slateExerciseQuestions[currentExerciseIndex]?.number}.</span>
                      <span>{slateExerciseQuestions[currentExerciseIndex]?.prompt}</span>
                    </p>

                    <div className="learners-read-assessment-options learners-read-exercise-options">
                      {slateExerciseQuestions[currentExerciseIndex]?.options.map((optHusk, optIdx) => {
                        const isSelected = selectedExerciseOption === optIdx;
                        const isCorrect = slateExerciseQuestions[currentExerciseIndex].correctAnswers.includes(optIdx);
                        let stateClass = '';
                        if (isExerciseGraded) {
                          if (isSelected) {
                            stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                          } else if (isCorrect) {
                            stateClass = 'is-correct';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={`learners-read-assessment-option learners-read-exercise-option ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                            onClick={() => handleExerciseOptionSelect(optIdx)}
                          >
                            <span className="learners-read-assessment-option-marker"></span>
                            <span>{optHusk}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      type="button" 
                      className={`learners-read-assessment-action learners-read-exercise-action ${isExerciseGraded && currentExerciseIndex === slateExerciseQuestions.length - 1 ? 'is-complete' : ''}`}
                      onClick={handleExerciseAction}
                    >
                      <span>{isExerciseGraded && currentExerciseIndex < slateExerciseQuestions.length - 1 ? 'Next' : 'Done'}</span>
                      <img src={right1} alt="Next" hidden={!isExerciseGraded || currentExerciseIndex >= slateExerciseQuestions.length - 1} />
                    </button>
                  </section>
                </div>
              )}

              {/* ASSESSMENT VIEW */}
              {isAssessmentView && (
                <section className="learners-read-assessment-view">
                  <div className="learners-read-assessment-strip">
                    <div className="learners-read-assessment-strip-top">
                      <div className="learners-read-assessment-strip-title">
                        <div className="learners-read-assessment-badge" aria-hidden="true">
                          <img src={leTec} alt="Assessment" />
                        </div>
                        <h3>Assessment</h3>
                      </div>
                      <p className="learners-read-assessment-time">Time remaining : <strong>12:58</strong></p>
                    </div>

                    <div className="learners-read-assessment-tracker">
                      {genesisAssessmentTracker.map((huskState, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`learners-read-assessment-track-item is-${huskState} ${idx === currentAssessmentIndex ? 'is-current' : ''}`}
                          onClick={() => {
                            if (idx < slateAssessmentQuestions.length) {
                              setCurrentAssessmentIndex(idx);
                              setSelectedAssessmentOptions([]);
                              setIsAssessmentGraded(false);
                              setIsAssessmentComplete(false);
                            }
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isAssessmentComplete ? (
                    <section className="learners-read-assessment-card">
                      <div className="learners-read-assessment-card-top">
                        <div className="learners-read-assessment-card-title">
                          <img src={leftIcon} alt="Back" />
                          <span>Assessment</span>
                        </div>
                        <strong>{slateAssessmentQuestions[currentAssessmentIndex]?.progressText}</strong>
                      </div>

                      <p className="learners-read-assessment-question">
                        <span>{slateAssessmentQuestions[currentAssessmentIndex]?.number}.</span>
                        <span>{slateAssessmentQuestions[currentAssessmentIndex]?.prompt}</span>
                      </p>

                      {slateAssessmentQuestions[currentAssessmentIndex]?.image && (
                        <div className="learners-read-assessment-image-wrap">
                          <img src={slateAssessmentQuestions[currentAssessmentIndex].image} alt="Assessment reference" />
                        </div>
                      )}

                      <div className="learners-read-assessment-options">
                        {slateAssessmentQuestions[currentAssessmentIndex]?.options.map((optHusk, optIdx) => {
                          const isMulti = slateAssessmentQuestions[currentAssessmentIndex].type === 'multi';
                          const isSelected = selectedAssessmentOptions.includes(optIdx);
                          const isCorrect = slateAssessmentQuestions[currentAssessmentIndex].correctAnswers.includes(optIdx);
                          
                          let stateClass = '';
                          if (isAssessmentGraded) {
                            if (isSelected) {
                              stateClass = isCorrect ? 'is-correct' : 'is-wrong';
                            } else if (isCorrect && !isMulti) {
                              stateClass = 'is-correct';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={`learners-read-assessment-option ${isMulti ? 'is-multi' : ''} ${isSelected ? 'is-selected' : ''} ${stateClass}`}
                              onClick={() => handleAssessmentOptionSelect(optIdx, slateAssessmentQuestions[currentAssessmentIndex].type)}
                            >
                              <span className="learners-read-assessment-option-marker">
                                {isMulti && <img src={doneIcon} alt="Check" />}
                              </span>
                              <span>{optHusk}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button 
                        type="button" 
                        className={`learners-read-assessment-action ${isAssessmentGraded && currentAssessmentIndex === slateAssessmentQuestions.length - 1 ? 'is-complete' : ''}`}
                        onClick={handleAssessmentAction}
                      >
                        <span>
                          {slateAssessmentQuestions[currentAssessmentIndex]?.type === 'multi' && !isAssessmentGraded ? 'Done' : 'Next'}
                        </span>
                        {!(slateAssessmentQuestions[currentAssessmentIndex]?.type === 'multi' && !isAssessmentGraded) && (
                          <img src={right1} alt="Next" />
                        )}
                      </button>
                    </section>
                  ) : (
                    <section className="learners-read-assessment-complete">
                      <div className="learners-read-assessment-complete-orb" aria-hidden="true">
                        <span>{apexAssessmentResult.score}</span>
                      </div>
                      <div className="learners-read-assessment-complete-copy">
                        <h3>
                          <span aria-hidden="true">🎉</span>
                          <span>{apexAssessmentResult.headline}</span>
                        </h3>
                      </div>
                      <div className="learners-read-assessment-complete-stats">
                        {apexAssessmentResult.stats.map((huskStat, idx) => (
                          <div key={idx} className={`learners-read-assessment-complete-stat ${huskStat.tone ? `is-${huskStat.tone}` : ''}`}>
                            <strong>{huskStat.value}</strong>
                            <span>{huskStat.label}</span>
                          </div>
                        ))}
                      </div>
                      <p className="learners-read-assessment-complete-summary">{apexAssessmentResult.summary}</p>
                      <button type="button" className="learners-read-assessment-complete-button" onClick={preventDefault}>
                        <span>{apexAssessmentResult.buttonLabel}</span>
                        <img src={right1} alt="Continue" />
                      </button>
                    </section>
                  )}
                </section>
              )}
            </article>
          </main>
        </div>
      </section>

      <section className="learners-course-specific-author-card" aria-label="Course author">
        <div className="learners-course-specific-author-card-inner">
          <div className="learners-course-specific-author-avatar">
            <img src={apexCourseMeta.authorImage} alt={apexCourseMeta.author} />
          </div>
          <div className="learners-course-specific-author-copy">
            <h3>{apexCourseMeta.author}</h3>
            <p className="learners-course-specific-author-role">{apexCourseMeta.authorRole}</p>
            <div className="learners-course-specific-author-meta">
              <span>Published on</span>
              <span aria-hidden="true">|</span>
              <span>{apexCourseMeta.publishedOn}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="learners-course-specific-newsletter" aria-label="Newsletter signup">
        <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-copy">
          <h3>Find the right course for you</h3>
          <p>See your personalised recommendations based on your interests and goals.</p>
          <div className="learners-course-specific-newsletter-socials">
            <a href="/" onClick={preventDefault} aria-label="TikTok">
              <img src={dtiktok} alt="TikTok" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="WhatsApp">
              <img src={dwhat} alt="WhatsApp" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="Facebook">
              <img src={dfaceb} alt="Facebook" />
            </a>
            <a href="/" onClick={preventDefault} aria-label="Instagram">
              <img src={dinstagram} alt="Instagram" />
            </a>
          </div>
        </div>

        <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-form">
          <h3>Stay tune and get the latest update</h3>
          <p>See your personalised recommendations based on your interests and goals.</p>
          <form className="learners-course-specific-newsletter-form" onSubmit={preventDefault}>
            <img src={acSms} alt="Mail" className="learners-course-specific-newsletter-mail" />
            <input type="email" placeholder="Enter email address" aria-label="Enter email address" />
            <button type="submit" aria-label="Submit email">
              <img src={acSend} alt="Send" />
            </button>
          </form>
        </div>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersReadContents;
