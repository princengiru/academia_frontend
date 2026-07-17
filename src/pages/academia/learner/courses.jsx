import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import LearnerLoadError from './LearnerLoadError';

// Icons & Images
import hoagoto from '../../../assets/icons/hoagoto.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acOn from '../../../assets/imgs/ac-on.jpg';
import acEn from '../../../assets/icons/ac-en.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import SavedLibraryButton from './SavedLibraryButton';
import './courses.css';

const PAGINATION_DOTS = 'dots';

// Build a compact, non-cluttered page list, e.g. [1, 2, 3, 4, 5, 'dots', 20].
// siblingCount = how many pages to show on each side of the current page.
const buildPaginationItems = (currentPage, totalPages, siblingCount = 1) => {
  const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // first + last + current + 2*siblings + 2 dot slots
  const totalSlots = siblingCount * 2 + 5;
  if (totalPages <= totalSlots) return range(1, totalPages);

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    // Near the start: 1 2 3 4 5 ... 20
    const leftCount = 3 + siblingCount * 2;
    return [...range(1, leftCount), PAGINATION_DOTS, totalPages];
  }
  if (showLeftDots && !showRightDots) {
    // Near the end: 1 ... 16 17 18 19 20
    const rightCount = 3 + siblingCount * 2;
    return [1, PAGINATION_DOTS, ...range(totalPages - rightCount + 1, totalPages)];
  }
  // In the middle: 1 ... 9 10 11 ... 20
  return [1, PAGINATION_DOTS, ...range(leftSibling, rightSibling), PAGINATION_DOTS, totalPages];
};

