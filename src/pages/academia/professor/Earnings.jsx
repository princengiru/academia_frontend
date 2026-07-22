import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ManagementLoading from './ManagementLoading';
import { professorPageTitle } from './professorBrand';
import './earnings.css';
import { AcademiaDataTable, AcademiaStatusPill, useClientTableState } from '../shared';
import { professorNetFromInvoice } from '../shared/courseFinance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COURSE_SHOW_OPTIONS = [
  { value: 'sales', label: 'With sales only' },
  { value: 'all', label: 'All courses' },
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
  const vat = Number(row?.vat);
  const net = Number.isFinite(vat)
    ? Number(row?.net_paid ?? (gross - fee - vat))
    : professorNetFromInvoice({
      total: gross,
      amount_paid: gross,
      vat: row?.vat,
      service_fee: fee,
      fees_per_amount: fee,
    });
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
    const vat = Number(courseSummary?.total_vat ?? 0);
    const net = Number(
      courseSummary?.net_revenue
        ?? professorNetFromInvoice({ total: gross, service_fee: fees, vat })
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
    return { gross, fees, vat, net, tx };
  }, [courseSummary, courseRows, financial, paymentSummary, paymentsTotal]);

  const courseTable = useClientTableState({
    rows: courseRows,
    searchFn: (row, query) => String(row.title || '').toLowerCase().includes(String(query).toLowerCase()),
    filterFn: (row, filter) => {
      if (filter === 'all') return true;
      return Number(row.total_revenue || 0) > 0 || Number(row.completed_payments || 0) > 0;
    },
    defaultFilter: courseSalesOnly ? 'sales' : 'all',
    defaultSortKey: 'total_revenue',
    defaultSortDirection: 'desc',
    numericKeys: ['completed_payments', 'total_students', 'price', 'total_revenue', 'total_fees', 'net_revenue'],
    getRowKey: (row) => row.id,
    pageSizeOptions: ['5', '10', '25'],
  });

  // Keep local flag in sync when filter changes from table UI
  const handleCourseFilterChange = (id) => {
    courseTable.setActiveFilter(id);
    setCourseSalesOnly(id === 'sales');
  };


  const paymentTotalPages = Math.max(1, Math.ceil(paymentsTotal / pageSize));
  const paymentRangeLabel = paymentsTotal === 0
    ? '0'
    : `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, paymentsTotal)}`;
  const paymentVisiblePages = (() => {
    if (paymentTotalPages <= 3) return Array.from({ length: paymentTotalPages }, (_, i) => i + 1);
    if (page === 1) return [1, 2, 3];
    if (page === paymentTotalPages) return [paymentTotalPages - 2, paymentTotalPages - 1, paymentTotalPages];
    return [page - 1, page, page + 1];
  })();


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
              <em>VAT-inclusive course price (what they paid)</em>
            </div>
            <div className="prof-earnings-stat">
              <span>VAT (18%)</span>
              <strong>{money(totals.vat)}</strong>
              <em>Included in the price (× 18/118)</em>
            </div>
            <div className="prof-earnings-stat">
              <span>Platform fees (20%)</span>
              <strong>{money(totals.fees)}</strong>
              <em>20% of net after VAT</em>
            </div>
            <div className="prof-earnings-stat">
              <span>Your share (80%)</span>
              <strong>{money(totals.net)}</strong>
              <em>80% of net after VAT (not a payout yet)</em>
            </div>
          </div>

          <p className="prof-earnings-legend" role="note">
            Example: course <strong>200</strong> (learner pays 200) → VAT <strong>30.51</strong> (18/118)
            → net <strong>169.49</strong> → fee <strong>33.90</strong> (20%) → professor <strong>135.59</strong> (80%).
          </p>

          <div className="prof-earnings-counts" style={{ marginBottom: 12 }}>
            <span className="adt-muted">{totals.tx} paid enrollment{totals.tx === 1 ? '' : 's'}</span>
          </div>

          <AcademiaDataTable
            title="By course"
            subtitle="Paid invoice totals per course. List price is what learners paid; fee is 20% of net after VAT."
            searchPlaceholder="Search courses…"
            searchQuery={courseTable.searchQuery}
            onSearchChange={courseTable.setSearchQuery}
            filters={COURSE_SHOW_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label }))}
            activeFilter={courseTable.activeFilter}
            onFilterChange={handleCourseFilterChange}
            defaultFilterLabel="Show"
            toolbarExtra={(
              <button type="button" className="adt-btn-light-purple" onClick={() => navigate('/academia/professor/management')}>
                Manage courses
              </button>
            )}
            columns={[
              {
                key: 'title',
                label: 'Course',
                sortable: true,
                renderCell: (course) => (
                  <div>
                    <div className="adt-fw-600">{course.title || 'Untitled course'}</div>
                    {course.type ? <p className="adt-muted">{course.type}</p> : null}
                  </div>
                ),
              },
              {
                key: 'completed_payments',
                label: 'Enrollments',
                sortable: true,
                align: 'right',
                renderCell: (course) => course.completed_payments ?? course.total_transactions ?? 0,
              },
              {
                key: 'total_students',
                label: 'Students',
                sortable: true,
                align: 'right',
                renderCell: (course) => course.total_students ?? 0,
              },
              {
                key: 'price',
                label: 'List price',
                sortable: true,
                align: 'right',
                renderCell: (course) => money(course.price),
              },
              {
                key: 'total_revenue',
                label: 'Collected',
                sortable: true,
                align: 'right',
                renderCell: (course) => money(course.total_revenue),
              },
              {
                key: 'total_fees',
                label: 'Fee',
                sortable: true,
                align: 'right',
                renderCell: (course) => money(course.total_fees),
              },
              {
                key: 'net_revenue',
                label: 'Your share',
                sortable: true,
                align: 'right',
                renderCell: (course) => money(course.net_revenue),
              },
            ]}
            rows={courseTable.pageRows}
            getRowKey={(row) => row.id}
            sortConfig={courseTable.sortConfig}
            onSort={courseTable.handleSort}
            loading={summaryLoading && courseRows.length === 0}
            emptyTitle="No course sales yet"
            emptyMessage={courseRows.length === 0 ? 'Paid enrollments will show here.' : 'No courses match these filters.'}
            pageSize={courseTable.pageSize}
            pageSizeOptions={courseTable.pageSizeOptions}
            onPageSizeChange={courseTable.setPageSize}
            currentPage={courseTable.currentPage}
            totalPages={courseTable.totalPages}
            totalItems={courseTable.totalItems}
            rangeLabel={courseTable.rangeLabel}
            onGoToPage={courseTable.goToPage}
            visiblePageNumbers={courseTable.visiblePageNumbers}
          />
        </>
      )}

      <AcademiaDataTable
        title="Payment history"
        subtitle="One row per invoice. Gross is what the learner paid; net is your 80% share after VAT and platform fee."
        filters={STATUS_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label }))}
        activeFilter={statusFilter}
        onFilterChange={(id) => { setStatusFilter(id); setPage(1); }}
        defaultFilterLabel="Filters"
        columns={[
          { key: 'date', label: 'Date', sortable: true, renderCell: (row) => row.date },
          { key: 'student', label: 'Student', sortable: true, renderCell: (row) => <span className="adt-fw-600">{row.student}</span> },
          { key: 'course', label: 'Course', sortable: true },
          { key: 'method', label: 'Method' },
          { key: 'gross', label: 'Gross', align: 'right' },
          { key: 'fee', label: 'Fee', align: 'right' },
          { key: 'net', label: 'Net', align: 'right' },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            renderCell: (row) => (
              <AcademiaStatusPill tone={row.statusTone === 'paid' ? 'green' : row.statusTone === 'failed' ? 'red' : 'orange'}>
                {row.status}
              </AcademiaStatusPill>
            ),
          },
        ]}
        rows={payments}
        getRowKey={(row) => row.id}
        loading={paymentsLoading && payments.length === 0}
        error={paymentsError}
        onRetry={paymentsError.includes('sign in') ? undefined : () => setReloadKey((k) => k + 1)}
        emptyTitle="No payments found"
        emptyMessage="No payments match this filter."
        pageSize={String(pageSize)}
        pageSizeOptions={['10', '20', '50']}
        onPageSizeChange={(size) => { setPageSize(Number(size)); setPage(1); }}
        currentPage={page}
        totalPages={paymentTotalPages}
        totalItems={paymentsTotal}
        rangeLabel={paymentRangeLabel}
        onGoToPage={(p) => setPage(Math.min(Math.max(p, 1), paymentTotalPages))}
        visiblePageNumbers={paymentVisiblePages}
      />

      <p className="prof-earnings-note">
        Amounts come from paid invoices for your courses. Course price is VAT-inclusive (what the learner paid);
        platform fee is 20% of the net after VAT; your share is 80% of that net.
        Manage mobile money or bank details under{' '}
        <Link to="/academia/professor/account">Account → payment methods</Link>.
      </p>
    </section>
  );
};

export default Earnings;
