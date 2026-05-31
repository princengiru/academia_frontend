import React, { useState, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-learners.css'; // Using the newly separated CSS file

import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoanext from '../../../assets/icons/hoanext.svg';
import hoaprev from '../../../assets/icons/hoaprev.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import hoaopenview from '../../../assets/icons/hoaopenview.svg';

const HOALearners = () => {
  const preventDefault = (e) => e.preventDefault();
  
  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState('5');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  
  const [flagSelections, setFlagSelections] = useState({
    syllabus: { label: 'RWF', flag: rwanda },
    courses: { label: 'RWF', flag: rwanda },
  });

  const [exchangeRate, setExchangeRate] = useState(1350);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/RWF')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.USD) {
          setExchangeRate(1 / data.rates.USD);
        }
      })
      .catch(err => console.error("Failed to fetch exchange rate", err));
  }, []);

  const pageSizeOptions = ['5', '10', '25'];
  const filterOptions = ['All Learners', 'Active', 'Inactive'];
  const flagOptions = [
    { label: 'RWF', flag: rwanda },
    { label: 'USD', flag: hoausflag },
  ];

  const toggleRowSelection = (rowId) => {
    setSelectedRows((currentRows) => (
      currentRows.includes(rowId)
        ? currentRows.filter((selectedRowId) => selectedRowId !== rowId)
        : [...currentRows, rowId]
    ));
  };

  const clearSelectedRows = () => setSelectedRows([]);

  const handlePageSizeSelect = (value) => {
    setPageSize(value);
    setIsPageSizeOpen(false);
  };

  const toggleFlagDropdown = (key) => {
    setOpenFlagDropdown((currentKey) => (currentKey === key ? null : key));
  };

  const selectFlagOption = (key, option) => {
    setFlagSelections((currentSelections) => ({
      ...currentSelections,
      [key]: option,
    }));
    setOpenFlagDropdown(null);
  };

  const handleMouseMove = (e, chartId, seg) => {
    const svgRect = e.target.closest('svg').getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setHoverData({ chartId, text: seg.tooltipText, tooltipClass: seg.tooltipClass, x, y });
  };
  
  const handleMouseLeave = () => {
    setHoverData({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  };

  const renderDonut = (chartId, segments) => {
    const radius = 38;
    const strokeWidth = 16;
    
    let currentOffsetPercent = 0;
    
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg viewBox="0 0 100 100" className="donut-svg">
          {segments.map((seg, idx) => {
            const dashPercent = seg.percent;
            const offsetPercent = -currentOffsetPercent;
            currentOffsetPercent += seg.percent;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashPercent} 100`}
                strokeDashoffset={offsetPercent}
                pathLength="100"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseMove={(e) => handleMouseMove(e, chartId, seg)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </svg>
        {hoverData.chartId === chartId && (
          <div 
            className={`donut-tooltip ${hoverData.tooltipClass || ''}`} 
            style={{ top: `${hoverData.y + 10}px`, left: `${hoverData.x + 10}px` }}
          >
            {hoverData.text}
          </div>
        )}
      </div>
    );
  };

  const formatRevenue = (baseAmountRWF, currency) => {
    if (currency === 'USD') {
      const amountUSD = baseAmountRWF / exchangeRate;
      if (amountUSD >= 1000000) return `${(amountUSD / 1000000).toFixed(1)}M USD`;
      if (amountUSD >= 1000) return `${(amountUSD / 1000).toFixed(1)}K USD`;
      return `${amountUSD.toFixed(2)} USD`;
    }
    if (baseAmountRWF >= 1000000) return `${(baseAmountRWF / 1000000).toFixed(1)}M RWF`;
    if (baseAmountRWF >= 1000) return `${(baseAmountRWF / 1000).toFixed(1)}K RWF`;
    return `${baseAmountRWF} RWF`;
  };

  const renderFlagDropdown = (key, baseValueRWF) => {
    const selectedFlag = flagSelections[key];
    const displayValue = formatRevenue(baseValueRWF, selectedFlag.label);

    return (
      <div className="hoa-revenue-dropdown-box">
        <span className="revenue-label">Total Revenue</span>
        <div className="revenue-value-picker">
          <span className="revenue-value">{displayValue}</span>
          <div className="flag-dropdown-wrapper">
            <button
              type="button"
              className="flag-dropdown-trigger"
              onClick={() => toggleFlagDropdown(key)}
            >
              <img src={selectedFlag.flag} alt="flag" className="flag-icon" />
              <img src={hoadowncaret} alt="drop" className="flag-dropdown-caret" />
            </button>
            {openFlagDropdown === key && (
              <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px' }}>
                {flagOptions.map((option, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className="flag-dropdown-option" 
                    onClick={() => selectFlagOption(key, option)}
                    style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '6px 8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <img src={option.flag} alt="flag" className="flag-icon" />
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: '#4B5675', fontWeight: '500' }}>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const learnersData = [
    { id: 1, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '34.67', attempts: 3, downloads: 3, certs: 3, paid: '222.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 2, name: 'Nagy Tímea', location: 'Russia', flag: '/assets/icons/rwanda.svg', score: '35.45', attempts: 23, downloads: 23, certs: 23, paid: '222.3 USD', status: 'Unpaid', statusColor: 'red' },
    { id: 3, name: 'Illés Éva', location: 'America', flag: hoausflag, score: '---', attempts: '---', downloads: '---', certs: '---', paid: '0 USD', status: 'In Progress', statusColor: 'gray' },
    { id: 4, name: 'Halász Emese', location: 'rwanda', flag: '/assets/icons/rwanda.svg', score: '19.52', attempts: 123, downloads: 123, certs: 123, paid: '23.4 USD', status: 'Paid', statusColor: 'green' },
    { id: 5, name: 'Soós Annamária', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 6, name: 'Varga Dóra', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 7, name: 'Hajdú Dominika', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 331, downloads: 331, certs: 331, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 8, name: 'Kiss Dorka', location: 'Rwanda', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 9, name: 'Virág Mercédesz', location: 'Mexico', flag: '/assets/icons/rwanda.svg', score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
    { id: 10, name: 'László Cintia', location: 'America', flag: hoausflag, score: '67.43', attempts: 4, downloads: 4, certs: 4, paid: '748.3 USD', status: 'Paid', statusColor: 'green' },
  ];

  return (
    <HOALayout currentPage="learners">
      
      {/* Page Header */}
      <div className="hoa-page-header">
        <h1>Learners</h1>
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
        {/* Top Stats Row (6 items) */}
        <div className="hoa-card hoa-secondary-stats-row">
          <div className="sub-stat">
            <h4>13.3M</h4>
            <p>Syllabus Downloads</p>
          </div>
          <div className="sub-stat">
            <h4>204</h4>
            <p>Online Learners</p>
          </div>
          <div className="sub-stat">
            <h4>13</h4>
            <p>Competent Learners</p>
          </div>
          <div className="sub-stat">
            <h4>4.6</h4>
            <p>NYC Learners</p>
          </div>
          <div className="sub-stat">
            <h4>19.32</h4>
            <p>Average Score <span className="trend down"> <img src={hoadecrease} alt="Decrease" /> -4.5%</span></p>
          </div>
          <div className="sub-stat">
            <h4>84</h4>
            <p>Certificates <span className="trend up"> <img src={hoaincrease} alt="Increase" /> +4.1</span></p>
          </div>
        </div>
      </div>

      <div className="hoa-dashboard-charts-container">

        {/* Chart Cards Section */}
        <div className="hoa-grid-2">
          
          {/* Syllabus Stats Card */}
          <div className="hoa-card hoa-chart-card">
            <div className="section-title">SYLLABUS'S STATS</div>
            
            <div className="chart-body-row">
              <div className="donut-wrapper">
                <div className="donut-chart">
                  {renderDonut('syllabus', [
                    { percent: 35, color: '#1B84FF', tooltipText: '34.4K Free' }, // Blue
                    { percent: 15, color: '#F6B100', tooltipText: '23 Download' }, // Yellow
                    { percent: 25, color: '#17C653', tooltipText: '34.4 Readers' }, // Green
                    { percent: 25, color: '#E4E4E7', tooltipText: 'Other' }, // Gray
                  ])}
                </div>
              </div>
              
              <div className="chart-legend">
                <div className="legend-item"><span className="dot" style={{background: '#1B84FF'}}></span> <strong>34.4K</strong> Free Downloads</div>
                <div className="legend-item"><span className="dot" style={{background: '#FFC700'}}></span> <strong>4.4K</strong> Paid Downloads</div>
                <div className="legend-item"><span className="dot" style={{background: '#17C653'}}></span> <strong>34.4</strong> Online Readers</div>
              </div>
            </div>

            <div className="chart-footer-stats">
              <span><strong>38.8K</strong> Total Downloads</span>
              <span><strong>34.4 H</strong> Avg. Learning Hours</span>
            </div>

            {renderFlagDropdown('syllabus', 9600000)}
          </div>

          {/* Online Courses Stats Card */}
          <div className="hoa-card hoa-chart-card">
            <div className="section-title" style={{marginBottom: '20px'}}>ONLINE COURSES'S STATS</div>
            
            <div className="chart-body-row">
              <div className="donut-wrapper">
                <div className="donut-chart">
                  {renderDonut('courses', [
                    { percent: 35, color: '#17C653', tooltipText: '34.4K Free' },
                    { percent: 10, color: '#F6B100', tooltipText: '23 Failed', tooltipClass: 'tooltip-failed' },
                    { percent: 40, color: '#1B84FF', tooltipText: '4.4K Paid' },
                    { percent: 15, color: '#E4E4E7', tooltipText: 'Other' },
                  ])}
                </div>
              </div>
              
              <div className="chart-legend">
                <div className="legend-item"><span className="dot" style={{background: '#1B84FF'}}></span> <strong>34.4K</strong> Free Courses</div>
                <div className="legend-item"><span className="dot" style={{background: '#FFC700'}}></span> <strong>4.4K</strong> Paid Courses</div>
                <div className="legend-item"><span className="dot" style={{background: '#17C653'}}></span> <strong>34.4</strong> Avg. Active students</div>
              </div>
            </div>

            <div className="chart-footer-stats">
              <span><strong>38.8K</strong> Total Learners</span>
              <span><strong>34.4 H</strong> Avg. Learning Hours</span>
            </div>

            {renderFlagDropdown('courses', 9600000)}
          </div>

        </div>
      </div>

      {/* List Header */}
      <div className="hoa-approvals-header">
        <div>
          <h2>Learners</h2>
          <p>Online Course & Past Papers</p>
        </div>
        <div className="approvals-actions">
          <div className="search-box">
            <img src={hoasearch} alt="" />
            <input type="text" placeholder="Search Lessons..." />
          </div>
          
          <div className="hoa-filter-dropdown-wrapper">
            <button
              type="button"
              className="hoa-btn-light-purple hoa-filter-trigger"
              onClick={() => setIsFilterOpen((currentOpen) => !currentOpen)}
            >
              <img src={hoafilter} alt="" /> Filters
            </button>
            {isFilterOpen && (
              <div className="hoa-filter-dropdown">
                {filterOptions.map((option) => (
                  <button key={option} type="button" className="hoa-filter-option" onClick={() => setIsFilterOpen(false)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="hoa-btn-light-purple">
            <img src={hoaadd} alt="" /> Create new test
          </button>
        </div>
      </div>

      {/* Learners List Layout */}
      <div className="hoa-list-container">
        <table className="hoa-list-table learners-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>
                <button type="button" className="th-content minus-btn-container minus-select-button" onClick={clearSelectedRows}>
                  <div className="minus-icon">-</div>
                </button>
              </th>
              <th style={{ width: '100%' }}><div className="th-content">Student Details (34) <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Avg. Score <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Attempts <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Downloads <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Certificates <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="text-center"><div className="th-content justify-center">Tot. Paid (USD) <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="status-col"><div className="th-content">Status <span className="sort-icon"><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
              <th className="action-col"></th> {/* Empty th for link action */}
            </tr>
          </thead>
          <tbody>
            {learnersData.map((req) => (
              <tr key={req.id}>
                <td>
                  <input
                    type="checkbox"
                    className="hoa-checkbox"
                    checked={selectedRows.includes(req.id)}
                    onChange={() => toggleRowSelection(req.id)}
                  />
                </td>
                <td>
                  <div className="list-user-col">
                    <div className="user-meta">
                      <h5>{req.name}</h5>
                      <p className="location-with-flag">
                        <img src={req.flag} alt="flag" className="tiny-flag" /> {req.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="fw-600 text-center">{req.score}</td>
                <td className="fw-500 text-center">{req.attempts}</td>
                <td className="fw-500 text-center">{req.downloads}</td>
                <td className="fw-500 text-center">{req.certs}</td>
                <td className="fw-600 text-center">{req.paid}</td>
                <td className="status-col">
                  <span className={`status-pill pill-${req.statusColor}`}>
                    <span className="dot"></span> {req.status}
                  </span>
                </td>
                <td className="action-col">
                  <a href="#" className="table-link-icon" onClick={preventDefault}>
                     <img src={hoaopenview} alt="Open" /> 
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="hoa-pagination-container list-pagination">
        <div className="pagination-left">
           Show 
           <div className="page-size-dropdown">
             <button
               type="button"
               className="page-size-button"
               onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
             >
               {pageSize}
               <img src={hoadowncaret} alt="" />
             </button>
             {isPageSizeOpen && (
               <div className="page-size-menu">
                 {pageSizeOptions.map((option) => (
                   <button key={option} type="button" className="page-size-option" onClick={() => handlePageSizeSelect(option)}>
                     {option}
                   </button>
                 ))}
               </div>
             )}
           </div>
           per page
        </div>
        
        <div className="hoa-pagination">
          <span className="page-range">1-10 of 5</span>
          <button className="page-nav"><img src={hoaprev} alt="Prev" /></button>
          <button className="page-num">1</button>
          <button className="page-num active">2</button>
          <button className="page-num">3</button>
          <button className="page-nav"><img src={hoanext} alt="Next" /></button>
        </div>
      </div>

    </HOALayout>
  );
};

export default HOALearners;