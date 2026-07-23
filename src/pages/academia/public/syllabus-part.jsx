import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acBookIcon from '../../../assets/icons/ac-book.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import './syllabus-part.css';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildSyllabusPartPath, buildSyllabusReaderPath } from './publicShare';

function AcademiaSyllabusPart() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [categoryTree, setCategoryTree] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [treeError, setTreeError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();
  const [topicPage, setTopicPage] = useState(1);
  const topicsPerPage = 4;

  const syllabusTypes = ['All Syllabuses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const filterToggleOptions = ['All', 'Free', 'Paid'];

  const topicId = searchParams.get('topicId');

  // --- Load Categories Tree ---
  useEffect(() => {
    let mounted = true;
    const loadTree = async () => {
      try {
        setDataLoading(true);
        setTreeError('');
        const res = await fetch(`${API_BASE_URL}/api/categories/tree`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.message || 'Failed to load syllabus topics.');
        }
        if (mounted) {
          const tree = Array.isArray(body?.data) ? body.data : [];
          setCategoryTree(tree);
        }
      } catch (err) {
        if (mounted) {
          setCategoryTree([]);
          setTreeError(err.message || 'Failed to load syllabus topics.');
        }
      } finally {
        if (mounted) setDataLoading(false);
      }
    };
    loadTree();
    return () => {
      mounted = false;
    };
  }, [API_BASE_URL, retryKey]);

  // Reset page when topic changes
  useEffect(() => {
    setTopicPage(1);
  }, [topicId]);

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
                topic_uuid: topic.topic_uuid || topic.uuid || null,
                uuid: topic.topic_uuid || topic.uuid || null,
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

  // --- Find Active Topic ---
  const activeTopic = useMemo(() => {
    if (!topicId) return null;
    return allTopics.find((t) => (
      String(t.id) === String(topicId)
      || String(t.topic_uuid || '') === String(topicId)
      || String(t.uuid || '') === String(topicId)
    )) || null;
  }, [allTopics, topicId]);

  usePublicPageTitle(activeTopic?.name || 'Syllabus topic');

  useEffect(() => {
    if (!activeTopic) return;
    const publicRef = activeTopic.topic_uuid || activeTopic.uuid;
    if (!publicRef) return;
    if (String(topicId) === String(publicRef)) return;
    if (String(topicId) !== String(activeTopic.id)) return;
    const next = new URLSearchParams(searchParams);
    next.set('topicId', String(publicRef));
    setSearchParams(next, { replace: true });
  }, [activeTopic, topicId, searchParams, setSearchParams]);

  // --- Derive Syllabus Outlines (Papers) ---
  const syllabusOutlines = useMemo(() => {
    return activeTopic?.papers || [];
  }, [activeTopic]);

  // --- Map Outlines for display ---
  const courseParts = useMemo(() => {
    return syllabusOutlines.map((outline, index) => ({
      id: outline.id || index,
      syllabus_outline_uuid: outline.syllabus_outline_uuid || outline.uuid || null,
      uuid: outline.syllabus_outline_uuid || outline.uuid || null,
      title: outline.title || `Outline Paper ${index + 1}`,
      description: outline.abstract || outline.description || 'Detailed syllabus outline and course papers describing the curriculum structure.',
      file_url: outline.file_url || '',
      syllabus_id: outline.syllabus_id,
      syllabus_uuid: outline.syllabus_uuid || null,
    }));
  }, [syllabusOutlines]);

  // --- Derive Related Topics (Same Subcategory or Category) ---
  const relatedTopics = useMemo(() => {
    if (!activeTopic) return [];
    return allTopics.filter(t =>
      t.id !== activeTopic.id &&
      (t.subcategoryId === activeTopic.subcategoryId || t.categoryId === activeTopic.categoryId)
    ).slice(0, 6);
  }, [allTopics, activeTopic]);

  // --- Pagination ---
  const totalTopicPages = Math.max(1, Math.ceil(courseParts.length / topicsPerPage));
  const visibleCourseParts = courseParts.slice((topicPage - 1) * topicsPerPage, topicPage * topicsPerPage);

  const topicPageNumbers = (() => {
    const visible = 5;
    const start = Math.max(1, Math.min(topicPage - 2, totalTopicPages - visible + 1));
    const end = Math.min(totalTopicPages, start + visible - 1);
    const pages = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  })();

  // --- View/Download Handlers ---
  const handleViewPaper = (outlineId, paper) => {
    navigate(buildSyllabusReaderPath({
      syllabus: typeof paper === 'object' ? paper : { syllabus_id: paper },
      outline: typeof paper === 'object' ? paper : { id: outlineId },
      topicId: outlineId,
      categoryTopic: activeTopic || undefined,
      categoryTopicId: topicId || undefined,
    }));
  };

  const handleRelatedTopic = (id) => {
    navigate(buildSyllabusPartPath(id));
  };

  const handleBackToCourses = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/syllabuses');
  };

  if (dataLoading) {
    return <PublicLoading message="Loading syllabus topic…" />;
  }

  if (treeError) {
    return (
      <PublicLoadError
        title="Syllabus unavailable"
        message={treeError}
        onRetry={() => setRetryKey((key) => key + 1)}
        backTo="/syllabuses"
        backLabel="Browse syllabuses"
      />
    );
  }

  if (!topicId) {
    return (
      <PublicLoadError
        title="Topic not selected"
        message="No topic was specified. Open a topic from the syllabuses page."
        backTo="/syllabuses"
        backLabel="Browse syllabuses"
      />
    );
  }

  if (!activeTopic) {
    return (
      <PublicLoadError
        title="Topic not found"
        message="This syllabus topic could not be found."
        backTo="/syllabuses"
        backLabel="Browse syllabuses"
      />
    );
  }

  return (
    <div className="syllabus-part-page">
      {/* Hero Section */}
      <section className="hero-sec-breakout">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>{activeTopic?.name || 'Syllabus Topic'}</h1>
            </div>
            <div className="hsi-contents-b">
              {activeTopic?.description ? (
                <p>{activeTopic.description}</p>
              ) : (
                <p>Explore outlines and study topics mapped to this academic program.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        {/* Filters Header */}
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button">
              <div>
                <img src={acFilterIcon} alt="Filter" />
                <span>All Syllabuses</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {syllabusTypes.map((type, idx) => (
                <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                  <a href={`/syllabuses?type=${type.toLowerCase().replace(/\s+/g, '-')}`}>{type}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any projects..." />
              <div className="div-h-r-s-f">
                {filterToggleOptions.map((option, idx) => (
                  <button key={idx} type="button" className={idx === 0 ? 'active' : ''}>
                    {option}
                  </button>
                ))}
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button">
                      <div>
                        <img src={acFiltersIcon} alt="Sort" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortOptions.map((option, idx) => (
                        <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                          <a href={`/syllabuses?sort=${option.toLowerCase().replace(/\s+/g, '-')}`}>{option}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBackToCourses}>
            <img src={acLeIcon} alt="Back" />
          </button>
          <div>
            <p>{activeTopic?.categoryName || 'Academia'}</p>
            <span>/</span>
            <span>{activeTopic?.subcategoryName || 'Syllabus'}</span>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 500 }}>{activeTopic?.name}</span>
          </div>
        </div>

        {/* Selected Filter Info */}
        <div className="filters-grid-b-sel">
          <div className="filters-grid-b-sel-h">
            <h1>{activeTopic?.name || 'Syllabus Topic'}</h1>
            <div>
              <p>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span style={{ marginLeft: '6px', fontWeight: '600', color: '#450468' }}>{activeTopic?.papers ? activeTopic.papers.length : 0} Outlines Available</span>
              </p>
            </div>
          </div>
          <div className="filters-grid-b-sel-b">
            <p>{activeTopic?.description || 'Explore syllabus curriculum requirements, outlines, and papers mapped to this educational field.'}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left: Syllabus Topics (Outlines) */}
          <div className="main-content-grid-l">
            <div className="mcgl-h">
              <h2>Syllabus Papers &amp; Outlines</h2>
            </div>
            <div className="mcgl-b">
              {dataLoading ? (
                <div className="course-part">
                  <div className="course-part-b">
                    <p>Loading syllabus outlines...</p>
                  </div>
                </div>
              ) : visibleCourseParts.length > 0 ? visibleCourseParts.map((part) => (
                <div key={part.id} className="course-part" style={{ padding: '20px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '15px' }}>
                  <div className="course-part-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                      <h5 style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: '0 0 4px 0' }}>{part.title}</h5>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Syllabus Outline Paper</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleViewPaper(part.id, part)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#450468',
                          background: '#45046812',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <img src={acBookIcon} alt="View" />
                        <span>View Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewPaper(part.id, part)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#FFFFFF',
                          background: '#450468',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <img src={acDlIcon} alt="Download" style={{ filter: 'brightness(0) invert(1)' }} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="course-part-b" style={{ marginTop: '5px' }}>
                    <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>{part.description}</p>
                  </div>
                </div>
              )) : (
                <div className="course-part" style={{ padding: '30px', textAlign: 'center', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '12px' }}>
                  <div className="course-part-b">
                    <p style={{ color: '#64748B', fontStyle: 'italic', margin: 0 }}>No syllabus outlines mapped to this topic yet.</p>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalTopicPages > 1 && (
                <div className="pagination">
                  <button type="button" onClick={() => setTopicPage((page) => Math.max(1, page - 1))} disabled={topicPage <= 1}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      className="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                      />
                    </svg>
                  </button>
                  <div>
                    {topicPageNumbers.map((num) => (
                      <button key={num} type="button" className={num === topicPage ? 'active' : ''} onClick={() => setTopicPage(num)}>
                        {num}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setTopicPage((page) => Math.min(totalTopicPages, page + 1))} disabled={topicPage >= totalTopicPages}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      className="bi bi-arrow-right"
                      viewBox="0 0 16 16"
                      stroke="currentColor"
                      strokeWidth="0.7"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Related Topics Sidebar */}
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Topics</h2>
            </div>
            <div className="mcgr-b">
              {relatedTopics.length > 0 ? relatedTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="fgbl-item"
                  onClick={() => handleRelatedTopic(topic.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    background: '#FCFCFC',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(69, 4, 104, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="fgbl-item-l">
                    <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', margin: '0 0 4px 0' }}>{topic.name}</h4>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                      <span>{topic.papers ? topic.papers.length : 0} Outlines</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button
                      type="button"
                      style={{
                        background: '#45046812',
                        color: '#450468',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Explore</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="fgbl-item fgbl-empty" style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: '10px', border: '1px dashed #E2E8F0' }}>
                  <div className="fgbl-item-l">
                    <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#64748B', margin: 0 }}>No other related topics</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input
              type="email"
              placeholder="Enter email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">
              <img src={acSendIcon} alt="Submit" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaSyllabusPart;
