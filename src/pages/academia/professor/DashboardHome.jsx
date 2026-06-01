import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout'; // Fixed relative path to components
import './dashboard-home.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PAGE_SIZE_OPTIONS = [5, 10, 25];
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const normalizeCourseRow = (row, index) => {
  const id = row?.id ?? row?._id ?? row?.course_id ?? row?.courseId ?? `row-${index}`;
  const title = row?.title || row?.name || row?.course_title || 'Course';
  const status = String(row?.status || 'published').toLowerCase();
  const createdAt = row?.created_at || row?.createdAt || row?.published_at || null;
  const students = Number(row?.students ?? row?.student_count ?? row?.enrollment_count ?? row?.total_students ?? 0);
  const revenue = Number(row?.course_revenue ?? row?.revenue ?? row?.total_revenue ?? 0);
  const rating = row?.avg_rating ?? row?.average_rating ?? row?.rating ?? null;
  const views = Number(row?.views ?? row?.views_count ?? row?.total_views ?? 0);
  const type = row?.type || row?.course_type || row?.category || (status === 'draft' ? 'Draft' : 'Course');

  return {
    ...row,
    id,
    title,
    status,
    createdAt,
    students,
    revenue,
    rating,
    views,
    type,
    searchText: `${title} ${type} ${status}`.toLowerCase(),
  };
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(5);
  const [activePage, setActivePage] = useState(1);
  const [assessmentsRows, setAssessmentsRows] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentsTotal, setAssessmentsTotal] = useState(0);

  // State for Table Checkboxes
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const selectAllRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (mounted) {
            setDashboardData(null);
            setFetchError('Missing login token. Please sign in again.');
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const body = await response.json().catch(() => ({}));
        if (!mounted) return;

        if (response.ok) {
          setDashboardData(body?.data || null);
          setActivePage(1);
        } else {
          setDashboardData(null);
          setFetchError(body?.message || 'Failed to load professor dashboard data.');
        }
      } catch (error) {
        if (mounted) {
          setDashboardData(null);
          setFetchError(error.message || 'Failed to load professor dashboard data.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // Load instructor assessments (table data) separately so pagination and filters work.
  const loadInstructorAssessments = async (targetStatus = statusFilter, limit = pageSize, offset = (activePage - 1) * pageSize) => {
    setAssessmentsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAssessmentsRows([]);
        setAssessmentsTotal(0);
        return;
      }

      const q = new URLSearchParams({ type: targetStatus || 'all', limit: String(limit || 10), offset: String(offset || 0) });
      const res = await fetch(`${API_BASE_URL}/api/instructor/assessments/all?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAssessmentsRows([]);
        setAssessmentsTotal(0);
        return;
      }

      const rows = Array.isArray(body?.data?.assessments) ? body.data.assessments : [];
      const pagination = body?.data?.pagination || {};
      setAssessmentsRows(rows);
      setAssessmentsTotal(pagination.total || rows.length);
    } catch (err) {
      setAssessmentsRows([]);
      setAssessmentsTotal(0);
    } finally {
      setAssessmentsLoading(false);
    }
  };

  useEffect(() => {
    loadInstructorAssessments(statusFilter, pageSize, (activePage - 1) * pageSize);
  }, [statusFilter, pageSize, activePage]);

  const assessmentMetrics = dashboardData?.assessmentMetrics || {};
  const courseRows = useMemo(() => {
    const source = (Array.isArray(assessmentsRows) && assessmentsRows.length > 0) ? assessmentsRows : (Array.isArray(dashboardData?.courseEarnings) && dashboardData.courseEarnings.length > 0 ? dashboardData.courseEarnings : (Array.isArray(dashboardData?.courses) ? dashboardData.courses : []));
    return (source || []).map((row, index) => normalizeCourseRow(row, index));
  }, [assessmentsRows, dashboardData]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return courseRows.filter((row) => {
      const matchesSearch = !normalizedSearch || row.searchText.includes(normalizedSearch);
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courseRows, searchTerm, statusFilter]);

  const totalRecords = (assessmentsTotal && assessmentsTotal > 0) ? assessmentsTotal : filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeActivePage = Math.min(activePage, totalPages);
  const visibleLessonRows = filteredRows.slice(0, pageSize);

  useEffect(() => {
    if (activePage !== safeActivePage) {
      setActivePage(safeActivePage);
    }
  }, [safeActivePage, activePage]);

  const selectedVisibleCount = visibleLessonRows.filter((row) => selectedRowIds.has(String(row.id))).length;
  const isAllSelected = visibleLessonRows.length > 0 && selectedVisibleCount === visibleLessonRows.length;
  const isSomeSelected = selectedVisibleCount > 0 && selectedVisibleCount < visibleLessonRows.length;

  // Handle the "Select All" checkbox
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRowIds((previous) => {
      const next = new Set(previous);

      visibleLessonRows.forEach((row) => {
        const key = String(row.id);
        if (isChecked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });

      return next;
    });
  };

  // Handle individual row checkbox
  const handleSelectRow = (rowId) => {
    setSelectedRowIds((previous) => {
      const next = new Set(previous);
      const key = String(rowId);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const handleQuickAction = (path) => {
    navigate(path);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPageSize(5);
    setActivePage(1);
    setSelectedRowIds(new Set());
  };

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setActivePage(nextPage);
  };

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (safeActivePage === 1) return [1, 2, 3];
    if (safeActivePage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safeActivePage - 1, safeActivePage, safeActivePage + 1];
  }, [safeActivePage, totalPages]);

  const statusLabel = STATUS_FILTERS.find((item) => item.value === statusFilter)?.label || 'All';
  const emptyStateMessage = fetchError
    ? fetchError
    : searchTerm || statusFilter !== 'all'
      ? 'No lessons match the current filters.'
      : 'Your courses and lesson history will appear here once the backend starts sending professor metrics.';

  const renderTableBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" className="prof-table-empty-cell">
            <div className="prof-table-empty">
              <span className="prof-table-empty-badge">Professor dashboard</span>
              <h4>Loading dashboard data</h4>
              <p>Pulling the latest professor metrics from the backend.</p>
            </div>
          </td>
        </tr>
      );
    }

    if (visibleLessonRows.length === 0) {
      return (
        <tr>
          <td colSpan="9" className="prof-table-empty-cell">
            <div className="prof-table-empty">
              <span className="prof-table-empty-badge">Professor dashboard</span>
              <h4>{fetchError ? 'Unable to load data' : 'No dashboard data yet'}</h4>
              <p>{emptyStateMessage}</p>
            </div>
          </td>
        </tr>
      );
    }

    return visibleLessonRows.map((item, index) => (
      <tr key={item.id}>
        <td className="is-checkbox">
          <label className="prof-table-checkbox" aria-label={`Select row #${index + 1}`}>
            <input
              type="checkbox"
              checked={selectedRowIds.has(String(item.id))}
              onChange={() => handleSelectRow(item.id)}
            />
            <span></span>
          </label>
        </td>
        <td className="prof-table-rank">#{(safeActivePage - 1) * pageSize + index + 1}</td>
        <td>
          <div className="prof-table-details">
            <strong>{item.title}</strong>
            <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}</span>
          </div>
        </td>
        <td>
          <div className="prof-table-type">
            <strong>{item.type}</strong>
            <span>{item.students} Students</span>
          </div>
        </td>
        <td>
          <div className="prof-table-students">
            <strong>{item.students}</strong>
            <span><img src="/assets/icons/eye.svg" alt="" /> {item.views} Views</span>
          </div>
        </td>
        <td className="prof-table-score">{item.rating ?? '---'}</td>
        <td className="prof-table-rating">{item.rating ?? '---'} <img src="/assets/icons/star.svg" alt="" /></td>
        <td className="prof-table-profit">{item.revenue.toFixed(1)} USD</td>
        <td className="prof-table-status">
          <span className={`prof-status-pill ${item.status === 'published' ? 'prof-status-pill--ok' : 'prof-status-pill--muted'}`}><span className="dot"></span>{item.status || 'published'}</span>
        </td>
      </tr>
    ));
  };

  // Use effect to handle the 'indeterminate' state (minus sign) for the select all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected && !isAllSelected;
    }
  }, [isSomeSelected, isAllSelected]);

  return (
    <ProfessorLayout currentPage="index">
      <section className="prof-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Home</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/academia/professor/performance" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/performance'); }}>
                <img src="/assets/icons/charts.svg" alt="" />
                <span>View Analytics</span>
              </a>

              <a className="learners-btn learners-btn-primary" href="/academia" onClick={(e) => { e.preventDefault(); navigate('/academia'); }}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        <div className="row g-3">
          <div className="col-12 col-xl-9">
            <div className="prof-stats-row">
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/st1.svg" alt="Growth" />
                    <span>Growth</span>
                  </div>
                  <svg className="prof-stat-sparkline" viewBox="0 0 72 22" aria-hidden="true">
                    <polyline points="2,17 10,19 18,12 26,4 34,14 42,13 50,16 58,12 70,12"></polyline>
                  </svg>
                </div>
                <h3>{loading ? '...' : `+ ${dashboardData?.totalStudents || 0}`}</h3>
                <p>Students In Total</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/pi2.svg" alt="Exams" />
                    <span>Exams</span>
                  </div>
                  <a href="/academia/professor/assignments" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/assignments'); }}>Check Exams</a>
                </div>
                <svg className="prof-stat-sparkline prof-stat-sparkline-red" viewBox="0 0 72 22" aria-hidden="true">
                  <polyline points="2,14 10,16 18,15 26,10 34,11 42,4 50,20 58,6 70,18"></polyline>
                </svg>
                <h3>{loading ? '...' : `${Number(dashboardData?.averageRating || 0).toFixed(2)}`}</h3>
                <p>Average Rating</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/st3.svg" alt="Certificates" />
                    <span>Certificates</span>
                  </div>
                  <a href="/academia/professor/performance" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/performance'); }}>Check Learners</a>
                </div>
                <svg className="prof-stat-sparkline" viewBox="0 0 72 22" aria-hidden="true">
                  <polyline points="2,15 10,19 18,10 26,6 34,10 42,10 50,12 58,10 70,9"></polyline>
                </svg>
                <h3>{loading ? '...' : `${assessmentMetrics.totalCertificatesEarned || 0}`}</h3>
                <p>Total Issued</p>
              </div>
            </div>

            <div className="prof-panel prof-panel--flat">
              <div className="prof-panel-head">
                <h2>Assignments</h2>
                <a className="prof-manage-link" href="#" onClick={preventDefault}>
                  <img src="/assets/icons/book-open.svg" alt="Manage Courses" />
                  <span><img src="/assets/icons/lea1.svg" alt="" /> Manage Courses</span>
                </a>
              </div>

              <div className="prof-assignment-cards">
                <div className="prof-mini-card">
                  <span className="prof-mini-icon" aria-hidden="true"><img src="/assets/icons/as1.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${dashboardData?.totalCourses || 0}`}</h4>
                    <p>Total Assignments</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-success" aria-hidden="true"><img src="/assets/icons/as2.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${assessmentMetrics.passedStudents || 0}`}</h4>
                    <p>Passed Students</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-warn" aria-hidden="true"><img src="/assets/icons/as3.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${assessmentMetrics.totalRetakes || 0}`}</h4>
                    <p>Retakes Taken</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-danger" aria-hidden="true"><img src="/assets/icons/as4.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${assessmentMetrics.failedStudents || 0}`}</h4>
                    <p>Failed Students</p>
                  </div>
                </div>
              </div>

              <div className="prof-quick-head">
                <h2>Quick Actions</h2>
              </div>

              <div className="prof-quick-actions">
                <button type="button" onClick={() => handleQuickAction('/academia/professor/prepare-course')}><span><img src="/assets/icons/ed.svg" alt="" /></span>Prepare Course</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/assignments')}><span><img src="/assets/icons/ed.svg" alt="" /></span>Create Test</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/management')}><span><img src="/assets/icons/ed.svg" alt="" /></span>Prepare Syllabus</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/performance')}><span><img src="/assets/icons/ed.svg" alt="" /></span>Payment History</button>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-3">
            <div className="prof-panel prof-side-panel">
              <div className="prof-calendar-top">
                <div>
                  <h3>Week 2</h3>
                  <p>Wed, March 2026</p>
                </div>
                <button type="button" className="prof-add-event" onClick={preventDefault}><img src="/assets/icons/plus1.svg" alt="" />Add Event</button>
              </div>

              <div className="prof-calendar-surface">
                <div className="prof-calendar-days">
                  <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="prof-calendar-dates">
                  <div className="muted">26</div><div className="muted">27</div><div className="muted">28</div><div>1</div><div>2</div><div>3</div><div className="active">4</div>
                </div>
              </div>

              <div className="prof-calendar-nav" aria-hidden="true">
                <button type="button" onClick={preventDefault}>
                  <img src="/assets/icons/ac-le2.svg" alt="" />
                </button>
                <button type="button" onClick={preventDefault}>
                  <img src="/assets/icons/ac-ri.svg" alt="" />
                </button>
              </div>
            </div>

            <div className="prof-panel prof-side-panel">
              <div className="prof-panel-head">
                <h2>Activities</h2>
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle prof-small-btn" data-bs-toggle="dropdown" aria-expanded="false">
                    <span>This Week</span>
                    <img src="/assets/icons/drop.svg" alt="" />
                  </button>
                  <ul className="dropdown-menu">
                    <li><a className="dropdown-item" href="#" onClick={preventDefault}>Today</a></li>
                    <li><a className="dropdown-item" href="#" onClick={preventDefault}>This Week</a></li>
                    <li><a className="dropdown-item" href="#" onClick={preventDefault}>This Month</a></li>
                  </ul>
                </div>
              </div>
              <div className="prof-activity-row">
                <div className="prof-activity-item">
                  <div className="prof-activity-metric">
                    <span className="prof-activity-value">57</span>
                    <span className="prof-activity-delta prof-activity-delta--up">+1.6%</span>
                  </div>
                  <div className="prof-activity-label">Present</div>
                </div>
                <div className="prof-activity-divider" aria-hidden="true"></div>
                <div className="prof-activity-item">
                  <div className="prof-activity-metric">
                    <span className="prof-activity-value">23</span>
                    <span className="prof-activity-delta prof-activity-delta--down">-0.6%</span>
                  </div>
                  <div className="prof-activity-label">Absent</div>
                </div>
                <div className="prof-activity-divider" aria-hidden="true"></div>
                <div className="prof-activity-item">
                  <div className="prof-activity-metric">
                    <span className="prof-activity-value">3</span>
                    <span className="prof-activity-delta">+0.0%</span>
                  </div>
                  <div className="prof-activity-label">Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prof-notice">
          <div className="prof-notice-icon" aria-hidden="true">
            <img src="/assets/icons/check-circle1.svg" alt="" />
          </div>
          <div className="prof-notice-text">
            <h5>Upgraded to Academia plan</h5>
            <p>Your payment was successful approved. Through using <b>MTN Mobile Money</b>.</p>
          </div>
        </div>

            <div className="prof-panel">
              <div className="prof-panel-head">
                <div>
                  <h2>Lessons History</h2>
                  <p>{loading || assessmentsLoading ? 'Loading professor lessons from backend' : `${totalRecords} lesson${totalRecords === 1 ? '' : 's'} • ${statusLabel} filter`}</p>
                </div>
                <div className="prof-table-actions">
                  <div className="prof-table-search">
                    <img src="/assets/icons/search.svg" alt="" />
                    <input
                      type="search"
                      placeholder="Search lessons..."
                      aria-label="Search Lessons"
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setActivePage(1);
                      }}
                    />
                  </div>

                  <div className="dropdown">
                    <button type="button" className="dropdown-toggle prof-table-btn prof-table-btn--filter" data-bs-toggle="dropdown" aria-expanded="false">
                      <img src="/assets/icons/filters-icon.svg" alt="" />
                      <span>{statusLabel}</span>
                    </button>
                    <ul className="dropdown-menu">
                      {STATUS_FILTERS.map((filter) => (
                        <li key={filter.value}>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                              setStatusFilter(filter.value);
                              setActivePage(1);
                            }}
                          >
                            {filter.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button type="button" className="prof-table-btn" onClick={handleResetFilters}>
                    <span><img src="/assets/icons/plus1.svg" alt="" /> Reset</span>
                  </button>
                </div>
              </div>

          <div className="table-responsive">
            <table className="prof-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select all lessons">
                      <input 
                        type="checkbox" 
                        ref={selectAllRef}
                        checked={isAllSelected}
                        onChange={handleSelectAll} 
                      />
                      <span></span>
                    </label>
                  </th>
                  <th>
                    <span className="prof-table-head-text">Rank</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Assignment Details ({courseRows.length})</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Assignment Type</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Tot. Students</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Avg. Score</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Rating</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th>
                    <span className="prof-table-head-text">Tot. Profits (USD)</span>
                    <img className="prof-table-sort" src="/assets/icons/sorter.svg" alt="" />
                  </th>
                  <th className="prof-table-status-col"></th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>

          <div className="prof-table-footer">
            <div className="prof-table-page-size">
              <span>Show</span>

              <div className="dropdown">
                <button type="button" className="dropdown-toggle prof-table-page-size-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          setPageSize(option);
                          setActivePage(1);
                        }}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <span>per page</span>
            </div>

            <div className="prof-table-pager">
                <div className="prof-table-range">
                {totalRecords === 0 ? '0-0 of 0' : `${(safeActivePage - 1) * pageSize + 1}-${Math.min(safeActivePage * pageSize, totalRecords)} of ${totalRecords}`}
              </div>
              <button type="button" className="prof-table-nav" onClick={() => goToPage(safeActivePage - 1)}>
                <img src="/assets/icons/left1.svg" alt="" />
              </button>
              
              {visiblePageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`prof-table-page ${safeActivePage === pageNumber ? 'is-active' : ''}`}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              
              <button type="button" className="prof-table-nav" onClick={() => goToPage(safeActivePage + 1)}>
                <img src="/assets/icons/right1.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </ProfessorLayout>
  );
};

export default DashboardHome;