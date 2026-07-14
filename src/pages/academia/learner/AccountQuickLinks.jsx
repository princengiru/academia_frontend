const ACCOUNT_LINKS = [
  { id: 'general', label: 'Profile & identity', description: 'Name, phone, photo, and visibility' },
  { id: 'notifications', label: 'Notifications', description: 'Email, SMS, and project alerts' },
  { id: 'password', label: 'Password', description: 'Change your sign-in password' },
  { id: 'twofactor', label: 'Two-factor authentication', description: 'Secure sign-in with OTP' },
  { id: 'payment-mtn', label: 'Payment methods', description: 'MTN, Airtel, and bank cards' },
  { id: 'privacy', label: 'Account privacy', description: 'Deactivate or delete your account' },
];

function AccountQuickLinks({ onOpenSection, notificationEmailEnabled, notificationMessageEnabled, audience = 'learner' }) {
  const channels = [
    notificationEmailEnabled ? 'Email on' : 'Email off',
    notificationMessageEnabled ? 'SMS on' : 'SMS off',
  ];

  const sideHint = audience === 'professor'
    ? 'Identity, billing, security, and notification preferences live on your Account page. This Settings page is for your public teaching and project profile.'
    : 'Identity, billing, security, and notification preferences live on your Account page. This Settings page is for your public learning and project profile.';

  return (
    <article className="learners-settings-panel">
      <div className="learners-settings-panel-head">
        <h3>Account &amp; Security</h3>
      </div>

      <p className="learners-settings-side-hint">
        {sideHint}
      </p>

      <div className="learners-settings-notification-summary">
        <span>Notifications:</span>
        <strong>{channels.join(' · ')}</strong>
        <button type="button" className="learners-settings-read-more" onClick={() => onOpenSection('notifications')}>
          Manage
        </button>
      </div>

      <div className="learners-settings-account-links">
        {ACCOUNT_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className="learners-settings-account-link"
            onClick={() => onOpenSection(link.id)}
          >
            <strong>{link.label}</strong>
            <span>{link.description}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

export default AccountQuickLinks;
