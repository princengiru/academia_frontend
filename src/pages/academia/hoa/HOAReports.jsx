import React, { useState, useRef } from 'react';
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
import hoadownload2 from '../../../assets/icons/hoadownload2.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';

// Flags and Payment methods (Placeholders assuming existing paths)
import rwanda from '../../../assets/icons/rwanda.svg';
import russia from '../../../assets/icons/rwanda.svg'; // Mock
import america from '../../../assets/icons/hoausflag.svg';
import burundi from '../../../assets/icons/rwanda.svg'; // Mock
import mexico from '../../../assets/icons/rwanda.svg'; // Mock

const HOAReports = () => {
  const { currency, formatAmount } = useCurrency();
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'tutorName', direction: 'asc' });
  const [pageSize, setPageSize] = useState('10');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeOptions = ['5', '10', '20'];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Status');

  const clearSelectedRows = () => setSelectedRows([]);

  const getSortedData = (data, config) => {
    if (!config.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      // Extract numeric values for amounts like "222.3 USD"
      if (typeof aVal === 'string' && aVal.includes('USD')) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

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

  const preventDefault = (e) => e.preventDefault();

  // Chart Interactivity Logic
  const currentMonthIndex = new Date().getMonth();

  const chartDataMap = {
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      green: [17, 30, 25, 28, 36, 34, 48, 42, 40, 48, 60, 65],
      purple: [24, 35, 28, 45, 43, 37, 55, 48, 70, 66, 77, 90],
      bar: [
        { syl: 80, onl: 60 }, { syl: 20, onl: 32 }, { syl: 36, onl: 25 }, { syl: 27, onl: 50 },
        { syl: 70, onl: 55 }, { syl: 45, onl: 35 }, { syl: 19, onl: 15 }, { syl: 48, onl: 32 },
        { syl: 80, onl: 88 }, { syl: 53, onl: 40 }, { syl: 15, onl: 68 }, { syl: 40, onl: 50 }
      ]
    },
    Weekly: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      green: [20, 40, 30, 60, 50, 40, 80],
      purple: [30, 50, 40, 70, 60, 50, 90],
      bar: [
        { syl: 40, onl: 30 }, { syl: 60, onl: 50 }, { syl: 20, onl: 10 }, { syl: 80, onl: 60 },
        { syl: 50, onl: 40 }, { syl: 30, onl: 20 }, { syl: 70, onl: 50 }
      ]
    },
    Quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      green: [40, 60, 50, 80],
      purple: [50, 70, 60, 90],
      bar: [
        { syl: 60, onl: 50 }, { syl: 80, onl: 70 }, { syl: 50, onl: 40 }, { syl: 90, onl: 80 }
      ]
    }
  };

  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const currentQuarterIndex = Math.floor(currentMonthIndex / 3);

  const getDefaultActiveIndex = (period) => {
    if (period === 'Monthly') return currentMonthIndex;
    if (period === 'Weekly') return currentDayIndex;
    if (period === 'Quarterly') return currentQuarterIndex;
    return 0;
  };

  const [areaChartPeriod, setAreaChartPeriod] = useState('Monthly');
  const [activeAreaIndex, setActiveAreaIndex] = useState(() => getDefaultActiveIndex('Monthly'));
  const areaWrapRef = React.useRef(null);

  React.useEffect(() => {
    setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod));
  }, [areaChartPeriod]);

  const handleAreaMouseMove = (e) => {
    if (!areaWrapRef.current) return;
    const rect = areaWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = chartDataMap[areaChartPeriod].labels.length - 1;
    let index = Math.round((x / rect.width) * numPoints);
    setActiveAreaIndex(Math.max(0, Math.min(index, numPoints)));
  };
  const handleAreaMouseLeave = () => setActiveAreaIndex(getDefaultActiveIndex(areaChartPeriod));

  const [barChartPeriod, setBarChartPeriod] = useState('Monthly');
  const [activeBarIndex, setActiveBarIndex] = useState(() => getDefaultActiveIndex('Monthly'));
  const barWrapRef = React.useRef(null);

  React.useEffect(() => {
    setActiveBarIndex(getDefaultActiveIndex(barChartPeriod));
  }, [barChartPeriod]);

  const handleBarMouseMove = (e) => {
    if (!barWrapRef.current) return;
    const rect = barWrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const numPoints = chartDataMap[barChartPeriod].labels.length - 1;
    let index = Math.round((x / rect.width) * numPoints);
    setActiveBarIndex(Math.max(0, Math.min(index, numPoints)));
  };
  const handleBarMouseLeave = () => setActiveBarIndex(getDefaultActiveIndex(barChartPeriod));

  // Chart Data
  const currentAreaData = chartDataMap[areaChartPeriod];
  const currentBarData = chartDataMap[barChartPeriod];

  const generateSmoothPath = (values) => {
    const segments = values.length - 1;
    const xStep = 110 / Math.max(1, segments);
    const points = values.map((val, i) => [i * xStep, 100 - (val / 90) * 100]);
    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpDist = xStep * 0.4;
      d += ` C${prev[0] + cpDist},${prev[1]} ${curr[0] - cpDist},${curr[1]} ${curr[0]},${curr[1]}`;
    }
    return d;
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
              <div className="dropdown learners-performance-period-dropdown">
                <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{areaChartPeriod}</span>
                  <img src={hoadowncaret} alt="" />
                </button>
                <ul className="dropdown-menu learners-performance-period-menu">
                  <li><a className={`dropdown-item ${areaChartPeriod === 'Monthly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Monthly'); }}>Monthly</a></li>
                  <li><a className={`dropdown-item ${areaChartPeriod === 'Weekly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Weekly'); }}>Weekly</a></li>
                  <li><a className={`dropdown-item ${areaChartPeriod === 'Quarterly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setAreaChartPeriod('Quarterly'); }}>Quarterly</a></li>
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
                {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                  <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? '-4px' : 0, marginBottom: idx === 9 ? '-4px' : 0, backgroundColor: 'white', zIndex: 1 }}>{y}</span>
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

                    <path d={`${generateSmoothPath(currentAreaData.green)} L110,100 L0,100 Z`} fill="url(#areaGreen)" />
                    <path d={generateSmoothPath(currentAreaData.green)} fill="none" stroke="#22C55E" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    
                    <path d={`${generateSmoothPath(currentAreaData.purple)} L110,100 L0,100 Z`} fill="url(#areaPurple)" />
                    <path d={generateSmoothPath(currentAreaData.purple)} fill="none" stroke="#B998CE" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                  
                  {/* Tooltip Overlay Dot & Line */}
                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%`, top: `${100 - (currentAreaData.purple[activeAreaIndex]/90)*100}%`, bottom: '-25px', width: '1px', backgroundColor: '#374151', transform: 'translateX(-50%)' }}></div>
                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%`, top: `${100 - (currentAreaData.purple[activeAreaIndex]/90)*100}%`, width: '14px', height: '14px', backgroundColor: '#450468', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}></div>
                  <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%`, top: `${100 - (currentAreaData.green[activeAreaIndex]/90)*100}%`, width: '14px', height: '14px', backgroundColor: '#22C55E', border: '3px solid white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }}></div>
                </div>

                {/* Tooltip Overlay */}
                <div style={{ position: 'absolute', left: `${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%`, top: '52%', transform: `translate(-${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%, -100%)`, '--caret-pos': `${(activeAreaIndex / Math.max(1, currentAreaData.labels.length - 1))*100}%`, paddingBottom: '12px', zIndex: 10, pointerEvents: 'none', transition: 'left 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease' }}>
                  <div className="rep-chart-tooltip" style={{ padding: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', color: '#071437' }}>
                        {currentAreaData.labels[activeAreaIndex]} 25 <span style={{ color: '#22C55E', fontWeight: '600', fontSize: '10px', display: 'flex', alignItems: 'center' }}><img src={hoaincrease} alt="" style={{width: 8, marginRight: 4}} /> 20%</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4B5675', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{color:'#450468', fontSize: 16, lineHeight: 1}}>●</span> Certificates</span> <strong style={{ color: '#071437', fontSize: '14px' }}>{currentAreaData.purple[activeAreaIndex]}</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{color:'#22C55E', fontSize: 16, lineHeight: 1}}>●</span> Projects</span> <strong style={{ color: '#071437', fontSize: '14px' }}>{currentAreaData.green[activeAreaIndex]}</strong>
                    </div>
                  </div>
                </div>

                {/* X Axis Labels */}
                <div style={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, pointerEvents: 'none' }}>
                  {currentAreaData.labels.map((m, i) => (
                    <span key={m} style={{ position: 'absolute', left: `${(i / Math.max(1, currentAreaData.labels.length - 1))*100}%`, transform: 'translateX(-50%)', color: i === activeAreaIndex ? '#450468' : '#A1A5B7', fontWeight: i === activeAreaIndex ? 600 : 'normal', fontSize: '10px' }}>
                      {m}
                    </span>
                  ))}
                </div>
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
              <div className="dropdown learners-performance-period-dropdown">
                <button className="dropdown-toggle rep-dropdown-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{barChartPeriod}</span>
                  <img src={hoadowncaret} alt="" />
                </button>
                <ul className="dropdown-menu learners-performance-period-menu">
                  <li><a className={`dropdown-item ${barChartPeriod === 'Monthly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setBarChartPeriod('Monthly'); }}>Monthly</a></li>
                  <li><a className={`dropdown-item ${barChartPeriod === 'Weekly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setBarChartPeriod('Weekly'); }}>Weekly</a></li>
                  <li><a className={`dropdown-item ${barChartPeriod === 'Quarterly' ? 'active' : ''}`} href="#" onClick={(e) => { preventDefault(e); setBarChartPeriod('Quarterly'); }}>Quarterly</a></li>
                </ul>
              </div>
            </div>
            {/* SVG Replica of Bar Chart */}
            <div style={{ display: 'flex', marginTop: '20px', height: '220px', position: 'relative', width: '100%', paddingBottom: '20px' }}>
              
              {/* Y-Axis */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#A1A5B7', fontSize: '10px', paddingRight: '12px', position: 'relative', height: '100%' }}>
                {[90, 80, 70, 60, 50, 40, 30, 20, 10, 0].map((y, idx) => (
                  <span key={y} style={{ lineHeight: '10px', marginTop: idx === 0 ? '-4px' : 0, marginBottom: idx === 9 ? '-4px' : 0 }}>{y}</span>
                ))}
              </div>

              {/* Chart Content Area */}
              <div 
                style={{ position: 'relative', flex: 1, height: '100%', cursor: 'default' }}
                ref={barWrapRef}
                onMouseMove={handleBarMouseMove}
                onMouseLeave={handleBarMouseLeave}
              >
                
                {/* Grid Lines */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={{ borderBottom: '1px dashed #EEF1F6', width: '100%', height: '1px' }}></div>
                  ))}
                </div>

                {/* Bars */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                  {currentBarData.bar.map((data, i) => (
                      <div key={i} style={{ position: 'absolute', left: `${(i / Math.max(1, currentBarData.labels.length - 1))*100}%`, transform: `translateX(-50%) translateY(${activeBarIndex === i ? '-1px' : '0'})`, display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end', width: '12px', transition: 'transform 0.14s ease' }}>
                          {data.syl > 0 ? <div style={{ width: '4px', height: `${(data.syl/90)*100}%`, background: '#450468', borderRadius: '4px' }}></div> : null}
                          {data.onl > 0 ? <div style={{ width: '4px', height: `${(data.onl/90)*100}%`, background: '#EEF1F6', borderRadius: '4px' }}></div> : null}
                      </div>
                  ))}
                </div>

                {/* Tooltip Overlay */}
                <div style={{ position: 'absolute', left: `${(activeBarIndex / Math.max(1, currentBarData.labels.length - 1))*100}%`, top: '52%', transform: `translate(-${(activeBarIndex / Math.max(1, currentBarData.labels.length - 1))*100}%, -100%)`, '--caret-pos': `${(activeBarIndex / Math.max(1, currentBarData.labels.length - 1))*100}%`, paddingBottom: '12px', zIndex: 10, pointerEvents: 'none', transition: 'left 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 180ms ease' }}>
                  <div className="rep-chart-tooltip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                        Stats <span style={{ color: '#17C653', fontWeight: '600' }}><img src={hoaincrease} alt="" style={{width: 6, marginRight: 4}} /> 20%</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#450468', fontSize: 14, lineHeight: 1}}>●</span> Syllabus :</span> <strong style={{ color: '#071437' }}>{currentBarData.bar[activeBarIndex].syl}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#4B5675', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{color:'#EEF1F6', fontSize: 14, lineHeight: 1}}>●</span> Online Courses :</span> <strong style={{ color: '#071437' }}>{currentBarData.bar[activeBarIndex].onl}</strong>
                    </div>
                  </div>
                </div>

                {/* X Axis Labels */}
                <div style={{ position: 'absolute', bottom: '-25px', left: 0, right: 0, pointerEvents: 'none' }}>
                  {currentBarData.labels.map((m, i) => (
                    <span key={m} style={{ position: 'absolute', left: `${(i / Math.max(1, currentBarData.labels.length - 1))*100}%`, transform: 'translateX(-50%)', color: i === activeBarIndex ? '#450468' : '#A1A5B7', fontWeight: i === activeBarIndex ? 600 : 'normal', fontSize: '10px' }}>
                      {m}
                    </span>
                  ))}
                </div>
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
                    <span className="rep-stat-currency" style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4 }}>
                      RWF <img src={currency.flag} alt="flag" style={{ width: 14 }} /> <img src={hoadowncaret} alt="" style={{ width: 10 }} />
                    </span>
                 </h2>
                 <p>TOTAL REVENUE <span className="rep-trend up"><img src={hoaincrease} alt="" style={{ width: 8 }}/> +40.1%</span></p>
              </div>
            </div>

            <div className="rep-progress-bar">
               <div className="rep-prog-seg" style={{ width: '15%', background: '#1B84FF' }}></div>
               <div className="rep-prog-seg" style={{ width: '15%', background: '#F8285A' }}></div>
               <div className="rep-prog-seg" style={{ width: '25%', background: '#FF6F1E' }}></div>
               <div className="rep-prog-seg" style={{ width: '15%', background: '#17C653' }}></div>
               <div className="rep-prog-seg" style={{ width: '30%', background: '#071437' }}></div>
            </div>

            <div className="rep-rev-legend">
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#1B84FF'}}></span> Syllabus ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#F8285A'}}></span> Online Courses ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#FF6F1E'}}></span> Tutors upload payments ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#17C653'}}></span> Certificates ( 12% )</div>
                <div className="rep-legend-item"><span className="rep-legend-dot" style={{background: '#071437'}}></span> Projects ( 12% )</div>
            </div>
          </div>

          {/* Countries Report */}
          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
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
                  <button className="rep-dropdown-btn" style={{ fontSize: 12, color: '#7239EA', fontWeight: 600 }}>
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
               <img src={hoasearch} alt="search" className="search-icon" />
               <div className="search-divider"></div>
               <input type="text" placeholder="Search Lessons..." />
            </div>
            <div className="rep-filter-dropdown-container" style={{ position: 'relative' }}>
              <button className="rep-btn-filters" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                 <img src={hoafilter} alt="" style={{ width: 14 }} /> {selectedFilter === 'All Status' ? 'Filters' : selectedFilter}
              </button>
              {isFilterOpen && (
                <div className="learners-performance-period-menu" style={{ position: 'absolute', background: '#FFF', top: '100%', right: 0, marginTop: '8px', zIndex: 10 }}>
                  <div className={`dropdown-item ${selectedFilter === 'All Status' ? 'active' : ''}`} onClick={() => { setSelectedFilter('All Status'); setIsFilterOpen(false); }}>All Status</div>
                  <div className={`dropdown-item ${selectedFilter === 'Completed' ? 'active' : ''}`} onClick={() => { setSelectedFilter('Completed'); setIsFilterOpen(false); }}>Completed</div>
                  <div className={`dropdown-item ${selectedFilter === 'In Progress' ? 'active' : ''}`} onClick={() => { setSelectedFilter('In Progress'); setIsFilterOpen(false); }}>In Progress</div>
                  <div className={`dropdown-item ${selectedFilter === 'Failed' ? 'active' : ''}`} onClick={() => { setSelectedFilter('Failed'); setIsFilterOpen(false); }}>Failed</div>
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
                    Tutor Details (34) 
                    <span className={`sort-icon ${sortConfig.key === 'tutorName' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('course')}>
                    Course name 
                    <span className={`sort-icon ${sortConfig.key === 'course' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('amount')}>
                    Payment Method <img src={currency.flag} alt="flag" style={{ width: 14 }} /> 
                    <span className={`sort-icon ${sortConfig.key === 'amount' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('reason')}>
                    Payment Reason 
                    <span className={`sort-icon ${sortConfig.key === 'reason' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('role')}>
                    Role 
                    <span className={`sort-icon ${sortConfig.key === 'role' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('status')}>
                    Status 
                    <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getSortedData(paymentHistory, sortConfig).map((row) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
                        <span className={`rep-status rep-st-${row.statusColor}`}>
                           <span className="dot"></span> {row.status}
                        </span>
                      </div>
                      <button className="rep-action-btn">
                         <img src={hoadownload2} alt="download" style={{ width: 16 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown mx-8">
              <button 
                type="button" 
                className="page-size-button px-8-py-2"
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
              >
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map(opt => (
                    <button
                      key={opt}
                      className="page-size-option"
                      onClick={() => { setPageSize(opt); setIsPageSizeOpen(false); }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            per page
          </div>
          <div className="hoa-pagination">
            <span className="page-range">1-{pageSize} of 5</span>
            <button className="page-nav"><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" /></button>
            <button className="page-num">1</button>
            <button className="page-num active">2</button>
            <button className="page-num">3</button>
            <button className="page-nav"><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" /></button>
          </div>
        </div>

      </div>
    </HOALayout>
  );
};

export default HOAReports;