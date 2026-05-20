import React from 'react';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import acSav from '../../../assets/icons/ac-sav.svg';
import wExitRight from '../../../assets/icons/w-exit-right.svg';
import acFf from '../../../assets/icons/ac-ff.svg';
import acFi from '../../../assets/icons/ac-fi.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import acPlus from '../../../assets/icons/ac-plus.svg';
import acLock from '../../../assets/icons/ac-lock.svg';
import './available-test.css';

function LearnersAvailableTest() {
  const preventDefault = (e) => e.preventDefault();

  const slate = [
    {
      id: 1,
      title: 'Web Development',
      level: 'Beginner',
      levelTone: 'beginner',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet.',
      questions: '4',
      minutes: '50',
      attempts: '0',
      score: '80%',
    },
    {
      id: 2,
      title: 'Web Development',
      level: 'Intermediate',
      levelTone: 'intermediate',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet.',
      questions: '4',
      minutes: '20',
      attempts: '0',
      score: '70%',
    },
    {
      id: 3,
      title: 'Web Development',
      level: 'Beginner',
      levelTone: 'beginner',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit...',
      questions: '4',
      minutes: '50',
      attempts: '0',
      score: '80%',
    },
    {
      id: 4,
      title: 'Web Development',
      level: 'Advanced',
      levelTone: 'advanced',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit...',
      questions: '4',
      minutes: '20',
      attempts: '0',
      score: '70%',
    },
    {
      id: 5,
      title: 'Web Development',
      level: 'Advanced',
      levelTone: 'advanced',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit...',
      questions: '4',
      minutes: '20',
      attempts: '0',
      score: '70%',
    },
    {
      id: 6,
      title: 'Web Development',
      level: 'Intermediate',
      levelTone: 'intermediate',
      author: 'Emma fruty',
      summary: 'Lorem ipsum dolor sit amet, dipisi consectetur adipisicing elit ipsum dolor sit amet, dipisi consectetur adipisicing elit...',
      questions: '4',
      minutes: '20',
      attempts: '0',
      score: '70%',
    },
  ];

  const genesis = [
    { id: 1, title: 'Linear Algebra', icon: acPlus },
    { id: 2, title: 'Abstract Algebra', icon: acLock },
    { id: 3, title: 'Abstract Algebra', icon: acPlus },
    { id: 4, title: 'Abstract Algebra', icon: acLock },
    { id: 5, title: 'Abstract Algebra', icon: acPlus },
    { id: 6, title: 'Abstract Algebra', icon: acLock },
    { id: 7, title: 'Abstract Algebra', icon: acLock },
  ];

  return (
    <LearnersPageShell
      title="Available Test"
      description="Learners available test layout scaffold."
    >
      <section className="learners-available-test-page">
        <section className="learners-home-title">
          <div className="learners-home-title-top">
            <h1>Available Test</h1>

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
              <input type="search" placeholder="Search any projects..." aria-label="Search courses" />

              <div className="div-h-r-s-f">
                <button type="button" className="active" onClick={preventDefault}>Free</button>
                <button type="button" onClick={preventDefault}>Paid</button>

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

        <section className="learners-available-test-layout">
          <div className="learners-available-test-main">
            <div className="learners-available-test-head">
              <div>
                <h2>Earn Certificates</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-available-test-grid">
              {slate.map((husk) => (
                <article key={husk.id} className="learners-available-test-card">
                  <div className="learners-available-test-card-top">
                    <h3>{husk.title}</h3>
                    <span className={`learners-available-test-level is-${husk.levelTone}`}>
                      {husk.level}
                    </span>
                  </div>

                  <p className="learners-available-test-author">Prepared by {husk.author}</p>
                  <p className="learners-available-test-summary">{husk.summary}</p>

                  <div className="learners-available-test-metrics">
                    <div>
                      <strong>{husk.questions}</strong>
                      <span>Questions</span>
                    </div>
                    <div>
                      <strong>{husk.minutes}</strong>
                      <span>Minutes</span>
                    </div>
                    <div>
                      <strong>{husk.attempts}</strong>
                      <span>Attempts</span>
                    </div>
                    <div>
                      <strong>{husk.score}</strong>
                      <span>Min. Score</span>
                    </div>
                  </div>

                  <button type="button" className="learners-available-test-cta" onClick={preventDefault}>
                    Enroll Test
                  </button>
                </article>
              ))}
            </div>

            <div className="learners-available-test-pagination">
              <button type="button" onClick={preventDefault} aria-label="Previous page">
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
              <button type="button" onClick={preventDefault} aria-label="Next page">
                <img src={acRi} alt="Next" />
              </button>
            </div>
          </div>

          <aside className="learners-available-test-side">
            <div className="learners-available-test-head learners-available-test-head-side">
              <div>
                <h2>Syllabus</h2>
                <p>Course Available to research</p>
              </div>
              <a href="/" onClick={preventDefault}>See All</a>
            </div>

            <div className="learners-available-syllabus-list">
              {genesis.map((husk) => (
                <div key={husk.id} className="learners-available-syllabus-item">
                  <div className="learners-available-syllabus-copy">
                    <h4>{husk.title}</h4>
                    <p>
                      <span>14 Papers</span>
                      <span>|</span>
                      <span>11 Followers</span>
                    </p>
                  </div>

                  <button type="button" className="learners-available-syllabus-follow" onClick={preventDefault}>
                    <span>Follow</span>
                    <img src={husk.icon} alt={husk.title} />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersAvailableTest;
