import { Outlet } from 'react-router-dom'
import MunicipalityNavbar from './MunicipalityNavbar'
import ProtectedRoute from './ProtectedRoute'

export default function MunicipalityLayout() {
  return (
    <ProtectedRoute>
      <MunicipalityNavbar />
      <Outlet />
    </ProtectedRoute>
  )
}
