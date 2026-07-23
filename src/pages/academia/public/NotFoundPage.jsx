import { Link } from 'react-router-dom';
import './public-info.css';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';

function NotFoundPage() {
  usePublicPageTitle('Page not found');

  return (
    <section className="public-not-found-page">
      <div className="public-not-found-card">
        <h1>Page not found</h1>
        <p>The page you requested does not exist or may have moved.</p>
        <div className="public-not-found-actions">
          <Link className="is-primary" to="/index">
            Go to Academia home
          </Link>
          <Link className="is-secondary" to="/courses">
            Browse courses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
