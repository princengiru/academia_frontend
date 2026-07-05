import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';

import defaultProfile from '../../../assets/imgs/default-profile.png';
import badge1 from '../../../assets/icons/badge-1.svg';
import bPencil from '../../../assets/icons/b-pencil.svg';
import leUe from '../../../assets/icons/le-ue.svg';
import leEx from '../../../assets/icons/le-ex.svg';
import leLo from '../../../assets/icons/le-lo.svg';
import userIcon from '../../../assets/icons/user.svg';
import acInn from '../../../assets/icons/ac-inn.svg';
import rwandaIcon from '../../../assets/icons/rwanda.svg';
import resetIcon from '../../../assets/icons/reset.svg';
import acEye from '../../../assets/icons/ac-eye.svg';
import calendarIcon from '../../../assets/icons/calendar.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import trashIcon from '../../../assets/icons/trash.svg';
import dotsVertical from '../../../assets/icons/dots-vertical.svg';
import './settings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const timezoneOptions = [
  { value: 'GMT -5:00 - Eastern Time(US & Canada)', label: 'GMT -5:00 - Eastern Time(US & Canada)' },
  { value: 'GMT +2:00 - Central Africa Time', label: 'GMT +2:00 - Central Africa Time' },
];

const languageOptions = [
  { value: 'en', label: 'American English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];

const currencyOptions = [
  { value: 'USD', label: 'United States Dollar (USD)' },
  { value: 'RWF', label: 'Rwandan Franc (RWF)' },
];

const activityFilters = ['This week', 'Last week', 'This month', 'All time'];

function resolveAssetUrl(value) {
  if (!value) return defaultProfile;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
}

function formatNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : '0';
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function isWithinFilter(value, filter) {
  if (filter === 'All time') return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6);

  if (filter === 'This week') {
    return date >= startOfWeek;
  }

  if (filter === 'Last week') {
    const startOfLastWeek = new Date(startOfToday);
    startOfLastWeek.setDate(startOfToday.getDate() - 13);
    const endOfLastWeek = new Date(startOfToday);
    endOfLastWeek.setDate(startOfToday.getDate() - 7);
    return date >= startOfLastWeek && date < endOfLastWeek;
  }

  if (filter === 'This month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  return true;
}

function normalizeSkills(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

const ProfessorSettings = () => {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ message: '', tone: 'success', visible: false });
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState('This month');
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  const [reviewedActivityIds, setReviewedActivityIds] = useState([]);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'instructor', // Defaulted to instructor
    visibility: 'public',
    avatar: defaultProfile,
    bio: '',
    location: '',
    availableToHire: false,
    emailNotifications: false,
    skills: [],
  });
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificateStats, setCertificateStats] = useState(null);

  const [basicDraft, setBasicDraft] = useState({
    name: '',
    phone: '',
    role: 'instructor',
    visibility: 'public',
    bio: '',
    location: '',
    availableToHire: false,
    emailNotifications: false,
    skills: [],
  });
  const [preferencesDraft, setPreferencesDraft] = useState({
    language: 'en',
    timezone: timezoneOptions[0].value,
    currency: 'USD',
    showListNames: false,
    showLinkedTaskNames: true,
    emailVisibility: false,
  });
  const [skillDraft, setSkillDraft] = useState('');
  const [isBasicEditing, setIsBasicEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [isPreferencesEditing, setIsPreferencesEditing] = useState(false);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const showFeedback = (message, tone = 'success') => {
    setFeedback({ message, tone, visible: true });
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback((current) => ({ ...current, visible: false }));
    }, 3200);
  };

  const fetchJson = async (path, token, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body?.message || 'Request failed');
    }

    return body;
  };

  const loadSettings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('Please sign in to view your settings.');
      return;
    }

    setLoading(true);
    setError('');

    const requests = await Promise.allSettled([
      fetchJson('/api/profile', token),
      fetchJson('/api/profile/documents', token),
      fetchJson('/api/profile/payment-methods', token),
      fetchJson('/api/certificates/user/statistics', token),
      fetchJson('/api/certificates/user/my-certificates?limit=6&offset=0', token),
      fetchJson('/api/auth/account-status', token),
    ]);

    let firstError = '';

    const profileResult = requests[0];
    if (profileResult.status === 'fulfilled') {
      const user = profileResult.value?.data?.user || {};
      const completion = profileResult.value?.data?.completionStatus || null;
      const avatar = resolveAssetUrl(user.avatar);
      const skills = normalizeSkills(user.skills);

      setProfile({
        name: user.name || user.email || 'Instructor',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'instructor',
        visibility: user.visibility || 'public',
        avatar,
        bio: user.bio || '',
        location: user.location || [user.city, user.country].filter(Boolean).join(', ') || '',
        availableToHire: Boolean(user.available_to_hire),
        emailNotifications: Boolean(user.email_notifications),
        skills,
      });

      setBasicDraft({
        name: user.name || user.email || 'Instructor',
        phone: user.phone || '',
        role: user.role || 'instructor',
        visibility: user.visibility || 'public',
        bio: user.bio || '',
        location: user.location || [user.city, user.country].filter(Boolean).join(', ') || '',
        availableToHire: Boolean(user.available_to_hire),
        emailNotifications: Boolean(user.email_notifications),
        skills,
      });

      setPreferencesDraft({
        language: user.language || 'en',
        timezone: user.timezone || timezoneOptions[0].value,
        currency: user.currency || 'USD',
        showListNames: Boolean(user.show_list_names),
        showLinkedTaskNames: user.show_linked_task_names !== false,
        emailVisibility: Boolean(user.email_visibility),
      });

      setProfileCompletion(completion);
    } else {
      firstError = profileResult.reason?.message || 'Failed to load profile data';
    }

    const documentsResult = requests[1];
    if (documentsResult.status === 'fulfilled') {
      setDocuments(Array.isArray(documentsResult.value?.data?.documents) ? documentsResult.value.data.documents : []);
    } else if (!firstError) {
      firstError = documentsResult.reason?.message || 'Failed to load documents';
    }

    const paymentsResult = requests[2];
    if (paymentsResult.status === 'fulfilled') {
      setPaymentMethods(Array.isArray(paymentsResult.value?.data?.paymentMethods) ? paymentsResult.value.data.paymentMethods : []);
    } else if (!firstError) {
      firstError = paymentsResult.reason?.message || 'Failed to load payment methods';
    }

    const statsResult = requests[3];
    if (statsResult.status === 'fulfilled') {
      setCertificateStats(statsResult.value?.data || statsResult.value || null);
    }

    const certificatesResult = requests[4];
    if (certificatesResult.status === 'fulfilled') {
      const items = certificatesResult.value?.data?.certificates || certificatesResult.value?.data?.data || [];
      setCertificates(Array.isArray(items) ? items : []);
    } else if (!firstError) {
      firstError = certificatesResult.reason?.message || 'Failed to load certificates';
    }

    const accountResult = requests[5];
    if (accountResult.status === 'fulfilled') {
      setAccountStatus(accountResult.value?.data || accountResult.value || null);
    }

    if (firstError) {
      setError(firstError);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const profileCompletionValue = Number(profileCompletion?.profile_percentage ?? profileCompletion?.profilePercentage ?? 0);
  const totalCertificates = Number(certificateStats?.totalCertificates ?? certificates.length ?? 0);
  const totalDocuments = documents.length;
  const totalPaymentMethods = paymentMethods.length;
  const isAccountActive = accountStatus?.isActive !== false;
  const is2FAEnabled = Boolean(accountStatus?.twoFactorEnabled);

  const summaryCards = useMemo(() => ([
    { label: 'Profile completion', value: `${Math.round(profileCompletionValue)}%` },
    { label: 'Certificates', value: formatNumber(totalCertificates) },
    { label: 'Documents', value: formatNumber(totalDocuments) },
    { label: 'Payment methods', value: formatNumber(totalPaymentMethods) },
  ]), [profileCompletionValue, totalCertificates, totalDocuments, totalPaymentMethods]);

  const activityItems = useMemo(() => {
    const certificateEvents = certificates.map((certificate) => ({
      id: `certificate-${certificate.id || certificate.certificateNumber}`,
      type: 'Certificate',
      title: certificate.courseTitle || certificate.courseName || 'Certificate earned',
      body: certificate.certificateNumber ? `Certificate ${certificate.certificateNumber}` : 'Issued from your account data',
      date: certificate.issueDate,
      tone: certificate.status === 'passed' ? 'success' : certificate.status === 'failed' ? 'warning' : 'info',
    }));

    const documentEvents = documents.map((document) => ({
      id: `document-${document.id}`,
      type: 'Document',
      title: document.document_name || document.name || 'Document uploaded',
      body: document.is_public ? 'Shared document' : 'Private document',
      date: document.created_at,
      tone: 'info',
    }));

    const paymentEvents = paymentMethods.map((method) => ({
      id: `payment-${method.id}`,
      type: 'Payment method',
      title: method.paymentProvider || method.payment_provider || 'Payment method added',
      body: method.is_primary ? 'Primary payment method' : 'Saved payment method',
      date: method.created_at || method.createdAt,
      tone: 'success',
    }));

    return [...certificateEvents, ...documentEvents, ...paymentEvents]
      .filter((item) => isWithinFilter(item.date, activityFilter))
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [activityFilter, certificates, documents, paymentMethods]);

  const visibleActivityItems = activityItems.filter((item) => !reviewedActivityIds.includes(item.id));

  const saveBasicProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again to save your profile.');
      return;
    }

    setSavingBasic(true);
    setError('');

    try {
      const response = await fetchJson('/api/profile/complete', token, {
        method: 'PUT',
        body: JSON.stringify({
          name: basicDraft.name,
          phone: basicDraft.phone,
          role: basicDraft.role,
          visibility: basicDraft.visibility,
          bio: basicDraft.bio,
          location: basicDraft.location,
          skills: basicDraft.skills,
          availableToHire: basicDraft.availableToHire,
          emailNotifications: basicDraft.emailNotifications,
        }),
      });

      const user = response?.data?.user || {};
      const completion = response?.data?.profilePercentage;

      setProfile((current) => ({
        ...current,
        name: user.name || current.name,
        email: user.email || current.email,
        phone: user.phone || current.phone,
        role: user.role || current.role,
        visibility: user.visibility || current.visibility,
        bio: user.bio || basicDraft.bio,
        location: user.location || basicDraft.location,
        avatar: user.avatar ? resolveAssetUrl(user.avatar) : current.avatar,
        availableToHire: Boolean(user.available_to_hire),
        emailNotifications: Boolean(user.email_notifications),
        skills: normalizeSkills(user.skills).length ? normalizeSkills(user.skills) : basicDraft.skills,
      }));

      setProfileCompletion((current) => ({ ...(current || {}), profile_percentage: completion ?? current?.profile_percentage ?? 0 }));
      setIsBasicEditing(false);
      setIsAboutEditing(false);
      setIsSkillsEditing(false);
      showFeedback('Profile saved to your account.', 'success');
      await loadSettings();
    } catch (saveError) {
      showFeedback(saveError.message || 'Failed to save profile', 'warning');
    } finally {
      setSavingBasic(false);
    }
  };

  const savePreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again to save your preferences.');
      return;
    }

    setSavingPreferences(true);
    setError('');

    try {
      const response = await fetchJson('/api/profile/preferences', token, {
        method: 'PUT',
        body: JSON.stringify(preferencesDraft),
      });

      const user = response?.data?.user || {};
      setProfile((current) => ({
        ...current,
        emailNotifications: Boolean(user.email_notifications ?? current.emailNotifications),
      }));
      setIsPreferencesEditing(false);
      showFeedback('Preferences saved to your account.', 'success');
      await loadSettings();
    } catch (saveError) {
      showFeedback(saveError.message || 'Failed to save preferences', 'warning');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in again to upload a photo.');
      return;
    }

    setPhotoUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to upload photo');
      }

      const nextAvatar = body?.data?.photoUrl || body?.data?.user?.avatar;
      if (nextAvatar) {
        setProfile((current) => ({ ...current, avatar: resolveAssetUrl(nextAvatar) }));
      }

      showFeedback('Photo updated in your account.', 'success');
      await loadSettings();
    } catch (uploadError) {
      showFeedback(uploadError.message || 'Failed to upload photo', 'warning');
    } finally {
      setPhotoUploading(false);
      event.target.value = '';
    }
  };

  const toggleAvailability = async () => {
    setBasicDraft((current) => ({ ...current, availableToHire: !current.availableToHire }));
    await saveBasicProfile();
  };

  const addSkill = () => {
    const nextSkill = skillDraft.trim();
    if (!nextSkill) {
      showFeedback('Type a skill before adding it.', 'warning');
      return;
    }

    setBasicDraft((current) => ({
      ...current,
      skills: Array.from(new Set([...current.skills, nextSkill])),
    }));
    setSkillDraft('');
  };

  const removeSkill = (skill) => {
    if (!isSkillsEditing) return;
    setBasicDraft((current) => ({
      ...current,
      skills: current.skills.filter((item) => item !== skill),
    }));
  };

  const handleActivityAction = (id, action) => {
    if (action === 'review') {
      setReviewedActivityIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    }

    if (action === 'hide') {
      setReviewedActivityIds((current) => [...current, id]);
    }

    setOpenActivityMenuId(null);
  };

  return (
    <ProfessorLayout>
      <section className="learners-settings-page" onClick={(event) => { if (!event.target.closest('.learners-settings-activity-menu')) setOpenActivityMenuId(null); }}>
        <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />

        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar">
              <img src={profile.avatar} alt={profile.name || 'Profile'} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profile.name || 'Loading profile...'}</h1>
                <span className={`learners-projects-status-badge ${isAccountActive ? '' : 'is-inactive'}`}>
                  {isAccountActive ? 'Active' : 'Inactive'}
                </span>
                <span className="learners-projects-count-badge">
                  <img src={badge1} alt="Badge" />
                  <span>{Math.round(profileCompletionValue)}%</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span style={{ textTransform: 'capitalize' }}>{profile.role || 'Instructor'}</span>
                <span>&bull;</span>
                <span>{profile.email || 'No email on file'}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-secondary-btn" onClick={() => photoInputRef.current?.click()} disabled={photoUploading}>
              {photoUploading ? 'Uploading...' : 'Change Photo'}
            </button>
            <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/professor/account')}>
              Open Account
            </button>
          </div>
        </section>

        {error && (
          <div className="learners-settings-feedback is-warning">
            {error}
          </div>
        )}

        {feedback.visible && (
          <div className={`learners-settings-feedback is-${feedback.tone}`}>
            {feedback.message}
          </div>
        )}

        <section className="learners-settings-shell">
          <aside className="learners-settings-side">
            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head learners-settings-side-head-main">
                <div>
                  <h2>Profile Snapshot</h2>
                  <p>Everything here is synced from your account.</p>
                </div>
              </div>

              <div className="learners-settings-stats-list">
                {summaryCards.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>

              <div className="learners-settings-side-list" style={{ marginTop: 14 }}>
                <div><img src={leUe} alt="Role" /><span style={{ textTransform: 'capitalize' }}>{profile.role || 'Instructor'}</span></div>
                <div><img src={leEx} alt="Visibility" /><span>{profile.visibility === 'private' ? 'Private profile' : 'Public profile'}</span></div>
                <div><img src={leLo} alt="Location" /><span>{profile.location || 'Location not set'}</span></div>
                <div><img src={userIcon} alt="2FA" /><span>{is2FAEnabled ? 'Two-factor enabled' : 'Two-factor disabled'}</span></div>
              </div>

              <button
                type="button"
                className={`learners-settings-followers-btn ${basicDraft.availableToHire ? 'is-active' : ''}`}
                onClick={toggleAvailability}
                aria-pressed={basicDraft.availableToHire}
              >
                <img src={userIcon} alt="Availability" />
                <span>{basicDraft.availableToHire ? 'Available to hire' : 'Not available to hire'}</span>
              </button>

              <button type="button" className="learners-settings-email-btn" onClick={() => setActiveTab('overview')}>
                View profile settings
              </button>
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>About</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsAboutEditing((current) => !current)}>
                  <img src={bPencil} alt="Edit" />
                  <span>{isAboutEditing ? 'Editing' : 'Edit'}</span>
                </button>
              </div>

              {!isAboutEditing ? (
                <p className="learners-settings-about-copy">
                  {basicDraft.bio || 'No bio has been added yet. This area now reflects your account data only.'}
                </p>
              ) : (
                <div className="learners-settings-about-editor learners-settings-side-form">
                  <textarea
                    className="learners-settings-textarea"
                    value={basicDraft.bio}
                    onChange={(event) => setBasicDraft((current) => ({ ...current, bio: event.target.value }))}
                  />
                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={saveBasicProfile} disabled={savingBasic}>
                      {savingBasic ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsAboutEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="learners-settings-side-section">
              <div className="learners-settings-side-head">
                <h3>Skills</h3>
                <button type="button" className="learners-settings-edit-btn" onClick={() => setIsSkillsEditing((current) => !current)}>
                  <img src={bPencil} alt="Edit" />
                  <span>{isSkillsEditing ? 'Editing' : 'Edit'}</span>
                </button>
              </div>

              <div className={`learners-settings-skills-list ${isSkillsEditing ? 'is-editing' : ''}`}>
                {basicDraft.skills.length ? basicDraft.skills.map((skill) => (
                  <button key={skill} type="button" className="learners-settings-skill-chip" onClick={() => removeSkill(skill)}>
                    <span>{skill}</span>
                    {isSkillsEditing && <span className="learners-settings-skill-chip-remove">&times;</span>}
                  </button>
                )) : (
                  <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '1rem', marginTop: '0.5rem', width: '100%' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No skills saved to your account yet.</p>
                  </div>
                )}
              </div>

              {isSkillsEditing && (
                <div className="learners-settings-skills-editor learners-settings-side-form">
                  <div className="learners-settings-inline-input-row">
                    <input
                      type="text"
                      className="learners-settings-inline-input"
                      placeholder="Add a skill"
                      value={skillDraft}
                      onChange={(event) => setSkillDraft(event.target.value)}
                    />
                    <button type="button" className="learners-settings-inline-save" onClick={addSkill}>
                      Add
                    </button>
                  </div>
                  <div className="learners-settings-inline-actions">
                    <button type="button" className="learners-settings-inline-save" onClick={saveBasicProfile} disabled={savingBasic}>
                      {savingBasic ? 'Saving...' : 'Save skills'}
                    </button>
                    <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsSkillsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>

          <div className="learners-settings-main">
            <ul className="nav learners-settings-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button type="button" className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button type="button" className={`nav-link ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
                  Preferences
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button type="button" className={`nav-link ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                  Security
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button type="button" className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                  Activity Logs
                </button>
              </li>
            </ul>

            <div className="tab-content learners-settings-tab-content">
              {loading ? (
                <article className="learners-settings-panel">
                  <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', minHeight: '300px' }}>
                    <h3>Loading settings...</h3>
                    <p>Fetching your profile, preferences, and account status.</p>
                  </div>
                </article>
              ) : null}

              {!loading && activeTab === 'overview' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Profile Information</h3>
                      <button type="button" className="learners-settings-edit-btn" onClick={() => setIsBasicEditing((current) => !current)}>
                        <img src={bPencil} alt="Edit" />
                        <span>{isBasicEditing ? 'Editing' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Full Name</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.name}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, name: event.target.value }))}
                          disabled={!isBasicEditing}
                        />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Email</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input type="email" className="learners-settings-field-value learners-settings-field-control" value={profile.email} readOnly disabled />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Telephone</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <label className="learners-settings-field-value learners-settings-field-control learners-settings-phone-value">
                          <img src={rwandaIcon} alt="Rwanda" />
                          <input
                            type="tel"
                            value={basicDraft.phone}
                            onChange={(event) => setBasicDraft((current) => ({ ...current, phone: event.target.value }))}
                            disabled={!isBasicEditing}
                          />
                        </label>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Role</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.role}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, role: event.target.value }))}
                          disabled={!isBasicEditing}
                        />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Visibility</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="dropdown w-100">
                          <button
                            type="button"
                            className="learners-settings-field-value learners-settings-field-control pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            disabled={!isBasicEditing}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span>{basicDraft.visibility === 'private' ? 'Private' : 'Public'}</span>
                            </div>
                          </button>
                          {isBasicEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => setBasicDraft((c) => ({ ...c, visibility: 'public' }))}>
                                  Public
                                </button>
                              </li>
                              <li>
                                <button className="dropdown-item" type="button" onClick={() => setBasicDraft((c) => ({ ...c, visibility: 'private' }))}>
                                  Private
                                </button>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Location</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.location}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, location: event.target.value }))}
                          disabled={!isBasicEditing}
                        />
                      </div>

                      <div className="learners-settings-field is-full learners-settings-notification-field">
                        <div className="learners-settings-field-head">
                          <label>Account settings</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="learners-settings-notification-options">
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${basicDraft.availableToHire ? 'is-on' : ''}`}
                              onClick={() => setBasicDraft((current) => ({ ...current, availableToHire: !current.availableToHire }))}
                              aria-pressed={basicDraft.availableToHire}
                            />
                            <span>Available to hire</span>
                          </label>
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${basicDraft.emailNotifications ? 'is-on' : ''}`}
                              onClick={() => setBasicDraft((current) => ({ ...current, emailNotifications: !current.emailNotifications }))}
                              aria-pressed={basicDraft.emailNotifications}
                            />
                            <span>Email notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="learners-settings-inline-actions" style={{ marginTop: 18 }}>
                      <button type="button" className="learners-settings-inline-save" onClick={saveBasicProfile} disabled={savingBasic}>
                        {savingBasic ? 'Saving...' : 'Save profile'}
                      </button>
                      <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsBasicEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </article>
                </section>
              )}

              {!loading && activeTab === 'preferences' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Preferences</h3>
                      <button type="button" className="learners-settings-edit-btn" onClick={() => setIsPreferencesEditing((current) => !current)}>
                        <img src={bPencil} alt="Edit" />
                        <span>{isPreferencesEditing ? 'Editing' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Language</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="dropdown w-100">
                          <button
                            type="button"
                            className="learners-settings-field-value learners-settings-field-control pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            disabled={!isPreferencesEditing}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="pref-icon">{languageOptions.find((o) => o.value === preferencesDraft.language)?.icon || '🌐'}</span>
                              <span>{languageOptions.find((o) => o.value === preferencesDraft.language)?.label || 'Language'}</span>
                            </div>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {languageOptions.map((option) => (
                                <li key={option.value}>
                                  <button className="dropdown-item" type="button" onClick={() => setPreferencesDraft((c) => ({ ...c, language: option.value }))}>
                                    <span className="me-2">{option.icon}</span>
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Timezone</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="dropdown w-100">
                          <button
                            type="button"
                            className="learners-settings-field-value learners-settings-field-control pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            disabled={!isPreferencesEditing}
                          >
                            <span>{timezoneOptions.find((o) => o.value === preferencesDraft.timezone)?.label || 'Timezone'}</span>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {timezoneOptions.map((option) => (
                                <li key={option.value}>
                                  <button className="dropdown-item" type="button" onClick={() => setPreferencesDraft((c) => ({ ...c, timezone: option.value }))}>
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Currency</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="dropdown w-100">
                          <button
                            type="button"
                            className="learners-settings-field-value learners-settings-field-control pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            disabled={!isPreferencesEditing}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <span className="pref-icon currency-badge">{currencyOptions.find((o) => o.value === preferencesDraft.currency)?.icon || '$'}</span>
                              <span>{currencyOptions.find((o) => o.value === preferencesDraft.currency)?.label || 'Currency'}</span>
                            </div>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {currencyOptions.map((option) => (
                                <li key={option.value}>
                                  <button className="dropdown-item" type="button" onClick={() => setPreferencesDraft((c) => ({ ...c, currency: option.value }))}>
                                    <span className="me-2">{option.icon}</span>
                                    {option.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="learners-settings-field is-full learners-settings-notification-field">
                        <div className="learners-settings-field-head">
                          <label>Visibility switches</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="learners-settings-notification-options">
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${preferencesDraft.showListNames ? 'is-on' : ''}`}
                              onClick={() => setPreferencesDraft((current) => ({ ...current, showListNames: !current.showListNames }))}
                              aria-pressed={preferencesDraft.showListNames}
                              disabled={!isPreferencesEditing}
                            />
                            <span>Show list names</span>
                          </label>
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${preferencesDraft.showLinkedTaskNames ? 'is-on' : ''}`}
                              onClick={() => setPreferencesDraft((current) => ({ ...current, showLinkedTaskNames: !current.showLinkedTaskNames }))}
                              aria-pressed={preferencesDraft.showLinkedTaskNames}
                              disabled={!isPreferencesEditing}
                            />
                            <span>Show linked task names</span>
                          </label>
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${preferencesDraft.emailVisibility ? 'is-on' : ''}`}
                              onClick={() => setPreferencesDraft((current) => ({ ...current, emailVisibility: !current.emailVisibility }))}
                              aria-pressed={preferencesDraft.emailVisibility}
                              disabled={!isPreferencesEditing}
                            />
                            <span>Email visibility</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="learners-settings-inline-actions" style={{ marginTop: 18 }}>
                      <button type="button" className="learners-settings-inline-save" onClick={savePreferences} disabled={savingPreferences}>
                        {savingPreferences ? 'Saving...' : 'Save preferences'}
                      </button>
                      <button type="button" className="learners-settings-inline-cancel" onClick={() => setIsPreferencesEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  </article>
                </section>
              )}

              {!loading && activeTab === 'security' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Security options and account status</h3>
                      <button type="button" className="learners-settings-ghost-btn" onClick={() => navigate('/academia/professor/account')}>
                        <img src={resetIcon} alt="Account" />
                        <span>Open account page</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Password</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="learners-settings-field-value learners-settings-password-value">
                          <input type="password" className="learners-settings-field-control is-plain" value="Managed from your account settings" readOnly />
                          <button type="button" className="learners-settings-icon-btn" onClick={() => navigate('/academia/professor/account')}>
                            <img src={acEye} alt="Open account" />
                          </button>
                        </div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Account status</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="learners-settings-field-value">{isAccountActive ? 'Active' : 'Inactive'}</div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Two-factor authentication</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <div className="learners-settings-field-value">{is2FAEnabled ? 'Enabled' : 'Disabled'}</div>
                      </div>

                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-callout is-security">
                          <div className="learners-settings-callout-icon">✓</div>
                          <div className="learners-settings-callout-copy">
                            <strong>Security options summary</strong>
                            <p>Password updates, 2FA changes, and recovery flows should be handled from the account page or the security options below.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </section>
              )}

              {!loading && activeTab === 'activity' && (
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
                            {activityFilters.map((filterOption) => (
                              <li key={filterOption}>
                                <button
                                  className={`dropdown-item ${activityFilter === filterOption ? 'active' : ''}`}
                                  type="button"
                                  onClick={() => setActivityFilter(filterOption)}
                                >
                                  {filterOption}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button type="button" className="learners-settings-activity-clear-btn" onClick={loadSettings}>
                          <img src={trashIcon} alt="Refresh" />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-settings-activity-list">
                      {visibleActivityItems.length === 0 ? (
                        <div className="learners-card learners-empty-state learners-empty-state--compact" style={{ border: 'none', boxShadow: 'none', padding: '3rem', width: '100%' }}>
                          <h3>No recent account activity</h3>
                          <p>System logs, security events, and account updates will appear here.</p>
                        </div>
                      ) : (
                        visibleActivityItems.map((item) => (
                          <article key={item.id} className={`learners-settings-activity-item learners-settings-activity-item-${item.tone} ${reviewedActivityIds.includes(item.id) ? 'is-reviewed' : ''}`}>
                            <div className="learners-settings-activity-item-copy">
                              <div className="learners-settings-activity-meta">
                                <span>{formatDate(item.date)}</span>
                                <span className="learners-settings-activity-meta-dot" />
                                <span>{item.type}</span>
                              </div>
                              <p className="learners-settings-activity-line">
                                <strong>{item.title}</strong>
                                <span>{item.body}</span>
                              </p>
                            </div>

                            <div className="learners-settings-activity-menu">
                              <button
                                type="button"
                                className="learners-settings-activity-menu-btn"
                                onClick={() => setOpenActivityMenuId((current) => (current === item.id ? null : item.id))}
                                aria-expanded={openActivityMenuId === item.id}
                              >
                                <img src={dotsVertical} alt="Menu" />
                              </button>

                              <div className="learners-settings-activity-popover" hidden={openActivityMenuId !== item.id}>
                                <button type="button" onClick={() => handleActivityAction(item.id, 'review')}>
                                  Mark reviewed
                                </button>
                                <button type="button" onClick={() => handleActivityAction(item.id, 'hide')}>
                                  Hide
                                </button>
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
    </ProfessorLayout>
  );
}

export default ProfessorSettings;