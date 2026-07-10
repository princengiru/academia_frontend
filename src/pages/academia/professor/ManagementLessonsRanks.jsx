import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-lessons-ranks.css';
import hoagoto from '../../../assets/icons/hoagoto.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ManagementLessonsRanks = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State ---
  const [activeTab] = useState('management-lessons-ranks');
  const managementTabs = [
    { id: 'management', label: 'Courses' },
    { id: 'management-syllabuses', label: 'Syllabuses' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Grid Data State ---
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');
  const [hasEverLoadedData, setHasEverLoadedData] = useState(false); // To determine if they have ANY courses vs just an empty search

  // --- Filters & Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activePriceFilter, setActivePriceFilter] = useState('All'); // All, Free, Paid
  const [lessonType, setLessonType] = useState('All'); // All, Syllabus, Online Course
  const [sortOrder, setSortOrder] = useState('Newest'); // Newest, Top Rank, Most Followed
  
  // --- Pagination State ---
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Safety check to ensure we don't get stuck on an empty page
  const safeCurrentPage = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage);
  }, [safeCurrentPage, currentPage]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- Fetch Data ---
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const loadData = async () => {
      setItemsLoading(true);
      setItemsError('');
      
      try {
        const params = new URLSearchParams({
          page: String(safeCurrentPage),
          limit: String(pageSize),
        });
        
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (activePriceFilter !== 'All') params.set('pricing', activePriceFilter.toLowerCase());
        if (lessonType !== 'All') params.set('type', lessonType.toLowerCase());
        if (sortOrder !== 'Newest') params.set('sort', sortOrder.toLowerCase().replace(' ', '_'));

        const res = await fetch(`${API_BASE_URL}/api/dashboard/lessons-history?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal
        });
        
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load lessons');

        const data = body?.data || [];
        const pagination = body?.pagination || {};
        
        setItems(Array.isArray(data) ? data : []);
        setTotalItems(Number(pagination.total || data.length));
        if (data.length > 0) setHasEverLoadedData(true);

      } catch (err) {
        if (err.name !== 'AbortError') {
          setItemsError(err.message || 'Failed to load lessons');
        }
      } finally {
        setItemsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [safeCurrentPage, pageSize, debouncedSearch, activePriceFilter, lessonType, sortOrder]);

  // --- Pagination Window Calculation ---
  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safeCurrentPage === 1) return [1, 2, 3];
    if (safeCurrentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1];
  }, [safeCurrentPage, totalPages]);

  // --- Handlers ---
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page prof-lessons-ranks-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/plus1.svg" alt="" />
                <span>Add Event</span>
              </a>
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => { preventDefault(e); navigate('/academia/professor/performance'); }}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="prof-management-tabs" aria-label="Management sections">
          {managementTabs.map((tab) => (
            <Link 
              key={tab.id}
              to={`/academia/professor/${tab.id}`} 
              className={`prof-management-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Hero Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Lesson Ranks</h2>
            <p>Courses & Syllabus</p>
          </div>
          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input 
                type="search" 
                placeholder="Search lessons..." 
                aria-label="Search lessons" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button type="button" className="assessments-create-btn" onClick={() => navigate('/academia/professor/prepare-course')}>
              <img src="/assets/icons/plus.svg" alt="" aria-hidden="true" />
              <span>Create new test</span>
            </button>
          </div>
        </section>

        {/* Toolbar & Filters */}
        <section className="prof-lesson-ranks-toolbar">
          <div className="prof-lesson-ranks-left-filter dropdown">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src="/assets/icons/ac-ff.svg" alt="" />
                <span>{lessonType}</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {['All', 'Syllabus', 'Online Course'].map(type => (
                <li key={type} className="dropdown-item">
                  <button type="button" className={`dropdown-item ${lessonType === type ? 'active' : ''}`} onClick={() => handleFilterChange(setLessonType, type)} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left' }}>
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="prof-lesson-ranks-search-wrap">
            <div className="prof-lesson-ranks-filters">
              {['All', 'Free', 'Paid'].map(price => (
                <button 
                  key={price}
                  type="button" 
                  className={activePriceFilter === price ? 'is-active' : ''} 
                  onClick={() => handleFilterChange(setActivePriceFilter, price)}
                >
                  {price}
                </button>
              ))}

              <div className="dropdown">
                <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/ac-fi.svg" alt="" />
                  <span>{sortOrder}</span>
                </button>
                <ul className="dropdown-menu">
                  {['Newest', 'Top Rank', 'Most Followed'].map(sort => (
                    <li key={sort} className="dropdown-item">
                      <button type="button" className={`dropdown-item ${sortOrder === sort ? 'active' : ''}`} onClick={() => handleFilterChange(setSortOrder, sort)} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left' }}>
                        {sort}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Top Pager (Synced with state) */}
        {totalItems > 0 && (
          <div className="prof-lesson-ranks-pager" aria-label="Pagination" style={{ marginBottom: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="prof-lesson-ranks-pager-nav" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={safeCurrentPage === 1}>
              <img src="/assets/icons/left1.svg" alt="Previous page" />
            </button>
            
            {visiblePageNumbers.map(num => (
              <button 
                key={num} 
                type="button" 
                className={`prof-lesson-ranks-pager-num ${safeCurrentPage === num ? 'is-active' : ''}`} 
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            
            {totalPages > 3 && safeCurrentPage < totalPages - 1 && <span className="prof-lesson-ranks-pager-dots">...</span>}
            
            <button type="button" className="prof-lesson-ranks-pager-nav" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={safeCurrentPage === totalPages}>
              <img src="/assets/icons/right1.svg" alt="Next page" />
            </button>
          </div>
        )}

        {/* Image Grid */}
        <section className="prof-lesson-ranks-grid">
          {itemsLoading ? (
            <div className="prof-lesson-ranks-loading">Loading records...</div>
          ) : itemsError ? (
            <div className="prof-lesson-ranks-loading is-error">Error: {itemsError}</div>
          ) : items.length === 0 ? (
            <div className="prof-management-empty-state" style={{ minHeight: 240, gridColumn: '1 / -1' }}>
              <div className="prof-management-empty-state-card">
                <h3>{hasEverLoadedData ? 'No matching lessons' : 'No lessons yet'}</h3>
                <p>{hasEverLoadedData ? 'Try adjusting your filters or search terms.' : "You haven't published any lessons yet. Create a course or syllabus to see it here."}</p>
                {!hasEverLoadedData && (
                  <div className="prof-management-empty-state-actions">
                    <Link to="/academia/professor/prepare-course" className="learners-btn learners-btn-primary">Create course</Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            items.map((card) => (
              <article key={card.id} className="prof-lesson-rank-card">
                <img className="prof-lesson-rank-bg" src={card.thumbnail || '/assets/imgs/aca.png'} alt={card.title} />

                <div className="prof-lesson-rank-overlay">
                  <span className="prof-lesson-rank-price">{card.price_label || (card.price ? `$${card.price}` : 'Free')}</span>
                  <span className="prof-lesson-rank-badge">{`#${card.rank || card.id}`}</span>

                  <div className="prof-lesson-rank-copy">
                    <small>{card.type || card.category || 'Course'}</small>
                    <h3>{card.title || card.name}</h3>
                    <p>Followers : {card.followers || card.enrollments || 0}</p>
                    <p>Created on : {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>

                  <a className="prof-lesson-rank-open" href={`/academia/courses/${card.id}`} onClick={preventDefault} aria-label="Open lesson">
                    <img src="/assets/icons/ac-en.svg" alt="" />
                  </a>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Footers / Pagination */}
        <section className="prof-lesson-ranks-footer">
          <div className="prof-lesson-ranks-footer-bottom">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  {[5, 10, 25, 50].map(size => (
                    <li key={size}>
                      <button type="button" className="dropdown-item" onClick={() => handleFilterChange(setPageSize, size)} style={{ border: 'none', background: 'transparent', width: '100%', textAlign: 'left' }}>
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>
                {totalItems === 0 ? '0-0 of 0' : `${(safeCurrentPage - 1) * pageSize + 1}-${Math.min(safeCurrentPage * pageSize, totalItems)} of ${totalItems}`}
              </span>
              <button 
                type="button" 
                className="assessments-page-nav" 
                aria-label="Previous" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
              >
                ←
              </button>
              
              {visiblePageNumbers.map(num => (
                <button 
                  key={num}
                  type="button" 
                  className={`assessments-page-num ${safeCurrentPage === num ? 'is-active' : ''}`} 
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button 
                type="button" 
                className="assessments-page-nav" 
                aria-label="Next" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default ManagementLessonsRanks;