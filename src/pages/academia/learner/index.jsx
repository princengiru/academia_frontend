import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import defaultProfile from '../../../assets/imgs/default-profile.png';
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import badge1 from '../../../assets/icons/badge-1.svg';
import userIcon from '../../../assets/icons/user.svg';
import locationIcon from '../../../assets/icons/location.svg';
import mailIcon from '../../../assets/icons/mail.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import checkCircle from '../../../assets/icons/check-circle1.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import leAr from '../../../assets/icons/le-ar.svg';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const calendarItems = [
  { date: '06', title: 'ENGLISH', num: '1', total: '2', time: '10:00 AM' },
  { date: '07', title: 'MATHEMATICS', num: '2', total: '4', time: '02:30 PM' },
  { date: '08', title: 'SCIENCE', num: '1', total: '3', time: '09:00 AM' },
  { date: '09', title: 'HISTORY', num: '1', total: '2', time: '11:15 AM' },
  { date: '10', title: 'ICT', num: '3', total: '5', time: '03:00 PM' },
];

function LearnersIndex() {
  const navigate = useNavigate();
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, notStarted: 0, avgProgress: 0 });
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('in_progress');
  const handleCourseClick = (id) => {
    navigate('/academia/learner/course-part', { state: { courseId: id } });
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

        setProfileCompletion(Number(body?.data?.profilePercentage || 0));

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
        const res = await fetch(`${API_BASE_URL}/api/dashboard/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load student dashboard');

        setEnrolledCourses(Array.isArray(body?.data?.enrolledCourses) ? body.data.enrolledCourses : []);
        setRecommendedCourses(Array.isArray(body?.data?.recentCourses) ? body.data.recentCourses : []);

        const dashboardStats = body?.data?.stats || {};
        setStats({
          completed: dashboardStats.completed || 0,
          inProgress: dashboardStats.inProgress || 0,
          notStarted: dashboardStats.notStarted || 0,
          avgProgress: dashboardStats.averageProgress || 0,
        });
      } catch (error) {
        setEnrolledCourses([]);
        setRecommendedCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadDashboard();
  }, []);

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
    pct: Number(course.progress_percentage || 0),
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
    author: course.instructor_name || 'Academia',
    description: course.description || 'No description available yet.',
    image: resolveAssetUrl(course.thumbnail),
    startsOn: course.enrolled_at ? `Enrolled on ${new Date(course.enrolled_at).toLocaleDateString()}` : 'Recently added',
  }));

  return (
    <>
      <section className="learners-index-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Home</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="#" onClick={(event) => event.preventDefault()}>
                <img src={acSav} alt="" />
                <span>Saved Library</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="#" onClick={(event) => event.preventDefault()}>
                <span>Go to website</span>
                <img src={wExitRight} alt="" />
              </a>
            </div>
          </div>
          <p>
            Statistics is the branch of mathematics that deals with the collection, analysis, interpretation,
            presentation, and organization of data. It provides methodologies for making.
          </p>
        </section>

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
                  <span className="learners-meta-chip learners-meta-chip--pill">
                    <img src={userIcon} alt="" />
                    <span>{profileLoading ? 'Personal user' : profile.role}</span>
                  </span>
                  <span className="learners-meta-chip">
                    <img src={locationIcon} alt="" />
                    <span>{profileLoading ? '' : profile.location}</span>
                  </span>
                  <span className="learners-meta-chip">
                    <img src={mailIcon} alt="" />
                    <span>{profileLoading ? '' : profile.email}</span>
                  </span>
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
                <h6>Week 2</h6>
                <p>Wed, March 2026</p>
              </div>
              <div className="learners-calendar-nav">
                <button type="button" aria-label="Previous" onClick={(event) => event.preventDefault()}>
                  <img src={acLe2} alt="Previous" />
                </button>
                <button type="button" aria-label="Next" onClick={(event) => event.preventDefault()}>
                  <img src={acRi} alt="Next" />
                </button>
              </div>
            </div>

            <div className="learners-calendar-surface">
              <div className="learners-calendar-days">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="learners-calendar-dates">
                <div className="muted">26</div><div className="muted">27</div><div className="muted">28</div><div className="active">1</div><div>2</div><div>3</div><div>4</div>
              </div>
            </div>

            <div className="learners-calendar-lower">
              <Swiper
                modules={[Pagination]}
                pagination={{ 
                  clickable: true
                }}
                className="learners-calendar-swiper"
                wrapperClass="swiper-wrapper"
              >
                {calendarItems.map((item) => (
                  <SwiperSlide key={`${item.date}-${item.title}`}>
                    <div className="learners-calendar-item learners-calendar-item--card">
                      <div className="learners-calendar-date">{item.date}</div>
                      <div className="learners-calendar-detail">
                        <h5>{item.title}</h5>
                        <p>
                          <b>{item.num}</b> of {item.total} Assessment
                        </p>
                        <div className="learners-calendar-meta">
                          <span>{item.time}</span>
                          <span className="learners-calendar-dot">•</span>
                          <span className="learners-calendar-accent">Online meeting</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

        <div className="learners-notice">
        <div className="learners-notice-icon">
          <img src={checkCircle} alt="Success" />
        </div>
        <div>
          <h6>
            Upgraded to <span>Academia plan</span>
          </h6>
          <p>Your payment was successful approved. Through using <b>MTN Mobile Money</b>.</p>
        </div>
      </div>

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
              <div className="learners-card learners-empty-state">
                <h3>Loading courses...</h3>
                <p>Please wait while we fetch your enrolled courses.</p>
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="learners-course-card"
                  style={{ backgroundImage: `url(${course.image})` }}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="learners-course-overlay">
                    <div className="learners-course-badge" style={{ '--pct': course.pct }}>
                      {course.pct}%
                    </div>
                    <div className="learners-course-actions">
                      <button type="button" aria-label="Open" onClick={(e) => { e.stopPropagation(); handleCourseClick(course.id); }}>
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

          {!coursesLoading && filteredCourses.length > 0 && (
            <div className="learners-pagination">
              <button type="button" onClick={(event) => event.preventDefault()}>
                <img src={acLe2} alt="Previous" />
              </button>
              <button type="button" onClick={(event) => event.preventDefault()}>1</button>
              <button type="button" className="active" onClick={(event) => event.preventDefault()}>2</button>
              <button type="button" onClick={(event) => event.preventDefault()}>…</button>
              <button type="button" aria-label="Next" onClick={(event) => event.preventDefault()}>
                <img src={acRi} alt="Next" />
              </button>
            </div>
          )}
        </div>

        <div className="col-12 col-xl-4">
          <div className="learners-section-header learners-section-header-sm">
            <div>
              <h2>Recommended</h2>
              <p>Course Available to learn</p>
            </div>
            <a className="learners-seeall" href="#" onClick={(event) => { event.preventDefault(); navigate('/academia/learner/courses'); }}>See All</a>
          </div>

          <div className="learners-recommended">
            {coursesLoading ? (
              <div className="learners-card learners-empty-state learners-empty-state--compact">
                <h3>Loading recommendations...</h3>
                <p>Please wait while we fetch suitable courses for you.</p>
              </div>
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
    </>
  );
}

export default LearnersIndex;
