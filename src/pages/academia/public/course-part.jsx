import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acP1Icon from '../../../assets/icons/ac-p1.svg';
import acBookIcon from '../../../assets/icons/ac-book.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLockIcon from '../../../assets/icons/ac-lock.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import './course-part.css';

function AcademiaCoursePart() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preventDefault = (e) => e.preventDefault();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [courseData, setCourseData] = useState(null);
  const [syllabusOutlines, setSyllabusOutlines] = useState([]); // Explicit state for outlines
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [topicPage, setTopicPage] = useState(1);
  const topicsPerPage = 4;

  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];
  const filterToggleOptions = ['All', 'Free', 'Paid'];

  const courseId = searchParams.get('courseId');

  // Safely map the fetched outlines for display
  const courseParts = useMemo(() => {
    return syllabusOutlines.map((outline, index) => ({
      id: outline.id || index,
      title: outline.title || `Topic ${index + 1}`,
      author: courseData?.instructor_name || courseData?.author_name || 'Academia Team',
      description: outline.abstract || outline.description || '', 
    }));
  }, [syllabusOutlines, courseData]);

  const totalTopicPages = Math.max(1, Math.ceil(courseParts.length / topicsPerPage));
  const visibleCourseParts = courseParts.slice((topicPage - 1) * topicsPerPage, topicPage * topicsPerPage);
  
  const topicPageNumbers = (() => {
    const visible = 5;
    const start = Math.max(1, Math.min(topicPage - 2, totalTopicPages - visible + 1));
    const end = Math.min(totalTopicPages, start + visible - 1);
    const pages = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  })();

  const handleViewPaper = (topicId) => navigate(`/academia/read-contents?courseId=${courseData?.id || courseId || ''}&topicId=${topicId || ''}`);
  const handleRelatedTopic = (topicId) => navigate(`/academia/course-part?courseId=${topicId}`);
  const handleBackToCourses = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/academia/courses');
  };

  useEffect(() => {
    let mounted = true;

    const loadCourse = async () => {
      try {
        setDataLoading(true);

        let resolvedCourseId = courseId;

        // Fallback: If no ID provided, grab the first available course
        if (!resolvedCourseId) {
          const listResponse = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=1`);
          const listBody = await listResponse.json().catch(() => ({}));
          const firstCourse = Array.isArray(listBody?.data) ? listBody.data[0] : Array.isArray(listBody) ? listBody[0] : null;
          resolvedCourseId = firstCourse?.id || firstCourse?._id || firstCourse?.course_id || '';
        }

        if (!resolvedCourseId) {
          if (mounted) {
            setCourseData(null);
            setSyllabusOutlines([]);
            setRelatedTopics([]);
            setDataLoading(false);
          }
          return;
        }

        // STEP 1: Fetch Basic Course Info & Related Courses concurrently
        const [courseResponse, relatedResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses/${resolvedCourseId}`),
          fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`),
        ]);

        const courseBody = await courseResponse.json().catch(() => ({}));
        const relatedBody = await relatedResponse.json().catch(() => ({}));

        if (!mounted) return;

        const course = courseBody?.data || courseBody;
        const relatedList = Array.isArray(relatedBody?.data) ? relatedBody.data : Array.isArray(relatedBody) ? relatedBody : [];

        setCourseData(course || null);
        
        // Filter out the current course from related topics
        setRelatedTopics(
          relatedList
            .filter((item) => String(item.id || item._id || item.course_id) !== String(course?.id || resolvedCourseId))
            .slice(0, 6)
        );

        // STEP 2: Fetch the Syllabus Outlines IF a syllabus_id exists
        // (This is the critical fix)
        const sylId = course?.syllabus_id || course?.syllabus?.id;
        
        if (sylId) {
          try {
            const syllabusRes = await fetch(`${API_BASE_URL}/api/syllabuses/public/${sylId}`);
            const syllabusBody = await syllabusRes.json();
            const outlines = syllabusBody?.data?.outlines || syllabusBody?.outlines || [];
            
            if (mounted) {
              setSyllabusOutlines(outlines);
            }
          } catch (sylError) {
            console.error("Failed to load syllabus outlines:", sylError);
            if (mounted) setSyllabusOutlines([]);
          }
        } else {
          // If no syllabus ID is attached to the course, reset outlines
          if (mounted) setSyllabusOutlines([]);
        }

        if (mounted) setTopicPage(1);

      } catch (error) {
        if (mounted) {
          setCourseData(null);
          setSyllabusOutlines([]);
          setRelatedTopics([]);
        }
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    loadCourse();

    return () => {
      mounted = false;
    };
  }, [API_BASE_URL, courseId]);

  useEffect(() => {
    setTopicPage(1);
  }, [courseData?.id]);

  return (
    <div className="course-part-page">
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hsi-contents">
            <div className="hsi-contents-h">
              <h1>{courseData?.title || 'Courses'}</h1>
            </div>
            <div className="hsi-contents-b">
              {courseData?.description ? (
                <div dangerouslySetInnerHTML={{ __html: courseData.description }} />
              ) : (
                <p>Loading course details from the backend...</p>
              )}
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
                  <button key={idx} type="button" className={idx === 0 ? 'active' : ''}>
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
            <p>{courseData?.category || 'Academia'}</p>
            <span>/</span>
            <span>{courseData?.level || courseData?.education_level || 'Course details'}</span>
            <span>/</span>
          </div>
        </div>

        {/* Selected Filter Info */}
        <div className="filters-grid-b-sel">
          <div className="filters-grid-b-sel-h">
            <h1>{courseData?.title || 'Course details'}</h1>
            <div>
              <p>
                <img src={acUsIcon} alt="Users" />
                <span>{courseData?.enrolled_users || courseData?.enrollment_count || 0} Students</span>
              </p>
              <button type="button">
                <span>Follow</span>
                <img src={acP1Icon} alt="Plus" />
              </button>
            </div>
          </div>
          <div className="filters-grid-b-sel-b">
            {courseData?.description ? (
              <div dangerouslySetInnerHTML={{ __html: courseData.description }} />
            ) : (
              <p>This course is loading from the backend.</p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content-grid">
          {/* Left: Syllabus Topics (Outlines) */}
          <div className="main-content-grid-l">
            <div className="mcgl-h">
              <h2>Syllabus Topics</h2>
            </div>
            <div className="mcgl-b">
              {dataLoading ? (
                <div className="course-part">
                  <div className="course-part-b">
                    <p>Loading syllabus topics...</p>
                  </div>
                </div>
              ) : visibleCourseParts.length > 0 ? visibleCourseParts.map((part) => (
                <div key={part.id} className="course-part">
                  <div className="course-part-h">
                    <div>
                      <h5>{part.title}</h5>
                      <p>By {part.author}</p>
                    </div>
                    <div>
                      <button type="button" onClick={() => handleViewPaper(part.id)}>
                        <img src={acBookIcon} alt="View" />
                        <span>View Topic</span>
                      </button>
                      <button type="button">
                        <img src={acDlIcon} alt="Download" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="course-part-b">
                    {part.description ? (
                      <div dangerouslySetInnerHTML={{ __html: part.description }} />
                    ) : (
                      <p>No description available.</p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="course-part">
                  <div className="course-part-b">
                    <p>No syllabus topics found for this course.</p>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalTopicPages > 1 && (
                <div className="pagination">
                  <button type="button" onClick={() => setTopicPage((page) => Math.max(1, page - 1))} disabled={topicPage <= 1}>
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
                    {topicPageNumbers.map((num) => (
                      <button key={num} type="button" className={num === topicPage ? 'active' : ''} onClick={() => setTopicPage(num)}>
                        {num}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setTopicPage((page) => Math.min(totalTopicPages, page + 1))} disabled={topicPage >= totalTopicPages}>
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
              )}
            </div>
          </div>

          {/* Right: Related Subtopics */}
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Courses</h2>
            </div>
            <div className="mcgr-b">
              {relatedTopics.length > 0 ? relatedTopics.map((topic) => (
                <div key={topic.id || topic._id || topic.course_id} className="fgbl-item" onClick={() => handleRelatedTopic(topic.id || topic._id || topic.course_id)} style={{ cursor: 'pointer' }}>
                  <div className="fgbl-item-l">
                    <h4>{topic.title || topic.name}</h4>
                    <p>
                      <span>{topic.total_outlines || topic.outlinesCount || 0} Topics</span>
                      <span>|</span>
                      <span>{Number(topic.price) === 0 ? 'Free' : 'Paid'}</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button type="button">
                      <span>Follow</span>
                      <img src={Number(topic.price) === 0 ? acPpIcon : acLockIcon} alt={Number(topic.price) === 0 ? 'Plus' : 'Locked'} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="fgbl-item fgbl-empty">
                  <div className="fgbl-item-l">
                    <h4>No related courses</h4>
                    <p>We couldn’t find more public courses right now.</p>
                  </div>
                </div>
              )}
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
          <form onSubmit={preventDefault}>
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