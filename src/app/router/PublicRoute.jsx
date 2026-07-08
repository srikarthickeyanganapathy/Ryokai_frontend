import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-4 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] rounded-full animate-spin" />
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
