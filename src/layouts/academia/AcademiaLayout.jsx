import { Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

function AcademiaLayout() {
  const location = useLocation()

  return (
    <div className="app-shell">
      <Header />

      <main className="content">
        <div key={location.pathname} className="content-transition">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AcademiaLayout
