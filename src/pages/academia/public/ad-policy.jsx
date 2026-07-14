import PublicInfoPage from './PublicInfoPage';

function AdPolicyPage() {
  return (
    <PublicInfoPage
      title="Advertising Policy"
      lead="Rules for promoting courses, projects, and services on Gonaraza Academia."
    >
      <h2>Allowed promotions</h2>
      <p>
        Instructors and partners may promote educational offerings that are accurate, non-deceptive,
        and compliant with local advertising laws.
      </p>
      <h2>Prohibited content</h2>
      <ul>
        <li>Misleading claims about outcomes, accreditation, or pricing</li>
        <li>Harassing, discriminatory, or adult content in public listings</li>
        <li>Malware, phishing, or unauthorized data collection</li>
      </ul>
      <h2>Enforcement</h2>
      <p>
        We may remove listings or suspend accounts that violate this policy. Report concerns to{' '}
        <a href="mailto:support@gonaraza.com">support@gonaraza.com</a>.
      </p>
    </PublicInfoPage>
  );
}

export default AdPolicyPage;
