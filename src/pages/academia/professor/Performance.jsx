import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './performance.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const normalizePaymentRow = (row, index) => ({
  id: row?.id ?? row?._id ?? `pay-${index}`,
  course: row?.course_name || row?.courseTitle || row?.course || 'Unknown Course',
  date: row?.created_at || row?.date ? new Date(row?.created_at || row?.date).toLocaleDateString() : 'N/A',
  reason: row?.reason || row?.payment_type || 'Course Purchase',
  payee: row?.payee_name || row?.student_name || row?.payee || 'Unknown Student',
  country: row?.country || row?.student_country || 'N/A',
  grossPaid: row?.gross_paid || row?.amount || row?.grossPaid || '---',
  fee: row?.fee || row?.platform_fee || '---',
  netPaid: row?.net_paid || row?.net_amount || row?.netPaid || '---',
  status: row?.status || 'Pending',
  statusTone: String(row?.status || '').toLowerCase() === 'paid' || String(row?.status || '').toLowerCase() === 'completed' ? 'passed' : 'progress',
});

const Performance = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Global UI State ---
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // --- Payment History State ---
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [totalPayments, setTotalPayments] = useState(0);
  const [paymentPeriod, setPaymentPeriod] = useState('Today');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All Statuses');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const selectAllRef = useRef(null);

  // --- Chart UI State ---
  const [chartPeriod, setChartPeriod] = useState('Monthly');

  // --- Fetch Analytics (Stats & Charts) ---
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const fetchAnalytics = async () => {
      if (!token) return;
      setAnalyticsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/instructor/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const body = await res.json();
        if (res.ok) setAnalytics(body?.data || {});
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to load analytics:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
    return () => controller.abort();
  }, []);

  // --- Fetch Events (Schedule) ---
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const fetchEvents = async () => {
      if (!token) return;
      setEventsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/created/my?limit=5&sort=upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const body = await res.json();
        if (res.ok) setEvents(Array.isArray(body?.data) ? body.data : []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to load events:', err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
    return () => controller.abort();
  }, []);

  // --- Fetch Payment History ---
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const fetchPayments = async () => {
      if (!token) return;
      setPaymentsLoading(true);
      try {
        const offset = (currentPage - 1) * pageSize;
        const q = new URLSearchParams({
          limit: String(pageSize),
          offset: String(offset),
          period: paymentPeriod.toLowerCase().replace(' ', '_'),
        });
        if (paymentStatusFilter !== 'All Statuses') {
          q.set('status', paymentStatusFilter.toLowerCase().replace(' ', '_'));
        }

        const res = await fetch(`${API_BASE_URL}/api/instructor/payment-history?${q.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        const body = await res.json();
        
        if (res.ok) {
          const rawPayments = Array.isArray(body?.data?.payments) ? body.data.payments : (Array.isArray(body?.data) ? body.data : []);
          setPayments(rawPayments.map(normalizePaymentRow));
          setTotalPayments(body?.data?.pagination?.total || rawPayments.length);
          setSelectedRowIds(new Set()); // Reset selections on page change
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to load payments:', err);
      } finally {
        setPaymentsLoading(false);
      }
    };
    fetchPayments();
    return () => controller.abort();
  }, [currentPage, pageSize, paymentPeriod, paymentStatusFilter]);

  // --- Derived Analytics State ---
  const performanceStats = useMemo(() => [
    { value: `${analytics?.totalRevenue || 0} USD`, label: 'Total Paid', trend: analytics?.revenueTrend, trendTone: (analytics?.revenueTrend || '').includes('-') ? 'down' : 'up' },
    { value: `${analytics?.courseRevenue || 0} USD`, label: 'Course Payments' },
    { value: `${analytics?.syllabusRevenue || 0} USD`, label: 'Syllabus Payment' },
    { value: `${analytics?.averageScore || 0}%`, label: 'Average Score', trend: analytics?.scoreTrend, trendTone: (analytics?.scoreTrend || '').includes('-') ? 'down' : 'up' },
    { value: `${analytics?.certificatesIssued || 0}`, label: 'Certificates Approved' },
  ], [analytics]);

  const weeklySchedule = useMemo(() => {
    return events.slice(0, 4).map(ev => {
      const d = new Date(ev.event_datetime || ev.createdAt);
      return {
        date: String(d.getDate()).padStart(2, '0'),
        title: ev.name || ev.title || 'Event',
        meta: ev.subtitle || 'Scheduled Event',
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: ev.status === 'online' ? 'Online meeting' : 'Read',
        statusTone: ev.status === 'online' ? 'meeting' : 'read'
      };
    });
  }, [events]);

  // --- Bar Chart Logic ---
  const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartSyllabusValues = analytics?.chartSyllabus || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const chartOnlineValues = analytics?.chartOnline || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const chartMax = Math.max(10, ...chartSyllabusValues, ...chartOnlineValues) * 1.1; // Dynamic ceiling

  // Check if chart actually has data to display vs being totally flat
  const hasChartData = chartSyllabusValues.some(v => v > 0) || chartOnlineValues.some(v => v > 0);

  const [activeBarIndex, setActiveBarIndex] = useState(new Date().getMonth());
  const chartWrapRef = useRef(null);

  const handleBarHover = (index) => setActiveBarIndex(index);

  const handleChartMouseMove = (e) => {
    if (!chartWrapRef.current || !hasChartData) return;
    const canvasRect = chartWrapRef.current.getBoundingClientRect();
    const localX = e.clientX - canvasRect.left;
    const width = canvasRect.width;
    let closestIndex = Math.floor((localX / width) * chartMonths.length);
    closestIndex = Math.max(0, Math.min(closestIndex, chartMonths.length - 1));
    setActiveBarIndex(closestIndex);
  };

  const handleChartMouseLeave = () => setActiveBarIndex(new Date().getMonth());

  // --- Donut Chart Logic ---
  const donutRef = useRef(null);
  const [donutTooltip, setDonutTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });
  const donutStats = {
    failed: analytics?.failedCount || 0,
    tried: analytics?.triedCount || 0,
    passed: analytics?.passedCount || 0,
  };
  const totalDonut = Math.max(1, donutStats.failed + donutStats.tried + donutStats.passed);
  const hasDonutData = donutStats.failed > 0 || donutStats.tried > 0 || donutStats.passed > 0;

  const performanceLegend = [
    { color: '#F23C72', range: '0-59', status: `FAIL (${donutStats.failed})` },
    { color: '#F2C335', range: '60 - 79', status: `TRIED (${donutStats.tried})` },
    { color: '#22C55E', range: '80 - 100', status: `PASS (${donutStats.passed})` },
  ];

  const handleDonutMove = (e) => {
    if (!donutRef.current || !hasDonutData) return;
    const rect = donutRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const outerRadius = rect.width / 2;
    const innerRadius = outerRadius - 16;

    if (radius < innerRadius || radius > outerRadius) {
      setDonutTooltip({ ...donutTooltip, visible: false });
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const normalized = (angle + 450) % 360;
    const percent = normalized / 3.6;
    
    const failPct = (donutStats.failed / totalDonut) * 100;
    const triedPct = (donutStats.tried / totalDonut) * 100;

    let label = '';
    if (percent >= 0 && percent < failPct) label = `${donutStats.failed} Failed`;
    else if (percent >= failPct && percent < (failPct + triedPct)) label = `${donutStats.tried} Tried`;
    else label = `${donutStats.passed} Passed`;

    const wrapRect = donutRef.current.parentElement.getBoundingClientRect();
    setDonutTooltip({
      visible: true,
      text: label,
      x: e.clientX - wrapRect.left + 4,
      y: e.clientY - wrapRect.top,
    });
  };

  const handleDonutLeave = () => setDonutTooltip({ ...donutTooltip, visible: false });

  // --- Payment Table Logic ---
  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize));

  // Determine checkbox states
  const isAllVisibleSelected = payments.length > 0 && payments.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = payments.some(row => selectedRowIds.has(row.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      payments.forEach(row => isChecked ? next.add(row.id) : next.delete(row.id));
      return next;
    });
  };

  const handleSelectRow = (id) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ProfessorLayout currentPage="performance">
      <section className="learners-performance-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Analytics & Payments</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/ac-sav.svg" alt="" />
                <span>Saved Library</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/academia">
                <span>Go to website</span>
                <img src="/assets/icons/w-exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        {/* Top KPI Stats */}
        <section className="learners-performance-stats-card" aria-label="Performance summary">
          {performanceStats.map((stat, index) => (
            <article key={index} className={`learners-performance-stat ${index < performanceStats.length - 1 ? 'has-divider' : ''}`}>
              <strong>{analyticsLoading ? '...' : stat.value}</strong>
              <div className="learners-performance-stat-meta">
                <span>{stat.label}</span>
                {stat.trend && !analyticsLoading && (
                  <small className={`learners-performance-stat-trend is-${stat.trendTone}`}>
                    <i aria-hidden="true">{stat.trendTone === 'up' ? '↗' : '↘'}</i>
                    <span>{stat.trend}</span>
                  </small>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="learners-performance-board">
          <div className="learners-performance-board-main">
            <div className="learners-performance-panel-head">
              <div>
                <h2>Performance Statistics</h2>
                <p>Course Available to learn</p>
              </div>
            </div>

            <div className="learners-performance-board-grid">
              
              {/* --- Bar Chart Area --- */}
              <section className="learners-performance-chart-card">
                <div className="learners-performance-chart-top">
                  <div className="learners-performance-chart-badge-row">
                    <span className="learners-performance-score-badge">{analytics?.averageScore || 0}%</span>
                    <h3>Average score</h3>
                  </div>

                  <div className="dropdown learners-performance-period-dropdown">
                    <button className="dropdown-toggle learners-performance-period-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span>{chartPeriod}</span>
                      <img src="/assets/icons/drop1.svg" alt="" />
                    </button>
                    <ul className="dropdown-menu learners-performance-period-menu">
                      <li><a className={`dropdown-item ${chartPeriod === 'Monthly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setChartPeriod('Monthly'); }}>Monthly</a></li>
                      <li><a className={`dropdown-item ${chartPeriod === 'Weekly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setChartPeriod('Weekly'); }}>Weekly</a></li>
                      <li><a className={`dropdown-item ${chartPeriod === 'Quarterly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setChartPeriod('Quarterly'); }}>Quarterly</a></li>
                    </ul>
                  </div>
                </div>

                {!hasChartData && !analyticsLoading ? (
                  <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', minHeight: '260px' }}>
                    <h3>No chart data yet</h3>
                    <p>Your performance trends will show up after students interact with your courses.</p>
                  </div>
                ) : (
                  <>
                    <div className="learners-performance-chart-wrap">
                      <div className="learners-performance-chart-yaxis">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i}>{Math.round(chartMax - (i * (chartMax / 5)))}</span>
                        ))}
                      </div>

                      <div 
                        className="learners-performance-chart-canvas" 
                        ref={chartWrapRef}
                        onMouseMove={handleChartMouseMove}
                        onMouseLeave={handleChartMouseLeave}
                      >
                        <div className="learners-performance-chart-grid">
                          {Array.from({ length: 6 }).map((_, i) => <span key={i}></span>)}
                        </div>

                        <div className="learners-performance-bars" aria-hidden="true">
                          {chartMonths.map((month, index) => (
                            <div
                              key={index}
                              className={`learners-performance-bar-group ${index === activeBarIndex ? 'is-active' : ''}`}
                              onMouseEnter={() => handleBarHover(index)}
                            >
                              <span className="learners-performance-bar learners-performance-bar--syllabus" style={{ height: `${(chartSyllabusValues[index] / chartMax) * 100}%` }}></span>
                              <span className="learners-performance-bar learners-performance-bar--online" style={{ height: `${(chartOnlineValues[index] / chartMax) * 100}%` }}></span>
                            </div>
                          ))}
                        </div>

                        <div 
                          className="learners-performance-chart-tooltip learners-performance-chart-tooltip--bars" 
                          style={{ 
                            left: `${(activeBarIndex / (chartMonths.length - 1)) * 100}%`, 
                            top: '52%',
                            opacity: 1
                          }}
                        >
                          <span>{chartMonths[activeBarIndex]} Stats</span>
                          <div className="learners-performance-chart-tooltip-row">
                            <i className="is-syllabus"></i><span>Syllabus :</span><b>{chartSyllabusValues[activeBarIndex]}</b>
                          </div>
                          <div className="learners-performance-chart-tooltip-row">
                            <i className="is-online"></i><span>Online :</span><b>{chartOnlineValues[activeBarIndex]}</b>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="learners-performance-chart-months">
                      {chartMonths.map((month, index) => (
                        <span key={index} className={index === activeBarIndex ? 'is-active' : ''}>{month}</span>
                      ))}
                    </div>
                  </>
                )}
              </section>

              {/* --- Side Summary (Donut Chart & Top Recent) --- */}
              <section className="learners-performance-side-summary">
                <div className="learners-performance-donut-wrap">
                  {!hasDonutData && !analyticsLoading ? (
                    <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '1rem', width: '100%' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No grading data available.</p>
                    </div>
                  ) : (
                    <>
                      <div
                        className="learners-performance-donut"
                        ref={donutRef}
                        onMouseMove={handleDonutMove}
                        onMouseLeave={handleDonutLeave}
                        style={{
                          background: `conic-gradient(
                            #F23C72 0% ${(donutStats.failed / totalDonut) * 100}%, 
                            #F2C335 ${(donutStats.failed / totalDonut) * 100}% ${((donutStats.failed + donutStats.tried) / totalDonut) * 100}%, 
                            #22C55E ${((donutStats.failed + donutStats.tried) / totalDonut) * 100}% 100%
                          )`
                        }}
                      ></div>
                      
                      {donutTooltip.visible && (
                        <div 
                          className="learners-performance-donut-tooltip" 
                          style={{ left: donutTooltip.x, top: donutTooltip.y }}
                        >
                          {donutTooltip.text}
                        </div>
                      )}

                      <div className="learners-performance-legend">
                        {performanceLegend.map((legendItem, index) => (
                          <div key={index} className="learners-performance-legend-item">
                            <span className="learners-performance-legend-dot" style={{ '--legend-color': legendItem.color }}></span>
                            <span>{legendItem.range}</span>
                            <strong>{legendItem.status}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="learners-performance-top-recent">
                  <div className="learners-performance-top-recent-head">
                    <h3>Top Learned</h3>
                  </div>

                  {analytics?.topCourse ? (
                    <article className="learners-performance-recent-card">
                      <div className="learners-performance-recent-badge">
                        <img src="/assets/icons/certt.svg" alt="" />
                        <span>100%</span>
                      </div>
                      <div className="learners-performance-recent-copy">
                        <h4>{analytics.topCourse.title}</h4>
                        <p><strong>{analytics.topCourse.completed}</strong> of {analytics.topCourse.total} Assessment</p>
                        <div className="learners-performance-recent-meta">
                          <span>{analytics.topCourse.score}%</span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '1rem', marginTop: '0.5rem' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No top course data available yet.</p>
                    </div>
                  )}

                  <a href="/academia/professor/management-lessons-ranks" className="learners-performance-download-link">
                    <span>See more of your courses rank</span>
                    <img src="/assets/icons/right1.svg" alt="" />
                  </a>
                </div>
              </section>
            </div>
          </div>

          <aside className="learners-performance-schedule">
            <div className="learners-performance-panel-head learners-performance-panel-head-side">
              <div>
                <h2>Weekly Schedule</h2>
                <p>Milestone to achieve</p>
              </div>
              <a href="/academia/professor/management-schedule">See All</a>
            </div>

            <div className="learners-performance-schedule-list">
              {eventsLoading ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>Loading events...</p>
                </div>
              ) : weeklySchedule.length === 0 ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', marginTop: '2rem' }}>
                  <h3>No schedule items</h3>
                  <p>Your upcoming meetings and events will appear here.</p>
                </div>
              ) : (
                weeklySchedule.map((scheduleItem, idx) => (
                  <article key={idx} className="learners-performance-schedule-item">
                    <div className="learners-performance-schedule-date">{scheduleItem.date}</div>
                    <div className="learners-performance-schedule-copy">
                      <h4>{scheduleItem.title}</h4>
                      <p>{scheduleItem.meta}</p>
                      <div className="learners-performance-schedule-meta">
                        <span>{scheduleItem.time}</span>
                        <span>•</span>
                        <strong className={`is-${scheduleItem.statusTone}`}>{scheduleItem.status}</strong>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </section>

        {/* --- Payment History Table --- */}
        <section className="learners-performance-history">
          <div className="learners-performance-history-head">
            <div>
              <h2>Payment History</h2>
              <p>Earned money from syllabus & Courses</p>
            </div>

            <div className="learners-performance-history-tools">
              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-date" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/calendar2.svg" alt="" />
                  <span>{paymentPeriod}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu">
                  {['Today', 'This Week', 'This Month', 'All Time'].map(period => (
                    <li key={period}>
                      <button 
                        className={`dropdown-item ${paymentPeriod === period ? 'active' : ''}`} 
                        onClick={() => { setPaymentPeriod(period); setCurrentPage(1); }}
                      >
                        {period}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-filter" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/filters-icon.svg" alt="" />
                  <span>{paymentStatusFilter === 'All Statuses' ? 'Filters' : paymentStatusFilter}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-menu-filter">
                  {['All Statuses', 'Passed', 'Failed', 'Pending'].map(status => (
                    <li key={status}>
                      <button 
                        className={`dropdown-item ${paymentStatusFilter === status ? 'active' : ''}`} 
                        onClick={() => { setPaymentStatusFilter(status); setCurrentPage(1); }}
                      >
                        {status}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="learners-performance-history-table-wrap">
            <table className="learners-performance-history-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="learners-performance-checkbox" aria-label="Select all rows">
                      <input type="checkbox" ref={selectAllRef} checked={isAllVisibleSelected} onChange={handleSelectAll} />
                      <span></span>
                    </label>
                  </th>
                  <th><span className="learners-performance-table-head-text">Course Details</span></th>
                  <th><span className="learners-performance-table-head-text">Payment Reason</span></th>
                  <th><span className="learners-performance-table-head-text">Payee name</span></th>
                  <th><span className="learners-performance-table-head-text">Amount Paid</span></th>
                  <th><span className="learners-performance-table-head-text">Fees per amount</span></th>
                  <th><span className="learners-performance-table-head-text">Net Paid</span></th>
                  <th><span className="learners-performance-table-head-text">Status</span></th>
                </tr>
              </thead>
              <tbody>
                {paymentsLoading ? (
                  <tr>
                    <td colSpan="8">
                      <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '3rem' }}>
                        <h3>Loading payments...</h3>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '3rem' }}>
                        <h3>No payment records found</h3>
                        <p>There are no payment records matching your selected filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((historyItem) => (
                    <tr key={historyItem.id}>
                      <td className="is-checkbox">
                        <label className="learners-performance-checkbox">
                          <input type="checkbox" checked={selectedRowIds.has(historyItem.id)} onChange={() => handleSelectRow(historyItem.id)} />
                          <span></span>
                        </label>
                      </td>
                      <td>
                        <div className="learners-performance-history-course">
                          <strong>{historyItem.course}</strong>
                          <span>{historyItem.date}</span>
                        </div>
                      </td>
                      <td className="learners-performance-history-author">{historyItem.reason}</td>
                      <td className="learners-performance-history-author">
                        <div className="learners-performance-history-course">
                          <strong>{historyItem.payee}</strong>
                          <span>{historyItem.country}</span>
                        </div>
                      </td>
                      <td className="learners-performance-history-score">{historyItem.grossPaid}</td>
                      <td className="learners-performance-history-time">{historyItem.fee}</td>
                      <td className="learners-performance-history-score">{historyItem.netPaid}</td>
                      <td>
                        <span className={`learners-performance-history-status is-${historyItem.statusTone}`}>{historyItem.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="learners-performance-history-footer">
            <div className="learners-performance-history-page-size">
              <span>Show</span>
              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-page-menu">
                  {[10, 20, 50].map(size => (
                    <li key={size}>
                      <button className={`dropdown-item ${pageSize === size ? 'active' : ''}`} onClick={() => { setPageSize(size); setCurrentPage(1); }}>
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="learners-performance-history-summary">
              <span>Total Payments</span>
              <strong>{analytics?.totalRevenue || 0} USD</strong>
            </div>

            <div className="learners-performance-history-pagination">
              <span>{payments.length === 0 ? '0-0 of 0' : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalPayments)} of ${totalPayments}`}</span>
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>&#8592;</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Sliding window
                let start = Math.max(1, currentPage - 2);
                if (start + 4 > totalPages) start = Math.max(1, totalPages - 4);
                const num = start + i;
                if (num > totalPages) return null;
                
                return (
                  <button 
                    key={num} 
                    type="button" 
                    className={currentPage === num ? 'is-active' : ''} 
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                );
              })}
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>&#8594;</button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default Performance;