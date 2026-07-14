import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import '../../pages/academia/public/public-mobile.css'

function AcademiaLayout() {
  const location = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

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
