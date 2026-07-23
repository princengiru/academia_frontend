import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency } from '../../../hooks/useCurrency';
import { HOALoadError, HOALoading, HOAEmptyState, HOATableEmptyRow } from './HOAPageState';
import './hoa-reports.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadollar from '../../../assets/icons/hoadollar.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

const formatCount = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

const zeroMonths = () => Array(12).fill(0);

const bucketByMonth = (rows) => {
  const out = zeroMonths();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const d = new Date(row?.date);
    if (Number.isNaN(d.getTime())) return;
    out[d.getMonth()] += Number(row?.count) || 0;
  });
  return out;
};

const averageBucket = (values, start, end) => {
  const slice = values.slice(start, end);
  if (!slice.length) return 0;
  return Math.round(slice.reduce((sum, value) => sum + value, 0) / slice.length);
};

const scaleSeries = (raw, ceiling = 90) => {
  const max = Math.max(...raw, 0);
  if (max <= 0) return raw.map(() => 0);
  return raw.map((value) => Math.round((Number(value) || 0) / max * ceiling));
};

const scalePairedSeries = (left, right, ceiling = 90) => {
  const max = Math.max(...left, ...right, 0);
  if (max <= 0) {
    return {
      left: left.map(() => 0),
      right: right.map(() => 0),
    };
  }
  return {
    left: left.map((value) => Math.round((Number(value) || 0) / max * ceiling)),
    right: right.map((value) => Math.round((Number(value) || 0) / max * ceiling)),
  };
};

const buildPeriodSeries = (monthlyRaw, period) => {
  const monthly = Array.isArray(monthlyRaw) && monthlyRaw.length === 12 ? monthlyRaw : zeroMonths();
  if (period === 'Weekly') {
    return { labels: WEEK_LABELS, values: Array(7).fill(0), raw: Array(7).fill(0) };
  }
  if (period === 'Quarterly') {
    const raw = [0, 1, 2, 3].map((q) => averageBucket(monthly, q * 3, q * 3 + 3));
    return { labels: QUARTER_LABELS, values: scaleSeries(raw), raw };
  }
  return { labels: MONTH_LABELS, values: scaleSeries(monthly), raw: monthly };
};

