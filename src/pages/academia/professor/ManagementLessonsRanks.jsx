import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management-lessons-ranks.css';
import EmptyState from '../../../components/EmptyState/EmptyState';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ManagementLessonsRanks = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('management-lessons-ranks');
  
  const managementTabs = [
    { id: 'management', label: 'Students' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Grid Data & Pagination State (server-driven) ---
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');

  // Filters State
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination logic
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.max(1, Math.ceil((totalItems || items.length) / pageSize));
  
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');

    const load = async () => {
      setItemsLoading(true);
      setItemsError('');
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(pageSize));
        if (searchTerm) params.set('q', searchTerm);
        if (activeFilter && activeFilter !== 'All') params.set('type', activeFilter.toLowerCase());

        const res = await fetch(`${API_BASE_URL}/api/dashboard/lessons-history?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load lessons');

        if (!mounted) return;
        const data = body?.data || [];
        const pagination = body?.pagination || {};
        setItems(Array.isArray(data) ? data : []);
        setTotalItems(Number(pagination.total || data.length));
      } catch (err) {
        if (mounted) setItemsError(err.message || 'Failed to load lessons');
      } finally {
        if (mounted) setItemsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [currentPage, pageSize, searchTerm, activeFilter]);
  
  // Notice: Because the original HTML has a separate pager up top that goes 1, 2, 3, 4, 5, 
  // I am providing dummy functional buttons to match the visual. 
  // In a real app with 12 items, page size 5 only gives you 3 pages.

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

              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>

              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
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
            <p>Courses &amp; Syllabus</p>
          </div>

          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input type="search" placeholder="Search lessons..." aria-label="Search lessons" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>

            <button type="button" className="assessments-create-btn" onClick={preventDefault}>
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
                <span>All</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              <li className="dropdown-item active"><a href="#" onClick={preventDefault}>All</a></li>
              <li className="dropdown-item"><a href="#" onClick={preventDefault}>Syllabus</a></li>
              <li class="dropdown-item"><a href="#" onClick={preventDefault}>Online Course</a></li>
            </ul>
          </div>

          <div className="prof-lesson-ranks-search-wrap">
            <input type="search" placeholder="Search any Lesson..." aria-label="Search lessons" />

            <div className="prof-lesson-ranks-filters">
              <button type="button" className={activeFilter === 'All' ? 'is-active' : ''} onClick={() => setActiveFilter('All')}>All</button>
              <button type="button" className={activeFilter === 'Free' ? 'is-active' : ''} onClick={() => setActiveFilter('Free')}>Free</button>
              <button type="button" className={activeFilter === 'Paid' ? 'is-active' : ''} onClick={() => setActiveFilter('Paid')}>Paid</button>

              <div className="dropdown">
                <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/ac-fi.svg" alt="" />
                  <span>Filters</span>
                </button>
                <ul className="dropdown-menu">
                  <li className="dropdown-item"><a href="#" onClick={preventDefault}>Top Rank</a></li>
                  <li className="dropdown-item"><a href="#" onClick={preventDefault}>Most Followed</a></li>
                  <li className="dropdown-item"><a href="#" onClick={preventDefault}>Newest</a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Image Grid */}
        <section className="prof-lesson-ranks-grid">
          {itemsLoading ? (
            <div className="prof-lesson-ranks-loading">Loading lessons...</div>
          ) : itemsError ? (
            <div className="prof-lesson-ranks-loading is-error">Error: {itemsError}</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <img src="/assets/icons/empty-lessons.svg" alt="No lessons" style={{ width: 96, height: 96, opacity: 0.95 }} />
              <h3 style={{ marginTop: '.5rem' }}>No lessons yet</h3>
              <p style={{ margin: 0, color: 'var(--muted, #666)', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>You haven't published any lessons yet. Create a course or syllabus to see it here.</p>
              <div style={{ marginTop: '.75rem' }}>
                <Link to="/academia/professor/prepare-course" className="learners-btn learners-btn-primary">Create course</Link>
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
                    <p>Created on : {card.created_at ? new Date(card.created_at).toLocaleDateString() : ''}</p>
                  </div>

                  <a className="prof-lesson-rank-open" href="#" onClick={preventDefault} aria-label="Open lesson">
                    <img src="/assets/icons/ac-en.svg" alt="" />
                  </a>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Footers / Pagination */}
        <section className="prof-lesson-ranks-footer">
          {/* Top Pager (Visual Match from Original HTML) */}
          <div className="prof-lesson-ranks-pager" aria-label="Pagination">
            <button type="button" className="prof-lesson-ranks-pager-nav" onClick={preventDefault} aria-label="Previous page">
              <img src="/assets/icons/left1.svg" alt="" />
            </button>
            
            <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 1 ? 'is-active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
            <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 2 ? 'is-active' : ''}`} onClick={() => setCurrentPage(2)}>2</button>
            <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 3 ? 'is-active' : ''}`} onClick={() => setCurrentPage(3)}>3</button>
            <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 4 ? 'is-active' : ''}`} onClick={() => setCurrentPage(4)}>4</button>
            <button type="button" className={`prof-lesson-ranks-pager-num ${currentPage === 5 ? 'is-active' : ''}`} onClick={() => setCurrentPage(5)}>5</button>
            <span className="prof-lesson-ranks-pager-dots">...</span>
            
            <button type="button" className="prof-lesson-ranks-pager-nav" onClick={preventDefault} aria-label="Next page">
              <img src="/assets/icons/right1.svg" alt="" />
            </button>
          </div>

          <div className="prof-lesson-ranks-footer-bottom">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={(e) => { preventDefault(e); setPageSize(5); }}>5</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { preventDefault(e); setPageSize(10); }}>10</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { preventDefault(e); setPageSize(25); }}>25</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>1-10 of 5</span>
              <button type="button" className="assessments-page-nav" aria-label="Previous" onClick={preventDefault}>←</button>
              <button type="button" className="assessments-page-num" onClick={preventDefault}>1</button>
              <button type="button" className="assessments-page-num is-active" onClick={preventDefault}>2</button>
              <button type="button" className="assessments-page-num" onClick={preventDefault}>3</button>
              <button type="button" className="assessments-page-nav" aria-label="Next" onClick={preventDefault}>→</button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default ManagementLessonsRanks;