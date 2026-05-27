import { Route } from 'react-router-dom';
import HOADashboardHome from '../../../pages/academia/hoa/HOADashboardHome';

function AcademiaHOARoutes() {
  return (
    <>
      <Route path="academia/hoa" element={<HOADashboardHome />} />
    </>
  );
}

export default AcademiaHOARoutes;