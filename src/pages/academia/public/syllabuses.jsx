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
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import storyImage from '../../../assets/imgs/ac-str.jpg';

import './syllabuses.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveImage = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

const normalizeStory = (story) => {
  if (!story) return null;
  return {
    ...story,
    id: story.id || story._id || story.story_id,
    title: story.title || story.heading || 'Story',
    description: story.description || story.excerpt || 'No description available',
    contents: story.contents || '',
    thumbnail: story.thumbnail_url || story.thumbnail || story.image || null,
    author_name: story.author_name || story.uploaded_by_name || story.user_name || 'Admin',
    author_avatar: story.author_avatar || story.uploaded_by_avatar || story.user_avatar || null,
    published_at: story.published_at || story.created_at || null,
  };
};

function AcademiaSyllabuses() {
  const navigate = useNavigate();
  const ssSwiperRef = useRef(null);

  const TOPICS_PAGE_SIZE = 9;

  // --- State ---
  const [categoryTree, setCategoryTree] = useState([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState('');
  const [storiesData, setStoriesData] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]); // subcategory IDs
  const [expandedCategories, setExpandedCategories] = useState({}); // categoryId -> boolean

  // --- Toggle Category/Subcategory handlers ---
  const toggleSubcategory = (subcatId) => {
    setSelectedSubcategories((prev) => {
      const idx = prev.indexOf(subcatId);
      if (idx >= 0) {
        return prev.filter((id) => id !== subcatId);
      } else {
        return [...prev, subcatId];
      }
    });
    setCurrentPage(1);
  };

  const toggleCategoryAll = (category) => {
    if (!category.subcategories) return;
    const subcatIds = category.subcategories.map(s => s.id);
    const allChecked = subcatIds.every(id => selectedSubcategories.includes(id));

    if (allChecked) {
      setSelectedSubcategories(prev => prev.filter(id => !subcatIds.includes(id)));
    } else {
      setSelectedSubcategories(prev => {
        const unique = new Set([...prev, ...subcatIds]);
        return Array.from(unique);
      });
    }
    setCurrentPage(1);
  };

  const isCategoryFullyChecked = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) return false;
    return category.subcategories.map(s => s.id).every(id => selectedSubcategories.includes(id));
  };

  const isCategoryPartiallyChecked = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) return false;
    const subcatIds = category.subcategories.map(s => s.id);
    const checkedCount = subcatIds.filter(id => selectedSubcategories.includes(id)).length;
    return checkedCount > 0 && checkedCount < subcatIds.length;
  };

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // --- Reset/Clear ---
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubcategories([]);
    setCurrentPage(1);
  };

  // --- Load Category Tree ---
  useEffect(() => {
    let mounted = true;
    const loadTree = async () => {
      try {
        setTreeLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/categories/tree`);
        const body = await res.json().catch(() => ({}));
        if (mounted) {
          const tree = Array.isArray(body?.data) ? body.data : [];
          setCategoryTree(tree);

          // Expand active/populated categories by default
          const initialExpanded = {};
          tree.forEach(c => {
            if (c.subcategories && c.subcategories.length > 0) {
              initialExpanded[c.id] = true;
            }
          });
          setExpandedCategories(initialExpanded);
        }
      } catch (err) {
        if (mounted) setTreeError('Failed to load syllabus categories');
      } finally {
        if (mounted) setTreeLoading(false);
      }
    };
    loadTree();
    return () => { mounted = false; };
  }, []);

  // --- Data Fetching: Stories ---
  useEffect(() => {
    let mounted = true;
    const loadStories = async () => {
      try {
        setStoriesLoading(true);
        const storiesRes = await fetch(`${API_BASE_URL}/api/community-stories`);
        const storiesBody = await storiesRes.json().catch(() => ({}));
        if (mounted) {
          const raw = Array.isArray(storiesBody?.data) ? storiesBody.data : (Array.isArray(storiesBody) ? storiesBody : []);
          setStoriesData(raw.map(normalizeStory));
        }
      } catch (err) {
        if (mounted) setStoriesData([]);
      } finally {
        if (mounted) setStoriesLoading(false);
      }
    };
    loadStories();
    return () => { mounted = false; };
  }, []);

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

  // --- Derive Flat Topics List ---
  const allTopics = useMemo(() => {
    const list = [];
    categoryTree.forEach((category) => {
      if (Array.isArray(category.subcategories)) {
        category.subcategories.forEach((subcat) => {
          if (Array.isArray(subcat.topics)) {
            subcat.topics.forEach((topic) => {
              list.push({
                id: topic.id,
                name: topic.name,
                description: topic.description || 'Gain advanced knowledge and explore key principles in this academic topic subject.',
                papers: Array.isArray(topic.papers) ? topic.papers : [],
                subcategoryId: subcat.id,
                subcategoryName: subcat.name,
                categoryId: category.id,
                categoryName: category.name,
              });
            });
          }
        });
      }
    });
    return list;
  }, [categoryTree]);

  // --- Filtering ---
  const filteredTopics = useMemo(() => {
    return allTopics.filter((topic) => {
      const matchesSearch = !searchQuery.trim() ||
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.subcategoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubcat = selectedSubcategories.length === 0 ||
        selectedSubcategories.includes(topic.subcategoryId);

      return matchesSearch && matchesSubcat;
    });
  }, [allTopics, selectedSubcategories, searchQuery]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / TOPICS_PAGE_SIZE));
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  const currentTopics = useMemo(() => {
    const start = (currentPage - 1) * TOPICS_PAGE_SIZE;
    return filteredTopics.slice(start, start + TOPICS_PAGE_SIZE);
  }, [filteredTopics, currentPage, TOPICS_PAGE_SIZE]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/academia/syllabuses');
  };

  const handleStoryClick = (storyId) => navigate(`/academia/read-story?id=${storyId || ''}`);
  const handleViewMore = () => navigate('/academia/watch');

  return (
    <div className="syllabuses-page">
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Syllabus Explorer</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Discover structured academic paths. Browse categories and subcategories to narrow down, explore detailed curriculum topics, and view the educational outlines mapped to our academic programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Header */}
      <section className="journals-sec">
        <div className="sec-h">
          <h1>Syllabus Categories &amp; Topics</h1>
          <p>Explore our academic database structures</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">

        {/* Filters Header (Top Bar) */}
        <div className="div-h" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', padding: '0 0 30px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>Syllabus Filters</span>
          </div>

          <div className="div-h-r" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <div className="div-h-r-s" style={{ maxWidth: '500px', display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', background: '#FCFCFC', width: '100%', gap: '10px' }}>
              <input
                type="search"
                placeholder="Search topics by name, description..."
                value={searchQuery}
                onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
              />
              {searchQuery && (
                <button type="button" onClick={clearFilters} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8B5CF6', fontSize: '12px', fontWeight: '600' }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Content Grid */}
        <div className="filters-grid">

          {/* Left Sidebar - Filters */}
          <div className="filters" style={{ borderRight: '1px solid #E2E8F0', paddingRight: '20px' }}>
            <div className="filters-sidebar-head" style={{ marginBottom: '15px', padding: '0 5px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#071437', fontFamily: 'Outfit, sans-serif' }}>Taxonomy Tree</h3>
              <button type="button" onClick={clearFilters} style={{ fontSize: '12px', color: '#8B5CF6', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Reset all</button>
            </div>

            <div className="accordion" id="courseFilterAccordion" style={{ padding: 0 }}>
              {treeLoading ? (
                <span style={{ fontSize: '12px', color: '#64748B', padding: '10px' }}>Loading tree...</span>
              ) : categoryTree.length === 0 ? (
                <span style={{ fontSize: '12px', color: '#64748B', padding: '10px' }}>No categories available</span>
              ) : (
                categoryTree.map((category) => {
                  const isOpen = !!expandedCategories[category.id];
                  const hasSubcats = category.subcategories && category.subcategories.length > 0;
                  if (!hasSubcats) return null; // Only display categories with subcategories

                  const allChecked = isCategoryFullyChecked(category);
                  const partiallyChecked = isCategoryPartiallyChecked(category);

                  return (
                    <div key={category.id} className="accordion-item" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={el => {
                            if (el) el.indeterminate = partiallyChecked;
                          }}
                          onChange={() => toggleCategoryAll(category)}
                          style={{ marginRight: '10px', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <button
                          className="accordion-button"
                          type="button"
                          onClick={() => toggleExpandCategory(category.id)}
                          aria-expanded={isOpen}
                          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', padding: 0, fontWeight: '600', fontSize: '13.5px', color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                        >
                          <span>{category.name}</span>
                          <span style={{ fontSize: '11px', color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', paddingRight: '5px' }}>▼</span>
                        </button>
                      </div>

                      {isOpen && (
                        <div className="accordion-body" style={{ paddingLeft: '26px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                          {category.subcategories.map((subcat) => {
                            const isChecked = selectedSubcategories.includes(subcat.id);
                            return (
                              <div key={subcat.id} className="form-stick" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  className="form-stick-input"
                                  type="checkbox"
                                  id={`subcat-${subcat.id}`}
                                  checked={isChecked}
                                  onChange={() => toggleSubcategory(subcat.id)}
                                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                />
                                <label className="form-stick-label" htmlFor={`subcat-${subcat.id}`} style={{ fontSize: '12.5px', color: '#475569', cursor: 'pointer', margin: 0 }}>
                                  {subcat.name}
                                </label>
                                {subcat.topics && <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '10px' }}>{subcat.topics.length}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Content - Topics List */}
          <div className="filters-grid-b">

            {/* Breadcrumb & Counts */}
            <div className="filters-grid-b-h">
              <button type="button" onClick={handleBack}>
                <img src={acLeIcon} alt="Back" />
              </button>
              <div>
                <p>Showing {filteredTopics.length} topic{filteredTopics.length === 1 ? '' : 's'} on page {currentPage} of {totalPages}</p>
                <span>/</span>
                <span>Syllabus Taxonomy</span>
                <span>/</span>
              </div>
            </div>

            <div className="filters-grid-b-sel" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '20px' }}>
              <div className="filters-grid-b-sel-h">
                <h1>{searchQuery ? `Search results for "${searchQuery}"` : 'Explore Syllabus Topics'}</h1>
                <div>
                  <p>
                    <img src={acUsIcon} alt="Matches" />
                    <span>{filteredTopics.length} matches</span>
                  </p>
                </div>
              </div>
              <div className="filters-grid-b-sel-b">
                <p>Narrow syllabus disciplines using the taxonomy filter tree in the sidebar. Select one or multiple subcategories to display topics mapped to academic programs.</p>
              </div>
            </div>

            {/* Topics List Grid */}
            <div className="filters-grid-b-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px 0' }}>
              {treeLoading ? (
                <div className="fgbl-item fgbl-empty" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px' }}>
                  <div className="fgbl-item-l">
                    <h4>Loading syllabus tree…</h4>
                    <p>Fetching categories, subcategories, and topics from database.</p>
                  </div>
                </div>
              ) : treeError ? (
                <div className="fgbl-item fgbl-empty" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: '#EF4444' }}>
                  <div className="fgbl-item-l">
                    <h4>Error loading syllabus data</h4>
                    <p>{treeError}</p>
                  </div>
                </div>
              ) : currentTopics.length > 0 ? (
                currentTopics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="fgbl-item topic-card" 
                    onClick={() => navigate(`/academia/syllabus-part?topicId=${topic.id}`)}
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="topic-card-glow" />

                    <div style={{ width: '100%' }}>
                      {/* Taxonomy path badge */}
                      <span style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        background: '#F5F3FF',
                        color: '#450468',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        marginBottom: '12px',
                        border: '1px solid #DDD6FE',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {topic.categoryName} &rsaquo; {topic.subcategoryName}
                      </span>

                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontFamily: 'Montserrat, sans-serif',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#0F172A',
                        lineHeight: '1.4'
                      }}>
                        {topic.name}
                      </h4>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      paddingTop: '12px',
                      borderTop: '1px solid #F1F5F9',
                      marginTop: 'auto'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: topic.papers && topic.papers.length > 0 ? '#450468' : '#64748B',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: topic.papers && topic.papers.length > 0 ? '#8B5CF6' : '#94A3B8' }}>
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {topic.papers ? topic.papers.length : 0} {topic.papers && topic.papers.length === 1 ? 'Outline' : 'Outlines'}
                      </span>

                      <span className="view-details-btn" style={{
                        fontSize: '11px',
                        color: '#450468',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'transform 0.2s ease',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        View {topic.papers && topic.papers.length > 0 ? 'Outlines' : 'Details'} &rarr;
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="fgbl-item fgbl-empty" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  <div className="fgbl-item-l" style={{ width: '100%' }}>
                    <h4>No topics found</h4>
                    <p>Try clearing your filters or broadening your search keywords.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="0.7">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
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
                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
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
                storiesData.map((story) => (
                  <div key={story.id} className="swiper-slide">
                    <div className="ss-item" onClick={() => handleStoryClick(story.id)} style={{ cursor: 'pointer' }}>
                      <div className="ss-item-img">
                        <img src={resolveImage(story.thumbnail, storyImage)} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="ss-item-text">
                        <div className="ss-item-text-h">
                          <div>
                            <img src={acUsIcon} alt="User" />
                            <span>{story.author_name}</span>
                          </div>
                          <div>
                            <img src={acMessIcon} alt="Comments" />
                            <span>{story.comments_count || 0}</span>
                          </div>
                        </div>
                        <h4>{story.title}</h4>
                        <p>{story.description}</p>
                        <div className="ss-item-text-f">
                          <div>
                            <img src={acCalIcon} alt="Date" />
                            <span>{new Date(story.published_at || Date.now()).toLocaleDateString()}</span>
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

export default AcademiaSyllabuses;