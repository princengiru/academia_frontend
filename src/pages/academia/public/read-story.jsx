import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// --- Icons & Images ---
import acLeftIcon from '../../../assets/icons/ac-le.svg';
import acComIcon from '../../../assets/icons/ac-com.svg';
import acSide3Icon from '../../../assets/icons/ac-sd3.svg';
import acSavIcon from '../../../assets/icons/ac-sav.svg';
import acEyeIcon from '../../../assets/icons/ac-eye.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import con3Icon from '../../../assets/icons/con3.svg';
import con4Icon from '../../../assets/icons/con4.svg';
import con5Icon from '../../../assets/icons/con5.svg';
import con6Icon from '../../../assets/icons/con6.svg';
import sha2Icon from '../../../assets/icons/sha2.svg';
import pictureIcon from '../../../assets/icons/picture.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import './read-story.css';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { sharePublicPage, buildAuthorPath, buildStoryPath, getStoryPublicRef, getUserPublicRef } from './publicShare';

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

const resolveStoryImage = (value) => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
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

const normalizeStory = (story) => {
  if (!story) return null;
  return {
    ...story,
    id: story.id || story._id || story.story_id,
    title: story.title || story.heading || 'Story',
    content: story.content || story.description || '',
    contentHtml: story.contents || story.contentHtml || story.content_html || '',
    thumbnail: story.thumbnail || story.thumbnail_url || story.image || null,
    author_name: story.author_name || story.uploaded_by_name || story.user_name || 'Author',
    author_id: story.author_id || story.user_id || story.uploaded_by || story.uploaded_by_id || null,
    author_avatar: story.author_avatar || story.uploaded_by_avatar || story.user_avatar || null,
    author_role: story.author_role || story.role || 'Contributor',
    read_time: story.read_time || story.readTime || null,
    published_at: story.published_at || story.created_at || null,
  };
};

const normalizeComment = (comment) => {
  if (!comment) return null;
  return {
    id: comment.id || comment.comment_id,
    author: comment.user_name || comment.author || 'Author',
    text: comment.content || comment.comment || '',
    time: comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now',
    avatar: comment.user_avatar || comment.avatar || null,
  };
};

