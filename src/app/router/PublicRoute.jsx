import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/ui/Spinner'

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    // If the user is already logged in, they shouldn't be visiting
    // public auth pages (login, register). Send them to the app.
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
