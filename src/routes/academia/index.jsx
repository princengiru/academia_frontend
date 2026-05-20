import { Navigate, Route } from 'react-router-dom';
import AcademiaLayout from '../../layouts/academia/AcademiaLayout';
import AcademiaPublicLayout from '../../layouts/academia/AcademiaLayout';
import AcademiaLearnerLayout from '../../layouts/academia/LearnersLayout';
import AcademiaAuthLayout from '../../layouts/academia/AuthLayout';
import AcademiaAuthRoutes from './auth';
import AcademiaPublicRoutes from './public';
import AcademiaLearnerRoutes from './learner';

function AcademiaRoutes() {
  return (
    <>
      <Route path="/" element={<Navigate to="/academia/index" replace />} />

      {/* Public pages — use AcademiaLayout (header + footer) */}
      <Route path="academia" element={<AcademiaLayout />}>
        <Route index element={<Navigate to="index" replace />} />
        {AcademiaPublicRoutes()}
      </Route>

      {/* Learner pages — standalone learner layout (no public header) */}
      <Route path="academia/learner" element={<AcademiaLearnerLayout />}>
        {AcademiaLearnerRoutes()}
      </Route>

      {/* Auth pages — standalone auth layout */}
      <Route path="academia/auth" element={<AcademiaAuthLayout />}>
        {AcademiaAuthRoutes()}
      </Route>
    </>
  );
}

export default AcademiaRoutes;