import { Route } from 'react-router-dom';
import DashboardHome from '../../../pages/academia/professor/DashboardHome';

function AcademiaProfessorRoutes() {
  // Provide a top-level route so DashboardHome renders without the AcademiaLayout wrapper.
  // Keep URL as /academia/professor per request.
  return <Route path="academia/professor" element={<DashboardHome />} />;
}

export default AcademiaProfessorRoutes;
