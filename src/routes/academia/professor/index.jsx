import { Route } from 'react-router-dom';
import DashboardHome from '../../../pages/academia/professor/DashboardHome';
import PrepareCourse from '../../../pages/academia/professor/PrepareCourse';
import PrepareSyllabus from '../../../pages/academia/professor/PrepareSyllabus';
import Assignments from '../../../pages/academia/professor/Assignments';
import Projects from '../../../pages/academia/professor/Projects';
import ViewProject from '../../../pages/academia/professor/ViewProject';
import Performance from '../../../pages/academia/professor/Performance';
import Management from '../../../pages/academia/professor/Management';
import ManagementSchedule from '../../../pages/academia/professor/ManagementSchedule';
import ManagementLessonsRanks from '../../../pages/academia/professor/ManagementLessonsRanks';
import ManagementStudentQA from '../../../pages/academia/professor/ManagementStudentQA';
import Settings from '../../../pages/academia/professor/Settings';
import Account from '../../../pages/academia/professor/Account';

function AcademiaProfessorRoutes() {
  // Provide a top-level route so DashboardHome renders without the AcademiaLayout wrapper.
  // Keep URL as /academia/professor per request.
  return (
    <>
      <Route path="academia/professor" element={<DashboardHome />} />
      <Route path="academia/professor/prepare-course" element={<PrepareCourse />} />
      <Route path="academia/professor/prepare-syllabus" element={<PrepareSyllabus />} />
      <Route path="academia/professor/assignments" element={<Assignments />} />
      <Route path="academia/professor/projects" element={<Projects />} />
      <Route path="academia/professor/view-project" element={<ViewProject />} />
      <Route path="academia/professor/performance" element={<Performance />} />
      <Route path="academia/professor/management" element={<Management />} />
      <Route path="academia/professor/management-syllabuses" element={<Management />} />
      <Route path="academia/professor/management-schedule" element={<ManagementSchedule />} />
      <Route path="academia/professor/management-lessons-ranks" element={<ManagementLessonsRanks />} />
      <Route path="academia/professor/management-student-qa" element={<ManagementStudentQA />} />
      <Route path="academia/professor/settings" element={<Settings />} />
      <Route path="academia/professor/account" element={<Account />} />
    </>
  );
}

export default AcademiaProfessorRoutes;
