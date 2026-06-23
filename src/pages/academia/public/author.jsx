import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import acGtIcon from '../../../assets/icons/ac-gt.svg';
import acUedIcon from '../../../assets/icons/ac-ued.svg';
import acBriIcon from '../../../assets/icons/ac-bri.svg';
import acGeoIcon from '../../../assets/icons/ac-geo.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLkIcon from '../../../assets/icons/ac-lk.svg';
import acHer1Icon from '../../../assets/icons/ac-her1.svg';
import acHer2Icon from '../../../assets/icons/ac-her2.svg';
import acEyeIcon from '../../../assets/icons/ac-eye.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import journalImage from '../../../assets/imgs/journal.jpg';
import acHrImage from '../../../assets/imgs/ac-hr.jpg';
import acJrImage from '../../../assets/imgs/ac-jr.jpg';
import acStrImage from '../../../assets/imgs/ac-str.jpg';
import glImage from '../../../assets/imgs/gl.jpg';
import itemImage from '../../../assets/imgs/item.jpg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import './author.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveAuthorImage = (value, fallback = learnersProfileImage) => {
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

const normalizeProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    id: project.id || project._id || project.project_id,
    title: project.title || project.name || 'Project',
    abstract: project.abstract || project.description || '',
    thumbnail_url: project.thumbnail_url || project.thumbnail || project.image || null,
    user_name: project.user_name || project.author_name || project.author || 'Author',
    user_avatar: project.user_avatar || project.author_avatar || project.avatar || null,
    user_role: project.user_role || project.role || 'UI/UX Designer',
    likes_count: project.likes_count ?? project.likes ?? 0,
    views_count: project.views_count ?? project.views ?? 0,
    feedback_count: project.feedback_count ?? project.feedbacks_count ?? project.feedbacks ?? 0,
    created_at: project.created_at || project.createdAt || null,
  };
};

