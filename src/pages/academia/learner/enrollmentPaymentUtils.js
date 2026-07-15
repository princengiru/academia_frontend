export function isCourseFree(course) {
  if (!course) return false;
  if (course.isFree || course.is_free) return true;

  const rawPrice = course.rawPrice ?? course.price;
  if (typeof rawPrice === 'string') {
    const normalized = rawPrice.trim().toLowerCase();
    if (normalized === 'free' || normalized === '$0' || normalized === '0') return true;
    const numeric = Number(normalized.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(numeric) && numeric === 0) return true;
  }

  const numericPrice = Number(rawPrice);
  return !Number.isNaN(numericPrice) && numericPrice === 0;
}

export function mapSavedMethodToEnrollmentValue(method) {
  const type = (method.paymentType || '').toLowerCase();
  const provider = (method.paymentProvider || '').toLowerCase();
  if (type === 'bank_card' || type === 'card') return 'credit_card';
  if (type === 'airtel_money' || provider.includes('airtel')) return 'airtel_money';
  if (type === 'mobile_money' || provider.includes('mtn')) return 'mobile_money';
  return 'credit_card';
}

export function getPaymentMethodLabel(value) {
  const labels = {
    free: 'Free enrollment',
    credit_card: 'Bank card',
    mobile_money: 'MTN Mobile Money',
    airtel_money: 'Airtel Money',
  };
  return labels[value] || String(value || 'Payment').replace(/_/g, ' ');
}

// Course prices are stored in USD; this converts for display when the learner's
// system currency is RWF. Adjust the rate here if a live FX source is added.
export const USD_TO_RWF = 1300;

export function getUserCurrency() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const code = String(user.currency || 'USD').toUpperCase();
    return code === 'RWF' ? 'RWF' : 'USD';
  } catch {
    return 'USD';
  }
}

export function convertFromUsd(amountUsd, currency = 'USD') {
  const value = Number(amountUsd) || 0;
  return currency === 'RWF' ? value * USD_TO_RWF : value;
}

// Formats a USD base amount into the learner's currency string (e.g. "$80" / "RWF 104,000").
// Amounts are rounded to whole numbers because the payment gateways cannot
// charge fractional values (no decimals for RWF or the mobile-money rails).
export function formatMoney(amountUsd, currency = 'USD') {
  const value = Math.round(convertFromUsd(amountUsd, currency));
  if (currency === 'RWF') {
    return `RWF ${value.toLocaleString('en-US')}`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

export const ENROLLMENT_ALLOWED_ROLES = ['student', 'learner'];

export function isEnrollmentRoleAllowed(role) {
  const normalized = String(role || '').toLowerCase().trim();
  if (!normalized) return true;
  return ENROLLMENT_ALLOWED_ROLES.includes(normalized);
}

export function hasSavedPaymentMethods(savedMethods) {
  return Array.isArray(savedMethods) && savedMethods.length > 0;
}

export function buildAccountPaymentHref(returnPath, section = 'payment-mtn') {
  const params = new URLSearchParams({ section });
  if (returnPath) params.set('return', returnPath);
  return `/academia/learner/account?${params.toString()}`;
}

export function computeCertificateTotalHours(course) {
  const direct = Number(course?.total_hours ?? course?.totalHours);
  if (!Number.isNaN(direct) && direct > 0) return Math.round(direct);

  const weeks = Number(course?.duration_weeks ?? course?.durationWeeks);
  const hoursPerWeek = Number(course?.required_hours_per_week ?? course?.requiredHoursPerWeek);
  if (!Number.isNaN(weeks) && !Number.isNaN(hoursPerWeek) && weeks > 0 && hoursPerWeek > 0) {
    return Math.round(weeks * hoursPerWeek);
  }

  const studyHours = Number(course?.study_hours ?? course?.completed_hours);
  if (!Number.isNaN(studyHours) && studyHours > 0) return Math.round(studyHours);

  return null;
}

export function buildAvailablePaymentChoices(savedMethods, courseIsFree) {
  if (courseIsFree) {
    return [{ id: 'free', value: 'free', label: 'Free enrollment', hint: 'No payment required' }];
  }

  const choices = [];
  const seen = new Set();

  (savedMethods || []).forEach((method) => {
    const value = mapSavedMethodToEnrollmentValue(method);
    if (seen.has(value)) return;
    seen.add(value);

    const provider = method.paymentProvider || getPaymentMethodLabel(value);
    const detail = method.cardLastFour
      ? `ending ${method.cardLastFour}`
      : (method.phoneNumber || method.accountNumber || '');

    choices.push({
      id: String(method.id),
      value,
      label: getPaymentMethodLabel(value),
      hint: detail ? `${provider} · ${detail}` : provider,
    });
  });

  if (choices.length === 0) {
    return [];
  }

  return choices;
}

export async function fetchSavedPaymentMethods(apiBaseUrl, token) {
  if (!token) return [];

  const res = await fetch(`${apiBaseUrl}/api/profile/payment-methods`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];

  const body = await res.json();
  const methods = body?.data?.paymentMethods;
  if (!Array.isArray(methods)) return [];

  return methods.map((method) => ({
    id: String(method.id),
    paymentType: method.paymentType || method.payment_type || '',
    paymentProvider: method.paymentProvider || method.payment_provider || '',
    accountHolderName: method.accountHolderName || method.account_holder_name || '',
    accountNumber: method.accountNumber || method.account_number || null,
    phoneNumber: method.phoneNumber || method.phone_number || null,
    cardLastFour: method.cardLastFour || method.card_last_four || null,
    cardCvv: method.cardCvv || method.card_cvv || null,
    expiryDate: method.expiryDate || method.expiry_date || null,
    isPrimary: Boolean(method.isPrimary ?? method.is_primary),
  }));
}

export function buildEnrollRequestBody(course, selectedPaymentValue, couponCode) {
  if (isCourseFree(course)) {
    return { payment_method: 'free' };
  }
  const body = { payment_method: selectedPaymentValue || 'credit_card' };
  if (couponCode) body.coupon_code = couponCode;
  return body;
}

export async function enrollInCourse({
  apiBaseUrl,
  token,
  courseId,
  course,
  selectedPaymentValue,
  couponCode,
}) {
  const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildEnrollRequestBody(course, selectedPaymentValue, couponCode)),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to enroll in the course.');
  }
  return data;
}

export function pickDefaultPaymentValue(choices, savedMethods) {
  if (!choices?.length) return 'credit_card';
  if (choices.length === 1) return choices[0].value;

  const primary = (savedMethods || []).find((method) => method.isPrimary);
  if (primary) {
    const primaryValue = mapSavedMethodToEnrollmentValue(primary);
    if (choices.some((choice) => choice.value === primaryValue)) {
      return primaryValue;
    }
  }

  return choices[0].value;
}
