import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import HotspotMap from './pages/HotspotMap'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/hotspots" element={<HotspotMap />} />
      </Routes>
    </BrowserRouter>
  )
}