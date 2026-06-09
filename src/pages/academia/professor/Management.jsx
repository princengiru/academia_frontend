import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './management.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Management = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();

  // --- Tab State ---
  const [activeTab, setActiveTab] = useState('management');
  
  const managementTabs = [
    { id: 'management', label: 'Students' },
    { id: 'management-schedule', label: 'Schedule' },
    { id: 'management-lessons-ranks', label: 'Lessons Ranks' },
    { id: 'management-student-qa', label: 'Student Q&A' },
  ];

  // --- Table & Fetch State ---
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState('');
  
  // --- Search & Pagination State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Table Selection State ---
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  const selectAllRef = useRef(null);

  // 1. Debounce Search to optimize filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Data (with AbortController to prevent race conditions)
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const loadData = async () => {
      if (!token) {
        setRowsError('Authentication missing.');
        setRowsLoading(false);
        return;
      }

      setRowsLoading(true);
      setRowsError('');

      try {
        // NOTE: Consider swapping this to /api/instructor/students or /api/instructor/assessments/all
        const res = await fetch(`${API_BASE_URL}/api/dashboard/instructor`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load dashboard data');

        const courses = data?.data?.courses || [];
        const earnings = data?.data?.courseEarnings || [];

        const mapped = courses.map((c) => {
          const earn = earnings.find(e => e.id === c.id) || {};
          const studentsCount = earn.students || 0;
          const statusTone = c.status === 'published' ? 'completed' : (c.status === 'draft' ? 'not-published' : 'not-checked');

          return {
            id: c.id,
            student: c.title || 'Unknown Student',
            country: c.level || 'N/A',
            assessment: c.description || 'No Assessment',
            progress: c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A',
            type: c.status || 'Draft',
            questions: `${studentsCount} students`,
            score: '-',
            attempts: studentsCount,
            duration: '-',
            status: c.status || 'draft',
            statusTone,
          };
        });

        setRows(mapped);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setRowsError(err.message || 'Failed to load rows');
        }
      } finally {
        setRowsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  // 3. Client-Side Filter & Pagination Logic
  const filteredRows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (
      String(r.student).toLowerCase().includes(q) ||
      String(r.assessment).toLowerCase().includes(q) ||
      String(r.type).toLowerCase().includes(q)
    ));
  }, [rows, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  
  // Safety check to ensure we don't get stuck on an empty page if data shrinks
  const safeCurrentPage = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage !== safeCurrentPage) setCurrentPage(safeCurrentPage);
  }, [safeCurrentPage, currentPage]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const currentRows = filteredRows.slice(startIndex, startIndex + pageSize);

  // Calculate sliding window for pagination buttons (prevents rendering 50 buttons)
  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (safeCurrentPage === 1) return [1, 2, 3];
    if (safeCurrentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1];
  }, [safeCurrentPage, totalPages]);

  // --- Checkbox Logic ---
  const isAllVisibleSelected = currentRows.length > 0 && currentRows.every(row => selectedRowIds.has(row.id));
  const isSomeVisibleSelected = currentRows.some(row => selectedRowIds.has(row.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected && !isAllVisibleSelected;
    }
  }, [isSomeVisibleSelected, isAllVisibleSelected]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      currentRows.forEach(row => isChecked ? next.add(row.id) : next.delete(row.id));
      return next;
    });
  };

  const handleSelectRow = (id) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Handlers ---
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const renderRows = () => {
    if (rowsLoading && rows.length === 0) {
      return <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Loading records...</td></tr>;
    }

    if (rowsError) {
      return <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger, #c00)' }}>Error: {rowsError}</td></tr>;
    }

    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan={8} style={{ padding: '2.5rem' }}>
            <div className="prof-management-empty-state">
              <div className="prof-management-empty-state-card">
                <h3>No records found</h3>
                <p>{debouncedSearch ? 'Try adjusting your search criteria.' : "You don't have any assessments yet. Create one to get started."}</p>
                {!debouncedSearch && (
                  <div className="prof-management-empty-state-actions">
                    <button className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/professor/assignments')}>Create Assessment</button>
                    <button className="learners-btn learners-btn-secondary">Import Questions</button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      );
    }

    return currentRows.map((row) => (
      <tr 
        key={row.id} 
        onClick={() => navigate(`/academia/professor/courses/${row.id}`)} 
        style={{ cursor: 'pointer' }}
        className={selectedRowIds.has(row.id) ? 'is-selected' : ''}
      >
        <td className="is-checkbox" onClick={(e) => e.stopPropagation()}>
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
    ));
  };

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
              <img src="/assets/icons/magnifier.svg" alt="" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search Assignments..."
                aria-label="Search Assignments"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button type="button" className="assessments-create-btn" onClick={() => navigate('/academia/professor/assignments')}>
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
                  <th><span>Student Details ({filteredRows.length})</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Assessment Details</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Assessment Type</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Avg. Score</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Attempts</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Duration (Min)</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                  <th><span>Status</span><img src="/assets/icons/sorter.svg" alt="" /></th>
                </tr>
              </thead>
              <tbody>
                {renderRows()}
              </tbody>
            </table>
          </div>

          {/* Footer & Pagination */}
          <div className="assessments-footer">
            <div className="assessments-per-page">
              <span>Show</span>
              <div className="dropdown assessments-per-page-dropdown">
                <button type="button" className="dropdown-toggle assessments-per-page-btn" data-bs-toggle="dropdown" aria-expanded="false">
                  <span>{pageSize}</span>
                  <img src="/assets/icons/drop.svg" alt="" />
                </button>
                <ul className="dropdown-menu">
                  {[5, 10, 25].map(size => (
                    <li key={size}>
                      <button type="button" className="dropdown-item" onClick={() => handlePageSizeChange(size)}>
                        {size}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <span>per page</span>
            </div>

            <div className="assessments-pagination">
              <span>
                {filteredRows.length === 0 ? '0-0 of 0' : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredRows.length)} of ${filteredRows.length}`}
              </span>
              <button 
                type="button" 
                className="assessments-page-nav" 
                aria-label="Previous" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
              >
                ←
              </button>
              
              {visiblePageNumbers.map(num => (
                <button 
                  key={num} 
                  type="button" 
                  className={`assessments-page-num ${safeCurrentPage === num ? 'is-active' : ''}`} 
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button 
                type="button" 
                className="assessments-page-nav" 
                aria-label="Next" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                →
              </button>
            </div>
          </div>
        </section>

      </section>
    </ProfessorLayout>
  );
};

export default Management;