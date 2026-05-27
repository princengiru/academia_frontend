import React from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-dashboard-home.css';

const HOADashboardHome = () => {
  const preventDefault = (e) => e.preventDefault();

  // Placeholder data for Approvals Grid
  const approvalRequests = [
    { id: 1, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'In Progress', statusColor: 'gray', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 4, fileIcon: '/assets/icons/fake-pdf.svg' },
    { id: 2, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Approve', statusColor: 'green', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-file.svg' },
    { id: 3, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Cancelled', statusColor: 'red', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-doc.svg' },
    { id: 4, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-image.svg' },
    { id: 5, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'In Progress', statusColor: 'gray', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-pdf-red.svg' },
    { id: 6, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Cancelled', statusColor: 'red', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-lines.svg' },
    { id: 7, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-xls.svg' },
    { id: 8, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Cancelled', statusColor: 'red', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-image.svg' },
    { id: 9, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'In Progress', statusColor: 'gray', date: 'Tue 12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: '/assets/icons/fake-image.svg' },
  ];

  return (
    <HOALayout currentPage="index">
      
      {/* Page Header */}
      <div className="hoa-page-header">
        <h1>Dashboard</h1>
        <div className="hoa-header-actions">
          <span className="hoa-update-status">
            <img src="/assets/icons/fake-sync.svg" alt="" className="sync-icon" /> 
            Data updated every 5min 
            <span className="dot"></span>
          </span>
          <button className="hoa-btn-primary">
            Go to website <img src="/assets/icons/fake-exit-white.svg" alt="" />
          </button>
        </div>
      </div>

      {/* Top Main Stats (4 Cards) */}
      <div className="hoa-grid-4">
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src="/assets/icons/fake-bar-chart.svg" alt="" /> Growth</span>
          </div>
          <div className="stat-body">
            <div>
              <h3>+ 2.8K</h3>
              <p>Students In Total</p>
            </div>
            <img src="/assets/icons/fake-sparkline-green.svg" alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src="/assets/icons/fake-bar-chart.svg" alt="" /> Growth</span>
          </div>
          <div className="stat-body">
            <div>
              <h3>+ 2.8K</h3>
              <p>Tutors In Total</p>
            </div>
            <img src="/assets/icons/fake-sparkline-green.svg" alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src="/assets/icons/fake-folder.svg" alt="" /> Projects</span>
            <a href="#">Manage Projects</a>
          </div>
          <div className="stat-body">
            <div>
              <h3>193K</h3>
              <p>Total Uploads</p>
            </div>
            <img src="/assets/icons/fake-sparkline-red.svg" alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src="/assets/icons/fake-medal.svg" alt="" /> Certificates</span>
            <a href="#">Manage Certificates</a>
          </div>
          <div className="stat-body">
            <div>
              <h3>3</h3>
              <p>Total Issued</p>
            </div>
            <img src="/assets/icons/fake-sparkline-green.svg" alt="Sparkline" className="sparkline" />
          </div>
        </div>
      </div>

      {/* Secondary Stats Row (6 items) */}
      <div className="hoa-card hoa-secondary-stats-row">
        <div className="sub-stat">
          <h4>13.3M</h4>
          <p>Total Syllabus</p>
        </div>
        <div className="sub-stat">
          <h4>13.3M</h4>
          <p>Total Online Courses</p>
        </div>
        <div className="sub-stat">
          <h4>204</h4>
          <p>Total Assignments</p>
        </div>
        <div className="sub-stat">
          <h4>19.32</h4>
          <p>Average Score <span className="trend down">↘ -4.5%</span></p>
        </div>
        <div className="sub-stat">
          <h4>84</h4>
          <p>Total Events</p>
        </div>
        <div className="sub-stat">
          <h4>4.6</h4>
          <p>Avg. Rating <span className="trend up">↗ +4.1</span></p>
        </div>
      </div>

      {/* Gross Revenue Section (Not a card, floats on background) */}
      <div className="hoa-revenue-section">
        <div className="section-header">
          <span className="section-title">GROSS REVENUE</span>
          <a href="#" className="manage-link">Manage funds &gt;</a>
        </div>
        
        <div className="revenue-amount-box outline-box">
          <div className="icon-circle">
            <span style={{color: '#A1A5B7', fontWeight: 'bold'}}>$</span>
          </div>
          <div className="amount-details">
            <div className="amt-row">
              <h3>+ 2.8K <span>USD</span></h3>
              <img src="/assets/icons/fake-usa-flag.svg" alt="US" className="flag" />
              <img src="/assets/icons/fake-caret-down.svg" alt="Drop" className="caret" />
            </div>
            <p>TOTAL REVENUE <span className="trend up">↗ +40.1%</span></p>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="revenue-progress-bar">
          <div className="segment color-syllabus" style={{ width: '45%' }}></div>
          <div className="segment color-online" style={{ width: '15%' }}></div>
          <div className="segment color-tutors" style={{ width: '25%' }}></div>
          <div className="segment color-certs" style={{ width: '10%' }}></div>
          <div className="segment color-tax" style={{ width: '5%' }}></div>
        </div>

        {/* Legend */}
        <div className="revenue-legend">
          <span><i className="dot color-syllabus"></i> Syllabus</span>
          <span><i className="dot color-online"></i> Online Courses</span>
          <span><i className="dot color-tutors"></i> Tutors upload payments</span>
          <span><i className="dot color-certs"></i> Certificates</span>
          <span><i className="dot color-tax"></i> Tax</span>
        </div>
      </div>

      {/* Split Stats: Learners vs Tutors */}
      <div className="hoa-grid-2" style={{marginBottom: '40px'}}>
        <div className="hoa-card hoa-split-stat">
          <div className="section-header">
            <span className="section-title">LEARNER'S STATS</span>
            <a href="#" className="manage-link">See Details &gt;</a>
          </div>
          <div className="revenue-amount-box outline-box">
            <div className="icon-circle">
              <span style={{color: '#A1A5B7', fontWeight: 'bold'}}>$</span>
            </div>
            <div className="amount-details">
              <div className="amt-row">
                <h3>+ 2.8K <span>USD</span></h3>
                <img src="/assets/icons/fake-usa-flag.svg" alt="US" className="flag" />
                <img src="/assets/icons/fake-caret-down.svg" alt="Drop" className="caret" />
              </div>
              <p>TOTAL REVENUE <span className="trend up">↗ +40.1%</span></p>
            </div>
          </div>
          <div className="split-footer-stats">
            <div><strong>344</strong> Project Uploads</div>
            <div><strong>34.4</strong> Avg. Learning Hours</div>
          </div>
        </div>

        <div className="hoa-card hoa-split-stat">
          <div className="section-header">
            <span className="section-title">TUTOR'S STATS</span>
            <a href="#" className="manage-link">See Details &gt;</a>
          </div>
          <div className="revenue-amount-box outline-box">
            <div className="icon-circle">
              <span style={{color: '#A1A5B7', fontWeight: 'bold'}}>$</span>
            </div>
            <div className="amount-details">
              <div className="amt-row">
                <h3>+ 2.8K <span>USD</span></h3>
                <img src="/assets/icons/fake-usa-flag.svg" alt="US" className="flag" />
                <img src="/assets/icons/fake-caret-down.svg" alt="Drop" className="caret" />
              </div>
              <p>TOTAL REVENUE <span className="trend up">↗ +40.1%</span></p>
            </div>
          </div>
          <div className="split-footer-stats">
            <div><strong>344</strong> Project Uploads</div>
            <div><strong>34.4</strong> Avg. Uploads</div>
          </div>
        </div>
      </div>

      {/* Approvals Section */}
      <div className="hoa-approvals-header">
        <div>
          <h2>Approvals Request</h2>
          <p>Tutors</p>
        </div>
        <div className="approvals-actions">
          <div className="search-box">
            <img src="/assets/icons/fake-search.svg" alt="" />
            <input type="text" placeholder="Search videos..." />
          </div>
          <div className="view-toggles">
            <button className="active"><img src="/assets/icons/fake-grid-view.svg" alt="Grid" /></button>
            <button><img src="/assets/icons/fake-list-view.svg" alt="List" /></button>
          </div>
          <button className="hoa-btn-light-purple">
            <img src="/assets/icons/fake-filter-purple.svg" alt="" /> Filters
          </button>
          <button className="hoa-btn-light-purple">
            <span className="plus-icon">+</span> Add new Tutor
          </button>
        </div>
      </div>

      {/* Approvals Grid */}
      <div className="hoa-grid-3">
        {approvalRequests.map((req) => (
          <div key={req.id} className="hoa-card hoa-approval-card">
            
            <div className="approval-user-row">
              <img src="/assets/imgs/default-profile.png" alt="Avatar" className="avatar" />
              <div className="user-meta">
                <h5>{req.name}</h5>
                <p>{req.location}</p>
              </div>
              <span className={`status-pill pill-${req.statusColor}`}>
                <span className="dot"></span> {req.status}
              </span>
            </div>

            <div className="approval-date-row">
              <span className="date"><strong>{req.date.split(' ')[0]}</strong> {req.date.substring(4)}</span>
              <span className="role">~ {req.role}</span>
            </div>

            <div className="approval-file-box">
              <div className="file-info-group">
                <div className="file-icon-box">
                  <img src={req.fileIcon} alt="File" />
                </div>
                <div className="file-info">
                  <strong>{req.fileCount} Files Uploaded</strong>
                  <a href="#">View All &gt;</a>
                </div>
              </div>
              <button className="open-btn">
                <img src="/assets/icons/fake-open-link.svg" alt="Open" />
              </button>
            </div>

            <div className="approval-action-row">
              <button className="btn-cancel">
                <span className="cross">×</span> Cancel
              </button>
              <button className="btn-approve">
                <span className="check">✓</span> Approve
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="hoa-pagination">
        <button className="page-nav"><img src="/assets/icons/fake-chevron-left.svg" alt="Prev" /></button>
        <button className="page-num">1</button>
        <button className="page-num active">2</button>
        <button className="page-num">3</button>
        <button className="page-num">4</button>
        <button className="page-num">5</button>
        <span className="page-dots">...</span>
        <button className="page-nav"><img src="/assets/icons/fake-chevron-right.svg" alt="Next" /></button>
      </div>

    </HOALayout>
  );
};

export default HOADashboardHome;