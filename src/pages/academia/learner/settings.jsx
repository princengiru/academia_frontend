import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnersPageShell from './LearnersPageShell';
import ProfilePhotoCropModal from './ProfilePhotoCropModal';
import HoasButtonSpinner from './HoasButtonSpinner';
import { getProfilePhotoDisplayUrl, isCustomProfilePhoto } from './profilePhotoUtils';
import {
  buildBasicDraftFromUser,
  buildPreferencesDraftFromUser,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  formatAddressDisplay,
  formatRwandaPhoneNumber,
  LANGUAGE_OPTIONS,
  mapLanguageToApi,
  MAX_PROFILE_PHOTO_BYTES,
  serializeBasicDraft,
  serializePreferencesDraft,
  TIMEZONE_OPTIONS,
} from './learnerProfileShared';

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
import calendarIcon from '../../../assets/icons/calendar.svg';
import drop1 from '../../../assets/icons/drop1.svg';
import trashIcon from '../../../assets/icons/trash.svg';
import dotsVertical from '../../../assets/icons/dots-vertical.svg';
import './settings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const activityFilters = ['This week', 'Last week', 'This month', 'All time'];

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

function LearnersSettings() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const basicBaselineRef = useRef('');
  const preferencesBaselineRef = useRef('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [activityFilter, setActivityFilter] = useState('This month');
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  const [reviewedActivityIds, setReviewedActivityIds] = useState([]);

  const [profileAvatarPath, setProfileAvatarPath] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
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
  const [accountStatus, setAccountStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificateStats, setCertificateStats] = useState(null);

  const [basicDraft, setBasicDraft] = useState({
    name: '',
    phone: '',
    role: 'student',
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
    timezone: TIMEZONE_OPTIONS[0].value,
    currency: 'usd',
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
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
  const [twoFactorStage, setTwoFactorStage] = useState('idle');
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [baselineTick, setBaselineTick] = useState(0);

  const pushFeedback = useCallback((message, type = 'success') => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    setFeedback({ type, message });
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback({ type: '', message: '' });
      feedbackTimerRef.current = null;
    }, 3500);
  }, []);

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

  const markPreferencesBaseline = useCallback((draft) => {
    preferencesBaselineRef.current = serializePreferencesDraft(draft);
    setBaselineTick((tick) => tick + 1);
  }, []);

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
      apiFetch('/api/profile/documents'),
      apiFetch('/api/profile/payment-methods'),
      apiFetch('/api/certificates/user/statistics'),
      apiFetch('/api/certificates/user/my-certificates?limit=6&offset=0'),
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

      setBasicDraft(nextBasicDraft);
      setPreferencesDraft(nextPreferencesDraft);
      markBasicBaseline(nextBasicDraft);
      markPreferencesBaseline(nextPreferencesDraft);
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

  const profileAddressLabel = useMemo(
    () => formatAddressDisplay(profile),
    [profile]
  );

  const visibleActivityItems = activityItems.filter((item) => !reviewedActivityIds.includes(item.id));

  const hasCustomProfilePhoto = useMemo(
    () => isCustomProfilePhoto(profileAvatarPath),
    [profileAvatarPath]
  );

  const basicDirty = useMemo(() => {
    void baselineTick;
    if (!basicBaselineRef.current) return false;
    return serializeBasicDraft(basicDraft) !== basicBaselineRef.current;
  }, [baselineTick, basicDraft]);

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

  const startEnableTwoFactor = async () => {
    try {
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/enable-2fa', { method: 'POST' });
      setTwoFactorStage('enable-pending');
      setTwoFactorOtp('');
      pushFeedback('Verification code sent to your email.', 'success');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t start two-factor setup. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyEnableTwoFactor = async () => {
    try {
      if (twoFactorOtp.trim().length !== 6) throw new Error('Enter the 6-digit code from your email.');
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/verify-otp-enable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication enabled.', 'success');
      await loadSettings();
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t enable two-factor authentication. Please try again.', 'error');
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
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t start two-factor disable. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyDisableTwoFactor = async () => {
    try {
      if (twoFactorOtp.trim().length !== 6) throw new Error('Enter the 6-digit code from your email.');
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication disabled.', 'success');
      await loadSettings();
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t disable two-factor authentication. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const cancelTwoFactorFlow = () => {
    setTwoFactorStage('idle');
    setTwoFactorOtp('');
  };

  const saveBasicProfile = async () => {
    if (!basicDirty) return;

    setSavingBasic(true);
    setError('');

    try {
      const response = await apiFetch('/api/profile/complete', {
        method: 'PUT',
        body: JSON.stringify({
          name: basicDraft.name.trim(),
          phone: basicDraft.phone.replace(/\s/g, ''),
          role: profile.role,
          visibility: basicDraft.visibility,
          bio: basicDraft.bio,
          address: basicDraft.address,
          country: basicDraft.country,
          state: basicDraft.state,
          city: basicDraft.city,
          postcode: basicDraft.postcode,
          skills: basicDraft.skills,
          availableToHire: basicDraft.availableToHire,
          emailNotifications: basicDraft.emailNotifications,
        }),
      });

      const user = response?.data?.user || {};
      const completion = response?.data?.profilePercentage;
      const nextBasicDraft = buildBasicDraftFromUser({ ...user, skills: user.skills || basicDraft.skills });

      setProfile((current) => ({
        ...current,
        name: nextBasicDraft.name,
        email: user.email || current.email,
        phone: nextBasicDraft.phone,
        role: nextBasicDraft.role,
        visibility: nextBasicDraft.visibility,
        bio: nextBasicDraft.bio,
        address: nextBasicDraft.address,
        country: nextBasicDraft.country,
        state: nextBasicDraft.state,
        city: nextBasicDraft.city,
        postcode: nextBasicDraft.postcode,
        availableToHire: nextBasicDraft.availableToHire,
        emailNotifications: nextBasicDraft.emailNotifications,
        skills: nextBasicDraft.skills,
      }));
      setBasicDraft(nextBasicDraft);
      markBasicBaseline(nextBasicDraft);
      setProfileCompletion((current) => ({ ...(current || {}), profile_percentage: completion ?? current?.profile_percentage ?? 0 }));
      setIsBasicEditing(false);
      setIsAboutEditing(false);
      setIsSkillsEditing(false);
      pushFeedback('Profile saved.', 'success');
    } catch (saveError) {
      pushFeedback(saveError.message || 'Couldn\'t save profile. Please try again.', 'error');
    } finally {
      setSavingBasic(false);
    }
  };

  const savePreferences = async () => {
    if (!preferencesDirty) return;

    setSavingPreferences(true);
    setError('');

    try {
      const response = await apiFetch('/api/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          language: mapLanguageToApi(preferencesDraft.language),
          timezone: preferencesDraft.timezone,
          currency: preferencesDraft.currency.toUpperCase(),
          showListNames: preferencesDraft.showListNames,
          showLinkedTaskNames: preferencesDraft.showLinkedTaskNames,
          emailVisibility: preferencesDraft.emailVisibility,
        }),
      });

      const user = response?.data?.user || {};
      const nextPreferencesDraft = buildPreferencesDraftFromUser(user);
      setPreferencesDraft(nextPreferencesDraft);
      markPreferencesBaseline(nextPreferencesDraft);
      setProfileCompletion((current) => ({
        ...(current || {}),
        profile_percentage: response?.data?.profilePercentage ?? current?.profile_percentage ?? 0,
      }));
      setIsPreferencesEditing(false);
      pushFeedback('Preferences saved.', 'success');
    } catch (saveError) {
      pushFeedback(saveError.message || 'Couldn\'t save preferences. Please try again.', 'error');
    } finally {
      setSavingPreferences(false);
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
      pushFeedback('Password changed successfully.');
    } catch (changeError) {
      pushFeedback(changeError.message || 'Couldn\'t change password. Please try again.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleAvailability = () => {
    setBasicDraft((current) => ({ ...current, availableToHire: !current.availableToHire }));
  };

  const addSkill = () => {
    const nextSkill = skillDraft.trim();
    if (!nextSkill) {
      pushFeedback('Type a skill before adding it.', 'error');
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
    <LearnersPageShell>
      <section className="learners-settings-page" onClick={(event) => { if (!event.target.closest('.learners-settings-activity-menu')) setOpenActivityMenuId(null); }}>
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
                  <span>{Math.round(profileCompletionValue)}%</span>
                </span>
              </div>

              <div className="learners-projects-profile-meta">
                <span>{profile.role || 'Learner'}</span>
                <span>&bull;</span>
                <span>{profile.email || 'No email on file'}</span>
              </div>
            </div>
          </div>

          <div className="learners-projects-profile-actions">
            <button
              type="button"
              className="learners-projects-secondary-btn"
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
            >
              {photoUploading ? 'Uploading...' : hasCustomProfilePhoto ? 'Change Photo' : 'Upload Photo'}
            </button>
            {hasCustomProfilePhoto && (
              <button
                type="button"
                className="learners-projects-secondary-btn"
                onClick={handlePhotoReset}
                disabled={photoUploading}
              >
                Remove Photo
              </button>
            )}
            <button type="button" className="learners-projects-primary-btn" onClick={() => navigate('/academia/learner/account')}>
              Open Account
            </button>
          </div>
        </section>

        {uploadError && (
          <div className="learners-settings-feedback is-warning">
            {uploadError}
          </div>
        )}

        {error && (
          <div className="learners-settings-feedback is-warning">
            {error}
          </div>
        )}

        {feedback.message && (
          <div
            style={{
              position: 'fixed',
              top: 18,
              right: 18,
              zIndex: 9999,
              background: feedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              color: feedback.type === 'error' ? '#991B1B' : '#166534',
              border: `1px solid ${feedback.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
              padding: '10px 12px',
              borderRadius: 10,
              maxWidth: 420,
              fontSize: 13,
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            }}
            role="status"
            aria-live="polite"
          >
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
                <div><img src={leUe} alt="Role" /><span>{profile.role || 'Learner'}</span></div>
                <div><img src={leEx} alt="Visibility" /><span>{profile.visibility === 'private' ? 'Private profile' : 'Public profile'}</span></div>
                <div><img src={leLo} alt="Address" /><span>{profileAddressLabel}</span></div>
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

              {basicDirty && (
                <p className="learners-settings-side-hint">You have unsaved profile changes. Save them from Overview.</p>
              )}

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
                    <SettingsSaveButton onClick={saveBasicProfile} disabled={!basicDirty} saving={savingBasic} savingLabel="Saving bio...">
                      Save bio
                    </SettingsSaveButton>
                    <button
                      type="button"
                      className="learners-settings-inline-cancel"
                      onClick={() => {
                        resetBasicDraft();
                        setIsAboutEditing(false);
                      }}
                    >
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
                  <div className="learners-settings-about-copy">No skills saved to your account yet.</div>
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
                    <SettingsSaveButton onClick={saveBasicProfile} disabled={!basicDirty} saving={savingBasic} savingLabel="Saving skills...">
                      Save skills
                    </SettingsSaveButton>
                    <button
                      type="button"
                      className="learners-settings-inline-cancel"
                      onClick={() => {
                        resetBasicDraft();
                        setIsSkillsEditing(false);
                      }}
                    >
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
                  <div className="learners-settings-empty-state learners-settings-activity-empty">
                    <strong>Loading settings</strong>
                    <span>Loading your profile, preferences, certificates, and account status.</span>
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
                            onChange={(event) => setBasicDraft((current) => ({
                              ...current,
                              phone: formatRwandaPhoneNumber(event.target.value),
                            }))}
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
                          value={profile.role}
                          readOnly
                          disabled
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

                      <div className="learners-settings-field is-full">
                        <div className="learners-settings-field-head">
                          <label>Address</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.address}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, address: event.target.value }))}
                          disabled={!isBasicEditing}
                          placeholder="Street address"
                        />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Country</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <select
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.country}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, country: event.target.value }))}
                          disabled={!isBasicEditing}
                        >
                          {COUNTRY_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>{option.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>State</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.state}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, state: event.target.value }))}
                          disabled={!isBasicEditing}
                          placeholder="State"
                        />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>City</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.city}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, city: event.target.value }))}
                          disabled={!isBasicEditing}
                          placeholder="City"
                        />
                      </div>

                      <div className="learners-settings-field">
                        <div className="learners-settings-field-head">
                          <label>Postcode</label>
                          <img src={acInn} alt="Info" />
                        </div>
                        <input
                          type="text"
                          className="learners-settings-field-value learners-settings-field-control"
                          value={basicDraft.postcode}
                          onChange={(event) => setBasicDraft((current) => ({ ...current, postcode: event.target.value }))}
                          disabled={!isBasicEditing}
                          placeholder="Postcode"
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
                              disabled={!isBasicEditing}
                            />
                            <span>Available to hire</span>
                          </label>
                          <label>
                            <button
                              type="button"
                              className={`learners-settings-switch ${basicDraft.emailNotifications ? 'is-on' : ''}`}
                              onClick={() => setBasicDraft((current) => ({ ...current, emailNotifications: !current.emailNotifications }))}
                              aria-pressed={basicDraft.emailNotifications}
                              disabled={!isBasicEditing}
                            />
                            <span>Email notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="learners-settings-inline-actions" style={{ marginTop: 18 }}>
                      <SettingsSaveButton onClick={saveBasicProfile} disabled={!basicDirty} saving={savingBasic} savingLabel="Saving profile...">
                        Save profile
                      </SettingsSaveButton>
                      <button
                        type="button"
                        className="learners-settings-inline-cancel"
                        onClick={() => {
                          resetBasicDraft();
                          setIsBasicEditing(false);
                        }}
                      >
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
                              <span className="pref-icon">{LANGUAGE_OPTIONS.find((o) => o.value === preferencesDraft.language)?.icon || '🌐'}</span>
                              <span>{LANGUAGE_OPTIONS.find((o) => o.value === preferencesDraft.language)?.label || 'Language'}</span>
                            </div>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {LANGUAGE_OPTIONS.map((option) => (
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
                            <span>{TIMEZONE_OPTIONS.find((o) => o.value === preferencesDraft.timezone)?.label || 'Timezone'}</span>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {TIMEZONE_OPTIONS.map((option) => (
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
                              <span className="pref-icon currency-badge">{CURRENCY_OPTIONS.find((o) => o.value === preferencesDraft.currency)?.icon || '$'}</span>
                              <span>{CURRENCY_OPTIONS.find((o) => o.value === preferencesDraft.currency)?.label || 'Currency'}</span>
                            </div>
                          </button>
                          {isPreferencesEditing && (
                            <ul className="dropdown-menu w-100 shadow-sm border-0">
                              {CURRENCY_OPTIONS.map((option) => (
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
                      <SettingsSaveButton onClick={savePreferences} disabled={!preferencesDirty} saving={savingPreferences} savingLabel="Saving preferences...">
                        Save preferences
                      </SettingsSaveButton>
                      <button
                        type="button"
                        className="learners-settings-inline-cancel"
                        onClick={() => {
                          resetPreferencesDraft();
                          setIsPreferencesEditing(false);
                        }}
                      >
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
                      <button type="button" className="learners-settings-ghost-btn" onClick={() => navigate('/academia/learner/account')}>
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
                        {!showPasswordForm ? (
                          <div className="learners-settings-password-actions">
                            <p className="learners-settings-about-copy">Update your account password securely.</p>
                            <SettingsSaveButton
                              className="learners-settings-inline-save"
                              onClick={() => setShowPasswordForm(true)}
                            >
                              Change password
                            </SettingsSaveButton>
                          </div>
                        ) : (
                          <div className="learners-settings-side-form">
                            <input
                              type="password"
                              className="learners-settings-field-value learners-settings-field-control"
                              value={passwordForm.current}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, current: event.target.value }))}
                              placeholder="Current password"
                              autoComplete="current-password"
                            />
                            <input
                              type="password"
                              className="learners-settings-field-value learners-settings-field-control"
                              value={passwordForm.next}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, next: event.target.value }))}
                              placeholder="New password"
                              autoComplete="new-password"
                            />
                            <input
                              type="password"
                              className="learners-settings-field-value learners-settings-field-control"
                              value={passwordForm.confirm}
                              onChange={(event) => setPasswordForm((current) => ({ ...current, confirm: event.target.value }))}
                              placeholder="Confirm new password"
                              autoComplete="new-password"
                            />
                            <div className="learners-settings-inline-actions" style={{ marginTop: 12 }}>
                              <SettingsSaveButton onClick={handleChangePassword} saving={passwordSaving} savingLabel="Updating...">
                                Update password
                              </SettingsSaveButton>
                              <button
                                type="button"
                                className="learners-settings-inline-cancel"
                                onClick={() => {
                                  setShowPasswordForm(false);
                                  setPasswordForm({ current: '', next: '', confirm: '' });
                                }}
                                disabled={passwordSaving}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
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
                            <strong>Two-factor authentication</strong>
                            <p>
                              {is2FAEnabled
                                ? 'Two-factor authentication is enabled on your account.'
                                : 'Add an extra verification step when signing in.'}
                            </p>
                          </div>
                          {twoFactorStage === 'idle' && (
                            <SettingsSaveButton
                              className="learners-settings-inline-save"
                              onClick={is2FAEnabled ? startDisableTwoFactor : startEnableTwoFactor}
                              disabled={twoFactorProcessing}
                              saving={twoFactorProcessing}
                              savingLabel="Sending..."
                            >
                              {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </SettingsSaveButton>
                          )}
                        </div>
                      </div>

                      {(twoFactorStage === 'enable-pending' || twoFactorStage === 'disable-pending') && (
                        <div className="learners-settings-field is-full learners-settings-side-form">
                          <div className="learners-settings-field-head">
                            <label>Verification code</label>
                          </div>
                          <input
                            type="text"
                            className="learners-settings-field-value learners-settings-field-control"
                            value={twoFactorOtp}
                            onChange={(event) => setTwoFactorOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                          />
                          <div className="learners-settings-inline-actions" style={{ marginTop: 12 }}>
                            <SettingsSaveButton
                              onClick={twoFactorStage === 'enable-pending' ? verifyEnableTwoFactor : verifyDisableTwoFactor}
                              disabled={twoFactorOtp.length !== 6}
                              saving={twoFactorProcessing}
                            >
                              Verify
                            </SettingsSaveButton>
                            <button type="button" className="learners-settings-inline-cancel" onClick={cancelTwoFactorFlow} disabled={twoFactorProcessing}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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
                        <div className="learners-settings-activity-empty">
                          <strong>No recent account activity</strong>
                          <span>Documents, certificates, and payment methods will appear here once your account has activity.</span>
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

      <ProfilePhotoCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={closePhotoCropModal}
        onConfirm={handlePhotoCropConfirm}
        exporting={photoUploading}
      />
    </LearnersPageShell>
  );
}

export default LearnersSettings;