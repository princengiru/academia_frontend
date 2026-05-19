import { Navigate, Route } from 'react-router-dom';
import AcademiaIndex from '../../pages/academia';
import AcademiaJournals from '../../pages/academia/journals';
import AcademiasCourses from '../../pages/academia/courses';
import AcademiaCoursePart from '../../pages/academia/course-part';
import AcademiaReadContents from '../../pages/academia/read-contents';
import AcademiaReadJournal from '../../pages/academia/read-journal';
import AcademiaReadStory from '../../pages/academia/read-story';
import AcademiaWatch from '../../pages/academia/watch';
import AcademiaAuthor from '../../pages/academia/author';
import AcademiaRewards from '../../pages/academia/rewards';

function AcademiaRoutes() {
  return (
    <Route path="academia">
      <Route index element={<Navigate to="index" replace />} />
      <Route path="index" element={<AcademiaIndex />} />
      <Route path="journals" element={<AcademiaJournals />} />
      <Route path="courses" element={<AcademiasCourses />} />
      <Route path="course-part" element={<AcademiaCoursePart />} />
      <Route path="read-contents" element={<AcademiaReadContents />} />
      <Route path="read-journal" element={<AcademiaReadJournal />} />
      <Route path="read-story" element={<AcademiaReadStory />} />
      <Route path="watch" element={<AcademiaWatch />} />
      <Route path="author" element={<AcademiaAuthor />} />
      <Route path="rewards" element={<AcademiaRewards />} />
    </Route>
  );
}

export default AcademiaRoutes;