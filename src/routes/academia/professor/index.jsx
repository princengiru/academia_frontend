import { Route } from 'react-router-dom';
import DashboardHome from '../../../pages/academia/professor/DashboardHome';
import PrepareCourse from '../../../pages/academia/professor/PrepareCourse';
import Assignments from '../../../pages/academia/professor/Assignments';
import Projects from '../../../pages/academia/professor/Projects';

function AcademiaProfessorRoutes() {
  // Provide a top-level route so DashboardHome renders without the AcademiaLayout wrapper.
  // Keep URL as /academia/professor per request.
  return (
    <>
      <Route path="academia/professor" element={<DashboardHome />} />
      <Route path="academia/professor/prepare-course" element={<PrepareCourse />} />
      <Route path="academia/professor/assignments" element={<Assignments />} />
      <Route path="academia/professor/projects" element={<Projects />} />
    </>
  );
}

export default AcademiaProfessorRoutes;
