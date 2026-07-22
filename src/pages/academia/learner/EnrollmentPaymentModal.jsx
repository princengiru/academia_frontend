import { useEffect, useMemo, useState } from 'react';
import hoamtn from '../../../assets/icons/hoamtn.svg';
import hoaairtel from '../../../assets/icons/hoaairtel.svg';
import hoabankcards from '../../../assets/icons/hoabankcards.svg';
import visaPay from '../../../assets/icons/VISA-pay.svg';
import masterPay from '../../../assets/icons/MASTER-PAY.svg';
import { formatMoney, convertFromUsd, fetchUsdToRwfRate } from './enrollmentPaymentUtils';
import './EnrollmentPaymentModal.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GATEWAYS = [
  { id: 'mtn', label: 'MTN Mobile Money', icon: hoamtn },
  { id: 'airtel', label: 'Airtel Money', icon: hoaairtel },
  { id: 'card', label: 'Bank Cards', icon: hoabankcards },
];

const HELPER_TEXT = 'This number is used for payments and pop-up transfer';
const CARD_HELPER_TEXT = 'This card is used for payments and pop-up transfer';

// ── Helpers ──
const digitsOnly = (s) => (s || '').replace(/\D/g, '');

const detectCardBrand = (value) => {
  const digits = digitsOnly(value);
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
};

const formatCardNumber = (value, brand) => {
  const digits = digitsOnly(value).slice(0, brand === 'amex' ? 15 : 16);
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const out = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + size));
    i += size;
  }
  return out.join(' ');
};

