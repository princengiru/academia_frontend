import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acP1Icon from '../../../assets/icons/ac-p1.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import storyImage from '../../../assets/imgs/ac-str.jpg';
import dummyIcon from '../../../assets/imgs/ac-on.jpg';

import './courses.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveImage = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

function AcademiasCourses() {
  const navigate = useNavigate();
  const ssSwiperRef = useRef(null);

  const COURSES_PAGE_SIZE = 6;

  // --- State ---
  const [coursesData, setCoursesData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [coursesPagination, setCoursesPagination] = useState({
    page: 1, limit: COURSES_PAGE_SIZE, total: 0, pages: 1,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState({
    category: [], level: [], language: [], price: [],
  });
  
  const [expandedGroups, setExpandedGroups] = useState({
    category: false, level: false, language: false, price: false,
  });

  // --- Static Options ---
  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const filterToggleOptions = ['All', 'Free', 'Paid'];

  // --- Filter Builders ---
  const buildOptions = (items) => {
    const counts = new Map();
    items.forEach((item) => {
      if (!item) return;
      const normalized = item.toString().trim().toLowerCase();
      const existing = counts.get(normalized);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(normalized, { label: item, count: 1 });
      }
    });

    return Array.from(counts.values()).map(({ label, count }) => ({
      id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label,
      count,
    }));
  };

  const categoryOptions = useMemo(() => buildOptions(coursesData.map((course) => course.category || course.category_name || course.category_title).filter(Boolean)), [coursesData]);
  const levelOptions = useMemo(() => buildOptions(coursesData.map((course) => course.level || course.education_level).filter(Boolean)), [coursesData]);
  const languageOptions = useMemo(() => buildOptions(coursesData.map((course) => course.language).filter(Boolean)), [coursesData]);
  
  const priceOptions = useMemo(() => [
    { id: 'free', label: 'Free', count: coursesData.filter((course) => Number(course.price) === 0).length },
    { id: 'paid', label: 'Paid', count: coursesData.filter((course) => Number(course.price) > 0).length },
  ], [coursesData]);

  const filterGroups = [
    { key: 'category', title: 'Category', items: categoryOptions },
    { key: 'level', title: 'Level', items: levelOptions },
    { key: 'language', title: 'Language', items: languageOptions },
    { key: 'price', title: 'Price', items: priceOptions },
  ];

  // --- Search & Filter Logic ---
  const selectedModeFilter = activeMode === 'Free' ? ['free'] : activeMode === 'Paid' ? ['paid'] : [];

  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const courseCategory = (course.category || course.category_name || course.category_title || '').toString().toLowerCase();
      const courseLevel = (course.level || course.education_level || '').toString().toLowerCase();
      const courseLanguage = (course.language || '').toString().toLowerCase();
      const coursePriceMode = Number(course.price) === 0 ? 'free' : 'paid';
      const courseTitle = (course.title || course.name || '').toString().toLowerCase();
      const courseDescription = (course.description || '').toString().toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesQuery = !query || courseTitle.includes(query) || courseDescription.includes(query);
      const matchesMode = !selectedModeFilter.length || selectedModeFilter.includes(coursePriceMode);
      const matchesCategory = !selectedFilters.category.length || selectedFilters.category.some((value) => courseCategory === value);
      const matchesLevel = !selectedFilters.level.length || selectedFilters.level.some((value) => courseLevel === value);
      const matchesLanguage = !selectedFilters.language.length || selectedFilters.language.some((value) => courseLanguage === value);
      const matchesPrice = !selectedFilters.price.length || selectedFilters.price.includes(coursePriceMode);

      return matchesQuery && matchesMode && matchesCategory && matchesLevel && matchesLanguage && matchesPrice;
    });
  }, [coursesData, searchQuery, selectedModeFilter, selectedFilters]);

  // --- Action Handlers ---
  const toggleFilter = (groupKey, value) => {
    setSelectedFilters((current) => {
      const normalizedValue = value.toLowerCase();
      const groupValues = current[groupKey];
      const exists = groupValues.includes(normalizedValue);
      return {
        ...current,
        [groupKey]: exists
          ? groupValues.filter((item) => item !== normalizedValue)
          : [...groupValues, normalizedValue],
      };
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveMode('All');
    setSelectedFilters({ category: [], level: [], language: [], price: [] });
  };

  const totalPages = Math.max(1, coursesPagination.pages || 1);
  
  const pageNumbers = useMemo(() => {
    const visible = 5;
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - visible + 1));
    const end = Math.min(totalPages, start + visible - 1);
    const pages = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Data Fetching: Courses ---
  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const coursesRes = await fetch(`${API_BASE_URL}/api/courses?page=${currentPage}&limit=${COURSES_PAGE_SIZE}`);
        const coursesBody = await coursesRes.json().catch(() => ({}));

        if (mounted) {
          const list = Array.isArray(coursesBody?.data) ? coursesBody.data : (Array.isArray(coursesBody) ? coursesBody : []);
          const pagination = coursesBody?.pagination || {};
          const pages = Number(pagination.pages || pagination.total_pages || 1) || 1;

          setCoursesData(list);
          setCoursesPagination({
            page: Number(pagination.page || currentPage),
            limit: Number(pagination.limit || COURSES_PAGE_SIZE),
            total: Number(pagination.total || list.length),
            pages,
          });
        }
      } catch (err) {
        if (mounted) {
          setCoursesData([]);
          setCoursesPagination({ page: currentPage, limit: COURSES_PAGE_SIZE, total: 0, pages: 1 });
        }
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    };

    loadCourses();

    return () => { mounted = false; };
  }, [API_BASE_URL, currentPage]);

  // --- Data Fetching: Stories ---
  useEffect(() => {
    let mounted = true;

    const loadStories = async () => {
      try {
        setStoriesLoading(true);
        const storiesRes = await fetch(`${API_BASE_URL}/api/community-stories`);
        const storiesBody = await storiesRes.json().catch(() => ({}));

        if (mounted) {
          setStoriesData(Array.isArray(storiesBody?.data) ? storiesBody.data : (Array.isArray(storiesBody) ? storiesBody : []));
        }
      } catch (err) {
        if (mounted) setStoriesData([]);
      } finally {
        if (mounted) setStoriesLoading(false);
      }
    };

    loadStories();

    return () => { mounted = false; };
  }, [API_BASE_URL]);

  // --- Initialize Swiper for Stories ---
  useEffect(() => {
    if (storiesLoading || !storiesData.length) return undefined;

    const swiper = new Swiper('.ss-swiper', {
      modules: [Navigation],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      breakpoints: {
        0: { slidesPerView: 1 },
        769: { slidesPerView: 4 },
      },
      navigation: {
        nextEl: '.ss-swiper .swiper-button-next',
        prevEl: '.ss-swiper .swiper-button-prev',
      },
    });

    ssSwiperRef.current = swiper;

    return () => {
      if (ssSwiperRef.current) ssSwiperRef.current.destroy(true, true);
    };
  }, [storiesLoading, storiesData]);

  // --- Navigation Helpers ---
  const handleCoursesClick = (courseId) => navigate(`/academia/course-part?courseId=${courseId || ''}`);
  const handleStoryClick = (storyId) => navigate(`/academia/read-story?id=${storyId || ''}`);
  const handleViewMore = () => navigate('/academia/watch');
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/academia/courses');
  };

  return (
    <div className="courses-page">
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Courses</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Discover a world of knowledge with our expertly crafted courses. Whether you are looking to advance your career, explore a new hobby, or deepen your academic understanding, Academia provides the tools you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Header */}
      <section className="journals-sec">
        <div className="sec-h">
          <h1>Programs & Courses</h1>
          <p>Explore our top research interests</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        
        {/* Filters Header (Top Bar) */}
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="Filter" />
                <span>{activeMode === 'All' ? 'All Courses' : activeMode}</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {courseTypes.map((type, idx) => (
                <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                  <button className="dropdown-item-btn" onClick={() => {}}>{type}</button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="div-h-r">
            <div className="div-h-r-s">
              <input
                type="search"
                placeholder="Search any courses..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <div className="div-h-r-s-f">
                {filterToggleOptions.map((option, idx) => (
                  <button key={idx} className={activeMode === option ? 'active' : ''} onClick={() => setActiveMode(option)}>
                    {option}
                  </button>
                ))}
                
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="Sort" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortOptions.map((option, idx) => (
                        <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                          <button className="dropdown-item-btn" onClick={() => {}}>{option}</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <button type="button" onClick={clearFilters} className="courses-clear-btn" style={{ marginLeft: '12px' }}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Content Grid */}
        <div className="filters-grid">
          
          {/* Left Sidebar - Filters */}
          <div className="filters">
            <div className="filters-sidebar-head">
              <h3>Filters</h3>
              <button type="button" onClick={clearFilters}>Reset all</button>
            </div>
            
            <div className="accordion" id="courseFilterAccordion">
              {filterGroups.map((group, catIdx) => {
                const visibleItems = expandedGroups[group.key] ? group.items : group.items.slice(0, 6);

                return (
                  <div key={group.key} className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${catIdx}`}
                        aria-expanded={catIdx === 0}
                      >
                        {group.title}
                      </button>
                    </h2>
                    <div id={`collapse${catIdx}`} className={`accordion-collapse collapse ${catIdx === 0 ? 'show' : ''}`}>
                      <div className="accordion-body">
                        {visibleItems.map((item) => {
                          const normalizedValue = item.label.toLowerCase();
                          const isChecked = selectedFilters[group.key].includes(normalizedValue);

                          return (
                            <div key={item.id} className="form-stick">
                              <input
                                className="form-stick-input"
                                type="checkbox"
                                id={`${group.key}-${item.id}`}
                                checked={isChecked}
                                onChange={() => toggleFilter(group.key, item.label)}
                              />
                              <label className="form-stick-label" htmlFor={`${group.key}-${item.id}`}>
                                {item.label}
                              </label>
                              {typeof item.count === 'number' && <span>{item.count.toLocaleString()}</span>}
                            </div>
                          );
                        })}
                        {group.items.length > 6 && (
                          <button
                            type="button"
                            onClick={() => setExpandedGroups((current) => ({ ...current, [group.key]: !current[group.key] }))}
                            style={{ background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', padding: '8px 0', fontSize: '0.85rem', fontWeight: 500 }}
                          >
                            {expandedGroups[group.key] ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Course List */}
          <div className="filters-grid-b">
            
            {/* Breadcrumb & Counts */}
            <div className="filters-grid-b-h">
              <button type="button" onClick={handleBack}>
                <img src={acLeIcon} alt="Back" />
              </button>
              <div>
                <p>Showing {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} on page {currentPage} of {totalPages}</p>
                <span>/</span>
                <span>{activeMode === 'All' ? 'All Courses' : activeMode}</span>
                <span>/</span>
              </div>
            </div>

            <div className="filters-grid-b-sel">
              <div className="filters-grid-b-sel-h">
                <h1>{searchQuery ? `Search results for "${searchQuery}"` : 'Explore courses'}</h1>
                <div>
                  <p>
                    <img src={acUsIcon} alt="Users" />
                    <span>{filteredCourses.length} matches</span>
                  </p>
                  <button type="button">
                    <span>Follow Topic</span>
                    <img src={acP1Icon} alt="Plus" />
                  </button>
                </div>
              </div>
              <div className="filters-grid-b-sel-b">
                <p>Use the sidebar to narrow courses by category, level, language, or price. Each group shows six options by default so the panel stays compact.</p>
              </div>
            </div>

            {/* Courses List */}
            <div className="filters-grid-b-list">
              {coursesLoading ? (
                <div className="fgbl-item fgbl-empty">
                  <div className="fgbl-item-l">
                    <h4>Loading courses…</h4>
                    <p>Please wait while we fetch the curriculum catalog.</p>
                  </div>
                </div>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id || course._id || course.course_id} className="fgbl-item" onClick={() => handleCoursesClick(course.id || course._id || course.course_id)} style={{ cursor: 'pointer' }}>
                    <div className="fgbl-item-img" style={{ marginRight: '16px', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={resolveImage(course.thumbnail_url || course.thumbnail, dummyIcon)} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="fgbl-item-l" style={{ flex: 1 }}>
                      <h4>{course.title || course.name}</h4>
                      <p>
                        <span>{course.category || 'General'}</span>
                        <span style={{ margin: '0 8px' }}>|</span>
                        <span>{Number(course.price) === 0 ? 'Free' : `${course.price} ${course.currency || 'USD'}`}</span>
                      </p>
                    </div>
                    <div className="fgbl-item-r">
                      <button type="button" onClick={(e) => { e.stopPropagation(); /* Add to wishlist logic */ }}>
                        <span>Wishlist</span>
                        <img src={acPpIcon} alt="Add" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="fgbl-item fgbl-empty">
                  <div className="fgbl-item-l">
                    <h4>No courses found</h4>
                    <p>Try resetting the filters or broadening your search query.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="0.7">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                  </svg>
                </button>
                <div>
                  {pageNumbers.map((num) => (
                    <button key={num} type="button" className={num === currentPage ? 'active' : ''} onClick={() => goToPage(num)}>
                      {num}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="0.7">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                  </svg>
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Community Stories Slider */}
      <section className="stories-sec">
        <div className="sec-h">
          <p>Blogs</p>
          <h1>Community stories</h1>
        </div>
        <div className="stories-sec-contents">
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              
              {storiesLoading ? (
                <div className="swiper-slide">
                  <div className="js-item js-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F8FAFC', borderRadius: '12px', minHeight: '200px' }}>
                    <div className="js-item-text" style={{ textAlign: 'center' }}>
                      <h4 style={{ fontWeight: 600 }}>Loading stories…</h4>
                      <p style={{ color: '#64748B' }}>Fetching the latest community posts.</p>
                    </div>
                  </div>
                </div>
              ) : storiesData && storiesData.length > 0 ? (
                storiesData.map((story, idx) => (
                  <div key={story.id || story._id || idx} className="swiper-slide">
                    <div className="ss-item" onClick={() => handleStoryClick(story.id || story._id)} style={{ cursor: 'pointer' }}>
                      <div className="ss-item-img">
                        <img src={resolveImage(story.thumbnail_url || story.thumbnail, storyImage)} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="ss-item-text">
                        <div className="ss-item-text-h">
                          <div>
                            <img src={acUsIcon} alt="User" />
                            <span>{story.author_name || story.author || 'Admin'}</span>
                          </div>
                          <div>
                            <img src={acMessIcon} alt="Comments" />
                            <span>{story.comments_count || story.commentCount || 0}</span>
                          </div>
                        </div>
                        <h4>{story.title || story.heading}</h4>
                        <p>{story.excerpt || story.summary || (story.description ? (story.description.substring(0, 100) + '...') : 'Read full story to learn more.')}</p>
                        <div className="ss-item-text-f">
                          <div>
                            <img src={acCalIcon} alt="Date" />
                            <span>{new Date(story.published_at || story.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); }}>
                            <img src={acShareIcon} alt="Share" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="swiper-slide" style={{ width: '100%' }}>
                  <div className="js-item js-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <div className="js-item-text" style={{ textAlign: 'center' }}>
                      <h4 style={{ fontWeight: 600 }}>No community stories</h4>
                      <p style={{ color: '#64748B', marginBottom: '16px' }}>There are no community stories published yet.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="swiper-button-next ss-btn"></div>
            <div className="swiper-button-prev ss-btn"></div>
          </div>
        </div>
      </section>

      {/* View More CTA */}
      <div className="sec-CTA">
        <button type="button" onClick={handleViewMore}>
          <span>View More Stories</span>
          <img src={acNextIcon} alt="Next" />
        </button>
      </div>
    </div>
  );
}

export default AcademiasCourses;