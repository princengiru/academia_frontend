import { Route } from 'react-router-dom';
import EngineeringIndex from '../../pages/engineering';

function EngineeringRoutes() {
  return (
    <>
      <Route path="engineering" element={<EngineeringIndex />} />
      <Route path="engineering/index" element={<EngineeringIndex />} />
    </>
  );
}

export default EngineeringRoutes;