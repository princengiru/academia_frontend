import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../../assets/imgs/prof.jpg';
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
import userIcon from '../../../assets/icons/user.svg';
import leEm from '../../../assets/icons/le-em.svg';
import popupClose from '../../../assets/icons/popup-close.svg';
import acSee from '../../../assets/icons/ac-see.svg';
import fileIcon from '../../../assets/icons/file.svg';
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
  const profileAvatar = normalizeAssetUrl(activeProject?.user_avatar) || profImg;
  const profileStatus = loadingProjects ? 'loading...' : projects.length ? 'Active' : 'empty';
  const profileMetaLeft = projects.length ? projectLabel(projects.length, 'project', 'projects') : 'No projects yet';
  const profileMetaRight = totalImages ? projectLabel(totalImages, 'file', 'files') : 'No files uploaded';
  const aboutText = activeProject?.abstract || 'Upload your first project to populate this section with real work from the backend.';
  const skills = activeProject?.collaborators?.length
    ? activeProject.collaborators.slice(0, 4).map((item) => (typeof item === 'string' ? item : item?.name || item?.label || 'Collaborator'))
    : ['Add collaborators from the upload form'];

  const projectCardImage = (project) => {
    const src = project?.thumbnail_url || (Array.isArray(project?.images) ? project.images[0] : undefined);
    return src ? normalizeAssetUrl(src) : '';
  };

  const handleViewProject = (project) => {
    if (!project?.id) return;
    navigate('/academia/learner/view-project', { state: { project } });
  };

  const handleCollaboratorKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const value = collaboratorDraft.trim();
    if (!value) return;

    setCollaborators((current) => [...current, value]);
    setCollaboratorDraft('');
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

  // --- Client-side pagination ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9); // show 9 items per page
  const totalPages = Math.max(1, Math.ceil((projects?.length || 0) / pageSize));

  useEffect(() => {
    if (!projects || projects.length === 0) {
      setPage(1);
      return;
    }
    if (page > totalPages) setPage(totalPages);
  }, [projects, page, totalPages]);

  const visibleProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return (projects || []).slice(start, start + pageSize);
  }, [projects, page, pageSize]);

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
                <p>{loadingProjects ? 'Loading projects from the backend...' : projectLabel(projects.length, 'project', 'projects')}</p>
              </div>
            </div>

            {loadingProjects ? (
              <div className="learners-projects-empty-state learners-projects-loading-state">
                <h3>loading...</h3>
                <p>Fetching your project list from the backend.</p>
              </div>
            ) : projectsError ? (
              <div className="learners-projects-empty-state learners-projects-error-state">
                <h3>Projects could not load</h3>
                <p>{projectsError}</p>
                <div className="learners-projects-empty-actions">
                  <button type="button" className="learners-projects-primary-btn" onClick={handleRetryLoad}>
                    Retry
                  </button>
                </div>
              </div>
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
                            <button type="button" onClick={preventDefault}>
                              <img src={project.likes_count > 0 ? acHer2 : heartIcon} alt="Like" />
                              <span>{formatCount(project.likes_count || 0)}</span>
                            </button>
                            <button type="button" onClick={preventDefault}>
                              <img src={acEye} alt="Views" />
                              <span>{formatCount(project.views_count || 0)}</span>
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
                <p>Upload your first project and it will appear here from the backend.</p>
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
                <p>Bio &amp; backend project summary</p>
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

              <div className="learners-projects-followers-row">
                <img src={userIcon} alt="Followers" />
                <span>{projectLabel(projects.length * 3, 'follower', 'followers')}</span>
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
                {aboutText} <a href="/" onClick={preventDefault}>Read more</a>
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

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectCollaboration">Add Collaboration</label>
              <div className="learners-upload-modal__search">
                <img src={acSee} alt="Search" />
                <input
                  id="learnersProjectCollaboration"
                  type="text"
                  placeholder="@ - name"
                  value={collaboratorDraft}
                  onChange={(event) => setCollaboratorDraft(event.target.value)}
                  onKeyDown={handleCollaboratorKeyDown}
                />
              </div>
            </div>

            <div className="learners-upload-modal__chips">
              {collaborators.map((item, index) => (
                <div key={`${item}-${index}`} className="learners-upload-modal__chip">
                  <img src={profImg} alt={item} />
                  <span>{item}</span>
                  <button type="button" onClick={() => removeCollaborator(item)} aria-label={`Remove ${item}`}>
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
