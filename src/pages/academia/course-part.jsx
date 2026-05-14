import { useNavigate } from 'react-router-dom';
import acFilterIcon from '../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../assets/icons/ac-fi.svg';
import acLeIcon from '../../assets/icons/ac-le.svg';
import acUsIcon from '../../assets/icons/ac-us.svg';
import acP1Icon from '../../assets/icons/ac-p1.svg';
import acBookIcon from '../../assets/icons/ac-book.svg';
import acDlIcon from '../../assets/icons/ac-dl.svg';
import acPpIcon from '../../assets/icons/ac-pp.svg';
import acLockIcon from '../../assets/icons/ac-lock.svg';
import acSmsIcon from '../../assets/icons/ac-sms.svg';
import acSendIcon from '../../assets/icons/ac-send.svg';
import './course-part.css';

function AcademiaCoursePart() {
  const navigate = useNavigate();

  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const filterToggleOptions = ['All', 'Free', 'Paid'];

  const courseParts = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    title: 'An Operadic Approach to Internal Structures',
    author: 'Dr. Xavier KABARANGA',
    description:
      'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings... Read more',
  }));

  const relatedTopics = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    title: 'Linear Algebra',
    papersCount: 14,
    icon: index % 2 === 0 ? acPpIcon : acLockIcon,
    isLocked: index % 2 === 1,
  }));

  const handleViewPaper = () => navigate('/academia/read-contents');
  const handleRelatedTopic = () => navigate('/academia/courses');
  const handleBackToCourses = () => navigate('/academia/courses');

  return (
    <div className="course-part-page">
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

      {/* Main Content */}
      <section className="main-content">
        {/* Filters Header */}
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button">
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
                    <button className="dropdown-toggle" type="button">
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

        {/* Breadcrumb */}
        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBackToCourses}>
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

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left: Key Research Themes */}
          <div className="main-content-grid-l">
            <div className="mcgl-h">
              <h2>Key research themes</h2>
            </div>
            <div className="mcgl-b">
              {courseParts.map((part) => (
                <div key={part.id} className="course-part">
                  <div className="course-part-h">
                    <div>
                      <h5>{part.title}</h5>
                      <p>By {part.author}</p>
                    </div>
                    <div>
                      <button type="button" onClick={handleViewPaper}>
                        <img src={acBookIcon} alt="View" />
                        <span>View Paper</span>
                      </button>
                      <button>
                        <img src={acDlIcon} alt="Download" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="course-part-b">
                    <p>{part.description}</p>
                  </div>
                </div>
              ))}

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

          {/* Right: Related Subtopics */}
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Subtopics</h2>
            </div>
            <div className="mcgr-b">
              {relatedTopics.map((topic) => (
                <div key={topic.id} className="fgbl-item" onClick={handleRelatedTopic} style={{ cursor: 'pointer' }}>
                  <div className="fgbl-item-l">
                    <h4>{topic.title}</h4>
                    <p>
                      <span>{topic.papersCount} Papers</span>
                      <span>|</span>
                      <span>{topic.papersCount} Papers</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button>
                      <span>Follow</span>
                      <img src={topic.icon} alt={topic.isLocked ? 'Locked' : 'Plus'} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tune and get the latest update</h3>
          <p>Far far away, behind the word mountains</p>
        </div>
        <div className="newsletter-sec-r">
          <form>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input type="email" placeholder="Enter email address" />
            <button type="submit">
              <img src={acSendIcon} alt="Submit" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaCoursePart;
