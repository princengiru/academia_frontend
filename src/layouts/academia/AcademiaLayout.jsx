import { Outlet } from 'react-router-dom'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

function AcademiaLayout() {
  return (
    <div className="app-shell">
      <Header />

      <main className="content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AcademiaLayout
