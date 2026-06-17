import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './available-test.css';

function LearnersAvailableTest() {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();

  // No static slate fallback — rely on backend data only
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [tests, setTests] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initPage = Number(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initPage);
  const [limit] = useState(6);
  const [pageCount, setPageCount] = useState(1);

  const extractList = (body) => {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data?.assessments)) return body.data.assessments;
    if (Array.isArray(body.data?.data)) return body.data.data;
    if (Array.isArray(body.data?.items)) return body.data.items;
    if (Array.isArray(body.data)) return body.data;
    return [];
  };

  useEffect(() => {
    let cancelled = false;
    const tryEndpoints = [
      `${API_BASE_URL}/api/summative-assessments/public/all?limit=${limit}&offset=${(page - 1) * limit}`,
      `${API_BASE_URL}/api/courses/public/available?page=1&limit=12`,
    ];

    const load = async () => {
      setLoading(true);
      for (const url of tryEndpoints) {
        try {
          const res = await fetch(url);
          const body = await res.json();
          if (!res.ok) throw new Error(body?.message || 'no');
          const list = extractList(body);
          if (list && list.length) {
            if (cancelled) return;
            // map to test shape
            const mapped = list.map((it, idx) => ({
              id: it.id || idx,
              courseId: it.courseId,
              title: it.title || it.courseName || 'Untitled Test',
              level: it.minCourseProgress ? `Req. Progress: ${it.minCourseProgress}%` : 'All Levels',
              levelTone: 'intermediate',
              author: it.instructor?.name || 'Academia',
              summary: it.description || it.courseDescription || '',
              questions: it.totalQuestions || '0',
              minutes: it.durationMinutes || '0',
              attempts: it.attemptLimit || '1',
              score: it.passingScore ? `${it.passingScore}%` : '0%',
            }));
            setTests(mapped);
            // attempt to extract pagination meta
            const meta = body?.data?.pagination || body?.pagination || {};
            const total = meta.total || 0;
            const totalPages = meta.pages || (total ? Math.ceil(total / limit) : 1);
            setPageCount(totalPages || 1);
            break;
          }
        } catch (err) {
          // try next
        }
      }

      // syllabus / categories fallback
      try {
        const res2 = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`);
        const body2 = await res2.json();
        const list2 = extractList(body2);
        if (!cancelled) setSyllabusList(list2.map((c, i) => ({ id: c.id || i, title: c.title || c.name || 'Untitled', icon: acPlus })));
      } catch (e) {
        if (!cancelled && syllabusList.length === 0) setSyllabusList([]);
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [page, limit]);

  // Keep page in sync when user changes query param manually / history navigation
  useEffect(() => {
    const qp = Number(searchParams.get('page')) || 1;
    if (qp !== page) setPage(qp);
  }, [searchParams]);

  const goToPage = (n) => {
    const p = Math.max(1, Math.min(pageCount || 1, Number(n) || 1));
    setPage(p);
    setSearchParams({ page: String(p) }, { replace: true });
  };

  // Use backend-provided syllabus list only; no static fallbacks
  const genesis = syllabusList;

  return (
    <LearnersPageShell>
      <section className="learners-available-test-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Available Test</h1>

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

        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFf} alt="Filter" />
                <span>Certificates</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              <li className="dropdown-item active">
                <a href="/" onClick={preventDefault}>Certificates</a>
              </li>
              <li className="dropdown-item">
                <a href="/" onClick={preventDefault}>Diplomas</a>
              </li>
              <li className="dropdown-item">
                <a href="/" onClick={preventDefault}>Degrees</a>
              </li>
              <li className="dropdown-item">
                <a href="/" onClick={preventDefault}>Workshops</a>
              </li>
            </ul>
          </div>

          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any projects..." aria-label="Search courses" />

              <div className="div-h-r-s-f">
                <button type="button" className="active" onClick={preventDefault}>Free</button>
                <button type="button" onClick={preventDefault}>Paid</button>

                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFi} alt="Filters" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      <li className="dropdown-item active">
                        <a href="/" onClick={preventDefault}>Newest</a>
                      </li>
                      <li className="dropdown-item">
                        <a href="/" onClick={preventDefault}>Top papers</a>
                      </li>
                      <li className="dropdown-item">
                        <a href="/" onClick={preventDefault}>Past Papers</a>
                      </li>
                      <li className="dropdown-item">
                        <a href="/" onClick={preventDefault}>Most Downloaded</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="learners-available-test-layout">
          <div className="learners-available-test-main">
            <div className="learners-available-test-head">
              <div>
                <h2>Earn Certificates</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-available-test-grid">
              {loading && (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>Loading tests…</h3>
                  <div>
                    <button className="learners-btn learners-btn-primary" disabled>Loading</button>
                  </div>
                </div>
              )}

              {!loading && tests.length === 0 && (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No tests available</h3>
                  <div>
                    <button className="learners-btn learners-btn-primary" disabled>Browse courses</button>
                  </div>
                </div>
              )}

              {!loading && tests.length > 0 && (
                tests.map((husk) => (
                  <article key={`${husk.id}-${husk.title || ''}`} className="learners-available-test-card">
                    <div className="learners-available-test-card-top">
                      <h3>{husk.title}</h3>
                      <span className={`learners-available-test-level is-${husk.levelTone}`}>
                        {husk.level}
                      </span>
                    </div>

                    <p className="learners-available-test-author">Prepared by {husk.author}</p>
                    <p className="learners-available-test-summary">{husk.summary}</p>

                    <div className="learners-available-test-metrics">
                      <div>
                        <strong>{husk.questions}</strong>
                        <span>Questions</span>
                      </div>
                      <div>
                        <strong>{husk.minutes}</strong>
                        <span>Minutes</span>
                      </div>
                      <div>
                        <strong>{husk.attempts}</strong>
                        <span>Attempts</span>
                      </div>
                      <div>
                        <strong>{husk.score}</strong>
                        <span>Min. Score</span>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="learners-available-test-cta" 
                      onClick={() => navigate('/academia/learner/course-part', { state: { courseId: husk.courseId } })}
                    >
                      Enroll Test
                    </button>
                  </article>
                ))
              )}
            </div>

            <div className="learners-available-test-pagination">
              <button type="button" onClick={() => goToPage(page - 1)} aria-label="Previous page" disabled={page <= 1}>
                <img src={acLe2} alt="Previous" />
              </button>
              <div>
                {Array.from({ length: pageCount }).slice(0, 10).map((_, i) => (
                  <p key={`p-${i}`} className={page === i + 1 ? 'active' : ''} onClick={() => goToPage(i + 1)}>{i + 1}</p>
                ))}
              </div>
              <button type="button" onClick={() => goToPage(page + 1)} aria-label="Next page" disabled={page >= pageCount}>
                <img src={acRi} alt="Next" />
              </button>
            </div>
          </div>

          <aside className="learners-available-test-side">
            <div className="learners-available-test-head learners-available-test-head-side">
              <div>
                <h2>Syllabus</h2>
                <p>Course Available to research</p>
              </div>
              <a href="/" onClick={preventDefault}>See All</a>
            </div>

              <div className="learners-available-syllabus-list">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`sy-load-${i}`} className="learners-available-syllabus-item learners-loading-card">
                    <div className="learners-available-syllabus-copy">
                      <h4>Loading…</h4>
                    </div>
                    <button type="button" className="learners-available-syllabus-follow" disabled>
                      <span>Follow</span>
                    </button>
                  </div>
                ))
              ) : genesis && genesis.length ? (
                genesis.map((husk) => (
                  <div key={`${husk.id}-${husk.title || ''}`} className="learners-available-syllabus-item">
                    <div className="learners-available-syllabus-copy">
                      <h4>{husk.title}</h4>
                    </div>

                    <button type="button" className="learners-available-syllabus-follow" onClick={preventDefault}>
                      <span>Follow</span>
                      <img src={husk.icon} alt={husk.title} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No syllabus found</h3>
                  <div>
                    <button className="learners-btn learners-btn-primary" disabled>See all</button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersAvailableTest;
