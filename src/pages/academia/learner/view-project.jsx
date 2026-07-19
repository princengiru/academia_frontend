import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import defaultProfile from '../../../assets/imgs/default-profile.png';
import acJrImg from '../../../assets/imgs/ac-jr.jpg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import d1Img from '../../../assets/imgs/d1.jpg';
import acHrImg from '../../../assets/imgs/ac-hr.jpg';
import badge1 from '../../../assets/icons/badge-1.svg';
import exitDown from '../../../assets/icons/exit-down.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acSd1 from '../../../assets/icons/ac-sd1.svg';
import acShare from '../../../assets/icons/ac-share.svg';
import acCom from '../../../assets/icons/ac-com.svg';
import heartIcon from '../../../assets/icons/heart.svg';
import acSav from '../../../assets/icons/ac-sav.svg';
import acRep from '../../../assets/icons/ac-rep.svg';
import popupClose from '../../../assets/icons/popup-close.svg';
import acSee from '../../../assets/icons/ac-see.svg';
import fileIcon from '../../../assets/icons/file.svg';
import './view-project.css';
import { useLearnerToast } from './useLearnerToast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
    name: comment.user_name || comment.author_name || comment.name || 'Learner',
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

function LearnersViewProject() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectAbstract, setProjectAbstract] = useState('');
  const [projectFiles, setProjectFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [collaboratorDraft, setCollaboratorDraft] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search for collaborators by name and/or email
  useEffect(() => {
    if (!collaboratorDraft || collaboratorDraft.trim().length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const query = collaboratorDraft.startsWith('@')
      ? collaboratorDraft.slice(1).trim()
      : collaboratorDraft.trim();

    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const body = await res.json();
          if (body?.success && Array.isArray(body?.data)) {
            setSearchResults(body.data);
            setShowDropdown(body.data.length > 0);
          } else {
            setSearchResults([]);
            setShowDropdown(false);
          }
        } else {
          setSearchResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        console.error('Error searching users:', err);
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [collaboratorDraft]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowDropdown(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const [searchParams] = useSearchParams();
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [teamExpanded, setTeamExpanded] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const { showToast } = useLearnerToast();
  const composerRef = useRef(null);
  const commentsListRef = useRef(null);

  const preventDefault = (e) => e.preventDefault();
  const projectId = searchParams.get('id');

  const refreshProjects = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const res = await fetch(`${API_BASE_URL}/api/projects/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body?.message || 'Could not load projects');
    }

    const list = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.data)
        ? body.data.data
        : Array.isArray(body?.projects)
          ? body.projects
          : [];

    return list;
  };

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setError('empty');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchAllData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch project details
        const projectRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
        if (!projectRes.ok) throw new Error('Project not found');
        const projectData = await projectRes.json();
        const proj = projectData?.data;
        
        if (cancelled) return;
        setProject(proj);
        setLikesCount(proj?.likes_count || 0);
        setSavesCount(proj?.saves_count || 0);
        setCommentsCount(proj?.comments_count || 0);

        // 2. Fetch comments
        const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          const rawComments = Array.isArray(commentsData?.data) ? commentsData.data : [];
          if (!cancelled) {
            setCommentsList(rawComments.map(normalizeProjectComment).filter(Boolean));
          }
        }

        // 3. Fetch check likes/saves status if token exists
        if (token) {
          const headers = { Authorization: `Bearer ${token}` };
          
          const [likeCheckRes, saveCheckRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/projects/${projectId}/likes/check`, { headers }),
            fetch(`${API_BASE_URL}/api/projects/${projectId}/saves/check`, { headers })
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
  }, [projectId]);

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const method = hasLiked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/likes`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHasLiked(!hasLiked);
        setLikesCount(prev => hasLiked ? Math.max(0, prev - 1) : prev + 1);
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHasSaved(!hasSaved);
        setSavesCount(prev => hasSaved ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (err) {
      console.error('Save toggle failed', err);
    }
  };

  const refreshComments = async () => {
    if (!projectId) return;
    const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`);
    if (!commentsRes.ok) return;
    const commentsData = await commentsRes.json();
    const rawComments = Array.isArray(commentsData?.data) ? commentsData.data : [];
    setCommentsList(rawComments.map(normalizeProjectComment).filter(Boolean));
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

      let res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok && replyingToCommentId) {
        const fallbackPayload = { content: newCommentText.trim() };
        res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(fallbackPayload)
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || 'Could not post comment.');
      }

      setNewCommentText('');
      setReplyingToCommentId(null);
      await refreshComments();
      setCommentsCount((prev) => prev + 1);
    } catch (err) {
      console.error('Comment submit failed', err);
      showToast(err?.message || 'Could not post comment.', 'error');
    }
  };

  const handleShareProject = async () => {
    if (!projectId) return;
    const url = `${window.location.origin}/academia/learner/view-project?id=${projectId}`;
    const title = project?.title || 'Project';

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast('Project link copied to clipboard.');
        return;
      }
      showToast(url);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        showToast('Could not share this project.', 'error');
      }
    }
  };

  const startReply = (comment) => {
    if (!comment?.id) return;
    setReplyingToCommentId(comment.id);
    setNewCommentText(`@${comment.name} `);
    composerRef.current?.focus();
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const cancelReply = () => {
    setReplyingToCommentId(null);
    setNewCommentText('');
  };

  const scrollToComments = () => {
    commentsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeProject = project;

  const genesisCollaborators = useMemo(() => {
    return activeProject?.collaborators?.map((item) => ({
      name: typeof item === 'string' ? item : item?.name || item?.label || 'Collaborator',
      avatar: normalizeAssetUrl(item?.avatar) || defaultProfile,
    })) || [];
  }, [activeProject]);

  const displayTools = useMemo(() => parseProjectTools(activeProject?.tools), [activeProject]);

  const openUploadModal = () => setIsModalOpen(true);
  const closeUploadModal = () => {
    if (uploading) return;
    setIsModalOpen(false);
    setUploadError('');
  };

  const handleCollaboratorKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const value = collaboratorDraft.trim();
    if (!value) return;

    if (collaborators.some(c => (c.name || c) === value)) return;

    setCollaborators((current) => [...current, { name: value }]);
    setCollaboratorDraft('');
    setShowDropdown(false);
  };

  const handleSelectCollaborator = (user) => {
    if (collaborators.some(c => c.id === user.id || c.email === user.email)) {
      setCollaboratorDraft('');
      setShowDropdown(false);
      return;
    }
    setCollaborators((current) => [...current, {
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar
    }]);
    setCollaboratorDraft('');
    setShowDropdown(false);
  };

  const removeCollaborator = (item) => {
    setCollaborators((current) => current.filter((value) => value !== item));
  };

  const handleFilesChange = (event) => {
    setProjectFiles(Array.from(event.target.files || []));
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setThumbnailFile(file || null);
  };

  const handleUploadSubmit = async () => {
    if (!projectTitle.trim()) {
      setUploadError('Title is required');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', projectTitle.trim());
      formData.append('abstract', projectAbstract);
      formData.append('collaborators', JSON.stringify(collaborators));

      if (thumbnailFile) {
        formData.append('images', thumbnailFile);
      }

      if (projectFiles.length > 0) {
        formData.append('file', projectFiles[0]);
        projectFiles.slice(1).forEach((file) => {
          formData.append('images', file);
        });
      }

      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.message || 'Upload failed');
      }

      const refreshedProjects = await refreshProjects();
      const newestProject = refreshedProjects[0] || body?.data || null;
      setProject(newestProject);
      setProjectTitle('');
      setProjectAbstract('');
      setProjectFiles([]);
      setThumbnailFile(null);
      setCollaboratorDraft('');
      setCollaborators([]);
      setIsModalOpen(false);
      setError('');
    } catch (error) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const apexProfile = project ? {
    name: project.user_name || 'Unknown',
    role: project.user_role || 'Learner',
    email: project.user_email || '',
    avatar: normalizeAssetUrl(project.user_avatar) || defaultProfile,
    status: project.approval_status || 'Active',
    projects: project.user_projects_count || '1',
  } : { name: 'Loading…', role: '', email: '', avatar: defaultProfile, status: 'Loading…', projects: '0' };

  const zenithProject = project ? {
    title: project.title,
    subtitle: project.subtitle || project.abstract || '',
    image: normalizeAssetUrl(project.thumbnail_url) || (project.images && project.images[0] ? normalizeAssetUrl(project.images[0]) : ''),
    abstract: project.abstract || '',
    team: (project.collaborators && project.collaborators.length) ? `${project.collaborators.length} collaborators` : 'No collaborators',
    engagement: [
      { id: 'comments', label: 'Comments', value: commentsCount, icon: acCom, active: true },
      { id: 'likes', label: 'Likes', value: likesCount, icon: heartIcon, active: hasLiked },
      { id: 'saves', label: 'Saves', value: savesCount, icon: acSav, active: hasSaved },
    ],
    comments: commentsList,
    tools: project.tools || [],
    gallery: [project.thumbnail_url, ...(project.images || [])]
      .filter(Boolean)
      .filter((img) => isImageAsset(img))
      .map((img, index) => ({ image: normalizeAssetUrl(img), alt: project.title || 'Project image', class: galleryItemClass(index) })),
  } : null;

  const displayTitle = zenithProject?.title || (loading ? 'Loading project…' : 'Untitled project');
  const displaySubtitle = zenithProject?.subtitle || '';
  const displayAbstract = zenithProject?.abstract || '';
  const displayGallery = zenithProject?.gallery || [];
  const displayTeam = zenithProject?.team || '';
  const displayEngagement = zenithProject?.engagement || [];
  const displayComments = zenithProject?.comments || [];

  return (
    <LearnersPageShell>
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
                  <img src={badge1} alt="Badge" />
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
            <button type="button" className="learners-projects-primary-btn" onClick={openUploadModal}>
              <span>Upload new project</span>
              <img src={exitDown} alt="Upload" />
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/learner/account')}>
              View Profile
            </button>
          </div>
        </section>

        <section className="learners-view-project-shell">
          <div className="learners-view-project-main">
            {error === 'empty' ? (
              <div className="learners-view-project-empty-state learners-view-project-empty-state--full">
                <h3>Project not found</h3>
                <p>Select a project from the Projects page to view it here.</p>
                <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/learner/projects')}>
                  Back to Projects
                </button>
              </div>
            ) : (
              <>
                <div className="learners-view-project-head">
                  <button type="button" className="learners-view-project-back" onClick={() => navigate('/academia/learner/projects')}>
                    <img src={acLe} alt="Back" />
                    <span>Back to Projects</span>
                  </button>
                  <h2>{displayTitle}</h2>
                  <p>{displaySubtitle || (loading ? 'Loading project details…' : 'No project data available.')}</p>
                </div>

                <section className="learners-view-project-abstract-card">
                  <h3>Abstract</h3>
                  {loading ? <p>Loading abstract…</p> : <p>{displayAbstract || 'No abstract provided.'}</p>}

                  <button
                    type="button"
                    className={`learners-view-project-tools-toggle ${toolsExpanded ? 'is-expanded' : ''}`}
                    onClick={() => setToolsExpanded((value) => !value)}
                    aria-expanded={toolsExpanded}
                    aria-controls="learners-view-project-tools-panel"
                  >
                    <span className="learners-view-project-tools-toggle-icon">
                      <img src={acSd1} alt="Tools" />
                    </span>
                    <span>Tools Used</span>
                    <span className="learners-view-project-tools-toggle-caret"></span>
                  </button>

                  {toolsExpanded && (
                    <div id="learners-view-project-tools-panel" className="learners-view-project-tools-panel">
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
                    <div className="learners-view-project-empty-state">
                      <h3>Loading gallery…</h3>
                      <p>Preparing the project gallery.</p>
                    </div>
                  ) : displayGallery.length > 0 ? (
                    displayGallery.map((husk, idx) => (
                      <div key={idx} className={`learners-view-project-gallery-item ${husk.class}`}>
                        <img src={husk.image} alt={husk.alt} />
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
                    aria-controls="learners-view-project-team-panel"
                  >
                    <span>{displayTeam}</span>
                    <span className="learners-view-project-team-caret"></span>
                  </button>

                  {teamExpanded && (
                    <div id="learners-view-project-team-panel" className="learners-view-project-team-panel">
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
                  <img src={acShare} alt="Share" />
                </button>
              </div>

              <div className="learners-view-project-engagement-row">
                {displayEngagement.length > 0 ? displayEngagement.map((husk, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className={`learners-view-project-engagement-pill ${husk.active ? 'is-active' : ''}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      if (husk.id === 'likes') handleLikeToggle();
                      if (husk.id === 'saves') handleSaveToggle();
                      if (husk.id === 'comments') scrollToComments();
                    }}
                  >
                    <img src={husk.icon} alt={husk.label} />
                    <span>{husk.value} {husk.label}</span>
                  </button>
                )) : <div className="learners-view-project-empty-state"><h3>No engagement yet</h3><p>No engagement stats yet.</p></div>}
              </div>

              <div className="learners-view-project-comments-list" ref={commentsListRef}>
                {loading ? (
                  <div className="learners-view-project-empty-state">
                    <h3>Loading comments…</h3>
                    <p>Loading comments.</p>
                  </div>
                ) : displayComments.length > 0 ? (
                  displayComments.map((husk) => (
                    <article key={husk.id || `${husk.name}-${husk.time}`} className="learners-view-project-comment">
                      <div className="learners-view-project-comment-avatar">
                        <img src={husk.avatar} alt={husk.name} />
                      </div>

                      <div className="learners-view-project-comment-body">
                        <div className="learners-view-project-comment-meta">
                          <strong>{husk.name}</strong>
                          <span>{husk.time}</span>
                        </div>

                        <p>{husk.message}</p>

                        <div className="learners-view-project-comment-foot">
                          <button type="button" className="learners-view-project-comment-reply" onClick={() => startReply(husk)}>
                            <img src={acRep} alt="Reply" />
                            <span>Reply</span>
                          </button>
                          <span>Posted on <strong>{husk.posted || husk.time}</strong></span>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="learners-view-project-empty-state">
                    <h3>No comments yet</h3>
                    <p>Be the first to leave a comment on this project.</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
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
                    <span>Post Comment</span>
                  </button>
                </form>
              </div>
            </section>
          </aside>
        </section>
      </section>

      {/* Upload Modal */}
      <div 
        className={`learners-upload-modal ${isModalOpen ? 'is-open' : ''}`} 
        id="learnersUploadModal" 
        aria-hidden={!isModalOpen}
      >
        <div className="learners-upload-modal__backdrop" onClick={closeUploadModal}></div>
        <div className="learners-upload-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="learnersUploadModalTitle">
          <div className="learners-upload-modal__header">
            <h2 id="learnersUploadModalTitle">Upload Project</h2>
            <button 
              type="button" 
              className="learners-upload-modal__close" 
              onClick={closeUploadModal} 
              aria-label="Close upload project modal"
            >
              <img src={popupClose} alt="Close" />
            </button>
          </div>

          <div className="learners-upload-modal__body">
            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectTitle">Title / Subject</label>
              <input id="learnersProjectTitle" type="text" placeholder="Engineering Project Site map" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
            </div>

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectAbstract">Abstract</label>
              <textarea id="learnersProjectAbstract" placeholder="Type something..." value={projectAbstract} onChange={(event) => setProjectAbstract(event.target.value)}></textarea>
            </div>

            <div className="learners-upload-modal__field" onClick={(e) => e.stopPropagation()}>
              <label htmlFor="learnersProjectCollaboration">Add Collaboration</label>
              <div className="learners-upload-modal__search" style={{ position: 'relative' }}>
                <img src={acSee} alt="Search" />
                <input
                  id="learnersProjectCollaboration"
                  type="text"
                  placeholder="@ - name or email"
                  value={collaboratorDraft}
                  onChange={(event) => setCollaboratorDraft(event.target.value)}
                  onKeyDown={handleCollaboratorKeyDown}
                  autoComplete="off"
                />
                {showDropdown && searchResults.length > 0 && (
                  <div className="learners-upload-modal__search-dropdown">
                    {searchResults.map((user) => (
                      <div 
                        key={user.id} 
                        className="learners-upload-modal__search-item"
                        onClick={() => handleSelectCollaborator(user)}
                      >
                        <img src={normalizeAssetUrl(user.avatar) || defaultProfile} alt={user.name} />
                        <div>
                          <strong>{user.name || 'Anonymous'}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="learners-upload-modal__chips">
              {collaborators.map((item, index) => (
                <div key={`${item.name || item}-${index}`} className="learners-upload-modal__chip">
                  <img src={normalizeAssetUrl(item.avatar) || defaultProfile} alt={item.name || item} />
                  <span>{item.name || item}</span>
                  <button type="button" onClick={() => removeCollaborator(item)} aria-label={`Remove ${item.name || item}`}>
                    <img src={popupClose} alt="Remove" />
                  </button>
                </div>
              ))}
            </div>

            {collaborators.length === 0 ? <p className="learners-upload-modal__hint">Press Enter to add collaborators.</p> : null}

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectThumbnail">Thumbnail (optional)</label>
              <input id="learnersProjectThumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} />
            </div>

            <label className="learners-upload-modal__dropzone" htmlFor="learnersProjectFiles">
              <span className="learners-upload-modal__dropzone-icon">
                <img src={fileIcon} alt="File" />
              </span>
              <span className="learners-upload-modal__dropzone-copy">
                <strong>Drop files here or click to upload.</strong>
                <span>Upload case files, if any.</span>
              </span>
            </label>
            <input id="learnersProjectFiles" className="learners-upload-modal__file" type="file" multiple onChange={handleFilesChange} />

            {uploadError ? <p className="learners-upload-modal__error">{uploadError}</p> : null}

            <button type="button" className="learners-upload-modal__submit" onClick={handleUploadSubmit} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </LearnersPageShell>
  );
}

export default LearnersViewProject;
