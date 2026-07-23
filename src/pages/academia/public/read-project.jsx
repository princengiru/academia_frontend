import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Eye,
  Heart,
  Mail,
  MessageCircle,
  Send,
  Share2,
  UserCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { PublicLoadError, PublicLoading } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import journalImage from '../../../assets/imgs/journal.jpg';
import './read-project.css';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildAuthorPath, buildProjectPath, getProjectPublicRef, getUserPublicRef } from './publicShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ICON_SIZE = 20;
const ICON_STROKE = 1.75;

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
    user_role: project.user_role || project.role || 'Contributor',
    likes_count: Number(project.likes_count ?? project.likes ?? 0) || 0,
    saves_count: Number(project.saves_count ?? project.saves ?? 0) || 0,
    views_count: Number(project.views_count ?? project.views ?? 0) || 0,
    feedback_count: Number(project.feedback_count ?? project.feedbacks_count ?? project.feedbacks ?? 0) || 0,
    created_at: project.created_at || project.createdAt || null,
  };
};

const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id || user.user_id || null;
  } catch {
    return null;
  }
};

const formatCount = (value) => {
  const n = Number(value) || 0;
  return n.toLocaleString();
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

function AcademiaReadProject() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdParam = searchParams.get('id');
  const feedbackSectionRef = useRef(null);
  const moreFromSwiperRef = useRef(null);
  const [projectData, setProjectData] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(() => Boolean(localStorage.getItem('token')));
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  usePublicPageTitle(projectData?.title || 'Project');

  useEffect(() => {
    setIsSignedIn(Boolean(localStorage.getItem('token')));
  }, [projectIdParam, retryKey]);

  useEffect(() => {
    const swiperContainer = moreFromSwiperRef.current;
    if (!swiperContainer || loading) return undefined;

    const swiper = new Swiper(swiperContainer, {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 15,
      navigation: {
        nextEl: '.academia-read-project-page .more-from-grid .swiper-button-next',
        prevEl: '.academia-read-project-page .more-from-grid .swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 16,
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 18,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
      },
      observer: true,
      observeParents: true,
    });

    return () => {
      swiper.destroy(true, true);
    };
  }, [relatedProjects, loading]);

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
      setLoadError('');
      setActionNotice('');
      setIsLiked(false);
      setIsSaved(false);
      setIsFollowingAuthor(false);
      try {
        if (!projectIdParam) {
          setProjectData(null);
          setRelatedProjects([]);
          setComments([]);
          setLoadError('No project selected.');
          return;
        }

        const [projectRes, projectsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/projects/${projectIdParam}`),
          fetch(`${API_BASE_URL}/api/projects`),
        ]);

        const projectBody = await projectRes.json().catch(() => ({}));
        const projectsBody = await projectsRes.json().catch(() => ({}));

        if (!mounted) return;

        const allProjects = (
          Array.isArray(projectsBody?.data?.projects)
            ? projectsBody.data.projects
            : Array.isArray(projectsBody?.data)
              ? projectsBody.data
              : (Array.isArray(projectsBody) ? projectsBody : [])
        )
          .map((project) => normalizeProject(project))
          .filter(Boolean);

        if (!projectRes.ok) {
          setProjectData(null);
          setRelatedProjects(allProjects.slice(0, 6));
          setComments([]);
          setLoadError(projectBody?.message || 'Project not found.');
          return;
        }

        const resolvedProject = normalizeProject(projectBody?.data || projectBody || null);
        if (!resolvedProject) {
          setProjectData(null);
          setRelatedProjects(allProjects.slice(0, 6));
          setComments([]);
          setLoadError('Project not found.');
          return;
        }

        setProjectData(resolvedProject);

        const publicRef = getProjectPublicRef(resolvedProject);
        if (publicRef && String(projectIdParam) === String(resolvedProject.id)) {
          const next = new URLSearchParams(searchParams);
          next.set('id', String(publicRef));
          setSearchParams(next, { replace: true });
        }

        const authorId = resolvedProject.user_id;
        setRelatedProjects(
          allProjects
            .filter((item) => {
              if (String(item.id) === String(resolvedProject.id)) return false;
              if (authorId) return String(item.user_id) === String(authorId);
              return true;
            })
            .slice(0, 8),
        );

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
            setIsLiked(Boolean(likeStatusBody?.data?.hasLiked ?? likeStatusBody?.data?.liked));
          }

          if (saveStatusRes?.ok) {
            const saveStatusBody = await saveStatusRes.json().catch(() => ({}));
            setIsSaved(Boolean(saveStatusBody?.data?.hasSaved ?? saveStatusBody?.data?.saved));
          }

          if (followStatusRes?.ok) {
            const followStatusBody = await followStatusRes.json().catch(() => ({}));
            setIsFollowingAuthor(Boolean(
              followStatusBody?.data?.is_following
              ?? followStatusBody?.data?.isFollowing
              ?? followStatusBody?.data?.following,
            ));
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
          setLoadError('Failed to load project. Check your connection and try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();

    return () => { mounted = false; };
  }, [projectIdParam, retryKey]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectIdParam]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/projects');
  };
  const handleAuthor = () => {
    const authorRef = getUserPublicRef({
      user_uuid: projectData?.user_uuid,
      id: projectData?.user_id || projectData?.author_id || projectData?.userId,
    });
    if (authorRef) {
      navigate(buildAuthorPath(authorRef));
      return;
    }
    navigate('/projects');
  };
  const projectId = projectData?.id;
  const projectAuthor = projectData?.user_name || 'Unknown author';
  const projectTitle = projectData?.title || 'Untitled project';
  const projectAbstract = projectData?.abstract || projectData?.description || 'No abstract published yet.';
  const projectThumbnail = resolveProjectImage(projectData?.thumbnail_url, journalImage);
  const feedbackCount = projectData?.feedback_count || comments.length || 0;

  const requireSignIn = () => navigate('/auth/signin');
  const currentUserId = getStoredUserId();
  const isOwnProject = Boolean(
    currentUserId
    && projectData?.user_id
    && String(currentUserId) === String(projectData.user_id),
  );

  const bumpCount = (key, delta) => {
    setProjectData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: Math.max(0, (Number(prev[key]) || 0) + delta),
      };
    });
  };

  const handleToggleLike = async () => {
    if (!projectId || actionLoading) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    const nextLiked = !isLiked;
    setActionLoading(true);
    setActionNotice('');
    setIsLiked(nextLiked);
    bumpCount('likes_count', nextLiked ? 1 : -1);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/likes`, {
        method: nextLiked ? 'POST' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update like');
      const confirmed = body?.data?.liked ?? body?.data?.hasLiked;
      if (typeof confirmed === 'boolean' && confirmed !== nextLiked) {
        setIsLiked(confirmed);
        bumpCount('likes_count', confirmed ? 1 : -1);
      }
    } catch (error) {
      setIsLiked(!nextLiked);
      bumpCount('likes_count', nextLiked ? -1 : 1);
      setActionNotice(error.message || 'Could not update like.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!projectId || actionLoading) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    const nextSaved = !isSaved;
    setActionLoading(true);
    setActionNotice('');
    setIsSaved(nextSaved);
    bumpCount('saves_count', nextSaved ? 1 : -1);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/saves`, {
        method: nextSaved ? 'POST' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update save');
      const confirmed = body?.data?.saved ?? body?.data?.hasSaved;
      if (typeof confirmed === 'boolean' && confirmed !== nextSaved) {
        setIsSaved(confirmed);
        bumpCount('saves_count', confirmed ? 1 : -1);
      }
    } catch (error) {
      setIsSaved(!nextSaved);
      bumpCount('saves_count', nextSaved ? -1 : 1);
      setActionNotice(error.message || 'Could not update save.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    const followingId = projectData?.user_id;
    if (!followingId || actionLoading || isOwnProject) return;
    const token = localStorage.getItem('token');
    if (!token) {
      requireSignIn();
      return;
    }

    const nextFollowing = !isFollowingAuthor;
    setActionLoading(true);
    setActionNotice('');
    setIsFollowingAuthor(nextFollowing);
    try {
      const response = await fetch(`${API_BASE_URL}/api/followers`, {
        method: nextFollowing ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ followingId }),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to update follow status');
      const confirmed = body?.data?.is_following ?? body?.data?.isFollowing ?? body?.data?.following;
      if (typeof confirmed === 'boolean') {
        setIsFollowingAuthor(confirmed);
      }
    } catch (error) {
      setIsFollowingAuthor(!nextFollowing);
      setActionNotice(error.message || 'Could not update follow.');
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

  if (loading) {
    return <PublicLoading message="Loading project…" />;
  }

  if (loadError || !projectData) {
    return (
      <PublicLoadError
        title="Project unavailable"
        message={loadError || 'Project not found.'}
        onRetry={() => setRetryKey((key) => key + 1)}
        backTo="/projects"
        backLabel="Browse projects"
      />
    );
  }

  return (
    <div className="academia-read-project-page">
      <section className="main-content">
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack} aria-label="Back">
            <ArrowLeft size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
          </button>
          <div>
            <p>{projectData?.category || 'Projects'}</p>
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
                    <p>{projectData?.user_role || projectData?.role || 'Contributor'}</p>
                  </div>
                  <div>
                    <button type="button" onClick={handleAuthor}>View profile</button>
                    <p>|</p>
                    <button
                      className={`cp-btn${isFollowingAuthor ? ' is-active' : ''}`}
                      type="button"
                      onClick={handleToggleFollow}
                      disabled={actionLoading || !projectData?.user_id || isOwnProject}
                    >
                      {isOwnProject ? (
                        'Your project'
                      ) : (
                        <>
                          {isFollowingAuthor
                            ? <UserCheck size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            : <UserPlus size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />}
                          <span>{isFollowingAuthor ? 'Following' : 'Follow'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <button
                type="button"
                className={isSaved ? 'is-active' : undefined}
                onClick={handleToggleSave}
                disabled={actionLoading}
              >
                <Bookmark
                  size={16}
                  strokeWidth={ICON_STROKE}
                  fill={isSaved ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                <span>{isSaved ? 'Saved' : 'Save to library'}</span>
              </button>
              <button type="button" onClick={handleAuthor}>
                <Mail size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                <span>Get In Touch</span>
              </button>
            </div>
          </div>

          {actionNotice ? (
            <p className="read-project-action-notice" role="status">{actionNotice}</p>
          ) : null}

          <div className="course-part-b">
            <h5>Abstract</h5>
            <p>{projectAbstract}</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-grid">
          <div className="main-content-grid-l">
            <div
              className={`mcgl-comp${isFollowingAuthor ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={handleToggleFollow}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggleFollow();
                }
              }}
              style={{ cursor: isOwnProject ? 'default' : 'pointer', opacity: isOwnProject ? 0.55 : 1 }}
              aria-disabled={isOwnProject || !projectData?.user_id}
            >
              <div className="mcgl-comp-t fir-st">
                <div>
                    <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt="Author" />
                </div>
                {!isOwnProject ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleToggleFollow();
                    }}
                    disabled={actionLoading || !projectData?.user_id}
                    aria-label={isFollowingAuthor ? 'Unfollow author' : 'Follow author'}
                  >
                    {isFollowingAuthor ? <UserCheck size={14} strokeWidth={ICON_STROKE} aria-hidden="true" /> : <UserPlus size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />}
                  </button>
                ) : null}
              </div>
              <div>
                <label>{isOwnProject ? 'You' : isFollowingAuthor ? 'Following' : 'Follow'}</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={handleOpenTools} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <Wrench size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
                </div>
              </div>
              <div>
                <label>Tools</label>
              </div>
            </div>
            <div
              className={`mcgl-comp${isSaved ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={handleToggleSave}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggleSave();
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="mcgl-comp-t">
                <div>
                  <Bookmark size={ICON_SIZE} strokeWidth={ICON_STROKE} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                </div>
                <p>{formatCount(projectData?.saves_count)}</p>
              </div>
              <div>
                <label>{isSaved ? 'Saved' : 'Save'}</label>
              </div>
            </div>
            <div
              className={`mcgl-comp${isLiked ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={handleToggleLike}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleToggleLike();
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="mcgl-comp-t">
                <div>
                  <Heart size={ICON_SIZE} strokeWidth={ICON_STROKE} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                </div>
                <p>{formatCount(projectData?.likes_count)}</p>
              </div>
              <div>
                <label>{isLiked ? 'Liked' : 'Like'}</label>
              </div>
            </div>
            <div className="mcgl-comp" role="button" tabIndex={0} onClick={scrollToFeedbacks} style={{ cursor: 'pointer' }}>
              <div className="mcgl-comp-t">
                <div>
                  <MessageCircle size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
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
                  <Share2 size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
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
                      <p>{projectData?.user_role || projectData?.role || 'Contributor'}</p>
                    </div>
                    <div>
                      <button type="button" onClick={handleAuthor}>View profile</button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className={isSaved ? 'is-active' : undefined}
                  onClick={handleToggleSave}
                  disabled={actionLoading}
                >
                  <Bookmark size={16} strokeWidth={ICON_STROKE} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                  <span>{isSaved ? 'Saved' : 'Save to library'}</span>
                </button>
                <button type="button" onClick={handleAuthor}>
                  <Mail size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
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
            <p>{projectData?.user_role || projectData?.role || 'Contributor'}</p>
          </div>
          <div className="author-stats">
            <div>
              <Heart size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <span>{formatCount(projectData?.likes_count)}</span>
            </div>
            <div>
              <Eye size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <span>{formatCount(projectData?.views_count)}</span>
            </div>
            <div>
              <MessageCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
              <span>{formatCount(feedbackCount)}</span>
            </div>
          </div>
          <div className="author-text">
            <p>Published on</p>
            <p>|</p>
            <p>{projectData?.created_at ? new Date(projectData.created_at).toLocaleDateString() : 'Date unavailable'}</p>
          </div>
        </div>
      </section>

      <section className="main-content more-from-section" ref={feedbackSectionRef}>
        <div className="more-from">
          <div className="more-from-intro">
            <h3>
              More from <span>{projectAuthor}</span>
            </h3>
            <div className="more-from-p">
              <div className="more-from-img">
                <img src={resolveProjectImage(projectData?.user_avatar, learnersProfileImage)} alt={projectAuthor} />
              </div>
              <div className="more-from-text">
                <h6>{projectAuthor}</h6>
                <p>{projectData?.user_role || projectData?.role || 'Contributor'}</p>
                <button
                  type="button"
                  className="more-from-follow"
                  onClick={handleToggleFollow}
                  disabled={actionLoading || !projectData?.user_id || isOwnProject}
                >
                  {isOwnProject
                    ? 'Your project'
                    : actionLoading
                      ? 'Updating...'
                      : (
                        <>
                          {isFollowingAuthor
                            ? <UserCheck size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            : <UserPlus size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />}
                          <span>{isFollowingAuthor ? 'Following' : 'Follow'}</span>
                        </>
                      )}
                </button>
              </div>
            </div>
          </div>
          <div className="more-from-actions">
            <button type="button" className="more-from-profile-btn" onClick={handleAuthor}>
              <span>View profile</span>
              <Mail size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="swiper more-from-grid" ref={moreFromSwiperRef}>
          <div className="swiper-wrapper">
            {relatedProjects.length > 0 ? relatedProjects.map((item) => (
              <div key={item.id} className="swiper-slide">
                <div
                  className="journal"
                  onClick={() => navigate(buildProjectPath(item))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(buildProjectPath(item));
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="journal-img">
                    <img src={resolveProjectImage(item.thumbnail_url, journalImage)} alt={item.title || 'Project'} />
                  </div>
                  <div className="journal-info">
                    <div className="journal-info-h">
                      <div>
                        <span>By</span>
                        <p>{item.user_name || projectAuthor}</p>
                      </div>
                      <div>
                        <div>
                          <button type="button" tabIndex={-1} aria-hidden="true">
                            <Heart size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            <span>{item.likes_count ?? 0}</span>
                          </button>
                          <button type="button" tabIndex={-1} aria-hidden="true">
                            <Eye size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            <span>{item.views_count ?? 0}</span>
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
                <div className="more-from-empty">
                  <h4>No other projects yet</h4>
                  <p>
                    {projectData?.user_id
                      ? `${projectAuthor} has not published other public projects yet.`
                      : 'Related projects will appear here when more are published.'}
                  </p>
                  <button type="button" onClick={() => navigate('/projects')}>
                    Browse all projects
                  </button>
                </div>
              </div>
            )}
          </div>
          {relatedProjects.length > 1 ? (
            <>
              <div className="swiper-button-prev js-btn" aria-label="Previous projects" />
              <div className="swiper-button-next js-btn" aria-label="Next projects" />
            </>
          ) : null}
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-new-grid">
          <div className="mcnd-l">
            <div className="mcnd-l-h">
              <div>
                <h3>{isSignedIn ? 'Leave a feedback' : 'Sign in to leave a feedback'}</h3>
              </div>
              {!isSignedIn ? (
                <div>
                  <button type="button" onClick={() => navigate('/auth/signin')}>Sign In</button>
                  <button type="button" onClick={() => navigate('/auth/signup')}>Sign Up</button>
                </div>
              ) : null}
            </div>
            <div className="mcnd-l-b">
              <div className="mcnd-l-b-h">
                <button type="button" onClick={scrollToFeedbacks}>
                  <MessageCircle size={16} strokeWidth={ICON_STROKE} aria-hidden="true" />
                  <span>{formatCount(feedbackCount)} Comments</span>
                </button>
                <button type="button" onClick={handleToggleLike} disabled={actionLoading}>
                  <Heart size={ICON_SIZE} strokeWidth={ICON_STROKE} fill={isLiked ? "currentColor" : "none"} aria-hidden="true" />
                  <span>{formatCount(projectData?.likes_count)} Likes</span>
                </button>
                <button type="button" onClick={handleToggleSave} disabled={actionLoading}>
                  <Bookmark size={ICON_SIZE} strokeWidth={ICON_STROKE} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                  <span>{formatCount(projectData?.saves_count)} Saves</span>
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
                            <Heart size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
                            <span>{likes}</span>
                          </p>
                          <p>
                            <Eye size={14} strokeWidth={ICON_STROKE} aria-hidden="true" />
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
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <Mail size={18} strokeWidth={ICON_STROKE} className="ac-sms" aria-hidden="true" />
            <input
              type="email"
              placeholder="Enter email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">
              <Send size={18} strokeWidth={ICON_STROKE} aria-hidden="true" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadProject;
