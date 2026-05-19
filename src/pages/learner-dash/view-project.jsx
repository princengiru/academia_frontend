import React, { useState } from 'react';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../assets/imgs/prof.jpg';
import acJrImg from '../../assets/imgs/ac-jr.jpg';
import acOnImg from '../../assets/imgs/ac-on.jpg';
import d1Img from '../../assets/imgs/d1.jpg';
import acHrImg from '../../assets/imgs/ac-hr.jpg';
import badge1 from '../../assets/icons/badge-1.svg';
import exitDown from '../../assets/icons/exit-down.svg';
import acLe from '../../assets/icons/ac-le.svg';
import acSd1 from '../../assets/icons/ac-sd1.svg';
import acShare from '../../assets/icons/ac-share.svg';
import acCom from '../../assets/icons/ac-com.svg';
import heartIcon from '../../assets/icons/heart.svg';
import acSav from '../../assets/icons/ac-sav.svg';
import acRep from '../../assets/icons/ac-rep.svg';
import popupClose from '../../assets/icons/popup-close.svg';
import acSee from '../../assets/icons/ac-see.svg';
import fileIcon from '../../assets/icons/file.svg';
import './view-project.css';

function LearnersViewProject() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const preventDefault = (e) => e.preventDefault();

  const apexProfile = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: profImg,
    status: 'Active',
    projects: '6',
  };

  const zenithProject = {
    title: 'Build your software & engineering dream career',
    subtitle: 'A portfolio-led product concept focused on collaborative learning, mentorship, and practical design systems.',
    image: acJrImg,
    abstract: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.',
    team: 'Team owners',
    engagement: [
      { label: 'Comments', value: '800', icon: acCom, active: true },
      { label: 'Likes', value: '47k', icon: heartIcon, active: false },
      { label: 'Saves', value: '900', icon: acSav, active: false },
    ],
    comments: [
      {
        name: 'Mr. Anderson',
        avatar: profImg,
        time: '1 Day ago',
        message: 'Long before you sit down to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?',
        posted: 'Apr 23, 2025',
      },
      {
        name: 'Mrs. Anderson',
        avatar: acOnImg,
        time: '1 Day ago',
        message: 'Nice Project',
        posted: 'Apr 23, 2025',
      },
      {
        name: 'Mrs. Anderson',
        avatar: acOnImg,
        time: '1 Day ago',
        message: 'Nice Project',
        posted: 'Apr 23, 2025',
      },
      {
        name: 'Mrs. Anderson',
        avatar: acOnImg,
        time: '1 Day ago',
        message: 'Nice Project',
        posted: 'Apr 23, 2025',
      },
      {
        name: 'Mrs. Anderson',
        avatar: acOnImg,
        time: '1 Day ago',
        message: 'Nice Project',
        posted: 'Apr 23, 2025',
      },
    ],
    tools: ['Adobe XD', 'Figma', 'HTML', 'CSS', 'React'],
    gallery: [
      { image: d1Img, alt: 'Project showcase 1', class: 'is-wide is-tall' },
      { image: acOnImg, alt: 'Project showcase 2', class: 'is-half' },
      { image: acJrImg, alt: 'Project showcase 3', class: 'is-half' },
      { image: acHrImg, alt: 'Project showcase 4', class: 'is-wide' },
    ],
  };

  const genesisCollaborators = [
    { name: 'Sheilah MUGABEKAZI', avatar: profImg },
    { name: 'Landry Perly', avatar: acOnImg },
  ];

  return (
    <LearnersPageShell
      title="View Project"
      description="Learners specific project view scaffold."
    >
      <section className="learners-view-project-page">
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
            <button type="button" className="learners-projects-primary-btn" onClick={() => setIsModalOpen(true)}>
              <span>Upload new project</span>
              <img src={exitDown} alt="Upload" />
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={preventDefault}>
              View Profile
            </button>
          </div>
        </section>

        <section className="learners-view-project-shell">
          <div className="learners-view-project-main">
            <div className="learners-view-project-head">
              <a href="/projects" className="learners-view-project-back" onClick={preventDefault}>
                <img src={acLe} alt="Back" />
                <span>Back to Projects</span>
              </a>
              <h2>{zenithProject.title}</h2>
              <p>{zenithProject.subtitle}</p>
            </div>

            <section className="learners-view-project-abstract-card">
              <h3>Abstract</h3>
              <p>{zenithProject.abstract}</p>

              <button type="button" className="learners-view-project-tools-toggle" onClick={preventDefault}>
                <span className="learners-view-project-tools-toggle-icon">
                  <img src={acSd1} alt="Tools" />
                </span>
                <span>Tools Used</span>
                <span className="learners-view-project-tools-toggle-caret"></span>
              </button>
            </section>

            <section className="learners-view-project-gallery" aria-label="Project gallery">
              {zenithProject.gallery.map((husk, idx) => (
                <div key={idx} className={`learners-view-project-gallery-item ${husk.class}`}>
                  <img src={husk.image} alt={husk.alt} />
                </div>
              ))}
            </section>
          </div>

          <aside className="learners-view-project-side">
            <section className="learners-view-project-comments-panel">
              <div className="learners-view-project-comments-head">
                <div>
                  <h3>{zenithProject.title}</h3>
                  <button type="button" className="learners-view-project-team-toggle" onClick={preventDefault}>
                    <span>1 {zenithProject.team}</span>
                    <span className="learners-view-project-team-caret"></span>
                  </button>
                </div>

                <button type="button" className="learners-view-project-share-btn" onClick={preventDefault} aria-label="Share project">
                  <img src={acShare} alt="Share" />
                </button>
              </div>

              <div className="learners-view-project-engagement-row">
                {zenithProject.engagement.map((husk, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    className={`learners-view-project-engagement-pill ${husk.active ? 'is-active' : ''}`} 
                    onClick={preventDefault}
                  >
                    <img src={husk.icon} alt={husk.label} />
                    <span>{husk.value} {husk.label}</span>
                  </button>
                ))}
              </div>

              <div className="learners-view-project-comments-list">
                {zenithProject.comments.map((husk, idx) => (
                  <article key={idx} className="learners-view-project-comment">
                    <div className="learners-view-project-comment-avatar">
                      <img src={husk.avatar} alt={husk.name} />
                    </div>

                    <div className="learners-view-project-comment-body">
                      <div className="learners-view-project-comment-meta">
                        <strong>{husk.name}</strong>
                        <span>{husk.time}</span>
                      </div>

                      <p>{husk.message}</p>

                      <div className="learners-view-project-comment-foot">
                        <button type="button" className="learners-view-project-comment-reply" onClick={preventDefault}>
                          <img src={acRep} alt="Reply" />
                          <span>Reply</span>
                        </button>
                        <span>Posted on <strong>{husk.posted}</strong></span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </section>

      {/* Upload Modal */}
      <div 
        className={`learners-upload-modal ${isModalOpen ? 'is-open' : ''}`} 
        id="learnersUploadModal" 
        aria-hidden={!isModalOpen}
      >
        <div className="learners-upload-modal__backdrop" onClick={() => setIsModalOpen(false)}></div>
        <div className="learners-upload-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="learnersUploadModalTitle">
          <div className="learners-upload-modal__header">
            <h2 id="learnersUploadModalTitle">Upload Project</h2>
            <button 
              type="button" 
              className="learners-upload-modal__close" 
              onClick={() => setIsModalOpen(false)} 
              aria-label="Close upload project modal"
            >
              <img src={popupClose} alt="Close" />
            </button>
          </div>

          <div className="learners-upload-modal__body">
            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectTitle">Title / Subject</label>
              <input id="learnersProjectTitle" type="text" placeholder="Engineering Project Site map" />
            </div>

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectAbstract">Abstract</label>
              <textarea id="learnersProjectAbstract" placeholder="Type something..."></textarea>
            </div>

            <div className="learners-upload-modal__field">
              <label htmlFor="learnersProjectCollaboration">Add Collaboration</label>
              <div className="learners-upload-modal__search">
                <img src={acSee} alt="Search" />
                <input id="learnersProjectCollaboration" type="text" placeholder="@ - name" />
              </div>
            </div>

            <div className="learners-upload-modal__chips">
              {genesisCollaborators.map((husk, idx) => (
                <div key={idx} className="learners-upload-modal__chip">
                  <img src={husk.avatar} alt={husk.name} />
                  <span>{husk.name}</span>
                  <button type="button" onClick={preventDefault} aria-label={`Remove ${husk.name}`}>
                    <img src={popupClose} alt="Remove" />
                  </button>
                </div>
              ))}
            </div>

            <label className="learners-upload-modal__dropzone" htmlFor="learnersProjectFiles">
              <span className="learners-upload-modal__dropzone-icon">
                <img src={fileIcon} alt="File" />
              </span>
              <span className="learners-upload-modal__dropzone-copy">
                <strong>Drop files here or click to upload.</strong>
                <span>Upload case files, if any.</span>
              </span>
            </label>
            <input id="learnersProjectFiles" className="learners-upload-modal__file" type="file" multiple />

            <button type="button" className="learners-upload-modal__submit" onClick={() => setIsModalOpen(false)}>
              Done
            </button>
          </div>
        </div>
      </div>
    </LearnersPageShell>
  );
}

export default LearnersViewProject;