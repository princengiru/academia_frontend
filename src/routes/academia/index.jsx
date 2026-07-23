import { Navigate, Route, useLocation } from 'react-router-dom';
import AcademiaLayout from '../../layouts/academia/AcademiaLayout';
import AcademiaLearnerLayout from '../../layouts/academia/LearnersLayout';
import ProfessorLayout from '../../components/layouts/ProfessorLayout/ProfessorLayout';
import AcademiaAuthLayout from '../../layouts/academia/AuthLayout';
import AcademiaAuthRoutes from './auth';
import AcademiaPublicRoutes from './public';
import AcademiaLearnerRoutes from './learner';
import AcademiaProfessorRoutes from './professor';
import AcademiaHOARoutes from './hoa';
import AcademiaNotFound from '../../pages/academia/public/NotFoundPage';
import CertificatePrintPreview from '../../pages/academia/CertificatePrintPreview';

/** Keep old /academia/... bookmarks and emails working. */
function RedirectStripAcademiaPrefix() {
  const location = useLocation();
  const rest = location.pathname.replace(/^\/academia(?=\/|$)/, '') || '/';
  return <Navigate to={`${rest}${location.search}${location.hash}`} replace />;
}

function AcademiaRoutes() {
  return (
    <>
      {/* Design sandbox — certificate PDF print preview (no role layout) */}
      <Route path="certificate-preview" element={<CertificatePrintPreview />} />

      {/* Public pages — use AcademiaLayout (header + footer) */}
      <Route element={<AcademiaLayout />}>
        {AcademiaPublicRoutes()}
      </Route>

      {/* Learner pages — standalone learner layout (no public header) */}
      <Route path="learner" element={<AcademiaLearnerLayout />}>
        {AcademiaLearnerRoutes()}
      </Route>

      {/* Auth pages — standalone auth layout */}
      <Route path="auth" element={<AcademiaAuthLayout />}>
        {AcademiaAuthRoutes()}
      </Route>

      {/* Professor pages — same route pattern as learner */}
      <Route path="professor" element={<ProfessorLayout />}>
        {AcademiaProfessorRoutes()}
      </Route>

      {/* HOA pages — top-level so HOALayout controls header */}
      {AcademiaHOARoutes()}

      {/* Legacy /academia/* → /* */}
      <Route path="academia/*" element={<RedirectStripAcademiaPrefix />} />

      {/* Unknown paths outside registered areas */}
      <Route path="*" element={<AcademiaLayout />}>
        <Route path="*" element={<AcademiaNotFound />} />
      </Route>
    </>
  );
}

export default AcademiaRoutes;
