import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnerLoadError from '../learner/LearnerLoadError';
import ProfilePhotoCropModal from '../learner/ProfilePhotoCropModal';
import HoasButtonSpinner from '../learner/HoasButtonSpinner';
import { getProfilePhotoDisplayUrl, isCustomProfilePhoto } from '../learner/profilePhotoUtils';
import {
  buildBasicDraftFromUser,
  buildPreferencesDraftFromUser,
  buildProjectProfileDraftFromUser,
  formatExperienceLabel,
  formatLocationDisplay,
  formatRoleLabel,
  MAX_PROFILE_PHOTO_BYTES,
  serializeBasicDraft,
  serializePreferencesDraft,
  serializeProjectProfileDraft,
} from './learnerProfileShared';
import { formatTelephoneDisplay } from './phoneCountries';
import { useLearnerToast } from './useLearnerToast';

import defaultProfile from '../../../assets/imgs/default-profile.png';
import badge1 from '../../../assets/icons/badge-1.svg';
import bPencil from '../../../assets/icons/b-pencil.svg';
import leUe from '../../../assets/icons/le-ue.svg';
import leEx from '../../../assets/icons/le-ex.svg';
import leLo from '../../../assets/icons/le-lo.svg';
import userIcon from '../../../assets/icons/user.svg';
import acInn from '../../../assets/icons/ac-inn.svg';
import calendarIcon from '../../../assets/icons/calendar.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import trashIcon from '../../../assets/icons/trash.svg';
import dotsVertical from '../../../assets/icons/dots-vertical.svg';
import exitDown from '../../../assets/icons/exit-down.svg';
import leEm from '../../../assets/icons/le-em.svg';
import AccountQuickLinks from '../learner/AccountQuickLinks';
// import './projects-settings.css';
import './settings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SIGN_IN_PATH = '/auth/signin';

const activityFilters = ['This week', 'Last week', 'This month', 'All time'];

const FIELD_TOOLTIPS = {
  fullName: 'Your display name shown across the platform. Name changes are limited to once every 60 days.',
  email: 'Your primary account email used for sign-in and notifications.',
  telephone: 'Your contact number with country code for account recovery and message notifications.',
  userType: 'Your account type on the Academia platform.',
  role: 'Your professional role or job title shown on your project profile.',
  password: 'Your account password. Use Reset Password to change it.',
};

const FieldInfo = ({ tip }) => (
  <span className="learners-settings-info-trigger" data-tip={tip} tabIndex={0} role="button" aria-label={tip}>
    <img src={acInn} alt="" />
  </span>
);

const SettingsSaveButton = ({ children, disabled, saving, onClick, savingLabel = 'Saving...', className = 'learners-settings-inline-save' }) => (
  <button type="button" className={className} onClick={onClick} disabled={disabled || saving}>
    {saving ? (
      <>
        <HoasButtonSpinner />
        {savingLabel}
      </>
    ) : (
      children
    )}
  </button>
);

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

