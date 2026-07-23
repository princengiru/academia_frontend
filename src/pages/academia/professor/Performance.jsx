import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import './performance.css';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import certt from '../../../assets/icons/certt.svg';
import right1 from '../../../assets/icons/right1.svg';
import calendar2 from '../../../assets/icons/calendar2.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import { AcademiaDataTable, AcademiaStatusPill } from '../shared';
import { professorNetFromInvoice } from '../shared/courseFinance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PAYMENT_STATUS_FILTERS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
];

const padSeries = (value, length = 12) => {
  const source = Array.isArray(value) ? value : [];
  return Array.from({ length }, (_, index) => {
    const n = Number(source[index]);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  });
};

const averageBucket = (values, start, end) => {
  const slice = values.slice(start, end);
  if (!slice.length) return 0;
  return Math.round(slice.reduce((sum, value) => sum + value, 0) / slice.length);
};

const normalizePaymentRow = (row, index) => {
  const gross = row?.amount_paid ?? row?.gross_paid ?? row?.amount ?? row?.grossPaid;
  const fee = row?.fees_per_amount ?? row?.fee ?? row?.platform_fee ?? row?.service_fee;
  const vat = row?.vat;
  const net = row?.net_paid ?? row?.net_amount ?? professorNetFromInvoice({
    total: gross,
    amount_paid: gross,
    vat,
    service_fee: fee,
    fees_per_amount: fee,
  });
  const status = row?.payment_status || row?.status || 'Pending';
  const dateRaw = row?.payment_date || row?.paid_at || row?.created_at || row?.date;

  return {
    id: row?.id ?? row?._id ?? `pay-${index}`,
    course: row?.course_title || row?.course_name || row?.courseTitle || row?.course || 'Unknown Course',
    date: dateRaw ? new Date(dateRaw).toLocaleDateString() : 'N/A',
    reason: row?.payment_reason || row?.reason || row?.payment_type || 'Course Purchase',
    payee: row?.payer_name || row?.payee_name || row?.student_name || row?.payee || 'Unknown Student',
    country: row?.country || row?.student_country || 'N/A',
    grossPaid: gross != null && gross !== '' ? Number(gross).toFixed(2) : '---',
    fee: fee != null && fee !== '' ? Number(fee).toFixed(2) : '---',
    netPaid: net != null && net !== '' ? Number(net).toFixed(2) : '---',
    status,
    statusTone: String(status).toLowerCase() === 'paid' || String(status).toLowerCase() === 'completed'
      ? 'paid'
      : String(status).toLowerCase() === 'failed'
        ? 'failed'
        : 'pending',
  };
};

const mapDashboardToAnalytics = (dashboard = {}) => {
  const metrics = dashboard.assessmentMetrics || {};
  const earnings = Array.isArray(dashboard.courseEarnings) ? dashboard.courseEarnings : [];
  const courses = Array.isArray(dashboard.courses) ? dashboard.courses : [];
  const courseRevenueTotal = earnings.reduce((sum, item) => sum + Number(item.course_revenue || 0), 0);

  let topCourse = dashboard.topCourse || metrics.topCourse;
  if (!topCourse && earnings.length > 0) {
    const best = [...earnings].sort((a, b) => Number(b.course_revenue || 0) - Number(a.course_revenue || 0))[0];
    const course = courses.find((c) => c.id === best.id) || {};
    topCourse = {
      title: course.title || 'Top course',
      completed: Number(best.students || 0),
      total: Number(best.students || 0),
      score: 0,
    };
  }

  return {
    totalRevenue: Number(dashboard.totalRevenue ?? courseRevenueTotal),
    courseRevenue: Number(dashboard.courseRevenue ?? courseRevenueTotal),
    syllabusRevenue: Number(dashboard.syllabusRevenue ?? 0),
    averageScore: Number(dashboard.averageScore ?? metrics.averageScore ?? 0),
    certificatesIssued: Number(metrics.totalCertificatesEarned ?? 0),
    failedCount: Number(metrics.failedStudents ?? 0),
    triedCount: Number(metrics.totalRetakes ?? 0),
    passedCount: Number(metrics.passedStudents ?? 0),
    chartSyllabus: dashboard.chartSyllabus || metrics.chartSyllabus,
    chartOnline: dashboard.chartOnline || metrics.chartOnline,
    topCourse,
    revenueTrend: dashboard.revenueTrend,
    scoreTrend: dashboard.scoreTrend,
  };
};

