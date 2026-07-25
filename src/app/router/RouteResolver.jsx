import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Spinner } from '@/shared/ui/Spinner'

/**
 * Determines whether a user belongs to the Platform Shell (Control Plane)
 * or the Tenant Shell (Data Plane).
 * 
 * Ideally, this is driven by `user.applicationType` from the backend.
 * As a fallback, we check for platform-specific roles.
 */
export const isPlatformUser = (user) => {
  if (!user) return false
  if (user.applicationType === 'PLATFORM') return true
  
  const platformRoles = ['SUPER_ADMIN', 'SUPPORT_ENGINEER', 'SECURITY_ANALYST']
  return (user.roles || []).some(r => {
    const roleName = typeof r === 'string' ? r : r?.name
    return platformRoles.some(pr => roleName?.includes(pr))
  })
}

/**
 * RouteResolver acts as the central traffic director.
 * It sits at the root `/` (or handles post-login redirection) and evaluates
 * which Application Shell the authenticated user should enter.
 */
export function RouteResolver() {
  const { user, isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Resolve the application shell based on user context
  if (isPlatformUser(user)) {
    return <Navigate to="/platform/dashboard" replace />
  }

  // Default to Tenant Shell
  return <Navigate to="/app" replace />
}
