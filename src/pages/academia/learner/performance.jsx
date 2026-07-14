import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import './index.css';
import { buildReaderUrl, buildScheduleItems } from './homeDashboardUtils';
import LearnerLoadError from './LearnerLoadError';

// Icons & Images
import SavedLibraryButton from './SavedLibraryButton';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import certt from '../../../assets/icons/certt.svg';
import right1 from '../../../assets/icons/right1.svg';
import calendar2 from '../../../assets/icons/calendar2.svg';
import filtersIcon from '../../../assets/icons/filters-icon.svg';
import fe3 from '../../../assets/icons/fe3.svg';
import arrowsLoop from '../../../assets/icons/arrows-loop.svg';
import resumeIcon from '../../../assets/icons/resume.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import './performance.css';

const extractBody = (body) => body?.data?.data || body?.data || body;
const extractList = (body) => {
  const data = extractBody(body);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.assessmentHistory)) return data.assessmentHistory;
  if (Array.isArray(data?.certificates)) return data.certificates;
  return [];
};

function LearnersPerformance() {
  const preventDefault = (e) => e.preventDefault();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // State for Chart and Checkboxes
  const [areaChartPeriod, setAreaChartPeriod] = useState('Monthly');
  const [activeAreaIndex, setActiveAreaIndex] = useState(0);
  const areaWrapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [performanceLoaded, setPerformanceLoaded] = useState(false);
  const [summaryState, setSummaryState] = useState(null);
  const [historyState, setHistoryState] = useState({ assessmentHistory: [], pagination: {} });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyReloadToken, setHistoryReloadToken] = useState(0);
  const [certificateStatsState, setCertificateStatsState] = useState(null);
  const [certificatesState, setCertificatesState] = useState([]);
  const [dashboardBody, setDashboardBody] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timePeriod, setTimePeriod] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const loadPerformanceSummary = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setPerformanceLoaded(false);
        setLoadError('');
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const [performanceRes, certStatsRes, certListRes, dashboardRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/profile/performance?limit=1000&offset=0&timePeriod=all&status=all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/certificates/user/statistics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/certificates/user/my-certificates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/dashboard/student`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (cancelled) return;

        let performanceOk = false;
        let performanceError = '';

        if (performanceRes.status === 'fulfilled') {
          const res = performanceRes.value;
          let performanceBody = {};
          try {
            performanceBody = await res.json();
          } catch {
            performanceBody = {};
          }

          if (!res.ok) {
            performanceError = performanceBody?.message || 'Could not load performance data.';
          } else {
            performanceOk = true;
            const performanceData = extractBody(performanceBody) || {};
            setSummaryState({
              metrics: performanceData.metrics || {},
              assessmentHistory: performanceData.assessmentHistory || [],
            });
            setPerformanceLoaded(true);
          }
        } else {
          performanceError = 'Could not load performance data.';
        }

        if (!performanceOk && !cancelled) {
          setLoadError(performanceError);
          setPerformanceLoaded(false);
        }

        if (certStatsRes.status === 'fulfilled' && certStatsRes.value.ok) {
          const certStatsBody = await certStatsRes.value.json();
          setCertificateStatsState(extractBody(certStatsBody) || {});
        } else {
          setCertificateStatsState({});
        }

        if (certListRes.status === 'fulfilled' && certListRes.value.ok) {
          const certListBody = await certListRes.value.json();
          setCertificatesState(extractList(certListBody));
        } else {
          setCertificatesState([]);
        }

        if (dashboardRes?.status === 'fulfilled' && dashboardRes.value.ok) {
          const dashboardJson = await dashboardRes.value.json();
          setDashboardBody(dashboardJson);
          setEnrolledCourses(Array.isArray(dashboardJson?.data?.enrolledCourses) ? dashboardJson.data.enrolledCourses : []);
        } else {
          setDashboardBody(null);
          setEnrolledCourses([]);
        }
      } catch (err) {
        console.error('Error loading performance:', err);
        if (!cancelled) {
          setLoadError(err?.message || 'Could not load performance data.');
          setPerformanceLoaded(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPerformanceSummary();

    return () => { cancelled = true; };
  }, [API_BASE_URL, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    const loadAssessmentHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setHistoryLoading(true);
      setHistoryError('');
      try {
        const offset = (page - 1) * pageSize;
        const res = await fetch(
          `${API_BASE_URL}/api/profile/performance?limit=${pageSize}&offset=${offset}&timePeriod=${timePeriod}&status=${status}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let body = {};
        try {
          body = await res.json();
        } catch {
          body = {};
        }

        if (cancelled) return;

        if (!res.ok) {
          setHistoryError(body?.message || 'Could not load assessment history.');
          setHistoryState({ assessmentHistory: [], pagination: {} });
          return;
        }

        const performanceData = extractBody(body) || {};
        setHistoryState({
          assessmentHistory: performanceData.assessmentHistory || [],
          pagination: performanceData.pagination || {},
        });
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err?.message || 'Could not load assessment history.');
          setHistoryState({ assessmentHistory: [], pagination: {} });
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadAssessmentHistory();

    return () => { cancelled = true; };
  }, [API_BASE_URL, page, pageSize, timePeriod, status, reloadToken, historyReloadToken]);

  const metrics = useMemo(() => summaryState?.metrics || {}, [summaryState?.metrics]);
  const chartHistoryRows = useMemo(() => summaryState?.assessmentHistory || [], [summaryState?.assessmentHistory]);
  const historyRows = useMemo(() => historyState.assessmentHistory || [], [historyState.assessmentHistory]);
  const recentCertificates = useMemo(() => certificatesState || [], [certificatesState]);
  const topCertificate = recentCertificates[0] || null;

  const slate = [
    { value: metrics.testsTaken ?? metrics.totalTaken ?? 0, label: 'Test Taken' },
    { value: metrics.testsPassed ?? metrics.totalPassed ?? 0, label: 'Test Passed', trend: metrics.passRate != null ? `${metrics.passRate}%` : '', trendTone: 'up' },
    { value: metrics.averageScore != null ? `${metrics.averageScore}%` : '0%', label: 'Average Score', trend: '', trendTone: 'up' },
    { value: metrics.certificatesEarned ?? certificateStatsState?.total_certificates ?? 0, label: 'Certificates Earned' },
  ];

  const scoreBreakdown = useMemo(() => {
    const buckets = [
      { color: '#F23C72', range: '0–59%', status: 'Below passing', count: 0 },
      { color: '#F2C335', range: '60–79%', status: 'Almost there', count: 0 },
      { color: '#22C55E', range: '80–100%', status: 'Passed', count: 0 },
    ];

    chartHistoryRows.forEach((item) => {
      if (item.percentage == null && item.score == null) return;
      const pct = Number(item.percentage ?? item.score ?? 0);
      if (pct >= 80) buckets[2].count += 1;
      else if (pct >= 60) buckets[1].count += 1;
      else buckets[0].count += 1;
    });

    const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
    let cursor = 0;
    const gradientStops = buckets
      .filter((bucket) => bucket.count > 0)
      .map((bucket) => {
        const start = cursor;
        cursor += (bucket.count / total) * 100;
        return `${bucket.color} ${start}% ${cursor}%`;
      });

    return {
      buckets,
      total,
      donutBackground: total > 0 ? `conic-gradient(${gradientStops.join(', ')})` : '#E9EDF4',
    };
  }, [chartHistoryRows]);

  const scheduleItems = useMemo(() => buildScheduleItems({
    dashboardBody,
    performanceBody: summaryState ? { data: summaryState } : null,
    enrolledCourses,
    weekAnchor: new Date(),
  }), [dashboardBody, summaryState, enrolledCourses]);

  const zenith = useMemo(() => {
    return historyRows.map((item, idx) => {
      const assessmentId = item.assessmentId || item.assessment_id || item.id;
      const category = String(item.category || item.assessmentType || '').toLowerCase();
      const chapterId = category === 'summative' || item.isSummative
        ? 'assessment'
        : (assessmentId ? `formative-${assessmentId}` : null);

      return {
        id: item.id || idx,
        courseId: item.courseId,
        category: item.category,
        assessmentId,
        chapterId,
        readerUrl: item.courseId ? buildReaderUrl(item.courseId, chapterId) : null,
        isPassed: item.isPassed,
        course: item.courseTitle || item.assessmentTitle || 'Assessment',
        date: item.startTime || item.endTime || item.createdAt ? new Date(item.startTime || item.endTime || item.createdAt).toLocaleDateString() : '--',
        author: item.instructor?.name || item.instructorName || 'Academia',
        score: item.percentage != null ? `${Number(item.percentage).toFixed(1).replace(/\.0$/, '')}%` : (item.score != null ? `${item.score}` : '---'),
        timeTaken: item.duration || item.timeTaken || '--',
        status: item.status === 'graded' ? (item.isPassed ? 'Passed' : 'Failed') : item.status === 'submitted' ? 'Submitted' : 'In Progress',
        statusTone: item.status === 'graded' ? (item.isPassed ? 'passed' : 'failed') : item.status === 'submitted' ? 'progress' : 'progress',
        action: item.status === 'graded' 
          ? (item.category === 'summative' && item.isPassed ? 'Download Certificate' : 'Review')
          : (item.status === 'submitted' ? 'View' : 'Resume'),
        actionTone: item.status === 'graded' 
          ? (item.category === 'summative' && item.isPassed ? 'download' : 'resume')
          : (item.status === 'submitted' ? 'retake' : 'resume'),
      };
    });
  }, [historyRows]);

  const totalItems = historyState.pagination?.total || 0;
  const totalPages = historyState.pagination?.pages || 1;
  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  const currentMonthIndex = new Date().getMonth();
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const currentQuarterIndex = Math.floor(currentMonthIndex / 3);

  const getDefaultActiveIndex = (period, dataLength) => {
    let idx = 0;
    if (period === 'Monthly') idx = currentMonthIndex;
    else if (period === 'Weekly') idx = currentDayIndex;
    else if (period === 'Quarterly') idx = currentQuarterIndex;
    return Math.max(0, Math.min(idx, dataLength - 1));
  };

  const getStudyChartData = useMemo(() => {
    let labels;
    let numSlots;
    if (areaChartPeriod === 'Monthly') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      numSlots = 12;
    } else if (areaChartPeriod === 'Weekly') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      numSlots = 7;
    } else {
      labels = ['Q1', 'Q2', 'Q3', 'Q4'];
      numSlots = 4;
    }

    const formativeScores = Array(numSlots).fill(null).map(() => []);
    const summativeScores = Array(numSlots).fill(null).map(() => []);

    chartHistoryRows.forEach(item => {
      const dStr = item.startTime || item.endTime || item.createdAt;
      if (!dStr) return;
      const date = new Date(dStr);
      if (Number.isNaN(date.getTime())) return;

      let slotIdx = 0;
      if (areaChartPeriod === 'Monthly') {
        slotIdx = date.getMonth();
      } else if (areaChartPeriod === 'Weekly') {
        slotIdx = (date.getDay() + 6) % 7; // Monday = 0
      } else if (areaChartPeriod === 'Quarterly') {
        slotIdx = Math.floor(date.getMonth() / 3);
      }

      const val = Number(item.percentage ?? item.score ?? 0);
      if (item.category === 'summative') {
        summativeScores[slotIdx].push(val);
      } else {
        formativeScores[slotIdx].push(val);
      }
    });

    const quizzes = formativeScores.map(arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    const exams = summativeScores.map(arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    return {
      labels,
      quizzes,
      exams
    };
  }, [chartHistoryRows, areaChartPeriod]);

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

  const hasSummaryData = Object.keys(metrics).length > 0 || recentCertificates.length > 0 || Object.keys(certificateStatsState || {}).length > 0;
  const hasChartSectionData = chartHistoryRows.length > 0;
  const hasScheduleData = scheduleItems.length > 0;
  const hasHistoryData = zenith.length > 0;
  const hasCertificateData = Boolean(topCertificate);
  const historyFiltersActive = timePeriod !== 'all' || status !== 'all';
  const hasPerformanceData = hasSummaryData || hasChartSectionData || hasScheduleData || hasCertificateData;

  const scrollToAssessmentHistory = () => {
    const section = document.getElementById('learners-performance-history');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDownloadTopCertificate = () => {
    const certificateNumber = topCertificate?.certificate_number || topCertificate?.certificateNumber;
    if (certificateNumber) {
      window.open(`${API_BASE_URL}/api/certificates/${certificateNumber}/download`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (topCertificate?.certificate_url) {
      window.open(topCertificate.certificate_url, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate('/academia/learner/certificates');
  };

  if (loading) {
    return (
      <LearnersPageShell>
        <section className="learners-performance-page">
          <div className="learners-card learners-empty-state learners-empty-state--compact">
            <h3>Loading performance…</h3>
            <div>
              <button className="learners-btn learners-btn-primary" disabled>Loading</button>
            </div>
          </div>
        </section>
      </LearnersPageShell>
    );
  }

  if (loadError) {
    return (
      <LearnersPageShell>
        <section className="learners-performance-page">
          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>My Performance</h1>
            </div>
          </section>
          <div className="learners-card learners-empty-state learners-empty-state--compact">
            <h3>Could not load performance</h3>
            <p>{loadError}</p>
            <button
              type="button"
              className="learners-btn learners-btn-primary"
              onClick={() => setReloadToken((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        </section>
      </LearnersPageShell>
    );
  }

  if (performanceLoaded && !hasPerformanceData) {
    return (
      <LearnersPageShell>
        <section className="learners-performance-page">
          <section className="learners-home-title">
            <div className="learners-home-title-top">
              <h1>My Performance</h1>
            </div>
          </section>
          <div className="learners-card learners-empty-state learners-empty-state--compact">
            <h3>No performance data yet</h3>
            <p>Your stats, charts, and assessment history will appear once you start learning and taking tests.</p>
            <div>
              <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                Browse courses
              </button>
              <button type="button" className="learners-btn learners-btn-secondary" onClick={() => navigate('/academia/learner/certificates')}>
                View certificates
              </button>
            </div>
          </div>
        </section>
      </LearnersPageShell>
    );
  }

  return (
    <LearnersPageShell>
      <section className="learners-performance-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>My Performance</h1>
            <div className="learners-home-title-actions">
              <SavedLibraryButton />
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
        </section>

        <section className="learners-performance-stats-card" aria-label="Performance summary">
          {hasSummaryData ? (
            slate.map((husk, idx) => (
              <article key={idx} className={`learners-performance-stat ${idx < slate.length - 1 ? 'has-divider' : ''}`}>
                <strong>{husk.value}</strong>
                <div className="learners-performance-stat-meta">
                  <span>{husk.label}</span>
                  {husk.trend && (
                    <small className={`learners-performance-stat-trend is-${husk.trendTone}`}>
                      <i aria-hidden="true">{husk.trendTone === 'up' ? '↗' : '↘'}</i>
                      <span>{husk.trend}</span>
                    </small>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="learners-card learners-empty-state learners-empty-state--compact">
              <h3>No summary data yet</h3>
              <p>Your progress summary will appear once you start taking assessments or earning certificates.</p>
            </div>
          )}
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
              <section className="learners-performance-chart-card">
                    <div className="rep-chart-header">
                      <div className="rep-chart-title">
                        <span className="rep-badge-purple">{metrics.averageScore != null ? `${Number(metrics.averageScore).toFixed(1).replace(/\.0$/, '')}%` : '0%'}</span>
                        Quizzes & Exams
                      </div>
                      <div className="dropdown learners-performance-period-dropdown">
                        <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <span>{areaChartPeriod}</span>
                          <img src={hoadowncaret} alt="" />
                        </button>
                        <ul className="dropdown-menu learners-performance-period-menu">
                          <li><a className={`dropdown-item ${areaChartPeriod === 'Monthly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Monthly'); setActiveAreaIndex(getDefaultActiveIndex('Monthly', 12)); }}>Monthly</a></li>
                          <li><a className={`dropdown-item ${areaChartPeriod === 'Weekly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Weekly'); setActiveAreaIndex(getDefaultActiveIndex('Weekly', 7)); }}>Weekly</a></li>
                          <li><a className={`dropdown-item ${areaChartPeriod === 'Quarterly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Quarterly'); setActiveAreaIndex(getDefaultActiveIndex('Quarterly', 4)); }}>Quarterly</a></li>
                        </ul>
                      </div>
                    </div>

                    {/* SVG Replica of Area Chart */}
                    <div style={{ display: 'flex', marginTop: '20px', height: '220px', position: 'relative', width: '100%', paddingBottom: '20px' }}>
                      
                      {/* Global Grid Lines */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                          {[...Array(10)].map((_, i) => (
                            <div key={i} style={{ borderBottom: '1.5px dashed #EEF1F6', width: '100%', height: '1px' }}></div>
                          ))}
                      </div>

                      {/* Y-Axis */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#A1A5B7', fontSize: '10px', paddingRight: '12px', position: 'relative', height: '100%' }}>
                        {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                          <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? '-4px' : 0, marginBottom: idx === 10 ? '-4px' : 0, backgroundColor: 'white', zIndex: 1 }}>{y}</span>
                        ))}
                      </div>

                      {/* Chart Content Area */}
                      <div 
                        style={{ position: 'relative', flex: 1, height: '100%', cursor: 'default' }}
                        ref={areaWrapRef}
                        onMouseMove={handleAreaMouseMove}
                        onMouseLeave={handleAreaMouseLeave}
                      >
                        
                        {/* SVG */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                          <svg width="100%" height="100%" viewBox="0 0 110 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(34, 197, 94, 0.15)" />
                                <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
                              </linearGradient>
                              <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(185, 152, 206, 0.25)" />
                                <stop offset="100%" stopColor="rgba(185, 152, 206, 0)" />
                              </linearGradient>
                            </defs>

                            <path d={`${generateSmoothPath(getStudyChartData.exams)} L110,100 L0,100 Z`} fill="url(#areaGreen)" />
                            <path d={generateSmoothPath(getStudyChartData.exams)} fill="none" stroke="#22C55E" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            
                            <path d={`${generateSmoothPath(getStudyChartData.quizzes)} L110,100 L0,100 Z`} fill="url(#areaPurple)" />
                            <path d={generateSmoothPath(getStudyChartData.quizzes)} fill="none" stroke="#B998CE" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                          </svg>
                          
                          {/* Tooltip Overlay Dot & Line */}
                          <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, top: `${100 - getStudyChartData.quizzes[activeAreaIndex]}%`, bottom: '-25px', width: '1px', backgroundColor: '#374151', transform: 'translateX(-50%)' }}></div>
                          <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, top: `${100 - getStudyChartData.quizzes[activeAreaIndex]}%`, width: '14px', height: '14px', backgroundColor: '#450468', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}></div>
                          <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, top: `${100 - getStudyChartData.exams[activeAreaIndex]}%`, width: '14px', height: '14px', backgroundColor: '#22C55E', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}></div>
                        </div>

                        {/* Tooltip Overlay */}
                        <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, top: '52%', transform: `translate(-${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%, -100%)`, '--caret-pos': `${(activeAreaIndex / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, paddingBottom: '12px', zIndex: 10, pointerEvents: 'none', transition: 'left 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease' }}>
                          <div className="rep-chart-tooltip" style={{ padding: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', color: '#071437' }}>
                                {getStudyChartData.labels[activeAreaIndex]}
                            </div>
                            <div style={{ fontSize: '13px', color: '#4B5675', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{color:'#450468', fontSize: 16, lineHeight: 1}}>●</span> Quizzes</span> <strong style={{ color: '#071437', fontSize: '14px' }}>{getStudyChartData.quizzes[activeAreaIndex]}%</strong>
                            </div>
                            <div style={{ fontSize: '13px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{color:'#22C55E', fontSize: 16, lineHeight: 1}}>●</span> Exams</span> <strong style={{ color: '#071437', fontSize: '14px' }}>{getStudyChartData.exams[activeAreaIndex]}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* X Axis Labels */}
                        <div style={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, pointerEvents: 'none' }}>
                          {getStudyChartData.labels.map((m, i) => (
                            <span key={m} style={{ position: 'absolute', left: `${(i / Math.max(1, getStudyChartData.labels.length - 1))*100}%`, transform: 'translateX(-50%)', color: i === activeAreaIndex ? '#450468' : '#A1A5B7', fontWeight: i === activeAreaIndex ? 600 : 'normal', fontSize: '10px' }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
              </section>

              <section className="learners-performance-side-summary">
                <div className="learners-performance-donut-wrap">
                  <div
                    className="learners-performance-donut"
                    style={{ background: scoreBreakdown.donutBackground }}
                    aria-hidden="true"
                  />

                  <div className="learners-performance-legend">
                    {scoreBreakdown.buckets.map((bucket) => (
                      <div key={bucket.range} className="learners-performance-legend-item">
                        <span className="learners-performance-legend-dot" style={{ '--legend-color': bucket.color }}></span>
                        <span>{bucket.range}</span>
                        <strong>{scoreBreakdown.total > 0 ? `${bucket.count} · ${bucket.status}` : bucket.status}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="learners-performance-top-recent">
                  <div className="learners-performance-top-recent-head">
                    <h3>Top Recent</h3>
                    <p>{topCertificate?.issue_date || chartHistoryRows[0]?.startTime || 'Completed recently'}</p>
                  </div>

                  {hasCertificateData ? (
                    <article className="learners-performance-recent-card">
                      <div className="learners-performance-recent-badge">
                        <img src={certt} alt="Badge" />
                        <span>{topCertificate.grade || topCertificate.final_score || '100%'}</span>
                      </div>

                      <div className="learners-performance-recent-copy">
                        <h4>{topCertificate.course_title || topCertificate.courseTitle || 'Certificate'}</h4>
                        <p>
                          <strong>{topCertificate.total_hours || '--'}</strong> of {topCertificate.total_hours || '--'} hours
                        </p>
                        <div className="learners-performance-recent-meta">
                          <span>{topCertificate.final_score != null ? `${topCertificate.final_score}%` : '--'}</span>
                          <span>•</span>
                          <span>{topCertificate.issue_date || '--'}</span>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="learners-card learners-empty-state learners-empty-state--compact">
                      <h3>No certificates yet</h3>
                      <p>Certificates will appear here once an assessment is marked as passed.</p>
                      <button className="learners-btn learners-btn-primary" type="button" onClick={() => navigate('/academia/learner/certificates')}>
                        View certificates
                      </button>
                    </div>
                  )}

                  {hasCertificateData && (
                    <button type="button" className="learners-performance-download-link" onClick={handleDownloadTopCertificate}>
                      <span>Download your certificates</span>
                      <img src={right1} alt="Download" />
                    </button>
                  )}
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
              <button type="button" className="learners-performance-see-all" onClick={scrollToAssessmentHistory}>
                See All
              </button>
            </div>

            <div className="learners-performance-schedule-list">
              {!hasScheduleData ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No schedule items</h3>
                  <p>Your weekly plan will populate when assessments or learning tasks are scheduled.</p>
                </div>
              ) : (
                scheduleItems.map((item) => (
                  <article
                    key={`${item.id}-${item.dateLabel}`}
                    className={`learners-performance-schedule-item ${item.href ? 'is-clickable' : ''}`}
                    onClick={() => item.href && navigate(item.href)}
                    onKeyDown={(event) => {
                      if (item.href && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        navigate(item.href);
                      }
                    }}
                    role={item.href ? 'button' : undefined}
                    tabIndex={item.href ? 0 : undefined}
                  >
                    <div className="learners-performance-schedule-date">{item.dateLabel}</div>
                    <div className="learners-performance-schedule-copy">
                      <h4>{item.title}</h4>
                      <p>{item.progressLabel}: {item.num} of {item.total}</p>
                      <div className="learners-performance-schedule-meta">
                        <span>{item.time}</span>
                        <span>•</span>
                        <strong>{item.meta}</strong>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="learners-performance-history" id="learners-performance-history">
          <div className="learners-performance-history-head">
            <div>
              <h2>Assessment History</h2>
              <p>Course Attended</p>
            </div>

            <div className="learners-performance-history-tools">
              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-date" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={calendar2} alt="Calendar" />
                  <span>{timePeriod === 'all' ? 'All Time' : timePeriod === 'today' ? 'Today' : timePeriod === 'this_week' ? 'This Week' : 'This Month'}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu">
                  <li><a className={`dropdown-item ${timePeriod === 'all' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setTimePeriod('all'); setPage(1); }}>All Time</a></li>
                  <li><a className={`dropdown-item ${timePeriod === 'today' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setTimePeriod('today'); setPage(1); }}>Today</a></li>
                  <li><a className={`dropdown-item ${timePeriod === 'this_week' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setTimePeriod('this_week'); setPage(1); }}>This Week</a></li>
                  <li><a className={`dropdown-item ${timePeriod === 'this_month' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setTimePeriod('this_month'); setPage(1); }}>This Month</a></li>
                </ul>
              </div>

              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-filter" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={filtersIcon} alt="Filters" />
                  <span>{status === 'all' ? 'Filters' : status === 'passed' ? 'Passed' : status === 'failed' ? 'Failed' : 'In Progress'}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-menu-filter">
                  <li><a className={`dropdown-item ${status === 'all' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setStatus('all'); setPage(1); }}>All</a></li>
                  <li><a className={`dropdown-item ${status === 'passed' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setStatus('passed'); setPage(1); }}>Passed</a></li>
                  <li><a className={`dropdown-item ${status === 'failed' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setStatus('failed'); setPage(1); }}>Failed</a></li>
                  <li><a className={`dropdown-item ${status === 'in_progress' ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setStatus('in_progress'); setPage(1); }}>In Progress</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`learners-performance-history-table-wrap ${historyLoading ? 'is-loading' : ''}`}>
            {historyLoading ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>Loading assessment history…</h3>
              </div>
            ) : historyError ? (
              <LearnerLoadError
                title="Could not load assessment history"
                message={historyError}
                onRetry={() => {
                  setHistoryError('');
                  setHistoryReloadToken((value) => value + 1);
                }}
              />
            ) : !hasHistoryData ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>{historyFiltersActive ? 'No assessments match these filters' : 'No assessment history'}</h3>
                <p>
                  {historyFiltersActive
                    ? 'Try a broader date range or clear your status filter.'
                    : 'Run your first assessment to see it listed here.'}
                </p>
                {historyFiltersActive ? (
                  <button
                    className="learners-btn learners-btn-primary"
                    type="button"
                    onClick={() => {
                      setTimePeriod('all');
                      setStatus('all');
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <button className="learners-btn learners-btn-primary" type="button" onClick={() => navigate('/academia/learner/available-test')}>
                    Take an assessment
                  </button>
                )}
              </div>
            ) : (
              <table className="learners-performance-history-table">
                <thead>
                  <tr>
                    <th><span className="learners-performance-table-head-text">Course / Assessment</span></th>
                    <th><span className="learners-performance-table-head-text">Author</span></th>
                    <th><span className="learners-performance-table-head-text">Score</span></th>
                    <th><span className="learners-performance-table-head-text">Time taken</span></th>
                    <th><span className="learners-performance-table-head-text">Status</span></th>
                    <th><span className="learners-performance-table-head-text">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {zenith.map((husk, idx) => (
                    <tr key={husk.id}>
                      <td>
                        <div className="learners-performance-history-course">
                          <strong>{husk.course}</strong>
                          <span>{husk.date}</span>
                        </div>
                      </td>
                      <td className="learners-performance-history-author">{husk.author}</td>
                      <td className="learners-performance-history-score">{husk.score}</td>
                      <td className="learners-performance-history-time">{husk.timeTaken}</td>
                      <td>
                        <span className={`learners-performance-history-status is-${husk.statusTone}`}>{husk.status}</span>
                      </td>
                      <td>
                        <button 
                          type="button" 
                          className={`learners-performance-history-action is-${husk.actionTone}`}
                          onClick={() => {
                            if (husk.action === 'Download Certificate') {
                              navigate('/academia/learner/certificates');
                            } else if (husk.readerUrl) {
                              navigate(husk.readerUrl);
                            } else if (husk.courseId) {
                              navigate(`/academia/learner/read-contents?id=${husk.courseId}`);
                            }
                          }}
                        >
                          {husk.actionTone === 'download' && <img src={fe3} alt="Download" />}
                          {husk.actionTone === 'retake' && <img src={arrowsLoop} alt="Retake" />}
                          {husk.actionTone === 'resume' && <img src={resumeIcon} alt="Resume" />}
                          <span>{husk.action}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!historyLoading && !historyError && totalItems > 0 && (
          <div className="learners-performance-history-footer">
            <div className="learners-performance-history-page-size">
              <span>Show</span>
              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-page-menu">
                  <li><a className={`dropdown-item ${pageSize === 10 ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setPageSize(10); setPage(1); }}>10</a></li>
                  <li><a className={`dropdown-item ${pageSize === 20 ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setPageSize(20); setPage(1); }}>20</a></li>
                  <li><a className={`dropdown-item ${pageSize === 50 ? 'active' : ''}`} href="/" onClick={(e) => { preventDefault(e); setPageSize(50); setPage(1); }}>50</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="learners-performance-history-pagination">
              <span>{startIndex}-{endIndex} of {totalItems}</span>
              <button 
                type="button" 
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
              >
                &#8592;
              </button>
              {pageNumbers.map(num => (
                <button 
                  key={num}
                  type="button" 
                  className={page === num ? 'is-active' : ''}
                  aria-label={`Page ${num}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              <button 
                type="button" 
                aria-label="Next page"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
              >
                &#8594;
              </button>
            </div>
          </div>
          )}
        </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersPerformance;