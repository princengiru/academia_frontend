import React, { useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-reports.css';

// Reusing Icons matching the provided design structure
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoadollar from '../../../assets/icons/hoadollar.svg';
import hoadownload from '../../../assets/icons/hoadownload.svg';

// Flags and Payment methods (Placeholders assuming existing paths)
import rwanda from '../../../assets/icons/rwanda.svg';
import russia from '../../../assets/icons/rwanda.svg'; // Mock
import america from '../../../assets/icons/hoausflag.svg';
import burundi from '../../../assets/icons/rwanda.svg'; // Mock
import mexico from '../../../assets/icons/rwanda.svg'; // Mock

const HOAReports = () => {
  const { currency, formatAmount } = useCurrency();
  const [selectedRows, setSelectedRows] = useState([]);

  // Mock Data: Top Stats
  const topStats = [
    { title: 'Total Paid', amount: '19.3M', trend: '-4.5%', trendType: 'down' },
    { title: 'Syllabus Payments', amount: '19.3M', trend: '-4.5%', trendType: 'down' },
    { title: 'Course Payments', amount: '19.3M', trend: '-4.5%', trendType: 'down' },
    { title: 'Project Payments', amount: '843.5K', trend: '+4.1%', trendType: 'up' },
    { title: 'Certificate Payments', amount: '19.3M', trend: '-4.5%', trendType: 'down' },
  ];

  // Mock Data: Countries
  const countriesData = [
    { name: 'Rwanda', pop: '23.3K People', rev: '23.3M', flag: rwanda },
    { name: 'Russia', pop: '23.3K People', rev: '23.3M', flag: russia },
    { name: 'America', pop: '23.3K People', rev: '23.3M', flag: america },
    { name: 'Burundi', pop: '23.3K People', rev: '23.3M', flag: burundi },
    { name: 'Mexico', pop: '23.3K People', rev: '23.3M', flag: mexico },
  ];

  // Mock Data: Table
  const paymentHistory = [
    {
      id: 1,
      tutorName: 'Alexis Ndayamabje Froduard', location: 'Rwanda', flag: rwanda,
      course: 'Javascript Fundamental Quiz', date: '2024',
      amount: '222.3 USD', payMethod: 'MTN Mobile Money', payIcon: hoagoto, // mock icon
      reason: 'Course Upload', role: 'UI/UX Designer',
      status: 'Completed', statusColor: 'completed'
    },
    {
      id: 2,
      tutorName: 'Nagy Tímea', location: 'Russia', flag: russia,
      course: 'Javascript Fundamental Quiz', date: '2024',
      amount: '222.3 USD', payMethod: 'Airtel Money', payIcon: hoagoto,
      reason: 'Certificate Purchase', role: 'Computer Engineer',
      status: 'Failed', statusColor: 'failed'
    },
    {
      id: 3,
      tutorName: 'Illés Éva', location: 'America', flag: america,
      course: 'Javascript Fundamental Quiz', date: '2024',
      amount: '0 USD', payMethod: 'Bank Card', payIcon: hoagoto,
      reason: 'Syllabus Upload', role: 'Computer Engineer',
      status: 'In Progress', statusColor: 'progress'
    },
    {
      id: 4,
      tutorName: 'Halász Emese', location: 'Burundi', flag: burundi,
      course: 'Javascript Fundamental Quiz', date: '2024',
      amount: '23.4 USD', payMethod: 'Master Card', payIcon: hoagoto,
      reason: 'Student Course Plan', role: 'Computer Engineer',
      status: 'Completed', statusColor: 'completed'
    },
    {
      id: 5,
      tutorName: 'Virág Mercédesz', location: 'Mexico', flag: mexico,
      course: 'Javascript Fundamental Quiz', date: '2024',
      amount: '748.3 USD', payMethod: 'Visa Card', payIcon: hoagoto,
      reason: 'Syllabus Purchase', role: 'Computer Engineer',
      status: 'Completed', statusColor: 'completed'
    }
  ];

  const toggleRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  return (
    <HOALayout currentPage="reports">
      <div className="hoa-reports-page">

        {/* Header */}
        <div className="hoa-page-header">
          <h1>Reports</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status">
              <img src={hoarefresh} alt="Refresh" className="sync-icon" /> 
              Data updated every 5min 
              <span className="dot"></span>
            </span>
            <button className="hoa-btn-primary">
              Go to website <img src={hoagoto} alt="Go" />
            </button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="rep-dashboard-stats-container">
          <div className="rep-secondary-stats-row">
            {topStats.map((stat, idx) => (
              <div key={idx} className="rep-sub-stat">
                <h4>
                  {stat.amount} 
                  <span className="rep-stat-currency">
                    RWF <img src={currency.flag} alt="flag" style={{ width: 12 }} /> <img src={hoadowncaret} alt="" style={{ width: 8 }} />
                  </span>
                </h4>
                <p>
                  {stat.title} 
                  <span className={`rep-trend ${stat.trendType}`}>
                    <img src={stat.trendType === 'up' ? hoaincrease : hoadecrease} alt="trend" style={{ width: 8 }} />
                    {stat.trend}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="rep-charts-grid">
          
          {/* Area Chart Card */}
          <div className="rep-card">
            <div className="rep-chart-header">
              <div className="rep-chart-title">
                <span className="rep-badge-purple">89.7%</span>
                Certificates & Projects
              </div>
              <button className="rep-dropdown-btn">Monthly <img src={hoadowncaret} alt="" /></button>
            </div>
            {/* SVG Replica of Area Chart */}
            <div style={{ position: 'relative', height: '220px', width: '100%', marginTop: '20px' }}>
                <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="areaGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(23, 198, 83, 0.2)" />
                            <stop offset="100%" stopColor="rgba(23, 198, 83, 0)" />
                        </linearGradient>
                        <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(114, 57, 234, 0.2)" />
                            <stop offset="100%" stopColor="rgba(114, 57, 234, 0)" />
                        </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    {[20, 50, 80, 110, 140, 170].map(y => (
                       <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#EEF1F6" strokeDasharray="4 4" />
                    ))}
                    {/* Data Paths */}
                    <path d="M0,150 C50,130 80,180 130,120 C160,80 200,100 250,140 C300,180 350,80 400,120 L400,200 L0,200 Z" fill="url(#areaGreen)" />
                    <path d="M0,150 C50,130 80,180 130,120 C160,80 200,100 250,140 C300,180 350,80 400,120" fill="none" stroke="#17C653" strokeWidth="2" />
                    
                    <path d="M0,180 C40,160 90,140 120,80 C150,20 180,60 220,100 C270,140 320,20 400,50 L400,200 L0,200 Z" fill="url(#areaPurple)" />
                    <path d="M0,180 C40,160 90,140 120,80 C150,20 180,60 220,100 C270,140 320,20 400,50" fill="none" stroke="#E3C9F2" strokeWidth="2" />
                    
                    {/* Tooltip Overlay Dot */}
                    <line x1="130" y1="40" x2="130" y2="200" stroke="#DBDFE9" strokeDasharray="4 4" />
                    <circle cx="130" cy="88" r="4" fill="#7239EA" stroke="#FFF" strokeWidth="2" />
                    <circle cx="130" cy="120" r="4" fill="#17C653" stroke="#FFF" strokeWidth="2" />
                </svg>
                {/* Tooltip Box */}
                <div style={{ position: 'absolute', top: '10px', left: '140px', background: '#FFF', border: '1px solid #EEF1F6', borderRadius: '8px', padding: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        May 25 <span style={{ color: '#17C653', fontWeight: '600' }}><img src={hoaincrease} alt="" style={{width: 6}} /> 20%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <span><span style={{color:'#7239EA'}}>●</span> Certificates</span> <strong>23</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                        <span><span style={{color:'#17C653'}}>●</span> Projects</span> <strong>39</strong>
                    </div>
                </div>
                {/* X Axis Labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#A1A5B7' }}>
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span style={{color:'#071437', fontWeight: 600}}>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="rep-card">
            <div className="rep-chart-header">
              <div className="rep-chart-title">
                <span className="rep-badge-purple">89.7%</span>
                Average uploads
              </div>
              <button className="rep-dropdown-btn">Monthly <img src={hoadowncaret} alt="" /></button>
            </div>
            {/* SVG Replica of Bar Chart */}
            <div style={{ position: 'relative', height: '220px', width: '100%', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '170px', alignItems: 'flex-end' }}>
                    {[80, 40, 60, 50, 45, 70, 55, 35, 65, 80, 50, 30].map((h, i) => (
                        <div key={i} style={{ width: '8px', height: `${h}%`, background: i === 4 ? '#7239EA' : '#450468', borderRadius: '4px' }}></div>
                    ))}
                </div>
                {/* Tooltip Box */}
                <div style={{ position: 'absolute', top: '50px', left: '120px', background: '#FFF', border: '1px solid #EEF1F6', borderRadius: '8px', padding: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.06)'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        Stats <span style={{ color: '#17C653', fontWeight: '600' }}><img src={hoaincrease} alt="" style={{width: 6}} /> 20%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <span><span style={{color:'#7239EA'}}>●</span> Syllabus :</span> <strong>23</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                        <span><span style={{color:'#450468'}}>●</span> Online Courses :</span> <strong>39</strong>
                    </div>
                </div>
                 {/* X Axis Labels */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#A1A5B7', padding: '0 4px' }}>
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span style={{color:'#071437', fontWeight: 600}}>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="rep-middle-grid">
          
          {/* Gross Revenue */}
          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">GROSS REVENUE</h4>
              <button className="rep-dropdown-btn">Monthly <img src={hoadowncaret} alt="" /></button>
            </div>
            
            <div className="rep-revenue-top">
              <div className="rep-rev-icon">
                 <img src={hoadollar} alt="Dollar" />
              </div>
              <div className="rep-rev-info">
                 <h2>+ 223.8K 
                    <span className="rep-stat-currency" style={{ fontSize: 13, background: '#F8FAFC', padding: '4px 8px', borderRadius: 4, border: '1px solid #EEF1F6' }}>
                      RWF <img src={currency.flag} alt="flag" style={{ width: 14 }} /> <img src={hoadowncaret} alt="" style={{ width: 10 }} />
                    </span>
                 </h2>
                 <p>TOTAL REVENUE <span className="rep-trend up"><img src={hoaincrease} alt="" style={{ width: 8 }}/> +40.1%</span></p>
              </div>
            </div>

            <div className="rep-progress-bar">
               <div className="rep-prog-seg" style={{ width: '15%', background: '#1B84FF' }}></div>
               <div className="rep-prog-seg" style={{ width: '15%', background: '#F8285A' }}></div>
               <div className="rep-prog-seg" style={{ width: '25%', background: '#FFC700' }}></div>
               <div className="rep-prog-seg" style={{ width: '15%', background: '#17C653' }}></div>
               <div className="rep-prog-seg" style={{ width: '30%', background: '#071437' }}></div>
            </div>

            <div className="rep-rev-legend">
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#1B84FF'}}></span> Syllabus ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#F8285A'}}></span> Online Courses ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#FFC700'}}></span> Tutors upload payments ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#17C653'}}></span> Certificates ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#071437'}}></span> Projects ( 12% )</div>
            </div>
          </div>

          {/* Countries Report */}
          <div className="rep-card">
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">COUNTRIES REPORT</h4>
              <button className="rep-dropdown-btn">Monthly <img src={hoadowncaret} alt="" /></button>
            </div>
            <div className="rep-country-list">
              {countriesData.map((country, idx) => (
                <div key={idx} className="rep-country-item">
                  <div className="rep-country-left">
                    <img src={country.flag} alt="flag" className="rep-country-flag" />
                    <div>
                      <h5 className="rep-country-name">{country.name}</h5>
                      <p className="rep-country-pop">{country.pop}</p>
                    </div>
                  </div>
                  <button className="rep-dropdown-btn" style={{ fontSize: 12, color: '#7239EA', fontWeight: 600, background: '#F8F5FF', border: '1px solid #E3C9F2' }}>
                    {country.rev} RWF <img src={currency.flag} alt="" style={{width:12}} /> <img src={hoadowncaret} alt="" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment History Table Section */}
        <div className="rep-table-header-area">
          <div className="rep-table-title">
            <h2>Payment History</h2>
            <p>Online Course & Past Papers</p>
          </div>
          <div className="rep-table-actions">
            <div className="rep-search-box">
               <img src={hoasearch} alt="search" style={{ opacity: 0.5, width: 14 }} />
               <input type="text" placeholder="Search Lessons..." />
            </div>
            <button className="rep-btn-filters">
               <img src={hoafilter} alt="" style={{ width: 14 }} /> Filters
            </button>
          </div>
        </div>

        <div className="rep-table-wrapper">
          <table className="rep-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <div className="rep-minus-box">-</div>
                </th>
                <th>
                  <div className="th-inner">Tutor Details (34) <img src={hoaupdowncaret} alt="sort" style={{ opacity: 0.5 }} /></div>
                </th>
                <th>
                  <div className="th-inner">Course name <img src={hoaupdowncaret} alt="sort" style={{ opacity: 0.5 }} /></div>
                </th>
                <th>
                  <div className="th-inner">Payment Method <img src={currency.flag} alt="flag" style={{ width: 14 }} /> <img src={hoadowncaret} alt="drop" style={{ opacity: 0.5 }} /></div>
                </th>
                <th>
                  <div className="th-inner">Payment Reason <img src={hoaupdowncaret} alt="sort" style={{ opacity: 0.5 }} /></div>
                </th>
                <th>
                  <div className="th-inner">Role <img src={hoaupdowncaret} alt="sort" style={{ opacity: 0.5 }} /></div>
                </th>
                <th>
                  <div className="th-inner">Status <img src={hoaupdowncaret} alt="sort" style={{ opacity: 0.5 }} /></div>
                </th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((row) => (
                <tr key={row.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                       type="checkbox" 
                       className="rep-checkbox" 
                       checked={selectedRows.includes(row.id)}
                       onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td>
                    <div className="rep-td-tutor">
                      <strong>{row.tutorName}</strong>
                      <span><img src={row.flag} alt="flag" style={{ width: 12, borderRadius: '50%' }} /> {row.location}</span>
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
                      <strong>{row.amount}</strong>
                      <span><img src={row.payIcon} alt="pay" className="rep-pay-icon" /> {row.payMethod}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rep-td-reason">{row.reason}</span>
                  </td>
                  <td>
                    <span className="rep-td-role">{row.role}</span>
                  </td>
                  <td>
                    <span className={`rep-status rep-st-${row.statusColor}`}>
                       <span className="dot"></span> {row.status}
                    </span>
                  </td>
                  <td>
                    <button className="rep-action-btn">
                       <img src={hoadownload} alt="download" style={{ width: 16 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="rep-pagination-row">
           <div className="rep-page-sizer">
              Show
              <select defaultValue="5">
                 <option value="5">5</option>
                 <option value="10">10</option>
              </select>
              per page
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>1-10 of 5</span>
              <div className="rep-page-nav">
                 <button className="arrow-btn">←</button>
                 <button>1</button>
                 <button className="active">2</button>
                 <button>3</button>
                 <button className="arrow-btn">→</button>
              </div>
           </div>
        </div>

        {/* Footer Link Area (Matches image footer style slightly) */}
        <div className="rep-footer">
           <div>© Copyright 2025 All Right Reserved By Naraza Group Ltd</div>
           <div className="rep-footer-links">
             <a href="#">Privacy and Policy</a> | <a href="#">Terms and Condition</a>
           </div>
        </div>

      </div>
    </HOALayout>
  );
};

export default HOAReports;