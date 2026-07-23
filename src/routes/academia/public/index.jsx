import React, { Suspense, lazy } from 'react';
import { Navigate, Route, useLocation, useSearchParams } from 'react-router-dom';
import { PublicLoading } from '../../../pages/academia/public/PublicPageState';
import AcademiaIndex from '../../../pages/academia/public';
import AcademiaProjects from '../../../pages/academia/public/projects';
import AcademiaSyllabuses from '../../../pages/academia/public/syllabuses';
import AcademiaSyllabusPart from '../../../pages/academia/public/syllabus-part';
import AcademiaReadProject from '../../../pages/academia/public/read-project';
import AcademiaReadStory from '../../../pages/academia/public/read-story';
import AcademiaAuthor from '../../../pages/academia/public/author';
import AcademiaCertificates from '../../../pages/academia/public/certificates';
import AcademiaCourseDetails from '../../../pages/academia/public/course-details';
import AcademiaCourses from '../../../pages/academia/public/courses';
import AcademiaTerms from '../../../pages/academia/public/terms';
import AcademiaPrivacy from '../../../pages/academia/public/privacy';
import AcademiaAdPolicy from '../../../pages/academia/public/ad-policy';
import AcademiaHelp from '../../../pages/academia/public/help';
import AcademiaSitemap from '../../../pages/academia/public/sitemap';
import AcademiaNotFound from '../../../pages/academia/public/NotFoundPage';

const AcademiaReadContents = lazy(() => import('../../../pages/academia/public/read-contents'));
const AcademiaWatch = lazy(() => import('../../../pages/academia/public/watch'));

function LazyReadContents() {
  return (
    <Suspense fallback={<PublicLoading message="Loading reader…" />}>
      <AcademiaReadContents />
    </Suspense>
  );
}

function LazyWatch() {
  return (
    <Suspense fallback={<PublicLoading message="Loading community feed…" />}>
      <AcademiaWatch />
    </Suspense>
  );
}

function RedirectJournalsToProjects() {
  const location = useLocation();
  return <Navigate to={`/projects${location.search || ''}`} replace />;
}

function RedirectReadJournalToProject() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  return (
    <Navigate
      to={id ? `/read-project?id=${encodeURIComponent(id)}` : '/projects'}
      replace
    />
  );
}

export default function AcademiaPublicRoutes() {
  return (
    <>
      <Route index element={<AcademiaIndex />} />
      <Route path="index" element={<AcademiaIndex />} />
      <Route path="projects" element={<AcademiaProjects />} />
      <Route path="journals" element={<RedirectJournalsToProjects />} />
      <Route path="syllabuses" element={<AcademiaSyllabuses />} />
      <Route path="syllabus-part" element={<AcademiaSyllabusPart />} />
      <Route path="read-contents" element={<LazyReadContents />} />
      <Route path="read-project" element={<AcademiaReadProject />} />
      <Route path="read-journal" element={<RedirectReadJournalToProject />} />
      <Route path="read-story" element={<AcademiaReadStory />} />
      <Route path="watch" element={<LazyWatch />} />
      <Route path="author" element={<AcademiaAuthor />} />
      <Route path="certificates" element={<AcademiaCertificates />} />
      <Route path="rewards" element={<Navigate to="/certificates" replace />} />
      <Route path="course-details" element={<AcademiaCourseDetails />} />
      <Route path="courses" element={<AcademiaCourses />} />
      <Route path="terms" element={<AcademiaTerms />} />
      <Route path="privacy" element={<AcademiaPrivacy />} />
      <Route path="ad-policy" element={<AcademiaAdPolicy />} />
      <Route path="help" element={<AcademiaHelp />} />
      <Route path="sitemap" element={<AcademiaSitemap />} />
      <Route path="*" element={<AcademiaNotFound />} />
    </>
  );
}
