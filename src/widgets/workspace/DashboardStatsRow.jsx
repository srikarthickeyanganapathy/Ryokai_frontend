import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'

export function DashboardStatsRow({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-[var(--bg-subtle)] rounded" />
              <div className="h-4 w-4 bg-[var(--bg-subtle)] rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-[var(--bg-subtle)] rounded mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const defaultStats = stats || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultStats.map((stat, i) => (
        <Card 
          key={i} 
          className="group hover:-translate-y-0.5 hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[transform,border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)]"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
              {stat.label}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color || 'text-[var(--text-secondary)]'} group-hover:text-[var(--accent)] transition-colors duration-[var(--duration-base)]`} />
          </CardHeader>
          <CardContent>
            <Heading level={2} className="tracking-tight">{stat.value}</Heading>
            <Text size="xs" variant="muted" className="mt-1">
              {stat.trend}
            </Text>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
