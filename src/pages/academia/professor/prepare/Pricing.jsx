import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'RWF', symbol: 'RF', label: 'Rwandan Franc' },
];

const Pricing = ({ courseId, setActiveStep, pushFeedback }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricing, setPricing] = useState({
    isFree: false,
    amount: '',
    currency: CURRENCIES[0].code,
  });

  useEffect(() => {
    if (!courseId) return;
    const fetchPricing = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const course = data.data;
          const price = parseFloat(course.price);
          const isFree = !price || price === 0;
          setPricing({
            isFree,
            amount: isFree ? '' : String(price),
            currency: course.currency || CURRENCIES[0].code,
          });
        }
      } catch (err) {
        console.error('Failed to fetch course pricing details:', err);
      }
    };
    fetchPricing();
  }, [courseId]);

  const { isFree, amount, currency } = pricing;
  const activeCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const handlePricingChange = (field, value) => {
    setPricing((prev) => ({ ...prev, [field]: value }));
  };

  const savePricing = async () => {
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }

    if (!isFree && Number(amount) <= 0) {
      return pushFeedback('Paid courses must have a price greater than 0.', 'error');
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        is_free: isFree,
        price: isFree ? 0 : Number(amount),
        subscription_price: isFree ? 0 : Number(amount),
        currency,
      };

      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save pricing.');
      }

      pushFeedback('Pricing saved successfully.', 'success');
      setActiveStep('review');
    } catch (error) {
      pushFeedback(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      <div className="prof-field-group">
        <label className="prof-field-label">Access type</label>
        <div className="prof-pricing-access" role="radiogroup" aria-label="Access type">
          <button
            type="button"
            role="radio"
            aria-checked={isFree}
            className={`prof-pricing-access__option ${isFree ? 'is-selected' : ''}`}
            onClick={() => handlePricingChange('isFree', true)}
          >
            <span className="prof-pricing-access__title">Free</span>
            <span className="prof-pricing-access__hint">Anyone can enroll at no cost</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={!isFree}
            className={`prof-pricing-access__option ${!isFree ? 'is-selected' : ''}`}
            onClick={() => handlePricingChange('isFree', false)}
          >
            <span className="prof-pricing-access__title">Paid</span>
            <span className="prof-pricing-access__hint">One-time fee for lifetime access</span>
          </button>
        </div>
      </div>

      {!isFree && (
        <div className="prof-pricing-amount animate-fade-in">
          <div className="prof-grid-two">
            <div className="prof-field-group">
              <label className="prof-field-label" htmlFor="course-price-amount">
                Course price
              </label>
              <div className="prof-price-input-wrapper">
                <span className="prof-price-currency-symbol" aria-hidden="true">
                  {activeCurrency.symbol}
                </span>
                <input
                  id="course-price-amount"
                  className="prof-step-input-premium"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handlePricingChange('amount', e.target.value)}
                />
              </div>
            </div>

            <div className="prof-field-group">
              <label className="prof-field-label">Currency</label>
              <div className="dropdown prof-generic-dropdown">
                <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown">
                  <span className="prof-dropdown-value">
                    {activeCurrency.code}
                    <span className="prof-pricing-currency-meta"> · {activeCurrency.label}</span>
                  </span>
                  <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <ul className="dropdown-menu prof-dropdown-menu-premium">
                  {CURRENCIES.map((curr) => (
                    <li key={curr.code}>
                      <button
                        className="dropdown-item"
                        type="button"
                        onClick={() => handlePricingChange('currency', curr.code)}
                      >
                        {curr.code} · {curr.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="prof-pricing-note">
            Learners pay once for lifetime access. Platform service fees apply to sales.
          </p>
        </div>
      )}

      {isFree && (
        <p className="prof-pricing-note">
          This course will appear as free. You can switch to paid anytime before publishing.
        </p>
      )}

      <div className="prof-actions-footer-premium">
        <button
          type="button"
          className="prof-btn-primary-premium"
          onClick={() => setActiveStep('weeks')}
        >
          Back to Curriculum
        </button>
        <button
          type="button"
          className="prof-btn-primary-premium"
          onClick={savePricing}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Pricing & Review'}
        </button>
      </div>
    </div>
  );
};

export default Pricing;
