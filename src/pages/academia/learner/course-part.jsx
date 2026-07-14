import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';

// Assets (kept as imports so bundler resolves them)
import acOn from '../../../assets/imgs/ac-on.jpg';
import defaultProfile from '../../../assets/imgs/default-profile.png';
import fe1 from '../../../assets/icons/fe1.svg';
import fe2 from '../../../assets/icons/fe2.svg';
import fe3 from '../../../assets/icons/fe3.svg';
import fe4 from '../../../assets/icons/fe4.svg';
import fe5 from '../../../assets/icons/fe5.svg';
import acCal from '../../../assets/icons/ac-cal.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acUs from '../../../assets/icons/ac-us.svg';
import acBook from '../../../assets/icons/ac-book.svg';
import hoabasics from '../../../assets/icons/hoabasics.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import SavedLibraryButton from './SavedLibraryButton';
import EnrollmentPaymentPicker from './EnrollmentPaymentPicker';
import {
  buildAvailablePaymentChoices,
  buildAccountPaymentHref,
  enrollInCourse,
  fetchSavedPaymentMethods,
  getPaymentMethodLabel,
  hasSavedPaymentMethods,
  isCourseFree,
  isEnrollmentRoleAllowed,
  pickDefaultPaymentValue,
} from './enrollmentPaymentUtils';
import { learnerPageTitle, LEARNER_PRODUCT_NAME } from './learnerBrand';
import { buildReaderUrl, resolveCourseProgressPercent } from './homeDashboardUtils';
import LearnerLoadError from './LearnerLoadError';
import jo1 from '../../../assets/icons/jo1.svg';
import './course-part.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

