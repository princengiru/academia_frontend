import { Link } from 'react-router-dom';
import PublicInfoPage from './PublicInfoPage';

const publicLinks = [
  { to: '/academia/index', label: 'Home' },
  { to: '/academia/courses', label: 'Courses' },
  { to: '/academia/projects', label: 'Projects' },
  { to: '/academia/syllabuses', label: 'Syllabuses' },
  { to: '/academia/watch', label: 'Community Feed' },
  { to: '/academia/certificates', label: 'Certificates' },
  { to: '/academia/auth/signin', label: 'Sign in' },
  { to: '/academia/auth/signup', label: 'Sign up' },
  { to: '/academia/terms', label: 'Terms and Conditions' },
  { to: '/academia/privacy', label: 'Privacy Policy' },
  { to: '/academia/ad-policy', label: 'Advertising Policy' },
  { to: '/academia/help', label: 'Help Center' },
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
