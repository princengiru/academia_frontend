import React, { useEffect, useRef } from 'react';
import { ClipboardList, Lock } from 'lucide-react';
import accMinus from '../../../../assets/icons/acc-minus.svg';
import checkCircle from '../../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../../assets/icons/no-check-circle.svg';
import acCl from '../../../../assets/icons/ac-cl.svg';
import acOp from '../../../../assets/icons/ac-op.svg';
import right1 from '../../../../assets/icons/right1.svg';
import { isSameOutlineItemId, isOutlineItemUnlocked, isWeekAccessible, isSummativeUnlocked, getWeekOutlineItems } from './sidebarUtils';

function Sidebar({
  courseReader,
  isSidebarOpen,
  setIsSidebarOpen,
  outlineWeeksState,
  expandedWeeks,
  toggleWeek,
  activeChapterId,
  handleChapterSelect,
  stripHtml,
  isSummativeComplete = false,
  outlineProgress = { completed: 0, total: 0 },
  loadingOutline = false,
  nextAssessment = null,
  courseProgressPercent = 0,
}) {
  const activeItemRef = useRef(null);
  const outlineScrollRef = useRef(null);
  const isSummativeActive = activeChapterId === 'assessment';
  const summativeUnlocked = isSummativeUnlocked(outlineWeeksState, isSummativeComplete);

  const handleItemSelect = (itemId) => {
    if (!isOutlineItemUnlocked(outlineWeeksState, itemId, isSummativeComplete)) return;
    handleChapterSelect(itemId);
  };

  useEffect(() => {
    if (!isSidebarOpen || !activeItemRef.current || !outlineScrollRef.current) return;
    activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeChapterId, isSidebarOpen, expandedWeeks]);

  const weekHasActiveItem = (week) => {
    if (isSummativeActive) return false;
    return week.chapters?.some((chapter) => isSameOutlineItemId(chapter.id, activeChapterId))
      || week.assessments?.some((assessment) => isSameOutlineItemId(assessment.id, activeChapterId));
  };

  return (
    <>
      <aside
        className={`learners-read-contents-sidebar ${isSidebarOpen ? 'is-open' : ''}`}
        aria-label="Course outline sidebar"
      >
        <div ref={outlineScrollRef} className="learners-read-contents-sidebar-card">
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
              <img src={accMinus} alt="" />
            </button>
          </div>

          <div className="learners-read-contents-score-row">
            <span className="learners-read-contents-score-badge">{courseReader.score}</span>
            <span className="learners-read-contents-score-label">Avg. score</span>
          </div>

          <div className="learners-read-contents-outline-progress" aria-label="Course progress">
            <div className="learners-read-contents-outline-progress-head">
              <span>Course progress</span>
              <strong>{courseProgressPercent}%</strong>
            </div>
            <div
              className="learners-read-contents-outline-progress-bar"
              role="progressbar"
              aria-valuenow={courseProgressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div className="learners-read-contents-outline-progress-fill" style={{ width: `${courseProgressPercent}%` }} />
            </div>
            <p className="learners-read-contents-outline-progress-meta">
              {outlineProgress.completed} of {outlineProgress.total} items complete
            </p>
          </div>

          {nextAssessment
            && isOutlineItemUnlocked(outlineWeeksState, nextAssessment.id, isSummativeComplete)
            && !isSameOutlineItemId(activeChapterId, nextAssessment.id) ? (
            <button
              type="button"
              className="learners-read-contents-next-assessment"
              onClick={() => handleItemSelect(nextAssessment.id)}
            >
              <span className="learners-read-contents-next-assessment-label">Next assessment</span>
              <strong>{stripHtml(nextAssessment.title)}</strong>
            </button>
          ) : null}

          <div className="learners-read-contents-divider" />

          <div className="learners-read-contents-outline-label">Contents</div>

          <div
            className="learners-read-contents-outline-scroll"
          >
            <div className="learners-read-contents-outline">
              {loadingOutline ? (
                <p className="learners-read-contents-outline-loading">Loading outline…</p>
              ) : outlineWeeksState.length === 0 ? (
                <p className="learners-read-contents-outline-empty">No chapters published yet.</p>
              ) : (
                outlineWeeksState.map((huskWeek) => {
                  const hasChildren = (huskWeek.chapters?.length > 0) || (huskWeek.assessments?.length > 0);
                  const isWeekOpen = Boolean(expandedWeeks[huskWeek.id]);
                  const hasActiveLesson = weekHasActiveItem(huskWeek);
                  const weekAccessible = isWeekAccessible(outlineWeeksState, huskWeek.id, isSummativeComplete);

                  return (
                    <section
                      key={huskWeek.id}
                      className={`learners-read-week ${isWeekOpen ? 'is-open' : ''} ${hasActiveLesson ? 'has-active-lesson' : ''} ${weekAccessible ? '' : 'is-locked'}`}
                    >
                      <div className="learners-read-week-rail" aria-hidden="true">
                        <img
                          className="learners-read-week-status"
                          src={huskWeek.completed ? checkCircle : noCheckCircle}
                          alt=""
                        />
                      </div>

                      <div className="learners-read-week-body">
                        <button
                          type="button"
                          className="learners-read-week-toggle"
                          onClick={() => hasChildren && toggleWeek(huskWeek.id)}
                          aria-expanded={hasChildren ? (isWeekOpen ? 'true' : 'false') : 'false'}
                          disabled={!hasChildren}
                          title={stripHtml(huskWeek.title)}
                        >
                          <span className="learners-read-week-title">
                            {!weekAccessible ? <Lock size={12} aria-hidden="true" /> : null}
                            <span>{stripHtml(huskWeek.title)}</span>
                          </span>
                          {hasChildren ? (
                            <>
                              <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-minus" src={acCl} alt="" />
                              <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-plus" src={acOp} alt="" />
                            </>
                          ) : null}
                        </button>

                        {hasChildren && (
                          <div className="learners-read-week-panel">
                            <div className="learners-read-chapters">
                              {getWeekOutlineItems(huskWeek).map((entry) => {
                                if (entry.kind === 'chapter') {
                                  const huskChapter = entry.data;
                                  const isActive = isSameOutlineItemId(activeChapterId, huskChapter.id);
                                  const isUnlocked = isOutlineItemUnlocked(outlineWeeksState, huskChapter.id, isSummativeComplete);
                                  return (
                                    <button
                                      key={huskChapter.id}
                                      ref={isActive ? activeItemRef : null}
                                      type="button"
                                      className={`learners-read-chapter ${isActive ? 'is-active' : ''} ${isUnlocked ? '' : 'is-locked'}`}
                                      onClick={() => handleItemSelect(huskChapter.id)}
                                      disabled={!isUnlocked}
                                      aria-current={isActive ? 'page' : undefined}
                                      aria-disabled={!isUnlocked}
                                      title={!isUnlocked ? 'Complete earlier lessons to unlock' : stripHtml(huskChapter.title)}
                                    >
                                      <span className="learners-read-chapter-line" aria-hidden="true" />
                                      <span className="learners-read-chapter-title">
                                        {!isUnlocked ? <Lock size={12} aria-hidden="true" /> : null}
                                        <span>{stripHtml(huskChapter.title)}</span>
                                      </span>
                                      <img
                                        src={huskChapter.completed ? checkCircle : noCheckCircle}
                                        alt=""
                                        aria-hidden="true"
                                      />
                                    </button>
                                  );
                                }

                                const huskAss = entry.data;
                                const isActive = isSameOutlineItemId(activeChapterId, huskAss.id);
                                const isUnlocked = isOutlineItemUnlocked(outlineWeeksState, huskAss.id, isSummativeComplete);
                                return (
                                  <button
                                    key={huskAss.id}
                                    ref={isActive ? activeItemRef : null}
                                    type="button"
                                    className={`learners-read-chapter learners-read-assessment-item ${isActive ? 'is-active' : ''} ${isUnlocked ? '' : 'is-locked'}`}
                                    onClick={() => handleItemSelect(huskAss.id)}
                                    disabled={!isUnlocked}
                                    aria-current={isActive ? 'page' : undefined}
                                    aria-disabled={!isUnlocked}
                                    title={!isUnlocked ? 'Complete earlier lessons to unlock' : stripHtml(huskAss.title)}
                                  >
                                    <span className="learners-read-chapter-line" aria-hidden="true" />
                                    <span className="learners-read-chapter-title learners-read-assessment-title">
                                      <ClipboardList size={14} color="#5B0A86" aria-hidden="true" />
                                      {!isUnlocked ? <Lock size={12} aria-hidden="true" /> : null}
                                      <span>{stripHtml(huskAss.title)}</span>
                                    </span>
                                    <img
                                      src={huskAss.completed ? checkCircle : noCheckCircle}
                                      alt=""
                                      aria-hidden="true"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })
              )}

              <section className={`learners-read-week learners-read-week-assessment ${isSummativeActive ? 'is-active' : ''} ${summativeUnlocked ? '' : 'is-locked'}`}>
                <div className="learners-read-week-rail" aria-hidden="true">
                  <img
                    className="learners-read-week-status"
                    src={isSummativeComplete ? checkCircle : noCheckCircle}
                    alt=""
                  />
                </div>
                <div className="learners-read-week-body">
                  <button
                    ref={isSummativeActive ? activeItemRef : null}
                    type="button"
                    className="learners-read-week-toggle learners-read-week-toggle-link"
                    onClick={() => handleItemSelect('assessment')}
                    disabled={!summativeUnlocked}
                    aria-current={isSummativeActive ? 'page' : undefined}
                    aria-disabled={!summativeUnlocked}
                    title={!summativeUnlocked ? 'Complete all lessons before the final assessment' : undefined}
                  >
                    <span className="learners-read-week-title">
                      {!summativeUnlocked ? <Lock size={12} aria-hidden="true" /> : null}
                      <span>Summative assessment</span>
                    </span>
                    <img className="learners-read-week-toggle-icon learners-read-week-toggle-icon-arrow" src={right1} alt="" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </aside>

      <button
        type="button"
        className={`learners-read-contents-backdrop ${isSidebarOpen ? 'is-visible' : ''}`}
        aria-label="Close contents sidebar"
        onClick={() => setIsSidebarOpen(false)}
      />
    </>
  );
}

export default Sidebar;
