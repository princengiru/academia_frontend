import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import LearnerLoadError from './LearnerLoadError';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import acEye from '../../../assets/icons/ac-eye.svg';
import acSav from '../../../assets/icons/ac-sav.svg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import { fetchSavedProjects, normalizeAssetUrl } from './savedLibraryUtils';
import './projects.css';
import './saved-library.css';

function LearnersSavedLibrary() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);

  const loadSavedLibrary = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setProjects([]);
      setError('Sign in to view your saved library.');
      setLoading(false);
      return;
    }

    try {
      const list = await fetchSavedProjects(token);
      setProjects(list);
    } catch (err) {
      setProjects([]);
      setError(err?.message || 'Could not load saved items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedLibrary();
  }, [loadSavedLibrary]);

  const projectImage = (project) => {
    const src = project?.thumbnail_url || project?.thumbnail || (Array.isArray(project?.images) ? project.images[0] : '');
    return src ? normalizeAssetUrl(src) : acOnImg;
  };

  const handleOpenProject = (project) => {
    if (!project?.id) return;
    navigate(`/academia/learner/view-project?id=${project.id}`);
  };

  return (
    <LearnersPageShell>
      <section className="learners-saved-library-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Saved Library</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
          <p>Projects and journals you saved for later.</p>
        </section>

        {loading && (
          <div className="learners-projects-empty-state learners-projects-loading-state">
            <h3>Loading saved items…</h3>
            <p>Loading your saved items…</p>
          </div>
        )}

        {!loading && error && (
          <LearnerLoadError
            title={error === 'Sign in to view your saved library.' ? 'Sign in required' : 'Could not load saved library'}
            message={error}
            onRetry={error === 'Sign in to view your saved library.' ? undefined : loadSavedLibrary}
          />
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="learners-projects-empty-state">
            <h3>No saved items yet</h3>
            <p>Save projects from journals or project pages to find them here.</p>
            <div className="learners-projects-empty-actions">
              <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/projects')}>
                Browse journals
              </button>
            </div>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="learners-projects-grid learners-saved-library-grid">
            {projects.map((project) => (
              <article key={project.id} className="learners-project-card">
                <div className="learners-project-card-image">
                  <button type="button" className="learners-saved-library-card-link" onClick={() => handleOpenProject(project)}>
                    <img src={projectImage(project)} alt={project.title || 'Saved project'} />
                  </button>
                </div>
                <div className="learners-project-card-info">
                  <div className="learners-project-card-info-head">
                    <div className="learners-project-card-author">
                      <span>By</span>
                      <p>{project.user_name || project.author || 'Author'}</p>
                    </div>
                    <div className="learners-project-card-actions">
                      <span className="learners-project-card-action-btn is-active">
                        <img src={acSav} alt="Saved" />
                        <span>{project.saves_count || 0}</span>
                      </span>
                      <span className="learners-project-card-action-btn">
                        <img src={acEye} alt="Views" />
                        <span>{project.views_count || 0}</span>
                      </span>
                    </div>
                  </div>
                  <button type="button" className="learners-saved-library-title" onClick={() => handleOpenProject(project)}>
                    {project.title || 'Untitled project'}
                  </button>
                  <p className="learners-saved-library-abstract">{project.abstract || project.description || 'No description available.'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </LearnersPageShell>
  );
}

export default LearnersSavedLibrary;
