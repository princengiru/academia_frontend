import React from 'react';

// Assets (kept as imports so bundler resolves them)
import acOn from '../../assets/imgs/ac-on.jpg';
import profImg from '../../assets/imgs/prof.jpg';
import fe1 from '../../assets/icons/fe1.svg';
import fe2 from '../../assets/icons/fe2.svg';
import fe3 from '../../assets/icons/fe3.svg';
import fe4 from '../../assets/icons/fe4.svg';
import fe5 from '../../assets/icons/fe5.svg';
import acCal from '../../assets/icons/ac-cal.svg';
import acUs from '../../assets/icons/ac-us.svg';
import acBook from '../../assets/icons/ac-book.svg';
import leTec from '../../assets/icons/le-tec.svg';
import arrowUpRight from '../../assets/icons/arrow-up-right.svg';
import playIcon from '../../assets/icons/play.svg';
import jo1 from '../../assets/icons/jo1.svg';
import dtiktok from '../../assets/icons/dtiktok.svg';
import dwhat from '../../assets/icons/dwhat.svg';
import dfaceb from '../../assets/icons/dfaceb.svg';
import dinstagram from '../../assets/icons/dinstagram.svg';
import acSms from '../../assets/icons/ac-sms.svg';
import acSend from '../../assets/icons/ac-send.svg';
import './course-part.css';