const Performance = () => {
  // --- Global UI State ---
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsReloadKey, setAnalyticsReloadKey] = useState(0);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [eventsReloadKey, setEventsReloadKey] = useState(0);

  // --- Payment History State ---
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [paymentsReloadKey, setPaymentsReloadKey] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [paymentPeriod, setPaymentPeriod] = useState('All Time');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsSortConfig, setPaymentsSortConfig] = useState({ key: null, direction: 'asc' });
  const [areaChartPeriod, setAreaChartPeriod] = useState('Monthly');
  const [activeAreaIndex, setActiveAreaIndex] = useState(new Date().getMonth());
  const areaWrapRef = useRef(null);

  const loadAnalytics = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAnalyticsError('Please sign in to view analytics.');
      setAnalyticsLoading(false);
      return;
    }

    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [dashRes, invoiceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/instructor`, { headers, signal }),
        fetch(`${API_BASE_URL}/api/instructor/analytics`, { headers, signal }),
      ]);

      const dashBody = await dashRes.json().catch(() => ({}));
      const invoiceBody = await invoiceRes.json().catch(() => ({}));

      if (!dashRes.ok && !invoiceRes.ok) {
        throw new Error(
          dashBody?.message ||
            invoiceBody?.error?.message ||
            invoiceBody?.message ||
            'Could not load analytics.'
        );
      }

      const mapped = mapDashboardToAnalytics(dashBody?.data || {});
      if (invoiceRes.ok) {
        const financial = invoiceBody?.data?.financial || {};
        if (financial.total_amount_paid != null) {
          mapped.totalRevenue = Number(financial.total_amount_paid) || 0;
        }
      }
      setAnalytics(mapped);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setAnalytics(null);
        setAnalyticsError(err.message || 'Could not load analytics.');
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadAnalytics(controller.signal);
    return () => controller.abort();
  }, [loadAnalytics, analyticsReloadKey]);

  const loadEvents = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setEventsError('Please sign in to view your schedule.');
      setEventsLoading(false);
      return;
    }

    setEventsLoading(true);
    setEventsError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/created/my?limit=5&sort=upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const body = await res.json();
      if (res.ok) {
        setEvents(Array.isArray(body?.data) ? body.data : []);
      } else {
        setEvents([]);
        setEventsError(body?.message || 'Could not load upcoming events.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setEvents([]);
        setEventsError(err.message || 'Could not load upcoming events.');
      }
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents, eventsReloadKey]);

  const loadPayments = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPaymentsError('Please sign in to view payment history.');
      setPaymentsLoading(false);
      return;
    }

    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const offset = (currentPage - 1) * pageSize;
      const q = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
        period: paymentPeriod.toLowerCase().replace(' ', '_'),
      });
      if (paymentStatusFilter !== 'all') {
        q.set('status', paymentStatusFilter);
      }

      const res = await fetch(`${API_BASE_URL}/api/instructor/payment-history?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const body = await res.json();

      if (res.ok) {
        const rawPayments = Array.isArray(body?.data?.payments) ? body.data.payments : (Array.isArray(body?.data) ? body.data : []);
        setPayments(rawPayments.map(normalizePaymentRow));
        setTotalPayments(body?.data?.pagination?.total || rawPayments.length);
      } else {
        setPayments([]);
        setTotalPayments(0);
        setPaymentsError(body?.message || 'Payment history is not available yet.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPayments([]);
        setTotalPayments(0);
        setPaymentsError(err.message || 'Could not load payment history.');
      }
    } finally {
      setPaymentsLoading(false);
    }
  }, [currentPage, pageSize, paymentPeriod, paymentStatusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments, paymentsReloadKey]);

  // --- Derived Analytics State ---
  const performanceStats = useMemo(() => [
    { value: `${analytics?.totalRevenue || 0}`, label: 'Total Paid', trend: analytics?.revenueTrend, trendTone: (analytics?.revenueTrend || '').includes('-') ? 'down' : 'up' },
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

  // --- Area Chart Logic (matches learner design) ---
  const currentMonthIndex = new Date().getMonth();
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const currentQuarterIndex = Math.floor(currentMonthIndex / 3);

  const getDefaultActiveIndex = (period, dataLength) => {
    let idx = 0;
    if (period === 'Monthly') idx = currentMonthIndex;
    else if (period === 'Weekly') idx = currentDayIndex;
    else if (period === 'Quarterly') idx = currentQuarterIndex;
    return Math.max(0, Math.min(idx, dataLength - 1));
  };

  const getStudyChartData = useMemo(() => {
    const syllabusMonthly = padSeries(analytics?.chartSyllabus, 12);
    const onlineMonthly = padSeries(analytics?.chartOnline, 12);

    if (areaChartPeriod === 'Weekly') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        syllabus: Array(7).fill(0),
        online: Array(7).fill(0),
      };
    }

    if (areaChartPeriod === 'Quarterly') {
      return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        syllabus: [0, 1, 2, 3].map((quarter) => averageBucket(syllabusMonthly, quarter * 3, quarter * 3 + 3)),
        online: [0, 1, 2, 3].map((quarter) => averageBucket(onlineMonthly, quarter * 3, quarter * 3 + 3)),
      };
    }

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      syllabus: syllabusMonthly,
      online: onlineMonthly,
    };
  }, [analytics?.chartSyllabus, analytics?.chartOnline, areaChartPeriod]);

  useEffect(() => {
    setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod, getStudyChartData.labels.length));
  }, [areaChartPeriod, getStudyChartData.labels.length]);

  const handleAreaMouseMove = (e) => {
    if (!areaWrapRef.current) return;
    const rect = areaWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = getStudyChartData.labels.length - 1;
    let index = Math.round((x / rect.width) * numPoints);
    setActiveAreaIndex(Math.max(0, Math.min(index, numPoints)));
  };

  const handleAreaMouseLeave = () => {
    setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod, getStudyChartData.labels.length));
  };

  const generateSmoothPath = (values) => {
    if (!values || values.length === 0) return '';
    const segments = values.length - 1;
    const xStep = 110 / Math.max(1, segments);
    const points = values.map((val, i) => [i * xStep, 100 - val]);
    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpDist = xStep * 0.4;
      d += ` C${prev[0] + cpDist},${prev[1]} ${curr[0] - cpDist},${curr[1]} ${curr[0]},${curr[1]}`;
    }
    return d;
  };

  const preventDefault = (e) => e.preventDefault();

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
    { color: '#F23C72', range: '0–59%', status: hasDonutData ? `Below passing · ${donutStats.failed}` : 'Below passing' },
    { color: '#F2C335', range: '60–79%', status: hasDonutData ? `Almost there · ${donutStats.tried}` : 'Almost there' },
    { color: '#22C55E', range: '80–100%', status: hasDonutData ? `Passed · ${donutStats.passed}` : 'Passed' },
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
    if (percent >= 0 && percent < failPct) label = `${donutStats.failed} below 60%`;
    else if (percent >= failPct && percent < (failPct + triedPct)) label = `${donutStats.tried} at 60-79%`;
    else label = `${donutStats.passed} at 80%+`;

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

  const handlePaymentsSort = (key) => {
    if (!key) return;
    setPaymentsSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedPayments = useMemo(() => {
    if (!paymentsSortConfig.key) return payments;
    const key = paymentsSortConfig.key;
    const numericKeys = ['grossPaid', 'fee', 'netPaid'];
    const coerce = (row) => {
      const val = row?.[key];
      if (val == null) return numericKeys.includes(key) ? -Infinity : '';
      if (numericKeys.includes(key)) {
        const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
        return Number.isFinite(num) ? num : -Infinity;
      }
      return String(val).toLowerCase();
    };
    return [...payments].sort((a, b) => {
      const aVal = coerce(a);
      const bVal = coerce(b);
      if (aVal < bVal) return paymentsSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return paymentsSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [payments, paymentsSortConfig]);

  return (
      <section className="learners-performance-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Analytics & Payments</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-primary" href="/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        {analyticsError ? (
          <LearnerLoadError
            title="Could not load analytics"
            message={analyticsError}
            onRetry={analyticsError.includes('sign in') ? undefined : () => setAnalyticsReloadKey((key) => key + 1)}
          />
        ) : null}

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
                <p>Course performance overview</p>
              </div>
            </div>

            <div className="learners-performance-board-grid">
              
              {/* --- Area Chart (matches learner) --- */}
              <section className="learners-performance-chart-card">
                <div className="rep-chart-header">
                  <div className="rep-chart-title">
                    <span className="rep-badge-purple">
                      {analyticsLoading ? '…' : `${Number(analytics?.averageScore || 0)}%`}
                    </span>
                    Syllabus & Online
                  </div>
                  <div className="dropdown learners-performance-period-dropdown">
                    <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span>{areaChartPeriod}</span>
                      <img src={hoadowncaret} alt="" />
                    </button>
                    <ul className="dropdown-menu learners-performance-period-menu">
                      <li>
                        <a
                          className={`dropdown-item ${areaChartPeriod === 'Monthly' ? 'active' : ''}`}
                          href="#"
                          onClick={(e) => {
                            preventDefault(e);
                            setAreaChartPeriod('Monthly');
                            setActiveAreaIndex(getDefaultActiveIndex('Monthly', 12));
                          }}
                        >
                          Monthly
                        </a>
                      </li>
                      <li>
                        <a
                          className={`dropdown-item ${areaChartPeriod === 'Weekly' ? 'active' : ''}`}
                          href="#"
                          onClick={(e) => {
                            preventDefault(e);
                            setAreaChartPeriod('Weekly');
                            setActiveAreaIndex(getDefaultActiveIndex('Weekly', 7));
                          }}
                        >
                          Weekly
                        </a>
                      </li>
                      <li>
                        <a
                          className={`dropdown-item ${areaChartPeriod === 'Quarterly' ? 'active' : ''}`}
                          href="#"
                          onClick={(e) => {
                            preventDefault(e);
                            setAreaChartPeriod('Quarterly');
                            setActiveAreaIndex(getDefaultActiveIndex('Quarterly', 4));
                          }}
                        >
                          Quarterly
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', marginTop: '20px', height: '220px', position: 'relative', width: '100%', paddingBottom: '20px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} style={{ borderBottom: '1.5px dashed #EEF1F6', width: '100%', height: '1px' }} />
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#A1A5B7', fontSize: '10px', paddingRight: '12px', position: 'relative', height: '100%' }}>
                    {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                      <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? '-4px' : 0, marginBottom: idx === 10 ? '-4px' : 0, backgroundColor: 'white', zIndex: 1 }}>{y}</span>
                    ))}
                  </div>

                  <div
                    style={{ position: 'relative', flex: 1, height: '100%', cursor: 'default' }}
                    ref={areaWrapRef}
                    onMouseMove={handleAreaMouseMove}
                    onMouseLeave={handleAreaMouseLeave}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                      <svg width="100%" height="100%" viewBox="0 0 110 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="profAreaGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.15)" />
                            <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                          </linearGradient>
                          <linearGradient id="profAreaPurple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(185, 152, 206, 0.25)" />
                            <stop offset="100%" stopColor="rgba(185, 152, 206, 0)" />
                          </linearGradient>
                        </defs>

                        <path d={`${generateSmoothPath(getStudyChartData.online)} L110,100 L0,100 Z`} fill="url(#profAreaGreen)" />
                        <path d={generateSmoothPath(getStudyChartData.online)} fill="none" stroke="#22C55E" strokeWidth="2" vectorEffect="non-scaling-stroke" />

                        <path d={`${generateSmoothPath(getStudyChartData.syllabus)} L110,100 L0,100 Z`} fill="url(#profAreaPurple)" />
                        <path d={generateSmoothPath(getStudyChartData.syllabus)} fill="none" stroke="#B998CE" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      </svg>

                      <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`, top: `${100 - getStudyChartData.syllabus[activeAreaIndex]}%`, bottom: '-25px', width: '1px', backgroundColor: '#374151', transform: 'translateX(-50%)' }} />
                      <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`, top: `${100 - getStudyChartData.syllabus[activeAreaIndex]}%`, width: '14px', height: '14px', backgroundColor: '#450468', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                      <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`, top: `${100 - getStudyChartData.online[activeAreaIndex]}%`, width: '14px', height: '14px', backgroundColor: '#22C55E', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                    </div>

                    <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`, top: '52%', transform: `translate(-${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%, -100%)`, '--caret-pos': `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`, paddingBottom: '12px', zIndex: 10, pointerEvents: 'none', transition: 'left 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease' }}>
                      <div className="rep-chart-tooltip" style={{ padding: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', color: '#071437' }}>
                          {getStudyChartData.labels[activeAreaIndex]}
                        </div>
                        <div style={{ fontSize: '13px', color: '#4B5675', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#450468', fontSize: 16, lineHeight: 1 }}>●</span> Syllabus</span>
                          <strong style={{ color: '#071437', fontSize: '14px' }}>{getStudyChartData.syllabus[activeAreaIndex]}%</strong>
                        </div>
                        <div style={{ fontSize: '13px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#22C55E', fontSize: 16, lineHeight: 1 }}>●</span> Online</span>
                          <strong style={{ color: '#071437', fontSize: '14px' }}>{getStudyChartData.online[activeAreaIndex]}%</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, pointerEvents: 'none' }}>
                      {getStudyChartData.labels.map((label, i) => (
                        <span
                          key={label}
                          style={{
                            position: 'absolute',
                            left: `${(i / Math.max(1, getStudyChartData.labels.length - 1)) * 100}%`,
                            transform: 'translateX(-50%)',
                            color: i === activeAreaIndex ? '#450468' : '#A1A5B7',
                            fontWeight: i === activeAreaIndex ? 600 : 'normal',
                            fontSize: '10px',
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* --- Side Summary (Donut Chart & Top Recent) --- */}
              <section className="learners-performance-side-summary">
                <div className="learners-performance-donut-wrap">
                    <>
                      <div
                        className="learners-performance-donut"
                        ref={donutRef}
                        onMouseMove={handleDonutMove}
                        onMouseLeave={handleDonutLeave}
                        style={{
                          background: hasDonutData
                            ? `conic-gradient(
                            #F23C72 0% ${(donutStats.failed / totalDonut) * 100}%, 
                            #F2C335 ${(donutStats.failed / totalDonut) * 100}% ${((donutStats.failed + donutStats.tried) / totalDonut) * 100}%, 
                            #22C55E ${((donutStats.failed + donutStats.tried) / totalDonut) * 100}% 100%
                          )`
                            : '#E9EDF4',
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
                </div>

                <div className="learners-performance-top-recent">
                  <div className="learners-performance-top-recent-head">
                    <h3>Top course</h3>
                  </div>

                  {analytics?.topCourse ? (
                    <article className="learners-performance-recent-card">
                      <div className="learners-performance-recent-badge">
                        <img src={certt} alt="" />
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

                  <a href="/professor/management-lessons-ranks" className="learners-performance-download-link">
                    <span>See more of your courses rank</span>
                    <img src={right1} alt="" />
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
              <a href="/professor/management-schedule">See All</a>
            </div>

            <div className="learners-performance-schedule-list">
              {eventsError ? (
                <LearnerLoadError
                  title="Schedule unavailable"
                  message={eventsError}
                  onRetry={eventsError.includes('sign in') ? undefined : () => setEventsReloadKey((key) => key + 1)}
                />
              ) : eventsLoading ? (
                <ManagementLoading compact title="Loading events" message="Fetching your upcoming schedule." />
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
          <AcademiaDataTable
            title="Payment History"
            subtitle={`Earned money from syllabus & Courses · Total ${analytics?.totalRevenue || 0} USD`}
            filters={PAYMENT_STATUS_FILTERS}
            activeFilter={paymentStatusFilter}
            onFilterChange={(value) => { setPaymentStatusFilter(value); setCurrentPage(1); }}
            defaultFilterLabel="Filters"
            toolbarExtra={(
              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="adt-btn-light-purple dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={calendar2} alt="" />
                  <span>{paymentPeriod}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu">
                  {['All Time', 'Today', 'This Week', 'This Month'].map(period => (
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
            )}
            columns={[
              {
                key: 'course',
                label: 'Course Details',
                sortable: true,
                renderCell: (row) => (
                  <div className="learners-performance-history-course">
                    <strong>{row.course}</strong>
                    <span>{row.date}</span>
                  </div>
                ),
              },
              {
                key: 'reason',
                label: 'Payment Reason',
                sortable: true,
                cellClassName: 'learners-performance-history-author',
              },
              {
                key: 'payee',
                label: 'Payee name',
                sortable: true,
                renderCell: (row) => (
                  <div className="learners-performance-history-course">
                    <strong>{row.payee}</strong>
                    <span>{row.country}</span>
                  </div>
                ),
              },
              {
                key: 'grossPaid',
                label: 'Amount Paid',
                sortable: true,
                cellClassName: 'learners-performance-history-score',
              },
              {
                key: 'fee',
                label: 'Fees per amount',
                sortable: true,
                cellClassName: 'learners-performance-history-time',
              },
              {
                key: 'netPaid',
                label: 'Net Paid',
                sortable: true,
                cellClassName: 'learners-performance-history-score',
              },
              {
                key: 'status',
                label: 'Status',
                sortable: true,
                renderCell: (row) => (
                  <AcademiaStatusPill tone={row.statusTone === 'paid' ? 'green' : row.statusTone === 'failed' ? 'red' : 'orange'}>
                    {row.status}
                  </AcademiaStatusPill>
                ),
              },
            ]}
            rows={sortedPayments}
            getRowKey={(row) => row.id}
            sortConfig={paymentsSortConfig}
            onSort={handlePaymentsSort}
            loading={paymentsLoading}
            error={paymentsError}
            onRetry={paymentsError.includes('sign in') ? undefined : () => setPaymentsReloadKey((key) => key + 1)}
            emptyTitle="No payment records found"
            emptyMessage="There are no payment records matching your selected filters."
            loadingMessage="Fetching your payment records."
            showPagination={totalPayments > 0}
            pageSize={String(pageSize)}
            pageSizeOptions={['10', '20', '50']}
            onPageSizeChange={(value) => { setPageSize(Number(value)); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalPayments}
            rangeLabel={payments.length === 0 ? '0' : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalPayments)}`}
            onGoToPage={(value) => setCurrentPage(Math.min(Math.max(1, value), totalPages))}
          />
        </section>

      </section>
  );
};

export default Performance;