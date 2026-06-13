import React, { useState } from 'react';

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
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0F172A', marginBottom: '8px' }}>Pricing & Monetization</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Select a pricing model for your course. Free courses drive more enrollments, while paid courses generate revenue.
        </p>
      </div>

      {/* --- PRO PRICING CARDS --- */}
      <div className="prof-field-group">
        <label style={{ display: 'block', fontWeight: 500, color: '#0F172A', marginBottom: '12px' }}>
          Select Pricing Model
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '2rem' }}>
          
          {/* Free Card */}
          <div 
            onClick={() => handlePricingChange('isFree', true)}
            style={{ 
              border: `2px solid ${isFree ? '#450468' : '#E2E8F0'}`, 
              background: isFree ? '#F3E8FF' : '#fff', 
              borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'flex-start', gap: '12px'
            }}
          >
            <input 
              type="radio" 
              checked={isFree} 
              onChange={() => handlePricingChange('isFree', true)} 
              style={{ accentColor: '#450468', marginTop: '4px', transform: 'scale(1.2)' }} 
            />
            <div>
              <strong style={{ display: 'block', color: '#0F172A', fontSize: '1.05rem', marginBottom: '4px' }}>Free Course</strong>
              <span style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.4', display: 'block' }}>
                Allow anyone to enroll at no cost. Great for building an audience and capturing leads.
              </span>
            </div>
          </div>

          {/* Paid Card */}
          <div 
            onClick={() => handlePricingChange('isFree', false)}
            style={{ 
              border: `2px solid ${!isFree ? '#450468' : '#E2E8F0'}`, 
              background: !isFree ? '#F3E8FF' : '#fff', 
              borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'flex-start', gap: '12px'
            }}
          >
            <input 
              type="radio" 
              checked={!isFree} 
              onChange={() => handlePricingChange('isFree', false)} 
              style={{ accentColor: '#450468', marginTop: '4px', transform: 'scale(1.2)' }} 
            />
            <div>
              <strong style={{ display: 'block', color: '#0F172A', fontSize: '1.05rem', marginBottom: '4px' }}>Paid Course</strong>
              <span style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.4', display: 'block' }}>
                Charge a one-time fee for lifetime access. Platform service fees will apply to sales.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- PRICE INPUTS (Only visible if Paid) --- */}
      {!isFree && (
        <div className="prof-grid-two prof-basic-grid animate-fade-in" style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div className="prof-field-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 500, color: '#0F172A' }}>Course Price</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontWeight: 600 }}>
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'RF'}
              </span>
              <input 
                className="learners-settings-field-control prof-step-input" 
                type="number" 
                min="1" 
                step="0.01"
                value={amount} 
                onChange={(e) => handlePricingChange('amount', e.target.value)} 
                style={{ paddingLeft: '40px', fontSize: '1.1rem', fontWeight: 500 }}
              />
            </div>
          </div>
          
          <div className="prof-field-group" style={{ marginBottom: 0 }}>
            <label style={{ fontWeight: 500, color: '#0F172A' }}>Currency</label>
            <div className="dropdown prof-generic-dropdown">
              <button className="learners-settings-field-control dropdown-toggle prof-dropdown-toggle prof-step-input" type="button" data-bs-toggle="dropdown" style={{ background: '#fff' }}>
                <span className="prof-dropdown-value" style={{ fontSize: '1.1rem', fontWeight: 500 }}>{currency}</span>
                <img className="prof-dropdown-caret" src="/assets/icons/drop.svg" alt="" />
              </button>
              <ul className="dropdown-menu prof-dropdown-menu">
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
      <div className="prof-lesson-actions-row" style={{ display: 'flex', gap: '16px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        <button 
          type="button" 
          className="btn btn-outline-secondary" 
          onClick={() => setActiveStep('weeks')} 
          style={{ flex: 1, padding: '14px', borderRadius: '8px', fontWeight: 600, transition: 'all 0.2s ease' }}
        >
          Back to Curriculum
        </button>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={savePricing} 
          disabled={isSubmitting} 
          style={{ flex: 3, background: '#450468', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 600, transition: 'background 0.2s ease' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Pricing & Review'}
        </button>
      </div>
    </div>
  );
};

export default Pricing;