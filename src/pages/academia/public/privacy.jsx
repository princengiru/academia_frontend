import PublicInfoPage from './PublicInfoPage';

function PrivacyPage() {
  return (
    <PublicInfoPage
      title="Privacy Policy"
      lead="How Gonaraza Academia collects, uses, and protects your information."
    >
      <h2>Information we collect</h2>
      <p>
        We collect account details you provide at sign-up, learning activity needed to deliver courses,
        and technical data such as device and browser information for security and performance.
      </p>
      <h2>How we use information</h2>
      <ul>
        <li>Authenticate you and personalize your learning experience</li>
        <li>Process enrollments, certificates, and instructor payouts</li>
        <li>Improve platform reliability and respond to support requests</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        You may update profile details in your account settings. To request data access or deletion,
        email <a href="mailto:info@gonaraza.com">info@gonaraza.com</a>.
      </p>
    </PublicInfoPage>
  );
}

export default PrivacyPage;
