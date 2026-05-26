import React, { useState, useEffect } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './projects.css';

const Projects = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Profile Data ---
  const profile = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: '/assets/imgs/prof.jpg',
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

  // --- Projects Grid Data ---
  const projectCards = [
    { id: 1, image: '/assets/imgs/d1.jpg', author: 'Jose Carine', likes: '10.6K', views: '10.6K', heart: 'ac-her2.svg', title: 'Build your software & engineering dream career' },
    { id: 2, image: '/assets/imgs/ac-on.jpg', author: 'Team owners', likes: '11', views: '1.2K', heart: 'ac-her1.svg', title: 'Build your software & engineering dream career' },
    { id: 3, image: '/assets/imgs/ac-jr.jpg', author: 'Jose Carine', likes: '11', views: '1.2K', heart: 'heart.svg', title: 'Build your software & engineering dream career' },
    { id: 4, image: '/assets/imgs/d1.jpg', author: 'Jose Carine', likes: '10.6K', views: '10.6K', heart: 'ac-her2.svg', title: 'Build your software & engineering dream career' },
    { id: 5, image: '/assets/imgs/ac-on.jpg', author: 'Team owners', likes: '11', views: '1.2K', heart: 'ac-her1.svg', title: 'Build your software & engineering dream career' },
    { id: 6, image: '/assets/imgs/ac-jr.jpg', author: 'Jose Carine', likes: '11', views: '1.2K', heart: 'heart.svg', title: 'Build your software & engineering dream career' },
  ];

  // --- Modal State & Collaborators ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Sheilah MUGABEKAZI', avatar: '/assets/imgs/prof.jpg' },
    { id: 2, name: 'Landry Perly', avatar: '/assets/imgs/ac-on.jpg' },
  ]);

  const removeCollaborator = (id) => {
    setCollaborators(collaborators.filter(collab => collab.id !== id));
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isUploadModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isUploadModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isUploadModalOpen) setIsUploadModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isUploadModalOpen]);

  return (
    <ProfessorLayout currentPage="projects">
      <section className="learners-projects-page">
        
        {/* --- Profile Strip --- */}
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={profile.avatar} alt={profile.name} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profile.name}</h1>
                <span className="learners-projects-status-badge">{profile.status}</span>
                <span className="learners-projects-count-badge">
                  <img src="/assets/icons/badge-1.svg" alt="" />
                  <span>{profile.projects}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{profile.role}</span>
                <span>&bull;</span>
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-primary-btn" onClick={() => setIsUploadModalOpen(true)}>
              <span>Upload new project</span>
              <img src="/assets/icons/exit-down.svg" alt="" />
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={preventDefault}>
              View Profile
            </button>
          </div>
        </section>

        {/* --- Main Board --- */}
        <section className="learners-projects-board">
          <div className="learners-projects-board-main">
            <div className="learners-projects-section-head">
              <div>
                <h2>My Projects</h2>
                <p>100 Courses Available to learn</p>
              </div>
            </div>

            <div className="learners-projects-grid">
              {projectCards.map((card) => (
                <article key={card.id} className="learners-project-card">
                  <div className="learners-project-card-image">
                    <a href="/view-project" onClick={preventDefault}>
                      <img src={card.image} alt={card.title} />
                    </a>
                  </div>

                  <div className="learners-project-card-info">
                    <div className="learners-project-card-info-head">
                      <div className="learners-project-card-author">
                        <span>By</span>
                        <p>{card.author}</p>
                      </div>

                      <div className="learners-project-card-actions">
                        <button type="button" onClick={preventDefault}>
                          <img src={`/assets/icons/${card.heart}`} alt="" />
                          <span>{card.likes}</span>
                        </button>
                        <button type="button" onClick={preventDefault}>
                          <img src="/assets/icons/ac-eye.svg" alt="" />
                          <span>{card.views}</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-project-card-info-body">
                      <p><a href="/view-project" onClick={preventDefault}>{card.title}</a></p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="learners-projects-pagination">
              <button type="button" onClick={preventDefault} aria-label="Previous page">
                <img src="/assets/icons/ac-le2.svg" alt="" />
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
                <img src="/assets/icons/ac-ri.svg" alt="" />
              </button>
            </div>
          </div>

          {/* --- Right Sidebar --- */}
          <aside className="learners-projects-side">
            <div className="learners-projects-section-head learners-projects-section-head-side">
              <div>
                <h2>Profile</h2>
                <p>Bio &amp; All about your experience</p>
              </div>
            </div>

            <div className="learners-projects-side-card learners-projects-side-card-profile">
              <div className="learners-projects-side-card-head">
                <span className="learners-projects-availability">{profile.availability}</span>
                <button type="button" className="learners-projects-edit-btn" onClick={preventDefault}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-projects-side-list">
                <div><img src="/assets/icons/le-ue.svg" alt="" /><span>{profile.role}</span></div>
                <div><img src="/assets/icons/le-ex.svg" alt="" /><span>6 yrs experiance</span></div>
                <div><img src="/assets/icons/le-lo.svg" alt="" /><span>{profile.location}</span></div>
              </div>

              <div className="learners-projects-followers-row">
                <img src="/assets/icons/user.svg" alt="" />
                <span>123 Followers</span>
              </div>

              <button type="button" className="learners-projects-email-btn" onClick={preventDefault}>
                <span>Edit E-mail</span>
                <img src="/assets/icons/le-em.svg" alt="" />
              </button>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>About</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                </button>
              </div>
              <p className="learners-projects-side-paragraph">
                {profile.bio} <a href="#" onClick={preventDefault}>Read more</a>
              </p>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-projects-stats-list">
                {profile.stats.map((stat, index) => (
                  <div key={index}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={preventDefault}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                </button>
              </div>
              <div className="learners-projects-skills-list">
                {profile.skills.map((skill, index) => (
                  <span key={index}>{skill}</span>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </section>

      {/* --- UPLOAD PROJECT MODAL --- */}
      <div className={`learners-upload-modal ${isUploadModalOpen ? 'is-open' : ''}`} aria-hidden={!isUploadModalOpen}>
        <div className="learners-upload-modal__backdrop" onClick={() => setIsUploadModalOpen(false)}></div>
        
        <div className="learners-upload-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="learnersUploadModalTitle">
          <div className="learners-upload-modal__header">
            <h2 id="learnersUploadModalTitle">Upload Project</h2>
            <button type="button" className="learners-upload-modal__close" onClick={() => setIsUploadModalOpen(false)} aria-label="Close upload project modal">
              <img src="/assets/icons/popup-close.svg" alt="" />
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
                <img src="/assets/icons/ac-see.svg" alt="" />
                <input id="learnersProjectCollaboration" type="text" placeholder="@ - name" />
              </div>
            </div>

            <div className="learners-upload-modal__chips">
              {collaborators.map((collab) => (
                <div key={collab.id} className="learners-upload-modal__chip">
                  <img src={collab.avatar} alt={collab.name} />
                  <span>{collab.name}</span>
                  <button type="button" onClick={() => removeCollaborator(collab.id)} aria-label={`Remove ${collab.name}`}>
                    <img src="/assets/icons/popup-close.svg" alt="" />
                  </button>
                </div>
              ))}
            </div>

            <label className="learners-upload-modal__dropzone" htmlFor="learnersProjectFiles">
              <span className="learners-upload-modal__dropzone-icon">
                <img src="/assets/icons/file.svg" alt="" />
              </span>
              <span className="learners-upload-modal__dropzone-copy">
                <strong>Drop files here or click to upload.</strong>
                <span>Upload case files, if any.</span>
              </span>
            </label>
            <input id="learnersProjectFiles" className="learners-upload-modal__file" type="file" multiple />

            <button type="button" className="learners-upload-modal__submit" onClick={() => setIsUploadModalOpen(false)}>Done</button>
          </div>
        </div>
      </div>
    </ProfessorLayout>
  );
};

export default Projects;