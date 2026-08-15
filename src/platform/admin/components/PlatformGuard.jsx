import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/identity'
import { Spinner } from '@/shared/ui/Spinner'

/**
 * Platform role hierarchy for route-level access control.
 * Lower tiers exclude higher-tier-only pages.
 */
const PAGE_ROLE_REQUIREMENTS = {
  '/platform/dashboard':     ['SUPER_ADMIN', 'SUPPORT_ENGINEER', 'SECURITY_ANALYST'],
  '/platform/organizations': ['SUPER_ADMIN'],
  '/platform/users':         ['SUPER_ADMIN', 'SUPPORT_ENGINEER'],
  '/platform/monitoring':    ['SUPER_ADMIN', 'SUPPORT_ENGINEER', 'SECURITY_ANALYST'],
  '/platform/audit':         ['SUPER_ADMIN', 'SECURITY_ANALYST'],
  '/platform/settings':      ['SUPER_ADMIN'],
}

function getUserPlatformRoles(user) {
  if (!user?.roles) return []
  return user.roles
    .map(r => (typeof r === 'string' ? r.replace(/^ROLE_/, '') : r?.name?.replace(/^ROLE_/, '') || ''))
    .filter(Boolean)
}

export function PlatformRouteGuard({ children, requiredRoles }) {
  const { user, isInitializing } = useAuth()

  if (isInitializing) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>
  }

  const userRoles = getUserPlatformRoles(user)
  const hasAccess = requiredRoles.some(role => userRoles.includes(role))

  if (!hasAccess) {
    return <Navigate to="/platform/dashboard" replace state={{ denied: true }} />
  }

  return <>{children}</>
}

export function PlatformPageGuard({ children }) {
  const location = useLocation()
  const requiredRoles = PAGE_ROLE_REQUIREMENTS[location.pathname] || ['SUPER_ADMIN']
  return (
    <PlatformRouteGuard requiredRoles={requiredRoles}>
      {children}
    </PlatformRouteGuard>
  )
}
