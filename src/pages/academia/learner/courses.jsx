import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acOn from '../../../assets/imgs/ac-on.jpg';
import acEn from '../../../assets/icons/ac-en.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './courses.css';

function LearnersCourses() {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();

  const handleCourseClick = (id) => {
    if (!id) {
      navigate('/academia/learner/course-part');
      return;
    }
    navigate('/academia/learner/course-part', { state: { courseId: id } });
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syllabusCourses, setSyllabusCourses] = useState([]);

  const resolveAssetUrl = (value) => {
    if (!value) return acOn;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const extractCourseList = (body) => {
    if (Array.isArray(body?.data?.data)) return body.data.data;
    if (Array.isArray(body?.data?.courses)) return body.data.courses;
    if (Array.isArray(body?.data?.items)) return body.data.items;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body)) return body;
    return [];
  };

  const extractPagination = (body) => body?.data?.pagination || body?.pagination || null;

  const mapCourse = (course) => ({
    id: course.id,
    title: course.title || 'Untitled course',
    author: course.instructor_name || course.author || 'Academia',
    image: course.thumbnail ? resolveAssetUrl(course.thumbnail) : acOn,
    priceLabel: (course.price || course.price === 0) ? (Number(course.price) > 0 ? `$${course.price}` : 'Free') : (course.is_free ? 'Free' : 'Paid'),
    description: course.description || '',
    startsOn: course.starts_on || course.published_at || '',
    chapterCount: Number(course.chapter_count || 0),
    category: course.category || '',
    level: course.level || '',
  });

  useEffect(() => {
    // Load a small syllabus list independent of the current filter so sidebar stays populated
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load syllabus courses');
        const list = extractCourseList(body);
        setSyllabusCourses(list.map(mapCourse));
      } catch (err) {
        setSyllabusCourses([]);
      }
    })();

    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem('token');
        let res;
        let body;
        let list = [];
        let pagination = null;

        if (selectedFilter === 'All') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=10`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Free') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/free?page=${currentPage}&limit=10`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load free courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Popular') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/popular?page=${currentPage}&limit=10`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load popular courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Paid') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=10`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load courses');
          list = extractCourseList(body).filter((course) => {
            if (course.price || course.price === 0) return Number(course.price) > 0;
            if (typeof course.is_free !== 'undefined') return !course.is_free;
            return true;
          });
          pagination = extractPagination(body);
        } else if (selectedFilter === 'My Courses') {
          if (!token) {
            list = [];
            pagination = { pages: 1 };
          } else {
            res = await fetch(`${API_BASE_URL}/api/dashboard/student`, { headers: { Authorization: `Bearer ${token}` } });
            body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Failed to load your courses');
            list = Array.isArray(body?.data?.enrolledCourses) ? body.data.enrolledCourses : [];
            pagination = { pages: 1 };
          }
        }

        if (cancelled) return;

        setCourses(list.map(mapCourse));
        setTotalPages(Number(pagination?.pages || 1));
      } catch (err) {
        if (cancelled) return;
        setCourses([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, currentPage, selectedFilter]);

  const syllabusItems = syllabusCourses.slice(0, 6).map((course) => ({
    id: course.id,
    title: course.title,
    metaLeft: course.category || course.level || 'Course syllabus',
    metaRight: `${course.chapterCount || 0} Chapters`,
    icon: course.id % 2 === 0 ? acLock : acPlus,
  }));

  const pageNumbers = Array.from({ length: Math.max(1, totalPages) }, (_, index) => index + 1);

  return (
    <LearnersPageShell>
      <section className="learners-courses-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Courses</h1>

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
              <span>{selectedFilter}</span>
            </div>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'All' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('All');
                  setCurrentPage(1);
                }}
              >
                All
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'Free' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('Free');
                  setCurrentPage(1);
                }}
              >
                Free
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'Paid' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('Paid');
                  setCurrentPage(1);
                }}
              >
                Paid
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'My Courses' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('My Courses');
                  setCurrentPage(1);
                }}
              >
                My Courses
              </button>
            </li>
          </ul>
        </div>
        <div className="div-h-r">
          <div className="div-h-r-s">
            <input type="search" placeholder="Search any projects..." />
            <div className="div-h-r-s-f">
              <button className="active" type="button">Free</button>
              <button type="button">Paid</button>
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

      <section className="learners-courses-main">
        <div className="learners-courses-main-grid">
          <div className="learners-courses-online">
            <div className="learners-courses-section-head">
              <div>
                <h2>Online courses</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-online-sec-contents">
              {/* Courses loaded from API when "All" filter is active. */}
              {courses && courses.length > 0 ? courses.map((course) => (
                <div key={course.id} className="osc-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course.id); }} style={{ cursor: 'pointer' }}>
                  <div className="osc-item-img">
                    <img src={course.image || acOn} alt={course.title || 'Online Course'} />
                  </div>
                  <div className="osc-item-text">
                    <div className="osc-item-text-float">
                      <p>{course.priceLabel}</p>
                    </div>
                    <div>
                      <h6><a href="/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course.id); }}>{course.title}</a></h6>
                      <small>{course.author}</small>
                    </div>
                    <div>
                      <p>{course.description || 'No description available.'}</p>
                    </div>
                    <div>
                      <small>{course.startsOn || ''}</small>
                      <a className="learners-course-open" href="/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course.id); }}>
                        <img src={acEn} alt="Enroll" />
                      </a>
                    </div>
                  </div>
                </div>
              )) : (!loading && (
                <div className="learners-empty-state learners-empty-state--courses">
                  <h4>No courses available</h4>
                  <p>There are no published courses to show right now.</p>
                </div>
              ))}
            </div>

            {courses && courses.length > 0 && (
              <div className="learners-courses-pagination">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  <img src={acLe2} alt="Previous" />
                </button>
                <div>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === currentPage ? 'active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <img src={acRi} alt="Next" />
                </button>
              </div>
            )}
          </div>

          <aside className="learners-courses-syllabus">
            <div className="learners-courses-section-head learners-courses-section-head-right">
              <div>
                <h2>Syllabus</h2>
                <p>Course Available to research</p>
              </div>
              <a href="/" onClick={preventDefault}>See All</a>
            </div>

            <div className="learners-syllabus-list">
              {syllabusItems.length > 0 ? syllabusItems.map((husk) => (
                <div key={husk.id} className="fgbl-item learners-syllabus-item">
                  <div className="fgbl-item-l">
                    <h4>{husk.title}</h4>
                    <p>
                      <span>{husk.metaLeft}</span>
                      <span>|</span>
                      <span>{husk.metaRight}</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button type="button" onClick={preventDefault}>
                      <span>Follow</span>
                      <img src={husk.icon} alt={husk.title} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="learners-empty-state learners-empty-state--courses">
                  <h4>No syllabus available</h4>
                  <p>Load the available courses to populate the syllabus sidebar.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersCourses;
