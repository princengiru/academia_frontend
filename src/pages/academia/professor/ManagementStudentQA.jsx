import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-student-qa.css';

const ManagementStudentQA = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('management-student-qa');
  
  const managementTabs = [
    { id: 'management', label: 'Students' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Questions List Data ---
  const questionsList = [
    { id: 1, user: 'Mrs. Anderson', time: '1 Day ago', week: 'Wk1', chapter: 'Chapter 4', course: 'Care Principles of Cybersecurity, Leadership and Oversight', content: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...', replies: '0 View Replies', sent: 'Sent on Apr 23, 2025' },
    { id: 2, user: 'Mrs. Anderson', time: '1 Day ago', week: 'Wk1', chapter: 'Chapter 4', course: 'Care Principles of Cybersecurity, Leadership and Oversight', content: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...', replies: '12 View Replies', sent: 'Sent on Apr 23, 2025' },
    { id: 3, user: 'Mrs. Anderson', time: '1 Day ago', week: 'Wk2', chapter: 'Chapter 23', course: 'Mathematics and Science', content: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...', replies: '12 View Replies', sent: 'Sent on Apr 23, 2025' },
    { id: 4, user: 'Mrs. Anderson', time: '1 Day ago', week: 'Wk1', chapter: 'Chapter 4', course: 'Care Principles of Cybersecurity, Leadership and Oversight', content: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...', replies: '12 View Replies', sent: 'Sent on Apr 23, 2025' },
    { id: 5, user: 'Mrs. Anderson', time: '1 Day ago', week: 'Chapter 4', chapter: 'Chapter 4', course: 'Care Principles of Cybersecurity, Leadership and Oversight', content: 'What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences abo...', replies: '12 View Replies', sent: 'Sent on Apr 23, 2025' },
  ];

  // --- Search & Filter State ---
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(2);

  // --- Inline Rich Text Toolbar Component ---
  const EditorToolbar = () => (
    <div className="prof-qa-editor-toolbar">
      <button type="button" onClick={preventDefault} aria-label="Bold"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M5 3.5h4a2.5 2.5 0 0 1 0 5H5zm0 5h5a2.5 2.5 0 0 1 0 5H5z"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Italic"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M10 3L6 13"/><path d="M8 3h4"/><path d="M4 13h4"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Underline"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M4 3v4a4 4 0 0 0 8 0V3"/><path d="M4 13h8"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Bulleted List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="4" cy="5" r="1.3"/><line x1="7" y1="5" x2="13" y2="5"/><circle cx="4" cy="11" r="1.3"/><line x1="7" y1="11" x2="13" y2="11"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Numbered List"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><text x="2" y="7" fontSize="5" fill="currentColor">1.</text><line x1="7" y1="6" x2="13" y2="6"/><text x="2" y="13" fontSize="5" fill="currentColor">2.</text><line x1="7" y1="12" x2="13" y2="12"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Align Left"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="10" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg></button>
      <button type="button" onClick={preventDefault} aria-label="Align Center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><line x1="4" y1="4" x2="12" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="4" y1="12" x2="12" y2="12"/></svg></button>

      <button type="button" className="prof-qa-attach-btn" onClick={preventDefault}>
        <img src="/assets/icons/attach-file.png" alt="" />
        <span>Add an attachment</span>
      </button>
    </div>
  );

  return (
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page prof-management-qa-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/plus1.svg" alt="" />
                <span>Add Event</span>
              </a>
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

        {/* Tabs */}
        <nav className="prof-management-tabs" aria-label="Management sections">
          {managementTabs.map((tab) => (
            <Link 
              key={tab.id}
              to={`/academia/professor/${tab.id}`} 
              className={`prof-management-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Hero Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Student Q&amp;A</h2>
            <p>Questions Asked in the lessons</p>
          </div>

          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input type="search" placeholder="Search Assignments..." aria-label="Search Assignments" />
            </div>

            <button type="button" className="assessments-create-btn" onClick={preventDefault}>
              <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
              <span>Create new test</span>
            </button>
          </div>
        </section>

        {/* Toolbar */}
        <section className="prof-qa-toolbar">
          <div className="prof-qa-summary">
            <img src="/assets/icons/user.svg" alt="" />
            <span>12,456</span>
            <p>Students Question</p>
          </div>

          <div className="prof-qa-search-wrap">
            <input type="search" placeholder="Search any Lesson..." aria-label="Search lessons" />
            <div className="prof-qa-filters">
              <button type="button" className={activeFilter === 'All' ? 'is-active' : ''} onClick={() => setActiveFilter('All')}>All</button>
              <button type="button" className={activeFilter === 'Course' ? 'is-active' : ''} onClick={() => setActiveFilter('Course')}>Course</button>
              <button type="button" className={activeFilter === 'Syllabus' ? 'is-active' : ''} onClick={() => setActiveFilter('Syllabus')}>Syllabus</button>
              <button type="button" className="prof-qa-filter-btn" onClick={preventDefault}>
                <img src="/assets/icons/ac-fi.svg" alt="" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </section>

        {/* Layout Split */}
        <section className="prof-qa-layout">
          
          {/* Left Panel: Question List */}
          <section className="prof-qa-list-panel">
            <div className="prof-qa-list">
              {questionsList.map((item) => (
                <article key={item.id} className="prof-qa-item">
                  <div className="prof-qa-item-marker" aria-hidden="true">
                    <img src="/assets/imgs/default-profile.png" alt="" />
                    <span className="prof-qa-item-marker-line"></span>
                  </div>

                  <div className="prof-qa-item-body">
                    <header className="prof-qa-item-head">
                      <div className="prof-qa-user">
                        <strong>{item.user}</strong>
                        <span>{item.time}</span>
                      </div>
                    </header>

                    <div className="prof-qa-item-tags">
                      <span className="prof-qa-item-tags-pill">
                        {item.week} : {item.chapter}
                        <img src="/assets/icons/right1.svg" alt="" />
                      </span>
                      <p>{item.course}</p>
                    </div>

                    <p className="prof-qa-item-content">
                      {item.content} <a href="#" onClick={preventDefault}>Read more</a>
                    </p>

                    <footer className="prof-qa-item-foot">
                      <a href="#" onClick={preventDefault}>{item.replies}</a>
                      <span>{item.sent}</span>
                    </footer>
                  </div>
                </article>
              ))}
            </div>

            <div className="prof-qa-list-pagination">
              <button type="button" className="prof-lesson-ranks-pager-nav" onClick={preventDefault}><img src="/assets/icons/left1.svg" alt="" /></button>
              <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 1 ? 'is-active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
              <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 2 ? 'is-active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
              <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 3 ? 'is-active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
              <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 4 ? 'is-active' : ''}`} onClick={() => setCurrentPage(4)}>4</button>
              <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 5 ? 'is-active' : ''}`} onClick={() => setCurrentPage(5)}>5</button>
              <button type="button" className="prof-lesson-ranks-pager-nav" onClick={preventDefault}><img src="/assets/icons/right1.svg" alt="" /></button>
            </div>
          </section>

          {/* Right Panel: Thread & Reply */}
          <section className="prof-qa-thread-panel">
            <article className="prof-qa-item is-thread-main">
              <div className="prof-qa-item-marker" aria-hidden="true">
                <img src="/assets/imgs/default-profile.png" alt="" />
                <span className="prof-qa-item-marker-line"></span>
              </div>

              <div className="prof-qa-item-body">
                <header className="prof-qa-item-head">
                  <div className="prof-qa-user">
                    <strong>Mrs. Anderson</strong>
                    <span>1 Day ago</span>
                  </div>
                </header>

                <div className="prof-qa-item-tags">
                  <span className="prof-qa-item-tags-pill">
                    Wk1 : Chapter 4
                    <img src="/assets/icons/right1.svg" alt="" />
                  </span>
                  <p>Care Principles of Cybersecurity, Leadership and Oversight</p>
                </div>

                <p className="prof-qa-item-content">
                  What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about... <a href="#" onClick={preventDefault}>Read more</a>
                </p>

                <footer className="prof-qa-item-foot">
                  <a href="#" onClick={preventDefault}>2 View Replies</a>
                  <span>Sent on Apr 23, 2025</span>
                </footer>
              </div>
            </article>

            {/* Editor Box */}
            <section className="prof-qa-reply-box">
              <EditorToolbar />
              <textarea 
                className="learners-settings-textarea" 
                rows="6" 
                placeholder="Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, and organization of data..."
              ></textarea>
              <button type="button" className="prof-qa-send-btn" onClick={preventDefault}>Send Message</button>
            </section>

            {/* Replies Thread */}
            <div className="prof-qa-thread-replies">
              {/* Dummy Reply 1 */}
              <article className="prof-qa-item is-reply">
                <div className="prof-qa-item-marker" aria-hidden="true">
                  <img src="/assets/imgs/default-profile.png" alt="" />
                  <span className="prof-qa-item-marker-line"></span>
                </div>
                <div className="prof-qa-item-body">
                  <header className="prof-qa-item-head">
                    <div className="prof-qa-user">
                      <strong>(You)</strong>
                      <span>1 Day ago</span>
                    </div>
                  </header>
                  <div className="prof-qa-item-tags">
                    <span className="prof-qa-item-tags-pill">
                      Wk1 : Chapter 4
                      <img src="/assets/icons/right1.svg" alt="" />
                    </span>
                    <p>Care Principles of Cybersecurity, Leadership and Oversight</p>
                  </div>
                  <p className="prof-qa-item-content">
                    What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies... <a href="#" onClick={preventDefault}>Read more</a>
                  </p>
                </div>
              </article>

              {/* Dummy Reply 2 */}
              <article className="prof-qa-item is-reply">
                <div className="prof-qa-item-marker" aria-hidden="true">
                  <img src="/assets/imgs/default-profile.png" alt="" />
                  <span className="prof-qa-item-marker-line"></span>
                </div>
                <div className="prof-qa-item-body">
                  <header className="prof-qa-item-head">
                    <div className="prof-qa-user">
                      <strong>(You)</strong>
                      <span>1 Day ago</span>
                    </div>
                  </header>
                  <div className="prof-qa-item-tags">
                    <span className="prof-qa-item-tags-pill">
                      Wk1 : Chapter 4
                      <img src="/assets/icons/right1.svg" alt="" />
                    </span>
                    <p>Care Principles of Cybersecurity, Leadership and Oversight</p>
                  </div>
                  <p className="prof-qa-item-content">
                    What is Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies... <a href="#" onClick={preventDefault}>Read more</a>
                  </p>
                </div>
              </article>
            </div>
          </section>

        </section>
      </section>
    </ProfessorLayout>
  );
};

export default ManagementStudentQA;