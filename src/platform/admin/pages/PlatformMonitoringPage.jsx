import React from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Heading, Text } from '@/shared/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Icons } from '@/shared/ui/Icons'

export function PlatformMonitoringPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <PageHeader
        title="Platform Monitoring"
        subtitle="Infrastructure observability and metrics."
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Prometheus Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icons.activity className="w-4 h-4" />
              Prometheus
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[160px] flex flex-col items-center justify-center text-center">
            <Text variant="muted" className="text-xs mb-2">Monitoring endpoints are not yet integrated with the Platform UI.</Text>
            <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-mono rounded text-[var(--text-secondary)]">Not Connected</span>
          </CardContent>
        </Card>

        {/* Grafana Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icons.barChart className="w-4 h-4" />
              Grafana
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[160px] flex flex-col items-center justify-center text-center">
            <Text variant="muted" className="text-xs mb-2">Grafana dashboards are not yet configured.</Text>
            <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-mono rounded text-[var(--text-secondary)]">Not Configured</span>
          </CardContent>
        </Card>

        {/* OpenTelemetry Placeholder */}
        <Card className="border-dashed bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] opacity-70">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Icons.radar className="w-4 h-4" />
              OpenTelemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[160px] flex flex-col items-center justify-center text-center">
            <Text variant="muted" className="text-xs mb-2">Distributed tracing is planned for a future release.</Text>
            <span className="px-2 py-1 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-mono rounded text-[var(--text-secondary)]">Coming Soon</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
