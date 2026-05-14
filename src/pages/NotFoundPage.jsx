import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="card">
      <h2>Page Not Found</h2>
      <p>The route you requested does not exist yet.</p>
      <Link className="back-link" to="/">
        Back to Home
      </Link>
    </section>
  )
}

export default NotFoundPage
