import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()
  
  const isSuperAdmin = (user?.roles || []).some(r =>
    (typeof r === 'string' ? r : r?.name)?.includes('SUPER_ADMIN')
  )

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isSuperAdmin) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
