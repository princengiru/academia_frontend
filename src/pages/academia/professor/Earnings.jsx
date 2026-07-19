import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import { professorPageTitle } from './professorBrand';
import filtersIcon from '../../../assets/icons/filters-icon.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import './earnings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COURSE_SHOW_OPTIONS = [
  { value: 'sales', label: 'With sales only' },
  { value: 'all', label: 'All courses' },
];

const COURSE_SORT_OPTIONS = [
  { value: 'total_revenue:desc', label: 'Collected · high → low' },
  { value: 'total_revenue:asc', label: 'Collected · low → high' },
  { value: 'total_fees:desc', label: 'Fees · high → low' },
  { value: 'completed_payments:desc', label: 'Enrollments · high → low' },
  { value: 'title:asc', label: 'Title · A → Z' },
  { value: 'title:desc', label: 'Title · Z → A' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const money = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const normalizePaymentRow = (row, index) => {
  const gross = Number(row?.amount_paid ?? row?.total ?? 0);
  const fee = Number(row?.fees_per_amount ?? row?.service_fee ?? 0);
  const net = Number.isFinite(gross) && Number.isFinite(fee) ? gross - fee : Number(row?.net_paid);
  const status = row?.payment_status || row?.status || 'pending';
  const dateRaw = row?.payment_date || row?.paid_at || row?.created_at;

  return {
    id: row?.id ?? `pay-${index}`,
    course: row?.course_title || 'Unknown course',
    date: dateRaw ? new Date(dateRaw).toLocaleDateString() : '—',
    student: row?.payer_name || row?.payer_email || 'Unknown student',
    method: row?.payment_method || '—',
    gross: money(gross),
    fee: money(fee),
    net: money(net),
    status,
    statusTone: String(status).toLowerCase() === 'paid' ? 'paid' : String(status).toLowerCase() === 'failed' ? 'failed' : 'pending',
  };
};

const Earnings = () => {
  const navigate = useNavigate();
  const [reloadKey, setReloadKey] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [financial, setFinancial] = useState(null);
  const [courseRows, setCourseRows] = useState([]);
  const [courseSummary, setCourseSummary] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseSort, setCourseSort] = useState({ key: 'total_revenue', direction: 'desc' });
  const [courseSalesOnly, setCourseSalesOnly] = useState(true);

  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [payments, setPayments] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    document.title = professorPageTitle('Earnings');
  }, []);

  const loadSummary = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSummaryError('Please sign in to view earnings.');
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [analyticsRes, byCourseRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/instructor/analytics`, { headers, signal }),
        fetch(`${API_BASE_URL}/api/instructor/payment-summary-by-course`, { headers, signal }),
      ]);

      const analyticsBody = await analyticsRes.json().catch(() => ({}));
      const byCourseBody = await byCourseRes.json().catch(() => ({}));

      if (!analyticsRes.ok && !byCourseRes.ok) {
        throw new Error(
          analyticsBody?.error?.message ||
            byCourseBody?.error?.message ||
            analyticsBody?.message ||
            'Could not load earnings.'
        );
      }

      if (analyticsRes.ok) {
        setFinancial(analyticsBody?.data?.financial || null);
      }

      if (byCourseRes.ok) {
        const payload = byCourseBody?.data || {};
        const courses = Array.isArray(payload.courses)
          ? payload.courses
          : Array.isArray(payload)
            ? payload
            : [];
        setCourseRows(courses);
        setCourseSummary(payload.overall_summary || payload.summary || null);
      } else {
        setCourseRows([]);
        setCourseSummary(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setFinancial(null);
        setCourseRows([]);
        setCourseSummary(null);
        setSummaryError(err.message || 'Could not load earnings.');
      }
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPaymentsError('Please sign in to view payment history.');
      setPaymentsLoading(false);
      return;
    }

    setPaymentsLoading(true);
    setPaymentsError('');
    try {
      const offset = (page - 1) * pageSize;
      const q = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset),
      });
      if (statusFilter !== 'all') q.set('status', statusFilter);

      const res = await fetch(`${API_BASE_URL}/api/instructor/payment-history?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Payment history is not available.');
      }

      const raw = Array.isArray(body?.data?.payments) ? body.data.payments : [];
      setPayments(raw.map(normalizePaymentRow));
      setPaymentsTotal(Number(body?.data?.pagination?.total || raw.length));
      setPaymentSummary(body?.data?.summary || null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPayments([]);
        setPaymentsTotal(0);
        setPaymentSummary(null);
        setPaymentsError(err.message || 'Could not load payment history.');
      }
    } finally {
      setPaymentsLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    loadSummary(controller.signal);
    return () => controller.abort();
  }, [loadSummary, reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    loadPayments(controller.signal);
    return () => controller.abort();
  }, [loadPayments, reloadKey]);

  const totals = useMemo(() => {
    const gross = Number(
      courseSummary?.total_revenue ?? financial?.total_amount_paid ?? paymentSummary?.total_amount ?? 0
    );
    const fees = Number(courseSummary?.total_fees ?? 0);
    const net = Number(
      courseSummary?.net_revenue ?? (Number.isFinite(gross) && Number.isFinite(fees) ? gross - fees : 0)
    );
    const txFromCourses = courseRows.reduce(
      (sum, row) => sum + Number(row.completed_payments ?? row.total_transactions ?? 0),
      0
    );
    const tx = Number(
      financial?.total_transactions ??
        paymentSummary?.total_transactions ??
        paymentSummary?.completed ??
        txFromCourses ??
        paymentsTotal ??
        0
    );
    return { gross, fees, net, tx };
  }, [courseSummary, courseRows, financial, paymentSummary, paymentsTotal]);

  const filteredCourses = useMemo(() => {
    let rows = [...courseRows];
    if (courseSalesOnly) {
      rows = rows.filter(
        (row) => Number(row.total_revenue || 0) > 0 || Number(row.completed_payments || 0) > 0
      );
    }
    if (courseSearch.trim()) {
      const q = courseSearch.trim().toLowerCase();
      rows = rows.filter((row) => String(row.title || '').toLowerCase().includes(q));
    }
    const { key, direction } = courseSort;
    rows.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      if (key === 'title') {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return rows;
  }, [courseRows, courseSearch, courseSort, courseSalesOnly]);

  const toggleCourseSort = (key) => {
    setCourseSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const sortMark = (key) => {
    if (courseSort.key !== key) return '';
    return courseSort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const courseThClass = (key, extra = '') =>
    ['prof-earnings-th-btn', courseSort.key === key ? 'is-active' : '', extra].filter(Boolean).join(' ');

  const totalPages = Math.max(1, Math.ceil(paymentsTotal / pageSize));
  const courseShowValue = courseSalesOnly ? 'sales' : 'all';
  const courseShowLabel =
    COURSE_SHOW_OPTIONS.find((opt) => opt.value === courseShowValue)?.label || 'Show';
  const courseSortValue = `${courseSort.key}:${courseSort.direction}`;
  const courseSortLabel =
    COURSE_SORT_OPTIONS.find((opt) => opt.value === courseSortValue)?.label || 'Sort';
  const statusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || 'Filters';

  return (
    <section className="prof-earnings-page">
      <header className="prof-earnings-head">
        <div>
          <h1>Earnings</h1>
          <p>Invoice-based sales from your courses. Payouts are not processed in-app yet.</p>
        </div>
        <div className="prof-earnings-head-actions">
          <button
            type="button"
            className="learners-btn learners-btn-secondary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Refresh
          </button>
          <Link to="/academia/professor/account" className="learners-btn learners-btn-primary">
            Payout methods
          </Link>
        </div>
      </header>

      {summaryError ? (
        <LearnerLoadError
          title="Could not load earnings"
          message={summaryError}
          onRetry={summaryError.includes('sign in') ? undefined : () => setReloadKey((k) => k + 1)}
        />
      ) : summaryLoading ? (
        <ManagementLoading title="Loading earnings…" message="Fetching invoice totals and course breakdown." />
      ) : (
        <>
          <div className="prof-earnings-stats">
            <div className="prof-earnings-stat">
              <span>Collected from learners</span>
              <strong>{money(totals.gross)}</strong>
              <em>Invoice total (price + fee + VAT)</em>
            </div>
            <div className="prof-earnings-stat">
              <span>Platform fees (20%)</span>
              <strong>{money(totals.fees)}</strong>
              <em>Taken from course price only</em>
            </div>
            <div className="prof-earnings-stat">
              <span>After platform fee</span>
              <strong>{money(totals.net)}</strong>
              <em>Collected − fee (not a payout)</em>
            </div>
            <div className="prof-earnings-stat">
              <span>Paid enrollments</span>
              <strong>{totals.tx}</strong>
              <em>Paid invoices on your courses</em>
            </div>
          </div>

          <p className="prof-earnings-legend" role="note">
            Example: course price <strong>200</strong> → fee <strong>40</strong> (20%) → VAT <strong>43.20</strong> (18% of 240)
            → learner pays <strong>283.20</strong>. “After fee” for that sale = 283.20 − 40 = <strong>243.20</strong>.
          </p>

          <section className="prof-earnings-panel">
            <div className="prof-earnings-panel-head">
              <div>
                <h2>By course</h2>
                <p className="prof-earnings-panel-sub">
                  Paid invoice totals per course. Collected is what learners paid; fee is 20% of list prices.
                </p>
              </div>
              <button type="button" className="prof-earnings-link" onClick={() => navigate('/academia/professor/management')}>
                Manage courses
              </button>
            </div>

            <div className="prof-earnings-toolbar">
              <div className="prof-earnings-search">
                <img src={hoasearch} alt="" />
                <input
                  type="search"
                  value={courseSearch}
                  placeholder="Search courses…"
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
              </div>

              <div className="prof-earnings-tools">
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle prof-earnings-dd-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img src={filtersIcon} alt="" />
                    <span>{courseShowLabel}</span>
                  </button>
                  <ul className="dropdown-menu prof-earnings-dd-menu">
                    {COURSE_SHOW_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`dropdown-item ${courseShowValue === opt.value ? 'active' : ''}`}
                          onClick={() => setCourseSalesOnly(opt.value === 'sales')}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle prof-earnings-dd-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img src={filtersIcon} alt="" />
                    <span>{courseSortLabel}</span>
                  </button>
                  <ul className="dropdown-menu prof-earnings-dd-menu">
                    {COURSE_SORT_OPTIONS.map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          className={`dropdown-item ${courseSortValue === opt.value ? 'active' : ''}`}
                          onClick={() => {
                            const [key, direction] = opt.value.split(':');
                            setCourseSort({ key, direction });
                          }}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <p className="prof-earnings-empty">
                {courseRows.length === 0
                  ? 'No course sales yet. Paid enrollments will show here.'
                  : 'No courses match these filters.'}
              </p>
            ) : (
              <div className="prof-earnings-table-wrap">
                <table className="prof-earnings-table">
                  <thead>
                    <tr>
                      <th>
                        <button type="button" className={courseThClass('title')} onClick={() => toggleCourseSort('title')}>
                          Course{sortMark('title')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('completed_payments')} onClick={() => toggleCourseSort('completed_payments')}>
                          Enrollments{sortMark('completed_payments')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('total_students')} onClick={() => toggleCourseSort('total_students')}>
                          Students{sortMark('total_students')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('price')} onClick={() => toggleCourseSort('price')}>
                          List price{sortMark('price')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('total_revenue')} onClick={() => toggleCourseSort('total_revenue')}>
                          Collected{sortMark('total_revenue')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('total_fees')} onClick={() => toggleCourseSort('total_fees')}>
                          Fee{sortMark('total_fees')}
                        </button>
                      </th>
                      <th className="is-num">
                        <button type="button" className={courseThClass('net_revenue')} onClick={() => toggleCourseSort('net_revenue')}>
                          After fee{sortMark('net_revenue')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="is-primary">
                          {course.title || 'Untitled course'}
                          {course.type ? <span className="prof-earnings-muted">{course.type}</span> : null}
                        </td>
                        <td className="is-num">{course.completed_payments ?? course.total_transactions ?? 0}</td>
                        <td className="is-num">{course.total_students ?? 0}</td>
                        <td className="is-num">{money(course.price)}</td>
                        <td className="is-num">{money(course.total_revenue)}</td>
                        <td className="is-num">{money(course.total_fees)}</td>
                        <td className="is-num">{money(course.net_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <section className="prof-earnings-panel">
        <div className="prof-earnings-panel-head">
          <div>
            <h2>Payment history</h2>
            <p className="prof-earnings-panel-sub">
              One row per invoice. Gross is the learner total; net is gross minus platform fee.
            </p>
          </div>
        </div>

        <div className="prof-earnings-toolbar prof-earnings-toolbar--end">
          <div className="prof-earnings-tools">
            <div className="dropdown">
              <button
                type="button"
                className={`dropdown-toggle prof-earnings-dd-btn prof-earnings-dd-btn--filter ${statusFilter !== 'all' ? 'is-active' : ''}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img src={filtersIcon} alt="" />
                <span>{statusFilter === 'all' ? 'Filters' : statusLabel}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end prof-earnings-dd-menu">
                {STATUS_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className={`dropdown-item ${statusFilter === opt.value ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setPage(1);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {paymentsError ? (
          <LearnerLoadError
            title="Could not load payment history"
            message={paymentsError}
            onRetry={paymentsError.includes('sign in') ? undefined : () => setReloadKey((k) => k + 1)}
          />
        ) : paymentsLoading ? (
          <ManagementLoading compact title="Loading payments…" />
        ) : payments.length === 0 ? (
          <p className="prof-earnings-empty">No payments match this filter.</p>
        ) : (
          <>
            <div className="prof-earnings-table-wrap">
              <table className="prof-earnings-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Method</th>
                    <th className="is-num">Gross</th>
                    <th className="is-num">Fee</th>
                    <th className="is-num">Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td className="is-primary">{row.student}</td>
                      <td>{row.course}</td>
                      <td>{row.method}</td>
                      <td className="is-num">{row.gross}</td>
                      <td className="is-num">{row.fee}</td>
                      <td className="is-num">{row.net}</td>
                      <td>
                        <span className={`prof-earnings-status is-${row.statusTone}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="prof-earnings-footer">
              <div className="prof-earnings-page-size">
                <span>Show</span>
                <div className="dropdown">
                  <button
                    type="button"
                    className="dropdown-toggle prof-earnings-page-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span>{pageSize}</span>
                  </button>
                  <ul className="dropdown-menu prof-earnings-dd-menu">
                    {[10, 20, 50].map((size) => (
                      <li key={size}>
                        <button
                          type="button"
                          className={`dropdown-item ${pageSize === size ? 'active' : ''}`}
                          onClick={() => {
                            setPageSize(size);
                            setPage(1);
                          }}
                        >
                          {size}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <span>per page</span>
              </div>
              <div className="prof-earnings-pagination">
                <span>
                  {paymentsTotal === 0
                    ? '0–0 of 0'
                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, paymentsTotal)} of ${paymentsTotal}`}
                </span>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  ←
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <p className="prof-earnings-note">
        Amounts come from paid invoices for your courses (gross includes learner total charged; fees are platform service fees).
        Manage mobile money or bank details under{' '}
        <Link to="/academia/professor/account">Account → payment methods</Link>.
      </p>
    </section>
  );
};

export default Earnings;
