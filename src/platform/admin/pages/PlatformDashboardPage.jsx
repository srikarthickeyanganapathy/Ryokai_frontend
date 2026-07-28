import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'
import { useAdminOrganizations } from '@/platform/admin/features/hooks/useAdmin'
import { useUsersList } from '@/identity'

export function PlatformDashboardPage() {
  const { data: orgs, isLoading: orgsLoading } = useAdminOrganizations()
  const { data: users, isLoading: usersLoading } = useUsersList()

  const orgCount = orgs?.length || 0
  const userCount = users?.length || 0

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Platform Dashboard</Heading>
        <Text variant="muted" className="text-[13px]">Overview of platform health and status.</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Platform Status</p>
              <Icons.activity className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="text-2xl font-bold">Healthy</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Organizations</p>
              <Icons.building className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl font-bold">
              {orgsLoading ? <Icons.loader className="w-5 h-5 animate-spin" /> : orgCount}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Active tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Users</p>
              <Icons.users className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl font-bold">
              {usersLoading ? <Icons.loader className="w-5 h-5 animate-spin" /> : userCount}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Total global identities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 opacity-60">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Active Sessions</p>
              <Icons.monitor className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Coming Soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">System Health</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex flex-col items-center justify-center text-center">
            <Icons.barChart className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <Text variant="muted">Monitoring endpoints are not yet integrated with the Platform UI.</Text>
            <span className="mt-2 px-2 py-1 bg-[var(--bg-subtle)] text-[11px] rounded text-[var(--text-secondary)]">Coming Soon</span>
          </CardContent>
        </Card>
        
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Platform Alerts</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex flex-col items-center justify-center text-center">
            <Icons.bell className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <Text variant="muted">Alert aggregation is not yet integrated with the Platform UI.</Text>
            <span className="mt-2 px-2 py-1 bg-[var(--bg-subtle)] text-[11px] rounded text-[var(--text-secondary)]">Coming Soon</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
