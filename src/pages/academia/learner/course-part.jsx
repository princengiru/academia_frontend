import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';

// Assets (kept as imports so bundler resolves them)
import acOn from '../../../assets/imgs/ac-on.jpg';
import profImg from '../../../assets/imgs/prof.jpg';
import fe1 from '../../../assets/icons/fe1.svg';
import fe2 from '../../../assets/icons/fe2.svg';
import fe3 from '../../../assets/icons/fe3.svg';
import fe4 from '../../../assets/icons/fe4.svg';
import fe5 from '../../../assets/icons/fe5.svg';
import acCal from '../../../assets/icons/ac-cal.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acUs from '../../../assets/icons/ac-us.svg';
import acBook from '../../../assets/icons/ac-book.svg';
import leTec from '../../../assets/icons/le-tec.svg';
import arrowUpRight from '../../../assets/icons/arrow-up-right.svg';
import playIcon from '../../../assets/icons/play.svg';
import jo1 from '../../../assets/icons/jo1.svg';
import dtiktok from '../../../assets/icons/dtiktok.svg';
import dwhat from '../../../assets/icons/dwhat.svg';
import dfaceb from '../../../assets/icons/dfaceb.svg';
import dinstagram from '../../../assets/icons/dinstagram.svg';
import acSms from '../../../assets/icons/ac-sms.svg';
import acSend from '../../../assets/icons/ac-send.svg';
import './course-part.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

function CoursePart() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false, tone: 'success' });
  const [expandedChapters, setExpandedChapters] = useState({});
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

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

  const inboundId = location.state?.courseId || searchParams.get('id');
  const navigate = useNavigate();

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
      if (!res.ok) {
        throw new Error(data.message || 'Failed to enroll in the course.');
      }
      setIsEnrolled(true);
      navigate(`/academia/learner/read-contents?id=${course.id}`, { state: { courseId: course.id } });
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
          authorImage: profImg,
          authorRole: 'Author',
          publishedOn: courseData.created_at,
          headline: courseData.subtitle || courseData.title,
          summary: courseData.description || '',
          image: courseData.thumbnail ? (courseData.thumbnail.startsWith('/') ? `${API_BASE_URL}${courseData.thumbnail}` : courseData.thumbnail) : acOn,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : '',
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : '',
          level: courseData.level || '',
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : ''),
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

      // fallback: load first available course
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=1`);
        const body = await res.json();
        const list = extractBody(body);
        const first = Array.isArray(list) ? list[0] : list?.data?.[0] || null;
        if (first && first.id) {
          return loadCourse(first.id);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
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

  const activeWeek = weeks[activeWeekIndex];
  const activeChapters = activeWeek ? (activeWeek.chapters || []) : [];

  const hasSyllabus = Array.isArray(weeks) && weeks.length > 0;
  const hasOutcomes = !!course?.objectives;
  const hasAudience = !!course?.audience;
  const showContentSections = !loading && (hasSyllabus || hasOutcomes || hasAudience);

  return (
    <section className="learners-course-part-page">
      <section className="learners-home-title">
        <div className="learners-home-title-top">
          <h1>Courses</h1>

          <div className="learners-home-title-actions">
            <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => e.preventDefault()}>
              <img src={fe1} alt="" />
              <span>Saved Library</span>
            </a>
            <a className="learners-btn learners-btn-primary" href="#" onClick={(e) => e.preventDefault()}>
              <span>Go to website</span>
              <img src={arrowUpRight} alt="" />
            </a>
          </div>
        </div>
      </section>

      <div className="filters-grid-b-h">
        <button type="button" onClick={() => navigate('/academia/learner/courses')}>
          <img src={acLe} alt="back" />
        </button>
        <div>
          <p>{course?.category || 'Courses'}</p>
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
          </div>
        </div>

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

            {showContentSections ? (
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

                {hasSyllabus && (
                  <section className="learners-course-specific-section learners-course-specific-syllabus-wrap">
                    <h3>Syllabus</h3>

                    <div className="learners-course-specific-syllabus-grid">
                      <div className="learners-course-specific-weeks">
                        {loading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <button key={`wk-loading-${i}`} type="button" className={`learners-course-week learners-loading`}>
                              <span>Loading…</span>
                            </button>
                          ))
                        ) : weeks.length === 0 ? (
                          <div className="learners-empty">No weeks available for this course.</div>
                        ) : (
                          weeks.map((week, wi) => (
                            <button
                              key={week.id || wi}
                              type="button"
                              className={`learners-course-week${wi === activeWeekIndex ? ' active' : ''}`}
                              onClick={() => setActiveWeekIndex(wi)}
                            >
                              <span>Week {week.week_number || (wi + 1)}</span>
                              {wi === activeWeekIndex && <img src={arrowUpRight} alt="Current" />}
                            </button>
                          ))
                        )}
                      </div>

                      <div className="learners-course-specific-syllabus-list">
                        <div className="learners-course-specific-syllabus-intro">
                          <div className="learners-course-specific-step active">
                            <span className="learners-course-specific-step-icon" aria-hidden>
                              <img src={leTec} alt="" />
                            </span>
                          </div>
                          <div>
                            {course?.syllabus_intro_title ? <h4>{course.syllabus_intro_title}</h4> : null}
                            {course?.syllabus_intro ? <p>{course.syllabus_intro}</p> : null}
                          </div>
                        </div>

                        {loading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <article key={`sy-loading-${i}`} className="learners-course-specific-syllabus-item learners-loading-card">
                              <div className="learners-course-specific-step">&nbsp;</div>
                              <div className="learners-course-specific-syllabus-thumb learners-loading-thumb">&nbsp;</div>
                              <div className="learners-course-specific-syllabus-copy">
                                <h4>Loading…</h4>
                                <p>&nbsp;</p>
                              </div>
                            </article>
                          ))
                        ) : activeChapters.length === 0 ? (
                          <div className="learners-empty">No chapters available for this week.</div>
                        ) : (
                          <div style={{ position: 'relative' }}>
                            <div className={!isEnrolled ? "blur-locked-syllabus" : ""} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {activeChapters.map((ch, idx) => {
                                const isExpanded = !!expandedChapters[ch.id];
                                const needsTruncation = ch.intro_message && ch.intro_message.length > 120;
                                const displayText = needsTruncation && !isExpanded 
                                  ? `${ch.intro_message.slice(0, 120)}...` 
                                  : ch.intro_message || '';
                                return (
                                  <article 
                                    key={ch.id} 
                                    className="learners-course-specific-syllabus-item"
                                    style={{ cursor: isEnrolled ? 'pointer' : 'default' }}
                                    onClick={() => {
                                      if (isEnrolled) {
                                        navigate('/academia/learner/read-contents', { state: { courseId: course?.id, chapterId: ch.id } });
                                      }
                                    }}
                                  >
                                    <div className="learners-course-specific-step">
                                      {!isEnrolled ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                          </svg>
                                        </span>
                                      ) : (
                                        <span>{idx + 1}</span>
                                      )}
                                    </div>
                                    <div className="learners-course-specific-syllabus-thumb">
                                      <img src={ch.thumbnail ? resolveAssetUrl(ch.thumbnail) : acOn} alt={ch.title} />
                                    </div>
                                    <div className="learners-course-specific-syllabus-copy">
                                      <h4>{ch.title}</h4>
                                      <p>
                                        {displayText}
                                        {needsTruncation && (
                                          <button 
                                            type="button" 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setExpandedChapters(prev => ({ ...prev, [ch.id]: !isExpanded }));
                                            }}
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              color: '#5B0A86',
                                              fontWeight: 600,
                                              marginLeft: '6px',
                                              padding: 0,
                                              fontSize: '11px',
                                              cursor: 'pointer',
                                              textDecoration: 'underline'
                                            }}
                                          >
                                            {isExpanded ? 'Read less' : 'Read more'}
                                          </button>
                                        )}
                                      </p>
                                    </div>
                                  </article>
                                );
                              })}
                            </div>
                            
                            {!isEnrolled && (
                              <div className="learners-syllabus-lock-overlay" style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 255, 255, 0.4)',
                                backdropFilter: 'blur(1px)',
                                borderRadius: '12px',
                                zIndex: 5,
                                padding: '24px',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  background: '#fff',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '12px',
                                  padding: '24px 32px',
                                  maxWidth: '400px',
                                  boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center'
                                }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(121, 40, 202, 0.08)',
                                    color: '#450468',
                                    marginBottom: '16px'
                                  }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                  </div>
                                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', color: '#0F172A', fontFamily: 'Inter, sans-serif' }}>Curriculum Content Locked</h4>
                                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.4, fontFamily: 'Inter, sans-serif' }}>Enroll in the course to unlock chapters, reading contents, exercise questions, and assessments.</p>
                                  <button 
                                    type="button" 
                                    className="learners-btn learners-btn-primary" 
                                    style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}
                                    onClick={handleJoinToday}
                                    disabled={isEnrolling}
                                  >
                                    <span>{isEnrolling ? 'Joining...' : 'Unlock Content'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
                <p className="visually-hidden">No syllabus or outcomes available for this course.</p>
                <div>
                  <button className="learners-btn learners-btn-primary" disabled>Browse courses</button>
                  <button className="learners-btn learners-btn-secondary" disabled>Contact author</button>
                </div>
              </div>
            )}
          </div>

          <aside className="learners-course-specific-side">
            <div className="learners-course-specific-side-card">
              <h3>{course?.headline}</h3>

              <div className="learners-course-specific-features">
                {featureList.map((f) => (
                  <div key={f.label} className="learners-course-specific-feature">
                    <img src={f.icon} alt="" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {hasSyllabus ? (
                <a 
                  className="learners-course-specific-cta learners-course-specific-cta-secondary" 
                  href="/academia/learner/read-contents" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (isEnrolled) {
                      navigate('/academia/learner/read-contents', { state: { courseId: course?.id } }); 
                    } else {
                      handleJoinToday(e);
                    }
                  }}
                >
                  <span>Course contents</span>
                  <img src={playIcon} alt="Course contents" />
                </a>
              ) : (
                <div className="learners-course-specific-no-contents">
                  <small>No contents published yet</small>
                </div>
              )}

              {isEnrolled ? (
                <button type="button" className="learners-course-specific-cta" onClick={() => navigate(`/academia/learner/read-contents?id=${course.id}`, { state: { courseId: course.id } })}>
                  <span>Go to Course</span>
                  <img src={arrowUpRight} alt="Go" />
                </button>
              ) : (
                <button type="button" className="learners-course-specific-cta" onClick={handleJoinToday} disabled={isEnrolling}>
                  <span>{isEnrolling ? 'Joining...' : 'Join Today'}</span>
                  <img src={jo1} alt="Join" />
                </button>
              )}
            </div>
          </aside>
        </div>

        <section className="learners-course-specific-author-card" aria-label="Course author">
          <div className="learners-course-specific-author-card-inner">
            <div className="learners-course-specific-author-avatar">
              <img src={course?.authorImage || profImg} alt={course?.author || 'Author'} />
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

        <section className="learners-course-specific-newsletter" aria-label="Newsletter signup">
          <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-copy">
            <h3>Find the right course for you</h3>
            <p>See your personalised recommendations based on your interests and goals.</p>

            <div className="learners-course-specific-newsletter-socials">
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

          <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-form">
            <h3>Stay tune and get the latest update</h3>
            <p>See your personalised recommendations based on your interests and goals.</p>

            <form className="learners-course-specific-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <img src={acSms} alt="" className="learners-course-specific-newsletter-mail" />
              <input type="email" placeholder="Enter email address" aria-label="Enter email address" />
              <button type="submit" aria-label="Submit email">
                <img src={acSend} alt="" />
              </button>
            </form>
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
