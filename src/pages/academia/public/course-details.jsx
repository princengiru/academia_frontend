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
import dtiktok from '../../../assets/icons/dtiktok.svg';
import dwhat from '../../../assets/icons/dwhat.svg';
import dfaceb from '../../../assets/icons/dfaceb.svg';
import dinstagram from '../../../assets/icons/dinstagram.svg';
import acSms from '../../../assets/icons/ac-sms.svg';
import acSend from '../../../assets/icons/ac-send.svg';
import './course-details.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

function AcademiaCourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false, tone: 'success' });

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

  // Check enrollment if logged in
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !courseId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const body = await res.json();
          const progressList = body?.data?.progress || body?.progress || [];
          const enrolled = progressList.some(p => Number(p.course_id) === Number(courseId));
          setIsEnrolled(enrolled);
        }
      } catch (err) {
        console.error("Failed to check enrollment status:", err);
      }
    };
    checkEnrollmentStatus();
  }, [courseId]);

  // Handle Enrollment
  const handleEnrollment = async (e) => {
    if (e) e.preventDefault();
    if (!courseId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      // Save redirect query so user is auto-enrolled on return
      sessionStorage.setItem('redirectAfterLogin', `/academia/course-details?id=${courseId}&enroll=true`);
      showToast("Please sign in or sign up to enroll in this course.", "warning");
      setTimeout(() => {
        navigate('/academia/auth/signin');
      }, 1500);
      return;
    }

    // Role check to prevent Admin or Instructor from enrolling
    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = (userObj.role || '').toLowerCase().trim();
    if (userRole && userRole !== 'student') {
      showToast("Only student accounts can enroll in courses.", "warning");
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
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
        navigate(`/academia/learner/read-contents?id=${courseId}`, { state: { courseId: courseId } });
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
              navigate(`/academia/learner/read-contents?id=${course.id}`, { replace: true });
            }, 1000);
          } else {
            if (data.message && data.message.toLowerCase().includes('already enrolled')) {
              setIsEnrolled(true);
              navigate(`/academia/learner/read-contents?id=${course.id}`, { replace: true });
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
  }, [course, isEnrolled]);

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

        setCourse({
          id: courseData.id,
          title: courseData.title,
          author: courseData.instructor_name || courseData.author,
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

    if (courseId) {
      loadCourse(courseId);
    } else {
      setError("No course selected.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [courseId]);

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
    return (
      <div className="course-details-loading">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-details-error">
        <h3>Oops! Course details could not be loaded</h3>
        <p>{error || "Course not found."}</p>
        <button type="button" onClick={() => navigate('/academia/index')}>
          Go back home
        </button>
      </div>
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
              <p className="summary-text">{course.summary}</p>
              
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
                    <p className="overview-content">
                      {course.intro.length > 280 && !isSummaryExpanded
                        ? `${course.intro.slice(0, 280)}...`
                        : course.intro}
                      {course.intro.length > 280 && (
                        <button
                          type="button"
                          className="read-more-toggle-btn"
                          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        >
                          {isSummaryExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}
                    </p>
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
              <div className="instructor-card-inner">
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
                const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                const userRole = (userObj.role || '').toLowerCase().trim();
                const token = localStorage.getItem('token');

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
                      onClick={() => navigate(`/academia/learner/read-contents?id=${course.id}`, { state: { courseId: course.id } })}
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
                    <span>{isEnrolling ? 'Enrolling...' : 'Enroll / Join Today'}</span>
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
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok">
                <img src={dtiktok} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="WhatsApp">
                <img src={dwhat} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">
                <img src={dfaceb} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
                <img src={dinstagram} alt="" />
              </a>
            </div>
          </div>
          <div className="newsletter-half right-half">
            <h3>Stay tuned and get the latest updates</h3>
            <p>Get daily newsletters and notification updates about new resources.</p>
            <form className="newsletter-form-block" onSubmit={(e) => e.preventDefault()}>
              <img src={acSms} alt="" className="newsletter-mail-icon" />
              <input type="email" placeholder="Enter email address" required aria-label="Enter email address" />
              <button type="submit" aria-label="Submit email">
                <img src={acSend} alt="" />
              </button>
            </form>
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
