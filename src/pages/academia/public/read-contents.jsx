import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import acFilterIcon from '../../../assets/icons/ac-ff.svg';
import acFiltersIcon from '../../../assets/icons/ac-fi.svg';
import acLeIcon from '../../../assets/icons/ac-le.svg';
import acBookIcon from '../../../assets/icons/ac-book.svg';
import acDlIcon from '../../../assets/icons/ac-dl.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';
import acPpIcon from '../../../assets/icons/ac-pp.svg';
import acLockIcon from '../../../assets/icons/ac-lock.svg';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import './read-contents.css';

function AcademiaReadContents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const courseTypes = ['All Courses', 'Certificates', 'Diplomas', 'Degrees', 'Workshops'];
  const sortOptions = ['Newest', 'Top papers', 'Past Papers', 'Most Downloaded'];

  const [courseData, setCourseData] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const courseId = searchParams.get('courseId');
  const chapterId = searchParams.get('chapterId');

  // relatedCourses will be fetched from backend (public available courses)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/academia/course-part');
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        let resolvedChapterId = chapterId;
        let resolvedCourse = null;

        if (!resolvedChapterId) {
          // If no chapter supplied, try to load course and pick first chapter
          if (courseId) {
            const cRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
            const cBody = await cRes.json().catch(() => ({}));
            resolvedCourse = cBody?.data || cBody;
            resolvedChapterId = resolvedCourse?.chapters?.[0]?.id || resolvedCourse?.chapters?.[0]?._id;
            if (mounted) setCourseData(resolvedCourse || null);
          } else {
            // fallback: fetch first available course
            const listRes = await fetch(`${API_BASE_URL}/api/courses?page=1&limit=1`);
            const listBody = await listRes.json().catch(() => ({}));
            const first = Array.isArray(listBody?.data) ? listBody.data[0] : Array.isArray(listBody) ? listBody[0] : null;
            if (!first) {
              if (mounted) {
                setCourseData(null);
                setChapterData(null);
              }
              return;
            }
            // fetch full course to get chapters
            const cRes = await fetch(`${API_BASE_URL}/api/courses/${first.id || first._id}`);
            const cBody = await cRes.json().catch(() => ({}));
            resolvedCourse = cBody?.data || cBody || first;
            resolvedChapterId = resolvedCourse?.chapters?.[0]?.id || resolvedCourse?.chapters?.[0]?._id;
            if (mounted) setCourseData(resolvedCourse || null);
          }
        } else {
          // chapter provided; optionally fetch course if courseId present
          if (courseId) {
            const cRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
            const cBody = await cRes.json().catch(() => ({}));
            if (mounted) setCourseData(cBody?.data || cBody || null);
          }
        }

        if (resolvedChapterId) {
          const chapRes = await fetch(`${API_BASE_URL}/api/chapters/${resolvedChapterId}`);
          const chapBody = await chapRes.json().catch(() => ({}));
          if (mounted) setChapterData(chapBody?.data || chapBody || null);
        } else {
          if (mounted) setChapterData(null);
        }
        // fetch related public courses
        try {
          const relRes = await fetch(`${API_BASE_URL}/api/courses/public/available?page=1&limit=6`);
          const relBody = await relRes.json().catch(() => ({}));
          const relList = Array.isArray(relBody?.data) ? relBody.data : (Array.isArray(relBody) ? relBody : []);
          if (mounted) {
            setRelatedCourses(relList.filter((item) => String(item.id || item._id || item.course_id) !== String(resolvedCourse?.id || resolvedCourse?._id || '')));
          }
        } catch (e) {
          if (mounted) setRelatedCourses([]);
        }
      } catch (err) {
        if (mounted) {
          setCourseData(null);
          setChapterData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [API_BASE_URL, courseId, chapterId]);

  const chapterTitle = chapterData?.title || chapterData?.name || courseData?.title || 'Content';
  const chapterAuthor = courseData?.instructor_name || courseData?.author_name || 'Academia Team';
  const chapterAbstract = chapterData?.description || chapterData?.intro_message || courseData?.description || '';
  const chapterAuthorAvatar = (
    chapterData?.instructor_avatar || chapterData?.author_avatar || courseData?.instructor_avatar || courseData?.user_avatar || courseData?.thumbnail_url || null
  );
  const chapterAuthorAvatarSrc = chapterAuthorAvatar
    ? (chapterAuthorAvatar.startsWith('http') ? chapterAuthorAvatar : `${API_BASE_URL}${chapterAuthorAvatar}`)
    : learnersProfileImage;

  return (
    <div className="academia-read-contents-page">
      <section className="main-content">
        <div className="div-h">
          <div className="dropdown filter-drop">
            <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div>
                <img src={acFilterIcon} alt="" />
                <span>All Courses</span>
              </div>
            </button>
            <ul className="dropdown-menu">
              {courseTypes.map((item, index) => (
                <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                  <a href={`/academia/courses?type=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="div-h-r">
            <div className="div-h-r-s">
              <input type="search" placeholder="Search any projects..." />
              <div className="div-h-r-s-f">
                <button className="active" type="button">All</button>
                <button type="button">Free</button>
                <button type="button">Paid</button>
                <div className="div-h-r-s-f-f">
                  <div className="dropdown">
                    <button className="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <div>
                        <img src={acFiltersIcon} alt="" />
                        <span>Filters</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu">
                      {sortOptions.map((item, index) => (
                        <li key={item} className={`dropdown-item${index === 0 ? ' active' : ''}`}>
                          <a href={`/academia/courses?sort=${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-grid-b-h">
          <button type="button" onClick={handleBack}>
            <img src={acLeIcon} alt="Left" />
          </button>
          <div>
            <p>{courseData?.category || 'Academia'}</p>
            <span>/</span>
            <span>{chapterData?.title || chapterData?.chapter_title || 'Chapter details'}</span>
            <span>/</span>
          </div>
        </div>

        <div className="course-part">
          <div className="course-part-h">
            <div>
              <h5>{chapterTitle}</h5>
              <div className="course-part-h-p">
                <div className="course-part-h-img">
                  <img src={chapterAuthorAvatarSrc} alt="Author" />
                </div>
                <p>By {chapterAuthor}</p>
              </div>
            </div>
            <div>
              <button type="button">
                <img src={acBookIcon} alt="Save" />
                <span>Save to library</span>
              </button>
              <button type="button">
                <img src={acDlIcon} alt="Download" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="course-part-b">
            <h5>Abstract</h5>
            <p>{loading ? 'Loading content…' : (chapterAbstract || 'No abstract available')}</p>
          </div>
        </div>
      </section>

      <section className="main-content">
        <div className="main-content-grid">
          <div className="main-content-grid-l">
            <div className="mcgl-h">
              <h2>Outline</h2>
            </div>
            <div className={`cont-page ${!loading && !(chapterData && chapterData.attachments) ? 'cont-empty' : ''}`}>
              {loading ? (
                <p>Loading outline…</p>
              ) : chapterData && chapterData.attachments ? (
                <div dangerouslySetInnerHTML={{ __html: chapterData.attachments }} />
              ) : (
                <p>No outline available for this chapter.</p>
              )}
            </div>
          </div>
          <div className="main-content-grid-r">
            <div className="mcgr-h">
              <h2>Related Courses</h2>
            </div>
            <div className="related-list">
              {relatedCourses.length > 0 ? relatedCourses.map((topic) => (
                <div key={topic.id || topic._id || topic.course_id} className="fgbl-item" onClick={() => navigate(`/academia/course-part?courseId=${topic.id || topic._id || topic.course_id}`)} style={{ cursor: 'pointer' }}>
                  <div className="fgbl-item-l">
                    <h4>{topic.title || topic.name}</h4>
                    <p>
                      <span>{topic.total_chapters || topic.chapters_count || 0} Chapters</span>
                      <span>|</span>
                      <span>{Number(topic.price) === 0 ? 'Free' : 'Paid'}</span>
                    </p>
                  </div>
                  <div className="fgbl-item-r">
                    <button>
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
              <img src={acSendIcon} alt="Next" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AcademiaReadContents;
