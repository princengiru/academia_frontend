import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Icons & Images (consistent with the portal theme)
import acSav from '../../../assets/icons/ac-sav.svg';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acOn from '../../../assets/imgs/ac-on.jpg';
import acEn from '../../../assets/icons/ac-en.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './courses.css';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildCourseDetailsPath } from './publicShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

function AcademiaCourses() {
  usePublicPageTitle('Courses');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [syllabusCourses, setSyllabusCourses] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [categoriesList, setCategoriesList] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Sync search parameters with URL
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
    if (q !== null) {
      setSearchTerm(q);
    }
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10);
    const safePage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    setCurrentPage(safePage);
  }, [searchParams]);

  const resolveAssetUrl = (value) => {
    if (!value) return acOn;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const mapCourse = (course) => ({
    id: course.id,
    uuid: course.course_uuid || course.uuid || null,
    title: course.title || 'Untitled course',
    author: course.instructor_name || course.author || 'Academia',
    image: course.thumbnail ? resolveAssetUrl(course.thumbnail) : acOn,
    priceLabel: (course.price || course.price === 0) ? (Number(course.price) > 0 ? `$${course.price}` : 'Free') : (course.is_free ? 'Free' : 'Free'),
    description: stripHtml(course.description || ''),
    startsOn: course.starts_on || course.published_at || '',
    chapterCount: Number(course.chapter_count || 0),
    category: course.category?.name || course.category || 'Courses',
    level: course.level || 'All Levels',
  });

  // Search Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Real Categories list from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body?.data)) {
            setCategoriesList(body.data);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load sidebar syllabus items (independent of main filter)
  useEffect(() => {
    const loadSidebarSyllabus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`);
        const body = await res.json();
        if (res.ok) {
          const list = extractCourseList(body);
          setSyllabusCourses(list.map(mapCourse));
        }
      } catch (err) {
        console.error("Failed to load syllabus sidebar", err);
      }
    };
    loadSidebarSyllabus();
  }, []);

  // Main courses fetcher
  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);
      setFetchError('');
      try {
        let res;
        let body;
        let list = [];
        let pagination = null;

        const searchQuery = debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : '';
        const categoryQuery = selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : '';

        if (selectedFilter === 'All') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=8${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Free') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/free?page=${currentPage}&limit=8${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load free courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Popular') {
          res = await fetch(`${API_BASE_URL}/api/courses/public/popular?page=${currentPage}&limit=8${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load popular courses');
          list = extractCourseList(body);
          pagination = extractPagination(body);
        } else if (selectedFilter === 'Paid') {
          // Fetch all and filter client side if backend does not support price filter
          res = await fetch(`${API_BASE_URL}/api/courses/public/available?page=${currentPage}&limit=12${searchQuery}${categoryQuery}`);
          body = await res.json();
          if (!res.ok) throw new Error(body.message || 'Failed to load courses');
          list = extractCourseList(body).filter((course) => {
            if (course.price || course.price === 0) return Number(course.price) > 0;
            if (typeof course.is_free !== 'undefined') return !course.is_free;
            return false;
          });
          pagination = extractPagination(body);
        }

        if (cancelled) return;

        const mapped = list.map(mapCourse);
        const total = Math.max(1, Number(pagination?.pages || 1));

        if (mapped.length === 0 && currentPage > 1) {
          const params = new URLSearchParams(searchParams);
          params.delete('page');
          setSearchParams(params, { replace: true });
          setCurrentPage(1);
          setCourses([]);
          setTotalPages(total);
          return;
        }

        setCourses(mapped);
        setTotalPages(total);
        if (currentPage > total) {
          const params = new URLSearchParams(searchParams);
          if (total > 1) params.set('page', String(total));
          else params.delete('page');
          setSearchParams(params, { replace: true });
          setCurrentPage(total);
        }
      } catch (err) {
        if (cancelled) return;
        setCourses([]);
        setTotalPages(1);
        setFetchError(err.message || 'Failed to load courses. Check your connection and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [currentPage, selectedFilter, debouncedSearchTerm, selectedCategory, retryKey, searchParams, setSearchParams]);

  // Client side sorting
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
    return list; // default newest
  }, [courses, sortOrder]);

  const updatePageParam = (page) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', String(page));
    } else {
      params.delete('page');
    }
    setSearchParams(params, { replace: true });
    setCurrentPage(page);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filter);
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="public-courses-directory-page">
      <div className="public-courses-hero">
        <div className="hero-inner">
          <h1>Browse All Courses</h1>
          <p>Find professional resources, syllabus programs, and online workshops tailored for your learning pathway.</p>
        </div>
      </div>

      <div className="public-courses-container">
        
        {/* Custom Dropdown Filters & Search Bar styled like journals */}
        <div className="courses-filter-div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" onClick={() => setFilterOpen(!filterOpen)}>
              <div>
                <img src={acFilterIcon} alt="" />
                <span>{selectedFilter} Courses</span>
              </div>
            </button>
            <ul className={`dropdown-menu${filterOpen ? ' show' : ''}`}>
              {['All', 'Popular', 'Free', 'Paid'].map((tab) => (
                <li
                  key={tab}
                  className={`dropdown-item ${selectedFilter === tab ? 'active' : ''}`}
                  onClick={() => {
                    handleFilterChange(tab);
                    setFilterOpen(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {tab} Courses
                </li>
              ))}
            </ul>
          </div>

          <div className="div-h-r">
            <div className="div-h-r-s">
              <input
                type="search"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <div className="div-h-r-s-f">
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" onClick={() => setSortOpen(!sortOpen)}>
                      <div>
                        <img src={acFiltersIcon} alt="" />
                        <span>Sort: {sortOrder}</span>
                      </div>
                    </button>
                    <ul className={`dropdown-menu${sortOpen ? ' show' : ''}`} style={{ right: 0, left: 'auto' }}>
                      {['Newest', 'A-Z', 'Z-A', 'Lowest Price', 'Highest Price'].map((item) => (
                        <li
                          key={item}
                          className={`dropdown-item ${sortOrder === item ? 'active' : ''}`}
                          onClick={() => {
                            setSortOrder(item);
                            setSortOpen(false);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Categories scrolling tags matching projects/journals */}
        <div className="best-links">
          <div className="best-links-body">
            <button
              type="button"
              className={!selectedCategory ? 'active' : ''}
              onClick={() => handleCategorySelect('')}
            >
              All
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={selectedCategory === cat.name ? 'active' : ''}
                onClick={() => handleCategorySelect(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="courses-main-grid">
          
          <div className="courses-list-col">
            {loading ? (
              <PublicLoading message="Fetching public courses catalog…" />
            ) : fetchError ? (
              <div className="public-page-state--inline">
                <PublicLoadError
                  title="Could not load courses"
                  message={fetchError}
                  onRetry={() => setRetryKey((key) => key + 1)}
                  backTo="/index"
                  backLabel="Back to home"
                />
              </div>
            ) : sortedCourses.length > 0 ? (
              <>
                <div className="courses-catalog-cards">
                  {sortedCourses.map((c) => (
                    <div
                      key={c.uuid || c.id}
                      className="public-course-card"
                      onClick={() => navigate(buildCourseDetailsPath(c))}
                    >
                      <div className="card-thumb-wrap">
                        <img src={c.image} alt={c.title} />
                        <span className="badge price-badge">{c.priceLabel}</span>
                      </div>
                      <div className="card-body">
                        <div className="card-top-meta">
                          <span className="card-category">{c.category}</span>
                          <span className="card-level">{c.level}</span>
                        </div>
                        <h3>{c.title}</h3>
                        <p className="card-instructor">Prepared by <strong>{c.author}</strong></p>
                        <p className="card-description">{c.description || "No description published yet."}</p>
                        <div className="card-action-bar">
                          <span className="starts-meta">{c.startsOn ? `Starts: ${new Date(c.startsOn).toLocaleDateString()}` : "Self-paced"}</span>
                          <button
                            type="button"
                            className="enroll-arrow-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(buildCourseDetailsPath(c));
                            }}
                          >
                            <img src={acEn} alt="Enroll" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="catalog-pagination">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => updatePageParam(Math.max(1, currentPage - 1))}
                      className="pag-nav-btn"
                    >
                      <img src={acLe2} alt="Prev" />
                    </button>
                    {pageNumbers.map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`pag-num-btn ${currentPage === num ? 'active' : ''}`}
                        onClick={() => updatePageParam(num)}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => updatePageParam(Math.min(totalPages, currentPage + 1))}
                      className="pag-nav-btn"
                    >
                      <img src={acRi} alt="Next" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-courses-state">
                <img src={acSav} alt="" className="empty-icon" />
                <h3>No courses match your query</h3>
                <p>Try clearing your filters or testing another search term.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter('All');
                    setSelectedCategory('');
                    setSearchTerm('');
                    setCurrentPage(1);
                    setSearchParams({});
                  }}
                >
                  Reset Catalog
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="courses-sidebar-col">
            <div className="sidebar-catalog-card">
              <h3>Featured Syllabus Program</h3>
              <p>Explore recommended course breakdowns and start today.</p>
              <button
                type="button"
                className="sidebar-syllabus-link"
                onClick={() => navigate('/syllabuses')}
              >
                Browse all syllabuses
              </button>
              
              <div className="syllabus-list">
                {syllabusCourses.slice(0, 5).map((item) => (
                  <div
                    key={item.uuid || item.id}
                    className="syllabus-item-row"
                    onClick={() => navigate(buildCourseDetailsPath(item))}
                  >
                    <div className="item-icon-circle">
                      <img src={acPlus} alt="" />
                    </div>
                    <div className="item-copy">
                      <h4>{item.title}</h4>
                      <div className="item-meta">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}

export default AcademiaCourses;
