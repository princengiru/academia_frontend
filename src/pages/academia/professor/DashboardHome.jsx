import React, { useState, useEffect, useRef } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout'; // Fixed relative path to components
import './dashboard-home.css';

const DashboardHome = () => {
  const preventDefault = (e) => e.preventDefault();
  
  // State for Table Checkboxes (Assuming 5 rows for this example)
  const [selectedRows, setSelectedRows] = useState([false, false, false, false, false]);
  const selectAllRef = useRef(null);
  
  // State for pagination highlighting
  const [activePage, setActivePage] = useState(2); // Initially page 2 is active in your HTML

  // Derived state to check if all or some are selected
  const isAllSelected = selectedRows.every(Boolean);
  const isSomeSelected = selectedRows.some(Boolean);

  // Handle the "Select All" checkbox
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRows(selectedRows.map(() => isChecked));
  };

  // Handle individual row checkbox
  const handleSelectRow = (index) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows[index] = !newSelectedRows[index];
    setSelectedRows(newSelectedRows);
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
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/charts.svg" alt="" />
                <span>View Analytics</span>
              </a>

              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
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
                <h3>+ 2.8K</h3>
                <p>Students In Total</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/pi2.svg" alt="Exams" />
                    <span>Exams</span>
                  </div>
                  <a href="#" onClick={preventDefault}>Check Exams</a>
                </div>
                <svg className="prof-stat-sparkline prof-stat-sparkline-red" viewBox="0 0 72 22" aria-hidden="true">
                  <polyline points="2,14 10,16 18,15 26,10 34,11 42,4 50,20 58,6 70,18"></polyline>
                </svg>
                <h3>19.32</h3>
                <p>Average Score</p>
              </div>
              <div className="prof-stat-card">
                <div className="prof-stat-top">
                  <div className="prof-stat-title">
                    <img src="/assets/icons/st3.svg" alt="Certificates" />
                    <span>Certificates</span>
                  </div>
                  <a href="#" onClick={preventDefault}>Check Learners</a>
                </div>
                <svg className="prof-stat-sparkline" viewBox="0 0 72 22" aria-hidden="true">
                  <polyline points="2,15 10,19 18,10 26,6 34,10 42,10 50,12 58,10 70,9"></polyline>
                </svg>
                <h3>3</h3>
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
                    <h4>21</h4>
                    <p>Total Assignments</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-success" aria-hidden="true"><img src="/assets/icons/as2.svg" alt="" /></span>
                  <div>
                    <h4>+ 2.8K</h4>
                    <p>Passed Students</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-warn" aria-hidden="true"><img src="/assets/icons/as3.svg" alt="" /></span>
                  <div>
                    <h4>157</h4>
                    <p>Retakes Taken</p>
                  </div>
                </div>
                <div className="prof-mini-card">
                  <span className="prof-mini-icon prof-mini-icon-danger" aria-hidden="true"><img src="/assets/icons/as4.svg" alt="" /></span>
                  <div>
                    <h4>1.8K</h4>
                    <p>Failed Students</p>
                  </div>
                </div>
              </div>

              <div className="prof-quick-head">
                <h2>Quick Actions</h2>
              </div>

              <div className="prof-quick-actions">
                <button type="button" onClick={preventDefault}><span><img src="/assets/icons/ed.svg" alt="" /></span>Prepare Course</button>
                <button type="button" onClick={preventDefault}><span><img src="/assets/icons/ed.svg" alt="" /></span>Create Test</button>
                <button type="button" onClick={preventDefault}><span><img src="/assets/icons/ed.svg" alt="" /></span>Prepare Syllabus</button>
                <button type="button" onClick={preventDefault}><span><img src="/assets/icons/ed.svg" alt="" /></span>Payment History</button>
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
              <p>Online Course & Past Papers</p>
            </div>
            <div className="prof-table-actions">
              <div className="prof-table-search">
                <img src="/assets/icons/search.svg" alt="" />
                <input type="search" placeholder="Search Lessons..." aria-label="Search Lessons" />
              </div>

              <div className="dropdown">
                <button type="button" className="dropdown-toggle prof-table-btn prof-table-btn--filter" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/assets/icons/filters-icon.svg" alt="" />
                  <span>Filters</span>
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>All</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>Completed</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>Not</a></li>
                </ul>
              </div>

              <button type="button" className="prof-table-btn" onClick={preventDefault}>
                <span><img src="/assets/icons/plus1.svg" alt="" /> Create new test</span>
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
                    <span className="prof-table-head-text">Assignment Details (23)</span>
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
              <tbody>
                
                {/* Row 1 */}
                <tr>
                  <td className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select row #7">
                      <input 
                        type="checkbox" 
                        checked={selectedRows[0]}
                        onChange={() => handleSelectRow(0)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td className="prof-table-rank">#7</td>
                  <td>
                    <div className="prof-table-details">
                      <strong>Javascript Fundamental Quiz</strong>
                      <span>1 day ago</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-type">
                      <strong>Course</strong>
                      <span>12 Weeks</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-students">
                      <strong>231</strong>
                      <span><img src="/assets/icons/eye.svg" alt="" /> 2.4K Views</span>
                    </div>
                  </td>
                  <td className="prof-table-score">34.67</td>
                  <td className="prof-table-rating">3.4 <img src="/assets/icons/star.svg" alt="" /></td>
                  <td className="prof-table-profit">222.3 USD</td>
                  <td className="prof-table-status">
                    <span className="prof-status-pill prof-status-pill--ok"><span className="dot"></span> Completed</span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr>
                  <td className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select row #4">
                      <input 
                        type="checkbox" 
                        checked={selectedRows[1]}
                        onChange={() => handleSelectRow(1)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td className="prof-table-rank">#4</td>
                  <td>
                    <div className="prof-table-details">
                      <strong>Javascript Fundamental Quiz</strong>
                      <span>14 hours ago</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-type">
                      <strong>Syllabus</strong>
                      <span>3 Pages</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-students">
                      <strong>23</strong>
                      <span><img src="/assets/icons/eye.svg" alt="" /> 432 Views</span>
                    </div>
                  </td>
                  <td className="prof-table-score">---</td>
                  <td className="prof-table-rating">1.2 <img src="/assets/icons/star.svg" alt="" /></td>
                  <td className="prof-table-profit">222.3 USD</td>
                  <td className="prof-table-status">
                    <span className="prof-status-pill prof-status-pill--bad"><span className="dot"></span> Not</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr>
                  <td className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select row">
                      <input 
                        type="checkbox" 
                        checked={selectedRows[2]}
                        onChange={() => handleSelectRow(2)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td className="prof-table-rank">---</td>
                  <td>
                    <div className="prof-table-details">
                      <strong>Javascript Fundamental Quiz</strong>
                      <span>12 Jan 2024</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-type">
                      <strong>Syllabus</strong>
                      <span>3 Pages</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-students">
                      <strong>---</strong>
                      <span><img src="/assets/icons/eye.svg" alt="" /> --- Views</span>
                    </div>
                  </td>
                  <td className="prof-table-score">---</td>
                  <td className="prof-table-rating">--- <img src="/assets/icons/star.svg" alt="" /></td>
                  <td className="prof-table-profit">0 USD</td>
                  <td className="prof-table-status">
                    <span className="prof-status-pill prof-status-pill--muted"><span className="dot"></span> Not</span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr>
                  <td className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select row #1">
                      <input 
                        type="checkbox" 
                        checked={selectedRows[3]}
                        onChange={() => handleSelectRow(3)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td className="prof-table-rank">#1</td>
                  <td>
                    <div className="prof-table-details">
                      <strong>Javascript Fundamental Quiz</strong>
                      <span>12 Jan 2024</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-type">
                      <strong>Syllabus</strong>
                      <span>3 Pages</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-students">
                      <strong>132</strong>
                      <span><img src="/assets/icons/eye.svg" alt="" /> 1.2K Views</span>
                    </div>
                  </td>
                  <td className="prof-table-score">---</td>
                  <td className="prof-table-rating">2.3 <img src="/assets/icons/star.svg" alt="" /></td>
                  <td className="prof-table-profit">23.4 USD</td>
                  <td className="prof-table-status">
                    <span className="prof-status-pill prof-status-pill--ok"><span className="dot"></span> Completed</span>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr>
                  <td className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select row #29">
                      <input 
                        type="checkbox" 
                        checked={selectedRows[4]}
                        onChange={() => handleSelectRow(4)} 
                      />
                      <span></span>
                    </label>
                  </td>
                  <td className="prof-table-rank">#29</td>
                  <td>
                    <div className="prof-table-details">
                      <strong>Javascript Fundamental Quiz</strong>
                      <span>12 Jan 2024</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-type">
                      <strong>Course</strong>
                      <span>12 Weeks</span>
                    </div>
                  </td>
                  <td>
                    <div className="prof-table-students">
                      <strong>4,310</strong>
                      <span><img src="/assets/icons/eye.svg" alt="" /> 22.1K Views</span>
                    </div>
                  </td>
                  <td className="prof-table-score">67.43</td>
                  <td className="prof-table-rating">4.3 <img src="/assets/icons/star.svg" alt="" /></td>
                  <td className="prof-table-profit">748.3 USD</td>
                  <td className="prof-table-status">
                    <span className="prof-status-pill prof-status-pill--ok"><span className="dot"></span> Completed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="prof-table-footer">
            <div className="prof-table-page-size">
              <span>Show</span>

              <div className="dropdown">
                <button type="button" className="dropdown-toggle prof-table-page-size-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>5</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>5</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>10</a></li>
                  <li><a className="dropdown-item" href="#" onClick={preventDefault}>25</a></li>
                </ul>
              </div>

              <span>per page</span>
            </div>

            <div className="prof-table-pager">
              <div className="prof-table-range">1-10 of 5</div>
              <button type="button" className="prof-table-nav" onClick={preventDefault}>
                <img src="/assets/icons/left1.svg" alt="" />
              </button>
              
              <button type="button" className={`prof-table-page ${activePage === 1 ? 'is-active' : ''}`} onClick={() => setActivePage(1)}>1</button>
              <button type="button" className={`prof-table-page ${activePage === 2 ? 'is-active' : ''}`} onClick={() => setActivePage(2)}>2</button>
              <button type="button" className={`prof-table-page ${activePage === 3 ? 'is-active' : ''}`} onClick={() => setActivePage(3)}>3</button>
              
              <button type="button" className="prof-table-nav" onClick={preventDefault}>
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