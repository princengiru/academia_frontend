import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import acLeIcon from '../../../assets/icons/ac-le.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import './read-contents.css';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildSyllabusPartPath, getSyllabusPublicRef, getOutlinePublicRef, getTopicPublicRef } from './publicShare';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const courseId = searchParams.get('courseId') || searchParams.get('id');
  const syllabusId = searchParams.get('syllabusId');
  const topicId = searchParams.get('topicId');
  const categoryTopicId = searchParams.get('categoryTopicId');
  const chapterId = searchParams.get('chapterId');

  const [syllabusData, setSyllabusData] = useState(null);
  const [activeContent, setActiveContent] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();
  usePublicPageTitle(activeContent?.title || syllabusData?.title || 'Reader');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        setLoading(true);
        setLoadError('');
        let resolvedCourse = null;
        let fetchedContent = null;

        if (!chapterId && !topicId && !courseId && !syllabusId) {
          setSyllabusData(null);
          setActiveContent(null);
          setLoadError('No content selected.');
          return;
        }

        if (topicId && !syllabusId && !courseId) {
          setSyllabusData(null);
          setActiveContent(null);
          setLoadError('Missing syllabus context for this topic.');
          return;
        }

        try {
          const treeRes = await fetch(`${API_BASE_URL}/api/categories/tree`);
          const treeBody = await treeRes.json().catch(() => ({}));
          if (mounted) {
            setCategoryTree(Array.isArray(treeBody?.data) ? treeBody.data : []);
          }
        } catch (e) {
          console.warn('Failed to load category tree:', e);
        }

        if (courseId) {
          const cRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
          const cBody = await cRes.json().catch(() => ({}));
          if (!cRes.ok) {
            throw new Error(cBody?.message || 'Course not found.');
          }
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

        const resolvedSyllabusId = syllabusId || resolvedCourse?.syllabus_id;

        if (topicId && resolvedSyllabusId && resolvedSyllabusId !== 'undefined') {
          const sylRes = await fetch(`${API_BASE_URL}/api/syllabuses/public/${resolvedSyllabusId}`);
          const sylBody = await sylRes.json().catch(() => ({}));
          if (!sylRes.ok) {
            throw new Error(sylBody?.message || 'Syllabus not found.');
          }
          const syllabus = sylBody?.data || sylBody;

          if (!resolvedCourse && syllabus && mounted) {
            setSyllabusData({
              id: syllabus.id || null,
              uuid: syllabus.syllabus_uuid || null,
              title: syllabus.title || 'Syllabus',
              category: syllabus.category?.name || 'Academia',
              level: syllabus.education_level || 'Syllabus',
              instructor_name: syllabus.instructor_name || 'Academia Team',
              instructor_avatar: syllabus.instructor_avatar || null,
            });
          }

          const publicRef = getSyllabusPublicRef(syllabus);
          const outlines = sylBody?.data?.outlines || sylBody?.outlines || [];
          fetchedContent = outlines.find((o) => (
            String(o.id) === String(topicId)
            || String(o.syllabus_outline_uuid || '') === String(topicId)
            || String(o.uuid || '') === String(topicId)
          )) || null;

          if (fetchedContent && mounted) {
            const next = new URLSearchParams(searchParams);
            let changed = false;

            if (
              publicRef
              && syllabus?.id != null
              && String(next.get('syllabusId') || '') === String(syllabus.id)
              && String(publicRef) !== String(syllabus.id)
            ) {
              next.set('syllabusId', String(publicRef));
              changed = true;
            }

            const outlineRef = getOutlinePublicRef(fetchedContent);
            if (
              outlineRef
              && fetchedContent.id != null
              && String(next.get('topicId') || '') === String(fetchedContent.id)
              && String(outlineRef) !== String(fetchedContent.id)
            ) {
              next.set('topicId', String(outlineRef));
              changed = true;
            }

            if (changed) setSearchParams(next, { replace: true });
          }

          if (!fetchedContent) {
            setSyllabusData(null);
            setActiveContent(null);
            setLoadError('Topic content not found.');
            return;
          }
        } else if (chapterId) {
          const chapRes = await fetch(`${API_BASE_URL}/api/chapters/${chapterId}`);
          const chapBody = await chapRes.json().catch(() => ({}));
          if (!chapRes.ok) {
            throw new Error(chapBody?.message || 'Chapter not found.');
          }
          fetchedContent = chapBody?.data || chapBody;
        } else if (syllabusId && syllabusId !== 'undefined') {
          setSyllabusData(null);
          setActiveContent(null);
          setLoadError('No topic selected. Choose a topic from the syllabus.');
          return;
        }

        if (!fetchedContent) {
          setSyllabusData(null);
          setActiveContent(null);
          setLoadError('Content not found.');
          return;
        }

        if (mounted) setActiveContent(fetchedContent);
      } catch (err) {
        console.error('Failed to load content:', err);
        if (mounted) {
          setSyllabusData(null);
          setActiveContent(null);
          setLoadError(err.message || 'Failed to load content. Check your connection and try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadContent();

    return () => {
      mounted = false;
    };
  }, [courseId, syllabusId, topicId, categoryTopicId, chapterId, retryKey]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const backTopicId = categoryTopicId || activeContent?.topic_id;
    if (backTopicId) {
      navigate(buildSyllabusPartPath(backTopicId));
      return;
    }
    navigate('/syllabuses');
  };

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
          const pdf = atts.find((a) => a.file_type === 'application/pdf' || (a.file_path || '').toLowerCase().endsWith('.pdf') || (a.file_url || '').toLowerCase().endsWith('.pdf'));
          if (pdf) path = pdf.file_path || pdf.file_url;
        }
      } catch (e) {
        console.warn('Error parsing attachments', e);
      }
    }

    if (path) {
      return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    }
    return null;
  }, [activeContent]);

  const handleForceDownload = async () => {
    if (!pdfUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Network response was not ok');

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
      console.warn('Direct download blocked. Falling back to new tab.', error);
      window.open(pdfUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const contentTitle = activeContent?.title || syllabusData?.title || 'Loading Content...';
  const contentAuthor = syllabusData?.instructor_name || syllabusData?.author_name || 'Academia Team';
  const contentAbstract = activeContent?.abstract || activeContent?.subtitle || syllabusData?.description || 'No summary provided.';

  const rawBody = activeContent?.explanation || activeContent?.description || '';
  const contentBodyHTML = (rawBody.trim().startsWith('[') || rawBody.trim().startsWith('{')) ? null : rawBody;

  const contentAuthorAvatar = syllabusData?.instructor_avatar || syllabusData?.user_avatar || null;
  const authorAvatarSrc = contentAuthorAvatar
    ? (contentAuthorAvatar.startsWith('http') ? contentAuthorAvatar : `${API_BASE_URL}${contentAuthorAvatar}`)
    : learnersProfileImage;

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
    return allTopics.find((t) => String(t.id) === String(activeContent.topic_id));
  }, [allTopics, activeContent]);

  const relatedTopics = useMemo(() => {
    if (!activeTopic) {
      return allTopics.slice(0, 6);
    }
    return allTopics.filter((t) =>
      t.id !== activeTopic.id &&
      (t.subcategoryId === activeTopic.subcategoryId || t.categoryId === activeTopic.categoryId)
    ).slice(0, 6);
  }, [allTopics, activeTopic]);

  if (loading) {
    return <PublicLoading message="Loading content…" />;
  }

  if (loadError || !activeContent) {
    return (
      <PublicLoadError
        title="Content unavailable"
        message={loadError || 'Content not found.'}
        onRetry={() => setRetryKey((key) => key + 1)}
        backTo="/syllabuses"
        backLabel="Browse syllabuses"
      />
    );
  }

  return (
    <div className="academia-read-contents-page">
      <section className="rc-shell">
        <nav className="rc-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="rc-back" onClick={handleBack} aria-label="Go back">
            <img src={acLeIcon} alt="" />
          </button>
          <div className="rc-crumb-trail">
            <span>{syllabusData?.category || 'Academia'}</span>
            <span aria-hidden="true">/</span>
            <span>{syllabusData?.title || 'Syllabus'}</span>
            <span aria-hidden="true">/</span>
            <span className="rc-crumb-current">{contentTitle}</span>
          </div>
        </nav>

        <header className="rc-hero">
          <div className="rc-hero-copy">
            <p className="rc-eyebrow">{syllabusData?.level || 'Syllabus outline'}</p>
            <h1>{contentTitle}</h1>
            <div className="rc-author">
              <img src={authorAvatarSrc} alt="" className="rc-author-avatar" />
              <span>By {contentAuthor}</span>
            </div>
          </div>
          {pdfUrl ? (
            <div className="rc-hero-actions">
              <button type="button" className="rc-btn rc-btn--ghost" onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}>
                Open PDF
              </button>
              <button type="button" className="rc-btn rc-btn--solid" onClick={handleForceDownload} disabled={isDownloading}>
                <img src={acDlIcon} alt="" />
                <span>{isDownloading ? 'Saving…' : 'Download'}</span>
              </button>
            </div>
          ) : null}
        </header>

        <div className="rc-layout">
          <article className="rc-article">
            <section className="rc-section">
              <h2>Summary</h2>
              <div
                className="rc-prose rc-prose--lead"
                dangerouslySetInnerHTML={{ __html: formatHtmlContent(contentAbstract) }}
              />
            </section>

            {activeContent?.video_url ? (
              <section className="rc-section rc-media">
                <h2>Video</h2>
                <div className="rc-video">
                  {isYoutubeUrl(activeContent.video_url) ? (
                    <iframe
                      src={resolveYoutubeEmbedUrl(activeContent.video_url)}
                      title="Lesson video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeContent.video_url.startsWith('/') && !activeContent.video_url.startsWith('/src/') ? `${API_BASE_URL}${activeContent.video_url}` : activeContent.video_url}
                      controls
                    />
                  )}
                </div>
              </section>
            ) : null}

            {contentBodyHTML ? (
              <section className="rc-section">
                <h2>Detailed content</h2>
                <div
                  className="rc-prose rich-text-content"
                  dangerouslySetInnerHTML={{ __html: formatHtmlContent(contentBodyHTML) }}
                />
              </section>
            ) : null}

            <section className="rc-section rc-document">
              <div className="rc-section-head">
                <h2>Syllabus material</h2>
                {pdfUrl ? (
                  <div className="rc-doc-actions">
                    <button type="button" className="rc-btn rc-btn--ghost" onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}>
                      Open in new tab
                    </button>
                    <button type="button" className="rc-btn rc-btn--solid" onClick={handleForceDownload} disabled={isDownloading}>
                      {isDownloading ? 'Saving…' : 'Save file'}
                    </button>
                  </div>
                ) : null}
              </div>

              {pdfUrl ? (
                <div className="rc-pdf-frame">
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    title="PDF document viewer"
                    loading="lazy"
                  />
                </div>
              ) : (
                <p className="rc-empty">No downloadable PDF or attachment is available for this outline yet.</p>
              )}
            </section>
          </article>

          <aside className="rc-aside">
            <h2>Related topics</h2>
            {relatedTopics.length > 0 ? (
              <ul className="rc-related-list">
                {relatedTopics.map((topic) => (
                  <li key={topic.id}>
                    <button type="button" className="rc-related-link" onClick={() => navigate(buildSyllabusPartPath(topic))}>
                      <span className="rc-related-name">{topic.name}</span>
                      <span className="rc-related-meta">{topic.papers ? topic.papers.length : 0} outlines</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rc-empty">No related topics in this category.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <img src={acSmsIcon} alt="" className="ac-sms" />
            <input
              type="email"
              placeholder="Enter email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">
              <img src={acSendIcon} alt="" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadContents;
