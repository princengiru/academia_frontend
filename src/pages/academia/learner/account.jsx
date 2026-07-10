import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './account.css';
import LearnersPageShell from './LearnersPageShell';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import light_theme from '../../../assets/imgs/light_theme.png';
import dark_theme from '../../../assets/imgs/dark_theme.png';
import system_default_theme from '../../../assets/imgs/system_default_theme.png';
import hoadraganddrop from '../../../assets/icons/hoadraganddrop.svg';
import hoapdffile from '../../../assets/icons/hoapdffile.svg';
import hoafacebook2 from '../../../assets/icons/hoafacebook2.svg';
import hoainstagram2 from '../../../assets/icons/hoainstagram2.svg';
import hoalinkedin2 from '../../../assets/icons/hoalinkedin2.svg';
import hoax2 from '../../../assets/icons/hoax2.svg';
import hoaairtel from '../../../assets/icons/hoaairtel.svg';
import hoamtn from '../../../assets/icons/hoamtn.svg';
import hoabankcards from '../../../assets/icons/hoabankcards.svg';
import hoayoutube from '../../../assets/icons/hoayoutube2.svg';
import hoaadd2 from '../../../assets/icons/hoaadd2.svg';
import hoadelete from '../../../assets/icons/hoadelete.svg';
import hoa2famessage from '../../../assets/icons/hoa2famessage.svg';
import hoa2faotp from '../../../assets/icons/hoa2faotp.svg';
import hoasmsnotifications from '../../../assets/icons/hoasmsnotifications.svg';
import hoaemailnotifications from '../../../assets/icons/hoaemailnotifications.svg';
import defaultProfileImage from '../../../assets/imgs/default-profile.png';
import ProfilePhotoCropModal from './ProfilePhotoCropModal';
import HoasButtonSpinner from './HoasButtonSpinner';
import { getProfilePhotoDisplayUrl, isCustomProfilePhoto } from './profilePhotoUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_COUNT = 5;
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

// ─── Inline SVGs ──────────────────────────────────────────────────────────────
const IconChecked = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#450468" />
    <path d="M4.5 8L7 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
  </svg>
);

const IconUnchecked = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#E4E6EF" />
    <path d="M4.5 8L7 10.5L11.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUpload = () => (
  <img src={hoadraganddrop} alt="Upload" />
);

const IconInstagram = () => (
  <img src={hoainstagram2} alt="Instagram" />
);

const IconLinkedIn = () => (
  <img src={hoalinkedin2} alt="LinkedIn" />
);

const IconFacebook = () => (
  <img src={hoafacebook2} alt="Facebook" />
);

const IconTwitter = () => (
  <img src={hoax2} alt="Twitter" style={{ width: '12px', height: '12px' }} />
);

const IconTiktok = () => (
  <img src={hoax2} alt="Tiktok" />
);

const IconSms = () => (
  <img src={hoa2famessage} alt="SMS" />
);

const IconAuthenticator = () => (
  <img src={hoa2faotp} alt="Authenticator" />
);

const IconDotsVertical = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18" />
    <path d="M12 3a15 15 0 0 0 0 18" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconCurrency = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10" />
    <path d="M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5S10.34 12 12 12s3 1.12 3 2.5S13.66 17 12 17s-3-1.12-3-2.5" />
  </svg>
);

const IconMail = () => (
  <img src={hoaemailnotifications} alt="Mail" />
);

const IconMessage = () => (
  <img src={hoasmsnotifications} alt="Message" />
);

const IconCheckSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);

const IconSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

// ─── Nav sections definition ───────────────────────────────────────────────────
const NAV_CATEGORIES = [
  {
    title: 'Basic Setup',
    items: [
      { id: 'general', label: 'General Settings' },
      { id: 'email', label: 'Email' },
      { id: 'documents', label: 'Documents & Files' },
      { id: 'social', label: 'Social Media Links' },
    ]
  },
  {
    title: 'Payments',
    items: [
      { id: 'payment-mtn', label: 'MTN Mobile Money' },
      { id: 'payment-airtel', label: 'Airtel Money' },
      { id: 'payment-card', label: 'Bank Cards' },
    ]
  },
  {
    title: 'Advanced Settings',
    items: [
      { id: 'preferences', label: 'Preferences' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'address', label: 'Address' },
      { id: 'appearance', label: 'Appearance' },
    ]
  }
];

const ROLE_LABELS = {
  student: 'Student',
  instructor: 'Instructor',
};

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const buildSectionCompletion = ({
  completionStatus,
  fullName,
  phoneNumber,
  emailAddress,
  documentFiles,
  socialConnections,
  savedPaymentMethods,
  preferenceLanguage,
  preferenceTimezone,
  preferenceCurrency,
  addrAddress,
  addrCountry,
  addrCity,
  addrPostcode,
  hasNotificationSettings,
  hasAppearanceSettings,
}) => {
  const completion = completionStatus || {};

  const hasMtn = savedPaymentMethods.some((m) => {
    const type = (m.paymentType || '').toLowerCase();
    const provider = (m.paymentProvider || '').toLowerCase();
    return type === 'mobile_money' || provider.includes('mtn');
  });
  const hasAirtel = savedPaymentMethods.some((m) => {
    const type = (m.paymentType || '').toLowerCase();
    const provider = (m.paymentProvider || '').toLowerCase();
    return type === 'airtel_money' || provider.includes('airtel');
  });
  const hasCard = savedPaymentMethods.some((m) => {
    const type = (m.paymentType || '').toLowerCase();
    return type === 'bank_card' || type === 'card';
  });

  return {
    general: Boolean(
      completion.name_completed
      && completion.phone_completed
      && hasText(fullName)
      && hasText(phoneNumber)
    ),
    email: hasText(emailAddress),
    documents: Boolean(completion.documents_completed || documentFiles.some((d) => d.isPersisted)),
    social: socialConnections.some((c) => c.active && hasText(c.url)),
    'payment-mtn': hasMtn,
    'payment-airtel': hasAirtel,
    'payment-card': Boolean(completion.payment_method_completed || hasCard),
    preferences: Boolean(
      completion.preferences_completed
      || (hasText(preferenceLanguage) && hasText(preferenceTimezone) && hasText(preferenceCurrency))
    ),
    notifications: hasNotificationSettings,
    address: Boolean(
      completion.address_completed
      || (hasText(addrAddress) && hasText(addrCountry) && hasText(addrCity) && hasText(addrPostcode))
    ),
    appearance: hasAppearanceSettings,
  };
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <label className={`hoas-switch${disabled ? ' is-disabled' : ''}`}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="hoas-slider" />
  </label>
);

const InfoHint = ({ text }) => (
  <span className="hoas-info-hint" tabIndex={0} aria-label={text}>
    <span className="hoas-info-icon">i</span>
    <span className="hoas-info-tooltip">{text}</span>
  </span>
);

const PaymentFieldLabel = ({ children, hint }) => (
  <div className="hoas-payment-field-label">
    <span className="hoas-payment-label-title">{children}</span>
    {hint && <InfoHint text={hint} />}
  </div>
);

const DOCUMENT_FILES = [
  { name: 'MyCV.pdf', size: '5.6 MB' },
  { name: 'Resume A0.pdf', size: '5.6 MB' },
];

const MAX_CUSTOM_SOCIALS = 3;

const SOCIAL_PLATFORM_CATALOG = {
  instagram: {
    aliases: ['instagram', 'ig'],
    name: 'Instagram',
    renderIcon: () => <IconInstagram />,
    iconBg: '#FFF0F6',
    iconColor: '#F8285A',
  },
  facebook: {
    aliases: ['facebook', 'fb'],
    name: 'Facebook',
    renderIcon: () => <IconFacebook />,
    iconBg: '#EFF4FF',
    iconColor: '#1877F2',
  },
  youtube: {
    aliases: ['youtube', 'yt'],
    name: 'YouTube',
    renderIcon: () => <img src={hoayoutube} alt="Youtube" />,
    iconBg: '#FFF2F2',
    iconColor: '#FF0000',
  },
  linkedin: {
    aliases: ['linkedin', 'li', 'in'],
    name: 'LinkedIn',
    renderIcon: () => <IconLinkedIn />,
    iconBg: '#EFF6FF',
    iconColor: '#1B84FF',
  },
  x: {
    aliases: ['x', 'twitter'],
    name: 'X',
    renderIcon: () => <IconTwitter />,
    iconBg: '#F5F5F5',
    iconColor: '#111111',
  },
};

const resolveSocialPlatformKey = (value) => {
  const key = String(value || '').toLowerCase().trim();
  if (!key) return null;

  for (const [canonical, config] of Object.entries(SOCIAL_PLATFORM_CATALOG)) {
    if (canonical === key || config.aliases.includes(key)) return canonical;
  }

  return null;
};

const getSocialPlatformConfig = (platformKey) => {
  const resolved = resolveSocialPlatformKey(platformKey);
  return resolved ? { id: resolved, ...SOCIAL_PLATFORM_CATALOG[resolved] } : null;
};

