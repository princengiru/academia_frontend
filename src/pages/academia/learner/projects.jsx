import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import LearnerLoadError from './LearnerLoadError';
import LearnerLoading from './LearnerLoading';

// Icons & Images
import defaultProfile from '../../../assets/imgs/default-profile.png';
import d1Img from '../../../assets/imgs/d1.jpg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import acJrImg from '../../../assets/imgs/ac-jr.jpg';
import badge1 from '../../../assets/icons/badge-1.svg';
import exitDown from '../../../assets/icons/exit-down.svg';
import acHer1 from '../../../assets/icons/ac-her1.svg';
import acHer2 from '../../../assets/icons/ac-her2.svg';
import heartIcon from '../../../assets/icons/heart.svg';
import acEye from '../../../assets/icons/ac-eye.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import bPencil from '../../../assets/icons/b-pencil.svg';
import leUe from '../../../assets/icons/le-ue.svg';
import leEx from '../../../assets/icons/le-ex.svg';
import leLo from '../../../assets/icons/le-lo.svg';
import leEm from '../../../assets/icons/le-em.svg';
import popupClose from '../../../assets/icons/popup-close.svg';
import acSee from '../../../assets/icons/ac-see.svg';
import fileIcon from '../../../assets/icons/file.svg';
import acSav from '../../../assets/icons/ac-sav.svg';
import './projects.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// No static fallbacks — thumbnails should come from backend uploads

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

