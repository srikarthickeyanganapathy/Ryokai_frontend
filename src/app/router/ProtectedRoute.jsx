import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/identity'
import { Spinner } from '@/shared/ui/Spinner'
import { isPlatformUser } from './RouteResolver'

/**
 * ProtectedRoute strictly ensures the user is authenticated.
 * It does NOT handle shell routing.
 */
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
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * PlatformRoute ensures the authenticated user belongs to the Control Plane.
 */
export function PlatformRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!isPlatformUser(user)) {
    // If a tenant user tries to access platform, send them back to the resolver
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/**
 * TenantRoute ensures the authenticated user belongs to the Data Plane.
 * Workspace resolution is handled downstream by the TenantLayout.
 */
export function TenantRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (isPlatformUser(user)) {
    // If a platform user tries to access tenant features, send them back to the resolver
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
