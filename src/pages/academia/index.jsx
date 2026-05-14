import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// Import icons
import acPlusIcon from '../../assets/icons/ac-plus.svg';
import bookOpenIcon from '../../assets/icons/book-open.svg';
import ac1Icon from '../../assets/icons/ac-1.svg';
import ac2Icon from '../../assets/icons/ac-2.svg';
import ac3Icon from '../../assets/icons/ac-3.svg';
import acStat1Icon from '../../assets/icons/ac-stat1.svg';
import acStat2Icon from '../../assets/icons/ac-stat2.svg';
import acStat3Icon from '../../assets/icons/ac-stat3.svg';
import acStat4Icon from '../../assets/icons/ac-stat4.svg';
import acWshIcon from '../../assets/icons/ac-wsh.svg';
import acP1Icon from '../../assets/icons/ac-p1.svg';
import dummyIcon from '../../assets/icons/dummy.svg';
import acNextIcon from '../../assets/icons/ac-next.svg';
import acEnIcon from '../../assets/icons/ac-en.svg';
import acLIcon from '../../assets/icons/ac-l.svg';
import rwLIcon from '../../assets/icons/rw-l.svg';
import acAcaIcon from '../../assets/icons/ac-aca.svg';
import acAca2Icon from '../../assets/icons/ac-aca2.svg';
import acAca3Icon from '../../assets/icons/ac-aca3.svg';
import acAca4Icon from '../../assets/icons/ac-aca4.svg';
import acNnexIcon from '../../assets/icons/ac-nnex.svg';
import acUsIcon from '../../assets/icons/ac-us.svg';
import acMessIcon from '../../assets/icons/ac-mess.svg';
import acCalIcon from '../../assets/icons/ac-cal.svg';
import acShareIcon from '../../assets/icons/ac-share.svg';
import acSmsIcon from '../../assets/icons/ac-sms.svg';
import acSendIcon from '../../assets/icons/ac-send.svg';

// Import images
import acaImg from '../../assets/imgs/aca.png';
import jrImg from '../../assets/imgs/jr.jpg';
import acOnImg from '../../assets/imgs/ac-on.jpg';
import acStrImg from '../../assets/imgs/ac-str.jpg';
import profImg from '../../assets/imgs/prof.jpg';

import './index.css';

function AcademiaIndex() {
  const swiperInstancesRef = useRef([]);

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
        <div className="swiper journalsSwiper">
          <div className="swiper-wrapper">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="swiper-slide">
                <div className="js-item" onClick={() => window.location.href = '/academia/read-story'} style={{ cursor: 'pointer' }}>
                  <div className="js-item-img">
                    <img src={jrImg} alt="Journal Image" />
                  </div>
                  <div className="js-item-text">
                    <h6>Rwanda Unleashed Americans - 23 year old Justine Byiringiro eliminates americans over 230KM per hour, winning gold medal 2028</h6>
                    <div>
                      <span>Oct 19, 2025 07:50 AM</span>
                      <button>
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="swiper-slide psc-card">
                  <div className="psc-card-h">
                    <div className="psc-card-h-l">
                      <h5>Economics</h5>
                      <p>
                        <span>11.34M</span>
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
                      <h6>11.34M</h6>
                      <p>Authors</p>
                    </div>
                    <div className="psc-card-b-item">
                      <h6>234K</h6>
                      <p>Learners</p>
                    </div>
                    <div className="psc-card-b-item">
                      <h6>23K</h6>
                      <p>Papers</p>
                    </div>
                  </div>
                  <div className="psc-card-f">
                    <button onClick={() => window.location.href = '/academia/course-part'}>View courses</button>
                  </div>
                </div>
              ))}
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
        </div>
      </section>

      {/* Online Courses Section */}
      <section className="online-sec">
        <div className="sec-h">
          <p>Courses</p>
          <h1>Online Courses</h1>
        </div>
        <div className="online-sec-contents">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="osc-item" onClick={() => window.location.href = '/academia/course-part'} style={{ cursor: 'pointer' }}>
              <div className="osc-item-img">
                <img src={acOnImg} alt="Online Course" />
              </div>
              <div className="osc-item-text">
                <div className="osc-item-text-float">
                  <p>$5 / Per Month</p>
                </div>
                <div>
                  <h6>Software Development</h6>
                  <small>Emma Furgreance</small>
                </div>
                <div>
                  <p>Learn the fundamentals of software development and build your first application.</p>
                </div>
                <div>
                  <small>Starts : Jan 4th 2026</small>
                  <button onClick={(e) => { e.stopPropagation(); window.location.href = '/academia/course-part'; }}>
                    <img src={acEnIcon} alt="Enroll" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="fsc-item" onClick={() => window.location.href = '/academia/course-part'} style={{ cursor: 'pointer' }}>
              <div className="fsc-item-img">
                <img src={acOnImg} alt="Free Course" />
              </div>
              <div className="fsc-item-text">
                <h6>Software Development</h6>
                <small>Emma Furgreance</small>
              </div>
            </div>
          ))}
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
          <div className="swiper ss-swiper">
            <div className="swiper-wrapper">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="swiper-slide">
                  <div className="ss-item" onClick={() => window.location.href = '/academia/read-story'} style={{ cursor: 'pointer' }}>
                    <div className="ss-item-img">
                      <img src={acStrImg} alt="Story Image" />
                    </div>
                    <div className="ss-item-text">
                      <div className="ss-item-text-h">
                        <div>
                          <img src={acUsIcon} alt="User" />
                          <span>Admin</span>
                        </div>
                        <div>
                          <img src={acMessIcon} alt="Messages" />
                          <span>3</span>
                        </div>
                      </div>
                      <h4>Build your dream software & engineering career</h4>
                      <p>A small river named Duden flows by their place and supplies it with the necessary regelialia.</p>
                      <div className="ss-item-text-f">
                        <div>
                          <img src={acCalIcon} alt="Calendar" />
                          <span>Oct 19, 2025 07:50 AM</span>
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
