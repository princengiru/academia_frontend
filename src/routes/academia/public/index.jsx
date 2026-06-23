import React from 'react';
import { Route } from 'react-router-dom';
import AcademiaIndex from '../../../pages/academia/public';
import AcademiaJournals from '../../../pages/academia/public/journals';
import AcademiaSyllabuses from '../../../pages/academia/public/syllabuses';
import AcademiaSyllabusPart from '../../../pages/academia/public/syllabus-part';
import AcademiaReadContents from '../../../pages/academia/public/read-contents';
import AcademiaReadJournal from '../../../pages/academia/public/read-journal';
import AcademiaReadStory from '../../../pages/academia/public/read-story';
import AcademiaWatch from '../../../pages/academia/public/watch';
import AcademiaAuthor from '../../../pages/academia/public/author';
import AcademiaRewards from '../../../pages/academia/public/rewards';

export default function AcademiaPublicRoutes() {
  return (
    <>
      <Route index element={<AcademiaIndex />} />
      <Route path="index" element={<AcademiaIndex />} />
      <Route path="journals" element={<AcademiaJournals />} />
      <Route path="syllabuses" element={<AcademiaSyllabuses />} />
      <Route path="syllabus-part" element={<AcademiaSyllabusPart />} />
      <Route path="read-contents" element={<AcademiaReadContents />} />
      <Route path="read-journal" element={<AcademiaReadJournal />} />
      <Route path="read-story" element={<AcademiaReadStory />} />
      <Route path="watch" element={<AcademiaWatch />} />
      <Route path="author" element={<AcademiaAuthor />} />
      <Route path="rewards" element={<AcademiaRewards />} />
    </>
  );
}
