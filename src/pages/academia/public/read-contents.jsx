import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acBookIcon from '../../../assets/icons/ac-book.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLockIcon from '../../../assets/icons/ac-lock.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import './read-contents.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatHtmlContent = (html) => {
  if (!html) return '';
  let cleanHtml = html
    .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
    .replace(/href="\/uploads\//g, `href="${API_BASE_URL}/uploads/`);
  
  cleanHtml = cleanHtml.replace(/<a\s+(href="[^"]*")/gi, (match, hrefPart) => {
    if (/target=/i.test(match)) {
      return match;
    }
    return `<a target="_blank" rel="noopener noreferrer" ${hrefPart}`;
  });
  
  return cleanHtml;
};

const resolveYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  let videoId = '';
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  } else if (url.includes('v=')) {
    const parts = url.split('v=');
    if (parts[1]) {
      videoId = parts[1].split(/[&#]/)[0];
    }
  } else if (url.includes('youtube.com/v/')) {
    const parts = url.split('youtube.com/v/');
    if (parts[1]) {
      videoId = parts[1].split(/[?#]/)[0];
    }
  }
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const isYoutubeUrl = (url) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

function AcademiaReadContents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- Search Params ---
  const courseId = searchParams.get('courseId');
  const syllabusId = searchParams.get('syllabusId');
  const topicId = searchParams.get('topicId'); // From Syllabus (Public)
  const chapterId = searchParams.get('chapterId'); // From Curriculum (Private)

  // --- State ---
  const [syllabusData, setSyllabusData] = useState(null);
  const [activeContent, setActiveContent] = useState(null); // Holds either Outline or Chapter
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // --- Static Options ---
  const syllabusTypes = ['All Syllabuses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];

  // --- Data Fetching ---
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        let resolvedCourse = null;
        let fetchedContent = null;

        // Fetch category tree
        try {
          const treeRes = await fetch(`${API_BASE_URL}/api/categories/tree`);
          const treeBody = await treeRes.json().catch(() => ({}));
          if (mounted) {
            setCategoryTree(Array.isArray(treeBody?.data) ? treeBody.data : []);
          }
        } catch (e) {
          console.warn("Failed to load category tree:", e);
        }

        // 1. Fetch Course Details (for fallback compatibility)
        if (courseId) {
          const cRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
          const cBody = await cRes.json().catch(() => ({}));
          resolvedCourse = cBody?.data || cBody;
          if (mounted) {
            setSyllabusData(resolvedCourse ? {
              id: resolvedCourse.id,
              title: resolvedCourse.title || 'Syllabus',
              category: resolvedCourse.category?.name || 'Academia',
              level: resolvedCourse.education_level || 'Syllabus',
              instructor_name: resolvedCourse.instructor_name || 'Academia Team',
              instructor_avatar: resolvedCourse.instructor_avatar || null,
            } : null);
          }
        }

        // 2. Fetch the specific Content (Syllabus Topic OR Chapter)
        const resolvedSyllabusId = syllabusId || resolvedCourse?.syllabus_id;

        if (topicId && resolvedSyllabusId && resolvedSyllabusId !== 'undefined') {
          const sylRes = await fetch(`${API_BASE_URL}/api/syllabuses/public/${resolvedSyllabusId}`);
          const sylBody = await sylRes.json().catch(() => ({}));
          const syllabus = sylBody?.data || sylBody;
          
          if (!resolvedCourse && syllabus && mounted) {
            setSyllabusData({
              id: syllabus.id || null,
              title: syllabus.title || 'Syllabus',
              category: syllabus.category?.name || 'Academia',
              level: syllabus.education_level || 'Syllabus',
              instructor_name: syllabus.instructor_name || 'Academia Team',
              instructor_avatar: syllabus.instructor_avatar || null,
            });
          }
          
          const outlines = sylBody?.data?.outlines || sylBody?.outlines || [];
          fetchedContent = outlines.find(o => String(o.id) === String(topicId)) || outlines[0];
          
        } else if (chapterId) {
          const chapRes = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}`);
          const chapBody = await chapRes.json().catch(() => ({}));
          fetchedContent = chapBody?.data || chapBody;

        } else if (resolvedSyllabusId && resolvedSyllabusId !== 'undefined') {
          const sylRes = await fetch(`${API_BASE_URL}/api/syllabuses/public/${resolvedSyllabusId}`);
          const sylBody = await sylRes.json().catch(() => ({}));
          const syllabus = sylBody?.data || sylBody;
          
          if (!resolvedCourse && syllabus && mounted) {
            setSyllabusData({
              id: syllabus.id || null,
              title: syllabus.title || 'Syllabus',
              category: syllabus.category?.name || 'Academia',
              level: syllabus.education_level || 'Syllabus',
              instructor_name: syllabus.instructor_name || 'Academia Team',
              instructor_avatar: syllabus.instructor_avatar || null,
            });
          }
          
          fetchedContent = (sylBody?.data?.outlines || sylBody?.outlines || [])[0] || null;
        }

        if (mounted) setActiveContent(fetchedContent);

      } catch (err) {
        console.error("Failed to load content:", err);
        if (mounted) {
          setSyllabusData(null);
          setActiveContent(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [courseId, syllabusId, topicId, chapterId]);

  // --- Handlers ---
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (activeContent?.topic_id) {
      navigate(`/academia/syllabus-part?topicId=${activeContent.topic_id}`);
    } else {
      navigate('/academia/syllabuses');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    console.log("Subscribing:", newsletterEmail);
    setNewsletterEmail('');
    alert("Subscribed successfully!");
  };

  // Safe PDF Extraction Hook
  const pdfUrl = useMemo(() => {
    if (!activeContent) return null;
    let path = null;
    
    if (activeContent.file_url && activeContent.file_url.toLowerCase().endsWith('.pdf')) {
      path = activeContent.file_url;
    } else {
      try {
        const attachmentsRaw = activeContent.attachments || activeContent.explanation_attachments;
        if (attachmentsRaw) {
          const atts = typeof attachmentsRaw === 'string' ? JSON.parse(attachmentsRaw) : attachmentsRaw;
          const pdf = atts.find(a => a.file_type === 'application/pdf' || (a.file_path || '').toLowerCase().endsWith('.pdf') || (a.file_url || '').toLowerCase().endsWith('.pdf'));
          if (pdf) path = pdf.file_path || pdf.file_url;
        }
      } catch (e) {
        console.warn("Error parsing attachments", e);
      }
    }

    if (path) {
      return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    }
    return null;
  }, [activeContent]);

  // Force true download
  const handleForceDownload = async () => {
    if (!pdfUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const fileName = activeContent?.file_name || pdfUrl.substring(pdfUrl.lastIndexOf('/') + 1) || 'Syllabus_Material.pdf';
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct download blocked. Falling back to new tab.", error);
      window.open(pdfUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // --- Derived Content Mapping ---
  const contentTitle = activeContent?.title || syllabusData?.title || 'Loading Content...';
  const contentAuthor = syllabusData?.instructor_name || syllabusData?.author_name || 'Academia Team';
  const contentAbstract = activeContent?.abstract || activeContent?.subtitle || syllabusData?.description || 'No summary provided.';
  
  const rawBody = activeContent?.explanation || activeContent?.description || '';
  const contentBodyHTML = (rawBody.trim().startsWith('[') || rawBody.trim().startsWith('{')) ? null : rawBody;

  const contentAuthorAvatar = syllabusData?.instructor_avatar || syllabusData?.user_avatar || null;
  const authorAvatarSrc = contentAuthorAvatar
    ? (contentAuthorAvatar.startsWith('http') ? contentAuthorAvatar : `${API_BASE_URL}${contentAuthorAvatar}`)
    : learnersProfileImage;

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

  const activeTopic = useMemo(() => {
    if (!activeContent?.topic_id) return null;
    return allTopics.find(t => String(t.id) === String(activeContent.topic_id));
  }, [allTopics, activeContent]);

  const relatedTopics = useMemo(() => {
    if (!activeTopic) {
      return allTopics.slice(0, 6);
    }
    return allTopics.filter(t =>
      t.id !== activeTopic.id &&
      (t.subcategoryId === activeTopic.subcategoryId || t.categoryId === activeTopic.categoryId)
    ).slice(0, 6);
  }, [allTopics, activeTopic]);

  return (
    <div className="academia-read-contents-page">
      <section className="main-content">
        
        {/* --- Top Filters/Search Header --- */}
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="" />
                <span>All Syllabuses</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {syllabusTypes.map((item, index) => (
                <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                  <a href={`/academia/syllabuses?type=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any syllabuses..." />
              <div className="div-h-r-s-f">
                <button className="active" type="button">All</button>
                <button type="button">Free</button>
                <button type="button">Paid</button>
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortOptions.map((item, index) => (
                        <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                           <a href={`/academia/syllabuses?sort=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Breadcrumb --- */}
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack} style={{ cursor: 'pointer' }}>
            <img src={acLeIcon} alt="Back" />
          </button>
          <div>
            <p>{syllabusData?.category || 'Academia'}</p>
            <span>/</span>
            <span>{syllabusData?.title || 'Syllabus'}</span>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 500 }}>{contentTitle}</span>
          </div>
        </div>

        {/* --- Content Header Box --- */}
        <div className="course-part">
          <div className="course-part-h">
            <div>
              <h5>{contentTitle}</h5>
              <div className="course-part-h-p">
                <div className="course-part-h-img">
                  <img src={authorAvatarSrc} alt={contentAuthor} />
                </div>
                <p>By {contentAuthor}</p>
              </div>
            </div>
            <div>
              <button type="button">
                <img src={acBookIcon} alt="Save" />
                <span>Save to library</span>
              </button>
              {pdfUrl && (
                <button 
                  type="button" 
                  onClick={handleForceDownload} 
                  disabled={isDownloading}
                  style={{ 
                    background: '#F3E8FF', 
                    border: '1px solid #E9D5FF', 
                    color: '#450468',
                    opacity: isDownloading ? 0.7 : 1,
                    cursor: isDownloading ? 'wait' : 'pointer'
                  }}
                >
                  <img src={acDlIcon} alt="Download" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Resource'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="course-part-b" style={{ paddingBottom: '24px' }}>
            <h5 style={{ color: '#0F172A', marginBottom: '8px' }}>Abstract / Summary</h5>
            {loading ? (
              <p style={{ color: '#64748B' }}>Loading summary…</p>
            ) : (
              <>
                <div 
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(contentAbstract) }} 
                  style={{ 
                    color: '#475569', 
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%'
                  }} 
                />
                 {activeContent?.video_url && (
                  <div className="public-read-video-wrap" style={{ marginTop: '24px', borderRadius: '12px', overflow: 'hidden', width: '100%', aspectRatio: '16/9', background: '#000' }}>
                    {isYoutubeUrl(activeContent.video_url) ? (
                      <iframe
                        width="100%"
                        src={resolveYoutubeEmbedUrl(activeContent.video_url)}
                        title="Lesson Video Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ display: 'block', border: 'none', width: '100%', height: '100%', aspectRatio: '16/9' }}
                      />
                    ) : (
                      <video
                        src={activeContent.video_url.startsWith('/') && !activeContent.video_url.startsWith('/src/') ? `${API_BASE_URL}${activeContent.video_url}` : activeContent.video_url}
                        controls
                        style={{ width: '100%', height: '100%', display: 'block', borderRadius: '12px', aspectRatio: '16/9' }}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- Main Reading Grid --- */}
      <section className="main-content" style={{ marginTop: '24px' }}>
        <div className="main-content-grid">
          
          {/* Left Column: The Content Area */}
          <div className="main-content-grid-l">
            
            {/* Rich Text Block */}
            {contentBodyHTML && (
              <>
                <div className="mcgl-h">
                  <h2>Detailed Content</h2>
                </div>
                <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto' }}>
                  <div 
                    className="rich-text-content" 
                    dangerouslySetInnerHTML={{ __html: formatHtmlContent(contentBodyHTML) }} 
                    style={{ 
                      color: '#334155', 
                      lineHeight: '1.8', 
                      fontSize: '1.05rem',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '100%'
                    }} 
                  />
                </div>
              </>
            )}

            {/* Document / PDF Section (Always renders with Empty State if no PDF) */}
            <div className="mcgl-h">
              <h2>Syllabus Material</h2>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {pdfUrl ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#0F172A' }}>Attached Document</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button 
                        type="button" 
                        onClick={() => window.open(pdfUrl, '_blank')} 
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        Open in New Tab
                      </button>
                      <button 
                        type="button" 
                        onClick={handleForceDownload} 
                        disabled={isDownloading}
                        style={{ background: '#0F172A', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 500, cursor: isDownloading ? 'wait' : 'pointer', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {isDownloading ? 'Saving...' : 'Save File'}
                      </button>
                    </div>
                  </div>
                  
                  {/* The Iframe Viewer */}
                  <div className="cont-page" style={{ position: 'relative', minHeight: '600px' }}>
                    <iframe 
                      src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                      title="PDF Document Viewer"
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none', position: 'absolute', top: 0, left: 0 }}
                      loading="lazy"
                    />
                  </div>
                </>
              ) : (
                // --- Dedicated Empty State for Syllabus Material ---
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B', background: '#fff' }}>
                  <div style={{ background: '#F1F5F9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h4 style={{ color: '#0F172A', fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>No Documents Attached</h4>
                  <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                    There are no downloadable outlines, PDFs, or external materials provided for this specific topic.
                  </p>
                </div>
              )}
            </div>
            
          </div>

          {/* Right Column: Related Topics */}
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Topics</h2>
            </div>
            <div className="related-list">
              {loading ? (
                <div className="fgbl-item fgbl-empty">
                  <div className="fgbl-item-l">
                    <p style={{ color: '#64748B' }}>Loading related topics...</p>
                  </div>
                </div>
              ) : relatedTopics.length > 0 ? (
                relatedTopics.map((topic) => (
                  <div 
                    key={topic.id} 
                    className="fgbl-item" 
                    onClick={() => navigate(`/academia/syllabus-part?topicId=${topic.id}`)} 
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
                ))
              ) : (
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

      {/* --- Newsletter Section --- */}
      <section className="newsletter-sec" style={{ marginTop: '40px' }}>
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tuned and get the latest update</h3>
          <p>Join thousands of learners receiving weekly updates on new syllabuses.</p>
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
              <img src={acSendIcon} alt="Send" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadContents;