import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (!user?.isMaintainer) return <Navigate to="/" replace />

  return <Outlet /> 
}