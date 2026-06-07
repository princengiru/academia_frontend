import { useEffect, useRef, useState } from 'react';
import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// Import icons
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

// Import images
import acaImg from '../../../assets/imgs/aca.png';
import jrImg from '../../../assets/imgs/jr.jpg';
import acOnImg from '../../../assets/imgs/ac-on.jpg';
import acStrImg from '../../../assets/imgs/ac-str.jpg';
import profImg from '../../../assets/imgs/prof.jpg';

import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const resolveStoryImage = (value) => {
  if (!value) return null;

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  return `${API_BASE_URL}${value}`;
};

function AcademiaIndex() {
  const swiperInstancesRef = useRef([]);
  const [journalsData, setJournalsData] = useState([]);
  const [popularData, setPopularData] = useState([]);
  const [freeData, setFreeData] = useState([]);
  const [storiesData, setStoriesData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    swiperInstancesRef.current.forEach((instance) => instance?.destroy(true, true));

    // Initialize Swiper for journals
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
        0: {
            slidesPerView: 1.2,
        },
        768: {
            slidesPerView: 3,
        },
        1200: {
            slidesPerView: 3,
        },
      },
      navigation: {
        nextEl: '.journalsSwiper .swiper-button-next',
        prevEl: '.journalsSwiper .swiper-button-prev',
      },
    });

    // Initialize Swiper for popular courses
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

    // Initialize Swiper for testimonials
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
  }, []);

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
        setPopularData(Array.isArray(popularBody?.data) ? popularBody.data : (Array.isArray(popularBody) ? popularBody : []));
        setFreeData(Array.isArray(freeBody?.data) ? freeBody.data : (Array.isArray(freeBody) ? freeBody : []));
      } catch (err) {
        // keep defaults on error
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    loadPublicData();

    return () => { mounted = false; };
  }, []);

  const stats = [
    { icon: acStat1Icon, value: '20,000+', label: 'Enrolled Students' },
    { icon: acStat2Icon, value: '20,000+', label: 'Trusted Tutors' },
    { icon: acStat3Icon, value: '20,000+', label: 'Schedules' },
    { icon: acStat4Icon, value: '20,000+', label: 'Courses' },
  ];

  const features = [
    { icon: ac1Icon, title: 'Online Courses', desc: 'Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.' },
    { icon: ac2Icon, title: 'Earn Certificates', desc: 'Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.' },
    { icon: ac3Icon, title: 'Learn with Expert', desc: 'Your transactions are protected with top-grade encryption — safe, fast, and hassle-free.' },
  ];

  const whyChoose = [
    { icon: acAca2Icon, title: 'Expert & experienced instructors', desc: 'Our instructors are experts in their fields and have years of experience teaching.' },
    { icon: acAca3Icon, title: 'Lifetime free access', desc: 'Our instructors are experts in their fields and have years of experience teaching.' },
    { icon: acAca4Icon, title: 'Dedicated support', desc: 'Our instructors are experts in their fields and have years of experience teaching.' },
  ];

  return (
    <div className="academia-page">
      {/* Hero Section */}
      <section className="hero-sec">
        <div className="hero-sec-inner">
          <div className="hero-sec-inner-top">
            <div className="hero-sec-inner-l">
              <img src={acaImg} alt="Academia Image" />
            </div>
            <div className="hero-sec-inner-r">
              <div className="hero-sec-inner-r-t">
                <button onClick={() => window.location.href = '/academia/journals'}>
                  <img src={acPlusIcon} alt="Plus Icon" />
                  <span>Post your project</span>
                </button>
                <button onClick={() => window.location.href = '/academia/courses'}>
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
              <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vero praesentium quasi architecto sapiente officia consectetur blanditiis doloribus odit quo distinctio nostrum laborum, dignissimos nam repellat? Animi adipisci quam odit ad.</p>
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

      {/* Journals Section */}
      <section className="journals-sec">
        <div className="sec-h">
          <p>Orientation Guide projects</p>
          <h1>All Courses & Journals</h1>
        </div>
        {dataLoading || (journalsData && journalsData.length > 0) ? (
          <div className="swiper journalsSwiper">
            <div className="swiper-wrapper">
              {dataLoading && (
                <div className="swiper-slide">
                  <div className="ss-item ss-empty">
                    <div className="ss-item-text">
                      <div className="empty-title">Loading stories…</div>
                      <div className="empty-desc">Fetching inspiring community stories.</div>
                    </div>
                  </div>
                </div>
              )}

              {!dataLoading && journalsData && journalsData.length > 0 && (
                journalsData.map((story, i) => (
                  <div key={story.id || story._id || i} className="swiper-slide">
                    <div className="js-item" onClick={() => window.location.href = '/academia/read-story'} style={{ cursor: 'pointer' }}>
                      <div className="js-item-img">
                        <img src={story.thumbnail ? (story.thumbnail.startsWith('http') ? story.thumbnail : `${API_BASE_URL}${story.thumbnail}`) : jrImg} alt="Journal Image" />
                      </div>
                      <div className="js-item-text">
                        <h6>{story.title || story.heading || story.summary || 'Story'}</h6>
                        <div>
                          <span>{new Date(story.published_at || story.created_at || Date.now()).toLocaleString()}</span>
                          <button>
                            <img src={acWshIcon} alt="Share" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="swiper-button-next js-btn"></div>
            <div className="swiper-button-prev js-btn"></div>
          </div>
        ) : (
          <div className="ss-item ss-empty">
            <div className="ss-item-text">
              <div className="empty-title">No stories yet</div>
              <div className="empty-desc">Be the first to share a story with the community.</div>
              <a className="empty-cta" href="/academia/stories">Share a story</a>
            </div>
          </div>
        )}
      </section>

      {/* Popular Courses Section */}
      <section className="popular-sec">
        <div className="sec-h">
          <p>Explore our top research interests</p>
          <h1>Popular Courses</h1>
        </div>
        <div className="popular-sec-contents">
          {dataLoading || (popularData && popularData.length > 0) ? (
            <div className="swiper psc-swiper">
              <div className="swiper-wrapper">
                {dataLoading && (
                  <div className="swiper-slide psc-card">
                    <div className="psc-card-h">
                      <div className="psc-card-h-l">
                        <h5>Loading popular courses...</h5>
                        <p>Please wait</p>
                      </div>
                      <div className="psc-card-h-r" />
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
                            <span>{course.followers || course.enrollments || '---'}</span>
                            <small>Followers</small>
                          </p>
                        </div>
                        <div className="psc-card-h-r">
                          <button>
                            <span>Follow</span>
                            <img src={acP1Icon} alt="Plus" />
                          </button>
                        </div>
                      </div>
                      <div className="psc-card-b">
                        <div className="psc-card-b-item">
                          <h6>{course.instructors_count || course.authors || '—'}</h6>
                          <p>Authors</p>
                        </div>
                        <div className="psc-card-b-item">
                          <h6>{course.learners_count || course.enrolled_count || '—'}</h6>
                          <p>Learners</p>
                        </div>
                        <div className="psc-card-b-item">
                          <h6>{course.papers_count || course.resources_count || '—'}</h6>
                          <p>Papers</p>
                        </div>
                      </div>
                      <div className="psc-card-f">
                        <button onClick={() => window.location.href = '/academia/course-part'}>View courses</button>
                      </div>
                    </div>
                  ))
                )}

                <div className="swiper-slide psc-last-card">
                  <h3>1000+ Popular course</h3>
                  <div className="psc-last-card-imgs">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="psc-last-card-img">
                        <img src={dummyIcon} alt="Icon" />
                      </div>
                    ))}
                    <div className="psc-last-card-number">9+</div>
                  </div>
                  <div className="psc-last-card-btn">
                    <button onClick={() => window.location.href = '/academia/courses'}>Explore Courses</button>
                  </div>
                </div>
              </div>
              <div className="swiper-pagination psc-pages"></div>
            </div>
          ) : (
            <div className="psc-card psc-empty">
              <div className="psc-card-h">
                <div className="psc-card-h-l">
                  <div className="empty-title">No popular courses yet</div>
                  <div className="empty-desc">We couldn't find trending courses right now.</div>
                  <a className="empty-cta" href="/academia/courses">Browse courses</a>
                </div>
                <div className="psc-card-h-r" />
              </div>
            </div>
          )}
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
            <div className="osc-item osc-empty">
              <div className="osc-item-text">
                <div className="empty-title">Loading courses…</div>
                <div className="empty-desc">Fetching the best courses for you.</div>
              </div>
            </div>
          )}

          {!dataLoading && popularData && popularData.length > 0 && (
            popularData.slice(0, 4).map((course, i) => (
              <div key={course.id || course._id || i} className="osc-item" onClick={() => window.location.href = '/academia/course-part'} style={{ cursor: 'pointer' }}>
                <div className="osc-item-img">
                  <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`) : acOnImg} alt="Online Course" />
                </div>
                <div className="osc-item-text">
                  <div className="osc-item-text-float">
                    <p>{course.price ? `${course.price} / Per Month` : '$0 / Per Month'}</p>
                  </div>
                  <div>
                    <h6>{course.title || course.name || 'Course'}</h6>
                    <small>{course.instructor_name || course.author || 'Instructor'}</small>
                  </div>
                  <div>
                    <p>{course.description || course.summary || 'No description available.'}</p>
                  </div>
                  <div>
                    <small>{course.starts_on || course.startsAt || 'Starts : TBD'}</small>
                    <button onClick={(e) => { e.stopPropagation(); window.location.href = '/academia/course-part'; }}>
                      <img src={acEnIcon} alt="Enroll" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {!dataLoading && (!popularData || popularData.length === 0) && (
            <div className="fsc-item fsc-empty">
              <div className="fsc-item-text">
                <div className="empty-title">No free courses</div>
                <div className="empty-desc">Check back later or explore paid courses.</div>
                <a className="empty-cta" href="/academia/courses">Explore courses</a>
              </div>
            </div>
          )}
        </div>
        <div className="sec-CTA">
          <button onClick={() => window.location.href = '/academia/courses'}>
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
            <div className="fsc-item fsc-empty">
              <div className="fsc-item-text">
                <h6>Loading free courses...</h6>
                <p>Please wait while we load free courses.</p>
              </div>
            </div>
          )}

          {!dataLoading && freeData && freeData.length > 0 && (
            freeData.map((course, i) => (
              <div key={course.id || course._id || i} className="fsc-item" onClick={() => window.location.href = '/academia/course-part'} style={{ cursor: 'pointer' }}>
                <div className="fsc-item-img">
                  <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`) : acOnImg} alt="Free Course" />
                </div>
                <div className="fsc-item-text">
                  <h6>{course.title || course.name || 'Course'}</h6>
                  <small>{course.instructor_name || course.author || 'Instructor'}</small>
                </div>
              </div>
            ))
          )}

          {!dataLoading && (!freeData || freeData.length === 0) && (
            <div className="fsc-item fsc-empty">
              <div className="fsc-item-text">
                <h6>No free courses</h6>
                <p>There are no free courses to show at the moment.</p>
              </div>
            </div>
          )}
        </div>
        <div className="sec-CTA">
          <button onClick={() => window.location.href = '/academia/courses?type=free'}>
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
              <button onClick={() => window.location.href = '/academia/journals'}>
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
          {dataLoading || (storiesData && storiesData.length > 0) ? (
            <div className="swiper ss-swiper">
              <div className="swiper-wrapper">
                {dataLoading && (
                  <div className="swiper-slide">
                    <div className="js-item js-empty">
                      <div className="js-item-text">
                        <h4>Loading stories…</h4>
                        <p>Fetching the latest community stories.</p>
                      </div>
                    </div>
                  </div>
                )}

                {!dataLoading && storiesData && storiesData.length > 0 && (
                  storiesData.map((story, i) => (
                    <div key={story.id || story._id || i} className="swiper-slide">
                      <div className="ss-item" onClick={() => window.location.href = `/academia/read-story?id=${story.id || story._id}` } style={{ cursor: 'pointer' }}>
                        <div className="ss-item-img">
                          {resolveStoryImage(story.thumbnail) ? <img src={resolveStoryImage(story.thumbnail)} alt="Story Image" /> : null}
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
                          <p>{story.excerpt || story.summary || (story.content ? (story.content.substring(0, 120) + '...') : 'No description')}</p>
                          <div className="ss-item-text-f">
                            <div>
                              <img src={acCalIcon} alt="Calendar" />
                              <span>{new Date(story.published_at || story.created_at || Date.now()).toLocaleString()}</span>
                            </div>
                            <button>
                              <img src={acShareIcon} alt="Share" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="swiper-button-next ss-btn"></div>
              <div className="swiper-button-prev ss-btn"></div>
            </div>
          ) : (
            <div className="js-item js-empty">
              <div className="js-item-text">
                <h4>No community stories</h4>
                <p>There are no community stories published yet.</p>
                <a className="empty-cta" href="/academia/watch">Explore stories</a>
              </div>
            </div>
          )}
        </div>
        <div className="sec-CTA">
          <button onClick={() => window.location.href = '/academia/watch'}>
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
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
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
          <h3>Newsletter - Stay tune and get the latest update</h3>
          <p>Far far away, behind the word mountains</p>
        </div>
        <div className="newsletter-sec-r">
          <form>
            <img src={acSmsIcon} alt="Message" className="ac-sms" />
            <input type="email" placeholder="Enter email address" />
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

