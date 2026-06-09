import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfessorLayout from '../../../components/layouts/ProfessorLayout/ProfessorLayout';

import defaultProfileImage from '../../../assets/imgs/default-profile.png';
import checkCircle from '../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../assets/icons/no-check-circle.svg';
import bPencil from '../../../assets/icons/b-pencil.svg';
import acSav from '../../../assets/icons/ac-sav.svg';
import fileIcon from '../../../assets/icons/file.svg';
import pdfIcon from '../../../assets/icons/pdf1.svg';

import trashIcon from '../../../assets/icons/trash.svg';
import xIcon from '../../../assets/icons/dX.svg';
import plusIcon from '../../../assets/icons/plus1.svg';

import twoFa1Icon from '../../../assets/icons/2fa1.svg';
import twoFa2Icon from '../../../assets/icons/2fa2.svg';

import mtnPayIcon from '../../../assets/icons/MTN-pay.svg';
import airtelPayIcon from '../../../assets/icons/AIR-pay.svg';
import bankCardIcon from '../../../assets/icons/CARD-pay.svg';
import infoGrayIcon from '../../../assets/icons/Info.svg';
import visaIcon from '../../../assets/icons/VISA-pay.svg';
import mastercardIcon from '../../../assets/icons/mastercard1.svg';
import amexIcon from '../../../assets/icons/card3.svg';
import cvvIcon from '../../../assets/icons/credit-cart.svg';

import themeDarkImg from '../../../assets/imgs/app1.png';
import themeLightImg from '../../../assets/imgs/app2.png';
import themeSystemImg from '../../../assets/imgs/app3.png';

import nott1Icon from '../../../assets/icons/nott1.svg';
import nott2Icon from '../../../assets/icons/nott2.svg';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const languageOptions = [
  { value: 'en', label: 'American English', icon: '🇺🇸' },
  { value: 'en-uk', label: 'British English', icon: '🇬🇧' },
  { value: 'fr', label: 'French', icon: '🇫🇷' },
];

const timezoneOptions = [
  { value: 'GMT -5:00 - Eastern Time(US & Canada)', label: 'GMT -5:00 - Eastern Time(US & Canada)' },
  { value: 'GMT +2:00 - Central Africa Time', label: 'GMT +2:00 - Central Africa Time' },
];

const currencyOptions = [
  { value: 'USD', label: 'United States Dollar (USD)', icon: '$' },
  { value: 'RWF', label: 'Rwandan Franc (RWF)', icon: 'RF' },
];

const activityFilters = ['This week', 'Last week', 'This month', 'All time'];

const resolveAssetUrl = (value) => {
  if (!value) return defaultProfileImage;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const isWithinFilter = (value, filter) => {
  if (filter === 'All time') return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 6);

  if (filter === 'This week') return date >= startOfWeek;

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
};

const normalizePaymentMethods = (methods) => {
  if (!Array.isArray(methods)) return [];
  return methods.map((method) => ({
    id: method?.id ?? method?._id ?? `${method?.paymentType || 'payment'}-${Date.now()}`,
    paymentType: method?.paymentType || method?.payment_type || 'other',
    paymentProvider: method?.paymentProvider || method?.payment_provider || '',
    accountHolderName: method?.accountHolderName || method?.account_holder_name || 'Saved payment method',
    accountNumber: method?.accountNumber || method?.account_number || null,
    phoneNumber: method?.phoneNumber || method?.phone_number || null,
    cardLastFour: method?.cardLastFour || method?.card_last_four || null,
    expiryDate: method?.expiryDate || method?.expiry_date || null,
    isPrimary: Boolean(method?.isPrimary ?? method?.is_primary),
    isActive: Boolean(method?.isActive ?? method?.is_active),
  }));
};

const buildSidebarSections = ({ completionStatus, documents, paymentMethods, basicProfile, addressProfile, preferencesState, twoFactorEnabled }) => {
  const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
  const profileCompletion = completionStatus || {};

  return [
    {
      title: 'Authentication',
      items: [
        {
          label: 'Basic Settings',
          completed: Boolean(
            profileCompletion.name_completed && profileCompletion.phone_completed && profileCompletion.role_completed && profileCompletion.visibility_completed
            && hasText(basicProfile.name) && hasText(basicProfile.phone) && hasText(basicProfile.role) && hasText(basicProfile.visibility)
          ),
        },
        { label: 'Email', completed: hasText(basicProfile.email) },
        { label: 'Documents and Files', completed: Boolean(profileCompletion.documents_completed || documents.some((doc) => doc.isPersisted)) },
        { label: 'Social Connection', completed: false },
        { label: 'Two-Factor auth(2FA)', completed: Boolean(twoFactorEnabled) },
      ],
    },
    {
      title: 'Payments Methods',
      items: [
        { label: 'Airtel Money', completed: Boolean(paymentMethods.some((m) => m.paymentType === 'airtel_money')) },
        { label: 'Mobile Money', completed: Boolean(paymentMethods.some((m) => m.paymentType === 'mobile_money')) },
        { label: 'Bank Cards', completed: Boolean(profileCompletion.payment_method_completed || paymentMethods.some((m) => m.paymentType === 'bank_card')) },
      ],
    },
    {
      title: 'Advanced Settings',
      items: [
        {
          label: 'Preferences',
          completed: Boolean(profileCompletion.preferences_completed || (hasText(preferencesState.language) && hasText(preferencesState.timezone) && hasText(preferencesState.currency))),
        },
        { label: 'Notifications', completed: false },
        {
          label: 'Address',
          completed: Boolean(profileCompletion.address_completed || (hasText(addressProfile.address) && hasText(addressProfile.country) && hasText(addressProfile.city) && hasText(addressProfile.postcode))),
        },
        { label: 'Appearance', completed: false },
      ],
    },
  ];
};

