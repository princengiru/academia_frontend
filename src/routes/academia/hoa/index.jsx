import { Navigate, Route } from 'react-router-dom';
import HOADashboardHome from '../../../pages/academia/hoa/HOADashboardHome';
import HOALearners from '../../../pages/academia/hoa/HOALearners';
import HOATutors from '../../../pages/academia/hoa/HOATutors';
import HOALayout from '../../../components/layouts/HOALayout/HOALayout';
import HOAReports from '../../../pages/academia/hoa/HOAReports';
import HOAAssignments from '../../../pages/academia/hoa/HOAAssignments';
import HOAPassedCourses from '../../../pages/academia/hoa/HOAPassedCourses';
const HOAPlaceholderPage = ({ currentPage, title, description }) => (
  <HOALayout currentPage={currentPage}>
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