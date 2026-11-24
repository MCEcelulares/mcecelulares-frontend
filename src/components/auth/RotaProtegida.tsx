import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Carregando } from '../ui/Carregando'

export function RotaProtegida() {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) {
    return <Carregando />
  }

  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  return <Outlet />
}
