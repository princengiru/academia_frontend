import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import defaultProfile from '../../assets/imgs/default-profile.png';
import discover1 from '../../assets/imgs/discover1.webp';
import discover2 from '../../assets/imgs/discover2.webp';
import discover3 from '../../assets/imgs/discover3.webp';
import discover4 from '../../assets/imgs/discover4.webp';
import discover5 from '../../assets/imgs/discover5.webp';
import discover6 from '../../assets/imgs/discover6.webp';
import itemImg from '../../assets/imgs/item.jpg';
import acSav from '../../assets/icons/ac-sav.svg';
import wExitRight from '../../assets/icons/w-exit-right.svg';
import badge1 from '../../assets/icons/badge-1.svg';
import userIcon from '../../assets/icons/user.svg';
import locationIcon from '../../assets/icons/location.svg';
import mailIcon from '../../assets/icons/mail.svg';
import acLe2 from '../../assets/icons/ac-le2.svg';
import acRi from '../../assets/icons/ac-ri.svg';
import checkCircle from '../../assets/icons/check-circle1.svg';
import acFf from '../../assets/icons/ac-ff.svg';
import drop1 from '../../assets/icons/drop1.svg';
import leAr from '../../assets/icons/le-ar.svg';
import './index.css';

const calendarItems = [
  { date: '06', title: 'ENGLISH', num: '1', total: '2', time: '10:00 AM' },
  { date: '07', title: 'MATHEMATICS', num: '2', total: '4', time: '02:30 PM' },
  { date: '08', title: 'SCIENCE', num: '1', total: '3', time: '09:00 AM' },
  { date: '09', title: 'HISTORY', num: '1', total: '2', time: '11:15 AM' },
  { date: '10', title: 'ICT', num: '3', total: '5', time: '03:00 PM' },
];

const courseCards = [
  { image: discover1, pct: 35, title: 'Software Development' },
  { image: discover2, pct: 15, title: 'Content Creation' },
  { image: discover3, pct: 25, title: 'Geo-Biological Course' },
  { image: discover4, pct: 10, title: 'Golf Basic to know' },
  { image: discover5, pct: 55, title: 'Hockey Game BASIC' },
  { image: discover6, pct: 35, title: "AMATEGEKO Y'IMIHANDA" },
];

const recommendedCourses = Array.from({ length: 6 }, () => ({
  title: 'Software Development',
  author: 'Emma Fragrance',
  description: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisi elit…',
  startsOn: 'Jan 4th 2026',
}));

function LearnersIndex() {
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate('/learner/course-part');
  };

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
            <div className="learners-profile-hero" style={{ '--progress': '56' }}>
              <div className="learners-progress-avatar">
                <img src={defaultProfile} alt="John Doe" />
                <span className="learners-progress-badge">56%</span>
              </div>

              <div className="learners-profile-hero-title">
                <h3>Hi, John Doe</h3>
                <span className="learners-award-pill">
                  <img src={badge1} alt="Badge" />
                  <span>6</span>
                </span>
              </div>

              <div className="learners-profile-hero-meta">
                <span className="learners-meta-chip learners-meta-chip--pill">
                  <img src={userIcon} alt="" />
                  <span>Personal user</span>
                </span>
                <span className="learners-meta-chip">
                  <img src={locationIcon} alt="" />
                  <span>Kicukiro, Kigali</span>
                </span>
                <span className="learners-meta-chip">
                  <img src={mailIcon} alt="" />
                  <span>johndoe@gonaraza.com</span>
                </span>
              </div>
            </div>
          </div>

          <div className="learners-card learners-stats-card">
            <div className="learners-profile-stats">
              <div className="learners-stat">
                <h4>4</h4>
                <p>Completed</p>
              </div>
              <div className="learners-stat">
                <h4>2</h4>
                <p>In Progress</p>
              </div>
              <div className="learners-stat">
                <h4>0</h4>
                <p>Not Started</p>
              </div>
              <div className="learners-stat">
                <h4>34%</h4>
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
                <span>In Progress</span>
                <img src={drop1} alt="" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end learners-filter-menu">
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>All</a></li>
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>In Progress</a></li>
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>Completed</a></li>
                <li><a className="dropdown-item" href="#" onClick={(event) => event.preventDefault()}>Not Started</a></li>
              </ul>
            </div>
          </div>

          <div className="learners-courses-grid">
            {courseCards.map((course) => (
              <div
                key={course.title}
                className="learners-course-card"
                style={{ backgroundImage: `url(${course.image})` }}
                onClick={handleCourseClick}
              >
                <div className="learners-course-overlay">
                  <div className="learners-course-badge" style={{ '--pct': course.pct }}>
                    {course.pct}%
                  </div>
                  <div className="learners-course-actions">
                    <button type="button" aria-label="Open" onClick={(e) => { e.stopPropagation(); handleCourseClick(); }}>
                      <img src={leAr} alt="Open" />
                    </button>
                  </div>
                  <div className="learners-course-info">
                    <p className="learners-course-author">Emma Fragrance</p>
                    <h5>{course.title}</h5>
                    <div className="learners-course-footer">
                      <span>Ends on: Jun 4th 2026</span>
                      <span>9 of 20 Chapters</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
        </div>

        <div className="col-12 col-xl-4">
          <div className="learners-section-header learners-section-header-sm">
            <div>
              <h2>Recommended</h2>
              <p>Course Available to learn</p>
            </div>
            <a className="learners-seeall" href="courses.php">See All</a>
          </div>

          <div className="learners-recommended">
            {recommendedCourses.map((course, index) => (
              <a className="learners-reco-item" href="#" key={`${course.title}-${index}`} onClick={(event) => { event.preventDefault(); handleCourseClick(); }}>
                <div className="learners-reco-thumb">
                  <img src={itemImg} alt="Course" />
                </div>
                <div className="learners-reco-text">
                  <h6>{course.title}</h6>
                  <p>{course.author}</p>
                  <small>{course.description}</small>
                  <div className="learners-reco-foot">
                    <span className="learners-reco-starts">Starts : {course.startsOn}</span>
                    <span className="learners-reco-arrow" aria-hidden="true">
                      <img src={acRi} alt="" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}

export default LearnersIndex;