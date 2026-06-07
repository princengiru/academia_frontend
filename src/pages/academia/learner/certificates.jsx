import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../../assets/imgs/prof.jpg';
import badge1 from '../../../assets/icons/badge-1.svg';
import searchIcon from '../../../assets/icons/search.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import resumeIcon from '../../../assets/icons/resume.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import playIcon from '../../../assets/icons/play.svg';
import acEye from '../../../assets/icons/ac-eye.svg';
import acShare from '../../../assets/icons/ac-share.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import './certificates.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function normalizeAssetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function formatNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : '0';
}

function formatPercent(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return '0%';
  return `${Math.round(parsed * 10) / 10}%`;
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isInRange(issueDate, selectedRange) {
  if (selectedRange === 'All Time') return true;
  const date = new Date(issueDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (selectedRange === 'This Month') {
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }

  if (selectedRange === 'Last Month') {
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  }

  if (selectedRange === 'This Year') {
    return date.getFullYear() === currentYear;
  }

  return true;
}

function toActionLabel(status) {
  if (status === 'passed') return 'Download';
  if (status === 'failed') return 'Retake';
  return 'Resume';
}

function toActionIcon(status) {
  if (status === 'passed') return downloadIcon;
  if (status === 'failed') return playIcon;
  return resumeIcon;
}

function LearnersCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRange, setSelectedRange] = useState('This Month');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [totalCount, setTotalCount] = useState(0);
  const [serverPages, setServerPages] = useState(1);
  const [stats, setStats] = useState(null);

  const preventDefault = (e) => e.preventDefault();

  const refreshCertificates = async (pageArg = page, pageSizeArg = pageSize) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please sign in to view your certificates.');
    }

    const offset = (Math.max(1, pageArg) - 1) * Math.max(1, pageSizeArg);

    const [statsRes, listRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/certificates/user/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/certificates/user/my-certificates?limit=${pageSizeArg}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const statsBody = await statsRes.json();
    const listBody = await listRes.json();

    if (!statsRes.ok) {
      throw new Error(statsBody?.message || 'Could not load certificate summary');
    }

    if (!listRes.ok) {
      throw new Error(listBody?.message || 'Could not load certificates');
    }

    const listData = listBody?.data ?? listBody;
    const items = Array.isArray(listData?.certificates)
      ? listData.certificates
      : Array.isArray(listData?.data)
        ? listData.data
        : Array.isArray(listData)
          ? listData
          : [];

    const pagination = listData?.pagination || listBody?.pagination || { limit: pageSizeArg, offset, total: items.length, pages: Math.max(1, Math.ceil(items.length / pageSizeArg)) };

    return {
      stats: statsBody?.data ?? statsBody,
      certificates: items,
      pagination,
    };
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const { certificates: items, stats: s, pagination } = await refreshCertificates(page, pageSize);
        if (!cancelled) {
          setCertificates(items);
          setStats(s || null);
          setTotalCount(pagination?.total || 0);
          setServerPages(pagination?.pages || 1);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCertificates([]);
          setError(loadError?.message || 'Could not load certificates right now.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, searchQuery, selectedRange]);

  const summary = useMemo(() => {
    if (stats) {
      return [
        { value: formatNumber(stats.totalCertificates || stats.totalCertificates), label: 'Total Certificates' },
        { value: formatNumber(stats.certificatesThisMonth || 0), label: 'This Month' },
        { value: formatPercent(stats.averageScore || 0), label: 'Average Score' },
        { value: `${Math.round(stats.totalLearningHours || 0)}h`, label: 'Learning Time' },
      ];
    }

    const totalCertificates = certificates.length;
    const thisMonth = certificates.filter((item) => isInRange(item.issueDate, 'This Month')).length;
    const averageScore = totalCertificates
      ? certificates.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / totalCertificates
      : 0;
    const totalHours = certificates.reduce((sum, item) => sum + Number(item.total_hours || item.timeSpent?.hours || 0), 0);

    return [
      { value: formatNumber(totalCertificates), label: 'Total Certificates' },
      { value: formatNumber(thisMonth), label: 'This Month' },
      { value: formatPercent(averageScore), label: 'Average Score' },
      { value: `${Math.round(totalHours)}h`, label: 'Learning Time' },
    ];
  }, [certificates, stats]);

  const genesisOptions = ['This Month', 'Last Month', 'This Year', 'All Time'];

  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return certificates.filter((item) => {
      const title = String(item.courseTitle || item.courseName || '').toLowerCase();
      const certificateNumber = String(item.certificateNumber || '').toLowerCase();
      const studentName = String(item.student?.name || '').toLowerCase();
      const matchesQuery = !query || title.includes(query) || certificateNumber.includes(query) || studentName.includes(query);
      return matchesQuery && isInRange(item.issueDate, selectedRange);
    });
  }, [certificates, searchQuery, selectedRange]);

  const totalPages = Math.max(1, serverPages || Math.ceil((totalCount || 0) / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
    if ((certificates || []).length === 0 && totalCount === 0) {
      setPage(1);
    }
  }, [page, totalPages, certificates.length, totalCount]);

  const visibleCertificates = useMemo(() => filteredCertificates, [filteredCertificates]);

  const firstCertificate = certificates[0] || null;
  const apexProfile = {
    name: firstCertificate?.student?.name || 'My Certificates',
    role: 'Learner',
    email: firstCertificate?.student?.email || 'Authenticated certificate record',
    avatar: normalizeAssetUrl(firstCertificate?.student?.avatar) || profImg,
    status: loading ? 'loading...' : certificates.length ? 'Active' : 'empty',
    projects: formatNumber(certificates.length),
  };

  const handleRetryLoad = async () => {
    setLoading(true);
    setError('');

    try {
      const { certificates: items } = await refreshCertificates();
      setCertificates(items);
    } catch (loadError) {
      setCertificates([]);
      setError(loadError?.message || 'Could not load certificates right now.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryAction = (certificate) => {
    if (certificate?.status === 'passed' && certificate?.certificateNumber) {
      window.open(`${API_BASE_URL}/api/certificates/${certificate.certificateNumber}/download`, '_blank', 'noopener,noreferrer');
      return;
    }

    navigate('/academia/learner/courses');
  };

  const handleViewCertificate = (certificate) => {
    if (!certificate?.certificateNumber) return;
    window.open(`${API_BASE_URL}/api/certificates/${certificate.certificateNumber}/download`, '_blank', 'noopener,noreferrer');
  };

  const handleShareCertificate = async (certificate) => {
    if (!certificate?.certificateNumber) return;

    const url = `${API_BASE_URL}/api/certificates/verify/${certificate.certificateNumber}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: certificate.courseTitle || 'Certificate', url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // Silent fallback: the page still works without sharing support.
    }
  };

  const handlePage = (value) => setPage(Math.min(Math.max(1, value), totalPages));

  return (
    <LearnersPageShell>
      <section className="learners-certificates-page">
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
                <span>{apexProfile.role}</span>
                <span>&bull;</span>
                <span>{apexProfile.email}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/learner/courses')}>
              Earn certificates
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/learner/account')}>
              View Profile
            </button>
          </div>
        </section>

        <section className="learners-certificates-summary">
          {summary.map((item, idx) => (
            <article key={idx} className="learners-certificates-summary-card">
              <strong>{item.value}</strong>
              <div className="learners-certificates-summary-meta">
                <span>{item.label}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="learners-certificates-section-head">
          <div>
            <h2>My Certificates</h2>
            <p>{loading ? 'Loading certificates from the backend...' : `${formatNumber(totalCount)} certificates available`}</p>
          </div>

          <div className="learners-certificates-filters">
            <label className="learners-certificates-search">
              <img src={searchIcon} alt="Search" />
              <input
                type="search"
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className="dropdown learners-certificates-filter-dropdown">
              <button
                className="dropdown-toggle learners-certificates-filter-btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span>{selectedRange}</span>
                <img src={drop1} alt="Dropdown" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end learners-certificates-filter-menu">
                {genesisOptions.map((option) => (
                  <li key={option}>
                    <a
                      className={`dropdown-item ${selectedRange === option ? 'active' : ''}`}
                      href="/"
                      onClick={(event) => {
                        preventDefault(event);
                        setSelectedRange(option);
                        setPage(1);
                      }}
                    >
                      {option}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="learners-certificates-empty-state">
            <h3>Loading certificates...</h3>
            <p>Fetching your earned certificates and progress from the backend.</p>
          </div>
        ) : error ? (
          <div className="learners-certificates-empty-state learners-certificates-empty-state--error">
            <h3>Certificates could not load</h3>
            <p>{error}</p>
            <div className="learners-certificates-empty-actions">
              <button type="button" className="learners-projects-primary-btn" onClick={handleRetryLoad}>
                Retry
              </button>
              <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/learner/courses')}>
                Browse courses
              </button>
            </div>
          </div>
        ) : visibleCertificates.length > 0 ? (
          <>
            <section className="learners-certificates-grid">
              {visibleCertificates.map((certificate, idx) => {
                const status = certificate.status || 'pending';
                const primaryAction = toActionLabel(status);
                const primaryIcon = toActionIcon(status);
                const title = certificate.courseTitle || certificate.courseName || 'Certificate';
                const issueDate = certificate.issueDate ? `Completed on ${formatDate(certificate.issueDate)}` : 'Date unavailable';
                const score = certificate.finalScore !== undefined && certificate.finalScore !== null ? formatPercent(certificate.finalScore) : '0%';
                const questions = certificate.totalQuestions ?? certificate.total_questions ?? 0;
                const timeSpent = certificate.timeSpent?.display || `${Math.round(Number(certificate.total_hours || 0))}h`;

                return (
                  <article key={certificate.id || idx} className="learners-certificate-card">
                    <div className="learners-certificate-card-banner">
                      <div className="learners-certificate-card-badge-pill">
                        <span>{score}</span>
                      </div>
                      <div className="learners-certificate-card-banner-copy">
                        <span>Proudly presented to</span>
                        <h3>Dear, {apexProfile.name}</h3>
                      </div>
                    </div>

                    <div className="learners-certificate-card-body">
                      <div className="learners-certificate-card-title-block">
                        <h4>{title}</h4>
                        <p>{issueDate}</p>
                      </div>

                      <div className="learners-certificate-card-stats">
                        <div>
                          <strong>{score}</strong>
                          <span>Score</span>
                        </div>
                        <div>
                          <strong>{formatNumber(questions)}</strong>
                          <span>Questions</span>
                        </div>
                        <div>
                          <strong>{timeSpent}</strong>
                          <span>Time</span>
                        </div>
                        <div>
                          <p className={`learners-certificate-status ${status === 'passed' ? 'is-passed' : status === 'failed' ? 'is-failed' : 'is-progress'}`}>
                            {status === 'passed' ? 'Passed' : status === 'failed' ? 'Failed' : 'In Progress'}
                          </p>
                          <span>Status</span>
                        </div>
                      </div>

                      <div className="learners-certificate-card-actions">
                        <button type="button" className="is-primary" onClick={() => handleViewCertificate(certificate)}>
                          <img src={acEye} alt="View" />
                          <span>View</span>
                        </button>
                        <button type="button" onClick={() => handlePrimaryAction(certificate)}>
                          <img src={primaryIcon} alt={primaryAction} />
                          <span>{primaryAction}</span>
                        </button>
                        <button type="button" onClick={() => handleShareCertificate(certificate)}>
                          <img src={acShare} alt="Share" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <div className="learners-certificates-pagination">
                <button type="button" onClick={() => handlePage(page - 1)} aria-label="Previous page" disabled={page <= 1}>
                  <img src={acLe2} alt="Previous" />
                </button>
                <span>{page}</span>
                <span>of</span>
                <span className="active">{totalPages}</span>
                <button type="button" onClick={() => handlePage(page + 1)} aria-label="Next page" disabled={page >= totalPages}>
                  <img src={acRi} alt="Next" />
                </button>
            </div>
          </>
        ) : (
          <div className="learners-certificates-empty-state">
            <h3>No certificates yet</h3>
            <p>Complete a course or assessment and your certificates will appear here.</p>
            <div className="learners-certificates-empty-actions">
              <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/learner/courses')}>
                Browse courses
              </button>
              <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/academia/learner/projects')}>
                View projects
              </button>
            </div>
          </div>
        )}
      </section>
    </LearnersPageShell>
  );
}

export default LearnersCertificates;
