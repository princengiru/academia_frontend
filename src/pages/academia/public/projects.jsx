import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import ddwIcon from '../../../assets/icons/ddw.svg';
import journalImage from '../../../assets/imgs/journal.jpg';
import acHer2Icon from '../../../assets/icons/ac-her2.svg';
import acEyeIcon from '../../../assets/icons/ac-eye.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import './projects.css';
import { PublicEmptyState, PublicLoadError } from './PublicPageState';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';
import { buildProjectPath } from './publicShare';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SORT_FILTERS = ['Newest', 'Most viewed', 'Most liked'];

const slugify = (value) => value.toLowerCase().replace(/\s+/g, '-');

const normalizeProject = (project) => {
  if (!project) return null;
  return {
    ...project,
    id: project.id || project._id || project.project_id,
    title: project.title || project.name || 'Project',
    user_name: project.user_name || project.author_name || project.author || 'Author',
    thumbnail_url: project.thumbnail_url || project.thumbnail || project.image || null,
    likes_count: Number(project.likes_count ?? project.likes ?? 0),
    views_count: Number(project.views_count ?? project.views ?? 0),
    created_at: project.created_at || project.createdAt || null,
    category: project.category || project.type || project.topic || '',
    is_free: project.is_free ?? project.isFree ?? (Number(project.price || 0) === 0),
  };
};

