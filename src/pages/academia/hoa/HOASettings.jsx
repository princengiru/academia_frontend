import React, { useState, useRef, useEffect, useCallback } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-settings.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';
import light_theme from '../../../assets/imgs/light_theme.png';
import dark_theme from '../../../assets/imgs/dark_theme.png';
import system_default_theme from '../../../assets/imgs/system_default_theme.png';

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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#450468" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const IconInstagram = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const IconLinkedIn = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);

const IconFacebook = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

const IconTwitter = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
);

const IconTiktok = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const IconSms = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
);

const IconAuthenticator = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5.5 3.6 9.7 8 11 4.4-1.3 8-5.5 8-11V5l-8-3Z" />
        <path d="M9.5 12.5 11 14l3.5-4" />
    </svg>
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M4 7.5 12 13l8-5.5" />
    </svg>
);

const IconMessage = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
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

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
    <label className="hoas-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
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

const SOCIAL_CONNECT_ACTIONS = [
    {
        id: 'x',
        label: 'Connect X',
        icon: <IconTwitter />,
        name: 'X',
        handle: 'x.com/gonaraza',
        iconBg: '#F5F5F5',
        iconColor: '#111111',
    },
    {
        id: 'youtube',
        label: 'Connect Youtube',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.6 15.5V8.5L15.7 12l-6.1 3.5Z"/></svg>,
        name: 'YouTube',
        handle: 'youtube.com/@gonaraza',
        iconBg: '#FFF2F2',
        iconColor: '#FF0000',
    },
    {
        id: 'facebook',
        label: 'Connect Facebook',
        icon: <IconFacebook />,
        name: 'Facebook',
        handle: 'facebook.com/gonaraza',
        iconBg: '#EFF4FF',
        iconColor: '#1877F2',
    },
    {
        id: 'more',
        label: 'Add More',
        icon: <span className="hoas-social-plus">+</span>,
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
    { value: 'gmt-5-est', label: 'GMT -5:00 - Eastern Time(US & Canada)', icon: <IconClock /> },
    { value: 'gmt+2-east-africa', label: 'GMT +2:00 - East Africa Time', icon: <IconClock /> },
    { value: 'gmt+1-cet', label: 'GMT +1:00 - Central European Time', icon: <IconClock /> },
];

const PREFERENCE_CURRENCY_OPTIONS = [
    { value: 'usd', label: 'United States Dollar (USD)', icon: <IconCurrency /> },
    { value: 'rwf', label: 'Rwandan Franc (RWF)', icon: <IconCurrency /> },
    { value: 'eur', label: 'Euro (EUR)', icon: <IconCurrency /> },
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

const INITIAL_SOCIAL_CONNECTIONS = [
    {
        id: 'ig',
        name: 'Instagram',
        handle: 'jasontatum@gonaraza.com',
        icon: <IconInstagram />,
        iconBg: '#FFF0F6',
        iconColor: '#F8285A',
        active: true,
    },
    {
        id: 'li',
        name: 'LinkedIn',
        handle: 'jasont@keenthemes.co',
        icon: <IconLinkedIn />,
        iconBg: '#EFF6FF',
        iconColor: '#1B84FF',
        active: false,
    },
];

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

// ─── Country Data (all world countries) ───────────────────────────────────────
const COUNTRIES = [
    { code:'AF',name:'Afghanistan',dial:'+93',flag:'🇦🇫',pattern:'## ### ####'},
    { code:'AL',name:'Albania',dial:'+355',flag:'🇦🇱',pattern:'### ### ###'},
    { code:'DZ',name:'Algeria',dial:'+213',flag:'🇩🇿',pattern:'### ## ## ##'},
    { code:'AD',name:'Andorra',dial:'+376',flag:'🇦🇩',pattern:'### ###'},
    { code:'AO',name:'Angola',dial:'+244',flag:'🇦🇴',pattern:'### ### ###'},
    { code:'AG',name:'Antigua and Barbuda',dial:'+1268',flag:'🇦🇬',pattern:'### ####'},
    { code:'AR',name:'Argentina',dial:'+54',flag:'🇦🇷',pattern:'## #### ####'},
    { code:'AM',name:'Armenia',dial:'+374',flag:'🇦🇲',pattern:'## ######'},
    { code:'AU',name:'Australia',dial:'+61',flag:'🇦🇺',pattern:'#### ### ###'},
    { code:'AT',name:'Austria',dial:'+43',flag:'🇦🇹',pattern:'### ######'},
    { code:'AZ',name:'Azerbaijan',dial:'+994',flag:'🇦🇿',pattern:'## ### ## ##'},
    { code:'BS',name:'Bahamas',dial:'+1242',flag:'🇧🇸',pattern:'### ####'},
    { code:'BH',name:'Bahrain',dial:'+973',flag:'🇧🇭',pattern:'#### ####'},
    { code:'BD',name:'Bangladesh',dial:'+880',flag:'🇧🇩',pattern:'### ### ###'},
    { code:'BB',name:'Barbados',dial:'+1246',flag:'🇧🇧',pattern:'### ####'},
    { code:'BY',name:'Belarus',dial:'+375',flag:'🇧🇾',pattern:'## ### ## ##'},
    { code:'BE',name:'Belgium',dial:'+32',flag:'🇧🇪',pattern:'### ## ## ##'},
    { code:'BZ',name:'Belize',dial:'+501',flag:'🇧🇿',pattern:'### ####'},
    { code:'BJ',name:'Benin',dial:'+229',flag:'🇧🇯',pattern:'## ## ## ##'},
    { code:'BT',name:'Bhutan',dial:'+975',flag:'🇧🇹',pattern:'## ### ###'},
    { code:'BO',name:'Bolivia',dial:'+591',flag:'🇧🇴',pattern:'## ### ####'},
    { code:'BA',name:'Bosnia and Herzegovina',dial:'+387',flag:'🇧🇦',pattern:'## ### ###'},
    { code:'BW',name:'Botswana',dial:'+267',flag:'🇧🇼',pattern:'## ### ###'},
    { code:'BR',name:'Brazil',dial:'+55',flag:'🇧🇷',pattern:'## ##### ####'},
    { code:'BN',name:'Brunei',dial:'+673',flag:'🇧🇳',pattern:'### ####'},
    { code:'BG',name:'Bulgaria',dial:'+359',flag:'🇧🇬',pattern:'### ### ###'},
    { code:'BF',name:'Burkina Faso',dial:'+226',flag:'🇧🇫',pattern:'## ## ## ##'},
    { code:'BI',name:'Burundi',dial:'+257',flag:'🇧🇮',pattern:'## ## ## ##'},
    { code:'CV',name:'Cabo Verde',dial:'+238',flag:'🇨🇻',pattern:'### ## ##'},
    { code:'KH',name:'Cambodia',dial:'+855',flag:'🇰🇭',pattern:'## ### ###'},
    { code:'CM',name:'Cameroon',dial:'+237',flag:'🇨🇲',pattern:'#### ## ## ##'},
    { code:'CA',name:'Canada',dial:'+1',flag:'🇨🇦',pattern:'(###) ###-####'},
    { code:'CF',name:'Central African Republic',dial:'+236',flag:'🇨🇫',pattern:'## ## ## ##'},
    { code:'TD',name:'Chad',dial:'+235',flag:'🇹🇩',pattern:'## ## ## ##'},
    { code:'CL',name:'Chile',dial:'+56',flag:'🇨🇱',pattern:'# #### ####'},
    { code:'CN',name:'China',dial:'+86',flag:'🇨🇳',pattern:'### #### ####'},
    { code:'CO',name:'Colombia',dial:'+57',flag:'🇨🇴',pattern:'### ### ####'},
    { code:'KM',name:'Comoros',dial:'+269',flag:'🇰🇲',pattern:'### ## ##'},
    { code:'CD',name:'Congo (DRC)',dial:'+243',flag:'🇨🇩',pattern:'### ### ###'},
    { code:'CG',name:'Congo (Republic)',dial:'+242',flag:'🇨🇬',pattern:'## ### ####'},
    { code:'CR',name:'Costa Rica',dial:'+506',flag:'🇨🇷',pattern:'#### ####'},
    { code:'CI',name:"Côte d'Ivoire",dial:'+225',flag:'🇨🇮',pattern:'## ## ## ##'},
    { code:'HR',name:'Croatia',dial:'+385',flag:'🇭🇷',pattern:'## ### ####'},
    { code:'CU',name:'Cuba',dial:'+53',flag:'🇨🇺',pattern:'# ### ####'},
    { code:'CY',name:'Cyprus',dial:'+357',flag:'🇨🇾',pattern:'## ### ###'},
    { code:'CZ',name:'Czech Republic',dial:'+420',flag:'🇨🇿',pattern:'### ### ###'},
    { code:'DK',name:'Denmark',dial:'+45',flag:'🇩🇰',pattern:'## ## ## ##'},
    { code:'DJ',name:'Djibouti',dial:'+253',flag:'🇩🇯',pattern:'## ## ## ##'},
    { code:'DM',name:'Dominica',dial:'+1767',flag:'🇩🇲',pattern:'### ####'},
    { code:'DO',name:'Dominican Republic',dial:'+1809',flag:'🇩🇴',pattern:'### ####'},
    { code:'EC',name:'Ecuador',dial:'+593',flag:'🇪🇨',pattern:'## ### ####'},
    { code:'EG',name:'Egypt',dial:'+20',flag:'🇪🇬',pattern:'### ### ####'},
    { code:'SV',name:'El Salvador',dial:'+503',flag:'🇸🇻',pattern:'#### ####'},
    { code:'GQ',name:'Equatorial Guinea',dial:'+240',flag:'🇬🇶',pattern:'### ### ###'},
    { code:'ER',name:'Eritrea',dial:'+291',flag:'🇪🇷',pattern:'# ### ###'},
    { code:'EE',name:'Estonia',dial:'+372',flag:'🇪🇪',pattern:'#### ####'},
    { code:'SZ',name:'Eswatini',dial:'+268',flag:'🇸🇿',pattern:'#### ####'},
    { code:'ET',name:'Ethiopia',dial:'+251',flag:'🇪🇹',pattern:'## ### ####'},
    { code:'FJ',name:'Fiji',dial:'+679',flag:'🇫🇯',pattern:'### ####'},
    { code:'FI',name:'Finland',dial:'+358',flag:'🇫🇮',pattern:'## ### ## ##'},
    { code:'FR',name:'France',dial:'+33',flag:'🇫🇷',pattern:'# ## ## ## ##'},
    { code:'GA',name:'Gabon',dial:'+241',flag:'🇬🇦',pattern:'# ## ## ##'},
    { code:'GM',name:'Gambia',dial:'+220',flag:'🇬🇲',pattern:'### ####'},
    { code:'GE',name:'Georgia',dial:'+995',flag:'🇬🇪',pattern:'### ## ## ##'},
    { code:'DE',name:'Germany',dial:'+49',flag:'🇩🇪',pattern:'#### #######'},
    { code:'GH',name:'Ghana',dial:'+233',flag:'🇬🇭',pattern:'## ### ####'},
    { code:'GR',name:'Greece',dial:'+30',flag:'🇬🇷',pattern:'### ### ####'},
    { code:'GD',name:'Grenada',dial:'+1473',flag:'🇬🇩',pattern:'### ####'},
    { code:'GT',name:'Guatemala',dial:'+502',flag:'🇬🇹',pattern:'#### ####'},
    { code:'GN',name:'Guinea',dial:'+224',flag:'🇬🇳',pattern:'### ### ###'},
    { code:'GW',name:'Guinea-Bissau',dial:'+245',flag:'🇬🇼',pattern:'### ####'},
    { code:'GY',name:'Guyana',dial:'+592',flag:'🇬🇾',pattern:'### ####'},
    { code:'HT',name:'Haiti',dial:'+509',flag:'🇭🇹',pattern:'## ## ####'},
    { code:'HN',name:'Honduras',dial:'+504',flag:'🇭🇳',pattern:'#### ####'},
    { code:'HU',name:'Hungary',dial:'+36',flag:'🇭🇺',pattern:'## ### ####'},
    { code:'IS',name:'Iceland',dial:'+354',flag:'🇮🇸',pattern:'### ####'},
    { code:'IN',name:'India',dial:'+91',flag:'🇮🇳',pattern:'##### #####'},
    { code:'ID',name:'Indonesia',dial:'+62',flag:'🇮🇩',pattern:'### #### ####'},
    { code:'IR',name:'Iran',dial:'+98',flag:'🇮🇷',pattern:'### ### ####'},
    { code:'IQ',name:'Iraq',dial:'+964',flag:'🇮🇶',pattern:'### ### ####'},
    { code:'IE',name:'Ireland',dial:'+353',flag:'🇮🇪',pattern:'## ### ####'},
    { code:'IL',name:'Israel',dial:'+972',flag:'🇮🇱',pattern:'## ### ####'},
    { code:'IT',name:'Italy',dial:'+39',flag:'🇮🇹',pattern:'### ### ####'},
    { code:'JM',name:'Jamaica',dial:'+1876',flag:'🇯🇲',pattern:'### ####'},
    { code:'JP',name:'Japan',dial:'+81',flag:'🇯🇵',pattern:'## #### ####'},
    { code:'JO',name:'Jordan',dial:'+962',flag:'🇯🇴',pattern:'# #### ####'},
    { code:'KZ',name:'Kazakhstan',dial:'+7',flag:'🇰🇿',pattern:'### ### ## ##'},
    { code:'KE',name:'Kenya',dial:'+254',flag:'🇰🇪',pattern:'### ### ###'},
    { code:'KI',name:'Kiribati',dial:'+686',flag:'🇰🇮',pattern:'## ###'},
    { code:'KW',name:'Kuwait',dial:'+965',flag:'🇰🇼',pattern:'#### ####'},
    { code:'KG',name:'Kyrgyzstan',dial:'+996',flag:'🇰🇬',pattern:'### ### ###'},
    { code:'LA',name:'Laos',dial:'+856',flag:'🇱🇦',pattern:'## ## ### ###'},
    { code:'LV',name:'Latvia',dial:'+371',flag:'🇱🇻',pattern:'## ### ###'},
    { code:'LB',name:'Lebanon',dial:'+961',flag:'🇱🇧',pattern:'## ### ###'},
    { code:'LS',name:'Lesotho',dial:'+266',flag:'🇱🇸',pattern:'#### ####'},
    { code:'LR',name:'Liberia',dial:'+231',flag:'🇱🇷',pattern:'### ### ###'},
    { code:'LY',name:'Libya',dial:'+218',flag:'🇱🇾',pattern:'## ### ####'},
    { code:'LI',name:'Liechtenstein',dial:'+423',flag:'🇱🇮',pattern:'### ####'},
    { code:'LT',name:'Lithuania',dial:'+370',flag:'🇱🇹',pattern:'### ## ###'},
    { code:'LU',name:'Luxembourg',dial:'+352',flag:'🇱🇺',pattern:'### ### ###'},
    { code:'MG',name:'Madagascar',dial:'+261',flag:'🇲🇬',pattern:'## ## ### ##'},
    { code:'MW',name:'Malawi',dial:'+265',flag:'🇲🇼',pattern:'### ## ## ##'},
    { code:'MY',name:'Malaysia',dial:'+60',flag:'🇲🇾',pattern:'## #### ####'},
    { code:'MV',name:'Maldives',dial:'+960',flag:'🇲🇻',pattern:'### ####'},
    { code:'ML',name:'Mali',dial:'+223',flag:'🇲🇱',pattern:'## ## ## ##'},
    { code:'MT',name:'Malta',dial:'+356',flag:'🇲🇹',pattern:'#### ####'},
    { code:'MH',name:'Marshall Islands',dial:'+692',flag:'🇲🇭',pattern:'### ####'},
    { code:'MR',name:'Mauritania',dial:'+222',flag:'🇲🇷',pattern:'## ## ## ##'},
    { code:'MU',name:'Mauritius',dial:'+230',flag:'🇲🇺',pattern:'#### ####'},
    { code:'MX',name:'Mexico',dial:'+52',flag:'🇲🇽',pattern:'## #### ####'},
    { code:'FM',name:'Micronesia',dial:'+691',flag:'🇫🇲',pattern:'### ####'},
    { code:'MD',name:'Moldova',dial:'+373',flag:'🇲🇩',pattern:'### ## ###'},
    { code:'MC',name:'Monaco',dial:'+377',flag:'🇲🇨',pattern:'## ## ## ##'},
    { code:'MN',name:'Mongolia',dial:'+976',flag:'🇲🇳',pattern:'#### ####'},
    { code:'ME',name:'Montenegro',dial:'+382',flag:'🇲🇪',pattern:'## ### ###'},
    { code:'MA',name:'Morocco',dial:'+212',flag:'🇲🇦',pattern:'## ## ## ## ##'},
    { code:'MZ',name:'Mozambique',dial:'+258',flag:'🇲🇿',pattern:'## ### ####'},
    { code:'MM',name:'Myanmar',dial:'+95',flag:'🇲🇲',pattern:'## ### ###'},
    { code:'NA',name:'Namibia',dial:'+264',flag:'🇳🇦',pattern:'## ### ####'},
    { code:'NR',name:'Nauru',dial:'+674',flag:'🇳🇷',pattern:'### ####'},
    { code:'NP',name:'Nepal',dial:'+977',flag:'🇳🇵',pattern:'### ### ###'},
    { code:'NL',name:'Netherlands',dial:'+31',flag:'🇳🇱',pattern:'## ### ####'},
    { code:'NZ',name:'New Zealand',dial:'+64',flag:'🇳🇿',pattern:'## ### ####'},
    { code:'NI',name:'Nicaragua',dial:'+505',flag:'🇳🇮',pattern:'#### ####'},
    { code:'NE',name:'Niger',dial:'+227',flag:'🇳🇪',pattern:'## ## ## ##'},
    { code:'NG',name:'Nigeria',dial:'+234',flag:'🇳🇬',pattern:'### ### ####'},
    { code:'NO',name:'Norway',dial:'+47',flag:'🇳🇴',pattern:'### ## ###'},
    { code:'OM',name:'Oman',dial:'+968',flag:'🇴🇲',pattern:'#### ####'},
    { code:'PK',name:'Pakistan',dial:'+92',flag:'🇵🇰',pattern:'### ### ####'},
    { code:'PW',name:'Palau',dial:'+680',flag:'🇵🇼',pattern:'### ####'},
    { code:'PA',name:'Panama',dial:'+507',flag:'🇵🇦',pattern:'#### ####'},
    { code:'PG',name:'Papua New Guinea',dial:'+675',flag:'🇵🇬',pattern:'### ####'},
    { code:'PY',name:'Paraguay',dial:'+595',flag:'🇵🇾',pattern:'### ### ###'},
    { code:'PE',name:'Peru',dial:'+51',flag:'🇵🇪',pattern:'### ### ###'},
    { code:'PH',name:'Philippines',dial:'+63',flag:'🇵🇭',pattern:'### ### ####'},
    { code:'PL',name:'Poland',dial:'+48',flag:'🇵🇱',pattern:'### ### ###'},
    { code:'PT',name:'Portugal',dial:'+351',flag:'🇵🇹',pattern:'### ### ###'},
    { code:'QA',name:'Qatar',dial:'+974',flag:'🇶🇦',pattern:'#### ####'},
    { code:'RO',name:'Romania',dial:'+40',flag:'🇷🇴',pattern:'### ### ###'},
    { code:'RU',name:'Russia',dial:'+7',flag:'🇷🇺',pattern:'### ### ## ##'},
    { code:'RW',name:'Rwanda',dial:'+250',flag:'🇷🇼',pattern:'### ### ###'},
    { code:'KN',name:'Saint Kitts and Nevis',dial:'+1869',flag:'🇰🇳',pattern:'### ####'},
    { code:'LC',name:'Saint Lucia',dial:'+1758',flag:'🇱🇨',pattern:'### ####'},
    { code:'VC',name:'Saint Vincent',dial:'+1784',flag:'🇻🇨',pattern:'### ####'},
    { code:'WS',name:'Samoa',dial:'+685',flag:'🇼🇸',pattern:'## ####'},
    { code:'SM',name:'San Marino',dial:'+378',flag:'🇸🇲',pattern:'#### ######'},
    { code:'ST',name:'São Tomé and Príncipe',dial:'+239',flag:'🇸🇹',pattern:'### ####'},
    { code:'SA',name:'Saudi Arabia',dial:'+966',flag:'🇸🇦',pattern:'## ### ####'},
    { code:'SN',name:'Senegal',dial:'+221',flag:'🇸🇳',pattern:'## ### ## ##'},
    { code:'RS',name:'Serbia',dial:'+381',flag:'🇷🇸',pattern:'## ### ####'},
    { code:'SC',name:'Seychelles',dial:'+248',flag:'🇸🇨',pattern:'# ### ###'},
    { code:'SL',name:'Sierra Leone',dial:'+232',flag:'🇸🇱',pattern:'## ######'},
    { code:'SG',name:'Singapore',dial:'+65',flag:'🇸🇬',pattern:'#### ####'},
    { code:'SK',name:'Slovakia',dial:'+421',flag:'🇸🇰',pattern:'### ### ###'},
    { code:'SI',name:'Slovenia',dial:'+386',flag:'🇸🇮',pattern:'## ### ###'},
    { code:'SB',name:'Solomon Islands',dial:'+677',flag:'🇸🇧',pattern:'## ###'},
    { code:'SO',name:'Somalia',dial:'+252',flag:'🇸🇴',pattern:'## ### ###'},
    { code:'ZA',name:'South Africa',dial:'+27',flag:'🇿🇦',pattern:'## ### ####'},
    { code:'SS',name:'South Sudan',dial:'+211',flag:'🇸🇸',pattern:'## ### ####'},
    { code:'ES',name:'Spain',dial:'+34',flag:'🇪🇸',pattern:'### ### ###'},
    { code:'LK',name:'Sri Lanka',dial:'+94',flag:'🇱🇰',pattern:'## ### ####'},
    { code:'SD',name:'Sudan',dial:'+249',flag:'🇸🇩',pattern:'## ### ####'},
    { code:'SR',name:'Suriname',dial:'+597',flag:'🇸🇷',pattern:'### ####'},
    { code:'SE',name:'Sweden',dial:'+46',flag:'🇸🇪',pattern:'## ### ## ##'},
    { code:'CH',name:'Switzerland',dial:'+41',flag:'🇨🇭',pattern:'## ### ## ##'},
    { code:'SY',name:'Syria',dial:'+963',flag:'🇸🇾',pattern:'### ### ###'},
    { code:'TW',name:'Taiwan',dial:'+886',flag:'🇹🇼',pattern:'#### ### ###'},
    { code:'TJ',name:'Tajikistan',dial:'+992',flag:'🇹🇯',pattern:'## ### ####'},
    { code:'TZ',name:'Tanzania',dial:'+255',flag:'🇹🇿',pattern:'### ### ###'},
    { code:'TH',name:'Thailand',dial:'+66',flag:'🇹🇭',pattern:'## ### ####'},
    { code:'TL',name:'Timor-Leste',dial:'+670',flag:'🇹🇱',pattern:'#### ####'},
    { code:'TG',name:'Togo',dial:'+228',flag:'🇹🇬',pattern:'## ## ## ##'},
    { code:'TO',name:'Tonga',dial:'+676',flag:'🇹🇴',pattern:'### ####'},
    { code:'TT',name:'Trinidad and Tobago',dial:'+1868',flag:'🇹🇹',pattern:'### ####'},
    { code:'TN',name:'Tunisia',dial:'+216',flag:'🇹🇳',pattern:'## ### ###'},
    { code:'TR',name:'Turkey',dial:'+90',flag:'🇹🇷',pattern:'### ### ## ##'},
    { code:'TM',name:'Turkmenistan',dial:'+993',flag:'🇹🇲',pattern:'## ## ## ##'},
    { code:'TV',name:'Tuvalu',dial:'+688',flag:'🇹🇻',pattern:'## ###'},
    { code:'UG',name:'Uganda',dial:'+256',flag:'🇺🇬',pattern:'### ### ###'},
    { code:'UA',name:'Ukraine',dial:'+380',flag:'🇺🇦',pattern:'## ### ## ##'},
    { code:'AE',name:'United Arab Emirates',dial:'+971',flag:'🇦🇪',pattern:'## ### ####'},
    { code:'GB',name:'United Kingdom',dial:'+44',flag:'🇬🇧',pattern:'#### ######'},
    { code:'US',name:'United States',dial:'+1',flag:'🇺🇸',pattern:'(###) ###-####'},
    { code:'UY',name:'Uruguay',dial:'+598',flag:'🇺🇾',pattern:'#### ####'},
    { code:'UZ',name:'Uzbekistan',dial:'+998',flag:'🇺🇿',pattern:'## ### ## ##'},
    { code:'VU',name:'Vanuatu',dial:'+678',flag:'🇻🇺',pattern:'### ####'},
    { code:'VE',name:'Venezuela',dial:'+58',flag:'🇻🇪',pattern:'### ### ####'},
    { code:'VN',name:'Vietnam',dial:'+84',flag:'🇻🇳',pattern:'### #### ###'},
    { code:'YE',name:'Yemen',dial:'+967',flag:'🇾🇪',pattern:'### ### ###'},
    { code:'ZM',name:'Zambia',dial:'+260',flag:'🇿🇲',pattern:'## ### ####'},
    { code:'ZW',name:'Zimbabwe',dial:'+263',flag:'🇿🇼',pattern:'## ### ####'},
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
const PhoneInput = () => {
    const [country, setCountry] = useState(COUNTRIES.find(c => c.code === 'RW'));
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [number, setNumber] = useState('700 000 000');
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

    const handleNumber = (e) => {
        const formatted = formatPhone(e.target.value, country.pattern);
        setNumber(formatted);
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

// ─── Section Card (defined OUTSIDE HOASettings to prevent remount on re-render) ─
const SectionCard = ({ id, title, children, saved, onSave, sectionRef, showDiscard = true, showFooter = true, headerAction = null }) => (
    <div
        className="hoas-section-card"
        id={id}
        data-section={id}
        ref={sectionRef}
    >
        <div className="hoas-section-header">
            <div className="hoas-section-title-row">
                <h2>{title}</h2>
                {saved && (
                    <span className="hoas-saved-badge">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6.5L4.8 9.5L10 3" stroke="#17C653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Saved
                    </span>
                )}
                {headerAction}
            </div>
        </div>
        <div className="hoas-section-body">
            {children}
            {showFooter && (
                <div className="hoas-section-footer">
                    {showDiscard && <button className="hoas-btn-discard">Discard</button>}
                    <button className="hoas-btn-save" onClick={onSave}>
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const HOASettings = () => {
    const [saved, setSaved] = useState({});
    const [activeSection, setActiveSection] = useState('general');
    const sectionRefs = useRef({});
    const documentInputRef = useRef(null);
    const socialMoreRef = useRef(null);
    const socialPopoverRef = useRef(null);

    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [documentFiles, setDocumentFiles] = useState(
        DOCUMENT_FILES.map((file) => ({
            ...file,
            id: `${file.name}-${file.size}`,
        }))
    );
    const [documentDropActive, setDocumentDropActive] = useState(false);

    // Phone & Visibility
    const [phoneNumber, setPhoneNumber] = useState('700 000 000');
    const [visibility, setVisibility] = useState('public');

    // Email section
    const [emailAddress, setEmailAddress] = useState('jasontatum@gonaraza.com');
    const [emailSystemUpdates, setEmailSystemUpdates] = useState(true);
    const [emailPrimary, setEmailPrimary] = useState(false);

    // Theme selection
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [syncSystem, setSyncSystem] = useState(true);

    // Address section
    const [addrAddress, setAddrAddress] = useState('Avenida Imaginária, 789');
    const [addrCountry, setAddrCountry] = useState('ES');
    const [addrState, setAddrState] = useState('');
    const [addrCity, setAddrCity] = useState('Barcelona');
    const [addrPostcode, setAddrPostcode] = useState('08013');

    // Appearance section
    const [appearanceTheme, setAppearanceTheme] = useState('dark');
    const [transparentSidebar, setTransparentSidebar] = useState(true);

    // Payment gateway
    const [selectedGateway, setSelectedGateway] = useState('card');

    // Toggles
    const [publicProfile, setPublicProfile] = useState(true);
    const [searchIndexing, setSearchIndexing] = useState(true);

    // Two-factor authentication
    const [twoFactorSMS, setTwoFactorSMS] = useState(true);
    const [twoFactorAuthenticator, setTwoFactorAuthenticator] = useState(false);
    const [twoFactorPassword, setTwoFactorPassword] = useState('');

    // Payments
    const [savePaymentMethod, setSavePaymentMethod] = useState(true);
    const [paymentSimName, setPaymentSimName] = useState('');
    const [paymentCardName, setPaymentCardName] = useState('');
    const [paymentCardNumber, setPaymentCardNumber] = useState('');
    const [paymentCardBrand, setPaymentCardBrand] = useState('unknown');
    const [paymentExpiryMonth, setPaymentExpiryMonth] = useState('');
    const [paymentExpiryYear, setPaymentExpiryYear] = useState('');
    const [paymentCvv, setPaymentCvv] = useState('');
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');

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

    const [socialConnections, setSocialConnections] = useState(INITIAL_SOCIAL_CONNECTIONS);
    const [socialPopover, setSocialPopover] = useState(null);

    const handleSave = useCallback((sectionId) => {
        setSaved(prev => ({ ...prev, [sectionId]: true }));
    }, []);

    const addDocumentFiles = useCallback((files) => {
        const nextFiles = Array.from(files)
            .filter((file) => file && file.name)
            .map((file) => ({
                id: `${file.name}-${file.lastModified}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                size: formatFileSize(file.size),
            }));

        if (nextFiles.length === 0) return;

        setDocumentFiles((currentFiles) => [...currentFiles, ...nextFiles]);
        setSaved((currentSaved) => ({ ...currentSaved, documents: true }));
    }, []);

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

    const removeDocumentFile = useCallback((fileId) => {
        setDocumentFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    }, []);

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
            label: action.id === 'more' ? 'Social media name' : 'Social media link',
            name: action.name || '',
            link: action.handle || '',
            icon: action.icon,
            iconBg: action.iconBg || '#F6F7FB',
            iconColor: action.iconColor || '#6B7280',
            left: clampedCenterX,
            top,
            placement: canOpenAbove ? 'top' : 'bottom',
            nameValue: action.id === 'more' ? '' : action.name || '',
            linkValue: action.handle || '',
            error: '',
        });
    }, []);

    const submitSocialPopover = useCallback((event) => {
        event.preventDefault();

        if (!socialPopover) return;

        const linkValue = socialPopover.linkValue.trim();
        const nameValue = socialPopover.mode === 'custom' ? socialPopover.nameValue.trim() : socialPopover.name;

        if (!nameValue || !linkValue) {
            setSocialPopover((currentPopover) => (
                currentPopover
                    ? { ...currentPopover, error: 'Both fields are required.' }
                    : currentPopover
            ));
            return;
        }

        if (socialPopover.mode === 'connect') {
            setSocialConnections((currentConnections) => {
                const existingConnection = currentConnections.find((connection) => connection.id === socialPopover.id);
                const nextConnection = {
                    id: socialPopover.id,
                    name: socialPopover.name,
                    handle: linkValue,
                    icon: socialPopover.icon,
                    iconBg: socialPopover.iconBg,
                    iconColor: socialPopover.iconColor,
                    active: true,
                };

                if (existingConnection) {
                    return currentConnections.map((connection) => (
                        connection.id === socialPopover.id ? nextConnection : connection
                    ));
                }

                return [...currentConnections, nextConnection];
            });
        } else {
            const normalizedId = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            setSocialConnections((currentConnections) => {
                const alreadyExists = currentConnections.some((connection) => connection.id === normalizedId || connection.name.toLowerCase() === nameValue.toLowerCase());

                if (alreadyExists) {
                    return currentConnections.map((connection) => (
                        connection.id === normalizedId || connection.name.toLowerCase() === nameValue.toLowerCase()
                            ? { ...connection, name: nameValue, handle: linkValue, active: true }
                            : connection
                    ));
                }

                return [
                    ...currentConnections,
                    {
                        id: normalizedId || `custom-${Date.now()}`,
                        name: nameValue,
                        handle: linkValue,
                        icon: <span className="hoas-social-plus">+</span>,
                        iconBg: '#F6F7FB',
                        iconColor: '#6B7280',
                        active: true,
                    },
                ];
            });
        }

        setSaved((currentSaved) => ({ ...currentSaved, social: true }));
        closeSocialPopover();
    }, [closeSocialPopover, socialPopover]);

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

    const scrollToSection = (id) => {
        // For payment sub-tabs, switch the tab and scroll to the payment section
        if (id === 'payment-mtn') {
            setSelectedGateway('mtn');
            sectionRefs.current['payment']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection('payment-mtn');
        } else if (id === 'payment-airtel') {
            setSelectedGateway('airtel');
            sectionRefs.current['payment']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection('payment-airtel');
        } else if (id === 'payment-card') {
            setSelectedGateway('card');
            sectionRefs.current['payment']?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection('payment-card');
        } else {
            sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
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


    return (
        <HOALayout currentPage="settings">
            <div className="hoas-page-wrapper">

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
                                                    {saved[nav.id] ? <IconChecked /> : <IconUnchecked />}
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
                        <SectionCard id="general" title="Basic Settings" saved={saved['general']} onSave={() => handleSave('general')} sectionRef={el => sectionRefs.current['general'] = el}>
                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Client ID</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="Head Of Academia" />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Photo</label>
                                <div className="hoas-form-horizontal-control">
                                    <div style={{ width: '100%' }}>
                                        <div className="hoas-photo-upload-area">
                                            <span className="hoas-photo-info">150×150px JPEG, PNG Image</span>
                                            <div className="hoas-photo-preview">
                                                <div className="hoas-photo-inner">
                                                    <img src={uploadedPhoto || "/assets/imgs/default-profile.png"} alt="Profile" />
                                                    <label className="hoas-photo-camera-overlay">
                                                        <IconCamera />
                                                        <input
                                                            type="file"
                                                            accept="image/png, image/jpeg"
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                const file = e.target.files && e.target.files[0];
                                                                if (file) {
                                                                    if (file.size > 1048576) {
                                                                        setUploadError('File size exceeds 1MB. Please choose a smaller image.');
                                                                        return;
                                                                    }
                                                                    setUploadError('');
                                                                    setUploadedPhoto(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                {uploadedPhoto && (
                                                    <div className="hoas-photo-remove" onClick={() => setUploadedPhoto(null)}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {uploadError && <p className="hoas-photo-error">{uploadError}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Name</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="Jason Tatum" />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Role</label>
                                <div className="hoas-form-horizontal-control">
                                    <input type="text" defaultValue="UI/UX Designer" />
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
                                            { value: 'unlisted', label: 'Unlisted' },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Availability</label>
                                <div className="hoas-form-horizontal-control">
                                    <div className="hoas-availability-area">
                                        <span className="hoas-availability-text">Available to hire</span>
                                        <Toggle checked={publicProfile} onChange={e => setPublicProfile(e.target.checked)} />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Email ── */}
                        <SectionCard id="email" title="Email" saved={saved['email']} onSave={() => handleSave('email')} sectionRef={el => sectionRefs.current['email'] = el}>
                            <div className="hoas-form-horizontal-row">
                                <label className="hoas-form-horizontal-label">Email</label>
                                <div className="hoas-form-horizontal-control">
                                    <input
                                        type="email"
                                        value={emailAddress}
                                        onChange={e => setEmailAddress(e.target.value)}
                                        placeholder="jasontatum@gonaraza.com"
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
                                            <Toggle checked={emailPrimary} onChange={e => setEmailPrimary(e.target.checked)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-horizontal-row" style={{ minHeight: 0, marginBottom: 0 }}>
                                <label className="hoas-form-horizontal-label" />
                                <div className="hoas-form-horizontal-control">
                                    <p className="hoas-email-help-text">
                                        Input your email, designate as primary for priority updates. Toggle to seamlessly customize your communication preferences.
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 2. Documents and Files ── */}
                        <SectionCard id="documents" title="Documents and Files" saved={saved['documents']} onSave={() => handleSave('documents')} sectionRef={el => sectionRefs.current['documents'] = el} showDiscard={false}>
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
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 19V6" />
                                        <path d="M7 11l5-5 5 5" />
                                    </svg>
                                </div>
                                <div className="hoas-doc-upload-copy">
                                    <strong>Add Certificates files or Click Upload</strong>
                                    <span>Upload case files, if any.</span>
                                </div>
                            </button>

                            <div className="hoas-doc-file-grid">
                                {documentFiles.map((file) => (
                                    <div key={file.id} className="hoas-doc-file-card">
                                        <button type="button" className="hoas-doc-file-remove" aria-label={`Remove ${file.name}`} onClick={() => removeDocumentFile(file.id)}>
                                            ×
                                        </button>
                                        <div className="hoas-doc-file-icon" aria-hidden="true">
                                            PDF
                                        </div>
                                        <div className="hoas-doc-file-meta">
                                            <span className="hoas-doc-file-name">{file.name}</span>
                                            <span className="hoas-doc-file-size">{file.size}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>



                        {/* ── 3. Social Media Links ── */}
                        <SectionCard id="social" title="Social Media Links" saved={saved['social']} onSave={() => handleSave('social')} sectionRef={el => sectionRefs.current['social'] = el}>
                            <div className="hoas-social-card-list">
                                {socialConnections.map((connection) => (
                                    <div key={connection.id} className="hoas-social-connection-card">
                                        <div className="hoas-social-connection-main">
                                            <div className="hoas-social-icon" style={{ background: connection.iconBg, color: connection.iconColor }}>
                                                {connection.icon}
                                            </div>
                                            <div className="hoas-social-connection-copy">
                                                <span className="hoas-social-connection-name">{connection.name}</span>
                                                <span className="hoas-social-connection-handle">{connection.handle}</span>
                                            </div>
                                        </div>
                                        <div className="hoas-social-connection-actions">
                                            <Toggle checked={Boolean(connection.active)} onChange={e => toggleSocialConnection(connection.id, e.target.checked)} />
                                            <button type="button" className="hoas-social-delete" aria-label={`Remove ${connection.name}`} onClick={() => removeSocialConnection(connection.id)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18" />
                                                    <path d="M8 6V4h8v2" />
                                                    <path d="M19 6l-1 13H6L5 6" />
                                                    <path d="M10 11v6" />
                                                    <path d="M14 11v6" />
                                                </svg>
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
                                                        placeholder="Instagram, TikTok, etc."
                                                    />
                                                </label>
                                            )}

                                            <label className="hoas-social-popover-field">
                                                <span>{socialPopover.label}</span>
                                                <input
                                                    type="text"
                                                    value={socialPopover.linkValue}
                                                    onChange={(event) => setSocialPopover((currentPopover) => currentPopover ? { ...currentPopover, linkValue: event.target.value, error: '' } : currentPopover)}
                                                    placeholder="https://..."
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
                                    {SOCIAL_CONNECT_ACTIONS.filter((action) => action.id === 'more' || !socialConnections.some((connection) => connection.id === action.id)).map((action) => (
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
                            saved={saved['twofactor']}
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
                                    const onChange = option.id === 'sms' ? setTwoFactorSMS : setTwoFactorAuthenticator;

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
                                            <Toggle checked={checked} onChange={e => onChange(e.target.checked)} />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="hoas-2fa-password-row">
                                <label className="hoas-2fa-password-label">Password</label>
                                <div className="hoas-2fa-password-control">
                                    <input
                                        type="password"
                                        value={twoFactorPassword}
                                        onChange={e => setTwoFactorPassword(e.target.value)}
                                        placeholder="Enter password"
                                    />
                                    <p>Enter your password to setup Two-Factor authentication</p>
                                </div>
                            </div>

                            <div className="hoas-2fa-actions">
                                <button type="button" className="hoas-btn-save" onClick={() => handleSave('twofactor')}>Setup</button>
                            </div>
                        </SectionCard>

                        {/* ── 5. Payment Methods ── */}
                        <SectionCard
                            id="payment"
                            title="Payment Methods"
                            saved={saved['payment-mtn'] || saved['payment-airtel'] || saved['payment-card']}
                            onSave={() => handleSave(selectedGateway === 'mtn' ? 'payment-mtn' : selectedGateway === 'airtel' ? 'payment-airtel' : 'payment-card')}
                            sectionRef={el => sectionRefs.current['payment'] = el}
                            showFooter={false}
                        >
                            {/* Tab switcher */}
                            <div className="hoas-payment-types">
                                {[
                                    { id: 'mtn',    label: 'MTN Mobile Money', icon: '/assets/icons/MTN-pay.svg',    bg: '#FFF8DD' },
                                    { id: 'airtel', label: 'Airtel Money',      icon: '/assets/icons/AIR-pay.svg',    bg: '#FFEEF3' },
                                    { id: 'card',   label: 'Bank Cards',        icon: '/assets/icons/CARD-pay.svg',   bg: '#F3EEFF' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        className={`hoas-payment-type-card ${selectedGateway === type.id ? 'active' : ''}`}
                                        onClick={() => { setSelectedGateway(type.id); setActiveSection('payment-' + type.id); }}
                                    >
                                        <div className="hoas-payment-type-icon" style={{ background: type.bg }}>
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
                                    <div className="hoas-payment-subtitle">Add MTN Mobile Money</div>
                                    <div className="hoas-payment-form">
                                        <div className="hoas-payment-field">
                                            <PaymentFieldLabel hint="Enter the name registered on your MTN SIM card.">SIM Card Name</PaymentFieldLabel>
                                            <input
                                                type="text"
                                                value={paymentSimName}
                                                onChange={e => setPaymentSimName(e.target.value)}
                                                placeholder="Max Smith"
                                            />
                                        </div>
                                        <div className="hoas-payment-field hoas-payment-phone-field">
                                            <PaymentFieldLabel hint="Rwanda MTN numbers start with 078 or 079.">Phone Number <span className="hoas-required">*</span></PaymentFieldLabel>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={paymentPhoneNumber}
                                                onChange={e => setPaymentPhoneNumber(formatRwandaPhoneNumber(e.target.value))}
                                                placeholder="07 88 123 456"
                                                className="hoas-payment-phone-field-input"
                                            />
                                        </div>
                                        <div className="hoas-payment-footer-row">
                                            <div className="hoas-payment-save-toggle">
                                                <span className="hoas-toggle-label">Save for future use</span>
                                                <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                                            </div>
                                            <button type="button" className="hoas-btn-save" onClick={() => handleSave('payment-mtn')}>Save Changes</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Airtel Money form */}
                            {selectedGateway === 'airtel' && (
                                <>
                                    <div className="hoas-payment-subtitle">Add Airtel Money</div>
                                    <div className="hoas-payment-form">
                                        <div className="hoas-payment-field">
                                            <PaymentFieldLabel hint="Enter the name registered on your Airtel SIM card.">SIM Card Name</PaymentFieldLabel>
                                            <input
                                                type="text"
                                                placeholder="Max Smith"
                                            />
                                        </div>
                                        <div className="hoas-payment-field hoas-payment-phone-field">
                                            <PaymentFieldLabel hint="Rwanda Airtel numbers start with 073 or 072.">Phone Number <span className="hoas-required">*</span></PaymentFieldLabel>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="07 32 123 456"
                                                className="hoas-payment-phone-field-input"
                                            />
                                        </div>
                                        <div className="hoas-payment-footer-row">
                                            <div className="hoas-payment-save-toggle">
                                                <span className="hoas-toggle-label">Save for future use</span>
                                                <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                                            </div>
                                            <button type="button" className="hoas-btn-save" onClick={() => handleSave('payment-airtel')}>Save Changes</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Bank Cards form */}
                            {selectedGateway === 'card' && (
                                <>
                                    <div className="hoas-payment-subtitle">Add Bank Card</div>
                                    <div className="hoas-payment-form">
                                        <div className="hoas-payment-field">
                                            <PaymentFieldLabel hint="Use the name exactly as it appears on the card.">Name On Card <span className="hoas-required">*</span></PaymentFieldLabel>
                                            <input type="text" value={paymentCardName} onChange={e => setPaymentCardName(e.target.value)} placeholder="Max Smith" />
                                        </div>
                                        <div className="hoas-payment-field">
                                            <PaymentFieldLabel hint="Card brand is detected automatically as you type.">Card Number <span className="hoas-required">*</span></PaymentFieldLabel>
                                            <div className="hoas-input-with-icon-right hoas-payment-card-number">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={paymentCardNumber}
                                                    onChange={e => {
                                                        const nextBrand = detectCardBrand(e.target.value);
                                                        setPaymentCardBrand(nextBrand);
                                                        setPaymentCardNumber(formatCardNumber(e.target.value, nextBrand));
                                                    }}
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                                <div className="hoas-card-icons">
                                                    {(paymentCardBrand === 'visa' || paymentCardBrand === 'unknown') && <img src="/assets/icons/VISA-pay.svg" alt="Visa" height="18" />}
                                                    {(paymentCardBrand === 'mastercard' || paymentCardBrand === 'unknown') && <img src="/assets/icons/MASTER-PAY.svg" alt="Mastercard" height="18" />}
                                                    {paymentCardBrand === 'amex' && <span className="hoas-payment-brand-badge">Amex</span>}
                                                </div>
                                            </div>
                                            {paymentCardBrand !== 'unknown' && (
                                                <p className="hoas-payment-detected-brand">Detected: {paymentCardBrand === 'mastercard' ? 'Mastercard' : paymentCardBrand === 'visa' ? 'Visa' : 'Amex'}</p>
                                            )}
                                        </div>
                                        <div className="hoas-payment-field">
                                            <PaymentFieldLabel hint="Enter the expiration month and year, plus the CVV security code.">Expiration Date</PaymentFieldLabel>
                                            <div className="hoas-payment-expiry-grid">
                                                <input type="text" value={paymentExpiryMonth} onChange={e => setPaymentExpiryMonth(e.target.value)} placeholder="03/07" />
                                                <input type="text" value={paymentExpiryYear} onChange={e => setPaymentExpiryYear(e.target.value)} placeholder="2025" />
                                                <input type="text" value={paymentCvv} onChange={e => setPaymentCvv(e.target.value)} placeholder="CVV" />
                                            </div>
                                        </div>
                                        <div className="hoas-payment-footer-row">
                                            <div className="hoas-payment-save-toggle">
                                                <span className="hoas-toggle-label">Save for future use</span>
                                                <Toggle checked={savePaymentMethod} onChange={e => setSavePaymentMethod(e.target.checked)} />
                                            </div>
                                            <button type="button" className="hoas-btn-save" onClick={() => handleSave('payment-card')}>Save Changes</button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <p className="hoas-payment-footnote">
                                Single Sign-On (SSO) authentication streamlines access across multiple platforms. Users log in once, gaining seamless entry to various systems without repetitive credentials.
                            </p>
                        </SectionCard>

                        {/* ── 6. Preferences ── */}
                        <SectionCard id="preferences" title="Preferences" saved={saved['preferences']} onSave={() => handleSave('preferences')} sectionRef={el => sectionRefs.current['preferences'] = el} showDiscard={false}>
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
                                            <label className="hoas-preference-checkbox">
                                                <input type="checkbox" checked={showListNames} onChange={e => setShowListNames(e.target.checked)} />
                                                <span className="hoas-preference-checkbox-box">{showListNames ? <IconCheckSquare /> : <IconSquare />}</span>
                                                <span className="hoas-preference-checkbox-copy">
                                                    <span className="hoas-preference-checkbox-title">Show list names</span>
                                                    <span className="hoas-preference-checkbox-desc">See the name next to each icon</span>
                                                </span>
                                            </label>

                                            <label className="hoas-preference-checkbox">
                                                <input type="checkbox" checked={showLinkedTaskNames} onChange={e => setShowLinkedTaskNames(e.target.checked)} />
                                                <span className="hoas-preference-checkbox-box">{showLinkedTaskNames ? <IconCheckSquare /> : <IconSquare />}</span>
                                                <span className="hoas-preference-checkbox-copy">
                                                    <span className="hoas-preference-checkbox-title">Show linked task names</span>
                                                    <span className="hoas-preference-checkbox-desc">Show task names next to ids for linked project tasks.</span>
                                                </span>
                                            </label>
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
                        <SectionCard id="notifications" title="Notifications" saved={saved['notifications']} onSave={() => handleSave('notifications')} sectionRef={el => sectionRefs.current['notifications'] = el} showDiscard={false}>
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
                                        <label key={option.value} className="hoas-notification-radio-item">
                                            <input
                                                type="radio"
                                                name="project-notifications"
                                                checked={projectNotifications === option.value}
                                                onChange={() => setProjectNotifications(option.value)}
                                            />
                                            <span className="hoas-notification-radio-dot" />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="hoas-notification-group">
                                <div className="hoas-notification-group-title">Email notifications</div>
                                <div className="hoas-notification-radio-list">
                                    {EMAIL_NOTIFICATION_OPTIONS.map((option) => (
                                        <label key={option.value} className="hoas-notification-radio-item">
                                            <input
                                                type="radio"
                                                name="email-notifications"
                                                checked={emailNotifications === option.value}
                                                onChange={() => setEmailNotifications(option.value)}
                                            />
                                            <span className="hoas-notification-radio-dot" />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="hoas-notification-group">
                                <div className="hoas-notification-group-title">Subscriptions</div>
                                <label className="hoas-notification-checkbox">
                                    <input type="checkbox" checked={autoSubscribeTasks} onChange={e => setAutoSubscribeTasks(e.target.checked)} />
                                    <span className="hoas-notification-checkbox-box">
                                        <IconCheckSquare />
                                    </span>
                                    <span>Automatically subscribe to tasks you create</span>
                                </label>
                            </div>
                        </SectionCard>



                        {/* ── 10. Address ── */}
                        <SectionCard id="address" title="Address" saved={saved['address']} onSave={() => handleSave('address')} sectionRef={el => sectionRefs.current['address'] = el} showDiscard={false}>
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
                                        <div className="hoas-addr-country-select">
                                            <span className="hoas-addr-country-flag">
                                                {COUNTRIES.find(c => c.code === addrCountry)?.flag || '🌍'}
                                            </span>
                                            <select
                                                value={addrCountry}
                                                onChange={e => setAddrCountry(e.target.value)}
                                                className="hoas-addr-select"
                                            >
                                                {COUNTRIES.map(c => (
                                                    <option key={c.code} value={c.code}>{c.name}</option>
                                                ))}
                                            </select>
                                            <svg className="hoas-addr-select-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
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
                        <SectionCard id="appearance" title="Appearance" saved={saved['appearance']} onSave={() => handleSave('appearance')} sectionRef={el => sectionRefs.current['appearance'] = el} showDiscard={false}>
                            <div className="hoas-appearance-intro">
                                <div className="hoas-appearance-intro-title">Theme mode</div>
                                <p>Select or customize your theme. Drop in your downloaded images below.</p>
                            </div>

                            <div className="hoas-appearance-theme-grid">
                                {[
                                    { id: 'dark',   label: 'Dark',   src: '/assets/themes/theme-dark.png' },
                                    { id: 'light',  label: 'Light',  src: '/assets/themes/theme-light.png' },
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
        </HOALayout>
    );
};

export default HOASettings;