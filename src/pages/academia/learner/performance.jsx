import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import './index.css';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
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
  const [selectedEcho, setSelectedEcho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceState, setPerformanceState] = useState(null);
  const [certificateStatsState, setCertificateStatsState] = useState(null);
  const [certificatesState, setCertificatesState] = useState([]);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timePeriod, setTimePeriod] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    let cancelled = false;

    const loadPerformance = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const [performanceRes, certStatsRes, certListRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/profile/performance?limit=${pageSize}&offset=${offset}&timePeriod=${timePeriod}&status=${status}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/certificates/user/statistics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/certificates/user/my-certificates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (cancelled) return;

        if (performanceRes.status === 'fulfilled') {
          const performanceBody = await performanceRes.value.json();
          const performanceData = extractBody(performanceBody) || {};
          setPerformanceState({
            metrics: performanceData.metrics || {},
            assessmentHistory: performanceData.assessmentHistory || [],
            pagination: performanceData.pagination || {},
          });
        } else {
          setPerformanceState({ metrics: {}, assessmentHistory: [], pagination: {} });
        }

        if (certStatsRes.status === 'fulfilled') {
          const certStatsBody = await certStatsRes.value.json();
          setCertificateStatsState(extractBody(certStatsBody) || {});
        } else {
          setCertificateStatsState({});
        }

        if (certListRes.status === 'fulfilled') {
          const certListBody = await certListRes.value.json();
          setCertificatesState(extractList(certListBody));
        } else {
          setCertificatesState([]);
        }
      } catch (err) {
        console.error('Error loading performance:', err);
        if (!cancelled) {
          setPerformanceState({ metrics: {}, assessmentHistory: [], pagination: {} });
          setCertificateStatsState({});
          setCertificatesState([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPerformance();

    return () => { cancelled = true; };
  }, [API_BASE_URL, page, pageSize, timePeriod, status]);

  const metrics = useMemo(() => performanceState?.metrics || {}, [performanceState?.metrics]);
  const historyRows = useMemo(() => performanceState?.assessmentHistory || [], [performanceState?.assessmentHistory]);
  const recentCertificates = useMemo(() => certificatesState || [], [certificatesState]);
  const topCertificate = recentCertificates[0] || null;

  const slate = [
    { value: metrics.testsTaken ?? metrics.totalTaken ?? 0, label: 'Test Taken' },
    { value: metrics.testsPassed ?? metrics.totalPassed ?? 0, label: 'Test Passed', trend: metrics.passRate != null ? `${metrics.passRate}%` : '', trendTone: 'up' },
    { value: metrics.averageScore != null ? `${metrics.averageScore}%` : '0%', label: 'Average Score', trend: '', trendTone: 'up' },
    { value: metrics.certificatesEarned ?? certificateStatsState?.total_certificates ?? 0, label: 'Certificates Earned' },
  ];

  const genesis = [
    { color: '#F23C72', range: '0-59', status: 'FAIL (F)' },
    { color: '#F2C335', range: '60 - 79', status: 'TRIED (T)' },
    { color: '#22C55E', range: '80 - 100', status: 'PASS (P)' },
  ];

  const apex = useMemo(() => {
    return historyRows.slice(0, 4).map((item) => {
      const date = item.startTime || item.endTime || item.createdAt || '';
      const parsedDate = date ? new Date(date) : null;
      const label = parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleString('en-US', { day: '2-digit' })
        : '00';

      return {
        date: label,
        title: item.courseTitle || item.assessmentTitle || 'Assessment',
        meta: item.assessmentType || item.status || 'Assessment',
        time: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        status: item.status === 'graded' ? 'Read' : item.status === 'submitted' ? 'Review' : 'In Progress',
        statusTone: item.status === 'graded' ? 'read' : item.status === 'submitted' ? 'meeting' : 'read',
      };
    });
  }, [historyRows]);

  const zenith = useMemo(() => {
    return historyRows.map((item, idx) => ({
      id: item.id || idx,
      courseId: item.courseId,
      category: item.category,
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
    }));
  }, [historyRows]);

  const totalItems = performanceState?.pagination?.total || 0;
  const totalPages = performanceState?.pagination?.pages || 1;
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

    historyRows.forEach(item => {
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
  }, [historyRows, areaChartPeriod]);

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
  const hasChartSectionData = historyRows.length > 0;
  const hasScheduleData = apex.length > 0;
  const hasHistoryData = zenith.length > 0;
  const hasCertificateData = Boolean(topCertificate);
  const hasPerformanceData = hasSummaryData || hasChartSectionData || hasScheduleData || hasHistoryData || hasCertificateData;

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

  if (!hasPerformanceData) {
    return (
      <LearnersPageShell>
        <section className="learners-performance-page">
          <div className="learners-card learners-empty-state learners-empty-state--compact">
            <h3>No performance data yet</h3>
            <div>
              <button className="learners-btn learners-btn-primary" disabled>Browse courses</button>
              <button className="learners-btn learners-btn-secondary" disabled>View certificates</button>
            </div>
          </div>
        </section>
      </LearnersPageShell>
    );
  }

  // Tooltip positioning is handled via responsive transform shifts

  // Handlers for Table Checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEcho(zenith.map((_, i) => i));
    } else {
      setSelectedEcho([]);
    }
  };

  const handleSelectOne = (idx) => {
    setSelectedEcho((prev) => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <LearnersPageShell>
      <section className="learners-performance-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>My Performance</h1>
            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/" onClick={preventDefault}>
                <img src={acSav} alt="Save" />
                <span>Saved Library</span>
              </a>
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
                {hasChartSectionData ? (
                  <>
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
                  </>
                ) : (
                  <div className="learners-card learners-empty-state learners-empty-state--compact">
                    <h3>No chart data yet</h3>
                    <p>Your score trend will show up after you submit assessments.</p>
                    <button className="learners-btn learners-btn-primary" type="button" onClick={() => navigate('/academia/learner/available-test')}>
                      Take an assessment
                    </button>
                  </div>
                )}
              </section>

              <section className="learners-performance-side-summary">
                <div className="learners-performance-donut-wrap">
                  <div className="learners-performance-donut"></div>

                  <div className="learners-performance-legend">
                    {genesis.map((husk, idx) => (
                      <div key={idx} className="learners-performance-legend-item">
                        <span className="learners-performance-legend-dot" style={{ '--legend-color': husk.color }}></span>
                        <span>{husk.range}</span>
                        <strong>{husk.status}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="learners-performance-top-recent">
                  <div className="learners-performance-top-recent-head">
                    <h3>Top Recent</h3>
                    <p>{topCertificate?.issue_date || historyRows[0]?.startTime || 'Completed recently'}</p>
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
                    <a href={topCertificate.certificate_url || '/'} className="learners-performance-download-link" onClick={preventDefault}>
                      <span>Download your certificates</span>
                      <img src={right1} alt="Download" />
                    </a>
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
              <a href="/" onClick={preventDefault}>See All</a>
            </div>

            <div className="learners-performance-schedule-list">
              {!hasScheduleData ? (
                <div className="learners-card learners-empty-state learners-empty-state--compact">
                  <h3>No schedule items</h3>
                  <p>Your weekly plan will populate when assessments or learning tasks are scheduled.</p>
                </div>
              ) : (
                apex.map((husk, idx) => (
                  <article key={idx} className="learners-performance-schedule-item">
                    <div className="learners-performance-schedule-date">{husk.date}</div>
                    <div className="learners-performance-schedule-copy">
                      <h4>{husk.title}</h4>
                      <p>{husk.meta}</p>
                      <div className="learners-performance-schedule-meta">
                        <span>{husk.time}</span>
                        <span>•</span>
                        <strong className={`is-${husk.statusTone}`}>{husk.status}</strong>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </section>

        <section className="learners-performance-history">
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

          <div className="learners-performance-history-table-wrap">
            {!hasHistoryData ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>No assessment history</h3>
                <p>Run your first assessment to see it listed here.</p>
                <button className="learners-btn learners-btn-primary" type="button" onClick={() => navigate('/academia/learner/available-test')}>
                  Take an assessment
                </button>
              </div>
            ) : (
              <table className="learners-performance-history-table">
                <thead>
                  <tr>
                    <th className="is-checkbox">
                      <label className="learners-performance-checkbox" aria-label="Select all assessments">
                        <input 
                          type="checkbox" 
                          checked={selectedEcho.length === zenith.length && zenith.length > 0}
                          ref={(input) => {
                            if (input) input.indeterminate = selectedEcho.length > 0 && selectedEcho.length < zenith.length;
                          }}
                          onChange={handleSelectAll} 
                        />
                        <span></span>
                      </label>
                    </th>
                    <th><span className="learners-performance-table-head-text">Client Details</span></th>
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
                      <td className="is-checkbox">
                        <label className="learners-performance-checkbox" aria-label={`Select ${husk.course}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedEcho.includes(idx)} 
                            onChange={() => handleSelectOne(idx)} 
                          />
                          <span></span>
                        </label>
                      </td>
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
                            } else {
                              navigate(`/academia/learner/read-contents?id=${husk.courseId}`, { state: { courseId: husk.courseId } });
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

          {hasHistoryData && (
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