const navTargetByLabel = {
  'Basic Settings': 'basic-settings',
  'Email': 'email',
  'Documents and Files': 'documents-and-files',
  'Social Connection': 'social-connection',
  'Two-Factor auth(2FA)': 'two-factor-auth',
  'Airtel Money': 'payments-method',
  'Mobile Money': 'payments-method',
  'Bank Cards': 'payments-method',
  'Preferences': 'preferences',
  'Notifications': 'notifications',
  'Address': 'address',
  'Appearance': 'appearance',
};

const navLabelBySection = Object.entries(navTargetByLabel).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});
navLabelBySection['payments-method'] = 'Bank Cards'; // Override specific ones

const ProfessorAccount = () => {
  const sectionRefs = useRef({});
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const [activeNavLabel, setActiveNavLabel] = useState('Basic Settings');
  const [activeTab, setActiveTab] = useState('overview');
  
  // States
  const [basicProfile, setBasicProfile] = useState({
    id: '', email: '', name: '', phone: '', role: 'instructor', visibility: 'public', avatar: defaultProfileImage,
  });
  const [addressProfile, setAddressProfile] = useState({ address: '', country: '', state: '', city: '', postcode: '' });
  const [preferencesState, setPreferencesState] = useState({
    language: 'en', timezone: timezoneOptions[0].value, currency: 'USD', showListNames: false, showLinkedTaskNames: true, emailVisibility: false,
  });
  const [switchState, setSwitchState] = useState({
    availability: true, emailSystemUpdates: true, emailPrimary: false, socialInstagram: true, socialLinkedin: false,
    twoFaSms: false, twoFaTotp: false, saveForFutureUse: true, prefEmailVisible: true, notifEmail: true, notifMessages: true,
    notifSubscribe: true, appearanceSidebar: true,
  });

  const [documents, setDocuments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificateStats, setCertificateStats] = useState(null);
  const [profileCompletionStatus, setProfileCompletionStatus] = useState(null);
  const [accountStatus, setAccountStatus] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activityFilter, setActivityFilter] = useState('This month');
  const [reviewedActivityIds, setReviewedActivityIds] = useState([]);

  // UI Flow States
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [documentsSaving, setDocumentsSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [paymentMethodsSaving, setPaymentMethodsSaving] = useState(false);

  const [basicRoleOpen, setBasicRoleOpen] = useState(false);
  const [basicVisibilityOpen, setBasicVisibilityOpen] = useState(false);
  const [isDocumentDragging, setIsDocumentDragging] = useState(false);
  const [isBasicEditing, setIsBasicEditing] = useState(false);
  const [isPreferencesEditing, setIsPreferencesEditing] = useState(false);
  const [openActivityMenuId, setOpenActivityMenuId] = useState(null);
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // 2FA States
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorStage, setTwoFactorStage] = useState('idle');

  // Payment Form
  const [paymentMethodTab, setPaymentMethodTab] = useState('bank_card');
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    paymentProvider: '', accountHolderName: '', accountNumber: '', phoneNumber: '', cardNumber: '', expiryMonth: '', expiryYear: '', isPrimary: true,
  });

  const pushFeedback = (message, type = 'success') => {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    if (type === 'error') {
      setProfileError(message);
      setProfileSuccess('');
    } else {
      setProfileSuccess(message);
      setProfileError('');
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setProfileError('');
      setProfileSuccess('');
      feedbackTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => () => {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  // --- Consolidated Master Fetch ---
  const loadSettings = async (signal) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('Please sign in to view your settings.');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileError('');

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const requests = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/profile`, { headers, signal }).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/profile/documents`, { headers, signal }).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/profile/payment-methods`, { headers, signal }).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/certificates/user/statistics`, { headers, signal }).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/certificates/user/my-certificates?limit=6&offset=0`, { headers, signal }).then(res => res.json()),
        fetch(`${API_BASE_URL}/api/auth/account-status`, { headers, signal }).then(res => res.json()),
      ]);

      if (signal?.aborted) return;

      // 1. Profile Data
      if (requests[0].status === 'fulfilled' && !requests[0].value.error) {
        const user = requests[0].value?.data?.user || {};
        setProfileCompletionStatus(requests[0].value?.data?.completionStatus || null);
        setBasicProfile({
          id: user.id || '',
          email: user.email || '',
          name: user.name || '',
          phone: user.phone || '',
          role: user.role || 'instructor', // Defaulted to instructor
          visibility: user.visibility || 'public',
          avatar: resolveAssetUrl(user.avatar),
        });
        setAddressProfile({
          address: user.address || '',
          country: user.country || '',
          state: user.state || '',
          city: user.city || '',
          postcode: user.postcode || '',
        });
        setSwitchState(prev => ({
          ...prev,
          availability: Boolean(user.available_to_hire),
          emailSystemUpdates: Boolean(user.email_notifications),
          prefEmailVisible: Boolean(user.email_visibility),
        }));
        setPreferencesState({
          language: user.language || 'en',
          timezone: user.timezone || timezoneOptions[0].value,
          currency: user.currency || 'USD',
          showListNames: Boolean(user.show_list_names),
          showLinkedTaskNames: user.show_linked_task_names !== false,
          emailVisibility: Boolean(user.email_visibility),
        });
      } else {
        setProfileError(requests[0].reason?.message || 'Failed to load profile');
      }

      // 2. Documents
      if (requests[1].status === 'fulfilled' && !requests[1].value.error) {
        const docs = Array.isArray(requests[1].value?.data?.documents) ? requests[1].value.data.documents.map(doc => ({
          id: String(doc.id), serverId: doc.id, name: doc.document_name, size: formatFileSize(doc.file_size),
          filePath: doc.file_path, fileType: doc.file_type, isPublic: Boolean(doc.is_public), createdAt: doc.created_at, isPersisted: true,
        })) : [];
        setDocuments(docs);
      }

      // 3. Payment Methods
      if (requests[2].status === 'fulfilled' && !requests[2].value.error) {
        setPaymentMethods(normalizePaymentMethods(requests[2].value?.data?.paymentMethods));
      }

      // 4 & 5. Certificates
      if (requests[3].status === 'fulfilled') setCertificateStats(requests[3].value?.data || null);
      if (requests[4].status === 'fulfilled' && !requests[4].value.error) {
        const items = requests[4].value?.data?.certificates || requests[4].value?.data?.data || [];
        setCertificates(Array.isArray(items) ? items : []);
      }

      // 6. Account Status & 2FA
      if (requests[5].status === 'fulfilled' && !requests[5].value.error) {
        const accData = requests[5].value?.data || {};
        setAccountStatus(accData);
        setTwoFactorEnabled(Boolean(accData.twoFactorEnabled));
        setSwitchState(prev => ({ ...prev, twoFaSms: Boolean(accData.twoFactorEnabled) }));
      }
    } catch (error) {
      if (error.name !== 'AbortError') setProfileError(error.message || 'Failed to load settings');
    } finally {
      if (!signal?.aborted) setProfileLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal);
    return () => controller.abort();
  }, []);

  // --- Scroll Spy Logic ---
  useEffect(() => {
    const sectionElements = Object.values(sectionRefs.current).filter(Boolean);
    if (!sectionElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible.length) return;
        const sectionKey = visible[0].target.getAttribute('data-section-key');
        if (sectionKey && navLabelBySection[sectionKey]) setActiveNavLabel(navLabelBySection[sectionKey]);
      },
      { threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: '-18% 0px -48% 0px' }
    );
    sectionElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const handleSidebarClick = (label) => {
    const sectionKey = navTargetByLabel[label];
    const element = sectionRefs.current[sectionKey];
    if (element) {
      setActiveNavLabel(label);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- Derived State ---
  const isAccountActive = accountStatus?.isActive !== false;
  const sidebarSections = buildSidebarSections({
    completionStatus: profileCompletionStatus, documents, paymentMethods, basicProfile, addressProfile, preferencesState, twoFactorEnabled,
  });

  const activityItems = useMemo(() => {
    const certEvents = certificates.map(c => ({
      id: `cert-${c.id || c.certificateNumber}`, type: 'Certificate', title: c.courseTitle || c.courseName || 'Certificate earned', body: c.certificateNumber ? `Certificate ${c.certificateNumber}` : 'Issued from account', date: c.issueDate, tone: c.status === 'passed' ? 'success' : 'info',
    }));
    const docEvents = documents.map(d => ({
      id: `doc-${d.id}`, type: 'Document', title: d.name || 'Document uploaded', body: d.isPublic ? 'Shared document' : 'Private document', date: d.createdAt, tone: 'info',
    }));
    const payEvents = paymentMethods.map(p => ({
      id: `pay-${p.id}`, type: 'Payment method', title: p.paymentProvider || 'Payment method added', body: p.isPrimary ? 'Primary payment method' : 'Saved payment method', date: p.createdAt || p.expiryDate, tone: 'success',
    }));
    return [...certEvents, ...docEvents, ...payEvents].filter(item => isWithinFilter(item.date, activityFilter)).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [activityFilter, certificates, documents, paymentMethods]);

  const visibleActivityItems = activityItems.filter((item) => !reviewedActivityIds.includes(item.id));

  // --- Handlers ---
  const toggleSwitch = (key) => setSwitchState(prev => ({ ...prev, [key]: !prev[key] }));
  const handleCheckboxChange = (key) => (event) => setSwitchState(prev => ({ ...prev, [key]: event.target.checked }));

  const handleBasicSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return pushFeedback('Please sign in again.', 'error');
    setProfileSaving(true);
    try {
      const nameRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: basicProfile.name }),
      });
      if (!nameRes.ok) throw new Error('Failed to save name');

      if (basicProfile.phone && basicProfile.role && basicProfile.visibility) {
        const res = await fetch(`${API_BASE_URL}/api/profile/complete`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: basicProfile.name, phone: basicProfile.phone, role: basicProfile.role, visibility: basicProfile.visibility, availableToHire: switchState.availability, emailNotifications: switchState.emailSystemUpdates,
          }),
        });
        if (!res.ok) throw new Error('Failed to save profile');
      }
      pushFeedback('Basic settings saved successfully.');
      setIsBasicEditing(false);
    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleEmailSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return pushFeedback('Please sign in again.', 'error');
    setEmailSaving(true);
    try {
      const [emailRes, prefRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: basicProfile.email }) }),
        fetch(`${API_BASE_URL}/api/profile/complete`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ emailNotifications: switchState.emailSystemUpdates }) }),
      ]);
      if (!emailRes.ok || !prefRes.ok) throw new Error('Failed to update email settings');
      pushFeedback('Email settings saved successfully.');
    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    if (!token) return pushFeedback('Please sign in again.', 'error');

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch(`${API_BASE_URL}/api/profile/photo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload photo');
      
      const nextAvatar = data?.data?.photoUrl || data?.data?.user?.avatar;
      setBasicProfile(prev => ({ ...prev, avatar: resolveAssetUrl(nextAvatar) }));
      pushFeedback('Photo uploaded successfully.');
    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setPhotoUploading(false);
      event.target.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setBasicProfile(prev => ({ ...prev, avatar: defaultProfileImage }));
    setPhotoUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/photo`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to reset photo');
      setBasicProfile(prev => ({ ...prev, avatar: defaultProfileImage }));
      pushFeedback('Photo reset to default.');
    } catch (err) {
      pushFeedback(err.message, 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDocumentsSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newDocs = files.map((f, i) => ({ id: `${f.name}-${Date.now()}-${i}`, name: f.name, size: formatFileSize(f.size), file: f, isPersisted: false }));
    setDocuments(prev => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const handleDocumentDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDocumentDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    const newDocs = files.map((f, i) => ({ id: `${f.name}-${Date.now()}-${i}`, name: f.name, size: formatFileSize(f.size), file: f, isPersisted: false }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = async (id) => {
    const doc = documents.find(d => d.id === id);
    if (doc?.serverId && doc.isPersisted) {
      const token = localStorage.getItem('token');
      if (!token) return pushFeedback('Sign in again.', 'error');
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/documents/${doc.serverId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to remove document');
        setDocuments(prev => prev.filter(d => d.id !== id));
        pushFeedback('Document removed.');
      } catch (e) { pushFeedback(e.message, 'error'); }
      return;
    }
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleDocumentsSave = async () => {
    const token = localStorage.getItem('token');
    const pending = documents.filter(d => d.file && !d.isPersisted);
    if (!pending.length) return pushFeedback('No new documents to save.');
    setDocumentsSaving(true);
    try {
      for (const doc of pending) {
        const formData = new FormData(); formData.append('document', doc.file);
        const res = await fetch(`${API_BASE_URL}/api/profile/documents`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${doc.name}`);
      }
      loadSettings(); // Reload to get persisted IDs
      pushFeedback('Documents saved successfully.');
    } catch (e) {
      pushFeedback(e.message, 'error');
    } finally {
      setDocumentsSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    const token = localStorage.getItem('token');
    setPreferencesSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(preferencesState),
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      pushFeedback('Preferences saved.');
      setIsPreferencesEditing(false);
    } catch (e) {
      pushFeedback(e.message, 'error');
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handleAddressSave = async () => {
    const token = localStorage.getItem('token');
    setAddressSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/complete`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...basicProfile, ...addressProfile, availableToHire: switchState.availability, emailNotifications: switchState.emailSystemUpdates }),
      });
      if (!res.ok) throw new Error('Failed to save address');
      pushFeedback('Address saved.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setAddressSaving(false); }
  };

  const handlePaymentMethodSave = async () => {
    const token = localStorage.getItem('token');
    if (!paymentMethodForm.accountHolderName.trim()) return pushFeedback('Account holder name is required.', 'error');
    setPaymentMethodsSaving(true);
    try {
      const payload = {
        paymentType: paymentMethodTab, paymentProvider: paymentMethodForm.paymentProvider.trim() || null, accountHolderName: paymentMethodForm.accountHolderName.trim(),
        accountNumber: paymentMethodForm.accountNumber.trim() || null, phoneNumber: paymentMethodForm.phoneNumber.trim() || null,
        cardLastFour: paymentMethodForm.cardNumber.replace(/\D/g, '').slice(-4) || null,
        expiryDate: paymentMethodForm.expiryMonth && paymentMethodForm.expiryYear ? `${paymentMethodForm.expiryMonth}/${paymentMethodForm.expiryYear}` : null,
        isPrimary: Boolean(paymentMethodForm.isPrimary),
      };
      const res = await fetch(`${API_BASE_URL}/api/profile/payment-methods`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save payment method');
      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
      pushFeedback('Payment method saved.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setPaymentMethodsSaving(false); }
  };

  const handlePrimaryPaymentMethod = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/payment-methods/${id}/primary`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to update primary method');
      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
    } catch (e) { pushFeedback(e.message, 'error'); }
  };

  const handleDeletePaymentMethod = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/payment-methods/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to delete payment method');
      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
    } catch (e) { pushFeedback(e.message, 'error'); }
  };

  // 2FA Handlers
  const startEnableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    setTwoFactorProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/enable-2fa`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTwoFactorStage('enable-pending'); setTwoFactorOtp(''); pushFeedback('OTP sent to email.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setTwoFactorProcessing(false); }
  };

  const verifyEnableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    setTwoFactorProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp-enable-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ otp: twoFactorOtp.trim() }) });
      if (!res.ok) throw new Error('Failed to verify OTP');
      setTwoFactorEnabled(true); setTwoFactorStage('idle'); setSwitchState(prev => ({ ...prev, twoFaSms: true })); pushFeedback('2FA enabled.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setTwoFactorProcessing(false); }
  };

  const startDisableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    setTwoFactorProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to send OTP');
      setTwoFactorStage('disable-pending'); setTwoFactorOtp(''); pushFeedback('OTP sent to email.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setTwoFactorProcessing(false); }
  };

  const verifyDisableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    setTwoFactorProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ otp: twoFactorOtp.trim() }) });
      if (!res.ok) throw new Error('Failed to verify OTP');
      setTwoFactorEnabled(false); setTwoFactorStage('idle'); setSwitchState(prev => ({ ...prev, twoFaSms: false })); pushFeedback('2FA disabled.');
    } catch (e) { pushFeedback(e.message, 'error'); } finally { setTwoFactorProcessing(false); }
  };

  const getSwitchClassName = (key) => `learners-account-switch${switchState[key] ? ' is-on' : ''}`;

  return (
    <ProfessorLayout>
      <section className="learners-account-page">
        <aside className="learners-account-nav" aria-label="Account sections">
          {sidebarSections.map((section) => (
            <section key={section.title} className="learners-account-nav-group">
              <h2>{section.title}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      className={`${item.completed ? 'is-completed' : ''} ${activeNavLabel === item.label ? 'is-active' : ''}`.trim()}
                      onClick={() => handleSidebarClick(item.label)}
                    >
                      <img src={item.completed ? checkCircle : noCheckCircle} alt="" className="learners-account-nav-icon" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </aside>

        <div className="learners-account-panel">
          {(profileError || profileSuccess) && (
            <div className={`learners-account-feedback learners-account-feedback-floating ${profileError ? 'is-error' : 'is-success'}`}>
              {profileError || profileSuccess}
            </div>
          )}
          
          {/* Basic Settings */}
          <section className="learners-account-section" data-section-key="basic-settings" ref={(el) => sectionRefs.current['basic-settings'] = el}>
            <header>
              <h2>Basic Settings</h2>
              <button type="button" className="section-edit-btn" onClick={() => setIsBasicEditing(!isBasicEditing)}>
                <img src={bPencil} alt="Edit" />
              </button>
            </header>

            <div className="learners-account-section-body">
              <div className="learners-account-field-row">
                <label>Instructor ID</label>
                <div className="learners-account-field-control">
                  <input type="text" value={basicProfile.id || 'Loading...'} readOnly />
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Photo</label>
                <div className="learners-account-field-control">
                  <div className="learners-account-avatar-row">
                    <p>Profile photo loaded from your account record</p>
                    <div className="learners-account-avatar-wrap">
                      <img src={basicProfile.avatar} alt="Profile" className="learners-account-avatar-image" onClick={() => photoInputRef.current?.click()} role="button" tabIndex={0} />
                      <button type="button" className="learners-account-avatar-remove" onClick={handlePhotoRemove}>
                        <img src={xIcon} alt="Remove photo" />
                      </button>
                    </div>
                    <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
                  </div>
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Name</label>
                <div className="learners-account-field-control">
                  <input type="text" value={basicProfile.name} onChange={(e) => setBasicProfile(p => ({ ...p, name: e.target.value }))} disabled={!isBasicEditing} />
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Role</label>
                <div className="learners-account-field-control">
                  <div className="dropdown learners-account-dropdown" style={{ position: 'relative' }}>
                    <button className="learners-account-dropdown-btn dropdown-toggle" type="button" onClick={() => isBasicEditing && setBasicRoleOpen(!basicRoleOpen)}>
                      <span style={{ textTransform: 'capitalize' }}>{basicProfile.role}</span>
                    </button>
                    {basicRoleOpen && isBasicEditing && (
                      <ul className="dropdown-menu learners-account-dropdown-menu show">
                        <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile(p => ({ ...p, role: 'instructor' })); setBasicRoleOpen(false); }}>Instructor</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile(p => ({ ...p, role: 'student' })); setBasicRoleOpen(false); }}>Student</button></li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Phone number</label>
                <div className="learners-account-field-control">
                  <div className="learners-account-phone">
                    <span className="learners-account-phone-prefix">+250</span><span className="learners-account-phone-sep">|</span>
                    <input type="tel" value={basicProfile.phone} onChange={(e) => setBasicProfile(p => ({ ...p, phone: e.target.value }))} disabled={!isBasicEditing} />
                  </div>
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Visibility</label>
                <div className="learners-account-field-control">
                  <div className="dropdown learners-account-dropdown" style={{ position: 'relative' }}>
                    <button className="learners-account-dropdown-btn dropdown-toggle" type="button" onClick={() => isBasicEditing && setBasicVisibilityOpen(!basicVisibilityOpen)}>
                      {basicProfile.visibility === 'private' ? 'Private' : 'Public'}
                    </button>
                    {basicVisibilityOpen && isBasicEditing && (
                      <ul className="dropdown-menu learners-account-dropdown-menu show">
                        <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile(p => ({ ...p, visibility: 'public' })); setBasicVisibilityOpen(false); }}>Public</button></li>
                        <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile(p => ({ ...p, visibility: 'private' })); setBasicVisibilityOpen(false); }}>Private</button></li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="learners-account-toggle-row">
                <label>Availability</label>
                <div className="learners-account-toggle-copy">
                  <span>Available to hire</span>
                  <button type="button" className={getSwitchClassName('availability')} disabled={!isBasicEditing} onClick={() => toggleSwitch('availability')}><span /></button>
                </div>
              </div>

              <div className="learners-account-section-actions">
                <button type="button" className="learners-account-save-btn" onClick={handleBasicSave} disabled={profileSaving || !isBasicEditing}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* Email */}
          <section className="learners-account-section" data-section-key="email" ref={(el) => sectionRefs.current.email = el}>
            <header><h2>Email</h2></header>
            <div className="learners-account-section-body">
              <div className="learners-account-field-row align-top">
                <label>Email</label>
                <div className="learners-account-field-control">
                  <input type="email" value={basicProfile.email} onChange={(e) => setBasicProfile(p => ({ ...p, email: e.target.value }))} disabled={profileLoading} />
                  <div className="learners-account-email-toggles">
                    <span className="email-toggle-text">System Updates</span>
                    <button type="button" className={getSwitchClassName('emailSystemUpdates')} onClick={() => toggleSwitch('emailSystemUpdates')}><span /></button>
                    <span className="email-toggle-text">Primary</span>
                    <button type="button" className={getSwitchClassName('emailPrimary')} onClick={() => toggleSwitch('emailPrimary')}><span /></button>
                  </div>
                  <p className="learners-account-muted">Input your email, designate as primary for priority updates.</p>
                </div>
              </div>
              <div className="learners-account-section-actions">
                <button type="button" className="learners-account-save-btn" onClick={handleEmailSave} disabled={emailSaving}>
                  {emailSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* Documents and Files */}
          <section className="learners-account-section" data-section-key="documents-and-files" ref={(el) => sectionRefs.current['documents-and-files'] = el}>
            <header><h2>Documents and Files</h2></header>
            <div className="learners-account-section-body">
              <div className={`learners-account-dropzone${isDocumentDragging ? ' is-dragging' : ''}`} role="button" tabIndex={0} onClick={openDocumentPicker} onDrop={handleDocumentDrop} onDragOver={(e) => { e.preventDefault(); setIsDocumentDragging(true); }} onDragLeave={() => setIsDocumentDragging(false)}>
                <img src={fileIcon} alt="Upload" className="dropzone-icon" />
                <div className="learners-account-dropzone-content">
                  <strong>Add teaching credentials or click upload</strong>
                  <p className="learners-account-muted">Drop files here or use the picker to add them.</p>
                </div>
              </div>
              <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple hidden onChange={handleDocumentsSelect} />

              <div className="learners-account-file-grid">
                {documents.map((doc) => (
                  <div key={doc.id} className="learners-account-file-card">
                    <img src={pdfIcon} alt="File" className="file-type-icon" />
                    <div className="file-meta">
                      <strong>{doc.name}</strong>
                      <small>{doc.size}</small>
                    </div>
                    <button type="button" className="file-remove-badge" onClick={() => removeDocument(doc.id)}>&times;</button>
                  </div>
                ))}
              </div>

              <div className="learners-account-section-actions">
                <button type="button" className="learners-account-save-btn" onClick={handleDocumentsSave} disabled={documentsSaving}>
                  {documentsSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* Social Connection */}
          <section className="learners-account-section" data-section-key="social-connection" ref={(el) => sectionRefs.current['social-connection'] = el}>
            <header><h2>Social Media Connection</h2></header>
            <div className="learners-account-section-body">
              <div className="social-empty-state">
                <h3>No social connections yet</h3>
                <p className="learners-account-muted">Social connections backend is not available yet.</p>
              </div>
            </div>
          </section>

          {/* Two-Factor Authentication (2FA) */}
          <section className="learners-account-section" data-section-key="two-factor-auth" ref={(el) => sectionRefs.current['two-factor-auth'] = el}>
            <header><h2>Two-Factor authentication (2FA)</h2></header>
            <div className="learners-account-section-body">
              <div className="two-fa-cards-wrapper">
                <div className="two-fa-card">
                  <div className="two-fa-icon-wrap"><img src={twoFa1Icon} alt="SMS" /></div>
                  <div className="two-fa-info">
                    <strong>Email OTP (Database-backed)</strong>
                    <span>{twoFactorEnabled ? '2FA is enabled for your account.' : 'Enable 2FA with one-time codes sent to your email.'}</span>
                  </div>
                  <button type="button" className={getSwitchClassName('twoFaSms')} onClick={twoFactorEnabled ? startDisableTwoFactor : startEnableTwoFactor} disabled={twoFactorProcessing}>
                    <span />
                  </button>
                </div>
              </div>

              {twoFactorStage !== 'idle' && (
                <div className="learners-account-field-row align-top" style={{ marginTop: '24px' }}>
                  <label>OTP Code</label>
                  <div className="learners-account-field-control">
                    <input type="text" value={twoFactorOtp} onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" maxLength={6} />
                    <p className="learners-account-muted">Check your email, then enter the OTP.</p>
                  </div>
                </div>
              )}

              <div className="learners-account-section-actions">
                {twoFactorStage === 'enable-pending' && (
                  <>
                    <button type="button" className="learners-account-save-btn" onClick={verifyEnableTwoFactor}>Verify & Enable</button>
                    <button type="button" className="learners-account-save-btn" onClick={() => setTwoFactorStage('idle')} style={{ background: '#e2e8f0', color: '#0f172a' }}>Cancel</button>
                  </>
                )}
                {twoFactorStage === 'disable-pending' && (
                  <>
                    <button type="button" className="learners-account-save-btn" onClick={verifyDisableTwoFactor}>Verify & Disable</button>
                    <button type="button" className="learners-account-save-btn" onClick={() => setTwoFactorStage('idle')} style={{ background: '#e2e8f0', color: '#0f172a' }}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Payments Method */}
          <section className="learners-account-section" data-section-key="payments-method" ref={(el) => sectionRefs.current['payments-method'] = el}>
            <header><h2>Payments Method</h2></header>
            <div className="learners-account-section-body">
              <div className="learners-account-file-grid payment-methods-grid">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="learners-account-file-card payment-method-card">
                    <img src={method.paymentType === 'bank_card' ? bankCardIcon : method.paymentType === 'airtel_money' ? airtelPayIcon : mtnPayIcon} alt={method.paymentType} className="file-type-icon" />
                    <div className="file-meta">
                      <strong>{method.accountHolderName}</strong>
                      <small>{method.paymentType.replace('_', ' ')}</small>
                      <small>{method.accountNumber || method.phoneNumber || method.cardLastFour || 'Saved'}</small>
                    </div>
                    <div className="payment-method-actions">
                      <button type="button" className={method.isPrimary ? 'payment-pill is-primary' : 'payment-pill'} onClick={() => handlePrimaryPaymentMethod(method.id)}>
                        <span className="payment-pill-dot" /> {method.isPrimary ? 'Primary' : 'Make primary'}
                      </button>
                      <button type="button" className="file-remove-badge" onClick={() => handleDeletePaymentMethod(method.id)}>&times;</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="payment-type-selection" style={{ marginTop: '2rem' }}>
                <h5>Add New Method</h5>
                <ul className="nav nav-tabs" id="paymentTab">
                  <li className="nav-item">
                    <button className={`nav-link${paymentMethodTab === 'mobile_money' ? ' active' : ''}`} onClick={() => setPaymentMethodTab('mobile_money')}>
                      <div className="method-icon"><img src={mtnPayIcon} alt="MTN" /></div><span>MTN Mobile Money</span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${paymentMethodTab === 'airtel_money' ? ' active' : ''}`} onClick={() => setPaymentMethodTab('airtel_money')}>
                      <div className="method-icon"><img src={airtelPayIcon} alt="Airtel" /></div><span>Airtel Money</span>
                    </button>
                  </li>
                  <li className="nav-item">
                    <button className={`nav-link${paymentMethodTab === 'bank_card' ? ' active' : ''}`} onClick={() => setPaymentMethodTab('bank_card')}>
                      <div className="method-icon"><img src={bankCardIcon} alt="Bank" /></div><span>Bank Cards</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div className="tab-content" id="paymentTabContent">
                <div className="tab-pane fade show active bank-card-pane">
                  <div className="bank-form-grid">
                    <div className="bank-form-row">
                      <label className="bank-form-label">Account Holder *</label>
                      <div className="bank-form-control">
                        <input type="text" value={paymentMethodForm.accountHolderName} onChange={(e) => setPaymentMethodForm(p => ({ ...p, accountHolderName: e.target.value }))} placeholder="Max Smith" />
                      </div>
                    </div>

                    {paymentMethodTab === 'bank_card' ? (
                      <>
                        <div className="bank-form-row">
                          <label className="bank-form-label">Card Number *</label>
                          <div className="bank-form-control has-icons">
                            <input type="text" value={paymentMethodForm.cardNumber} onChange={(e) => setPaymentMethodForm(p => ({ ...p, cardNumber: e.target.value }))} placeholder="010 000 000 0000" />
                            <div className="card-network-logos">
                              <img src={visaIcon} alt="Visa" /><img src={mastercardIcon} alt="Mastercard" /><img src={amexIcon} alt="Amex" />
                            </div>
                          </div>
                        </div>
                        <div className="bank-form-row">
                          <label className="bank-form-label">Expiration Date</label>
                          <div className="bank-form-control multi-inputs">
                            <input type="text" value={paymentMethodForm.expiryMonth} onChange={(e) => setPaymentMethodForm(p => ({ ...p, expiryMonth: e.target.value }))} placeholder="MM" />
                            <input type="text" value={paymentMethodForm.expiryYear} onChange={(e) => setPaymentMethodForm(p => ({ ...p, expiryYear: e.target.value }))} placeholder="YYYY" />
                            <div className="cvv-input-wrap"><input type="text" placeholder="CVV" /><img src={cvvIcon} className="cvv-icon" alt="CVV" /></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bank-form-row">
                          <label className="bank-form-label">Account Number *</label>
                          <div className="bank-form-control"><input type="text" value={paymentMethodForm.accountNumber} onChange={(e) => setPaymentMethodForm(p => ({ ...p, accountNumber: e.target.value }))} placeholder="Account number" /></div>
                        </div>
                        <div className="bank-form-row">
                          <label className="bank-form-label">Phone Number *</label>
                          <div className="bank-form-control"><input type="text" value={paymentMethodForm.phoneNumber} onChange={(e) => setPaymentMethodForm(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="07xx xxx xxx" /></div>
                        </div>
                        <div className="bank-form-row">
                          <label className="bank-form-label">Provider</label>
                          <div className="bank-form-control"><input type="text" value={paymentMethodForm.paymentProvider} onChange={(e) => setPaymentMethodForm(p => ({ ...p, paymentProvider: e.target.value }))} placeholder="Provider name" /></div>
                        </div>
                      </>
                    )}

                    <div className="bank-form-row action-row">
                      <div className="save-future-toggle save-card">
                        <label>Save as primary</label>
                        <button type="button" className={getSwitchClassName('saveForFutureUse')} onClick={() => { toggleSwitch('saveForFutureUse'); setPaymentMethodForm(p => ({ ...p, isPrimary: !p.isPrimary })); }}><span /></button>
                      </div>
                      <button type="button" className="btn-save-changes" onClick={handlePaymentMethodSave} disabled={paymentMethodsSaving}>
                        {paymentMethodsSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="learners-account-section" data-section-key="preferences" ref={(el) => sectionRefs.current.preferences = el}>
            <header><h2>Preferences</h2></header>
            <div className="learners-account-section-body">
              <div className="learners-account-field-row">
                <label>Language</label>
                <div className="learners-account-field-control">
                  <div className="dropdown w-100">
                    <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pref-icon">{languageOptions.find((o) => o.value === preferencesState.language)?.icon || '🇺🇸'}</span>
                        <span>{languageOptions.find((o) => o.value === preferencesState.language)?.label || 'American English'}</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu w-100 shadow-sm border-0">
                      {languageOptions.map((opt) => (
                        <li key={opt.value}><button className="dropdown-item" type="button" onClick={() => setPreferencesState(p => ({ ...p, language: opt.value }))}>{opt.icon} {opt.label}</button></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Time zone</label>
                <div className="learners-account-field-control">
                  <div className="dropdown w-100">
                    <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <span>{timezoneOptions.find((o) => o.value === preferencesState.timezone)?.label || timezoneOptions[0].label}</span>
                    </button>
                    <ul className="dropdown-menu w-100 shadow-sm border-0">
                      {timezoneOptions.map((opt) => (
                        <li key={opt.value}><button className="dropdown-item" type="button" onClick={() => setPreferencesState(p => ({ ...p, timezone: opt.value }))}>{opt.label}</button></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="learners-account-field-row">
                <label>Currency</label>
                <div className="learners-account-field-control">
                  <div className="dropdown w-100">
                    <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pref-icon currency-badge">{currencyOptions.find((o) => o.value === preferencesState.currency)?.icon || '$'}</span>
                        <span>{currencyOptions.find((o) => o.value === preferencesState.currency)?.label || 'United States Dollar (USD)'}</span>
                      </div>
                    </button>
                    <ul className="dropdown-menu w-100 shadow-sm border-0">
                      {currencyOptions.map((opt) => (
                        <li key={opt.value}><button className="dropdown-item" type="button" onClick={() => setPreferencesState(p => ({ ...p, currency: opt.value }))}>{opt.icon} {opt.label}</button></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="learners-account-section-actions">
                <button type="button" className="learners-account-save-btn" onClick={handlePreferencesSave} disabled={preferencesSaving}>
                  {preferencesSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="learners-account-section" data-section-key="notifications" ref={(el) => sectionRefs.current.notifications = el}>
            <header><h2>Notifications</h2></header>
            <div className="learners-account-section-body">
              <div className="notif-top-cards">
                <div className="notif-card">
                  <div className="notif-icon-wrap"><img src={nott1Icon} alt="Email" /></div>
                  <div className="notif-info"><strong>Email</strong><span>Tailor Your Email Preferences.</span></div>
                  <button type="button" className={getSwitchClassName('notifEmail')} onClick={() => toggleSwitch('notifEmail')}><span /></button>
                </div>
                <div className="notif-card">
                  <div className="notif-icon-wrap"><img src={nott2Icon} alt="Messages" /></div>
                  <div className="notif-info"><strong>Messages</strong><span>Stay Updated on Mobile.</span></div>
                  <button type="button" className={getSwitchClassName('notifMessages')} onClick={() => toggleSwitch('notifMessages')}><span /></button>
                </div>
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="learners-account-section" data-section-key="address" ref={(el) => sectionRefs.current.address = el}>
            <header><h2>Address</h2></header>
            <div className="learners-account-section-body">
              <div className="learners-account-field-row">
                <label>Address</label>
                <div className="learners-account-field-control"><input type="text" value={addressProfile.address} onChange={(e) => setAddressProfile(p => ({ ...p, address: e.target.value }))} placeholder="Kigali, Rwanda" /></div>
              </div>
              <div className="learners-account-field-row">
                <label>Country</label>
                <div className="learners-account-field-control"><input type="text" value={addressProfile.country} onChange={(e) => setAddressProfile(p => ({ ...p, country: e.target.value }))} placeholder="Rwanda" /></div>
              </div>
              <div className="learners-account-field-row">
                <label>State/Province</label>
                <div className="learners-account-field-control"><input type="text" value={addressProfile.state} onChange={(e) => setAddressProfile(p => ({ ...p, state: e.target.value }))} placeholder="Kigali" /></div>
              </div>
              <div className="learners-account-field-row">
                <label>City</label>
                <div className="learners-account-field-control"><input type="text" value={addressProfile.city} onChange={(e) => setAddressProfile(p => ({ ...p, city: e.target.value }))} placeholder="Gasabo" /></div>
              </div>
              <div className="learners-account-section-actions">
                <button type="button" className="learners-account-save-btn" onClick={handleAddressSave} disabled={addressSaving}>
                  <img src={acSav} alt="" /> {addressSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="learners-account-section" data-section-key="appearance" ref={(el) => sectionRefs.current.appearance = el}>
            <header><h2>Appearance</h2></header>
            <div className="learners-account-section-body appearance-body">
              <div className="theme-mode-section">
                <div className="theme-mode-header">
                  <strong>Theme mode</strong>
                  <p>Select or customize your ui theme</p>
                </div>
                <div className="theme-options-grid">
                  <button type="button" className="theme-option-card is-active">
                    <div className="theme-img-wrap"><img src={themeDarkImg} alt="Dark Theme" /><div className="theme-active-check"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#22C55E"/><path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>
                    <span>Dark</span>
                  </button>
                  <button type="button" className="theme-option-card"><div className="theme-img-wrap"><img src={themeLightImg} alt="Light Theme" /></div><span>Light</span></button>
                  <button type="button" className="theme-option-card"><div className="theme-img-wrap"><img src={themeSystemImg} alt="System Theme" /></div><span>System</span></button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </section>
    </ProfessorLayout>
  );
}

export default ProfessorAccount;