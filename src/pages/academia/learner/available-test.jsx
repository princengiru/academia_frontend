import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import LearnerLoadError from './LearnerLoadError';
import LearnerLoading from './LearnerLoading';

// Icons & Images
import hoagoto from '../../../assets/icons/hoagoto.svg';
import SavedLibraryButton from './SavedLibraryButton';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './available-test.css';

function LearnersAvailableTest() {
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [tests, setTests] = useState([]);
  const [totalTests, setTotalTests] = useState(0);
  const [syllabusList, setSyllabusList] = useState([]);
  const [syllabusTotal, setSyllabusTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [syllabusLoadError, setSyllabusLoadError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const initPage = Number(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initPage);
  const [limit] = useState(6);
  const [pageCount, setPageCount] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);

  const extractList = (body) => {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data?.assessments)) return body.data.assessments;
    if (Array.isArray(body.data?.data)) return body.data.data;
    if (Array.isArray(body.data?.items)) return body.data.items;
    if (Array.isArray(body.data)) return body.data;
    return [];
  };

  const extractPaginationTotal = (body, fallback = 0) => {
    const total = body?.data?.pagination?.total ?? body?.pagination?.total;
    return Number.isFinite(Number(total)) ? Number(total) : fallback;
  };

  const mapTest = (item, idx) => ({
    id: item.id || idx,
    uuid: item.formative_assessment_uuid || item.summative_assessment_uuid || item.uuid || null,
    courseId: item.course_uuid || item.courseUuid || item.courseId,
    courseName: item.courseName || '',
    type: item.type,
    title: item.title || 'Untitled Test',
    level: item.minCourseProgress ? `Req. Progress: ${item.minCourseProgress}%` : 'All Levels',
    levelTone: item.type === 'summative' ? 'intermediate' : 'beginner',
    author: item.instructor?.name || 'Academia',
    summary: item.description || '',
    questions: item.totalQuestions || '0',
    minutes: item.durationMinutes || '0',
    attempts: item.attemptLimit || '1',
    score: item.passingScore ? `${item.passingScore}%` : '0%',
  });

  const openTest = (test) => {
    if (!test?.courseId) return;
    const chapterId = test.type === 'summative'
      ? 'assessment'
      : `formative-${test.uuid || test.id}`;
    navigate(
      `/learner/read-contents?id=${encodeURIComponent(String(test.courseId))}&chapterId=${encodeURIComponent(chapterId)}`
    );
  };

  const openCourse = (courseId) => {
    if (!courseId) return;
    navigate(`/learner/course-part?id=${encodeURIComponent(String(courseId))}`);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError('');
      setSyllabusLoadError('');
      try {
        const token = localStorage.getItem('token');
        const summativeUrl = `${API_BASE_URL}/api/summative-assessments/public/all?limit=100&offset=0`;
        const formativeUrl = `${API_BASE_URL}/api/formative-assessments/public/all?limit=100&offset=0`;

        const promises = [
          fetch(summativeUrl).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(formativeUrl).then(r => r.ok ? r.json() : null).catch(() => null)
        ];

        if (token) {
          promises.push(
            fetch(`${API_BASE_URL}/api/dashboard/student`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.ok ? r.json() : null).catch(() => null)
          );
        }

        const results = await Promise.all(promises);
        const summativeRes = results[0];
        const formativeRes = results[1];
        const studentDashboardRes = token ? results[2] : null;

        if (!summativeRes && !formativeRes) {
          throw new Error('Could not load available tests.');
        }

        const summativeList = extractList(summativeRes) || [];
        const formativeList = extractList(formativeRes) || [];

        let combinedList = [
          ...summativeList.map(it => ({ ...it, type: 'summative' })),
          ...formativeList.map(it => ({ ...it, type: 'formative' }))
        ];

        combinedList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (cancelled) return;

        if (token) {
          let enrolledCourseIds = new Set();
          if (studentDashboardRes?.data && Array.isArray(studentDashboardRes.data.enrolledCourses)) {
            enrolledCourseIds = new Set(studentDashboardRes.data.enrolledCourses.map(c => c.id));
          }
          combinedList = combinedList.filter(it => it.courseId && enrolledCourseIds.has(it.courseId));
        } else {
          combinedList = [];
        }

        const mapped = combinedList.map(mapTest);
        const total = mapped.length;
        const totalPages = Math.ceil(total / limit) || 1;
        setTotalTests(total);
        setPageCount(totalPages);

        const safePage = Math.min(page, totalPages);
        if (safePage !== page) {
          setPage(safePage);
          setSearchParams({ page: String(safePage) }, { replace: true });
        }

        const startIndex = (safePage - 1) * limit;
        setTests(mapped.slice(startIndex, startIndex + limit));
      } catch (err) {
        if (!cancelled) {
          setTests([]);
          setTotalTests(0);
          setPageCount(1);
          setLoadError(err?.message || 'Could not load available tests.');
        }
      }

      try {
        const res2 = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`);
        const body2 = await res2.json();
        if (!res2.ok) throw new Error(body2?.message || 'Failed to load courses');
        const list2 = extractList(body2);
        if (!cancelled) {
          setSyllabusList(list2.map((c, i) => ({
            id: c.id || i,
            title: c.title || c.name || 'Untitled',
            category: c.category || '',
            chapterCount: Number(c.chapter_count || 0),
            icon: i % 2 === 0 ? acLock : acPlus,
          })));
          setSyllabusTotal(extractPaginationTotal(body2, list2.length));
          setSyllabusLoadError('');
        }
      } catch (e) {
        if (!cancelled) {
          setSyllabusList([]);
          setSyllabusTotal(0);
          setSyllabusLoadError(e?.message || 'Could not load courses.');
        }
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [page, limit, reloadToken]);

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

  const testCountLabel = totalTests === 1
    ? '1 test available from your enrolled courses'
    : `${totalTests} tests available from your enrolled courses`;

  const syllabusCountLabel = syllabusLoadError
    ? 'Could not load courses'
    : syllabusTotal === 1
      ? '1 course available to explore'
      : `${syllabusTotal} courses available to explore`;

  return (
    <LearnersPageShell>
      <section className="learners-available-test-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Assessments</h1>

            <div className="learners-home-title-actions">
              <SavedLibraryButton />

              <a className="learners-btn learners-btn-primary" href="/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        <section className="learners-available-test-layout">
          <div className="learners-available-test-main">
            <div className="learners-available-test-head">
              <div>
                <h2>Earn Certificates</h2>
                <p>{loading ? 'Loading tests...' : testCountLabel}</p>
              </div>
            </div>

            <div className="learners-available-test-grid">
              {loading && (
                <LearnerLoading title="Loading tests" message="Fetching available quizzes and assessments." />
              )}

              {!loading && loadError && (
                <LearnerLoadError
                  message={loadError}
                  onRetry={() => setReloadToken((value) => value + 1)}
                />
              )}

              {!loading && !loadError && tests.length === 0 && (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No tests available</h3>
                  <p>Enroll in a course with quizzes or summative assessments to see tests here.</p>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              )}

              {!loading && !loadError && tests.length > 0 && (
                tests.map((husk) => (
                  <article key={`${husk.id}-${husk.title || ''}`} className="learners-available-test-card">
                    <div className="learners-available-test-card-top">
                      <h3>{husk.title}</h3>
                      <span className={`learners-available-test-level is-${husk.levelTone}`}>
                        {husk.level}
                      </span>
                    </div>

                    <p className="learners-available-test-author">
                      Course: <strong>{husk.courseName}</strong>
                    </p>
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
                      onClick={() => openTest(husk)}
                    >
                      {husk.type === 'summative' ? 'Take Final Test' : 'Start Quiz'}
                    </button>
                  </article>
                ))
              )}
            </div>

            {!loading && !loadError && tests.length > 0 && (
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
            )}
          </div>

          <aside className="learners-available-test-side">
            <div className="learners-available-test-head learners-available-test-head-side">
              <div>
                <h2>Syllabus</h2>
                <p>{loading ? 'Loading courses...' : syllabusCountLabel}</p>
              </div>
              <button type="button" className="learners-available-test-see-all" onClick={() => navigate('/learner/courses')}>
                See All
              </button>
            </div>

            <div className="learners-available-syllabus-list">
              {loading ? (
                <LearnerLoading compact title="Loading courses" message="Fetching your syllabus list." />
              ) : syllabusLoadError ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>Could not load courses</h3>
                  <p>{syllabusLoadError}</p>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => setReloadToken((value) => value + 1)}>
                    Retry
                  </button>
                </div>
              ) : syllabusList.length > 0 ? (
                syllabusList.map((husk) => (
                  <div key={`${husk.id}-${husk.title || ''}`} className="learners-available-syllabus-item">
                    <button
                      type="button"
                      className="learners-available-syllabus-copy learners-available-syllabus-copy-btn"
                      onClick={() => openCourse(husk.id)}
                    >
                      <h4>{husk.title}</h4>
                      <p>{husk.category || `${husk.chapterCount || 0} outlines`}</p>
                    </button>

                    <button type="button" className="learners-available-syllabus-follow" onClick={() => openCourse(husk.id)}>
                      <span>View</span>
                      <img src={husk.icon} alt="" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No courses found</h3>
                  <p>Browse the course catalog to find syllabi and enroll.</p>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/learner/courses')}>
                    Browse courses
                  </button>
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
