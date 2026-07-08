import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import acLeftIcon from '../../../assets/icons/ac-le.svg';
import acBookMarkIcon from '../../../assets/icons/ac-bm.svg';
import acGetTouchIcon from '../../../assets/icons/ac-gt.svg';
import acFollowIcon from '../../../assets/icons/ac-fol.svg';
import acSide1Icon from '../../../assets/icons/ac-sd1.svg';
import acSide2Icon from '../../../assets/icons/ac-sd2.svg';
import acSide3Icon from '../../../assets/icons/ac-sd3.svg';
import acSide4Icon from '../../../assets/icons/ac-sd4.svg';
import acSide5Icon from '../../../assets/icons/ac-sd5.svg';
import acSideEyeIcon from '../../../assets/icons/ac-eye.svg';
import acSideHeartIcon from '../../../assets/icons/ac-her2.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import journalImage from '../../../assets/imgs/journal.jpg';
import acHrImage from '../../../assets/imgs/ac-hr.jpg';
import acJrImage from '../../../assets/imgs/ac-jr.jpg';
import acStrImage from '../../../assets/imgs/ac-str.jpg';
import glImage from '../../../assets/imgs/gl.jpg';
import cat1Image from '../../../assets/imgs/cat1.jpg';
import './read-journal.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveProjectImage = (value, fallback = journalImage) => {
  if (!value) {
    return fallback;
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }

  return `${API_BASE_URL}${value}`;
};

const normalizeProject = (project) => {
  if (!project) {
    return null;
  }

  let parsedImages = [];
  if (project.images) {
    try {
      parsedImages = typeof project.images === 'string' ? JSON.parse(project.images) : project.images;
    } catch (e) {
      parsedImages = Array.isArray(project.images) ? project.images : [project.images];
    }
  }
  if (!Array.isArray(parsedImages)) {
    parsedImages = [];
  }

  return {
    ...project,
    id: project.id || project._id || project.project_id,
    title: project.title || project.name || 'Project',
    abstract: project.abstract || project.description || '',
    thumbnail_url: project.thumbnail_url || project.thumbnail || project.image || null,
    images: parsedImages,
    file_url: project.file_url || project.document_url || project.project_file || null,
    user_name: project.user_name || project.author_name || project.author || 'Author',
    user_avatar: project.user_avatar || project.author_avatar || project.avatar || null,
    user_id: project.user_id || project.author_id || project.userId || null,
    user_role: project.user_role || project.role || 'UI/UX Designer',
    likes_count: project.likes_count ?? project.likes ?? 0,
    views_count: project.views_count ?? project.views ?? 0,
    feedback_count: project.feedback_count ?? project.feedbacks_count ?? project.feedbacks ?? 0,
    created_at: project.created_at || project.createdAt || null,
  };
};

const normalizeProjectComment = (comment) => {
  if (!comment) {
    return null;
  }

  return {
    id: comment.id || comment.comment_id,
    author: comment.user_name || comment.author_name || comment.author || 'Author',
    avatar: comment.user_avatar || comment.author_avatar || null,
    text: comment.content || comment.comment || '',
    time: comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now',
  };
};