const renderSocialIcon = (platformKey, isCustom = false) => {
  const config = getSocialPlatformConfig(platformKey);
  if (!isCustom && config) return config.renderIcon();
  return <IconGlobe />;
};

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(String(value).trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const SOCIAL_CONNECT_ACTIONS = [
  {
    id: 'instagram',
    label: 'Connect Instagram',
    name: 'Instagram',
    icon: <IconInstagram />,
    iconBg: '#FFF0F6',
    iconColor: '#F8285A',
  },
  {
    id: 'facebook',
    label: 'Connect Facebook',
    name: 'Facebook',
    icon: <IconFacebook />,
    iconBg: '#EFF4FF',
    iconColor: '#1877F2',
  },
  {
    id: 'youtube',
    label: 'Connect Youtube',
    name: 'YouTube',
    icon: <img src={hoayoutube} alt="Youtube" />,
    iconBg: '#FFF2F2',
    iconColor: '#FF0000',
  },
  {
    id: 'linkedin',
    label: 'Connect LinkedIn',
    name: 'LinkedIn',
    icon: <IconLinkedIn />,
    iconBg: '#EFF6FF',
    iconColor: '#1B84FF',
  },
  {
    id: 'x',
    label: 'Connect X',
    name: 'X',
    icon: <IconTwitter />,
    iconBg: '#F5F5F5',
    iconColor: '#111111',
  },
  {
    id: 'more',
    label: 'Add More',
    icon: <img src={hoaadd2} alt="Add" />,
  },
];

const TWO_FACTOR_OPTIONS = [
  {
    id: 'sms',
    label: 'Text Message (SMS)',
    description: 'Instant codes for secure account verification.',
    icon: <IconSms />,
  },
  {
    id: 'authenticator',
    label: 'Authenticator App (TOTP)',
    description: 'Elevate protection with an authenticator app for two-factor authentication.',
    icon: <IconAuthenticator />,
  },
];

const PAYMENT_TYPES = [
  { id: 'mtn', label: 'MTN Mobile Money', icon: '/assets/icons/MTN-pay.svg', bg: '#FFF8DD' },
  { id: 'airtel', label: 'Airtel Money', icon: '/assets/icons/AIR-pay.svg', bg: '#FFEEF3' },
  { id: 'card', label: 'Bank Cards', icon: '/assets/icons/CARD-pay.svg', bg: '#F3EEFF' },
];

const PREFERENCE_LANGUAGE_OPTIONS = [
  { value: 'en-us', label: 'American English', icon: '🇺🇸' },
  { value: 'en-gb', label: 'British English', icon: '🇬🇧' },
  { value: 'fr-fr', label: 'French', icon: '🇫🇷' },
];

const PREFERENCE_TIMEZONE_OPTIONS = [
  { value: 'gmt-5-est', label: <><span style={{ color: '#99A1B7' }}>GMT -5:00 -</span> Eastern Time(US & Canada)</> },
  { value: 'gmt+2-east-africa', label: <><span style={{ color: '#99A1B7' }}>GMT +2:00 -</span> East Africa Time</> },
  { value: 'gmt+1-cet', label: <><span style={{ color: '#99A1B7' }}>GMT +1:00 -</span> Central European Time</> },
];

const PREFERENCE_CURRENCY_OPTIONS = [
  { value: 'usd', label: 'United States Dollar (USD)', icon: <span style={{ color: '#99A1B7', fontSize: '12px', fontWeight: 600 }}>USD</span> },
  { value: 'rwf', label: 'Rwandan Franc (RWF)', icon: <span style={{ color: '#99A1B7', fontSize: '12px', fontWeight: 600 }}>RWF</span> },
  { value: 'eur', label: 'Euro (EUR)', icon: <span style={{ color: '#99A1B7', fontSize: '12px', fontWeight: 600 }}>EUR</span> },
];

const PROJECT_NOTIFICATION_OPTIONS = [
  { value: 'all', label: 'All new messages (Recommended)' },
  { value: 'mentions-hiring', label: 'Direct @mentions & Hiring' },
  { value: 'mentions', label: 'Only Direct @mentions' },
  { value: 'hiring', label: 'Only Hiring' },
  { value: 'disabled', label: 'Disabled' },
];

const EMAIL_NOTIFICATION_OPTIONS = [
  { value: 'all-statuses', label: 'All new messages and statuses' },
  { value: 'unread-statuses', label: 'Unread messages and statuses ( Recommended )' },
  { value: 'disabled', label: 'Disabled' },
];

const getPaymentMethodForGateway = (methods, gateway) => {
  if (gateway === 'mtn') {
    return methods.find((method) => method.paymentType === 'mobile_money');
  }
  if (gateway === 'airtel') {
    return methods.find((method) => method.paymentType === 'airtel_money');
  }
  return methods.find((method) => method.paymentType === 'bank_card');
};

const serializeSocialConnections = (connections) => JSON.stringify(
  connections.map((connection) => ({
    id: connection.id,
    name: connection.name,
    url: connection.url,
    active: Boolean(connection.active),
  })).sort((a, b) => String(a.id).localeCompare(String(b.id)))
);

const serializeDocuments = (files) => JSON.stringify(
  files.map((file) => ({
    id: file.id,
    serverId: file.serverId || null,
    name: file.name,
    isPersisted: Boolean(file.isPersisted),
  }))
);

const getPaymentFormSnapshot = (gateway, fields) => JSON.stringify(
  gateway === 'card'
    ? {
      paymentCardName: fields.paymentCardName || '',
      paymentCardNumber: fields.paymentCardNumber || '',
      paymentExpiryMonth: fields.paymentExpiryMonth || '',
      paymentCvv: fields.paymentCvv || '',
      savePaymentMethod: Boolean(fields.savePaymentMethod),
    }
    : {
      paymentSimName: fields.paymentSimName || '',
      paymentPhoneNumber: fields.paymentPhoneNumber || '',
      savePaymentMethod: Boolean(fields.savePaymentMethod),
    }
);

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / (1024 ** unitIndex);
  return `${value >= 10 || unitIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
};

const formatRwandaPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits) return '';

  let normalized = digits;
  if (normalized.startsWith('7')) {
    normalized = `0${normalized}`;
  }
  if (!normalized.startsWith('07')) {
    normalized = `07${normalized.replace(/^0+/, '').slice(0, 8)}`;
  }

  normalized = normalized.slice(0, 10);
  const parts = [normalized.slice(0, 4), normalized.slice(4, 7), normalized.slice(7, 10)].filter(Boolean);
  return parts.join(' ');
};

const detectCardBrand = (value) => {
  const digits = value.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
};

const formatCardNumber = (value, brand) => {
  const digits = value.replace(/\D/g, '');
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const maxLength = groups.reduce((total, groupLength) => total + groupLength, 0);
  const trimmedDigits = digits.slice(0, maxLength);
  let cursor = 0;

  return groups
    .map((groupLength) => {
      const chunk = trimmedDigits.slice(cursor, cursor + groupLength);
      cursor += groupLength;
      return chunk;
    })
    .filter(Boolean)
    .join(' ');
};

const isMaskedValue = (value) => typeof value === 'string' && value.includes('*');

const extractPaymentDigits = (value) => {
  if (isMaskedValue(value)) return '';
  return String(value || '').replace(/\D/g, '');
};

// ─── Country Data (all world countries) ───────────────────────────────────────
const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫', pattern: '## ### ####' },
  { code: 'AL', name: 'Albania', dial: '+355', flag: '🇦🇱', pattern: '### ### ###' },
  { code: 'DZ', name: 'Algeria', dial: '+213', flag: '🇩🇿', pattern: '### ## ## ##' },
  { code: 'AD', name: 'Andorra', dial: '+376', flag: '🇦🇩', pattern: '### ###' },
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴', pattern: '### ### ###' },
  { code: 'AG', name: 'Antigua and Barbuda', dial: '+1268', flag: '🇦🇬', pattern: '### ####' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', pattern: '## #### ####' },
  { code: 'AM', name: 'Armenia', dial: '+374', flag: '🇦🇲', pattern: '## ######' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', pattern: '#### ### ###' },
  { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹', pattern: '### ######' },
  { code: 'AZ', name: 'Azerbaijan', dial: '+994', flag: '🇦🇿', pattern: '## ### ## ##' },
  { code: 'BS', name: 'Bahamas', dial: '+1242', flag: '🇧🇸', pattern: '### ####' },
  { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭', pattern: '#### ####' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩', pattern: '### ### ###' },
  { code: 'BB', name: 'Barbados', dial: '+1246', flag: '🇧🇧', pattern: '### ####' },
  { code: 'BY', name: 'Belarus', dial: '+375', flag: '🇧🇾', pattern: '## ### ## ##' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪', pattern: '### ## ## ##' },
  { code: 'BZ', name: 'Belize', dial: '+501', flag: '🇧🇿', pattern: '### ####' },
  { code: 'BJ', name: 'Benin', dial: '+229', flag: '🇧🇯', pattern: '## ## ## ##' },
  { code: 'BT', name: 'Bhutan', dial: '+975', flag: '🇧🇹', pattern: '## ### ###' },
  { code: 'BO', name: 'Bolivia', dial: '+591', flag: '🇧🇴', pattern: '## ### ####' },
  { code: 'BA', name: 'Bosnia and Herzegovina', dial: '+387', flag: '🇧🇦', pattern: '## ### ###' },
  { code: 'BW', name: 'Botswana', dial: '+267', flag: '🇧🇼', pattern: '## ### ###' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', pattern: '## ##### ####' },
  { code: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳', pattern: '### ####' },
  { code: 'BG', name: 'Bulgaria', dial: '+359', flag: '🇧🇬', pattern: '### ### ###' },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫', pattern: '## ## ## ##' },
  { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮', pattern: '## ## ## ##' },
  { code: 'CV', name: 'Cabo Verde', dial: '+238', flag: '🇨🇻', pattern: '### ## ##' },
  { code: 'KH', name: 'Cambodia', dial: '+855', flag: '🇰🇭', pattern: '## ### ###' },
  { code: 'CM', name: 'Cameroon', dial: '+237', flag: '🇨🇲', pattern: '#### ## ## ##' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', pattern: '(###) ###-####' },
  { code: 'CF', name: 'Central African Republic', dial: '+236', flag: '🇨🇫', pattern: '## ## ## ##' },
  { code: 'TD', name: 'Chad', dial: '+235', flag: '🇹🇩', pattern: '## ## ## ##' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', pattern: '# #### ####' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', pattern: '### #### ####' },
  { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴', pattern: '### ### ####' },
  { code: 'KM', name: 'Comoros', dial: '+269', flag: '🇰🇲', pattern: '### ## ##' },
  { code: 'CD', name: 'Congo (DRC)', dial: '+243', flag: '🇨🇩', pattern: '### ### ###' },
  { code: 'CG', name: 'Congo (Republic)', dial: '+242', flag: '🇨🇬', pattern: '## ### ####' },
  { code: 'CR', name: 'Costa Rica', dial: '+506', flag: '🇨🇷', pattern: '#### ####' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮', pattern: '## ## ## ##' },
  { code: 'HR', name: 'Croatia', dial: '+385', flag: '🇭🇷', pattern: '## ### ####' },
  { code: 'CU', name: 'Cuba', dial: '+53', flag: '🇨🇺', pattern: '# ### ####' },
  { code: 'CY', name: 'Cyprus', dial: '+357', flag: '🇨🇾', pattern: '## ### ###' },
  { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿', pattern: '### ### ###' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰', pattern: '## ## ## ##' },
  { code: 'DJ', name: 'Djibouti', dial: '+253', flag: '🇩🇯', pattern: '## ## ## ##' },
  { code: 'DM', name: 'Dominica', dial: '+1767', flag: '🇩🇲', pattern: '### ####' },
  { code: 'DO', name: 'Dominican Republic', dial: '+1809', flag: '🇩🇴', pattern: '### ####' },
  { code: 'EC', name: 'Ecuador', dial: '+593', flag: '🇪🇨', pattern: '## ### ####' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬', pattern: '### ### ####' },
  { code: 'SV', name: 'El Salvador', dial: '+503', flag: '🇸🇻', pattern: '#### ####' },
  { code: 'GQ', name: 'Equatorial Guinea', dial: '+240', flag: '🇬🇶', pattern: '### ### ###' },
  { code: 'ER', name: 'Eritrea', dial: '+291', flag: '🇪🇷', pattern: '# ### ###' },
  { code: 'EE', name: 'Estonia', dial: '+372', flag: '🇪🇪', pattern: '#### ####' },
  { code: 'SZ', name: 'Eswatini', dial: '+268', flag: '🇸🇿', pattern: '#### ####' },
  { code: 'ET', name: 'Ethiopia', dial: '+251', flag: '🇪🇹', pattern: '## ### ####' },
  { code: 'FJ', name: 'Fiji', dial: '+679', flag: '🇫🇯', pattern: '### ####' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', pattern: '## ### ## ##' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', pattern: '# ## ## ## ##' },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦', pattern: '# ## ## ##' },
  { code: 'GM', name: 'Gambia', dial: '+220', flag: '🇬🇲', pattern: '### ####' },
  { code: 'GE', name: 'Georgia', dial: '+995', flag: '🇬🇪', pattern: '### ## ## ##' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', pattern: '#### #######' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', pattern: '## ### ####' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷', pattern: '### ### ####' },
  { code: 'GD', name: 'Grenada', dial: '+1473', flag: '🇬🇩', pattern: '### ####' },
  { code: 'GT', name: 'Guatemala', dial: '+502', flag: '🇬🇹', pattern: '#### ####' },
  { code: 'GN', name: 'Guinea', dial: '+224', flag: '🇬🇳', pattern: '### ### ###' },
  { code: 'GW', name: 'Guinea-Bissau', dial: '+245', flag: '🇬🇼', pattern: '### ####' },
  { code: 'GY', name: 'Guyana', dial: '+592', flag: '🇬🇾', pattern: '### ####' },
  { code: 'HT', name: 'Haiti', dial: '+509', flag: '🇭🇹', pattern: '## ## ####' },
  { code: 'HN', name: 'Honduras', dial: '+504', flag: '🇭🇳', pattern: '#### ####' },
  { code: 'HU', name: 'Hungary', dial: '+36', flag: '🇭🇺', pattern: '## ### ####' },
  { code: 'IS', name: 'Iceland', dial: '+354', flag: '🇮🇸', pattern: '### ####' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', pattern: '##### #####' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', pattern: '### #### ####' },
  { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷', pattern: '### ### ####' },
  { code: 'IQ', name: 'Iraq', dial: '+964', flag: '🇮🇶', pattern: '### ### ####' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', pattern: '## ### ####' },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱', pattern: '## ### ####' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', pattern: '### ### ####' },
  { code: 'JM', name: 'Jamaica', dial: '+1876', flag: '🇯🇲', pattern: '### ####' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', pattern: '## #### ####' },
  { code: 'JO', name: 'Jordan', dial: '+962', flag: '🇯🇴', pattern: '# #### ####' },
  { code: 'KZ', name: 'Kazakhstan', dial: '+7', flag: '🇰🇿', pattern: '### ### ## ##' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', pattern: '### ### ###' },
  { code: 'KI', name: 'Kiribati', dial: '+686', flag: '🇰🇮', pattern: '## ###' },
  { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼', pattern: '#### ####' },
  { code: 'KG', name: 'Kyrgyzstan', dial: '+996', flag: '🇰🇬', pattern: '### ### ###' },
  { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦', pattern: '## ## ### ###' },
  { code: 'LV', name: 'Latvia', dial: '+371', flag: '🇱🇻', pattern: '## ### ###' },
  { code: 'LB', name: 'Lebanon', dial: '+961', flag: '🇱🇧', pattern: '## ### ###' },
  { code: 'LS', name: 'Lesotho', dial: '+266', flag: '🇱🇸', pattern: '#### ####' },
  { code: 'LR', name: 'Liberia', dial: '+231', flag: '🇱🇷', pattern: '### ### ###' },
  { code: 'LY', name: 'Libya', dial: '+218', flag: '🇱🇾', pattern: '## ### ####' },
  { code: 'LI', name: 'Liechtenstein', dial: '+423', flag: '🇱🇮', pattern: '### ####' },
  { code: 'LT', name: 'Lithuania', dial: '+370', flag: '🇱🇹', pattern: '### ## ###' },
  { code: 'LU', name: 'Luxembourg', dial: '+352', flag: '🇱🇺', pattern: '### ### ###' },
  { code: 'MG', name: 'Madagascar', dial: '+261', flag: '🇲🇬', pattern: '## ## ### ##' },
  { code: 'MW', name: 'Malawi', dial: '+265', flag: '🇲🇼', pattern: '### ## ## ##' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', pattern: '## #### ####' },
  { code: 'MV', name: 'Maldives', dial: '+960', flag: '🇲🇻', pattern: '### ####' },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱', pattern: '## ## ## ##' },
  { code: 'MT', name: 'Malta', dial: '+356', flag: '🇲🇹', pattern: '#### ####' },
  { code: 'MH', name: 'Marshall Islands', dial: '+692', flag: '🇲🇭', pattern: '### ####' },
  { code: 'MR', name: 'Mauritania', dial: '+222', flag: '🇲🇷', pattern: '## ## ## ##' },
  { code: 'MU', name: 'Mauritius', dial: '+230', flag: '🇲🇺', pattern: '#### ####' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', pattern: '## #### ####' },
  { code: 'FM', name: 'Micronesia', dial: '+691', flag: '🇫🇲', pattern: '### ####' },
  { code: 'MD', name: 'Moldova', dial: '+373', flag: '🇲🇩', pattern: '### ## ###' },
  { code: 'MC', name: 'Monaco', dial: '+377', flag: '🇲🇨', pattern: '## ## ## ##' },
  { code: 'MN', name: 'Mongolia', dial: '+976', flag: '🇲🇳', pattern: '#### ####' },
  { code: 'ME', name: 'Montenegro', dial: '+382', flag: '🇲🇪', pattern: '## ### ###' },
  { code: 'MA', name: 'Morocco', dial: '+212', flag: '🇲🇦', pattern: '## ## ## ## ##' },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿', pattern: '## ### ####' },
  { code: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲', pattern: '## ### ###' },
  { code: 'NA', name: 'Namibia', dial: '+264', flag: '🇳🇦', pattern: '## ### ####' },
  { code: 'NR', name: 'Nauru', dial: '+674', flag: '🇳🇷', pattern: '### ####' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵', pattern: '### ### ###' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', pattern: '## ### ####' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', pattern: '## ### ####' },
  { code: 'NI', name: 'Nicaragua', dial: '+505', flag: '🇳🇮', pattern: '#### ####' },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪', pattern: '## ## ## ##' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', pattern: '### ### ####' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴', pattern: '### ## ###' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲', pattern: '#### ####' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', pattern: '### ### ####' },
  { code: 'PW', name: 'Palau', dial: '+680', flag: '🇵🇼', pattern: '### ####' },
  { code: 'PA', name: 'Panama', dial: '+507', flag: '🇵🇦', pattern: '#### ####' },
  { code: 'PG', name: 'Papua New Guinea', dial: '+675', flag: '🇵🇬', pattern: '### ####' },
  { code: 'PY', name: 'Paraguay', dial: '+595', flag: '🇵🇾', pattern: '### ### ###' },
  { code: 'PE', name: 'Peru', dial: '+51', flag: '🇵🇪', pattern: '### ### ###' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', pattern: '### ### ####' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', pattern: '### ### ###' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', pattern: '### ### ###' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦', pattern: '#### ####' },
  { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴', pattern: '### ### ###' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺', pattern: '### ### ## ##' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', pattern: '### ### ###' },
  { code: 'KN', name: 'Saint Kitts and Nevis', dial: '+1869', flag: '🇰🇳', pattern: '### ####' },
  { code: 'LC', name: 'Saint Lucia', dial: '+1758', flag: '🇱🇨', pattern: '### ####' },
  { code: 'VC', name: 'Saint Vincent', dial: '+1784', flag: '🇻🇨', pattern: '### ####' },
  { code: 'WS', name: 'Samoa', dial: '+685', flag: '🇼🇸', pattern: '## ####' },
  { code: 'SM', name: 'San Marino', dial: '+378', flag: '🇸🇲', pattern: '#### ######' },
  { code: 'ST', name: 'São Tomé and Príncipe', dial: '+239', flag: '🇸🇹', pattern: '### ####' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', pattern: '## ### ####' },
  { code: 'SN', name: 'Senegal', dial: '+221', flag: '🇸🇳', pattern: '## ### ## ##' },
  { code: 'RS', name: 'Serbia', dial: '+381', flag: '🇷🇸', pattern: '## ### ####' },
  { code: 'SC', name: 'Seychelles', dial: '+248', flag: '🇸🇨', pattern: '# ### ###' },
  { code: 'SL', name: 'Sierra Leone', dial: '+232', flag: '🇸🇱', pattern: '## ######' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', pattern: '#### ####' },
  { code: 'SK', name: 'Slovakia', dial: '+421', flag: '🇸🇰', pattern: '### ### ###' },
  { code: 'SI', name: 'Slovenia', dial: '+386', flag: '🇸🇮', pattern: '## ### ###' },
  { code: 'SB', name: 'Solomon Islands', dial: '+677', flag: '🇸🇧', pattern: '## ###' },
  { code: 'SO', name: 'Somalia', dial: '+252', flag: '🇸🇴', pattern: '## ### ###' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', pattern: '## ### ####' },
  { code: 'SS', name: 'South Sudan', dial: '+211', flag: '🇸🇸', pattern: '## ### ####' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', pattern: '### ### ###' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰', pattern: '## ### ####' },
  { code: 'SD', name: 'Sudan', dial: '+249', flag: '🇸🇩', pattern: '## ### ####' },
  { code: 'SR', name: 'Suriname', dial: '+597', flag: '🇸🇷', pattern: '### ####' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', pattern: '## ### ## ##' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', pattern: '## ### ## ##' },
  { code: 'SY', name: 'Syria', dial: '+963', flag: '🇸🇾', pattern: '### ### ###' },
  { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼', pattern: '#### ### ###' },
  { code: 'TJ', name: 'Tajikistan', dial: '+992', flag: '🇹🇯', pattern: '## ### ####' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿', pattern: '### ### ###' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', pattern: '## ### ####' },
  { code: 'TL', name: 'Timor-Leste', dial: '+670', flag: '🇹🇱', pattern: '#### ####' },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬', pattern: '## ## ## ##' },
  { code: 'TO', name: 'Tonga', dial: '+676', flag: '🇹🇴', pattern: '### ####' },
  { code: 'TT', name: 'Trinidad and Tobago', dial: '+1868', flag: '🇹🇹', pattern: '### ####' },
  { code: 'TN', name: 'Tunisia', dial: '+216', flag: '🇹🇳', pattern: '## ### ###' },
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷', pattern: '### ### ## ##' },
  { code: 'TM', name: 'Turkmenistan', dial: '+993', flag: '🇹🇲', pattern: '## ## ## ##' },
  { code: 'TV', name: 'Tuvalu', dial: '+688', flag: '🇹🇻', pattern: '## ###' },
  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬', pattern: '### ### ###' },
  { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦', pattern: '## ### ## ##' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', pattern: '## ### ####' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', pattern: '#### ######' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', pattern: '(###) ###-####' },
  { code: 'UY', name: 'Uruguay', dial: '+598', flag: '🇺🇾', pattern: '#### ####' },
  { code: 'UZ', name: 'Uzbekistan', dial: '+998', flag: '🇺🇿', pattern: '## ### ## ##' },
  { code: 'VU', name: 'Vanuatu', dial: '+678', flag: '🇻🇺', pattern: '### ####' },
  { code: 'VE', name: 'Venezuela', dial: '+58', flag: '🇻🇪', pattern: '### ### ####' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳', pattern: '### #### ###' },
  { code: 'YE', name: 'Yemen', dial: '+967', flag: '🇾🇪', pattern: '### ### ###' },
  { code: 'ZM', name: 'Zambia', dial: '+260', flag: '🇿🇲', pattern: '## ### ####' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '🇿🇼', pattern: '## ### ####' },
];

const formatPhone = (raw, pattern) => {
  const digits = raw.replace(/\D/g, '');
  let result = '';
  let di = 0;
  for (let i = 0; i < pattern.length && di < digits.length; i++) {
    if (pattern[i] === '#') { result += digits[di++]; }
    else { result += pattern[i]; }
  }
  return result;
};

// ─── Phone Input Component ─────────────────────────────────────────────────────
// NOTE: number state is kept internally so parent re-renders don't steal focus
const PhoneInput = ({ value, onChange }) => {
  const [country, setCountry] = useState(COUNTRIES.find(c => c.code === 'RW'));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [number, setNumber] = useState(value || '');
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (typeof value === 'string' && value !== number) {
      setNumber(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleNumber = (e) => {
    const formatted = formatPhone(e.target.value, country.pattern);
    setNumber(formatted);
    onChange?.(formatted);
  };

  const selectCountry = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    setNumber('');
    // restore focus to number input after dropdown closes
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="hoas-phone-input" ref={ref}>
      <button type="button" className="hoas-phone-dial" onClick={() => setOpen(o => !o)}>
        <span className="hoas-phone-flag">{country.flag}</span>
        <span className="hoas-phone-code">{country.dial}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="tel"
        className="hoas-phone-number"
        value={number}
        onChange={handleNumber}
        placeholder={country.pattern.replace(/#/g, '0')}
      />
      {open && (
        <div className="hoas-phone-dropdown">
          <div className="hoas-phone-search">
            <input
              autoFocus
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul>
            {filtered.map(c => (
              <li
                key={c.code}
                className={c.code === country.code ? 'selected' : ''}
                onClick={() => selectCountry(c)}
              >
                <span>{c.flag}</span>
                <span className="hoas-phone-country-name">{c.name}</span>
                <span className="hoas-phone-country-dial">{c.dial}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Custom Dropdown Component ─────────────────────────────────────────────────
const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="hoas-custom-dropdown" ref={ref}>
      <button type="button" className="hoas-custom-dropdown-btn" onClick={() => setOpen(o => !o)}>
        <span className="hoas-custom-dropdown-selected">
          {selected.icon && <span className="hoas-custom-dropdown-icon">{selected.icon}</span>}
          <span>{selected.label}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="hoas-custom-dropdown-list">
          {options.map(opt => (
            <li
              key={opt.value}
              className={opt.value === value ? 'selected' : ''}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="hoas-custom-dropdown-option">
                {opt.icon && <span className="hoas-custom-dropdown-icon">{opt.icon}</span>}
                <span>{opt.label}</span>
              </span>
              {opt.value === value && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Address Country Select ───────────────────────────────────────────────────
const AddressCountrySelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const country = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectCountry = (c) => {
    onChange(c.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className="hoas-addr-country-select" ref={ref} onClick={(e) => { if (!e.target.closest('.hoas-phone-dropdown')) setOpen(o => !o); }} style={{ cursor: 'pointer' }}>
      <span className="hoas-addr-country-flag">{country.flag}</span>
      <div className="hoas-addr-select" style={{ display: 'flex', alignItems: 'center' }}>
        {country.name}
      </div>
      <svg className="hoas-addr-select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>

      {open && (
        <div className="hoas-phone-dropdown" onClick={(e) => e.stopPropagation()} style={{ width: '100%', top: 'calc(100% + 4px)', left: 0 }}>
          <div className="hoas-phone-search">
            <input
              autoFocus
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul>
            {filtered.map(c => (
              <li
                key={c.code}
                className={c.code === value ? 'selected' : ''}
                onClick={() => selectCountry(c)}
              >
                <span>{c.flag}</span>
                <span className="hoas-phone-country-name">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Section Card (defined OUTSIDE HOASettings to prevent remount on re-render) ─
const SectionCard = ({ id, title, children, onSave, sectionRef, showDiscard = true, showFooter = true, headerAction = null, saveDisabled = false, saving = false }) => (
  <div
    className="hoas-section-card"
    id={id}
    data-section={id}
    ref={sectionRef}
  >
    <div className="hoas-section-header">
      <div className="hoas-section-title-row">
        <h2>{title}</h2>
        {headerAction}
      </div>
    </div>
    <div className="hoas-section-body">
      {children}
      {showFooter && (
        <div className="hoas-section-footer">
          {showDiscard && <button type="button" className="hoas-btn-discard">Discard</button>}
          <button type="button" className="hoas-btn-save" onClick={onSave} disabled={saveDisabled || saving}>
            {saving ? (
              <>
                <HoasButtonSpinner />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const LearnerAccount = () => {
  const [saved, setSaved] = useState({});
  const [activeSection, setActiveSection] = useState('general');
  const sectionRefs = useRef({});
  const documentInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const socialMoreRef = useRef(null);
  const socialPopoverRef = useRef(null);
  const sectionBaselinesRef = useRef({});

  const feedbackTimerRef = useRef(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [baselineTick, setBaselineTick] = useState(0);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [hasNotificationSettings, setHasNotificationSettings] = useState(false);
  const [hasAppearanceSettings, setHasAppearanceSettings] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsSaving, setDocumentsSaving] = useState(false);

  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentMethodsSaving, setPaymentMethodsSaving] = useState(false);

  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [twoFactorProcessing, setTwoFactorProcessing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorStage, setTwoFactorStage] = useState('idle'); // idle | enable-pending | disable-pending
  const [twoFactorOtp, setTwoFactorOtp] = useState('');

  const [profileAvatarPath, setProfileAvatarPath] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState(defaultProfileImage);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [documentError, setDocumentError] = useState('');

  const [documentFiles, setDocumentFiles] = useState([]);
  const [documentDropActive, setDocumentDropActive] = useState(false);

  // Phone & Visibility
  const [clientId, setClientId] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [availableToHire, setAvailableToHire] = useState(true);

  // Email section
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSystemUpdates, setEmailSystemUpdates] = useState(true);

  // Theme selection
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [syncSystem, setSyncSystem] = useState(true);

  // Address section
  const [addrAddress, setAddrAddress] = useState('');
  const [addrCountry, setAddrCountry] = useState('RW');
  const [addrState, setAddrState] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostcode, setAddrPostcode] = useState('');

  // Appearance section
  const [appearanceTheme, setAppearanceTheme] = useState('dark');
  const [transparentSidebar, setTransparentSidebar] = useState(true);

  // Payment gateway
  const [selectedGateway, setSelectedGateway] = useState('card');

  // Toggles
  const [publicProfile, setPublicProfile] = useState(true);
  const [searchIndexing, setSearchIndexing] = useState(true);

  // Two-factor authentication
  const [twoFactorSMS, setTwoFactorSMS] = useState(false);
  const [twoFactorAuthenticator, setTwoFactorAuthenticator] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState('');

  // Payments
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [paymentSimName, setPaymentSimName] = useState('');
  const [paymentCardName, setPaymentCardName] = useState('');
  const [paymentCardNumber, setPaymentCardNumber] = useState('');
  const [paymentCardBrand, setPaymentCardBrand] = useState('unknown');
  const [paymentExpiryMonth, setPaymentExpiryMonth] = useState('');
  const [paymentCvv, setPaymentCvv] = useState('');
  const [cardNumberIsMasked, setCardNumberIsMasked] = useState(false);
  const [cvvIsMasked, setCvvIsMasked] = useState(false);
  const [phoneNumberIsMasked, setPhoneNumberIsMasked] = useState(false);
  const [expiryError, setExpiryError] = useState('');
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

  // Preferences
  const [preferenceLanguage, setPreferenceLanguage] = useState('en-us');
  const [preferenceTimezone, setPreferenceTimezone] = useState('gmt-5-est');
  const [preferenceCurrency, setPreferenceCurrency] = useState('usd');
  const [showListNames, setShowListNames] = useState(false);
  const [showLinkedTaskNames, setShowLinkedTaskNames] = useState(true);
  const [emailVisibility, setEmailVisibility] = useState(true);

  // Notifications
  const [notificationEmailEnabled, setNotificationEmailEnabled] = useState(true);
  const [notificationMessageEnabled, setNotificationMessageEnabled] = useState(true);
  const [projectNotifications, setProjectNotifications] = useState('disabled');
  const [emailNotifications, setEmailNotifications] = useState('unread-statuses');
  const [autoSubscribeTasks, setAutoSubscribeTasks] = useState(true);

  const [socialConnections, setSocialConnections] = useState([]);
  const [socialPopover, setSocialPopover] = useState(null);

  const getToken = () => localStorage.getItem('token');

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

  useEffect(() => () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
  }, []);

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
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error('Upload timed out. Please try again.');
      }
      throw error;
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }, []);

  const normalizeDocuments = useCallback((docs) => (Array.isArray(docs) ? docs : []).map((d) => ({
    id: String(d.id),
    serverId: d.id,
    name: d.document_name,
    size: formatFileSize(d.file_size),
    filePath: d.file_path,
    fileType: d.file_type,
    isPublic: Boolean(d.is_public),
    createdAt: d.created_at,
    isPersisted: true,
  })), []);

  const normalizePaymentMethods = useCallback((methods) => (Array.isArray(methods) ? methods : []).map((m) => ({
    id: String(m.id),
    paymentType: m.paymentType || m.payment_type || '',
    paymentProvider: m.paymentProvider || m.payment_provider || '',
    accountHolderName: m.accountHolderName || m.account_holder_name || 'Saved payment method',
    accountNumber: m.accountNumber || m.account_number || null,
    phoneNumber: m.phoneNumber || m.phone_number || null,
    cardLastFour: m.cardLastFour || m.card_last_four || null,
    cardCvv: m.cardCvv || m.card_cvv || null,
    expiryDate: m.expiryDate || m.expiry_date || null,
    isPrimary: Boolean(m.isPrimary ?? m.is_primary),
    isActive: Boolean(m.isActive ?? m.is_active),
  })), []);

  const handleSave = useCallback((sectionId) => {
    setSaved((prev) => ({ ...prev, [sectionId]: true }));
  }, []);

  const sectionCompleted = useMemo(() => buildSectionCompletion({
    completionStatus: profileCompletion,
    fullName,
    phoneNumber,
    emailAddress,
    documentFiles,
    socialConnections,
    savedPaymentMethods,
    preferenceLanguage,
    preferenceTimezone,
    preferenceCurrency,
    addrAddress,
    addrCountry,
    addrCity,
    addrPostcode,
    hasNotificationSettings,
    hasAppearanceSettings,
  }), [
    profileCompletion,
    fullName,
    phoneNumber,
    emailAddress,
    documentFiles,
    socialConnections,
    savedPaymentMethods,
    preferenceLanguage,
    preferenceTimezone,
    preferenceCurrency,
    addrAddress,
    addrCountry,
    addrCity,
    addrPostcode,
    hasNotificationSettings,
    hasAppearanceSettings,
  ]);

  const isSectionComplete = useCallback((sectionId) => (
    Boolean(sectionCompleted[sectionId] || saved[sectionId])
  ), [saved, sectionCompleted]);

  const markSectionSaved = useCallback((key, snapshot) => {
    sectionBaselinesRef.current[key] = typeof snapshot === 'string' ? snapshot : JSON.stringify(snapshot);
    setBaselineTick((tick) => tick + 1);
  }, []);

  const generalDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.general;
    if (!baseline) return false;
    return JSON.stringify({ fullName, phoneNumber, visibility, availableToHire }) !== baseline;
  }, [baselineTick, fullName, phoneNumber, visibility, availableToHire]);

  const emailDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.email;
    if (!baseline) return false;
    return JSON.stringify({ emailAddress, emailSystemUpdates }) !== baseline;
  }, [baselineTick, emailAddress, emailSystemUpdates]);

  const documentsDirty = useMemo(() => {
    void baselineTick;
    if (documentFiles.some((file) => !file.isPersisted)) return true;
    const baseline = sectionBaselinesRef.current.documents;
    if (!baseline) return false;
    return serializeDocuments(documentFiles) !== baseline;
  }, [baselineTick, documentFiles]);

  const socialDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.social;
    if (!baseline) return false;
    return serializeSocialConnections(socialConnections) !== baseline;
  }, [baselineTick, socialConnections]);

  const preferencesDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.preferences;
    if (!baseline) return false;
    return JSON.stringify({
      preferenceLanguage,
      preferenceTimezone,
      preferenceCurrency,
      showListNames,
      showLinkedTaskNames,
      emailVisibility,
    }) !== baseline;
  }, [baselineTick, preferenceLanguage, preferenceTimezone, preferenceCurrency, showListNames, showLinkedTaskNames, emailVisibility]);

  const notificationsDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.notifications;
    if (!baseline) return false;
    return JSON.stringify({
      notificationEmailEnabled,
      notificationMessageEnabled,
      projectNotifications,
      emailNotifications,
      autoSubscribeTasks,
    }) !== baseline;
  }, [baselineTick, notificationEmailEnabled, notificationMessageEnabled, projectNotifications, emailNotifications, autoSubscribeTasks]);

  const addressDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.address;
    if (!baseline) return false;
    return JSON.stringify({
      addrAddress,
      addrCountry,
      addrState,
      addrCity,
      addrPostcode,
    }) !== baseline;
  }, [baselineTick, addrAddress, addrCountry, addrState, addrCity, addrPostcode]);

  const appearanceDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.appearance;
    if (!baseline) return false;
    return JSON.stringify({
      appearanceTheme,
      transparentSidebar,
      syncSystem,
    }) !== baseline;
  }, [baselineTick, appearanceTheme, transparentSidebar, syncSystem]);

  const paymentDirty = useMemo(() => {
    void baselineTick;
    const baseline = sectionBaselinesRef.current.payment?.[selectedGateway];
    if (!baseline) return false;
    const current = getPaymentFormSnapshot(selectedGateway, {
      paymentCardName,
      paymentCardNumber,
      paymentExpiryMonth,
      paymentCvv,
      savePaymentMethod,
      paymentSimName,
      paymentPhoneNumber,
    });
    return current !== baseline;
  }, [
    baselineTick,
    selectedGateway,
    paymentCardName,
    paymentCardNumber,
    paymentExpiryMonth,
    paymentCvv,
    savePaymentMethod,
    paymentSimName,
    paymentPhoneNumber,
  ]);

  // Load profile + supporting account data
  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      const token = getToken();
      if (!token) {
        setProfileLoading(false);
        setDocumentsLoading(false);
        setPaymentMethodsLoading(false);
        setTwoFactorLoading(false);
        pushFeedback('Please sign in again to continue.', 'error');
        return;
      }

      try {
        setProfileLoading(true);
        setDocumentsLoading(true);
        setPaymentMethodsLoading(true);
        setTwoFactorLoading(true);

        const [profileRes, docsRes, paymentRes, accountStatusRes, socialRes, notifRes, appearanceRes] = await Promise.all([
          apiFetch('/api/profile'),
          apiFetch('/api/profile/documents'),
          apiFetch('/api/profile/payment-methods'),
          apiFetch('/api/auth/account-status'),
          apiFetch('/api/profile/social-links'),
          apiFetch('/api/profile/notification-settings'),
          apiFetch('/api/profile/appearance-settings'),
        ]);

        if (cancelled) return;

        const user = profileRes?.data?.user || {};

        setProfileCompletion(profileRes?.data?.completionStatus || null);
        setClientId(user.client_id || '');
        setFullName(user.name || '');
        setRole(user.role || 'student');
        setEmailAddress(user.email || '');
        setPhoneNumber(user.phone ? formatRwandaPhoneNumber(String(user.phone)) : '');
        setVisibility(user.visibility || 'public');
        setAvailableToHire(Boolean(user.available_to_hire));
        setEmailSystemUpdates(
          user.email_notifications === undefined || user.email_notifications === null
            ? true
            : Boolean(user.email_notifications)
        );

        setProfileAvatarPath(user.avatar || '');
        setUploadedPhoto(getProfilePhotoDisplayUrl(user.avatar, API_BASE_URL));

        setAddrAddress(user.address || '');
        setAddrCountry(user.country && COUNTRIES.some((c) => c.code === user.country) ? user.country : 'RW');
        setAddrState(user.state || '');
        setAddrCity(user.city || '');
        setAddrPostcode(user.postcode || '');

        // preferences
        setPreferenceLanguage(user.language === 'fr' ? 'fr-fr' : 'en-us');
        setPreferenceTimezone(user.timezone ? user.timezone : 'gmt-5-est');
        setPreferenceCurrency(user.currency ? String(user.currency).toLowerCase() : 'usd');
        setShowListNames(Boolean(user.show_list_names));
        setShowLinkedTaskNames(user.show_linked_task_names !== 0 && user.show_linked_task_names !== false);
        setEmailVisibility(Boolean(user.email_visibility));

        setDocumentFiles(normalizeDocuments(docsRes?.data?.documents));
        setSavedPaymentMethods(normalizePaymentMethods(paymentRes?.data?.paymentMethods));

        const is2fa = Boolean(accountStatusRes?.data?.twoFactorEnabled);
        setTwoFactorEnabled(is2fa);
        setTwoFactorSMS(is2fa);

        // Social links -> socialConnections list
        const links = Array.isArray(socialRes?.data?.links) ? socialRes.data.links : [];
        const socialItems = links.map((link) => {
          const platformKey = resolveSocialPlatformKey(link.platform_key) || link.platform_key;
          const config = getSocialPlatformConfig(platformKey);
          return {
            id: platformKey,
            platformKey,
            name: link.display_name || config?.name || link.platform_key,
            url: link.url,
            active: Boolean(link.is_active),
            isCustom: !resolveSocialPlatformKey(link.platform_key),
          };
        });
        setSocialConnections(socialItems);

        // Notifications
        const ns = notifRes?.data?.settings;
        if (ns) {
          setHasNotificationSettings(true);
          setNotificationEmailEnabled(Boolean(ns.emailEnabled));
          setNotificationMessageEnabled(Boolean(ns.messagesEnabled));
          setProjectNotifications(ns.projectNotifications || 'disabled');
          setEmailNotifications(ns.emailNotifications || 'unread-statuses');
          setAutoSubscribeTasks(Boolean(ns.autoSubscribeTasks));
        }

        // Appearance
        const ap = appearanceRes?.data?.settings;
        if (ap) {
          setHasAppearanceSettings(true);
          setAppearanceTheme(ap.themeMode || 'system');
          setTransparentSidebar(Boolean(ap.transparentSidebar));
          setSyncSystem(Boolean(ap.syncSystemTheme));
        }

        const loadedDocs = normalizeDocuments(docsRes?.data?.documents);
        const loadedPhone = user.phone ? formatRwandaPhoneNumber(String(user.phone)) : '';
        const loadedEmailSystemUpdates = user.email_notifications === undefined || user.email_notifications === null
          ? true
          : Boolean(user.email_notifications);

        sectionBaselinesRef.current = {
          general: JSON.stringify({
            fullName: user.name || '',
            phoneNumber: loadedPhone,
            visibility: user.visibility || 'public',
            availableToHire: Boolean(user.available_to_hire),
          }),
          email: JSON.stringify({
            emailAddress: user.email || '',
            emailSystemUpdates: loadedEmailSystemUpdates,
          }),
          documents: serializeDocuments(loadedDocs),
          social: serializeSocialConnections(socialItems),
          preferences: JSON.stringify({
            preferenceLanguage: user.language === 'fr' ? 'fr-fr' : 'en-us',
            preferenceTimezone: user.timezone ? user.timezone : 'gmt-5-est',
            preferenceCurrency: user.currency ? String(user.currency).toLowerCase() : 'usd',
            showListNames: Boolean(user.show_list_names),
            showLinkedTaskNames: user.show_linked_task_names !== 0 && user.show_linked_task_names !== false,
            emailVisibility: Boolean(user.email_visibility),
          }),
          notifications: JSON.stringify({
            notificationEmailEnabled: ns ? Boolean(ns.emailEnabled) : true,
            notificationMessageEnabled: ns ? Boolean(ns.messagesEnabled) : true,
            projectNotifications: ns?.projectNotifications || 'disabled',
            emailNotifications: ns?.emailNotifications || 'unread-statuses',
            autoSubscribeTasks: ns ? Boolean(ns.autoSubscribeTasks) : true,
          }),
          address: JSON.stringify({
            addrAddress: user.address || '',
            addrCountry: user.country && COUNTRIES.some((c) => c.code === user.country) ? user.country : 'RW',
            addrState: user.state || '',
            addrCity: user.city || '',
            addrPostcode: user.postcode || '',
          }),
          appearance: JSON.stringify({
            appearanceTheme: ap?.themeMode || 'dark',
            transparentSidebar: ap ? Boolean(ap.transparentSidebar) : true,
            syncSystem: ap ? Boolean(ap.syncSystemTheme) : true,
          }),
        };
        setBaselineTick((tick) => tick + 1);
      } catch (e) {
        if (!cancelled) pushFeedback(e.message || 'Couldn\'t load your settings. Please refresh and try again.', 'error');
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
          setDocumentsLoading(false);
          setPaymentMethodsLoading(false);
          setTwoFactorLoading(false);
        }
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [apiFetch, normalizeDocuments, normalizePaymentMethods, pushFeedback]);

  const handleSocialSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      const payload = {
        links: socialConnections.map((connection) => ({
          platformKey: String(connection.platformKey || connection.id),
          displayName: connection.name,
          url: connection.url,
          isActive: Boolean(connection.active),
        })),
      };
      await apiFetch('/api/profile/social-links', { method: 'PUT', body: JSON.stringify(payload) });
      handleSave('social');
      markSectionSaved('social', serializeSocialConnections(socialConnections));
      pushFeedback('Social links saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save social links. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, handleSave, markSectionSaved, pushFeedback, socialConnections]);

  const handleNotificationsSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      await apiFetch('/api/profile/notification-settings', {
        method: 'PUT',
        body: JSON.stringify({
          emailEnabled: notificationEmailEnabled,
          messagesEnabled: notificationMessageEnabled,
          projectNotifications,
          emailNotifications,
          autoSubscribeTasks,
        }),
      });
      handleSave('notifications');
      markSectionSaved('notifications', {
        notificationEmailEnabled,
        notificationMessageEnabled,
        projectNotifications,
        emailNotifications,
        autoSubscribeTasks,
      });
      pushFeedback('Notification preferences saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save notification preferences. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, autoSubscribeTasks, emailNotifications, handleSave, markSectionSaved, notificationEmailEnabled, notificationMessageEnabled, projectNotifications, pushFeedback]);

  const handleAppearanceSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      await apiFetch('/api/profile/appearance-settings', {
        method: 'PUT',
        body: JSON.stringify({
          themeMode: appearanceTheme,
          transparentSidebar,
          syncSystemTheme: syncSystem,
        }),
      });
      handleSave('appearance');
      markSectionSaved('appearance', { appearanceTheme, transparentSidebar, syncSystem });
      pushFeedback('Appearance settings saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save appearance settings. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, appearanceTheme, handleSave, markSectionSaved, pushFeedback, syncSystem, transparentSidebar]);

  const addDocumentFiles = useCallback((files) => {
    const incoming = Array.from(files).filter((file) => file && file.name);
    if (!incoming.length) return;

    const errors = [];
    const availableSlots = MAX_DOCUMENT_COUNT - documentFiles.length;

    if (availableSlots <= 0) {
      setDocumentError(`You can upload up to ${MAX_DOCUMENT_COUNT} documents. Remove one before adding another.`);
      return;
    }

    const seenNames = new Set(documentFiles.map((f) => f.name.toLowerCase()));
    const accepted = [];

    for (const file of incoming) {
      if (accepted.length >= availableSlots) {
        errors.push(`You can only keep ${MAX_DOCUMENT_COUNT} documents on your account.`);
        break;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        errors.push(`"${file.name}" is too large. Each file must be 5 MB or smaller.`);
        continue;
      }
      if (seenNames.has(file.name.toLowerCase())) {
        errors.push(`"${file.name}" is already in your list.`);
        continue;
      }
      seenNames.add(file.name.toLowerCase());
      accepted.push({
        id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: formatFileSize(file.size),
        file,
        isPersisted: false,
      });
    }

    if (errors.length) {
      setDocumentError(errors.join(' '));
    } else {
      setDocumentError('');
    }

    if (!accepted.length) return;

    setDocumentFiles((currentFiles) => [...currentFiles, ...accepted]);
    setSaved((currentSaved) => ({ ...currentSaved, documents: false }));
  }, [documentFiles]);

  const handleDocumentInputChange = useCallback((event) => {
    addDocumentFiles(event.target.files || []);
    event.target.value = '';
  }, [addDocumentFiles]);

  const handleDocumentDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDocumentDropActive(false);
    addDocumentFiles(event.dataTransfer.files || []);
  }, [addDocumentFiles]);

  const handleDocumentDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDocumentDropActive(true);
  }, []);

  const handleDocumentDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setDocumentDropActive(false);
  }, []);

  const removeDocumentFile = useCallback(async (fileId) => {
    const target = documentFiles.find((f) => f.id === fileId);
    if (!target) return;

    if (target.serverId && target.isPersisted) {
      try {
        const res = await apiFetch(`/api/profile/documents/${target.serverId}`, { method: 'DELETE' });
        const latest = normalizeDocuments(res?.data?.documents);
        setDocumentFiles(latest);
        markSectionSaved('documents', serializeDocuments(latest));
        setDocumentError('');
        pushFeedback('Document removed.');
      } catch (e) {
        pushFeedback(e.message || 'Couldn\'t remove that document. Please try again.', 'error');
      }
      return;
    }

    setDocumentFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    setDocumentError('');
  }, [apiFetch, documentFiles, markSectionSaved, normalizeDocuments, pushFeedback]);

  const openDocumentPicker = useCallback(() => {
    documentInputRef.current?.click();
  }, []);

  const closeSocialPopover = useCallback(() => {
    setSocialPopover(null);
  }, []);

  const openSocialPopover = useCallback((action, event) => {
    const triggerRect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = 320;
    const estimatedPopoverHeight = action.id === 'more' ? 288 : 236;
    const viewportPadding = 16;
    const centerX = triggerRect.left + (triggerRect.width / 2);
    const clampedCenterX = Math.min(
      window.innerWidth - viewportPadding - (popoverWidth / 2),
      Math.max(viewportPadding + (popoverWidth / 2), centerX)
    );

    const topAbove = triggerRect.top - estimatedPopoverHeight - 12;
    const topBelow = triggerRect.bottom + 12;
    const canOpenAbove = topAbove >= viewportPadding;
    const top = canOpenAbove
      ? topAbove
      : Math.min(topBelow, window.innerHeight - viewportPadding - estimatedPopoverHeight);

    setSocialPopover({
      id: action.id,
      mode: action.id === 'more' ? 'custom' : 'connect',
      title: action.id === 'more' ? 'Add social media account' : action.label,
      label: action.id === 'more' ? 'Profile URL' : 'Profile URL',
      name: action.name || '',
      icon: action.icon,
      iconBg: action.iconBg || '#F6F7FB',
      iconColor: action.iconColor || '#6B7280',
      left: clampedCenterX,
      top,
      placement: canOpenAbove ? 'top' : 'bottom',
      nameValue: action.id === 'more' ? '' : action.name || '',
      linkValue: '',
      error: '',
    });
  }, []);

  const submitSocialPopover = useCallback((event) => {
    event.preventDefault();

    if (!socialPopover) return;

    const linkValue = socialPopover.linkValue.trim();
    const nameValue = socialPopover.mode === 'custom' ? socialPopover.nameValue.trim() : socialPopover.name;
    const customCount = socialConnections.filter((connection) => connection.isCustom).length;

    if (!nameValue || !linkValue) {
      setSocialPopover((currentPopover) => (
        currentPopover
          ? { ...currentPopover, error: 'Please fill in all required fields.' }
          : currentPopover
      ));
      return;
    }

    if (!isValidHttpUrl(linkValue)) {
      setSocialPopover((currentPopover) => (
        currentPopover
          ? { ...currentPopover, error: 'Enter a valid URL starting with http:// or https://.' }
          : currentPopover
      ));
      return;
    }

    if (socialPopover.mode === 'custom' && customCount >= MAX_CUSTOM_SOCIALS) {
      setSocialPopover((currentPopover) => (
        currentPopover
          ? { ...currentPopover, error: `You can add up to ${MAX_CUSTOM_SOCIALS} custom social profiles.` }
          : currentPopover
      ));
      return;
    }

    if (socialPopover.mode === 'connect') {
      const platformKey = resolveSocialPlatformKey(socialPopover.id) || socialPopover.id;
      setSocialConnections((currentConnections) => {
        const existingConnection = currentConnections.find((connection) => (
          resolveSocialPlatformKey(connection.platformKey || connection.id) === platformKey
        ));
        const nextConnection = {
          id: platformKey,
          platformKey,
          name: socialPopover.name,
          url: linkValue,
          active: true,
          isCustom: false,
        };

        if (existingConnection) {
          return currentConnections.map((connection) => (
            resolveSocialPlatformKey(connection.platformKey || connection.id) === platformKey
              ? nextConnection
              : connection
          ));
        }

        return [...currentConnections, nextConnection];
      });
    } else {
      const normalizedId = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const platformKey = normalizedId || `custom-${Date.now()}`;
      setSocialConnections((currentConnections) => {
        const alreadyExists = currentConnections.some((connection) => (
          connection.id === platformKey || connection.name.toLowerCase() === nameValue.toLowerCase()
        ));

        if (alreadyExists) {
          return currentConnections.map((connection) => (
            connection.id === platformKey || connection.name.toLowerCase() === nameValue.toLowerCase()
              ? { ...connection, name: nameValue, url: linkValue, active: true, isCustom: true }
              : connection
          ));
        }

        return [
          ...currentConnections,
          {
            id: platformKey,
            platformKey,
            name: nameValue,
            url: linkValue,
            active: true,
            isCustom: true,
          },
        ];
      });
    }

    setSaved((currentSaved) => ({ ...currentSaved, social: true }));
    closeSocialPopover();
  }, [closeSocialPopover, socialConnections, socialPopover]);

  const toggleSocialConnection = useCallback((connectionId, checked) => {
    setSocialConnections((currentConnections) => currentConnections.map((connection) => (
      connection.id === connectionId
        ? { ...connection, active: checked }
        : connection
    )));
    setSaved((currentSaved) => ({ ...currentSaved, social: true }));
  }, []);

  const removeSocialConnection = useCallback((connectionId) => {
    setSocialConnections((currentConnections) => currentConnections.filter((connection) => connection.id !== connectionId));
    setSaved((currentSaved) => ({ ...currentSaved, social: true }));
  }, []);

  useEffect(() => {
    if (!socialPopover) return undefined;

    const handlePointerDown = (event) => {
      if (socialPopoverRef.current && socialPopoverRef.current.contains(event.target)) return;
      closeSocialPopover();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeSocialPopover();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSocialPopover, socialPopover]);

  // Scroll within the .learners-main container to avoid over-scrolling the
  // window/body which creates empty space at the bottom for bottom sections.
  const scrollWithinContainer = (el) => {
    if (!el) return;
    const container = el.closest('.learners-main') || el.closest('[class*="contents-sec"]') || el.closest('[style*="overflow"]');
    if (container) {
      const containerTop = container.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = elTop - containerTop + container.scrollTop - 16; // 16px breathing room
      container.scrollTo({ top: offset, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const scrollToSection = (id) => {
    // For payment sub-tabs, switch the tab and scroll to the payment section
    if (id === 'payment-mtn') {
      setSelectedGateway('mtn');
      setActiveSection('payment-mtn');
      setTimeout(() => scrollWithinContainer(sectionRefs.current['payment']), 0);
    } else if (id === 'payment-airtel') {
      setSelectedGateway('airtel');
      setActiveSection('payment-airtel');
      setTimeout(() => scrollWithinContainer(sectionRefs.current['payment']), 0);
    } else if (id === 'payment-card') {
      setSelectedGateway('card');
      setActiveSection('payment-card');
      setTimeout(() => scrollWithinContainer(sectionRefs.current['payment']), 0);
    } else {
      setActiveSection(id);
      setTimeout(() => scrollWithinContainer(sectionRefs.current[id]), 0);
    }
  };

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = entry.target.dataset.section;
            // When scrolling to the payment section, mirror active to the right tab key
            if (section === 'payment') {
              const tabKey = selectedGateway === 'mtn' ? 'payment-mtn'
                : selectedGateway === 'airtel' ? 'payment-airtel'
                  : 'payment-card';
              setActiveSection(tabKey);
            } else {
              setActiveSection(section);
            }
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleGeneralSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      await apiFetch('/api/profile/complete', {
        method: 'PUT',
        body: JSON.stringify({
          name: fullName,
          phone: phoneNumber.replace(/\s/g, ''),
          role,
          visibility,
          availableToHire,
          emailNotifications: emailSystemUpdates,
        }),
      });
      handleSave('general');
      markSectionSaved('general', { fullName, phoneNumber, visibility, availableToHire });
      setProfileCompletion((current) => ({
        ...(current || {}),
        name_completed: 1,
        phone_completed: 1,
        role_completed: 1,
        visibility_completed: 1,
        hire_status_completed: 1,
        email_prefs_completed: 1,
      }));
      pushFeedback('Profile details saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save profile details. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, availableToHire, emailSystemUpdates, fullName, handleSave, markSectionSaved, phoneNumber, pushFeedback, role, visibility]);

  const handleEmailSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ email: emailAddress }),
      });
      await apiFetch('/api/profile/complete', {
        method: 'PUT',
        body: JSON.stringify({
          name: fullName,
          phone: phoneNumber.replace(/\s/g, ''),
          role,
          visibility,
          availableToHire,
          emailNotifications: emailSystemUpdates,
        }),
      });
      handleSave('email');
      markSectionSaved('email', { emailAddress, emailSystemUpdates });
      pushFeedback('Email settings saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save email settings. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, availableToHire, emailAddress, emailSystemUpdates, fullName, handleSave, markSectionSaved, phoneNumber, pushFeedback, role, visibility]);

  const closePhotoCropModal = useCallback(() => {
    setCropModalOpen(false);
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc('');
  }, [cropImageSrc]);

  const handlePhotoFileSelect = useCallback((file) => {
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
  }, []);

  const handlePhotoUpload = useCallback(async (fileOrBlob, originalName = 'profile-photo.png') => {
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
      const res = await apiFetch('/api/profile/photo', {
        method: 'POST',
        body: formData,
        timeoutMs: 45000,
      });
      const nextPath = res?.data?.photoUrl || res?.data?.avatar || res?.data?.user?.avatar || '';
      setProfileAvatarPath(nextPath);
      setUploadedPhoto(getProfilePhotoDisplayUrl(nextPath, API_BASE_URL));
      pushFeedback('Profile photo updated.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t upload photo. Use an image under 5 MB.', 'error');
      throw e;
    } finally {
      setPhotoUploading(false);
    }
  }, [apiFetch, pushFeedback]);

  const handlePhotoCropConfirm = useCallback((blob) => {
    closePhotoCropModal();
    handlePhotoUpload(blob, `profile-photo-${Date.now()}.png`).catch(() => {});
  }, [closePhotoCropModal, handlePhotoUpload]);

  const handlePhotoReset = useCallback(async () => {
    try {
      setPhotoUploading(true);
      await apiFetch('/api/profile/photo', { method: 'DELETE' });
      setProfileAvatarPath('');
      setUploadedPhoto(defaultProfileImage);
      pushFeedback('Profile photo reset.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t reset profile photo. Please try again.', 'error');
    } finally {
      setPhotoUploading(false);
    }
  }, [apiFetch, pushFeedback]);

  const hasCustomProfilePhoto = useMemo(
    () => isCustomProfilePhoto(profileAvatarPath),
    [profileAvatarPath]
  );

  const handleDocumentsSave = useCallback(async () => {
    const pending = documentFiles.filter((d) => d.file && !d.isPersisted);
    if (!pending.length) {
      pushFeedback('No new documents to upload.');
      return;
    }

    const oversized = pending.find((doc) => doc.file.size > MAX_DOCUMENT_BYTES);
    if (oversized) {
      setDocumentError(`"${oversized.name}" is too large. Each file must be 5 MB or smaller.`);
      return;
    }

    if (documentFiles.length > MAX_DOCUMENT_COUNT) {
      setDocumentError(`You can upload up to ${MAX_DOCUMENT_COUNT} documents on your account.`);
      return;
    }

    try {
      setDocumentsSaving(true);
      setDocumentError('');
      let latest = documentFiles.filter((d) => d.isPersisted);
      for (const doc of pending) {
        const formData = new FormData();
        formData.append('document', doc.file);
        const res = await apiFetch('/api/profile/documents', { method: 'POST', body: formData });
        latest = normalizeDocuments(res?.data?.documents);
      }
      setDocumentFiles(latest);
      handleSave('documents');
      markSectionSaved('documents', serializeDocuments(latest));
      pushFeedback('Documents saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save documents. Please try again.', 'error');
    } finally {
      setDocumentsSaving(false);
    }
  }, [apiFetch, documentFiles, handleSave, markSectionSaved, normalizeDocuments, pushFeedback]);

  const handlePreferencesSave = useCallback(async () => {
    try {
      setProfileSaving(true);

      const languageValue = preferenceLanguage.startsWith('fr') ? 'fr' : 'en';
      const currencyValue = preferenceCurrency.toUpperCase();

      await apiFetch('/api/profile/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          language: languageValue,
          timezone: preferenceTimezone,
          currency: currencyValue,
          showListNames,
          showLinkedTaskNames,
          emailVisibility,
        }),
      });

      handleSave('preferences');
      markSectionSaved('preferences', {
        preferenceLanguage,
        preferenceTimezone,
        preferenceCurrency,
        showListNames,
        showLinkedTaskNames,
        emailVisibility,
      });
      pushFeedback('Preferences saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save preferences. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [apiFetch, emailVisibility, handleSave, markSectionSaved, preferenceCurrency, preferenceLanguage, preferenceTimezone, pushFeedback, showLinkedTaskNames, showListNames]);

  const handleAddressSave = useCallback(async () => {
    try {
      setProfileSaving(true);
      await apiFetch('/api/profile/complete', {
        method: 'PUT',
        body: JSON.stringify({
          name: fullName,
          phone: phoneNumber.replace(/\s/g, ''),
          role,
          visibility,
          availableToHire,
          emailNotifications: emailSystemUpdates,
          address: addrAddress,
          country: addrCountry,
          state: addrState,
          city: addrCity,
          postcode: addrPostcode,
        }),
      });
      handleSave('address');
      markSectionSaved('address', { addrAddress, addrCountry, addrState, addrCity, addrPostcode });
      pushFeedback('Address saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save address. Please try again.', 'error');
    } finally {
      setProfileSaving(false);
    }
  }, [addrAddress, addrCity, addrCountry, addrPostcode, addrState, apiFetch, availableToHire, emailSystemUpdates, fullName, handleSave, markSectionSaved, phoneNumber, pushFeedback, role, visibility]);

  const refreshPaymentMethods = useCallback(async () => {
    const res = await apiFetch('/api/profile/payment-methods');
    setSavedPaymentMethods(normalizePaymentMethods(res?.data?.paymentMethods));
  }, [apiFetch, normalizePaymentMethods]);

  const activePaymentMethod = useMemo(
    () => getPaymentMethodForGateway(savedPaymentMethods, selectedGateway),
    [savedPaymentMethods, selectedGateway]
  );

  const applyPaymentMethodToForm = useCallback((method, gateway) => {
    let snapshot;

    if (!method) {
      if (gateway === 'card') {
        setPaymentCardName('');
        setPaymentCardNumber('');
        setPaymentExpiryMonth('');
        setPaymentCvv('');
        setPaymentCardBrand('unknown');
        setCardNumberIsMasked(false);
        setCvvIsMasked(false);
        snapshot = getPaymentFormSnapshot('card', {
          paymentCardName: '',
          paymentCardNumber: '',
          paymentExpiryMonth: '',
          paymentCvv: '',
          savePaymentMethod: false,
        });
      } else {
        setPaymentSimName('');
        setPaymentPhoneNumber('');
        setPhoneNumberIsMasked(false);
        snapshot = getPaymentFormSnapshot(gateway, {
          paymentSimName: '',
          paymentPhoneNumber: '',
          savePaymentMethod: false,
        });
      }
      setSavePaymentMethod(false);
    } else if (gateway === 'card') {
      const fields = {
        paymentCardName: method.accountHolderName || '',
        paymentCardNumber: method.accountNumber || '',
        paymentExpiryMonth: method.expiryDate || '',
        paymentCvv: method.cardCvv || '',
        savePaymentMethod: Boolean(method.isPrimary),
      };
      setPaymentCardName(fields.paymentCardName);
      setPaymentCardNumber(fields.paymentCardNumber);
      setPaymentExpiryMonth(fields.paymentExpiryMonth);
      setPaymentCvv(fields.paymentCvv);
      setPaymentCardBrand(method.paymentProvider && method.paymentProvider !== 'unknown' ? method.paymentProvider : 'unknown');
      setCardNumberIsMasked(isMaskedValue(method.accountNumber));
      setCvvIsMasked(isMaskedValue(method.cardCvv));
      setSavePaymentMethod(fields.savePaymentMethod);
      snapshot = getPaymentFormSnapshot('card', fields);
    } else {
      const fields = {
        paymentSimName: method.accountHolderName || '',
        paymentPhoneNumber: method.phoneNumber || '',
        savePaymentMethod: Boolean(method.isPrimary),
      };
      setPaymentSimName(fields.paymentSimName);
      setPaymentPhoneNumber(fields.paymentPhoneNumber);
      setPhoneNumberIsMasked(isMaskedValue(method.phoneNumber));
      setSavePaymentMethod(fields.savePaymentMethod);
      snapshot = getPaymentFormSnapshot(gateway, fields);
    }

    if (!sectionBaselinesRef.current.payment) {
      sectionBaselinesRef.current.payment = {};
    }
    sectionBaselinesRef.current.payment[gateway] = snapshot;
    setBaselineTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    const method = getPaymentMethodForGateway(savedPaymentMethods, selectedGateway);
    applyPaymentMethodToForm(method, selectedGateway);
  }, [applyPaymentMethodToForm, savedPaymentMethods, selectedGateway]);

  const handlePaymentSave = useCallback(async () => {
    try {
      setPaymentMethodsSaving(true);
      const existingMethod = getPaymentMethodForGateway(savedPaymentMethods, selectedGateway);

      if (selectedGateway === 'card') {
        if (!paymentCardName.trim()) throw new Error('Enter the name on your card.');
        const digits = cardNumberIsMasked ? '' : extractPaymentDigits(paymentCardNumber);
        const cvvDigits = cvvIsMasked ? '' : extractPaymentDigits(paymentCvv);

        if (!existingMethod && digits.length < 13) throw new Error('Enter a valid card number.');
        if (!paymentExpiryMonth || paymentExpiryMonth.length < 4) throw new Error('Enter the card expiry date.');
        if (!existingMethod && cvvDigits.length < 3) throw new Error('Enter the card security code.');

        const payload = {
          accountHolderName: paymentCardName.trim(),
          expiryDate: paymentExpiryMonth,
          paymentProvider: paymentCardBrand !== 'unknown' ? paymentCardBrand : null,
          isPrimary: Boolean(savePaymentMethod),
        };

        if (!cardNumberIsMasked && digits.length >= 13) {
          payload.accountNumber = digits;
          payload.cardLastFour = digits.slice(-4);
        }

        if (!cvvIsMasked && cvvDigits.length >= 3) {
          payload.cardCvv = cvvDigits;
        }

        if (existingMethod) {
          await apiFetch(`/api/profile/payment-methods/${existingMethod.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch('/api/profile/payment-methods', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              paymentType: 'bank_card',
            }),
          });
        }
      } else {
        if (!paymentSimName.trim()) throw new Error('Enter the name on your SIM card.');
        const phoneDigits = phoneNumberIsMasked ? '' : extractPaymentDigits(paymentPhoneNumber);
        if (!existingMethod && !phoneDigits) throw new Error('Enter your mobile money number.');

        const payload = {
          accountHolderName: paymentSimName.trim(),
          paymentProvider: selectedGateway === 'mtn' ? 'MTN Rwanda' : 'Airtel Rwanda',
          isPrimary: Boolean(savePaymentMethod),
        };

        if (!phoneNumberIsMasked && phoneDigits) {
          payload.phoneNumber = paymentPhoneNumber.replace(/\s/g, '');
        }

        if (existingMethod) {
          await apiFetch(`/api/profile/payment-methods/${existingMethod.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          await apiFetch('/api/profile/payment-methods', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              paymentType: selectedGateway === 'mtn' ? 'mobile_money' : 'airtel_money',
            }),
          });
        }
      }

      await refreshPaymentMethods();

      if (savePaymentMethod) {
        const refreshed = await apiFetch('/api/profile/payment-methods');
        const methods = normalizePaymentMethods(refreshed?.data?.paymentMethods);
        const savedMethod = getPaymentMethodForGateway(methods, selectedGateway);
        if (savedMethod?.id) {
          await apiFetch(`/api/profile/payment-methods/${savedMethod.id}/primary`, { method: 'PUT' });
          await refreshPaymentMethods();
        }
      }

      const latestMethods = normalizePaymentMethods((await apiFetch('/api/profile/payment-methods'))?.data?.paymentMethods);
      const latestMethod = getPaymentMethodForGateway(latestMethods, selectedGateway);
      applyPaymentMethodToForm(latestMethod, selectedGateway);

      handleSave(selectedGateway === 'mtn' ? 'payment-mtn' : selectedGateway === 'airtel' ? 'payment-airtel' : 'payment-card');
      pushFeedback(existingMethod ? 'Payment method updated.' : 'Payment method saved.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t save payment method. Please try again.', 'error');
    } finally {
      setPaymentMethodsSaving(false);
    }
  }, [apiFetch, applyPaymentMethodToForm, cardNumberIsMasked, cvvIsMasked, handleSave, normalizePaymentMethods, paymentCardBrand, paymentCardName, paymentCardNumber, paymentCvv, paymentExpiryMonth, paymentPhoneNumber, paymentSimName, phoneNumberIsMasked, pushFeedback, refreshPaymentMethods, savePaymentMethod, savedPaymentMethods, selectedGateway]);

  const handleDeletePaymentMethod = useCallback(async (id) => {
    try {
      await apiFetch(`/api/profile/payment-methods/${id}`, { method: 'DELETE' });
      await refreshPaymentMethods();
      pushFeedback('Payment method removed.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t remove payment method. Please try again.', 'error');
    }
  }, [apiFetch, pushFeedback, refreshPaymentMethods]);

  const startEnableTwoFactor = useCallback(async () => {
    try {
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/enable-2fa', { method: 'POST' });
      setTwoFactorStage('enable-pending');
      setTwoFactorOtp('');
      pushFeedback('Verification code sent to your email.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t start two-factor setup. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  }, [apiFetch, pushFeedback]);

  const verifyEnableTwoFactor = useCallback(async () => {
    try {
      if (twoFactorOtp.trim().length !== 6) throw new Error('Enter the 6-digit code from your email.');
      setTwoFactorProcessing(true);
      const res = await apiFetch('/api/auth/verify-otp-enable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setTwoFactorEnabled(Boolean(res?.data?.twoFactorEnabled));
      setTwoFactorSMS(true);
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication enabled.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t enable two-factor authentication. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  }, [apiFetch, pushFeedback, twoFactorOtp]);

  const startDisableTwoFactor = useCallback(async () => {
    try {
      setTwoFactorProcessing(true);
      await apiFetch('/api/auth/disable-2fa', { method: 'POST' });
      setTwoFactorStage('disable-pending');
      setTwoFactorOtp('');
      pushFeedback('Verification code sent to your email.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t start two-factor disable. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  }, [apiFetch, pushFeedback]);

  const verifyDisableTwoFactor = useCallback(async () => {
    try {
      if (twoFactorOtp.trim().length !== 6) throw new Error('Enter the 6-digit code from your email.');
      setTwoFactorProcessing(true);
      const res = await apiFetch('/api/auth/disable-2fa', {
        method: 'POST',
        body: JSON.stringify({ otp: twoFactorOtp.trim() }),
      });
      setTwoFactorEnabled(Boolean(res?.data?.twoFactorEnabled));
      setTwoFactorSMS(false);
      setTwoFactorStage('idle');
      setTwoFactorOtp('');
      pushFeedback('Two-factor authentication disabled.');
    } catch (e) {
      pushFeedback(e.message || 'Couldn\'t disable two-factor authentication. Please try again.', 'error');
    } finally {
      setTwoFactorProcessing(false);
    }
  }, [apiFetch, pushFeedback, twoFactorOtp]);

  const cancelTwoFactorFlow = useCallback(() => {
    setTwoFactorStage('idle');
    setTwoFactorOtp('');
  }, []);


  return (
    <LearnersPageShell>
      <div className="hoas-page-wrapper">
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

        {/* Page Header */}
        <div className="hoas-page-header">
          <div>
            <h1>Platform Settings</h1>
            <p className="hoas-page-subtitle">Manage your platform configuration and preferences</p>
          </div>
          <div className="hoas-header-actions">
            <span className="hoas-update-status">
              <img src={hoarefresh} alt="Refresh" className="hoas-sync-icon" />
              Data updated every 5min
              <span className="hoas-dot" />
            </span>
            <button className="hoas-btn-primary">
              Go to website <img src={hoagoto} alt="Go" />
            </button>
          </div>
        </div>

        <div className="hoas-layout-container">

          {/* ── Left sticky nav ── */}
          <div className="hoas-settings-nav">
            <h2 className="hoas-settings-title">Settings</h2>
            {NAV_CATEGORIES.map(category => (
              <div key={category.title} className="hoas-nav-category">
                <h3 className="hoas-nav-category-title">{category.title}</h3>
                <ul className="hoas-nav-list">
                  {category.items.map((nav) => (
                    <li key={nav.id}>
                      <button
                        className={`hoas-nav-btn ${activeSection === nav.id ? 'active' : ''}`}
                        onClick={() => scrollToSection(nav.id)}
                      >
                        <span className="hoas-step-icon">
                          {isSectionComplete(nav.id) ? <IconChecked /> : <IconUnchecked />}
                        </span>
                        <span className="hoas-nav-label">{nav.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className="hoas-content-area">

            {/* ── 1. Basic Settings ── */}
            <SectionCard
              id="general"
              title="Basic Settings"
              onSave={handleGeneralSave}
              saveDisabled={!generalDirty}
              saving={profileSaving}
              sectionRef={el => sectionRefs.current['general'] = el}
              showDiscard={false}
            >
              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Client ID</label>
                <div className="hoas-form-horizontal-control">
                  <input type="text" value={clientId || (profileLoading ? 'Loading...' : '')} readOnly />
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Photo</label>
                <div className="hoas-form-horizontal-control">
                  <div style={{ width: '100%' }}>
                    <div className="hoas-photo-upload-area">
                      <span className="hoas-photo-info">Square profile photo, saved at up to 512×512px</span>
                      <div className="hoas-photo-preview">
                        <div
                          className={`hoas-photo-inner${hasCustomProfilePhoto ? ' hoas-photo-inner--editable' : ''}`}
                          onClick={hasCustomProfilePhoto ? () => photoInputRef.current?.click() : undefined}
                          onKeyDown={hasCustomProfilePhoto ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              photoInputRef.current?.click();
                            }
                          } : undefined}
                          role={hasCustomProfilePhoto ? 'button' : undefined}
                          tabIndex={hasCustomProfilePhoto ? 0 : undefined}
                          aria-label={hasCustomProfilePhoto ? 'Change profile photo' : undefined}
                        >
                          <img src={uploadedPhoto || defaultProfileImage} alt="Profile" />
                          {!hasCustomProfilePhoto && (
                            <label className="hoas-photo-camera-overlay" htmlFor="profile-photo-input">
                              <IconCamera />
                            </label>
                          )}
                          <input
                            ref={photoInputRef}
                            id="profile-photo-input"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files && e.target.files[0];
                              handlePhotoFileSelect(file);
                              e.target.value = '';
                            }}
                          />
                        </div>
                        {hasCustomProfilePhoto && (
                          <div
                            className="hoas-photo-remove"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePhotoReset();
                            }}
                            role="button"
                            aria-label="Reset profile photo"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    {uploadError && <p className="hoas-photo-error">{uploadError}</p>}
                    {photoUploading && <p className="hoas-photo-error" style={{ color: '#99A1B7' }}>Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Name</label>
                <div className="hoas-form-horizontal-control">
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={profileLoading} />
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Role</label>
                <div className="hoas-form-horizontal-control">
                  <input
                    type="text"
                    value={ROLE_LABELS[role] || role}
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Phone number</label>
                <div className="hoas-form-horizontal-control">
                  <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Visibility</label>
                <div className="hoas-form-horizontal-control">
                  <CustomDropdown
                    value={visibility}
                    onChange={setVisibility}
                    options={[
                      { value: 'public', label: 'Public' },
                      { value: 'private', label: 'Private' },
                    ]}
                  />
                </div>
              </div>

              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Availability</label>
                <div className="hoas-form-horizontal-control">
                  <div className="hoas-availability-area">
                    <span className="hoas-availability-text">Available to hire</span>
                    <Toggle checked={availableToHire} onChange={e => setAvailableToHire(e.target.checked)} />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Email ── */}
            <SectionCard id="email" title="Email" onSave={handleEmailSave} saveDisabled={!emailDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['email'] = el} showDiscard={false}>
              <div className="hoas-form-horizontal-row">
                <label className="hoas-form-horizontal-label">Email</label>
                <div className="hoas-form-horizontal-control">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={e => setEmailAddress(e.target.value)}
                    placeholder="jasontatum@gonaraza.com"
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <div className="hoas-form-horizontal-row" style={{ alignItems: 'center', minHeight: 0, marginBottom: '6px' }}>
                <label className="hoas-form-horizontal-label" />
                <div className="hoas-form-horizontal-control">
                  <div className="hoas-email-toggles">
                    <div className="hoas-email-toggle-item">
                      <span className="hoas-email-toggle-label">System Updates</span>
                      <Toggle checked={emailSystemUpdates} onChange={e => setEmailSystemUpdates(e.target.checked)} />
                    </div>
                    <div className="hoas-email-toggle-item">
                      <span className="hoas-email-toggle-label">Primary</span>
                      <Toggle checked disabled />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hoas-form-horizontal-row" style={{ minHeight: 0, marginBottom: 0 }}>
                <label className="hoas-form-horizontal-label" />
                <div className="hoas-form-horizontal-control">
                  <p className="hoas-email-help-text" style={{ color: "#450468" }}>
                    This is your primary account email. Turn off System Updates if you do not want platform notifications.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Documents and Files ── */}
            <SectionCard id="documents" title="Documents and Files" onSave={handleDocumentsSave} saveDisabled={!documentsDirty} saving={documentsSaving} sectionRef={el => sectionRefs.current['documents'] = el} showDiscard={false}>
              <input
                ref={documentInputRef}
                type="file"
                className="hoas-doc-upload-input"
                multiple
                onChange={handleDocumentInputChange}
              />

              <button
                type="button"
                className={`hoas-doc-upload-zone ${documentDropActive ? 'is-active' : ''}`}
                onClick={openDocumentPicker}
                onDragOver={handleDocumentDragOver}
                onDragLeave={handleDocumentDragLeave}
                onDrop={handleDocumentDrop}
              >
                <div className="hoas-doc-upload-icon">
                  <img src={hoadraganddrop} alt="PDF Icon" />
                </div>
                <div className="hoas-doc-upload-copy">
                  <strong>Add Certificates files or Click Upload</strong>
                  <span>Up to {MAX_DOCUMENT_COUNT} files, 5 MB each.</span>
                </div>
              </button>

              {documentError && <p className="hoas-photo-error">{documentError}</p>}

              <div className="hoas-doc-file-grid">
                {documentsLoading ? (
                  <div style={{ padding: '10px 4px', color: '#99A1B7' }}>Loading documents...</div>
                ) : documentFiles.length === 0 ? (
                  <div style={{ padding: '10px 4px', color: '#99A1B7' }}>No documents yet.</div>
                ) : documentFiles.map((file) => (
                  <div key={file.id} className="hoas-doc-file-card">
                    <button type="button" className="hoas-doc-file-remove" aria-label={`Remove ${file.name}`} onClick={() => removeDocumentFile(file.id)}>
                      ×
                    </button>
                    <div className="hoas-doc-file-icon" aria-hidden="true">
                      <img src={hoapdffile} alt="PDF Icon" />
                    </div>
                    <div className="hoas-doc-file-meta">
                      <span className="hoas-doc-file-name">{file.name}</span>
                      <span className="hoas-doc-file-size">{file.size}</span>
                      {!file.isPersisted && <span className="hoas-doc-file-size" style={{ color: '#450468' }}>Pending upload</span>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>



            {/* ── 3. Social Media Links ── */}
            <SectionCard id="social" title="Social Media Links" onSave={handleSocialSave} saveDisabled={!socialDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['social'] = el} showDiscard={false}>
              <div className="hoas-social-card-list">
                {socialConnections.length === 0 ? (
                  <div style={{ padding: '8px 4px 12px', color: '#99A1B7' }}>No social profiles connected yet.</div>
                ) : socialConnections.map((connection) => (
                  <div key={connection.id} className="hoas-social-connection-card">
                    <div className="hoas-social-connection-main">
                      <div className="hoas-social-icon">
                        {renderSocialIcon(connection.platformKey || connection.id, connection.isCustom)}
                      </div>
                      <div className="hoas-social-connection-copy">
                        <span className="hoas-social-connection-name">{connection.name}</span>
                        <span className="hoas-social-connection-handle">{connection.url}</span>
                      </div>
                    </div>
                    <div className="hoas-social-connection-actions">
                      <Toggle checked={Boolean(connection.active)} onChange={e => toggleSocialConnection(connection.id, e.target.checked)} />
                      <button type="button" className="hoas-social-delete" aria-label={`Remove ${connection.name}`} onClick={() => removeSocialConnection(connection.id)}>
                        <img src={hoadelete} alt="Delete" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hoas-social-more" ref={socialMoreRef}>
                {socialPopover && (
                  <div
                    ref={socialPopoverRef}
                    className={`hoas-social-popover ${socialPopover.placement === 'bottom' ? 'is-below' : ''}`}
                    style={{ left: `${socialPopover.left}px`, top: `${socialPopover.top}px` }}
                  >
                    <div className="hoas-social-popover-header">
                      <div className="hoas-social-popover-icon" style={{ background: socialPopover.iconBg, color: socialPopover.iconColor }}>
                        {socialPopover.icon}
                      </div>
                      <div>
                        <h4>{socialPopover.title}</h4>
                        <p>{socialPopover.mode === 'custom' ? 'Enter a new social profile and link.' : 'Paste the profile link before connecting.'}</p>
                      </div>
                    </div>

                    <form className="hoas-social-popover-form" onSubmit={submitSocialPopover}>
                      {socialPopover.mode === 'custom' && (
                        <label className="hoas-social-popover-field">
                          <span>Social media name</span>
                          <input
                            type="text"
                            value={socialPopover.nameValue}
                            onChange={(event) => setSocialPopover((currentPopover) => currentPopover ? { ...currentPopover, nameValue: event.target.value, error: '' } : currentPopover)}
                            placeholder="TikTok, Pinterest, etc."
                          />
                        </label>
                      )}

                      <label className="hoas-social-popover-field">
                        <span>{socialPopover.label}</span>
                        <input
                          type="url"
                          value={socialPopover.linkValue}
                          onChange={(event) => setSocialPopover((currentPopover) => currentPopover ? { ...currentPopover, linkValue: event.target.value, error: '' } : currentPopover)}
                          placeholder="https://your-profile-url.com"
                        />
                      </label>

                      {socialPopover.error && <p className="hoas-social-popover-error">{socialPopover.error}</p>}

                      <div className="hoas-social-popover-actions">
                        <button type="button" className="hoas-social-popover-cancel" onClick={closeSocialPopover}>Cancel</button>
                        <button type="submit" className="hoas-social-popover-submit">Add</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="hoas-social-more-title">More Social connections options</div>
                <p className="hoas-social-more-text">Effortless access awaits! Connect seamlessly with your preferred social account.</p>
                <div className="hoas-social-actions-row">
                  {SOCIAL_CONNECT_ACTIONS.filter((action) => {
                    if (action.id === 'more') {
                      return socialConnections.filter((connection) => connection.isCustom).length < MAX_CUSTOM_SOCIALS;
                    }
                    const platformKey = resolveSocialPlatformKey(action.id);
                    return !socialConnections.some((connection) => (
                      resolveSocialPlatformKey(connection.platformKey || connection.id) === platformKey
                    ));
                  }).map((action) => (
                    <button key={action.id} type="button" className="hoas-social-action-btn" onClick={(event) => openSocialPopover(action, event)}>
                      <span className="hoas-social-action-icon">{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* ── 4. Two-Factor Authentication ── */}
            <SectionCard
              id="twofactor"
              title="Two-Factor authentication(2FA)"
              onSave={() => handleSave('twofactor')}
              sectionRef={el => sectionRefs.current['twofactor'] = el}
              showFooter={false}
              headerAction={(
                <button type="button" className="hoas-section-header-menu" aria-label="Two-factor actions">
                  <IconDotsVertical />
                </button>
              )}
            >
              <div className="hoas-2fa-options">
                {TWO_FACTOR_OPTIONS.map((option) => {
                  const checked = option.id === 'sms' ? twoFactorSMS : twoFactorAuthenticator;

                  return (
                    <div key={option.id} className="hoas-2fa-option-row">
                      <div className="hoas-2fa-option-main">
                        <div className="hoas-2fa-option-icon">
                          {option.icon}
                        </div>
                        <div className="hoas-2fa-option-copy">
                          <span className="hoas-2fa-option-title">{option.label}</span>
                          <p className="hoas-2fa-option-desc">{option.description}</p>
                        </div>
                      </div>
                      <Toggle
                        checked={checked}
                        onChange={() => {
                          if (option.id === 'authenticator') return;
                          if (twoFactorEnabled) startDisableTwoFactor();
                          else startEnableTwoFactor();
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {twoFactorStage !== 'idle' && (
                <div className="hoas-2fa-password-row">
                  <label className="hoas-2fa-password-label">OTP Code</label>
                  <div className="hoas-2fa-password-control">
                    <input
                      type="text"
                      value={twoFactorOtp}
                      onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <p>Check your email and enter the code.</p>
                  </div>
                </div>
              )}

              <div className="hoas-2fa-actions">
                {twoFactorStage === 'enable-pending' ? (
                  <>
                    <button type="button" className="hoas-btn-save" onClick={verifyEnableTwoFactor} disabled={twoFactorProcessing || twoFactorOtp.length !== 6}>
                      {twoFactorProcessing ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                    <button type="button" className="hoas-btn-discard" onClick={cancelTwoFactorFlow} disabled={twoFactorProcessing}>Cancel</button>
                  </>
                ) : twoFactorStage === 'disable-pending' ? (
                  <>
                    <button type="button" className="hoas-btn-save" onClick={verifyDisableTwoFactor} disabled={twoFactorProcessing || twoFactorOtp.length !== 6}>
                      {twoFactorProcessing ? 'Verifying...' : 'Verify & Disable'}
                    </button>
                    <button type="button" className="hoas-btn-discard" onClick={cancelTwoFactorFlow} disabled={twoFactorProcessing}>Cancel</button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="hoas-btn-save"
                    onClick={twoFactorEnabled ? startDisableTwoFactor : startEnableTwoFactor}
                    disabled={twoFactorProcessing || twoFactorLoading}
                  >
                    {twoFactorLoading ? 'Loading...' : twoFactorProcessing ? 'Please wait...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                )}
              </div>
            </SectionCard>

            {/* ── 5. Payment Methods ── */}
            <SectionCard
              id="payment"
              title="Payment Methods"
              onSave={() => handleSave(selectedGateway === 'mtn' ? 'payment-mtn' : selectedGateway === 'airtel' ? 'payment-airtel' : 'payment-card')}
              sectionRef={el => sectionRefs.current['payment'] = el}
              showFooter={false}
            >
              {paymentMethodsLoading ? (
                <div style={{ padding: '6px 0 14px', color: '#99A1B7' }}>Loading payment methods...</div>
              ) : null}

              {/* Tab switcher */}
              <div className="hoas-payment-types">
                {[
                  { id: 'mtn', label: 'MTN Mobile Money', icon: hoamtn },
                  { id: 'airtel', label: 'Airtel Money', icon: hoaairtel },
                  { id: 'card', label: 'Bank Cards', icon: hoabankcards },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`hoas-payment-type-card ${selectedGateway === type.id ? 'active' : ''}`}
                    onClick={() => { setSelectedGateway(type.id); setActiveSection('payment-' + type.id); }}
                  >
                    <div className="hoas-payment-type-icon" >
                      <img src={type.icon} alt={type.label} />
                    </div>
                    <span>{type.label}</span>
                    {selectedGateway === type.id && <span className="hoas-payment-type-active-line" />}
                  </button>
                ))}
              </div>

              {/* MTN Mobile Money form */}
              {selectedGateway === 'mtn' && (
                <>
                  <div className="hoas-payment-subtitle-row">
                    <div className="hoas-payment-subtitle">
                      {activePaymentMethod ? 'Edit MTN Mobile Money' : 'Add MTN Mobile Money'}
                    </div>
                    {activePaymentMethod?.isPrimary && <span className="hoas-payment-primary-badge">Primary</span>}
                  </div>
                  <div className="hoas-payment-form">
                    <div className="hoas-payment-field">
                      <PaymentFieldLabel hint="Enter the name registered on your MTN SIM card.">SIM Card Name</PaymentFieldLabel>
                      <input
                        type="text"
                        value={paymentSimName}
                        onChange={e => setPaymentSimName(e.target.value)}
                        placeholder="Enter the name on your SIM"
                      />
                    </div>
                    <div className="hoas-payment-field hoas-payment-phone-field">
                      <PaymentFieldLabel hint="Rwanda MTN numbers start with 078 or 079.">Phone Number <span className="hoas-required">*</span></PaymentFieldLabel>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={paymentPhoneNumber}
                        onChange={(e) => {
                          setPhoneNumberIsMasked(false);
                          setPaymentPhoneNumber(formatRwandaPhoneNumber(e.target.value));
                        }}
                        placeholder="07 88 123 456"
                        className="hoas-payment-phone-field-input"
                      />
                    </div>
                    <div className="hoas-payment-footer-row">
                      <div className="hoas-payment-save-toggle">
                        <span className="hoas-toggle-label">Set as primary</span>
                        <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                      </div>
                      <div className="hoas-payment-action-buttons">
                        {activePaymentMethod && (
                          <button type="button" className="hoas-btn-discard" onClick={() => handleDeletePaymentMethod(activePaymentMethod.id)} disabled={paymentMethodsSaving}>
                            Remove
                          </button>
                        )}
                        <button type="button" className="hoas-btn-save" onClick={handlePaymentSave} disabled={!paymentDirty || paymentMethodsSaving}>
                          {paymentMethodsSaving ? (
                            <>
                              <HoasButtonSpinner />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Airtel Money form */}
              {selectedGateway === 'airtel' && (
                <>
                  <div className="hoas-payment-subtitle-row">
                    <div className="hoas-payment-subtitle">
                      {activePaymentMethod ? 'Edit Airtel Money' : 'Add Airtel Money'}
                    </div>
                    {activePaymentMethod?.isPrimary && <span className="hoas-payment-primary-badge">Primary</span>}
                  </div>
                  <div className="hoas-payment-form">
                    <div className="hoas-payment-field">
                      <PaymentFieldLabel hint="Enter the name registered on your Airtel SIM card.">SIM Card Name</PaymentFieldLabel>
                      <input
                        type="text"
                        value={paymentSimName}
                        onChange={e => setPaymentSimName(e.target.value)}
                        placeholder="Enter the name on your SIM"
                      />
                    </div>
                    <div className="hoas-payment-field hoas-payment-phone-field">
                      <PaymentFieldLabel hint="Rwanda Airtel numbers start with 073 or 072.">Phone Number <span className="hoas-required">*</span></PaymentFieldLabel>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={paymentPhoneNumber}
                        onChange={(e) => {
                          setPhoneNumberIsMasked(false);
                          setPaymentPhoneNumber(formatRwandaPhoneNumber(e.target.value));
                        }}
                        placeholder="07 32 123 456"
                        className="hoas-payment-phone-field-input"
                      />
                    </div>
                    <div className="hoas-payment-footer-row">
                      <div className="hoas-payment-save-toggle">
                        <span className="hoas-toggle-label">Set as primary</span>
                        <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                      </div>
                      <div className="hoas-payment-action-buttons">
                        {activePaymentMethod && (
                          <button type="button" className="hoas-btn-discard" onClick={() => handleDeletePaymentMethod(activePaymentMethod.id)} disabled={paymentMethodsSaving}>
                            Remove
                          </button>
                        )}
                        <button type="button" className="hoas-btn-save" onClick={handlePaymentSave} disabled={!paymentDirty || paymentMethodsSaving}>
                          {paymentMethodsSaving ? (
                            <>
                              <HoasButtonSpinner />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bank Cards form */}
              {selectedGateway === 'card' && (
                <>
                  <div className="hoas-payment-subtitle-row">
                    <div className="hoas-payment-subtitle">
                      {activePaymentMethod ? 'Edit card details' : 'Add Bank Card'}
                    </div>
                    {activePaymentMethod?.isPrimary && <span className="hoas-payment-primary-badge">Primary</span>}
                  </div>
                  <div className="hoas-payment-form">
                    <div className="hoas-payment-field">
                      <PaymentFieldLabel hint="Use the name exactly as it appears on the card.">Name On Card <span className="hoas-required">*</span></PaymentFieldLabel>
                      <input type="text" value={paymentCardName} onChange={e => setPaymentCardName(e.target.value)} placeholder="Enter the name on your card" />
                    </div>
                    <div className="hoas-payment-field">
                      <PaymentFieldLabel hint="Card brand is detected automatically as you type.">Card Number <span className="hoas-required">*</span></PaymentFieldLabel>
                      <div className="hoas-input-with-icon-right hoas-payment-card-number">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={paymentCardNumber}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\*/g, '');
                            setCardNumberIsMasked(false);
                            const nextBrand = detectCardBrand(raw);
                            setPaymentCardBrand(nextBrand);
                            setPaymentCardNumber(formatCardNumber(raw, nextBrand));
                          }}
                          placeholder={activePaymentMethod ? '41*****1111' : '0000 0000 0000 0000'}
                        />
                        <div className="hoas-card-icons">
                          {(paymentCardBrand === 'visa' || paymentCardBrand === 'unknown') && <img src="/assets/icons/VISA-pay.svg" alt="Visa" height="18" />}
                          {(paymentCardBrand === 'mastercard' || paymentCardBrand === 'unknown') && <img src="/assets/icons/MASTER-PAY.svg" alt="Mastercard" height="18" />}
                          {paymentCardBrand === 'amex' && <span className="hoas-payment-brand-badge">Amex</span>}
                        </div>
                      </div>
                    </div>
                    <div className="hoas-payment-field">
                      <PaymentFieldLabel hint="Enter the expiration month and year, plus the CVV security code.">Expiration Date</PaymentFieldLabel>
                      <div className="hoas-payment-expiry-grid">
                        <div style={{ position: 'relative', width: '100%' }}>
                          <input type="text" style={{ width: '100%' }} value={paymentExpiryMonth} onChange={e => {
                            let val = e.target.value.replace(/\D/g, '');
                            let err = '';
                            if (val.length >= 2) {
                              const m = parseInt(val.substring(0, 2), 10);
                              if (m < 1 || m > 12) err = 'Invalid month';
                              val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            }
                            if (val.length === 5) {
                              const y = parseInt(val.substring(3, 5), 10);
                              const currentYear = new Date().getFullYear() % 100;
                              if (y < currentYear && !err) err = 'Card expired';
                            }
                            setPaymentExpiryMonth(val);
                            setExpiryError(err);
                          }} placeholder="03/27" maxLength="5" />
                          {expiryError && <span style={{ color: '#E32A2A', fontSize: '10.5px', position: 'absolute', left: '4px', bottom: '-16px', whiteSpace: 'nowrap' }}>{expiryError}</span>}
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={paymentCvv}
                          onChange={(e) => {
                            setCvvIsMasked(false);
                            setPaymentCvv(e.target.value.replace(/\D/g, '').slice(0, 4));
                          }}
                          placeholder={activePaymentMethod ? '***' : 'CVV'}
                          maxLength="4"
                        />
                      </div>
                    </div>
                    <div className="hoas-payment-footer-row">
                      <div className="hoas-payment-save-toggle">
                        <span className="hoas-toggle-label">Set as primary</span>
                        <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                      </div>
                      <div className="hoas-payment-action-buttons">
                        {activePaymentMethod && (
                          <button type="button" className="hoas-btn-discard" onClick={() => handleDeletePaymentMethod(activePaymentMethod.id)} disabled={paymentMethodsSaving}>
                            Remove
                          </button>
                        )}
                        <button type="button" className="hoas-btn-save" onClick={handlePaymentSave} disabled={!paymentDirty || paymentMethodsSaving}>
                          {paymentMethodsSaving ? (
                            <>
                              <HoasButtonSpinner />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <p className="hoas-payment-footnote">
                Single Sign-On (SSO) authentication streamlines access across multiple platforms. Users log in once, gaining seamless entry to various systems without repetitive credentials.
              </p>
            </SectionCard>

            {/* ── 6. Preferences ── */}
            <SectionCard id="preferences" title="Preferences" onSave={handlePreferencesSave} saveDisabled={!preferencesDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['preferences'] = el} showDiscard={false}>
              <div className="hoas-preferences-list">
                <div className="hoas-form-horizontal-row hoas-preference-row">
                  <label className="hoas-form-horizontal-label">Language</label>
                  <div className="hoas-form-horizontal-control">
                    <CustomDropdown
                      value={preferenceLanguage}
                      onChange={setPreferenceLanguage}
                      options={PREFERENCE_LANGUAGE_OPTIONS}
                    />
                  </div>
                </div>

                <div className="hoas-form-horizontal-row hoas-preference-row">
                  <label className="hoas-form-horizontal-label">Time zone</label>
                  <div className="hoas-form-horizontal-control">
                    <CustomDropdown
                      value={preferenceTimezone}
                      onChange={setPreferenceTimezone}
                      options={PREFERENCE_TIMEZONE_OPTIONS}
                    />
                  </div>
                </div>

                <div className="hoas-form-horizontal-row hoas-preference-row">
                  <label className="hoas-form-horizontal-label">Currency</label>
                  <div className="hoas-form-horizontal-control">
                    <CustomDropdown
                      value={preferenceCurrency}
                      onChange={setPreferenceCurrency}
                      options={PREFERENCE_CURRENCY_OPTIONS}
                    />
                  </div>
                </div>

                <div className="hoas-form-horizontal-row hoas-preference-row hoas-preference-attributes-row">
                  <label className="hoas-form-horizontal-label">Attributes</label>
                  <div className="hoas-form-horizontal-control">
                    <div className="hoas-preference-attributes">
                      <button
                        type="button"
                        className={`hoas-preference-checkbox${showListNames ? ' is-checked' : ''}`}
                        onClick={() => setShowListNames((current) => !current)}
                        aria-pressed={showListNames}
                      >
                        <span className="hoas-preference-checkbox-box" aria-hidden="true">
                          {showListNames ? <IconCheckSquare /> : <IconSquare />}
                        </span>
                        <span className="hoas-preference-checkbox-copy">
                          <span className="hoas-preference-checkbox-title">Show list names</span>
                          <span className="hoas-preference-checkbox-desc">See the name next to each icon</span>
                        </span>
                      </button>

                      <button
                        type="button"
                        className={`hoas-preference-checkbox${showLinkedTaskNames ? ' is-checked' : ''}`}
                        onClick={() => setShowLinkedTaskNames((current) => !current)}
                        aria-pressed={showLinkedTaskNames}
                      >
                        <span className="hoas-preference-checkbox-box" aria-hidden="true">
                          {showLinkedTaskNames ? <IconCheckSquare /> : <IconSquare />}
                        </span>
                        <span className="hoas-preference-checkbox-copy">
                          <span className="hoas-preference-checkbox-title">Show linked task names</span>
                          <span className="hoas-preference-checkbox-desc">Show task names next to ids for linked project tasks.</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hoas-form-horizontal-row hoas-preference-row">
                  <label className="hoas-form-horizontal-label">Email visibility</label>
                  <div className="hoas-form-horizontal-control">
                    <div className="hoas-preference-visibility">
                      <Toggle checked={emailVisibility} onChange={e => setEmailVisibility(e.target.checked)} />
                      <span>{emailVisibility ? 'Visible' : 'Hidden'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 7. Notifications ── */}
            <SectionCard id="notifications" title="Notifications" onSave={handleNotificationsSave} saveDisabled={!notificationsDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['notifications'] = el} showDiscard={false}>
              <div className="hoas-notification-top-grid">
                <div className="hoas-notification-channel-card">
                  <div className="hoas-notification-channel-main">
                    <div className="hoas-notification-channel-icon">
                      <IconMail />
                    </div>
                    <div>
                      <div className="hoas-notification-channel-title">Email</div>
                      <div className="hoas-notification-channel-desc">Tailor Your Email Preferences.</div>
                    </div>
                  </div>
                  <Toggle checked={notificationEmailEnabled} onChange={e => setNotificationEmailEnabled(e.target.checked)} />
                </div>

                <div className="hoas-notification-channel-card">
                  <div className="hoas-notification-channel-main">
                    <div className="hoas-notification-channel-icon">
                      <IconMessage />
                    </div>
                    <div>
                      <div className="hoas-notification-channel-title">Messages</div>
                      <div className="hoas-notification-channel-desc">Stay Updated on Mobile.</div>
                    </div>
                  </div>
                  <Toggle checked={notificationMessageEnabled} onChange={e => setNotificationMessageEnabled(e.target.checked)} />
                </div>
              </div>

              <div className="hoas-notification-group">
                <div className="hoas-notification-group-title">Project notifications</div>
                <div className="hoas-notification-radio-list">
                  {PROJECT_NOTIFICATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`hoas-notification-radio-item${projectNotifications === option.value ? ' is-selected' : ''}`}
                      onClick={() => setProjectNotifications(option.value)}
                      aria-pressed={projectNotifications === option.value}
                    >
                      <span className="hoas-notification-radio-dot" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hoas-notification-group">
                <div className="hoas-notification-group-title">Email notifications</div>
                <div className="hoas-notification-radio-list">
                  {EMAIL_NOTIFICATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`hoas-notification-radio-item${emailNotifications === option.value ? ' is-selected' : ''}`}
                      onClick={() => setEmailNotifications(option.value)}
                      aria-pressed={emailNotifications === option.value}
                    >
                      <span className="hoas-notification-radio-dot" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="hoas-notification-group">
                <div className="hoas-notification-group-title">Subscriptions</div>
                <button
                  type="button"
                  className={`hoas-notification-checkbox${autoSubscribeTasks ? ' is-checked' : ''}`}
                  onClick={() => setAutoSubscribeTasks((current) => !current)}
                  aria-pressed={autoSubscribeTasks}
                >
                  <span className="hoas-notification-checkbox-box" aria-hidden="true">
                    {autoSubscribeTasks ? <IconCheckSquare /> : <IconSquare />}
                  </span>
                  <span>Automatically subscribe to tasks you create</span>
                </button>
              </div>
            </SectionCard>



            {/* ── 10. Address ── */}
            <SectionCard id="address" title="Address" onSave={handleAddressSave} saveDisabled={!addressDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['address'] = el} showDiscard={false}>
              <div className="hoas-address-form">
                <div className="hoas-address-row">
                  <label className="hoas-address-label">Address</label>
                  <div className="hoas-address-control">
                    <input
                      type="text"
                      value={addrAddress}
                      onChange={e => setAddrAddress(e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="hoas-address-row">
                  <label className="hoas-address-label">Country</label>
                  <div className="hoas-address-control">
                    <AddressCountrySelect
                      value={addrCountry}
                      onChange={setAddrCountry}
                    />
                  </div>
                </div>

                <div className="hoas-address-row">
                  <label className="hoas-address-label">State</label>
                  <div className="hoas-address-control">
                    <input
                      type="text"
                      value={addrState}
                      onChange={e => setAddrState(e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="hoas-address-row">
                  <label className="hoas-address-label">City</label>
                  <div className="hoas-address-control">
                    <input
                      type="text"
                      value={addrCity}
                      onChange={e => setAddrCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="hoas-address-row">
                  <label className="hoas-address-label">Postcode</label>
                  <div className="hoas-address-control">
                    <input
                      type="text"
                      value={addrPostcode}
                      onChange={e => setAddrPostcode(e.target.value)}
                      placeholder="Postcode"
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── 11. Appearance ── */}
            <SectionCard id="appearance" title="Appearance" onSave={handleAppearanceSave} saveDisabled={!appearanceDirty} saving={profileSaving} sectionRef={el => sectionRefs.current['appearance'] = el} showDiscard={false}>
              <div className="hoas-appearance-intro">
                <div className="hoas-appearance-intro-title">Theme mode</div>
                <p>Select or customize your theme. Drop in your downloaded images below.</p>
              </div>

              <div className="hoas-appearance-theme-grid">
                {[
                  { id: 'dark', label: 'Dark', src: '/assets/themes/theme-dark.png' },
                  { id: 'light', label: 'Light', src: '/assets/themes/theme-light.png' },
                  { id: 'system', label: 'System', src: '/assets/themes/theme-system.png' },
                ].map(({ id, label, src }) => (
                  <button
                    key={id}
                    type="button"
                    className={`hoas-appearance-theme-card ${appearanceTheme === id ? 'active' : ''}`}
                    onClick={() => setAppearanceTheme(id)}
                  >
                    <div className="hoas-appearance-theme-img-wrap">
                      <img
                        src={id === 'dark' ? dark_theme : id === 'light' ? light_theme : system_default_theme}
                        alt={label}
                        className="hoas-appearance-theme-img"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                      {appearanceTheme === id && <div className="hoas-appearance-preview-check" />}
                    </div>
                    <span className="hoas-appearance-theme-label">{label}</span>
                  </button>
                ))}
              </div>

              <div className="hoas-appearance-toggle-row">
                <span className="hoas-appearance-toggle-label">Transparent sidebar</span>
                <div className="hoas-appearance-toggle-control">
                  <span className="hoas-appearance-toggle-state">
                    {transparentSidebar ? 'Active' : 'Inactive'}
                  </span>
                  <Toggle
                    checked={transparentSidebar}
                    onChange={e => setTransparentSidebar(e.target.checked)}
                  />
                </div>
                <p className="hoas-appearance-toggle-copy">
                  Toggle the transparent sidebar for a sleek interface. Switch it on for transparency or off for a solid background.
                </p>
              </div>
            </SectionCard>

          </div>{/* end content-area */}
        </div>{/* end layout-container */}
      </div>{/* end page-wrapper */}
      <ProfilePhotoCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={closePhotoCropModal}
        onConfirm={handlePhotoCropConfirm}
        exporting={photoUploading}
      />
    </LearnersPageShell>
  );
};

export default LearnerAccount;