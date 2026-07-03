import { BrowserRouter, Routes } from 'react-router-dom'
import AcademiaRoutes from './routes/academia'
import EngineeringRoutes from './routes/engineering'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {AcademiaRoutes()}
        {EngineeringRoutes()}
      </Routes>
    </BrowserRouter>
  )
}

export default App