function CoursePart() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyStateId = location.state?.courseId;
  const inboundId = searchParams.get('id') || legacyStateId;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false, tone: 'success' });
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [paymentChoices, setPaymentChoices] = useState([]);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState('credit_card');
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [courseProgressPercent, setCourseProgressPercent] = useState(0);

  const resolveAssetUrl = (value) => {
    if (!value) return acOn;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const formatHtmlContent = (html) => {
    if (!html) return '';
    return html
      .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
      .replace(/&nbsp;/g, ' ');
  };

  const showToast = (message, tone = 'success') => {
    setToast({ message, visible: true, tone });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!searchParams.get('id') && legacyStateId) {
      setSearchParams({ id: String(legacyStateId) }, { replace: true });
    }
  }, [legacyStateId, searchParams, setSearchParams]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !inboundId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          const progressList = body?.data?.progress || body?.progress || [];
          const enrolled = progressList.some(p => Number(p.course_id) === Number(inboundId));
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Failed to check enrollment status:", err);
      }
    };
    checkEnrollmentStatus();
  }, [inboundId]);

  useEffect(() => {
    const loadCourseProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token || !inboundId || !isEnrolled) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress/${inboundId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const body = await res.json();
        const data = extractBody(body) || {};
        setCourseProgressPercent(resolveCourseProgressPercent({
          progressPercentage: data.progress_percentage ?? data.progressPercentage,
          outlineProgress: null,
        }));
      } catch {
        // keep default
      }
    };
    loadCourseProgress();
  }, [inboundId, isEnrolled]);

  useEffect(() => {
    let cancelled = false;

    const loadPaymentChoices = async () => {
      if (!course || isEnrolled) {
        setPaymentChoices([]);
        return;
      }

      const courseIsFree = isCourseFree(course);
      if (courseIsFree) {
        const freeChoices = buildAvailablePaymentChoices([], true);
        if (!cancelled) {
          setPaymentChoices(freeChoices);
          setSelectedPaymentValue('free');
          setPaymentsLoading(false);
        }
        return;
      }

      setPaymentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const methods = await fetchSavedPaymentMethods(API_BASE_URL, token);
        const choices = buildAvailablePaymentChoices(methods, false);
        if (!cancelled) {
          setSavedPaymentMethods(methods);
          setPaymentChoices(choices);
          setSelectedPaymentValue(pickDefaultPaymentValue(choices, methods));
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        if (!cancelled) {
          const fallbackChoices = buildAvailablePaymentChoices([], false);
          setPaymentChoices(fallbackChoices);
          setSelectedPaymentValue(pickDefaultPaymentValue(fallbackChoices, []));
        }
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    };

    loadPaymentChoices();
    return () => { cancelled = true; };
  }, [course, isEnrolled]);

  const handleJoinToday = async (e) => {
    e.preventDefault();
    if (!course?.id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please sign in to join this course.", "warning");
      setTimeout(() => {
        navigate('/academia/auth/signin');
      }, 1500);
      return;
    }

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = (userObj.role || '').toLowerCase().trim();
    if (!isEnrollmentRoleAllowed(userRole)) {
      showToast("Only learner accounts can enroll in courses.", "warning");
      return;
    }

    const courseIsFree = isCourseFree(course);
    if (!courseIsFree && !hasSavedPaymentMethods(savedPaymentMethods)) {
      const returnPath = `/academia/learner/course-part?id=${course.id}`;
      showToast('Add a payment method in Account before enrolling.', 'warning');
      navigate(buildAccountPaymentHref(returnPath));
      return;
    }
    
    setIsEnrolling(true);
    try {
      await enrollInCourse({
        apiBaseUrl: API_BASE_URL,
        token,
        courseId: course.id,
        course,
        selectedPaymentValue,
      });
      setIsEnrolled(true);
      showToast(`Enrollment confirmed via ${getPaymentMethodLabel(selectedPaymentValue)}.`, 'success');
      navigate(buildReaderUrl(course.id));
    } catch (err) {
      showToast(err.message || 'Failed to enroll in the course.', 'danger');
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCourse = async (id) => {
      setLoading(true);
      setError(null);
      try {
        // fetch specific course details
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load course');

        const data = extractBody(body);
        const courseData = data?.data || data?.course || data || {};

        if (cancelled) return;

        setCourse({
          id: courseData.id,
          title: courseData.title,
          author: courseData.instructor_name || courseData.author,
          authorImage: defaultProfile,
          authorRole: 'Author',
          publishedOn: courseData.created_at,
          headline: courseData.subtitle || courseData.title,
          summary: courseData.description || '',
          image: courseData.thumbnail ? (courseData.thumbnail.startsWith('/') ? `${API_BASE_URL}${courseData.thumbnail}` : courseData.thumbnail) : acOn,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : '',
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : '',
          level: courseData.level || '',
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : ''),
          rawPrice: Number(courseData.price) || 0,
          isFree: Boolean(courseData.is_free) || Number(courseData.price) === 0,
          discount: '',
          intro: courseData.intro_message || courseData.description || '',
          audience: courseData.target_audience || '',
          category: courseData.category || '',
          objectives: courseData.objectives || '',
        });

        // set chapters if available
        const ch = data?.chapters || data?.data?.chapters || courseData.chapters || [];
        setChapters(Array.isArray(ch) ? ch : []);

        // set weeks if available
        const w = data?.weeks || data?.data?.weeks || courseData.weeks || [];
        setWeeks(Array.isArray(w) ? w : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load');
        setCourse(null);
        setChapters([]);
        setWeeks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const init = async () => {
      if (inboundId) return loadCourse(inboundId);
      setLoading(false);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [inboundId]);

  // Group chapters by week if weeks list is empty but chapters exist
  useEffect(() => {
    if (weeks.length === 0 && chapters.length > 0) {
      const grouped = [];
      chapters.forEach((c) => {
        const weekNum = c.week_number || 1;
        let wk = grouped.find(w => w.week_number === weekNum);
        if (!wk) {
          wk = { id: `week-${weekNum}`, week_number: weekNum, title: `Week ${weekNum}`, chapters: [] };
          grouped.push(wk);
        }
        wk.chapters.push(c);
      });
      grouped.sort((a, b) => a.week_number - b.week_number);
      setWeeks(grouped);
    }
  }, [chapters, weeks]);

  const featureList = [
    { icon: fe1, label: course?.duration || '—' },
    { icon: fe2, label: course?.weekly || '—' },
    { icon: fe3, label: 'Digital certificate when eligible' },
    { icon: fe4, label: course?.level || '' },
    { icon: fe5, label: 'Project Feedbacks' },
  ];

  const stats = [
    { label: 'Duration', value: course?.duration || '—', icon: acCal },
    { label: 'Weekly study', value: course?.weekly || '—', icon: acCal },
    { label: 'Skill Level', value: course?.level || '—', icon: acUs },
    { label: 'subscription', value: course?.price || '—', icon: acBook },
  ];

  const breakdownWeeks = Array.isArray(weeks) ? weeks : [];
  const hasBreakdown = breakdownWeeks.length > 0;
  const hasOutcomes = !!course?.objectives;
  const hasAudience = !!course?.audience;
  const showContentSections = !loading && inboundId && (hasBreakdown || hasOutcomes || hasAudience);
  const missingCourseId = !inboundId;
  const enrollmentReturnPath = inboundId ? `/academia/learner/course-part?id=${inboundId}` : '/academia/learner/courses';
  const requiresPaymentSetup = Boolean(course && !isCourseFree(course) && !paymentsLoading && !hasSavedPaymentMethods(savedPaymentMethods));

  useEffect(() => {
    const courseTitle = course?.title?.trim();
    document.title = courseTitle
      ? learnerPageTitle(`${courseTitle} · Course details`)
      : learnerPageTitle('Course details');
    return () => {
      document.title = LEARNER_PRODUCT_NAME;
    };
  }, [course?.title]);

  return (
    <section className="learners-course-part-page">
      <section className="learners-home-title">
        <div className="learners-home-title-top">
          <h1>Course details</h1>

          <div className="learners-home-title-actions">
            <SavedLibraryButton />
            <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
              <span>Go to website</span>
              <img src={hoagoto} alt="Go" />
            </a>
          </div>
        </div>
      </section>

      <div className="filters-grid-b-h">
        <button type="button" onClick={() => navigate('/academia/learner/courses')}>
          <img src={acLe} alt="back" />
        </button>
        <div>
          <p>{course?.category || 'Course catalog'}</p>
          <span>/</span>
          <span>{course?.title || 'Details'}</span>
          <span>/</span>
        </div>
      </div>

      <section className="learners-course-specific">
        <div className="learners-course-specific-head">
          <div>
            <h1>{loading ? 'Loading...' : course?.title || 'Untitled course'}</h1>
            <p>
              Prepared by <strong>{loading ? '...' : course?.author || 'Author'}</strong>
            </p>
            {isEnrolled && !loading ? (
              <p className="learners-course-specific-progress">{courseProgressPercent}% complete</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <LearnerLoadError
            title="Could not load course"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : null}

        <div className="learners-course-specific-grid">
          <div className="learners-course-specific-main">
            <section className="learners-course-specific-hero">
              <div className="learners-course-specific-hero-copy">
                <h2>{course?.headline || ''}</h2>
                <p>{course?.summary || ''}</p>
              </div>

              <div className="learners-course-specific-media-wrap">
                  <div className="learners-course-specific-media">
                    <img src={course?.image || acOn} alt={course?.title || ''} />
                  </div>

                <div className="learners-course-specific-stats">
                  {stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`learners-course-specific-stat${index === stats.length - 1 ? ' learners-course-specific-stat-price' : ''}`}
                    >
                      <div className="learners-course-specific-stat-top">
                        <img src={stat.icon} alt="" />
                        <span>{stat.label}</span>
                      </div>
                      <strong>{stat.value}</strong>
                      {index === stats.length - 1 && <small>{course?.discount}</small>}
                    </div>
                    ))}
                </div>
              </div>
            </section>

            {missingCourseId ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>Select a course</h3>
                <p>Open a course from the catalog to view its details, syllabus, and enrollment options.</p>
                <div>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              </div>
            ) : showContentSections ? (
              <>
                <section className="learners-course-specific-section">
                  <h3>Introduction</h3>
                  <p>
                    {course?.intro && course.intro.length > 200 && !isSummaryExpanded
                      ? `${course.intro.slice(0, 200)}...`
                      : course?.intro || ''}
                    {course?.intro && course.intro.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#5B0A86',
                          fontWeight: 600,
                          marginLeft: '6px',
                          padding: 0,
                          fontSize: '12px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {isSummaryExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </p>
                </section>

                {hasBreakdown && (
                  <section className="learners-course-specific-section learners-course-specific-syllabus-wrap">
                    <h3 className="oc-section-title">Course Breakdown</h3>
                    <div className="oc-breakdown-list">
                      {breakdownWeeks.length > 0 ? (
                        breakdownWeeks.map((week, wIdx) => (
                          <div className="oc-bd-week-group" key={week.id || wIdx}>
                            <div className="oc-bd-week-col">
                              <div className="oc-bd-week">{week.title || `Week ${week.week_number || wIdx + 1}`}</div>
                            </div>
                            <div className="oc-bd-items-col">
                              <div className="oc-bd-item">
                                <div className="oc-bd-icon-col">
                                  <div className="oc-bd-icon"><img src={hoabasics} alt="" /></div>
                                  {week.chapters && week.chapters.length > 0 && <div className="oc-bd-line"></div>}
                                </div>
                                <div className="oc-bd-content" style={{ paddingBottom: (week.description || week.learning_objectives) ? 24 : 0 }}>
                                  {(week.description || week.learning_objectives) ? (
                                    <>
                                      {week.description ? (
                                        <h4 style={{
                                          margin: '0 0 4px 0',
                                          fontSize: 14,
                                          color: '#071437',
                                          fontWeight: 600,
                                          display: '-webkit-box',
                                          WebkitLineClamp: '2',
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {week.description}
                                        </h4>
                                      ) : null}
                                      {week.learning_objectives ? (
                                        <p style={{
                                          margin: 0,
                                          fontSize: 13,
                                          color: '#4B5675',
                                          display: '-webkit-box',
                                          WebkitLineClamp: '3',
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {week.learning_objectives.replace(/"/g, '')}
                                        </p>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              {week.chapters && week.chapters.map((chap, cIdx) => (
                                <div className="oc-bd-item" key={chap.id || cIdx}>
                                  <div className="oc-bd-icon-col">
                                    <div className="oc-bd-icon" style={{ color: '#450468', fontSize: 12, fontWeight: 700 }}>
                                      {cIdx + 1}
                                    </div>
                                    {cIdx !== week.chapters.length - 1 && <div className="oc-bd-line"></div>}
                                  </div>
                                  <div className="oc-bd-content" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: cIdx !== week.chapters.length - 1 ? 24 : 0, cursor: isEnrolled ? 'pointer' : 'default' }} onClick={() => {
                                    if (isEnrolled) {
                                      navigate(`/academia/learner/read-contents?id=${course?.id}&chapterId=${encodeURIComponent(chap.id)}`);
                                    }
                                  }}>
                                    {chap.thumbnail ? (
                                      <img src={resolveAssetUrl(chap.thumbnail)} alt="thumb" style={{ width: 80, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: 80, height: 60, borderRadius: 4, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9CA3AF' }}>No Video</div>
                                    )}
                                    <div>
                                      <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#071437', fontWeight: 600 }}>{chap.title}</h4>
                                      <p style={{ margin: 0, fontSize: 11, color: '#A1A5B7' }}>
                                        {[chap.subtitle, chap.duration ? `${chap.duration} mins` : ''].filter(Boolean).join(' • ') || 'Lesson content'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '13px', color: '#78829D' }}>No breakdown structure uploaded for this course yet.</p>
                      )}
                    </div>
                  </section>
                )}

                {course?.audience && (
                  <section className="learners-course-specific-section learners-course-specific-audience">
                    <h3>Who is the course for?</h3>
                    <div className="learners-audience-content" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.audience) }} />
                  </section>
                )}

                {hasOutcomes && (
                  <section className="learners-course-specific-section learners-course-specific-outcomes">
                    <h3>What will you achieve?</h3>
                    <div className="learners-outcomes-content" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.objectives) }} />
                  </section>
                )}
              </>
            ) : (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>No content published</h3>
                <p className="visually-hidden">No course breakdown or outcomes available for this course.</p>
                <div>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="learners-course-specific-side">
            <div className="learners-course-specific-side-card">
              <h3>{course?.headline}</h3>

              <div className="learners-course-specific-features">
                {featureList.map((f, idx) => (
                  <div key={`${f.label}-${idx}`} className="learners-course-specific-feature">
                    <img src={f.icon} alt="" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {isEnrolled ? (
                <button type="button" className="learners-course-specific-cta" onClick={() => navigate(buildReaderUrl(course.id))}>
                  <span>Continue learning</span>
                  <img src={hoagoto} alt="Go" />
                </button>
              ) : (
                <>
                  {!isEnrolled && (
                    <EnrollmentPaymentPicker
                      choices={paymentChoices}
                      value={selectedPaymentValue}
                      onChange={setSelectedPaymentValue}
                      loading={paymentsLoading}
                      requiresPaymentSetup={requiresPaymentSetup}
                      accountHref={buildAccountPaymentHref(enrollmentReturnPath)}
                    />
                  )}
                  <button type="button" className="learners-course-specific-cta" onClick={handleJoinToday} disabled={isEnrolling || paymentsLoading || requiresPaymentSetup}>
                    <span>{isEnrolling ? 'Joining...' : (isCourseFree(course) ? 'Enroll for free' : 'Join Today')}</span>
                    <img src={jo1} alt="Join" />
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>

        <section className="learners-course-specific-author-card" aria-label="Course author">
          <div className="learners-course-specific-author-card-inner">
            <div className="learners-course-specific-author-avatar">
              <img src={course?.authorImage || defaultProfile} alt={course?.author || 'Author'} />
            </div>

            <div className="learners-course-specific-author-copy">
              <h3>{course?.author}</h3>
              <p className="learners-course-specific-author-role">{course?.authorRole}</p>

              <div className="learners-course-specific-author-meta">
                <span>Published on</span>
                <span aria-hidden>|</span>
                <span>{course?.publishedOn}</span>
              </div>
            </div>
          </div>
        </section>

      </section>
      {toast.visible && (
        <div className={`toast-notification is-${toast.tone}`} role="alert" aria-live="assertive">
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  );
}

export default CoursePart;