function AcademiaProjects() {
  usePublicPageTitle('Projects');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  const activeCategory = searchParams.get('category') || 'all';
  const activeSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get('search') || '';
      const next = searchTerm.trim();
      if (current === next) return;
      const params = new URLSearchParams(searchParams);
      if (next) params.set('search', next);
      else params.delete('search');
      setSearchParams(params, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects`);
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body?.message || 'Failed to load projects.');
        }
        if (!mounted) return;
        const data = Array.isArray(body?.data?.projects)
          ? body.data.projects
          : Array.isArray(body?.data)
            ? body.data
            : (Array.isArray(body) ? body : []);
        setProjects(data.map(normalizeProject).filter(Boolean));
      } catch (error) {
        if (mounted) {
          setProjects([]);
          setFetchError(error.message || 'Failed to load projects. Check your connection and try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  const categoryOptions = useMemo(() => {
    const uniq = new Set();
    projects.forEach((item) => {
      const label = String(item.category || '').trim();
      if (label) uniq.add(label);
    });
    return ['All', ...Array.from(uniq).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'newest') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({}, { replace: true });
  };

  const filteredProjects = useMemo(() => {
    let list = [...projects];
    const query = (searchParams.get('search') || '').trim().toLowerCase();

    if (query) {
      list = list.filter((item) => {
        const haystack = [item.title, item.user_name, item.abstract, item.description, item.category]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (activeCategory !== 'all') {
      const category = activeCategory.replace(/-/g, ' ').toLowerCase();
      list = list.filter((item) => (item.category || '').toLowerCase() === category
        || (item.category || '').toLowerCase().includes(category));
    }

    switch (activeSort) {
      case 'most-viewed':
        list.sort((a, b) => b.views_count - a.views_count);
        break;
      case 'most-liked':
        list.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }

    return list;
  }, [projects, searchParams, activeCategory, activeSort]);

  const activeCategoryLabel = categoryOptions.find((item) => slugify(item) === activeCategory) || 'All';
  const activeSortLabel = SORT_FILTERS.find((item) => slugify(item) === activeSort) || 'Newest';
  const hasActiveFilters = Boolean(
    searchParams.get('search')
    || searchParams.get('category')
    || searchParams.get('sort'),
  );

  const openProject = (projectOrId) => {
    const path = buildProjectPath(projectOrId);
    if (path === '/academia/projects') return;
    navigate(path);
  };

  const resolveImage = (project) => {
    const value = project.thumbnail_url;
    if (!value) return journalImage;
    if (value.startsWith('http')) return value;
    return `${API_BASE_URL}${value}`;
  };

  return (
    <div className="academia-projects-page">
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Projects</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Browse public projects from Academia contributors — open any project for details, images, and discussion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="" />
                <span>{activeCategoryLabel === 'All' ? 'All projects' : activeCategoryLabel}</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {categoryOptions.map((item) => {
                const slug = slugify(item);
                return (
                  <li key={item} className={`dropdown-item${slug === activeCategory ? ' active' : ''}`}>
                    <button type="button" className="dropdown-filter-btn" onClick={() => updateParam('category', slug)}>
                      {item === 'All' ? 'All projects' : item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="div-h-r">
            <div className="div-h-r-s">
              <input
                type="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search projects"
              />
              <div className="div-h-r-s-f">
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="" />
                        <span>{activeSortLabel}</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {SORT_FILTERS.map((item) => {
                        const slug = slugify(item);
                        return (
                          <li key={item} className={`dropdown-item${slug === activeSort ? ' active' : ''}`}>
                            <button type="button" className="dropdown-filter-btn" onClick={() => updateParam('sort', slug)}>
                              {item}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {categoryOptions.length > 1 ? (
          <div className="best-links">
            <div className="best-links-body">
              {categoryOptions.map((tag) => {
                const slug = slugify(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={activeCategory === slug ? 'active' : ''}
                    onClick={() => updateParam('category', slug)}
                  >
                    {tag === 'All' ? 'All' : tag}
                  </button>
                );
              })}
            </div>
            <div className="best-links-end">
              <button type="button" aria-hidden="true" tabIndex={-1} disabled>
                <img src={ddwIcon} alt="" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="main-content-new">
        <div className="main-content-grid">
          {loading && Array.from({ length: 5 }).map((_, index) => (
            <div key={`project-skeleton-${index}`} className="journal skeleton-journal">
              <div className="journal-img skeleton-img" />
              <div className="journal-info">
                <div className="journal-info-h">
                  <div>
                    <span className="skeleton-text skeleton-text-sm" />
                    <span className="skeleton-text skeleton-text-sm" />
                  </div>
                  <div>
                    <div>
                      <button type="button" className="skeleton-btn" />
                    </div>
                  </div>
                </div>
                <div className="journal-info-b">
                  <p className="skeleton-text skeleton-text-lg" />
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredProjects.map((project) => (
            <div
              key={project.id}
              className="journal"
              role="button"
              tabIndex={0}
              onClick={() => openProject(project)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openProject(project);
                }
              }}
            >
              <div className="journal-img">
                <img src={resolveImage(project)} alt={project.title || 'Project'} />
              </div>
              <div className="journal-info">
                <div className="journal-info-h">
                  <div>
                    <span>By</span>
                    <p>{project.user_name}</p>
                  </div>
                  <div>
                    <div>
                      <button type="button" tabIndex={-1} aria-hidden="true">
                        <img src={acHer2Icon} alt="" />
                        <span>{project.likes_count}</span>
                      </button>
                      <button type="button" tabIndex={-1} aria-hidden="true">
                        <img src={acEyeIcon} alt="" />
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
          ))}
        </div>

        {!loading && !fetchError && projects.length === 0 && (
          <PublicEmptyState
            title="No projects yet"
            message="There are no public projects to show right now."
            actionLabel="Back to home"
            actionTo="/academia/index"
          />
        )}

        {!loading && !fetchError && projects.length > 0 && filteredProjects.length === 0 && (
          <PublicEmptyState
            title="No matching projects"
            message="Try clearing your search or choosing a different category."
            actionLabel={hasActiveFilters ? 'Clear filters' : 'Browse projects'}
            onAction={hasActiveFilters ? clearFilters : undefined}
            actionTo={hasActiveFilters ? undefined : '/academia/projects'}
          />
        )}

        {!loading && fetchError ? (
          <div className="public-page-state--inline">
            <PublicLoadError
              title="Could not load projects"
              message={fetchError}
              onRetry={() => setRetryKey((key) => key + 1)}
              backTo="/academia/index"
              backLabel="Back to home"
            />
          </div>
        ) : null}
      </section>

      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
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
              <img src={acSendIcon} alt="Next" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaProjects;
