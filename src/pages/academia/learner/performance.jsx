import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import './index.css';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import certt from '../../../assets/icons/certt.svg';
import right1 from '../../../assets/icons/right1.svg';
import calendar2 from '../../../assets/icons/calendar2.svg';
import filtersIcon from '../../../assets/icons/filters-icon.svg';
import fe3 from '../../../assets/icons/fe3.svg';
import arrowsLoop from '../../../assets/icons/arrows-loop.svg';
import resumeIcon from '../../../assets/icons/resume.svg';
import './performance.css';

function LearnersPerformance() {
  const preventDefault = (e) => e.preventDefault();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  // State for Chart highlight (nexus) and Checkboxes (echo)
  const [nexus, setNexus] = useState(0);
  const [selectedEcho, setSelectedEcho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceState, setPerformanceState] = useState(null);
  const [certificateStatsState, setCertificateStatsState] = useState(null);
  const [certificatesState, setCertificatesState] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadPerformance = async () => {
      setLoading(true);
      try {
        const [performanceRes, certStatsRes, certListRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/profile/performance?limit=10&offset=0`),
          fetch(`${API_BASE_URL}/api/certificates/user/statistics`),
          fetch(`${API_BASE_URL}/api/certificates/user/my-certificates`),
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
  }, [API_BASE_URL]);

  const metrics = performanceState?.metrics || {};
  const historyRows = performanceState?.assessmentHistory || [];
  const recentCertificates = certificatesState || [];
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
      course: item.courseTitle || item.assessmentTitle || 'Assessment',
      date: item.startTime || item.endTime || item.createdAt ? new Date(item.startTime || item.endTime || item.createdAt).toLocaleDateString() : '--',
      author: item.instructor?.name || item.instructorName || 'Academia',
      score: item.percentage != null ? `${Number(item.percentage).toFixed(1).replace(/\.0$/, '')}%` : (item.score != null ? `${item.score}` : '---'),
      timeTaken: item.duration || item.timeTaken || '--',
      status: item.status === 'graded' ? (item.isPassed ? 'Passed' : 'Failed') : item.status === 'submitted' ? 'Submitted' : 'In Progress',
      statusTone: item.status === 'graded' ? (item.isPassed ? 'passed' : 'failed') : item.status === 'submitted' ? 'progress' : 'progress',
      action: item.status === 'graded' ? 'Download Certificate' : item.status === 'submitted' ? 'View' : 'Resume',
      actionTone: item.status === 'graded' ? 'download' : item.status === 'submitted' ? 'retake' : 'resume',
    }));
  }, [historyRows]);

  // Chart Logic equivalent to PHP rendering
  const chartData = useMemo(() => {
    const values = historyRows
      .slice(-12)
      .map((item) => Number(item.percentage ?? item.score ?? 0))
      .filter((value) => Number.isFinite(value));

    const labels = historyRows
      .slice(-12)
      .map((item) => {
        const date = item.startTime || item.endTime || item.createdAt;
        const parsedDate = date ? new Date(date) : null;
        return parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleString('en-US', { month: 'short' })
          : item.courseTitle?.slice(0, 3).toUpperCase() || '—';
      });

    if (!values.length) return null;

    const width = 560;
    const height = 210;
    const paddingTop = 14;
    const paddingBottom = 16;
    const plotHeight = height - paddingTop - paddingBottom;
    const max = Math.max(100, ...values);
    
    const points = [];
    const pointData = [];

    values.forEach((val, idx) => {
      const x = values.length === 1 ? width / 2 : (width * idx) / (values.length - 1);
      const y = paddingTop + plotHeight - ((val / max) * plotHeight);
      points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
      
      const valStr = val.toFixed(1).replace(/\.0$/, '');
      pointData.push({
        month: labels[idx] || '—',
        value: val,
        label: `${valStr}% Score`,
        xPercent: Number((values.length === 1 ? 50 : ((idx / (values.length - 1)) * 100)).toFixed(2)),
        yPercent: Number(((val / max) * 100).toFixed(2))
      });
    });

    let linePath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i];
        const next = points[i + 1];
        const ctrlX = ((curr.x + next.x) / 2).toFixed(2);
        linePath += ` C ${ctrlX} ${curr.y}, ${ctrlX} ${next.y}, ${next.x} ${next.y}`;
      }
    }

    const areaPath = `${linePath} L ${width} ${paddingTop + plotHeight} L 0 ${paddingTop + plotHeight} Z`;

    return { width, height, points, pointData, linePath, areaPath };
  }, [historyRows]);

  // Handlers for Chart Interactivity
  const handleChartMouseMove = (e) => {
    if (!chartData?.pointData?.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const canvasWidth = rect.width;
    
    let nearestIdx = 0;
    let nearestDist = Infinity;

    chartData.pointData.forEach((pt, idx) => {
      const ptX = canvasWidth * (pt.xPercent / 100);
      const dist = Math.abs(localX - ptX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });
    setNexus(nearestIdx);
  };

  const activePoint = chartData?.pointData?.[nexus] || chartData?.pointData?.[0] || null;
  const hasSummaryData = Object.keys(metrics).length > 0 || recentCertificates.length > 0 || Object.keys(certificateStatsState || {}).length > 0;
  const hasChartSectionData = Boolean(chartData?.pointData?.length);
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

  // Adjust tooltip positioning to prevent overflow (similar to JS logic)
  const tooltipLeftStyle = activePoint ? (activePoint.xPercent < 15 ? '15%' : activePoint.xPercent > 85 ? '85%' : `${activePoint.xPercent}%`) : '50%';

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
              <a className="learners-btn learners-btn-primary" href="/" onClick={preventDefault}>
                <span>Go to website</span>
                <img src={wExitRight} alt="Exit" />
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
                    <div className="learners-performance-chart-top">
                      <div className="learners-performance-chart-badge-row">
                        <span className="learners-performance-score-badge">{metrics.averageScore != null ? `${Number(metrics.averageScore).toFixed(1).replace(/\.0$/, '')}%` : '0%'}</span>
                        <h3>Average score</h3>
                      </div>

                      <div className="dropdown learners-performance-period-dropdown">
                        <button className="dropdown-toggle learners-performance-period-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <span>Monthly</span>
                          <img src={drop1} alt="Dropdown" />
                        </button>
                        <ul className="dropdown-menu learners-performance-period-menu">
                          <li><a className="dropdown-item active" href="/" onClick={preventDefault}>Monthly</a></li>
                          <li><a className="dropdown-item" href="/" onClick={preventDefault}>Weekly</a></li>
                          <li><a className="dropdown-item" href="/" onClick={preventDefault}>Quarterly</a></li>
                        </ul>
                      </div>
                    </div>

                    <div className="learners-performance-chart-wrap">
                      <div className="learners-performance-chart-yaxis">
                        <span>90</span><span>80</span><span>70</span><span>60</span><span>50</span>
                        <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
                      </div>

                      <div 
                        className="learners-performance-chart-canvas" 
                        onMouseMove={handleChartMouseMove}
                        onMouseLeave={() => setNexus(0)}
                      >
                        <div className="learners-performance-chart-grid">
                          {Array.from({ length: 10 }).map((_, i) => <span key={i}></span>)}
                        </div>

                        <svg className="learners-performance-chart-svg" viewBox={`0 0 ${chartData.width} ${chartData.height}`} preserveAspectRatio="none" aria-hidden="true">
                          <path d={chartData.areaPath} className="learners-performance-chart-area"></path>
                          <path d={chartData.linePath} className="learners-performance-chart-line"></path>
                        </svg>

                        <div className="learners-performance-chart-guide" style={{ left: `${activePoint.xPercent}%`, top: `calc(100% - ${activePoint.yPercent}%)` }}></div>
                        <div className="learners-performance-chart-point" style={{ left: `${activePoint.xPercent}%`, top: `calc(100% - ${activePoint.yPercent}%)` }}></div>

                        {chartData.pointData.map((pt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`learners-performance-chart-hotspot ${idx === nexus ? 'is-active' : ''}`}
                            onMouseEnter={() => setNexus(idx)}
                            onFocus={() => setNexus(idx)}
                            style={{ left: `${pt.xPercent}%`, top: `calc(100% - ${pt.yPercent}%)` }}
                            aria-label={`${pt.month} score ${pt.label}`}
                          ></button>
                        ))}

                        <div className="learners-performance-chart-tooltip" style={{ left: tooltipLeftStyle, top: `calc(100% - ${activePoint.yPercent}% - 54px)`, transform: 'translateX(-50%)' }}>
                          <span>{activePoint.month}</span>
                          <strong>{activePoint.label}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="learners-performance-chart-months">
                      {chartData.pointData.map((pt, idx) => (
                        <span key={idx} className={idx === nexus ? 'is-active' : ''} style={{ left: `${pt.xPercent}%` }}>
                          {pt.month}
                        </span>
                      ))}
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
                  <span>Today</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu">
                  <li><a className="dropdown-item active" href="/" onClick={preventDefault}>Today</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>This Week</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>This Month</a></li>
                </ul>
              </div>

              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-filter" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={filtersIcon} alt="Filters" />
                  <span>Filters</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-menu-filter">
                  <li><a className="dropdown-item active" href="/" onClick={preventDefault}>Passed</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>Failed</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>In Progress</a></li>
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
                        <button type="button" className={`learners-performance-history-action is-${husk.actionTone}`}>
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
                  <span>10</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-page-menu">
                  <li><a className="dropdown-item active" href="/" onClick={preventDefault}>10</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>20</a></li>
                  <li><a className="dropdown-item" href="/" onClick={preventDefault}>50</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="learners-performance-history-pagination">
              <span>1-10 of 50</span>
              <button type="button" aria-label="Previous page">&#8592;</button>
              <button type="button" aria-label="Page 1">1</button>
              <button type="button" className="is-active" aria-current="page">2</button>
              <button type="button" aria-label="Page 3">3</button>
              <button type="button" aria-label="Next page">&#8594;</button>
            </div>
          </div>
          )}
        </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersPerformance;