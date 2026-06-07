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
  const [error, setError] = useState(null);

  const inboundId = location.state?.courseId || searchParams.get('id');
  const navigate = useNavigate();

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
        });

        // set chapters if available
        const ch = data?.chapters || data?.data?.chapters || courseData.chapters || [];
        setChapters(Array.isArray(ch) ? ch : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load');
        setCourse(null);
        setChapters([]);
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

  const weeks = Array.isArray(chapters) && chapters.length ? chapters.map((_, i) => `Week ${i + 1}`) : [];

  const syllabusItems = Array.isArray(chapters) && chapters.length
    ? chapters.flatMap((ch, chIndex) => (Array.isArray(ch.exercises) ? ch.exercises.map((ex, exIndex) => ({ id: ex.id || `${chIndex + 1}.${exIndex + 1}`, title: ex.title || ex.name || ex.headline || 'Lesson', image: ex.thumbnail ? (ex.thumbnail.startsWith('/') ? `${API_BASE_URL}${ex.thumbnail}` : ex.thumbnail) : acOn })) : []))
    : [];

  const outcomes = course?.objectives ? (typeof course.objectives === 'string' ? course.objectives.split('\n') : Array.isArray(course.objectives) ? course.objectives : []) : [];

  const hasSyllabus = Array.isArray(chapters) && chapters.length > 0;
  const hasOutcomes = Array.isArray(outcomes) && outcomes.length > 0;
  const showContentSections = !loading && (hasSyllabus || hasOutcomes);

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
        <button type="button">
          <img src={acCal} alt="Left" />
        </button>
        <div>
          <p>Mathematics &amp; Science</p>
          <span>/</span>
          <span>Algebra</span>
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
                    {course?.intro || ''} {course?.intro ? <a href="#" onClick={(e) => e.preventDefault()}>Read more</a> : null}
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
                            <button key={`${week}-${wi}`} type="button" className={`learners-course-week${wi === 0 ? ' active' : ''}`}>
                              <span>{week}</span>
                              {wi === 0 && <img src={arrowUpRight} alt="Current" />}
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
                        ) : syllabusItems.length === 0 ? (
                          <div className="learners-empty">No syllabus items available.</div>
                        ) : (
                          syllabusItems.map((item) => (
                            <article key={`${item.id}-${item.title || ''}`} className="learners-course-specific-syllabus-item">
                              <div className="learners-course-specific-step">
                                <span>{item.id}</span>
                              </div>
                              <div className="learners-course-specific-syllabus-thumb">
                                <img src={item.image} alt={item.title} />
                              </div>
                              <div className="learners-course-specific-syllabus-copy">
                                <h4>{item.title}</h4>
                                {item.description ? <p>{item.description}</p> : null}
                                <a className="learners-course-specific-syllabus-link" href="/academia/learner/read-contents" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/academia/learner/read-contents', { state: { courseId: course?.id, chapterId: item.id } }); }}>
                                  <span>Open course contents</span>
                                  <img src={arrowUpRight} alt="Open course contents" />
                                </a>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {hasOutcomes && (
                  <section className="learners-course-specific-section learners-course-specific-outcomes">
                    <h3>What will you achieve?</h3>
                    <p>By the end of the course, you'll be able to...</p>
                    <ul>
                      {outcomes.map((o, idx) => (
                        <li key={`${String(o).slice(0,20)}-${idx}`}>{o}</li>
                      ))}
                    </ul>
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
                <a className="learners-course-specific-cta learners-course-specific-cta-secondary" href="/academia/learner/read-contents" onClick={(e) => { e.preventDefault(); navigate('/academia/learner/read-contents', { state: { courseId: course?.id } }); }}>
                  <span>Course contents</span>
                  <img src={playIcon} alt="Course contents" />
                </a>
              ) : (
                <div className="learners-course-specific-no-contents">
                  <small>No contents published yet</small>
                </div>
              )}

              <button type="button" className="learners-course-specific-cta" onClick={(e) => e.preventDefault()}>
                <span>Join Today</span>
                <img src={jo1} alt="Join" />
              </button>
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
    </section>
  );
}

export default CoursePart;
