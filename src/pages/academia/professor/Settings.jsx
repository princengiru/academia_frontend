import React, { useState, useRef } from 'react';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';
import './settings.css';

const Settings = () => {
  const preventDefault = (e) => e.preventDefault();

  // --- State Setup ---
  const [activeTab, setActiveTab] = useState('overview');
  
  const [feedback, setFeedback] = useState({ message: '', tone: '', visible: false });
  const showFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 2600);
  };

  const [profile, setProfile] = useState({
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: '/assets/imgs/prof.jpg',
    status: 'Active',
    projects: '6',
    followersBase: 123,
    stats: [
      { label: 'Project Views', value: '1,345,780' },
      { label: 'Project Likes', value: '236,890' },
      { label: 'Project Feedbacks', value: '103,008' },
    ],
  });

  const [availability, setAvailability] = useState('Available Now');
  const [isAvailabilityEditorOpen, setIsAvailabilityEditorOpen] = useState(false);
  const [availabilitySelect, setAvailabilitySelect] = useState(availability);

  const [isFollowed, setIsFollowed] = useState(false);
  
  const [bio, setBio] = useState('Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.');
  const [isAboutEditorOpen, setIsAboutEditorOpen] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const [skills, setSkills] = useState([
    'Adobe Illustrator',
    'Adobe Photoshop',
    'Coding Skills (CSS, HTML & REACT )',
    'Adobe InDesign',
  ]);
  const [isSkillsEditorOpen, setIsSkillsEditorOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewForm, setOverviewForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: '(250) 700 000 000',
    userType: 'Professor',
    role: profile.role
  });

  const [notifications, setNotifications] = useState({ enabled: true, email: true, phone: true });
  const [isResetPanelOpen, setIsResetPanelOpen] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '', current: 'StrongPass2026' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isAccountActive, setIsAccountActive] = useState(true);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);

  const [activityFilter, setActivityFilter] = useState('This week');
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, date: '10 Jan, 24', type: 'Payment', tone: 'orange', title: 'Course Pending Payment', body: 'was successful completed and approved.', footerPrefix: 'Using ', footerStrong: 'MTN Mobile Money.', reviewed: false },
    { id: 2, date: '10 Jan, 24', type: 'Payment', tone: 'green', title: 'Course Paid Successful', body: 'Payment was successful completed and', footerPrefix: 'approved. Using ', footerStrong: 'MTN Mobile Money.', reviewed: false },
    { id: 3, date: '10 Jan, 24', type: 'Payment', tone: 'orange', title: 'Course Pending Payment', body: 'was successful completed and approved.', footerPrefix: 'Using ', footerStrong: 'MTN Mobile Money.', reviewed: false },
    { id: 4, date: '10 Jan, 24', type: 'Course', tone: 'blue', title: 'Retake', body: 'Course failed ,try again to get certificates. 49.5%', footerPrefix: '', footerStrong: '', reviewed: false },
    { id: 5, date: '10 Jan, 24', type: 'Payment', tone: 'green', title: 'Course Paid Successful', body: 'Payment was successful completed and', footerPrefix: 'approved. Using ', footerStrong: 'MTN Mobile Money.', reviewed: false },
  ]);

  const [personalDocuments, setPersonalDocuments] = useState([
    { id: 1, name: 'Highschool Certificate.pdf', size: '5.6 MB' },
    { id: 2, name: 'A0 My doc.pdf', size: '5.6 MB' },
    { id: 3, name: 'My Resume.pdf', size: '5.6 MB' },
  ]);

  const fileInputRef = useRef(null);

  // --- Handlers ---
  const applyAvailability = () => {
    setAvailability(availabilitySelect);
    setIsAvailabilityEditorOpen(false);
    showFeedback('Availability updated.', 'success');
  };

  const toggleFollow = () => {
    setIsFollowed(!isFollowed);
    showFeedback(!isFollowed ? 'You are now following this profile.' : 'You unfollowed this profile.', !isFollowed ? 'success' : 'warning');
  };

  const saveAbout = () => {
    setBio(bioInput);
    setIsAboutEditorOpen(false);
    showFeedback('About section saved.', 'success');
  };

  const cancelAbout = () => {
    setBioInput(bio);
    setIsAboutEditorOpen(false);
  };

  const addSkill = () => {
    if (!newSkillInput.trim()) {
      showFeedback('Enter a skill before adding it.', 'warning');
      return;
    }
    setSkills([...skills, newSkillInput.trim()]);
    setNewSkillInput('');
    showFeedback('Skill added.', 'success');
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, i) => i !== indexToRemove));
    showFeedback('Skill removed.', 'success');
  };

  const saveOverview = () => {
    setProfile(p => ({ ...p, name: overviewForm.name, email: overviewForm.email, role: overviewForm.role }));
    setIsEditingOverview(false);
    showFeedback('Profile information saved.', 'success');
  };

  const applyPasswordReset = () => {
    if (passwords.new.length < 8) {
      showFeedback('Password must be at least 8 characters.', 'warning');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showFeedback('Passwords do not match.', 'warning');
      return;
    }
    setPasswords(p => ({ ...p, current: passwords.new, new: '', confirm: '' }));
    setIsResetPanelOpen(false);
    showFeedback('Password updated on the frontend.', 'success');
  };

  const toggleAccountStatus = () => {
    setIsAccountActive(!isAccountActive);
    setProfile(p => ({ ...p, status: !isAccountActive ? 'Active' : 'Inactive' }));
    showFeedback(!isAccountActive ? 'Account restored to active state.' : 'Account marked as inactive on the frontend.', !isAccountActive ? 'success' : 'warning');
    setDeactivateConfirm(false);
  };

  const clearActivity = () => {
    setActivityLogs([]);
    showFeedback('Recent activity cleared from the page.', 'success');
  };

  const markLogReviewed = (id) => {
    setActivityLogs(logs => logs.map(l => l.id === id ? { ...l, reviewed: !l.reviewed } : l));
    setOpenActivityMenuId(null);
  };

  const removeLog = (id) => {
    setActivityLogs(logs => logs.filter(l => l.id !== id));
    setOpenActivityMenuId(null);
    showFeedback('Activity row removed.', 'success');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newDocs = files.map((file, i) => ({
      id: Date.now() + i,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
    }));
    
    setPersonalDocuments(prev => [...prev, ...newDocs]);
    showFeedback(`${files.length} document(s) added.`, 'success');
    e.target.value = '';
  };

  return (
    <ProfessorLayout currentPage="settings">
      <section className={`learners-settings-page ${isEditingOverview ? 'is-overview-editing' : ''}`}>
        
        {/* Profile Strip */}
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={profile.avatar} alt={profile.name} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profile.name}</h1>
                <span className={`learners-projects-status-badge ${!isAccountActive ? 'is-inactive' : ''}`}>{profile.status}</span>
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
            <button type="button" className="learners-projects-primary-btn" onClick={() => window.location.href='/academia/professor/projects'}>View projects</button>
            <button type="button" className="learners-projects-secondary-btn" onClick={() => setActiveTab('overview')}>View Profile</button>
          </div>
        </section>

        <section className="learners-settings-shell">
          {/* Sidebar */}
          <aside className="learners-settings-side">
            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head learners-settings-side-head-main">
                <div>
                  <h2>Project Profile</h2>
                  <p>Bio &amp; all about your experience</p>
                </div>
              </div>

              <div className="learners-settings-availability-row">
                <div className="learners-settings-availability-stack">
                  <span className="learners-settings-availability">{availability}</span>

                  {isAvailabilityEditorOpen && (
                    <div className="learners-settings-inline-editor learners-settings-side-form">
                      <select 
                        className="learners-settings-inline-select" 
                        value={availabilitySelect} 
                        onChange={(e) => setAvailabilitySelect(e.target.value)}
                      >
                        <option value="Available Now">Available Now</option>
                        <option value="Busy">Busy</option>
                        <option value="On Break">On Break</option>
                      </select>
                      <div className="learners-settings-inline-actions">
                        <button type="button" className="learners-settings-inline-save" onClick={applyAvailability}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>

                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsAvailabilityEditorOpen(!isAvailabilityEditorOpen)}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-settings-side-list">
                <div><img src="/assets/icons/le-ue.svg" alt="" /><span>{profile.role}</span></div>
                <div><img src="/assets/icons/le-ex.svg" alt="" /><span>6 yrs experience</span></div>
                <div><img src="/assets/icons/le-lo.svg" alt="" /><span>Kigali, Rwanda</span></div>
              </div>

              <button 
                type="button" 
                className={`learners-settings-followers-btn ${isFollowed ? 'is-active' : ''}`}
                onClick={toggleFollow}
              >
                <img src="/assets/icons/user.svg" alt="" />
                <span>{profile.followersBase + (isFollowed ? 1 : 0)} Followers</span>
              </button>

              <button type="button" className="learners-settings-email-btn" onClick={() => { setActiveTab('overview'); setIsEditingOverview(true); }}>Edit E-mail</button>
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>About</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => { setIsAboutEditorOpen(!isAboutEditorOpen); setBioInput(bio); }}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                  <span>Edit</span>
                </button>
              </div>
              
              {!isAboutEditorOpen && (
                <p className={`learners-settings-about-copy ${isAboutExpanded ? 'is-expanded' : ''}`}>
                  {bio} <a href="#" onClick={(e) => { preventDefault(e); setIsAboutExpanded(!isAboutExpanded); }}>{isAboutExpanded ? 'Show less' : 'Read more'}</a>
                </p>
              )}

              {isAboutEditorOpen && (
                <div className="learners-settings-about-editor learners-settings-side-form">
                  <textarea className="learners-settings-textarea" value={bioInput} onChange={(e) => setBioInput(e.target.value)}></textarea>
                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={saveAbout}>Save</button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={cancelAbout}>Cancel</button>
                  </div>
                </div>
              )}
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-settings-stats-list">
                {profile.stats.map((stat, idx) => (
                  <div key={idx}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsSkillsEditorOpen(!isSkillsEditorOpen)}>
                  <img src="/assets/icons/b-pencil.svg" alt="" />
                  <span>Edit</span>
                </button>
              </div>
              <div className={`learners-settings-skills-list ${isSkillsEditorOpen ? 'is-editing' : ''}`}>
                {skills.map((skill, idx) => (
                  <button key={idx} type="button" className="learners-settings-skill-chip" onClick={() => isSkillsEditorOpen && removeSkill(idx)}>
                    <span>{skill}</span>
                    <span className="learners-settings-skill-chip-remove">&times;</span>
                  </button>
                ))}
              </div>

              {isSkillsEditorOpen && (
                <div className="learners-settings-skills-editor learners-settings-side-form">
                  <div className="learners-settings-inline-input-row">
                    <input type="text" className="learners-settings-inline-input" placeholder="Add a new skill" value={newSkillInput} onChange={(e) => setNewSkillInput(e.target.value)} />
                    <button type="button" className="learners-settings-inline-save" onClick={addSkill}>Add</button>
                  </div>

                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={() => { setIsSkillsEditorOpen(false); showFeedback('Skills updated.', 'success'); }}>Done</button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsSkillsEditorOpen(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </section>
          </aside>

          {/* Main Area */}
          <div className="learners-settings-main">
            <ul className="nav learners-settings-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity Logs</button>
              </li>
              <li className="nav-item" role="presentation">
                <button className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Personal Documents</button>
              </li>
            </ul>

            {feedback.visible && (
              <div className={`learners-settings-feedback is-${feedback.tone}`}>
                {feedback.message}
              </div>
            )}

            <div className="tab-content learners-settings-tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Profile Information</h3>
                      <button type="button" className="learners-settings-edit-btn" onClick={() => setIsEditingOverview(!isEditingOverview)}>
                        <img src="/assets/icons/b-pencil.svg" alt="" />
                        <span>{isEditingOverview ? 'Editing' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Full Name</label>
                          <img src="/assets/icons/ac-inn.svg" alt="" />
                        </div>
                        <input type="text" className="learners-settings-field-value learners-settings-field-control" disabled={!isEditingOverview} value={overviewForm.name} onChange={(e) => setOverviewForm({...overviewForm, name: e.target.value})} />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>E-mail</label>
                          <img src="/assets/icons/ac-inn.svg" alt="" />
                        </div>
                        <input type="email" className="learners-settings-field-value learners-settings-field-control" disabled={!isEditingOverview} value={overviewForm.email} onChange={(e) => setOverviewForm({...overviewForm, email: e.target.value})} />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Telephone</label>
                          <img src="/assets/icons/ac-inn.svg" alt="" />
                        </div>
                        <label className="learners-settings-field-value learners-settings-field-control learners-settings-phone-value">
                          <img src="/assets/icons/rwanda.svg" alt="Rwanda" />
                          <input type="tel" disabled={!isEditingOverview} value={overviewForm.phone} onChange={(e) => setOverviewForm({...overviewForm, phone: e.target.value})} />
                        </label>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>User Type</label>
                          <img src="/assets/icons/ac-inn.svg" alt="" />
                        </div>
                        <select className="learners-settings-field-value learners-settings-field-control" disabled={!isEditingOverview} value={overviewForm.userType} onChange={(e) => setOverviewForm({...overviewForm, userType: e.target.value})}>
                          <option>Professor</option>
                          <option>Creator</option>
                          <option>Contributor</option>
                        </select>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Role</label>
                          <img src="/assets/icons/ac-inn.svg" alt="" />
                        </div>
                        <input type="text" className="learners-settings-field-value learners-settings-field-control" disabled={!isEditingOverview} value={overviewForm.role} onChange={(e) => setOverviewForm({...overviewForm, role: e.target.value})} />
                      </div>

                      <div className="learners-settings-field is-full learners-settings-notification-field">
                        <div className="learners-settings-field-head">
                          <label>Send Notification To</label>
                          <button 
                            type="button" 
                            className={`learners-settings-switch ${notifications.enabled ? 'is-on' : ''}`} 
                            onClick={() => { setNotifications({ ...notifications, enabled: !notifications.enabled }); showFeedback(!notifications.enabled ? 'Notifications enabled.' : 'Notifications muted.', !notifications.enabled ? 'success' : 'warning'); }}
                          ></button>
                        </div>
                        <div className={`learners-settings-notification-options ${!notifications.enabled ? 'is-disabled' : ''}`}>
                          <label><input type="checkbox" checked={notifications.email} onChange={(e) => { setNotifications({ ...notifications, email: e.target.checked }); showFeedback('Notification preferences updated.', 'success') }} disabled={!notifications.enabled} /> <span>Email</span></label>
                          <label><input type="checkbox" checked={notifications.phone} onChange={(e) => { setNotifications({ ...notifications, phone: e.target.checked }); showFeedback('Notification preferences updated.', 'success') }} disabled={!notifications.enabled} /> <span>Message (Telephone)</span></label>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="learners-settings-save-btn" disabled={!isEditingOverview} onClick={saveOverview}>Save</button>
                  </article>

                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Security &amp; Privacy</h3>
                      <button type="button" className="learners-settings-ghost-btn" onClick={() => setIsResetPanelOpen(!isResetPanelOpen)}>
                        <img src="/assets/icons/reset.svg" alt="" />
                        <span>Reset Password</span>
                      </button>
                    </div>

                    <div className="learners-settings-field is-full">
                      <div className="learners-settings-field-head">
                        <label>Password</label>
                        <img src="/assets/icons/ac-inn.svg" alt="" />
                      </div>
                      <div className="learners-settings-field-value learners-settings-password-value">
                        <input type={showPassword ? "text" : "password"} className="learners-settings-field-control is-plain" value={passwords.current} readOnly />
                        <button type="button" className="learners-settings-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                          <img src="/assets/icons/ac-eye.svg" alt="Show password" />
                        </button>
                      </div>
                    </div>

                    {isResetPanelOpen && (
                      <div className="learners-settings-reset-panel">
                        <div className="learners-settings-inline-input-row is-stack learners-settings-reset-fields">
                          <input type="password" className="learners-settings-inline-input" placeholder="New password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                          <input type="password" className="learners-settings-inline-input" placeholder="Confirm password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                        </div>

                        <div className="learners-settings-inline-actions">
                          <button type="button" className="learners-settings-inline-save" onClick={applyPasswordReset}>Update password</button>
                          <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsResetPanelOpen(false)}>Cancel</button>
                        </div>
                      </div>
                    )}

                    <div className="learners-settings-callout is-security">
                      <div className="learners-settings-callout-icon">✓</div>
                      <div className="learners-settings-callout-copy">
                        <strong>Secure Your Account</strong>
                        <p>Two-factor authentication adds an extra layer of security to your account. To log in, in addition you'll need to provide a 6 digit code</p>
                      </div>
                      <button 
                        type="button" 
                        className={`learners-settings-callout-btn ${isTwoFactorEnabled ? 'is-active' : ''}`} 
                        onClick={() => { setIsTwoFactorEnabled(!isTwoFactorEnabled); showFeedback(!isTwoFactorEnabled ? 'Two-factor prompts enabled.' : 'Two-factor prompts disabled.', !isTwoFactorEnabled ? 'success' : 'warning'); }}
                      >
                        {isTwoFactorEnabled ? 'Enabled' : 'Enable'}
                      </button>
                    </div>

                    <div className="learners-settings-subtitle">Account Privacy</div>

                    <div className="learners-settings-callout is-warning">
                      <div className="learners-settings-callout-icon">!</div>
                      <div className="learners-settings-callout-copy">
                        <strong>You Are Deactivating Your Account</strong>
                        <p>For extra security, this requires you to confirm your email or phone number when you reset your password. <a href="#" onClick={(e) => { preventDefault(e); showFeedback('Review the confirmation toggle before changing account privacy.', 'warning'); }}>Learn more</a></p>
                      </div>
                    </div>

                    <label className="learners-settings-confirm-row">
                      <input type="checkbox" checked={deactivateConfirm} onChange={(e) => setDeactivateConfirm(e.target.checked)} />
                      <span>I confirm my account deactivation</span>
                    </label>

                    <button type="button" className="learners-settings-danger-btn" disabled={!deactivateConfirm} onClick={toggleAccountStatus}>
                      {!isAccountActive ? 'Reactivate Account' : 'Deactivate Account'}
                    </button>
                  </article>
                </section>
              )}

              {/* Activity Logs Tab */}
              {activeTab === 'activity' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel learners-settings-activity-panel">
                    <div className="learners-settings-activity-head">
                      <h3>Recent Activity</h3>

                      <div className="learners-settings-activity-actions">
                        <div className="dropdown learners-settings-activity-filter-wrap">
                          <button className="learners-settings-activity-filter dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="/assets/icons/calendar.svg" alt="" />
                            <span>{activityFilter}</span>
                            <img src="/assets/icons/drop1.svg" alt="" />
                          </button>

                          <ul className="dropdown-menu learners-settings-activity-filter-menu">
                            {['This week', 'Last week', 'This month', 'All activity'].map(filter => (
                              <li key={filter}>
                                <button className={`dropdown-item ${activityFilter === filter ? 'active' : ''}`} type="button" onClick={() => { setActivityFilter(filter); showFeedback(`Activity filter set to ${filter}.`, 'success'); }}>
                                  {filter}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button type="button" className="learners-settings-activity-clear-btn" onClick={clearActivity}>
                          <img src="/assets/icons/trash.svg" alt="" />
                          <span>Clear all</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-settings-activity-list">
                      {activityLogs.length === 0 ? (
                        <div className="learners-settings-activity-empty">
                          <strong>No recent activity</strong>
                          <span>New payments, retakes, and account events will appear here.</span>
                        </div>
                      ) : (
                        activityLogs.map((log) => (
                          <article key={log.id} className={`learners-settings-activity-item learners-settings-activity-item-${log.tone} ${log.reviewed ? 'is-reviewed' : ''}`}>
                            <div className="learners-settings-activity-item-copy">
                              <div className="learners-settings-activity-meta">
                                <span>{log.date}</span>
                                <span className="learners-settings-activity-meta-dot"></span>
                                <span>{log.type}</span>
                              </div>

                              <p className="learners-settings-activity-line">
                                <strong>{log.title} </strong>
                                <span>{log.body}</span>
                              </p>

                              {log.footerStrong && (
                                <p className="learners-settings-activity-foot"><span>{log.footerPrefix}</span><strong>{log.footerStrong}</strong></p>
                              )}
                            </div>

                            <div className="learners-settings-activity-menu">
                              <button type="button" className="learners-settings-activity-menu-btn" aria-expanded={openActivityMenuId === log.id} onClick={(e) => { e.stopPropagation(); setOpenActivityMenuId(openActivityMenuId === log.id ? null : log.id); }}>
                                <img src="/assets/icons/dots-vertical.svg" alt="" />
                              </button>

                              {openActivityMenuId === log.id && (
                                <div className="learners-settings-activity-popover">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); markLogReviewed(log.id); }}>
                                    {log.reviewed ? 'Remove mark' : 'Mark reviewed'}
                                  </button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); removeLog(log.id); }}>Remove</button>
                                </div>
                              )}
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </article>
                </section>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel learners-settings-documents-panel">
                    <div className="learners-settings-documents-block">
                      <h3>Personal Documents</h3>

                      <label className="learners-settings-documents-upload">
                        <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileUpload} />
                        <span className="learners-settings-documents-upload-icon">
                          <img src="/assets/icons/file.svg" alt="" aria-hidden="true" />
                        </span>
                        <span className="learners-settings-documents-upload-copy">
                          <strong>Add Certificates files or Click Upload</strong>
                          <small>Upload case files, if any.</small>
                        </span>
                      </label>
                    </div>

                    <div className="learners-settings-documents-list-head">
                      <h4>Recent Documents</h4>
                      <button type="button" className="learners-settings-documents-remove-btn" onClick={() => showFeedback('Document removal request sent.', 'success')}>
                        <img src="/assets/icons/trash.svg" alt="" aria-hidden="true" />
                        <span>Request remove</span>
                      </button>
                    </div>

                    <div className="learners-settings-documents-grid">
                      {personalDocuments.map((doc) => (
                        <article key={doc.id} className="learners-settings-documents-item">
                          <img src="/assets/icons/pdf1.svg" alt="PDF" aria-hidden="true" />
                          <div>
                            <strong>{doc.name}</strong>
                            <span>{doc.size}</span>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="learners-settings-documents-privacy-note">
                      <div className="learners-settings-documents-privacy-icon">
                        <img src="/assets/icons/imp-alert.svg" alt="Notice" aria-hidden="true" />
                      </div>
                      <div className="learners-settings-documents-privacy-copy">
                        <strong>Documents Privacy Note</strong>
                        <p>By uploading files to our platform, you confirm that the documents are your property or you have permission to use them. All uploaded files are treated as confidential and will only be used to complete the requested design service. We do not share, sell, or use your documents for any other purpose without your consent.<a href="#" onClick={(e) => { preventDefault(e); showFeedback('Terms and conditions dialog is not connected yet.', 'warning'); }}>Terms and conditions</a></p>
                      </div>
                    </div>
                  </article>
                </section>
              )}
            </div>
          </div>
        </section>
      </section>
    </ProfessorLayout>
  );
};

export default Settings;