// Passes the Luhn checksum used by all major card brands.
const luhnValid = (num) => {
  const d = digitsOnly(num);
  if (d.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = parseInt(d[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

// Rwanda mobile numbers: local format, start with 07, exactly 10 digits.
const isValidLocalPhone = (value) => /^07\d{8}$/.test(digitsOnly(value));

const isValidExpiry = (value) => {
  const m = /^(\d{2})\/(\d{2})$/.exec((value || '').trim());
  if (!m) return false;
  const mm = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if (yy < curYY) return false;
  if (yy === curYY && mm < curMM) return false;
  return true;
};

const isValidName = (value) => (value || '').trim().length >= 2;

const InfoDot = ({ tip }) => (
  <span className="epm-info" title={tip} aria-label={tip} role="img">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  </span>
);

const FieldLabel = ({ children, required, tip }) => (
  <label className="epm-label">
    {children}
    {required ? <span className="epm-required">*</span> : null}
    {tip ? <InfoDot tip={tip} /> : null}
  </label>
);

function EnrollmentPaymentModal({
  isOpen,
  onClose,
  courseId,
  courseIdLabel = '—',
  amountUsd = 0,
  currency = 'RWF',
  payNumberHint = '250700000000',
  supportEmail = 'support@gonaraza.com',
  defaultGateway = 'card',
  savedMethods = [],
  processing = false,
  onPay,
}) {
  const [gateway, setGateway] = useState(defaultGateway);

  // Mobile money (MTN / Airtel) — number only
  const [momoNumber, setMomoNumber] = useState('');
  const [phoneMasked, setPhoneMasked] = useState(false);

  // Bank card
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardBrand, setCardBrand] = useState('unknown');
  const [cardNumberMasked, setCardNumberMasked] = useState(false);
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState('idle'); // idle | checking | valid | invalid
  const [couponMsg, setCouponMsg] = useState('');
  const [discountUsd, setDiscountUsd] = useState(0);
  const [saveCard, setSaveCard] = useState(true);
  const [fxRate, setFxRate] = useState(null);

  const basePriceUsd = Number(amountUsd) || 0;
  const effectiveUsd = couponState === 'valid'
    ? Math.max(0, basePriceUsd - discountUsd)
    : basePriceUsd;

  // MoMo / Airtel only settle in RWF — always show RWF as the charge amount.
  // If the learner's preference is USD, keep the USD figure in parentheses.
  const isMomoGateway = gateway === 'mtn' || gateway === 'airtel';
  const displayCurrency = isMomoGateway ? 'RWF' : currency;
  const rwfText = formatMoney(effectiveUsd, 'RWF', fxRate || undefined);
  const usdText = formatMoney(effectiveUsd, 'USD', fxRate || undefined);
  const amountText = isMomoGateway
    ? (String(currency).toUpperCase() === 'USD' ? `${rwfText} (${usdText})` : rwfText)
    : formatMoney(effectiveUsd, displayCurrency, fxRate || undefined);

  // Gateway charge amount is always whole RWF for MoMo; cards follow preference for now.
  const payAmount = Math.round(
    convertFromUsd(effectiveUsd, isMomoGateway ? 'RWF' : currency, fxRate || undefined)
  );
  const payCurrency = isMomoGateway ? 'RWF' : currency;

  useEffect(() => {
    if (isOpen) setGateway(defaultGateway);
  }, [isOpen, defaultGateway]);

  // Pull live USD→RWF whenever the modal opens (for accurate RWF display).
  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    fetchUsdToRwfRate(API_BASE_URL).then((rate) => {
      if (!cancelled) setFxRate(rate);
    });
    return () => { cancelled = true; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // The saved method that matches the currently selected gateway (primary first).
  const matchedMethod = useMemo(() => {
    const list = Array.isArray(savedMethods) ? savedMethods : [];
    const pick = (pred) => list
      .filter(pred)
      .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))[0] || null;
    if (gateway === 'mtn') return pick((m) => m.paymentType === 'mobile_money' || /mtn/i.test(m.paymentProvider || ''));
    if (gateway === 'airtel') return pick((m) => m.paymentType === 'airtel_money' || /airtel/i.test(m.paymentProvider || ''));
    return pick((m) => m.paymentType === 'bank_card' || m.paymentType === 'card');
  }, [gateway, savedMethods]);

  // Preload the saved info whenever the user switches gateway / opens the modal.
  useEffect(() => {
    if (!isOpen) return;
    if (gateway === 'card') {
      if (matchedMethod) {
        const display = matchedMethod.accountNumber
          || (matchedMethod.cardLastFour ? `**** **** **** ${matchedMethod.cardLastFour}` : '');
        setCardName(matchedMethod.accountHolderName || '');
        setCardNumber(display);
        setCardBrand(detectCardBrand(display));
        setExpiry(matchedMethod.expiryDate || '');
        setCvv('');
        setCardNumberMasked(Boolean(display));
      } else {
        setCardName(''); setCardNumber(''); setCardBrand('unknown');
        setExpiry(''); setCvv('');
        setCardNumberMasked(false);
      }
    } else if (matchedMethod) {
      // Show the saved number as the 10-digit local form (handles both
      // 0788123456 and 250788123456 storage).
      const stored = digitsOnly(matchedMethod.phoneNumber).slice(-10);
      setMomoNumber(stored);
      // Accept the saved number as-is; only re-validate once the user edits it.
      setPhoneMasked(Boolean(stored) && !isValidLocalPhone(stored));
    } else {
      setMomoNumber(''); setPhoneMasked(false);
    }
  }, [gateway, matchedMethod, isOpen]);

  // ── Per-field validity (a prefilled/masked saved value counts as valid until edited) ──
  const phoneValid = (phoneMasked && momoNumber.trim().length > 0) || isValidLocalPhone(momoNumber);
  const cardNumberValid = (cardNumberMasked && cardNumber.trim().length > 0)
    || (() => {
      const d = digitsOnly(cardNumber);
      const expected = cardBrand === 'amex' ? 15 : 16;
      return d.length === expected && luhnValid(d);
    })();
  const cvvValid = /^\d{3,4}$/.test(cvv);
  const expiryValid = isValidExpiry(expiry);

  const formValid = gateway === 'card'
    ? isValidName(cardName) && cardNumberValid && expiryValid && cvvValid
    : phoneValid;

  // Save-card toggle only makes sense for a NEW card. Saved cards are already
  // stored; MTN/Airtel numbers are managed on the account page.
  const cardIsSaved = gateway === 'card' && Boolean(matchedMethod) && cardNumberMasked;
  const showSaveToggle = gateway === 'card' && !cardIsSaved;

  if (!isOpen) return null;

  // Inline error text — only shown once the user has typed something invalid.
  const phoneError = !phoneMasked && momoNumber.length > 0 && !isValidLocalPhone(momoNumber)
    ? 'Enter a valid number starting with 07 (10 digits).' : '';
  const cardError = !cardNumberMasked && digitsOnly(cardNumber).length > 0 && !cardNumberValid
    ? 'Enter a valid card number.' : '';
  const expiryError = expiry.length > 0 && !expiryValid ? 'Invalid or expired date.' : '';
  const cvvError = cvv.length > 0 && !/^\d{3,4}$/.test(cvv) ? 'CVV must be 3–4 digits.' : '';

  const resetCoupon = () => {
    setCouponState('idle');
    setCouponMsg('');
    setDiscountUsd(0);
  };

  const applyCoupon = async () => {
    const code = coupon.trim();
    if (!code) { resetCoupon(); return; }
    if (!courseId) {
      setCouponState('invalid');
      setCouponMsg('Unable to validate coupon right now.');
      return;
    }
    setCouponState('checking');
    setCouponMsg('');
    try {
      const url = `${API_BASE_URL}/api/invoices/preview?course_id=${encodeURIComponent(courseId)}&coupon_code=${encodeURIComponent(code)}`;
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));
      const data = body?.data?.data || body?.data || body;
      if (res.ok && data && data.coupon) {
        // Payable = course price − coupon (API total matches the displayed course price).
        const payable = Number(data.total);
        const discount = Number.isFinite(payable)
          ? Math.max(0, basePriceUsd - payable)
          : (Number(data.discount_amount) || 0);
        setDiscountUsd(discount);
        setCouponState('valid');
        setCouponMsg('Coupon code valid');
      } else {
        setDiscountUsd(0);
        setCouponState('invalid');
        setCouponMsg(body?.message || 'Invalid coupon code.');
      }
    } catch {
      setDiscountUsd(0);
      setCouponState('invalid');
      setCouponMsg('Could not validate coupon. Try again.');
    }
  };

  const handlePay = () => {
    if (!formValid || processing) return;
    const payload = {
      gateway,
      coupon: couponState === 'valid' ? coupon.trim() : null,
      // Only a brand-new card can be saved from here.
      saveCard: showSaveToggle ? saveCard : false,
      paymentMethodId: matchedMethod?.id || null,
      amountUsd: effectiveUsd,
      payAmount,
      payCurrency,
      ...(gateway === 'card'
        ? { cardName, cardNumber, cardBrand, expiry, cvv, usingSavedCard: cardNumberMasked }
        : { phoneNumber: momoNumber, usingSavedNumber: phoneMasked }),
    };
    onPay?.(payload);
  };

  const handleExpiryChange = (e) => {
    const raw = digitsOnly(e.target.value).slice(0, 4);
    const next = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    setExpiry(next);
  };

  return (
    <div
      className="epm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Course payment"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="epm-modal">
        <button type="button" className="epm-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Gateway tabs */}
        <div className="epm-tabs">
          {GATEWAYS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`epm-tab ${gateway === g.id ? 'is-active' : ''}`}
              onClick={() => setGateway(g.id)}
            >
              <span className="epm-tab-icon"><img src={g.icon} alt={g.label} /></span>
              <span className="epm-tab-label">{g.label}</span>
              {gateway === g.id && <span className="epm-tab-underline" />}
            </button>
          ))}
        </div>

        <div className="epm-card">
          <div className="epm-summary">
            <span className="epm-summary-item">Course Id <b>: {courseIdLabel}</b></span>
            <span className="epm-summary-item epm-summary-item--right">Total Amount <b>: {amountText}</b></span>
          </div>

          {/* Mobile money form (MTN / Airtel) — phone number only */}
          {gateway !== 'card' && (
            <div className="epm-field">
              <FieldLabel required tip={gateway === 'mtn' ? 'Rwanda MTN numbers start with 078 or 079.' : 'Rwanda Airtel numbers start with 073 or 072.'}>Phone Number</FieldLabel>
              <input
                type="tel"
                inputMode="numeric"
                className={phoneError ? 'is-invalid' : ''}
                value={momoNumber}
                onChange={(e) => {
                  setPhoneMasked(false);
                  setMomoNumber(digitsOnly(e.target.value).slice(0, 10));
                }}
                placeholder={gateway === 'mtn' ? '0788 000 000' : '0730 000 000'}
                maxLength={phoneMasked ? undefined : 10}
              />
              {phoneError ? <p className="epm-error">{phoneError}</p> : <p className="epm-help">{HELPER_TEXT}</p>}
            </div>
          )}

          {/* Bank card form */}
          {gateway === 'card' && (
            <>
              <div className="epm-field">
                <FieldLabel required tip="Use the name exactly as it appears on the card.">Name On Card</FieldLabel>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Max Smith"
                />
              </div>

              <div className="epm-field">
                <FieldLabel required tip="Card brand is detected automatically as you type.">Card Number</FieldLabel>
                <div className="epm-input-icon">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cardError ? 'is-invalid' : ''}
                    value={cardNumber}
                    onChange={(e) => {
                      const raw = digitsOnly(e.target.value);
                      const brand = detectCardBrand(raw);
                      setCardNumberMasked(false);
                      setCardBrand(brand);
                      setCardNumber(formatCardNumber(raw, brand));
                    }}
                    placeholder="1107 0000 0000 00"
                  />
                  <div className="epm-card-brands">
                    {(cardBrand === 'visa' || cardBrand === 'unknown') && <img src={visaPay} alt="Visa" />}
                    {(cardBrand === 'mastercard' || cardBrand === 'unknown') && <img src={masterPay} alt="Mastercard" />}
                    <span className={`epm-amex ${cardBrand === 'amex' || cardBrand === 'unknown' ? '' : 'is-hidden'}`}>AMEX</span>
                  </div>
                </div>
                {cardError ? <p className="epm-error">{cardError}</p> : <p className="epm-help">{CARD_HELPER_TEXT}</p>}
              </div>

              <div className="epm-row">
                <div className="epm-field epm-field--grow">
                  <FieldLabel required tip="Expiry date printed on the card, e.g. 10/27.">Expiration Date</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={expiryError ? 'is-invalid' : ''}
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                  {expiryError ? <p className="epm-error">{expiryError}</p> : null}
                </div>

                <div className="epm-field epm-field--cvv">
                  <FieldLabel required tip="3 or 4 digit security code on the back of your card.">CVV</FieldLabel>
                  <div className="epm-input-icon">
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cvvError ? 'is-invalid' : ''}
                      value={cvv}
                      onChange={(e) => {
                        setCvv(digitsOnly(e.target.value).slice(0, 4));
                      }}
                      placeholder="3344"
                    />
                    <div className="epm-card-brands">
                      <span className="epm-cvv-icon" aria-hidden="true" />
                    </div>
                  </div>
                  {cvvError ? <p className="epm-error">{cvvError}</p> : null}
                </div>
              </div>
            </>
          )}

          {/* Coupon code (collapsible) */}
          <div className="epm-coupon-row">
            <button
              type="button"
              className={`epm-coupon-toggle ${couponOpen ? 'is-open' : ''}`}
              onClick={() => setCouponOpen((v) => !v)}
            >
              <span>Coupon Code</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
          {couponOpen && (
            <div className="epm-field epm-coupon-field">
              <div className="epm-coupon-input">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value.toUpperCase()); if (couponState !== 'idle') resetCoupon(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                  placeholder="Enter coupon code"
                />
                <button
                  type="button"
                  className="epm-coupon-apply"
                  onClick={applyCoupon}
                  disabled={couponState === 'checking' || !coupon.trim()}
                >
                  {couponState === 'checking' ? 'Checking…' : 'Apply'}
                </button>
              </div>
              {couponState === 'valid' ? <p className="epm-coupon-ok">{couponMsg}</p> : null}
              {couponState === 'invalid' ? <p className="epm-error">{couponMsg}</p> : null}
            </div>
          )}

          {/* Save card toggle — only for a new (unsaved) card */}
          {showSaveToggle && (
            <div className="epm-save-row">
              <div className="epm-save-copy">
                <strong>Save Card for further billing?</strong>
                <span>If you need more info, please check budget planning</span>
              </div>
              <div className="epm-save-toggle">
                <button
                  type="button"
                  role="switch"
                  aria-checked={saveCard}
                  className={`epm-switch ${saveCard ? 'is-on' : ''}`}
                  onClick={() => setSaveCard((v) => !v)}
                >
                  <span className="epm-switch-knob" />
                </button>
                <span className="epm-save-label">Save Card</span>
              </div>
            </div>
          )}

          {/* Pay */}
          <button type="button" className="epm-pay" onClick={handlePay} disabled={processing || !formValid}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>{processing ? 'Waiting for phone approval…' : `Pay  ${amountText}`}</span>
          </button>

          <div className="epm-divider" />

          {/* Read this carefully */}
          <div className="epm-notice">
            <div className="epm-notice-head">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4002B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Read this carefully</span>
            </div>
            <ol className="epm-notice-list">
              <li>Ensure that <b>{payNumberHint}</b> is your number and is sufficiently funded with mentioned amount.</li>
              <li>Check if the amount specified matches the batch purchased</li>
              <li>After Check if you received your <b>Invoice</b> and <b>Download it</b> as proof of payment</li>
              <li>You can request EBM after checking your invoice</li>
            </ol>
          </div>

          <p className="epm-footer">
            Payments are made due date to avoid any late fees. and this is a company proof of payment if there's any problem, please report this immediately to our support.
            <br />
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EnrollmentPaymentModal;
