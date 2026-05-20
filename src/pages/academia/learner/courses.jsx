import React from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acOn from '../../../assets/imgs/ac-on.jpg';
import acEn from '../../../assets/icons/ac-en.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './courses.css';

function LearnersCourses() {
  const navigate = useNavigate();
  const preventDefault = (e) => e.preventDefault();

  const handleCourseClick = (e) => {
    e.preventDefault();
    navigate('/academia/learner/course-part');
  };

  const slate = [
    { id: 1, price: '$5 / Per Month' },
    { id: 2, price: 'Free' },
    { id: 3, price: '$5 / Per Month' },
    { id: 4, price: '$5 / Per Month' },
    { id: 5, price: '$5 / Per Month' },
    { id: 6, price: '$5 / Per Month' },
    { id: 7, price: '$5 / Per Month' },
    { id: 8, price: '$5 / Per Month' },
    { id: 9, price: '$5 / Per Month' },
  ];

  const genesis = [
    { id: 1, title: 'Linear Algebra', icon: acPlus },
    { id: 2, title: 'Abstract Algebra', icon: acLock },
    { id: 3, title: 'Abstract Algebra', icon: acPlus },
    { id: 4, title: 'Abstract Algebra', icon: acLock },
    { id: 5, title: 'Abstract Algebra', icon: acLock },
    { id: 6, title: 'Abstract Algebra', icon: acPlus },
  ];

  return (
    <LearnersPageShell
      title="Courses"
      description="Learners courses layout scaffold migrated from the PHP page."
    >
      <section className="learners-courses-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Courses</h1>

            <div className="learners-home-title-actions">
              <a className="learners-btn learners-btn-secondary" href="/" onClick={preventDefault}>
                <img src={acSav} alt="Save" />
                <span>Saved Library</span>
              </a>
              <a className="learners-btn learners-btn-primary" href="/" onClick={preventDefault}>
                <span>Go to website</span>
                <img src={wExitRight} alt="Exit" />
              </a>
            </div>
          </div>
        </section>

      <div className="div-h">
        <div className="dropdown filter-drop">
          <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div>
              <img src={acFf} alt="Filter" />
              <span>Certificates</span>
            </div>
          </button>
          <ul className="dropdown-menu">
            <li className="dropdown-item active">
              <a href="/" onClick={preventDefault}>Certificates</a>
            </li>
            <li className="dropdown-item">
              <a href="/" onClick={preventDefault}>Diplomas</a>
            </li>
            <li className="dropdown-item">
              <a href="/" onClick={preventDefault}>Degrees</a>
            </li>
            <li className="dropdown-item">
              <a href="/" onClick={preventDefault}>Workshops</a>
            </li>
          </ul>
        </div>
        <div className="div-h-r">
          <div className="div-h-r-s">
            <input type="search" placeholder="Search any projects..." />
            <div className="div-h-r-s-f">
              <button className="active" type="button">Free</button>
              <button type="button">Paid</button>
              <div className="div-h-r-s-f-f">
                <div className="dropdown">
                  <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div>
                      <img src={acFi} alt="Filters" />
                      <span>Filters</span>
                    </div>
                  </button>
                  <ul className="dropdown-menu">
                    <li className="dropdown-item active">
                      <a href="/" onClick={preventDefault}>Newest</a>
                    </li>
                    <li className="dropdown-item">
                      <a href="/" onClick={preventDefault}>Top papers</a>
                    </li>
                    <li className="dropdown-item">
                      <a href="/" onClick={preventDefault}>Past Papers</a>
                    </li>
                    <li className="dropdown-item">
                      <a href="/" onClick={preventDefault}>Most Downloaded</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="learners-courses-main">
        <div className="learners-courses-main-grid">
          <div className="learners-courses-online">
            <div className="learners-courses-section-head">
              <div>
                <h2>Online courses</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-online-sec-contents">
              {slate.map((husk) => (
                <div key={husk.id} className="osc-item" onClick={handleCourseClick} style={{ cursor: 'pointer' }}>
                  <div className="osc-item-img">
                    <img src={acOn} alt="Online Course" />
                  </div>
                  <div className="osc-item-text">
                    <div className="osc-item-text-float">
                      <p>{husk.price}</p>
                    </div>
                    <div>
                      <h6><a href="/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(); }}>Software Development</a></h6>
                      <small>Emma Furgreance</small>
                    </div>
                    <div>
                      <p>Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit consectetur adipisicing elit...</p>
                    </div>
                    <div>
                      <small>Starts : Jan 4th 2026</small>
                      <a className="learners-course-open" href="/course-part" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCourseClick(); }}>
                        <img src={acEn} alt="Enroll" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="learners-courses-pagination">
              <button type="button" onClick={preventDefault}>
                <img src={acLe2} alt="Previous" />
              </button>
              <div>
                <p>1</p>
                <p className="active">2</p>
                <p>3</p>
                <p>4</p>
                <p>5</p>
                <span>...</span>
              </div>
              <button type="button" onClick={preventDefault}>
                <img src={acRi} alt="Next" />
              </button>
            </div>
          </div>

          <aside className="learners-courses-syllabus">
            <div className="learners-courses-section-head learners-courses-section-head-right">
              <div>
                <h2>Syllabus</h2>
                <p>Course Available to research</p>
              </div>
              <a href="/" onClick={preventDefault}>See All</a>
            </div>

            <div className="learners-syllabus-list">
              {genesis.map((husk) => (
                <div key={husk.id} className="fgbl-item learners-syllabus-item">
                  <div className="fgbl-item-l">
                    <h4>{husk.title}</h4>
                    <p>
                      <span>14 Papers</span>
                      <span>|</span>
                      <span>11 Followers</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button type="button" onClick={preventDefault}>
                      <span>Follow</span>
                      <img src={husk.icon} alt={husk.title} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersCourses;