function CoursePart() {
  const courseMeta = {
    title: 'Cyber Security',
    author: 'Emmanuella Jean Marie Vianney',
    authorImage: profImg,
    authorRole: 'Author',
    publishedOn: '12 Jan 2029',
    headline: 'Core Principles of Cybersecurity, Leadership and Oversight',
    summary:
      'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making.',
    image: acOn,
    duration: '4 weeks',
    weekly: '4 hours',
    level: 'Intermediate',
    price: '$5 Per month',
    discount: '-4% Off',
    intro:
      "Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data...",
    audience:
      'This course is ideal for cyber security engineers, service desk analysts, IT managers, and service desk managers looking to improve incident response skills, implement frameworks, and create practical CIRPs.',
  };

  const featureList = [
    { icon: fe1, label: '4 weeks' },
    { icon: fe2, label: '4 hours per week' },
    { icon: fe3, label: 'Digital certificate when eligible' },
    { icon: fe4, label: 'Intermediate level' },
    { icon: fe5, label: 'Project Feedbacks' },
  ];

  const stats = [
    { label: 'Duration', value: '4 weeks', icon: acCal },
    { label: 'Weekly study', value: '4 hours', icon: acCal },
    { label: 'Skill Level', value: 'Intermediate', icon: acUs },
    { label: 'subscription', value: '$5 Per month', icon: acBook },
  ];

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const syllabusItems = [
    { id: '1', title: 'Introduction to Entire Course', image: acOn },
    { id: '2', title: 'What is Incident Management and Why is it Important?', image: acOn },
    { id: '3', title: 'Importance of a Mature IT Service Management Solution', image: acOn },
    { id: '4', title: 'Justifying the Effort and Cost', image: acOn },
    { id: '5', title: 'Documentation Management Frameworks', image: acOn },
  ];

  const outcomes = [
    'Describe the fundamentals of a cybersecurity major incident response process.',
    'Explain key industry frameworks (NIST and SANS).',
    'Develop your own cybersecurity major incident response plan.',
    'Test, measure, and improve your cybersecurity major incident management process.',
    'A certificate of achievement in cyber 100% legit',
  ];

  return (
    <section className="learners-course-part-page">
      <section className="learners-home-title">
        <div className="learners-home-title-top">
          <h1>Courses</h1>

          <div className="learners-home-title-actions">
            <a className="learners-btn learners-btn-secondary" href="#" onClick={(e) => e.preventDefault()}>
              <img src={fe1} alt="" />
              <span>Saved Library</span>
            </a>
            <a className="learners-btn learners-btn-primary" href="#" onClick={(e) => e.preventDefault()}>
              <span>Go to website</span>
              <img src={arrowUpRight} alt="" />
            </a>
          </div>
        </div>
      </section>

      <div className="filters-grid-b-h">
        <button type="button">
          <img src={acCal} alt="Left" />
        </button>
        <div>
          <p>Mathematics &amp; Science</p>
          <span>/</span>
          <span>Algebra</span>
          <span>/</span>
        </div>
      </div>

      <section className="learners-course-specific">
        <div className="learners-course-specific-head">
          <div>
            <h1>{courseMeta.title}</h1>
            <p>
              Prepared by <strong>{courseMeta.author}</strong>
            </p>
          </div>
        </div>

        <div className="learners-course-specific-grid">
          <div className="learners-course-specific-main">
            <section className="learners-course-specific-hero">
              <div className="learners-course-specific-hero-copy">
                <h2>{courseMeta.headline}</h2>
                <p>{courseMeta.summary}</p>
              </div>

              <div className="learners-course-specific-media-wrap">
                <div className="learners-course-specific-media">
                  <img src={courseMeta.image} alt={courseMeta.title} />
                </div>

                <div className="learners-course-specific-stats">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`learners-course-specific-stat${index === stats.length - 1 ? ' learners-course-specific-stat-price' : ''}`}
                    >
                      <div className="learners-course-specific-stat-top">
                        <img src={stat.icon} alt="" />
                        <span>{stat.label}</span>
                      </div>
                      <strong>{stat.value}</strong>
                      {index === stats.length - 1 && <small>{courseMeta.discount}</small>}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="learners-course-specific-section">
              <h3>Introduction</h3>
              <p>
                {courseMeta.intro} <a href="#" onClick={(e) => e.preventDefault()}>Read more</a>
              </p>
            </section>

            <section className="learners-course-specific-section learners-course-specific-syllabus-wrap">
              <h3>Syllabus</h3>

              <div className="learners-course-specific-syllabus-grid">
                <div className="learners-course-specific-weeks">
                  {weeks.map((week, wi) => (
                    <button key={week} type="button" className={`learners-course-week${wi === 0 ? ' active' : ''}`}>
                      <span>{week}</span>
                      {wi === 0 && <img src={arrowUpRight} alt="Current" />}
                    </button>
                  ))}
                </div>

                <div className="learners-course-specific-syllabus-list">
                  <div className="learners-course-specific-syllabus-intro">
                    <div className="learners-course-specific-step active">
                      <span className="learners-course-specific-step-icon" aria-hidden>
                        <img src={leTec} alt="" />
                      </span>
                    </div>
                    <div>
                      <h4>Basic understanding and breakdowns</h4>
                      <p>Learn new skills, pursue your interests or advance your career with our short online courses.</p>
                    </div>
                  </div>

                  {syllabusItems.map((item) => (
                    <article key={item.id} className="learners-course-specific-syllabus-item">
                      <div className="learners-course-specific-step">
                        <span>{item.id}</span>
                      </div>
                      <div className="learners-course-specific-syllabus-thumb">
                        <img src={item.image} alt={item.title} />
                      </div>
                      <div className="learners-course-specific-syllabus-copy">
                        <h4>{item.title}</h4>
                        <p>A platform for advertising businesses and services for corporate, academia, and individual users.</p>
                        <a className="learners-course-specific-syllabus-link" href="read-contents">
                          <span>Open course contents</span>
                          <img src={arrowUpRight} alt="Open course contents" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="learners-course-specific-section">
              <h3>Who is the course for?</h3>
              <p>{courseMeta.audience}</p>
            </section>

            <section className="learners-course-specific-section learners-course-specific-outcomes">
              <h3>What will you achieve?</h3>
              <p>By the end of the course, you'll be able to...</p>
              <ul>
                {outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="learners-course-specific-side">
            <div className="learners-course-specific-side-card">
              <h3>{courseMeta.headline}</h3>

              <div className="learners-course-specific-features">
                {featureList.map((f) => (
                  <div key={f.label} className="learners-course-specific-feature">
                    <img src={f.icon} alt="" />
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>

              <a className="learners-course-specific-cta learners-course-specific-cta-secondary" href="read-contents">
                <span>Course contents</span>
                <img src={playIcon} alt="Course contents" />
              </a>

              <button type="button" className="learners-course-specific-cta" onClick={(e) => e.preventDefault()}>
                <span>Join Today</span>
                <img src={jo1} alt="Join" />
              </button>
            </div>
          </aside>
        </div>

        <section className="learners-course-specific-author-card" aria-label="Course author">
          <div className="learners-course-specific-author-card-inner">
            <div className="learners-course-specific-author-avatar">
              <img src={courseMeta.authorImage} alt={courseMeta.author} />
            </div>

            <div className="learners-course-specific-author-copy">
              <h3>{courseMeta.author}</h3>
              <p className="learners-course-specific-author-role">{courseMeta.authorRole}</p>

              <div className="learners-course-specific-author-meta">
                <span>Published on</span>
                <span aria-hidden>|</span>
                <span>{courseMeta.publishedOn}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="learners-course-specific-newsletter" aria-label="Newsletter signup">
          <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-copy">
            <h3>Find the right course for you</h3>
            <p>See your personalised recommendations based on your interests and goals.</p>

            <div className="learners-course-specific-newsletter-socials">
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="TikTok">
                <img src={dtiktok} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="WhatsApp">
                <img src={dwhat} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">
                <img src={dfaceb} alt="" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
                <img src={dinstagram} alt="" />
              </a>
            </div>
          </div>

          <div className="learners-course-specific-newsletter-column learners-course-specific-newsletter-column-form">
            <h3>Stay tune and get the latest update</h3>
            <p>See your personalised recommendations based on your interests and goals.</p>

            <form className="learners-course-specific-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <img src={acSms} alt="" className="learners-course-specific-newsletter-mail" />
              <input type="email" placeholder="Enter email address" aria-label="Enter email address" />
              <button type="submit" aria-label="Submit email">
                <img src={acSend} alt="" />
              </button>
            </form>
          </div>
        </section>
      </section>
    </section>
  );
}

export default CoursePart;