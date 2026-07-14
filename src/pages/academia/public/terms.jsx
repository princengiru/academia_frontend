import PublicInfoPage from './PublicInfoPage';

function TermsPage() {
  return (
    <PublicInfoPage
      title="Terms and Conditions"
      lead="Last updated: July 2026. These terms govern your use of Gonaraza Academia."
    >
      <h2>Using the platform</h2>
      <p>
        By creating an account or browsing Academia content, you agree to use the service lawfully and
        respect instructor content, learner privacy, and community guidelines.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure and for activity under your account.
        Misuse, harassment, or attempts to circumvent access controls may result in suspension.
      </p>
      <h2>Courses and payments</h2>
      <p>
        Paid enrollments, refunds, and billing disputes are handled according to the checkout terms shown
        at purchase and our refund policy published on this site.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{' '}
        <a href="mailto:support@gonaraza.com">support@gonaraza.com</a>.
      </p>
    </PublicInfoPage>
  );
}

export default TermsPage;
