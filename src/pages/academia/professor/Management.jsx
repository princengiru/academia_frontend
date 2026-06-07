import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import EmptyState from '../../../components/EmptyState/EmptyState';
import './management.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  // --- Table Data & Pagination State (server-driven) ---
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsTotal, setRowsTotal] = useState(0);
  const [rowsError, setRowsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((rowsTotal || rows.length) / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const filteredRows = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (
      String(r.student).toLowerCase().includes(q) ||
      String(r.assessment).toLowerCase().includes(q) ||
      String(r.type).toLowerCase().includes(q)
    ));
  }, [rows, searchTerm]);

  const currentRows = filteredRows.slice(startIndex, startIndex + pageSize);

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

  // Load instructor dashboard data and map courses -> table rows
  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('token');

    const load = async () => {
      setRowsLoading(true);
      setRowsError('');
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load dashboard');

        if (!mounted) return;

        const courses = data?.data?.courses || [];
        const earnings = data?.data?.courseEarnings || [];

        const mapped = courses.map((c) => {
          const earn = earnings.find(e => e.id === c.id) || {};
          const students = earn.students || 0;
          const statusTone = c.status === 'published' ? 'completed' : (c.status === 'draft' ? 'not-published' : 'not-checked');

          return {
            id: c.id,
            student: c.title,
            country: c.level || '',
            assessment: c.description || '',
            progress: c.created_at ? new Date(c.created_at).toLocaleDateString() : '',
            type: c.status || '',
            questions: `${students} students`,
            score: '-',
            attempts: students,
            duration: '-',
            status: c.status || '',
            statusTone,
          };
        });

        setRows(mapped);
        setRowsTotal(mapped.length);
      } catch (err) {
        if (mounted) setRowsError(err.message || 'Failed to load rows');
      } finally {
        if (mounted) setRowsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Prepare rows rendering (simpler than long inline ternary)
  const renderRows = (() => {
    if (rowsLoading) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
        </tr>
      );
    }

    if (rowsError) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger, #c00)' }}>
            Error: {rowsError}
          </td>
        </tr>
      );
    }

    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan={8} style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <img src="/assets/icons/empty-assignments.svg" alt="No assessments" style={{ width: 88, height: 88, opacity: 0.9 }} />
              <h3 style={{ margin: '0.25rem 0', fontSize: '1.15rem' }}>No assessments yet</h3>
              <p style={{ margin: 0, color: 'var(--muted, #666)', maxWidth: 520, textAlign: 'center' }}>You don't have any assessments. Create a formative or summative assessment to get started.</p>
              <div style={{ marginTop: '0.9rem', display: 'flex', gap: '.6rem' }}>
                <button className="learners-btn learners-btn-primary" onClick={(e) => { e.preventDefault(); navigate('/academia/professor/assignments'); }}>Create Assessment</button>
                <button className="learners-btn learners-btn-secondary" onClick={(e) => { e.preventDefault(); }}>Import Questions</button>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return currentRows.map((row) => (
      <tr key={row.id} onClick={() => navigate(`/academia/professor/courses/${row.id}`)} style={{ cursor: 'pointer' }}>
        <td className="is-checkbox">
          <label className="prof-table-checkbox" aria-label={`Select ${row.student}`}>
            <input
              type="checkbox"
              checked={selectedRowIds.has(row.id)}
              onChange={(e) => { e.stopPropagation(); handleSelectRow(row.id); }}
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
    ));
  })();

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
              <input
                type="search"
                placeholder="Search Assignments..."
                aria-label="Search Assignments"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
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
                  <th><span>Student Details ({rowsTotal || rows.length})</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Assessment Details</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Assessment Type</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Avg. Score</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Attempts</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Duration (Min)</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                  <th><span>Status</span><img src="/assets/icons/sorter.svg" alt="Sort" /></th>
                </tr>
              </thead>
              <tbody>
                {renderRows}
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
              <span>{Math.min(startIndex + 1, rowsTotal || rows.length)}-{Math.min(startIndex + pageSize, rowsTotal || rows.length)} of {rowsTotal || rows.length}</span>
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