import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('nadirakshak_municipality_auth') === 'true'
  if (!isAuthenticated) {
    return <Navigate to="/municipality/login" replace />
  }
  return children
}
