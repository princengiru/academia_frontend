import React, { useEffect, useMemo, useRef, useState } from 'react';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './view-project.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const defaultProfile = '/assets/imgs/default-profile.png';

function normalizeAssetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function isImageAsset(value) {
  if (!value) return false;
  const cleanValue = String(value).split('?')[0].toLowerCase();
  return /\.(avif|webp|png|jpe?g|gif|bmp|svg)$/.test(cleanValue) || cleanValue.startsWith('data:image/');
}

function galleryItemClass(index) {
  if (index === 0) return 'is-feature';
  if (index === 1 || index === 2) return 'is-tall';
  return 'is-half';
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function normalizeProjectComment(comment) {
  if (!comment) return null;

  const createdAt = comment.created_at || comment.createdAt || null;
  const postedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : (comment.posted || '');

  return {
    id: comment.id || comment.comment_id,
    name: comment.user_name || comment.author_name || comment.name || 'User',
    avatar: normalizeAssetUrl(comment.user_avatar || comment.author_avatar || comment.avatar) || defaultProfile,
    message: comment.content || comment.comment || comment.message || '',
    time: createdAt ? timeAgo(createdAt) : (comment.time || ''),
    posted: postedDate,
  };
}

function parseProjectTools(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'string' ? item : item?.name || item?.label || item?.title || ''))
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseProjectTools(parsed);
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

const ViewProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const composerRef = useRef(null);
  const commentsListRef = useRef(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [actionNotice, setActionNotice] = useState('');

  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(false);

  const projectFromState = location.state?.project || null;
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const projectId = useMemo(() => queryParams.get('id') || projectFromState?.id, [queryParams, projectFromState]);

  const openUploadFlow = () => {
    navigate('/academia/professor/projects', { state: { openUpload: true } });
  };

  const refreshComments = async () => {
    if (!projectId) return;
    const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`);
    if (!commentsRes.ok) return;
    const commentsData = await commentsRes.json();
    const rawComments = Array.isArray(commentsData?.data) ? commentsData.data : [];
    setCommentsList(rawComments.map(normalizeProjectComment).filter(Boolean));
  };

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setError('empty');
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const projectRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
        if (!projectRes.ok) throw new Error('Project not found');
        const projectData = await projectRes.json();
        const proj = projectData?.data;

        if (cancelled) return;
        setProject(proj);
        setLikesCount(proj?.likes_count || 0);
        setSavesCount(proj?.saves_count || 0);
        setCommentsCount(proj?.comments_count || 0);

        const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          const rawComments = Array.isArray(commentsData?.data) ? commentsData.data : [];
          if (!cancelled) {
            setCommentsList(rawComments.map(normalizeProjectComment).filter(Boolean));
          }
        }

        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          const [likeCheckRes, saveCheckRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/projects/${projectId}/likes/check`, { headers }),
            fetch(`${API_BASE_URL}/api/projects/${projectId}/saves/check`, { headers }),
          ]);

          if (likeCheckRes.ok) {
            const likeStatus = await likeCheckRes.json();
            if (!cancelled) setHasLiked(!!likeStatus?.data?.hasLiked);
          }
          if (saveCheckRes.ok) {
            const saveStatus = await saveCheckRes.json();
            if (!cancelled) setHasSaved(!!saveStatus?.data?.hasSaved);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load project.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, [projectId, reloadKey]);

  useEffect(() => {
    if (!actionNotice) return undefined;
    const timer = window.setTimeout(() => setActionNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [actionNotice]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const method = hasLiked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/likes`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHasLiked(!hasLiked);
        setLikesCount((prev) => (hasLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      console.error('Like toggle failed', err);
    }
  };

  const handleSaveToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const method = hasSaved ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/saves`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHasSaved(!hasSaved);
        setSavesCount((prev) => (hasSaved ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      console.error('Save toggle failed', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = { content: newCommentText.trim() };
      if (replyingToCommentId) {
        payload.parent_id = replyingToCommentId;
      }

      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Could not post comment.');
      }

      setNewCommentText('');
      setReplyingToCommentId(null);
      await refreshComments();
      setCommentsCount((prev) => prev + 1);
    } catch (err) {
      setActionNotice(err.message || 'Could not post comment.');
    }
  };

  const handleShareProject = async () => {
    if (!projectId) return;
    const url = `${window.location.origin}/academia/professor/view-project?id=${projectId}`;
    const title = project?.title || 'Project';

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setActionNotice('Project link copied to clipboard.');
        return;
      }
      setActionNotice(url);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setActionNotice('Could not share this project.');
      }
    }
  };

  const startReply = (comment) => {
    if (!comment?.id) return;
    setReplyingToCommentId(comment.id);
    setNewCommentText(`@${comment.name} `);
    composerRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingToCommentId(null);
    setNewCommentText('');
  };

  const scrollToComments = () => {
    commentsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const apexProfile = project ? {
    name: project.user_name || 'Unknown',
    role: project.user_role || 'Professor',
    email: project.user_email || '',
    avatar: normalizeAssetUrl(project.user_avatar) || defaultProfile,
    status: project.approval_status || 'Active',
    projects: project.user_projects_count || '1',
  } : {
    name: 'Loading…',
    role: '',
    email: '',
    avatar: defaultProfile,
    status: 'Loading…',
    projects: '0',
  };

  const genesisCollaborators = useMemo(() => (
    project?.collaborators?.map((item) => ({
      name: typeof item === 'string' ? item : item?.name || item?.label || 'Collaborator',
      avatar: normalizeAssetUrl(item?.avatar) || defaultProfile,
    })) || []
  ), [project]);

  const displayTools = useMemo(() => parseProjectTools(project?.tools), [project]);

  const displayGallery = useMemo(() => {
    if (!project) return [];
    return [project.thumbnail_url, ...(project.images || [])]
      .filter(Boolean)
      .filter((img) => isImageAsset(img))
      .map((img, index) => ({
        image: normalizeAssetUrl(img),
        alt: project.title || 'Project image',
        class: galleryItemClass(index),
      }));
  }, [project]);

  const displayEngagement = project ? [
    { id: 'comments', label: 'Comments', value: commentsCount, icon: '/assets/icons/ac-com.svg', active: true },
    { id: 'likes', label: 'Likes', value: likesCount, icon: '/assets/icons/heart.svg', active: hasLiked },
    { id: 'saves', label: 'Saves', value: savesCount, icon: '/assets/icons/ac-sav.svg', active: hasSaved },
  ] : [];

  const displayTitle = project?.title || (loading ? 'Loading project…' : 'Untitled project');
  const displaySubtitle = project?.subtitle || project?.abstract || '';
  const displayAbstract = project?.abstract || '';
  const displayTeam = genesisCollaborators.length > 0
    ? `${genesisCollaborators.length} collaborator${genesisCollaborators.length === 1 ? '' : 's'}`
    : 'No collaborators';

  return (
    <section className="learners-view-project-page">
      <section className="learners-projects-profile-strip">
        <div className="learners-projects-profile-strip-main">
          <div className="learners-projects-profile-avatar">
            <img src={apexProfile.avatar} alt={apexProfile.name} />
          </div>

          <div className="learners-projects-profile-copy">
            <div className="learners-projects-profile-name-row">
              <h1>{apexProfile.name}</h1>
              <span className="learners-projects-status-badge">{apexProfile.status}</span>
              <span className="learners-projects-count-badge">
                <img src="/assets/icons/badge-1.svg" alt="" />
                <span>{apexProfile.projects}</span>
              </span>
            </div>

            <div className="learners-projects-profile-meta">
              {apexProfile.role ? <span>{apexProfile.role}</span> : null}
              {apexProfile.role && apexProfile.email ? <span>&bull;</span> : null}
              {apexProfile.email ? <span>{apexProfile.email}</span> : null}
            </div>
          </div>
        </div>

        <div className="learners-projects-profile-actions">
          <button type="button" className="learners-projects-primary-btn" onClick={openUploadFlow}>
            <span>Upload new project</span>
            <img src="/assets/icons/exit-down.svg" alt="" />
          </button>
          <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/professor/settings')}>
            View profile
          </button>
        </div>
      </section>

      <section className="learners-view-project-shell">
        <div className="learners-view-project-main">
          {error === 'empty' ? (
            <div className="learners-view-project-empty-state learners-view-project-empty-state--full">
              <h3>No project selected</h3>
              <p>Select a project from the Projects page to view it here.</p>
              <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/professor/projects')}>
                Back to Projects
              </button>
            </div>
          ) : error ? (
            <LearnerLoadError
              title="Could not load project"
              message={error}
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : (
            <>
              <div className="learners-view-project-head">
                <Link to="/academia/professor/projects" className="learners-view-project-back">
                  <img src="/assets/icons/ac-le.svg" alt="" />
                  <span>Back to Projects</span>
                </Link>
                <h2>{displayTitle}</h2>
                <p>{displaySubtitle || (loading ? 'Loading project details…' : 'No project summary available.')}</p>
              </div>

              <section className="learners-view-project-abstract-card">
                <h3>Abstract</h3>
                {loading ? <p>Loading abstract…</p> : <p>{displayAbstract || 'No abstract provided.'}</p>}

                <button
                  type="button"
                  className={`learners-view-project-tools-toggle ${toolsExpanded ? 'is-expanded' : ''}`}
                  onClick={() => setToolsExpanded((value) => !value)}
                  aria-expanded={toolsExpanded}
                  aria-controls="prof-view-project-tools-panel"
                >
                  <span className="learners-view-project-tools-toggle-icon">
                    <img src="/assets/icons/ac-sd1.svg" alt="" />
                  </span>
                  <span>Tools Used</span>
                  <span className="learners-view-project-tools-toggle-caret"></span>
                </button>

                {toolsExpanded && (
                  <div id="prof-view-project-tools-panel" className="learners-view-project-tools-panel">
                    {displayTools.length > 0 ? (
                      displayTools.map((tool) => (
                        <span key={tool} className="learners-view-project-tools-chip">{tool}</span>
                      ))
                    ) : (
                      <p className="learners-view-project-tools-empty">No tools were listed for this project.</p>
                    )}
                  </div>
                )}
              </section>

              <section className="learners-view-project-gallery" aria-label="Project gallery">
                {loading ? (
                  <ManagementLoading compact title="Loading gallery" message="Preparing the project gallery." />
                ) : displayGallery.length > 0 ? (
                  displayGallery.map((item, idx) => (
                    <div key={idx} className={`learners-view-project-gallery-item ${item.class}`}>
                      <img src={item.image} alt={item.alt} />
                    </div>
                  ))
                ) : (
                  <div className="learners-view-project-empty-state">
                    <h3>No images</h3>
                    <p>No gallery images were uploaded for this project.</p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="learners-view-project-side">
          <section className="learners-view-project-comments-panel">
            <div className="learners-view-project-comments-head">
              <div>
                <h3>{displayTitle}</h3>
                <button
                  type="button"
                  className={`learners-view-project-team-toggle ${teamExpanded ? 'is-expanded' : ''}`}
                  onClick={() => setTeamExpanded((value) => !value)}
                  aria-expanded={teamExpanded}
                  aria-controls="prof-view-project-team-panel"
                >
                  <span>{displayTeam}</span>
                  <span className="learners-view-project-team-caret"></span>
                </button>

                {teamExpanded && (
                  <div id="prof-view-project-team-panel" className="learners-view-project-team-panel">
                    {genesisCollaborators.length > 0 ? (
                      genesisCollaborators.map((member) => (
                        <div key={member.name} className="learners-view-project-team-chip">
                          <img src={member.avatar} alt={member.name} />
                          <span>{member.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="learners-view-project-team-empty">No collaborators listed for this project.</p>
                    )}
                  </div>
                )}
              </div>

              <button type="button" className="learners-view-project-share-btn" onClick={handleShareProject} aria-label="Share project">
                <img src="/assets/icons/ac-share.svg" alt="" />
              </button>
            </div>

            {actionNotice ? (
              <p className="learners-view-project-action-notice" role="status">{actionNotice}</p>
            ) : null}

            <div className="learners-view-project-engagement-row">
              {displayEngagement.length > 0 ? displayEngagement.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`learners-view-project-engagement-pill ${item.active ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.id === 'likes') handleLikeToggle();
                    if (item.id === 'saves') handleSaveToggle();
                    if (item.id === 'comments') scrollToComments();
                  }}
                >
                  <img src={item.id === 'likes' && hasLiked ? '/assets/icons/ac-her2.svg' : item.icon} alt="" />
                  <span>{item.value} {item.label}</span>
                </button>
              )) : (
                <div className="learners-view-project-empty-state">
                  <h3>No engagement yet</h3>
                  <p>Engagement stats will appear here.</p>
                </div>
              )}
            </div>

            <div className="learners-view-project-comments-list" ref={commentsListRef}>
              {loading ? (
                <ManagementLoading compact title="Loading comments" message="Fetching project comments." />
              ) : commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <article key={comment.id} className="learners-view-project-comment">
                    <div className="learners-view-project-comment-avatar">
                      <img src={comment.avatar} alt={comment.name} />
                    </div>

                    <div className="learners-view-project-comment-body">
                      <div className="learners-view-project-comment-meta">
                        <strong>{comment.name}</strong>
                        <span>{comment.time}</span>
                      </div>

                      <p>{comment.message}</p>

                      <div className="learners-view-project-comment-foot">
                        <button type="button" className="learners-view-project-comment-reply" onClick={() => startReply(comment)}>
                          <img src="/assets/icons/ac-rep.svg" alt="" />
                          <span>Reply</span>
                        </button>
                        <span>Posted on <strong>{comment.posted}</strong></span>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="learners-view-project-empty-state">
                  <h3>No comments yet</h3>
                  <p>Be the first to leave feedback on this project.</p>
                </div>
              )}
            </div>

            <div className="learners-view-project-comment-composer">
              {replyingToCommentId ? (
                <div className="learners-view-project-reply-banner">
                  <span>Replying to a comment</span>
                  <button type="button" onClick={cancelReply}>Cancel</button>
                </div>
              ) : null}
              <form onSubmit={handleCommentSubmit} className="learners-view-project-comment-form">
                <textarea
                  ref={composerRef}
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                />
                <button type="submit" className="learners-projects-primary-btn" disabled={!newCommentText.trim()}>
                  <span>{replyingToCommentId ? 'Post reply' : 'Post Comment'}</span>
                </button>
              </form>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
};

export default ViewProject;
