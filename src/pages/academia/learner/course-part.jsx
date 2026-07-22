import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';

// Assets (kept as imports so bundler resolves them)
import acOn from '../../../assets/imgs/ac-on.jpg';
import defaultProfile from '../../../assets/imgs/default-profile.png';
import fe1 from '../../../assets/icons/fe1.svg';
import fe2 from '../../../assets/icons/fe2.svg';
import fe3 from '../../../assets/icons/fe3.svg';
import fe4 from '../../../assets/icons/fe4.svg';
import fe5 from '../../../assets/icons/fe5.svg';
import acCal from '../../../assets/icons/ac-cal.svg';
import acLe from '../../../assets/icons/ac-le.svg';
import acUs from '../../../assets/icons/ac-us.svg';
import acBook from '../../../assets/icons/ac-book.svg';
import hoabasics from '../../../assets/icons/hoabasics.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import SavedLibraryButton from './SavedLibraryButton';
import EnrollmentPaymentModal from './EnrollmentPaymentModal';
import { useLearnerToast } from './useLearnerToast';
import {
  buildAvailablePaymentChoices,
  enrollInCourse,
  fetchEnrollmentStatus,
  fetchSavedPaymentMethods,
  getPaymentMethodLabel,
  getUserCurrency,
  humanizePaymentFailure,
  initiateEnrollmentPayment,
  isCourseFree,
  isEnrollmentRoleAllowed,
  pickDefaultPaymentValue,
  unenrollFromCourse,
  waitForEnrollmentPayment,
  watchEnrollmentPayment,
} from './enrollmentPaymentUtils';
import { learnerPageTitle, LEARNER_PRODUCT_NAME } from './learnerBrand';
import { buildReaderUrl, resolveCourseProgressPercent } from './homeDashboardUtils';
import LearnerLoadError from './LearnerLoadError';
import jo1 from '../../../assets/icons/jo1.svg';
import './course-part.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const extractBody = (body) => body?.data?.data || body?.data || body;