const HOAReports = () => {
  const { currency, formatAmount } = useCurrency();
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'tutorName', direction: 'asc' });
  const [pageSize, setPageSize] = useState('10');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeOptions = ['5', '10', '20'];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [reportsApiConnected, setReportsApiConnected] = useState(false);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [countries, setCountries] = useState([]);
  const [certsMonthly, setCertsMonthly] = useState(() => zeroMonths());
  const [projectsMonthly, setProjectsMonthly] = useState(() => zeroMonths());
  const [uploadSeries, setUploadSeries] = useState({
    syllabusMonthly: zeroMonths(),
    onlineMonthly: zeroMonths(),
    syllabusWeekly: Array(7).fill(0),
    onlineWeekly: Array(7).fill(0),
    syllabusChange: '0%',
    onlineChange: '0%',
  });

  const currentMonthIndex = new Date().getMonth();
  const currentDayIndex = (new Date().getDay() + 6) % 7;
  const currentQuarterIndex = Math.floor(currentMonthIndex / 3);

  const getDefaultActiveIndex = (period) => {
    if (period === 'Monthly') return currentMonthIndex;
    if (period === 'Weekly') return currentDayIndex;
    if (period === 'Quarterly') return currentQuarterIndex;
    return 0;
  };

  const [areaChartPeriod, setAreaChartPeriod] = useState('Monthly');
  const [activeAreaIndex, setActiveAreaIndex] = useState(() => getDefaultActiveIndex('Monthly'));
  const areaWrapRef = useRef(null);

  const [barChartPeriod, setBarChartPeriod] = useState('Monthly');
  const [activeBarIndex, setActiveBarIndex] = useState(() => getDefaultActiveIndex('Monthly'));
  const barWrapRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const mapPaymentRow = (row, index) => {
      const statusRaw = String(row?.status || '').toLowerCase();
      let status = 'In Progress';
      let statusColor = 'yellow';
      if (statusRaw === 'paid' || statusRaw === 'completed') {
        status = 'Completed';
        statusColor = 'green';
      } else if (statusRaw === 'failed' || statusRaw === 'refunded') {
        status = 'Failed';
        statusColor = 'red';
      }

      const amountNum = Number(row?.amount ?? row?.total ?? 0);
      return {
        id: row?.id ?? `pay-${index}`,
        tutorName: row?.instructor_name || row?.payer_name || row?.tutor_name || row?.user_name || row?.name || 'Unknown',
        location: row?.location || row?.email || '—',
        course: row?.course_title || row?.course || row?.payment_reason || 'Payment',
        date: row?.payment_date || row?.paid_at || row?.created_at
          ? new Date(row.payment_date || row.paid_at || row.created_at).toLocaleDateString()
          : '—',
        amount: Number.isFinite(amountNum) ? amountNum : null,
        payMethod: row?.payment_method || '—',
        reason: row?.payment_reason || row?.reason || '—',
        role: row?.role || 'student',
        status,
        statusColor,
      };
    };

    const fetchReportsData = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please sign in to view reports.');

        const headers = { Authorization: `Bearer ${token}` };
        const [metricsRes, historyRes, summaryRes, grossRes, countriesRes, trendRes, uploadsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/metrics`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/payment-history?limit=100&page=1`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/payment-summary`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/gross-revenue`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/countries-report`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/certificates-projects-trend?period=year`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/average-uploads`, { headers }),
        ]);

        if (!mounted) return;

        if (metricsRes.status === 401 || historyRes.status === 401) {
          throw new Error('Your session expired. Please sign in again.');
        }

        let nextMetrics = {};
        if (metricsRes.ok) {
          const body = await metricsRes.json();
          const raw = body?.data || body || {};
          nextMetrics = {
            ...raw,
            revenue: raw.total_revenue ?? raw.revenue ?? 0,
            totalSyllabus: raw.total_syllabus ?? raw.totalSyllabus ?? 0,
            totalCourses: raw.total_courses ?? raw.totalCourses ?? 0,
            certificates: raw.total_certificates ?? raw.certificates ?? 0,
            uploads: raw.total_projects ?? raw.uploads ?? 0,
          };
        }

        if (summaryRes.ok) {
          const summaryBody = await summaryRes.json();
          const summary = summaryBody?.data || {};
          if (summary?.totals?.total_paid != null) {
            nextMetrics.revenue = summary.totals.total_paid;
            nextMetrics.totalFees = summary.totals.total_fees;
            nextMetrics.totalVat = summary.totals.total_vat;
          } else if (summary?.total_paid?.amount != null) {
            nextMetrics.revenue = summary.total_paid.amount;
          }
        }

        if (grossRes.ok) {
          const grossBody = await grossRes.json();
          const breakdown = Array.isArray(grossBody?.data?.breakdown) ? grossBody.data.breakdown : [];
          setRevenueBreakdown(breakdown);
          if (grossBody?.data?.total_revenue != null) {
            nextMetrics.revenue = grossBody.data.total_revenue;
          }
        } else {
          setRevenueBreakdown([]);
        }

        if (countriesRes.ok) {
          const countriesBody = await countriesRes.json();
          setCountries(Array.isArray(countriesBody?.data) ? countriesBody.data : []);
        } else {
          setCountries([]);
        }

        if (trendRes.ok) {
          const trendBody = await trendRes.json();
          const trend = trendBody?.data || {};
          setCertsMonthly(bucketByMonth(trend.certificates));
          setProjectsMonthly(bucketByMonth(trend.projects));
        } else {
          setCertsMonthly(zeroMonths());
          setProjectsMonthly(zeroMonths());
        }

        if (uploadsRes.ok) {
          const uploadsBody = await uploadsRes.json();
          const uploads = uploadsBody?.data || {};
          const syllabusMonthly = Array.isArray(uploads?.syllabus?.monthly)
            ? uploads.syllabus.monthly.map((n) => Number(n) || 0)
            : zeroMonths();
          const onlineMonthly = Array.isArray(uploads?.online_courses?.monthly)
            ? uploads.online_courses.monthly.map((n) => Number(n) || 0)
            : zeroMonths();
          const syllabusWeekly = Array.isArray(uploads?.syllabus?.weekly)
            ? uploads.syllabus.weekly.map((n) => Number(n) || 0)
            : Array(7).fill(0);
          const onlineWeekly = Array.isArray(uploads?.online_courses?.weekly)
            ? uploads.online_courses.weekly.map((n) => Number(n) || 0)
            : Array(7).fill(0);

          // Fallback if API is older and only returns totals: put total in current month
          if (!Array.isArray(uploads?.syllabus?.monthly) && Number(uploads?.syllabus?.total) > 0) {
            syllabusMonthly[new Date().getMonth()] = Number(uploads.syllabus.total) || 0;
          }
          if (!Array.isArray(uploads?.online_courses?.monthly) && Number(uploads?.online_courses?.total) > 0) {
            onlineMonthly[new Date().getMonth()] = Number(uploads.online_courses.total) || 0;
          }

          setUploadSeries({
            syllabusMonthly: syllabusMonthly.length === 12 ? syllabusMonthly : zeroMonths(),
            onlineMonthly: onlineMonthly.length === 12 ? onlineMonthly : zeroMonths(),
            syllabusWeekly: syllabusWeekly.length === 7 ? syllabusWeekly : Array(7).fill(0),
            onlineWeekly: onlineWeekly.length === 7 ? onlineWeekly : Array(7).fill(0),
            syllabusChange: uploads?.syllabus?.change || '0%',
            onlineChange: uploads?.online_courses?.change || '0%',
          });
        } else {
          setUploadSeries({
            syllabusMonthly: zeroMonths(),
            onlineMonthly: zeroMonths(),
            syllabusWeekly: Array(7).fill(0),
            onlineWeekly: Array(7).fill(0),
            syllabusChange: '0%',
            onlineChange: '0%',
          });
        }

        setMetrics(nextMetrics);

        if (historyRes.ok) {
          const historyBody = await historyRes.json();
          const rows = Array.isArray(historyBody?.data?.payments)
            ? historyBody.data.payments
            : Array.isArray(historyBody?.data)
              ? historyBody.data
              : [];
          setPaymentHistory(rows.map(mapPaymentRow));
          setReportsApiConnected(true);
        } else {
          setPaymentHistory([]);
          setReportsApiConnected(false);
        }
      } catch (error) {
        if (mounted) {
          setMetrics({});
          setPaymentHistory([]);
          setRevenueBreakdown([]);
          setCountries([]);
          setCertsMonthly(zeroMonths());
          setProjectsMonthly(zeroMonths());
          setUploadSeries({
            syllabusMonthly: zeroMonths(),
            onlineMonthly: zeroMonths(),
            syllabusWeekly: Array(7).fill(0),
            onlineWeekly: Array(7).fill(0),
            syllabusChange: '0%',
            onlineChange: '0%',
          });
          setReportsApiConnected(false);
          setFetchError(error.message || 'Failed to load reports.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchReportsData();
    return () => { mounted = false; };
  }, [retryKey]);

  const topStats = useMemo(() => ([
    { title: 'Total Revenue', amount: formatCount(metrics.revenue) },
    { title: 'Syllabus', amount: formatCount(metrics.totalSyllabus) },
    { title: 'Online Courses', amount: formatCount(metrics.totalCourses) },
    { title: 'Certificates', amount: formatCount(metrics.certificates) },
    { title: 'Uploads', amount: formatCount(metrics.uploads) },
  ]), [metrics]);

  const filteredPayments = useMemo(() => {
    let rows = paymentHistory;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) =>
        (row.tutorName || '').toLowerCase().includes(q) ||
        (row.course || '').toLowerCase().includes(q)
      );
    }
    if (selectedFilter !== 'All Status') {
      rows = rows.filter((row) => row.status === selectedFilter);
    }
    if (!sortConfig.key) return rows;
    return [...rows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && String(aVal).includes('USD')) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      if (sortConfig.key === 'amount') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [paymentHistory, searchQuery, selectedFilter, sortConfig]);

  const limit = parseInt(pageSize, 10) || 10;
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedPayments = filteredPayments.slice(0, limit);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]));
  };

  const clearSelectedRows = () => setSelectedRows([]);

  const areaChartData = useMemo(() => {
    const certs = buildPeriodSeries(certsMonthly, areaChartPeriod);
    const projects = buildPeriodSeries(projectsMonthly, areaChartPeriod);
    return {
      labels: certs.labels,
      purple: certs.values,
      green: projects.values,
      purpleRaw: certs.raw,
      greenRaw: projects.raw,
    };
  }, [certsMonthly, projectsMonthly, areaChartPeriod]);

  const barChartData = useMemo(() => {
    if (barChartPeriod === 'Weekly') {
      const sylRaw = uploadSeries.syllabusWeekly;
      const onlRaw = uploadSeries.onlineWeekly;
      const scaled = scalePairedSeries(sylRaw, onlRaw);
      return {
        labels: WEEK_LABELS,
        bar: WEEK_LABELS.map((_, i) => ({
          syl: scaled.left[i] || 0,
          onl: scaled.right[i] || 0,
          sylRaw: sylRaw[i] || 0,
          onlRaw: onlRaw[i] || 0,
        })),
      };
    }

    const sylMonthly = uploadSeries.syllabusMonthly;
    const onlMonthly = uploadSeries.onlineMonthly;

    if (barChartPeriod === 'Quarterly') {
      const sylRaw = [0, 1, 2, 3].map((q) =>
        sylMonthly.slice(q * 3, q * 3 + 3).reduce((sum, n) => sum + (Number(n) || 0), 0)
      );
      const onlRaw = [0, 1, 2, 3].map((q) =>
        onlMonthly.slice(q * 3, q * 3 + 3).reduce((sum, n) => sum + (Number(n) || 0), 0)
      );
      const scaled = scalePairedSeries(sylRaw, onlRaw);
      return {
        labels: QUARTER_LABELS,
        bar: QUARTER_LABELS.map((_, i) => ({
          syl: scaled.left[i] || 0,
          onl: scaled.right[i] || 0,
          sylRaw: sylRaw[i] || 0,
          onlRaw: onlRaw[i] || 0,
        })),
      };
    }

    const scaled = scalePairedSeries(sylMonthly, onlMonthly);
    return {
      labels: MONTH_LABELS,
      bar: MONTH_LABELS.map((_, i) => ({
        syl: scaled.left[i] || 0,
        onl: scaled.right[i] || 0,
        sylRaw: sylMonthly[i] || 0,
        onlRaw: onlMonthly[i] || 0,
      })),
    };
  }, [barChartPeriod, uploadSeries]);

  useEffect(() => {
    setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod));
  }, [areaChartPeriod]);

  useEffect(() => {
    setActiveBarIndex(getDefaultActiveIndex(barChartPeriod));
  }, [barChartPeriod]);

  const handleAreaMouseMove = (e) => {
    if (!areaWrapRef.current) return;
    const rect = areaWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = Math.max(1, areaChartData.labels.length - 1);
    const index = Math.round((x / rect.width) * numPoints);
    setActiveAreaIndex(Math.max(0, Math.min(index, areaChartData.labels.length - 1)));
  };

  const handleAreaMouseLeave = () => setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod));

  const handleBarMouseMove = (e) => {
    if (!barWrapRef.current) return;
    const rect = barWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = Math.max(1, barChartData.labels.length - 1);
    const index = Math.round((x / rect.width) * numPoints);
    setActiveBarIndex(Math.max(0, Math.min(index, barChartData.labels.length - 1)));
  };

  const handleBarMouseLeave = () => setActiveBarIndex(getDefaultActiveIndex(barChartPeriod));

  const generateSmoothPath = (values) => {
    if (!values || values.length === 0) return '';
    const segments = values.length - 1;
    const xStep = 110 / Math.max(1, segments);
    const points = values.map((val, i) => [i * xStep, 100 - ((Number(val) || 0) / 90) * 100]);
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

  const areaTotal =
    (areaChartData.purpleRaw?.[activeAreaIndex] || 0) + (areaChartData.greenRaw?.[activeAreaIndex] || 0);
  const areaBadge = areaTotal > 0 ? `${Math.min(99.9, ((areaChartData.purpleRaw?.[activeAreaIndex] || 0) / areaTotal) * 100).toFixed(1)}%` : '0%';
  const uploadsPeriodTotal =
    (barChartData.bar?.[activeBarIndex]?.sylRaw || 0) + (barChartData.bar?.[activeBarIndex]?.onlRaw || 0);
  const uploadsBadge = uploadsPeriodTotal > 0
    ? `${Math.min(99.9, ((barChartData.bar?.[activeBarIndex]?.sylRaw || 0) / uploadsPeriodTotal) * 100).toFixed(1)}%`
    : '0%';
  const uploadsTrendLabel = uploadSeries.syllabusChange || '0%';

  return (
    <HOALayout currentPage="reports">
      <div className="hoa-reports-page">

        <div className="hoa-page-header">
          <h1>Reports</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => setRetryKey((key) => key + 1)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Refresh" className={`sync-icon ${isLoading ? 'spinning' : ''}`} />
              {isLoading ? 'Updating...' : 'Data updated every 5min'}
              <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button type="button" className="hoa-btn-primary" onClick={() => window.open('/index', '_blank')}>
              Go to website <img src={hoagoto} alt="Go" />
            </button>
          </div>
        </div>

        <div className="hoa-reports-notice" role="status">
          Revenue and payment history use the same invoice APIs as{' '}
          <Link to="/hoa/finance">Finance</Link>.
        </div>

        {fetchError ? (
          <HOALoadError
            title="Could not load reports"
            message={fetchError}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        ) : isLoading ? (
          <HOALoading message="Loading reports…" />
        ) : (
        <>
        <div className="rep-dashboard-stats-container">
          <div className="rep-secondary-stats-row">
            {topStats.map((stat) => (
              <div key={stat.title} className="rep-sub-stat">
                <h4>
                  {stat.amount}
                  <span className="rep-stat-currency">
                    {stat.title === 'Total Revenue' ? currency.label : 'count'}
                    {stat.title === 'Total Revenue' ? (
                      <img src={currency.flag} alt="flag" style={{ width: 12 }} />
                    ) : null}
                  </span>
                </h4>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-charts-grid">
          <div className="rep-card">
            <div className="rep-chart-header">
              <div className="rep-chart-title">
                <span className="rep-badge-purple">{areaBadge}</span>
                Certificates & Projects
              </div>
              <div className="dropdown learners-performance-period-dropdown">
                <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{areaChartPeriod}</span>
                  <img src={hoadowncaret} alt="" />
                </button>
                <ul className="dropdown-menu learners-performance-period-menu">
                  {['Monthly', 'Weekly', 'Quarterly'].map((period) => (
                    <li key={period}>
                      <button
                        type="button"
                        className={`dropdown-item ${areaChartPeriod === period ? 'active' : ''}`}
                        onClick={(e) => { preventDefault(e); setAreaChartPeriod(period); }}
                      >
                        {period}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', marginTop: 20, height: 220, position: 'relative', width: '100%', paddingBottom: 20 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={{ borderBottom: '1.5px dashed #EEF1F6', width: '100%', height: 1 }} />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#A1A5B7', fontSize: 10, paddingRight: 12, position: 'relative', height: '100%' }}>
                {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                  <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? -4 : 0, marginBottom: idx === 9 ? -4 : 0, backgroundColor: 'white', zIndex: 1 }}>{y}</span>
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
                      <linearGradient id="hoaRepAreaGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.15)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                      </linearGradient>
                      <linearGradient id="hoaRepAreaPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(185, 152, 206, 0.25)" />
                        <stop offset="100%" stopColor="rgba(185, 152, 206, 0)" />
                      </linearGradient>
                    </defs>
                    <path d={`${generateSmoothPath(areaChartData.green)} L110,100 L0,100 Z`} fill="url(#hoaRepAreaGreen)" />
                    <path d={generateSmoothPath(areaChartData.green)} fill="none" stroke="#22C55E" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <path d={`${generateSmoothPath(areaChartData.purple)} L110,100 L0,100 Z`} fill="url(#hoaRepAreaPurple)" />
                    <path d={generateSmoothPath(areaChartData.purple)} fill="none" stroke="#B998CE" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>

                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, top: `${100 - (areaChartData.purple[activeAreaIndex] / 90) * 100}%`, bottom: -25, width: 1, backgroundColor: '#374151', transform: 'translateX(-50%)' }} />
                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, top: `${100 - (areaChartData.purple[activeAreaIndex] / 90) * 100}%`, width: 14, height: 14, backgroundColor: '#450468', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, top: `${100 - (areaChartData.green[activeAreaIndex] / 90) * 100}%`, width: 14, height: 14, backgroundColor: '#22C55E', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                </div>

                <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, top: '52%', transform: `translate(-${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%, -100%)`, '--caret-pos': `${(activeAreaIndex / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, paddingBottom: 12, zIndex: 10, pointerEvents: 'none' }}>
                  <div className="rep-chart-tooltip" style={{ padding: 16, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, fontWeight: 'bold', color: '#071437' }}>
                      {areaChartData.labels[activeAreaIndex]}
                      <span style={{ color: '#22C55E', fontWeight: 600, fontSize: 10, display: 'flex', alignItems: 'center' }}>
                        <img src={hoaincrease} alt="" style={{ width: 8, marginRight: 4 }} />
                        {areaBadge}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#4B5675', marginBottom: 10, display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#450468', fontSize: 16, lineHeight: 1 }}>●</span> Certificates</span>
                      <strong style={{ color: '#071437', fontSize: 14 }}>{areaChartData.purpleRaw[activeAreaIndex] || 0}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#22C55E', fontSize: 16, lineHeight: 1 }}>●</span> Projects</span>
                      <strong style={{ color: '#071437', fontSize: 14 }}>{areaChartData.greenRaw[activeAreaIndex] || 0}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: -25, left: 0, right: 0, pointerEvents: 'none' }}>
                  {areaChartData.labels.map((label, i) => (
                    <span key={label} style={{ position: 'absolute', left: `${(i / Math.max(1, areaChartData.labels.length - 1)) * 100}%`, transform: 'translateX(-50%)', color: i === activeAreaIndex ? '#450468' : '#A1A5B7', fontWeight: i === activeAreaIndex ? 600 : 'normal', fontSize: 10 }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rep-card">
            <div className="rep-chart-header">
              <div className="rep-chart-title">
                <span className="rep-badge-purple">{uploadsBadge}</span>
                Average uploads
              </div>
              <div className="dropdown learners-performance-period-dropdown">
                <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{barChartPeriod}</span>
                  <img src={hoadowncaret} alt="" />
                </button>
                <ul className="dropdown-menu learners-performance-period-menu">
                  {['Monthly', 'Weekly', 'Quarterly'].map((period) => (
                    <li key={period}>
                      <button
                        type="button"
                        className={`dropdown-item ${barChartPeriod === period ? 'active' : ''}`}
                        onClick={(e) => { preventDefault(e); setBarChartPeriod(period); }}
                      >
                        {period}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', marginTop: 20, height: 220, position: 'relative', width: '100%', paddingBottom: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#A1A5B7', fontSize: 10, paddingRight: 12, position: 'relative', height: '100%' }}>
                {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                  <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? -4 : 0, marginBottom: idx === 9 ? -4 : 0 }}>{y}</span>
                ))}
              </div>

              <div
                style={{ position: 'relative', flex: 1, height: '100%', cursor: 'default' }}
                ref={barWrapRef}
                onMouseMove={handleBarMouseMove}
                onMouseLeave={handleBarMouseLeave}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={{ borderBottom: '1px dashed #EEF1F6', width: '100%', height: 1 }} />
                  ))}
                </div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  {barChartData.bar.map((data, i) => (
                    <div
                      key={barChartData.labels[i]}
                      style={{
                        position: 'absolute',
                        left: `${(i / Math.max(1, barChartData.labels.length - 1)) * 100}%`,
                        transform: `translateX(-50%) translateY(${activeBarIndex === i ? '-1px' : '0'})`,
                        display: 'flex',
                        gap: 4,
                        height: '100%',
                        alignItems: 'flex-end',
                        width: 12,
                        transition: 'transform 0.14s ease',
                      }}
                    >
                      {data.syl > 0 ? (
                        <div style={{ width: 4, height: `${(data.syl / 90) * 100}%`, minHeight: 4, background: '#450468', borderRadius: 4 }} />
                      ) : null}
                      {data.onl > 0 ? (
                        <div style={{ width: 4, height: `${(data.onl / 90) * 100}%`, minHeight: 4, background: '#D8DEE9', borderRadius: 4 }} />
                      ) : null}
                    </div>
                  ))}
                </div>

                <div style={{ position: 'absolute', left: `${(activeBarIndex / Math.max(1, barChartData.labels.length - 1)) * 100}%`, top: '52%', transform: `translate(-${(activeBarIndex / Math.max(1, barChartData.labels.length - 1)) * 100}%, -100%)`, '--caret-pos': `${(activeBarIndex / Math.max(1, barChartData.labels.length - 1)) * 100}%`, paddingBottom: 12, zIndex: 10, pointerEvents: 'none' }}>
                  <div className="rep-chart-tooltip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 11, fontWeight: 'bold' }}>
                      {barChartData.labels[activeBarIndex]}
                      <span style={{ color: '#17C653', fontWeight: 600 }}>
                        <img src={hoaincrease} alt="" style={{ width: 6, marginRight: 4 }} />
                        {uploadsTrendLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#4B5675', marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#450468', fontSize: 14, lineHeight: 1 }}>●</span> Syllabus</span>
                      <strong style={{ color: '#071437' }}>{barChartData.bar[activeBarIndex]?.sylRaw || 0}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#A1A5B7', fontSize: 14, lineHeight: 1 }}>●</span> Online Courses</span>
                      <strong style={{ color: '#071437' }}>{barChartData.bar[activeBarIndex]?.onlRaw || 0}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: -25, left: 0, right: 0, pointerEvents: 'none' }}>
                  {barChartData.labels.map((label, i) => (
                    <span key={label} style={{ position: 'absolute', left: `${(i / Math.max(1, barChartData.labels.length - 1)) * 100}%`, transform: 'translateX(-50%)', color: i === activeBarIndex ? '#450468' : '#A1A5B7', fontWeight: i === activeBarIndex ? 600 : 'normal', fontSize: 10 }}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rep-middle-grid">
          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">GROSS REVENUE</h4>
            </div>
            <div className="rep-revenue-top">
              <div className="rep-rev-icon">
                <img src={hoadollar} alt="Dollar" />
              </div>
              <div className="rep-rev-info">
                <h2>
                  {metrics.revenue != null && metrics.revenue !== ''
                    ? `+ ${formatAmount(Number(metrics.revenue) || 0).replace(' USD', '').replace(' RWF', '')}`
                    : '—'}
                  <span className="rep-stat-currency" style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4 }}>
                    {currency.label} <img src={currency.flag} alt="flag" style={{ width: 14 }} />
                  </span>
                </h2>
                <p>TOTAL REVENUE {reportsApiConnected ? null : <span className="hoa-reports-muted">from dashboard metrics</span>}</p>
              </div>
            </div>
            {revenueBreakdown.length > 0 ? (
              <ul className="rep-revenue-breakdown" style={{ listStyle: 'none', margin: '16px 0 0', padding: 0 }}>
                {revenueBreakdown.map((row) => (
                  <li key={row.type} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: '1px solid #F1F1F4', fontSize: 13 }}>
                    <span>{row.type}</span>
                    <strong>{formatAmount(Number(row.amount) || 0)} · {row.percentage}%</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <HOAEmptyState
                inline
                title="Revenue breakdown unavailable"
                message="Category splits will show here once invoice totals load."
              />
            )}
          </div>

          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">COUNTRIES REPORT</h4>
            </div>
            {countries.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
                {countries.slice(0, 8).map((row) => (
                  <li key={row.country || row.location} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: '1px solid #F1F1F4', fontSize: 13 }}>
                    <span>{row.country || row.location || 'Unknown'}</span>
                    <strong>{row.user_count ?? 0} users · {row.instructors ?? 0} tutors</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <HOAEmptyState
                inline
                title="No country breakdown yet"
                message="Geographic user counts will appear when location data is available."
              />
            )}
          </div>
        </div>

        <div className="rep-table-header-area">
          <div className="rep-table-title">
            <h2>Payment History</h2>
            <p>{reportsApiConnected ? 'Invoice payment history' : 'Awaiting reports API connection'} · <Link to="/hoa/finance">Open Finance</Link></p>
          </div>
          <div className="rep-table-actions">
            <div className="rep-search-box">
              <img src={hoasearch} alt="search" className="search-icon" />
              <div className="search-divider"></div>
              <input
                type="text"
                placeholder="Search payments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={paymentHistory.length === 0}
              />
            </div>
            <div className="rep-filter-dropdown-container" style={{ position: 'relative' }}>
              <button type="button" className="rep-btn-filters" onClick={() => setIsFilterOpen(!isFilterOpen)} disabled={paymentHistory.length === 0}>
                <img src={hoafilter} alt="" style={{ width: 14 }} /> {selectedFilter === 'All Status' ? 'Filters' : selectedFilter}
              </button>
              {isFilterOpen && (
                <div className="learners-performance-period-menu" style={{ position: 'absolute', background: '#FFF', top: '100%', right: 0, marginTop: '8px', zIndex: 10 }}>
                  {['All Status', 'Completed', 'In Progress', 'Failed'].map((option) => (
                    <div
                      key={option}
                      className={`dropdown-item ${selectedFilter === option ? 'active' : ''}`}
                      onClick={() => { setSelectedFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rep-table-wrapper">
          <table className="rep-table">
            <thead>
              <tr>
                <th className="sticky-col-1" style={{ width: '40px', textAlign: 'center' }}>
                  <button type="button" className="minus-btn-container minus-select-button" onClick={clearSelectedRows}>
                    <div className="rep-minus-box">-</div>
                  </button>
                </th>
                <th className="sticky-col-2">
                  <div className="th-inner" onClick={() => handleSort('tutorName')}>
                    Tutor Details ({totalItems})
                    <span className={`sort-icon ${sortConfig.key === 'tutorName' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('course')}>
                    Course name
                    <span className={`sort-icon ${sortConfig.key === 'course' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('amount')}>
                    Payment Method <img src={currency.flag} alt="flag" style={{ width: 14 }} />
                    <span className={`sort-icon ${sortConfig.key === 'amount' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('reason')}>
                    Payment Reason
                    <span className={`sort-icon ${sortConfig.key === 'reason' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('role')}>
                    Role
                    <span className={`sort-icon ${sortConfig.key === 'role' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('status')}>
                    Status
                    <span className={`sort-icon ${sortConfig.key === 'status' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((row) => (
                <tr key={row.id} className={selectedRows.includes(row.id) ? 'selected-row' : ''}>
                  <td className="sticky-col-1" style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="rep-checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="sticky-col-2">
                    <div className="rep-td-tutor">
                      <strong>{row.tutorName}</strong>
                      <span>{row.location}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rep-td-course">
                      <strong>{row.course}</strong>
                      <span>{row.date}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rep-td-payment">
                      <strong>{row.amount == null ? '—' : formatAmount(row.amount)}</strong>
                      <span>{row.payMethod}</span>
                    </div>
                  </td>
                  <td><span className="rep-td-reason">{row.reason}</span></td>
                  <td><span className="rep-td-role">{row.role}</span></td>
                  <td>
                    <span className={`rep-status rep-st-${row.statusColor}`}>
                      <span className="dot"></span> {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <HOATableEmptyRow
                  colSpan={7}
                  title="No payment history yet"
                  message={
                    reportsApiConnected
                      ? 'No paid invoices match the current filters.'
                      : 'Payment records will appear here once the admin reports API is connected.'
                  }
                />
              )}
            </tbody>
          </table>
        </div>

        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown mx-8">
              <button type="button" className="page-size-button px-8-py-2" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map((opt) => (
                    <button key={opt} type="button" className="page-size-option" onClick={() => { setPageSize(opt); setIsPageSizeOpen(false); }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            per page
          </div>
          <div className="hoa-pagination">
            <span className="page-range">
              {totalItems === 0 ? '0' : `1-${Math.min(limit, totalItems)}`} of {totalItems}
            </span>
            <button className="page-nav" disabled={totalPages <= 1}><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: 0.5 }} alt="Prev" /></button>
            <button className="page-num active">1</button>
            <button className="page-nav" disabled={totalPages <= 1}><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: 0.5 }} alt="Next" /></button>
          </div>
        </div>
        </>
        )}

      </div>
    </HOALayout>
  );
};

export default HOAReports;
