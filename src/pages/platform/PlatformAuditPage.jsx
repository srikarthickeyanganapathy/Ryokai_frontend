import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Card, CardContent } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'

export function PlatformAuditPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Global Audit Logs</Heading>
        <Text variant="muted" className="text-[13px]">Platform-wide security and compliance auditing.</Text>
      </div>

      <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] flex-1 min-h-[300px] flex items-center justify-center opacity-70">
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <Icons.shieldAlert className="w-12 h-12 text-[var(--text-tertiary)] mb-4" />
          <Heading level={4} className="text-[16px] font-semibold mb-2">No Audit Provider Configured</Heading>
          <Text variant="muted" className="max-w-md mx-auto text-sm">
            Global audit endpoints are not yet connected. Configure an audit provider in the backend to stream platform security events here.
          </Text>
        </CardContent>
      </Card>
    </div>
  )
}
