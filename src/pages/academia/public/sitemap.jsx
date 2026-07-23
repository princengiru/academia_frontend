import { Link } from 'react-router-dom';
import PublicInfoPage from './PublicInfoPage';

const publicLinks = [
  { to: '/index', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/projects', label: 'Projects' },
  { to: '/syllabuses', label: 'Syllabuses' },
  { to: '/watch', label: 'Community Feed' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/auth/signin', label: 'Sign in' },
  { to: '/auth/signup', label: 'Sign up' },
  { to: '/terms', label: 'Terms and Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/ad-policy', label: 'Advertising Policy' },
  { to: '/help', label: 'Help Center' },
];

function SitemapPage() {
  return (
    <PublicInfoPage title="Sitemap" lead="Primary Academia pages available on Gonaraza.com.">
      <div className="public-info-sitemap-grid">
        {publicLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </PublicInfoPage>
  );
}

export default SitemapPage;
