import { Route } from 'react-router-dom';
import DashboardHome from '../../../pages/academia/professor/DashboardHome';
import PrepareCourse from '../../../pages/academia/professor/PrepareCourse';
import PrepareSyllabus from '../../../pages/academia/professor/PrepareSyllabus';
import Assignments from '../../../pages/academia/professor/Assignments';
import Projects from '../../../pages/academia/professor/Projects';
import ViewProject from '../../../pages/academia/professor/ViewProject';
import Performance from '../../../pages/academia/professor/Performance';
import Earnings from '../../../pages/academia/professor/Earnings';
import Management from '../../../pages/academia/professor/Management';
import ManagementSchedule from '../../../pages/academia/professor/ManagementSchedule';
import ManagementLessonsRanks from '../../../pages/academia/professor/ManagementLessonsRanks';
import ManagementStudentQA from '../../../pages/academia/professor/ManagementStudentQA';
import Settings from '../../../pages/academia/professor/Settings';
import Account from '../../../pages/academia/professor/account';

function AcademiaProfessorRoutes() {
  return (
    <>
      <Route index element={<DashboardHome />} />
      <Route path="assignments" element={<Assignments />} />
      <Route path="projects" element={<Projects />} />
      <Route path="view-project" element={<ViewProject />} />
      <Route path="performance" element={<Performance />} />
      <Route path="earnings" element={<Earnings />} />
      <Route path="management" element={<Management />} />
      <Route path="management-syllabuses" element={<Management />} />
      <Route path="management-schedule" element={<ManagementSchedule />} />
      <Route path="management-lessons-ranks" element={<ManagementLessonsRanks />} />
      <Route path="management-student-qa" element={<ManagementStudentQA />} />
      <Route path="prepare-course" element={<PrepareCourse />} />
      <Route path="prepare-syllabus" element={<PrepareSyllabus />} />
      <Route path="settings" element={<Settings />} />
      <Route path="account" element={<Account />} />
    </>
  );
}

export default AcademiaProfessorRoutes;
