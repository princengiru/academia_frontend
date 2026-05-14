import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import MigrationChecklistPage from './pages/MigrationChecklistPage'
import AcademiaIndex from './pages/academia'
import AcademiaJournals from './pages/academia/journals'
import AcademiasCourses from './pages/academia/courses'
import AcademiaCoursePart from './pages/academia/course-part'
import AcademiaReadContents from './pages/academia/read-contents'
import AcademiaReadJournal from './pages/academia/read-journal'
import AcademiaReadStory from './pages/academia/read-story'
import AcademiaWatch from './pages/academia/watch'
import AcademiaAuthor from './pages/academia/author'
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
          <Route path="academia/index" element={<AcademiaIndex />} />
          <Route path="academia/journals" element={<AcademiaJournals />} />
          <Route path="academia/courses" element={<AcademiasCourses />} />
          <Route path="academia/course-part" element={<AcademiaCoursePart />} />
          <Route path="academia/read-contents" element={<AcademiaReadContents />} />
          <Route path="academia/read-journal" element={<AcademiaReadJournal />} />
          <Route path="academia/read-story" element={<AcademiaReadStory />} />
          <Route path="academia/watch" element={<AcademiaWatch />} />
          <Route path="academia/author" element={<AcademiaAuthor />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
