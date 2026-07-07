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

function AcademiaCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  }, [searchParams]);

  const resolveAssetUrl = (value) => {
    if (!value) return acOn;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const mapCourse = (course) => ({
    id: course.id,
    title: course.title || 'Untitled course',
    author: course.instructor_name || course.author || 'Academia',
    image: course.thumbnail ? resolveAssetUrl(course.thumbnail) : acOn,
    priceLabel: (course.price || course.price === 0) ? (Number(course.price) > 0 ? `$${course.price}` : 'Free') : (course.is_free ? 'Free' : 'Free'),
    description: course.description || '',
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
  }, [currentPage, selectedFilter, debouncedSearchTerm, selectedCategory]);

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

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('filter', filter);
    setSearchParams(newParams);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
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
    setSearchParams(newParams);
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
              <div className="courses-loading-state">
                <div className="spinner"></div>
                <p>Fetching public courses catalog...</p>
              </div>
            ) : sortedCourses.length > 0 ? (
              <>
                <div className="courses-catalog-cards">
                  {sortedCourses.map((c) => (
                    <div
                      key={c.id}
                      className="public-course-card"
                      onClick={() => navigate(`/academia/course-details?id=${c.id}`)}
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
                              navigate(`/academia/course-details?id=${c.id}`);
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
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="pag-nav-btn"
                    >
                      <img src={acLe2} alt="Prev" />
                    </button>
                    {pageNumbers.map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`pag-num-btn ${currentPage === num ? 'active' : ''}`}
                        onClick={() => setCurrentPage(num)}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
              
              <div className="syllabus-list">
                {syllabusCourses.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="syllabus-item-row"
                    onClick={() => navigate(`/academia/course-details?id=${item.id}`)}
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
