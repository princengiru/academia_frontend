import { Navigate, Route } from 'react-router-dom';
import HOADashboardHome from '../../../pages/academia/hoa/HOADashboardHome';
import HOALearners from '../../../pages/academia/hoa/HOALearners';
import HOATutors from '../../../pages/academia/hoa/HOATutors';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import HOAReports from '../../../pages/academia/hoa/HOAReports';
import HOAAssignments from '../../../pages/academia/hoa/HOAAssignments';
import HOAPassedCourses from '../../../pages/academia/hoa/HOAPassedCourses';
import HOARetakenCourses from '../../../pages/academia/hoa/HOARetakenCourses';
import HOAFailedCourses from '../../../pages/academia/hoa/HOAFailedCourses';
import HOASyllabus from '../../../pages/academia/hoa/HOASyllabus';
import HOAOnlineCourses from '../../../pages/academia/hoa/HOAOnlineCourses';
import HOAProjects from '../../../pages/academia/hoa/HOAProjects';
import HOACommunity from '../../../pages/academia/hoa/HOACommunity';
import HOACertificates from '../../../pages/academia/hoa/HOACertificates';
import HOAEventsPlanning from '../../../pages/academia/hoa/HOAEventsPlanning';
import HOAETravel from '../../../pages/academia/hoa/HOAEtravel';
import HOATermsConditions from '../../../pages/academia/hoa/HOATermsConditions';

const HOAPlaceholderPage = ({ currentPage, title, description, breadcrumb }) => (
  <HOALayout currentPage={currentPage} breadcrumb={breadcrumb}>
    <div style={{ padding: '12px 0 32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#071437' }}>{title}</h1>
      <p style={{ margin: 0, color: '#78829D', fontSize: '13px' }}>{description}</p>
    </div>
  </HOALayout>
);

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
      <Route path="academia/hoa/online-courses" element={<HOAOnlineCourses />} />
      <Route path="academia/hoa/projects" element={<HOAProjects />} />
      <Route path="academia/hoa/community" element={<HOACommunity />} />
      <Route path="academia/hoa/certificates" element={<HOACertificates />} />
      <Route path="academia/hoa/events-planning" element={<HOAEventsPlanning />} />
      <Route path="academia/hoa/e-travel" element={<HOAETravel />} />
      <Route path="academia/hoa/terms-conditions" element={<HOATermsConditions />} />
      <Route
        path="academia/hoa/settings"
        element={( 
          <HOAPlaceholderPage
            currentPage="settings"
            title="Settings"
            description="Settings are not wired yet."
          />
        )}
      />
      <Route path="academia/hoa/*" element={<Navigate to="/academia/hoa" replace />} />
    </>
  );
}

export default AcademiaHOARoutes;