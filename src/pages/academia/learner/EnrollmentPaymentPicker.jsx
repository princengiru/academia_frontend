import './enrollment-payment.css';

function EnrollmentPaymentPicker({
  choices,
  value,
  onChange,
  loading = false,
  accountHref = '/learner/account?section=payment-mtn',
  requiresPaymentSetup = false,
}) {
  if (loading) {
    return (
      <div className="learners-enrollment-payment-picker">
        <p className="learners-enrollment-payment-label">Loading payment options…</p>
      </div>
    );
  }

  if (requiresPaymentSetup) {
    return (
      <div className="learners-enrollment-payment-picker">
        <p className="learners-enrollment-payment-note">
          Add a payment method in{' '}
          <a className="learners-enrollment-payment-manage" href={accountHref}>
            Account settings
          </a>
          {' '}to enroll in this paid course.
        </p>
      </div>
    );
  }

  if (!choices?.length) return null;

  if (choices.length === 1 && choices[0].value === 'free') {
    return null;
  }

  return (
    <div className="learners-enrollment-payment-picker">
      <p className="learners-enrollment-payment-label">Pay with</p>
      <div className="learners-enrollment-payment-options">
        {choices.map((choice) => (
          <label
            key={choice.id}
            className={`learners-enrollment-payment-option ${value === choice.value ? 'is-selected' : ''}`}
          >
            <input
              type="radio"
              name="enrollment-payment"
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <span className="learners-enrollment-payment-option-copy">
              <strong>{choice.label}</strong>
              {choice.hint ? <small>{choice.hint}</small> : null}
            </span>
          </label>
        ))}
      </div>
      <a className="learners-enrollment-payment-manage" href={accountHref}>
        Manage payment methods
      </a>
    </div>
  );
}

export default EnrollmentPaymentPicker;
