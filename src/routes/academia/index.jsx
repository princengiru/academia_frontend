import { Navigate, Route } from 'react-router-dom';
import AcademiaLayout from '../../layouts/academia/AcademiaLayout';
import AcademiaPublicLayout from '../../layouts/academia/AcademiaLayout';
import AcademiaLearnerLayout from '../../layouts/academia/LearnersLayout';
import ProfessorLayout from '../../components/layouts/ProfessorLayout/ProfessorLayout';
import AcademiaAuthLayout from '../../layouts/academia/AuthLayout';
import AcademiaAuthRoutes from './auth';
import AcademiaPublicRoutes from './public';
import AcademiaLearnerRoutes from './learner';
import AcademiaProfessorRoutes from './professor';
import AcademiaHOARoutes from './hoa';
import AcademiaNotFound from '../../pages/academia/public/NotFoundPage';

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

      {/* Professor pages — same route pattern as learner */}
      <Route path="academia/professor" element={<ProfessorLayout />}>
        {AcademiaProfessorRoutes()}
      </Route>

      {/* HOA pages — top-level so HOALayout controls header */}
      {AcademiaHOARoutes()}

      {/* Unknown paths outside registered academia areas */}
      <Route path="*" element={<AcademiaLayout />}>
        <Route path="*" element={<AcademiaNotFound />} />
      </Route>
    </>
  );
}

export default AcademiaRoutes;