import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import { buildCourseDetailsPath, buildSyllabusReaderPath, buildProjectPath, buildStoryPath } from './publicShare';

const stripHtml = (html) => {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

// --- Import Icons ---
import acPlusIcon from '../../../assets/icons/ac-plus.svg';
import bookOpenIcon from '../../../assets/icons/book-open.svg';
import ac1Icon from '../../../assets/icons/ac-1.svg';
import ac2Icon from '../../../assets/icons/ac-2.svg';
import ac3Icon from '../../../assets/icons/ac-3.svg';
import acStat1Icon from '../../../assets/icons/ac-stat1.svg';
import acStat2Icon from '../../../assets/icons/ac-stat2.svg';
import acStat3Icon from '../../../assets/icons/ac-stat3.svg';
import acStat4Icon from '../../../assets/icons/ac-stat4.svg';
import acWshIcon from '../../../assets/icons/ac-wsh.svg';
import acP1Icon from '../../../assets/icons/ac-p1.svg';
import acNextIcon from '../../../assets/icons/ac-next.svg';
import acEnIcon from '../../../assets/icons/ac-en.svg';
import acLIcon from '../../../assets/icons/ac-l.svg';
import rwLIcon from '../../../assets/icons/rw-l.svg';
import acAcaIcon from '../../../assets/icons/ac-aca.svg';
import acAca2Icon from '../../../assets/icons/ac-aca2.svg';
import acAca3Icon from '../../../assets/icons/ac-aca3.svg';
import acAca4Icon from '../../../assets/icons/ac-aca4.svg';
import acNnexIcon from '../../../assets/icons/ac-nnex.svg';
import acUsIcon from '../../../assets/icons/ac-us.svg';
import acMessIcon from '../../../assets/icons/ac-mess.svg';
import acCalIcon from '../../../assets/icons/ac-cal.svg';
import acShareIcon from '../../../assets/icons/ac-share.svg';
import acSmsIcon from '../../../assets/icons/ac-sms.svg';
import acSendIcon from '../../../assets/icons/ac-send.svg';

// --- Import Images ---
import acaImg from '../../../assets/imgs/aca.png';
import jrImg from '../../../assets/imgs/jr.jpg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import acStrImg from '../../../assets/imgs/ac-str.jpg';
import journalImage from '../../../assets/imgs/journal.jpg';

import './index.css';
import { PublicNewsletterNotice, usePublicNewsletter } from './usePublicNewsletter.jsx';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveStoryImage = (value) => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

const resolveProjectImage = (value, fallback = journalImage) => {
  if (!value) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

function AcademiaIndex() {
  usePublicPageTitle('Home');
  const navigate = useNavigate();
  const swiperInstancesRef = useRef([]);

  // --- Dynamic State ---
  const [popularData, setPopularData] = useState([]);
  const [freeData, setFreeData] = useState([]);
  const [syllabusesData, setSyllabusesData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { email: newsletterEmail, setEmail: setNewsletterEmail, notice: newsletterNotice, handleSubmit: handleNewsletterSubmit } = usePublicNewsletter();

  // --- Initialize Swipers ---
  useEffect(() => {
    // Destroy previous instances safely
    swiperInstancesRef.current.forEach((instance) => instance?.destroy(true, true));

    // 1. Projects (Coverflow)
    const journalsSwiper = new Swiper('.journalsSwiper', {
      modules: [Navigation, EffectCoverflow],
      spaceBetween: 20,
      loop: true,
      grabCursor: true,
      slidesPerView: "auto",
      centeredSlides: true,
      effect: 'coverflow',
      coverflowEffect: {
        rotate: 0,
        stretch: 20,
        depth: 120,
        modifier: 1,
        slideShadows: false,
      },
      observer: true,
      observeParents: true,
      breakpoints: {
        0: { slidesPerView: 1.2 },
        768: { slidesPerView: 3 },
        1200: { slidesPerView: 3 },
      },
      navigation: {
        nextEl: '.journalsSwiper .swiper-button-next',
        prevEl: '.journalsSwiper .swiper-button-prev',
      },
    });

    // 2. Popular Syllabuses
    const pscSwiper = new Swiper('.psc-swiper', {
      modules: [Pagination],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      pagination: {
        el: '.psc-swiper .swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        769: { slidesPerView: 4 },
      },
    });

    // 3. Community Stories
    const ssSwiper = new Swiper('.ss-swiper', {
      modules: [Navigation],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      breakpoints: {
        0: { slidesPerView: 1 },
        769: { slidesPerView: 4 },
      },
      navigation: {
        nextEl: '.ss-swiper .swiper-button-next',
        prevEl: '.ss-swiper .swiper-button-prev',
      },
    });

    swiperInstancesRef.current = [journalsSwiper, pscSwiper, ssSwiper];

    return () => {
      swiperInstancesRef.current.forEach((instance) => instance?.destroy(true, true));
      swiperInstancesRef.current = [];
    };
  }, [syllabusesData, popularData, storiesData, projectsData]);

  // --- Fetch API Data ---
  useEffect(() => {
    let mounted = true;

    const loadPublicData = async () => {
      try {
        const [storiesRes, popularRes, freeRes, syllabusesRes, projectsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/community-stories`),
          fetch(`${API_BASE_URL}/api/courses/public/popular`),
          fetch(`${API_BASE_URL}/api/courses/public/free`),
          fetch(`${API_BASE_URL}/api/syllabuses?status_approval=approved`),
          fetch(`${API_BASE_URL}/api/projects`),
        ]);

        const storiesBody = await storiesRes.json().catch(() => ({}));
        const popularBody = await popularRes.json().catch(() => ({}));
        const freeBody = await freeRes.json().catch(() => ({}));
        const syllabusesBody = await syllabusesRes.json().catch(() => ({}));
        const projectsBody = await projectsRes.json().catch(() => ({}));

        if (!mounted) return;

        setStoriesData(Array.isArray(storiesBody?.data) ? storiesBody.data : (Array.isArray(storiesBody) ? storiesBody : []));
        setPopularData(Array.isArray(popularBody?.data?.data) ? popularBody.data.data : (Array.isArray(popularBody?.data) ? popularBody.data : (Array.isArray(popularBody) ? popularBody : [])));
        setFreeData(Array.isArray(freeBody?.data?.data) ? freeBody.data.data : (Array.isArray(freeBody?.data) ? freeBody.data : (Array.isArray(freeBody) ? freeBody : [])));
        setSyllabusesData(Array.isArray(syllabusesBody?.data) ? syllabusesBody.data : (Array.isArray(syllabusesBody) ? syllabusesBody : []));
        setProjectsData(
          Array.isArray(projectsBody?.data?.projects)
            ? projectsBody.data.projects
            : Array.isArray(projectsBody?.data)
              ? projectsBody.data
              : (Array.isArray(projectsBody) ? projectsBody : []),
        );
      } catch (err) {
        console.error("Error loading public data:", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    loadPublicData();

    return () => { mounted = false; };
  }, []);

  const platformStats = useMemo(() => {
    if (dataLoading) {
      return [
        { icon: acStat1Icon, value: '…', label: 'Approved syllabuses' },
        { icon: acStat2Icon, value: '…', label: 'Featured courses' },
        { icon: acStat3Icon, value: '…', label: 'Public projects' },
        { icon: acStat4Icon, value: '…', label: 'Community stories' },
      ];
    }

    return [
      { icon: acStat1Icon, value: String(syllabusesData.length), label: 'Approved syllabuses' },
      { icon: acStat2Icon, value: String(popularData.length), label: 'Featured courses' },
      { icon: acStat3Icon, value: String(projectsData.length), label: 'Public projects' },
      { icon: acStat4Icon, value: String(storiesData.length), label: 'Community stories' },
    ];
  }, [dataLoading, syllabusesData.length, popularData.length, projectsData.length, storiesData.length]);

  const features = [
    { icon: ac1Icon, title: 'Online Syllabuses', desc: 'Browse approved syllabuses and open papers published on Academia.' },
    { icon: ac2Icon, title: 'Earn Certificates', desc: 'Complete courses and track certificates through your learner account.' },
    { icon: ac3Icon, title: 'Learn with experts', desc: 'Courses and projects are published by instructors and researchers on the platform.' },
  ];

  const whyChoose = [
    { icon: acAca2Icon, title: 'Verified academic content', desc: 'Syllabuses, courses, and projects come from real contributors on Gonaraza Academia.' },
    { icon: acAca3Icon, title: 'Free and paid courses', desc: 'Explore free catalog items or enroll in paid programs when you are ready.' },
    { icon: acAca4Icon, title: 'Support resources', desc: 'Use the Help page for guidance and contact support when you need assistance.' },
  ];

  return (
    <div className="academia-page">
      
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hero-sec-inner-top">
            <div className="hero-sec-inner-l">
              <img src={acaImg} alt="Academia Welcome" />
            </div>
            <div className="hero-sec-inner-r">
              <div className="hero-sec-inner-r-t">
                <button type="button" onClick={() => navigate('/projects')}>
                  <img src={acPlusIcon} alt="Plus Icon" />
                  <span>Post your project</span>
                </button>
                <button type="button" onClick={() => navigate('/syllabuses')}>
                  <img src={bookOpenIcon} alt="Book Icon" />
                  <span>View Syllabuses</span>
                </button>
              </div>
              <div className="hero-sec-inner-r-b">
                {features.map((feature) => (
                  <div key={feature.title} className="hero-sec-inner-r-b-item">
                    <div>
                      <img src={feature.icon} alt={feature.title} />
                    </div>
                    <div>
                      <h6>{feature.title}</h6>
                      <p>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-sec-inner-bottom">
            <div className="hero-sec-inner-bottom-h">
              <h2>Best Online Education Expertise</h2>
            </div>
            <div>
              <p>Discover a world of knowledge with our expertly crafted syllabuses. Whether you are looking to advance your career or explore a new hobby, Academia provides the tools and community you need to succeed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-sec">
        {platformStats.map((stat) => (
          <div key={stat.label} className="stats-sec-item">
            <div>
              <img src={stat.icon} alt={stat.label} />
            </div>
            <div>
              <h5>{stat.value}</h5>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Projects Section */}
      <section className="journals-sec">
        <div className="sec-h">
          <p>Research & projects</p>
          <h1>Public projects</h1>
        </div>
        
        <div className="swiper journalsSwiper">
          <div className="swiper-wrapper">
            {dataLoading && (
              <div className="swiper-slide">
                <div className="js-item js-empty" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <p style={{ color: '#64748B' }}>Loading projects…</p>
                </div>
              </div>
            )}

            {!dataLoading && projectsData.length > 0 && projectsData.slice(0, 8).map((project) => (
              <div key={project.id || project._id} className="swiper-slide">
                <div
                  className="js-item"
                  onClick={() => navigate(buildProjectPath(project))}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="js-item-img">
                    <img
                      src={resolveProjectImage(project.thumbnail_url || project.thumbnail)}
                      alt={project.title || 'Project'}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="js-item-text">
                    <h6>{project.title || 'Project'}</h6>
                    <div>
                      <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Published project'}</span>
                      <button type="button" onClick={(e) => e.stopPropagation()} aria-label="Share project">
                        <img src={acWshIcon} alt="" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!dataLoading && projectsData.length === 0 && (
              <div className="swiper-slide" style={{ width: '100%' }}>
                <div className="js-item js-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#F8FAFC', borderRadius: '12px' }}>
                  <h4 style={{ fontWeight: 600 }}>No public projects yet</h4>
                  <p style={{ color: '#64748B', marginBottom: '16px' }}>Published projects will appear here.</p>
                  <button type="button" onClick={() => navigate('/projects')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                    Browse projects
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="swiper-button-next js-btn"></div>
          <div className="swiper-button-prev js-btn"></div>
        </div>
      </section>

      {/* Popular Syllabuses Section */}
      <section className="popular-sec">
        <div className="sec-h">
          <p>Explore our top research interests</p>
          <h1>Popular Syllabuses</h1>
        </div>
        <div className="popular-sec-contents">
          <div className="swiper psc-swiper">
            <div className="swiper-wrapper">
              
              {dataLoading && (
                <div className="swiper-slide psc-card">
                  <div className="psc-card-h">
                    <div className="psc-card-h-l">
                      <h5>Loading popular syllabuses...</h5>
                      <p>Please wait</p>
                    </div>
                  </div>
                </div>
              )}

              {!dataLoading && syllabusesData && syllabusesData.length > 0 && (
                syllabusesData.map((syllabus, i) => (
                  <div key={syllabus.id || i} className="swiper-slide psc-card">
                    <div className="psc-card-h">
                      <div className="psc-card-h-l">
                        <h5>{syllabus.title || 'Syllabus'}</h5>
                        <p>
                          <span>{syllabus.outline_count || '0'}</span>
                          <small>Papers</small>
                        </p>
                      </div>
                      <div className="psc-card-h-r">
                        <button type="button">
                          <span>Follow</span>
                          <img src={acP1Icon} alt="Plus" />
                        </button>
                      </div>
                    </div>
                    <div className="psc-card-b">
                      <div className="psc-card-b-item">
                        <h6 style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                          {syllabus.instructor_name || 'Academia Team'}
                        </h6>
                        <p>Author</p>
                      </div>
                      <div className="psc-card-b-item">
                        <h6 style={{ textTransform: 'capitalize' }}>
                          {syllabus.education_level || 'Syllabus'}
                        </h6>
                        <p>Level</p>
                      </div>
                      <div className="psc-card-b-item">
                        <h6>{syllabus.outline_count || '0'}</h6>
                        <p>Papers</p>
                      </div>
                    </div>
                    <div className="psc-card-f">
                      <button type="button" onClick={() => navigate(buildSyllabusReaderPath({ syllabus }))}>
                        View Syllabus
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Browse All / CTA Card */}
              {!dataLoading && syllabusesData && syllabusesData.length > 0 && (
                <div className="swiper-slide psc-last-card">
                  <h3>{syllabusesData.length} {syllabusesData.length === 1 ? 'Syllabus' : 'Syllabuses'}</h3>
                  <div className="psc-last-card-imgs">
                    {syllabusesData.slice(0, 3).map((syllabus, i) => (
                      <div key={syllabus.id || i} className="psc-last-card-img">
                        <span>{(syllabus.title || 'S').charAt(0)}</span>
                      </div>
                    ))}
                    {syllabusesData.length > 3 ? (
                      <div className="psc-last-card-number">{syllabusesData.length - 3}+</div>
                    ) : null}
                  </div>
                  <div className="psc-last-card-btn">
                    <button type="button" onClick={() => navigate('/syllabuses')}>Explore Syllabuses</button>
                  </div>
                </div>
              )}

              {!dataLoading && (!syllabusesData || syllabusesData.length === 0) && (
                <div className="swiper-slide psc-card psc-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                  <div className="empty-title">No syllabuses yet</div>
                  <div className="empty-desc" style={{ marginBottom: '16px', color: '#64748B' }}>We couldn't find syllabuses right now.</div>
                  <button type="button" className="empty-cta btn btn-primary" onClick={() => navigate('/syllabuses')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                    Browse all syllabuses
                  </button>
                </div>
              )}
            </div>
            <div className="swiper-pagination psc-pages"></div>
          </div>
        </div>
      </section>

      {/* Online Courses Section */}
      <section className="online-sec">
        <div className="sec-h">
          <p>Courses</p>
          <h1>Online Courses</h1>
        </div>
        <div className="online-sec-contents">
          {dataLoading && (
            <div className="osc-item osc-empty" style={{ width: '100%', padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px' }}>
              <div className="osc-item-text">
                <div className="empty-title" style={{ fontWeight: 600 }}>Loading courses…</div>
                <div className="empty-desc" style={{ color: '#64748B' }}>Fetching the best courses for you.</div>
              </div>
            </div>
          )}

          {!dataLoading && popularData && popularData.length > 0 && (
            popularData.slice(0, 4).map((course, i) => (
              <div key={course.course_uuid || course.uuid || course.id || course._id || i} className="osc-item" onClick={() => navigate(buildCourseDetailsPath(course))} style={{ cursor: 'pointer' }}>
                <div className="osc-item-img">
                  <img src={course.thumbnail ? resolveStoryImage(course.thumbnail) : acOnImg} alt={course.title} />
                </div>
                <div className="osc-item-text">
                  <div className="osc-item-text-float">
                    <p>{Number(course.price) > 0 ? `${course.price} ${course.currency || 'USD'}` : 'Free'}</p>
                  </div>
                  <div>
                    <h6>{course.title || course.name || 'Course'}</h6>
                    <small>{course.instructor_name || course.author || 'Instructor'}</small>
                  </div>
                  <div>
                    <p>{stripHtml(course.description || course.summary) || 'No description available.'}</p>
                  </div>
                  <div>
                    <small>{course.starts_on || course.startsAt || 'Self-paced'}</small>
                    <button type="button" onClick={(e) => { e.stopPropagation(); navigate(buildCourseDetailsPath(course)); }}>
                      <img src={acEnIcon} alt="Enroll" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/courses?filter=All')}>
            <span>View More</span>
            <img src={acNextIcon} alt="Next" />
          </button>
        </div>
      </section>

      {/* Free Courses Section */}
      <section className="free-sec">
        <div className="sec-h">
          <p>Courses</p>
          <h1>Free Courses</h1>
        </div>
        <div className="free-sec-contents">
          {dataLoading && (
            <div className="fsc-item fsc-empty" style={{ width: '100%', padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px' }}>
              <div className="fsc-item-text">
                <h6 style={{ fontWeight: 600 }}>Loading free courses...</h6>
                <p style={{ color: '#64748B' }}>Please wait while we load free courses.</p>
              </div>
            </div>
          )}

          {!dataLoading && freeData && freeData.length > 0 && (
            freeData.map((course, i) => (
              <div key={course.course_uuid || course.uuid || course.id || course._id || i} className="fsc-item" onClick={() => navigate(buildCourseDetailsPath(course))} style={{ cursor: 'pointer' }}>
                <div className="fsc-item-img">
                  <img src={course.thumbnail ? resolveStoryImage(course.thumbnail) : acOnImg} alt="Free Course" />
                </div>
                <div className="fsc-item-text">
                  <h6>{course.title || course.name || 'Course'}</h6>
                  <small>{course.instructor_name || course.author || 'Instructor'}</small>
                </div>
              </div>
            ))
          )}

          {!dataLoading && (!freeData || freeData.length === 0) && (
            <div className="fsc-item fsc-empty" style={{ width: '100%', padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px' }}>
              <div className="fsc-item-text">
                <h6 style={{ fontWeight: 600 }}>No free courses</h6>
                <p style={{ color: '#64748B', marginBottom: '16px' }}>There are no free courses to show at the moment.</p>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/learner/courses?filter=All')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                  Explore all courses
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/learner/courses?filter=Free')}>
            <span>View More</span>
            <img src={acNextIcon} alt="Next" />
          </button>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="choice-sec">
        <img src={acLIcon} className="ac-l" alt="Decoration" />
        <img src={rwLIcon} className="rw-l" alt="Decoration" />
        <div className="sec-h">
          <p>Abroad Academia Education</p>
          <h1>Why Choose US</h1>
        </div>
        <div className="choice-sec-inner">
          <div className="choice-sec-inner-l">
            <div>
              <img src={acAcaIcon} alt="Academia Icon" />
            </div>
            <div>
              <h4>Browse public projects, syllabuses, and community stories published on Gonaraza Academia.</h4>
            </div>
            <div>
              <button type="button" onClick={() => navigate('/projects')}>
                <span>Explore More</span>
                <img src={acNnexIcon} alt="View" />
              </button>
            </div>
          </div>
          <div className="choice-sec-inner-r">
            {whyChoose.map((item) => (
              <div key={item.title} className="csir-item">
                <div className="csir-item-icon">
                  <img src={item.icon} alt={item.title} />
                </div>
                <div className="csir-item-text">
                  <h6>{item.title}</h6>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Stories Section */}
      <section className="stories-sec">
        <div className="sec-h">
          <p>Blogs</p>
          <h1>Community stories</h1>
        </div>
        <div className="stories-sec-contents">
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              
              {dataLoading && (
                <div className="swiper-slide">
                  <div className="js-item js-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F8FAFC', borderRadius: '12px' }}>
                    <div className="js-item-text" style={{ textAlign: 'center' }}>
                      <h4 style={{ fontWeight: 600 }}>Loading stories…</h4>
                      <p style={{ color: '#64748B' }}>Fetching the latest community stories.</p>
                    </div>
                  </div>
                </div>
              )}

              {!dataLoading && storiesData && storiesData.length > 0 && (
                storiesData.map((story, i) => (
                  <div key={story.id || story._id || i} className="swiper-slide">
                    <div className="ss-item" onClick={() => navigate(buildStoryPath(story))} style={{ cursor: 'pointer' }}>
                      <div className="ss-item-img">
                        <img src={resolveStoryImage(story.thumbnail_url || story.thumbnail) || jrImg} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="ss-item-text">
                        <div className="ss-item-text-h">
                          <div>
                            <img src={acUsIcon} alt="User" />
                            <span>{story.author_name || story.author || 'Admin'}</span>
                          </div>
                          <div>
                            <img src={acMessIcon} alt="Messages" />
                            <span>{story.comments_count || story.messages || 0}</span>
                          </div>
                        </div>
                        <h4>{story.title || story.heading || 'Story'}</h4>
                        <p>{story.excerpt || story.summary || (story.description ? (story.description.substring(0, 100) + '...') : 'No description')}</p>
                        <div className="ss-item-text-f">
                          <div>
                            <img src={acCalIcon} alt="Calendar" />
                            <span>{new Date(story.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <button type="button" onClick={(e) => e.stopPropagation()}>
                            <img src={acShareIcon} alt="Share" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {!dataLoading && (!storiesData || storiesData.length === 0) && (
                <div className="swiper-slide" style={{ width: '100%' }}>
                  <div className="js-item js-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#F8FAFC', borderRadius: '12px' }}>
                    <div className="js-item-text" style={{ textAlign: 'center' }}>
                      <h4 style={{ fontWeight: 600 }}>No community stories</h4>
                      <p style={{ color: '#64748B', marginBottom: '16px' }}>There are no community stories published yet.</p>
                      <button type="button" className="empty-cta btn btn-primary" onClick={() => navigate('/watch')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                        Explore stories
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="swiper-button-next ss-btn"></div>
            <div className="swiper-button-prev ss-btn"></div>
          </div>
        </div>
        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/watch')}>
            <span>View More</span>
            <img src={acNextIcon} alt="Next" />
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter</h3>
          <p>Product updates will be announced here when newsletter subscriptions open.</p>
        </div>
        <div className="newsletter-sec-r">
          <form onSubmit={handleNewsletterSubmit}>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input 
              type="email" 
              placeholder="Enter email address" 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit">
              <img src={acSendIcon} alt="Send" />
            </button>
          </form>
          <PublicNewsletterNotice message={newsletterNotice} />
        </div>
      </section>
    </div>
  );
}

export default AcademiaIndex;