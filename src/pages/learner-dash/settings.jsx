import React, { useState, useEffect, useRef } from 'react';
import LearnersPageShell from './LearnersPageShell';

// Icons & Images
import profImg from '../../assets/imgs/prof.jpg';
import badge1 from '../../assets/icons/badge-1.svg';
import exitDown from '../../assets/icons/exit-down.svg';
import bPencil from '../../assets/icons/b-pencil.svg';
import leUe from '../../assets/icons/le-ue.svg';
import leEx from '../../assets/icons/le-ex.svg';
import leLo from '../../assets/icons/le-lo.svg';
import userIcon from '../../assets/icons/user.svg';
import acInn from '../../assets/icons/ac-inn.svg';
import rwandaIcon from '../../assets/icons/rwanda.svg';
import resetIcon from '../../assets/icons/reset.svg';
import acEye from '../../assets/icons/ac-eye.svg';
import calendarIcon from '../../assets/icons/calendar.svg';
import drop1 from '../../assets/icons/drop1.svg';
import trashIcon from '../../assets/icons/trash.svg';
import dotsVertical from '../../assets/icons/dots-vertical.svg';
import './settings.css';

function LearnersSettings() {
  const preventDefault = (e) => e.preventDefault();

  // --- Initial Data ---
  const initialProfile = {
    name: 'John Doe',
    role: 'UI/UX Designer',
    email: 'johndoe@gonaraza.com',
    avatar: profImg,
    status: 'Active',
    projects: '6',
    availability: 'Available Now',
    experience: '6 yrs experience',
    location: 'Kigali, Rwanda',
    followers: 123,
    bio: 'Statistics is the branch of mathematics that deals with the collection, analysis, interpretation, presentation, and organization of data. It provides methodologies for making inferences about populations based on sample data, enabling researchers to quantify uncertainty and variability in empirical findings.',
    stats: [
      { label: 'Project Views', value: '1,345,780' },
      { label: 'Project Likes', value: '236,890' },
      { label: 'Project Feedbacks', value: '103,008' },
    ],
  };

  const initialSkills = [
    'Adobe Illustrator',
    'Adobe Photoshop',
    'Coding Skills (CSS, HTML & REACT )',
    'Adobe InDesign',
  ];

  const initialLogs = [
    { id: 1, date: '10 Jan, 24', type: 'Payment', tone: 'orange', title: 'Course Pending Payment', body: 'was successful completed and approved.', footerPrefix: 'Using ', footerStrong: 'MTN Mobile Money.' },
    { id: 2, date: '10 Jan, 24', type: 'Payment', tone: 'green', title: 'Course Paid Successful', body: 'Payment was successful completed and', footerPrefix: 'approved. Using ', footerStrong: 'MTN Mobile Money.' },
    { id: 3, date: '10 Jan, 24', type: 'Payment', tone: 'orange', title: 'Course Pending Payment', body: 'was successful completed and approved.', footerPrefix: 'Using ', footerStrong: 'MTN Mobile Money.' },
    { id: 4, date: '10 Jan, 24', type: 'Course', tone: 'blue', title: 'Retake', body: 'Course failed ,try again to get certificates. 49.5%', footerPrefix: '', footerStrong: '' },
    { id: 5, date: '10 Jan, 24', type: 'Payment', tone: 'green', title: 'Course Paid Successful', body: 'Payment was successful completed and', footerPrefix: 'approved. Using ', footerStrong: 'MTN Mobile Money.' },
  ];

  // --- State Definitions (Rare Variables) ---
  const [apexProfile, setApexProfile] = useState(initialProfile);
  const [slateSkills, setSlateSkills] = useState(initialSkills);
  const [genesisLogs, setGenesisLogs] = useState(initialLogs);
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });
  const feedbackTimeout = useRef(null);

  // Side Panel States
  const [isAvailabilityEditing, setIsAvailabilityEditing] = useState(false);
  const [availabilityDraft, setAvailabilityDraft] = useState(apexProfile.availability);
  const [isFollowed, setIsFollowed] = useState(false);
  
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(apexProfile.bio);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [newSkillDraft, setNewSkillDraft] = useState('');

  // Overview Tab States
  const [isOverviewEditing, setIsOverviewEditing] = useState(false);
  const [zenithForm, setZenithForm] = useState({
    name: apexProfile.name,
    email: apexProfile.email,
    phone: '(250) 700 000 000',
    userType: 'Learner',
    role: apexProfile.role,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isResetPanelOpen, setIsResetPanelOpen] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({ new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deactivateConfirmed, setDeactivateConfirmed] = useState(false);
  
  // Activity Tab States
  const [activityFilter, setActivityFilter] = useState('This week');
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  const [reviewedLogs, setReviewedLogs] = useState([]);

  // --- Handlers ---
  const showFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = setTimeout(() => {
      setFeedback((prev) => ({ ...prev, visible: false }));
    }, 2600);
  };

  // Side Handlers
  const handleSaveAvailability = () => {
    setApexProfile((prev) => ({ ...prev, availability: availabilityDraft }));
    setIsAvailabilityEditing(false);
    showFeedback('Availability updated.', 'success');
  };

  const handleToggleFollow = () => {
    const nextState = !isFollowed;
    setIsFollowed(nextState);
    setApexProfile((prev) => ({ ...prev, followers: initialProfile.followers + (nextState ? 1 : 0) }));
    showFeedback(nextState ? 'You are now following this profile.' : 'You unfollowed this profile.', nextState ? 'success' : 'warning');
  };

  const handleSaveAbout = () => {
    setApexProfile((prev) => ({ ...prev, bio: aboutDraft }));
    setIsAboutEditing(false);
    showFeedback('About section saved.', 'success');
  };

  const handleAddSkill = () => {
    if (!newSkillDraft.trim()) {
      showFeedback('Enter a skill before adding it.', 'warning');
      return;
    }
    setSlateSkills((prev) => [...prev, newSkillDraft.trim()]);
    setNewSkillDraft('');
    showFeedback('Skill added.', 'success');
  };

  const handleRemoveSkill = (skillToRemove) => {
    if (!isSkillsEditing) return;
    setSlateSkills((prev) => prev.filter(skill => skill !== skillToRemove));
    showFeedback('Skill removed.', 'success');
  };

  // Overview Handlers
  const handleSaveOverview = () => {
    setApexProfile((prev) => ({ ...prev, name: zenithForm.name, email: zenithForm.email, role: zenithForm.role }));
    setIsOverviewEditing(false);
    showFeedback('Profile information saved.', 'success');
  };

  const handlePasswordReset = () => {
    if (passwordDraft.new.length < 8) {
      showFeedback('Password must be at least 8 characters.', 'warning');
      return;
    }
    if (passwordDraft.new !== passwordDraft.confirm) {
      showFeedback('Passwords do not match.', 'warning');
      return;
    }
    setPasswordDraft({ new: '', confirm: '' });
    setIsResetPanelOpen(false);
    showFeedback('Password updated on the frontend.', 'success');
  };

  const handleToggleAccountStatus = () => {
    const isInactive = apexProfile.status === 'Inactive';
    setApexProfile((prev) => ({ ...prev, status: isInactive ? 'Active' : 'Inactive' }));
    setDeactivateConfirmed(false);
    showFeedback(isInactive ? 'Account restored to active state.' : 'Account marked as inactive.', isInactive ? 'success' : 'warning');
  };

  // Activity Handlers
  const handleMarkReviewed = (id) => {
    setReviewedLogs((prev) => prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]);
    setOpenActivityMenuId(null);
    showFeedback(reviewedLogs.includes(id) ? 'Review mark removed.' : 'Log marked as reviewed.', 'success');
  };

  const handleRemoveLog = (id) => {
    setGenesisLogs((prev) => prev.filter((log) => log.id !== id));
    setOpenActivityMenuId(null);
    showFeedback('Activity row removed.', 'success');
  };

  return (
    <LearnersPageShell title="Settings" description="Learners settings layout scaffold.">
      <section className="learners-settings-page" onClick={(e) => { if (!e.target.closest('.learners-settings-activity-menu')) setOpenActivityMenuId(null); }}>
        
        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={apexProfile.avatar} alt={apexProfile.name} />
            </div>
            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{apexProfile.name}</h1>
                <span className={`learners-projects-status-badge ${apexProfile.status === 'Inactive' ? 'is-inactive' : ''}`}>
                  {apexProfile.status}
                </span>
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
            <button type="button" className="learners-projects-primary-btn" onClick={preventDefault}>Earn certificates</button>
            <button type="button" className="learners-projects-secondary-btn" onClick={() => setActiveTab('overview')}>View Profile</button>
          </div>
        </section>

        <section className="learners-settings-shell">
          <aside className="learners-settings-side">
            
            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head learners-settings-side-head-main">
                <div>
                  <h2>Project Profile</h2>
                  <p>Bio &amp; All about your experience</p>
                </div>
              </div>

              <div className="learners-settings-availability-row">
                <div className="learners-settings-availability-stack">
                  <span className="learners-settings-availability">{apexProfile.availability}</span>
                  {isAvailabilityEditing && (
                    <div className="learners-settings-inline-editor learners-settings-side-form">
                      <select 
                        className="learners-settings-inline-select" 
                        value={availabilityDraft} 
                        onChange={(e) => setAvailabilityDraft(e.target.value)}
                      >
                        <option value="Available Now">Available Now</option>
                        <option value="Busy">Busy</option>
                        <option value="On Break">On Break</option>
                      </select>
                      <div className="learners-settings-inline-actions">
                        <button type="button" className="learners-settings-inline-save" onClick={handleSaveAvailability}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsAvailabilityEditing(!isAvailabilityEditing)}>
                  <img src={bPencil} alt="Edit" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="learners-settings-side-list">
                <div><img src={leUe} alt="Role" /><span>{apexProfile.role}</span></div>
                <div><img src={leEx} alt="Experience" /><span>{apexProfile.experience}</span></div>
                <div><img src={leLo} alt="Location" /><span>{apexProfile.location}</span></div>
              </div>

              <button 
                type="button" 
                className={`learners-settings-followers-btn ${isFollowed ? 'is-active' : ''}`} 
                onClick={handleToggleFollow} 
                aria-pressed={isFollowed}
              >
                <img src={userIcon} alt="Followers" />
                <span>{apexProfile.followers} Followers</span>
              </button>

              <button type="button" className="learners-settings-email-btn" onClick={() => { setActiveTab('overview'); setIsOverviewEditing(true); }}>
                Edit E-mail
              </button>
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>About</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsAboutEditing(!isAboutEditing)}>
                  <img src={bPencil} alt="Edit" />
                  <span>Edit</span>
                </button>
              </div>
              
              {!isAboutEditing ? (
                <p className={`learners-settings-about-copy ${isAboutExpanded ? 'is-expanded' : ''}`}>
                  {apexProfile.bio}{' '}
                  <a href="/" onClick={(e) => { e.preventDefault(); setIsAboutExpanded(!isAboutExpanded); }}>
                    {isAboutExpanded ? 'Show less' : 'Read more'}
                  </a>
                </p>
              ) : (
                <div className="learners-settings-about-editor learners-settings-side-form">
                  <textarea 
                    className="learners-settings-textarea" 
                    value={aboutDraft} 
                    onChange={(e) => setAboutDraft(e.target.value)}
                  />
                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={handleSaveAbout}>Save</button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={() => { setIsAboutEditing(false); setAboutDraft(apexProfile.bio); }}>Cancel</button>
                  </div>
                </div>
              )}
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-settings-stats-list">
                {apexProfile.stats.map((husk, idx) => (
                  <div key={idx}>
                    <span>{husk.label}</span>
                    <strong>{husk.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsSkillsEditing(!isSkillsEditing)}>
                  <img src={bPencil} alt="Edit" />
                  <span>Edit</span>
                </button>
              </div>
              
              <div className={`learners-settings-skills-list ${isSkillsEditing ? 'is-editing' : ''}`}>
                {slateSkills.map((husk, idx) => (
                  <button key={idx} type="button" className="learners-settings-skill-chip" onClick={() => handleRemoveSkill(husk)}>
                    <span>{husk}</span>
                    <span className="learners-settings-skill-chip-remove">&times;</span>
                  </button>
                ))}
              </div>

              {isSkillsEditing && (
                <div className="learners-settings-skills-editor learners-settings-side-form">
                  <div className="learners-settings-inline-input-row">
                    <input 
                      type="text" 
                      className="learners-settings-inline-input" 
                      placeholder="Add a new skill"
                      value={newSkillDraft}
                      onChange={(e) => setNewSkillDraft(e.target.value)}
                    />
                    <button type="button" className="learners-settings-inline-save" onClick={handleAddSkill}>Add</button>
                  </div>
                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={() => { setIsSkillsEditing(false); showFeedback('Skills updated.', 'success'); }}>Done</button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsSkillsEditing(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </section>

          </aside>

          <div className="learners-settings-main">
            <ul className="nav learners-settings-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} 
                  onClick={() => setActiveTab('activity')}
                >
                  Activity Logs
                </button>
              </li>
            </ul>

            {feedback.visible && (
              <div className={`learners-settings-feedback is-${feedback.tone}`}>
                {feedback.message}
              </div>
            )}

            <div className="tab-content learners-settings-tab-content">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Profile Information</h3>
                      <button type="button" className="learners-settings-edit-btn" onClick={() => setIsOverviewEditing(!isOverviewEditing)}>
                        <img src={bPencil} alt="Edit" />
                        <span>{isOverviewEditing ? 'Editing' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Full Name</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input type="text" className="learners-settings-field-value learners-settings-field-control" value={zenithForm.name} onChange={(e) => setZenithForm({ ...zenithForm, name: e.target.value })} disabled={!isOverviewEditing} />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>E-mail</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input type="email" className="learners-settings-field-value learners-settings-field-control" value={zenithForm.email} onChange={(e) => setZenithForm({ ...zenithForm, email: e.target.value })} disabled={!isOverviewEditing} />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Telephone</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <label className="learners-settings-field-value learners-settings-field-control learners-settings-phone-value">
                          <img src={rwandaIcon} alt="Rwanda" />
                          <input type="tel" value={zenithForm.phone} onChange={(e) => setZenithForm({ ...zenithForm, phone: e.target.value })} disabled={!isOverviewEditing} />
                        </label>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>User Type</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <select className="learners-settings-field-value learners-settings-field-control" value={zenithForm.userType} onChange={(e) => setZenithForm({ ...zenithForm, userType: e.target.value })} disabled={!isOverviewEditing}>
                          <option>Learner</option>
                          <option>Creator</option>
                          <option>Contributor</option>
                        </select>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Role</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input type="text" className="learners-settings-field-value learners-settings-field-control" value={zenithForm.role} onChange={(e) => setZenithForm({ ...zenithForm, role: e.target.value })} disabled={!isOverviewEditing} />
                      </div>

                      <div className="learners-settings-field is-full learners-settings-notification-field">
                        <div className="learners-settings-field-head">
                          <label>Send Notification To</label>
                          <button 
                            type="button" 
                            className={`learners-settings-switch ${notificationsEnabled ? 'is-on' : ''}`} 
                            onClick={() => { setNotificationsEnabled(!notificationsEnabled); showFeedback(!notificationsEnabled ? 'Notifications enabled.' : 'Notifications muted.', !notificationsEnabled ? 'success' : 'warning'); }}
                            aria-pressed={notificationsEnabled}
                          ></button>
                        </div>
                        <div className={`learners-settings-notification-options ${!notificationsEnabled ? 'is-disabled' : ''}`}>
                          <label><input type="checkbox" defaultChecked disabled={!notificationsEnabled} onChange={() => showFeedback('Notification preferences updated.', 'success')} /> <span>Email</span></label>
                          <label><input type="checkbox" defaultChecked disabled={!notificationsEnabled} onChange={() => showFeedback('Notification preferences updated.', 'success')} /> <span>Message (Telephone)</span></label>
                        </div>
                      </div>
                    </div>

                    <button type="button" className="learners-settings-save-btn" onClick={handleSaveOverview} disabled={!isOverviewEditing}>Save</button>
                  </article>

                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Security &amp; Privacy</h3>
                      <button type="button" className="learners-settings-ghost-btn" onClick={() => setIsResetPanelOpen(!isResetPanelOpen)}>
                        <img src={resetIcon} alt="Reset" />
                        <span>Reset Password</span>
                      </button>
                    </div>

                    <div className="learners-settings-field is-full">
                      <div className="learners-settings-field-head">
                        <label>Password</label>
                        <img src={acInn} alt="Info" />
                      </div>
                      <div className="learners-settings-field-value learners-settings-password-value">
                        <input type={showPassword ? 'text' : 'password'} className="learners-settings-field-control is-plain" value="StrongPass2026" readOnly />
                        <button type="button" className="learners-settings-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                          <img src={acEye} alt="Show password" />
                        </button>
                      </div>
                    </div>

                    {isResetPanelOpen && (
                      <div className="learners-settings-reset-panel">
                        <div className="learners-settings-inline-input-row is-stack learners-settings-reset-fields">
                          <input type="password" className="learners-settings-inline-input" placeholder="New password" value={passwordDraft.new} onChange={(e) => setPasswordDraft({ ...passwordDraft, new: e.target.value })} />
                          <input type="password" className="learners-settings-inline-input" placeholder="Confirm password" value={passwordDraft.confirm} onChange={(e) => setPasswordDraft({ ...passwordDraft, confirm: e.target.value })} />
                        </div>
                        <div className="learners-settings-inline-actions">
                          <button type="button" className="learners-settings-inline-save" onClick={handlePasswordReset}>Update password</button>
                          <button type="button" className="learners-settings-inline-cancel" onClick={() => { setIsResetPanelOpen(false); setPasswordDraft({ new: '', confirm: '' }); }}>Cancel</button>
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
                        className={`learners-settings-callout-btn ${twoFactorEnabled ? 'is-active' : ''}`} 
                        onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); showFeedback(!twoFactorEnabled ? 'Two-factor prompts enabled.' : 'Two-factor prompts disabled.', !twoFactorEnabled ? 'success' : 'warning'); }}
                      >
                        {twoFactorEnabled ? 'Enabled' : 'Enable'}
                      </button>
                    </div>

                    <div className="learners-settings-subtitle">Account Privacy</div>

                    <div className="learners-settings-callout is-warning">
                      <div className="learners-settings-callout-icon">!</div>
                      <div className="learners-settings-callout-copy">
                        <strong>You Are Deactivating Your Account</strong>
                        <p>For extra security, this requires you to confirm your email or phone number when you reset your password. <a href="/" onClick={(e) => { e.preventDefault(); document.querySelector('.learners-settings-confirm-row').scrollIntoView({ behavior: 'smooth', block: 'center' }); showFeedback('Review the confirmation toggle before changing account privacy.', 'warning'); }}>Learn more</a></p>
                      </div>
                    </div>

                    <label className="learners-settings-confirm-row">
                      <input type="checkbox" checked={deactivateConfirmed} onChange={(e) => setDeactivateConfirmed(e.target.checked)} />
                      <span>I confirm my account deactivation</span>
                    </label>

                    <button type="button" className="learners-settings-danger-btn" disabled={!deactivateConfirmed} onClick={handleToggleAccountStatus}>
                      {apexProfile.status === 'Inactive' ? 'Reactivate Account' : 'Deactivate Account'}
                    </button>
                  </article>
                </section>
              )}

              {/* ACTIVITY TAB */}
              {activeTab === 'activity' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel learners-settings-activity-panel">
                    <div className="learners-settings-activity-head">
                      <h3>Recent Activity</h3>
                      <div className="learners-settings-activity-actions">
                        <div className="dropdown learners-settings-activity-filter-wrap">
                          <button className="learners-settings-activity-filter dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src={calendarIcon} alt="Calendar" />
                            <span>{activityFilter}</span>
                            <img src={drop1} alt="Dropdown" />
                          </button>
                          <ul className="dropdown-menu learners-settings-activity-filter-menu">
                            {['This week', 'Last week', 'This month'].map((filterOption) => (
                              <li key={filterOption}>
                                <button 
                                  className={`dropdown-item ${activityFilter === filterOption ? 'active' : ''}`} 
                                  type="button" 
                                  onClick={() => { setActivityFilter(filterOption); showFeedback(`Activity filter set to ${filterOption}.`, 'success'); }}
                                >
                                  {filterOption}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button type="button" className="learners-settings-activity-clear-btn" onClick={() => { setGenesisLogs([]); showFeedback('Recent activity cleared from the page.', 'success'); }}>
                          <img src={trashIcon} alt="Clear" />
                          <span>Clear all</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-settings-activity-list">
                      {genesisLogs.length === 0 ? (
                        <div className="learners-settings-activity-empty">
                          <strong>No recent activity</strong>
                          <span>New payments, retakes, and account events will appear here.</span>
                        </div>
                      ) : (
                        genesisLogs.map((husk) => (
                          <article key={husk.id} className={`learners-settings-activity-item learners-settings-activity-item-${husk.tone} ${reviewedLogs.includes(husk.id) ? 'is-reviewed' : ''}`}>
                            <div className="learners-settings-activity-item-copy">
                              <div className="learners-settings-activity-meta">
                                <span>{husk.date}</span>
                                <span className="learners-settings-activity-meta-dot"></span>
                                <span>{husk.type}</span>
                              </div>
                              <p className="learners-settings-activity-line">
                                <strong>{husk.title}</strong>
                                <span>{husk.body}</span>
                              </p>
                              {husk.footerStrong && (
                                <p className="learners-settings-activity-foot">
                                  <span>{husk.footerPrefix}</span>
                                  <strong>{husk.footerStrong}</strong>
                                </p>
                              )}
                            </div>
                            <div className="learners-settings-activity-menu">
                              <button 
                                type="button" 
                                className="learners-settings-activity-menu-btn" 
                                onClick={() => setOpenActivityMenuId(openActivityMenuId === husk.id ? null : husk.id)}
                                aria-expanded={openActivityMenuId === husk.id}
                              >
                                <img src={dotsVertical} alt="Menu" />
                              </button>
                              <div className="learners-settings-activity-popover" hidden={openActivityMenuId !== husk.id}>
                                <button type="button" onClick={() => handleMarkReviewed(husk.id)}>Mark reviewed</button>
                                <button type="button" onClick={() => handleRemoveLog(husk.id)}>Remove</button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </article>
                </section>
              )}

            </div>
          </div>
        </section>

      </section>
    </LearnersPageShell>
  );
}

export default LearnersSettings;