const formatMemberSince = (createdAt) => {
  if (!createdAt) return 'January 24, 2021';
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return 'January 24, 2021';
  return parsedDate.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

function AcademiaAuthor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moreFromSwiperRef = useRef(null);
  
  // --- State Management ---
  const [authorProfile, setAuthorProfile] = useState(null);
  const [authorProjects, setAuthorProjects] = useState([]);
  const [followerStats, setFollowerStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  
  // --- Loading States ---
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // --- Newsletter State ---
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // --- Handlers ---
  const preventDefault = (e) => e.preventDefault();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    // TODO: Connect to backend newsletter endpoint
    console.log("Subscribing email:", newsletterEmail);
    setNewsletterEmail('');
    alert("Subscribed successfully!"); // Replace with custom pushFeedback if you have it implemented globally
  };

  // --- Swiper Initialization ---
  useEffect(() => {
    const swiperContainer = moreFromSwiperRef.current;
    if (!swiperContainer || projectsLoading) return undefined;

    const swiper = new Swiper(swiperContainer, {
      modules: [Navigation],
      slidesPerView: 'auto',
      spaceBetween: 20,
      navigation: {
        nextEl: '.more-from-grid .swiper-button-next',
        prevEl: '.more-from-grid .swiper-button-prev',
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        769: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
      observer: true, // Updates Swiper if DOM changes
      observeParents: true,
    });

    return () => {
      if (swiper) swiper.destroy(true, true);
    };
  }, [authorProjects, projectsLoading]); // Added dependencies to re-init when projects load

  // --- Data Fetching ---
  useEffect(() => {
    let mounted = true;

    const loadAuthor = async () => {
      setLoading(true);
      setProjectsLoading(true);

      try {
        const requestedAuthorId = searchParams.get('authorId') || searchParams.get('userId') || searchParams.get('id');

        let resolvedAuthorId = requestedAuthorId;
        let fetchedProjects = [];
        let seedProject = null;

        if (resolvedAuthorId) {
          const userProjectsRes = await fetch(`${API_BASE_URL}/api/projects/user/${resolvedAuthorId}`);
          const userProjectsBody = await userProjectsRes.json().catch(() => ({}));
          fetchedProjects = Array.isArray(userProjectsBody?.data)
            ? userProjectsBody.data.map((project) => normalizeProject(project)).filter(Boolean)
            : [];
        } else {
          const publicProjectsRes = await fetch(`${API_BASE_URL}/api/projects`);
          const publicProjectsBody = await publicProjectsRes.json().catch(() => ({}));
          const publicProjects = Array.isArray(publicProjectsBody?.data)
            ? publicProjectsBody.data
            : Array.isArray(publicProjectsBody)
              ? publicProjectsBody
              : [];

          seedProject = normalizeProject(publicProjects[0]);
          resolvedAuthorId = seedProject?.user_id || seedProject?.author_id || seedProject?.userId || null;

          if (resolvedAuthorId) {
            const userProjectsRes = await fetch(`${API_BASE_URL}/api/projects/user/${resolvedAuthorId}`);
            const userProjectsBody = await userProjectsRes.json().catch(() => ({}));
            fetchedProjects = Array.isArray(userProjectsBody?.data)
              ? userProjectsBody.data.map((project) => normalizeProject(project)).filter(Boolean)
              : [];
          } else {
            fetchedProjects = publicProjects.map((project) => normalizeProject(project)).filter(Boolean);
          }
        }

        if (!mounted) return;

        const primaryProject = fetchedProjects[0] || seedProject || null;
        setAuthorProjects(fetchedProjects);
        
        if (primaryProject) {
          setAuthorProfile({
            id: primaryProject.user_id || resolvedAuthorId || null,
            name: primaryProject.user_name || 'Xavera KABARANGA',
            role: primaryProject.user_role || 'UI/UX Designer',
            avatar: primaryProject.user_avatar || null,
            location: primaryProject.location || 'Kigali, Rwanda',
            about: primaryProject.abstract || primaryProject.description || '',
            memberSince: formatMemberSince(primaryProject.created_at),
            availability: primaryProject.availability || 'Available Now',
            experience: primaryProject.experience || '6 yrs experience',
          });
        }

        // Fetch Follower Stats safely
        if (resolvedAuthorId) {
          try {
            const statsRes = await fetch(`${API_BASE_URL}/api/followers/stats?userId=${resolvedAuthorId}`);
            if (statsRes.ok) {
              const totalFollowers = await statsRes.json();
              if (mounted && totalFollowers?.data) {
                setFollowerStats({
                  followers: Number(totalFollowers.data.followers) || 0,
                  following: Number(totalFollowers.data.following) || 0,
                });
              }
            }
          } catch (e) { console.warn("Failed to fetch follower stats"); }
        }

        // Check if current user is following this author
        const token = localStorage.getItem('token');
        if (token && resolvedAuthorId) {
          try {
            const followCheckRes = await fetch(`${API_BASE_URL}/api/followers/check?followingId=${resolvedAuthorId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (followCheckRes.ok) {
              const followCheckBody = await followCheckRes.json();
              if (mounted) setIsFollowing(Boolean(followCheckBody?.data?.is_following));
            }
          } catch (e) { console.warn("Failed to check follow status"); }
        }
      } catch (error) {
        if (mounted) {
          setAuthorProfile(null);
          setAuthorProjects([]);
          setFollowerStats({ followers: 0, following: 0 });
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setProjectsLoading(false);
        }
      }
    };

    loadAuthor();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // --- Derived Variables ---
  const authorName = authorProfile?.name || 'Xavera KABARANGA';
  const authorRole = authorProfile?.role || 'UI/UX Designer';
  const authorAvatar = resolveAuthorImage(authorProfile?.avatar, learnersProfileImage);
  const authorLocation = authorProfile?.location || 'Kigali, Rwanda';
  const authorAvailability = authorProfile?.availability || 'Available Now';
  const authorExperience = authorProfile?.experience || '6 yrs experience';
  const authorBio = authorProfile?.about || '';
  const memberSince = authorProfile?.memberSince || 'January 24, 2021';
  const primaryProject = authorProjects[0] || null;

  const totals = authorProjects.reduce((accumulator, project) => {
    accumulator.views += Number(project.views_count) || 0;
    accumulator.likes += Number(project.likes_count) || 0;
    accumulator.feedbacks += Number(project.feedback_count) || 0;
    return accumulator;
  }, { views: 0, likes: 0, feedbacks: 0 });

  // --- Action Handlers ---
  const handleOpenProject = (projectId) => {
    if (!projectId) return;
    navigate(`/academia/read-journal?id=${projectId}`);
  };

  const handleToggleFollow = async () => {
    const followingId = authorProfile?.id;
    if (!followingId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/academia/auth/signin');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/followers`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update follow status');

      setIsFollowing(Boolean(body?.data?.is_following ?? !isFollowing));
      setFollowerStats((currentStats) => ({
        ...currentStats,
        followers: isFollowing ? Math.max(0, currentStats.followers - 1) : currentStats.followers + 1,
      }));
    } catch (error) {
      console.error('Toggle follow error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetInTouch = () => {
    if (primaryProject?.id) {
      navigate(`/academia/read-journal?id=${primaryProject.id}`);
      return;
    }
    navigate('/academia/journals');
  };

  const handleHireUs = () => {
    handleGetInTouch();
  };

  // --- Render ---
  return (
    <div className="academia-author-page">
      
      {/* Hero Section */}
      <section className="hero-sec">
        <div
          className="hero-sec-inner"
          style={{
            backgroundImage: `linear-gradient(270deg, rgba(69, 4, 104, 0.6) 0%, rgba(0, 0, 0, 0.6) 100%), url(${primaryProject?.thumbnail_url ? resolveAuthorImage(primaryProject.thumbnail_url, acHrImage) : acHrImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {loading ? (
            <div className="hsi-text" style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
              <p style={{ color: '#fff', fontSize: '1.2rem' }}>Loading author profile...</p>
            </div>
          ) : (
            <>
              <div className="hsi-img">
                <img src={authorAvatar} alt={authorName} />
              </div>
              <div className="hsi-text">
                <div>
                  <h6>{authorName}</h6>
                  <p>|</p>
                  <p>{authorRole}</p>
                </div>
                <div>
                  <p>Member Since: {memberSince}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="main-content-grid">
          
          {/* Left Column: Author Stats & Info */}
          <div className="main-content-grid-l">
            <div className="mcgl-t">
              <div className="mcgl-t-1">
                <div></div>
                <p>{authorAvailability}</p>
              </div>
              <div className="mcgl-t-items">
                <div className="mcgl-t-item">
                  <img src={acUedIcon} alt="UI UX Design" />
                  <span>{authorRole}</span>
                </div>
                <div className="mcgl-t-item">
                  <img src={acBriIcon} alt="Experience" />
                  <span>{authorExperience}</span>
                </div>
                <div className="mcgl-t-item">
                  <img src={acGeoIcon} alt="Location" />
                  <span>{authorLocation}</span>
                </div>
              </div>
            </div>

            <div className="mcgl-actions">
              <button type="button" onClick={handleToggleFollow} disabled={actionLoading}>
                <img src={acPpIcon} alt="Follow" />
                <span>{actionLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow'}</span>
              </button>
              <button type="button" onClick={handleGetInTouch}>
                <span>Get In Touch</span>
                <img src={acLkIcon} alt="Get in touch" />
              </button>
            </div>

            <div className="mcgl-about">
              <h4>About</h4>
              {authorBio ? (
                <p>
                  {authorBio}
                  {primaryProject?.id && (
                    <a href={`/academia/read-journal?id=${primaryProject.id}`} style={{ marginLeft: '8px' }}>Read more</a>
                  )}
                </p>
              ) : (
                <div className="mcgl-empty-state">
                  <p>No bio available yet.</p>
                </div>
              )}
            </div>

            <div className="mcgl-project-stats">
              <h4>Projects Stats</h4>
              <div className="mcgl-project-stats-list">
                <div>
                  <span>Project Views</span>
                  <span>{totals.views.toLocaleString()}</span>
                </div>
                <div>
                  <span>Project Likes</span>
                  <span>{totals.likes.toLocaleString()}</span>
                </div>
                <div>
                  <span>Project Feedbacks</span>
                  <span>{totals.feedbacks.toLocaleString()}</span>
                </div>
                <div>
                  <span>Followers</span>
                  <span>{followerStats.followers.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mcgl-tools-skills">
              <h4>Tools &amp; Skills</h4>
              <div className="mcgl-empty-state">
                <p>No tools listed yet.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Author's Projects */}
          <div className="main-content-grid-r">
            {projectsLoading ? (
              <div className="journal author-empty-card">
                <div className="journal-info">
                  <div className="journal-info-b">
                    <p>Loading projects…</p>
                  </div>
                </div>
              </div>
            ) : authorProjects.length > 0 ? (
              authorProjects.map((project) => (
                <div key={project.id} className="journal" onClick={() => handleOpenProject(project.id)} style={{ cursor: 'pointer' }}>
                  <div className="journal-img">
                    <img src={resolveAuthorImage(project.thumbnail_url, journalImage)} alt={project.title} />
                  </div>
                  <div className="journal-info">
                    <div className="journal-info-h">
                      <div>
                        <span>By</span>
                        <p>{project.user_name || authorName}</p>
                      </div>
                      <div>
                        <div>
                          <button type="button" onClick={preventDefault}>
                            <img src={acHer2Icon} alt="Likes" />
                            <span>{project.likes_count}</span>
                          </button>
                          <button type="button" onClick={preventDefault}>
                            <img src={acEyeIcon} alt="Views" />
                            <span>{project.views_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="journal-info-b">
                      <p>{project.title}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="author-empty-panel">
                <h4>No published projects</h4>
                <p>This author has not published any public projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* More From Swiper */}
      <section className="main-content">
        <div className="more-from">
          <div>
            <h3>More from</h3>
            <div className="more-from-p">
              <div className="more-from-img">
                <img src={authorAvatar} alt={authorName} />
              </div>
              <div className="more-from-text">
                <h6>{authorName}</h6>
                <button type="button" onClick={handleToggleFollow} disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : isFollowing ? 'Following' : 'Follow All'}
                </button>
              </div>
            </div>
          </div>
          <div>
            <button type="button" onClick={handleHireUs}>
              <span>Hire us</span>
              <img src={acGtIcon} alt="Hire us" />
            </button>
          </div>
        </div>

        <div className="swiper more-from-grid" ref={moreFromSwiperRef}>
          <div className="swiper-wrapper">
            {projectsLoading ? (
              <div className="swiper-slide">
                <div className="author-empty-swiper">
                  <p>Loading...</p>
                </div>
              </div>
            ) : authorProjects.length > 0 ? (
              authorProjects.map((project) => (
                <div key={project.id} className="swiper-slide">
                  <div className="journal" onClick={() => handleOpenProject(project.id)} style={{ cursor: 'pointer' }}>
                    <div className="journal-img">
                      <img src={resolveAuthorImage(project.thumbnail_url, journalImage)} alt={project.title} />
                    </div>
                    <div className="journal-info">
                      <div className="journal-info-h">
                        <div>
                          <span>By</span>
                          <p>{project.user_name || authorName}</p>
                        </div>
                        <div>
                          <div>
                            <button type="button" onClick={preventDefault}>
                              <img src={acHer2Icon} alt="Likes" />
                              <span>{project.likes_count}</span>
                            </button>
                            <button type="button" onClick={preventDefault}>
                              <img src={acEyeIcon} alt="Views" />
                              <span>{project.views_count}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="journal-info-b">
                        <p>{project.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="swiper-slide">
                <div className="author-empty-swiper">
                  <h4>No projects yet</h4>
                  <p>Public projects from this author will appear here.</p>
                </div>
              </div>
            )}
          </div>
          <div className="swiper-button-prev js-btn"></div>
          <div className="swiper-button-next js-btn"></div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tuned and get the latest updates</h3>
          <p>Subscribe to our newsletter to receive the latest projects directly in your inbox.</p>
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
              <img src={acSendIcon} alt="Subscribe" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaAuthor;