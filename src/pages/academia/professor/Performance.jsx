import React, { useState, useRef, useEffect } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './performance.css';

const Performance = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Data States ---
  const performanceStats = [
    { value: '23.3K RF', label: 'Total Paid', trend: '-4.5%', trendTone: 'down' },
    { value: '6.7K RF', label: 'Course Payments' },
    { value: '16.6K RF', label: 'Syllabus Payment' },
    { value: '65.2', label: 'Average Score', trend: '+4.1', trendTone: 'up' },
    { value: '8', label: 'Certificates Approved' },
  ];

  const [chartPeriod, setChartPeriod] = useState('Weekly');
  const chartDataMap = {
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      syllabus: [80, 20, 36, 70, 26, 70, 36, 19, 48, 79, 53, 14],
      online: [65, 32, 23, 5, 14, 53, 34, 15, 33, 88, 39, 65]
    },
    Weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      syllabus: [40, 60, 20, 80, 50, 30, 70],
      online: [30, 50, 10, 60, 40, 20, 50]
    },
    Quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      syllabus: [60, 80, 50, 90],
      online: [50, 70, 40, 80]
    }
  };
  const currentChartData = chartDataMap[chartPeriod];
  const chartMax = 90;

  const performanceLegend = [
    { color: '#F23C72', range: '0-59', status: 'FAIL (F)' },
    { color: '#F2C335', range: '60 - 79', status: 'TRIED (T)' },
    { color: '#22C55E', range: '80 - 100', status: 'PASS (P)' },
  ];

  const weeklySchedule = [
    { date: '06', title: 'ENGLISH', meta: '1 of 2 Assessment', time: '10:00 AM', status: 'Online meeting', statusTone: 'meeting' },
    { date: '07', title: 'Software Development', meta: '11 of 20 chapters', time: '10:00 AM', status: 'Read', statusTone: 'read' },
    { date: '08', title: 'ENGLISH', meta: '12 of 20 chapters', time: '10:00 AM', status: 'Read', statusTone: 'read' },
    { date: '09', title: 'ENGLISH', meta: '2 of 2 Assessment', time: '10:00 AM', status: 'Online meeting', statusTone: 'meeting' },
  ];

  const allPaymentHistory = [
    { id: 1, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Upload', payee: 'Alexis Ndayambaje Froduard', country: 'Rwanda', grossPaid: '1.4 USD', fee: '0.4 USD', netPaid: '1.0 USD', status: 'Paid', statusTone: 'passed' },
    { id: 2, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Certificate Purchase', payee: 'Nagy Timea', country: 'Russia', grossPaid: '1.5 USD', fee: '0.4 USD', netPaid: '1.1 USD', status: 'Paid', statusTone: 'passed' },
    { id: 3, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Upload', payee: 'Illés Éva', country: 'America', grossPaid: '---', fee: '---', netPaid: '---', status: 'Pending', statusTone: 'progress' },
    { id: 4, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Payment Course Plan', payee: 'Halász Emese', country: 'Burundi', grossPaid: '3 USD', fee: '0.4 USD', netPaid: '2.6 USD', status: 'Paid', statusTone: 'passed' },
    { id: 5, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Purchase', payee: 'Soós Annamária', country: 'Rwanda', grossPaid: '2.1 USD', fee: '0.4 USD', netPaid: '1.7 USD', status: 'Paid', statusTone: 'passed' },
    { id: 6, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Purchase', payee: 'Varga Dóra', country: 'Rwanda', grossPaid: '1 USD', fee: '0.4 USD', netPaid: '0.6 USD', status: 'Paid', statusTone: 'passed' },
    { id: 7, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Upload', payee: 'Hajdú Dominika', country: 'Rwanda', grossPaid: '---', fee: '---', netPaid: '---', status: 'Pending', statusTone: 'progress' },
    { id: 8, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Purchase', payee: 'Kiss Dorka', country: 'Rwanda', grossPaid: '---', fee: '---', netPaid: '---', status: 'Pending', statusTone: 'progress' },
    { id: 9, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Course Upload', payee: 'Virág Mercédesz', country: 'Mexico', grossPaid: '4 USD', fee: '0.4 USD', netPaid: '3.6 USD', status: 'Paid', statusTone: 'passed' },
    { id: 10, course: 'Javascript Fundamental Quiz', date: '12 Jan 2024', reason: 'Payment Course Plan', payee: 'László Cintia', country: 'America', grossPaid: '---', fee: '---', netPaid: '---', status: 'Pending', statusTone: 'progress' },
  ];

  // --- Bar Chart Logic ---
  const currentMonthIndex = new Date().getMonth();
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const currentQuarterIndex = Math.floor(currentMonthIndex / 3);

  const getDefaultActiveIndex = (period) => {
    if (period === 'Monthly') return currentMonthIndex;
    if (period === 'Weekly') return currentDayIndex;
    if (period === 'Quarterly') return currentQuarterIndex;
    return 0;
  };

  const [activeBarIndex, setActiveBarIndex] = useState(() => getDefaultActiveIndex('Weekly'));
  const chartWrapRef = useRef(null);

  useEffect(() => {
    setActiveBarIndex(getDefaultActiveIndex(chartPeriod));
  }, [chartPeriod]);

  const handleBarHover = (index) => {
    setActiveBarIndex(index);
  };

  const handleChartMouseMove = (e) => {
    if (!chartWrapRef.current) return;
    const rect = chartWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = chartDataMap[chartPeriod].labels.length - 1;
    let index = Math.round((x / rect.width) * numPoints);
    setActiveBarIndex(Math.max(0, Math.min(index, numPoints)));
  };

  const handleChartMouseLeave = () => {
    setActiveBarIndex(getDefaultActiveIndex(chartPeriod));
  };

  // --- Donut Chart Logic ---
  const donutRef = useRef(null);
  const [donutTooltip, setDonutTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const handleDonutMove = (e) => {
    if (!donutRef.current) return;
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

    // Calculate angle matching CSS conic-gradient (starts at top, clockwise)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const normalized = (angle + 450) % 360;
    const percent = normalized / 3.6;
    
    let label = '';
    if (percent >= 0 && percent < 24) label = '23 Failed';
    else if (percent >= 24 && percent < 39) label = '16 Tried';
    else label = '61 Passed';

    // Position tooltip relative to the wrapper
    const wrapRect = donutRef.current.parentElement.getBoundingClientRect();
    setDonutTooltip({
      visible: true,
      text: label,
      x: e.clientX - wrapRect.left + 4,
      y: e.clientY - wrapRect.top,
    });
  };

  const handleDonutLeave = () => {
    setDonutTooltip({ ...donutTooltip, visible: false });
  };

  // --- Payment History Table Logic ---
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allPaymentHistory.length / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const currentPayments = allPaymentHistory.slice(startIndex, startIndex + pageSize);

  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const selectAllRef = useRef(null);

  const isAllVisibleSelected = currentPayments.length > 0 && currentPayments.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = currentPayments.some(row => selectedRowIds.has(row.id));

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = new Set(selectedRowIds);
    currentPayments.forEach(row => {
      if (isChecked) newSelection.add(row.id);
      else newSelection.delete(row.id);
    });
    setSelectedRowIds(newSelection);
  };

  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRowIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedRowIds(newSelection);
  };

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  return (
    <ProfessorLayout currentPage="performance">
      <section className="learners-performance-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Analytics & Payments</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/ac-sav.svg" alt="" />
                <span>Saved Library</span>
              </a>

              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                <span>Go to website</span>
                <img src="/assets/icons/w-exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        <section className="learners-performance-stats-card" aria-label="Performance summary">
          {performanceStats.map((stat, index) => (
            <article key={index} className={`learners-performance-stat ${index < performanceStats.length - 1 ? 'has-divider' : ''}`}>
              <strong>{stat.value}</strong>
              <div className="learners-performance-stat-meta">
                <span>{stat.label}</span>
                {stat.trend && (
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
              
              {/* --- Chart Area --- */}
              <section className="learners-performance-chart-card">
                <div className="learners-performance-chart-top">
                  <div className="learners-performance-chart-badge-row">
                    <span className="learners-performance-score-badge">89.7%</span>
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

                <div className="learners-performance-chart-wrap">
                  <div className="learners-performance-chart-yaxis">
                    {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map(tick => (
                      <span key={tick}>{tick}</span>
                    ))}
                  </div>

                  <div 
                    className="learners-performance-chart-canvas" 
                    ref={chartWrapRef}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={handleChartMouseLeave}
                  >
                    <div className="learners-performance-chart-grid">
                      {Array.from({ length: 10 }).map((_, i) => <span key={i}></span>)}
                    </div>

                    <div className="learners-performance-bars" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${currentChartData.labels.length}, minmax(0, 1fr))` }}>
                      {currentChartData.labels.map((month, index) => (
                        <div
                          key={index}
                          className={`learners-performance-bar-group ${index === activeBarIndex ? 'is-active' : ''}`}
                          onMouseEnter={() => handleBarHover(index)}
                        >
                          <span className="learners-performance-bar learners-performance-bar--syllabus" style={{ height: `${(currentChartData.syllabus[index] / chartMax) * 100}%` }}></span>
                          <span className="learners-performance-bar learners-performance-bar--online" style={{ height: `${(currentChartData.online[index] / chartMax) * 100}%` }}></span>
                        </div>
                      ))}
                    </div>

                    {/* Tooltip positions dynamically based on activeBarIndex */}
                    <div 
                      className="learners-performance-chart-tooltip learners-performance-chart-tooltip--bars" 
                      style={{ 
                        left: `${(activeBarIndex / Math.max(1, currentChartData.labels.length - 1)) * 100}%`, 
                        top: '52%',
                        transform: `translateX(-${(activeBarIndex / Math.max(1, currentChartData.labels.length - 1)) * 100}%)`,
                        '--caret-pos': `${(activeBarIndex / Math.max(1, currentChartData.labels.length - 1)) * 100}%`,
                        opacity: 1 // Managed purely by location in React
                      }}
                    >
                      <span>Stats</span>
                      <strong>+ 20%</strong>
                      <div className="learners-performance-chart-tooltip-row">
                        <i className="is-syllabus"></i><span>Syllabus :</span><b>{currentChartData.syllabus[activeBarIndex]}</b>
                      </div>
                      <div className="learners-performance-chart-tooltip-row">
                        <i className="is-online"></i><span>Online Courses :</span><b>{currentChartData.online[activeBarIndex]}</b>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="learners-performance-chart-months" style={{ gridTemplateColumns: `repeat(${currentChartData.labels.length}, minmax(0, 1fr))` }}>
                  {currentChartData.labels.map((month, index) => (
                    <span key={index} className={index === activeBarIndex ? 'is-active' : ''}>{month}</span>
                  ))}
                </div>
              </section>

              {/* --- Side Summary (Donut Chart & Top Recent) --- */}
              <section className="learners-performance-side-summary">
                <div className="learners-performance-donut-wrap">
                  <div
                    className="learners-performance-donut"
                    ref={donutRef}
                    onMouseMove={handleDonutMove}
                    onMouseLeave={handleDonutLeave}
                  ></div>
                  
                  {!donutTooltip.visible ? null : (
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
                </div>

                <div className="learners-performance-top-recent">
                  <div className="learners-performance-top-recent-head">
                    <h3>Top Learned</h3>
                    <p>Completed on Wed, 23 March 2026</p>
                  </div>

                  <article className="learners-performance-recent-card">
                    <div className="learners-performance-recent-badge">
                      <img src="/assets/icons/certt.svg" alt="Badge" />
                      <span>100%</span>
                    </div>

                    <div className="learners-performance-recent-copy">
                      <h4>ENGLISH</h4>
                      <p><strong>21</strong> of 21 Assessment</p>
                      <div className="learners-performance-recent-meta">
                        <span>89.2%</span>
                        <span>•</span>
                        <span>23 March 2026</span>
                      </div>
                    </div>
                  </article>

                  <a href="#" className="learners-performance-download-link" onClick={preventDefault}>
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
              <a href="#" onClick={preventDefault}>See All</a>
            </div>

            <div className="learners-performance-schedule-list">
              {weeklySchedule.map((scheduleItem, idx) => (
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
              ))}
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
                  <span>Today</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu">
                  <li><a className="dropdown-item active" href="#" onClick={preventDefault}>Today</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>This Week</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>This Month</a></li>
                </ul>
              </div>

              <div className="dropdown learners-performance-history-dropdown">
                <button type="button" className="dropdown-toggle learners-performance-history-tool learners-performance-history-tool-filter" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/filters-icon.svg" alt="" />
                  <span>Filters</span>
                </button>
                <ul className="dropdown-menu learners-performance-history-menu learners-performance-history-menu-filter">
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>All Statuses</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>Passed</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>Failed</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>In Progress</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="learners-performance-history-table-wrap">
            <table className="learners-performance-history-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="learners-performance-checkbox" aria-label="Select all assessments">
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
                {currentPayments.map((historyItem) => (
                  <tr key={historyItem.id}>
                    <td className="is-checkbox">
                      <label className="learners-performance-checkbox" aria-label={`Select ${historyItem.course}`}>
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
                ))}
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
                  <li><a className="dropdown-item active" href="#" onClick={(e) => { e.preventDefault(); setPageSize(10); setCurrentPage(1); }}>10</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(20); setCurrentPage(1); }}>20</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(50); setCurrentPage(1); }}>50</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="learners-performance-history-summary">
              <span>Total Payments</span>
              <strong>9.6 USD</strong>
            </div>

            <div className="learners-performance-history-pagination">
              <span>{Math.min(startIndex + 1, allPaymentHistory.length)}-{Math.min(startIndex + pageSize, allPaymentHistory.length)} of {allPaymentHistory.length}</span>
              <button type="button" aria-label="Previous page" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>&#8592;</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  type="button" 
                  className={currentPage === num ? 'is-active' : ''} 
                  onClick={() => setCurrentPage(num)}
                  aria-label={`Page ${num}`}
                >
                  {num}
                </button>
              ))}
              <button type="button" aria-label="Next page" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>&#8594;</button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default Performance;