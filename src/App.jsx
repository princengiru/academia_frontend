import { BrowserRouter, Routes } from 'react-router-dom'
import AcademiaRoutes from './routes/academia'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {AcademiaRoutes()}
      </Routes>
    </BrowserRouter>
  )
}

export default App
