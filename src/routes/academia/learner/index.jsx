import React from 'react';
import { Route } from 'react-router-dom';
import LearnersIndex from '../../../pages/academia/learner/index';
import LearnersCourses from '../../../pages/academia/learner/courses';
import LearnersCoursePart from '../../../pages/academia/learner/course-part';
import LearnersReadContents from '../../../pages/academia/learner/read-contents';
import LearnersPerformance from '../../../pages/academia/learner/performance';
import LearnersAvailableTest from '../../../pages/academia/learner/available-test';
import LearnersProjects from '../../../pages/academia/learner/projects';
import LearnersViewProject from '../../../pages/academia/learner/view-project';
import LearnersCertificates from '../../../pages/academia/learner/certificates';
import LearnersSettings from '../../../pages/academia/learner/settings';
import LearnersAccount from '../../../pages/academia/learner/account';

export default function AcademiaLearnerRoutes() {
  return (
    <>
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
      <Route path="account" element={<LearnersAccount />} />
      <Route path="settings" element={<LearnersSettings />} />
    </>
  );
}