function projectLabel(value, singular, plural) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function LearnersProjects() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
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

  // --- Client-side pagination ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9); // show 9 items per page

  const preventDefault = (e) => e.preventDefault();
  const openUploadModal = () => setIsModalOpen(true);
  const closeUploadModal = () => {
    if (uploading) return;
    setIsModalOpen(false);
    setUploadError('');
  };

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
    let cancelled = false;

    const load = async () => {
      setLoadingProjects(true);
      setProjectsError('');

      try {
        const list = await refreshProjects();
        if (!cancelled) setProjects(list);
      } catch (error) {
        if (!cancelled) {
          setProjects([]);
          setProjectsError(error?.message || 'Could not load your projects right now.');
        }
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeProject = projects[0] || null;
  const totalImages = useMemo(() => projects.reduce((sum, project) => sum + (Array.isArray(project.images) ? project.images.length : 0), 0), [projects]);
  const totalCollaborators = useMemo(() => projects.reduce((sum, project) => sum + (Array.isArray(project.collaborators) ? project.collaborators.length : 0), 0), [projects]);
  const approvedProjects = useMemo(() => projects.filter((project) => project.approval_status === 'approved').length, [projects]);
  const profileName = activeProject?.user_name || 'My Projects';
  const profileAvatar = normalizeAssetUrl(activeProject?.user_avatar) || defaultProfile;
  const profileStatus = loadingProjects ? 'Loading…' : projects.length ? 'Active' : 'No projects';
  const profileMetaLeft = projects.length ? projectLabel(projects.length, 'project', 'projects') : 'No projects yet';
  const profileMetaRight = totalImages ? projectLabel(totalImages, 'file', 'files') : 'No files uploaded';
  const aboutText = activeProject?.abstract || 'Upload your first project to showcase your work here.';
  const skills = activeProject?.collaborators?.length
    ? activeProject.collaborators.slice(0, 4).map((item) => (typeof item === 'string' ? item : item?.name || item?.label || 'Collaborator'))
    : ['Add collaborators from the upload form'];

  const projectCardImage = (project) => {
    const src = project?.thumbnail_url || (Array.isArray(project?.images) ? project.images[0] : undefined);
    return src ? normalizeAssetUrl(src) : '';
  };

  const [likedProjects, setLikedProjects] = useState({});
  const [savedProjects, setSavedProjects] = useState({});

  const visibleProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (projects || []).slice(start, start + pageSize);
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
              const checkLikeData = await likeRes.ok ? await likeRes.json() : null;
              likesMap[p.id] = !!checkLikeData?.data?.hasLiked;
            }
            if (saveRes.ok) {
              const checkSaveData = await saveRes.ok ? await saveRes.json() : null;
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

  const handleViewProject = (project) => {
    if (!project?.id) return;
    navigate(`/academia/learner/view-project?id=${project.id}`);
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

      // If user provided an explicit thumbnail, append it first so backend picks it as thumbnail_url
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

      setProjectTitle('');
      setProjectAbstract('');
      setProjectFiles([]);
      setCollaboratorDraft('');
      setCollaborators([]);
      setIsModalOpen(false);
      setProjects(await refreshProjects());
    } catch (error) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((projects?.length || 0) / pageSize));

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setPage(1);
      return;
    }
    if (page > totalPages) setPage(totalPages);
  }, [projects, page, totalPages]);

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

  const goToPage = (n) => setPage(Math.min(Math.max(1, n), totalPages));
  const prevPage = () => goToPage(page - 1);
  const nextPage = () => goToPage(page + 1);

  const handleRetryLoad = async () => {
    setLoadingProjects(true);
    setProjectsError('');

    try {
      setProjects(await refreshProjects());
    } catch (error) {
      setProjects([]);
      setProjectsError(error?.message || 'Could not load your projects right now.');
    } finally {
      setLoadingProjects(false);
    }
  };

  return (
    <LearnersPageShell>
      <section className="learners-projects-page">
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={profileAvatar} alt={profileName} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profileName}</h1>
                <span className="learners-projects-status-badge">{profileStatus}</span>
                <span className="learners-projects-count-badge">
                  <img src={badge1} alt="Badge" />
                  <span>{projects.length}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{profileMetaLeft}</span>
                <span>&bull;</span>
                <span>{profileMetaRight}</span>
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

        <section className="learners-projects-board">
          <div className="learners-projects-board-main">
            <div className="learners-projects-section-head">
              <div>
                <h2>My Projects</h2>
                <p>{loadingProjects ? 'Loading your projects…' : projectLabel(projects.length, 'project', 'projects')}</p>
              </div>
            </div>

            {loadingProjects ? (
              <LearnerLoading title="Loading projects" message="Fetching your project list." />
            ) : projectsError ? (
              <LearnerLoadError
                title="Projects could not load"
                message={projectsError}
                onRetry={handleRetryLoad}
              />
            ) : projects.length > 0 ? (
              <>
                <div className="learners-projects-grid">
                  {visibleProjects.map((project, index) => (
                    <article key={project.id || index} className="learners-project-card">
                      <div className="learners-project-card-image">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleViewProject(project); }}>
                          {projectCardImage(project) ? (
                            <img src={projectCardImage(project)} alt={project.title || 'Project'} />
                          ) : (
                            <div className="learners-project-card-image--empty" aria-hidden="true" />
                          )}
                        </a>
                      </div>

                      <div className="learners-project-card-info">
                        <div className="learners-project-card-info-head">
                          <div className="learners-project-card-author">
                            <span>By</span>
                            <p>{project.user_name || 'You'}</p>
                          </div>

                          <div className="learners-project-card-actions">
                            <button 
                              type="button" 
                              onClick={(e) => handleLikeToggle(project.id, e)}
                              className={`learners-project-card-action-btn ${likedProjects[project.id] ? 'is-active' : ''}`}
                            >
                              <img src={likedProjects[project.id] ? acHer2 : heartIcon} alt="Like" />
                              <span>{formatCount(project.likes_count || 0)}</span>
                            </button>
                            <span className="learners-project-card-action-btn learners-project-card-action-btn--static">
                              <img src={acEye} alt="Views" />
                              <span>{formatCount(project.views_count || 0)}</span>
                            </span>
                            <button 
                              type="button" 
                              onClick={(e) => handleSaveToggle(project.id, e)}
                              className={`learners-project-card-action-btn ${savedProjects[project.id] ? 'is-active' : ''}`}
                            >
                              <img src={acSav} alt="Save" />
                              <span>{formatCount(project.saves_count || 0)}</span>
                            </button>
                          </div>
                        </div>

                        <div className="learners-project-card-info-body">
                          <p><a href="#" onClick={(e) => { e.preventDefault(); handleViewProject(project); }}>{project.title || 'Untitled project'}</a></p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="learners-projects-pagination">
                  <button type="button" onClick={prevPage} aria-label="Previous page" disabled={page <= 1}>
                    <img src={acLe2} alt="Previous" />
                  </button>
                  <div>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i} type="button" className={i + 1 === page ? 'active' : ''} onClick={() => goToPage(i + 1)}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={nextPage} aria-label="Next page" disabled={page >= totalPages}>
                    <img src={acRi} alt="Next" />
                  </button>
                </div>
              </>
            ) : (
              <div className="learners-projects-empty-state">
                <h3>No projects yet</h3>
                <p>Completed a course? Upload a project to showcase what you learned and build your portfolio.</p>
                <div className="learners-projects-empty-actions">
                  <button type="button" className="learners-projects-primary-btn" onClick={openUploadModal}>
                    Upload new project
                  </button>
                  <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="learners-projects-side">
            <div className="learners-projects-section-head learners-projects-section-head-side">
              <div>
                <h2>Profile</h2>
                <p>Your public learning profile</p>
              </div>
            </div>

            <div className="learners-projects-side-card learners-projects-side-card-profile">
              <div className="learners-projects-side-card-head">
                <span className="learners-projects-availability">{approvedProjects ? `${approvedProjects} approved` : 'Available now'}</span>
                <button type="button" className="learners-projects-edit-btn" onClick={() => navigate('/academia/learner/settings')}>
                  <img src={bPencil} alt="Edit" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-projects-side-list">
                <div><img src={leUe} alt="Role" /><span>{projectLabel(projects.length, 'project', 'projects')} uploaded</span></div>
                <div><img src={leEx} alt="Experience" /><span>{projectLabel(totalCollaborators, 'collaborator', 'collaborators')}</span></div>
                <div><img src={leLo} alt="Location" /><span>{projectLabel(totalImages, 'file', 'files')} attached</span></div>
              </div>

              <button type="button" className="learners-projects-email-btn" onClick={() => navigate('/academia/learner/account')}>
                <span>View account</span>
                <img src={leEm} alt="Email" />
              </button>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>About</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={() => navigate('/academia/learner/settings')}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>
              <p className="learners-projects-side-paragraph">
                {aboutText}
                {activeProject ? (
                  <button type="button" className="learners-projects-read-more" onClick={() => handleViewProject(activeProject)}>
                    View featured project
                  </button>
                ) : null}
              </p>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-projects-stats-list">
                <div>
                  <span>Projects</span>
                  <strong>{formatCount(projects.length)}</strong>
                </div>
                <div>
                  <span>Files</span>
                  <strong>{formatCount(totalImages)}</strong>
                </div>
                <div>
                  <span>Collaborators</span>
                  <strong>{formatCount(totalCollaborators)}</strong>
                </div>
              </div>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={() => navigate('/academia/learner/settings')}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>
              <div className="learners-projects-skills-list">
                {skills.map((skill, idx) => (
                  <span key={`${skill}-${idx}`}>{skill}</span>
                ))}
              </div>
            </div>
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
            <button type="button" className="learners-upload-modal__close" onClick={closeUploadModal} aria-label="Close upload project modal">
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

export default LearnersProjects;
