import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../assets/imgs/prof.jpg';
import d1Img from '../../assets/imgs/d1.jpg';
import acOnImg from '../../assets/imgs/ac-on.jpg';
import acJrImg from '../../assets/imgs/ac-jr.jpg';
import badge1 from '../../assets/icons/badge-1.svg';
import exitDown from '../../assets/icons/exit-down.svg';
import acHer1 from '../../assets/icons/ac-her1.svg';
import acHer2 from '../../assets/icons/ac-her2.svg';
import heartIcon from '../../assets/icons/heart.svg';
import acEye from '../../assets/icons/ac-eye.svg';
import acLe2 from '../../assets/icons/ac-le2.svg';
import acRi from '../../assets/icons/ac-ri.svg';
import bPencil from '../../assets/icons/b-pencil.svg';
import leUe from '../../assets/icons/le-ue.svg';
import leEx from '../../assets/icons/le-ex.svg';
import leLo from '../../assets/icons/le-lo.svg';
import userIcon from '../../assets/icons/user.svg';
import leEm from '../../assets/icons/le-em.svg';
import popupClose from '../../assets/icons/popup-close.svg';
import acSee from '../../assets/icons/ac-see.svg';
import fileIcon from '../../assets/icons/file.svg';
import './projects.css';

function LearnersProjects() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const preventDefault = (e) => e.preventDefault();
  const handleViewProject = () => navigate('/learner/view-project');

  const apex = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: profImg,
    status: 'Active',
    projects: '6',
    availability: 'Available Now',
    location: 'Kigali, Rwanda',
    bio: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.',
    stats: [
      { label: 'Project Views', value: '1,345,780' },
      { label: 'Project Likes', value: '236,890' },
      { label: 'Project Feedbacks', value: '103,008' },
    ],
    skills: [
      'Adobe Illustrator',
      'Adobe Photoshop',
      'Coding Skills (CSS, HTML & REACT )',
      'Adobe InDesign',
    ],
  };

  const slate = [
    { id: 1, image: d1Img, author: 'Jose Carine', likes: '10.6K', views: '10.6K', heart: acHer2, title: 'Build your software & engineering dream career' },
    { id: 2, image: acOnImg, author: 'Team owners', likes: '11', views: '1.2K', heart: acHer1, title: 'Build your software & engineering dream career' },
    { id: 3, image: acJrImg, author: 'Jose Carine', likes: '11', views: '1.2K', heart: heartIcon, title: 'Build your software & engineering dream career' },
    { id: 4, image: d1Img, author: 'Jose Carine', likes: '10.6K', views: '10.6K', heart: acHer2, title: 'Build your software & engineering dream career' },
    { id: 5, image: acOnImg, author: 'Team owners', likes: '11', views: '1.2K', heart: acHer1, title: 'Build your software & engineering dream career' },
    { id: 6, image: acJrImg, author: 'Jose Carine', likes: '11', views: '1.2K', heart: heartIcon, title: 'Build your software & engineering dream career' },
  ];

  const genesis = [
    { id: 1, name: 'Sheilah MUGABEKAZI', avatar: profImg },
    { id: 2, name: 'Landry Perly', avatar: acOnImg },
  ];

  return (
    <LearnersPageShell
      title="My Projects"
      description="Learners projects layout scaffold."
    >
      <section className="learners-projects-page">
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={apex.avatar} alt={apex.name} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{apex.name}</h1>
                <span className="learners-projects-status-badge">{apex.status}</span>
                <span className="learners-projects-count-badge">
                  <img src={badge1} alt="Badge" />
                  <span>{apex.projects}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{apex.role}</span>
                <span>&bull;</span>
                <span>{apex.email}</span>
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

        <section className="learners-projects-board">
          <div className="learners-projects-board-main">
            <div className="learners-projects-section-head">
              <div>
                <h2>My Projects</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-projects-grid">
              {slate.map((husk) => (
                <article key={husk.id} className="learners-project-card">
                  <div className="learners-project-card-image">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleViewProject(); }}>
                      <img src={husk.image} alt={husk.title} />
                    </a>
                  </div>

                  <div className="learners-project-card-info">
                    <div className="learners-project-card-info-head">
                      <div className="learners-project-card-author">
                        <span>By</span>
                        <p>{husk.author}</p>
                      </div>

                      <div className="learners-project-card-actions">
                        <button type="button" onClick={preventDefault}>
                          <img src={husk.heart} alt="Like" />
                          <span>{husk.likes}</span>
                        </button>
                        <button type="button" onClick={preventDefault}>
                          <img src={acEye} alt="Views" />
                          <span>{husk.views}</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-project-card-info-body">
                      <p><a href="#" onClick={(e) => { e.preventDefault(); handleViewProject(); }}>{husk.title}</a></p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="learners-projects-pagination">
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

          <aside className="learners-projects-side">
            <div className="learners-projects-section-head learners-projects-section-head-side">
              <div>
                <h2>Profile</h2>
                <p>Bio &amp; All about your experience</p>
              </div>
            </div>

            <div className="learners-projects-side-card learners-projects-side-card-profile">
              <div className="learners-projects-side-card-head">
                <span className="learners-projects-availability">{apex.availability}</span>
                <button type="button" className="learners-projects-edit-btn" onClick={preventDefault}>
                  <img src={bPencil} alt="Edit" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-projects-side-list">
                <div><img src={leUe} alt="Role" /><span>{apex.role}</span></div>
                <div><img src={leEx} alt="Experience" /><span>6 yrs experiance</span></div>
                <div><img src={leLo} alt="Location" /><span>{apex.location}</span></div>
              </div>

              <div className="learners-projects-followers-row">
                <img src={userIcon} alt="Followers" />
                <span>123 Followers</span>
              </div>

              <button type="button" className="learners-projects-email-btn" onClick={preventDefault}>
                <span>Edit E-mail</span>
                <img src={leEm} alt="Email" />
              </button>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>About</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>
              <p className="learners-projects-side-paragraph">
                {apex.bio} <a href="/" onClick={preventDefault}>Read more</a>
              </p>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-projects-stats-list">
                {apex.stats.map((husk, idx) => (
                  <div key={idx}>
                    <span>{husk.label}</span>
                    <strong>{husk.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>
              <div className="learners-projects-skills-list">
                {apex.skills.map((husk, idx) => (
                  <span key={idx}>{husk}</span>
                ))}
              </div>
            </div>
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
            <button type="button" className="learners-upload-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Close upload project modal">
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
              {genesis.map((husk) => (
                <div key={husk.id} className="learners-upload-modal__chip">
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

export default LearnersProjects;