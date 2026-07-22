import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import { BookOpen, CalendarPlus, ClipboardCheck, FileText, Wallet } from 'lucide-react';
import './dashboard-home.css';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import { AcademiaDataTable, AcademiaStatusPill } from '../shared';

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
  };
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const { currency, setCurrency, formatAmount, formatRaw } = useCurrency();
  const [openFlagDropdown, setOpenFlagDropdown] = useState(false);
  const flagRef = useRef(null);

  // --- OVERALL DASHBOARD STATE ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // --- TABLE / FILTER / PAGINATION STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(5);
  const [activePage, setActivePage] = useState(1);
  const [assessmentsRows, setAssessmentsRows] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [assessmentsTotal, setAssessmentsTotal] = useState(0);
  const [assessmentsError, setAssessmentsError] = useState('');
  const [assessmentsReloadKey, setAssessmentsReloadKey] = useState(0);


  // 1. Debounce the search term to prevent API spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setActivePage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (flagRef.current && !flagRef.current.contains(event.target)) {
        setOpenFlagDropdown(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const loadDashboard = useCallback(async (signal) => {
    const token = localStorage.getItem('token');

    if (!token) {
      setFetchError('Missing login token. Please sign in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      const body = await response.json();
      if (response.ok) {
        setDashboardData(body?.data || null);
      } else {
        setFetchError(body?.message || 'Failed to load professor dashboard data.');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setFetchError(error.message || 'Network error.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Load top-level dashboard metrics (Cards & Stats)
  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal);
    return () => controller.abort();
  }, [loadDashboard, reloadKey]);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    if (!token) {
      setEventsLoading(false);
      setUpcomingEvents([]);
      return undefined;
    }

    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/created/my?limit=3&sort=upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const body = await res.json();
        if (res.ok) {
          setUpcomingEvents(Array.isArray(body?.data) ? body.data : []);
        } else {
          setUpcomingEvents([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setUpcomingEvents([]);
        }
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
    return () => controller.abort();
  }, [reloadKey]);

  // 3. Load Table Data with Server-Side Pagination & Filtering
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const loadTableData = async () => {
      if (!token) return;
      
      setAssessmentsLoading(true);
      setAssessmentsError('');
      try {
        const offset = (activePage - 1) * pageSize;
        const q = new URLSearchParams({
          type: statusFilter,
          limit: String(pageSize),
          offset: String(offset),
          search: debouncedSearch.trim(), // Send search to backend
        });

        const res = await fetch(`${API_BASE_URL}/api/instructor/assessments/all?${q.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const body = await res.json();
        if (res.ok) {
          const rows = Array.isArray(body?.data?.assessments) ? body.data.assessments : [];
          setAssessmentsRows(rows);
          setAssessmentsTotal(body?.data?.pagination?.total || rows.length);
        } else {
          setAssessmentsRows([]);
          setAssessmentsTotal(0);
          setAssessmentsError(body?.message || body?.error?.message || 'Could not load lesson history.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setAssessmentsRows([]);
          setAssessmentsTotal(0);
          setAssessmentsError(err.message || 'Could not load lesson history.');
        }
      } finally {
        setAssessmentsLoading(false);
      }
    };

    loadTableData();
    return () => controller.abort(); // Cancel previous request if user clicks fast
  }, [statusFilter, pageSize, activePage, debouncedSearch, assessmentsReloadKey]);

  // Normalize current page rows (+ optional client sort of the loaded page)
  const courseRowsRaw = useMemo(() => {
    return assessmentsRows.map((row, index) => normalizeCourseRow(row, index));
  }, [assessmentsRows]);

  const [tableSort, setTableSort] = useState({ key: null, direction: 'asc' });
  const handleTableSort = (key) => {
    setTableSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const courseRows = useMemo(() => {
    if (!tableSort.key) return courseRowsRaw;
    const key = tableSort.key;
    const numeric = ['students', 'views', 'revenue', 'rating'];
    return [...courseRowsRaw].sort((a, b) => {
      let aVal = a?.[key];
      let bVal = b?.[key];
      if (numeric.includes(key)) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return tableSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return tableSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [courseRowsRaw, tableSort]);

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(assessmentsTotal / pageSize));
  
  // Calculate Pagination Window (e.g., [1, 2, 3] or [4, 5, 6])
  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (activePage === 1) return [1, 2, 3];
    if (activePage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [activePage - 1, activePage, activePage + 1];
  }, [activePage, totalPages]);

  // --- HANDLERS ---
  const handleQuickAction = (path) => navigate(path);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setPageSize(5);
    setActivePage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setActivePage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setActivePage(1);
  };

  const goToPage = (page) => {
    setActivePage(Math.min(Math.max(page, 1), totalPages));
  };

  // --- RENDERING HELPERS ---
  const assessmentMetrics = dashboardData?.assessmentMetrics || {};
  const statusLabel = STATUS_FILTERS.find((item) => item.value === statusFilter)?.label || 'All';

  const courseRevenueTotal = useMemo(() => {
    // Prefer invoice total from dashboard; fall back to sum of per-course invoice earnings
    const fromDashboard = Number(dashboardData?.totalRevenue);
    if (Number.isFinite(fromDashboard) && fromDashboard > 0) return fromDashboard;
    const earnings = Array.isArray(dashboardData?.courseEarnings) ? dashboardData.courseEarnings : [];
    return earnings.reduce((sum, item) => sum + Number(item.course_revenue || 0), 0);
  }, [dashboardData]);

  const schedulePreview = useMemo(() => (
    upcomingEvents.slice(0, 1).map((ev) => {
      const date = new Date(ev.event_datetime || ev.createdAt);
      return {
        id: ev.id || ev._id,
        day: String(date.getDate()).padStart(2, '0'),
        month: date.toLocaleDateString(undefined, { month: 'short' }),
        title: ev.name || ev.title || 'Event',
        meta: ev.subtitle || 'Scheduled session',
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: ev.status === 'online' ? 'Online' : 'In person',
      };
    })
  ), [upcomingEvents]);


  const rangeLabel = assessmentsTotal === 0
    ? '0'
    : `${(activePage - 1) * pageSize + 1}-${Math.min(activePage * pageSize, assessmentsTotal)}`;

  return (
      <section className="prof-page">
        {/* --- HEADER --- */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Home</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/academia/professor/performance" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/performance'); }}>
                <img src="/assets/icons/charts.svg" alt="" />
                <span>View Analytics</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {fetchError ? (
          <LearnerLoadError
            title="Could not load dashboard"
            message={fetchError}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : null}

        {!fetchError ? (
        <div className="row g-3">
          {/* --- MAIN CONTENT (LEFT COLUMN) --- */}
          <div className="col-12 col-xl-9">
            {/* STAT CARDS */}
            <div className="prof-stats-row">
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/st1.svg" alt="Growth" />
                    <span>Growth</span>
                  </div>
                  <svg className="prof-stat-sparkline" viewBox="0 0 72 22"><polyline points="2,17 10,19 18,12 26,4 34,14 42,13 50,16 58,12 70,12"></polyline></svg>
                </div>
                <h3>{loading ? '...' : `+ ${dashboardData?.totalStudents || 0}`}</h3>
                <p>Students In Total</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/pi2.svg" alt="Rating" />
                    <span>Rating</span>
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/performance'); }}>View performance</a>
                </div>
                <svg className="prof-stat-sparkline prof-stat-sparkline-red" viewBox="0 0 72 22"><polyline points="2,14 10,16 18,15 26,10 34,11 42,4 50,20 58,6 70,18"></polyline></svg>
                <h3>{loading ? '...' : `${Number(dashboardData?.averageRating || 0).toFixed(2)}`}</h3>
                <p>Average Rating</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/st3.svg" alt="Certificates" />
                    <span>Certificates</span>
                  </div>
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/performance'); }}>View certificates</a>
                </div>
                <svg className="prof-stat-sparkline" viewBox="0 0 72 22"><polyline points="2,15 10,19 18,10 26,6 34,10 42,10 50,12 58,10 70,9"></polyline></svg>
                <h3>{loading ? '...' : `${assessmentMetrics.totalCertificatesEarned || 0}`}</h3>
                <p>Total Issued</p>
              </div>
            </div>

            {/* ASSIGNMENTS PANEL */}
            <div className="prof-panel prof-panel--flat">
              <div className="prof-panel-head">
                <h2>Assignments</h2>
                <button type="button" className="prof-manage-link" onClick={() => navigate('/academia/professor/management')}>
                  <img src="/assets/icons/book-open.svg" alt="Manage Courses" />
                  <span><img src="/assets/icons/lea1.svg" alt="" /> Manage Courses</span>
                </button>
              </div>

              <div className="prof-assignment-cards">
                <div className="prof-mini-card">
                  <span className="prof-mini-icon"><img src="/assets/icons/as1.svg" alt="" /></span>
                  <div>
                    <h4>{loading || assessmentsLoading ? '...' : `${assessmentsTotal}`}</h4>
                    <p>Total Assignments</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-success"><img src="/assets/icons/as2.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${assessmentMetrics.passedStudents || 0}`}</h4>
                    <p>Passed Students</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-warn"><img src="/assets/icons/as3.svg" alt="" /></span>
                  <div>
                    <h4>{loading ? '...' : `${assessmentMetrics.totalRetakes || 0}`}</h4>
                    <p>Retakes Taken</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-danger"><img src="/assets/icons/as4.svg" alt="" /></span>
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
                <button type="button" onClick={() => handleQuickAction('/academia/professor/prepare-course')}><span><BookOpen size={16} strokeWidth={1.8} aria-hidden="true" /></span>Prepare Course</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/assignments')}><span><ClipboardCheck size={16} strokeWidth={1.8} aria-hidden="true" /></span>Create Test</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/prepare-syllabus')}><span><FileText size={16} strokeWidth={1.8} aria-hidden="true" /></span>Prepare Syllabus</button>
                <button type="button" onClick={() => handleQuickAction('/academia/professor/earnings')}><span><Wallet size={16} strokeWidth={1.8} aria-hidden="true" /></span>Payment History</button>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR (RIGHT COLUMN) --- */}
          <div className="col-12 col-xl-3">
            <div className="prof-panel prof-side-panel">
              <div className="prof-panel-head">
                <h2>Schedule</h2>
                <button type="button" className="prof-manage-link" onClick={() => navigate('/academia/professor/management-schedule')}>
                  See all
                </button>
              </div>

              <div className="prof-dashboard-schedule-list">
                {eventsLoading ? (
                  <ManagementLoading compact title="Loading events" message="Fetching your upcoming schedule." />
                ) : schedulePreview.length > 0 ? (
                  schedulePreview.map((item) => (
                    <article key={item.id || `${item.title}-${item.time}`} className="prof-dashboard-schedule-item">
                      <div className="prof-dashboard-schedule-date">
                        <strong>{item.day}</strong>
                        <span>{item.month}</span>
                      </div>
                      <div className="prof-dashboard-schedule-copy">
                        <h4>{item.title}</h4>
                        <p>{item.meta}</p>
                        <div className="prof-dashboard-schedule-meta">
                          <span>{item.time}</span>
                          <span>{item.status}</span>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="prof-dashboard-schedule-empty">No upcoming events. Open the schedule to create one.</p>
                )}
              </div>

              <button
                type="button"
                className="prof-add-event"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/academia/professor/management-schedule')}
              >
                <CalendarPlus size={16} strokeWidth={1.8} aria-hidden="true" />
                Open schedule
              </button>
            </div>

            <div className="prof-panel prof-side-panel">
              <div className="prof-panel-head">
                <h2>Analytics</h2>
                <button type="button" className="prof-manage-link" onClick={() => navigate('/academia/professor/performance')}>
                  View all
                </button>
              </div>

              <div className="prof-revenue-box">
                <div className="prof-revenue-amount">
                  <strong>
                    {loading
                      ? '…'
                      : courseRevenueTotal > 0
                        ? formatRaw(courseRevenueTotal)
                        : '—'}
                  </strong>
                  <span className="prof-currency-dropdown" ref={flagRef}>
                    <button
                      type="button"
                      className="prof-currency-trigger"
                      onClick={() => setOpenFlagDropdown((open) => !open)}
                      aria-expanded={openFlagDropdown}
                    >
                      <span>{currency.label}</span>
                      <img src={currency.flag} alt="" />
                      <img src={hoadowncaret} alt="" className="prof-currency-caret" />
                    </button>
                    {openFlagDropdown ? (
                      <div className="prof-currency-menu" role="listbox">
                        {flagOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            className={`prof-currency-option ${currency.label === option.label ? 'active' : ''}`}
                            onClick={() => {
                              setCurrency(option);
                              setOpenFlagDropdown(false);
                            }}
                          >
                            <img src={option.flag} alt="" />
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </span>
                </div>
                <p>Total Revenue</p>
              </div>

              <button
                type="button"
                className="prof-add-event"
                style={{ marginTop: 16 }}
                onClick={() => navigate('/academia/professor/earnings')}
              >
                <Wallet size={16} strokeWidth={1.8} aria-hidden="true" />
                View earnings
              </button>
            </div>
          </div>
        </div>
        ) : null}

        <AcademiaDataTable
          title="Lessons History"
          subtitle={assessmentsLoading ? 'Loading records...' : `${assessmentsTotal} record${assessmentsTotal === 1 ? '' : 's'} • ${statusLabel}`}
          searchPlaceholder="Search lessons..."
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          filters={STATUS_FILTERS.map((item) => ({ id: item.value, label: item.label }))}
          activeFilter={statusFilter}
          onFilterChange={handleStatusChange}
          defaultFilterLabel="Filters"
          toolbarExtra={(
            <button type="button" className="adt-btn-light-purple" onClick={handleResetFilters}>
              Reset
            </button>
          )}
          columns={[
            {
              key: 'rank',
              label: 'Rank',
              renderCell: (row) => {
                const idx = courseRows.findIndex((r) => String(r.id) === String(row.id));
                return `#${(activePage - 1) * pageSize + Math.max(idx, 0) + 1}`;
              },
            },
            {
              key: 'title',
              label: 'Assignment Details',
              sortable: true,
              renderCell: (row) => (
                <div>
                  <div className="adt-fw-600">{row.title}</div>
                  <p className="adt-muted">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recently'}</p>
                </div>
              ),
            },
            {
              key: 'type',
              label: 'Assignment Type',
              sortable: true,
              renderCell: (row) => (
                <div>
                  <div className="adt-fw-600">{row.type}</div>
                  <p className="adt-muted">{row.students} Students</p>
                </div>
              ),
            },
            {
              key: 'students',
              label: 'Tot. Students',
              sortable: true,
              renderCell: (row) => (
                <div>
                  <div className="adt-fw-600">{row.students}</div>
                  <p className="adt-muted">{row.views} Views</p>
                </div>
              ),
            },
            {
              key: 'rating',
              label: 'Avg. Score',
              sortable: true,
              renderCell: (row) => row.rating ?? '---',
            },
            {
              key: 'ratingDisplay',
              label: 'Rating',
              renderCell: (row) => row.rating ?? '---',
            },
            {
              key: 'revenue',
              label: 'Tot. Profits',
              sortable: true,
              renderCell: (row) => (row.revenue > 0 ? formatAmount(row.revenue) : '—'),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              renderCell: (row) => (
                <AcademiaStatusPill tone={row.status === 'published' ? 'green' : 'gray'}>
                  {row.status || 'published'}
                </AcademiaStatusPill>
              ),
            },
          ]}
          rows={courseRows}
          getRowKey={(row) => row.id}
          sortConfig={tableSort}
          onSort={handleTableSort}
          loading={assessmentsLoading && courseRows.length === 0}
          error={assessmentsError && !assessmentsLoading ? assessmentsError : ''}
          onRetry={() => setAssessmentsReloadKey((key) => key + 1)}
          emptyTitle="No records found"
          emptyMessage={searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Your history will appear here once data is available.'}
          loadingMessage="Fetching your latest lesson history."
          pageSize={String(pageSize)}
          pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
          onPageSizeChange={(size) => handlePageSizeChange(Number(size))}
          currentPage={activePage}
          totalPages={totalPages}
          totalItems={assessmentsTotal}
          rangeLabel={rangeLabel}
          onGoToPage={goToPage}
          visiblePageNumbers={visiblePageNumbers}
        />

      </section>
  );
};

export default DashboardHome;