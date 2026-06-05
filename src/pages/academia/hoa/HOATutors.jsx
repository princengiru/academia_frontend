import React, { useState, useEffect } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-tutors.css';

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
import hoagoback from '../../../assets/icons/hoagoback.svg';
import hoauserbadge from '../../../assets/icons/hoauserbadge.svg';
import hoagrayadd from '../../../assets/icons/hoagrayadd.svg';
import hoagrayphone from '../../../assets/icons/hoagrayphone.svg';
import hoagraymail from '../../../assets/icons/hoagraymail.svg';
import hoaverticaldots from '../../../assets/icons/hoaverticaldots.svg';
import hoadownload from '../../../assets/icons/hoadownload.svg';
import hoaknot from '../../../assets/icons/hoaknot.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoadownloadall from '../../../assets/icons/hoadownloadall.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';
import hoausericon from '../../../assets/icons/hoausericon.svg';
import hoalocation from '../../../assets/icons/hoalocation.svg';
import hoabriefcase from '../../../assets/icons/hoabriefcase.svg';
import hoafollowers from '../../../assets/icons/hoafollowers.svg';
import hoaproject from '../../../assets/imgs/hoaproject.png';
import hoacalendar from '../../../assets/icons/hoacalendar.svg';
import hoavbadge from '../../../assets/icons/hoavbadge.svg';
import hoareply from '../../../assets/icons/hoareply.svg';
import hoayellowstar from '../../../assets/icons/hoayellowstar.svg';
import hoasyllabus from '../../../assets/icons/hoasyllabus.svg';
import hoaonlinecourses from '../../../assets/icons/hoaonlinecourses.svg';
import hoaprojects from '../../../assets/icons/hoaprojects.svg';
import hoatotalstudents from '../../../assets/icons/hoatotalstudents.svg';
import brickspattern from '../../../assets/imgs/brickspattern.png';
import hoabrickspattern from '../../../assets/imgs/hoabrickspattern.png';




