import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CURRENCIES = ['USD', 'EUR', 'GBP', 'RWF'];

const Pricing = ({ courseId, setActiveStep, pushFeedback }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Local State ---
  const [pricing, setPricing] = useState({ 
    isFree: false, 
    amount: 50, 
    currency: CURRENCIES[0] 
  });

  useEffect(() => {
    if (!courseId) return;
    const fetchPricing = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.data) {
          const course = data.data;
          setPricing({
            isFree: parseFloat(course.price) === 0,
            amount: parseFloat(course.price) || 0,
            currency: 'USD'
          });
        }
      } catch (err) {
        console.error("Failed to fetch course pricing details:", err);
      }
    };
    fetchPricing();
  }, [courseId]);

  const { isFree, amount, currency } = pricing;

  // --- Handlers ---
  const handlePricingChange = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  // --- API Submission Flow ---
  const savePricing = async () => {
    // GUARDRAIL: Prevent saving if the user skipped Step 1
    if (!courseId) {
      return pushFeedback('Course ID is missing. Please go back to Step 1 and hit Save.', 'error');
    }

    // Client-side Validation
    if (!isFree && Number(amount) <= 0) {
      return pushFeedback('Paid courses must have a price greater than 0.', 'error');
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const payload = { 
        is_free: isFree, 
        price: isFree ? 0 : Number(amount), 
        subscription_price: isFree ? 0 : Number(amount), // Assuming one-time and sub price match for now
        currency: currency 
      };

      const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save pricing.');
      }

      pushFeedback('Pricing saved successfully.', 'success');
      setActiveStep('review'); // Move to the final step
    } catch (error) { 
      pushFeedback(error.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="prof-step-pane is-active animate-fade-in">
      <div className="prof-step-header">
        <h3>Pricing & Monetization</h3>
        <p>
          Select a pricing model for your course. Free courses drive more enrollments, while paid courses generate revenue.
        </p>
      </div>

      {/* --- PRO PRICING CARDS --- */}
      <div className="prof-field-group">
        <label className="prof-field-label">Select Pricing Model</label>
        
        <div className="prof-pricing-model-grid">
          
          {/* Free Card */}
          <div 
            onClick={() => handlePricingChange('isFree', true)}
            className={`prof-pricing-card ${isFree ? 'is-selected' : ''}`}
          >
            <div className="prof-pricing-card-checkbox">
              <input 
                type="radio" 
                checked={isFree} 
                onChange={() => handlePricingChange('isFree', true)} 
              />
              <span className="prof-pricing-card-dot"></span>
            </div>
            <div className="prof-pricing-card-info">
              <strong>Free Course</strong>
              <span>
                Allow anyone to enroll at no cost. Great for building an audience and capturing leads.
              </span>
            </div>
          </div>

          {/* Paid Card */}
          <div 
            onClick={() => handlePricingChange('isFree', false)}
            className={`prof-pricing-card ${!isFree ? 'is-selected' : ''}`}
          >
            <div className="prof-pricing-card-checkbox">
              <input 
                type="radio" 
                checked={!isFree} 
                onChange={() => handlePricingChange('isFree', false)} 
              />
              <span className="prof-pricing-card-dot"></span>
            </div>
            <div className="prof-pricing-card-info">
              <strong>Paid Course</strong>
              <span>
                Charge a one-time fee for lifetime access. Platform service fees will apply to sales.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- PRICE INPUTS (Only visible if Paid) --- */}
      {!isFree && (
        <div className="prof-paid-details-card animate-fade-in">
          <div className="prof-field-group">
            <label className="prof-field-label">Course Price</label>
            <div className="prof-price-input-wrapper">
              <span className="prof-price-currency-symbol">
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'RF'}
              </span>
              <input 
                className="prof-step-input-premium" 
                type="number" 
                min="1" 
                step="0.01"
                value={amount} 
                onChange={(e) => handlePricingChange('amount', e.target.value)} 
              />
            </div>
          </div>
          
          <div className="prof-field-group">
            <label className="prof-field-label">Currency</label>
            <div className="dropdown prof-generic-dropdown">
              <button className="prof-dropdown-toggle-premium" type="button" data-bs-toggle="dropdown">
                <span className="prof-dropdown-value">{currency}</span>
                <svg className="prof-dropdown-caret-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <ul className="dropdown-menu prof-dropdown-menu-premium">
                {CURRENCIES.map(curr => (
                  <li key={curr}>
                    <button className="dropdown-item" type="button" onClick={() => handlePricingChange('currency', curr)}>
                      {curr}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER ACTIONS --- */}
      <div className="prof-actions-footer-premium">
        <button 
          type="button" 
          className="prof-btn-back-premium" 
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