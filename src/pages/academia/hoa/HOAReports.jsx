import React, { useEffect, useMemo, useState } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency } from '../../../hooks/useCurrency';
import { HOALoadError, HOALoading, HOAEmptyState, HOATableEmptyRow } from './HOAPageState';
import './hoa-reports.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaupdowncaret from '../../../assets/icons/hoaupdowncaret.svg';
import hoadollar from '../../../assets/icons/hoadollar.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import hoafilter from '../../../assets/icons/hoafilter.svg';
import hoaleftarrow from '../../../assets/icons/hoaleftarrow.svg';
import hoarightarrow from '../../../assets/icons/hoarightarrow.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formatCount = (value) => {
  if (value === null || value === undefined || value === '') return '0';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

const HOAReports = () => {
  const { currency, formatAmount } = useCurrency();
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'tutorName', direction: 'asc' });
  const [pageSize, setPageSize] = useState('10');
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const pageSizeOptions = ['5', '10', '20'];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);

  const reportsApiConnected = false;

  useEffect(() => {
    let mounted = true;

    const fetchReportsData = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please sign in to view reports.');

        const headers = { Authorization: `Bearer ${token}` };
        const metricsRes = await fetch(`${API_BASE_URL}/api/dashboard/metrics`, { headers });

        if (!mounted) return;

        if (metricsRes.status === 401) {
          throw new Error('Your session expired. Please sign in again.');
        }

        if (metricsRes.ok) {
          const body = await metricsRes.json();
          setMetrics(body?.data || body || {});
        } else {
          setMetrics({});
        }

        setPaymentHistory([]);
      } catch (error) {
        if (mounted) {
          setMetrics({});
          setPaymentHistory([]);
          setFetchError(error.message || 'Failed to load reports.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchReportsData();
    return () => { mounted = false; };
  }, [retryKey]);

  const topStats = useMemo(() => ([
    { title: 'Total Revenue', amount: formatCount(metrics.revenue) },
    { title: 'Syllabus', amount: formatCount(metrics.totalSyllabus) },
    { title: 'Online Courses', amount: formatCount(metrics.totalCourses) },
    { title: 'Certificates', amount: formatCount(metrics.certificates) },
    { title: 'Uploads', amount: formatCount(metrics.uploads) },
  ]), [metrics]);

  const filteredPayments = useMemo(() => {
    let rows = paymentHistory;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) =>
        (row.tutorName || '').toLowerCase().includes(q) ||
        (row.course || '').toLowerCase().includes(q)
      );
    }
    if (selectedFilter !== 'All Status') {
      rows = rows.filter((row) => row.status === selectedFilter);
    }
    if (!sortConfig.key) return rows;
    return [...rows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && String(aVal).includes('USD')) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [paymentHistory, searchQuery, selectedFilter, sortConfig]);

  const limit = parseInt(pageSize, 10) || 10;
  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const paginatedPayments = filteredPayments.slice(0, limit);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]));
  };

  const clearSelectedRows = () => setSelectedRows([]);

  return (
    <HOALayout currentPage="reports">
      <div className="hoa-reports-page">

        <div className="hoa-page-header">
          <h1>Reports</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => setRetryKey((key) => key + 1)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Refresh" className={`sync-icon ${isLoading ? 'spinning' : ''}`} />
              {isLoading ? 'Updating...' : 'Data updated every 5min'}
              <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button type="button" className="hoa-btn-primary" onClick={() => window.open('/academia/index', '_blank')}>
              Go to website <img src={hoagoto} alt="Go" />
            </button>
          </div>
        </div>

        <div className="hoa-reports-notice" role="status">
          Summary counts below come from the dashboard metrics API. Detailed payment trends, country breakdowns, and payment history require a dedicated reports API that is not connected yet.
        </div>

        {fetchError ? (
          <HOALoadError
            title="Could not load reports"
            message={fetchError}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        ) : isLoading ? (
          <HOALoading message="Loading reports…" />
        ) : (
        <>
        <div className="rep-dashboard-stats-container">
          <div className="rep-secondary-stats-row">
            {topStats.map((stat) => (
              <div key={stat.title} className="rep-sub-stat">
                <h4>
                  {stat.amount}
                  <span className="rep-stat-currency">
                    {stat.title === 'Total Revenue' ? currency.label : 'count'}
                    {stat.title === 'Total Revenue' ? (
                      <img src={currency.flag} alt="flag" style={{ width: 12 }} />
                    ) : null}
                  </span>
                </h4>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-charts-grid">
          <div className="rep-card">
            <HOAEmptyState
              inline
              title="Trend charts not connected"
              message="Monthly certificate, project, and upload trends will appear when the reports API is available."
            />
          </div>
          <div className="rep-card">
            <HOAEmptyState
              inline
              title="Upload averages not connected"
              message="Syllabus and online course upload charts need backend time-series data."
            />
          </div>
        </div>

        <div className="rep-middle-grid">
          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">GROSS REVENUE</h4>
            </div>
            <div className="rep-revenue-top">
              <div className="rep-rev-icon">
                <img src={hoadollar} alt="Dollar" />
              </div>
              <div className="rep-rev-info">
                <h2>
                  {metrics.revenue != null && metrics.revenue !== ''
                    ? `+ ${formatAmount(`${metrics.revenue} USD`).replace(' USD', '').replace(' RWF', '')}`
                    : '—'}
                  <span className="rep-stat-currency" style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4 }}>
                    {currency.label} <img src={currency.flag} alt="flag" style={{ width: 14 }} />
                  </span>
                </h2>
                <p>TOTAL REVENUE {reportsApiConnected ? null : <span className="hoa-reports-muted">from dashboard metrics</span>}</p>
              </div>
            </div>
            <HOAEmptyState
              inline
              title="Revenue breakdown unavailable"
              message="Category splits (syllabus, courses, certificates, projects) will show here once the reports API provides them."
            />
          </div>

          <div className="rep-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="rep-chart-header" style={{ marginBottom: 0 }}>
              <h4 className="rep-section-title">COUNTRIES REPORT</h4>
            </div>
            <HOAEmptyState
              inline
              title="No country breakdown yet"
              message="Geographic revenue data is not available from the current API."
            />
          </div>
        </div>

        <div className="rep-table-header-area">
          <div className="rep-table-title">
            <h2>Payment History</h2>
            <p>{reportsApiConnected ? 'Online Course & Past Papers' : 'Awaiting reports API connection'}</p>
          </div>
          <div className="rep-table-actions">
            <div className="rep-search-box">
              <img src={hoasearch} alt="search" className="search-icon" />
              <div className="search-divider"></div>
              <input
                type="text"
                placeholder="Search payments…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={paymentHistory.length === 0}
              />
            </div>
            <div className="rep-filter-dropdown-container" style={{ position: 'relative' }}>
              <button type="button" className="rep-btn-filters" onClick={() => setIsFilterOpen(!isFilterOpen)} disabled={paymentHistory.length === 0}>
                <img src={hoafilter} alt="" style={{ width: 14 }} /> {selectedFilter === 'All Status' ? 'Filters' : selectedFilter}
              </button>
              {isFilterOpen && (
                <div className="learners-performance-period-menu" style={{ position: 'absolute', background: '#FFF', top: '100%', right: 0, marginTop: '8px', zIndex: 10 }}>
                  {['All Status', 'Completed', 'In Progress', 'Failed'].map((option) => (
                    <div
                      key={option}
                      className={`dropdown-item ${selectedFilter === option ? 'active' : ''}`}
                      onClick={() => { setSelectedFilter(option); setIsFilterOpen(false); }}
                    >
                      {option}
                    </div>
                  ))}
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
                    Tutor Details ({totalItems})
                    <span className={`sort-icon ${sortConfig.key === 'tutorName' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('course')}>
                    Course name
                    <span className={`sort-icon ${sortConfig.key === 'course' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('amount')}>
                    Payment Method <img src={currency.flag} alt="flag" style={{ width: 14 }} />
                    <span className={`sort-icon ${sortConfig.key === 'amount' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('reason')}>
                    Payment Reason
                    <span className={`sort-icon ${sortConfig.key === 'reason' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('role')}>
                    Role
                    <span className={`sort-icon ${sortConfig.key === 'role' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
                <th>
                  <div className="th-inner" onClick={() => handleSort('status')}>
                    Status
                    <span className={`sort-icon ${sortConfig.key === 'status' ? `active ${sortConfig.direction}` : ''}`}><img src={hoaupdowncaret} alt="sort" /></span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.map((row) => (
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
                      <span>{row.location}</span>
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
                      <span>{row.payMethod}</span>
                    </div>
                  </td>
                  <td><span className="rep-td-reason">{row.reason}</span></td>
                  <td><span className="rep-td-role">{row.role}</span></td>
                  <td>
                    <span className={`rep-status rep-st-${row.statusColor}`}>
                      <span className="dot"></span> {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedPayments.length === 0 && (
                <HOATableEmptyRow
                  colSpan={7}
                  title="No payment history yet"
                  message="Payment records will appear here once the admin reports API is connected."
                />
              )}
            </tbody>
          </table>
        </div>

        <div className="hoa-pagination-container list-pagination">
          <div className="pagination-left">
            Show
            <div className="page-size-dropdown mx-8">
              <button type="button" className="page-size-button px-8-py-2" onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}>
                {pageSize} <img src={hoadowncaret} alt="" />
              </button>
              {isPageSizeOpen && (
                <div className="page-size-menu">
                  {pageSizeOptions.map((opt) => (
                    <button key={opt} type="button" className="page-size-option" onClick={() => { setPageSize(opt); setIsPageSizeOpen(false); }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            per page
          </div>
          <div className="hoa-pagination">
            <span className="page-range">
              {totalItems === 0 ? '0' : `1-${Math.min(limit, totalItems)}`} of {totalItems}
            </span>
            <button className="page-nav" disabled={totalPages <= 1}><img src={hoaleftarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: 0.5 }} alt="Prev" /></button>
            <button className="page-num active">1</button>
            <button className="page-nav" disabled={totalPages <= 1}><img src={hoarightarrow} className="icon-15" style={{ width: '20px', height: '20px', padding: '0', opacity: 0.5 }} alt="Next" /></button>
          </div>
        </div>
        </>
        )}

      </div>
    </HOALayout>
  );
};

export default HOAReports;