function CoursePart() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyStateId = location.state?.courseId;
  const inboundId = searchParams.get('id') || legacyStateId;
  // Keep the public UUID in reader URLs (same as this page), not the internal numeric id.
  const coursePublicRef = inboundId || null;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { showToast } = useLearnerToast();
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [selectedPaymentValue, setSelectedPaymentValue] = useState('credit_card');
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [userCurrency, setUserCurrency] = useState(getUserCurrency());
  const [courseProgressPercent, setCourseProgressPercent] = useState(0);
  const paymentWatchRef = useRef(null);

  const stopPaymentWatch = () => {
    paymentWatchRef.current?.stop?.();
    paymentWatchRef.current = null;
  };

  const resolveAssetUrl = (value) => {
    if (!value) return acOn;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const formatHtmlContent = (html) => {
    if (!html) return '';
    return html
      .replace(/src="\/uploads\//g, `src="${API_BASE_URL}/uploads/`)
      .replace(/&nbsp;/g, ' ');
  };

  const stripHtml = (html) =>
    (html || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const navigate = useNavigate();

  useEffect(() => () => {
    stopPaymentWatch();
  }, []);

  useEffect(() => {
    if (!searchParams.get('id') && legacyStateId) {
      setSearchParams({ id: String(legacyStateId) }, { replace: true });
    }
  }, [legacyStateId, searchParams, setSearchParams]);

  // inboundId may be a public course_uuid, so enrollment/progress checks key off
  // the resolved numeric course id once the course has loaded.
  const resolvedCourseId = course?.id;

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token || !resolvedCourseId) return;
      try {
        const status = await fetchEnrollmentStatus({
          apiBaseUrl: API_BASE_URL,
          token,
          courseId: resolvedCourseId,
        });
        setEnrollmentStatus(status);
        setIsEnrolled(Boolean(status?.enrolled));
      } catch (err) {
        console.error('Failed to check enrollment status:', err);
      }
    };
    checkEnrollmentStatus();
  }, [resolvedCourseId]);

  useEffect(() => {
    const loadCourseProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token || !resolvedCourseId || !isEnrolled) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/progress/${resolvedCourseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const body = await res.json();
        const data = extractBody(body) || {};
        setCourseProgressPercent(resolveCourseProgressPercent({
          progressPercentage: data.progress_percentage ?? data.progressPercentage,
          outlineProgress: null,
        }));
      } catch {
        // keep default
      }
    };
    loadCourseProgress();
  }, [resolvedCourseId, isEnrolled]);

  // Pull the learner's system currency (USD/RWF) so the modal shows the right money.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const body = await res.json();
        const cur = body?.data?.user?.currency;
        if (!cancelled && cur) setUserCurrency(String(cur).toUpperCase() === 'RWF' ? 'RWF' : 'USD');
      } catch {
        // keep localStorage-derived default
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPaymentChoices = async () => {
      if (!course || isEnrolled) return;

      const courseIsFree = isCourseFree(course);
      if (courseIsFree) {
        if (!cancelled) {
          setSelectedPaymentValue('free');
          setPaymentsLoading(false);
        }
        return;
      }

      setPaymentsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const methods = await fetchSavedPaymentMethods(API_BASE_URL, token);
        const choices = buildAvailablePaymentChoices(methods, false);
        if (!cancelled) {
          setSavedPaymentMethods(methods);
          // Default the modal to the learner's primary saved method's gateway
          setSelectedPaymentValue(pickDefaultPaymentValue(choices, methods));
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
        if (!cancelled) {
          setSelectedPaymentValue(pickDefaultPaymentValue(buildAvailablePaymentChoices([], false), []));
        }
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    };

    loadPaymentChoices();
    return () => { cancelled = true; };
  }, [course, isEnrolled]);

  const handleJoinToday = async (e) => {
    e.preventDefault();
    if (!course?.id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("Please sign in to join this course.", "warning");
      setTimeout(() => {
        navigate('/academia/auth/signin');
      }, 1500);
      return;
    }

    const userObj = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = (userObj.role || '').toLowerCase().trim();
    if (!isEnrollmentRoleAllowed(userRole)) {
      showToast("Only learner accounts can enroll in courses.", "warning");
      return;
    }

    // Free courses enroll immediately; paid courses open the payment modal.
    if (isCourseFree(course)) {
      setIsEnrolling(true);
      try {
        await enrollInCourse({
          apiBaseUrl: API_BASE_URL,
          token,
          courseId: course.id,
          course,
          selectedPaymentValue: 'free',
        });
        setIsEnrolled(true);
        showToast('Enrollment confirmed.', 'success');
        navigate(buildReaderUrl(coursePublicRef || course.id));
      } catch (err) {
        showToast(err.message || 'Failed to enroll in the course.', 'danger');
      } finally {
        setIsEnrolling(false);
      }
      return;
    }

    setPaymentModalOpen(true);
  };

  const canUnenroll = isEnrolled && enrollmentStatus?.status === 'active';

  const handleUnenroll = async () => {
    const token = localStorage.getItem('token');
    if (!token || !course?.id) return;

    setIsUnenrolling(true);
    try {
      await unenrollFromCourse({
        apiBaseUrl: API_BASE_URL,
        token,
        courseId: course.id,
        reason: 'Learner self-unenroll',
      });
      setIsEnrolled(false);
      setEnrollmentStatus({ enrolled: false, status: 'withdrawn' });
      setCourseProgressPercent(0);
      setShowUnenrollConfirm(false);
      showToast('You have left this course. Your progress was archived.', 'success');
    } catch (err) {
      showToast(err.message || 'Could not unenroll from this course.', 'danger');
    } finally {
      setIsUnenrolling(false);
    }
  };

  // Maps the modal's gateway tab to the enrollment payment_method value.
  const gatewayToPaymentValue = (gateway) => {
    if (gateway === 'mtn') return 'mobile_money';
    if (gateway === 'airtel') return 'airtel_money';
    return 'credit_card';
  };

  const handleModalPay = async (payload) => {
    const token = localStorage.getItem('token');
    if (!token || !course?.id) return;

    const gateway = payload?.gateway;
    if (gateway === 'card') {
      showToast('Bank card payments are coming soon. Please use MTN or Airtel for now.', 'warning');
      return;
    }

    if (gateway !== 'mtn' && gateway !== 'airtel') {
      showToast('Select MTN Mobile Money or Airtel Money to pay.', 'warning');
      return;
    }

    const phone = payload?.phoneNumber;
    if (!phone) {
      showToast('Enter your mobile money phone number.', 'warning');
      return;
    }

    stopPaymentWatch();
    setIsEnrolling(true);
    try {
      const initiated = await initiateEnrollmentPayment({
        apiBaseUrl: API_BASE_URL,
        token,
        courseId: course.id,
        gateway,
        phone,
        couponCode: payload?.coupon || null,
      });

      showToast(initiated?.message || 'Approve the payment prompt on your phone…', 'success');

      const status = await waitForEnrollmentPayment({
        apiBaseUrl: API_BASE_URL,
        token,
        invoiceUuid: initiated.invoice_uuid,
      });

      if (status.status === 'successful' || status.enrolled) {
        setIsEnrolled(true);
        setPaymentModalOpen(false);
        showToast(`Payment successful via ${getPaymentMethodLabel(gatewayToPaymentValue(gateway))}.`, 'success');
        navigate(buildReaderUrl(coursePublicRef || course.id));
      }
    } catch (err) {
      if (err?.code === 'PAYMENT_TIMEOUT' && err?.invoiceUuid) {
        showToast(err.message, 'warning');
        // Button stops waiting, but keep watching quietly while the modal stays open.
        paymentWatchRef.current = watchEnrollmentPayment({
          apiBaseUrl: API_BASE_URL,
          token,
          invoiceUuid: err.invoiceUuid,
          onStatus: (status) => {
            if (status.status === 'successful' || status.enrolled) {
              setIsEnrolled(true);
              setPaymentModalOpen(false);
              showToast(
                `Payment successful via ${getPaymentMethodLabel(gatewayToPaymentValue(gateway))}.`,
                'success'
              );
              navigate(buildReaderUrl(coursePublicRef || course.id));
              return;
            }
            if (status.status === 'failed') {
              showToast(
                humanizePaymentFailure(status.message || status.failure_reason),
                'error'
              );
            }
          },
        });
      } else {
        showToast(humanizePaymentFailure(err.message) || 'Payment failed. You can try again.', 'error');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handlePaymentModalClose = () => {
    stopPaymentWatch();
    setPaymentModalOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadCourse = async (id) => {
      setLoading(true);
      setError(null);
      try {
        // fetch specific course details
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load course');

        const data = extractBody(body);
        const courseData = data?.data || data?.course || data || {};

        if (cancelled) return;

        setCourse({
          id: courseData.id,
          uuid: courseData.course_uuid || courseData.uuid || null,
          title: courseData.title,
          author: courseData.instructor_name || courseData.author,
          authorImage: defaultProfile,
          authorRole: 'Author',
          publishedOn: courseData.created_at,
          headline: courseData.subtitle || courseData.title,
          summary: courseData.description || '',
          image: courseData.thumbnail ? (courseData.thumbnail.startsWith('/') ? `${API_BASE_URL}${courseData.thumbnail}` : courseData.thumbnail) : acOn,
          duration: courseData.duration_weeks ? `${courseData.duration_weeks} weeks` : '',
          weekly: courseData.required_hours_per_week ? `${courseData.required_hours_per_week} hours` : '',
          level: courseData.level || '',
          price: courseData.price ? `$${courseData.price}` : (courseData.is_free ? 'Free' : ''),
          rawPrice: Number(courseData.price) || 0,
          isFree: Boolean(courseData.is_free) || Number(courseData.price) === 0,
          discount: '',
          intro: courseData.intro_message || courseData.description || '',
          audience: courseData.target_audience || '',
          category: courseData.category || '',
          objectives: courseData.objectives || '',
        });

        // set chapters if available
        const ch = data?.chapters || data?.data?.chapters || courseData.chapters || [];
        setChapters(Array.isArray(ch) ? ch : []);

        // set weeks if available
        const w = data?.weeks || data?.data?.weeks || courseData.weeks || [];
        setWeeks(Array.isArray(w) ? w : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load');
        setCourse(null);
        setChapters([]);
        setWeeks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const init = async () => {
      if (inboundId) return loadCourse(inboundId);
      setLoading(false);
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [inboundId]);

  // Group chapters by week if weeks list is empty but chapters exist
  useEffect(() => {
    if (weeks.length === 0 && chapters.length > 0) {
      const grouped = [];
      chapters.forEach((c) => {
        const weekNum = c.week_number || 1;
        let wk = grouped.find(w => w.week_number === weekNum);
        if (!wk) {
          wk = { id: `week-${weekNum}`, week_number: weekNum, title: `Week ${weekNum}`, chapters: [] };
          grouped.push(wk);
        }
        wk.chapters.push(c);
      });
      grouped.sort((a, b) => a.week_number - b.week_number);
      setWeeks(grouped);
    }
  }, [chapters, weeks]);

  const featureList = [
    { icon: fe1, label: course?.duration || '—' },
    { icon: fe2, label: course?.weekly || '—' },
    { icon: fe3, label: 'Digital certificate when eligible' },
    { icon: fe4, label: course?.level || '' },
    { icon: fe5, label: 'Project Feedbacks' },
  ];

  const stats = [
    { label: 'Duration', value: course?.duration || '—', icon: acCal },
    { label: 'Weekly study', value: course?.weekly || '—', icon: acCal },
    { label: 'Skill Level', value: course?.level || '—', icon: acUs },
    { label: 'subscription', value: course?.price || '—', icon: acBook },
  ];

  const introIsLong = stripHtml(course?.intro).length > 320;

  const breakdownWeeks = Array.isArray(weeks) ? weeks : [];
  const hasBreakdown = breakdownWeeks.length > 0;
  const hasOutcomes = !!course?.objectives;
  const hasAudience = !!course?.audience;
  const showContentSections = !loading && inboundId && (hasBreakdown || hasOutcomes || hasAudience);
  const missingCourseId = !inboundId;
  // Default the payment modal to the learner's primary saved method gateway.
  // Cards aren't live yet — fall back to MTN for paid MoMo enrollments.
  const defaultPaymentGateway = selectedPaymentValue === 'mobile_money'
    ? 'mtn'
    : selectedPaymentValue === 'airtel_money'
      ? 'airtel'
      : selectedPaymentValue === 'credit_card'
        ? 'card'
        : 'mtn';

  useEffect(() => {
    const courseTitle = course?.title?.trim();
    document.title = courseTitle
      ? learnerPageTitle(`${courseTitle} · Course details`)
      : learnerPageTitle('Course details');
    return () => {
      document.title = LEARNER_PRODUCT_NAME;
    };
  }, [course?.title]);

  return (
    <section className="learners-course-part-page">
      <section className="learners-home-title">
        <div className="learners-home-title-top">
          <h1>Course details</h1>

          <div className="learners-home-title-actions">
            <SavedLibraryButton />
            <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
              <span>Go to website</span>
              <img src={hoagoto} alt="Go" />
            </a>
          </div>
        </div>
      </section>

      <div className="filters-grid-b-h">
        <button type="button" onClick={() => navigate('/academia/learner/courses')}>
          <img src={acLe} alt="back" />
        </button>
        <div>
          <p>{course?.category || 'Course catalog'}</p>
          <span>/</span>
          <span>{course?.title || 'Details'}</span>
          <span>/</span>
        </div>
      </div>

      <section className="learners-course-specific">
        <div className="learners-course-specific-head">
          <div>
            {loading && inboundId ? (
              <>
                <div className="lrn-skel lrn-skel-title" style={{ width: 280, maxWidth: '80%' }} />
                <div className="lrn-skel lrn-skel-text" style={{ width: 170, marginTop: 12 }} />
              </>
            ) : error ? (
              <h1>Course unavailable</h1>
            ) : (
              <>
                <h1>{course?.title || 'Untitled course'}</h1>
                <p>
                  Prepared by <strong>{course?.author || 'Author'}</strong>
                </p>
                {isEnrolled ? (
                  <p className="learners-course-specific-progress">{courseProgressPercent}% complete</p>
                ) : null}
              </>
            )}
          </div>
        </div>

        {error ? (
          <LearnerLoadError
            title="Could not load course"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : loading && inboundId ? (
          <div className="learners-course-specific-grid">
            <div className="learners-course-specific-main">
              <section className="learners-course-specific-hero">
                <div className="learners-course-specific-hero-copy">
                  <div className="lrn-skel lrn-skel-title" style={{ width: '65%' }} />
                  <div className="lrn-skel lrn-skel-text" style={{ width: '100%', marginTop: 14 }} />
                  <div className="lrn-skel lrn-skel-text" style={{ width: '92%', marginTop: 9 }} />
                  <div className="lrn-skel lrn-skel-text" style={{ width: '80%', marginTop: 9 }} />
                </div>
                <div className="learners-course-specific-media-wrap">
                  <div className="lrn-skel" style={{ width: '100%', height: 210, borderRadius: 12 }} />
                  <div className="learners-course-specific-stats">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="learners-course-specific-stat">
                        <div className="lrn-skel lrn-skel-text" style={{ width: '60%' }} />
                        <div className="lrn-skel lrn-skel-text" style={{ width: '40%' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="learners-course-specific-section">
                <div className="lrn-skel lrn-skel-title" style={{ width: 160 }} />
                <div className="lrn-skel lrn-skel-text" style={{ width: '100%', marginTop: 14 }} />
                <div className="lrn-skel lrn-skel-text" style={{ width: '95%', marginTop: 9 }} />
                <div className="lrn-skel lrn-skel-text" style={{ width: '88%', marginTop: 9 }} />
              </section>
            </div>
            <aside className="learners-course-specific-side">
              <div className="learners-course-specific-side-card">
                <div className="lrn-skel lrn-skel-title" style={{ width: '80%' }} />
                <div className="learners-course-specific-features" style={{ marginTop: 16 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="learners-course-specific-feature">
                      <div className="lrn-skel" style={{ width: 20, height: 20, borderRadius: 6, flex: '0 0 auto' }} />
                      <div className="lrn-skel lrn-skel-text" style={{ width: '70%' }} />
                    </div>
                  ))}
                </div>
                <div className="lrn-skel" style={{ width: '100%', height: 46, borderRadius: 12, marginTop: 18 }} />
              </div>
            </aside>
          </div>
        ) : (
        <>
        <div className="learners-course-specific-grid">
          <div className="learners-course-specific-main">
            <section className="learners-course-specific-hero">
              <div className="learners-course-specific-hero-copy">
                <h2>{course?.headline || ''}</h2>
                {course?.summary ? (
                  <div
                    className="learners-course-rich"
                    dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.summary) }}
                  />
                ) : null}
              </div>

              <div className="learners-course-specific-media-wrap">
                  <div className="learners-course-specific-media">
                    <img src={course?.image || acOn} alt={course?.title || ''} />
                  </div>

                <div className="learners-course-specific-stats">
                  {stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`learners-course-specific-stat${index === stats.length - 1 ? ' learners-course-specific-stat-price' : ''}`}
                    >
                      <div className="learners-course-specific-stat-top">
                        <img src={stat.icon} alt="" />
                        <span>{stat.label}</span>
                      </div>
                      <strong>{stat.value}</strong>
                      {index === stats.length - 1 && <small>{course?.discount}</small>}
                    </div>
                    ))}
                </div>
              </div>
            </section>

            {missingCourseId ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>Select a course</h3>
                <p>Open a course from the catalog to view its details, syllabus, and enrollment options.</p>
                <div>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              </div>
            ) : showContentSections ? (
              <>
                {course?.intro ? (
                  <section className="learners-course-specific-section">
                    <h3>Introduction</h3>
                    <div
                      className={`learners-course-rich learners-course-intro${introIsLong && !isSummaryExpanded ? ' is-clamped' : ''}`}
                      dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.intro) }}
                    />
                    {introIsLong && (
                      <button
                        type="button"
                        className="learners-course-readmore"
                        onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      >
                        {isSummaryExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </section>
                ) : null}

                {hasBreakdown && (
                  <section className="learners-course-specific-section learners-course-specific-syllabus-wrap">
                    <h3 className="oc-section-title">Course Breakdown</h3>
                    <div className="oc-breakdown-list">
                      {breakdownWeeks.length > 0 ? (
                        breakdownWeeks.map((week, wIdx) => (
                          <div className="oc-bd-week-group" key={week.id || wIdx}>
                            <div className="oc-bd-week-col">
                              <div className="oc-bd-week">{week.title || `Week ${week.week_number || wIdx + 1}`}</div>
                            </div>
                            <div className="oc-bd-items-col">
                              <div className="oc-bd-item">
                                <div className="oc-bd-icon-col">
                                  <div className="oc-bd-icon"><img src={hoabasics} alt="" /></div>
                                  {week.chapters && week.chapters.length > 0 && <div className="oc-bd-line"></div>}
                                </div>
                                <div className="oc-bd-content" style={{ paddingBottom: (week.description || week.learning_objectives) ? 24 : 0 }}>
                                  {(week.description || week.learning_objectives) ? (
                                    <>
                                      {week.description ? (
                                        <h4 style={{
                                          margin: '0 0 4px 0',
                                          fontSize: 14,
                                          color: '#071437',
                                          fontWeight: 600,
                                          display: '-webkit-box',
                                          WebkitLineClamp: '2',
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {week.description}
                                        </h4>
                                      ) : null}
                                      {week.learning_objectives ? (
                                        <p style={{
                                          margin: 0,
                                          fontSize: 13,
                                          color: '#4B5675',
                                          display: '-webkit-box',
                                          WebkitLineClamp: '3',
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {week.learning_objectives.replace(/"/g, '')}
                                        </p>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              {week.chapters && week.chapters.map((chap, cIdx) => (
                                <div className="oc-bd-item" key={chap.id || cIdx}>
                                  <div className="oc-bd-icon-col">
                                    <div className="oc-bd-icon" style={{ color: '#450468', fontSize: 12, fontWeight: 700 }}>
                                      {cIdx + 1}
                                    </div>
                                    {cIdx !== week.chapters.length - 1 && <div className="oc-bd-line"></div>}
                                  </div>
                                  <div className="oc-bd-content" style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: cIdx !== week.chapters.length - 1 ? 24 : 0, cursor: isEnrolled ? 'pointer' : 'default' }} onClick={() => {
                                    if (isEnrolled) {
                                      navigate(buildReaderUrl(coursePublicRef, chap.chapter_uuid || chap.uuid || chap.id));
                                    }
                                  }}>
                                    {chap.thumbnail ? (
                                      <img src={resolveAssetUrl(chap.thumbnail)} alt="thumb" style={{ width: 80, height: 60, borderRadius: 4, objectFit: 'cover' }} />
                                    ) : (
                                      <div style={{ width: 80, height: 60, borderRadius: 4, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9CA3AF' }}>No Video</div>
                                    )}
                                    <div>
                                      <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#071437', fontWeight: 600 }}>{chap.title}</h4>
                                      <p style={{ margin: 0, fontSize: 11, color: '#A1A5B7' }}>
                                        {[chap.subtitle, chap.duration ? `${chap.duration} mins` : ''].filter(Boolean).join(' • ') || 'Lesson content'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '13px', color: '#78829D' }}>No breakdown structure uploaded for this course yet.</p>
                      )}
                    </div>
                  </section>
                )}

                {course?.audience && (
                  <section className="learners-course-specific-section learners-course-specific-audience">
                    <h3>Who is the course for?</h3>
                    <div className="learners-course-rich learners-audience-content" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.audience) }} />
                  </section>
                )}

                {hasOutcomes && (
                  <section className="learners-course-specific-section learners-course-specific-outcomes">
                    <h3>What will you achieve?</h3>
                    <div className="learners-course-rich learners-outcomes-content" dangerouslySetInnerHTML={{ __html: formatHtmlContent(course.objectives) }} />
                  </section>
                )}
              </>
            ) : (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>No content published</h3>
                <p className="visually-hidden">No course breakdown or outcomes available for this course.</p>
                <div>
                  <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                    Browse courses
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="learners-course-specific-side">
            <div className="learners-course-specific-side-card">
              <h3>{course?.headline}</h3>

              <div className="learners-course-specific-features">
                {featureList.map((f, idx) => (
                  <div key={`${f.label}-${idx}`} className="learners-course-specific-feature">
                    <img src={f.icon} alt="" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              {isEnrolled ? (
                <>
                  <button type="button" className="learners-course-specific-cta" onClick={() => navigate(buildReaderUrl(coursePublicRef))}>
                    <span>Continue learning</span>
                    <img src={hoagoto} alt="Go" />
                  </button>
                  {canUnenroll ? (
                    <div className="learners-course-leave-wrap">
                      <button
                        type="button"
                        className="learners-course-leave-link"
                        onClick={() => setShowUnenrollConfirm(true)}
                        disabled={isUnenrolling}
                      >
                        {isUnenrolling ? 'Leaving…' : 'Leave course'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <button type="button" className="learners-course-specific-cta" onClick={handleJoinToday} disabled={isEnrolling || paymentsLoading}>
                  <span>{isEnrolling ? 'Joining...' : (isCourseFree(course) ? 'Enroll for free' : 'Join Today')}</span>
                  <img src={jo1} alt="Join" />
                </button>
              )}
            </div>
          </aside>
        </div>

        <section className="learners-course-specific-author-card" aria-label="Course author">
          <div className="learners-course-specific-author-card-inner">
            <div className="learners-course-specific-author-avatar">
              <img src={course?.authorImage || defaultProfile} alt={course?.author || 'Author'} />
            </div>

            <div className="learners-course-specific-author-copy">
              <h3>{course?.author}</h3>
              <p className="learners-course-specific-author-role">{course?.authorRole}</p>

              <div className="learners-course-specific-author-meta">
                <span>Published on</span>
                <span aria-hidden>|</span>
                <span>{course?.publishedOn}</span>
              </div>
            </div>
          </div>
        </section>
        </>
        )}
      </section>

      <EnrollmentPaymentModal
        isOpen={paymentModalOpen}
        onClose={handlePaymentModalClose}
        courseId={course?.id}
        courseIdLabel={course?.id ? `TR${course.id}GON` : '—'}
        amountUsd={course?.rawPrice || 0}
        currency={userCurrency}
        defaultGateway={defaultPaymentGateway}
        savedMethods={savedPaymentMethods}
        processing={isEnrolling}
        onPay={handleModalPay}
      />

      {showUnenrollConfirm ? (
        <div
          className="learners-unenroll-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unenroll-title"
          onClick={() => !isUnenrolling && setShowUnenrollConfirm(false)}
        >
          <div className="learners-unenroll-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 id="unenroll-title">Leave this course?</h3>
            <p>
              Your current progress will be archived. You can re-enroll later and start fresh.
              Certificates you already earned stay valid.
            </p>
            <div className="learners-unenroll-actions">
              <button
                type="button"
                className="learners-btn learners-btn-light"
                onClick={() => setShowUnenrollConfirm(false)}
                disabled={isUnenrolling}
              >
                Cancel
              </button>
              <button
                type="button"
                className="learners-btn learners-btn-leave-confirm"
                onClick={handleUnenroll}
                disabled={isUnenrolling}
              >
                {isUnenrolling ? 'Leaving…' : 'Leave course'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CoursePart;
