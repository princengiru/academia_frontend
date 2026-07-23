import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import acOn from '../../../../assets/imgs/ac-on.jpg';
import fe1 from '../../../../assets/icons/fe1.svg';
import fe2 from '../../../../assets/icons/fe2.svg';
import fe3 from '../../../../assets/icons/fe3.svg';
import fe4 from '../../../../assets/icons/fe4.svg';
import fe5 from '../../../../assets/icons/fe5.svg';
import acCal from '../../../../assets/icons/ac-cal.svg';
import acUs from '../../../../assets/icons/ac-us.svg';
import acBook from '../../../../assets/icons/ac-book.svg';
import hoabasics from '../../../../assets/icons/hoabasics.svg';

import '../../public/course-details.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanDescriptionHtml = (html) => {
  if (!html) return '';
  return html.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');
};

const formatHtmlContent = (html) => {
  if (!html) return '';
  return html
    .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
    .replace(/&nbsp;/g, ' ');
};

const resolveAssetUrl = (value) => {
  if (!value) return acOn;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
};

const formatObjectivesText = (value) => {
  if (!value) return 'Deep dive into essential skills and exercises.';
  if (typeof value === 'string') return value.replace(/"/g, '');
  if (Array.isArray(value)) return value.filter(Boolean).join(' · ');
  return String(value);
};

const Review = ({ courseId, setActiveStep, pushFeedback }) => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    const loadSummary = async () => {
      const token = localStorage.getItem('token');
      try {
        const courseRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await courseRes.json();
        if (!courseRes.ok) throw new Error(body.message || 'Failed to load course');

        const courseData = body?.data || body;

        setCourse({
          id: courseData.id,
          title: courseData.title || 'Untitled Course',
          headline: courseData.subtitle || courseData.title || 'Untitled Course',
          summary: courseData.description || '',
          intro: courseData.intro_message || courseData.description || '',
          audience: courseData.target_audience || '',
          objectives: courseData.objectives || '',
          image: courseData.thumbnail_url || courseData.thumbnail
            ? resolveAssetUrl(courseData.thumbnail_url || courseData.thumbnail)
            : acOn,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : 'Self-paced',
          weekly: courseData.required_hours_per_week
            ? `${courseData.required_hours_per_week} hours`
            : 'Flexible',
          level: courseData.level
            ? courseData.level.charAt(0).toUpperCase() + courseData.level.slice(1)
            : 'All levels',
          price: Number(courseData.price) === 0 ? 'Free' : `$${courseData.price}`,
        });

        const ch = courseData.chapters || [];
        setChapters(Array.isArray(ch) ? ch : []);
        const w = courseData.weeks || [];
        setWeeks(Array.isArray(w) ? w : []);
      } catch (error) {
        console.error(error);
        pushFeedback('Could not load full course summary from database.', 'error');
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [courseId, pushFeedback]);

  useEffect(() => {
    if (weeks.length === 0 && chapters.length > 0) {
      const grouped = [];
      chapters.forEach((c) => {
        const weekNum = c.week_number || 1;
        let wk = grouped.find((w) => w.week_number === weekNum);
        if (!wk) {
          wk = { id: `week-${weekNum}`, week_number: weekNum, title: `Week ${weekNum}`, chapters: [] };
          grouped.push(wk);
        }
        wk.chapters.push(c);
      });
      grouped.sort((a, b) => a.week_number - b.week_number);
      setWeeks(grouped);
    }
  }, [chapters, weeks.length]);

  const publishCourse = async () => {
    if (!courseId) return pushFeedback('Course ID missing.', 'error');

    setIsPublishing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/publish`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to submit course for publishing.');

      navigate('/professor', {
        state: {
          toastMessage: 'Course submitted for HOA approval.',
          toastTone: 'success',
        },
      });
    } catch (error) {
      pushFeedback(error.message, 'error');
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="prof-step-pane is-active prof-review-loading-pane">
        <div className="prof-review-spinner"></div>
        <p>Loading course summary...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="prof-step-pane is-active prof-review-empty-pane">
        <p>No course data found. Please go back to Basic Information.</p>
        <button type="button" className="prof-btn-primary-premium" onClick={() => setActiveStep('basic')}>
          Back to Basic Information
        </button>
      </div>
    );
  }

  const featureList = [
    { icon: fe1, label: course.duration },
    { icon: fe2, label: course.weekly },
    { icon: fe3, label: 'Digital certificate upon completion' },
    { icon: fe4, label: course.level },
    { icon: fe5, label: 'Professional feedback' },
  ];

  const stats = [
    { label: 'Duration', value: course.duration, icon: acCal },
    { label: 'Weekly study', value: course.weekly, icon: acCal },
    { label: 'Skill Level', value: course.level, icon: acUs },
    { label: 'Price', value: course.price, icon: acBook },
  ];

  const breakdownWeeks = Array.isArray(weeks) ? weeks : [];
  const hasBreakdown = breakdownWeeks.length > 0;
  const hasOutcomes = !!stripHtml(course.objectives);
  const hasAudience = !!stripHtml(course.audience);
  const showContentSections = hasBreakdown || hasOutcomes || hasAudience || !!course.intro;

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      <div className="public-course-details-page prof-review-as-details">
        <div className="course-details-container">
          <div className="course-details-grid">
            <div className="course-main-column">
              <section className="course-intro-banner">
                <h2>{course.headline}</h2>
                {course.summary ? (
                  <div
                    className="summary-text"
                    dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(course.summary) }}
                  />
                ) : null}

                <div className="course-media-block">
                  <div className="course-image-wrap">
                    <img src={course.image} alt={course.title} />
                  </div>
                  <div className="course-stats-strip">
                    {stats.map((s, idx) => (
                      <div key={s.label} className={`stat-box ${idx === stats.length - 1 ? 'price-stat' : ''}`}>
                        <div className="stat-label-wrap">
                          <img src={s.icon} alt="" />
                          <span>{s.label}</span>
                        </div>
                        <strong>{s.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {showContentSections ? (
                <div className="course-sections-list">
                  {course.intro && (
                    <section className="course-section-block">
                      <h3>Course Overview</h3>
                      <div className="overview-content">
                        {!isSummaryExpanded && stripHtml(course.intro).length > 280 ? (
                          <>
                            {stripHtml(course.intro).slice(0, 280)}...
                            <button
                              type="button"
                              className="read-more-toggle-btn"
                              onClick={() => setIsSummaryExpanded(true)}
                            >
                              Read more
                            </button>
                          </>
                        ) : (
                          <>
                            <div dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(course.intro) }} />
                            {stripHtml(course.intro).length > 280 && (
                              <button
                                type="button"
                                className="read-more-toggle-btn"
                                style={{ marginTop: '8px', display: 'inline-block' }}
                                onClick={() => setIsSummaryExpanded(false)}
                              >
                                Read less
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </section>
                  )}

                  {hasBreakdown && (
                    <section className="course-section-block breakdown-section">
                      <h3>Syllabus & Course Breakdown</h3>
                      <div className="curriculum-timeline">
                        {breakdownWeeks.map((week, wIdx) => (
                          <div className="curriculum-week-group" key={week.id || wIdx}>
                            <div className="week-header">
                              <span className="week-tag">
                                {week.title || `Week ${week.week_number || wIdx + 1}`}
                              </span>
                            </div>
                            <div className="week-details">
                              <div className="week-intro-card">
                                <div className="timeline-connector">
                                  <div className="dot-icon">
                                    <img src={hoabasics} alt="" />
                                  </div>
                                  {week.chapters && week.chapters.length > 0 && (
                                    <div className="connector-line"></div>
                                  )}
                                </div>
                                <div className="timeline-details">
                                  <h4>{week.description || 'Weekly Module Overview'}</h4>
                                  <p>{formatObjectivesText(week.learning_objectives)}</p>
                                </div>
                              </div>

                              {(week.chapters || []).map((chap, cIdx) => (
                                <div className="curriculum-chapter-item" key={chap.id || cIdx}>
                                  <div className="timeline-connector">
                                    <div className="chapter-number">{cIdx + 1}</div>
                                    {cIdx !== week.chapters.length - 1 && (
                                      <div className="connector-line"></div>
                                    )}
                                  </div>
                                  <div className="timeline-details chapter-card-content">
                                    {chap.thumbnail ? (
                                      <img
                                        src={resolveAssetUrl(chap.thumbnail)}
                                        alt=""
                                        className="chapter-thumb"
                                      />
                                    ) : (
                                      <div className="chapter-no-thumb">Lecture</div>
                                    )}
                                    <div className="chapter-meta">
                                      <h5>{chap.title}</h5>
                                      <p>
                                        {chap.subtitle || chap.content_type || 'Chapter Details'}
                                        {chap.exercises?.length
                                          ? ` · ${chap.exercises.length} question${chap.exercises.length === 1 ? '' : 's'}`
                                          : chap.duration
                                            ? ` · ${chap.duration} mins`
                                            : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {hasAudience && (
                    <section className="course-section-block">
                      <h3>Who is this course for?</h3>
                      <div
                        className="html-render-wrap"
                        dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.audience) }}
                      />
                    </section>
                  )}

                  {hasOutcomes && (
                    <section className="course-section-block">
                      <h3>What will you achieve?</h3>
                      <div
                        className="html-render-wrap"
                        dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.objectives) }}
                      />
                    </section>
                  )}
                </div>
              ) : (
                <div className="empty-course-fallback">
                  <h3>No curriculum outline yet</h3>
                  <p>Add weeks and chapters in the Curriculum step before submitting.</p>
                </div>
              )}
            </div>

            <aside className="course-sidebar-column">
              <div className="sidebar-sticky-enroll-card">
                <h3 className="sidebar-title">{course.title}</h3>
                <p className="sidebar-subtitle">Ready to submit for HOA approval</p>

                <div className="sidebar-features-list">
                  {featureList.map((f, i) => (
                    <div key={i} className="feature-item">
                      <img src={f.icon} alt="" className="feature-icon" />
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="enroll-cta-btn"
                  onClick={publishCourse}
                  disabled={isPublishing}
                >
                  <span>{isPublishing ? 'Submitting...' : 'Submit for approval'}</span>
                </button>

                <button
                  type="button"
                  className="prof-review-details-back"
                  onClick={() => setActiveStep('pricing')}
                >
                  Back to Pricing
                </button>

                <p className="prof-review-details-note">
                  Learners can enroll only after HOA approves this course.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
