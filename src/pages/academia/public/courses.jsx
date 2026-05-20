import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acP1Icon from '../../../assets/icons/ac-p1.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLockIcon from '../../../assets/icons/ac-lock.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import storyImage from '../../../assets/imgs/ac-str.jpg';
import './courses.css';

function AcademiasCourses() {
  const navigate = useNavigate();

  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const filterToggleOptions = ['All', 'Free', 'Paid'];

  const filterCategories = [
    {
      title: 'Mathematics & Science',
      items: [
        { id: 'algebra', label: 'Algebra', count: 410, checked: true },
        { id: 'calculus', label: 'Calculus', count: 12 },
        { id: 'compMath', label: 'Computational Math', count: 2899 },
        { id: 'appliedMath', label: 'Applied Math', count: 23 },
        { id: 'funcAnalysis', label: 'Functional analysis', count: 567 },
        { id: 'geometry', label: 'Geometry', count: 1099 },
      ],
      expanded: true,
    },
    { title: 'History', items: [{ id: 'history1', label: 'Ancient History' }], expanded: false },
    { title: 'Engineering', items: [{ id: 'engineering1', label: 'Civil Engineering' }], expanded: false },
    { title: 'Economics', items: [{ id: 'economics1', label: 'Microeconomics' }], expanded: false },
    { title: 'Psychology', items: [{ id: 'psychology1', label: 'General Psychology' }], expanded: false },
    { title: 'Data Science', items: [{ id: 'dataScience1', label: 'Machine Learning' }], expanded: false },
    { title: 'IT & Software development', items: [{ id: 'itSoftware1', label: 'Web Development' }], expanded: false },
  ];

  const courses = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    title: 'Linear Algebra',
    papersCount: 14,
    icon: index % 2 === 0 ? acPpIcon : acLockIcon,
    isLocked: index % 2 === 1,
  }));

  const stories = Array.from({ length: 4 }, (_, index) => ({
    id: index,
    author: 'Admin',
    commentCount: 3,
    title: 'Build your dream software & engineering career',
    description: 'A small river named Duden flows by their place and supplies it with the necessary regelialia.',
    date: 'Oct 19, 2025 07:50 AM',
  }));

  useEffect(() => {

    // Initialize Swiper for stories
    const ssSwiper = new Swiper('.ss-swiper', {
      modules: [Navigation],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        769: {
          slidesPerView: 4,
        },
      },
      navigation: {
        nextEl: '.ss-swiper .swiper-button-next',
        prevEl: '.ss-swiper .swiper-button-prev',
      },
    });

    return () => {
      ssSwiper.destroy();
    };
  }, []);

  const handleCoursesClick = () => navigate('/academia/course-part');
  const handleStoryClick = () => navigate('/academia/read-story');
  const handleViewMore = () => navigate('/academia/watch');

  return (
    <div className="courses-page">
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>Courses</h1>
            </div>
            <div className="hsi-contents-b">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Nobis eaque sit aperiam? Hic eaque unde nobis nisi aut
                minus quas quod aliquid et minima. Omnis quidem iure ex itaque nemo
                Nobis eaque sit aperiam? Hic eaque unde nobis nisi aut
                minus quas quod aliquid et minima. Omnis quidem iure ex itaque nemo!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Header */}
      <section className="journals-sec">
        <div className="sec-h">
          <h1>Programs & Courses</h1>
          <p>Explore our top research interests</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        {/* Filters Header */}
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="Filter" />
                <span>All Courses</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {courseTypes.map((type, idx) => (
                <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                  <a href="#/">{type}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any projects..." />
              <div className="div-h-r-s-f">
                {filterToggleOptions.map((option, idx) => (
                  <button key={idx} className={idx === 0 ? 'active' : ''}>
                    {option}
                  </button>
                ))}
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="Sort" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortOptions.map((option, idx) => (
                        <li key={idx} className={`dropdown-item ${idx === 0 ? 'active' : ''}`}>
                          <a href="#/">{option}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="filters-grid">
          {/* Left Sidebar - Filters */}
          <div className="filters">
            <div className="accordion" id="courseFilterAccordion">
              {filterCategories.map((category, catIdx) => (
                <div key={catIdx} className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${!category.expanded ? 'collapsed' : ''}`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${catIdx}`}
                      aria-expanded={category.expanded}
                    >
                      {category.title}
                    </button>
                  </h2>
                  <div
                    id={`collapse${catIdx}`}
                    className={`accordion-collapse collapse ${category.expanded ? 'show' : ''}`}
                  >
                    <div className="accordion-body">
                      {category.items.map((item) => (
                        <div key={item.id} className="form-stick">
                          <input
                            className="form-stick-input"
                            type="checkbox"
                            id={item.id}
                            defaultChecked={item.checked}
                          />
                          <label className="form-stick-label" htmlFor={item.id}>
                            {item.label}
                          </label>
                          {item.count && <span>{item.count.toLocaleString()}</span>}
                        </div>
                      ))}
                      {category.items.length > 5 && (
                        <button style={{ background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', padding: 0 }}>
                          Show more
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="filters-grid-b">
            {/* Breadcrumb */}
            <div className="filters-grid-b-h">
              <button type="button">
                <img src={acLeIcon} alt="Back" />
              </button>
              <div>
                <p>Mathematics & Science</p>
                <span>/</span>
                <span>Algebra</span>
                <span>/</span>
              </div>
            </div>

            {/* Selected Filter Info */}
            <div className="filters-grid-b-sel">
              <div className="filters-grid-b-sel-h">
                <h1>Algebra</h1>
                <div>
                  <p>
                    <img src={acUsIcon} alt="Users" />
                    <span>12.7K Followers</span>
                  </p>
                  <button>
                    <span>Follow</span>
                    <img src={acP1Icon} alt="Plus" />
                  </button>
                </div>
              </div>
              <div className="filters-grid-b-sel-b">
                <p>
                  Statistics is the branch of mathematics that deals with the collection, analysis, interpretation,
                  presentation, and organization of data. It provides methodologies for making inferences about
                  populations based on sample data, enabling researchers to quantify uncertainty and variability in
                  empirical findings.
                </p>
              </div>
            </div>

            {/* Courses List */}
            <div className="filters-grid-b-list">
              {courses.map((course) => (
                <div key={course.id} className="fgbl-item" onClick={handleCoursesClick} style={{ cursor: 'pointer' }}>
                  <div className="fgbl-item-l">
                    <h4>{course.title}</h4>
                    <p>
                      <span>{course.papersCount} Papers</span>
                      <span>|</span>
                      <span>{course.papersCount} Papers</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button>
                      <span>Follow</span>
                      <img src={course.icon} alt={course.isLocked ? 'Locked' : 'Plus'} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="bi bi-arrow-left"
                  viewBox="0 0 16 16"
                  stroke="currentColor"
                  strokeWidth="0.7"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                  />
                </svg>
              </button>
              <div>
                {[1, 2, 3, 4, 5].map((num) => (
                  <p key={num} className={num === 3 ? 'active' : ''}>
                    {num}
                  </p>
                ))}
              </div>
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="bi bi-arrow-right"
                  viewBox="0 0 16 16"
                  stroke="currentColor"
                  strokeWidth="0.7"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stories */}
      <section className="stories-sec">
        <div className="sec-h">
          <p>Blogs</p>
          <h1>Community stories</h1>
        </div>
        <div className="stories-sec-contents">
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              {stories.map((story) => (
                <div key={story.id} className="swiper-slide">
                  <div className="ss-item" onClick={handleStoryClick} style={{ cursor: 'pointer' }}>
                    <div className="ss-item-img">
                      <img src={storyImage} alt="Story" />
                    </div>
                    <div className="ss-item-text">
                      <div className="ss-item-text-h">
                        <div>
                          <img src={acUsIcon} alt="User" />
                          <span>{story.author}</span>
                        </div>
                        <div>
                          <img src={acMessIcon} alt="Comments" />
                          <span>{story.commentCount}</span>
                        </div>
                      </div>
                      <h4>{story.title}</h4>
                      <p>{story.description}</p>
                      <div className="ss-item-text-f">
                        <div>
                          <img src={acCalIcon} alt="Date" />
                          <span>{story.date}</span>
                        </div>
                        <button>
                          <img src={acShareIcon} alt="Share" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-button-next ss-btn"></div>
            <div className="swiper-button-prev ss-btn"></div>
          </div>
        </div>
      </section>

      {/* View More CTA */}
      <div className="sec-CTA">
        <button type="button" onClick={handleViewMore}>
          <span>View More</span>
          <img src={acNextIcon} alt="Next" />
        </button>
      </div>
    </div>
  );
}

export default AcademiasCourses;

