import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import { useCurrency, flagOptions } from '../../../hooks/useCurrency';
import './hoa-learners.css';
import { openCertificatePreview } from '../certificateUtils';
import { AcademiaDataTable, AcademiaStatusPill, useClientTableState } from '../shared';

// --- Icons & Images ---
import hoausflag from '../../../assets/icons/hoausflag.svg';
import hoadowncaret from '../../../assets/icons/hoadowncaret.svg';
import hoaincrease from '../../../assets/icons/hoaincrease.svg';
import hoadecrease from '../../../assets/icons/hoadecrease.svg';
import hoaadd from '../../../assets/icons/hoaadd.svg';
import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
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
import defaultAvatar from '../../../assets/imgs/default-profile.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HOALearners = () => {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();
  const { currency, setCurrency, formatAmount } = useCurrency();

  // --- Modal Specific Data State ---
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [learnerArchives, setLearnerArchives] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // --- Main Data State ---
  const [learnersData, setLearnersData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // --- Dropdowns & Refs ---
  const [openFlagDropdown, setOpenFlagDropdown] = useState(null);
  const flagRef = useRef(null);

  const filterOptions = ['All Learners', 'Active', 'Inactive', 'Suspended'];

  // --- Shared client-side search/filter/sort/pagination pipeline (replaces local table state) ---
  const table = useClientTableState({
    rows: learnersData,
    searchFn: (row, query) => String(row.name || '').toLowerCase().includes(String(query).toLowerCase()),
    filterFn: (row, filter) => filter === 'All Learners' || row.status === filter,
    defaultFilter: 'All Learners',
    defaultSortKey: 'name',
    numericKeys: ['score', 'attempts', 'downloads', 'certs', 'paid'],
    getRowKey: (row) => row.id,
  });

  // --- Modal & Detailed View State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLearnerId, setActiveLearnerId] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'projects', 'activity'
  const [modalSortConfig, setModalSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [modalSelectedRows, setModalSelectedRows] = useState([]);
  const [openTickets, setOpenTickets] = useState({ 1: true });
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoverData, setHoverData] = useState({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 });

  const [openRowMenuId, setOpenRowMenuId] = useState(null);
  const [openEnrollmentMenuId, setOpenEnrollmentMenuId] = useState(null);
  const [isDrawerMenuOpen, setIsDrawerMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const applyStatusOptimistic = (ids, action) => {
    const idSet = new Set(ids.map(String));
    const nextStatus = action === 'suspend'
      ? { status: 'Suspended', statusColor: 'red' }
      : { status: 'Active', statusColor: 'green' };
    setLearnersData((prev) =>
      prev.map((learner) => (idSet.has(String(learner.id)) ? { ...learner, ...nextStatus } : learner))
    );
  };

  const applyDeleteOptimistic = (ids) => {
    const idSet = new Set(ids.map(String));
    setLearnersData((prev) => prev.filter((learner) => !idSet.has(String(learner.id))));
    table.setSelectedKeys((prev) => prev.filter((id) => !idSet.has(String(id))));
    if (activeLearnerId && idSet.has(String(activeLearnerId))) {
      setIsModalOpen(false);
      setActiveLearnerId(null);
      setActiveTab('lessons');
      setLearnerProfile(null);
    }
  };

  // --- Click Outside Handlers ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (flagRef.current && !flagRef.current.contains(event.target)) setOpenFlagDropdown(null);
      
      // Close custom action menus when clicking outside
      if (!event.target.closest('.hoa-row-action-menu')) setOpenRowMenuId(null);
      if (!event.target.closest('.profile-actions')) setIsDrawerMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Data Fetching ---
  const fetchLearnersData = async (mounted = true) => {
    setIsLoading(true);
    setFetchError('');
    try {
      const token = localStorage.getItem('token');
      
      // If no token exists, boot them immediately
      if (!token) {
        navigate('/auth/signin');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, learnersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/learners/stats`, { headers }).catch(() => null),
        fetch(`${API_BASE_URL}/api/admin/learners`, { headers }).catch(() => null)
      ]);

      if (!mounted) return;

      // Handle 401 Unauthorized / Token Expiry
      if (statsRes?.status === 401 || learnersRes?.status === 401) {
        console.warn("Unauthorized access. Token may be expired.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth/signin');
        return;
      }

      if (statsRes?.ok) {
        const sBody = await statsRes.json();
        setStatsData(sBody?.data || sBody);
      } else {
        setStatsData({}); 
      }

      if (learnersRes?.ok) {
        const lBody = await learnersRes.json();
        
        // 1. Add lBody?.data?.learners to the check
        const rawDataList = Array.isArray(lBody?.data?.learners) ? lBody.data.learners 
                          : Array.isArray(lBody?.data?.users) ? lBody.data.users 
                          : Array.isArray(lBody?.data) ? lBody.data 
                          : Array.isArray(lBody) ? lBody : [];

        setLearnersData(rawDataList.map(user => {
          const safeStatus = String(user.status || 'active').toLowerCase();
          const isActive = safeStatus === 'active' || safeStatus === '1';
          const isSuspended = safeStatus === 'suspended' || safeStatus === '0';

          return {
            id: user.id,
            name: user.name || user.email || 'Unknown Learner',
            location: user.location || 'Global',
            flag: hoausflag, 
            // 2. Map exact keys from your Swagger response:
            score: user.avg_score || '0.00', 
            attempts: user.attempts || 0,
            downloads: user.downloads || 0,
            certs: user.certificates || 0,
            paid: user.total_paid_usd || '0',
            status: isSuspended ? 'Suspended' : (isActive ? 'Active' : 'Inactive'),
            statusColor: isSuspended ? 'red' : (isActive ? 'green' : 'gray')
          };
        }));
      } else {
        const errorBody = await learnersRes?.json().catch(() => ({}));
        throw new Error(errorBody?.message || errorBody?.error?.message || 'Failed to load learners.');
      }
    } catch (error) {
      console.error("Failed to fetch learners", error);
      if (mounted) {
        setStatsData({});
        setLearnersData([]);
        setFetchError(error.message || 'Failed to load learners.');
      }
    } finally {
      if (mounted) setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchLearnersData(mounted);
    return () => { mounted = false; };
  }, [retryKey]);

  // --- Handlers ---
  const handleModalSort = (key) => {
    setModalSortConfig(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  // --- Fetch Detailed Profile ---
  const fetchLearnerProfile = async (id) => {
    setIsProfileLoading(true);
    setLearnerProfile(null);
    setLearnerArchives([]);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [profileRes, archivesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/learners/${id}/profile`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/learners/${id}/archives`, { headers }),
      ]);

      if (profileRes.ok) {
        const body = await profileRes.json();
        const profile = body.data || body;
        setLearnerProfile({
          ...profile,
          enrollments: profile.enrollments || (profile.enrolledCourses || []).map((course) => ({
            id: course.enrollment_id || course.id,
            course_id: course.id,
            course_name: course.title,
            course: {
              title: course.title,
              instructor_name: course.instructor_name,
              type: 'Online Course',
            },
            enrolled_at: course.enrolled_at,
            progress_percentage: course.progress_percentage ?? course.progress?.overall_progress ?? 0,
            status: course.status || 'active',
          })),
        });
      } else {
        console.error('Failed to fetch profile. Status:', profileRes.status);
      }

      if (archivesRes.ok) {
        const archivesBody = await archivesRes.json();
        const archives = Array.isArray(archivesBody?.data) ? archivesBody.data : (archivesBody?.data?.data || []);
        setLearnerArchives(archives);
      }
    } catch (error) {
      console.error('Error fetching learner profile:', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const openModal = (learnerId) => {
    setActiveLearnerId(learnerId);
    fetchLearnerProfile(learnerId); // Trigger the fetch here
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setActiveLearnerId(null);
    setActiveTab('lessons');
    setLearnerProfile(null);
    setLearnerArchives([]);
    setOpenEnrollmentMenuId(null);
  };

  const handleUnenrollEnrollment = (courseId, courseTitle) => {
    if (!activeLearnerId || !courseId) return;
    setOpenEnrollmentMenuId(null);
    setConfirmAction({
      kind: 'unenroll',
      ids: [activeLearnerId],
      courseId,
      courseTitle,
      title: 'Unenroll learner from course?',
      message: `${courseTitle || 'This course'} will be removed from the learner's active enrollments. Progress will be archived and they can re-enroll later.`,
      confirmLabel: 'Unenroll',
      destructive: true,
    });
  };

  const handleSingleStatusChange = (learnerId, action) => {
    setConfirmAction({
      kind: action,
      ids: [learnerId],
      title: action === 'suspend' ? 'Suspend learner?' : 'Activate learner?',
      message: action === 'suspend'
        ? 'This learner will lose access until an admin reactivates the account.'
        : 'This learner will regain access to Academia.',
      confirmLabel: action === 'suspend' ? 'Suspend' : 'Activate',
    });
  };

  const handleSingleDelete = (learnerId) => {
    setConfirmAction({
      kind: 'delete',
      ids: [learnerId],
      title: 'Delete learner?',
      message: 'This permanently removes the learner account from admin listings. This cannot be undone from HOA.',
      confirmLabel: 'Delete',
      destructive: true,
    });
  };

  const handleBulkStatusChange = (action) => {
    if (table.selectedKeys.length === 0) return;
    setConfirmAction({
      kind: `bulk-${action}`,
      ids: [...table.selectedKeys],
      title: action === 'suspend' ? 'Suspend selected learners?' : 'Activate selected learners?',
      message: `${table.selectedKeys.length} learner${table.selectedKeys.length === 1 ? '' : 's'} will be ${action === 'suspend' ? 'suspended' : 'activated'}.`,
      confirmLabel: action === 'suspend' ? 'Suspend all' : 'Activate all',
    });
  };

  const handleBulkDelete = () => {
    if (table.selectedKeys.length === 0) return;
    setConfirmAction({
      kind: 'bulk-delete',
      ids: [...table.selectedKeys],
      title: 'Delete selected learners?',
      message: `${table.selectedKeys.length} learner${table.selectedKeys.length === 1 ? '' : 's'} will be removed from admin listings. This cannot be undone from HOA.`,
      confirmLabel: 'Delete all',
      destructive: true,
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction || confirmLoading) return;

    const { kind, ids, courseId, courseTitle } = confirmAction;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth/signin');
      return;
    }

    const snapshot = learnersData;
    const selectedSnapshot = table.selectedKeys;
    setConfirmLoading(true);

    try {
      if (kind === 'suspend' || kind === 'activate') {
        applyStatusOptimistic(ids, kind);
        const res = await fetch(`${API_BASE_URL}/api/admin/learners/${ids[0]}/${kind}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: `${kind === 'suspend' ? 'Suspended' : 'Activated'} by admin` }),
        });
        if (!res.ok) throw new Error('Failed to update learner status');
        if (activeLearnerId === ids[0]) fetchLearnerProfile(ids[0]);
        showToast(`Learner ${kind === 'suspend' ? 'suspended' : 'activated'} successfully!`, 'success');
      } else if (kind === 'delete') {
        applyDeleteOptimistic(ids);
        const res = await fetch(`${API_BASE_URL}/api/admin/learners/${ids[0]}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete learner');
        showToast('Learner deleted successfully!', 'success');
      } else if (kind === 'bulk-suspend' || kind === 'bulk-activate') {
        const action = kind === 'bulk-suspend' ? 'suspend' : 'activate';
        applyStatusOptimistic(ids, action);
        table.clearSelection();
        const res = await fetch(`${API_BASE_URL}/api/admin/learners/bulk-${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids, reason: `Bulk ${action === 'suspend' ? 'suspended' : 'activated'} by admin` }),
        });
        if (!res.ok) throw new Error('Failed to perform bulk operation');
        showToast(`Selected learners ${action === 'suspend' ? 'suspended' : 'activated'} successfully!`, 'success');
      } else if (kind === 'bulk-delete') {
        applyDeleteOptimistic(ids);
        const res = await fetch(`${API_BASE_URL}/api/admin/learners/bulk-delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) throw new Error('Failed to delete selected learners');
        showToast('Selected learners deleted successfully!', 'success');
      } else if (kind === 'unenroll') {
        const res = await fetch(`${API_BASE_URL}/api/admin/learners/${ids[0]}/unenroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: courseId,
            reason: `Admin unenroll from ${courseTitle || 'course'}`,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.message || body?.error?.message || 'Failed to unenroll learner');
        }
        if (activeLearnerId === ids[0]) fetchLearnerProfile(ids[0]);
        showToast('Learner unenrolled successfully.', 'success');
      }

      setConfirmAction(null);
    } catch (err) {
      setLearnersData(snapshot);
      table.setSelectedKeys(selectedSnapshot);
      showToast(err.message || 'Action failed', 'error');
      fetchLearnersData(true);
    } finally {
      setConfirmLoading(false);
    }
  };

  // --- Sorting Utility for Modal Data ---
  const getSortedData = (data, config) => {
    if (!config.key || !Array.isArray(data)) return data || [];
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      if (config.key === 'date') {
         aVal = new Date(aVal).getTime() || 0;
         bVal = new Date(bVal).getTime() || 0;
      }
      
      // Handle special numeric cases like "---"
      if (typeof aVal === 'string' && aVal === '---') aVal = -Infinity;
      if (typeof bVal === 'string' && bVal === '---') bVal = -Infinity;

      if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const toggleTicket = (id) => {
    setOpenTickets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Donut Chart Renderer ---
  const renderDonut = (chartId, segments) => {
    const radius = 38;
    const strokeWidth = 16;
    let currentOffsetPercent = 0;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg viewBox="0 0 100 100" className="donut-svg">
          {segments.map((seg, idx) => {
            const dashPercent = seg.percent;
            const offsetPercent = -currentOffsetPercent;
            currentOffsetPercent += seg.percent;

            return (
              <circle
                key={idx} cx="50" cy="50" r={radius} fill="none"
                stroke={seg.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashPercent} 100`} strokeDashoffset={offsetPercent}
                pathLength="100"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseMove={(e) => {
                  const svgRect = e.target.closest('svg').getBoundingClientRect();
                  setHoverData({ chartId, text: seg.tooltipText, tooltipClass: seg.tooltipClass, x: e.clientX - svgRect.left, y: e.clientY - svgRect.top });
                }}
                onMouseLeave={() => setHoverData({ chartId: null, text: '', tooltipClass: '', x: 0, y: 0 })}
              />
            );
          })}
        </svg>
        {hoverData.chartId === chartId && (
          <div className={`donut-tooltip ${hoverData.tooltipClass || ''}`} style={{ top: `${hoverData.y + 10}px`, left: `${hoverData.x + 10}px` }}>
            {hoverData.text}
          </div>
        )}
      </div>
    );
  };

  // --- Flag Dropdown Renderer ---
  const renderFlagDropdown = (key, baseValueRWF) => (
    <div className="hoa-revenue-dropdown-box" ref={openFlagDropdown === key ? flagRef : null}>
      <span className="revenue-label">Total Revenue</span>
      <div className="revenue-value-picker">
        <span className="revenue-value">{formatAmount(baseValueRWF)}</span>
        <div className="flag-dropdown-wrapper">
          <button type="button" className="flag-dropdown-trigger" onClick={() => setOpenFlagDropdown(openFlagDropdown === key ? null : key)}>
            <img src={currency.flag} alt="flag" className="flag-icon" />
            <img src={hoadowncaret} alt="drop" className="flag-dropdown-caret" />
          </button>
          {openFlagDropdown === key && (
            <div className="flag-dropdown-menu" style={{ minWidth: '80px', padding: '4px' }}>
              {flagOptions.map((option, idx) => (
                <button
                  key={idx} type="button" className={`flag-dropdown-option ${currency.label === option.label ? 'active' : ''}`}
                  onClick={() => { setCurrency(option); setOpenFlagDropdown(null); }}
                >
                  <img src={option.flag} alt="flag" className="flag-icon" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <HOALayout currentPage="learners">
      <div className="hoa-learners-page">

        {/* Page Header */}
        <div className="hoa-page-header">
          <h1>Learners</h1>
          <div className="hoa-header-actions">
            <span className="hoa-update-status" onClick={() => fetchLearnersData(true)} style={{ cursor: 'pointer' }}>
              <img src={hoarefresh} alt="Sync" className={`sync-icon ${isLoading ? 'spinning' : ''}`} /> 
              {isLoading ? 'Updating...' : 'Data updated every 5min'} <span className="dot" style={{ background: isLoading ? '#F59E0B' : '#10B981' }}></span>
            </span>
            <button className="hoa-btn-primary" onClick={() => window.open('/index', '_blank')}>
              Go to website <img src={hoagoto} alt="" />
            </button>
          </div>
        </div>

        {/* Top Mini Stats Container */}
        <div className="hoa-dashboard-stats-container">
          <div className="hoa-card hoa-secondary-stats-row">
            <div className="sub-stat"><h4>{statsData?.syllabus_downloads || '0'}</h4><p>Syllabus Downloads</p></div>
            <div className="sub-stat"><h4>{statsData?.online_learners || '0'}</h4><p>Online Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.competent_learners || '0'}</h4><p>Competent Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.nyc_learners || '0'}</h4><p>NYC Learners</p></div>
            <div className="sub-stat"><h4>{statsData?.avg_score || '0.0'}</h4><p>Average Score</p></div>
            <div className="sub-stat"><h4>{statsData?.certificates || '0'}</h4><p>Certificates</p></div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="hoa-dashboard-charts-container">
          <div className="hoa-grid-2">
            {/* Syllabus Stats Card */}
            <div className="hoa-card hoa-chart-card">
              <div className="section-title">SYLLABUS'S STATS</div>
              <div className="chart-body-row">
                <div className="donut-wrapper">
                  <div className="donut-chart">
                    {renderDonut('syllabus', [
                      { percent: 35, color: '#1B84FF', tooltipText: '34.4K Free' },
                      { percent: 15, color: '#F6B100', tooltipText: '23 Download' },
                      { percent: 25, color: '#17C653', tooltipText: '34.4 Readers' },
                      { percent: 25, color: '#E4E4E7', tooltipText: 'Other' },
                    ])}
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item"><span className="dot" style={{ background: '#1B84FF' }}></span> <strong>34.4K</strong> Free Downloads</div>
                  <div className="legend-item"><span className="dot" style={{ background: '#FFC700' }}></span> <strong>4.4K</strong> Paid Downloads</div>
                  <div className="legend-item"><span className="dot" style={{ background: '#17C653' }}></span> <strong>34.4</strong> Online Readers</div>
                </div>
              </div>
              <div className="chart-footer-stats">
                <span><strong>38.8K</strong> Total Downloads</span>
                <span><strong>34.4 H</strong> Avg. Learning Hours</span>
              </div>
              {renderFlagDropdown('syllabus', 9600000)}
            </div>

            {/* Online Courses Stats Card */}
            <div className="hoa-card hoa-chart-card">
              <div className="section-title" style={{ marginBottom: '20px' }}>ONLINE COURSES'S STATS</div>
              <div className="chart-body-row">
                <div className="donut-wrapper">
                  <div className="donut-chart">
                    {renderDonut('courses', [
                      { percent: 35, color: '#17C653', tooltipText: '34.4K Free' },
                      { percent: 10, color: '#F6B100', tooltipText: '23 Failed', tooltipClass: 'tooltip-failed' },
                      { percent: 40, color: '#1B84FF', tooltipText: '4.4K Paid' },
                      { percent: 15, color: '#E4E4E7', tooltipText: 'Other' },
                    ])}
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item"><span className="dot" style={{ background: '#1B84FF' }}></span> <strong>34.4K</strong> Free Courses</div>
                  <div className="legend-item"><span className="dot" style={{ background: '#FFC700' }}></span> <strong>4.4K</strong> Paid Courses</div>
                  <div className="legend-item"><span className="dot" style={{ background: '#17C653' }}></span> <strong>34.4</strong> Avg. Active students</div>
                </div>
              </div>
              <div className="chart-footer-stats">
                <span><strong>38.8K</strong> Total Learners</span>
                <span><strong>34.4 H</strong> Avg. Learning Hours</span>
              </div>
              {renderFlagDropdown('courses', 9600000)}
            </div>
          </div>
        </div>

        {/* Learners List (Shared AcademiaDataTable) */}
        <AcademiaDataTable
          title="Learners"
          subtitle="Online Course & Past Papers"
          searchPlaceholder="Search Learners..."
          searchQuery={table.searchQuery}
          onSearchChange={table.setSearchQuery}
          filters={filterOptions.map((option) => ({ id: option, label: option }))}
          activeFilter={table.activeFilter}
          onFilterChange={table.setActiveFilter}
          defaultFilterLabel="Filters"
          toolbarExtra={(
            <button type="button" className="adt-btn-light-purple">
              <img src={hoaadd} alt="Add" /> Create new test
            </button>
          )}
          bulkBar={table.selectedKeys.length > 0 ? (
            <div className="hoa-bulk-actions-bar" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F3E8FF', padding: '12px 20px', borderRadius: '8px', border: '1px solid #E9D5FF', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#450468' }}>{table.selectedKeys.length} learners selected</span>
              <button className="hoa-btn-primary" onClick={() => handleBulkStatusChange('suspend')} style={{ background: '#D97706', height: '36px', border: 'none', padding: '0 16px', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Suspend</button>
              <button className="hoa-btn-primary" onClick={() => handleBulkStatusChange('activate')} style={{ background: '#10B981', height: '36px', border: 'none', padding: '0 16px', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Activate</button>
              <button className="hoa-btn-primary" onClick={handleBulkDelete} style={{ background: '#EF4444', height: '36px', border: 'none', padding: '0 16px', borderRadius: '4px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              <button className="hoa-btn-light-purple" onClick={table.clearSelection} style={{ height: '36px', border: 'none', padding: '0 16px', borderRadius: '6px', color: '#450468', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: 'rgba(69, 4, 104, 0.07)' }}>Cancel</button>
            </div>
          ) : null}
          columns={[
            {
              key: 'name',
              label: () => `Student Details (${table.totalItems})`,
              sortable: true,
              renderCell: (req) => (
                <div className="list-user-col">
                  <div className="user-meta">
                    <h5>{req.name}</h5>
                    <p className="location-with-flag">
                      <img src={req.flag} alt="flag" className="tiny-flag" /> {req.location}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: 'score',
              label: 'Avg. Score',
              sortable: true,
              align: 'center',
              cellClassName: 'fw-600',
              renderCell: (req) => req.score,
            },
            {
              key: 'attempts',
              label: 'Attempts',
              sortable: true,
              align: 'center',
              cellClassName: 'fw-500',
              renderCell: (req) => req.attempts,
            },
            {
              key: 'downloads',
              label: 'Downloads',
              sortable: true,
              align: 'center',
              cellClassName: 'fw-500',
              renderCell: (req) => req.downloads,
            },
            {
              key: 'certs',
              label: 'Certificates',
              sortable: true,
              align: 'center',
              cellClassName: 'fw-500',
              renderCell: (req) => req.certs,
            },
            {
              key: 'paid',
              label: () => `Tot. Paid (${currency.label})`,
              sortable: true,
              align: 'center',
              cellClassName: 'fw-600',
              renderCell: (req) => formatAmount(req.paid),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              headerClassName: 'status-col',
              cellClassName: 'status-col',
              renderCell: (req) => (
                <AcademiaStatusPill tone={req.statusColor}>{req.status}</AcademiaStatusPill>
              ),
            },
            {
              key: 'actions',
              label: '',
              headerClassName: 'action-col',
              cellClassName: 'action-col',
              cellStyle: { position: 'relative' },
              renderCell: (req) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a href="#view" className="table-link-icon" onClick={(e) => { preventDefault(e); openModal(req.id); }} title="View Details">
                    <img src={hoaopenview} alt="Open" />
                  </a>

                  {/* Action dots menu */}
                  <div className="hoa-row-action-menu" style={{ position: 'relative', display: 'inline-flex' }}>
                    <button
                      className="table-link-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRowMenuId(openRowMenuId === req.id ? null : req.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <img src={hoaverticaldots} alt="More" style={{ width: '12px', opacity: 0.7 }} />
                    </button>

                    {openRowMenuId === req.id && (
                      <div className="hoa-row-dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #EEF1F6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '120px', padding: '4px' }}>
                        {req.status === 'Suspended' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleStatusChange(req.id, 'activate');
                              setOpenRowMenuId(null);
                            }}
                            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#10B981', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleStatusChange(req.id, 'suspend');
                              setOpenRowMenuId(null);
                            }}
                            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#D97706', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleDelete(req.id);
                            setOpenRowMenuId(null);
                          }}
                          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
          rows={table.pageRows}
          getRowKey={(row) => row.id}
          tableClassName="learners-table"
          sortConfig={table.sortConfig}
          onSort={table.handleSort}
          selectable
          selectedKeys={table.selectedKeys}
          onToggleRow={table.toggleRowSelection}
          onToggleAllVisible={table.toggleAllVisibleRows}
          loading={isLoading}
          error={fetchError}
          onRetry={() => setRetryKey((key) => key + 1)}
          emptyTitle="No learners found"
          emptyMessage={table.searchQuery || table.activeFilter !== 'All Learners' ? 'Try adjusting your search or filters.' : 'Learner accounts will appear here once students register.'}
          loadingMessage="Loading learners…"
          pageSize={table.pageSize}
          pageSizeOptions={table.pageSizeOptions}
          onPageSizeChange={table.setPageSize}
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          totalItems={table.totalItems}
          rangeLabel={table.rangeLabel}
          onGoToPage={table.goToPage}
          visiblePageNumbers={table.visiblePageNumbers}
        />

        {/* --- Learner Preview Modal --- */}
        <div className={`hoa-modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className={`hoa-modal-drawer ${isModalOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>

            <div className="modal-top-header">
              <button className="modal-back-btn" onClick={closeModal}>
                <img src={hoagoback} alt="Back" />
              </button>
              <h2>Learner Preview</h2>
              <div className="modal-header-actions">
                <span className="hoa-update-status" style={{ border: '1px solid #EEF1F6' }} onClick={() => fetchLearnerProfile(activeLearnerId)}>
                  <img src={hoarefresh} alt="Sync" className={`sync-icon ${isProfileLoading ? 'spinning' : ''}`} /> 
                  {isProfileLoading ? 'Loading...' : 'Sync Data'}
                </span>
              </div>
            </div>

            <div className="modal-content-area">
              
              {/* User Profile Info */}
              <div className="modal-profile-box">
                <div className="profile-left">
                  <img 
                    src={learnerProfile?.avatar ? `${API_BASE_URL}${learnerProfile.avatar}` : defaultAvatar} 
                    alt="Avatar" 
                    className="profile-avatar" 
                    onError={(e) => { e.target.src = defaultAvatar; }} // Fallback if image fails to load
                  />
                  <div className="profile-details">
                    <div className="profile-name-row">
                      <h3>
                        {isProfileLoading 
                          ? 'Loading Learner...' 
                          : (learnerProfile?.name || learnerProfile?.email || 'Unknown Learner')}
                      </h3>
                      <span className={
                        learnerProfile?.is_active === 0 
                          ? 'badge-suspended' 
                          : (learnerProfile?.is_active === 1 ? 'badge-active' : 'badge-inactive')
                      }>
                        {learnerProfile?.is_active === 0 
                          ? 'Suspended' 
                          : (learnerProfile?.is_active === 1 ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                    <div className="profile-meta-row">
                      <span className="badge-missing">{learnerProfile?.role || 'Enrolled Student'}</span>
                      {learnerProfile?.location && <span style={{fontSize: '12px', color: '#64748B', marginLeft: '10px'}}>{learnerProfile.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="profile-actions" style={{ position: 'relative' }}>
                  <button className="icon-btn tooltip-trigger" title="Email">
                    <span className="action-tooltip">{learnerProfile?.email || 'No email provided'}</span>
                    <img src={hoagraymail} alt="Email" />
                  </button>
                  <button 
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDrawerMenuOpen(!isDrawerMenuOpen);
                    }}
                  >
                    <img src={hoaverticaldots} alt="More" />
                  </button>
                  {isDrawerMenuOpen && learnerProfile && (
                    <div className="hoa-row-dropdown-menu" style={{ position: 'absolute', right: 0, top: '100%', background: '#fff', border: '1px solid #EEF1F6', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px', padding: '4px' }}>
                      {learnerProfile.is_active === 0 ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleStatusChange(learnerProfile.id, 'activate');
                            setIsDrawerMenuOpen(false);
                          }}
                          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#10B981', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Activate Student
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSingleStatusChange(learnerProfile.id, 'suspend');
                            setIsDrawerMenuOpen(false);
                          }}
                          style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#D97706', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Suspend Student
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleDelete(learnerProfile.id);
                          setIsDrawerMenuOpen(false);
                          closeModal();
                        }}
                        style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', padding: '8px 10px', fontSize: '12px', color: '#EF4444', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Delete Student
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Stats Row */}
              <div className="modal-stats-row">
                <div className="mod-stat">
                  <h3>{learnerProfile?.statistics?.total_downloads || 0}</h3>
                  <p>Total Downloads</p>
                </div>
                <div className="mod-stat">
                  <h3>{learnerProfile?.statistics?.total_courses || learnerProfile?.enrollments?.length || 0}</h3>
                  <p>Total Courses</p>
                </div>
                <div className="mod-stat">
                  <h3>{learnerProfile?.statistics?.avg_score || '0.00'}</h3>
                  <p>Avg. Score</p>
                </div>
                <div className="mod-stat">
                  <h3>{learnerProfile?.statistics?.total_certificates || learnerProfile?.certificates?.length || 0}</h3>
                  <p>Certificates Issued</p>
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
                
                {/* --- LESSONS TAB --- */}
                {activeTab === 'lessons' && (
                  <div className="tab-lessons">
                    <div className="hoa-list-container modal-table-container">
                      {isProfileLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading lessons data...</div>
                      ) : (
                        <table className="hoa-list-table mod-table">
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }} />
                              <th><div className="th-content" onClick={() => handleModalSort('title')}>Course</div></th>
                              <th><div className="th-content">Instructor</div></th>
                              <th><div className="th-content">Type</div></th>
                              <th className="text-center"><div className="th-content justify-center">Progress</div></th>
                              <th className="status-col"><div className="th-content">Status</div></th>
                              <th className="action-col" />
                            </tr>
                          </thead>
                          <tbody>
                            {/* Map over real enrollments if they exist, otherwise fallback or show empty state */}
                            {(learnerProfile?.enrollments || []).length > 0 ? (
                               getSortedData(learnerProfile.enrollments, modalSortConfig).map((enrollment) => {
                                const courseId = enrollment.course_id || enrollment.id;
                                const courseTitle = enrollment.course?.title || enrollment.course_name || 'Unknown Course';
                                const statusKey = String(enrollment.status || 'active').toLowerCase();
                                const canUnenroll = statusKey === 'active';
                                const rowKey = enrollment.id || `${courseId}-${activeLearnerId}`;
                                return (
                                <tr key={rowKey}>
                                  <td><input type="checkbox" className="hoa-checkbox" /></td>
                                  <td>
                                    <div className="user-meta">
                                      <h5>{courseTitle}</h5>
                                      <p style={{ fontSize: '11px', color: '#A1A5B7' }}>{new Date(enrollment.enrolled_at || enrollment.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <h5 style={{ fontWeight: '500' }}>{enrollment.course?.instructor_name || 'N/A'}</h5>
                                      <p style={{ fontSize: '11px', color: '#A1A5B7' }}>Score: {enrollment.score || '0'}%</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <h5 style={{ fontWeight: '500' }}>{enrollment.course?.type || 'Online Course'}</h5>
                                    </div>
                                  </td>
                                  <td className="fw-600 text-center">{enrollment.progress_percentage || 0}%</td>
                                  <td className="status-col">
                                    <span className={`mod-status-pill st-${statusKey}`}>{enrollment.status || 'Active'}</span>
                                  </td>
                                  <td className="action-col">
                                    {canUnenroll ? (
                                      <div className="hoa-row-action-menu">
                                        <button
                                          type="button"
                                          className="table-link-icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenEnrollmentMenuId(openEnrollmentMenuId === rowKey ? null : rowKey);
                                          }}
                                        >
                                          <img src={hoaverticaldots} alt="Actions" style={{ width: '12px', opacity: 0.7 }} />
                                        </button>
                                        {openEnrollmentMenuId === rowKey ? (
                                          <div className="hoa-row-dropdown-menu">
                                            <button
                                              type="button"
                                              className="hoa-row-dropdown-item is-danger"
                                              onClick={() => handleUnenrollEnrollment(courseId, courseTitle)}
                                            >
                                              Unenroll
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </td>
                                </tr>
                              ); })
                            ) : (
                              <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                                  No course enrollments found for this learner.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {!isProfileLoading && learnerArchives.length > 0 ? (
                      <div className="hoa-archives-section">
                        <div className="hoa-section-head">
                          <h3>Archived attempts</h3>
                          <p>Progress snapshots from previous unenrollments</p>
                        </div>
                        <div className="hoa-list-container modal-table-container">
                          <table className="hoa-list-table mod-table hoa-archives-table">
                            <thead>
                              <tr>
                                <th><div className="th-content">Course</div></th>
                                <th className="text-center"><div className="th-content justify-center">Attempt</div></th>
                                <th className="text-center"><div className="th-content justify-center">Progress</div></th>
                                <th><div className="th-content">Archived</div></th>
                                <th><div className="th-content">Reason</div></th>
                              </tr>
                            </thead>
                            <tbody>
                              {learnerArchives.map((archive) => (
                                <tr key={archive.id}>
                                  <td>
                                    <div className="user-meta">
                                      <h5>{archive.course_title || `Course #${archive.course_id}`}</h5>
                                    </div>
                                  </td>
                                  <td className="fw-600 text-center">{archive.enrollment_attempt || 1}</td>
                                  <td className="fw-600 text-center">{archive.completion_percentage || 0}%</td>
                                  <td>
                                    <div className="user-meta">
                                      <p>{archive.archived_at ? new Date(archive.archived_at).toLocaleString() : '—'}</p>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="user-meta">
                                      <p>{archive.archive_reason || '—'}</p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}

                    {/* Documents / Certificates */}
                    <div className="docs-header" style={{ marginTop: '20px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#071437' }}>Documents</h3>
                        <p style={{ margin: '0', fontSize: '12px', color: '#A1A5B7' }}>Files & Certificates</p>
                      </div>
                    </div>

                    <div className="docs-grid">
                      {!isProfileLoading && (learnerProfile?.certificates || []).map((cert) => (
                        <div key={cert.id} className="doc-card">
                          <div className="doc-info">
                            <img src={hoaknot} alt="Certificate" />
                            <div>
                              <h4>{cert.course_name || 'Course Certificate'}</h4>
                              <p>Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button
                            className="download-btn"
                            onClick={() => {
                              const number = cert.certificate_number || cert.certificateNumber;
                              if (number) openCertificatePreview(number, { newTab: true });
                            }}
                          >
                            <img src={hoadownload} alt="Download" />
                          </button>
                        </div>
                      ))}
                      {!isProfileLoading && (learnerProfile?.certificates || []).length === 0 && (
                        <p style={{ color: '#64748B', fontSize: '14px' }}>No documents or certificates available.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* --- PROJECTS TAB --- */}
                {activeTab === 'projects' && (
                  <div className="tab-projects" style={{ padding: '20px' }}>
                     {isProfileLoading ? (
                       <p style={{ textAlign: 'center', color: '#64748B' }}>Loading projects...</p>
                     ) : (learnerProfile?.projects || []).length > 0 ? (
                       <div className="projects-grid">
                         {learnerProfile.projects.map(project => (
                            <div key={project.id} style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                               <h4>{project.title}</h4>
                               <p style={{ fontSize: '13px', color: '#64748B' }}>Status: {project.status}</p>
                            </div>
                         ))}
                       </div>
                     ) : (
                       <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                        <h4>No Projects Submitted</h4>
                        <p>This learner has not submitted any projects yet.</p>
                       </div>
                     )}
                  </div>
                )}

                {/* --- ACTIVITY TAB --- */}
                {activeTab === 'activity' && (
                  <div className="tab-activity">
                    <div className="activity-header">
                      <div className="login-info">
                        <span className="label">Last Login</span>
                        <p>
                          <strong>
                            {learnerProfile?.last_login ? new Date(learnerProfile.last_login).toLocaleDateString() : 'N/A'}
                          </strong> at <strong>
                            {learnerProfile?.last_login ? new Date(learnerProfile.last_login).toLocaleTimeString() : ''}
                          </strong>
                        </p>
                      </div>
                    </div>
                    {/* Keep your static QA logs here or map learnerProfile.logs if the API provides it */}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
        
        {/* Fullscreen Image Preview */}
        {fullScreenImage && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setFullScreenImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', background: 'none', border: 'none', color: 'white', fontSize: '40px', cursor: 'pointer', padding: '10px' }}>&times;</button>
            <img src={fullScreenImage} alt="Full Screen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        )}

        {/* Confirm destructive / status actions */}
        {confirmAction && (
          <div
            className="hoa-modal-overlay open"
            style={{ zIndex: 10050, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => !confirmLoading && setConfirmAction(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(420px, calc(100vw - 32px))',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #EEF1F6',
                padding: '24px',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0F172A' }}>{confirmAction.title}</h3>
              <p style={{ margin: '0 0 20px', fontSize: '13px', lineHeight: 1.5, color: '#64748B' }}>{confirmAction.message}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={() => setConfirmAction(null)}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid #DBDFE9',
                    background: '#fff',
                    color: '#4B5675',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmLoading}
                  onClick={executeConfirmAction}
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: confirmAction.destructive ? '#EF4444' : '#450468',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: confirmLoading ? 'wait' : 'pointer',
                    opacity: confirmLoading ? 0.75 : 1,
                  }}
                >
                  {confirmLoading ? 'Working…' : confirmAction.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Toast Alert */}
        {toast.show && (
          <div className={`hoa-toast-notification is-${toast.type}`}>
            <div className="hoa-toast-icon">
              {toast.type === 'success' ? '✓' : '✗'}
            </div>
            <p className="hoa-toast-message">{toast.message}</p>
          </div>
        )}

      </div>
    </HOALayout>
  );
};

export default HOALearners;