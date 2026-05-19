import { Route } from 'react-router-dom';
import LearnersLayout from '../../layouts/LearnersLayout';
import LearnersIndex from '../../pages/learner-dash/index';
import LearnersCourses from '../../pages/learner-dash/courses';
import LearnersCoursePart from '../../pages/learner-dash/course-part';
import LearnersReadContents from '../../pages/learner-dash/read-contents';
import LearnersPerformance from '../../pages/learner-dash/performance';
import LearnersAvailableTest from '../../pages/learner-dash/available-test';
import LearnersProjects from '../../pages/learner-dash/projects';
import LearnersViewProject from '../../pages/learner-dash/view-project';
import LearnersCertificates from '../../pages/learner-dash/certificates';
import LearnersSettings from '../../pages/learner-dash/settings';

function LearnersRoutes() {
  return (
    <Route path="learner" element={<LearnersLayout />}>
      <Route index element={<LearnersIndex />} />
      <Route path="index" element={<LearnersIndex />} />
      <Route path="courses" element={<LearnersCourses />} />
      <Route path="course-part" element={<LearnersCoursePart />} />
      <Route path="read-contents" element={<LearnersReadContents />} />
      <Route path="performance" element={<LearnersPerformance />} />
      <Route path="available-test" element={<LearnersAvailableTest />} />
      <Route path="projects" element={<LearnersProjects />} />
      <Route path="view-project" element={<LearnersViewProject />} />
      <Route path="certificates" element={<LearnersCertificates />} />
      <Route path="settings" element={<LearnersSettings />} />
    </Route>
  );
}

export default LearnersRoutes;