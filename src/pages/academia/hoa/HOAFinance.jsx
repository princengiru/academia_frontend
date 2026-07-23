import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency } from '../../../hooks/useCurrency';
import { HOALoadError, HOALoading, HOAEmptyState } from './HOAPageState';
import { professorNetFromInvoice } from '../shared/courseFinance';
import hoafilter2 from '../../../assets/icons/hoafilter2.svg';
import hoasearch from '../../../assets/icons/hoasearch.svg';
import './hoa-finance.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TUTOR_SORT_OPTIONS = [
  { value: 'total_revenue:desc', label: 'Collected · high → low' },
  { value: 'total_revenue:asc', label: 'Collected · low → high' },
  { value: 'total_gross:desc', label: 'Course prices · high → low' },
  { value: 'total_fees:desc', label: 'Fees · high → low' },
  { value: 'paid_count:desc', label: 'Invoices · high → low' },
  { value: 'instructor_name:asc', label: 'Name · A → Z' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const moneyPlain = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const statusTone = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid' || s === 'completed') return 'paid';
  if (s === 'failed' || s === 'refunded') return 'failed';
  return 'pending';
};

const normalizePaymentRow = (row, index) => {
  const gross = Number(row?.amount ?? row?.total ?? 0);
  const fee = Number(row?.service_fee ?? 0);
  const vat = Number(row?.vat ?? 0);
  const status = row?.status || 'pending';
  const dateRaw = row?.payment_date || row?.paid_at || row?.created_at;

  return {
    id: row?.id ?? `pay-${index}`,
    date: dateRaw ? new Date(dateRaw).toLocaleDateString() : '—',
    payer: row?.payer_name || row?.tutor_name || row?.name || 'Unknown',
    email: row?.email || '—',
    course: row?.course_title || row?.payment_reason || 'Payment',
    instructor: row?.instructor_name || '—',
    method: row?.payment_method || '—',
    gross,
    fee,
    vat,
    professorNet: professorNetFromInvoice({ total: gross, service_fee: fee, vat }),
    status,
    statusTone: statusTone(status),
  };
};