function ProfessorSettings() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const basicBaselineRef = useRef('');
  const preferencesBaselineRef = useRef('');
  const projectProfileBaselineRef = useRef('');
  const { showToast: pushFeedback } = useLearnerToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState('This week');
  const [projects, setProjects] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [activityItems, setActivityItems] = useState([]);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  const [activityFilterOpen, setActivityFilterOpen] = useState(false);
  const [reviewedActivityIds, setReviewedActivityIds] = useState([]);
  const [notificationEmailEnabled, setNotificationEmailEnabled] = useState(true);
  const [notificationMessageEnabled, setNotificationMessageEnabled] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
  const [twoFactorStage, setTwoFactorStage] = useState('idle');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateStage, setDeactivateStage] = useState('idle');
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateOtp, setDeactivateOtp] = useState('');
  const [deleteStage, setDeleteStage] = useState('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [profileAvatarPath, setProfileAvatarPath] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'instructor',
    visibility: 'public',
    avatar: defaultProfile,
    bio: '',
    address: '',
    country: 'RW',
    state: '',
    city: '',
    postcode: '',
    availableToHire: false,
    emailNotifications: true,
    skills: [],
  });
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [basicDraft, setBasicDraft] = useState({
    name: '',
    phone: '',
    role: 'instructor',
    visibility: 'public',
    bio: '',
    address: '',
    country: 'RW',
    state: '',
    city: '',
    postcode: '',
    availableToHire: false,
    emailNotifications: true,
    skills: [],
  });
  const [preferencesDraft, setPreferencesDraft] = useState({
    language: 'en-us',
    timezone: 'gmt-5-est',
    currency: 'rwf',
    showListNames: false,
    showLinkedTaskNames: true,
    emailVisibility: false,
  });
  const [skillDraft, setSkillDraft] = useState('');
  const [projectProfileDraft, setProjectProfileDraft] = useState({
    jobTitle: '',
    yearsExperience: '',
    bio: '',
    availableToHire: false,
    skills: [],
  });
  const [isProjectProfileEditing, setIsProjectProfileEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [savingProjectProfile, setSavingProjectProfile] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [baselineTick, setBaselineTick] = useState(0);

  const getToken = () => localStorage.getItem('token');

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('Please sign in again.');
    }

    const { timeoutMs = 0, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    if (!(fetchOptions.body instanceof FormData) && fetchOptions.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const controller = timeoutMs > 0 ? new AbortController() : null;
    const timeoutId = controller
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers,
        signal: controller?.signal,
      });

      const json = await response.json().catch(() => null);
      if (!response.ok) {
        const message = json?.error?.message || json?.message || 'Request failed';
        throw new Error(message);
      }

      return json;
    } catch (fetchError) {
      if (fetchError?.name === 'AbortError') {
        throw new Error('Upload timed out. Please try again.');
      }
      throw fetchError;
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }, []);

  const markBasicBaseline = useCallback((draft) => {
    basicBaselineRef.current = serializeBasicDraft(draft);
    setBaselineTick((tick) => tick + 1);
  }, []);

  const markProjectProfileBaseline = useCallback((draft) => {
    projectProfileBaselineRef.current = serializeProjectProfileDraft(draft);
    setBaselineTick((tick) => tick + 1);
  }, []);

  const markPreferencesBaseline = useCallback((draft) => {
    preferencesBaselineRef.current = serializePreferencesDraft(draft);
    setBaselineTick((tick) => tick + 1);
  }, []);

  const loadActivity = useCallback(async (filter) => {
    try {
      const response = await apiFetch(`/api/profile/activity?filter=${encodeURIComponent(filter)}`);
      const items = Array.isArray(response?.data?.items) ? response.data.items : [];
      setActivityItems(items);
    } catch (activityError) {
      setActivityItems([]);
    }
  }, [apiFetch]);

  const openAccountSection = useCallback((section) => {
    navigate(`/professor/account?section=${section}`);
  }, [navigate]);

  const loadSettings = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError('Please sign in to view your settings.');
      return;
    }

    setLoading(true);
    setError('');

    const requests = await Promise.allSettled([
      apiFetch('/api/profile'),
      apiFetch('/api/projects/my'),
      apiFetch('/api/followers/stats'),
      apiFetch('/api/profile/notification-settings'),
      apiFetch('/api/auth/account-status'),
    ]);

    let firstError = '';

    const profileResult = requests[0];
    if (profileResult.status === 'fulfilled') {
      const user = profileResult.value?.data?.user || {};
      const completion = profileResult.value?.data?.completionStatus || null;
      const nextBasicDraft = buildBasicDraftFromUser(user);
      const nextPreferencesDraft = buildPreferencesDraftFromUser(user);
      const avatarUrl = getProfilePhotoDisplayUrl(user.avatar, API_BASE_URL);

      setProfileAvatarPath(user.avatar || '');
      setProfile({
        name: nextBasicDraft.name,
        email: user.email || '',
        phone: nextBasicDraft.phone,
        role: nextBasicDraft.role,
        visibility: nextBasicDraft.visibility,
        avatar: avatarUrl,
        bio: nextBasicDraft.bio,
        address: nextBasicDraft.address,
        country: nextBasicDraft.country,
        state: nextBasicDraft.state,
        city: nextBasicDraft.city,
        postcode: nextBasicDraft.postcode,
        availableToHire: nextBasicDraft.availableToHire,
        emailNotifications: nextBasicDraft.emailNotifications,
        skills: nextBasicDraft.skills,
      });

      const nextProjectProfileDraft = buildProjectProfileDraftFromUser(user);
      setBasicDraft(nextBasicDraft);
      setProjectProfileDraft(nextProjectProfileDraft);
      setPreferencesDraft(nextPreferencesDraft);
      markBasicBaseline(nextBasicDraft);
      markProjectProfileBaseline(nextProjectProfileDraft);
      markPreferencesBaseline(nextPreferencesDraft);
      setProfileCompletion(completion);
    } else {
      firstError = profileResult.reason?.message || 'Failed to load profile data';
    }

    const projectsResult = requests[1];
    if (projectsResult.status === 'fulfilled') {
      const body = projectsResult.value;
      const list = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.data?.data)
          ? body.data.data
          : Array.isArray(body?.projects)
            ? body.projects
            : [];
      setProjects(list);
    }

    const followersResult = requests[2];
    if (followersResult.status === 'fulfilled') {
      setFollowerCount(Number(followersResult.value?.data?.followers || 0));
    }

    const notificationResult = requests[3];
    if (notificationResult.status === 'fulfilled') {
      const settings = notificationResult.value?.data?.settings;
      if (settings) {
        setNotificationEmailEnabled(Boolean(settings.emailEnabled));
        setNotificationMessageEnabled(Boolean(settings.messagesEnabled));
      }
    }

    const accountResult = requests[4];
    if (accountResult.status === 'fulfilled') {
      setAccountStatus(accountResult.value?.data || accountResult.value || null);
    }

    if (firstError) {
      setError(firstError);
    }

    setLoading(false);
    await loadActivity(activityFilter);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (loading) return;
    loadActivity(activityFilter);
  }, [activityFilter, loading, loadActivity]);

  const profileCompletionValue = Number(profileCompletion?.profile_percentage ?? profileCompletion?.profilePercentage ?? 0);
  const headerBadgeValue = projects.length || Math.round(profileCompletionValue);

  const projectStats = useMemo(() => {
    const totals = projects.reduce((acc, project) => ({
      views: acc.views + Number(project.views_count || project.views || 0),
      likes: acc.likes + Number(project.likes_count || project.likes || 0),
      feedbacks: acc.feedbacks + Number(project.comments_count || project.feedbacks_count || 0),
    }), { views: 0, likes: 0, feedbacks: 0 });

    return [
      { label: 'Project Views', value: formatNumber(totals.views) },
      { label: 'Project Likes', value: formatNumber(totals.likes) },
      { label: 'Project Feedbacks', value: formatNumber(totals.feedbacks) },
    ];
  }, [projects]);

  const userTypeLabel = formatRoleLabel(profile.role);
  const jobTitleLabel = projectProfileDraft.jobTitle?.trim() || '—';
  const telephoneDisplay = formatTelephoneDisplay(profile.phone, profile.country);
  const notificationsMasterEnabled = notificationEmailEnabled || notificationMessageEnabled;
  const is2FAEnabled = Boolean(accountStatus?.twoFactorEnabled);
  const isAccountActive = accountStatus?.isActive !== false && accountStatus?.is_active !== false;
  const experienceLabel = formatExperienceLabel(projectProfileDraft.yearsExperience);
  const followersLabel = `${formatNumber(followerCount)} Followers`;
  const locationLabel = formatLocationDisplay(profile);
  const aboutPreview = projectProfileDraft.bio || 'No bio has been added yet. Share your experience and interests here.';
  const aboutDisplay = aboutExpanded || aboutPreview.length <= 140
    ? aboutPreview
    : `${aboutPreview.slice(0, 140).trim()}...`;

  const activityToneClass = (tone) => {
    if (tone === 'success') return 'green';
    if (tone === 'warning') return 'orange';
    return 'blue';
  };

  const visibleActivityItems = activityItems.filter((item) => !reviewedActivityIds.includes(item.id));

  const hasCustomProfilePhoto = useMemo(
    () => isCustomProfilePhoto(profileAvatarPath),
    [profileAvatarPath]
  );

  const projectProfileDirty = useMemo(() => {
    void baselineTick;
    if (!projectProfileBaselineRef.current) return false;
    return serializeProjectProfileDraft(projectProfileDraft) !== projectProfileBaselineRef.current;
  }, [baselineTick, projectProfileDraft]);

  const basicDirty = useMemo(() => {
    void baselineTick;
    if (!basicBaselineRef.current) return false;
    return serializeBasicDraft(basicDraft) !== basicBaselineRef.current;
  }, [baselineTick, basicDraft]);

  const resetProjectProfileDraft = () => {
    if (!projectProfileBaselineRef.current) return;
    setProjectProfileDraft(JSON.parse(projectProfileBaselineRef.current));
  };

  const preferencesDirty = useMemo(() => {
    void baselineTick;
    if (!preferencesBaselineRef.current) return false;
    return serializePreferencesDraft(preferencesDraft) !== preferencesBaselineRef.current;
  }, [baselineTick, preferencesDraft]);

  const resetBasicDraft = () => {
    if (!basicBaselineRef.current) return;
    const baseline = JSON.parse(basicBaselineRef.current);
    setBasicDraft({
      ...baseline,
      role: profile.role,
    });
  };

  const resetPreferencesDraft = () => {
    if (!preferencesBaselineRef.current) return;
    setPreferencesDraft(JSON.parse(preferencesBaselineRef.current));
  };

  const saveProjectProfile = async () => {
    if (!projectProfileDirty) return;

    setSavingProjectProfile(true);
    setError('');

    try {
      const response = await apiFetch('/api/profile/project-profile', {
        method: 'PUT',
        body: JSON.stringify({
          jobTitle: projectProfileDraft.jobTitle.trim(),
          yearsExperience: projectProfileDraft.yearsExperience === '' ? null : Number(projectProfileDraft.yearsExperience),
          bio: projectProfileDraft.bio,
          skills: projectProfileDraft.skills,
          availableToHire: projectProfileDraft.availableToHire,
        }),
      });

      const user = response?.data?.user || {};
      const nextProjectProfileDraft = buildProjectProfileDraftFromUser({
        ...user,
        skills: user.skills || projectProfileDraft.skills,
      });

      setProjectProfileDraft(nextProjectProfileDraft);
      markProjectProfileBaseline(nextProjectProfileDraft);
      setProfile((current) => ({
        ...current,
        bio: nextProjectProfileDraft.bio,
        availableToHire: nextProjectProfileDraft.availableToHire,
        skills: nextProjectProfileDraft.skills,
      }));
      setIsProjectProfileEditing(false);
      setIsAboutEditing(false);
      setIsSkillsEditing(false);
      pushFeedback('Project profile saved.', 'success');
    } catch (saveError) {
      pushFeedback(saveError.message || 'Could not save project profile. Please try again.', 'error');
    } finally {
      setSavingProjectProfile(false);
    }
  };

  const closePhotoCropModal = useCallback(() => {
    setCropModalOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  }, [cropImageSrc]);

  const handlePhotoFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setUploadError('This image is too large. Please choose an image under 5 MB.');
      return;
    }

    setUploadError('');
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropModalOpen(true);
  };

  const handlePhotoUpload = async (fileOrBlob, originalName = 'profile-photo.png') => {
    if (!fileOrBlob) return;

    if (fileOrBlob.size > MAX_PROFILE_PHOTO_BYTES) {
      setUploadError('This image is too large. Please choose an image under 5 MB.');
      return;
    }

    try {
      setPhotoUploading(true);
      setUploadError('');
      const formData = new FormData();
      const mimeType = fileOrBlob.type || 'image/png';
      const uploadFile = fileOrBlob instanceof File
        ? fileOrBlob
        : new File([fileOrBlob], originalName, { type: mimeType });
      formData.append('photo', uploadFile);

      const response = await apiFetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
        timeoutMs: 45000,
      });

      const nextPath = response?.data?.photoUrl || response?.data?.avatar || response?.data?.user?.avatar || '';
      setProfileAvatarPath(nextPath);
      setProfile((current) => ({
        ...current,
        avatar: getProfilePhotoDisplayUrl(nextPath, API_BASE_URL),
      }));
      pushFeedback('Profile photo updated.', 'success');
    } catch (uploadError) {
      pushFeedback(uploadError.message || 'Couldn\'t upload photo. Please try again.', 'error');
      throw uploadError;
    } finally {
      setPhotoUploading(false);
    }
  };

  const handlePhotoCropConfirm = (blob) => {
    closePhotoCropModal();
    handlePhotoUpload(blob, `profile-photo-${Date.now()}.png`).catch(() => {});
  };

  const handlePhotoReset = async () => {
    try {
      setPhotoUploading(true);
      await apiFetch('/api/profile/photo', { method: 'DELETE' });
      setProfileAvatarPath('');
      setProfile((current) => ({ ...current, avatar: defaultProfile }));
      pushFeedback('Profile photo reset.', 'success');
    } catch (resetError) {
      pushFeedback(resetError.message || 'Couldn\'t reset profile photo. Please try again.', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleProfileImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = defaultProfile;
  };

  const toggleAvailability = () => {
    setProjectProfileDraft((current) => ({ ...current, availableToHire: !current.availableToHire }));
  };

  const addSkill = () => {
    const nextSkill = skillDraft.trim();
    if (!nextSkill) {
      pushFeedback('Type a skill before adding it.', 'error');
      return;
    }

    setProjectProfileDraft((current) => ({
      ...current,
      skills: Array.from(new Set([...current.skills, nextSkill])),
    }));
    setSkillDraft('');
  };

  const removeSkill = (skill) => {
    if (!isSkillsEditing) return;
    setProjectProfileDraft((current) => ({
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

  const handleClearAllActivity = () => {
    if (!visibleActivityItems.length) return;
    setReviewedActivityIds((current) => Array.from(new Set([
      ...current,
      ...visibleActivityItems.map((item) => item.id),
    ])));
    pushFeedback('Activity cleared.', 'success');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.next) {
      pushFeedback('Enter your current and new password.', 'error');
      return;
    }

    if (passwordForm.next.length < 6) {
      pushFeedback('New password must be at least 6 characters.', 'error');
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      pushFeedback('New passwords do not match.', 'error');
      return;
    }

    try {
      setPasswordSaving(true);
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setShowPasswordForm(false);
      pushFeedback('Password changed successfully.', 'success');
    } catch (passwordError) {
      pushFeedback(passwordError.message || 'Couldn\'t change password. Please try again.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const startEnableTwoFactor = async () => {
    try {
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/enable-2fa', { method: 'POST' });
      setTwoFactorStage('enable-pending');
      setTwoFactorOtp('');
      pushFeedback('Verification code sent to your email.', 'success');
    } catch (twoFactorError) {
      pushFeedback(twoFactorError.message || 'Couldn\'t start two-factor setup. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyEnableTwoFactor = async () => {
    if (twoFactorOtp.trim().length !== 6) {
      pushFeedback('Enter the 6-digit code from your email.', 'error');
      return;
    }

    try {
      setTwoFactorProcessing(true);
      const res = await apiFetch('/api/auth/verify-otp-enable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setAccountStatus((current) => ({
        ...(current || {}),
        twoFactorEnabled: Boolean(res?.data?.twoFactorEnabled ?? true),
      }));
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication enabled.', 'success');
    } catch (twoFactorError) {
      pushFeedback(twoFactorError.message || 'Couldn\'t enable two-factor authentication. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const startDisableTwoFactor = async () => {
    try {
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/disable-2fa', { method: 'POST' });
      setTwoFactorStage('disable-pending');
      setTwoFactorOtp('');
      pushFeedback('Verification code sent to your email.', 'success');
    } catch (twoFactorError) {
      pushFeedback(twoFactorError.message || 'Couldn\'t start two-factor disable. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyDisableTwoFactor = async () => {
    if (twoFactorOtp.trim().length !== 6) {
      pushFeedback('Enter the 6-digit code from your email.', 'error');
      return;
    }

    try {
      setTwoFactorProcessing(true);
      const res = await apiFetch('/api/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setAccountStatus((current) => ({
        ...(current || {}),
        twoFactorEnabled: Boolean(res?.data?.twoFactorEnabled ?? false),
      }));
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication disabled.', 'success');
    } catch (twoFactorError) {
      pushFeedback(twoFactorError.message || 'Couldn\'t disable two-factor authentication. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const cancelTwoFactorFlow = () => {
    setTwoFactorStage('idle');
    setTwoFactorOtp('');
  };

  const handleRequestDeactivateAccount = async () => {
    if (!confirmDeactivation) {
      pushFeedback('Please confirm account deactivation.', 'error');
      return;
    }

    if (!deactivatePassword) {
      pushFeedback('Enter your current password to continue.', 'error');
      return;
    }

    try {
      setDeactivating(true);
      await apiFetch('/api/auth/request-deactivate-account', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: deactivatePassword }),
      });
      setDeactivateStage('otp-pending');
      pushFeedback('Verification code sent to your email.', 'success');
    } catch (deactivateError) {
      pushFeedback(deactivateError.message || 'Could not start account deactivation.', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleConfirmDeactivateAccount = async () => {
    if (!confirmDeactivation) {
      pushFeedback('Please confirm account deactivation.', 'error');
      return;
    }

    if (deactivateOtp.trim().length !== 6) {
      pushFeedback('Enter the 6-digit verification code.', 'error');
      return;
    }

    try {
      setDeactivating(true);
      await apiFetch('/api/auth/confirm-deactivate-account', {
        method: 'POST',
        body: JSON.stringify({
          otp: deactivateOtp.trim(),
          reason: 'User requested deactivation from settings',
        }),
      });
      localStorage.removeItem('token');
      navigate(SIGN_IN_PATH);
    } catch (deactivateError) {
      pushFeedback(deactivateError.message || 'Could not deactivate account. Please try again.', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleRequestDeleteAccount = async () => {
    if (!deletePassword) {
      pushFeedback('Enter your current password to continue.', 'error');
      return;
    }

    try {
      setDeletingAccount(true);
      await apiFetch('/api/auth/request-delete-account', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: deletePassword }),
      });
      setDeleteStage('otp-pending');
      pushFeedback('Verification code sent to your email.', 'success');
    } catch (deleteError) {
      pushFeedback(deleteError.message || 'Could not start account deletion.', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!confirmDeletion) {
      pushFeedback('Please confirm account deletion.', 'error');
      return;
    }

    if (deleteOtp.trim().length !== 6) {
      pushFeedback('Enter the 6-digit verification code.', 'error');
      return;
    }

    try {
      setDeletingAccount(true);
      await apiFetch('/api/auth/confirm-delete-account', {
        method: 'POST',
        body: JSON.stringify({ otp: deleteOtp.trim() }),
      });
      localStorage.removeItem('token');
      navigate(SIGN_IN_PATH);
    } catch (deleteError) {
      pushFeedback(deleteError.message || 'Could not delete account. Please try again.', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const openProjectsUpload = () => {
    navigate('/professor/projects');
  };

  return (
    <>
      <section className="learners-settings-page learners-projects-page" onClick={(event) => {
        if (!event.target.closest('.learners-settings-activity-menu')) setOpenActivityMenuId(null);
        if (!event.target.closest('.learners-settings-activity-filter-wrap')) setActivityFilterOpen(false);
      }}>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            handlePhotoFileSelect(event.target.files?.[0]);
            event.target.value = '';
          }}
        />

        <section className="learners-projects-profile-strip">
          <div className="learners-projects-profile-strip-main">
            <div className="learners-projects-profile-avatar learners-settings-profile-avatar">
              <img src={profile.avatar} alt={profile.name || 'Profile'} onError={handleProfileImageError} />
            </div>

            <div className="learners-projects-profile-copy">
              <div className="learners-projects-profile-name-row">
                <h1>{profile.name || 'Loading profile...'}</h1>
                <span className={`learners-projects-status-badge ${isAccountActive ? '' : 'is-inactive'}`}>
                  {isAccountActive ? 'Active' : 'Inactive'}
                </span>
                <span className="learners-projects-count-badge">
                  <img src={badge1} alt="Badge" />
                  <span>{headerBadgeValue}</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{userTypeLabel}</span>
                <span>&bull;</span>
                <span>{profile.email || 'No email on file'}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button type="button" className="learners-projects-primary-btn" onClick={openProjectsUpload}>
              <span>Upload new project</span>
              <img src={exitDown} alt="Upload" />
            </button>
            <button type="button" className="learners-projects-secondary-btn" onClick={() => navigate('/professor/account')}>
              Account settings
            </button>
          </div>
        </section>

        {uploadError && (
          <div className="learners-settings-feedback is-warning">
            {uploadError}
          </div>
        )}

        {error && (
          <LearnerLoadError
            title={error === 'Please sign in to view your settings.' ? 'Sign in required' : 'Could not load settings'}
            message={error}
            onRetry={error === 'Please sign in to view your settings.' ? undefined : loadSettings}
          />
        )}

        <section className="learners-settings-shell">
          <aside className="learners-settings-side learners-projects-side">
            <div className="learners-projects-section-head learners-projects-section-head-side">
              <div>
                <h2>Project Profile</h2>
                <p>Bio &amp; All about your experience</p>
              </div>
            </div>

            <div className="learners-projects-side-card learners-projects-side-card-profile">
              <div className="learners-projects-side-card-head">
                <span
                  className="learners-projects-availability"
                  role="button"
                  tabIndex={0}
                  onClick={toggleAvailability}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleAvailability();
                    }
                  }}
                >
                  {projectProfileDraft.availableToHire ? 'Available Now' : 'Not available'}
                </span>
                <button
                  type="button"
                  className="learners-projects-edit-btn"
                  onClick={() => setIsProjectProfileEditing((current) => !current)}
                >
                  <img src={bPencil} alt="Edit" />
                  <span>{isProjectProfileEditing ? 'Editing' : 'Edit'}</span>
                </button>
              </div>

              {isProjectProfileEditing ? (
                <div className="learners-settings-side-form" style={{ marginTop: 12 }}>
                  <input
                    type="text"
                    className="learners-settings-inline-input"
                    placeholder="Job title (e.g. UI/UX Designer)"
                    value={projectProfileDraft.jobTitle}
                    onChange={(event) => setProjectProfileDraft((current) => ({ ...current, jobTitle: event.target.value }))}
                  />
                  <input
                    type="number"
                    min="0"
                    className="learners-settings-inline-input"
                    placeholder="Years of experience"
                    value={projectProfileDraft.yearsExperience}
                    onChange={(event) => setProjectProfileDraft((current) => ({ ...current, yearsExperience: event.target.value }))}
                  />
                  <div className="learners-settings-inline-actions">
                    <SettingsSaveButton onClick={saveProjectProfile} disabled={!projectProfileDirty} saving={savingProjectProfile}>
                      Save profile
                    </SettingsSaveButton>
                    <button
                      type="button"
                      className="learners-settings-inline-cancel"
                      onClick={() => {
                        resetProjectProfileDraft();
                        setIsProjectProfileEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="learners-projects-side-list">
                  <div><img src={leUe} alt="Job title" /><span>{jobTitleLabel}</span></div>
                  <div><img src={leEx} alt="Experience" /><span>{experienceLabel}</span></div>
                  <div><img src={leLo} alt="Location" /><span>{locationLabel}</span></div>
                </div>
              )}

              <div className="learners-projects-followers-row">
                <img src={userIcon} alt="Followers" />
                <span>{followersLabel}</span>
              </div>

              <button
                type="button"
                className="learners-projects-email-btn"
                onClick={() => openAccountSection('email')}
              >
                <span>Edit E-mail</span>
                <img src={leEm} alt="Email" />
              </button>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>About</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={() => setIsAboutEditing((current) => !current)}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>

              {!isAboutEditing ? (
                <p className="learners-projects-side-paragraph">
                  {aboutDisplay}
                  {aboutPreview.length > 140 && !aboutExpanded && (
                    <>
                      {' '}
                      <button type="button" className="learners-settings-read-more" onClick={() => setAboutExpanded(true)}>
                        Read more
                      </button>
                    </>
                  )}
                </p>
              ) : (
                <div className="learners-settings-about-editor learners-settings-side-form">
                  <textarea
                    className="learners-settings-textarea"
                    value={projectProfileDraft.bio}
                    onChange={(event) => setProjectProfileDraft((current) => ({ ...current, bio: event.target.value }))}
                  />
                  <div className="learners-settings-inline-actions">
                    <SettingsSaveButton onClick={saveProjectProfile} disabled={!projectProfileDirty} saving={savingProjectProfile} savingLabel="Saving bio...">
                      Save bio
                    </SettingsSaveButton>
                    <button
                      type="button"
                      className="learners-settings-inline-cancel"
                      onClick={() => {
                        resetProjectProfileDraft();
                        setIsAboutEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Projects Stats</h3>
              </div>
              <div className="learners-projects-stats-list">
                {projectStats.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="learners-projects-side-card">
              <div className="learners-projects-side-card-head">
                <h3>Tools &amp; Skills</h3>
                <button type="button" className="learners-projects-icon-edit" onClick={() => setIsSkillsEditing((current) => !current)}>
                  <img src={bPencil} alt="Edit" />
                </button>
              </div>

              <div className={`learners-projects-skills-list ${isSkillsEditing ? 'is-editing' : ''}`}>
                {projectProfileDraft.skills.length ? projectProfileDraft.skills.map((skill) => (
                  <span key={skill} className="learners-settings-skill-row">
                    <span>{skill}</span>
                    {isSkillsEditing && (
                      <button type="button" className="learners-settings-skill-remove-btn" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                        <img src={trashIcon} alt="Remove" />
                      </button>
                    )}
                  </span>
                )) : (
                  <span>No skills saved yet.</span>
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
                    <SettingsSaveButton onClick={saveProjectProfile} disabled={!projectProfileDirty} saving={savingProjectProfile} savingLabel="Saving skills...">
                      Save skills
                    </SettingsSaveButton>
                    <button
                      type="button"
                      className="learners-settings-inline-cancel"
                      onClick={() => {
                        resetProjectProfileDraft();
                        setIsSkillsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="learners-settings-main">
            <ul className="nav learners-settings-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button type="button" className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  Overview
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
                  <div className="learners-settings-empty-state learners-settings-activity-empty">
                    <strong>Loading settings</strong>
                    <span>Loading your teaching profile and activity.</span>
                  </div>
                </article>
              ) : null}

              {!loading && activeTab === 'overview' && (
                <section className="tab-pane fade show active learners-settings-overview-stack">
                  <article className="learners-settings-panel">
                    <div className="learners-settings-panel-head">
                      <h3>Profile Information</h3>
                      <button type="button" className="learners-settings-edit-btn" onClick={() => openAccountSection('general')}>
                        <img src={bPencil} alt="Edit" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="learners-settings-form-grid">
                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Full Name</label>
                          <FieldInfo tip={FIELD_TOOLTIPS.fullName} />
                        </div>
                        <div className="learners-settings-field-value learners-settings-field-control is-plain">{profile.name || '—'}</div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>E-mail</label>
                          <FieldInfo tip={FIELD_TOOLTIPS.email} />
                        </div>
                        <div className="learners-settings-field-value learners-settings-field-control is-plain">{profile.email || '—'}</div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Telephone</label>
                          <FieldInfo tip={FIELD_TOOLTIPS.telephone} />
                        </div>
                        <div className="learners-settings-field-value learners-settings-field-control is-plain">{telephoneDisplay}</div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>User Type</label>
                          <FieldInfo tip={FIELD_TOOLTIPS.userType} />
                        </div>
                        <div className="learners-settings-field-value learners-settings-field-control is-plain">{userTypeLabel}</div>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Role</label>
                          <FieldInfo tip={FIELD_TOOLTIPS.role} />
                        </div>
                        <div className="learners-settings-field-value learners-settings-field-control is-plain">{jobTitleLabel}</div>
                      </div>
                    </div>

                    <p className="learners-settings-side-hint">
                      Name, phone, email, and address are managed on your Account page.
                    </p>
                  </article>

                  <AccountQuickLinks
                    audience="professor"
                    onOpenSection={openAccountSection}
                    notificationEmailEnabled={notificationEmailEnabled}
                    notificationMessageEnabled={notificationMessageEnabled}
                  />
                </section>
              )}

              {!loading && activeTab === 'activity' && (
                <section className="tab-pane fade show active">
                  <article className="learners-settings-panel learners-settings-activity-panel">
                    <div className="learners-settings-activity-head">
                      <h3>Recent Activity</h3>
                      <div className="learners-settings-activity-actions">
                        <div className="learners-settings-activity-filter-wrap">
                          <button
                            className="learners-settings-activity-filter"
                            type="button"
                            aria-expanded={activityFilterOpen}
                            onClick={() => setActivityFilterOpen((current) => !current)}
                          >
                            <img src={calendarIcon} alt="Calendar" />
                            <span>{activityFilter}</span>
                            <img src={drop1} alt="Dropdown" />
                          </button>
                          {activityFilterOpen ? (
                            <ul className="learners-settings-activity-filter-menu learners-settings-activity-filter-menu-open">
                              {activityFilters.map((filterOption) => (
                                <li key={filterOption}>
                                  <button
                                    className={`dropdown-item ${activityFilter === filterOption ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => {
                                      setActivityFilter(filterOption);
                                      setActivityFilterOpen(false);
                                    }}
                                  >
                                    {filterOption}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>

                        <button type="button" className="learners-settings-activity-clear-btn" onClick={handleClearAllActivity}>
                          <img src={trashIcon} alt="Clear" />
                          <span>Clear all</span>
                        </button>
                      </div>
                    </div>

                    <div className="learners-settings-activity-list">
                      {visibleActivityItems.length === 0 ? (
                        <div className="learners-settings-activity-empty">
                          <strong>No recent account activity</strong>
                          <span>Documents, certificates, and payment methods will appear here once your account has activity.</span>
                        </div>
                      ) : (
                        visibleActivityItems.map((item) => (
                          <article key={item.id} className={`learners-settings-activity-item learners-settings-activity-item-${activityToneClass(item.tone)} ${reviewedActivityIds.includes(item.id) ? 'is-reviewed' : ''}`}>
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

                              <div className={`learners-settings-activity-popover ${openActivityMenuId === item.id ? 'is-open' : ''}`}>
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

      <ProfilePhotoCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={closePhotoCropModal}
        onConfirm={handlePhotoCropConfirm}
        exporting={photoUploading}
      />
    </>
  );
}

export default ProfessorSettings;