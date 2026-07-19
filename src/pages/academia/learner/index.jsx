import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import defaultProfile from '../../../assets/imgs/default-profile.png';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import SavedLibraryButton from './SavedLibraryButton';
import badge1 from '../../../assets/icons/badge-1.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import checkCircle from '../../../assets/icons/check-circle1.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import leAr from '../../../assets/icons/le-ar.svg';
import wellc from '../../../assets/icons/wellc.svg';
import { CircleUserRound, MapPin, Mail } from 'lucide-react';
import {
  buildEnrollmentNotice,
  buildContinueLearningTarget,
  buildReaderUrl,
  buildHomeSubtitle,
  buildScheduleItems,
  buildWeekDates,
  extractCourseList,
  getWeekTitle,
  isSameDay,
  paginateList,
  resolveCourseProgressPercent,
  shiftWeek,
} from './homeDashboardUtils';
import LearnerLoadError from './LearnerLoadError';
import LearnerLoading from './LearnerLoading';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COURSES_PAGE_SIZE = 6;

const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};

function LearnersIndex() {
  const navigate = useNavigate();
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, notStarted: 0, avgProgress: 0 });
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('all');
  const [coursesPage, setCoursesPage] = useState(1);
  const [calendarAnchor, setCalendarAnchor] = useState(() => new Date());
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [dashboardBody, setDashboardBody] = useState(null);
  const [performanceBody, setPerformanceBody] = useState(null);
  const [enrollmentNotice, setEnrollmentNotice] = useState(null);
  const [dashboardLoadError, setDashboardLoadError] = useState('');
  const handleCourseClick = (id) => {
    navigate(`/academia/learner/course-part?id=${id}`);
  };

  const handleContinueCourse = (courseId) => {
    const enrolled = enrolledCourses.find((course) => String(course.id) === String(courseId));
    if (!enrolled) {
      handleCourseClick(courseId);
      return;
    }
    const target = buildContinueLearningTarget([enrolled]);
    navigate(target?.readerUrl || buildReaderUrl(courseId));
  };

  const handleScheduleItemClick = (item) => {
    if (item?.href) {
      navigate(item.href);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load profile');

        const user = body?.data?.user || {};
        setProfile({
          name: user.name || user.email || 'Learner',
          email: user.email || '',
          role: user.role || 'learner',
          avatar: resolveAssetUrl(user.avatar),
          location: user.address?.city || user.address?.town || '',
          badges: user.badges || 0,
        });

        const percentage = Number(body?.data?.profilePercentage || 0);
        setProfileCompletion(percentage);
        if (percentage < 100 && localStorage.getItem('dismissedWelcomeModal') !== 'true') {
          setShowWelcomeModal(true);
        }

        // optional stats from backend if present
        const backendStats = body?.data?.stats;
        if (backendStats) {
          setStats({
            completed: backendStats.completed || 0,
            inProgress: backendStats.inProgress || 0,
            notStarted: backendStats.notStarted || 0,
            avgProgress: backendStats.avgProgress || 0,
          });
        }
      } catch (err) {
        // keep defaults on error
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCoursesLoading(false);
        return;
      }

      try {
        setDashboardLoadError('');
        const [dashboardRes, performanceRes, popularRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/student`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/profile/performance?limit=20&offset=0&timePeriod=all&status=all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/courses/public/popular?page=1&limit=5`),
        ]);

        const body = await dashboardRes.json();
        if (!dashboardRes.ok) throw new Error(body.message || 'Failed to load student dashboard');

        const enrolled = Array.isArray(body?.data?.enrolledCourses) ? body.data.enrolledCourses : [];
        setDashboardBody(body);
        setEnrolledCourses(enrolled);

        const recommendedFromDashboard = body?.data?.recommendedCourses || body?.data?.recentCourses;
        if (Array.isArray(recommendedFromDashboard) && recommendedFromDashboard.length > 0) {
          setRecommendedCourses(recommendedFromDashboard);
        } else if (popularRes.ok) {
          const popularBody = await popularRes.json();
          setRecommendedCourses(extractCourseList(popularBody).slice(0, 5));
        } else {
          setRecommendedCourses([]);
        }

        const dashboardStats = body?.data?.stats || {};
        setStats({
          completed: dashboardStats.completed || 0,
          inProgress: dashboardStats.inProgress || 0,
          notStarted: dashboardStats.notStarted || 0,
          avgProgress: dashboardStats.averageProgress || 0,
        });

        setEnrollmentNotice(buildEnrollmentNotice(enrolled));

        if (performanceRes.ok) {
          const performanceJson = await performanceRes.json();
          setPerformanceBody(performanceJson);
        } else {
          setPerformanceBody(null);
        }
      } catch (error) {
        setEnrolledCourses([]);
        setRecommendedCourses([]);
        setDashboardBody(null);
        setPerformanceBody(null);
        setEnrollmentNotice(null);
        setDashboardLoadError(error?.message || 'Could not load your dashboard.');
      } finally {
        setCoursesLoading(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    setScheduleItems(buildScheduleItems({
      dashboardBody,
      performanceBody,
      enrolledCourses,
      weekAnchor: calendarAnchor,
    }));
  }, [dashboardBody, performanceBody, enrolledCourses, calendarAnchor]);

  useEffect(() => {
    setCoursesPage(1);
  }, [courseFilter]);

  const resolveAssetUrl = (value) => {
    if (!value) return defaultProfile;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
    return `${API_BASE_URL}/${value}`;
  };

  const mappedCourses = enrolledCourses.map((course) => ({
    id: course.id,
    title: course.title || 'Untitled course',
    author: course.instructor_name || 'Academia',
    image: resolveAssetUrl(course.thumbnail),
    pct: resolveCourseProgressPercent({
      progressPercentage: course.progress_percentage,
      outlineProgress: null,
    }),
    chapters: `${course.completed_chapters || 0} of ${course.total_chapters || 0} Chapters`,
    endsOn: course.enrolled_at ? `Enrolled on ${new Date(course.enrolled_at).toLocaleDateString()}` : 'Recently enrolled',
    status: course.status || (Number(course.progress_percentage || 0) >= 100 ? 'completed' : Number(course.progress_percentage || 0) > 0 ? 'in_progress' : 'not_started'),
  }));

  const filteredCourses = mappedCourses.filter((course) => {
    if (courseFilter === 'all') return true;
    return course.status === courseFilter;
  });

  const mappedRecommended = recommendedCourses.map((course) => ({
    id: course.id,
    title: course.title || 'Untitled course',
    author: course.instructor_name || course.author || 'Academia',
    description: stripHtml(course.description || 'No description available yet.'),
    image: resolveAssetUrl(course.thumbnail),
    startsOn: course.starts_on
      ? `Starts ${new Date(course.starts_on).toLocaleDateString()}`
      : course.published_at
        ? `Published ${new Date(course.published_at).toLocaleDateString()}`
        : 'Available now',
  }));

  const handleDismissWelcomeModal = () => {
    localStorage.setItem('dismissedWelcomeModal', 'true');
    setShowWelcomeModal(false);
  };

  const handleCompleteInformation = () => {
    localStorage.setItem('dismissedWelcomeModal', 'true');
    setShowWelcomeModal(false);
    navigate('/academia/learner/account');
  };

  const weekDates = useMemo(() => buildWeekDates(calendarAnchor), [calendarAnchor]);
  const weekTitle = useMemo(() => getWeekTitle(calendarAnchor), [calendarAnchor]);
  const today = useMemo(() => new Date(), []);

  const homeSubtitle = useMemo(() => buildHomeSubtitle({
    name: profile.name,
    stats,
    enrolledCount: enrolledCourses.length,
  }), [profile.name, stats, enrolledCourses.length]);

  const paginatedCourses = useMemo(
    () => paginateList(filteredCourses, coursesPage, COURSES_PAGE_SIZE),
    [filteredCourses, coursesPage]
  );

  const continueLearning = useMemo(
    () => buildContinueLearningTarget(enrolledCourses),
    [enrolledCourses]
  );

  return (
    <>
      <section className="learners-index-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Home</h1>

            <div className="learners-home-title-actions">
              <SavedLibraryButton />
              <a className="learners-btn learners-btn-primary" href="/academia/index" target="_blank" rel="noopener noreferrer">
                <span>Go to website</span>
                <img src={hoagoto} alt="Go" />
              </a>
            </div>
          </div>
          <p>{profileLoading ? 'Loading your dashboard...' : homeSubtitle}</p>        </section>

        {dashboardLoadError ? (
          <LearnerLoadError
            message={dashboardLoadError}
            onRetry={() => window.location.reload()}
          />
        ) : null}

        {!coursesLoading && continueLearning && (
          <section className="learners-continue-hero" aria-label="Continue learning">
            <div className="learners-continue-hero-copy">
              <span className="learners-continue-hero-eyebrow">Continue learning</span>
              <h2>{continueLearning.courseTitle}</h2>
              <p>{continueLearning.chapterLabel}</p>
              <div className="learners-continue-hero-meta">
                <span>{continueLearning.instructorName}</span>
                <span aria-hidden="true">•</span>
                <span>{continueLearning.progress}% complete</span>
              </div>
              <button
                type="button"
                className="learners-btn learners-btn-primary learners-continue-hero-btn"
                onClick={() => navigate(continueLearning.readerUrl)}
              >
                {continueLearning.progress > 0 ? 'Resume lesson' : 'Start course'}
              </button>
            </div>
            {continueLearning.thumbnail ? (
              <div className="learners-continue-hero-media" aria-hidden="true">
                <img src={resolveAssetUrl(continueLearning.thumbnail)} alt="" />
                <div className="learners-continue-hero-progress" style={{ '--progress': continueLearning.progress }}>
                  <span>{continueLearning.progress}%</span>
                </div>
              </div>
            ) : null}
          </section>
        )}

        <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="learners-card learners-profile-card learners-profile-card--hero">
            <div className="learners-profile-hero" style={{ '--progress': profileCompletion }}>
                <div className="learners-progress-avatar">
                  <img
                    src={profileLoading ? defaultProfile : profile.avatar}
                    alt={profile.name || 'Learner'}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultProfile;
                    }}
                  />
                  <span className="learners-progress-badge">{profileLoading ? '...' : `${profileCompletion}%`}</span>
                </div>

                <div className="learners-profile-hero-title">
                  <h3>Hi, {profileLoading ? 'Learner' : profile.name}</h3>
                  <span className="learners-award-pill">
                    <img src={badge1} alt="Badge" />
                    <span>{profileLoading ? '0' : (profile.badges || 0)}</span>
                  </span>
                </div>

                <div className="learners-profile-hero-meta">
                  {!profileLoading && profile.role ? (
                    <span className="learners-meta-chip learners-meta-chip--pill">
                      <CircleUserRound size={15} strokeWidth={1.9} aria-hidden="true" />
                      <span>{profile.role}</span>
                    </span>
                  ) : null}
                  {!profileLoading && profile.location ? (
                    <span className="learners-meta-chip learners-meta-chip--pill">
                      <MapPin size={15} strokeWidth={1.9} aria-hidden="true" />
                      <span>{profile.location}</span>
                    </span>
                  ) : null}
                  {!profileLoading && profile.email ? (
                    <span className="learners-meta-chip learners-meta-chip--pill">
                      <Mail size={15} strokeWidth={1.9} aria-hidden="true" />
                      <span>{profile.email}</span>
                    </span>
                  ) : null}
                </div>
              </div>
          </div>

          <div className="learners-card learners-stats-card">
            <div className="learners-profile-stats">
              <div className="learners-stat">
                <h4>{stats.completed}</h4>
                <p>Completed</p>
              </div>
              <div className="learners-stat">
                <h4>{stats.inProgress}</h4>
                <p>In Progress</p>
              </div>
              <div className="learners-stat">
                <h4>{stats.notStarted}</h4>
                <p>Not Started</p>
              </div>
              <div className="learners-stat">
                <h4>{`${Math.round(stats.avgProgress || 0)}%`}</h4>
                <p>Average Progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="learners-card learners-calendar">
            <div className="learners-calendar-top">
              <div>
                <h6>{weekTitle.weekLabel}</h6>
                <p>{weekTitle.rangeLabel}</p>
              </div>
              <div className="learners-calendar-nav">
                <button type="button" aria-label="Previous week" onClick={() => setCalendarAnchor((current) => shiftWeek(current, -1))}>
                  <img src={acLe2} alt="" />
                </button>
                <button type="button" aria-label="Next week" onClick={() => setCalendarAnchor((current) => shiftWeek(current, 1))}>
                  <img src={acRi} alt="" />
                </button>
              </div>
            </div>

            <div className="learners-calendar-surface">
              <div className="learners-calendar-days">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="learners-calendar-dates">
                {weekDates.map((day) => {
                  const inCurrentMonth = day.getMonth() === calendarAnchor.getMonth();
                  const isToday = isSameDay(day, today);
                  const className = [
                    !inCurrentMonth ? 'muted' : '',
                    isToday ? 'active' : '',
                  ].filter(Boolean).join(' ');

                  return (
                    <div key={day.toISOString()} className={className || undefined}>
                      {day.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="learners-calendar-lower">
              {coursesLoading ? (
                <div className="learners-calendar-item learners-calendar-item--card">
                  <div className="learners-calendar-detail">
                    <h5>Loading schedule...</h5>
                    <p>Fetching your learning activity for this week.</p>
                  </div>
                </div>
              ) : scheduleItems.length > 0 ? (
                <Swiper
                  modules={[Pagination]}
                  pagination={{
                    clickable: true,
                  }}
                  className="learners-calendar-swiper"
                  wrapperClass="swiper-wrapper"
                >
                  {scheduleItems.map((item) => (
                    <SwiperSlide key={item.id}>
                      {item.href ? (
                        <button
                          type="button"
                          className="learners-calendar-item learners-calendar-item--card learners-calendar-item--action"
                          onClick={() => handleScheduleItemClick(item)}
                        >
                          <div className="learners-calendar-date">{item.dateLabel}</div>
                          <div className="learners-calendar-detail">
                            <h5>{item.title}</h5>
                            <p>
                              <b>{item.num}</b> of {item.total} {item.progressLabel}
                            </p>
                            <div className="learners-calendar-meta">
                              <span>{item.time}</span>
                              <span className="learners-calendar-dot">•</span>
                              <span className="learners-calendar-accent">{item.meta}</span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="learners-calendar-item learners-calendar-item--card">
                          <div className="learners-calendar-date">{item.dateLabel}</div>
                          <div className="learners-calendar-detail">
                            <h5>{item.title}</h5>
                            <p>
                              <b>{item.num}</b> of {item.total} {item.progressLabel}
                            </p>
                            <div className="learners-calendar-meta">
                              <span>{item.time}</span>
                              <span className="learners-calendar-dot">•</span>
                              <span className="learners-calendar-accent">{item.meta}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="learners-calendar-item learners-calendar-item--card">
                  <div className="learners-calendar-detail">
                    <h5>No activity this week</h5>
                    <p>Assessments and course progress will appear here when scheduled.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {enrollmentNotice && (
        <div className="learners-notice">
        <div className="learners-notice-icon">
          <img src={checkCircle} alt="Success" />
        </div>
        <div>
          <h6>
            {enrollmentNotice.title}
          </h6>
          <p>{enrollmentNotice.message}</p>
        </div>
      </div>
        )}

        <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="learners-section-header">
            <div>
              <h2>Your Courses</h2>
              <p>Complete Milestone</p>
            </div>
            <div className="dropdown learners-filter">
              <button className="learners-filter-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img src={acFf} alt="" />
                <span>
                  {courseFilter === 'all' ? 'All' : courseFilter === 'completed' ? 'Completed' : courseFilter === 'not_started' ? 'Not Started' : 'In Progress'}
                </span>
                <img src={drop1} alt="" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end learners-filter-menu">
                <li><a className={`dropdown-item ${courseFilter === 'all' ? 'active' : ''}`} href="#" onClick={(event) => { event.preventDefault(); setCourseFilter('all'); }}>All</a></li>
                <li><a className={`dropdown-item ${courseFilter === 'in_progress' ? 'active' : ''}`} href="#" onClick={(event) => { event.preventDefault(); setCourseFilter('in_progress'); }}>In Progress</a></li>
                <li><a className={`dropdown-item ${courseFilter === 'completed' ? 'active' : ''}`} href="#" onClick={(event) => { event.preventDefault(); setCourseFilter('completed'); }}>Completed</a></li>
                <li><a className={`dropdown-item ${courseFilter === 'not_started' ? 'active' : ''}`} href="#" onClick={(event) => { event.preventDefault(); setCourseFilter('not_started'); }}>Not Started</a></li>
              </ul>
            </div>
          </div>

          <div className="learners-courses-grid">
            {coursesLoading ? (
              <LearnerLoading title="Loading courses" message="Please wait while we fetch your enrolled courses." />
            ) : paginatedCourses.items.length > 0 ? (
              paginatedCourses.items.map((course) => (
                <div
                  key={course.id}
                  className="learners-course-card"
                  style={{ backgroundImage: `url(${course.image})` }}
                  onClick={() => (course.pct > 0 && course.pct < 100 ? handleContinueCourse(course.id) : handleCourseClick(course.id))}
                >
                  <div className="learners-course-overlay">
                    <div className="learners-course-badge" style={{ '--pct': course.pct }}>
                      {course.pct}%
                    </div>
                    <div className="learners-course-actions">
                      <button type="button" aria-label="Open" onClick={(e) => { e.stopPropagation(); (course.pct > 0 && course.pct < 100 ? handleContinueCourse(course.id) : handleCourseClick(course.id)); }}>
                        <img src={leAr} alt="Open" />
                      </button>
                    </div>
                    <div className="learners-course-info">
                      <p className="learners-course-author">{course.author}</p>
                      <h5>{course.title}</h5>
                      <div className="learners-course-footer">
                        <span>{course.endsOn}</span>
                        <span>{course.chapters}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="learners-card learners-empty-state learners-empty-state--courses">
                <h3>No courses for this filter</h3>
                <p>Try another filter or browse courses to start learning.</p>
                <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                  <span>Browse courses</span>
                </button>
              </div>
            )}
          </div>

          {!coursesLoading && paginatedCourses.totalPages > 1 && (
            <div className="learners-pagination">
              <button
                type="button"
                aria-label="Previous page"
                disabled={paginatedCourses.page <= 1}
                onClick={() => setCoursesPage((current) => Math.max(1, current - 1))}
              >
                <img src={acLe2} alt="" />
              </button>
              {Array.from({ length: paginatedCourses.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={pageNumber === paginatedCourses.page ? 'active' : ''}
                  onClick={() => setCoursesPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={paginatedCourses.page >= paginatedCourses.totalPages}
                onClick={() => setCoursesPage((current) => Math.min(paginatedCourses.totalPages, current + 1))}
              >
                <img src={acRi} alt="" />
              </button>
            </div>
          )}
        </div>

        <div className="col-12 col-xl-4">
          <div className="learners-section-header learners-section-header-sm">
            <div>
              <h2>Recommended</h2>
              <p>Popular courses available to explore</p>
            </div>
            <a className="learners-seeall" href="#" onClick={(event) => { event.preventDefault(); navigate('/academia/learner/courses'); }}>See All</a>
          </div>

          <div className="learners-recommended">
            {coursesLoading ? (
              <LearnerLoading compact title="Loading recommendations" message="Please wait while we fetch suitable courses for you." />
            ) : mappedRecommended.length > 0 ? (
              mappedRecommended.map((course) => (
                <a className="learners-reco-item" href="#" key={course.id} onClick={(event) => { event.preventDefault(); handleCourseClick(course.id); }}>
                  <div className="learners-reco-thumb">
                    <img src={course.image} alt="Course" />
                  </div>
                  <div className="learners-reco-text">
                    <h6>{course.title}</h6>
                    <p>{course.author}</p>
                    <small>{course.description}</small>
                    <div className="learners-reco-foot">
                      <span className="learners-reco-starts">{course.startsOn}</span>
                      <span className="learners-reco-arrow" aria-hidden="true">
                        <img src={acRi} alt="" />
                      </span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>No recommendations yet</h3>
                <p>Recommended courses will appear here as you enroll and progress.</p>
                <button type="button" className="learners-btn learners-btn-primary" onClick={() => navigate('/academia/learner/courses')}>
                  <span>Browse courses</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>

      {/* Welcome & Info Completion Modal */}
      {showWelcomeModal && (
        <div className="learners-welcome-modal-overlay" onClick={handleDismissWelcomeModal}>
          <div className="learners-welcome-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="learners-welcome-modal-close" onClick={handleDismissWelcomeModal} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={wellc} alt="Welcome" className="learners-welcome-modal-illustration" />
            <h2 className="learners-welcome-modal-title">Welcome to Gonaraza Academia</h2>
            <p className="learners-welcome-modal-subtitle">
              We're thrilled to have you on board and excited for the journey ahead together.
            </p>
            <div className="learners-welcome-modal-actions">
              <button className="learners-welcome-modal-btn-primary" onClick={handleCompleteInformation}>
                Complete Information
              </button>
              <button className="learners-welcome-modal-btn-text" onClick={handleDismissWelcomeModal}>
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LearnersIndex;
