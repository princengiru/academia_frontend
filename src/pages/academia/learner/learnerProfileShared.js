export const COUNTRY_OPTIONS = [
  { code: 'RW', name: 'Rwanda' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'AE', name: 'United Arab Emirates' },
];

export const formatAddressDisplay = ({ address, city, state, country, postcode } = {}) => {
  const countryLabel = COUNTRY_OPTIONS.find((item) => item.code === country)?.name || country;
  const parts = [address, city, state, countryLabel, postcode].filter((part) => String(part || '').trim());
  return parts.join(', ') || 'Address not set';
};

export const formatLocationDisplay = ({ city, country } = {}) => {
  const countryLabel = COUNTRY_OPTIONS.find((item) => item.code === country)?.name || country;
  const parts = [city, countryLabel].filter((part) => String(part || '').trim());
  return parts.join(', ') || 'Location not set';
};

export const formatRoleLabel = (role) => {
  if (!role || role === 'student') return 'Learner';
  if (role === 'instructor') return 'Instructor';
  if (role === 'admin') return 'Admin';
  return String(role).charAt(0).toUpperCase() + String(role).slice(1).replace(/_/g, ' ');
};

export const formatExperienceLabel = (years) => {
  const value = Number(years);
  if (!Number.isFinite(value) || value <= 0) return 'Experience not set';
  return `${value} year${value === 1 ? '' : 's'} experience`;
};

export const buildAddressDraftFromUser = (user) => ({
  address: user.address || '',
  country: user.country && String(user.country).trim() ? user.country : 'RW',
  state: user.state || '',
  city: user.city || '',
  postcode: user.postcode || '',
});

export const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;

export const LANGUAGE_OPTIONS = [
  { value: 'en-us', label: 'American English', icon: '🇺🇸' },
  { value: 'en-gb', label: 'British English', icon: '🇬🇧' },
  { value: 'fr-fr', label: 'French', icon: '🇫🇷' },
];

export const TIMEZONE_OPTIONS = [
  { value: 'gmt-5-est', label: 'GMT -5:00 - Eastern Time (US & Canada)' },
  { value: 'gmt+2-east-africa', label: 'GMT +2:00 - East Africa Time' },
  { value: 'gmt+1-cet', label: 'GMT +1:00 - Central European Time' },
];

export const CURRENCY_OPTIONS = [
  { value: 'usd', label: 'United States Dollar (USD)', icon: 'USD' },
  { value: 'rwf', label: 'Rwandan Franc (RWF)', icon: 'RWF' },
  { value: 'eur', label: 'Euro (EUR)', icon: 'EUR' },
];

export const formatRwandaPhoneNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10);
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

export const mapLanguageFromUser = (language) => {
  if (language === 'fr') return 'fr-fr';
  if (language === 'en') return 'en-us';
  return 'en-us';
};

export const mapLanguageToApi = (language) => (String(language || '').startsWith('fr') ? 'fr' : 'en');

export const mapTimezoneFromUser = (timezone) => timezone || 'gmt-5-est';

export const mapCurrencyFromUser = (currency) => String(currency || 'usd').toLowerCase();

export const normalizeSkills = (value) => {
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
};

export const buildBasicDraftFromUser = (user) => ({
  name: user.name || user.email || 'Learner',
  phone: user.phone ? formatRwandaPhoneNumber(String(user.phone)) : '',
  role: user.role || 'student',
  visibility: user.visibility || 'public',
  bio: user.bio || '',
  jobTitle: user.job_title || '',
  yearsExperience: user.years_experience ?? '',
  ...buildAddressDraftFromUser(user),
  availableToHire: Boolean(user.available_to_hire),
  emailNotifications: user.email_notifications === undefined || user.email_notifications === null
    ? true
    : Boolean(user.email_notifications),
  skills: normalizeSkills(user.skills),
});

export const buildProjectProfileDraftFromUser = (user) => ({
  jobTitle: user.job_title || '',
  yearsExperience: user.years_experience ?? '',
  bio: user.bio || '',
  availableToHire: Boolean(user.available_to_hire),
  skills: normalizeSkills(user.skills),
});

export const serializeProjectProfileDraft = (draft) => JSON.stringify({
  jobTitle: draft.jobTitle,
  yearsExperience: draft.yearsExperience,
  bio: draft.bio,
  availableToHire: draft.availableToHire,
  skills: draft.skills,
});

export const buildPreferencesDraftFromUser = (user) => ({
  language: mapLanguageFromUser(user.language),
  timezone: mapTimezoneFromUser(user.timezone),
  currency: mapCurrencyFromUser(user.currency),
  showListNames: Boolean(user.show_list_names),
  showLinkedTaskNames: user.show_linked_task_names !== false,
  emailVisibility: Boolean(user.email_visibility),
});

export const serializeBasicDraft = (draft) => JSON.stringify({
  name: draft.name,
  phone: draft.phone,
  visibility: draft.visibility,
  bio: draft.bio,
  address: draft.address,
  country: draft.country,
  state: draft.state,
  city: draft.city,
  postcode: draft.postcode,
  availableToHire: draft.availableToHire,
  emailNotifications: draft.emailNotifications,
  skills: draft.skills,
});

export const serializePreferencesDraft = (draft) => JSON.stringify(draft);