function AcademiaReadStory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const storyId = searchParams.get('id');

  const swiperRef = useRef(null);
  const commentInputRef = useRef(null);

  // --- State ---
  const [storyData, setStoryData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [relatedStories, setRelatedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [commentNotice, setCommentNotice] = useState('');
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  usePublicPageTitle(storyData?.title || 'Story');

  // --- Data Fetching ---
  // Depend on storyId so clicking a related story re-fetches the page seamlessly
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      setLoading(true);
      setLoadError('');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        if (!storyId) {
          setStoryData(null);
          setRelatedStories([]);
          setComments([]);
          setLoadError('No story selected.');
          return;
        }

        const [storyRes, storiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/community-stories/${storyId}`),
          fetch(`${API_BASE_URL}/api/community-stories?page=1&limit=8`),
        ]);

        const storyBody = await storyRes.json().catch(() => ({}));
        const storiesBody = await storiesRes.json().catch(() => ({}));

        if (!mounted) return;

        const publishedStories = Array.isArray(storiesBody?.data) ? storiesBody.data : (Array.isArray(storiesBody) ? storiesBody : []);

        if (!storyRes.ok) {
          setStoryData(null);
          setRelatedStories(
            publishedStories
              .map((story) => normalizeStory(story))
              .filter(Boolean)
          );
          setComments([]);
          setLoadError(storyBody?.message || 'Story not found.');
          return;
        }

        const activeStory = normalizeStory(storyBody?.data || storyBody || null);
        if (!activeStory) {
          setStoryData(null);
          setRelatedStories([]);
          setComments([]);
          setLoadError('Story not found.');
          return;
        }

        setStoryData(activeStory);

        const publicRef = getStoryPublicRef(activeStory);
        if (publicRef && String(storyId) === String(activeStory.id)) {
          const next = new URLSearchParams(searchParams);
          next.set('id', String(publicRef));
          setSearchParams(next, { replace: true });
        }

        setRelatedStories(
          publishedStories
            .map((story) => normalizeStory(story))
            .filter(Boolean)
            .filter((story) => String(story.id) !== String(activeStory.id))
        );

        await fetchComments(activeStory.id);
      } catch (e) {
        console.error("Failed to load story:", e);
        if (mounted) {
          setStoryData(null);
          setRelatedStories([]);
          setComments([]);
          setLoadError('Failed to load story. Check your connection and try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadContent();
    return () => { mounted = false; };
  }, [storyId, retryKey]);

  // Fetch comments from the new API
  const fetchComments = async (storyId) => {
    try {
      setCommentsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/community-stories/stories/${storyId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setComments(result.data.map(normalizeComment).filter(Boolean));
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit a new comment
  const handleAuthor = () => {
    const authorRef = getUserPublicRef({
      user_uuid: storyData?.uploaded_by_uuid || storyData?.author_uuid || storyData?.user_uuid,
      id: storyData?.author_id,
    });
    if (authorRef) {
      navigate(buildAuthorPath(authorRef));
      return;
    }
    navigate('/watch');
  };

  const handleShareStory = async () => {
    const result = await sharePublicPage({
      title: storyData?.title || 'Story',
      text: storyData?.content || '',
    });
    if (result.ok && result.method === 'clipboard') {
      setCommentNotice('Story link copied to clipboard.');
    } else if (!result.ok && result.method === 'none') {
      setCommentNotice('Unable to share from this browser.');
    }
    setTimeout(() => setCommentNotice(''), 4000);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !storyData?.id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      navigate('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/community-stories/stories/${storyData.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          story_id: storyData.id,
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setNewComment('');
      setCommentNotice('');
      fetchComments(storyData.id);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentNotice('Failed to submit comment. Please try again.');
      setTimeout(() => setCommentNotice(''), 4000);
    }
  };

  // --- Swiper Initialization ---
  useEffect(() => {
    // Only initialize Swiper when we have data and are done loading
    if (loading || relatedStories.length === 0) return;

    const swiperContainer = document.querySelector('.ss-swiper');
    if (!swiperContainer) return;

    swiperRef.current = new Swiper(swiperContainer, {
      modules: [Navigation],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: '.ss-swiper .swiper-button-next',
        prevEl: '.ss-swiper .swiper-button-prev',
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        769: { slidesPerView: 4 },
      },
    });

    return () => {
      if (swiperRef.current) swiperRef.current.destroy(true, true);
    };
  }, [loading, relatedStories]);

  // --- Handlers ---
  const handleTextareaInput = () => {
    if (!commentInputRef.current) return;
    commentInputRef.current.style.height = 'auto';
    commentInputRef.current.style.height = `${commentInputRef.current.scrollHeight}px`;
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/watch');
  };

  const handleRelatedStoryClick = (storyOrId) => {
    navigate(buildStoryPath(storyOrId));
  };

  // --- Derived Variables ---
  const currentStoryTitle = storyData?.title || storyData?.heading || 'Untitled story';
  const currentStoryAuthor = storyData?.author_name || 'Academia Team';
  const currentStoryRole = storyData?.author_role || 'Contributor';
  const currentStoryImage = resolveStoryImage(storyData?.thumbnail);
  const currentStoryContent = storyData?.contentHtml || storyData?.content || '';
  const currentStoryReadTime = storyData?.read_time ? `${storyData.read_time} mins read` : '—';
  const currentStoryDate = storyData ? new Date(storyData.published_at || Date.now()).toLocaleDateString() : '';

  if (loading) {
    return <PublicLoading message="Loading story…" />;
  }

  if (loadError || !storyData) {
    return (
      <PublicLoadError
        title="Story unavailable"
        message={loadError || 'Story not found.'}
        onRetry={() => setRetryKey((key) => key + 1)}
        backTo="/watch"
        backLabel="Browse stories"
      />
    );
  }

  return (
    <div className="academia-read-story-page">
      <section className="main-content">
        
        {/* --- Breadcrumb --- */}
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack} style={{ cursor: 'pointer' }}>
            <img src={acLeftIcon} alt="Back" />
          </button>
          <div>
            <p>Community stories</p>
            <span>/</span>
            <span>Story details</span>
            <span>/</span>
          </div>
        </div>

        {/* --- Header / Headline Section --- */}
        <div className="article-header">
          <h1 className="article-title">{currentStoryTitle}</h1>
          
          <div className="article-meta-row">
            <div className="story-author">
              <div className="story-author-img">
                <img src={resolveStoryImage(storyData?.author_avatar) || learnersProfileImage} alt={currentStoryAuthor} />
              </div>
              <div
                className="story-author-name"
                style={{ cursor: 'pointer' }}
                onClick={handleAuthor}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleAuthor();
                }}
              >
                <h6>{currentStoryAuthor}</h6>
                <label>{currentStoryRole}</label>
              </div>
            </div>

            <div className="article-reading-info">
              <span>{currentStoryReadTime}</span>
              <span className="meta-separator">•</span>
              <span>{currentStoryDate}</span>
            </div>

            <div className="story-footer-r">
              <div>
                <button type="button" onClick={handleShareStory}>
                  <img src={sha2Icon} alt="Share" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Large Hero Featured Image --- */}
        <div className="article-hero-container">
          {currentStoryImage ? (
            <img src={currentStoryImage} alt={currentStoryTitle} className="article-hero-image" />
          ) : null}
        </div>

        {/* --- Two Column Layout --- */}
        <div className="main-content-new-grid">
          
          {/* Left Column: Full Story + Comments */}
          <div className="mcnd-l">
            
            {/* The Story Content (Rich Text) */}
            <div className="full-story">
              {currentStoryContent ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatHtmlContent(storyData?.contentHtml || (`<p>${String(currentStoryContent).replace(/\n/g, '</p><p>')}</p>`)) 
                  }} 
                  className="story-html-content"
                />
              ) : (
                <div className="story-empty" style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '12px', color: '#64748B' }}>
                  <h4>No story content yet</h4>
                  <p>This published story does not include full body content yet.</p>
                </div>
              )}
              
              {/* YouTube Video Embed */}
              {storyData?.youtube_url && (
                <div className="story-youtube-embed" style={{ marginTop: '36px' }}>
                  <iframe
                    width="100%"
                    height="450"
                    src={resolveYoutubeEmbedUrl(storyData.youtube_url)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ borderRadius: '12px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0, 0, 0, 0.03)', display: 'block' }}
                  ></iframe>
                </div>
              )}
            </div>

            <hr className="story-comments-divider" />

            {/* Comments Section */}
            <div className="comments-section-container">
              <div className="mcnd-l-h">
                <h2>Comments</h2>
                <div className="new-comment">
                  <div className="new-comment-sender">
                    <img src={learnersProfileImage} alt="Current user" />
                  </div>
                  <div className="new-comment-text">
                    <textarea
                      ref={commentInputRef}
                      rows={1}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onInput={handleTextareaInput}
                    />
                    <button type="button" onClick={handleSubmitComment} disabled={!newComment.trim() || commentsLoading}>
                      <img src={pictureIcon} alt="Attach" />
                    </button>
                  </div>
                </div>
                {commentNotice ? (
                  <p className="public-comment-notice" role="status">{commentNotice}</p>
                ) : null}
              </div>

              <div className="mcnd-l-b">
                <div className="mcnd-l-b-h">
                  <button type="button">
                    <img src={acComIcon} alt="Comments" />
                    <span>{comments.length} Comments</span>
                  </button>
                  <button type="button">
                    <img src={acSide3Icon} alt="Likes" />
                    <span>{storyData?.likes_count || 0} Likes</span>
                  </button>
                  <button type="button">
                    <img src={acSavIcon} alt="Saves" />
                    <span>{storyData?.saves_count || 0} Saves</span>
                  </button>
                </div>

                <div className="mcnd-l-b-b">
                  {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-img">
                        <img src={resolveStoryImage(comment.avatar) || learnersProfileImage} alt="Comment author" />
                      </div>
                      <div className="comment-text">
                        <div>
                          <h6>{comment.author}</h6>
                          <span>{comment.time}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="comment comment-empty" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                      <div className="comment-text" style={{ textAlign: 'center', width: '100%', padding: '16px' }}>
                        <h6 style={{ color: '#0F172A', marginBottom: '4px' }}>No comments yet</h6>
                        <p style={{ color: '#64748B' }}>Be the first to share a thought on this story.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="mcnd-r">
            <div className="sticky-sidebar-content">
              <div className="mcnd-r-h">
                <h3>Related Stories</h3>
              </div>
              <div className="mcnd-r-b">
                {relatedStories.length > 0 ? relatedStories.slice(0, 3).map((item) => (
                  <div key={item.id} className="related-item" onClick={() => handleRelatedStoryClick(item)} style={{ cursor: 'pointer' }}>
                    <div className="related-item-img">
                      {resolveStoryImage(item.thumbnail) ? <img src={resolveStoryImage(item.thumbnail)} alt={item.title} /> : null}
                    </div>
                    <div className="related-item-l">
                      <div className="related-item-l-t">
                        <div>
                          <label>By</label>
                          <h6>{item.author_name}</h6>
                        </div>
                        <div>
                          <p>
                            <img src={acSide3Icon} alt="Likes" />
                            <span>{item.likes_count || 0}</span>
                          </p>
                          <p>
                            <img src={acEyeIcon} alt="Views" />
                            <span>{item.views_count || 0}</span>
                          </p>
                        </div>
                      </div>
                      <div className="related-item-l-b">
                        <p>{item.title}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="related-item related-item-empty" style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', justifyContent: 'center' }}>
                    <div className="related-item-l">
                      <div className="related-item-l-b" style={{ textAlign: 'center', color: '#64748B' }}>
                        <p>No related stories available.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {relatedStories.length > 3 && (
                <div className="mcnd-r-CTA">
                  <button type="button" onClick={() => navigate('/watch')}>See more</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* --- More Stories Swiper (Bottom) --- */}
      <section className="main-content">
        <div className="stories-sec-contents">
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              {relatedStories.length > 0 ? relatedStories.slice(0, 8).map((item) => (
                <div key={item.id} className="swiper-slide">
                  <div className="ss-item" onClick={() => handleRelatedStoryClick(item)} style={{ cursor: 'pointer' }}>
                    <div className="ss-item-img">
                      {resolveStoryImage(item.thumbnail) ? <img src={resolveStoryImage(item.thumbnail)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                    <div className="ss-item-text">
                      <div className="ss-item-text-h">
                        <div>
                          <img src={acUsIcon} alt="User" />
                          <span>{item.author_name || 'Admin'}</span>
                        </div>
                        <div>
                          <img src={acMessIcon} alt="Messages" />
                          <span>{item.feedback_count || 0}</span>
                        </div>
                      </div>
                      <h4>{item.title}</h4>
                      <p>
                        {item.abstract || item.content || 'A community story from the public archive.'}
                      </p>
                      <div className="ss-item-text-f">
                        <div>
                          <img src={acCalIcon} alt="Calendar" />
                          <span>{item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}</span>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); }}>
                          <img src={acShareIcon} alt="Share" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="swiper-slide" style={{ width: '100%' }}>
                  <div className="story-empty story-empty-swiper" style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B' }}>
                    <h4>No more stories yet</h4>
                    <p>Published stories will appear here once the archive grows.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="swiper-button-next ss-btn"></div>
            <div className="swiper-button-prev ss-btn"></div>
          </div>
        </div>

        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/watch')}>
            <span>View All Stories</span>
            <img src={acNextIcon} alt="Next" />
          </button>
        </div>
      </section>

      {/* --- Newsletter Section --- */}
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
              <img src={acSendIcon} alt="Next" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadStory;