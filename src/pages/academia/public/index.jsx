import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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
import dummyIcon from '../../../assets/icons/dummy.svg';
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
import profImg from '../../../assets/imgs/prof.jpg';
import glImage from '../../../assets/imgs/gl.jpg';
import itemImage from '../../../assets/imgs/item.jpg';

import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveStoryImage = (value) => {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  return `${API_BASE_URL}${value}`;
};

// --- Static Data for Journals (Backend not ready) ---
const STATIC_JOURNALS = [
  { id: 'j1', title: 'The Future of AI in Education', date: 'October 12, 2025', image: jrImg },
  { id: 'j2', title: 'Sustainable Engineering Practices', date: 'November 05, 2025', image: acOnImg },
  { id: 'j3', title: 'Modern Medical Research Advances', date: 'December 01, 2025', image: acStrImg },
  { id: 'j4', title: 'Quantum Computing Fundamentals', date: 'January 15, 2026', image: itemImage },
  { id: 'j5', title: 'Global Economic Trends Post-2025', date: 'February 20, 2026', image: glImage },
];

function AcademiaIndex() {
  const navigate = useNavigate();
  const swiperInstancesRef = useRef([]);

  // --- Dynamic State ---
  const [popularData, setPopularData] = useState([]);
  const [freeData, setFreeData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // --- Form State ---
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // --- Initialize Swipers ---
  useEffect(() => {
    // Destroy previous instances safely
    swiperInstancesRef.current.forEach((instance) => instance?.destroy(true, true));

    // 1. Journals (Coverflow)
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

    // 2. Popular Courses
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

    // 4. Testimonials
    const tscSwiper = new Swiper('.tsc-swiper', {
      modules: [Pagination],
      spaceBetween: 20,
      loop: false,
      grabCursor: true,
      observer: true,
      observeParents: true,
      pagination: {
        el: '.tsc-swiper .swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: 1 },
        769: { slidesPerView: 3 },
      },
    });

    swiperInstancesRef.current = [journalsSwiper, pscSwiper, ssSwiper, tscSwiper];

    return () => {
      swiperInstancesRef.current.forEach((instance) => instance?.destroy(true, true));
      swiperInstancesRef.current = [];
    };
  }, [popularData, storiesData]); // Re-bind swipers when data arrives

  // --- Fetch API Data ---
  useEffect(() => {
    let mounted = true;

    const loadPublicData = async () => {
      try {
        const [storiesRes, popularRes, freeRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/community-stories`),
          fetch(`${API_BASE_URL}/api/courses/public/popular`),
          fetch(`${API_BASE_URL}/api/courses/public/free`),
        ]);

        const storiesBody = await storiesRes.json().catch(() => ({}));
        const popularBody = await popularRes.json().catch(() => ({}));
        const freeBody = await freeRes.json().catch(() => ({}));

        if (!mounted) return;

        setStoriesData(Array.isArray(storiesBody?.data) ? storiesBody.data : (Array.isArray(storiesBody) ? storiesBody : []));
        setPopularData(Array.isArray(popularBody?.data?.data) ? popularBody.data.data : (Array.isArray(popularBody?.data) ? popularBody.data : (Array.isArray(popularBody) ? popularBody : [])));
        setFreeData(Array.isArray(freeBody?.data?.data) ? freeBody.data.data : (Array.isArray(freeBody?.data) ? freeBody.data : (Array.isArray(freeBody) ? freeBody : [])));
      } catch (err) {
        console.error("Error loading public data:", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    loadPublicData();

    return () => { mounted = false; };
  }, []);

  // --- Handlers ---
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    console.log("Subscribing to newsletter:", newsletterEmail);
    // TODO: Send to backend
    setNewsletterEmail('');
    alert("Thanks for subscribing!");
  };

  // --- Static Component Data ---
  const stats = [
    { icon: acStat1Icon, value: '20,000+', label: 'Enrolled Students' },
    { icon: acStat2Icon, value: '20,000+', label: 'Trusted Tutors' },
    { icon: acStat3Icon, value: '20,000+', label: 'Schedules' },
    { icon: acStat4Icon, value: '20,000+', label: 'Courses' },
  ];

  const features = [
    { icon: ac1Icon, title: 'Online Courses', desc: 'Secure, fast, and comprehensive access to online learning modules.' },
    { icon: ac2Icon, title: 'Earn Certificates', desc: 'Get verified certificates to boost your professional resume.' },
    { icon: ac3Icon, title: 'Learn with Expert', desc: 'Direct interaction with industry leaders and experienced tutors.' },
  ];

  const whyChoose = [
    { icon: acAca2Icon, title: 'Expert & experienced instructors', desc: 'Our instructors are experts in their fields and have years of experience teaching.' },
    { icon: acAca3Icon, title: 'Lifetime free access', desc: 'Once enrolled, you maintain access to the course materials forever.' },
    { icon: acAca4Icon, title: 'Dedicated support', desc: 'Our support team is available 24/7 to help you with your learning journey.' },
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
                <button type="button" onClick={() => navigate('/academia/journals')}>
                  <img src={acPlusIcon} alt="Plus Icon" />
                  <span>Post your project</span>
                </button>
                <button type="button" onClick={() => navigate('/academia/courses')}>
                  <img src={bookOpenIcon} alt="Book Icon" />
                  <span>View Courses</span>
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
              <p>Discover a world of knowledge with our expertly crafted courses. Whether you are looking to advance your career or explore a new hobby, Academia provides the tools and community you need to succeed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-sec">
        {stats.map((stat) => (
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

      {/* Journals Section (Using Static Data) */}
      <section className="journals-sec">
        <div className="sec-h">
          <p>Orientation Guide projects</p>
          <h1>All Courses & Journals</h1>
        </div>
        
        <div className="swiper journalsSwiper">
          <div className="swiper-wrapper">
            {STATIC_JOURNALS.map((story) => (
              <div key={story.id} className="swiper-slide">
                <div className="js-item" onClick={() => navigate('/academia/read-story')} style={{ cursor: 'pointer' }}>
                  <div className="js-item-img">
                    <img src={story.image} alt={story.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </div>
                  <div className="js-item-text">
                    <h6>{story.title}</h6>
                    <div>
                      <span>{story.date}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); /* handle share */ }}>
                        <img src={acWshIcon} alt="Share" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-button-next js-btn"></div>
          <div className="swiper-button-prev js-btn"></div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="popular-sec">
        <div className="sec-h">
          <p>Explore our top research interests</p>
          <h1>Popular Courses</h1>
        </div>
        <div className="popular-sec-contents">
          <div className="swiper psc-swiper">
            <div className="swiper-wrapper">
              
              {dataLoading && (
                <div className="swiper-slide psc-card">
                  <div className="psc-card-h">
                    <div className="psc-card-h-l">
                      <h5>Loading popular courses...</h5>
                      <p>Please wait</p>
                    </div>
                  </div>
                </div>
              )}

              {!dataLoading && popularData && popularData.length > 0 && (
                popularData.map((course, i) => (
                  <div key={course.id || course._id || i} className="swiper-slide psc-card">
                    <div className="psc-card-h">
                      <div className="psc-card-h-l">
                        <h5>{course.title || course.name || 'Course'}</h5>
                        <p>
                          <span>{course.followers || course.enrollments || course.enrolled_count || '0'}</span>
                          <small>Followers</small>
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
                        <h6>{course.instructors_count || course.authors || '1'}</h6>
                        <p>Authors</p>
                      </div>
                      <div className="psc-card-b-item">
                        <h6>{course.learners_count || course.enrolled_count || '0'}</h6>
                        <p>Learners</p>
                      </div>
                      <div className="psc-card-b-item">
                        <h6>{course.papers_count || course.resources_count || course.chapters_count || '0'}</h6>
                        <p>Papers</p>
                      </div>
                    </div>
                    <div className="psc-card-f">
                      <button type="button" onClick={() => navigate(`/academia/course-part?courseId=${course.id}`)}>
                        View course
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Browse All / CTA Card */}
              {!dataLoading && popularData && popularData.length > 0 && (
                <div className="swiper-slide psc-last-card">
                  <h3>1000+ Popular courses</h3>
                  <div className="psc-last-card-imgs">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="psc-last-card-img">
                        <img src={dummyIcon} alt="Icon" />
                      </div>
                    ))}
                    <div className="psc-last-card-number">9+</div>
                  </div>
                  <div className="psc-last-card-btn">
                    <button type="button" onClick={() => navigate('/academia/courses')}>Explore Courses</button>
                  </div>
                </div>
              )}

              {!dataLoading && (!popularData || popularData.length === 0) && (
                <div className="swiper-slide psc-card psc-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                  <div className="empty-title">No popular courses yet</div>
                  <div className="empty-desc" style={{ marginBottom: '16px', color: '#64748B' }}>We couldn't find trending courses right now.</div>
                  <button type="button" className="empty-cta btn btn-primary" onClick={() => navigate('/academia/courses')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                    Browse all courses
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
              <div key={course.id || course._id || i} className="osc-item" onClick={() => navigate(`/academia/course-part?courseId=${course.id}`)} style={{ cursor: 'pointer' }}>
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
                    <p>{course.description || course.summary || 'No description available.'}</p>
                  </div>
                  <div>
                    <small>{course.starts_on || course.startsAt || 'Self-paced'}</small>
                    <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/academia/course-part?courseId=${course.id}`); }}>
                      <img src={acEnIcon} alt="Enroll" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/academia/courses')}>
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
              <div key={course.id || course._id || i} className="fsc-item" onClick={() => navigate(`/academia/course-part?courseId=${course.id}`)} style={{ cursor: 'pointer' }}>
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
                <button type="button" className="btn btn-primary" onClick={() => navigate('/academia/courses')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
                  Explore all courses
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="sec-CTA">
          <button type="button" onClick={() => navigate('/academia/courses?type=free')}>
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
              <h4>Get access to millions of research papers and stay informed with the important topics around the world.</h4>
            </div>
            <div>
              <button type="button" onClick={() => navigate('/academia/journals')}>
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
                    <div className="ss-item" onClick={() => navigate(`/academia/read-story?id=${story.id || story._id}`)} style={{ cursor: 'pointer' }}>
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
                      <button type="button" className="empty-cta btn btn-primary" onClick={() => navigate('/academia/watch')} style={{ background: '#450468', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>
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
          <button type="button" onClick={() => navigate('/academia/watch')}>
            <span>View More</span>
            <img src={acNextIcon} alt="Next" />
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-sec">
        <div className="sec-h">
          <p>Testimonials</p>
          <h1>Our Successful stories</h1>
        </div>
        <div className="testimonials-sec-contents">
          <div className="swiper tsc-swiper">
            <div className="swiper-wrapper">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="swiper-slide tsc-card">
                  <div className="tsc-card-h">
                    <div className="tsc-card-h-l">
                      <img src={profImg} alt="User" />
                    </div>
                    <div className="tsc-card-h-r">
                      <h5>Roger Scott</h5>
                      <p>Student</p>
                    </div>
                  </div>
                  <div className="tsc-card-text">
                    <p>"The courses here completely transformed my career path. The instructors are incredibly knowledgeable and the platform is so easy to use."</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-pagination tsc-pages"></div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-sec">
        <div className="newsletter-sec-l">
          <h3>Newsletter - Stay tuned and get the latest updates</h3>
          <p>Join thousands of learners receiving weekly updates on new courses and research.</p>
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
        </div>
      </section>
    </div>
  );
}

export default AcademiaIndex;