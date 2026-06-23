import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './projects.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// --- Helper Functions ---
function normalizeAssetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function formatCount(value) {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue)) return '0';
  return numberValue.toLocaleString();
}

const Projects = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Profile State ---
  const [profile, setProfile] = useState({
    name: '', role: '', email: '', avatar: '/assets/imgs/prof.jpg', 
    status: 'Active', availability: 'Available now', location: '', bio: '', stats: [], skills: []
  });

  // --- Projects State ---
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');

  // --- Upload Modal State ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
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

  const [imagesFiles, setImagesFiles] = useState([]);
  const [deliverableFile, setDeliverableFile] = useState(null);

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const pageSize = 9; 
  const totalPages = Math.max(1, Math.ceil((projects?.length || 0) / pageSize));

  // --- Modals & Body Scroll ---
  useEffect(() => {
    if (isUploadModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isUploadModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isUploadModalOpen) setIsUploadModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUploadModalOpen]);

  // --- Data Fetching ---
  const loadProjects = async (token, mounted = true) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/my`, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'Failed to load projects');
      if (mounted) setProjects(Array.isArray(body?.data) ? body.data : []);
    } catch (err) {
      if (mounted) setProjectsError(err.message || 'Failed to load projects');
    }
  };

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { 
          headers: token ? { Authorization: `Bearer ${token}` } : {} 
        });
        const body = await res.json();
        if (res.ok && mounted) {
          const user = body?.data?.user || {};
          setProfile(prev => ({ 
            ...prev, 
            name: user.name || prev.name, 
            email: user.email || prev.email, 
            avatar: user.avatar || prev.avatar, 
            role: user.role || prev.role, 
            bio: user.bio || prev.bio, 
            location: user.location || prev.location 
          }));
        }
      } catch (err) {
        console.error("Profile load error", err);
      }
    };

    const initData = async () => {
      setProjectsLoading(true);
      await loadProfile();
      await loadProjects(token, mounted);
      if (mounted) setProjectsLoading(false);
    };

    initData();
    return () => { mounted = false; };
  }, []);

  // --- Pagination Logic ---
  useEffect(() => {
    if (projects.length === 0) setPage(1);
    else if (page > totalPages) setPage(totalPages);
  }, [projects, page, totalPages]);

  const [likedProjects, setLikedProjects] = useState({});
  const [savedProjects, setSavedProjects] = useState({});

  const visibleProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return projects.slice(start, start + pageSize);
  }, [projects, page, pageSize]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !visibleProjects.length) return;

    let cancelled = false;
    const checkStatuses = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const likesMap = { ...likedProjects };
      const savesMap = { ...savedProjects };

      await Promise.all(
        visibleProjects.map(async (p) => {
          if (!p.id) return;
          try {
            const [likeRes, saveRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/projects/${p.id}/likes/check`, { headers }),
              fetch(`${API_BASE_URL}/api/projects/${p.id}/saves/check`, { headers })
            ]);
            if (likeRes.ok) {
              const checkLikeData = await likeRes.json();
              likesMap[p.id] = !!checkLikeData?.data?.hasLiked;
            }
            if (saveRes.ok) {
              const checkSaveData = await saveRes.json();
              savesMap[p.id] = !!checkSaveData?.data?.hasSaved;
            }
          } catch (e) {
            console.error('Check failed for project', p.id, e);
          }
        })
      );

      if (!cancelled) {
        setLikedProjects(likesMap);
        setSavedProjects(savesMap);
      }
    };

    checkStatuses();
    return () => { cancelled = true; };
  }, [visibleProjects]);

  // Autocomplete user search side-effect
  useEffect(() => {
    if (!collaboratorDraft.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const token = localStorage.getItem('token');
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(collaboratorDraft)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const body = await res.json();
          setSearchResults(body?.data || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Error searching users:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [collaboratorDraft]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowDropdown(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleLikeToggle = async (projectId, event) => {
    event.stopPropagation();
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const currentlyLiked = !!likedProjects[projectId];
    try {
      const method = currentlyLiked ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/likes`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLikedProjects(prev => ({ ...prev, [projectId]: !currentlyLiked }));
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === projectId 
              ? { ...p, likes_count: currentlyLiked ? Math.max(0, (p.likes_count || 0) - 1) : (p.likes_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like from grid:', err);
    }
  };

  const handleSaveToggle = async (projectId, event) => {
    event.stopPropagation();
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const currentlySaved = !!savedProjects[projectId];
    try {
      const method = currentlySaved ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/saves`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedProjects(prev => ({ ...prev, [projectId]: !currentlySaved }));
        setProjects(prevProjects => 
          prevProjects.map(p => 
            p.id === projectId 
              ? { ...p, saves_count: currentlySaved ? Math.max(0, (p.saves_count || 0) - 1) : (p.saves_count || 0) + 1 }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error toggling save from grid:', err);
    }
  };

  const goToPage = (n) => setPage(Math.min(Math.max(1, n), totalPages));

  // --- Upload Form Logic ---
  const handleCollaboratorKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = collaboratorDraft.trim();
    if (!value) return;
    if (collaborators.some(c => (c.name || c) === value)) return;
    setCollaborators(prev => [...prev, { name: value }]);
    setCollaboratorDraft('');
    setShowDropdown(false);
  };

  const handleSelectCollaborator = (user) => {
    if (collaborators.some(c => c.id === user.id || c.email === user.email)) {
      setCollaboratorDraft('');
      setShowDropdown(false);
      return;
    }
    setCollaborators(prev => [...prev, {
      id: user.id,
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar
    }]);
    setCollaboratorDraft('');
    setShowDropdown(false);
  };

  const removeCollaborator = (item) => {
    setCollaborators(prev => prev.filter(c => c !== item));
  };

  const resetForm = () => {
    setTitle('');
    setAbstract('');
    setCollaboratorDraft('');
    setCollaborators([]);
    setSearchResults([]);
    setShowDropdown(false);
    setImagesFiles([]);
    setDeliverableFile(null);
    setUploadError('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setUploadError('Title is required');

    setUploading(true);
    setUploadError('');
    const token = localStorage.getItem('token');
    
    // Constructing FormData precisely as V1 expects
    const form = new FormData();
    form.append('title', title.trim());
    if (abstract.trim()) form.append('abstract', abstract.trim());
    if (collaborators.length > 0) {
       form.append('collaborators', JSON.stringify(collaborators));
    }

    imagesFiles.forEach(file => form.append('images', file));
    if (deliverableFile) form.append('file', deliverableFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'Upload failed');

      setIsUploadModalOpen(false);
      resetForm();
      await loadProjects(token); // Refresh project list silently
    } catch (err) {
      setUploadError(err.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProfessorLayout currentPage="projects">
      <section className="learners-projects-page">
        
        {/* --- Profile Strip --- */}
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={normalizeAssetUrl(profile.avatar) || '/assets/imgs/prof.jpg'} alt={profile.name} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profile.name || 'Instructor'}</h1>
                {profile.status && <span className="learners-projects-status-badge">{profile.status}</span>}
                <span className="learners-projects-count-badge">
                  <img src="/assets/icons/badge-1.svg" alt="" />
                  <span>{projects.length}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{profile.role || 'Professor'}</span>
                <span>&bull;</span>
                <span>{profile.email || 'No email provided'}</span>
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

        {/* --- Main Board --- */}
        <section className="learners-projects-board">
          <div className="learners-projects-board-main">
            <div className="learners-projects-section-head">
              <div>
                <h2>My Projects</h2>
                <p>{projects.length} Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-projects-grid">
              {projectsLoading ? (
                <div className="learners-projects-empty-state">
                  <h3>Loading projects...</h3>
                </div>
              ) : projectsError ? (
                <div className="learners-projects-empty-state">
                  <h3>Error</h3>
                  <p>{projectsError}</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="learners-projects-empty-state">
                  <h3>No projects yet</h3>
                  <p>You haven't uploaded any projects. Use Upload to add your work.</p>
                </div>
              ) : (
                visibleProjects.map((card) => (
                  <article key={card.id} className="learners-project-card">
                    <div className="learners-project-card-image">
                      <Link to={`/academia/professor/view-project?id=${card.id}`} className="learners-project-card-link">
                        <img 
                          src={normalizeAssetUrl(card.thumbnail_url || (Array.isArray(card.images) && card.images[0])) || '/assets/imgs/d1.jpg'} 
                          alt={card.title} 
                        />
                      </Link>
                    </div>

                    <div className="learners-project-card-info">
                      <div className="learners-project-card-info-head">
                        <div className="learners-project-card-author">
                          <span>By</span>
                          <p>{card.user_name || profile.name}</p>
                        </div>

                        <div className="learners-project-card-actions">
                          <button 
                            type="button" 
                            onClick={(e) => handleLikeToggle(card.id, e)}
                            className={`learners-project-card-action-btn ${likedProjects[card.id] ? 'is-active' : ''}`}
                          >
                            <img src={likedProjects[card.id] ? '/assets/icons/ac-her2.svg' : '/assets/icons/heart.svg'} alt="Like" />
                            <span>{formatCount(card.likes_count || 0)}</span>
                          </button>
                          <button type="button" onClick={preventDefault}>
                            <img src="/assets/icons/ac-eye.svg" alt="Views" />
                            <span>{formatCount(card.views_count || 0)}</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => handleSaveToggle(card.id, e)}
                            className={`learners-project-card-action-btn ${savedProjects[card.id] ? 'is-active' : ''}`}
                          >
                            <img src="/assets/icons/ac-sav.svg" alt="Save" />
                            <span>{formatCount(card.saves_count || 0)}</span>
                          </button>
                        </div>
                      </div>

                      <div className="learners-project-card-info-body">
                        <p>
                          <Link to={`/academia/professor/view-project?id=${card.id}`} className="learners-project-card-title-link">
                            {card.title}
                          </Link>
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="learners-projects-pagination">
                <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
                  <img src="/assets/icons/ac-le2.svg" alt="Prev" />
                </button>
                <div>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} type="button" className={i + 1 === page ? 'active' : ''} onClick={() => goToPage(i + 1)}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= totalPages} aria-label="Next page">
                  <img src="/assets/icons/ac-ri.svg" alt="Next" />
                </button>
              </div>
            )}
          </div>

          {/* --- Right Sidebar --- */}
          <aside className="learners-projects-side">
            <div className="learners-projects-section-head learners-projects-section-head-side">
              <div>
                <h2>Profile</h2>
                <p>Bio &amp; All about your experience</p>
              </div>
            </div>

            <div className="learners-projects-side-card learners-projects-side-card-profile">
              <div className="learners-projects-side-card-head">
                <span className="learners-projects-availability">{profile.availability}</span>
                <button type="button" className="learners-projects-edit-btn" onClick={preventDefault}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-projects-side-list">
                <div><img src="/assets/icons/le-ue.svg" alt="" /><span>{profile.role || 'Instructor'}</span></div>
                <div><img src="/assets/icons/le-ex.svg" alt="" /><span>{projects.length} Projects</span></div>
                <div><img src="/assets/icons/le-lo.svg" alt="" /><span>{profile.location || 'Remote'}</span></div>
              </div>

              <div className="learners-projects-followers-row">
                <img src="/assets/icons/user.svg" alt="" />
                <span>123 Followers</span>
              </div>

              <button type="button" className="learners-projects-email-btn" onClick={preventDefault}>
                <span>Edit E-mail</span>
                <img src="/assets/icons/le-em.svg" alt="" />
              </button>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>About</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                </button>
              </div>
              <p className="learners-projects-side-paragraph">
                {profile.bio || "No biography provided yet."} <a href="#" onClick={preventDefault}>Read more</a>
              </p>
            </div>

            {profile.stats && profile.stats.length > 0 && (
              <div className="learners-projects-side-card">
                <div className="learners-projects-side-card-head">
                  <h3>Projects Stats</h3>
                </div>
                <div className="learners-projects-stats-list">
                  {profile.stats.map((stat, index) => (
                    <div key={index}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <div className="learners-projects-side-card">
                <div className="learners-projects-side-card-head">
                  <h3>Tools &amp; Skills</h3>
                  <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                    <img src="/assets/icons/b-pencil.svg" alt="" />
                  </button>
                </div>
                <div className="learners-projects-skills-list">
                  {profile.skills.map((skill, index) => (
                    <span key={index}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </section>

      {/* --- UPLOAD PROJECT MODAL --- */}
      <div className={`learners-upload-modal ${isUploadModalOpen ? 'is-open' : ''}`} aria-hidden={!isUploadModalOpen}>
        <div className="learners-upload-modal__backdrop" onClick={() => setIsUploadModalOpen(false)}></div>
        
        <div className="learners-upload-modal__dialog" role="dialog" aria-modal="true">
          <div className="learners-upload-modal__header">
            <h2>Upload Project</h2>
            <button type="button" className="learners-upload-modal__close" onClick={() => setIsUploadModalOpen(false)}>
              <img src="/assets/icons/popup-close.svg" alt="Close" />
            </button>
          </div>

          <div className="learners-upload-modal__body">
            <div className="learners-upload-modal__field">
              <label>Title / Subject</label>
              <input type="text" placeholder="Engineering Project Site map" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="learners-upload-modal__field">
              <label>Abstract</label>
              <textarea placeholder="Type something..." value={abstract} onChange={(e) => setAbstract(e.target.value)}></textarea>
            </div>

            <div className="learners-upload-modal__field" onClick={(e) => e.stopPropagation()}>
              <label>Add Collaboration</label>
              <div className="learners-upload-modal__search" style={{ position: 'relative' }}>
                <img src="/assets/icons/ac-see.svg" alt="" />
                <input 
                  type="text" 
                  placeholder='@ - name or email' 
                  value={collaboratorDraft}
                  onChange={(e) => setCollaboratorDraft(e.target.value)}
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
                        <img src={normalizeAssetUrl(user.avatar) || '/assets/imgs/prof.jpg'} alt={user.name} />
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
                <div key={index} className="learners-upload-modal__chip">
                  <img src={normalizeAssetUrl(item.avatar) || '/assets/imgs/prof.jpg'} alt={item.name || item} />
                  <span>{item.name || item}</span>
                  <button type="button" onClick={() => removeCollaborator(item)}>
                    <img src="/assets/icons/popup-close.svg" alt="Remove" />
                  </button>
                </div>
              ))}
            </div>

            {/* Images Bulk Upload */}
            <label className="learners-upload-modal__dropzone">
              <span className="learners-upload-modal__dropzone-icon">
                <img src="/assets/icons/file.svg" alt="" />
              </span>
              <span className="learners-upload-modal__dropzone-copy">
                <strong>Drop files here or click to upload.</strong>
                <span>Upload case files, if any.</span>
              </span>
              <input type="file" multiple onChange={(e) => setImagesFiles(Array.from(e.target.files || []))} className="learners-upload-modal__file" />
            </label>
            {imagesFiles.length > 0 && <span style={{fontSize: '12px', color: 'gray'}}>{imagesFiles.length} file(s) selected</span>}

            {/* Singular Deliverable Upload */}
            <div className="learners-upload-modal__field" style={{ marginTop: 16 }}>
              <label>Deliverable file (optional)</label>
              <input type="file" onChange={(e) => setDeliverableFile(e.target.files[0] || null)} />
            </div>

            {uploadError && <p style={{ color: 'var(--danger, #c00)', marginTop: '8px' }}>{uploadError}</p>}
            
            <button type="button" className="learners-upload-modal__submit" onClick={handleUploadSubmit} disabled={uploading} style={{ marginTop: '16px' }}>
              {uploading ? 'Uploading...' : 'Upload Project'}
            </button>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default Projects;