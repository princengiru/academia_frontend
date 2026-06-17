import React, { useEffect, useRef, useState } from 'react';
import { AtSign, BriefcaseBusiness, Camera, MessageCircle, PlayCircle } from 'lucide-react';
import './account.css';
import learnersProfileImage from '../../../assets/imgs/default-profile.png';
import checkCircle from '../../../assets/icons/check-circle.svg';
import noCheckCircle from '../../../assets/icons/no-check-circle.svg';
import bPencil from '../../../assets/icons/b-pencil.svg';
import acSav from '../../../assets/icons/ac-sav.svg';
import fileIcon from '../../../assets/icons/file.svg';
import pdfIcon from '../../../assets/icons/pdf1.svg';

import trashIcon from '../../../assets/icons/trash.svg';
import xIcon from '../../../assets/icons/hoacancel.svg';
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

const resolveAssetUrl = (value) => {
  if (!value) {
    return learnersProfileImage;
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`;
  }

  return value;
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
            profileCompletion.name_completed
            && profileCompletion.phone_completed
            && profileCompletion.role_completed
            && profileCompletion.visibility_completed
            && hasText(basicProfile.name)
            && hasText(basicProfile.phone)
            && hasText(basicProfile.role)
            && hasText(basicProfile.visibility),
          ),
        },
        { label: 'Email', completed: hasText(basicProfile.email) },
        { label: 'Documents and Files', completed: Boolean(profileCompletion.documents_completed || documents.some((document) => document.isPersisted)) },
        { label: 'Social Connection', completed: false },
        { label: 'Two-Factor auth(2FA)', completed: Boolean(twoFactorEnabled) },
      ],
    },
    {
      title: 'Payments Methods',
      items: [
        { label: 'Airtel Money', completed: Boolean(paymentMethods.some((method) => method.paymentType === 'airtel_money')) },
        { label: 'Mobile Money', completed: Boolean(paymentMethods.some((method) => method.paymentType === 'mobile_money')) },
        { label: 'Bank Cards', completed: Boolean(profileCompletion.payment_method_completed || paymentMethods.some((method) => method.paymentType === 'bank_card')) },
      ],
    },
    {
      title: 'Advanced Settings',
      items: [
        {
          label: 'Preferences',
          completed: Boolean(
            profileCompletion.preferences_completed
            || (hasText(preferencesState.language) && hasText(preferencesState.timezone) && hasText(preferencesState.currency)),
          ),
        },
        { label: 'Notifications', completed: false },
        {
          label: 'Address',
          completed: Boolean(
            profileCompletion.address_completed
            || (hasText(addressProfile.address) && hasText(addressProfile.country) && hasText(addressProfile.city) && hasText(addressProfile.postcode)),
          ),
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

const navLabelBySection = {
  'basic-settings': 'Basic Settings',
  'email': 'Email',
  'documents-and-files': 'Documents and Files',
  'social-connection': 'Social Connection',
  'two-factor-auth': 'Two-Factor auth(2FA)',
  'payments-method': 'Bank Cards',
  'preferences': 'Preferences',
  'notifications': 'Notifications',
  'address': 'Address',
  'appearance': 'Appearance',
};

export default function Account() {
  const sectionRefs = useRef({});
  const photoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const [activeNavLabel, setActiveNavLabel] = useState('Basic Settings');
  const [basicProfile, setBasicProfile] = useState({
    id: '',
    email: '',
    name: '',
    phone: '',
    role: 'student',
    visibility: 'public',
    avatar: learnersProfileImage,
  });
  const [basicRoleOpen, setBasicRoleOpen] = useState(false);
  const [basicVisibilityOpen, setBasicVisibilityOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [documentsSaving, setDocumentsSaving] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileCompletionStatus, setProfileCompletionStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDocumentDragging, setIsDocumentDragging] = useState(false);
  const [socialConnections, setSocialConnections] = useState([]);
  const [socialSaving, setSocialSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesState, setPreferencesState] = useState({
    language: 'en',
    timezone: timezoneOptions[0].value,
    currency: 'USD',
    showListNames: false,
    showLinkedTaskNames: true,
    emailVisibility: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
  const [twoFactorOtp, setTwoFactorOtp] = useState('');
  const [twoFactorStage, setTwoFactorStage] = useState('idle');
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressProfile, setAddressProfile] = useState({
    address: '',
    country: '',
    state: '',
    city: '',
    postcode: '',
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsSaving, setPaymentMethodsSaving] = useState(false);
  const [paymentMethodTab, setPaymentMethodTab] = useState('bank_card');
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    paymentProvider: '',
    accountHolderName: '',
    accountNumber: '',
    phoneNumber: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    isPrimary: true,
  });

  const normalizePaymentMethods = (methods) => {
    if (!Array.isArray(methods)) {
      return [];
    }

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

  const pushFeedback = (message, type = 'success') => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

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
  const [switchState, setSwitchState] = useState({
    availability: true,
    emailSystemUpdates: true,
    emailPrimary: false,
    socialInstagram: true,
    socialLinkedin: false,
    twoFaSms: false,
    twoFaTotp: false,
    saveForFutureUse: true,
    prefEmailVisible: true,
    notifEmail: true,
    notifMessages: true,
    notifSubscribe: true,
    appearanceSidebar: true,
  });

  useEffect(() => () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setDocumentsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load documents');
        }

        const loadedDocuments = Array.isArray(data?.data?.documents)
          ? data.data.documents.map((document) => ({
              id: String(document.id),
              serverId: document.id,
              name: document.document_name,
              size: formatFileSize(document.file_size),
              filePath: document.file_path,
              fileType: document.file_type,
              isPublic: Boolean(document.is_public),
              createdAt: document.created_at,
              isPersisted: true,
            }))
          : [];

        setDocuments(loadedDocuments);
      } catch (error) {
        setProfileError(error.message || 'Failed to load documents');
      } finally {
        setDocumentsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setPaymentMethodsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/payment-methods`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load payment methods');
        }

        setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
      } catch (error) {
        setProfileError(error.message || 'Failed to load payment methods');
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileError('Please sign in again to load your account details.');
        setProfileLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        const user = data?.data?.user || {};
        setProfileCompletionStatus(data?.data?.completionStatus || null);
        setBasicProfile({
          id: user.id || '',
          email: user.email || '',
          name: user.name || '',
          phone: user.phone || '',
          role: user.role || 'student',
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
        setSwitchState((currentState) => ({
          ...currentState,
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
      } catch (error) {
        setProfileError(error.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadTwoFactorStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setTwoFactorLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/account-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load 2FA status');
        }

        const isEnabled = Boolean(data?.data?.twoFactorEnabled);
        setTwoFactorEnabled(isEnabled);
        setSwitchState((currentState) => ({
          ...currentState,
          twoFaSms: isEnabled,
          twoFaTotp: false,
        }));
      } catch (error) {
        pushFeedback(error.message || 'Failed to load 2FA status', 'error');
      } finally {
        setTwoFactorLoading(false);
      }
    };

    loadTwoFactorStatus();
  }, []);

  useEffect(() => {
    const sectionElements = Object.values(sectionRefs.current).filter(Boolean);
    if (!sectionElements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) {
          return;
        }

        const sectionKey = visible[0].target.getAttribute('data-section-key');
        if (sectionKey && navLabelBySection[sectionKey]) {
          setActiveNavLabel(navLabelBySection[sectionKey]);
        }
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: '-18% 0px -48% 0px',
      },
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleSidebarClick = (label) => {
    const sectionKey = navTargetByLabel[label];
    const element = sectionRefs.current[sectionKey];
    if (!element) {
      return;
    }

    setActiveNavLabel(label);
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sidebarSections = buildSidebarSections({
    completionStatus: profileCompletionStatus,
    documents,
    paymentMethods,
    basicProfile,
    addressProfile,
    preferencesState,
    twoFactorEnabled,
  });

  const toggleSwitch = (key) => {
    setSwitchState((currentState) => ({
      ...currentState,
      [key]: !currentState[key],
    }));
  };

  const handleCheckboxChange = (key) => (event) => {
    setSwitchState((currentState) => ({
      ...currentState,
      [key]: event.target.checked,
    }));
  };

  const handleBasicSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('Please sign in again to save your account details.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      const nameResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: basicProfile.name }),
      });

      const nameData = await nameResponse.json();
      if (!nameResponse.ok) {
        throw new Error(nameData.message || 'Failed to save name');
      }

      const nameUser = nameData?.data || {};
      setBasicProfile((currentState) => ({
        ...currentState,
        name: nameUser.name || currentState.name,
        avatar: nameUser.avatar ? resolveAssetUrl(nameUser.avatar) : currentState.avatar,
      }));

      const hasRequiredProfileFields = Boolean(basicProfile.phone && basicProfile.role && basicProfile.visibility);
      if (hasRequiredProfileFields) {
        const response = await fetch(`${API_BASE_URL}/api/profile/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: basicProfile.name,
            phone: basicProfile.phone,
            role: basicProfile.role,
            visibility: basicProfile.visibility,
            availableToHire: switchState.availability,
            emailNotifications: switchState.emailSystemUpdates,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to save profile');
        }

        const user = data?.data?.user || {};
        setBasicProfile((currentState) => ({
          ...currentState,
          name: user.name || currentState.name,
          phone: user.phone || currentState.phone,
          role: user.role || currentState.role,
          visibility: user.visibility || currentState.visibility,
          avatar: user.avatar ? resolveAssetUrl(user.avatar) : currentState.avatar,
        }));
      }

      pushFeedback('Basic settings saved successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to save profile', 'error');
    } finally {
      setProfileSaving(false);
    }
  };
  const handleEmailSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('Please sign in again to save your email settings.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setEmailSaving(true);

    try {
      const [emailResponse, preferenceResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: basicProfile.email }),
        }),
        fetch(`${API_BASE_URL}/api/profile/complete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: basicProfile.name,
            phone: basicProfile.phone,
            role: basicProfile.role,
            visibility: basicProfile.visibility,
            availableToHire: switchState.availability,
            emailNotifications: switchState.emailSystemUpdates,
          }),
        }),
      ]);

      const emailData = await emailResponse.json();
      const preferenceData = await preferenceResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailData.message || 'Failed to update email');
      }

      if (!preferenceResponse.ok) {
        throw new Error(preferenceData.message || 'Failed to update email preferences');
      }

      pushFeedback('Email settings saved successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to save email settings', 'error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setProfileError('Please sign in again to upload a photo.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      const nextAvatar = data?.data?.photoUrl || data?.data?.user?.avatar;
      setBasicProfile((currentState) => ({
        ...currentState,
        avatar: nextAvatar ? resolveAssetUrl(nextAvatar) : currentState.avatar,
      }));
      pushFeedback('Photo uploaded successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to upload photo', 'error');
    } finally {
      setPhotoUploading(false);
      event.target.value = '';
    }
  };

  const handlePhotoRemove = () => {
    // Try to delete photo on backend, fallback to client-side reset
    (async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setBasicProfile((currentState) => ({ ...currentState, avatar: learnersProfileImage }));
        pushFeedback('Photo reset to default.');
        return;
      }

      setPhotoUploading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/photo`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to reset photo');
        }

        const nextAvatar = data?.data?.photoUrl || data?.data?.user?.avatar;
        setBasicProfile((currentState) => ({
          ...currentState,
          avatar: nextAvatar ? resolveAssetUrl(nextAvatar) : learnersProfileImage,
        }));
        pushFeedback('Photo reset to default.');
      } catch (err) {
        // on error revert client-side and show message
        setBasicProfile((currentState) => ({ ...currentState, avatar: learnersProfileImage }));
        pushFeedback(err.message || 'Failed to reset photo', 'error');
      } finally {
        setPhotoUploading(false);
      }
    })();
  };

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 KB';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex += 1;
    }

    return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleDocumentsSelect = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    const nextDocuments = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      file,
      isPersisted: false,
    }));

    setDocuments((currentDocuments) => [...currentDocuments, ...nextDocuments]);
    event.target.value = '';
  };

  const handleDocumentDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDocumentDragging(false);

    const droppedFiles = Array.from(event.dataTransfer?.files || []);
    if (!droppedFiles.length) {
      return;
    }

    const nextDocuments = droppedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      file,
      isPersisted: false,
    }));

    setDocuments((currentDocuments) => [...currentDocuments, ...nextDocuments]);
  };

  const handleDocumentDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDocumentDragging) {
      setIsDocumentDragging(true);
    }
  };

  const handleDocumentDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDocumentDragging(false);
  };

  const removeDocument = async (documentId) => {
    const targetDocument = documents.find((document) => document.id === documentId);

    if (targetDocument?.serverId && targetDocument.isPersisted) {
      const token = localStorage.getItem('token');
      if (!token) {
        pushFeedback('Please sign in again to remove documents.', 'error');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/documents/${targetDocument.serverId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to remove document');
        }

        const updatedDocuments = Array.isArray(data?.data?.documents)
          ? data.data.documents.map((document) => ({
              id: String(document.id),
              serverId: document.id,
              name: document.document_name,
              size: formatFileSize(document.file_size),
              filePath: document.file_path,
              fileType: document.file_type,
              isPublic: Boolean(document.is_public),
              createdAt: document.created_at,
              isPersisted: true,
            }))
          : documents.filter((document) => document.id !== documentId);

        setDocuments(updatedDocuments);
        pushFeedback('Document removed successfully.');
      } catch (error) {
        pushFeedback(error.message || 'Failed to remove document', 'error');
      }
      return;
    }

    setDocuments((currentDocuments) => currentDocuments.filter((document) => document.id !== documentId));
  };

  const openDocumentPicker = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentsSave = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to save your documents.', 'error');
      return;
    }

    const uploadPendingDocuments = async () => {
      const pendingDocuments = documents.filter((document) => document.file && !document.isPersisted);

      if (!pendingDocuments.length) {
        pushFeedback('No new documents to save.');
        return;
      }

      setDocumentsSaving(true);
      try {
        let latestDocuments = documents.filter((document) => document.isPersisted);

        for (const document of pendingDocuments) {
          const formData = new FormData();
          formData.append('document', document.file);

          const response = await fetch(`${API_BASE_URL}/api/profile/documents`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || `Failed to upload ${document.name}`);
          }

          latestDocuments = Array.isArray(data?.data?.documents)
            ? data.data.documents.map((item) => ({
                id: String(item.id),
                serverId: item.id,
                name: item.document_name,
                size: formatFileSize(item.file_size),
                filePath: item.file_path,
                fileType: item.file_type,
                isPublic: Boolean(item.is_public),
                createdAt: item.created_at,
                isPersisted: true,
              }))
            : latestDocuments;
        }

        setDocuments(latestDocuments);
        pushFeedback('Documents saved successfully.');
      } catch (error) {
        pushFeedback(error.message || 'Failed to save documents', 'error');
      } finally {
        setDocumentsSaving(false);
      }
    };

    uploadPendingDocuments();
  };

  const handlePreferencesSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to save preferences.', 'error');
      return;
    }

    setPreferencesSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language: preferencesState.language,
          timezone: preferencesState.timezone,
          currency: preferencesState.currency,
          showListNames: preferencesState.showListNames,
          showLinkedTaskNames: preferencesState.showLinkedTaskNames,
          emailVisibility: preferencesState.emailVisibility,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save preferences');
      }

      const user = data?.data?.user || {};
      setPreferencesState((currentState) => ({
        ...currentState,
        language: user.language || currentState.language,
        timezone: user.timezone || currentState.timezone,
        currency: user.currency || currentState.currency,
        showListNames: Boolean(user.show_list_names),
        showLinkedTaskNames: user.show_linked_task_names !== false,
        emailVisibility: Boolean(user.email_visibility),
      }));
      setSwitchState((currentState) => ({
        ...currentState,
        prefEmailVisible: Boolean(user.email_visibility),
      }));
      pushFeedback('Preferences saved successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to save preferences', 'error');
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handlePaymentMethodTabChange = (paymentType) => {
    setPaymentMethodTab(paymentType);
  };

  const handlePaymentMethodSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to save payment methods.', 'error');
      return;
    }

    if (!paymentMethodForm.accountHolderName.trim()) {
      pushFeedback('Account holder name is required.', 'error');
      return;
    }

    if (paymentMethodTab === 'bank_card') {
      const cardDigits = paymentMethodForm.cardNumber.replace(/\D/g, '');
      if (cardDigits.length < 4 || !paymentMethodForm.expiryMonth.trim() || !paymentMethodForm.expiryYear.trim()) {
        pushFeedback('Card number and expiry date are required for bank cards.', 'error');
        return;
      }
    }

    if (['mobile_money', 'airtel_money'].includes(paymentMethodTab)) {
      if (!paymentMethodForm.accountNumber.trim() || !paymentMethodForm.phoneNumber.trim()) {
        pushFeedback('Account number and phone number are required for mobile money.', 'error');
        return;
      }
    }

    setPaymentMethodsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentType: paymentMethodTab,
          paymentProvider: paymentMethodForm.paymentProvider.trim() || null,
          accountHolderName: paymentMethodForm.accountHolderName.trim(),
          accountNumber: paymentMethodForm.accountNumber.trim() || null,
          phoneNumber: paymentMethodForm.phoneNumber.trim() || null,
          cardLastFour: paymentMethodForm.cardNumber.replace(/\D/g, '').slice(-4) || null,
          expiryDate: paymentMethodForm.expiryMonth && paymentMethodForm.expiryYear
            ? `${paymentMethodForm.expiryMonth}/${paymentMethodForm.expiryYear}`
            : null,
          isPrimary: Boolean(paymentMethodForm.isPrimary),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save payment method');
      }

      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
      setPaymentMethodForm((currentState) => ({
        ...currentState,
        paymentProvider: '',
        accountHolderName: '',
        accountNumber: '',
        phoneNumber: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        isPrimary: true,
      }));
      pushFeedback('Payment method saved successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to save payment method', 'error');
    } finally {
      setPaymentMethodsSaving(false);
    }
  };

  const handlePrimaryPaymentMethod = async (paymentMethodId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to update payment methods.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/payment-methods/${paymentMethodId}/primary`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update primary payment method');
      }

      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
      pushFeedback('Primary payment method updated.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to update payment method', 'error');
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to update payment methods.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment method');
      }

      setPaymentMethods(normalizePaymentMethods(data?.data?.paymentMethods));
      pushFeedback('Payment method deleted.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to delete payment method', 'error');
    }
  };

  const handleAddressSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to save your address.', 'error');
      return;
    }

    if (!basicProfile.name || !basicProfile.phone || !basicProfile.role) {
      pushFeedback('Please complete the basic profile fields first.', 'error');
      return;
    }

    setAddressSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: basicProfile.name,
          phone: basicProfile.phone,
          role: basicProfile.role,
          visibility: basicProfile.visibility,
          availableToHire: switchState.availability,
          emailNotifications: switchState.emailSystemUpdates,
          address: addressProfile.address,
          country: addressProfile.country,
          state: addressProfile.state,
          city: addressProfile.city,
          postcode: addressProfile.postcode,
          language: preferencesState.language,
          timezone: preferencesState.timezone,
          currency: preferencesState.currency,
          showListNames: preferencesState.showListNames,
          showLinkedTaskNames: preferencesState.showLinkedTaskNames,
          emailVisibility: preferencesState.emailVisibility,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save address');
      }

      const user = data?.data?.user || {};
      setAddressProfile({
        address: user.address || addressProfile.address,
        country: user.country || addressProfile.country,
        state: user.state || addressProfile.state,
        city: user.city || addressProfile.city,
        postcode: user.postcode || addressProfile.postcode,
      });
      pushFeedback('Address saved successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to save address', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const startEnableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to manage 2FA.', 'error');
      return;
    }

    setTwoFactorProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/enable-2fa`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send 2FA OTP');
      }

      setTwoFactorStage('enable-pending');
      setTwoFactorOtp('');
      pushFeedback(data.message || 'OTP sent. Verify it to enable 2FA.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to start 2FA setup', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyEnableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to verify 2FA.', 'error');
      return;
    }

    if (!twoFactorOtp.trim()) {
      pushFeedback('Please enter the OTP code from your email.', 'error');
      return;
    }

    setTwoFactorProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp-enable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setTwoFactorEnabled(true);
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      setSwitchState((currentState) => ({
        ...currentState,
        twoFaSms: true,
      }));
      pushFeedback(data.message || '2FA enabled successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to enable 2FA', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const startDisableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to manage 2FA.', 'error');
      return;
    }

    setTwoFactorProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send disable OTP');
      }

      setTwoFactorStage('disable-pending');
      setTwoFactorOtp('');
      pushFeedback(data.message || 'OTP sent. Verify it to disable 2FA.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to start 2FA disable flow', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const verifyDisableTwoFactor = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      pushFeedback('Please sign in again to verify 2FA.', 'error');
      return;
    }

    if (!twoFactorOtp.trim()) {
      pushFeedback('Please enter the OTP code from your email.', 'error');
      return;
    }

    setTwoFactorProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/disable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      setTwoFactorEnabled(false);
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      setSwitchState((currentState) => ({
        ...currentState,
        twoFaSms: false,
      }));
      pushFeedback(data.message || '2FA disabled successfully.');
    } catch (error) {
      pushFeedback(error.message || 'Failed to disable 2FA', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  };

  const cancelTwoFactorFlow = () => {
    setTwoFactorStage('idle');
    setTwoFactorOtp('');
  };

  const getSwitchClassName = (key) => {
    const isOn = Boolean(switchState[key]);
    return `learners-account-switch${isOn ? ' is-on' : ''}`;
  };

  return (
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
                    aria-current={activeNavLabel === item.label ? 'true' : undefined}
                  >
                    <img
                      src={item.completed ? checkCircle : noCheckCircle}
                      alt={item.completed ? 'Completed' : 'Not completed'}
                      className="learners-account-nav-icon"
                    />
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
        <section
          className="learners-account-section"
          data-section-key="basic-settings"
          ref={(element) => {
            sectionRefs.current['basic-settings'] = element;
          }}
        >
          <header>
            <h2>Basic Settings</h2>
            <button type="button" className="section-edit-btn">
              <img src={bPencil} alt="Edit" />
            </button>
          </header>

          <div className="learners-account-section-body">
            <div className="learners-account-field-row">
              <label>Client ID</label>
              <div className="learners-account-field-control">
                <input type="text" value={basicProfile.id || 'Loading...'} readOnly aria-label="Client ID" />
              </div>
            </div>

            <div className="learners-account-field-row">
              <label>Photo</label>
              <div className="learners-account-field-control">
                <div className="learners-account-avatar-row">
                  <p>Profile photo loaded from your account record</p>
                  <div className="learners-account-avatar-wrap">
                    <img
                      src={basicProfile.avatar}
                      alt="Learner profile"
                      className="learners-account-avatar-image"
                      onClick={() => photoInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          photoInputRef.current?.click();
                        }
                      }}
                    />
                    <button type="button" className="learners-account-avatar-remove" aria-label="Remove photo" onClick={handlePhotoRemove}>
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
                <input
                  type="text"
                  value={basicProfile.name}
                  onChange={(event) => setBasicProfile((currentState) => ({ ...currentState, name: event.target.value }))}
                  aria-label="Name"
                  disabled={profileLoading}
                />
              </div>
            </div>

            <div className="learners-account-field-row">
              <label>Role</label>
              <div className="learners-account-field-control">
                <div className="dropdown learners-account-dropdown" style={{ position: 'relative' }}>
                  <button
                    className="learners-account-dropdown-btn dropdown-toggle"
                    type="button"
                    aria-expanded={basicRoleOpen}
                    onClick={() => setBasicRoleOpen((currentState) => !currentState)}
                  >
                    {basicProfile.role === 'instructor' ? 'Instructor' : 'Student'}
                  </button>
                  {basicRoleOpen && (
                    <ul className="dropdown-menu learners-account-dropdown-menu show">
                      <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile((currentState) => ({ ...currentState, role: 'student' })); setBasicRoleOpen(false); }}>Student</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile((currentState) => ({ ...currentState, role: 'instructor' })); setBasicRoleOpen(false); }}>Instructor</button></li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="learners-account-field-row">
              <label>Phone number</label>
              <div className="learners-account-field-control">
                <div className="learners-account-phone">
                  <span className="learners-account-phone-prefix">+250</span>
                  <span className="learners-account-phone-sep">|</span>
                  <input
                    type="tel"
                    value={basicProfile.phone}
                    onChange={(event) => setBasicProfile((currentState) => ({ ...currentState, phone: event.target.value }))}
                    aria-label="Phone number"
                    disabled={profileLoading}
                  />
                </div>
              </div>
            </div>

            <div className="learners-account-field-row">
              <label>Visibility</label>
              <div className="learners-account-field-control">
                <div className="dropdown learners-account-dropdown" style={{ position: 'relative' }}>
                  <button
                    className="learners-account-dropdown-btn dropdown-toggle"
                    type="button"
                    aria-expanded={basicVisibilityOpen}
                    onClick={() => setBasicVisibilityOpen((currentState) => !currentState)}
                  >
                    {basicProfile.visibility === 'private' ? 'Private' : 'Public'}
                  </button>
                  {basicVisibilityOpen && (
                    <ul className="dropdown-menu learners-account-dropdown-menu show">
                      <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile((currentState) => ({ ...currentState, visibility: 'public' })); setBasicVisibilityOpen(false); }}>Public</button></li>
                      <li><button className="dropdown-item" type="button" onClick={() => { setBasicProfile((currentState) => ({ ...currentState, visibility: 'private' })); setBasicVisibilityOpen(false); }}>Private</button></li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="learners-account-toggle-row">
              <label>Availability</label>
              <div className="learners-account-toggle-copy">
                <span>Available to hire</span>
                <button type="button" className={getSwitchClassName('availability')} aria-pressed={switchState.availability} aria-label="Availability toggle" onClick={() => toggleSwitch('availability')}>
                  <span />
                </button>
              </div>
            </div>

            <div className="learners-account-section-actions">
              <button
                type="button"
                className="learners-account-save-btn"
                onClick={handleBasicSave}
                disabled={profileSaving || profileLoading}
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Email */}
        <section
          className="learners-account-section"
          data-section-key="email"
          ref={(element) => {
            sectionRefs.current.email = element;
          }}
        >
        <header>
            <h2>Email</h2>
        </header>
        <div className="learners-account-section-body">
            
            {/* Notice the added 'align-top' class here */}
            <div className="learners-account-field-row align-top">
            <label>Email</label>
            
            <div className="learners-account-field-control">
                <input
                  type="email"
                  value={basicProfile.email}
                  onChange={(event) => setBasicProfile((currentState) => ({ ...currentState, email: event.target.value }))}
                  disabled={profileLoading}
                />
                
                <div className="learners-account-email-toggles">
                <span className="email-toggle-text">System Updates</span>
                <button type="button" className={getSwitchClassName('emailSystemUpdates')} aria-pressed={switchState.emailSystemUpdates} onClick={() => toggleSwitch('emailSystemUpdates')}>
                    <span />
                </button>
                
                <span className="email-toggle-text">Primary</span>
                <button type="button" className={getSwitchClassName('emailPrimary')} aria-pressed={switchState.emailPrimary} onClick={() => toggleSwitch('emailPrimary')}>
                    <span />
                </button>
                </div>

                <p className="learners-account-muted">
                Input your email, designate as primary for priority updates. Toggle to seamlessly customize your communication preferences
                </p>
            </div>
            </div>

            <div className="learners-account-section-actions">
            {/* Removed the save icon to match the screenshot exactly */}
            <button
              type="button"
              className="learners-account-save-btn"
              onClick={handleEmailSave}
              disabled={emailSaving || profileLoading}
            >
              {emailSaving ? 'Saving...' : 'Save Changes'}
            </button>
            </div>
        </div>
        </section>

        {/* Documents and Files */}
        <section
          className="learners-account-section"
          data-section-key="documents-and-files"
          ref={(element) => {
            sectionRefs.current['documents-and-files'] = element;
          }}
        >
        <header>
            <h2>Documents and Files</h2>
        </header>
        <div className="learners-account-section-body">
            
            <div
              className={`learners-account-dropzone${isDocumentDragging ? ' is-dragging' : ''}`}
              role="button"
              tabIndex={0}
              onClick={openDocumentPicker}
              onDrop={handleDocumentDrop}
              onDragOver={handleDocumentDragOver}
              onDragEnter={handleDocumentDragOver}
              onDragLeave={handleDocumentDragLeave}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openDocumentPicker();
                }
              }}
            >
              <img src={fileIcon} alt="Upload" className="dropzone-icon" />
              <div className="learners-account-dropzone-content">
                <strong>Add certificates files or click upload</strong>
                <p className="learners-account-muted">Drop files here or use the picker to add them.</p>
              </div>
            </div>

            <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple hidden onChange={handleDocumentsSelect} />

            {documentsLoading ? (
              <div className="learners-account-empty-docs">
                <div className="learners-account-empty-docs-copy">
                  <strong>Loading documents...</strong>
                  <p>Please wait while we fetch your saved files.</p>
                </div>
              </div>
            ) : documents.length > 0 ? (
              <div className="learners-account-file-grid">
                {documents.map((document) => (
                  <div key={document.id} className="learners-account-file-card">
                    <img src={pdfIcon} alt="File" className="file-type-icon" />
                    <div className="file-meta">
                      <strong>{document.name}</strong>
                      <small>{document.size}</small>
                    </div>
                    <button
                      type="button"
                      className="file-remove-badge"
                      aria-label={`Remove ${document.name}`}
                      onClick={() => removeDocument(document.id)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="learners-account-empty-docs">
                <div className="learners-account-empty-docs-copy">
                  <strong>No documents yet</strong>
                  <p>Upload certificates, resumes, or supporting files to display them here.</p>
                </div>
              </div>
            )}

            <div className="learners-account-section-actions">
              <button type="button" className="learners-account-save-btn" onClick={handleDocumentsSave} disabled={documentsSaving || documentsLoading}>
                {documentsSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
        </div>
        </section>

        {/* Social Connection */}
        <section
          className="learners-account-section"
          data-section-key="social-connection"
          ref={(element) => {
            sectionRefs.current['social-connection'] = element;
          }}
        >
        <header>
            <h2>Social Media Connection</h2>
        </header>
        <div className="learners-account-section-body">
            
            <div className="social-empty-state">
              <h3>No social connections yet</h3>
              <p className="learners-account-muted">Social connections backend is not available yet, so this area starts empty.</p>
            </div>

            {/* More Options */}
            <div className="social-more-options">
            <h3>More Social connections options</h3>
            <p className="learners-account-muted">
                Effortless access awaits! Connect seamlessly with your preferred social account.
            </p>

            <div className="social-buttons-wrapper">
              <button type="button" className="social-connect-btn" onClick={() => pushFeedback('Social backend is not available yet.', 'error')}>
              <AtSign className="social-connect-icon" aria-hidden="true" /> Connect X
                </button>
              <button type="button" className="social-connect-btn" onClick={() => pushFeedback('Social backend is not available yet.', 'error')}>
              <PlayCircle className="social-connect-icon" aria-hidden="true" /> Connect Youtube
                </button>
              <button type="button" className="social-connect-btn" onClick={() => pushFeedback('Social backend is not available yet.', 'error')}>
              <MessageCircle className="social-connect-icon" aria-hidden="true" /> Connect Facebook
                </button>
              <button type="button" className="social-connect-btn" onClick={() => pushFeedback('Social backend is not available yet.', 'error')}>
                <img src={plusIcon} alt="" /> Add More
                </button>
            </div>
            </div>

            <div className="learners-account-section-actions">
            <button type="button" className="learners-account-save-btn" disabled>
              Save Changes
            </button>
            </div>
        </div>
        </section>

        {/* Two-Factor Authentication (2FA) */}
        <section
          className="learners-account-section"
          data-section-key="two-factor-auth"
          ref={(element) => {
            sectionRefs.current['two-factor-auth'] = element;
          }}
        >
        <header>
            <h2>Two-Factor authentication(2FA)</h2>
            <button type="button" className="section-menu-btn" aria-label="More options">
            &#8942; {/* Vertical ellipsis character for the 3 dots */}
            </button>
        </header>
        <div className="learners-account-section-body">
            
            <div className="two-fa-cards-wrapper">
            {/* SMS Card */}
            <div className="two-fa-card">
                <div className="two-fa-icon-wrap">
                <img src={twoFa1Icon} alt="SMS Icon" />
                </div>
                <div className="two-fa-info">
                <strong>Email OTP (Database-backed)</strong>
                <span>{twoFactorEnabled ? '2FA is enabled for your account.' : 'Enable 2FA with one-time codes sent to your email.'}</span>
                </div>
                <button
                  type="button"
                  className={getSwitchClassName('twoFaSms')}
                  aria-pressed={switchState.twoFaSms}
                  onClick={twoFactorEnabled ? startDisableTwoFactor : startEnableTwoFactor}
                  disabled={twoFactorProcessing || twoFactorLoading}
                >
                <span />
                </button>
            </div>

            {/* Authenticator Card */}
            <div className="two-fa-card">
                <div className="two-fa-icon-wrap">
                <img src={twoFa2Icon} alt="Authenticator Icon" />
                </div>
                <div className="two-fa-info">
                <strong>Authenticator App (TOTP)</strong>
                <span>Not available from current backend APIs yet.</span>
                </div>
                <button type="button" className={getSwitchClassName('twoFaTotp')} aria-pressed={false} disabled>
                <span />
                </button>
            </div>
            </div>

            {twoFactorStage !== 'idle' && (
              <div className="learners-account-field-row align-top" style={{ marginTop: '24px' }}>
                <label>OTP Code</label>
                <div className="learners-account-field-control">
                  <input
                    type="text"
                    value={twoFactorOtp}
                    onChange={(event) => setTwoFactorOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <p className="learners-account-muted">
                    {twoFactorStage === 'enable-pending'
                      ? 'Check your email, then enter the OTP to enable 2FA.'
                      : 'Check your email, then enter the OTP to disable 2FA.'}
                  </p>
                </div>
              </div>
            )}

            <div className="learners-account-section-actions">
              {twoFactorStage === 'enable-pending' ? (
                <>
                  <button type="button" className="learners-account-save-btn" onClick={verifyEnableTwoFactor} disabled={twoFactorProcessing || twoFactorOtp.length !== 6}>
                    {twoFactorProcessing ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button type="button" className="learners-account-save-btn" onClick={cancelTwoFactorFlow} disabled={twoFactorProcessing}>
                    Cancel
                  </button>
                </>
              ) : twoFactorStage === 'disable-pending' ? (
                <>
                  <button type="button" className="learners-account-save-btn" onClick={verifyDisableTwoFactor} disabled={twoFactorProcessing || twoFactorOtp.length !== 6}>
                    {twoFactorProcessing ? 'Verifying...' : 'Verify & Disable'}
                  </button>
                  <button type="button" className="learners-account-save-btn" onClick={cancelTwoFactorFlow} disabled={twoFactorProcessing}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="learners-account-save-btn"
                  onClick={twoFactorEnabled ? startDisableTwoFactor : startEnableTwoFactor}
                  disabled={twoFactorProcessing || twoFactorLoading}
                >
                  {twoFactorLoading
                    ? 'Loading...'
                    : twoFactorProcessing
                      ? 'Please wait...'
                      : twoFactorEnabled
                        ? 'Disable 2FA'
                        : 'Enable 2FA'}
                </button>
              )}
            </div>
        </div>
        </section>

        {/* Payments Method */}
        <section
          className="learners-account-section"
          data-section-key="payments-method"
          ref={(element) => {
            sectionRefs.current['payments-method'] = element;
          }}
        >
        <header>
            <h2>Payments Method</h2>
        </header>
        <div className="learners-account-section-body">
            {paymentMethodsLoading ? (
              <div className="social-empty-state">
                <h3>Loading payment methods...</h3>
                <p className="learners-account-muted">Please wait while we fetch your saved payment methods.</p>
              </div>
            ) : paymentMethods.length > 0 ? (
              <div className="learners-account-file-grid payment-methods-grid">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="learners-account-file-card payment-method-card">
                    <img src={method.paymentType === 'bank_card' ? bankCardIcon : method.paymentType === 'airtel_money' ? airtelPayIcon : mtnPayIcon} alt={method.paymentType} className="file-type-icon" />
                    <div className="file-meta">
                      <strong>{method.accountHolderName}</strong>
                      <small>{method.paymentType.replace('_', ' ')}</small>
                      <small>{method.accountNumber || method.phoneNumber || method.cardLastFour || method.expiryDate || 'Saved'}</small>
                    </div>
                    <div className="payment-method-actions">
                      <button type="button" className={method.isPrimary ? 'payment-pill is-primary' : 'payment-pill'} onClick={() => handlePrimaryPaymentMethod(method.id)}>
                        <span className="payment-pill-dot" />
                        {method.isPrimary ? 'Primary' : 'Make primary'}
                      </button>
                      <button type="button" className="file-remove-badge" aria-label={`Delete ${method.accountHolderName}`} onClick={() => handleDeletePaymentMethod(method.id)}>
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="social-empty-state">
                <h3>No payment methods yet</h3>
                <p className="learners-account-muted">Add one below to start saving it to your account.</p>
              </div>
            )}

            <div className="payment-type-selection">
            <h5>1. Payment Type</h5>
            <ul className="nav nav-tabs" id="paymentTab" role="tablist">
                <li className="nav-item" role="presentation">
                <button className={`nav-link${paymentMethodTab === 'mobile_money' ? ' active' : ''}`} type="button" role="tab" onClick={() => handlePaymentMethodTabChange('mobile_money')}>
                    <div className="method-icon"><img src={mtnPayIcon} alt="MTN" /></div>
                    <span>MTN Mobile Money</span>
                </button>
                </li>
                <li className="nav-item" role="presentation">
                <button className={`nav-link${paymentMethodTab === 'airtel_money' ? ' active' : ''}`} type="button" role="tab" onClick={() => handlePaymentMethodTabChange('airtel_money')}>
                    <div className="method-icon"><img src={airtelPayIcon} alt="Airtel" /></div>
                    <span>Airtel Money</span>
                </button>
                </li>
                <li className="nav-item" role="presentation">
                <button className={`nav-link${paymentMethodTab === 'bank_card' ? ' active' : ''}`} type="button" role="tab" onClick={() => handlePaymentMethodTabChange('bank_card')}>
                    <div className="method-icon"><img src={bankCardIcon} alt="Bank Card" /></div>
                    <span>Bank Cards</span>
                </button>
                </li>
            </ul>
            </div>

            <div className="tab-content" id="paymentTabContent">
            <div className="tab-pane fade show active bank-card-pane" role="tabpanel">
                <h5 className="pane-title">Add {paymentMethodTab === 'bank_card' ? 'Bank Card' : paymentMethodTab === 'airtel_money' ? 'Airtel Money' : 'MTN Mobile Money'}</h5>

                <div className="bank-form-grid">
                <div className="bank-form-row">
                    <label className="bank-form-label">
                    Account Holder <span className="required">*</span>
                    <img src={infoGrayIcon} className="info-icon" alt="info" />
                    </label>
                    <div className="bank-form-control">
                    <input type="text" value={paymentMethodForm.accountHolderName} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, accountHolderName: event.target.value }))} placeholder="Max Smith" />
                    </div>
                </div>

                {paymentMethodTab === 'bank_card' ? (
                  <>
                    <div className="bank-form-row">
                        <label className="bank-form-label">
                        Card Number <span className="required">*</span>
                        <img src={infoGrayIcon} className="info-icon" alt="info" />
                        </label>
                        <div className="bank-form-control has-icons">
                        <input type="text" value={paymentMethodForm.cardNumber} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, cardNumber: event.target.value }))} placeholder="010 000 000 0000 0000" />
                        <div className="card-network-logos">
                            <img src={visaIcon} alt="Visa" />
                            <img src={mastercardIcon} alt="Mastercard" />
                            <img src={amexIcon} alt="Amex" />
                        </div>
                        </div>
                    </div>

                    <div className="bank-form-row">
                        <label className="bank-form-label">Expiration Date</label>
                        <div className="bank-form-control multi-inputs">
                        <input type="text" value={paymentMethodForm.expiryMonth} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, expiryMonth: event.target.value }))} placeholder="MM" />
                        <input type="text" value={paymentMethodForm.expiryYear} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, expiryYear: event.target.value }))} placeholder="YYYY" />
                        <div className="cvv-input-wrap">
                            <input type="text" placeholder="CVV" />
                            <img src={cvvIcon} className="cvv-icon" alt="CVV" />
                        </div>
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bank-form-row">
                        <label className="bank-form-label">Account Number <span className="required">*</span></label>
                        <div className="bank-form-control">
                          <input type="text" value={paymentMethodForm.accountNumber} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, accountNumber: event.target.value }))} placeholder="Account number" />
                        </div>
                    </div>
                    <div className="bank-form-row">
                        <label className="bank-form-label">Phone Number <span className="required">*</span></label>
                        <div className="bank-form-control">
                          <input type="text" value={paymentMethodForm.phoneNumber} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, phoneNumber: event.target.value }))} placeholder="07xx xxx xxx" />
                        </div>
                    </div>
                    <div className="bank-form-row">
                        <label className="bank-form-label">Provider</label>
                        <div className="bank-form-control">
                          <input type="text" value={paymentMethodForm.paymentProvider} onChange={(event) => setPaymentMethodForm((currentState) => ({ ...currentState, paymentProvider: event.target.value }))} placeholder="Provider name" />
                        </div>
                    </div>
                  </>
                )}

                <div className="bank-form-row action-row">
                    <div className="save-future-toggle save-card">
                    <label>Save for future use</label>
                    <button type="button" className={getSwitchClassName('saveForFutureUse')} aria-pressed={switchState.saveForFutureUse} onClick={() => {
                      toggleSwitch('saveForFutureUse');
                      setPaymentMethodForm((currentState) => ({ ...currentState, isPrimary: !currentState.isPrimary }));
                    }}>
                      <span />
                    </button>
                    </div>
                    
                    <button type="button" className="btn-save-changes" onClick={handlePaymentMethodSave} disabled={paymentMethodsSaving}>
                      {paymentMethodsSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                </div> 

                <div className="sso-footer-text">
                Saved payment methods are loaded from your account and stored in the database.
                </div>

            </div>
            </div>

        </div>
        </section>

        {/* Preferences */}
        <section
          className="learners-account-section"
          data-section-key="preferences"
          ref={(element) => {
            sectionRefs.current.preferences = element;
          }}
        >
        <header>
            <h2>Preferences</h2>
        </header>
        <div className="learners-account-section-body">

            {/* Language */}
            <div className="learners-account-field-row">
            <label>Language</label>
            <div className="learners-account-field-control">
                <div className="dropdown w-100">
                <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="d-flex align-items-center gap-2">
                    <span className="pref-icon">{languageOptions.find((option) => option.value === preferencesState.language)?.icon || '🇺🇸'}</span>
                    <span>{languageOptions.find((option) => option.value === preferencesState.language)?.label || 'American English'}</span>
                    </div>
                </button>
                <ul className="dropdown-menu w-100 shadow-sm border-0">
                    {languageOptions.map((option) => (
                      <li key={option.value}>
                        <button className="dropdown-item" type="button" onClick={() => setPreferencesState((currentState) => ({ ...currentState, language: option.value }))}>
                          {option.icon} {option.label}
                        </button>
                      </li>
                    ))}
                </ul>
                </div>
            </div>
            </div>

            {/* Time zone */}
            <div className="learners-account-field-row">
            <label>Time zone</label>
            <div className="learners-account-field-control">
                <div className="dropdown w-100">
                <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span>{timezoneOptions.find((option) => option.value === preferencesState.timezone)?.label || timezoneOptions[0].label}</span>
                </button>
                <ul className="dropdown-menu w-100 shadow-sm border-0">
                    {timezoneOptions.map((option) => (
                      <li key={option.value}>
                        <button className="dropdown-item" type="button" onClick={() => setPreferencesState((currentState) => ({ ...currentState, timezone: option.value }))}>
                          {option.label}
                        </button>
                      </li>
                    ))}
                </ul>
                </div>
            </div>
            </div>

            {/* Currency */}
            <div className="learners-account-field-row">
            <label>Currency</label>
            <div className="learners-account-field-control">
                <div className="dropdown w-100">
                <button className="btn pref-bs-dropdown w-100 d-flex align-items-center dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="d-flex align-items-center gap-2">
                    <span className="pref-icon currency-badge">{currencyOptions.find((option) => option.value === preferencesState.currency)?.icon || '$'}</span>
                    <span>{currencyOptions.find((option) => option.value === preferencesState.currency)?.label || 'United States Dollar (USD)'}</span>
                    </div>
                </button>
                <ul className="dropdown-menu w-100 shadow-sm border-0">
                    {currencyOptions.map((option) => (
                      <li key={option.value}>
                        <button className="dropdown-item" type="button" onClick={() => setPreferencesState((currentState) => ({ ...currentState, currency: option.value }))}>
                          {option.icon} {option.label}
                        </button>
                      </li>
                    ))}
                </ul>
                </div>
            </div>
            </div>

            {/* Attributes */}
            <div className="learners-account-field-row align-top">
            <label>Attributes</label>
            <div className="learners-account-field-control pref-checkbox-group">
                
                <label className="pref-checkbox-wrapper">
                <input type="checkbox" checked={preferencesState.showListNames} onChange={(event) => setPreferencesState((currentState) => ({ ...currentState, showListNames: event.target.checked }))} />
                <span className="pref-checkmark"></span>
                <div className="pref-check-text">
                    <strong>Show list names</strong>
                    <p>See the name next to each icon</p>
                </div>
                </label>

                <label className="pref-checkbox-wrapper">
                <input type="checkbox" checked={preferencesState.showLinkedTaskNames} onChange={(event) => setPreferencesState((currentState) => ({ ...currentState, showLinkedTaskNames: event.target.checked }))} />
                <span className="pref-checkmark"></span>
                <div className="pref-check-text">
                    <strong>Show linked task names</strong>
                    <p>Show task names next to ids for linked project tasks.</p>
                </div>
                </label>

            </div>
            </div>

            {/* Email visibility */}
            <div className="learners-account-field-row">
            <label>Email visibility</label>
            <div className="learners-account-field-control">
                <div className="pref-toggle-inline">
                <button type="button" className={getSwitchClassName('prefEmailVisible')} aria-pressed={switchState.prefEmailVisible} onClick={() => {
                  toggleSwitch('prefEmailVisible');
                  setPreferencesState((currentState) => ({ ...currentState, emailVisibility: !currentState.emailVisibility }));
                }}>
                    <span />
                </button>
                <span className="pref-toggle-text">Visible</span>
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
        <section 
        className="learners-account-section"
          data-section-key="notifications"
          ref={(element) => {
            sectionRefs.current.notifications = element;
          }}
        >
        <header>
            <h2>Notifications</h2>
        </header>
        <div className="learners-account-section-body">

            {/* Top Notification Cards */}
            <div className="notif-top-cards">
            
            {/* Email Card */}
            <div className="notif-card">
                <div className="notif-icon-wrap">
                <img src={nott1Icon} alt="Email" />
                </div>
                <div className="notif-info">
                <strong>Email</strong>
                <span>Tailor Your Email Preferences.</span>
                </div>
                <button type="button" className={getSwitchClassName('notifEmail')} aria-pressed={switchState.notifEmail} onClick={() => toggleSwitch('notifEmail')}>
                <span />
                </button>
            </div>

            {/* Messages Card */}
            <div className="notif-card">
                <div className="notif-icon-wrap">
                <img src={nott2Icon} alt="Messages" />
                </div>
                <div className="notif-info">
                <strong>Messages</strong>
                <span>Stay Updated on Mobile.</span>
                </div>
                <button type="button" className={getSwitchClassName('notifMessages')} aria-pressed={switchState.notifMessages} onClick={() => toggleSwitch('notifMessages')}>
                <span />
                </button>
            </div>

            </div>

            {/* Project Notifications */}
            <div className="notif-group">
            <h3>Project notifications</h3>
            <div className="notif-options">
                <label className="custom-radio">
                <input type="radio" name="project_notif" value="all" />
                <span className="radio-mark"></span>
                <span className="radio-text">All new messages (Recommended)</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="project_notif" value="direct_hiring" />
                <span className="radio-mark"></span>
                <span className="radio-text">Direct @mentions & Hiring</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="project_notif" value="direct" />
                <span className="radio-mark"></span>
                <span className="radio-text">Only Direct @mentions</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="project_notif" value="hiring" />
                <span className="radio-mark"></span>
                <span className="radio-text">Only Hiring</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="project_notif" value="disabled" defaultChecked />
                <span className="radio-mark"></span>
                <span className="radio-text">Disabled</span>
                </label>
            </div>
            </div>

            {/* Email Notifications */}
            <div className="notif-group">
            <h3>Email notifications</h3>
            <div className="notif-options">
                <label className="custom-radio">
                <input type="radio" name="email_notif" value="all" />
                <span className="radio-mark"></span>
                <span className="radio-text">All new messages and statuses</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="email_notif" value="unread" defaultChecked />
                <span className="radio-mark"></span>
                <span className="radio-text">Unread messages and statuses () Recommended</span>
                </label>
                
                <label className="custom-radio">
                <input type="radio" name="email_notif" value="disabled" />
                <span className="radio-mark"></span>
                <span className="radio-text">Disabled</span>
                </label>
            </div>
            </div>

            {/* Subscriptions */}
            <div className="notif-group">
            <h3>Subscriptions</h3>
            <div className="notif-options">
                <label className="custom-checkbox-square">
              <input type="checkbox" checked={switchState.notifSubscribe} onChange={handleCheckboxChange('notifSubscribe')} />
                <span className="check-mark-square"></span>
                <span className="check-text">Automatically subscribe to tasks you create</span>
                </label>
            </div>
            </div>

            <div className="learners-account-section-actions">
            <button type="button" className="learners-account-save-btn">
                Save Changes
            </button>
            </div>

        </div>
        </section>

        {/* Address */}
        <section
          className="learners-account-section"
          data-section-key="address"
          ref={(element) => {
            sectionRefs.current.address = element;
          }}
        >
          <header>
            <h2>Address</h2>
          </header>
          <div className="learners-account-section-body">
            <div className="learners-account-field-row">
              <label>Address</label>
              <div className="learners-account-field-control">
                <input
                  type="text"
                  value={addressProfile.address}
                  onChange={(event) => setAddressProfile((currentState) => ({ ...currentState, address: event.target.value }))}
                  placeholder="Avinguda imaginària, 789"
                />
              </div>
            </div>
            <div className="learners-account-field-row">
              <label>Country</label>
              <div className="learners-account-field-control">
                <input
                  type="text"
                  value={addressProfile.country}
                  onChange={(event) => setAddressProfile((currentState) => ({ ...currentState, country: event.target.value }))}
                  placeholder="Spain"
                />
              </div>
            </div>
            <div className="learners-account-field-row">
              <label>State</label>
              <div className="learners-account-field-control">
                <input
                  type="text"
                  value={addressProfile.state}
                  onChange={(event) => setAddressProfile((currentState) => ({ ...currentState, state: event.target.value }))}
                  placeholder="Barcelona"
                />
              </div>
            </div>
            <div className="learners-account-field-row">
              <label>City</label>
              <div className="learners-account-field-control">
                <input
                  type="text"
                  value={addressProfile.city}
                  onChange={(event) => setAddressProfile((currentState) => ({ ...currentState, city: event.target.value }))}
                  placeholder="Barcelona"
                />
              </div>
            </div>
            <div className="learners-account-field-row">
              <label>Postcode</label>
              <div className="learners-account-field-control">
                <input
                  type="text"
                  value={addressProfile.postcode}
                  onChange={(event) => setAddressProfile((currentState) => ({ ...currentState, postcode: event.target.value }))}
                  placeholder="08012"
                />
              </div>
            </div>

            <div className="learners-account-section-actions">
              <button type="button" className="learners-account-save-btn" onClick={handleAddressSave} disabled={addressSaving}>
                <img src={acSav} alt="" /> {addressSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section
          className="learners-account-section"
          data-section-key="appearance"
          ref={(element) => {
            sectionRefs.current.appearance = element;
          }}
        >
        <header>
            <h2>Appearance</h2>
        </header>
        <div className="learners-account-section-body appearance-body">

            {/* Theme Mode Selection */}
            <div className="theme-mode-section">
            <div className="theme-mode-header">
                <strong>Theme mode</strong>
                <p>Select or customize your ui theme</p>
            </div>

            <div className="theme-options-grid">
                
                {/* Dark Theme (Active) */}
                <button type="button" className="theme-option-card is-active">
                <div className="theme-img-wrap">
                    <img src={themeDarkImg} alt="Dark Theme" />
                    <div className="theme-active-check">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    </div>
                </div>
                <span>Dark</span>
                </button>

                {/* Light Theme */}
                <button type="button" className="theme-option-card">
                <div className="theme-img-wrap">
                    <img src={themeLightImg} alt="Light Theme" />
                </div>
                <span>Light</span>
                </button>

                {/* System Theme */}
                <button type="button" className="theme-option-card">
                <div className="theme-img-wrap">
                    <img src={themeSystemImg} alt="System Theme" />
                </div>
                <span>System</span>
                </button>

            </div>
            </div>

            <hr className="appearance-divider" />

            {/* Transparent Sidebar */}
            <div className="learners-account-field-row align-top appearance-sidebar-row">
            <label>Transparent sidebar</label>
            <div className="learners-account-field-control sidebar-toggle-control">
                <div className="sidebar-toggle-wrap">
                <span className="toggle-status">Active</span>
                <button type="button" className={getSwitchClassName('appearanceSidebar')} aria-pressed={switchState.appearanceSidebar} onClick={() => toggleSwitch('appearanceSidebar')}>
                  <span />
                </button>
                </div>
                <p className="appearance-desc">
                Toggle the transparent sidebar for a sleek interface. Switch it on for transparency or off for a solid background.
                </p>
            </div>
            </div>

            <div className="learners-account-section-actions">
            <button type="button" className="learners-account-save-btn">
                Save Changes
            </button>
            </div>

        </div>
        </section>

      </div>
    </section>
  );
}