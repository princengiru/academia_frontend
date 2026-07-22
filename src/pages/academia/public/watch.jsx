import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import acStat1Icon from '../../../assets/icons/ac-stat1.svg';
import acStat2Icon from '../../../assets/icons/ac-stat2.svg';
import acStat3Icon from '../../../assets/icons/ac-stat3.svg';
import acStat4Icon from '../../../assets/icons/ac-stat4.svg';
import acMailIcon from '../../../assets/icons/ac-mail.png';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import journalImage from '../../../assets/imgs/journal.jpg';
import './watch.css';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildStoryPath } from './publicShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveStoryImage = (value) => {
  if (!value) return null;

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
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

function AcademiaWatch() {
  usePublicPageTitle('Community Feed');
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/community-stories?page=${page}&limit=12`);
        const body = await res.json().catch(() => ({}));
        if (!mounted) return;
        const data = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
        const normalized = data.map(normalizeStory);
        setStories(normalized);
        setPagination(body?.pagination || body?.meta || null);
      } catch (e) {
        // keep empty
        setStories([]);
        setPagination(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [page]);

  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();
  const featuredStory = stories[0] || null;
  const totalStories = pagination?.total ?? pagination?.totalItems ?? stories.length;

  return (
    <div className="academia-watch-page">
      <section className="stats-sec">
        <div className="stats-sec-item">
          <div>
            <img src={acStat1Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>{loading ? '…' : String(stories.length)}</h5>
            <p>Stories on this page</p>
          </div>
        </div>
        <div className="stats-sec-item">
          <div>
            <img src={acStat2Icon} alt="Stats Icon" />
          </div>
          <div>
            <h5>{loading ? '…' : String(totalStories)}</h5>
            <p>Published stories</p>
          </div>
        </div>
      </section>

      <section className="hero-sec">
        <div className="main-content-grid">
          <div className="story-thumbnail">
            <img
              src={resolveStoryImage(featuredStory?.thumbnail) || journalImage}
              alt={featuredStory?.title || 'Community stories'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
          <div className="main-content-grid-l">
            <div className="watch-content">
              <h2>{featuredStory?.title || 'Community stories'}</h2>
              <p>
                {featuredStory?.description || featuredStory?.excerpt || 'Read learning updates and stories published by the Academia community. Counts above reflect what is currently published on this page.'}
              </p>
              {featuredStory ? (
                <button type="button" onClick={() => navigate(buildStoryPath(featuredStory))}>
                  Read featured story
                </button>
              ) : null}
            </div>

            <div className="watch-cta">
              <div className="watch-cta-l">
                <div className="watch-cta-stack">
                  <div className="watch-cta-thumb main-thumb">
                    <img src={resolveStoryImage(featuredStory?.thumbnail) || journalImage} alt="Featured story" />
                  </div>
                </div>
              </div>
              <div className="watch-cta-r">
                <button type="button" onClick={() => navigate('/academia/courses')}>
                  <img src={acNextIcon} alt="Browse courses" />
                  <span>Browse courses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="new-content">
        <h2>Our Community Stories</h2>
        <div className="new-content-l">
          <img src={acMailIcon} alt="Mail" />
          <div>
            <h6>Newsletter</h6>
            <p>Subscriptions open soon</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="new-main-content-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="ss-item ss-empty">
              <div className="ss-item-img">
                <div className="skeleton-img" />
              </div>
              <div className="ss-item-text">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}

          {!loading && stories && stories.length > 0 && stories.map((story) => (
            <div
              key={story.id}
              className="ss-item"
              onClick={() => navigate(buildStoryPath(story))}
              style={{ cursor: 'pointer' }}
            >
              <div className="ss-item-img">
                  {resolveStoryImage(story.thumbnail) ? <img src={resolveStoryImage(story.thumbnail)} alt={story.title} /> : null}
              </div>
              <div className="ss-item-text">
                <div className="ss-item-text-h">
                  <div>
                    <img src={acUsIcon} alt="User" />
                    <span>{story.author_name}</span>
                  </div>
                  <div>
                    <img src={acMessIcon} alt="Messages" />
                    <span>{story.comments_count || 0}</span>
                  </div>
                </div>
                <h4>{story.title}</h4>
                <p>{story.description}</p>
                <div className="ss-item-text-f">
                  <div>
                    <img src={acCalIcon} alt="Calendar" />
                    <span>{new Date(story.published_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <button type="button" onClick={(e) => e.stopPropagation()}>
                    <img src={acShareIcon} alt="Share" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && (!stories || stories.length === 0) && (
            <div className="ss-empty-state">
              <div className="empty-title">No community stories</div>
              <div className="empty-desc">There are no community stories published yet.</div>
            </div>
          )}
        </div>
      </section>

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

export default AcademiaWatch;

