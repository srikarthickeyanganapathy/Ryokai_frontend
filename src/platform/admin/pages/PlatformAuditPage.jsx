import React from 'react'
import { PageShell, PageHero } from '@/shared/ui/PageShell'
import { Heading, Text } from '@/shared/ui/Typography'
import { Card, CardContent } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'

export function PlatformAuditPage() {
  return (
    <PageShell maxWidth="default" className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Global Audit Logs"
        subtitle="Platform-wide security and compliance auditing."
        className="mb-6"
      />

      <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--border-subtle)] flex-1 min-h-[300px] flex items-center justify-center opacity-70">
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <Icons.shieldAlert className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
          <Heading level={4} className="text-[16px] font-semibold mb-2">No Audit Provider Configured</Heading>
          <Text variant="muted" className="max-w-md mx-auto text-sm">
            Global audit endpoints are not yet connected. Configure an audit provider in the backend to stream platform security events here.
          </Text>
        </CardContent>
      </Card>
    </PageShell>
  )
}