function LearnersCourses() {
  const navigate = useNavigate();

  // Prefer the public course_uuid for redirects so internal primary keys are
  // never exposed in the URL. Falls back to id only if a uuid is unavailable.
  const handleCourseClick = (course) => {
    const ref = (course && (course.uuid || course.id)) || null;
    if (!ref) {
      navigate('/academia/learner/course-part');
      return;
    }
    navigate(`/academia/learner/course-part?id=${encodeURIComponent(ref)}`);
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [searchParams, setSearchParams] = useSearchParams();
  
  const handleClearCategory = () => {
    setSelectedCategory('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    setSearchParams(newParams);
  };
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syllabusCourses, setSyllabusCourses] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [loadError, setLoadError] = useState('');

  const PAGE_SIZE = 18;

  // Sync URL search parameters with states
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) {
      setSelectedCategory(cat);
    }
    const filt = searchParams.get('filter');
    if (filt !== null) {
      setSelectedFilter(filt);
    }
    const q = searchParams.get('search');
    setSearchTerm(q || '');
  }, [searchParams]);

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

  const mapCourse = (course) => ({
    id: course.id,
    uuid: course.course_uuid || null,
    title: course.title || 'Untitled course',
    author: course.instructor_name || course.author || 'Academia',
    image: course.thumbnail ? resolveAssetUrl(course.thumbnail) : acOn,
    priceLabel: (course.price || course.price === 0) ? (Number(course.price) > 0 ? `$${course.price}` : 'Free') : (course.is_free ? 'Free' : 'Paid'),
    description: stripHtml(course.description || ''),
    startsOn: course.starts_on || course.published_at || '',
    chapterCount: Number(course.chapter_count || 0),
    category: course.category || '',
    level: course.level || '',
  });

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        const trimmed = searchTerm.trim();
        if (trimmed) {
          newParams.set('search', trimmed);
        } else {
          newParams.delete('search');
        }
        return newParams;
      }, { replace: true });
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  // Load Courses
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
        const searchQuery = debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : '';
        const categoryQuery = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';

        if (selectedFilter === 'All') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=${PAGE_SIZE}${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Free') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/free?page=${currentPage}&limit=${PAGE_SIZE}${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load free courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Popular') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/popular?page=${currentPage}&limit=${PAGE_SIZE}${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load popular courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Paid') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=${PAGE_SIZE}${searchQuery}${categoryQuery}`);
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
            // If there's a search term or category, filter locally for "My Courses"
            if (debouncedSearchTerm) {
              const lower = debouncedSearchTerm.toLowerCase();
              list = list.filter(c => 
                (c.title && c.title.toLowerCase().includes(lower)) || 
                (c.description && c.description.toLowerCase().includes(lower))
              );
            }
            if (selectedCategory) {
              const lowerCat = selectedCategory.toLowerCase();
              list = list.filter(c => c.category && c.category.toLowerCase() === lowerCat);
            }
            pagination = { pages: 1 };
          }
        }

        if (cancelled) return;

        setLoadError('');
        setCourses(list.map(mapCourse));
        setTotalPages(Number(pagination?.pages || 1));
      } catch (err) {
        if (cancelled) return;
        setCourses([]);
        setTotalPages(1);
        setLoadError(err?.message || 'Could not load courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, currentPage, selectedFilter, debouncedSearchTerm, selectedCategory]);

  // Client-Side Sorting
  const sortedCourses = React.useMemo(() => {
    const list = [...courses];
    if (sortOrder === 'A-Z') {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'Z-A') {
      return list.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOrder === 'Highest Price') {
      return list.sort((a, b) => {
        const pA = a.priceLabel === 'Free' ? 0 : parseFloat(a.priceLabel.replace('$', ''));
        const pB = b.priceLabel === 'Free' ? 0 : parseFloat(b.priceLabel.replace('$', ''));
        return pB - pA;
      });
    } else if (sortOrder === 'Lowest Price') {
      return list.sort((a, b) => {
        const pA = a.priceLabel === 'Free' ? 0 : parseFloat(a.priceLabel.replace('$', ''));
        const pB = b.priceLabel === 'Free' ? 0 : parseFloat(b.priceLabel.replace('$', ''));
        return pA - pB;
      });
    }
    return list; // Newest (Default from DB)
  }, [courses, sortOrder]);

  const syllabusItems = syllabusCourses.slice(0, 6).map((course) => ({
    id: course.id,
    ref: course.uuid || course.id,
    title: course.title,
    metaLeft: course.category || course.level || 'Course syllabus',
    metaRight: `${course.chapterCount || 0} Outlines`,
    icon: course.id % 2 === 0 ? acLock : acPlus,
  }));

  const safeTotalPages = Math.max(1, totalPages);
  const showPagination = safeTotalPages > 1;
  const pageItems = buildPaginationItems(currentPage, safeTotalPages);

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), safeTotalPages);
    if (next === currentPage) return;
    setCurrentPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <LearnersPageShell>
      <section className="learners-courses-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Courses</h1>

            <div className="learners-home-title-actions">
              <SavedLibraryButton />
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {selectedCategory && (
          <div className="category-filter-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F3E8FF', border: '1px solid #D8B4FE', color: '#6B21A8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: '500', margin: '0 0 16px 0' }}>
            <span>Category: <strong>{selectedCategory}</strong></span>
            <button type="button" onClick={handleClearCategory} style={{ border: 'none', background: 'transparent', color: '#6B21A8', cursor: 'pointer', fontSize: '16px', lineHeight: '1', padding: '0 2px', display: 'flex', alignItems: 'center', fontWeight: '600' }}>×</button>
          </div>
        )}

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
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter', 'All');
                  setSearchParams(newParams);
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
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter', 'Free');
                  setSearchParams(newParams);
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
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter', 'Paid');
                  setSearchParams(newParams);
                }}
              >
                Paid
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'Popular' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('Popular');
                  setCurrentPage(1);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter', 'Popular');
                  setSearchParams(newParams);
                }}
              >
                Popular
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item ${selectedFilter === 'My Courses' ? 'active' : ''}`}
                type="button"
                onClick={() => {
                  setSelectedFilter('My Courses');
                  setCurrentPage(1);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('filter', 'My Courses');
                  setSearchParams(newParams);
                }}
              >
                My Courses
              </button>
            </li>
          </ul>
        </div>
        <div className="div-h-r">
          <div className="div-h-r-s">
            <input
              type="search"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="div-h-r-s-f">
              <button
                className={selectedFilter === 'Popular' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setSelectedFilter(selectedFilter === 'Popular' ? 'All' : 'Popular');
                  setCurrentPage(1);
                  const newParams = new URLSearchParams(searchParams);
                  if (selectedFilter === 'Popular') {
                    newParams.set('filter', 'All');
                  } else {
                    newParams.set('filter', 'Popular');
                  }
                  setSearchParams(newParams);
                }}
              >
                Popular
              </button>
              <button
                className={selectedFilter === 'Free' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setSelectedFilter(selectedFilter === 'Free' ? 'All' : 'Free');
                  setCurrentPage(1);
                }}
              >
                Free
              </button>
              <button
                className={selectedFilter === 'Paid' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setSelectedFilter(selectedFilter === 'Paid' ? 'All' : 'Paid');
                  setCurrentPage(1);
                }}
              >
                Paid
              </button>
              <div className="div-h-r-s-f-f">
                <div className="dropdown">
                  <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div>
                      <img src={acFi} alt="Filters" />
                      <span>{sortOrder}</span>
                    </div>
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className={`dropdown-item ${sortOrder === 'Newest' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setSortOrder('Newest')}
                      >
                        Newest
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortOrder === 'A-Z' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setSortOrder('A-Z')}
                      >
                        A-Z (Title)
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortOrder === 'Z-A' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setSortOrder('Z-A')}
                      >
                        Z-A (Title)
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortOrder === 'Highest Price' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setSortOrder('Highest Price')}
                      >
                        Highest Price
                      </button>
                    </li>
                    <li>
                      <button
                        className={`dropdown-item ${sortOrder === 'Lowest Price' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setSortOrder('Lowest Price')}
                      >
                        Lowest Price
                      </button>
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
                <p>Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-online-sec-contents">
              {loadError ? (
                <LearnerLoadError
                  message={loadError}
                  onRetry={() => {
                    setLoadError('');
                    setCurrentPage(1);
                    setLoading(true);
                  }}
                />
              ) : null}
              {loading && (
                <div className="learners-courses-skeleton-grid" aria-hidden="true">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`course-skeleton-${index}`} className="osc-item osc-item--skeleton">
                      <div className="osc-item-img learners-courses-skeleton-block" />
                      <div className="osc-item-text">
                        <div className="learners-courses-skeleton-line learners-courses-skeleton-line--title" />
                        <div className="learners-courses-skeleton-line learners-courses-skeleton-line--meta" />
                        <div className="learners-courses-skeleton-line learners-courses-skeleton-line--body" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && sortedCourses && sortedCourses.length > 0 ? sortedCourses.map((course) => (
                <div key={course.uuid || course.id} className="osc-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course); }} style={{ cursor: 'pointer' }}>
                  <div className="osc-item-img">
                    <img src={course.image || acOn} alt={course.title || 'Online Course'} />
                  </div>
                  <div className="osc-item-text">
                    <div className="osc-item-text-float">
                      <p>{course.priceLabel}</p>
                    </div>
                    <div>
                      <h6><a href="/academia/learner/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course); }}>{course.title}</a></h6>
                      <small>{course.author}</small>
                    </div>
                    <div>
                      <p>{course.description || 'No description available.'}</p>
                    </div>
                    <div>
                      <small>{course.startsOn || ''}</small>
                      <a className="learners-course-open" href="/academia/learner/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(course); }}>
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

            {!loading && showPagination && (
              <div className="learners-courses-pagination">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <img src={acLe2} alt="Previous" />
                </button>
                <div>
                  {pageItems.map((item, index) => (
                    item === PAGINATION_DOTS ? (
                      <span key={`dots-${index}`} className="learners-courses-pagination-dots" aria-hidden="true">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === currentPage ? 'active' : ''}
                        onClick={() => goToPage(item)}
                        aria-current={item === currentPage ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    )
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= safeTotalPages}
                  aria-label="Next page"
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
                <p>Browse course outlines</p>
              </div>
              <button type="button" className="learners-courses-see-all" onClick={() => navigate('/academia/learner/courses')}>
                See All
              </button>
            </div>

            <div className="learners-syllabus-list">
              {syllabusItems.length > 0 ? syllabusItems.map((husk) => (
                <div key={husk.id} className="fgbl-item learners-syllabus-item" style={{ background: '#FCFCFC', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="fgbl-item-l">
                    <h4 
                      style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#071437', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}
                      onClick={() => navigate(`/academia/learner/course-part?id=${encodeURIComponent(husk.ref)}`)}
                    >
                      {husk.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#99A1B7' }}>
                      <span>{husk.metaRight}</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button 
                      type="button" 
                      onClick={() => navigate(`/academia/learner/course-part?id=${encodeURIComponent(husk.ref)}`)}
                      className="learners-btn-view-syllabus"
                      style={{
                        background: 'transparent',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#4B5675',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#99A1B7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>View syllabus</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="learners-empty-state learners-empty-state--courses">
                  <h4>No syllabus available</h4>
                  <p>Browse the catalog to explore available courses.</p>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
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
