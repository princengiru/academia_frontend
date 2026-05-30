import { Route } from 'react-router-dom';
import HOADashboardHome from '../../../pages/academia/hoa/HOADashboardHome';
import HOALearners from '../../../pages/academia/hoa/HOALearners';

function AcademiaHOARoutes() {
  return (
    <>
      <Route path="academia/hoa" element={<HOADashboardHome />} />
      <Route path="academia/hoa/learners" element={<HOALearners />} />
    </>
  );
}

export default AcademiaHOARoutes;