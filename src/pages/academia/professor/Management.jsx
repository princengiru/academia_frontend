import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management.css';

const Management = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('management');
  
  const managementTabs = [
    { id: 'management', label: 'Students' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Table Data & Pagination State ---
  const allRows = [
    { id: 1, student: 'Alexis Ndayambaje Froduard', country: 'Rwanda', assessment: 'Javascript Fundamental Quiz', progress: '10 days ago', type: 'Formative Assessment', questions: '4 Questions', score: '34.67', attempts: '3', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 2, student: 'Nagy Timea', country: 'Russia', assessment: 'Javascript Fundamental Quiz', progress: '9 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '35.45', attempts: '23', duration: '90 Min', status: 'Not-Checked', statusTone: 'not-checked' },
    { id: 3, student: 'Illes Eva', country: 'America', assessment: 'Javascript Fundamental Quiz', progress: '8 days ago', type: 'Formative Assessment', questions: '4 Questions', score: '---', attempts: '---', duration: '90 Min', status: 'Not-Published', statusTone: 'not-published' },
    { id: 4, student: 'Halasz Emese', country: 'Burundi', assessment: 'Javascript Fundamental Quiz', progress: '7 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '19.52', attempts: '123', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 5, student: 'Soos Annamaria', country: 'Rwanda', assessment: 'Javascript Fundamental Quiz', progress: '7 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '67.43', attempts: '4', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 6, student: 'Varga Dora', country: 'Rwanda', assessment: 'Javascript Fundamental Quiz', progress: '6 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '67.43', attempts: '4', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 7, student: 'Hajdu Dominika', country: 'Rwanda', assessment: 'Javascript Fundamental Quiz', progress: '5 days ago', type: 'Formative Assessment', questions: '4 Questions', score: '67.43', attempts: '331', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 8, student: 'Kiss Dorka', country: 'Rwanda', assessment: 'Javascript Fundamental Quiz', progress: '5 days ago', type: 'Formative Assessment', questions: '4 Questions', score: '67.43', attempts: '4', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 9, student: 'Virag Mercedesz', country: 'Mexico', assessment: 'Javascript Fundamental Quiz', progress: '4 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '67.43', attempts: '4', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
    { id: 10, student: 'Laszlo Cintia', country: 'America', assessment: 'Javascript Fundamental Quiz', progress: '3 days ago', type: 'Summative Assessment', questions: '23 Questions', score: '67.43', attempts: '4', duration: '90 Min', status: 'Completed', statusTone: 'completed' },
  ];

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allRows.length / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const currentRows = allRows.slice(startIndex, startIndex + pageSize);

  // --- Table Selection State ---
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const selectAllRef = useRef(null);

  const isAllVisibleSelected = currentRows.length > 0 && currentRows.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = currentRows.some(row => selectedRowIds.has(row.id));

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newSelection = new Set(selectedRowIds);
    currentRows.forEach(row => {
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
    <ProfessorLayout currentPage="management">
      <section className="prof-management-page">
        
        {/* Header */}
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Management</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/plus1.svg" alt="" />
                <span>Add Event</span>
              </a>

              <a className="learners-btn learners-btn-secondary" href="#" onClick={preventDefault}>
                <img src="/assets/icons/van.svg" alt="" />
                <span>View Analytics</span>
              </a>

              <a className="learners-btn learners-btn-primary" href="#" onClick={preventDefault}>
                <span>Go to website</span>
                <img src="/assets/icons/exit-right.svg" alt="" />
              </a>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="prof-management-tabs" aria-label="Management sections">
          {managementTabs.map((tab) => (
            <Link 
              key={tab.id}
              to={`/academia/professor/${tab.id}`} 
              className={`prof-management-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Hero Section */}
        <section className="assessments-hero">
          <div className="assessments-hero-copy">
            <h2>Online Students</h2>
            <p>Tests and Exams</p>
          </div>

          <div className="assessments-hero-actions">
            <div className="assessments-search">
              <img src="/assets/icons/magnifier.svg" alt="Search" />
              <input type="search" placeholder="Search Assignments..." aria-label="Search Assignments" />
            </div>

            <button type="button" className="assessments-create-btn" onClick={preventDefault}>
              <img src="/assets/icons/plus1.svg" alt="" aria-hidden="true" />
              <span>Create new test</span>
            </button>
          </div>
        </section>

        {/* Table Section */}
        <section className="assessments-table-wrap">
          <div className="table-responsive">
            <table className="assessments-table">
              <thead>
                <tr>
                  <th className="is-checkbox">
                    <label className="prof-table-checkbox" aria-label="Select all students">
                      <input 
                        type="checkbox" 
                        ref={selectAllRef} 
                        checked={isAllVisibleSelected} 
                        onChange={handleSelectAll} 
                      />
                      <span></span>
                    </label>
                  </th>
                  <th><span>Student Details ({allRows.length})</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Assessment Details</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Assessment Type</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Avg. Score</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Attempts</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Duration (Min)</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Status</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row) => (
                  <tr key={row.id}>
                    <td className="is-checkbox">
                      <label className="prof-table-checkbox" aria-label={`Select ${row.student}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedRowIds.has(row.id)} 
                          onChange={() => handleSelectRow(row.id)} 
                        />
                        <span></span>
                      </label>
                    </td>
                    <td>
                      <div className="assessments-details">
                        <h4>{row.student}</h4>
                        <p>{row.country}</p>
                      </div>
                    </td>
                    <td>
                      <div className="assessments-details">
                        <h4>{row.assessment}</h4>
                        <p>{row.progress}</p>
                      </div>
                    </td>
                    <td>
                      <div className="assessments-type">
                        <span>{row.type}</span>
                        <p>{row.questions}</p>
                      </div>
                    </td>
                    <td>{row.score}</td>
                    <td>{row.attempts}</td>
                    <td>{row.duration}</td>
                    <td>
                      <span className={`assessments-status assessments-status--${row.statusTone}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="assessments-footer">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(5); setCurrentPage(1); }}>5</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(10); setCurrentPage(1); }}>10</a></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setPageSize(25); setCurrentPage(1); }}>25</a></li>
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>{Math.min(startIndex + 1, allRows.length)}-{Math.min(startIndex + pageSize, allRows.length)} of {allRows.length}</span>
              <button type="button" className="assessments-page-nav" aria-label="Previous" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  type="button" 
                  className={`assessments-page-num ${currentPage === num ? 'is-active' : ''}`} 
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}
              <button type="button" className="assessments-page-nav" aria-label="Next" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>→</button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default Management;