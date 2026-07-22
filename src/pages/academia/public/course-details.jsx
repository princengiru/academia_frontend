import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Import Icons & Images (same as CoursePart for visual parity but adapted for public shell)
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
import arrowUpRight from '../../../assets/icons/arrow-up-right.svg';
import playIcon from '../../../assets/icons/play.svg';
import jo1 from '../../../assets/icons/jo1.svg';
import acSms from '../../../assets/icons/ac-sms.svg';
import acSend from '../../../assets/icons/ac-send.svg';
import './course-details.css';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { sharePublicPage, buildCourseDetailsPath, buildAuthorPath } from './publicShare';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

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

function AcademiaCourseDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inboundId = searchParams.get('id');
  const coursePublicRef = inboundId || null;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false, tone: 'success' });
  const [retryKey, setRetryKey] = useState(0);
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  usePublicPageTitle(course?.title || 'Course details');

  const resolvedCourseId = course?.id || null;
  const readerId = coursePublicRef || course?.uuid || course?.id || null;

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

  const handleAuthor = () => {
    const authorRef = course?.authorUuid || course?.authorId;
    if (authorRef) {
      navigate(buildAuthorPath(authorRef));
      return;
    }
    navigate('/academia/courses');
  };

  const handleShareCourse = async () => {
    const result = await sharePublicPage({
      title: course?.title || 'Course',
      text: course?.summary || course?.intro || '',
    });
    if (result.ok && result.method === 'clipboard') {
      showToast('Course link copied to clipboard.');
    } else if (!result.ok && result.method === 'none') {
      showToast('Unable to share this course from your browser.', 'error');
    }
  };

  // Check enrollment if logged in
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      const courseKey = resolvedCourseId || inboundId;
      if (!token || !courseKey) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          const progressList = body?.data?.progress || body?.progress || [];
          const enrolled = progressList.some((p) => {
            const progressCourseId = p.course_id ?? p.courseId;
            if (resolvedCourseId != null && Number(progressCourseId) === Number(resolvedCourseId)) return true;
            return String(progressCourseId) === String(courseKey);
          });
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Failed to check enrollment status:", err);
      }
    };
    checkEnrollmentStatus();
  }, [inboundId, resolvedCourseId]);

  // Handle Enrollment
  const handleEnrollment = async (e) => {
    if (e) e.preventDefault();
    if (!readerId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', `${buildCourseDetailsPath(readerId)}&enroll=true`);
      navigate('/academia/auth/signin');
      return;
    }

    // Role check to prevent Admin or Instructor from enrolling
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = (userObj.role || '').toLowerCase().trim();
    if (userRole && userRole !== 'student') {
      showToast("Only student accounts can enroll in courses.", "warning");
      return;
    }

    const enrollKey = resolvedCourseId || readerId;
    setIsEnrolling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${enrollKey}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_method: 'credit_card'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to enroll in the course.');
      }
      setIsEnrolled(true);
      showToast("Successfully enrolled!", "success");
      setTimeout(() => {
        navigate(`/academia/learner/read-contents?id=${encodeURIComponent(String(readerId))}`, { state: { courseId: readerId } });
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to enroll in the course.', 'danger');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Auto enroll if redirected from login page with enroll=true param
  useEffect(() => {
    const checkAutoEnroll = async () => {
      const token = localStorage.getItem('token');
      const shouldEnroll = searchParams.get('enroll') === 'true';

      // Check role - only students should auto-enroll. Otherwise, ignore.
      const userObj = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = (userObj.role || '').toLowerCase().trim();
      if (token && userRole && userRole !== 'student') {
        return;
      }

      if (token && shouldEnroll && course && !isEnrolled && !isEnrolling) {
        setIsEnrolling(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/courses/${course.id}/enroll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              payment_method: 'credit_card'
            })
          });
          const data = await res.json();
          if (res.ok) {
            setIsEnrolled(true);
            showToast("Successfully enrolled!", "success");
            setTimeout(() => {
              navigate(`/academia/learner/read-contents?id=${encodeURIComponent(String(readerId || course.uuid || course.id))}`, { replace: true });
            }, 1000);
          } else {
            if (data.message && data.message.toLowerCase().includes('already enrolled')) {
              setIsEnrolled(true);
              navigate(`/academia/learner/read-contents?id=${encodeURIComponent(String(readerId || course.uuid || course.id))}`, { replace: true });
            } else {
              showToast(data.message || 'Auto enrollment failed.', 'danger');
            }
          }
        } catch (err) {
          console.error("Auto enrollment error:", err);
        } finally {
          setIsEnrolling(false);
        }
      }
    };
    checkAutoEnroll();
  }, [course, isEnrolled, isEnrolling, searchParams, navigate, readerId]);

  // Load Course Details
  useEffect(() => {
    let cancelled = false;

    const loadCourse = async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load course details');

        const data = extractBody(body);
        const courseData = data?.data || data?.course || data || {};

        if (cancelled) return;

        const publicRef = courseData.course_uuid || courseData.uuid || null;
        const numericId = courseData.id || null;

        if (publicRef && String(searchParams.get('id') || '') === String(numericId)) {
          const next = new URLSearchParams(searchParams);
          next.set('id', String(publicRef));
          setSearchParams(next, { replace: true });
        }

        setCourse({
          id: numericId,
          uuid: publicRef,
          title: courseData.title,
          author: courseData.instructor_name || courseData.author,
          authorId: courseData.instructor_id || courseData.user_id || courseData.created_by || null,
          authorUuid: courseData.instructor_uuid || courseData.user_uuid || null,
          authorImage: courseData.instructor_avatar ? resolveAssetUrl(courseData.instructor_avatar) : defaultProfile,
          authorRole: 'Instructor',
          publishedOn: courseData.created_at,
          headline: courseData.subtitle || courseData.title,
          summary: courseData.description || '',
          image: courseData.thumbnail ? resolveAssetUrl(courseData.thumbnail) : acOn,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : '',
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : '',
          level: courseData.level || '',
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : 'Free'),
          discount: '',
          intro: courseData.intro_message || courseData.description || '',
          audience: courseData.target_audience || '',
          category: courseData.category || '',
          objectives: courseData.objectives || '',
        });

        const ch = data?.chapters || data?.data?.chapters || courseData.chapters || [];
        setChapters(Array.isArray(ch) ? ch : []);

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

    if (inboundId) {
      loadCourse(inboundId);
    } else {
      setError("No course selected.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [inboundId, retryKey]);

  // Fallback week grouping if weeks are empty but chapters exist
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
    { icon: fe1, label: course?.duration || 'Self-paced' },
    { icon: fe2, label: course?.weekly || 'Flexible schedule' },
    { icon: fe3, label: 'Digital certificate upon completion' },
    { icon: fe4, label: course?.level || 'Beginner to Advanced' },
    { icon: fe5, label: 'Professional feedback' },
  ];

  const stats = [
    { label: 'Duration', value: course?.duration || 'Self-paced', icon: acCal },
    { label: 'Weekly study', value: course?.weekly || 'Flexible', icon: acCal },
    { label: 'Skill Level', value: course?.level || 'All levels', icon: acUs },
    { label: 'Subscription', value: course?.price || 'Free', icon: acBook },
  ];

  const breakdownWeeks = Array.isArray(weeks) ? weeks : [];
  const hasBreakdown = breakdownWeeks.length > 0;
  const hasOutcomes = !!course?.objectives;
  const hasAudience = !!course?.audience;
  const showContentSections = !loading && (hasBreakdown || hasOutcomes || hasAudience);

  if (loading) {
    return <PublicLoading message="Loading course details…" />;
  }

  if (error || !course) {
    return (
      <PublicLoadError
        title="Course unavailable"
        message={error || 'Course not found.'}
        onRetry={() => setRetryKey((key) => key + 1)}
        backTo="/academia/courses"
        backLabel="Browse courses"
      />
    );
  }

  return (
    <div className="public-course-details-page">
      <div className="breadcrumb-nav">
        <button type="button" onClick={() => navigate('/academia/index')} className="back-btn">
          <img src={acLe} alt="back" />
        </button>
        <div className="crumbs">
          <span>Academia</span>
          <span className="sep">/</span>
          <span>{course.category?.name || course.category || 'Courses'}</span>
          <span className="sep">/</span>
          <span className="active">{course.title}</span>
        </div>
      </div>

      <div className="course-hero-banner">
        <div className="course-hero-content">
          <h1>{course.title}</h1>
          <p className="instructor-by">
            Course syllabus prepared by <strong>{course.author}</strong>
          </p>
        </div>
      </div>

      <div className="course-details-container">
        <div className="course-details-grid">
          <div className="course-main-column">
            
            <section className="course-intro-banner">
              <h2>{course.headline}</h2>
              <div className="summary-text" dangerouslySetInnerHTML={{ __html: cleanDescriptionHtml(course.summary) }} />
              
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
                            <span className="week-tag">{week.title || `Week ${week.week_number || wIdx + 1}`}</span>
                          </div>
                          <div className="week-details">
                            <div className="week-intro-card">
                              <div className="timeline-connector">
                                <div className="dot-icon"><img src={hoabasics} alt="" /></div>
                                {week.chapters && week.chapters.length > 0 && <div className="connector-line"></div>}
                              </div>
                              <div className="timeline-details">
                                <h4>{week.description || 'Weekly Module Overview'}</h4>
                                <p>{week.learning_objectives ? week.learning_objectives.replace(/"/g, '') : 'Deep dive into essential skills and exercises.'}</p>
                              </div>
                            </div>

                            {week.chapters && week.chapters.map((chap, cIdx) => (
                              <div className="curriculum-chapter-item" key={chap.id || cIdx}>
                                <div className="timeline-connector">
                                  <div className="chapter-number">{cIdx + 1}</div>
                                  {cIdx !== week.chapters.length - 1 && <div className="connector-line"></div>}
                                </div>
                                <div className="timeline-details chapter-card-content">
                                  {chap.thumbnail ? (
                                    <img src={resolveAssetUrl(chap.thumbnail)} alt="" className="chapter-thumb" />
                                  ) : (
                                    <div className="chapter-no-thumb">Lecture</div>
                                  )}
                                  <div className="chapter-meta">
                                    <h5>{chap.title}</h5>
                                    <p>{chap.subtitle || 'Chapter Details'} • {chap.duration ? `${chap.duration} mins` : 'Video lecture'}</p>
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
                    <div className="html-render-wrap" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.audience) }} />
                  </section>
                )}

                {hasOutcomes && (
                  <section className="course-section-block">
                    <h3>What will you achieve?</h3>
                    <div className="html-render-wrap" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.objectives) }} />
                  </section>
                )}

              </div>
            ) : (
              <div className="empty-course-fallback">
                <h3>No curriculum outline published yet</h3>
                <p>Check back soon or enroll to get notified once lectures are live.</p>
              </div>
            )}

            <section className="instructor-bio-card">
              <div
                className="instructor-card-inner"
                role={(course.authorUuid || course.authorId) ? 'button' : undefined}
                tabIndex={(course.authorUuid || course.authorId) ? 0 : undefined}
                onClick={(course.authorUuid || course.authorId) ? handleAuthor : undefined}
                onKeyDown={(course.authorUuid || course.authorId) ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') handleAuthor();
                } : undefined}
                style={(course.authorUuid || course.authorId) ? { cursor: 'pointer' } : undefined}
              >
                <div className="instructor-avatar-wrap">
                  <img src={course.authorImage} alt={course.author} onError={(e) => { e.target.src = defaultProfile; }} />
                </div>
                <div className="instructor-bio-text">
                  <h4>{course.author}</h4>
                  <p className="instructor-role">{course.authorRole || 'Lead Instructor'}</p>
                  <p className="pub-date">Published on {new Date(course.publishedOn || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

          </div>

          <aside className="course-sidebar-column">
            <div className="sidebar-sticky-enroll-card">
              <h3 className="sidebar-title">{course.title}</h3>
              <p className="sidebar-subtitle">By {course.author}</p>
              
              <div className="sidebar-features-list">
                {featureList.map((f, i) => (
                  <div key={i} className="feature-item">
                    <img src={f.icon} alt="" className="feature-icon" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {(() => {
                const token = localStorage.getItem('token');
                const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                const userRole = (userObj.role || '').toLowerCase().trim();

                if (token && userRole === 'admin') {
                  return (
                    <button
                      type="button"
                      className="enroll-cta-btn go-course"
                      onClick={() => navigate('/academia/hoa')}
                    >
                      <span>Go to Admin Panel</span>
                      <img src={arrowUpRight} alt="" />
                    </button>
                  );
                }

                if (token && userRole === 'instructor') {
                  return (
                    <button
                      type="button"
                      className="enroll-cta-btn go-course"
                      onClick={() => navigate('/academia/professor')}
                    >
                      <span>Go to Instructor Panel</span>
                      <img src={arrowUpRight} alt="" />
                    </button>
                  );
                }

                if (isEnrolled) {
                  return (
                    <button
                      type="button"
                      className="enroll-cta-btn go-course"
                      onClick={() => navigate(`/academia/learner/read-contents?id=${encodeURIComponent(String(readerId))}`, { state: { courseId: readerId } })}
                    >
                      <span>Go to Course Workspace</span>
                      <img src={arrowUpRight} alt="" />
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    className="enroll-cta-btn"
                    onClick={handleEnrollment}
                    disabled={isEnrolling}
                  >
                    <span>
                      {!token
                        ? 'Sign in to enroll'
                        : isEnrolling
                          ? 'Enrolling...'
                          : 'Enroll / Join Today'}
                    </span>
                    <img src={jo1} alt="" />
                  </button>
                );
              })()}
            </div>
          </aside>
        </div>

        <section className="course-footer-newsletter">
          <div className="newsletter-half left-half">
            <h3>Find the right course for you</h3>
            <p>See your personalised recommendations based on your interests and goals.</p>
            <div className="social-links-row">
              <button type="button" className="course-share-btn" onClick={handleShareCourse}>
                Share this course
              </button>
            </div>
          </div>
          <div className="newsletter-half right-half">
            <h3>Newsletter</h3>
            <p>Product updates will be announced here when newsletter subscriptions open.</p>
            <form className="newsletter-form-block" onSubmit={handleNewsletterSubmit}>
              <img src={acSms} alt="" className="newsletter-mail-icon" />
              <input
                type="email"
                placeholder="Enter email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                aria-label="Enter email address"
              />
              <button type="submit" aria-label="Submit email">
                <img src={acSend} alt="" />
              </button>
            </form>
            <PublicNewsletterNotice message={newsletterNotice} />
          </div>
        </section>
      </div>

      {toast.visible && (
        <div className={`toast-notification is-${toast.tone}`} role="alert">
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AcademiaCourseDetails;
