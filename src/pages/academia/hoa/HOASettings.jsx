import React, { useState, useRef, useEffect, useCallback } from 'react';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import './hoa-settings.css';

import hoarefresh from '../../../assets/icons/hoarefresh.svg';
import hoagoto from '../../../assets/icons/hoagoto.svg';
import rwanda from '../../../assets/icons/rwanda.svg';

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

// ─── Nav sections definition ───────────────────────────────────────────────────
const NAV_CATEGORIES = [
    {
        title: 'Basic Setup',
        items: [
            { id: 'general', label: 'General Settings' },
            { id: 'layout', label: 'Layout' },
            { id: 'social', label: 'Social Media Links' },
            { id: 'seo', label: 'SEO and Metadata' },
        ]
    },
    {
        title: 'Payments',
        items: [
            { id: 'payment', label: 'Payment Methods' },
        ]
    },
    {
        title: 'Advanced Settings',
        items: [
            { id: 'theme', label: 'App Theme' },
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
                <span>{selected.label}</span>
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
                            {opt.label}
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
const SectionCard = ({ id, title, children, saved, onSave, sectionRef }) => (
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
            </div>
        </div>
        <div className="hoas-section-body">
            {children}
            <div className="hoas-section-footer">
                <button className="hoas-btn-discard">Discard</button>
                <button className="hoas-btn-save" onClick={onSave}>
                    Save Changes
                </button>
            </div>
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const HOASettings = () => {
    const [saved, setSaved] = useState({});
    const [activeSection, setActiveSection] = useState('general');
    const sectionRefs = useRef({});

    const [uploadedPhoto, setUploadedPhoto] = useState(null);
    const [uploadError, setUploadError] = useState('');

    // Phone & Visibility
    const [phoneNumber, setPhoneNumber] = useState('700 000 000');
    const [visibility, setVisibility] = useState('public');

    // Theme selection
    const [selectedTheme, setSelectedTheme] = useState('light');
    const [syncSystem, setSyncSystem] = useState(true);

    // Payment gateway
    const [selectedGateway, setSelectedGateway] = useState('card');
    const [paymentActive, setPaymentActive] = useState(true);

    // Toggles
    const [publicProfile, setPublicProfile] = useState(true);
    const [searchIndexing, setSearchIndexing] = useState(true);

    // Notification toggles
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSMS, setNotifSMS] = useState(false);
    const [notifPush, setNotifPush] = useState(true);
    const [notifNewLearner, setNotifNewLearner] = useState(true);
    const [notifNewAssignment, setNotifNewAssignment] = useState(true);
    const [notifGrades, setNotifGrades] = useState(false);

    // Social toggles
    const [socialIG, setSocialIG] = useState(true);
    const [socialLI, setSocialLI] = useState(true);
    const [socialFB, setSocialFB] = useState(false);
    const [socialTW, setSocialTW] = useState(true);
    const [socialTK, setSocialTK] = useState(false);

    const handleSave = useCallback((sectionId) => {
        setSaved(prev => ({ ...prev, [sectionId]: true }));
    }, []);

    const scrollToSection = (id) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(id);
    };

    // Scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.dataset.section);
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

                        {/* ── 2. Layout ── */}
                        <SectionCard id="layout" title="Layout" saved={saved['layout']} onSave={() => handleSave('layout')} sectionRef={el => sectionRefs.current['layout'] = el}>
                            <div className="hoas-form-group">
                                <label>Logo</label>
                                <p className="hoas-sub-label">Supported formats: JPG, PNG, SVG. Max size: 2MB.</p>
                                <div className="hoas-upload-grid">
                                    <div className="hoas-upload-box">
                                        <div className="hoas-upload-icon-wrapper">
                                            <IconUpload />
                                        </div>
                                        <div className="hoas-upload-text">
                                            <strong>Light Logo</strong>
                                            <span>Click to upload or drag & drop</span>
                                        </div>
                                    </div>
                                    <div className="hoas-upload-box">
                                        <div className="hoas-upload-icon-wrapper">
                                            <IconUpload />
                                        </div>
                                        <div className="hoas-upload-text">
                                            <strong>Dark Logo</strong>
                                            <span>Click to upload or drag & drop</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hoas-form-group hoas-mt-16">
                                <label>Favicon</label>
                                <p className="hoas-sub-label">ICO or PNG, 32×32px recommended.</p>
                                <div className="hoas-upload-box hoas-upload-box--single">
                                    <div className="hoas-upload-icon-wrapper">
                                        <IconUpload />
                                    </div>
                                    <div className="hoas-upload-text">
                                        <strong>Favicon</strong>
                                        <span>Click to upload</span>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 3. Social Media Links ── */}
                        <SectionCard id="social" title="Social Media Links" saved={saved['social']} onSave={() => handleSave('social')} sectionRef={el => sectionRefs.current['social'] = el}>
                            {[
                                { id: 'ig', icon: <IconInstagram />, label: 'Instagram', placeholder: 'instagram.com/gonaraza', bg: '#FFEEF3', color: '#F8285A', checked: socialIG, onChange: e => setSocialIG(e.target.checked) },
                                { id: 'li', icon: <IconLinkedIn />, label: 'LinkedIn', placeholder: 'linkedin.com/company/gonaraza', bg: '#F0F5FF', color: '#1B84FF', checked: socialLI, onChange: e => setSocialLI(e.target.checked) },
                                { id: 'fb', icon: <IconFacebook />, label: 'Facebook', placeholder: 'facebook.com/gonaraza', bg: '#EFF4FF', color: '#1877F2', checked: socialFB, onChange: e => setSocialFB(e.target.checked) },
                                { id: 'tw', icon: <IconTwitter />, label: 'Twitter / X', placeholder: 'twitter.com/gonaraza', bg: '#F5F5F5', color: '#000000', checked: socialTW, onChange: e => setSocialTW(e.target.checked) },
                                { id: 'tk', icon: <IconTiktok />, label: 'TikTok', placeholder: 'tiktok.com/@gonaraza', bg: '#F5F0FF', color: '#69C9D0', checked: socialTK, onChange: e => setSocialTK(e.target.checked) },
                            ].map(({ id, icon, label, placeholder, bg, color, checked, onChange }) => (
                                <div key={id} className="hoas-social-row">
                                    <div className="hoas-social-icon" style={{ background: bg, color }}>
                                        {icon}
                                    </div>
                                    <div className="hoas-social-input">
                                        <label>{label}</label>
                                        <input type="text" defaultValue={placeholder} />
                                    </div>
                                    <Toggle checked={checked} onChange={onChange} />
                                </div>
                            ))}
                        </SectionCard>

                        {/* ── 4. SEO & Metadata ── */}
                        <SectionCard id="seo" title="SEO and Metadata" saved={saved['seo']} onSave={() => handleSave('seo')} sectionRef={el => sectionRefs.current['seo'] = el}>
                            <div className="hoas-toggle-wrapper hoas-mb-20">
                                <div>
                                    <span className="hoas-toggle-label"><b>Enable Search Engine Indexing</b></span>
                                    <p className="hoas-toggle-desc">Allow search engines to index your site.</p>
                                </div>
                                <Toggle checked={searchIndexing} onChange={e => setSearchIndexing(e.target.checked)} />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Title</label>
                                <input type="text" defaultValue="Gonaraza — All-in-one digital marketing" />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Description</label>
                                <textarea rows="3" defaultValue="Gonaraza provides the best tools to manage your digital marketing campaigns efficiently and effectively." />
                            </div>
                            <div className="hoas-form-group">
                                <label>Meta Keywords</label>
                                <input type="text" defaultValue="digital marketing, Rwanda, online learning, courses" />
                            </div>
                        </SectionCard>

                        {/* ── 5. Payment Methods ── */}
                        <SectionCard id="payment" title="Payment Methods" saved={saved['payment']} onSave={() => handleSave('payment')} sectionRef={el => sectionRefs.current['payment'] = el}>
                            <div className="hoas-form-group">
                                <label>Gateway Type</label>
                                <div className="hoas-gateway-options">
                                    {[
                                        { id: 'mtn', label: 'Mobile Money', icon: '/assets/icons/MTN-pay.svg', bg: '#FFF8DD', color: '#F6C000' },
                                        { id: 'airtel', label: 'Airtel Money', icon: '/assets/icons/AIR-pay.svg', bg: '#FFEEF3', color: '#E40000' },
                                        { id: 'card', label: 'Credit Card', icon: '/assets/icons/CARD-pay.svg', bg: '#F0F5FF', color: '#1B84FF' },
                                    ].map(({ id, label, icon, bg, color }) => (
                                        <div
                                            key={id}
                                            className={`hoas-gateway-box ${selectedGateway === id ? 'active' : ''}`}
                                            onClick={() => setSelectedGateway(id)}
                                        >
                                            <div className="hoas-gateway-logo" style={{ background: bg }}>
                                                <img src={icon} alt={label} />
                                            </div>
                                            <span>{label}</span>
                                            {selectedGateway === id && (
                                                <span className="hoas-gateway-radio-dot" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Account Name</label>
                                    <input type="text" defaultValue="Gonaraza Ltd" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>API Gateway Key</label>
                                    <div className="hoas-input-with-icon-right">
                                        <input type="password" defaultValue="sk_live_••••••••••••••••••••" />
                                        <div className="hoas-card-icons">
                                            <img src="/assets/icons/VISA-pay.svg" alt="Visa" height="18" />
                                            <img src="/assets/icons/MASTER-PAY.svg" alt="Mastercard" height="18" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Transaction Fee (%)</label>
                                    <input type="number" defaultValue="1.5" min="0" max="10" step="0.1" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Minimum Payout (RWF)</label>
                                    <input type="number" defaultValue="5000" />
                                </div>
                            </div>

                            <div className="hoas-toggle-wrapper">
                                <div>
                                    <span className="hoas-toggle-label">Activate Payment Method</span>
                                    <p className="hoas-toggle-desc">Enable live payment processing for this gateway</p>
                                </div>
                                <Toggle checked={paymentActive} onChange={e => setPaymentActive(e.target.checked)} />
                            </div>
                        </SectionCard>

                        {/* ── 6. App Theme ── */}
                        <SectionCard id="theme" title="App Theme" saved={saved['theme']} onSave={() => handleSave('theme')} sectionRef={el => sectionRefs.current['theme'] = el}>
                            <p className="hoas-sub-label">Choose the look and feel of your dashboard.</p>
                            <div className="hoas-theme-grid">
                                {[
                                    { id: 'light', label: 'Light', colors: ['#FFFFFF', '#F6F6F9', '#450468'] },
                                    { id: 'dark', label: 'Dark', colors: ['#1E1E2D', '#151521', '#7239EA'] },
                                    { id: 'custom', label: 'Custom', colors: ['#E8F4FD', '#D0E8FA', '#0D6EFD'] },
                                ].map(({ id, label, colors }) => (
                                    <div
                                        key={id}
                                        className={`hoas-theme-box ${selectedTheme === id ? 'active' : ''}`}
                                        onClick={() => setSelectedTheme(id)}
                                    >
                                        <div className="hoas-theme-preview" style={{ background: colors[0] }}>
                                            <div className="hoas-theme-preview-sidebar" style={{ background: colors[1] }} />
                                            <div className="hoas-theme-preview-content">
                                                <div className="hoas-theme-preview-bar" style={{ background: colors[2] }} />
                                                <div className="hoas-theme-preview-lines">
                                                    <div style={{ background: colors[1] }} />
                                                    <div style={{ background: colors[1] }} />
                                                    <div style={{ background: colors[1] }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hoas-theme-label">
                                            <div className={`hoas-theme-radio ${selectedTheme === id ? 'checked' : ''}`}>
                                                {selectedTheme === id && <div />}
                                            </div>
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hoas-toggle-wrapper hoas-mt-20">
                                <div>
                                    <span className="hoas-toggle-label">Sync with system preferences</span>
                                    <p className="hoas-toggle-desc">Automatically switch theme based on your OS setting</p>
                                </div>
                                <Toggle checked={syncSystem} onChange={e => setSyncSystem(e.target.checked)} />
                            </div>
                        </SectionCard>

                        {/* ── 7. Notifications ── */}
                        <SectionCard id="notifications" title="Notifications" saved={saved['notifications']} onSave={() => handleSave('notifications')} sectionRef={el => sectionRefs.current['notifications'] = el}>
                            <p className="hoas-sub-label">Configure how and when you receive notifications.</p>

                            <div className="hoas-notif-group">
                                <h3 className="hoas-notif-group-title">Delivery Channels</h3>
                                {[
                                    { label: 'Email Notifications', desc: 'Receive alerts via email', checked: notifEmail, onChange: e => setNotifEmail(e.target.checked) },
                                    { label: 'SMS Notifications', desc: 'Receive alerts via SMS', checked: notifSMS, onChange: e => setNotifSMS(e.target.checked) },
                                    { label: 'Push Notifications', desc: 'In-app push alerts', checked: notifPush, onChange: e => setNotifPush(e.target.checked) },
                                ].map(({ label, desc, checked, onChange }) => (
                                    <div key={label} className="hoas-toggle-wrapper hoas-toggle-sm">
                                        <div>
                                            <span className="hoas-toggle-label">{label}</span>
                                            <p className="hoas-toggle-desc">{desc}</p>
                                        </div>
                                        <Toggle checked={checked} onChange={onChange} />
                                    </div>
                                ))}
                            </div>

                            <div className="hoas-notif-group hoas-mt-20">
                                <h3 className="hoas-notif-group-title">Event Triggers</h3>
                                {[
                                    { label: 'New Learner Enrolled', desc: 'Notify when a new learner joins', checked: notifNewLearner, onChange: e => setNotifNewLearner(e.target.checked) },
                                    { label: 'New Assignment Submitted', desc: 'Alert when learners submit work', checked: notifNewAssignment, onChange: e => setNotifNewAssignment(e.target.checked) },
                                    { label: 'Grade Published', desc: 'Alert when results are released', checked: notifGrades, onChange: e => setNotifGrades(e.target.checked) },
                                ].map(({ label, desc, checked, onChange }) => (
                                    <div key={label} className="hoas-toggle-wrapper hoas-toggle-sm">
                                        <div>
                                            <span className="hoas-toggle-label">{label}</span>
                                            <p className="hoas-toggle-desc">{desc}</p>
                                        </div>
                                        <Toggle checked={checked} onChange={onChange} />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* ── 8. Address ── */}
                        <SectionCard id="address" title="Address" saved={saved['address']} onSave={() => handleSave('address')} sectionRef={el => sectionRefs.current['address'] = el}>
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Name / Organisation</label>
                                    <input type="text" defaultValue="Gonaraza Ltd" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Phone</label>
                                    <input type="text" defaultValue="+250 788 123 456" />
                                </div>
                            </div>
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Street Address</label>
                                    <input type="text" defaultValue="KG 541 St" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>City</label>
                                    <input type="text" defaultValue="Kigali" />
                                </div>
                            </div>
                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Province / State</label>
                                    <input type="text" defaultValue="Kigali City" />
                                </div>
                                <div className="hoas-form-group">
                                    <label>Postal Code</label>
                                    <input type="text" defaultValue="00100" />
                                </div>
                            </div>
                            <div className="hoas-form-group">
                                <label>Country</label>
                                <div className="hoas-input-with-flag">
                                    <img src={rwanda} alt="Rwanda" />
                                    <select defaultValue="rwanda">
                                        <option value="rwanda">Rwanda</option>
                                        <option value="kenya">Kenya</option>
                                        <option value="uganda">Uganda</option>
                                    </select>
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── 9. Appearance ── */}
                        <SectionCard id="appearance" title="Appearance" saved={saved['appearance']} onSave={() => handleSave('appearance')} sectionRef={el => sectionRefs.current['appearance'] = el}>
                            <p className="hoas-sub-label">Customise fonts, colours and branding elements.</p>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Primary Color</label>
                                    <div className="hoas-color-picker-row">
                                        <input type="color" defaultValue="#450468" className="hoas-color-swatch" />
                                        <input type="text" defaultValue="#450468" className="hoas-color-hex" />
                                    </div>
                                </div>
                                <div className="hoas-form-group">
                                    <label>Accent Color</label>
                                    <div className="hoas-color-picker-row">
                                        <input type="color" defaultValue="#1B84FF" className="hoas-color-swatch" />
                                        <input type="text" defaultValue="#1B84FF" className="hoas-color-hex" />
                                    </div>
                                </div>
                            </div>

                            <div className="hoas-form-row">
                                <div className="hoas-form-group">
                                    <label>Font Family</label>
                                    <select defaultValue="inter">
                                        <option value="inter">Inter</option>
                                        <option value="poppins">Poppins</option>
                                        <option value="roboto">Roboto</option>
                                        <option value="outfit">Outfit</option>
                                    </select>
                                </div>
                                <div className="hoas-form-group">
                                    <label>Border Radius</label>
                                    <select defaultValue="8">
                                        <option value="4">4px – Sharp</option>
                                        <option value="8">8px – Rounded (Default)</option>
                                        <option value="12">12px – Soft</option>
                                        <option value="20">20px – Pill</option>
                                    </select>
                                </div>
                            </div>

                            <div className="hoas-appearance-preview">
                                <div className="hoas-appearance-preview-label">Live Preview</div>
                                <div className="hoas-appearance-card">
                                    <div className="hoas-appearance-sidebar" />
                                    <div className="hoas-appearance-main">
                                        <div className="hoas-appearance-topbar" />
                                        <div className="hoas-appearance-widgets">
                                            <div className="hoas-appearance-widget hoas-appearance-widget--dark" />
                                            <div className="hoas-appearance-widget" />
                                            <div className="hoas-appearance-widget" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                    </div>{/* end content-area */}
                </div>{/* end layout-container */}
            </div>{/* end page-wrapper */}
        </HOALayout>
    );
};

export default HOASettings;