function AcademiaReadJournal() {
  const navigate = useNavigate();
  const feedbackSectionRef = useRef(null);
  const [projectData, setProjectData] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const moreFromContainer = document.querySelector('.more-from-grid');
    const moreFromSwiper = moreFromContainer
      ? new Swiper(moreFromContainer, {
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
        })
      : null;

    return () => {
      moreFromSwiper?.destroy();
    };
  }, []);

  useEffect(() => {
    if (loading || !projectData) {
      return;
    }

    const resizeGridItem = (item) => {
      const grid = document.querySelector('.main-content-grid-r');
      if (!grid || !item) {
        return;
      }

      const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows')) || 10;
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('gap')) || 12;

      const img = item.querySelector('img');
      if (!img) {
        return;
      }

      const height = img.getBoundingClientRect().height;
      if (height === 0) {
        img.addEventListener('load', () => {
          const freshHeight = img.getBoundingClientRect().height;
          const rowSpan = Math.ceil((freshHeight + rowGap) / (rowHeight + rowGap));
          item.style.gridRowEnd = `span ${rowSpan}`;
        });
        return;
      }

      const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
      item.style.gridRowEnd = `span ${rowSpan}`;
    };

    const resizeAll = () => {
      document.querySelectorAll('.mcgr-item').forEach((item) => resizeGridItem(item));
    };

    window.addEventListener('resize', resizeAll);

    const timer = setTimeout(resizeAll, 100);

    document.querySelectorAll('.main-content-grid-r img').forEach((img) => {
      img.addEventListener('load', () => resizeGridItem(img.parentElement));
    });

    return () => {
      window.removeEventListener('resize', resizeAll);
      clearTimeout(timer);
    };
  }, [loading, projectData, relatedProjects]);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');

        const [projectRes, projectsRes] = await Promise.all([
          projectId ? fetch(`${API_BASE_URL}/api/projects/${projectId}`) : Promise.resolve(null),
          fetch(`${API_BASE_URL}/api/projects`),
        ]);

        const projectBody = projectRes ? await projectRes.json().catch(() => ({})) : {};
        const projectsBody = await projectsRes.json().catch(() => ({}));

        if (!mounted) return;

        const currentProject = normalizeProject(projectBody?.data || projectBody || null);
        const allProjects = (Array.isArray(projectsBody?.data) ? projectsBody.data : (Array.isArray(projectsBody) ? projectsBody : []))
          .map((project) => normalizeProject(project))
          .filter(Boolean);

        const resolvedProject = currentProject || allProjects[0] || null;
        setProjectData(resolvedProject);
        setRelatedProjects(allProjects.filter((item) => String(item.id) !== String(resolvedProject?.id)).slice(0, 6));

        const token = localStorage.getItem('token');
        if (token && resolvedProject?.id) {
          const [likeStatusRes, saveStatusRes, followStatusRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/projects/${resolvedProject.id}/likes/check`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            fetch(`${API_BASE_URL}/api/projects/${resolvedProject.id}/saves/check`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            resolvedProject.user_id
              ? fetch(`${API_BASE_URL}/api/followers/check?followingId=${resolvedProject.user_id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                }).catch(() => null)
              : Promise.resolve(null),
          ]);

          if (likeStatusRes?.ok) {
            const likeStatusBody = await likeStatusRes.json().catch(() => ({}));
            setIsLiked(Boolean(likeStatusBody?.data?.hasLiked));
          }

          if (saveStatusRes?.ok) {
            const saveStatusBody = await saveStatusRes.json().catch(() => ({}));
            setIsSaved(Boolean(saveStatusBody?.data?.hasSaved));
          }

          if (followStatusRes?.ok) {
            const followStatusBody = await followStatusRes.json().catch(() => ({}));
            setIsFollowingAuthor(Boolean(followStatusBody?.data?.is_following));
          }
        }

        if (resolvedProject?.id) {
          setCommentsLoading(true);
          try {
            const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${resolvedProject.id}/comments?limit=10&offset=0`);
            const commentsBody = await commentsRes.json().catch(() => ({}));
            const commentList = Array.isArray(commentsBody?.data)
              ? commentsBody.data
              : Array.isArray(commentsBody)
                ? commentsBody
                : [];

            if (mounted) {
              setComments(commentList.map((comment) => normalizeProjectComment(comment)).filter(Boolean));
            }
          } catch (commentError) {
            if (mounted) {
              setComments([]);
            }
          } finally {
            if (mounted) setCommentsLoading(false);
          }
        } else if (mounted) {
          setComments([]);
          setCommentsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setProjectData(null);
          setRelatedProjects([]);
          setComments([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();

    return () => { mounted = false; };
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/academia/journals');
  };
  const handleAuthor = () => navigate('/academia/author');
  const projectId = projectData?.id;
  const projectAuthor = projectData?.user_name || 'Dr. Xavier KABARANGA';
  const projectTitle = projectData?.title || 'An Operadic Approach to Internal Structures';
  const projectAbstract = projectData?.abstract || 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... Read more';
  const projectThumbnail = resolveProjectImage(projectData?.thumbnail_url, journalImage);
  const feedbackCount = projectData?.feedback_count || comments.length || 0;

  const requireSignIn = () => navigate('/academia/auth/signin');

  const handleToggleLike = async () => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update like');
      setIsLiked(Boolean(body?.data?.liked));
    } catch (error) {
      console.error('Toggle like error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/saves`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update save');
      setIsSaved(Boolean(body?.data?.saved));
    } catch (error) {
      console.error('Toggle save error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    const followingId = projectData?.user_id;
    if (!followingId) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/followers`, {
        method: isFollowingAuthor ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update follow status');
      setIsFollowingAuthor(Boolean(body?.data?.is_following ?? !isFollowingAuthor));
    } catch (error) {
      console.error('Toggle follow error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: projectTitle, text: projectAbstract, url: shareUrl });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Share copy failed:', error);
    }
  };

  const handleOpenTools = () => {
    const target = projectData?.file_url || projectData?.thumbnail_url || projectThumbnail;
    if (!target) return;

    const resolvedTarget = target.startsWith('http') || target.startsWith('/') || target.startsWith('data:') || target.startsWith('blob:')
      ? target
      : `${API_BASE_URL}${target}`;
    window.open(resolvedTarget, '_blank', 'noopener,noreferrer');
  };

  const scrollToFeedbacks = () => {
    feedbackSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="academia-read-journal-page">
      <section className="main-content">
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack}>
            <img src={acLeftIcon} alt="Left" />
          </button>
          <div>
            <p>{projectData?.category || 'Journals'}</p>
            <span>/</span>
            <span>Project details</span>
            <span>/</span>
          </div>
        </div>

        <div className="course-part">
          <div className="course-part-h">
            <div>
              <h5>{loading ? 'Loading…' : projectTitle}</h5>
              <div className="course-part-h-p">
                <div className="course-part-h-img">
                  <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
                </div>
                <div className="course-part-h-text">
                  <div>
                    <h6>By {projectAuthor}</h6>
                    <p>|</p>
                    <p>{projectData?.user_role || projectData?.role || 'UI/UX Designer'}</p>
                  </div>
                  <div>
                    <a href="/academia/author">Team owners</a>
                    <p>|</p>
                    <button className="cp-btn" type="button" onClick={handleAuthor}>
                      Follow All
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button type="button">
                <img src={acBookMarkIcon} alt="Save" />
                <span>Save to library</span>
              </button>
              <button type="button" onClick={handleAuthor}>
                <img src={acGetTouchIcon} alt="Contact" />
                <span>Get In Touch</span>
              </button>
            </div>
          </div>

          <div className="course-part-b">
            <h5>Abstract</h5>
            <p>{projectAbstract}</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-grid">
          <div className="main-content-grid-l">
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleToggleFollow} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t fir-st">
                <div>
                    <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleFollow();
                  }}
                  disabled={actionLoading}
                >
                  <img src={acFollowIcon} alt="Follow" />
                </button>
              </div>
              <div>
                <label>{isFollowingAuthor ? 'Following' : 'Follow'}</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleOpenTools} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide1Icon} alt="Tools" />
                </div>
              </div>
              <div>
                <label>Tools</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleToggleSave} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide2Icon} alt="Save" />
                </div>
              </div>
              <div>
                <label>{isSaved ? 'Saved' : 'Save'}</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleToggleLike} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide3Icon} alt="Like" />
                </div>
              </div>
              <div>
                <label>{isLiked ? 'Liked' : 'Like'}</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={scrollToFeedbacks} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide4Icon} alt="Feedbacks" />
                </div>
                <p>{feedbackCount}</p>
              </div>
              <div>
                <label>Feedbacks</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleShare} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <img src={acSide5Icon} alt="Share" />
                </div>
              </div>
              <div>
                <label>Share</label>
              </div>
            </div>
          </div>

          <div className="main-content-grid-r">
            <div className="course-part-h">
              <div>
                <div className="course-part-h-p">
                  <div className="course-part-h-img">
                    <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
                  </div>
                  <div className="course-part-h-text">
                    <div>
                      <h6>By {projectAuthor}</h6>
                      <p>|</p>
                      <p>{projectData?.user_role || projectData?.role || 'UI/UX Designer'}</p>
                    </div>
                    <div>
                      <a href="/academia/author">Team owners</a>
                      <p>|</p>
                      <button type="button" onClick={handleAuthor}>Follow All</button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button type="button">
                  <img src={acBookMarkIcon} alt="Save" />
                  <span>Save to library</span>
                </button>
                <button type="button" onClick={handleAuthor}>
                  <img src={acGetTouchIcon} alt="Contact" />
                  <span>Get In Touch</span>
                </button>
              </div>
            </div>

            {projectData?.images && projectData.images.length > 0 ? (
              projectData.images.map((imgUrl, index) => (
                <div key={index} className="mcgr-item">
                  <img src={resolveProjectImage(imgUrl, journalImage)} alt={`${projectTitle} - ${index + 1}`} />
                </div>
              ))
            ) : (
              <div className="mcgr-item">
                <img src={resolveProjectImage(projectData?.thumbnail_url, journalImage)} alt={projectTitle} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="author">
        <div className="author-inner">
          <div className="author-img">
            <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
          </div>
          <div className="author-name">
            <h6>{projectAuthor}</h6>
            <p>|</p>
            <p>{projectData?.user_role || projectData?.role || 'UI/UX Designer'}</p>
          </div>
          <div className="author-stats">
            <div>
              <img src={acSide3Icon} alt="Likes" />
              <span>{projectData?.likes_count || '11.1K'}</span>
            </div>
            <div>
              <img src={acSideEyeIcon} alt="Views" />
              <span>{projectData?.views_count || '11'}</span>
            </div>
            <div>
              <img src={acSide4Icon} alt="Feedbacks" />
              <span>{projectData?.feedback_count || '11'}</span>
            </div>
          </div>
          <div className="author-text">
            <p>Published on</p>
            <p>|</p>
            <p>{projectData ? new Date(projectData.created_at || Date.now()).toLocaleDateString() : '12 Jan 2029'}</p>
          </div>
        </div>
      </section>

      <section className="main-content" ref={feedbackSectionRef}>
        <div className="more-from">
          <div>
            <h3>More from</h3>
            <div className="more-from-p">
              <div className="more-from-img">
                <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
              </div>
              <div className="more-from-text">
                <h6>{projectAuthor}</h6>
                <button type="button" onClick={handleAuthor}>Follow All</button>
              </div>
            </div>
          </div>
          <div>
            <button type="button" onClick={handleAuthor}>
              <span>Hire us</span>
              <img src={acGetTouchIcon} alt="Hire us" />
            </button>
          </div>
        </div>

        <div className="swiper more-from-grid">
          <div className="swiper-wrapper">
            {relatedProjects.length > 0 ? relatedProjects.map((item) => (
              <div key={item.id} className="swiper-slide">
                <div className="journal" onClick={() => navigate(`/academia/read-journal?id=${item.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="journal-img">
                    <img src={resolveProjectImage(item.thumbnail_url, journalImage)} alt={item.title || 'Project'} />
                  </div>
                  <div className="journal-info">
                    <div className="journal-info-h">
                      <div>
                        <span>By</span>
                        <p>{item.user_name || 'Author'}</p>
                      </div>
                      <div>
                        <div>
                          <button type="button">
                            <img src={acSideHeartIcon} alt="Likes" />
                            <span>{item.likes_count}</span>
                          </button>
                          <button type="button">
                            <img src={acSideEyeIcon} alt="Views" />
                            <span>{item.views_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="journal-info-b">
                      <p>{item.title || 'Project'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="swiper-slide">
                <div className="mcgr-empty">
                  <h4>No related projects yet</h4>
                  <p>When more public projects are available, they will appear here.</p>
                </div>
              </div>
            )}
          </div>
          <div className="swiper-button-prev js-btn"></div>
          <div className="swiper-button-next js-btn"></div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-new-grid">
          <div className="mcnd-l">
            <div className="mcnd-l-h">
              <div>
                <h3>Sign in to leave a feedback</h3>
              </div>
              <div>
                <button type="button">Sign In</button>
                <button type="button">Sign Up</button>
              </div>
            </div>
            <div className="mcnd-l-b">
              <div className="mcnd-l-b-h">
                <button type="button">
                  <img src={acSide1Icon} alt="Comments" />
                  <span>{feedbackCount} Comments</span>
                </button>
                <button type="button">
                  <img src={acSide3Icon} alt="Likes" />
                  <span>47k Likes</span>
                </button>
                <button type="button">
                  <img src={acSide2Icon} alt="Saves" />
                  <span>900 Saves</span>
                </button>
              </div>
              <div className="mcnd-l-b-b">
                {commentsLoading ? (
                  <div className="comment comment-empty">
                    <div className="comment-text">
                      <p>Loading feedbacks…</p>
                    </div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <div className="comment-img">
                        <img src={resolveProjectImage(comment.avatar, learnersProfileImage)} alt="Comment author" />
                      </div>
                      <div className="comment-text">
                        <div>
                          <h6>{comment.author}</h6>
                          <span>{comment.time}</span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="comment comment-empty">
                    <div className="comment-text">
                      <h6>No feedbacks yet</h6>
                      <p>Be the first to leave a comment on this project.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mcnd-r">
            <div className="mcnd-r-h">
              <h3>Related Projects</h3>
            </div>
            <div className="mcnd-r-b">
              {relatedProjects.length > 0 ? relatedProjects.map((item) => {
                const thumb = item.thumbnail_url
                  ? (item.thumbnail_url.startsWith('http') ? item.thumbnail_url : `${API_BASE_URL}${item.thumbnail_url}`)
                  : journalImage;
                const author = item.user_name || item.author_name || item.author || 'Author';
                const likes = item.likes_count ?? item.likes ?? '0';
                const views = item.views_count ?? item.views ?? '0';

                return (
                  <div key={item.id || item._id} className="related-item">
                    <div className="related-item-img">
                      <img src={thumb} alt={item.title || 'Project'} />
                    </div>
                    <div className="related-item-l">
                      <div className="related-item-l-t">
                        <div>
                          <label>By</label>
                          <h6>{author}</h6>
                        </div>
                        <div>
                          <p>
                            <img src={acSide3Icon} alt="Likes" />
                            <span>{likes}</span>
                          </p>
                          <p>
                            <img src={acSideEyeIcon} alt="Views" />
                            <span>{views}</span>
                          </p>
                        </div>
                      </div>
                      <div className="related-item-l-b">
                        <p>{item.title || 'Project'}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="related-item related-item-empty">
                  <div className="related-item-l">
                    <div className="related-item-l-b">
                      <p>No related projects right now.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mcnd-r-CTA">
              <button type="button">See more</button>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tune and get the latest update</h3>
          <p>Far far away, behind the word mountains</p>
        </div>
        <div className="newsletter-sec-r">
          <form>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input type="email" placeholder="Enter email address" />
            <button type="submit">
              <img src={acSendIcon} alt="Next" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadJournal;
