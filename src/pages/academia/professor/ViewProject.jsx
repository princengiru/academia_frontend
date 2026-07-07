import React, { useState, useEffect, useMemo } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './view-project.css';

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

const ViewProject = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active user engagement states
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Sheilah MUGABEKAZI', avatar: '/assets/imgs/default-profile.png' },
    { id: 2, name: 'Landry Perly', avatar: '/assets/imgs/ac-on.jpg' },
  ]);

  const removeCollaborator = (id) => {
    setCollaborators(collaborators.filter(collab => collab.id !== id));
  };

  const preventDefault = (e) => e.preventDefault();
  const projectFromState = location.state?.project || null;

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const projectId = useMemo(() => queryParams.get('id') || projectFromState?.id, [queryParams, projectFromState]);

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
          if (!cancelled) setCommentsList(commentsData?.data || []);
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newCommentText.trim() })
      });
      if (res.ok) {
        setNewCommentText('');
        // Refresh comments list
        const commentsRes = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setCommentsList(commentsData?.data || []);
          setCommentsCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Comment submit failed', err);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isUploadModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isUploadModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isUploadModalOpen) setIsUploadModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUploadModalOpen]);

  const apexProfile = project ? {
    name: project.user_name || 'Unknown',
    role: project.user_role || 'Professor',
    email: project.user_email || '',
    avatar: normalizeAssetUrl(project.user_avatar) || '/assets/imgs/default-profile.png',
    status: project.approval_status || 'Active',
    projects: project.user_projects_count || '1',
  } : { name: 'loading...', role: '', email: '', avatar: '/assets/imgs/default-profile.png', status: 'loading...', projects: '0' };

  const zenithProject = project ? {
    title: project.title,
    subtitle: project.subtitle || project.abstract || '',
    image: normalizeAssetUrl(project.thumbnail_url) || (project.images && project.images[0] ? normalizeAssetUrl(project.images[0]) : ''),
    abstract: project.abstract || '',
    team: (project.collaborators && project.collaborators.length) ? `${project.collaborators.length} collaborators` : 'No collaborators',
    engagement: [
      { id: 'comments', label: 'Comments', value: commentsCount, icon: '/assets/icons/ac-com.svg', active: true },
      { id: 'likes', label: 'Likes', value: likesCount, icon: '/assets/icons/heart.svg', active: hasLiked },
      { id: 'saves', label: 'Saves', value: savesCount, icon: '/assets/icons/ac-sav.svg', active: hasSaved },
    ],
    comments: commentsList,
    tools: project.tools || [],
    gallery: [project.thumbnail_url, ...(project.images || [])]
      .filter(Boolean)
      .filter((img) => isImageAsset(img))
      .map((img, index) => ({ image: normalizeAssetUrl(img), alt: project.title || 'Project image', class: galleryItemClass(index) })),
  } : null;

  const displayTitle = zenithProject?.title || (loading ? 'loading...' : 'empty');
  const displaySubtitle = zenithProject?.subtitle || '';
  const displayAbstract = zenithProject?.abstract || '';
  const displayGallery = zenithProject?.gallery || [];
  const displayTeam = zenithProject?.team || '';
  const displayEngagement = zenithProject?.engagement || [];
  const displayComments = commentsList.map(item => ({
    id: item.id,
    name: item.user_name || 'Anonymous',
    avatar: normalizeAssetUrl(item.user_avatar) || '/assets/imgs/default-profile.png',
    time: timeAgo(item.created_at),
    message: item.content,
    posted: new Date(item.created_at).toLocaleDateString()
  }));

  return (
    <ProfessorLayout currentPage="projects">
      <section className="learners-view-project-page">
        
        {/* --- Profile Strip --- */}
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
                <span>{apexProfile.role}</span>
                <span>&bull;</span>
                <span>{apexProfile.email}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-primary-btn" onClick={() => setIsUploadModalOpen(true)}>
              <span>Upload new project</span>
              <img src="/assets/icons/exit-down.svg" alt="" />
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={preventDefault}>
              View Profile
            </button>
          </div>
        </section>

        {/* --- Project Details Shell --- */}
        <section className="learners-view-project-shell">
          <div className="learners-view-project-main">
            {error === 'empty' ? (
              <div className="learners-view-project-empty-state learners-view-project-empty-state--full">
                <h3>empty</h3>
                <p>Select a project from the Projects page to view it here.</p>
                <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/professor/projects')}>
                  Back to Projects
                </button>
              </div>
            ) : (
              <>
                <div className="learners-view-project-head">
                  <Link to="/academia/professor/projects" className="learners-view-project-back">
                    <img src="/assets/icons/ac-le.svg" alt="" />
                    <span>Back to Projects</span>
                  </Link>
                  <h2>{displayTitle}</h2>
                  <p>{displaySubtitle || (loading ? 'Fetching project details from the backend.' : 'No project data available.')}</p>
                </div>

                <section className="learners-view-project-abstract-card">
                  <h3>Abstract</h3>
                  {loading ? <p>loading...</p> : <p>{displayAbstract || 'empty'}</p>}

                  <button type="button" className="learners-view-project-tools-toggle" onClick={preventDefault}>
                    <span className="learners-view-project-tools-toggle-icon">
                      <img src="/assets/icons/ac-sd1.svg" alt="" />
                    </span>
                    <span>Tools Used</span>
                    <span className="learners-view-project-tools-toggle-caret"></span>
                  </button>
                </section>

                <section className="learners-view-project-gallery" aria-label="Project gallery">
                  {loading ? (
                    <div className="learners-view-project-empty-state">
                      <h3>loading...</h3>
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
                      <h3>empty</h3>
                      <p>No gallery images were uploaded for this project.</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* --- Right Sidebar / Comments Panel --- */}
          <aside className="learners-view-project-side">
            <section className="learners-view-project-comments-panel">
              <div className="learners-view-project-comments-head">
                <div>
                  <h3>{displayTitle}</h3>
                  <button type="button" className="learners-view-project-team-toggle" onClick={preventDefault}>
                    <span>{displayTeam}</span>
                    <span className="learners-view-project-team-caret"></span>
                  </button>
                </div>

                <button type="button" className="learners-view-project-share-btn" onClick={preventDefault} aria-label="Share project">
                  <img src="/assets/icons/ac-share.svg" alt="" />
                </button>
              </div>

              <div className="learners-view-project-engagement-row">
                {displayEngagement.length > 0 ? displayEngagement.map((husk) => (
                  <button 
                    key={husk.id} 
                    type="button" 
                    className={`learners-view-project-engagement-pill ${husk.active ? 'is-active' : ''}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      if (husk.id === 'likes') handleLikeToggle();
                      if (husk.id === 'saves') handleSaveToggle();
                    }}
                  >
                    <img src={husk.id === 'likes' && hasLiked ? '/assets/icons/ac-her2.svg' : husk.icon} alt="" />
                    <span>{husk.value} {husk.label}</span>
                  </button>
                )) : <div className="learners-view-project-empty-state"><h3>empty</h3><p>No engagement stats yet.</p></div>}
              </div>

              <div className="learners-view-project-comments-list">
                {loading ? (
                  <div className="learners-view-project-empty-state">
                    <h3>loading...</h3>
                    <p>Loading comments.</p>
                  </div>
                ) : displayComments.length > 0 ? (
                  displayComments.map((comment) => (
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
                          <button type="button" className="learners-view-project-comment-reply" onClick={preventDefault}>
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
                    <h3>empty</h3>
                    <p>No comments yet.</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="learners-view-project-comment-composer">
                <form onSubmit={handleCommentSubmit} className="learners-view-project-comment-form">
                  <textarea 
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

      {/* --- UPLOAD PROJECT MODAL --- */}
      <div className={`learners-upload-modal ${isUploadModalOpen ? 'is-open' : ''}`} aria-hidden={!isUploadModalOpen}>
        <div className="learners-upload-modal__backdrop" onClick={() => setIsUploadModalOpen(false)}></div>
        
        <div className="learners-upload-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="learnersUploadModalTitle">
          <div className="learners-upload-modal__header">
            <h2 id="learnersUploadModalTitle">Upload Project</h2>
            <button type="button" className="learners-upload-modal__close" onClick={() => setIsUploadModalOpen(false)} aria-label="Close upload project modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
            </button>
          </div>

          <div className="learners-upload-modal__body">
            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectTitle">Title / Subject</label>
              <input id="learnersProjectTitle" type="text" placeholder="Engineering Project Site map" />
            </div>

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectAbstract">Abstract</label>
              <textarea id="learnersProjectAbstract" placeholder="Type something..."></textarea>
            </div>

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectCollaboration">Add Collaboration</label>
              <div className="learners-upload-modal__search">
                <img src="/assets/icons/ac-see.svg" alt="" />
                <input id="learnersProjectCollaboration" type="text" placeholder="@ - name" />
              </div>
            </div>

            <div className="learners-upload-modal__chips">
              {collaborators.map((collab) => (
                <div key={collab.id} className="learners-upload-modal__chip">
                  <img src={collab.avatar} alt={collab.name} />
                  <span>{collab.name}</span>
                  <button type="button" onClick={() => removeCollaborator(collab.id)} aria-label={`Remove ${collab.name}`}>
                    <img src="/assets/icons/popup-close.svg" alt="" />
                  </button>
                </div>
              ))}
            </div>

            <label className="learners-upload-modal__dropzone" htmlFor="learnersProjectFiles">
              <span className="learners-upload-modal__dropzone-icon">
                <img src="/assets/icons/file.svg" alt="" />
              </span>
              <span className="learners-upload-modal__dropzone-copy">
                <strong>Drop files here or click to upload.</strong>
                <span>Upload case files, if any.</span>
              </span>
            </label>
            <input id="learnersProjectFiles" className="learners-upload-modal__file" type="file" multiple />

            <button type="button" className="learners-upload-modal__submit" onClick={() => setIsUploadModalOpen(false)}>Done</button>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default ViewProject;