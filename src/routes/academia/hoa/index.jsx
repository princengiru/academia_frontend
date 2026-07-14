import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { HOALoading } from '../../../pages/academia/hoa/HOAPageState';
import HOADashboardHome from '../../../pages/academia/hoa/HOADashboardHome';
import HOALearners from '../../../pages/academia/hoa/HOALearners';
import HOATutors from '../../../pages/academia/hoa/HOATutors';
import HOAReports from '../../../pages/academia/hoa/HOAReports';
import HOAAssignments from '../../../pages/academia/hoa/HOAAssignments';
import HOAPassedCourses from '../../../pages/academia/hoa/HOAPassedCourses';
import HOARetakenCourses from '../../../pages/academia/hoa/HOARetakenCourses';
import HOAFailedCourses from '../../../pages/academia/hoa/HOAFailedCourses';
import HOASyllabus from '../../../pages/academia/hoa/HOASyllabus';
import HOAProjects from '../../../pages/academia/hoa/HOAProjects';
import HOACertificates from '../../../pages/academia/hoa/HOACertificates';
import HOAEventsPlanning from '../../../pages/academia/hoa/HOAEventsPlanning';
import HOAETravel from '../../../pages/academia/hoa/HOAETravel';
import HOATermsConditions from '../../../pages/academia/hoa/HOATermsConditions';

const HOAOnlineCourses = lazy(() => import('../../../pages/academia/hoa/HOAOnlineCourses'));
const HOACommunity = lazy(() => import('../../../pages/academia/hoa/HOACommunity'));
const HOAAccount = lazy(() => import('../../../pages/academia/hoa/HOAAccount'));

function LazyHOAPage({ message, children }) {
  return (
    <Suspense fallback={<HOALoading message={message} />}>
      {children}
    </Suspense>
  );
}

function AcademiaHOARoutes() {
  return (
    <>
      <Route path="academia/hoa" element={<HOADashboardHome />} />
      <Route path="academia/hoa/learners" element={<HOALearners />} />
      <Route path="academia/hoa/tutors" element={<HOATutors />} />
      <Route path="academia/hoa/reports" element={<HOAReports />} />
      <Route path="academia/hoa/assignments" element={<HOAAssignments />} />
      <Route path="academia/hoa/passed-courses" element={<HOAPassedCourses />} />
      <Route path="academia/hoa/retaken-courses" element={<HOARetakenCourses />} />
      <Route path="academia/hoa/failed-courses" element={<HOAFailedCourses />} />
      <Route path="academia/hoa/syllabus" element={<HOASyllabus />} />
      <Route
        path="academia/hoa/online-courses"
        element={(
          <LazyHOAPage message="Loading online courses…">
            <HOAOnlineCourses />
          </LazyHOAPage>
        )}
      />
      <Route path="academia/hoa/projects" element={<HOAProjects />} />
      <Route
        path="academia/hoa/community"
        element={(
          <LazyHOAPage message="Loading community…">
            <HOACommunity />
          </LazyHOAPage>
        )}
      />
      <Route path="academia/hoa/certificates" element={<HOACertificates />} />
      <Route path="academia/hoa/events-planning" element={<HOAEventsPlanning />} />
      <Route path="academia/hoa/e-travel" element={<HOAETravel />} />
      <Route path="academia/hoa/terms-conditions" element={<HOATermsConditions />} />
      <Route
        path="academia/hoa/account"
        element={(
          <LazyHOAPage message="Loading account…">
            <HOAAccount />
          </LazyHOAPage>
        )}
      />
    </>
  );
}

export default AcademiaHOARoutes;
