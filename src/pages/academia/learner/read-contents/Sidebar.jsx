import React from 'react';

// Icons & Images
import accMinus from '../../../../assets/icons/acc-minus.svg';
import checkCircle from '../../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../../assets/icons/no-check-circle.svg';
import acCl from '../../../../assets/icons/ac-cl.svg';
import acOp from '../../../../assets/icons/ac-op.svg';
import right1 from '../../../../assets/icons/right1.svg';
import bars from '../../../../assets/icons/bars.svg';

const Sidebar = ({
  courseReader,
  isSidebarOpen,
  setIsSidebarOpen,
  outlineWeeksState,
  expandedWeeks,
  toggleWeek,
  activeChapterId,
  handleChapterSelect,
  stripHtml,
  isAssessmentComplete = false,
  completedChapters = []
}) => {
  return (
    <>
      <aside
        className={`learners-read-contents-sidebar ${isSidebarOpen ? 'is-open' : ''}`}
        aria-label="Course outline sidebar"
      >
        <div className="learners-read-contents-sidebar-card">
          <div className="learners-read-contents-sidebar-head">
            <div>
              <h1>{stripHtml(courseReader.title)}</h1>
              <p>Prepared by <strong>{stripHtml(courseReader.author)}</strong></p>
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
            <span className="learners-read-contents-score-badge">{courseReader.score}</span>
            <span className="learners-read-contents-score-label">Avg. Score</span>
          </div>

          <div className="learners-read-contents-divider"></div>

          <div className="learners-read-contents-outline">
            {outlineWeeksState.map((huskWeek) => (
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
                    <span className="learners-read-week-title">{stripHtml(huskWeek.title)}</span>
                    {((huskWeek.chapters && huskWeek.chapters.length > 0) || (huskWeek.assessments && huskWeek.assessments.length > 0)) ? (
                      <>
                        <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-minus" src={acCl} alt="Collapse" />
                        <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus" src={acOp} alt="Expand" />
                      </>
                    ) : (
                      <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus only" src={acOp} alt="Expand" />
                    )}
                  </button>

                  {((huskWeek.chapters && huskWeek.chapters.length > 0) || (huskWeek.assessments && huskWeek.assessments.length > 0)) && (
                    <div className="learners-read-week-panel">
                      <div className="learners-read-chapters">
                        {huskWeek.chapters && huskWeek.chapters.map((huskChapter) => (
                          <button
                            key={huskChapter.id}
                            type="button"
                            className={`learners-read-chapter ${activeChapterId === huskChapter.id ? 'is-active' : ''}`}
                            onClick={() => handleChapterSelect(huskChapter.id)}
                          >
                            <span className="learners-read-chapter-line" aria-hidden="true"></span>
                            <span className="learners-read-chapter-title">{stripHtml(huskChapter.title)}</span>
                            <img
                              src={huskChapter.completed ? checkCircle : noCheckCircle}
                              alt={huskChapter.completed ? "Completed" : "Not completed"}
                            />
                          </button>
                        ))}

                        {huskWeek.assessments && huskWeek.assessments.map((huskAss) => (
                          <button
                            key={huskAss.id}
                            type="button"
                            className={`learners-read-chapter learners-read-assessment-item ${activeChapterId === huskAss.id ? 'is-active' : ''}`}
                            onClick={() => handleChapterSelect(huskAss.id)}
                          >
                            <span className="learners-read-chapter-line" aria-hidden="true"></span>
                            <span className="learners-read-chapter-title" style={{ fontStyle: 'italic' }}>
                              📝 {stripHtml(huskAss.title)}
                            </span>
                            <img
                              src={huskAss.completed ? checkCircle : noCheckCircle}
                              alt={huskAss.completed ? "Completed" : "Not completed"}
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
                <img 
                  className="learners-read-week-status" 
                  src={(isAssessmentComplete || (completedChapters && completedChapters.includes('assessment'))) ? checkCircle : noCheckCircle} 
                  alt="Status" 
                />
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
    </>
  );
};

export default Sidebar;
