import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-dashboard-home.css';
import hoadollar from '../../../assets/icons/hoadollar.svg';
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoasquaregrid from '../../../assets/icons/hoasquaregrid.svg';
import hoalistgrid from '../../../assets/icons/hoalistgrid.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoaimagefile from '../../../assets/icons/hoaimagefile.svg';
import hoadocfile from '../../../assets/icons/hoadocfile.svg';
import hoaxlsfile from '../../../assets/icons/hoaxlsfile.svg';
import hoaopenfile from '../../../assets/icons/hoaopenfile.svg';
import hoaviewall from '../../../assets/icons/hoaviewall.svg';
import hoacancel from '../../../assets/icons/hoacancel.svg';
import hoaapprove from '../../../assets/icons/hoaapprove.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoagrowth1 from '../../../assets/icons/hoagrowth1.svg';
import hoagrowth2 from '../../../assets/icons/hoagrowth2.svg';
import hoaprojects from '../../../assets/icons/hoaprojects.svg';
import hoacertificates from '../../../assets/icons/hoacertificates.svg';
import hoasparklinegreen from '../../../assets/icons/hoasparklinegreen.svg';
import hoasparklinered from '../../../assets/icons/hoasparklinered.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';

const HOADashboardHome = () => {
  const preventDefault = (e) => e.preventDefault();
  
  // State for toggling between 'grid' and 'list'
  const [viewMode, setViewMode] = useState('list'); 

  // Updated Data to match image types and icons
  const approvalRequests = [
    { id: 1, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoapdffile },
    { id: 2, name: 'Nagy Tímea', location: 'Russia', status: 'Cancelled', statusColor: 'red', date: '12 Jan 2024', role: 'Tutor', fileCount: 5, fileIcon: hoaimagefile },
    { id: 3, name: 'Illés Éva', location: 'America', status: 'In Progress', statusColor: 'gray', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoadocfile },
    { id: 4, name: 'Halász Emese', location: 'Burundi', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoaimagefile },
    { id: 5, name: 'Soós Annamária', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoadocfile },
    { id: 6, name: 'Varga Dóra', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoaxlsfile },
    { id: 7, name: 'Hajdú Dominika', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoapdffile },
    { id: 8, name: 'Kiss Dorka', location: 'Rwanda', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoaxlsfile },
    { id: 9, name: 'Virág Mercédesz', location: 'Mexico', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoaimagefile },
    { id: 10, name: 'László Cintia', location: 'America', status: 'Completed', statusColor: 'green', date: '12 Jan 2024', role: 'Tutor', fileCount: 1, fileIcon: hoaimagefile },
  ];

  return (
    <HOALayout currentPage="index">
      
      {/* Page Header */}
      <div className="hoa-page-header">
        <h1>Dashboard</h1>
        <div className="hoa-header-actions">
          <span className="hoa-update-status">
            <img src={hoarefresh} alt="" className="sync-icon" /> 
            Data updated every 5min 
            <span className="dot"></span>
          </span>
          <button className="hoa-btn-primary">
            Go to website <img src={hoagoto} alt="" />
          </button>
        </div>
      </div>
      <div className="hoa-dashboard-stats-container">
      {/* Top Main Stats (4 Cards) */}
      <div className="hoa-grid-4">
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src={hoagrowth1} alt="Growth" /> Growth</span>
          </div>
          <div className="stat-body">
            <div>
              <h3>+ 2.8K</h3>
              <p>Students In Total</p>
            </div>
            <img src={hoasparklinegreen} alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src={hoagrowth2} alt="Growth" /> Growth</span>
          </div>
          <div className="stat-body">
            <div>
              <h3>+ 2.8K</h3>
              <p>Tutors In Total</p>
            </div>
            <img src={hoasparklinegreen} alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src={hoaprojects} alt="Projects" /> Projects</span>
            <a href="#">Manage Projects</a>
          </div>
          <div className="stat-body">
            <div>
              <h3>19.32</h3>
              <p>Total Uploads</p>
            </div>
            <img src={hoasparklinered} alt="Sparkline" className="sparkline" />
          </div>
        </div>
        <div className="hoa-card hoa-stat-main">
          <div className="stat-top">
            <span><img src={hoacertificates} alt="Certificates" /> Certificates</span>
            <a href="#">Manage Certificates</a>
          </div>
          <div className="stat-body">
            <div>
              <h3>3</h3>
              <p>Total Issued</p>
            </div>
            <img src={hoasparklinegreen} alt="Sparkline" className="sparkline" />
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
          <p>Average Score <span className="trend down"> <img src={hoadecrease} alt="Decrease" /> -4.5%</span></p>
        </div>
        <div className="sub-stat">
          <h4>84</h4>
          <p>Total Events</p>
        </div>
        <div className="sub-stat">
          <h4>4.6</h4>
          <p>Avg. Rating <span className="trend up"> <img src={hoaincrease} alt="Increase" /> +4.1</span></p>
        </div>
      </div>
      </div>

      {/* Gross Revenue Section (Not a card, floats on background) */}
      <div className="hoa-revenue-section">
        <div className="section-header">
          <span className="section-title">GROSS REVENUE</span>
          <a href="#" className="manage-link">Manage funds <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></a>
        </div>
        
        <div className="revenue-amount-box outline-box" style={{width: '300px', borderRadius: '8px'}}>
          <div className="icon-circle">
            <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" />   </span>
          </div>
          <div className="amount-details">
            <div className="amt-row">
              <h3>+ 2.8K <span>USD</span></h3>
              <img src={hoausflag} alt="US" className="flag" />
              <img src={hoadowncaret} alt="Drop" className="caret" />
            </div>
            <p>TOTAL REVENUE <span className="trend up"> <img src={hoaincrease} alt="Increase" /> +40.1%</span></p>
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
            <a href="#" className="manage-link">See Details <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></a>
          </div>
          <div className="revenue-amount-box outline-box">
            <div className="icon-circle">
              <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" />   </span>
            </div>
            <div className="amount-details">
              <div className="amt-row">
                <h3>+ 2.8K <span>USD</span></h3>
                <img src={hoausflag} alt="US" className="flag" />
                <img src={hoadowncaret} alt="Drop" className="caret" />
              </div>
              <p>TOTAL REVENUE <span className="trend up"> <img src={hoaincrease} alt="Increase" /> +40.1%</span></p>
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
            <a href="#" className="manage-link">See Details <img src={hoaviewall} style={{width: '5.2px', height: '9.2px'}} alt="" /></a>
          </div>
          <div className="revenue-amount-box outline-box">
            <div className="icon-circle">
              <span style={{color: '#A1A5B7', fontWeight: 'bold'}}> <img src={hoadollar} alt="Dollar" />     </span>
            </div>
            <div className="amount-details">
              <div className="amt-row">
                <h3>+ 2.8K <span>USD</span></h3>
                <img src={hoausflag} alt="US" className="flag" />
                <img src={hoadowncaret} alt="Drop" className="caret" />
              </div>
              <p>TOTAL REVENUE <span className="trend up"> <img src={hoaincrease} alt="Increase" /> +40.1%</span></p>
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
            <img src={hoasearch} alt="" />
            <input type="text" placeholder="Search videos..." />
          </div>
          
          {/* Functional View Toggles */}
          <div className="view-toggles">
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
            >
              <img src={hoasquaregrid} alt="Grid" />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              <img src={hoalistgrid} alt="List" />
            </button>
          </div>
          
          <button className="hoa-btn-light-purple">
            <img src={hoafilter} alt="" /> Filters
          </button>
          <button className="hoa-btn-light-purple">
            <img src={hoaadd} alt="" /> Add new Tutor
          </button>
        </div>
      </div>

      {/* Conditional Rendering of Grid vs List */}
      {viewMode === 'grid' ? (
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
                <span className="date"><strong>{req.date.split(' ')[0]}</strong> {req.date.substring(3)}</span>
                <span className="role">~ {req.role}</span>
              </div>

              <div className="approval-file-box">
                <div className="file-info-group">
                  <div className="file-icon-box">
                    <img src={req.fileIcon} alt="File" />
                  </div>
                  <div className="file-info">
                    <strong><label htmlFor="file-count">{req.fileCount}</label> Files Uploaded</strong>
                    <a href="#" onClick={preventDefault}>View All <img src={hoaviewall} style={{width: '4px', height: '8px'}}  alt="" /></a>
                  </div>
                </div>
                <button className="open-btn">
                  <img src={hoaopenfile} alt="Open" />
                </button>
              </div>

              <div className="approval-action-row">
                <button className="btn-cancel">
                  <span className="cross"><img src={hoacancel} alt="Cancel" /></span> Cancel
                </button>
                <button className="btn-approve">
                  <span className="check"><img src={hoaapprove} alt="Approve" /></span> Approve
                </button>
              </div>
              
            </div>
          ))}
        </div>
      ) : (
        // List Layout Implementation
        <div className="hoa-list-container">
          <table className="hoa-list-table">
            <thead>
              <tr>
                <th><div className="th-content minus-btn-container"><div className="minus-icon">-</div></div></th>
                <th><div className="th-content">Student Details (34) <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th><div className="th-content">Role <span className="sort-icon"><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                <th><div className="th-content"> Date <span className="sort-icon"><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                <th><div className="th-content">Assessment Type <span className="sort-icon"><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                <th><div className="th-content">Status <span className="sort-icon"><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
                <th><div className="th-content">Action <span className="sort-icon"><img src={hoaupdowncaret} style={{width: '11px', height: '11px'}} alt="Sort" /></span></div></th>
              </tr>
            </thead>
            <tbody>
              {approvalRequests.map((req) => (
                <tr key={req.id}>
                  <td><input type="checkbox" className="hoa-checkbox" /></td>
                  <td>
                    <div className="list-user-col">
                      <div className="user-meta">
                        <h5>{req.name}</h5>
                        <p>{req.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="fw-600">{req.role}</td>
                  <td className="fw-500">{req.date}</td>
                  <td>
                    <div className="list-file-col">
                      <img src={req.fileIcon} alt="File" className="list-file-icon" />
                      <div className="file-info">
                        <strong><label>{req.fileCount}</label> Files Uploaded</strong>
                        <a href="#" onClick={preventDefault}>View All <img src={hoaviewall} style={{width: '5px', height: '8px'}} alt="View All"  /></a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill pill-${req.statusColor}`}>
                      <span className="dot"></span> {req.status}
                    </span>
                  </td>
                  <td>
                    <div className="list-actions-col">
                      <button className="btn-icon-cancel"><img src={hoacancel} alt="X" /></button>
                      <button className="btn-icon-approve"><img src={hoaapprove} alt="V" /></button>
                      <button className="btn-icon-more">⋮</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Container Matching The Design */}
      <div className={`hoa-pagination-container ${viewMode === 'list' ? 'list-pagination' : ''}`}>
        {viewMode === 'list' && (
          <div className="pagination-left">
             Show 
             <select className="pagination-select">
               <option>5</option>
               <option>10</option>
             </select>
             per page
          </div>
        )}
        
        <div className="hoa-pagination">
          {viewMode === 'list' && <span className="page-range">1-10 of 5</span>}
          <button className="page-nav"><img src={hoaprev} alt="Prev" /></button>
          <button className="page-num active">1</button>
          <button className="page-num">2</button>
          <button className="page-num">3</button>
          {viewMode === 'grid' && (
             <>
               <button className="page-num">4</button>
               <button className="page-num">5</button>
               <span className="page-dots">...</span>
             </>
          )}
          <button className="page-nav"><img src={hoanext} alt="Next" /></button>
        </div>
      </div>

    </HOALayout>
  );
};

export default HOADashboardHome;