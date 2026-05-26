import React, { useState, useEffect } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import { Link } from 'react-router-dom';
import './view-project.css';

const ViewProject = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- Profile Data ---
  const profile = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: '/assets/imgs/prof.jpg',
    status: 'Active',
    projects: '6',
  };

  // --- Project Details Data ---
  const projectInfo = {
    title: 'Build your software & engineering dream career',
    subtitle: 'A portfolio-led product concept focused on collaborative learning, mentorship, and practical design systems.',
    image: '/assets/imgs/ac-jr.jpg',
    abstract: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.',
    team: 'Team owners',
    comments: [
      { id: 1, name: 'Mr. Anderson', avatar: '/assets/imgs/prof.jpg', time: '1 Day ago', message: 'Long before you sit down to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?', posted: 'Apr 23, 2025' },
      { id: 2, name: 'Mrs. Anderson', avatar: '/assets/imgs/ac-on.jpg', time: '1 Day ago', message: 'Nice Project', posted: 'Apr 23, 2025' },
      { id: 3, name: 'Mrs. Anderson', avatar: '/assets/imgs/ac-on.jpg', time: '1 Day ago', message: 'Nice Project', posted: 'Apr 23, 2025' },
      { id: 4, name: 'Mrs. Anderson', avatar: '/assets/imgs/ac-on.jpg', time: '1 Day ago', message: 'Nice Project', posted: 'Apr 23, 2025' },
      { id: 5, name: 'Mrs. Anderson', avatar: '/assets/imgs/ac-on.jpg', time: '1 Day ago', message: 'Nice Project', posted: 'Apr 23, 2025' },
    ],
    tools: ['Adobe XD', 'Figma', 'HTML', 'CSS', 'React'],
    gallery: [
      { id: 1, image: '/assets/imgs/d1.jpg', alt: 'Project showcase 1', class: 'is-wide is-tall' },
      { id: 2, image: '/assets/imgs/ac-on.jpg', alt: 'Project showcase 2', class: 'is-half' },
      { id: 3, image: '/assets/imgs/ac-jr.jpg', alt: 'Project showcase 3', class: 'is-half' },
      { id: 4, image: '/assets/imgs/ac-hr.jpg', alt: 'Project showcase 4', class: 'is-wide' },
    ],
  };

  // State to manage toggleable engagement metrics
  const [engagement, setEngagement] = useState([
    { id: 'comments', label: 'Comments', value: '800', icon: '/assets/icons/ac-com.svg', active: true },
    { id: 'likes', label: 'Likes', value: '47k', icon: '/assets/icons/heart.svg', active: false },
    { id: 'saves', label: 'Saves', value: '900', icon: '/assets/icons/ac-sav.svg', active: false },
  ]);

  const toggleEngagement = (id) => {
    setEngagement(engagement.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

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
      <section className="learners-view-project-page">
        
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

        {/* --- Project Details Shell --- */}
        <section className="learners-view-project-shell">
          <div className="learners-view-project-main">
            <div className="learners-view-project-head">
              <Link to="/academia/professor/projects" className="learners-view-project-back">
                <img src="/assets/icons/ac-le.svg" alt="" />
                <span>Back to Projects</span>
              </Link>
              <h2>{projectInfo.title}</h2>
              <p>{projectInfo.subtitle}</p>
            </div>

            <section className="learners-view-project-abstract-card">
              <h3>Abstract</h3>
              <p>{projectInfo.abstract}</p>

              <button type="button" className="learners-view-project-tools-toggle" onClick={preventDefault}>
                <span className="learners-view-project-tools-toggle-icon">
                  <img src="/assets/icons/ac-sd1.svg" alt="" />
                </span>
                <span>Tools Used</span>
                <span className="learners-view-project-tools-toggle-caret"></span>
              </button>
            </section>

            <section className="learners-view-project-gallery" aria-label="Project gallery">
              {projectInfo.gallery.map((item) => (
                <div key={item.id} className={`learners-view-project-gallery-item ${item.class}`}>
                  <img src={item.image} alt={item.alt} />
                </div>
              ))}
            </section>
          </div>

          {/* --- Right Sidebar / Comments Panel --- */}
          <aside className="learners-view-project-side">
            <section className="learners-view-project-comments-panel">
              <div className="learners-view-project-comments-head">
                <div>
                  <h3>{projectInfo.title}</h3>
                  <button type="button" className="learners-view-project-team-toggle" onClick={preventDefault}>
                    <span>1 {projectInfo.team}</span>
                    <span className="learners-view-project-team-caret"></span>
                  </button>
                </div>

                <button type="button" className="learners-view-project-share-btn" onClick={preventDefault} aria-label="Share project">
                  <img src="/assets/icons/ac-share.svg" alt="" />
                </button>
              </div>

              <div className="learners-view-project-engagement-row">
                {engagement.map((item) => (
                  <button 
                    key={item.id} 
                    type="button" 
                    className={`learners-view-project-engagement-pill ${item.active ? 'is-active' : ''}`} 
                    onClick={() => toggleEngagement(item.id)}
                  >
                    <img src={item.icon} alt="" />
                    <span>{item.value} {item.label}</span>
                  </button>
                ))}
              </div>

              <div className="learners-view-project-comments-list">
                {projectInfo.comments.map((comment) => (
                  <article key={comment.id} className="learners-view-project-comment">
                    <div className="learners-view-project-comment-avatar">
                      <img src={comment.avatar} alt={comment.name} />
                    </div>

                    <div className="learners-view-project-comment-body">
                      <div className="learners-view-project-comment-meta">
                        <strong>{comment.name}</strong>
                        <span>{comment.time}</span>
                      </div>

                      <p>{comment.message}</p>

                      <div className="learners-view-project-comment-foot">
                        <button type="button" className="learners-view-project-comment-reply" onClick={preventDefault}>
                          <img src="/assets/icons/ac-rep.svg" alt="" />
                          <span>Reply</span>
                        </button>
                        <span>Posted on <strong>{comment.posted}</strong></span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
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

export default ViewProject;