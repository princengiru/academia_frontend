import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import MigrationChecklistPage from './pages/MigrationChecklistPage'
import AcademiaRoutes from './routes/academia'
import LearnersRoutes from './routes/learners'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="migration-checklist"
            element={<MigrationChecklistPage />}
          />
          {AcademiaRoutes()}
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Learners Dashboard Routes */}
        {LearnersRoutes()}
      </Routes>
    </BrowserRouter>
  )
}

export default App
