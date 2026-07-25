import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'

export function PlatformSettingsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Platform Settings</Heading>
        <Text variant="muted" className="text-[13px]">Global configuration and environment details.</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Environment Info (Real) */}
        <Card className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-sm">
          <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
            <CardTitle className="text-[15px] font-semibold">Environment Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Application Version</span>
              <span className="text-sm font-mono font-medium">v1.2.0-rc.3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Environment</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded font-mono text-[11px] uppercase">Production</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Build Commit</span>
              <span className="text-sm font-mono text-[var(--text-muted)]">a8f93bc</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-secondary)]">Node Version</span>
              <span className="text-sm font-mono text-[var(--text-muted)]">v20.10.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[15px] font-semibold">Maintenance Mode</CardTitle>
              <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[10px] font-mono rounded text-[var(--text-secondary)] uppercase">Future</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center text-center h-[160px]">
            <Icons.lock className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <Text variant="muted" className="text-xs">Suspend all tenant access for system upgrades.</Text>
          </CardContent>
        </Card>

        {/* Feature Flags Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[15px] font-semibold">Feature Flags</CardTitle>
              <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[10px] font-mono rounded text-[var(--text-secondary)] uppercase">Future</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center text-center h-[160px]">
            <Icons.toggleRight className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <Text variant="muted" className="text-xs">Global toggle for experimental features.</Text>
          </CardContent>
        </Card>

        {/* License Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[15px] font-semibold">License Configuration</CardTitle>
              <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[10px] font-mono rounded text-[var(--text-secondary)] uppercase">Future</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center justify-center text-center h-[160px]">
            <Icons.key className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
            <Text variant="muted" className="text-xs">Manage enterprise license keys and restrictions.</Text>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
