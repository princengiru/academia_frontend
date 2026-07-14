import { Link } from 'react-router-dom';
import './public-info.css';
import { usePublicPageTitle } from './usePublicPageTitle.jsx';

function PublicInfoPage({ title, lead, children }) {
  usePublicPageTitle(title);

  return (
    <section className="public-info-page">
      <article className="public-info-card">
        <h1>{title}</h1>
        {lead ? <p className="public-info-lead">{lead}</p> : null}
        {children}
        <Link className="public-info-back" to="/academia/index">
          ← Back to Academia home
        </Link>
      </article>
    </section>
  );
}

export default PublicInfoPage;
