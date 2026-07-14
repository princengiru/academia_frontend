import PublicInfoPage from './PublicInfoPage';

function HelpPage() {
  return (
    <PublicInfoPage
      title="Help Center"
      lead="Quick answers and support channels for Academia visitors and learners."
    >
      <h2>Getting started</h2>
      <ul>
        <li>Browse courses at <a href="/academia/courses">/academia/courses</a></li>
        <li>Create a free account to enroll, save projects, and track progress</li>
        <li>Instructors can publish from the professor workspace after approval</li>
      </ul>
      <h2>Common issues</h2>
      <p>
        If sign-in fails, reset your password from the auth screen. For payment or enrollment problems,
        include your account email and course name when contacting support.
      </p>
      <h2>Contact support</h2>
      <p>
        Email <a href="mailto:support@gonaraza.com">support@gonaraza.com</a> or{' '}
        <a href="mailto:info@gonaraza.com">info@gonaraza.com</a>. We typically respond within two business days.
      </p>
    </PublicInfoPage>
  );
}

export default HelpPage;
