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

// Course prices are stored in USD; MoMo charges whole RWF using a live FX rate.
export const USD_TO_RWF_FALLBACK = 1300;

let cachedFx = { rate: USD_TO_RWF_FALLBACK, fetchedAt: 0 };

export async function fetchUsdToRwfRate(apiBaseUrl) {
  const now = Date.now();
  if (cachedFx.rate && now - cachedFx.fetchedAt < 30 * 60 * 1000) {
    return cachedFx.rate;
  }
  try {
    const res = await fetch(`${apiBaseUrl}/api/payments/fx-rate`);
    if (res.ok) {
      const body = await res.json();
      const rate = Number(body?.data?.rate);
      if (Number.isFinite(rate) && rate > 0) {
        cachedFx = { rate, fetchedAt: now };
        return rate;
      }
    }
  } catch {
    // fall through
  }
  return cachedFx.rate || USD_TO_RWF_FALLBACK;
}

export function getUserCurrency() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const code = String(user.currency || 'RWF').toUpperCase();
    return code === 'USD' ? 'USD' : 'RWF';
  } catch {
    return 'RWF';
  }
}

export function convertFromUsd(amountUsd, currency = 'USD', rate = cachedFx.rate || USD_TO_RWF_FALLBACK) {
  const value = Number(amountUsd) || 0;
  return currency === 'RWF' ? value * rate : value;
}

// Formats a USD base amount into the learner's currency string (e.g. "$80" / "RWF 104,000").
// Amounts are rounded to whole numbers because the payment gateways cannot
// charge fractional values (no decimals for RWF or the mobile-money rails).
export function formatMoney(amountUsd, currency = 'USD', rate = cachedFx.rate || USD_TO_RWF_FALLBACK) {
  const value = Math.round(convertFromUsd(amountUsd, currency, rate));
  if (currency === 'RWF') {
    return `RWF ${value.toLocaleString('en-US')}`;
  }
  return `$${value.toLocaleString('en-US')}`;
}

/** @deprecated use fetchUsdToRwfRate — kept so older imports don't break */
export const USD_TO_RWF = USD_TO_RWF_FALLBACK;

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
    throw new Error(data?.message || data?.error?.message || 'Failed to enroll in the course.');
  }
  return data;
}

/**
 * Start / retry a MoMo enrollment payment (MTN or Airtel).
 * Returns invoice_uuid + pending status — then poll until successful/failed.
 */
export async function initiateEnrollmentPayment({
  apiBaseUrl,
  token,
  courseId,
  gateway, // 'mtn' | 'airtel'
  phone,
  couponCode,
}) {
  const res = await fetch(`${apiBaseUrl}/api/payments/enrollment/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      course_id: courseId,
      gateway,
      phone,
      coupon_code: couponCode || null,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || body?.error?.message || 'Payment initiation failed');
  }
  return body?.data || body;
}

export async function getEnrollmentPaymentStatus({ apiBaseUrl, token, invoiceUuid }) {
  const res = await fetch(
    `${apiBaseUrl}/api/payments/enrollment/status?invoice_uuid=${encodeURIComponent(invoiceUuid)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || body?.error?.message || 'Could not check payment status');
  }
  return body?.data || body;
}

/**
 * Poll until successful / failed / timeout (default ~2 minutes).
 */
export async function waitForEnrollmentPayment({
  apiBaseUrl,
  token,
  invoiceUuid,
  intervalMs = 4000,
  timeoutMs = 120000,
  onTick,
}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const status = await getEnrollmentPaymentStatus({ apiBaseUrl, token, invoiceUuid });
    onTick?.(status);
    if (status.status === 'successful') return status;
    if (status.status === 'failed') {
      const err = new Error('Payment failed. Please try again.');
      err.status = status;
      throw err;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  const timeoutErr = new Error('Payment is taking longer than expected. If you approved on your phone, refresh in a moment.');
  timeoutErr.code = 'PAYMENT_TIMEOUT';
  throw timeoutErr;
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

export async function fetchEnrollmentStatus({ apiBaseUrl, token, courseId }) {
  const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}/enrollment-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || body?.error?.message || 'Could not check enrollment status.');
  }
  return body?.data ?? body;
}

export async function unenrollFromCourse({ apiBaseUrl, token, courseId, reason }) {
  const res = await fetch(`${apiBaseUrl}/api/courses/${courseId}/unenroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason: reason || null }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.message || body?.error?.message || 'Failed to unenroll from course.');
  }
  return body?.data ?? body;
}