const HOATutors = () => {
  const preventDefault = (e) => e.preventDefault();

  const [selectedRows, setSelectedRows] = useState([]);
  const [pageSize, setPageSize] = useState('5');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });
  const [likedProjects, setLikedProjects] = useState({});

  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const toggleProjectLike = (idx) => {
    setLikedProjects((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalSelectedRows, setModalSelectedRows] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'

  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { currency, setCurrency, formatAmount } = useCurrency();

  const pageSizeOptions = ['5', '10', '25'];
  const filterOptions = ['All Learners', 'Active', 'Inactive'];

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

  const selectFlagOption = (option) => {
    setCurrency(option);
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

  const toggleModalRowSelection = (rowId) => {
    setModalSelectedRows((currentRows) => (
      currentRows.includes(rowId)
        ? currentRows.filter((selectedRowId) => selectedRowId !== rowId)
        : [...currentRows, rowId]
    ));
  };

  const getSortedData = (data, config) => {
    if (!config.key) return data;
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      if (config.key === 'date') {
         aVal = new Date(aVal).getTime() || 0;
         bVal = new Date(bVal).getTime() || 0;
      }
      
      if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
      if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

      if (aVal < bVal) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return config.direction === 'asc' ? 1 : -1;
      }
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

  const handleModalSort = (key) => {
    let direction = 'asc';
    if (modalSortConfig.key === key && modalSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (modalSortConfig.key === key && modalSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setModalSortConfig({ key, direction });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);



  const tutorsData = [
    { id: 1, name: 'Alexis Ndayamabje Froduard', location: 'Rwanda', flag: rwanda, phone: '+250 0000 000 00', email: 'alexisndayamabjefroduard@gonaraza.com', role: 'UI/UX Designer', uploads: '3', paid: '222.3 USD', status: 'Completed', statusColor: 'green' },
    { id: 2, name: 'Nagy Tímea', location: 'Russia', flag: rwanda, phone: '+240 0000 000 00', email: 'alexisndayamabjefroduard@gonaraza.com', role: 'Computer Engineer', uploads: '23', paid: '222.3 USD', status: 'Not-Checked', statusColor: 'red' },
    { id: 3, name: 'Illés Éva', location: 'America', flag: hoausflag, phone: '+156 0000 000 00', email: 'alexisndayamabjefroduard@gonaraza.com', role: 'Computer Engineer', uploads: '---', paid: '0 USD', status: 'In review', statusColor: 'gray' },
    { id: 4, name: 'Halász Emese', location: 'Burundi', flag: rwanda, phone: '+255 0000 000 00', email: 'alexisndayamabjefroduard@gonaraza.com', role: 'Computer Engineer', uploads: '123', paid: '23.4 USD', status: 'Completed', statusColor: 'green' },
    { id: 5, name: 'Soós Annamária', location: 'Rwanda', flag: rwanda, phone: '+250 0000 000 00', email: 'alexisndayamabjefroduard@gonaraza.com', role: 'Computer Engineer', uploads: '4', paid: '748.3 USD', status: 'Completed', statusColor: 'green' },
  ];

  // Modal Dummy Data
  const modalLessons = [
    { id: 1, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Course', duration: '4 Weeks', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Free', feeAmount: '0 USD', feeColor: '#5014D0', status: 'Uploaded', statusType: 'paid' },
    { id: 2, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Course', duration: '4 Weeks', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Paid', feeAmount: '35 USD', feeColor: '#04B440', status: 'Not Published', statusType: 'failed' },
    { id: 3, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Course', duration: '4 Weeks', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Paid', feeAmount: '---', feeColor: '#04B440', status: 'In Progress', statusType: 'retake' },
    { id: 4, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Syllabus', duration: '251 Pages', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Free', feeAmount: '0 USD', feeColor: '#5014D0', status: 'Uploaded', statusType: 'paid' },
    { id: 5, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Syllabus', duration: '251 Pages', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Free', feeAmount: '0 USD', feeColor: '#5014D0', status: 'Uploaded', statusType: 'paid' },
    { id: 6, title: 'Javascript Fundamental Quiz', date: '12 Jan 2024', type: 'Syllabus', duration: '251 Pages', students: '231', views: '2.4K Views', amount: '222.3 USD', amountSub: '23', certs: '6', score: '12.34 %', feeStatus: 'Paid', feeAmount: '35 USD', feeColor: '#04B440', status: 'Uploaded', statusType: 'paid' },
  ];

  const modalDocuments = [
    { id: 1, name: 'Javascript Fundamental', size: '5.6 MB', type: 'ribbon' },
    { id: 2, name: 'Economic Specialist', size: '5.6 MB', type: 'ribbon' },
    { id: 3, name: 'My Resume.pdf', size: '5.6 MB', type: 'pdf' },
    { id: 4, name: 'AO My doc.pdf', size: '5.6 MB', type: 'pdf' },
  ];

  const modalProjects = Array(6).fill({
    image: 'https://via.placeholder.com/300x150/E2E8F0/A1A5B7?text=Project+Preview',
    author: 'Jose Carine',
    likes: '10.6K',
    views: '10.6K',
    title: 'Build your software & engineering dream career'
  });

  return (
    <HOALayout currentPage="learners">
      <div className="hoa-tutors-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Tutors</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status">
              <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 5min <span className="dot"></span>
            </span>
            <button className="hoa-btn-primary">
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {/* Stats Container */}
        <div className="hoa-dashboard-stats-container">
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat"><h4>132</h4><p>Total Tutors</p></div>
            <div className="sub-stat"><h4>13.3M</h4><p>Syllabus Uploads</p></div>
            <div className="sub-stat"><h4>204</h4><p>Online Courses</p></div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount('19.3M RWF').replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Upload Payments <span className="trend down"> <img src={hoadecrease} alt="" /> -4.5%</span></p>
            </div>
            <div className="sub-stat">
              <h4 className="flex-center-gap8">{formatAmount('843.5K RWF').replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h4>
              <p>Amount Paid <span className="trend up"> <img src={hoaincrease} alt="" /> +4.1</span></p>
            </div>
          </div>
        </div>

        <div className="hoa-dashboard-charts-container">
          <div className="hoa-grid-2">
            {/* ONLINE LEARNERS'S STATUS */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">ONLINE LEARNERS'S STATUS</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">578 <span className="hoa-stat-badge badge-green">+1.6%</span></h3><p className="hoa-stat-label">Present</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">213 <span className="hoa-stat-badge badge-red">-0.6%</span></h3><p className="hoa-stat-label">Absent</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">45 <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Events</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Revenue</span>
                <div className="hoa-revenue-dropdown" style={{position: 'relative'}} onClick={() => toggleFlagDropdown('rev1')}>
                  {formatAmount('9.6M RWF')} <img src={currency.flag} className="currency-icon" alt="flag" /> <img src={hoadowncaret} alt="drop" />
                  {openFlagDropdown === 'rev1' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: 0, zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); selectFlagOption(option); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TUTOR'S STATUS */}
            <div className="hoa-card card-gray-bg">
              <div className="flex-between-center mb-24">
                <div className="section-title m-0">TUTOR'S STATUS</div>
                <div className="hoa-week-dropdown">This Week <img src={hoadowncaret} alt="drop" /></div>
              </div>
              <div className="hoa-stats-inner-card">
                <div className="hoa-stat-col-bordered">
                  <h3 className="hoa-stat-val">578 <span className="hoa-stat-badge badge-green">+1.6%</span></h3><p className="hoa-stat-label">Active</p>
                </div>
                <div className="hoa-stat-col-bordered-padded">
                  <h3 className="hoa-stat-val">213 <span className="hoa-stat-badge badge-red">-0.6%</span></h3><p className="hoa-stat-label">Offline</p>
                </div>
                <div className="hoa-stat-col-padded">
                  <h3 className="hoa-stat-val">45 <span className="hoa-stat-badge badge-gray">+0.0%</span></h3><p className="hoa-stat-label">Projects</p>
                </div>
              </div>
              <div className="flex-between-center">
                <span className="hoa-revenue-label">Total Revenue</span>
                <div className="hoa-revenue-dropdown" style={{position: 'relative'}} onClick={() => toggleFlagDropdown('rev2')}>
                  {formatAmount('9.6M RWF')} <img src={currency.flag} className="currency-icon" alt="flag" /> <img src={hoadowncaret} alt="drop" />
                  {openFlagDropdown === 'rev2' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: 0, zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); selectFlagOption(option); }}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* List Header */}
        <div className="hoa-approvals-header">
          <div>
            <h2>Tutors</h2>
            <p>Online Course & Past Papers</p>
          </div>
          <div className="approvals-actions">
            <div className="search-box">
              <img src={hoasearch} alt="" />
              <input type="text" placeholder="Search Lessons..." />
            </div>

            <div className="hoa-filter-dropdown-wrapper">
              <button type="button" className="hoa-btn-light-purple hoa-filter-trigger" onClick={() => setIsFilterOpen((currentOpen) => !currentOpen)}>
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

        {/* Tutors List Layout */}
        <div className="hoa-list-container">
          <table className="hoa-list-table learners-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <button type="button" className="th-content minus-btn-container minus-select-button" onClick={clearSelectedRows}>
                    <div className="minus-icon">-</div>
                  </button>
                </th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('name')}>Tutor Details (34) <span className={`sort-icon ${sortConfig.key === 'name' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th style={{ width: '25%' }}><div className="th-content" onClick={() => handleSort('phone')}>Contact Info <span className={`sort-icon ${sortConfig.key === 'phone' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('role')}>Role <span className={`sort-icon ${sortConfig.key === 'role' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap' }}><div className="th-content justify-center" onClick={() => handleSort('uploads')}>Uploads <span className={`sort-icon ${sortConfig.key === 'uploads' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="text-center" style={{ whiteSpace: 'nowrap', position: 'relative' }}>
                  <div className="th-content justify-center" onClick={() => handleSort('paid')}>
                    Amount Paid ({currency.label}) <img src={currency.flag} alt="flag" className="icon-12-mx4" onClick={(e) => { e.stopPropagation(); toggleFlagDropdown('main-paid'); }} style={{ cursor: 'pointer' }} />
                    <span className={`sort-icon ${sortConfig.key === 'paid' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span>
                  </div>
                  {openFlagDropdown === 'main-paid' && (
                    <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: '50%', transform: 'translateX(50%)', zIndex: 10, position: 'absolute' }}>
                      {flagOptions.map((option, idx) => (
                        <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={() => selectFlagOption(option)}>
                          <img src={option.flag} alt="flag" className="flag-icon" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="status-col" ><div className="th-content" onClick={() => handleSort('status')}>Status <span className={`sort-icon ${sortConfig.key === 'status' ? 'active ' + sortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="Sort" /></span></div></th>
                <th className="action-col"></th>
              </tr>
            </thead>
            <tbody>
              {getSortedData(tutorsData, sortConfig).map((tutor) => (
                <tr key={tutor.id} className={selectedRows.includes(tutor.id) ? 'selected-row' : ''}>
                  <td>
                    <input type="checkbox" className="hoa-checkbox" checked={selectedRows.includes(tutor.id)} onChange={() => toggleRowSelection(tutor.id)} />
                  </td>
                  <td>
                    <div className="list-user-col">
                      <div className="user-meta">
                        <h5>{tutor.name}</h5>
                        <p className="location-with-flag">
                          <img src={tutor.flag} alt="flag" className="tiny-flag" /> {tutor.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-meta">
                      <h5 style={{ fontWeight: 600 }}>{tutor.phone}</h5>
                      <p className="font-11-gray">{tutor.email}</p>
                    </div>
                  </td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.role}</td>
                  <td className="fw-500 text-center" style={{ whiteSpace: 'nowrap' }}>{tutor.uploads}</td>
                  <td className="fw-600 text-center" style={{ whiteSpace: 'nowrap' }}>{formatAmount(tutor.paid)}</td>
                  <td className="status-col">
                    <span className={`status-pill pill-${tutor.statusColor}`}>
                      <span className="dot"></span> {tutor.status}
                    </span>
                  </td>
                  <td className="action-col">
                    <a href="#" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(); }}>
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
              <button type="button" className="page-size-button" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
                {pageSize} <img src={hoadowncaret} alt="" />
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

        {/* Learner Preview Modal */}
        <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="modal-top-header">
              <button className="modal-back-btn" onClick={closeModal}>
                <img src={hoagoback} alt="" />
              </button>
              <h2>Tutors Preview</h2>
              <div className="modal-header-actions">
                <span className="hoa-update-status border-eef1f6">
                  <img src={hoarefresh} alt="" className="sync-icon" /> Data updated every 1 hr <span className="dot bg-green"></span>
                </span>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="modal-content-area">

              {/* User Profile Info */}
              <div className="modal-profile-grid">

                {/* Profile Card */}
                <div className="modal-profile-card">
                  <div className="modal-profile-bg-wrapper">
                    <div className="modal-profile-bg" style={{ background: `url(${hoabrickspattern}) center / 100% 100% no-repeat`, opacity: 1 }}></div>
                  </div>

                  <div className="profile-top-row">
                    <img src="/assets/imgs/default-profile.png" alt="Avatar" className="profile-lg-avatar" />
                    <button className="btn-view-details">View Details</button>
                  </div>

                  <div className="profile-info-grid">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="profile-label">Full name :</span>
                      <strong className="profile-value">John Doe</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="profile-label">Total Paid :</span>
                        <strong className="profile-value-flex" style={{ position: 'relative', zIndex: 9999 }}>{formatAmount('2,340,044 RWF').replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /> <img src={hoadowncaret} alt="drop" onClick={() => toggleFlagDropdown('stats3')} style={{cursor: 'pointer'}} /></span>
                        {openFlagDropdown === 'stats3' && (
                          <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', left: '50%', zIndex: 10, position: 'absolute' }}>
                            {flagOptions.map((option, idx) => (
                              <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={() => selectFlagOption(option)}>
                                <img src={option.flag} alt="flag" className="flag-icon" />
                                <span>{option.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="profile-bottom-row">
                    <div className="flex-center-gap8">
                      <span className="status-badge-blue">Active</span>
                      <span className="status-badge-purple"><img src={hoauserbadge} alt="" /> 6</span>
                      <span className="status-badge-yellow"><img src={hoayellowstar} alt="" /> 3.4</span>
                    </div>
                    <div className="profile-actions gap-2">
                      <button className="icon-btn icon-28">
                        <img src={hoagrayadd} alt="" />
                      </button>
                      <button className="icon-btn icon-28 tooltip-trigger">
                        <span className="action-tooltip">+250 123 456 789</span>
                        <img src={hoagrayphone} alt="" />
                      </button>
                      <button className="icon-btn icon-28 tooltip-trigger">
                        <span className="action-tooltip">johndoe@gonaraza.com</span>
                        <img src={hoagraymail} alt="" />
                      </button>
                      <button className="icon-btn icon-28">
                        <img src={hoaverticaldots} alt="" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="profile-info-list">
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoausericon} alt="dept" className="opacity-50" /> Department</span>
                    <span className="profile-info-val">IT</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoabriefcase} alt="role" className="opacity-50" /> Role</span>
                    <span className="profile-info-val">Software Engineer</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoasyllabus} alt="syll" className="opacity-50" /> Syllabus</span>
                    <span className="profile-info-val">12</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoaonlinecourses} alt="courses" className="opacity-50" /> Online Courses</span>
                    <span className="profile-info-val">2</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoaprojects} alt="proj" className="opacity-50" /> Projects</span>
                    <span className="profile-info-val">14</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label"><img src={hoatotalstudents} alt="stud" className="opacity-50" /> Total Students</span>
                    <span className="profile-info-val">234</span>
                  </div>
                </div>
              </div>

              {/* Modal Stats Row */}
              <div className="modal-stats-row modal-stats-row-no-border">
                <div className="mod-stat mod-stat-br-pr">
                  <h3 className="flex-center-gap4">+ {formatAmount('2.8K USD').replace(' USD', '').replace(' RWF', '')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="icon-12" /></span></h3>
                  <p>Downloads Income</p>
                </div>
                <div className="mod-stat mod-stat-br-px">
                  <h3 className="flex-center-gap4">+ {formatAmount('2.8K USD').replace(' USD', '').replace(' RWF', '')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="icon-12" /></span></h3>
                  <p>Courses Income</p>
                </div>
                <div className="mod-stat mod-stat-br-px">
                  <h3 className="flex-center-gap4">{formatAmount('2,340,044 RWF').replace(' RWF','').replace(' USD','')} <span className="stat-currency">{currency.label} <img src={currency.flag} alt="flag" className="currency-flag" /></span></h3>
                  <p>Upload Amount</p>
                </div>
                <div className="mod-stat mod-stat-pl">
                  <h3 className="font-15-mt6">23 - March - 2026 <span className="font-11-gray500">14:00:45</span></h3>
                  <p>Date Joined</p>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="modal-tabs">
                <button className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => setActiveTab('lessons')}>Lessons</button>
                <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
                <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity</button>
              </div>

              {/* Tab Contents */}
              <div className="modal-tab-content">

                {/* === LESSONS TAB === */}
                {activeTab === 'lessons' && (
                  <div className="tab-lessons">
                    <div className="hoa-list-container modal-table-container">
                      <table className="hoa-list-table mod-table">
                        <thead>
                          <tr>
                            <th className="w-40">
                              <button type="button" className="th-content minus-btn-container minus-select-button" onClick={() => setModalSelectedRows([])}>
                                <div className="minus-icon m-auto">-</div>
                              </button>
                            </th>
                            <th><div className="th-content" onClick={() => handleModalSort('title')}>Course Details (34) <span className={`sort-icon ${modalSortConfig.key === 'title' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('type')}>Type <span className={`sort-icon ${modalSortConfig.key === 'type' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('students')}>Tot. Students <span className={`sort-icon ${modalSortConfig.key === 'students' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('amount')}>Tot. Amount & Visits <span className={`sort-icon ${modalSortConfig.key === 'amount' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th><div className="th-content" onClick={() => handleModalSort('certs')}>Certificates & Avg. Score <span className={`sort-icon ${modalSortConfig.key === 'certs' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                            <th style={{ position: 'relative' }}>
                              <div className="th-content" onClick={() => handleModalSort('feeStatus')}>
                                Charging Fee ({currency.label}) <img src={currency.flag} alt="flag" className="icon-12-mx4" onClick={(e) => { e.stopPropagation(); toggleFlagDropdown('modal-fee'); }} style={{ cursor: 'pointer' }} />
                                <span className={`sort-icon ${modalSortConfig.key === 'feeStatus' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span>
                              </div>
                              {openFlagDropdown === 'modal-fee' && (
                                <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px', top: '100%', right: '50%', transform: 'translateX(50%)', zIndex: 10, position: 'absolute' }}>
                                  {flagOptions.map((option, idx) => (
                                    <button key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`} onClick={() => selectFlagOption(option)}>
                                      <img src={option.flag} alt="flag" className="flag-icon" />
                                      <span>{option.label}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </th>
                            <th className="status-col"><div className="th-content" onClick={() => handleModalSort('status')}>Status <span className={`sort-icon ${modalSortConfig.key === 'status' ? 'active ' + modalSortConfig.direction : ''}`}><img src={hoaupdowncaret} alt="" /></span></div></th>
                          </tr>
                        </thead>
                        <tbody>
                          {getSortedData(modalLessons, modalSortConfig).map((les) => (
                            <tr key={les.id} className={modalSelectedRows.includes(les.id) ? 'selected-row' : ''}>
                              <td><input type="checkbox" className="hoa-checkbox" checked={modalSelectedRows.includes(les.id)} onChange={() => toggleModalRowSelection(les.id)} /></td>
                              <td>
                                <div className="user-meta">
                                  <h5>{les.title}</h5>
                                  <p className="font-11-gray">{les.date}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-500">{les.type}</h5>
                                  <p className="font-11-gray">{les.duration}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-600">{les.students}</h5>
                                  <p className="font-11-gray">{les.views}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-600">{formatAmount(les.amount)}</h5>
                                  <p className="font-11-gray">{les.amountSub}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 className="fw-600">{les.certs}</h5>
                                  <p className="font-11-gray">{les.score}</p>
                                </div>
                              </td>
                              <td>
                                <div className="user-meta">
                                  <h5 style={{ fontWeight: '600', color: les.feeColor }}>{les.feeStatus}</h5>
                                  <p className="font-11-gray">{formatAmount(les.feeAmount)}</p>
                                </div>
                              </td>
                              <td className="status-col">
                                <div className="flex-center-end-gap8">
                                  <span className={`mod-status-pill st-${les.statusType}`}>{les.status}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="hoa-pagination-container list-pagination modal-pagination mb-40">
                      <div className="pagination-left">
                        Show
                        <div className="page-size-dropdown mx-8">
                          <button type="button" className="page-size-button px-8-py-2">10 <img src={hoadowncaret} alt="" /></button>
                        </div>
                        per page
                      </div>
                      <div className="hoa-pagination">
                        <span className="page-range">1-10 of 5</span>
                        <button className="page-nav"><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Prev" /></button>
                        <button className="page-num">1</button>
                        <button className="page-num active">2</button>
                        <button className="page-num">3</button>
                        <button className="page-nav"><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0' }} alt="Next" /></button>
                      </div>
                    </div>

                    <div className="docs-header">
                      <div>
                        <h3 className="mod-docs-title">Documents</h3>
                        <p className="mod-docs-subtitle">Files & Certificate</p>
                      </div>
                      <button className="hoa-btn-light-purple gap-8">
                        <img src={hoadownloadall} alt="" />
                        Download All
                      </button>
                    </div>

                    <div className="docs-grid">
                      {modalDocuments.map((doc) => (
                        <div key={doc.id} className="doc-card">
                          <div className="doc-info">
                            {doc.type === 'ribbon' ? (
                              <img src={hoaknot} alt="" />
                            ) : (
                              <img src={hoapdffile} alt="" />)}
                            <div>
                              <h4>{doc.name}</h4>
                              <p>{doc.size}</p>
                            </div>
                          </div>
                          <button className="download-btn">
                            <img src={hoadownload} alt="" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* === PROJECTS TAB === */}
                {activeTab === 'projects' && (
                  <div className="tab-projects">
                    <div className="proj-info-grid">
                      <div className="info-col">
                        <h4>Profile Info</h4>
                        <ul>
                          <li><img src={hoausericon} alt="" /> UI UX Design</li>
                          <li><img src={hoabriefcase} alt="" /> 6 yrs experience</li>
                          <li><img src={hoalocation} alt="" /> Kigali, Rwanda</li>
                        </ul>
                      </div>
                      <div className="info-col">
                        <h4>Tools & Skills</h4>
                        <ul className="text-list">
                          <li>Adobe Illustrator</li>
                          <li>Adobe Photoshop</li>
                          <li>Coding Skills (CSS, HTML & REACT), +1</li>
                        </ul>
                      </div>
                      <div className="info-col text-right-align">
                        <h4>Projects Stats</h4>
                        <ul className="stats-list">
                          <li><span>Project Views</span> 1,345,780</li>
                          <li><span>Project Likes</span> 236,890</li>
                          <li><span>Project Feedbacks</span> 103,006</li>
                        </ul>
                      </div>
                    </div>

                    <div className="projects-header">
                      <div>
                        <h3 className="mod-projects-title">My Projects</h3>
                        <p className="mod-projects-subtitle"><strong>100</strong> Projects in total</p>
                      </div>
                      <button className="follower-btn">
                        <img src={hoafollowers} alt="" />
                        <strong>129</strong> Followers
                      </button>
                    </div>
                    <div className="projects-grid">
                      {modalProjects.map((proj, idx) => (
                        <div key={idx} className="project-card">
                          <div className="proj-img" style={{ backgroundImage: `url(${hoaproject})` }}></div>
                          <div className="proj-meta">
                            <span className="author">By <a href="#" onClick={preventDefault}>{proj.author}</a></span>
                            <div className="proj-stats">
                              <span className="stat-like" onClick={() => toggleProjectLike(idx)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill={likedProjects[idx] ? "#F8285A" : "#A1A5B7"}>
                                  <path d="M20.84 4.61A5.5 5.5 0 0012 5.67A5.5 5.5 0 003.16 4.61C2.5 5.28 2 6.2 2 7.21C2 8.23 2.5 9.15 3.16 9.83L12 18.67L20.84 9.83C21.5 9.15 22 8.23 22 7.21C22 6.2 21.5 5.28 20.84 4.61Z" />
                                </svg> {proj.likes}
                              </span>
                              <span className="stat-view"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A5B7" strokeWidth="2"><path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" /><circle cx="12" cy="12" r="3" /></svg> {proj.views}</span>
                            </div>
                          </div>
                          <p className="proj-title">{proj.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* === ACTIVITY TAB === */}
                {activeTab === 'activity' && (
                  <div className="tab-activity">

                    <h4 className="activity-title" style={{ marginTop: '10px' }}>
                      <img src={hoacalendar} alt="calendar" />
                      Upcoming Activity
                    </h4>

                    <div className="upcoming-activity-card activity-card-bg">
                      <div className="event-row activity-event-row">
                        <h5 className="activity-event-name">Event Name</h5>
                        <span className="event-status activity-status-approved" style={{ background: '#EAFFF1', color: '#17C653', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>Approved <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#17C653" strokeWidth="2" /></svg></span>
                      </div>

                      <p className="event-desc activity-event-desc" style={{ color: '#78829D', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
                        Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.
                      </p>
                      
                      <div className="event-forms activity-event-forms" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', borderTop: '1px solid #EEF1F6', paddingTop: '20px' }}>
                        <div className="form-group border-right activity-form-group-pr" style={{ borderRight: '1px solid #EEF1F6' }}>
                          <label className="activity-form-label" style={{ display: 'block', fontSize: '11px', color: '#A1A5B7', marginBottom: '8px' }}>Reminder</label>
                          <div className="form-select borderless activity-form-select-borderless" style={{ fontWeight: '600', fontSize: '13px', color: '#071437', display: 'flex', alignItems: 'center', gap: '8px' }}>No Reminder <img src={hoadowncaret} alt="" /></div>
                        </div>
                        <div className="form-group border-right activity-form-group-px" style={{ borderRight: '1px solid #EEF1F6', paddingLeft: '10px' }}>
                          <label className="activity-form-label" style={{ display: 'block', fontSize: '11px', color: '#A1A5B7', marginBottom: '8px' }}>Task Priority</label>
                          <div className="form-select borderless activity-priority-badge" style={{ background: '#F8F5FF', border: '1px solid #7239EA33', color: '#5014D0', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}><span className="dot activity-priority-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#5014D0' }}></span> High <img src={hoadowncaret} style={{ opacity: 0.5 }} alt="" /></div>
                        </div>
                        <div className="form-group activity-form-group-pl" style={{ paddingLeft: '10px' }}>
                          <label className="activity-form-label" style={{ display: 'block', fontSize: '11px', color: '#A1A5B7', marginBottom: '8px' }}>Assigned To</label>
                          <div className="form-select borderless activity-form-select-borderless" style={{ fontWeight: '600', fontSize: '13px', color: '#071437', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/assets/imgs/default-profile.png" alt="" className="tiny-avatar rounded-circle" style={{ width: '24px', height: '24px', borderRadius: '50%' }} /> Esther Howard <img src={hoadowncaret} alt="" />
                          </div>
                        </div>
                        <div className="form-group activity-form-group-pl" style={{ paddingLeft: '10px' }}>
                          <label className="activity-form-label" style={{ display: 'block', fontSize: '11px', color: '#A1A5B7', marginBottom: '8px' }}>Attendees</label>
                          <div className="form-select borderless activity-form-select-borderless" style={{ fontWeight: '600', fontSize: '13px', color: '#071437', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <img src="/assets/imgs/default-profile.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', zIndex: 3 }} />
                              <img src="/assets/imgs/default-profile.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', marginLeft: '-10px', zIndex: 2 }} />
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', background: '#F1F1F4', color: '#A1A5B7', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '-10px', zIndex: 1, fontWeight: '700' }}>43+</div>
                            </div>
                            46 Students <img src={hoadowncaret} alt="" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="event-nav activity-event-nav" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '30px' }}>
                        <button className="nav-circle activity-nav-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EEF1F6', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><img src={hoaprev} style={{ width: '8px' }} alt="" /></button>
                        <button className="nav-circle activity-nav-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #EEF1F6', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><img src={hoanext} style={{ width: '8px' }} alt="" /></button>
                      </div>
                    </div>


                    <div className="notifications-section">
                      <div className="notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', marginTop: '40px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#071437' }}>Notifications</h4>
                        <button className="this-week-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid #EEF1F6', borderRadius: '6px', background: '#FFFFFF', color: '#78829D', fontSize: '12px', cursor: 'pointer' }}>
                          <img src={hoacalendar} style={{ width: '14px' }} alt="" /> This week <img src={hoadowncaret} style={{ width: '10px' }} alt="" />
                        </button>
                      </div>

                      <div className="notification-list">
                        {/* Item 1 */}
                        <div className="notification-item" style={{ display: 'flex', justifyContent: 'space-between', borderLeft: '2px solid #1B84FF', paddingLeft: '16px', marginBottom: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#A1A5B7', marginBottom: '8px' }}>
                              <span>10 Jan, 24</span>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E2E8F0' }}></span>
                              <span>Course</span>
                            </div>
                            <div>
                              <strong style={{ color: '#071437', fontSize: '13px', marginRight: '6px' }}>Retake</strong>
                              <span style={{ color: '#78829D', fontSize: '13px' }}>Course failed ,try again to get certificates. 49.5%</span>
                            </div>
                          </div>
                          <button style={{ background: 'transparent', border: '1px solid #EEF1F6', borderRadius: '4px', padding: '4px 8px', height: '32px', color: '#78829D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋮</button>
                        </div>

                        {/* Item 2 */}
                        <div className="notification-item" style={{ display: 'flex', justifyContent: 'space-between', borderLeft: '2px solid #17C653', paddingLeft: '16px', marginBottom: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#A1A5B7', marginBottom: '8px' }}>
                              <span>10 Jan, 24</span>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E2E8F0' }}></span>
                              <span>Payment</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div>
                                <strong style={{ color: '#071437', fontSize: '13px', marginRight: '6px' }}>Course Paid Successful</strong>
                                <span style={{ color: '#78829D', fontSize: '13px' }}>Payment was successful completed and</span>
                              </div>
                              <span style={{ color: '#78829D', fontSize: '13px' }}>approved. Using <strong style={{ color: '#450468', fontWeight: '600' }}>MTN Mobile Money</strong>.</span>
                            </div>
                          </div>
                          <button style={{ background: 'transparent', border: '1px solid #EEF1F6', borderRadius: '4px', padding: '4px 8px', height: '32px', color: '#78829D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋮</button>
                        </div>

                        {/* Item 3 */}
                        <div className="notification-item" style={{ display: 'flex', justifyContent: 'space-between', borderLeft: '2px solid #17C653', paddingLeft: '16px', marginBottom: '24px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#A1A5B7', marginBottom: '8px' }}>
                              <span>10 Jan, 24</span>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E2E8F0' }}></span>
                              <span>Payment</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div>
                                <strong style={{ color: '#071437', fontSize: '13px', marginRight: '6px' }}>Course Paid Successful</strong>
                                <span style={{ color: '#78829D', fontSize: '13px' }}>Payment was successful completed and</span>
                              </div>
                              <span style={{ color: '#78829D', fontSize: '13px' }}>approved. Using <strong style={{ color: '#450468', fontWeight: '600' }}>MTN Mobile Money</strong>.</span>
                            </div>
                          </div>
                          <button style={{ background: 'transparent', border: '1px solid #EEF1F6', borderRadius: '4px', padding: '4px 8px', height: '32px', color: '#78829D', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋮</button>
                        </div>
                      </div>

                      <div className="hoa-pagination-container justify-center" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                        <div className="hoa-pagination" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button className="page-nav" style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBDFE9', borderRadius: '6px', background: '#FFFFFF', cursor: 'pointer' }}><img src={hoaprev} style={{ width: '6px' }} alt="Prev" /></button>
                          <button className="page-num" style={{ width: '34px', height: '34px', border: 'none', background: 'transparent', color: '#4B5675', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>1</button>
                          <button className="page-num active" style={{ width: '34px', height: '34px', border: 'none', background: '#450468', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', borderRadius: '6px', cursor: 'pointer' }}>2</button>
                          <button className="page-num" style={{ width: '34px', height: '34px', border: 'none', background: 'transparent', color: '#4B5675', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>3</button>
                          <button className="page-num" style={{ width: '34px', height: '34px', border: 'none', background: 'transparent', color: '#4B5675', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>4</button>
                          <button className="page-num" style={{ width: '34px', height: '34px', border: 'none', background: 'transparent', color: '#4B5675', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>5</button>
                          <span className="page-dots" style={{ color: '#A1A5B7' }}>...</span>
                          <button className="page-nav" style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBDFE9', borderRadius: '6px', background: '#FFFFFF', cursor: 'pointer' }}><img src={hoanext} style={{ width: '6px' }} alt="Next" /></button>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {fullScreenImage && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', padding: '10px' }}>&times;</button>
            <img src={fullScreenImage} alt="Full Screen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}
      </div>
    </HOALayout>
  );
};

export default HOATutors;