const HOAFinance = () => {
  const { formatAmount, currency } = useCurrency();
  const [reloadKey, setReloadKey] = useState(0);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const [totals, setTotals] = useState(null);
  const [tutorRows, setTutorRows] = useState([]);
  const [tutorSearch, setTutorSearch] = useState('');
  const [tutorSort, setTutorSort] = useState({ key: 'total_revenue', direction: 'desc' });

  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [payments, setPayments] = useState([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const tutorSortRef = useRef(null);
  const statusFilterRef = useRef(null);
  const pageSizeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      setSearchQuery((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target;
      const inside =
        tutorSortRef.current?.contains(target) ||
        statusFilterRef.current?.contains(target) ||
        pageSizeRef.current?.contains(target);
      if (!inside) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const formatMoney = useCallback(
    (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return '—';
      try {
        return formatAmount(n) || `${moneyPlain(n)} ${currency?.label || ''}`.trim();
      } catch {
        return `${moneyPlain(n)} ${currency?.label || ''}`.trim();
      }
    },
    [formatAmount, currency]
  );

  const loadSummary = useCallback(async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSummaryError('Please sign in to view finance.');
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, tutorsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/reports/payment-summary`, { headers, signal }),
        fetch(`${API_BASE_URL}/api/admin/reports/revenue-by-instructor?limit=50`, { headers, signal }),
        fetch(`${API_BASE_URL}/api/dashboard/metrics`, { headers, signal }),
      ]);

      if (summaryRes.status === 401 || tutorsRes.status === 401 || metricsRes.status === 401) {
        throw new Error('Your session expired. Please sign in again.');
      }

      const summaryBody = await summaryRes.json().catch(() => ({}));
      const tutorsBody = await tutorsRes.json().catch(() => ({}));
      const metricsBody = await metricsRes.json().catch(() => ({}));

      if (!summaryRes.ok && !metricsRes.ok) {
        throw new Error(
          summaryBody?.error?.message ||
            metricsBody?.error?.message ||
            summaryBody?.message ||
            'Could not load finance summary.'
        );
      }

      let nextTotals = null;
      if (summaryRes.ok) {
        const data = summaryBody?.data || {};
        nextTotals = data.totals || null;
        if (!nextTotals && data.total_paid?.amount != null) {
          nextTotals = {
            total_paid: data.total_paid.amount,
            total_gross: data.total_paid.amount,
            total_fees: 0,
            total_vat: 0,
            paid_count: 0,
            pending_count: 0,
            failed_count: 0,
            refunded_count: 0,
            currency: data.total_paid.currency || 'RWF',
          };
        }
      }

      if (!nextTotals && metricsRes.ok) {
        const metrics = metricsBody?.data || metricsBody || {};
        nextTotals = {
          total_paid: metrics.total_revenue ?? 0,
          total_gross: metrics.total_revenue ?? 0,
          total_fees: null,
          total_vat: null,
          paid_count: null,
          pending_count: null,
          failed_count: null,
          refunded_count: null,
          currency: 'RWF',
          fromMetricsOnly: true,
        };
      }

      setTotals(nextTotals);

      if (tutorsRes.ok) {
        const list = tutorsBody?.data?.instructors;
        setTutorRows(Array.isArray(list) ? list : []);
      } else {
        setTutorRows([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setTotals(null);
        setTutorRows([]);
        setSummaryError(err.message || 'Could not load finance summary.');
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
      const q = new URLSearchParams({
        limit: String(pageSize),
        page: String(page),
      });
      if (statusFilter !== 'all') q.set('status', statusFilter);
      if (searchQuery.trim()) q.set('search', searchQuery.trim());

      const res = await fetch(`${API_BASE_URL}/api/admin/reports/payment-history?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        throw new Error('Your session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Payment history is not available.');
      }

      const raw = Array.isArray(body?.data?.payments)
        ? body.data.payments
        : Array.isArray(body?.data)
          ? body.data
          : [];
      setPayments(raw.map(normalizePaymentRow));
      setPaymentsTotal(Number(body?.pagination?.total ?? raw.length));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setPayments([]);
        setPaymentsTotal(0);
        setPaymentsError(err.message || 'Could not load payment history.');
      }
    } finally {
      setPaymentsLoading(false);
    }
  }, [page, pageSize, statusFilter, searchQuery]);

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

  const totalPages = Math.max(1, Math.ceil(paymentsTotal / pageSize));

  const countCards = useMemo(() => {
    if (!totals) return [];
    return [
      { label: 'Paid', value: totals.paid_count },
      { label: 'Pending', value: totals.pending_count },
      { label: 'Failed', value: totals.failed_count },
      { label: 'Refunded', value: totals.refunded_count },
    ];
  }, [totals]);

  const filteredTutors = useMemo(() => {
    let rows = [...tutorRows];
    if (tutorSearch.trim()) {
      const q = tutorSearch.trim().toLowerCase();
      rows = rows.filter(
        (row) =>
          String(row.instructor_name || '').toLowerCase().includes(q) ||
          String(row.instructor_email || '').toLowerCase().includes(q)
      );
    }
    const { key, direction } = tutorSort;
    rows.sort((a, b) => {
      if (key === 'instructor_name') {
        const aVal = String(a.instructor_name || '').toLowerCase();
        const bVal = String(b.instructor_name || '').toLowerCase();
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      const aVal = Number(a[key]) || 0;
      const bVal = Number(b[key]) || 0;
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return rows;
  }, [tutorRows, tutorSearch, tutorSort]);

  const toggleTutorSort = (key) => {
    setTutorSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const tutorSortMark = (key) => {
    if (tutorSort.key !== key) return '';
    return tutorSort.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const tutorThClass = (key) =>
    ['hoa-finance-th-btn', tutorSort.key === key ? 'is-active' : ''].filter(Boolean).join(' ');

  const tutorSortValue = `${tutorSort.key}:${tutorSort.direction}`;
  const tutorSortLabel =
    TUTOR_SORT_OPTIONS.find((opt) => opt.value === tutorSortValue)?.label || 'Sort';
  const statusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)?.label || 'Filters';

  return (
    <HOALayout currentPage="finance">
      <div className="hoa-finance-page">
        <header className="hoa-finance-head">
          <div>
            <h1>Finance</h1>
            <p>
              Platform invoice totals from paid enrollments. Tutor payouts are not processed in-app yet.
            </p>
          </div>
          <div className="hoa-finance-head-actions">
            <button
              type="button"
              className="hoa-finance-btn hoa-finance-btn--secondary"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              Refresh
            </button>
            <Link to="/hoa/reports" className="hoa-finance-btn hoa-finance-btn--ghost">
              Reports
            </Link>
          </div>
        </header>

        {summaryError ? (
          <HOALoadError
            title="Could not load finance"
            message={summaryError}
            onRetry={summaryError.includes('sign in') ? undefined : () => setReloadKey((k) => k + 1)}
            inline
          />
        ) : summaryLoading ? (
          <HOALoading message="Loading finance…" inline />
        ) : (
          <>
            <div className="hoa-finance-stats">
              <div className="hoa-finance-stat">
                <span>Course prices (collected)</span>
                <strong>{formatMoney(totals?.total_gross ?? totals?.total_paid)}</strong>
                <em>VAT-inclusive list prices (what learners paid)</em>
              </div>
              <div className="hoa-finance-stat">
                <span>Platform fees (20%)</span>
                <strong>
                  {totals?.total_fees == null && totals?.fromMetricsOnly
                    ? '—'
                    : formatMoney(totals?.total_fees)}
                </strong>
                <em>20% of net after VAT</em>
              </div>
              <div className="hoa-finance-stat">
                <span>VAT (18%)</span>
                <strong>
                  {totals?.total_vat == null && totals?.fromMetricsOnly
                    ? '—'
                    : formatMoney(totals?.total_vat)}
                </strong>
                <em>Included in price (× 18/118)</em>
              </div>
              <div className="hoa-finance-stat">
                <span>Tutor share (80%)</span>
                <strong>{formatMoney(totals?.net_after_fees ?? (
                  (Number(totals?.total_paid) || 0)
                  - (Number(totals?.total_fees) || 0)
                  - (Number(totals?.total_vat) || 0)
                ))}</strong>
                <em>80% of net after VAT</em>
              </div>
            </div>

            {totals?.fromMetricsOnly ? (
              <p className="hoa-finance-banner" role="status">
                Showing dashboard revenue only. Restart the API server to load fee and VAT breakdowns.
              </p>
            ) : (
              <p className="hoa-finance-legend" role="note">
                Example: course <strong>200</strong> (learner pays 200) → VAT <strong>30.51</strong> (18/118)
                → net <strong>169.49</strong> → fee <strong>33.90</strong> (20%) → tutor <strong>135.59</strong> (80%).
              </p>
            )}

            <div className="hoa-finance-counts">
              {countCards.map((card) => (
                <div key={card.label} className="hoa-finance-count">
                  <span>{card.label}</span>
                  <strong>{card.value == null ? '—' : card.value}</strong>
                </div>
              ))}
            </div>

            <section className="hoa-finance-panel">
              <div className="hoa-finance-panel-head">
                <div>
                  <h2>By tutor</h2>
                  <p className="hoa-finance-panel-sub">
                    Paid invoices grouped by course instructor. Collected is what learners paid.
                  </p>
                </div>
                <Link to="/hoa/tutors" className="hoa-finance-link">
                  Manage tutors
                </Link>
              </div>

              <div className="hoa-finance-toolbar">
                <div className="hoa-finance-search">
                  <img src={hoasearch} alt="" />
                  <input
                    type="search"
                    value={tutorSearch}
                    placeholder="Search tutors…"
                    onChange={(e) => setTutorSearch(e.target.value)}
                  />
                </div>

                <div className="hoa-finance-tools">
                  <div className="hoa-finance-dd" ref={tutorSortRef}>
                    <button
                      type="button"
                      className="hoa-finance-dd-btn"
                      onClick={() => setOpenDropdown((cur) => (cur === 'tutorSort' ? null : 'tutorSort'))}
                    >
                      <img src={hoafilter2} alt="" />
                      <span>{tutorSortLabel}</span>
                    </button>
                    {openDropdown === 'tutorSort' ? (
                      <div className="hoa-finance-dd-menu">
                        {TUTOR_SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`hoa-finance-dd-item ${tutorSortValue === opt.value ? 'active' : ''}`}
                            onClick={() => {
                              const [key, direction] = opt.value.split(':');
                              setTutorSort({ key, direction });
                              setOpenDropdown(null);
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {filteredTutors.length === 0 ? (
                <HOAEmptyState
                  inline
                  title={tutorRows.length === 0 ? 'No tutor revenue yet' : 'No tutors match'}
                  message={
                    tutorRows.length === 0
                      ? 'Paid course enrollments will appear here grouped by instructor.'
                      : 'Try another search.'
                  }
                />
              ) : (
                <div className="hoa-finance-table-wrap">
                  <table className="hoa-finance-table">
                    <thead>
                      <tr>
                        <th>
                          <button type="button" className={tutorThClass('instructor_name')} onClick={() => toggleTutorSort('instructor_name')}>
                            Tutor{tutorSortMark('instructor_name')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('courses_sold')} onClick={() => toggleTutorSort('courses_sold')}>
                            Courses{tutorSortMark('courses_sold')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('paid_count')} onClick={() => toggleTutorSort('paid_count')}>
                            Invoices{tutorSortMark('paid_count')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('total_gross')} onClick={() => toggleTutorSort('total_gross')}>
                            Prices{tutorSortMark('total_gross')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('total_fees')} onClick={() => toggleTutorSort('total_fees')}>
                            Fee{tutorSortMark('total_fees')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('total_vat')} onClick={() => toggleTutorSort('total_vat')}>
                            VAT{tutorSortMark('total_vat')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('total_revenue')} onClick={() => toggleTutorSort('total_revenue')}>
                            Collected{tutorSortMark('total_revenue')}
                          </button>
                        </th>
                        <th className="is-num">
                          <button type="button" className={tutorThClass('net_after_fees')} onClick={() => toggleTutorSort('net_after_fees')}>
                            Tutor share{tutorSortMark('net_after_fees')}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTutors.map((row) => (
                        <tr key={row.instructor_id}>
                          <td className="is-primary">
                            {row.instructor_name || 'Unknown tutor'}
                            {row.instructor_email ? (
                              <span className="hoa-finance-muted">{row.instructor_email}</span>
                            ) : null}
                          </td>
                          <td className="is-num">{row.courses_sold ?? 0}</td>
                          <td className="is-num">{row.paid_count ?? 0}</td>
                          <td className="is-num">{formatMoney(row.total_gross)}</td>
                          <td className="is-num">{formatMoney(row.total_fees)}</td>
                          <td className="is-num">{formatMoney(row.total_vat)}</td>
                          <td className="is-num">{formatMoney(row.total_revenue)}</td>
                          <td className="is-num">{formatMoney(row.net_after_fees)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        <section className="hoa-finance-panel">
          <div className="hoa-finance-panel-head">
            <div>
              <h2>Payment history</h2>
              <p className="hoa-finance-panel-sub">
                One row per invoice across the platform.
              </p>
            </div>
          </div>

          <div className="hoa-finance-toolbar">
            <div className="hoa-finance-search">
              <img src={hoasearch} alt="" />
              <input
                type="search"
                value={searchInput}
                placeholder="Search payer name or email…"
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="hoa-finance-tools">
              <div className="hoa-finance-dd" ref={statusFilterRef}>
                <button
                  type="button"
                  className={`hoa-finance-dd-btn hoa-finance-dd-btn--filter ${statusFilter !== 'all' ? 'is-active' : ''}`}
                  onClick={() => setOpenDropdown((cur) => (cur === 'status' ? null : 'status'))}
                >
                  <img src={hoafilter2} alt="" />
                  <span>{statusFilter === 'all' ? 'Filters' : statusLabel}</span>
                </button>
                {openDropdown === 'status' ? (
                  <div className="hoa-finance-dd-menu hoa-finance-dd-menu--end">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`hoa-finance-dd-item ${statusFilter === opt.value ? 'active' : ''}`}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setPage(1);
                          setOpenDropdown(null);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {paymentsError ? (
            <HOALoadError
              title="Could not load payment history"
              message={paymentsError}
              onRetry={paymentsError.includes('sign in') ? undefined : () => setReloadKey((k) => k + 1)}
              inline
            />
          ) : paymentsLoading ? (
            <HOALoading message="Loading payments…" inline />
          ) : payments.length === 0 ? (
            <HOAEmptyState
              inline
              title="No payments match"
              message="Try another status filter, or wait for the next paid enrollment."
            />
          ) : (
            <>
              <div className="hoa-finance-table-wrap">
                <table className="hoa-finance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payer</th>
                      <th>Course</th>
                      <th>Tutor</th>
                      <th>Method</th>
                      <th className="is-num">Gross</th>
                      <th className="is-num">Fee</th>
                      <th className="is-num">VAT</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td className="is-primary">
                          {row.payer}
                          <span className="hoa-finance-muted">{row.email}</span>
                        </td>
                        <td>{row.course}</td>
                        <td>{row.instructor}</td>
                        <td>{row.method}</td>
                        <td className="is-num">{formatMoney(row.gross)}</td>
                        <td className="is-num">{formatMoney(row.fee)}</td>
                        <td className="is-num">{formatMoney(row.vat)}</td>
                        <td>
                          <span className={`hoa-finance-status is-${row.statusTone}`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="hoa-finance-footer">
                <div className="hoa-finance-page-size">
                  <span>Show</span>
                  <div className="hoa-finance-dd" ref={pageSizeRef}>
                    <button
                      type="button"
                      className="hoa-finance-page-btn"
                      onClick={() => setOpenDropdown((cur) => (cur === 'pageSize' ? null : 'pageSize'))}
                    >
                      <span>{pageSize}</span>
                    </button>
                    {openDropdown === 'pageSize' ? (
                      <div className="hoa-finance-dd-menu">
                        {[10, 20, 50].map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={`hoa-finance-dd-item ${pageSize === size ? 'active' : ''}`}
                            onClick={() => {
                              setPageSize(size);
                              setPage(1);
                              setOpenDropdown(null);
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span>per page</span>
                </div>
                <div className="hoa-finance-pagination">
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

        <p className="hoa-finance-note">
          Amounts come from paid invoices. Course price is VAT-inclusive (what the learner paid); VAT is
          extracted (× 18/118); platform fee is 20% of the net after VAT; tutor share is 80% of that net.
          There is no wallet or payout ledger yet — do not treat tutor share as money owed until payouts ship.
        </p>
      </div>
    </HOALayout>
  );
};

export default HOAFinance;
