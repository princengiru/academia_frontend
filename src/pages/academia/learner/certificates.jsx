import React from 'react';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../../assets/imgs/prof.jpg';
import badge1 from '../../../assets/icons/badge-1.svg';
import searchIcon from '../../../assets/icons/search.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import resumeIcon from '../../../assets/icons/resume.svg';
import downloadIcon from '../../../assets/icons/download.svg';
import playIcon from '../../../assets/icons/play.svg';
import acEye from '../../../assets/icons/ac-eye.svg';
import acShare from '../../../assets/icons/ac-share.svg';
import acLe2 from '../../../assets/icons/ac-le2.svg';
import acRi from '../../../assets/icons/ac-ri.svg';
import './certificates.css';

function LearnersCertificates() {
  const preventDefault = (e) => e.preventDefault();

  const apexProfile = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: profImg,
    status: 'Active',
    projects: '6',
  };

  const slateSummary = [
    { value: '6', label: 'Total Certificates' },
    { value: '0', label: 'This Month', delta: '-4.5%', delta_class: 'is-negative' },
    { value: '65.2%', label: 'Average Score', delta: '+4.1', delta_class: 'is-positive' },
    { value: '8d 4h 3m', label: 'Learning Time' },
  ];

  const genesisOptions = ['This Month', 'Last Month', 'This Year', 'All Time'];

  const zenithCerts = [
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'In Progress',
      status_class: 'is-progress',
      primary_action: 'Resume',
      primary_icon: resumeIcon,
    },
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'Passed',
      status_class: 'is-passed',
      primary_action: 'Download',
      primary_icon: downloadIcon,
    },
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'Failed',
      status_class: 'is-failed',
      primary_action: 'Retake',
      primary_icon: playIcon,
    },
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'Passed',
      status_class: 'is-passed',
      primary_action: 'Download',
      primary_icon: downloadIcon,
    },
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'Passed',
      status_class: 'is-passed',
      primary_action: 'Download',
      primary_icon: downloadIcon,
    },
    {
      title: 'Web Development',
      date: 'Completed on Jan 20, 2026',
      score: '89.9%',
      questions: '50',
      time: '1h 7min',
      status: 'Passed',
      status_class: 'is-passed',
      primary_action: 'Download',
      primary_icon: downloadIcon,
    },
  ];

  return (
    <LearnersPageShell
      title="My Certificates"
      description="Learners certificates layout scaffold."
    >
      <section className="learners-certificates-page">
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={apexProfile.avatar} alt={apexProfile.name} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{apexProfile.name}</h1>
                <span className="learners-projects-status-badge">{apexProfile.status}</span>
                <span className="learners-projects-count-badge">
                  <img src={badge1} alt="Badge" />
                  <span>{apexProfile.projects}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{apexProfile.role}</span>
                <span>&bull;</span>
                <span>{apexProfile.email}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-primary-btn" onClick={preventDefault}>
              Earn certificates
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={preventDefault}>
              View Profile
            </button>
          </div>
        </section>

        <section className="learners-certificates-summary">
          {slateSummary.map((husk, idx) => (
            <article key={idx} className="learners-certificates-summary-card">
              <strong>{husk.value}</strong>
              <div className="learners-certificates-summary-meta">
                <span>{husk.label}</span>
                {husk.delta && (
                  <small className={husk.delta_class}>{husk.delta}</small>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="learners-certificates-section-head">
          <div>
            <h2>My Certificates</h2>
            <p>100 Courses Available to learn</p>
          </div>

          <div className="learners-certificates-filters">
            <label className="learners-certificates-search">
              <img src={searchIcon} alt="Search" />
              <input type="search" placeholder="Search any projects..." />
            </label>

            <div className="dropdown learners-certificates-filter-dropdown">
              <button 
                className="dropdown-toggle learners-certificates-filter-btn" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <span>This Month</span>
                <img src={drop1} alt="Dropdown" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end learners-certificates-filter-menu">
                {genesisOptions.map((huskOption, idx) => (
                  <li key={idx}>
                    <a 
                      className={`dropdown-item ${idx === 0 ? 'active' : ''}`} 
                      href="/" 
                      onClick={preventDefault}
                    >
                      {huskOption}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="learners-certificates-grid">
          {zenithCerts.map((husk, idx) => (
            <article key={idx} className="learners-certificate-card">
              <div className="learners-certificate-card-banner">
                <div className="learners-certificate-card-badge-pill">
                  <span>98.1%</span>
                </div>
                <div className="learners-certificate-card-banner-copy">
                  <span>Proudly presented to</span>
                  <h3>Dear, {apexProfile.name}</h3>
                </div>
              </div>

              <div className="learners-certificate-card-body">
                <div className="learners-certificate-card-title-block">
                  <h4>{husk.title}</h4>
                  <p>{husk.date}</p>
                </div>

                <div className="learners-certificate-card-stats">
                  <div>
                    <strong>{husk.score}</strong>
                    <span>Score</span>
                  </div>
                  <div>
                    <strong>{husk.questions}</strong>
                    <span>Questions</span>
                  </div>
                  <div>
                    <strong>{husk.time}</strong>
                    <span>Time</span>
                  </div>
                  <div>
                    <p className={`learners-certificate-status ${husk.status_class}`}>
                      {husk.status}
                    </p>
                    <span>Status</span>
                  </div>
                </div>

                <div className="learners-certificate-card-actions">
                  <button type="button" className="is-primary" onClick={preventDefault}>
                    <img src={acEye} alt="View" />
                    <span>View</span>
                  </button>
                  <button type="button" onClick={preventDefault}>
                    <img src={husk.primary_icon} alt={husk.primary_action} />
                    <span>{husk.primary_action}</span>
                  </button>
                  <button type="button" onClick={preventDefault}>
                    <img src={acShare} alt="Share" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="learners-certificates-pagination">
          <button type="button" onClick={preventDefault} aria-label="Previous page">
            <img src={acLe2} alt="Previous" />
          </button>
          <span>1</span>
          <span className="active">2</span>
          <span>...</span>
          <button type="button" onClick={preventDefault} aria-label="Next page">
            <img src={acRi} alt="Next" />
          </button>
        </div>
      </section>
    </LearnersPageShell>
  );
}

export default LearnersCertificates;
